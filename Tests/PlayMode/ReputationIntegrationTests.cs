using NUnit.Framework;
using Unity.Entities;
using Unity.Transforms;
using Unity.Mathematics;
using Unity.Collections;
using UnityEngine.TestTools;
using System.Collections;
using NeoTokyo.Components.Core;
using NeoTokyo.Components.Faction;

namespace NeoTokyo.Tests.PlayMode
{
    /// <summary>
    /// Integration tests for the reputation system.
    /// Tests reputation changes, faction reactions, and persistence.
    /// </summary>
    [TestFixture]
    public class ReputationIntegrationTests
    {
        private World _testWorld;
        private EntityManager _em;

        [SetUp]
        public void SetUp()
        {
            _testWorld = new World("ReputationTestWorld");
            _em = _testWorld.EntityManager;
        }

        [TearDown]
        public void TearDown()
        {
            if (_testWorld != null && _testWorld.IsCreated)
            {
                _testWorld.Dispose();
            }
        }

        [UnityTest]
        public IEnumerator ReputationChange_PersistsToEntity()
        {
            // Arrange
            var playerEntity = CreatePlayerWithReputation();
            var initialRep = _em.GetComponentData<Reputation>(playerEntity);
            int initialKurenai = initialRep.Kurenai;
            yield return null;

            // Act - Add reputation change
            AddReputationChange(playerEntity, FactionType.Kurenai, 10, "quest_complete");
            ProcessReputationChanges(playerEntity);

            // Assert
            var finalRep = _em.GetComponentData<Reputation>(playerEntity);
            Assert.AreEqual(initialKurenai + 10, finalRep.Kurenai,
                "Reputation change should persist");
        }

        [UnityTest]
        public IEnumerator MultipleReputationChanges_ApplyInOrder()
        {
            // Arrange
            var playerEntity = CreatePlayerWithReputation();
            yield return null;

            // Act - Add multiple changes
            AddReputationChange(playerEntity, FactionType.Kurenai, 10, "help_civilian");
            AddReputationChange(playerEntity, FactionType.Kurenai, -5, "defeat_enemy");
            AddReputationChange(playerEntity, FactionType.Azure, 15, "complete_quest");
            ProcessReputationChanges(playerEntity);

            // Assert
            var reputation = _em.GetComponentData<Reputation>(playerEntity);
            Assert.AreEqual(55, reputation.Kurenai,
                "Kurenai should be 50 + 10 - 5 = 55");
            Assert.AreEqual(65, reputation.Azure,
                "Azure should be 50 + 15 = 65");
        }

        [UnityTest]
        public IEnumerator ReputationClamped_AtUpperBound()
        {
            // Arrange
            var playerEntity = CreatePlayerWithReputation();
            yield return null;

            // Act - Try to exceed 100
            AddReputationChange(playerEntity, FactionType.Kurenai, 100, "massive_bonus");
            ProcessReputationChanges(playerEntity);

            // Assert
            var reputation = _em.GetComponentData<Reputation>(playerEntity);
            Assert.AreEqual(100, reputation.Kurenai,
                "Reputation should be clamped at 100");
        }

        [UnityTest]
        public IEnumerator ReputationClamped_AtLowerBound()
        {
            // Arrange
            var playerEntity = CreatePlayerWithReputation();
            yield return null;

            // Act - Try to go below 0
            AddReputationChange(playerEntity, FactionType.Kurenai, -100, "massive_penalty");
            ProcessReputationChanges(playerEntity);

            // Assert
            var reputation = _em.GetComponentData<Reputation>(playerEntity);
            Assert.AreEqual(0, reputation.Kurenai,
                "Reputation should be clamped at 0");
        }

        [UnityTest]
        public IEnumerator FactionReaction_ChangesWithReputation_Hostile()
        {
            // Arrange
            var playerEntity = CreatePlayerWithReputation();
            var npcEntity = CreateFactionNPC(FactionType.Kurenai);

            // Set player reputation to hostile level
            SetReputationLevel(playerEntity, FactionType.Kurenai, 15);
            yield return null;

            // Assert
            var reputation = _em.GetComponentData<Reputation>(playerEntity);
            float aggression = reputation.GetAggressionMultiplier(FactionType.Kurenai);
            Assert.AreEqual(2.0f, aggression,
                "Hostile reputation should have 2x aggression");
        }

        [UnityTest]
        public IEnumerator FactionReaction_ChangesWithReputation_Friendly()
        {
            // Arrange
            var playerEntity = CreatePlayerWithReputation();
            var npcEntity = CreateFactionNPC(FactionType.Azure);

            // Set player reputation to friendly level
            SetReputationLevel(playerEntity, FactionType.Azure, 70);
            yield return null;

            // Assert
            var reputation = _em.GetComponentData<Reputation>(playerEntity);
            float aggression = reputation.GetAggressionMultiplier(FactionType.Azure);
            Assert.AreEqual(0.75f, aggression,
                "Friendly reputation should have 0.75x aggression");
        }

        [UnityTest]
        public IEnumerator FactionReaction_ChangesWithReputation_Revered()
        {
            // Arrange
            var playerEntity = CreatePlayerWithReputation();
            SetReputationLevel(playerEntity, FactionType.Kurenai, 95);
            yield return null;

            // Assert
            var reputation = _em.GetComponentData<Reputation>(playerEntity);
            var level = reputation.GetKurenaiLevel();
            float aggression = reputation.GetAggressionMultiplier(FactionType.Kurenai);

            Assert.AreEqual(ReputationLevel.Revered, level,
                "95 reputation should be Revered");
            Assert.AreEqual(0.5f, aggression,
                "Revered reputation should have 0.5x aggression");
        }

        [UnityTest]
        public IEnumerator DefeatEnemy_ReducesReputation()
        {
            // Arrange
            var playerEntity = CreatePlayerWithReputation();
            var enemyEntity = CreateFactionNPC(FactionType.Kurenai);
            yield return null;

            // Act - Simulate defeating enemy
            AddReputationChange(playerEntity, FactionType.Kurenai,
                ReputationChanges.DEFEAT_ENEMY, "defeat_enemy");
            ProcessReputationChanges(playerEntity);

            // Assert
            var reputation = _em.GetComponentData<Reputation>(playerEntity);
            Assert.AreEqual(45, reputation.Kurenai,
                "Defeating enemy should reduce reputation by 5");
        }

        [UnityTest]
        public IEnumerator DefeatBoss_ReducesReputationMore()
        {
            // Arrange
            var playerEntity = CreatePlayerWithReputation();
            yield return null;

            // Act
            AddReputationChange(playerEntity, FactionType.Kurenai,
                ReputationChanges.DEFEAT_BOSS, "defeat_boss");
            ProcessReputationChanges(playerEntity);

            // Assert
            var reputation = _em.GetComponentData<Reputation>(playerEntity);
            Assert.AreEqual(35, reputation.Kurenai,
                "Defeating boss should reduce reputation by 15");
        }

        [UnityTest]
        public IEnumerator CompleteQuest_IncreasesReputation()
        {
            // Arrange
            var playerEntity = CreatePlayerWithReputation();
            yield return null;

            // Act
            AddReputationChange(playerEntity, FactionType.Azure,
                ReputationChanges.COMPLETE_QUEST, "quest_complete");
            ProcessReputationChanges(playerEntity);

            // Assert
            var reputation = _em.GetComponentData<Reputation>(playerEntity);
            Assert.AreEqual(60, reputation.Azure,
                "Completing quest should increase reputation by 10");
        }

        [UnityTest]
        public IEnumerator SpareEnemy_IncreasesReputation()
        {
            // Arrange
            var playerEntity = CreatePlayerWithReputation();
            yield return null;

            // Act
            AddReputationChange(playerEntity, FactionType.Kurenai,
                ReputationChanges.SPARE_ENEMY, "spare_enemy");
            ProcessReputationChanges(playerEntity);

            // Assert
            var reputation = _em.GetComponentData<Reputation>(playerEntity);
            Assert.AreEqual(53, reputation.Kurenai,
                "Sparing enemy should increase reputation by 3");
        }

        [UnityTest]
        public IEnumerator BetrayFaction_SevereReputationLoss()
        {
            // Arrange
            var playerEntity = CreatePlayerWithReputation();
            yield return null;

            // Act
            AddReputationChange(playerEntity, FactionType.Azure,
                ReputationChanges.BETRAY_FACTION, "betrayal");
            ProcessReputationChanges(playerEntity);

            // Assert
            var reputation = _em.GetComponentData<Reputation>(playerEntity);
            Assert.AreEqual(25, reputation.Azure,
                "Betraying faction should reduce reputation by 25");
        }

        [UnityTest]
        public IEnumerator QuestUnlock_RequiresReputation()
        {
            // Arrange
            var playerEntity = CreatePlayerWithReputation();
            SetReputationLevel(playerEntity, FactionType.Kurenai, 60);
            SetReputationLevel(playerEntity, FactionType.Azure, 40);
            yield return null;

            var reputation = _em.GetComponentData<Reputation>(playerEntity);

            // Assert - Quest requiring Kurenai 50
            Assert.IsTrue(
                Systems.Progression.ReputationHelpers.IsQuestUnlocked(
                    reputation, kurenaiRequired: 50),
                "Quest should be unlocked with 60 Kurenai (requires 50)");

            // Assert - Quest requiring Kurenai 70
            Assert.IsFalse(
                Systems.Progression.ReputationHelpers.IsQuestUnlocked(
                    reputation, kurenaiRequired: 70),
                "Quest should be locked with 60 Kurenai (requires 70)");

            // Assert - Quest requiring both factions
            Assert.IsTrue(
                Systems.Progression.ReputationHelpers.IsQuestUnlocked(
                    reputation, kurenaiRequired: 50, azureRequired: 30),
                "Quest should be unlocked with both requirements met");
        }

        [UnityTest]
        public IEnumerator ReputationLevel_TransitionsCorrectly()
        {
            // Arrange
            var playerEntity = CreatePlayerWithReputation();
            yield return null;

            // Test each level transition
            var transitions = new[]
            {
                (value: 0, expected: ReputationLevel.Hated),
                (value: 10, expected: ReputationLevel.Hated),
                (value: 11, expected: ReputationLevel.Hostile),
                (value: 25, expected: ReputationLevel.Hostile),
                (value: 26, expected: ReputationLevel.Unfriendly),
                (value: 40, expected: ReputationLevel.Unfriendly),
                (value: 41, expected: ReputationLevel.Neutral),
                (value: 60, expected: ReputationLevel.Neutral),
                (value: 61, expected: ReputationLevel.Friendly),
                (value: 75, expected: ReputationLevel.Friendly),
                (value: 76, expected: ReputationLevel.Honored),
                (value: 90, expected: ReputationLevel.Honored),
                (value: 91, expected: ReputationLevel.Revered),
                (value: 100, expected: ReputationLevel.Revered)
            };

            foreach (var (value, expected) in transitions)
            {
                var rep = new Reputation { Kurenai = value, Azure = 50 };
                Assert.AreEqual(expected, rep.GetKurenaiLevel(),
                    $"Value {value} should be {expected}");
            }
        }

        [UnityTest]
        public IEnumerator DialogueOptions_DependOnReputation()
        {
            // Arrange
            using var options = new NativeList<FixedString32Bytes>(Allocator.TempJob);
            yield return null;

            // Hostile reputation - should have Threaten
            var hostileRep = new Reputation { Kurenai = 15, Azure = 50 };
            Systems.Progression.ReputationHelpers.GetDialogueOptions(
                hostileRep, FactionType.Kurenai, ref options);

            Assert.AreEqual(3, options.Length);
            Assert.IsTrue(ContainsOption(options, "Threaten"),
                "Hostile should have Threaten option");

            // Friendly reputation - should have Ask for Help and Trade
            var friendlyRep = new Reputation { Kurenai = 70, Azure = 50 };
            Systems.Progression.ReputationHelpers.GetDialogueOptions(
                friendlyRep, FactionType.Kurenai, ref options);

            Assert.AreEqual(4, options.Length);
            Assert.IsTrue(ContainsOption(options, "Ask for Help"),
                "Friendly should have Ask for Help option");
            Assert.IsTrue(ContainsOption(options, "Trade"),
                "Friendly should have Trade option");
        }

        #region Helper Methods

        private Entity CreatePlayerWithReputation()
        {
            var entity = _em.CreateEntity();
            _em.AddComponent<PlayerTag>(entity);
            _em.AddComponentData(entity, LocalTransform.FromPosition(float3.zero));
            _em.AddComponentData(entity, Reputation.Default);
            _em.AddBuffer<ReputationChangeElement>(entity);
            return entity;
        }

        private Entity CreateFactionNPC(FactionType faction)
        {
            var entity = _em.CreateEntity();
            _em.AddComponentData(entity, LocalTransform.FromPosition(new float3(5f, 0f, 0f)));
            _em.AddComponentData(entity, new FactionMembership { Value = faction });
            return entity;
        }

        private void AddReputationChange(Entity entity, FactionType faction, int amount, string reason)
        {
            var buffer = _em.GetBuffer<ReputationChangeElement>(entity);
            buffer.Add(new ReputationChangeElement
            {
                Faction = faction,
                Amount = amount,
                Reason = new FixedString64Bytes(reason)
            });
        }

        private void ProcessReputationChanges(Entity entity)
        {
            var reputation = _em.GetComponentData<Reputation>(entity);
            var changes = _em.GetBuffer<ReputationChangeElement>(entity);

            foreach (var change in changes)
            {
                switch (change.Faction)
                {
                    case FactionType.Kurenai:
                        reputation.Kurenai = math.clamp(
                            reputation.Kurenai + change.Amount, 0, 100);
                        break;
                    case FactionType.Azure:
                        reputation.Azure = math.clamp(
                            reputation.Azure + change.Amount, 0, 100);
                        break;
                }
            }

            _em.SetComponentData(entity, reputation);
            changes.Clear();
        }

        private void SetReputationLevel(Entity entity, FactionType faction, int value)
        {
            var reputation = _em.GetComponentData<Reputation>(entity);

            switch (faction)
            {
                case FactionType.Kurenai:
                    reputation.Kurenai = value;
                    break;
                case FactionType.Azure:
                    reputation.Azure = value;
                    break;
            }

            _em.SetComponentData(entity, reputation);
        }

        private bool ContainsOption(NativeList<FixedString32Bytes> options, string optionName)
        {
            foreach (var option in options)
            {
                if (option.ToString() == optionName)
                    return true;
            }
            return false;
        }

        #endregion
    }
}
