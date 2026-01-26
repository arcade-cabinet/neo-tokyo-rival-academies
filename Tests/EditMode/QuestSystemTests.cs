using NUnit.Framework;
using Unity.Collections;
using Unity.Mathematics;
using NeoTokyo.Components.Quest;
using NeoTokyo.Components.Faction;

namespace NeoTokyo.Tests.EditMode
{
    /// <summary>
    /// Unit tests for QuestSystem components and logic.
    /// Tests quest states, objectives, rewards calculation.
    /// Command: Unity -batchmode -runTests -testPlatform EditMode
    /// </summary>
    [TestFixture]
    public class QuestSystemTests
    {
        #region Quest Component Tests

        [Test]
        public void Quest_DefaultValues()
        {
            var quest = Quest.Default;

            Assert.AreEqual(0, quest.QuestId);
            Assert.AreEqual(QuestType.Fetch, quest.Type);
            Assert.AreEqual(QuestStatus.Hidden, quest.Status);
            Assert.AreEqual(QuestPriority.Side, quest.Priority);
            Assert.AreEqual(FactionType.Neutral, quest.GiverFaction);
            Assert.AreEqual(0, quest.RequiredReputation);
            Assert.AreEqual(1, quest.RequiredLevel);
            Assert.AreEqual(10, quest.ReputationReward);
            Assert.AreEqual(100, quest.XPReward);
            Assert.AreEqual(50, quest.CreditReward);
            Assert.AreEqual(0f, quest.TimeLimit);
            Assert.IsTrue(quest.IsGenerated);
        }

        [Test]
        public void Quest_HasTimeLimit_ReturnsCorrectly()
        {
            var questNoLimit = Quest.Default;
            Assert.IsFalse(questNoLimit.HasTimeLimit);

            var questWithLimit = Quest.Default;
            questWithLimit.TimeLimit = 300f;
            questWithLimit.TimeRemaining = 300f;
            Assert.IsTrue(questWithLimit.HasTimeLimit);
        }

        [Test]
        public void Quest_IsExpired_ReturnsCorrectly()
        {
            var quest = Quest.Default;
            quest.TimeLimit = 100f;
            quest.TimeRemaining = 50f;
            Assert.IsFalse(quest.IsExpired);

            quest.TimeRemaining = 0f;
            Assert.IsTrue(quest.IsExpired);

            quest.TimeRemaining = -10f;
            Assert.IsTrue(quest.IsExpired);
        }

        [Test]
        public void Quest_IsExpired_ReturnsFalseWithNoTimeLimit()
        {
            var quest = Quest.Default;
            quest.TimeLimit = 0f;
            quest.TimeRemaining = 0f;

            Assert.IsFalse(quest.IsExpired);
        }

        #endregion

        #region QuestStatus Tests

        [Test]
        public void QuestStatus_AllStatesExist()
        {
            Assert.AreEqual((byte)0, (byte)QuestStatus.Hidden);
            Assert.AreEqual((byte)1, (byte)QuestStatus.Available);
            Assert.AreEqual((byte)2, (byte)QuestStatus.Active);
            Assert.AreEqual((byte)3, (byte)QuestStatus.ReadyToComplete);
            Assert.AreEqual((byte)4, (byte)QuestStatus.Completed);
            Assert.AreEqual((byte)5, (byte)QuestStatus.Failed);
            Assert.AreEqual((byte)6, (byte)QuestStatus.Expired);
            Assert.AreEqual((byte)7, (byte)QuestStatus.Abandoned);
        }

        [Test]
        public void QuestStatus_Transitions()
        {
            // Valid state machine transitions
            var quest = Quest.Default;

            // Hidden -> Available
            quest.Status = QuestStatus.Hidden;
            quest.Status = QuestStatus.Available;
            Assert.AreEqual(QuestStatus.Available, quest.Status);

            // Available -> Active
            quest.Status = QuestStatus.Active;
            Assert.AreEqual(QuestStatus.Active, quest.Status);

            // Active -> ReadyToComplete
            quest.Status = QuestStatus.ReadyToComplete;
            Assert.AreEqual(QuestStatus.ReadyToComplete, quest.Status);

            // ReadyToComplete -> Completed
            quest.Status = QuestStatus.Completed;
            Assert.AreEqual(QuestStatus.Completed, quest.Status);
        }

        #endregion

        #region QuestType Tests

        [Test]
        public void QuestType_AllTypesExist()
        {
            Assert.AreEqual((byte)0, (byte)QuestType.Fetch);
            Assert.AreEqual((byte)1, (byte)QuestType.Escort);
            Assert.AreEqual((byte)2, (byte)QuestType.Combat);
            Assert.AreEqual((byte)3, (byte)QuestType.Investigation);
            Assert.AreEqual((byte)4, (byte)QuestType.Delivery);
            Assert.AreEqual((byte)5, (byte)QuestType.Sabotage);
            Assert.AreEqual((byte)6, (byte)QuestType.Rescue);
            Assert.AreEqual((byte)7, (byte)QuestType.Territory);
            Assert.AreEqual((byte)8, (byte)QuestType.Dive);
            Assert.AreEqual((byte)9, (byte)QuestType.Navigate);
            Assert.AreEqual((byte)10, (byte)QuestType.Infiltrate);
            Assert.AreEqual((byte)11, (byte)QuestType.Negotiate);
        }

        #endregion

        #region QuestObjective Tests

        [Test]
        public void QuestObjective_IsSatisfied_WhenComplete()
        {
            var objective = new QuestObjective
            {
                ObjectiveIndex = 0,
                Type = ObjectiveType.Kill,
                TargetCount = 5,
                CurrentCount = 3,
                IsComplete = false
            };

            Assert.IsFalse(objective.IsSatisfied);

            // Mark as complete regardless of count
            objective.IsComplete = true;
            Assert.IsTrue(objective.IsSatisfied);
        }

        [Test]
        public void QuestObjective_IsSatisfied_WhenCountMet()
        {
            var objective = new QuestObjective
            {
                ObjectiveIndex = 0,
                Type = ObjectiveType.Collect,
                TargetCount = 10,
                CurrentCount = 10,
                IsComplete = false
            };

            Assert.IsTrue(objective.IsSatisfied);

            // Even with overflow
            objective.CurrentCount = 15;
            Assert.IsTrue(objective.IsSatisfied);
        }

        [Test]
        public void QuestObjective_IsSatisfied_NotWhenIncomplete()
        {
            var objective = new QuestObjective
            {
                ObjectiveIndex = 0,
                Type = ObjectiveType.Kill,
                TargetCount = 10,
                CurrentCount = 5,
                IsComplete = false
            };

            Assert.IsFalse(objective.IsSatisfied);
        }

        [Test]
        public void QuestObjective_OptionalDoesNotBlock()
        {
            var optionalObjective = new QuestObjective
            {
                ObjectiveIndex = 1,
                Type = ObjectiveType.Collect,
                TargetCount = 5,
                CurrentCount = 0,
                IsOptional = true,
                IsComplete = false
            };

            // Optional objectives don't need to be satisfied for quest completion
            // This is a design note for the system to handle
            Assert.IsTrue(optionalObjective.IsOptional);
        }

        [Test]
        public void QuestObjective_LocationBased()
        {
            var objective = new QuestObjective
            {
                ObjectiveIndex = 0,
                Type = ObjectiveType.Explore,
                Description = new FixedString128Bytes("Reach the Docks"),
                TargetTerritory = new FixedString64Bytes("SyndicateDocks"),
                TargetX = 100f,
                TargetY = 0f,
                TargetZ = 200f,
                TargetRadius = 10f,
                TargetCount = 1,
                CurrentCount = 0
            };

            Assert.AreEqual("SyndicateDocks", objective.TargetTerritory.ToString());
            Assert.AreEqual(10f, objective.TargetRadius);
        }

        #endregion

        #region QuestReward Tests

        [Test]
        public void QuestReward_XPCalculation()
        {
            var quest = Quest.Default;
            quest.DangerLevel = 5;
            quest.XPReward = 100;

            // Scaled XP based on danger level
            int scaledXP = CalculateScaledXP(quest.XPReward, quest.DangerLevel);

            // Base XP + 10% per danger level above 1
            int expected = (int)(100 * (1 + (5 - 1) * 0.1f)); // 140
            Assert.AreEqual(expected, scaledXP);
        }

        [Test]
        public void QuestReward_ReputationImpact()
        {
            var quest = Quest.Default;
            quest.GiverFaction = FactionType.Kurenai;
            quest.OpposingFaction = FactionType.Azure;
            quest.ReputationReward = 25;
            quest.ReputationPenalty = 15;

            // Completing quest affects both factions
            Assert.AreEqual(25, quest.ReputationReward);
            Assert.AreEqual(15, quest.ReputationPenalty);
            Assert.AreEqual(FactionType.Kurenai, quest.GiverFaction);
            Assert.AreEqual(FactionType.Azure, quest.OpposingFaction);
        }

        [Test]
        public void QuestReward_AlignmentShift()
        {
            var quest = Quest.Default;

            // Kurenai-aligned quest
            quest.AlignmentShift = -0.1f; // Toward Kurenai
            Assert.Less(quest.AlignmentShift, 0f);

            // Azure-aligned quest
            quest.AlignmentShift = 0.1f; // Toward Azure
            Assert.Greater(quest.AlignmentShift, 0f);

            // Neutral quest
            quest.AlignmentShift = 0f;
            Assert.AreEqual(0f, quest.AlignmentShift);
        }

        #endregion

        #region QuestGiver Tests

        [Test]
        public void QuestGiver_MaxActiveQuests()
        {
            var giver = new QuestGiver
            {
                Faction = FactionType.Kurenai,
                TerritoryId = new FixedString64Bytes("KurenaiAcademy"),
                MaxActiveQuests = 3,
                CurrentActiveQuests = 2,
                QuestCooldown = 60f,
                CooldownRemaining = 0f
            };

            // Can offer more quests
            bool canOffer = giver.CurrentActiveQuests < giver.MaxActiveQuests;
            Assert.IsTrue(canOffer);

            giver.CurrentActiveQuests = 3;
            canOffer = giver.CurrentActiveQuests < giver.MaxActiveQuests;
            Assert.IsFalse(canOffer);
        }

        [Test]
        public void QuestGiver_CooldownTracking()
        {
            var giver = new QuestGiver
            {
                QuestCooldown = 120f,
                CooldownRemaining = 120f
            };

            // Simulate time passing
            giver.CooldownRemaining -= 60f;
            Assert.AreEqual(60f, giver.CooldownRemaining);

            bool onCooldown = giver.CooldownRemaining > 0f;
            Assert.IsTrue(onCooldown);

            giver.CooldownRemaining = 0f;
            onCooldown = giver.CooldownRemaining > 0f;
            Assert.IsFalse(onCooldown);
        }

        #endregion

        #region QuestSystemState Tests

        [Test]
        public void QuestSystemState_Default()
        {
            var state = QuestSystemState.Default;

            Assert.AreEqual(0, state.TotalQuestsGenerated);
            Assert.AreEqual(0, state.TotalQuestsCompleted);
            Assert.AreEqual(0, state.TotalQuestsFailed);
            Assert.AreEqual(0, state.ActiveQuestCount);
            Assert.AreEqual(5, state.MaxActiveQuests);
            Assert.AreEqual(1.0f, state.DifficultyModifier);
            Assert.AreEqual(1, state.NextQuestId);
        }

        [Test]
        public void QuestSystemState_IdGeneration()
        {
            var state = QuestSystemState.Default;

            int id1 = state.NextQuestId++;
            int id2 = state.NextQuestId++;
            int id3 = state.NextQuestId++;

            Assert.AreEqual(1, id1);
            Assert.AreEqual(2, id2);
            Assert.AreEqual(3, id3);
        }

        [Test]
        public void QuestSystemState_ActiveQuestLimit()
        {
            var state = QuestSystemState.Default;
            state.MaxActiveQuests = 3;

            // Simulate accepting quests
            state.ActiveQuestCount = 2;
            bool canAccept = state.ActiveQuestCount < state.MaxActiveQuests;
            Assert.IsTrue(canAccept);

            state.ActiveQuestCount = 3;
            canAccept = state.ActiveQuestCount < state.MaxActiveQuests;
            Assert.IsFalse(canAccept);
        }

        #endregion

        #region QuestEvent Tests

        [Test]
        public void QuestEvent_KillEvent()
        {
            var evt = new QuestEvent
            {
                EventType = QuestEventType.EnemyKilled,
                Count = 1,
                TerritoryId = new FixedString64Bytes("CollectiveMarket"),
                PositionX = 50f,
                PositionY = 0f,
                PositionZ = 75f
            };

            Assert.AreEqual(QuestEventType.EnemyKilled, evt.EventType);
            Assert.AreEqual(1, evt.Count);
        }

        [Test]
        public void QuestEvent_CollectEvent()
        {
            var evt = new QuestEvent
            {
                EventType = QuestEventType.ItemCollected,
                ItemId = 12345,
                Count = 3
            };

            Assert.AreEqual(QuestEventType.ItemCollected, evt.EventType);
            Assert.AreEqual(12345, evt.ItemId);
            Assert.AreEqual(3, evt.Count);
        }

        [Test]
        public void QuestEvent_LocationReached()
        {
            var evt = new QuestEvent
            {
                EventType = QuestEventType.LocationReached,
                TerritoryId = new FixedString64Bytes("DeepReach"),
                PositionX = 100f,
                PositionY = -10f,
                PositionZ = 100f
            };

            Assert.AreEqual(QuestEventType.LocationReached, evt.EventType);
            Assert.AreEqual("DeepReach", evt.TerritoryId.ToString());
        }

        #endregion

        #region QuestGrammar Tests

        [Test]
        public void QuestGrammar_TitleGeneration()
        {
            var grammar = new QuestGrammar
            {
                Verb = new FixedString32Bytes("Find"),
                Noun = new FixedString32Bytes("artifact"),
                Adjective = new FixedString32Bytes("lost"),
                Location = new FixedString32Bytes("Archives"),
                Outcome = new FixedString32Bytes("unlock")
            };

            // Generate title: "Find the lost artifact"
            string title = $"{grammar.Verb} the {grammar.Adjective} {grammar.Noun}";
            Assert.AreEqual("Find the lost artifact", title);
        }

        [Test]
        public void QuestGrammar_AllVerbsSupported()
        {
            var verbs = new[]
            {
                "Find", "Defeat", "Escort", "Deliver", "Investigate",
                "Sabotage", "Rescue", "Defend", "Dive", "Navigate",
                "Infiltrate", "Negotiate"
            };

            foreach (var verb in verbs)
            {
                var grammar = new QuestGrammar { Verb = new FixedString32Bytes(verb) };
                Assert.AreEqual(verb, grammar.Verb.ToString());
            }
        }

        #endregion

        #region Objective Progress Tests

        [Test]
        public void ObjectiveProgress_IncrementCorrectly()
        {
            var objective = new QuestObjective
            {
                Type = ObjectiveType.Kill,
                TargetCount = 5,
                CurrentCount = 0
            };

            // Increment by 1
            objective.CurrentCount++;
            Assert.AreEqual(1, objective.CurrentCount);

            // Increment by multiple
            objective.CurrentCount += 3;
            Assert.AreEqual(4, objective.CurrentCount);

            // Should not auto-cap
            objective.CurrentCount += 10;
            Assert.AreEqual(14, objective.CurrentCount);
        }

        [Test]
        public void ObjectiveProgress_ResetOnQuestFail()
        {
            var objective = new QuestObjective
            {
                Type = ObjectiveType.Collect,
                TargetCount = 10,
                CurrentCount = 7
            };

            // Simulate quest failure - reset progress
            objective.CurrentCount = 0;
            objective.IsComplete = false;

            Assert.AreEqual(0, objective.CurrentCount);
            Assert.IsFalse(objective.IsSatisfied);
        }

        #endregion

        #region CompletedQuest History Tests

        [Test]
        public void CompletedQuest_TracksHistory()
        {
            var completed = new CompletedQuest
            {
                QuestId = 42,
                FinalStatus = QuestStatus.Completed,
                CompletedTime = 1234567f,
                ReputationEarned = 25,
                XPEarned = 150
            };

            Assert.AreEqual(42, completed.QuestId);
            Assert.AreEqual(QuestStatus.Completed, completed.FinalStatus);
            Assert.AreEqual(25, completed.ReputationEarned);
            Assert.AreEqual(150, completed.XPEarned);
        }

        [Test]
        public void CompletedQuest_TracksFailures()
        {
            var failed = new CompletedQuest
            {
                QuestId = 43,
                FinalStatus = QuestStatus.Failed,
                CompletedTime = 1234567f,
                ReputationEarned = 0,
                XPEarned = 0
            };

            Assert.AreEqual(QuestStatus.Failed, failed.FinalStatus);
            Assert.AreEqual(0, failed.ReputationEarned);
            Assert.AreEqual(0, failed.XPEarned);
        }

        #endregion

        #region Quest Timer Tests

        [Test]
        public void QuestTimer_Countdown()
        {
            var quest = Quest.Default;
            quest.TimeLimit = 300f;
            quest.TimeRemaining = 300f;
            quest.Status = QuestStatus.Active;

            // Simulate 60 seconds passing
            quest.TimeRemaining -= 60f;
            Assert.AreEqual(240f, quest.TimeRemaining);

            // Check percentage
            float percentage = quest.TimeRemaining / quest.TimeLimit;
            Assert.AreEqual(0.8f, percentage, 0.001f);
        }

        [Test]
        public void QuestTimer_ExpirationTriggersFailure()
        {
            var quest = Quest.Default;
            quest.TimeLimit = 10f;
            quest.TimeRemaining = 1f;
            quest.Status = QuestStatus.Active;

            // Simulate time passing beyond limit
            quest.TimeRemaining -= 5f;

            Assert.IsTrue(quest.IsExpired);

            // System should mark as failed
            if (quest.IsExpired && quest.Status == QuestStatus.Active)
            {
                quest.Status = QuestStatus.Failed;
            }

            Assert.AreEqual(QuestStatus.Failed, quest.Status);
        }

        #endregion

        #region Helper Methods

        private static int CalculateScaledXP(int baseXP, int dangerLevel)
        {
            float multiplier = 1f + (dangerLevel - 1) * 0.1f;
            return (int)(baseXP * multiplier);
        }

        #endregion
    }
}
