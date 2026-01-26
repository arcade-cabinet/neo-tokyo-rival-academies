using Unity.Burst;
using Unity.Collections;
using Unity.Entities;
using Unity.Mathematics;
using NeoTokyo.Components.Quest;
using NeoTokyo.Components.Faction;
using NeoTokyo.Components.Stats;

namespace NeoTokyo.Systems.Quest
{
    /// <summary>
    /// Main quest tracking system that processes quest events and updates objectives.
    /// Equivalent to TypeScript: QuestSystem.ts in the React/Zustand implementation.
    ///
    /// Responsibilities:
    /// 1. Process quest events and update objective progress
    /// 2. Check quest completion/failure conditions
    /// 3. Track time-limited quest timers
    /// 4. Apply quest rewards on completion
    /// </summary>
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateAfter(typeof(Progression.ReputationSystem))]
    public partial struct QuestSystem : ISystem
    {
        private EntityQuery _questEventQuery;
        private EntityQuery _activeQuestQuery;

        public void OnCreate(ref SystemState state)
        {
            state.RequireForUpdate<QuestSystemState>();
            state.RequireForUpdate<EndSimulationEntityCommandBufferSystem.Singleton>();

            _questEventQuery = state.GetEntityQuery(
                ComponentType.ReadOnly<QuestEvent>()
            );

            _activeQuestQuery = state.GetEntityQuery(
                ComponentType.ReadWrite<Quest>(),
                ComponentType.ReadWrite<DynamicBuffer<QuestObjective>>()
            );
        }

        public void OnUpdate(ref SystemState state)
        {
            float deltaTime = SystemAPI.Time.DeltaTime;
            var ecb = SystemAPI.GetSingleton<EndSimulationEntityCommandBufferSystem.Singleton>()
                .CreateCommandBuffer(state.WorldUnmanaged);

            // Update quest timers
            UpdateQuestTimers(ref state, deltaTime, ref ecb);

            // Process quest events
            ProcessQuestEvents(ref state, ref ecb);

            // Check quest completion
            CheckQuestCompletion(ref state, ref ecb);
        }

        /// <summary>
        /// Update time-limited quest timers and handle expiration.
        /// </summary>
        private void UpdateQuestTimers(ref SystemState state, float deltaTime, ref EntityCommandBuffer ecb)
        {
            foreach (var (quest, entity) in
                SystemAPI.Query<RefRW<Quest>>()
                    .WithEntityAccess())
            {
                // Only update active quests with time limits
                if (quest.ValueRO.Status != QuestStatus.Active) continue;
                if (!quest.ValueRO.HasTimeLimit) continue;

                // Decrement timer
                quest.ValueRW.TimeRemaining -= deltaTime;

                // Check for expiration
                if (quest.ValueRO.TimeRemaining <= 0f)
                {
                    quest.ValueRW.TimeRemaining = 0f;
                    quest.ValueRW.Status = QuestStatus.Failed;

                    // Create failure event for UI notification
                    var failEvent = ecb.CreateEntity();
                    ecb.AddComponent(failEvent, new QuestFailedEvent
                    {
                        QuestId = quest.ValueRO.QuestId,
                        Reason = QuestFailReason.TimeExpired
                    });

                    // Update system state
                    UpdateQuestCountOnFailure(ref state);
                }
            }
        }

        /// <summary>
        /// Process quest events and update corresponding objectives.
        /// </summary>
        private void ProcessQuestEvents(ref SystemState state, ref EntityCommandBuffer ecb)
        {
            // Collect all quest events
            var events = new NativeList<QuestEvent>(Allocator.Temp);

            foreach (var (questEvent, eventEntity) in
                SystemAPI.Query<RefRO<QuestEvent>>()
                    .WithEntityAccess())
            {
                events.Add(questEvent.ValueRO);
                ecb.DestroyEntity(eventEntity);
            }

            if (events.Length == 0)
            {
                events.Dispose();
                return;
            }

            // Process events against all active quests
            foreach (var (quest, objectives, questEntity) in
                SystemAPI.Query<RefRO<Quest>, DynamicBuffer<QuestObjective>>()
                    .WithEntityAccess())
            {
                if (quest.ValueRO.Status != QuestStatus.Active) continue;

                for (int i = 0; i < events.Length; i++)
                {
                    var questEvent = events[i];
                    ProcessEventForQuest(questEvent, ref objectives);
                }
            }

            events.Dispose();
        }

        /// <summary>
        /// Process a single event against a quest's objectives.
        /// </summary>
        private void ProcessEventForQuest(QuestEvent questEvent, ref DynamicBuffer<QuestObjective> objectives)
        {
            for (int i = 0; i < objectives.Length; i++)
            {
                var objective = objectives[i];

                // Skip already complete objectives
                if (objective.IsComplete) continue;

                bool matches = DoesEventMatchObjective(questEvent, objective);

                if (matches)
                {
                    objective.CurrentCount = math.min(
                        objective.CurrentCount + questEvent.Count,
                        objective.TargetCount
                    );

                    // Check if objective is now complete
                    if (objective.CurrentCount >= objective.TargetCount)
                    {
                        objective.IsComplete = true;
                    }

                    objectives[i] = objective;
                }
            }
        }

        /// <summary>
        /// Check if a quest event matches an objective's requirements.
        /// </summary>
        private bool DoesEventMatchObjective(QuestEvent questEvent, QuestObjective objective)
        {
            // Match event type to objective type
            switch (objective.Type)
            {
                case ObjectiveType.Kill:
                    if (questEvent.EventType != QuestEventType.EnemyKilled) return false;
                    // Match target entity ID if specified
                    if (objective.TargetEntityId != 0 &&
                        questEvent.TargetEntity.Index != objective.TargetEntityId)
                        return false;
                    return true;

                case ObjectiveType.Collect:
                    if (questEvent.EventType != QuestEventType.ItemCollected) return false;
                    if (objective.TargetItemId != 0 && questEvent.ItemId != objective.TargetItemId)
                        return false;
                    return true;

                case ObjectiveType.Deliver:
                    if (questEvent.EventType != QuestEventType.ItemDelivered) return false;
                    if (objective.TargetItemId != 0 && questEvent.ItemId != objective.TargetItemId)
                        return false;
                    return true;

                case ObjectiveType.Talk:
                    if (questEvent.EventType != QuestEventType.NPCTalked) return false;
                    if (objective.TargetEntityId != 0 &&
                        questEvent.TargetEntity.Index != objective.TargetEntityId)
                        return false;
                    return true;

                case ObjectiveType.Explore:
                    if (questEvent.EventType != QuestEventType.LocationReached &&
                        questEvent.EventType != QuestEventType.TerritoryEntered)
                        return false;

                    // Check territory match
                    if (!objective.TargetTerritory.IsEmpty)
                    {
                        var eventTerritory = questEvent.TerritoryId;
                        if (!eventTerritory.Equals(objective.TargetTerritory))
                            return false;
                    }

                    // Check position proximity if specified
                    if (objective.TargetRadius > 0)
                    {
                        float dx = questEvent.PositionX - objective.TargetX;
                        float dy = questEvent.PositionY - objective.TargetY;
                        float dz = questEvent.PositionZ - objective.TargetZ;
                        float distSq = dx * dx + dy * dy + dz * dz;
                        if (distSq > objective.TargetRadius * objective.TargetRadius)
                            return false;
                    }
                    return true;

                case ObjectiveType.Escort:
                    return questEvent.EventType == QuestEventType.EscortCompleted &&
                           (objective.TargetEntityId == 0 ||
                            questEvent.TargetEntity.Index == objective.TargetEntityId);

                case ObjectiveType.Defend:
                    return questEvent.EventType == QuestEventType.DefenseCompleted;

                case ObjectiveType.Survive:
                    return questEvent.EventType == QuestEventType.TimeElapsed;

                case ObjectiveType.Interact:
                    return questEvent.EventType == QuestEventType.ObjectInteracted &&
                           (objective.TargetEntityId == 0 ||
                            questEvent.TargetEntity.Index == objective.TargetEntityId);

                case ObjectiveType.Dive:
                    return questEvent.EventType == QuestEventType.DiveCompleted;

                case ObjectiveType.Navigate:
                    return questEvent.EventType == QuestEventType.NavigationCompleted;

                case ObjectiveType.Sabotage:
                    return questEvent.EventType == QuestEventType.SabotageCompleted &&
                           (objective.TargetEntityId == 0 ||
                            questEvent.TargetEntity.Index == objective.TargetEntityId);

                default:
                    return false;
            }
        }

        /// <summary>
        /// Check if quests have all required objectives complete.
        /// </summary>
        private void CheckQuestCompletion(ref SystemState state, ref EntityCommandBuffer ecb)
        {
            foreach (var (quest, objectives, questEntity) in
                SystemAPI.Query<RefRW<Quest>, DynamicBuffer<QuestObjective>>()
                    .WithEntityAccess())
            {
                if (quest.ValueRO.Status != QuestStatus.Active) continue;

                bool allRequiredComplete = true;

                for (int i = 0; i < objectives.Length; i++)
                {
                    var objective = objectives[i];
                    if (!objective.IsOptional && !objective.IsSatisfied)
                    {
                        allRequiredComplete = false;
                        break;
                    }
                }

                if (allRequiredComplete)
                {
                    quest.ValueRW.Status = QuestStatus.ReadyToComplete;

                    // Create completion ready event for UI
                    var readyEvent = ecb.CreateEntity();
                    ecb.AddComponent(readyEvent, new QuestReadyEvent
                    {
                        QuestId = quest.ValueRO.QuestId
                    });
                }
            }
        }

        /// <summary>
        /// Update quest system state when a quest fails.
        /// </summary>
        private void UpdateQuestCountOnFailure(ref SystemState state)
        {
            foreach (var systemState in SystemAPI.Query<RefRW<QuestSystemState>>())
            {
                systemState.ValueRW.ActiveQuestCount =
                    math.max(0, systemState.ValueRW.ActiveQuestCount - 1);
                systemState.ValueRW.TotalQuestsFailed++;
            }
        }
    }

    /// <summary>
    /// Event component for quest failure notification.
    /// </summary>
    public struct QuestFailedEvent : IComponentData
    {
        public int QuestId;
        public QuestFailReason Reason;
    }

    /// <summary>
    /// Reason for quest failure.
    /// </summary>
    public enum QuestFailReason : byte
    {
        TimeExpired = 0,
        ObjectiveFailed = 1,
        EscortDied = 2,
        DefenseFailed = 3,
        Abandoned = 4
    }

    /// <summary>
    /// Event component for quest ready to complete.
    /// </summary>
    public struct QuestReadyEvent : IComponentData
    {
        public int QuestId;
    }

    /// <summary>
    /// System that handles quest acceptance from quest givers.
    /// Checks reputation requirements and activates quests.
    /// </summary>
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateBefore(typeof(QuestSystem))]
    public partial struct QuestAcceptSystem : ISystem
    {
        public void OnCreate(ref SystemState state)
        {
            state.RequireForUpdate<QuestSystemState>();
            state.RequireForUpdate<EndSimulationEntityCommandBufferSystem.Singleton>();
        }

        public void OnUpdate(ref SystemState state)
        {
            var ecb = SystemAPI.GetSingleton<EndSimulationEntityCommandBufferSystem.Singleton>()
                .CreateCommandBuffer(state.WorldUnmanaged);

            // Process quest accept requests
            foreach (var (request, requestEntity) in
                SystemAPI.Query<RefRO<QuestAcceptRequest>>()
                    .WithEntityAccess())
            {
                ProcessAcceptRequest(ref state, request.ValueRO, ref ecb);
                ecb.DestroyEntity(requestEntity);
            }
        }

        private void ProcessAcceptRequest(
            ref SystemState state,
            QuestAcceptRequest request,
            ref EntityCommandBuffer ecb)
        {
            // Find the quest entity
            Entity questEntity = Entity.Null;
            Quest quest = default;

            foreach (var (q, entity) in
                SystemAPI.Query<RefRO<Quest>>()
                    .WithEntityAccess())
            {
                if (q.ValueRO.QuestId == request.QuestId)
                {
                    questEntity = entity;
                    quest = q.ValueRO;
                    break;
                }
            }

            if (questEntity == Entity.Null)
            {
                // Quest not found - create error event
                var errorEvent = ecb.CreateEntity();
                ecb.AddComponent(errorEvent, new QuestErrorEvent
                {
                    QuestId = request.QuestId,
                    Error = QuestError.QuestNotFound
                });
                return;
            }

            // Check quest status
            if (quest.Status != QuestStatus.Available)
            {
                var errorEvent = ecb.CreateEntity();
                ecb.AddComponent(errorEvent, new QuestErrorEvent
                {
                    QuestId = request.QuestId,
                    Error = QuestError.QuestNotAvailable
                });
                return;
            }

            // Check player reputation
            bool meetsReputation = CheckReputationRequirement(
                ref state,
                request.PlayerEntity,
                quest.GiverFaction,
                quest.RequiredReputation
            );

            if (!meetsReputation)
            {
                var errorEvent = ecb.CreateEntity();
                ecb.AddComponent(errorEvent, new QuestErrorEvent
                {
                    QuestId = request.QuestId,
                    Error = QuestError.InsufficientReputation
                });
                return;
            }

            // Check player level
            bool meetsLevel = CheckLevelRequirement(
                ref state,
                request.PlayerEntity,
                quest.RequiredLevel
            );

            if (!meetsLevel)
            {
                var errorEvent = ecb.CreateEntity();
                ecb.AddComponent(errorEvent, new QuestErrorEvent
                {
                    QuestId = request.QuestId,
                    Error = QuestError.InsufficientLevel
                });
                return;
            }

            // Check active quest limit
            foreach (var systemState in SystemAPI.Query<RefRO<QuestSystemState>>())
            {
                if (systemState.ValueRO.ActiveQuestCount >= systemState.ValueRO.MaxActiveQuests)
                {
                    var errorEvent = ecb.CreateEntity();
                    ecb.AddComponent(errorEvent, new QuestErrorEvent
                    {
                        QuestId = request.QuestId,
                        Error = QuestError.QuestLogFull
                    });
                    return;
                }
            }

            // Accept the quest
            ecb.SetComponent(questEntity, new Quest
            {
                QuestId = quest.QuestId,
                Type = quest.Type,
                Status = QuestStatus.Active,
                Priority = quest.Priority,
                GiverFaction = quest.GiverFaction,
                RequiredReputation = quest.RequiredReputation,
                RequiredLevel = quest.RequiredLevel,
                ReputationReward = quest.ReputationReward,
                ReputationPenalty = quest.ReputationPenalty,
                OpposingFaction = quest.OpposingFaction,
                XPReward = quest.XPReward,
                CreditReward = quest.CreditReward,
                TimeLimit = quest.TimeLimit,
                TimeRemaining = quest.TimeLimit,
                AlignmentShift = quest.AlignmentShift,
                DangerLevel = quest.DangerLevel,
                IsGenerated = quest.IsGenerated
            });

            // Add to player's active quests
            var activeQuestBuffer = state.EntityManager.GetBuffer<ActiveQuest>(request.PlayerEntity);
            activeQuestBuffer.Add(new ActiveQuest
            {
                QuestEntity = questEntity,
                QuestId = quest.QuestId,
                AcceptedTime = (float)SystemAPI.Time.ElapsedTime
            });

            // Update system state
            foreach (var systemState in SystemAPI.Query<RefRW<QuestSystemState>>())
            {
                systemState.ValueRW.ActiveQuestCount++;
            }

            // Create accepted event for UI
            var acceptedEvent = ecb.CreateEntity();
            ecb.AddComponent(acceptedEvent, new QuestAcceptedEvent
            {
                QuestId = quest.QuestId
            });
        }

        private bool CheckReputationRequirement(
            ref SystemState state,
            Entity playerEntity,
            FactionType faction,
            int requiredRep)
        {
            if (requiredRep <= 0) return true;

            if (!SystemAPI.HasComponent<Reputation>(playerEntity)) return false;

            var reputation = SystemAPI.GetComponent<Reputation>(playerEntity);

            int playerRep = faction switch
            {
                FactionType.Kurenai => reputation.Kurenai,
                FactionType.Azure => reputation.Azure,
                _ => 50 // Neutral factions check against average
            };

            return playerRep >= requiredRep;
        }

        private bool CheckLevelRequirement(
            ref SystemState state,
            Entity playerEntity,
            int requiredLevel)
        {
            if (requiredLevel <= 1) return true;

            if (!SystemAPI.HasComponent<LevelProgress>(playerEntity)) return false;

            var levelProgress = SystemAPI.GetComponent<LevelProgress>(playerEntity);
            return levelProgress.Level >= requiredLevel;
        }
    }

    /// <summary>
    /// Request to accept a quest.
    /// </summary>
    public struct QuestAcceptRequest : IComponentData
    {
        public int QuestId;
        public Entity PlayerEntity;
    }

    /// <summary>
    /// Event for successful quest acceptance.
    /// </summary>
    public struct QuestAcceptedEvent : IComponentData
    {
        public int QuestId;
    }

    /// <summary>
    /// Event for quest errors.
    /// </summary>
    public struct QuestErrorEvent : IComponentData
    {
        public int QuestId;
        public QuestError Error;
    }

    /// <summary>
    /// Quest error types.
    /// </summary>
    public enum QuestError : byte
    {
        QuestNotFound = 0,
        QuestNotAvailable = 1,
        InsufficientReputation = 2,
        InsufficientLevel = 3,
        QuestLogFull = 4,
        PrerequisiteNotMet = 5
    }

    /// <summary>
    /// System that handles quest completion and reward distribution.
    /// </summary>
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateAfter(typeof(QuestSystem))]
    public partial struct QuestCompletionSystem : ISystem
    {
        public void OnCreate(ref SystemState state)
        {
            state.RequireForUpdate<QuestSystemState>();
            state.RequireForUpdate<EndSimulationEntityCommandBufferSystem.Singleton>();
        }

        public void OnUpdate(ref SystemState state)
        {
            var ecb = SystemAPI.GetSingleton<EndSimulationEntityCommandBufferSystem.Singleton>()
                .CreateCommandBuffer(state.WorldUnmanaged);

            // Process quest complete requests
            foreach (var (request, requestEntity) in
                SystemAPI.Query<RefRO<QuestCompleteRequest>>()
                    .WithEntityAccess())
            {
                ProcessCompleteRequest(ref state, request.ValueRO, ref ecb);
                ecb.DestroyEntity(requestEntity);
            }
        }

        private void ProcessCompleteRequest(
            ref SystemState state,
            QuestCompleteRequest request,
            ref EntityCommandBuffer ecb)
        {
            // Find the quest entity
            Entity questEntity = Entity.Null;
            Quest quest = default;

            foreach (var (q, entity) in
                SystemAPI.Query<RefRO<Quest>>()
                    .WithEntityAccess())
            {
                if (q.ValueRO.QuestId == request.QuestId)
                {
                    questEntity = entity;
                    quest = q.ValueRO;
                    break;
                }
            }

            if (questEntity == Entity.Null) return;

            // Check quest is ready to complete
            if (quest.Status != QuestStatus.ReadyToComplete) return;

            // Mark quest as completed
            ecb.SetComponent(questEntity, new Quest
            {
                QuestId = quest.QuestId,
                Type = quest.Type,
                Status = QuestStatus.Completed,
                Priority = quest.Priority,
                GiverFaction = quest.GiverFaction,
                RequiredReputation = quest.RequiredReputation,
                RequiredLevel = quest.RequiredLevel,
                ReputationReward = quest.ReputationReward,
                ReputationPenalty = quest.ReputationPenalty,
                OpposingFaction = quest.OpposingFaction,
                XPReward = quest.XPReward,
                CreditReward = quest.CreditReward,
                TimeLimit = quest.TimeLimit,
                TimeRemaining = quest.TimeRemaining,
                AlignmentShift = quest.AlignmentShift,
                DangerLevel = quest.DangerLevel,
                IsGenerated = quest.IsGenerated
            });

            // Apply reputation reward
            if (quest.ReputationReward > 0 &&
                SystemAPI.HasBuffer<ReputationChangeElement>(request.PlayerEntity))
            {
                var repBuffer = state.EntityManager.GetBuffer<ReputationChangeElement>(request.PlayerEntity);
                repBuffer.Add(new ReputationChangeElement
                {
                    Faction = quest.GiverFaction,
                    Amount = quest.ReputationReward,
                    Reason = new FixedString64Bytes($"Quest {quest.QuestId} Complete")
                });

                // Apply penalty to opposing faction if specified
                if (quest.ReputationPenalty > 0 && quest.OpposingFaction != FactionType.Neutral)
                {
                    repBuffer.Add(new ReputationChangeElement
                    {
                        Faction = quest.OpposingFaction,
                        Amount = -quest.ReputationPenalty,
                        Reason = new FixedString64Bytes($"Quest {quest.QuestId} Complete")
                    });
                }
            }

            // Apply XP reward
            if (quest.XPReward > 0 &&
                SystemAPI.HasComponent<LevelProgress>(request.PlayerEntity))
            {
                var levelProgress = SystemAPI.GetComponent<LevelProgress>(request.PlayerEntity);
                levelProgress.XP += quest.XPReward;

                // Check for level up
                while (levelProgress.XP >= levelProgress.XPToNextLevel)
                {
                    levelProgress.XP -= levelProgress.XPToNextLevel;
                    levelProgress.Level++;
                    levelProgress.XPToNextLevel = LevelProgress.GetXPForLevel(levelProgress.Level);
                }

                ecb.SetComponent(request.PlayerEntity, levelProgress);
            }

            // Remove from player's active quests
            if (SystemAPI.HasBuffer<ActiveQuest>(request.PlayerEntity))
            {
                var activeBuffer = state.EntityManager.GetBuffer<ActiveQuest>(request.PlayerEntity);
                for (int i = activeBuffer.Length - 1; i >= 0; i--)
                {
                    if (activeBuffer[i].QuestId == quest.QuestId)
                    {
                        activeBuffer.RemoveAt(i);
                        break;
                    }
                }
            }

            // Add to completed quests history
            if (SystemAPI.HasBuffer<CompletedQuest>(request.PlayerEntity))
            {
                var completedBuffer = state.EntityManager.GetBuffer<CompletedQuest>(request.PlayerEntity);
                completedBuffer.Add(new CompletedQuest
                {
                    QuestId = quest.QuestId,
                    FinalStatus = QuestStatus.Completed,
                    CompletedTime = (float)SystemAPI.Time.ElapsedTime,
                    ReputationEarned = quest.ReputationReward,
                    XPEarned = quest.XPReward
                });
            }

            // Update system state
            foreach (var systemState in SystemAPI.Query<RefRW<QuestSystemState>>())
            {
                systemState.ValueRW.ActiveQuestCount =
                    math.max(0, systemState.ValueRW.ActiveQuestCount - 1);
                systemState.ValueRW.TotalQuestsCompleted++;
            }

            // Create completed event for UI
            var completedEvent = ecb.CreateEntity();
            ecb.AddComponent(completedEvent, new QuestCompletedEvent
            {
                QuestId = quest.QuestId,
                XPEarned = quest.XPReward,
                ReputationEarned = quest.ReputationReward,
                CreditsEarned = quest.CreditReward
            });
        }
    }

    /// <summary>
    /// Request to complete a quest and claim rewards.
    /// </summary>
    public struct QuestCompleteRequest : IComponentData
    {
        public int QuestId;
        public Entity PlayerEntity;
    }

    /// <summary>
    /// Event for successful quest completion.
    /// </summary>
    public struct QuestCompletedEvent : IComponentData
    {
        public int QuestId;
        public int XPEarned;
        public int ReputationEarned;
        public int CreditsEarned;
    }

    /// <summary>
    /// Helper methods for quest system operations.
    /// </summary>
    public static class QuestHelpers
    {
        /// <summary>
        /// Create a quest event entity to notify the quest system.
        /// </summary>
        public static Entity CreateQuestEvent(
            EntityManager em,
            QuestEventType eventType,
            Entity sourceEntity = default,
            Entity targetEntity = default,
            int itemId = 0,
            int count = 1,
            string territoryId = null,
            float3 position = default)
        {
            var entity = em.CreateEntity();
            em.AddComponentData(entity, new QuestEvent
            {
                EventType = eventType,
                SourceEntity = sourceEntity,
                TargetEntity = targetEntity,
                ItemId = itemId,
                Count = count,
                TerritoryId = string.IsNullOrEmpty(territoryId)
                    ? new FixedString64Bytes()
                    : new FixedString64Bytes(territoryId),
                PositionX = position.x,
                PositionY = position.y,
                PositionZ = position.z
            });
            return entity;
        }

        /// <summary>
        /// Request to accept a quest.
        /// </summary>
        public static Entity RequestAcceptQuest(EntityManager em, int questId, Entity playerEntity)
        {
            var entity = em.CreateEntity();
            em.AddComponentData(entity, new QuestAcceptRequest
            {
                QuestId = questId,
                PlayerEntity = playerEntity
            });
            return entity;
        }

        /// <summary>
        /// Request to complete a quest.
        /// </summary>
        public static Entity RequestCompleteQuest(EntityManager em, int questId, Entity playerEntity)
        {
            var entity = em.CreateEntity();
            em.AddComponentData(entity, new QuestCompleteRequest
            {
                QuestId = questId,
                PlayerEntity = playerEntity
            });
            return entity;
        }

        /// <summary>
        /// Check if player has completed a specific quest.
        /// </summary>
        public static bool HasCompletedQuest(EntityManager em, Entity playerEntity, int questId)
        {
            if (!em.HasBuffer<CompletedQuest>(playerEntity)) return false;

            var buffer = em.GetBuffer<CompletedQuest>(playerEntity);
            for (int i = 0; i < buffer.Length; i++)
            {
                if (buffer[i].QuestId == questId &&
                    buffer[i].FinalStatus == QuestStatus.Completed)
                {
                    return true;
                }
            }
            return false;
        }

        /// <summary>
        /// Get count of active quests for player.
        /// </summary>
        public static int GetActiveQuestCount(EntityManager em, Entity playerEntity)
        {
            if (!em.HasBuffer<ActiveQuest>(playerEntity)) return 0;
            return em.GetBuffer<ActiveQuest>(playerEntity).Length;
        }
    }
}
