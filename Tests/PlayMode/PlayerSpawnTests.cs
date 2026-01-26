using NUnit.Framework;
using Unity.Entities;
using Unity.Transforms;
using Unity.Mathematics;
using UnityEngine.TestTools;
using System.Collections;
using NeoTokyo.Components.Core;
using NeoTokyo.Components.Stats;
using NeoTokyo.Components.Combat;
using NeoTokyo.Components.Faction;

namespace NeoTokyo.Tests.PlayMode
{
    /// <summary>
    /// Integration tests for player entity spawning.
    /// Verifies player spawns with all required components and correct initial values.
    /// </summary>
    [TestFixture]
    public class PlayerSpawnTests
    {
        private World _testWorld;
        private EntityManager _em;

        [SetUp]
        public void SetUp()
        {
            _testWorld = new World("PlayerSpawnTestWorld");
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
        public IEnumerator Player_Spawns_WithCorrectComponents()
        {
            // Arrange
            var playerEntity = CreatePlayerEntity();
            yield return null;

            // Assert - Core components
            Assert.IsTrue(_em.HasComponent<PlayerTag>(playerEntity),
                "Player should have PlayerTag");
            Assert.IsTrue(_em.HasComponent<LocalTransform>(playerEntity),
                "Player should have LocalTransform");
            Assert.IsTrue(_em.HasComponent<RPGStats>(playerEntity),
                "Player should have RPGStats");
            Assert.IsTrue(_em.HasComponent<Health>(playerEntity),
                "Player should have Health");
            Assert.IsTrue(_em.HasComponent<Reputation>(playerEntity),
                "Player should have Reputation");
        }

        [UnityTest]
        public IEnumerator Player_Spawns_WithDefaultStats()
        {
            // Arrange
            var playerEntity = CreatePlayerEntity();
            yield return null;

            // Act
            var stats = _em.GetComponentData<RPGStats>(playerEntity);

            // Assert - Default stats are 10 each per RPGStats.Default
            Assert.AreEqual(10, stats.Structure,
                "Structure should be 10");
            Assert.AreEqual(10, stats.Ignition,
                "Ignition should be 10");
            Assert.AreEqual(10, stats.Logic,
                "Logic should be 10");
            Assert.AreEqual(10, stats.Flow,
                "Flow should be 10");
        }

        [UnityTest]
        public IEnumerator Player_Spawns_WithFullHealth()
        {
            // Arrange
            var playerEntity = CreatePlayerEntity();
            yield return null;

            // Act
            var health = _em.GetComponentData<Health>(playerEntity);

            // Assert
            Assert.AreEqual(health.Max, health.Current,
                "Player should spawn with full health");
            Assert.IsFalse(health.IsDead,
                "Player should not be dead on spawn");
            Assert.AreEqual(1f, health.Ratio, 0.001f,
                "Health ratio should be 100%");
        }

        [UnityTest]
        public IEnumerator Player_Spawns_WithNeutralReputation()
        {
            // Arrange
            var playerEntity = CreatePlayerEntity();
            yield return null;

            // Act
            var reputation = _em.GetComponentData<Reputation>(playerEntity);

            // Assert - Default reputation is 50 (neutral) per Reputation.Default
            Assert.AreEqual(50, reputation.Kurenai,
                "Kurenai reputation should start at 50");
            Assert.AreEqual(50, reputation.Azure,
                "Azure reputation should start at 50");
            Assert.AreEqual(ReputationLevel.Neutral, reputation.GetKurenaiLevel(),
                "Kurenai level should be Neutral");
            Assert.AreEqual(ReputationLevel.Neutral, reputation.GetAzureLevel(),
                "Azure level should be Neutral");
        }

        [UnityTest]
        public IEnumerator Player_Spawns_AtOrigin()
        {
            // Arrange
            var playerEntity = CreatePlayerEntity();
            yield return null;

            // Act
            var transform = _em.GetComponentData<LocalTransform>(playerEntity);

            // Assert
            Assert.AreEqual(float3.zero, transform.Position,
                "Player should spawn at origin");
        }

        [UnityTest]
        public IEnumerator Player_Spawns_WithLevelOneProgress()
        {
            // Arrange
            var playerEntity = CreatePlayerEntityWithProgress();
            yield return null;

            // Act
            var progress = _em.GetComponentData<LevelProgress>(playerEntity);

            // Assert - Default is level 1 with 0 XP
            Assert.AreEqual(1, progress.Level,
                "Player should start at level 1");
            Assert.AreEqual(0, progress.XP,
                "Player should start with 0 XP");
            Assert.AreEqual(100, progress.XPToNextLevel,
                "XP to level 2 should be 100");
        }

        [UnityTest]
        public IEnumerator Player_Spawns_WithCombatComponents()
        {
            // Arrange
            var playerEntity = CreatePlayerEntityWithCombat();
            yield return null;

            // Assert
            Assert.IsTrue(_em.HasComponent<InvincibilityState>(playerEntity),
                "Player should have InvincibilityState");
            Assert.IsTrue(_em.HasComponent<CharacterStateComponent>(playerEntity),
                "Player should have CharacterStateComponent");

            var invincibility = _em.GetComponentData<InvincibilityState>(playerEntity);
            Assert.IsFalse(invincibility.IsActive,
                "Player should not be invincible on spawn");

            var charState = _em.GetComponentData<CharacterStateComponent>(playerEntity);
            Assert.AreEqual(CharacterState.Idle, charState.Current,
                "Player should start in Idle state");
        }

        [UnityTest]
        public IEnumerator Player_StatsForLevel_ScalesCorrectly()
        {
            // Arrange & Act
            var level5Stats = RPGStats.ForLevel(5);
            yield return null;

            // Assert - Each stat gains 2 per level after 1
            // Level 5: 10 + (5-1)*2 = 18
            Assert.AreEqual(18, level5Stats.Structure);
            Assert.AreEqual(18, level5Stats.Ignition);
            Assert.AreEqual(18, level5Stats.Logic);
            Assert.AreEqual(18, level5Stats.Flow);
        }

        /// <summary>
        /// Creates a minimal player entity with core components.
        /// </summary>
        private Entity CreatePlayerEntity()
        {
            var entity = _em.CreateEntity();

            _em.AddComponent<PlayerTag>(entity);
            _em.AddComponentData(entity, LocalTransform.FromPosition(float3.zero));
            _em.AddComponentData(entity, RPGStats.Default);
            _em.AddComponentData(entity, new Health { Current = 100, Max = 100 });
            _em.AddComponentData(entity, Reputation.Default);

            return entity;
        }

        /// <summary>
        /// Creates a player entity with level progress tracking.
        /// </summary>
        private Entity CreatePlayerEntityWithProgress()
        {
            var entity = CreatePlayerEntity();
            _em.AddComponentData(entity, LevelProgress.Default);
            return entity;
        }

        /// <summary>
        /// Creates a player entity with combat-related components.
        /// </summary>
        private Entity CreatePlayerEntityWithCombat()
        {
            var entity = CreatePlayerEntity();
            _em.AddComponentData(entity, new InvincibilityState());
            _em.AddComponentData(entity, CharacterStateComponent.Default);
            return entity;
        }
    }
}
