using Unity.Burst;
using Unity.Collections;
using Unity.Entities;
using NeoTokyo.Components.Core;
using NeoTokyo.Components.Dialogue;
using NeoTokyo.Components.Faction;

namespace NeoTokyo.Systems.Progression
{
    /// <summary>
    /// System that checks player alignment against gates and unlocks/locks content.
    /// Processes alignment-gated content including dialogues, quests, areas, and story branches.
    ///
    /// Golden Record Alignment Effects:
    /// - Extreme Kurenai: +2 Ignition, reckless options, Kurenai coup questline
    /// - Strong Kurenai: +1 Ignition, passion dialogue, Hot-headed ally quests
    /// - Neutral: Balanced stats, Both faction access
    /// - Strong Azure: +1 Logic, calculated dialogue, Strategic ally quests
    /// - Extreme Azure: +2 Logic, cold options, Azure takeover questline
    /// </summary>
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateAfter(typeof(ReputationSystem))]
    public partial class AlignmentGateSystem : SystemBase
    {
        private EntityQuery _playerQuery;
        private EntityQuery _dialogueGateQuery;
        private EntityQuery _questGateQuery;
        private EntityQuery _areaGateQuery;
        private EntityQuery _storyBranchQuery;

        protected override void OnCreate()
        {
            _playerQuery = GetEntityQuery(
                ComponentType.ReadOnly<PlayerTag>(),
                ComponentType.ReadOnly<Reputation>()
            );

            _dialogueGateQuery = GetEntityQuery(
                ComponentType.ReadWrite<DialogueGate>(),
                ComponentType.ReadWrite<AlignmentGate>()
            );

            _questGateQuery = GetEntityQuery(
                ComponentType.ReadWrite<QuestGate>(),
                ComponentType.ReadWrite<AlignmentGate>()
            );

            _areaGateQuery = GetEntityQuery(
                ComponentType.ReadWrite<AreaGate>(),
                ComponentType.ReadWrite<AlignmentGate>()
            );

            _storyBranchQuery = GetEntityQuery(
                ComponentType.ReadWrite<StoryBranch>(),
                ComponentType.ReadWrite<AlignmentGate>()
            );

            RequireForUpdate(_playerQuery);
        }

        protected override void OnUpdate()
        {
            // Get player reputation (assume single player)
            var reputation = Reputation.Default;
            Entity playerEntity = Entity.Null;
            bool hasPlayer = false;

            foreach (var (rep, entity) in
                SystemAPI.Query<RefRO<Reputation>>()
                    .WithAll<PlayerTag>()
                    .WithEntityAccess())
            {
                reputation = rep.ValueRO;
                playerEntity = entity;
                hasPlayer = true;
                break;
            }

            if (!hasPlayer) return;

            if (!SystemAPI.HasSingleton<EndSimulationEntityCommandBufferSystem.Singleton>())
                return;

            var ecb = SystemAPI.GetSingleton<EndSimulationEntityCommandBufferSystem.Singleton>()
                .CreateCommandBuffer(World.Unmanaged);
            double currentTime = SystemAPI.Time.ElapsedTime;

            // Process dialogue gates
            ProcessDialogueGates(reputation, currentTime, ref ecb);

            // Process quest gates
            ProcessQuestGates(reputation, currentTime, ref ecb);

            // Process area gates
            ProcessAreaGates(reputation, currentTime, ref ecb);

            // Process story branches
            ProcessStoryBranches(reputation, playerEntity, currentTime, ref ecb);
        }

        private void ProcessDialogueGates(
            Reputation reputation,
            double currentTime,
            ref EntityCommandBuffer ecb)
        {
            foreach (var (dialogueGate, alignmentGate, entity) in
                SystemAPI.Query<RefRW<DialogueGate>, RefRW<AlignmentGate>>()
                    .WithEntityAccess())
            {
                bool meetsRequirement = AlignmentGateHelpers.MeetsRequirement(
                    reputation,
                    dialogueGate.ValueRO.Requirement
                );

                bool wasUnlocked = alignmentGate.ValueRO.IsUnlocked;
                bool shouldBeUnlocked = meetsRequirement ||
                    (dialogueGate.ValueRO.PermanentUnlock && wasUnlocked);

                if (shouldBeUnlocked != wasUnlocked)
                {
                    alignmentGate.ValueRW.IsUnlocked = shouldBeUnlocked;

                    if (shouldBeUnlocked && !wasUnlocked)
                    {
                        alignmentGate.ValueRW.UnlockedAtTime = currentTime;

                        // Fire unlock event
                        var eventEntity = ecb.CreateEntity();
                        ecb.AddComponent(eventEntity, new GateUnlockedEvent
                        {
                            Requirement = dialogueGate.ValueRO.Requirement,
                            ContentName = new FixedString64Bytes($"Dialogue {dialogueGate.ValueRO.DialogueId}"),
                            Type = GateType.Dialogue
                        });
                    }
                }
            }
        }

        private void ProcessQuestGates(
            Reputation reputation,
            double currentTime,
            ref EntityCommandBuffer ecb)
        {
            foreach (var (questGate, alignmentGate, entity) in
                SystemAPI.Query<RefRW<QuestGate>, RefRW<AlignmentGate>>()
                    .WithEntityAccess())
            {
                bool meetsAlignmentRequirement = AlignmentGateHelpers.MeetsRequirement(
                    reputation,
                    questGate.ValueRO.Requirement
                );

                bool meetsFactionRequirement = MeetsFactionRequirement(
                    reputation,
                    questGate.ValueRO.RequiredFaction,
                    questGate.ValueRO.MinFactionReputation
                );

                bool wasUnlocked = alignmentGate.ValueRO.IsUnlocked;
                bool shouldBeUnlocked = (meetsAlignmentRequirement && meetsFactionRequirement) ||
                    (questGate.ValueRO.PermanentUnlock && wasUnlocked);

                if (shouldBeUnlocked != wasUnlocked)
                {
                    alignmentGate.ValueRW.IsUnlocked = shouldBeUnlocked;

                    if (shouldBeUnlocked && !wasUnlocked)
                    {
                        alignmentGate.ValueRW.UnlockedAtTime = currentTime;

                        // Fire unlock event for faction questlines
                        var eventEntity = ecb.CreateEntity();
                        ecb.AddComponent(eventEntity, new GateUnlockedEvent
                        {
                            Requirement = questGate.ValueRO.Requirement,
                            ContentName = GetQuestlineName(questGate.ValueRO),
                            Type = GateType.Quest
                        });
                    }
                }
            }
        }

        private void ProcessAreaGates(
            Reputation reputation,
            double currentTime,
            ref EntityCommandBuffer ecb)
        {
            foreach (var (areaGate, alignmentGate, entity) in
                SystemAPI.Query<RefRW<AreaGate>, RefRW<AlignmentGate>>()
                    .WithEntityAccess())
            {
                bool meetsAlignmentRequirement = AlignmentGateHelpers.MeetsRequirement(
                    reputation,
                    areaGate.ValueRO.Requirement
                );

                bool meetsFactionRequirement = true;
                if (areaGate.ValueRO.RequiresFactionPermission)
                {
                    meetsFactionRequirement = MeetsFactionRequirement(
                        reputation,
                        areaGate.ValueRO.ControllingFaction,
                        areaGate.ValueRO.MinReputationForEntry
                    );
                }

                bool wasUnlocked = alignmentGate.ValueRO.IsUnlocked;
                bool shouldBeUnlocked = meetsAlignmentRequirement && meetsFactionRequirement;

                if (shouldBeUnlocked != wasUnlocked)
                {
                    alignmentGate.ValueRW.IsUnlocked = shouldBeUnlocked;

                    if (shouldBeUnlocked && !wasUnlocked)
                    {
                        alignmentGate.ValueRW.UnlockedAtTime = currentTime;

                        // Fire unlock event
                        var eventEntity = ecb.CreateEntity();
                        ecb.AddComponent(eventEntity, new GateUnlockedEvent
                        {
                            Requirement = areaGate.ValueRO.Requirement,
                            ContentName = areaGate.ValueRO.TerritoryId,
                            Type = GateType.Area
                        });
                    }
                }
            }
        }

        private void ProcessStoryBranches(
            Reputation reputation,
            Entity playerEntity,
            double currentTime,
            ref EntityCommandBuffer ecb)
        {
            // Get player's unlocked branches buffer
            DynamicBuffer<UnlockedBranchElement> unlockedBranches = default;
            bool hasBuffer = SystemAPI.HasBuffer<UnlockedBranchElement>(playerEntity);
            if (hasBuffer)
            {
                unlockedBranches = SystemAPI.GetBuffer<UnlockedBranchElement>(playerEntity);
            }

            foreach (var (storyBranch, alignmentGate, entity) in
                SystemAPI.Query<RefRW<StoryBranch>, RefRW<AlignmentGate>>()
                    .WithEntityAccess())
            {
                bool meetsRequirement = AlignmentGateHelpers.MeetsRequirement(
                    reputation,
                    storyBranch.ValueRO.UnlockRequirement
                );

                bool wasUnlocked = alignmentGate.ValueRO.IsUnlocked;

                // Story branches stay unlocked once started
                bool shouldBeUnlocked = meetsRequirement ||
                    storyBranch.ValueRO.IsStarted;

                if (shouldBeUnlocked != wasUnlocked)
                {
                    alignmentGate.ValueRW.IsUnlocked = shouldBeUnlocked;

                    if (shouldBeUnlocked && !wasUnlocked)
                    {
                        alignmentGate.ValueRW.UnlockedAtTime = currentTime;

                        // Add to player's unlocked branches
                        if (hasBuffer)
                        {
                            bool alreadyUnlocked = false;
                            for (int i = 0; i < unlockedBranches.Length; i++)
                            {
                                if (unlockedBranches[i].BranchId == storyBranch.ValueRO.BranchId)
                                {
                                    alreadyUnlocked = true;
                                    break;
                                }
                            }

                            if (!alreadyUnlocked)
                            {
                                unlockedBranches.Add(new UnlockedBranchElement
                                {
                                    BranchId = storyBranch.ValueRO.BranchId,
                                    UnlockedAtTime = currentTime,
                                    IsCompleted = false,
                                    Progress = 0
                                });
                            }
                        }

                        // Fire unlock event
                        var eventEntity = ecb.CreateEntity();
                        ecb.AddComponent(eventEntity, new GateUnlockedEvent
                        {
                            Requirement = storyBranch.ValueRO.UnlockRequirement,
                            ContentName = storyBranch.ValueRO.BranchName,
                            Type = GateType.StoryBranch
                        });
                    }
                }
            }
        }

        private bool MeetsFactionRequirement(
            Reputation reputation,
            FactionType faction,
            int minReputation)
        {
            if (faction == FactionType.Neutral) return true;
            if (minReputation <= 0) return true;

            int currentRep = faction switch
            {
                FactionType.Kurenai => reputation.Kurenai,
                FactionType.Azure => reputation.Azure,
                _ => 50 // Default neutral for other factions
            };

            return currentRep >= minReputation;
        }

        private FixedString64Bytes GetQuestlineName(in QuestGate questGate)
        {
            // Special naming for faction-specific questlines per Golden Record
            if (questGate.Requirement == AlignmentRequirement.KurenaiExtreme &&
                questGate.RequiredFaction == FactionType.Kurenai)
            {
                return new FixedString64Bytes("Kurenai Coup Questline");
            }

            if (questGate.Requirement == AlignmentRequirement.AzureExtreme &&
                questGate.RequiredFaction == FactionType.Azure)
            {
                return new FixedString64Bytes("Azure Takeover Questline");
            }

            return new FixedString64Bytes($"Quest {questGate.QuestId}");
        }
    }

    /// <summary>
    /// System that cleans up gate unlock events after they are processed.
    /// </summary>
    [UpdateInGroup(typeof(LateSimulationSystemGroup))]
    public partial struct GateEventCleanupSystem : ISystem
    {
        public void OnCreate(ref SystemState state)
        {
            state.RequireForUpdate<EndSimulationEntityCommandBufferSystem.Singleton>();
        }

        public void OnUpdate(ref SystemState state)
        {
            var ecb = SystemAPI.GetSingleton<EndSimulationEntityCommandBufferSystem.Singleton>()
                .CreateCommandBuffer(state.WorldUnmanaged);

            foreach (var (_, entity) in SystemAPI.Query<GateUnlockedEvent>().WithEntityAccess())
            {
                ecb.DestroyEntity(entity);
            }
        }
    }

    /// <summary>
    /// Static helpers for alignment gate queries and manipulation.
    /// </summary>
    public static class AlignmentGateSystemHelpers
    {
        /// <summary>
        /// Create a dialogue gate entity.
        /// </summary>
        public static Entity CreateDialogueGate(
            EntityManager em,
            int dialogueId,
            AlignmentRequirement requirement,
            bool permanentUnlock = false,
            int lockedAlternativeId = 0)
        {
            var entity = em.CreateEntity();
            em.AddComponentData(entity, new DialogueGate
            {
                DialogueId = dialogueId,
                Requirement = requirement,
                PermanentUnlock = permanentUnlock,
                LockedAlternativeId = lockedAlternativeId
            });
            em.AddComponentData(entity, new AlignmentGate
            {
                Requirement = requirement,
                IsUnlocked = requirement == AlignmentRequirement.None
            });
            return entity;
        }

        /// <summary>
        /// Create a quest gate entity for faction questlines.
        /// </summary>
        public static Entity CreateQuestGate(
            EntityManager em,
            int questId,
            AlignmentRequirement requirement,
            FactionType faction = FactionType.Neutral,
            int minFactionRep = 0,
            bool isMainStory = false,
            bool permanentUnlock = true)
        {
            var entity = em.CreateEntity();
            em.AddComponentData(entity, new QuestGate
            {
                QuestId = questId,
                Requirement = requirement,
                RequiredFaction = faction,
                MinFactionReputation = minFactionRep,
                IsMainStory = isMainStory,
                PermanentUnlock = permanentUnlock
            });
            em.AddComponentData(entity, new AlignmentGate
            {
                Requirement = requirement,
                IsUnlocked = requirement == AlignmentRequirement.None && minFactionRep <= 0
            });
            return entity;
        }

        /// <summary>
        /// Create an area gate entity for territory access.
        /// </summary>
        public static Entity CreateAreaGate(
            EntityManager em,
            FixedString64Bytes territoryId,
            AlignmentRequirement requirement,
            FactionType controllingFaction,
            int minReputationForEntry = 0,
            bool hostileEntryTriggersCombat = true)
        {
            var entity = em.CreateEntity();
            em.AddComponentData(entity, new AreaGate
            {
                TerritoryId = territoryId,
                Requirement = requirement,
                ControllingFaction = controllingFaction,
                RequiresFactionPermission = minReputationForEntry > 0,
                MinReputationForEntry = minReputationForEntry,
                HostileEntryTriggersCombat = hostileEntryTriggersCombat
            });
            em.AddComponentData(entity, new AlignmentGate
            {
                Requirement = requirement,
                IsUnlocked = requirement == AlignmentRequirement.None && minReputationForEntry <= 0
            });
            return entity;
        }

        /// <summary>
        /// Create a story branch entity.
        /// </summary>
        public static Entity CreateStoryBranch(
            EntityManager em,
            int branchId,
            FixedString64Bytes branchName,
            AlignmentRequirement requirement,
            byte actNumber,
            bool isMainStory = true)
        {
            var entity = em.CreateEntity();
            em.AddComponentData(entity, new StoryBranch
            {
                BranchId = branchId,
                BranchName = branchName,
                UnlockRequirement = requirement,
                ActNumber = actNumber,
                IsMainStory = isMainStory,
                IsStarted = false,
                IsCompleted = false,
                Progress = 0
            });
            em.AddComponentData(entity, new AlignmentGate
            {
                Requirement = requirement,
                IsUnlocked = requirement == AlignmentRequirement.None
            });
            return entity;
        }

        /// <summary>
        /// Create the special Kurenai coup questline gate (Golden Record).
        /// Requires extreme Kurenai alignment.
        /// </summary>
        public static Entity CreateKurenaiCoupQuestline(EntityManager em, int questId)
        {
            return CreateQuestGate(
                em,
                questId,
                AlignmentRequirement.KurenaiExtreme,
                FactionType.Kurenai,
                minFactionRep: 75,
                isMainStory: false,
                permanentUnlock: true
            );
        }

        /// <summary>
        /// Create the special Azure takeover questline gate (Golden Record).
        /// Requires extreme Azure alignment.
        /// </summary>
        public static Entity CreateAzureTakeoverQuestline(EntityManager em, int questId)
        {
            return CreateQuestGate(
                em,
                questId,
                AlignmentRequirement.AzureExtreme,
                FactionType.Azure,
                minFactionRep: 75,
                isMainStory: false,
                permanentUnlock: true
            );
        }
    }
}
