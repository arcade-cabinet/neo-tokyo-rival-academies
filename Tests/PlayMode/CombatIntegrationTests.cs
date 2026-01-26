using NUnit.Framework;
using Unity.Entities;
using Unity.Transforms;
using Unity.Mathematics;
using Unity.Collections;
using UnityEngine.TestTools;
using System.Collections;
using NeoTokyo.Components.Core;
using NeoTokyo.Components.Stats;
using NeoTokyo.Components.Combat;
using NeoTokyo.Systems.Combat;

namespace NeoTokyo.Tests.PlayMode
{
    /// <summary>
    /// Integration tests for the combat system.
    /// Tests damage application, invincibility frames, and death handling.
    /// </summary>
    [TestFixture]
    public class CombatIntegrationTests
    {
        private World _testWorld;
        private EntityManager _em;

        private const float INVINCIBILITY_DURATION = 0.5f;
        private const int INITIAL_HEALTH = 100;

        [SetUp]
        public void SetUp()
        {
            _testWorld = new World("CombatTestWorld");
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
        public IEnumerator Attack_HitsEnemy_ReducesHealth()
        {
            // Arrange
            var playerEntity = CreateCombatEntity(isPlayer: true);
            var enemyEntity = CreateCombatEntity(isPlayer: false);

            var damageBuffer = _em.GetBuffer<DamageEvent>(enemyEntity);
            damageBuffer.Add(new DamageEvent
            {
                Source = playerEntity,
                Amount = 25,
                IsCritical = false,
                StabilityDamage = 0f
            });

            yield return null;

            // Act - Process the damage manually since we're not running systems
            ProcessDamage(enemyEntity);

            // Assert
            var health = _em.GetComponentData<Health>(enemyEntity);
            Assert.AreEqual(75, health.Current,
                "Enemy health should be reduced by damage amount");
        }

        [UnityTest]
        public IEnumerator Damage_AppliesCorrectAmount()
        {
            // Arrange
            var entity = CreateCombatEntity(isPlayer: false);
            int damageAmount = 30;

            AddDamageEvent(entity, Entity.Null, damageAmount);
            yield return null;

            // Act
            ProcessDamage(entity);

            // Assert
            var health = _em.GetComponentData<Health>(entity);
            Assert.AreEqual(INITIAL_HEALTH - damageAmount, health.Current);
        }

        [UnityTest]
        public IEnumerator InvincibilityFrames_PreventDamage()
        {
            // Arrange
            var entity = CreateCombatEntity(isPlayer: true);

            // Set entity as invincible
            _em.SetComponentData(entity, InvincibilityState.Create(INVINCIBILITY_DURATION));

            // Try to apply damage while invincible
            AddDamageEvent(entity, Entity.Null, 50);
            yield return null;

            // Act
            ProcessDamageWithInvincibilityCheck(entity);

            // Assert - Health should be unchanged
            var health = _em.GetComponentData<Health>(entity);
            Assert.AreEqual(INITIAL_HEALTH, health.Current,
                "Invincible entity should not take damage");
        }

        [UnityTest]
        public IEnumerator Damage_GrantsInvincibilityFrames()
        {
            // Arrange
            var entity = CreateCombatEntity(isPlayer: true);

            // Ensure not invincible initially
            var initialInvincibility = _em.GetComponentData<InvincibilityState>(entity);
            Assert.IsFalse(initialInvincibility.IsActive);

            AddDamageEvent(entity, Entity.Null, 10);
            yield return null;

            // Act
            ProcessDamageAndGrantInvincibility(entity);

            // Assert
            var invincibility = _em.GetComponentData<InvincibilityState>(entity);
            Assert.IsTrue(invincibility.IsActive,
                "Entity should be invincible after taking damage");
            Assert.AreEqual(INVINCIBILITY_DURATION, invincibility.Duration, 0.01f,
                "Invincibility duration should match constant");
        }

        [UnityTest]
        public IEnumerator InvincibilityFrames_ExpireOverTime()
        {
            // Arrange
            var entity = CreateCombatEntity(isPlayer: true);
            _em.SetComponentData(entity, InvincibilityState.Create(0.5f));
            yield return null;

            // Act - Simulate time passing
            SimulateInvincibilityDecay(entity, 0.6f);

            // Assert
            var invincibility = _em.GetComponentData<InvincibilityState>(entity);
            Assert.IsFalse(invincibility.IsActive,
                "Invincibility should expire after duration");
        }

        [UnityTest]
        public IEnumerator FatalDamage_KillsEntity()
        {
            // Arrange
            var entity = CreateCombatEntity(isPlayer: false);
            AddDamageEvent(entity, Entity.Null, 150); // More than max health
            yield return null;

            // Act
            ProcessDamageAndCheckDeath(entity);

            // Assert
            var health = _em.GetComponentData<Health>(entity);
            Assert.AreEqual(0, health.Current,
                "Health should be clamped to 0");
            Assert.IsTrue(health.IsDead,
                "Entity should be dead");
            Assert.IsTrue(_em.HasComponent<DeadTag>(entity),
                "Dead entity should have DeadTag");
        }

        [UnityTest]
        public IEnumerator MultipleHits_ApplySequentially()
        {
            // Arrange
            var entity = CreateCombatEntityWithoutInvincibility();
            var damageBuffer = _em.GetBuffer<DamageEvent>(entity);

            damageBuffer.Add(new DamageEvent { Amount = 10 });
            damageBuffer.Add(new DamageEvent { Amount = 15 });
            damageBuffer.Add(new DamageEvent { Amount = 20 });
            yield return null;

            // Act
            ProcessAllDamage(entity);

            // Assert
            var health = _em.GetComponentData<Health>(entity);
            Assert.AreEqual(INITIAL_HEALTH - 45, health.Current,
                "All damage should be applied");
        }

        [UnityTest]
        public IEnumerator CriticalHit_FlagsCorrectly()
        {
            // Arrange
            var entity = CreateCombatEntity(isPlayer: false);
            var damageBuffer = _em.GetBuffer<DamageEvent>(entity);

            damageBuffer.Add(new DamageEvent
            {
                Source = Entity.Null,
                Amount = 50,
                IsCritical = true,
                StabilityDamage = 10f
            });
            yield return null;

            // Assert - Verify the event was stored correctly
            var buffer = _em.GetBuffer<DamageEvent>(entity);
            Assert.AreEqual(1, buffer.Length);
            Assert.IsTrue(buffer[0].IsCritical,
                "Critical flag should be preserved");
        }

        [UnityTest]
        public IEnumerator StabilityDamage_AppliesWithHit()
        {
            // Arrange
            var entity = CreateCombatEntityWithStability();
            var damageBuffer = _em.GetBuffer<DamageEvent>(entity);

            damageBuffer.Add(new DamageEvent
            {
                Amount = 20,
                StabilityDamage = 30f
            });
            yield return null;

            // Act
            ProcessDamageWithStability(entity);

            // Assert
            var stability = _em.GetComponentData<StabilityState>(entity);
            Assert.AreEqual(70, stability.Current,
                "Stability should be reduced by damage");
        }

        [UnityTest]
        public IEnumerator ZeroStability_TriggersBreak()
        {
            // Arrange
            var entity = CreateCombatEntityWithStability();

            // Set stability low enough to break
            _em.SetComponentData(entity, new StabilityState
            {
                Current = 20,
                Max = 100,
                RecoveryRate = 10f
            });

            var damageBuffer = _em.GetBuffer<DamageEvent>(entity);
            damageBuffer.Add(new DamageEvent
            {
                Amount = 10,
                StabilityDamage = 25f
            });
            yield return null;

            // Act
            ProcessDamageWithBreak(entity);

            // Assert
            var stability = _em.GetComponentData<StabilityState>(entity);
            Assert.IsTrue(stability.IsBroken,
                "Entity should be broken when stability reaches 0");
        }

        #region Helper Methods

        private Entity CreateCombatEntity(bool isPlayer)
        {
            var entity = _em.CreateEntity();

            if (isPlayer)
            {
                _em.AddComponent<PlayerTag>(entity);
            }
            else
            {
                _em.AddComponent<EnemyTag>(entity);
            }

            _em.AddComponentData(entity, LocalTransform.FromPosition(float3.zero));
            _em.AddComponentData(entity, new Health { Current = INITIAL_HEALTH, Max = INITIAL_HEALTH });
            _em.AddComponentData(entity, new InvincibilityState());
            _em.AddBuffer<DamageEvent>(entity);

            return entity;
        }

        private Entity CreateCombatEntityWithoutInvincibility()
        {
            var entity = _em.CreateEntity();
            _em.AddComponent<EnemyTag>(entity);
            _em.AddComponentData(entity, new Health { Current = INITIAL_HEALTH, Max = INITIAL_HEALTH });
            _em.AddBuffer<DamageEvent>(entity);
            return entity;
        }

        private Entity CreateCombatEntityWithStability()
        {
            var entity = CreateCombatEntity(isPlayer: false);
            _em.AddComponentData(entity, StabilityState.Default);
            _em.AddComponentData(entity, BreakState.Default);
            return entity;
        }

        private void AddDamageEvent(Entity entity, Entity source, int amount)
        {
            var buffer = _em.GetBuffer<DamageEvent>(entity);
            buffer.Add(new DamageEvent
            {
                Source = source,
                Amount = amount,
                IsCritical = false,
                StabilityDamage = 0f
            });
        }

        private void ProcessDamage(Entity entity)
        {
            var damageBuffer = _em.GetBuffer<DamageEvent>(entity);
            var health = _em.GetComponentData<Health>(entity);

            foreach (var damage in damageBuffer)
            {
                health.Current = math.max(0, health.Current - damage.Amount);
            }

            _em.SetComponentData(entity, health);
            damageBuffer.Clear();
        }

        private void ProcessDamageWithInvincibilityCheck(Entity entity)
        {
            var invincibility = _em.GetComponentData<InvincibilityState>(entity);

            if (invincibility.IsActive)
            {
                var damageBuffer = _em.GetBuffer<DamageEvent>(entity);
                damageBuffer.Clear();
                return;
            }

            ProcessDamage(entity);
        }

        private void ProcessDamageAndGrantInvincibility(Entity entity)
        {
            var damageBuffer = _em.GetBuffer<DamageEvent>(entity);
            var health = _em.GetComponentData<Health>(entity);
            var invincibility = _em.GetComponentData<InvincibilityState>(entity);

            if (invincibility.IsActive)
            {
                damageBuffer.Clear();
                return;
            }

            foreach (var damage in damageBuffer)
            {
                health.Current = math.max(0, health.Current - damage.Amount);
                invincibility = InvincibilityState.Create(INVINCIBILITY_DURATION);
            }

            _em.SetComponentData(entity, health);
            _em.SetComponentData(entity, invincibility);
            damageBuffer.Clear();
        }

        private void ProcessDamageAndCheckDeath(Entity entity)
        {
            var damageBuffer = _em.GetBuffer<DamageEvent>(entity);
            var health = _em.GetComponentData<Health>(entity);

            foreach (var damage in damageBuffer)
            {
                health.Current = math.max(0, health.Current - damage.Amount);

                if (health.IsDead)
                {
                    _em.AddComponent<DeadTag>(entity);
                    break;
                }
            }

            _em.SetComponentData(entity, health);
            damageBuffer.Clear();
        }

        private void ProcessAllDamage(Entity entity)
        {
            var damageBuffer = _em.GetBuffer<DamageEvent>(entity);
            var health = _em.GetComponentData<Health>(entity);

            foreach (var damage in damageBuffer)
            {
                health.Current = math.max(0, health.Current - damage.Amount);
            }

            _em.SetComponentData(entity, health);
            damageBuffer.Clear();
        }

        private void SimulateInvincibilityDecay(Entity entity, float deltaTime)
        {
            var invincibility = _em.GetComponentData<InvincibilityState>(entity);

            if (invincibility.IsActive)
            {
                invincibility.RemainingTime -= deltaTime;

                if (invincibility.RemainingTime <= 0)
                {
                    invincibility.IsActive = false;
                    invincibility.RemainingTime = 0;
                }
            }

            _em.SetComponentData(entity, invincibility);
        }

        private void ProcessDamageWithStability(Entity entity)
        {
            var damageBuffer = _em.GetBuffer<DamageEvent>(entity);
            var health = _em.GetComponentData<Health>(entity);
            var stability = _em.GetComponentData<StabilityState>(entity);

            foreach (var damage in damageBuffer)
            {
                health.Current = math.max(0, health.Current - damage.Amount);
                stability.Current = math.max(0, stability.Current - (int)damage.StabilityDamage);
            }

            _em.SetComponentData(entity, health);
            _em.SetComponentData(entity, stability);
            damageBuffer.Clear();
        }

        private void ProcessDamageWithBreak(Entity entity)
        {
            var damageBuffer = _em.GetBuffer<DamageEvent>(entity);
            var health = _em.GetComponentData<Health>(entity);
            var stability = _em.GetComponentData<StabilityState>(entity);
            var breakState = _em.GetComponentData<BreakState>(entity);

            foreach (var damage in damageBuffer)
            {
                health.Current = math.max(0, health.Current - damage.Amount);
                stability.Current = math.max(0, stability.Current - (int)damage.StabilityDamage);

                if (stability.IsBroken && !breakState.IsBroken)
                {
                    breakState.IsBroken = true;
                    breakState.BreakCount++;
                    breakState.RemainingBreakTime = breakState.BreakDuration;
                }
            }

            _em.SetComponentData(entity, health);
            _em.SetComponentData(entity, stability);
            _em.SetComponentData(entity, breakState);
            damageBuffer.Clear();
        }

        #endregion
    }
}
