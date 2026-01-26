using System.Collections;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.TestTools;
using Unity.Entities;
using Unity.Collections;
using NeoTokyo.Components.Quest;
using NeoTokyo.Components.Core;
using NeoTokyo.Components.Faction;

namespace NeoTokyo.Tests.PlayMode
{
    /// <summary>
    /// Integration tests for QuestSystem.
    /// Tests full quest lifecycle with ECS world.
    /// Command: Unity -batchmode -runTests -testPlatform PlayMode
    /// </summary>
    [TestFixture]
    public class QuestIntegrationTests
    {
        private World _testWorld;
        private EntityManager _entityManager;

        [SetUp]
        public void SetUp()
        {
            _testWorld = new World("QuestTestWorld");
            _entityManager = _testWorld.EntityManager;
        }

        [TearDown]
        public void TearDown()
        {
            if (_testWorld != null && _testWorld.IsCreated)
            {
                _testWorld.Dispose();
            }
        }

        #region Quest Creation Tests

        [UnityTest]
        public IEnumerator CreateQuest_WithAllComponents()
        {
            var questEntity = _entityManager.CreateEntity();

            _entityManager.AddComponentData(questEntity, new Quest
            {
                QuestId = 1001,
                Type = QuestType.Fetch,
                Status = QuestStatus.Available,
                Priority = QuestPriority.Side,
                GiverFaction = FactionType.Kurenai,
                ReputationReward = 25,
                XPReward = 150,
                CreditReward = 100,
                DangerLevel = 3
            });

            _entityManager.AddComponentData(questEntity, new QuestDisplay
            {
                Title = new FixedString128Bytes("Retrieve the Crimson Seal"),
                Description = new FixedString512Bytes("Find the lost seal in the flooded archives.")
            });

            var objectives = _entityManager.AddBuffer<QuestObjective>(questEntity);
            objectives.Add(new QuestObjective
            {
                ObjectiveIndex = 0,
                Type = ObjectiveType.Explore,
                Description = new FixedString128Bytes("Reach the Drowned Archives"),
                TargetTerritory = new FixedString64Bytes("DrownedArchives"),
                TargetCount = 1,
                CurrentCount = 0
            });
            objectives.Add(new QuestObjective
            {
                ObjectiveIndex = 1,
                Type = ObjectiveType.Collect,
                Description = new FixedString128Bytes("Find the Crimson Seal"),
                TargetItemId = 5001,
                TargetCount = 1,
                CurrentCount = 0
            });

            yield return null;

            // Verify components
            Assert.IsTrue(_entityManager.HasComponent<Quest>(questEntity));
            Assert.IsTrue(_entityManager.HasComponent<QuestDisplay>(questEntity));
            Assert.IsTrue(_entityManager.HasBuffer<QuestObjective>(questEntity));

            var quest = _entityManager.GetComponentData<Quest>(questEntity);
            Assert.AreEqual(1001, quest.QuestId);
            Assert.AreEqual(QuestStatus.Available, quest.Status);

            var objBuffer = _entityManager.GetBuffer<QuestObjective>(questEntity);
            Assert.AreEqual(2, objBuffer.Length);
        }

        #endregion

        #region Quest Acceptance Tests

        [UnityTest]
        public IEnumerator AcceptQuest_UpdatesStatus()
        {
            var questEntity = _entityManager.CreateEntity();
            _entityManager.AddComponentData(questEntity, new Quest
            {
                QuestId = 1002,
                Status = QuestStatus.Available,
                TimeLimit = 300f
            });

            yield return null;

            // Accept the quest
            var quest = _entityManager.GetComponentData<Quest>(questEntity);
            quest.Status = QuestStatus.Active;
            quest.TimeRemaining = quest.TimeLimit;
            _entityManager.SetComponentData(questEntity, quest);

            yield return null;

            quest = _entityManager.GetComponentData<Quest>(questEntity);
            Assert.AreEqual(QuestStatus.Active, quest.Status);
            Assert.AreEqual(300f, quest.TimeRemaining);
        }

        [UnityTest]
        public IEnumerator AcceptQuest_AddToPlayerActiveQuests()
        {
            // Create player with active quests buffer
            var playerEntity = _entityManager.CreateEntity();
            _entityManager.AddComponentData(playerEntity, new PlayerTag());
            var activeQuests = _entityManager.AddBuffer<ActiveQuest>(playerEntity);

            // Create quest
            var questEntity = _entityManager.CreateEntity();
            _entityManager.AddComponentData(questEntity, new Quest
            {
                QuestId = 1003,
                Status = QuestStatus.Active
            });

            yield return null;

            // Add to active quests
            activeQuests.Add(new ActiveQuest
            {
                QuestEntity = questEntity,
                QuestId = 1003,
                AcceptedTime = 100f
            });

            yield return null;

            activeQuests = _entityManager.GetBuffer<ActiveQuest>(playerEntity);
            Assert.AreEqual(1, activeQuests.Length);
            Assert.AreEqual(1003, activeQuests[0].QuestId);
        }

        #endregion

        #region Quest Objective Progress Tests

        [UnityTest]
        public IEnumerator ObjectiveProgress_KillObjective()
        {
            var questEntity = _entityManager.CreateEntity();
            _entityManager.AddComponentData(questEntity, new Quest
            {
                QuestId = 2001,
                Status = QuestStatus.Active
            });

            var objectives = _entityManager.AddBuffer<QuestObjective>(questEntity);
            objectives.Add(new QuestObjective
            {
                ObjectiveIndex = 0,
                Type = ObjectiveType.Kill,
                TargetCount = 5,
                CurrentCount = 0
            });

            yield return null;

            // Simulate kills
            objectives = _entityManager.GetBuffer<QuestObjective>(questEntity);
            var obj = objectives[0];
            obj.CurrentCount += 3;
            objectives[0] = obj;

            yield return null;

            objectives = _entityManager.GetBuffer<QuestObjective>(questEntity);
            Assert.AreEqual(3, objectives[0].CurrentCount);
            Assert.IsFalse(objectives[0].IsSatisfied);

            // Complete the objective
            obj = objectives[0];
            obj.CurrentCount += 2;
            objectives[0] = obj;

            yield return null;

            objectives = _entityManager.GetBuffer<QuestObjective>(questEntity);
            Assert.AreEqual(5, objectives[0].CurrentCount);
            Assert.IsTrue(objectives[0].IsSatisfied);
        }

        [UnityTest]
        public IEnumerator ObjectiveProgress_CollectObjective()
        {
            var questEntity = _entityManager.CreateEntity();
            var objectives = _entityManager.AddBuffer<QuestObjective>(questEntity);
            objectives.Add(new QuestObjective
            {
                ObjectiveIndex = 0,
                Type = ObjectiveType.Collect,
                TargetItemId = 100,
                TargetCount = 3,
                CurrentCount = 0
            });

            yield return null;

            // Collect items
            objectives = _entityManager.GetBuffer<QuestObjective>(questEntity);
            var obj = objectives[0];
            obj.CurrentCount = 3;
            objectives[0] = obj;

            yield return null;

            Assert.IsTrue(objectives[0].IsSatisfied);
        }

        [UnityTest]
        public IEnumerator ObjectiveProgress_MultipleObjectives()
        {
            var questEntity = _entityManager.CreateEntity();
            _entityManager.AddComponentData(questEntity, new Quest
            {
                QuestId = 2003,
                Status = QuestStatus.Active
            });

            var objectives = _entityManager.AddBuffer<QuestObjective>(questEntity);
            objectives.Add(new QuestObjective
            {
                ObjectiveIndex = 0,
                Type = ObjectiveType.Explore,
                TargetCount = 1,
                CurrentCount = 1,
                IsComplete = true
            });
            objectives.Add(new QuestObjective
            {
                ObjectiveIndex = 1,
                Type = ObjectiveType.Kill,
                TargetCount = 10,
                CurrentCount = 5,
                IsComplete = false
            });
            objectives.Add(new QuestObjective
            {
                ObjectiveIndex = 2,
                Type = ObjectiveType.Collect,
                TargetCount = 1,
                CurrentCount = 0,
                IsOptional = true // Optional
            });

            yield return null;

            // Check completion state
            objectives = _entityManager.GetBuffer<QuestObjective>(questEntity);

            bool allRequiredComplete = true;
            for (int i = 0; i < objectives.Length; i++)
            {
                var o = objectives[i];
                if (!o.IsOptional && !o.IsSatisfied)
                {
                    allRequiredComplete = false;
                    break;
                }
            }

            Assert.IsFalse(allRequiredComplete);

            // Complete remaining objective
            var killObj = objectives[1];
            killObj.CurrentCount = 10;
            objectives[1] = killObj;

            yield return null;

            allRequiredComplete = true;
            for (int i = 0; i < objectives.Length; i++)
            {
                var o = objectives[i];
                if (!o.IsOptional && !o.IsSatisfied)
                {
                    allRequiredComplete = false;
                    break;
                }
            }

            Assert.IsTrue(allRequiredComplete);
        }

        #endregion

        #region Quest Completion Tests

        [UnityTest]
        public IEnumerator CompleteQuest_UpdatesStatus()
        {
            var questEntity = _entityManager.CreateEntity();
            _entityManager.AddComponentData(questEntity, new Quest
            {
                QuestId = 3001,
                Status = QuestStatus.Active,
                ReputationReward = 50,
                XPReward = 200
            });

            var objectives = _entityManager.AddBuffer<QuestObjective>(questEntity);
            objectives.Add(new QuestObjective
            {
                ObjectiveIndex = 0,
                TargetCount = 1,
                CurrentCount = 1,
                IsComplete = true
            });

            yield return null;

            // All objectives complete - mark ready to complete
            var quest = _entityManager.GetComponentData<Quest>(questEntity);
            quest.Status = QuestStatus.ReadyToComplete;
            _entityManager.SetComponentData(questEntity, quest);

            yield return null;

            // Turn in quest
            quest = _entityManager.GetComponentData<Quest>(questEntity);
            quest.Status = QuestStatus.Completed;
            _entityManager.SetComponentData(questEntity, quest);

            yield return null;

            quest = _entityManager.GetComponentData<Quest>(questEntity);
            Assert.AreEqual(QuestStatus.Completed, quest.Status);
        }

        [UnityTest]
        public IEnumerator CompleteQuest_AddToHistory()
        {
            var playerEntity = _entityManager.CreateEntity();
            var completedQuests = _entityManager.AddBuffer<CompletedQuest>(playerEntity);

            var questEntity = _entityManager.CreateEntity();
            _entityManager.AddComponentData(questEntity, new Quest
            {
                QuestId = 3002,
                Status = QuestStatus.Completed,
                ReputationReward = 25,
                XPReward = 150
            });

            yield return null;

            // Add to history
            completedQuests.Add(new CompletedQuest
            {
                QuestId = 3002,
                FinalStatus = QuestStatus.Completed,
                CompletedTime = 500f,
                ReputationEarned = 25,
                XPEarned = 150
            });

            yield return null;

            completedQuests = _entityManager.GetBuffer<CompletedQuest>(playerEntity);
            Assert.AreEqual(1, completedQuests.Length);
            Assert.AreEqual(3002, completedQuests[0].QuestId);
            Assert.AreEqual(150, completedQuests[0].XPEarned);
        }

        #endregion

        #region Quest Failure Tests

        [UnityTest]
        public IEnumerator FailQuest_TimerExpired()
        {
            var questEntity = _entityManager.CreateEntity();
            _entityManager.AddComponentData(questEntity, new Quest
            {
                QuestId = 4001,
                Status = QuestStatus.Active,
                TimeLimit = 60f,
                TimeRemaining = 5f // Almost expired
            });

            yield return null;

            // Simulate time passing
            var quest = _entityManager.GetComponentData<Quest>(questEntity);
            quest.TimeRemaining -= 10f; // Now negative

            if (quest.IsExpired && quest.Status == QuestStatus.Active)
            {
                quest.Status = QuestStatus.Failed;
            }

            _entityManager.SetComponentData(questEntity, quest);

            yield return null;

            quest = _entityManager.GetComponentData<Quest>(questEntity);
            Assert.AreEqual(QuestStatus.Failed, quest.Status);
        }

        [UnityTest]
        public IEnumerator AbandonQuest_UpdatesStatus()
        {
            var questEntity = _entityManager.CreateEntity();
            _entityManager.AddComponentData(questEntity, new Quest
            {
                QuestId = 4002,
                Status = QuestStatus.Active
            });

            yield return null;

            var quest = _entityManager.GetComponentData<Quest>(questEntity);
            quest.Status = QuestStatus.Abandoned;
            _entityManager.SetComponentData(questEntity, quest);

            yield return null;

            quest = _entityManager.GetComponentData<Quest>(questEntity);
            Assert.AreEqual(QuestStatus.Abandoned, quest.Status);
        }

        #endregion

        #region Quest Event Processing Tests

        [UnityTest]
        public IEnumerator QuestEvent_ProcessKillEvent()
        {
            // Create quest with kill objective
            var questEntity = _entityManager.CreateEntity();
            _entityManager.AddComponentData(questEntity, new Quest
            {
                QuestId = 5001,
                Status = QuestStatus.Active
            });
            var objectives = _entityManager.AddBuffer<QuestObjective>(questEntity);
            objectives.Add(new QuestObjective
            {
                Type = ObjectiveType.Kill,
                TargetEntityId = 100, // Specific enemy type
                TargetCount = 3,
                CurrentCount = 0
            });

            // Create kill event
            var eventEntity = _entityManager.CreateEntity();
            _entityManager.AddComponentData(eventEntity, new QuestEvent
            {
                EventType = QuestEventType.EnemyKilled,
                Count = 1
            });

            yield return null;

            // Process event (simulating system)
            objectives = _entityManager.GetBuffer<QuestObjective>(questEntity);
            var obj = objectives[0];
            obj.CurrentCount += 1;
            objectives[0] = obj;

            // Cleanup event
            _entityManager.DestroyEntity(eventEntity);

            yield return null;

            objectives = _entityManager.GetBuffer<QuestObjective>(questEntity);
            Assert.AreEqual(1, objectives[0].CurrentCount);
        }

        [UnityTest]
        public IEnumerator QuestEvent_ProcessLocationEvent()
        {
            var questEntity = _entityManager.CreateEntity();
            var objectives = _entityManager.AddBuffer<QuestObjective>(questEntity);
            objectives.Add(new QuestObjective
            {
                Type = ObjectiveType.Explore,
                TargetTerritory = new FixedString64Bytes("DeepReach"),
                TargetCount = 1,
                CurrentCount = 0
            });

            // Create location event
            var eventEntity = _entityManager.CreateEntity();
            _entityManager.AddComponentData(eventEntity, new QuestEvent
            {
                EventType = QuestEventType.LocationReached,
                TerritoryId = new FixedString64Bytes("DeepReach")
            });

            yield return null;

            // Process (simulating system matching territory)
            objectives = _entityManager.GetBuffer<QuestObjective>(questEntity);
            var obj = objectives[0];
            if (obj.TargetTerritory.Equals(new FixedString64Bytes("DeepReach")))
            {
                obj.CurrentCount = 1;
                obj.IsComplete = true;
                objectives[0] = obj;
            }

            yield return null;

            objectives = _entityManager.GetBuffer<QuestObjective>(questEntity);
            Assert.IsTrue(objectives[0].IsComplete);
        }

        #endregion

        #region Quest Giver Tests

        [UnityTest]
        public IEnumerator QuestGiver_TracksActiveQuests()
        {
            var giverEntity = _entityManager.CreateEntity();
            _entityManager.AddComponentData(giverEntity, new QuestGiver
            {
                Faction = FactionType.Kurenai,
                MaxActiveQuests = 3,
                CurrentActiveQuests = 0,
                QuestCooldown = 120f,
                CooldownRemaining = 0f
            });

            var availableQuests = _entityManager.AddBuffer<QuestGiverQuest>(giverEntity);

            // Add quest to giver
            var questEntity = _entityManager.CreateEntity();
            _entityManager.AddComponentData(questEntity, new Quest { QuestId = 6001 });

            availableQuests.Add(new QuestGiverQuest
            {
                QuestEntity = questEntity,
                QuestId = 6001
            });

            yield return null;

            // Accept quest
            var giver = _entityManager.GetComponentData<QuestGiver>(giverEntity);
            giver.CurrentActiveQuests++;
            _entityManager.SetComponentData(giverEntity, giver);

            yield return null;

            giver = _entityManager.GetComponentData<QuestGiver>(giverEntity);
            Assert.AreEqual(1, giver.CurrentActiveQuests);
            Assert.IsTrue(giver.CurrentActiveQuests < giver.MaxActiveQuests);
        }

        [UnityTest]
        public IEnumerator QuestGiver_CooldownTracking()
        {
            var giverEntity = _entityManager.CreateEntity();
            _entityManager.AddComponentData(giverEntity, new QuestGiver
            {
                QuestCooldown = 60f,
                CooldownRemaining = 60f
            });

            yield return null;

            // Simulate time passing
            var giver = _entityManager.GetComponentData<QuestGiver>(giverEntity);
            giver.CooldownRemaining -= 30f;
            _entityManager.SetComponentData(giverEntity, giver);

            yield return null;

            giver = _entityManager.GetComponentData<QuestGiver>(giverEntity);
            Assert.AreEqual(30f, giver.CooldownRemaining);
            Assert.IsTrue(giver.CooldownRemaining > 0f);

            // Complete cooldown
            giver.CooldownRemaining = 0f;
            _entityManager.SetComponentData(giverEntity, giver);

            yield return null;

            giver = _entityManager.GetComponentData<QuestGiver>(giverEntity);
            Assert.IsFalse(giver.CooldownRemaining > 0f);
        }

        #endregion

        #region Quest System State Tests

        [UnityTest]
        public IEnumerator QuestSystemState_TracksStatistics()
        {
            var stateEntity = _entityManager.CreateEntity();
            _entityManager.AddComponentData(stateEntity, QuestSystemState.Default);

            yield return null;

            var state = _entityManager.GetComponentData<QuestSystemState>(stateEntity);

            // Generate quest
            state.TotalQuestsGenerated++;
            int newQuestId = state.NextQuestId++;
            state.ActiveQuestCount++;
            _entityManager.SetComponentData(stateEntity, state);

            yield return null;

            state = _entityManager.GetComponentData<QuestSystemState>(stateEntity);
            Assert.AreEqual(1, state.TotalQuestsGenerated);
            Assert.AreEqual(2, state.NextQuestId);
            Assert.AreEqual(1, state.ActiveQuestCount);

            // Complete quest
            state.TotalQuestsCompleted++;
            state.ActiveQuestCount--;
            _entityManager.SetComponentData(stateEntity, state);

            yield return null;

            state = _entityManager.GetComponentData<QuestSystemState>(stateEntity);
            Assert.AreEqual(1, state.TotalQuestsCompleted);
            Assert.AreEqual(0, state.ActiveQuestCount);
        }

        #endregion

        #region Quest Prerequisites Tests

        [UnityTest]
        public IEnumerator QuestPrerequisites_BlocksUntilComplete()
        {
            // Create prerequisite quest (completed)
            var prereqEntity = _entityManager.CreateEntity();
            _entityManager.AddComponentData(prereqEntity, new Quest
            {
                QuestId = 7001,
                Status = QuestStatus.Completed
            });

            // Create quest with prerequisite
            var questEntity = _entityManager.CreateEntity();
            _entityManager.AddComponentData(questEntity, new Quest
            {
                QuestId = 7002,
                Status = QuestStatus.Hidden
            });

            var prereqs = _entityManager.AddBuffer<QuestPrerequisite>(questEntity);
            prereqs.Add(new QuestPrerequisite
            {
                RequiredQuestId = 7001,
                RequiredStatus = QuestStatus.Completed
            });

            yield return null;

            // Check prerequisites
            prereqs = _entityManager.GetBuffer<QuestPrerequisite>(questEntity);
            var prereqQuest = _entityManager.GetComponentData<Quest>(prereqEntity);

            bool prereqsMet = true;
            for (int i = 0; i < prereqs.Length; i++)
            {
                if (prereqQuest.Status < prereqs[i].RequiredStatus)
                {
                    prereqsMet = false;
                    break;
                }
            }

            Assert.IsTrue(prereqsMet);

            // Unlock quest
            var quest = _entityManager.GetComponentData<Quest>(questEntity);
            quest.Status = QuestStatus.Available;
            _entityManager.SetComponentData(questEntity, quest);

            yield return null;

            quest = _entityManager.GetComponentData<Quest>(questEntity);
            Assert.AreEqual(QuestStatus.Available, quest.Status);
        }

        #endregion
    }
}
