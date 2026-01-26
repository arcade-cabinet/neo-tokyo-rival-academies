using NUnit.Framework;
using Unity.Collections;
using Unity.Entities;
using Unity.Mathematics;
using NeoTokyo.Components.Combat;
using NeoTokyo.Components.Stats;
using NeoTokyo.Systems.Combat;

namespace NeoTokyo.Tests.EditMode
{
    /// <summary>
    /// Unit tests for CombatSystem, BreakSystem, and HitDetection.
    /// Tests damage calculations, break mechanics, and AABB hit detection math.
    /// Command: Unity -batchmode -runTests -testPlatform EditMode
    /// </summary>
    [TestFixture]
    public class CombatSystemTests
    {
        #region Health Component Tests

        [Test]
        public void Health_IsDead_ReturnsTrueWhenZero()
        {
            var health = new Health
            {
                Current = 0,
                Max = 100
            };

            Assert.IsTrue(health.IsDead);
        }

        [Test]
        public void Health_IsDead_ReturnsFalseWhenPositive()
        {
            var health = new Health
            {
                Current = 1,
                Max = 100
            };

            Assert.IsFalse(health.IsDead);
        }

        [Test]
        public void Health_Ratio_CalculatesCorrectly()
        {
            var health = new Health
            {
                Current = 50,
                Max = 100
            };

            Assert.AreEqual(0.5f, health.Ratio);
        }

        [Test]
        public void Health_Ratio_ReturnsZeroWhenMaxIsZero()
        {
            var health = new Health
            {
                Current = 50,
                Max = 0
            };

            Assert.AreEqual(0f, health.Ratio);
        }

        [Test]
        public void Health_Ratio_ReturnsOneWhenFull()
        {
            var health = new Health
            {
                Current = 100,
                Max = 100
            };

            Assert.AreEqual(1f, health.Ratio);
        }

        #endregion

        #region InvincibilityState Tests

        [Test]
        public void InvincibilityState_Create_SetsCorrectValues()
        {
            var invincibility = InvincibilityState.Create(0.5f);

            Assert.IsTrue(invincibility.IsActive);
            Assert.AreEqual(0.5f, invincibility.RemainingTime);
            Assert.AreEqual(0.5f, invincibility.Duration);
        }

        [Test]
        public void Invincibility_CheckInvincible_ReturnsTrueWithinDuration()
        {
            var invincibility = Invincibility.Apply(1.0f, 5.0f);

            Assert.IsTrue(invincibility.CheckInvincible(5.5f));
        }

        [Test]
        public void Invincibility_CheckInvincible_ReturnsFalseAfterDuration()
        {
            var invincibility = Invincibility.Apply(1.0f, 5.0f);

            Assert.IsFalse(invincibility.CheckInvincible(6.5f));
        }

        [Test]
        public void Invincibility_CheckInvincible_ReturnsFalseAtExactEnd()
        {
            var invincibility = Invincibility.Apply(1.0f, 5.0f);

            Assert.IsFalse(invincibility.CheckInvincible(6.0f));
        }

        [Test]
        public void Invincibility_CheckInvincible_ReturnsTrueJustBeforeEnd()
        {
            var invincibility = Invincibility.Apply(1.0f, 5.0f);

            Assert.IsTrue(invincibility.CheckInvincible(5.999f));
        }

        #endregion

        #region StabilityState Tests

        [Test]
        public void StabilityState_Default_HasCorrectValues()
        {
            var stability = StabilityState.Default;

            Assert.AreEqual(100, stability.Current);
            Assert.AreEqual(100, stability.Max);
            Assert.AreEqual(10f, stability.RecoveryRate);
        }

        [Test]
        public void StabilityState_IsBroken_ReturnsTrueWhenZero()
        {
            var stability = new StabilityState
            {
                Current = 0,
                Max = 100,
                RecoveryRate = 10f
            };

            Assert.IsTrue(stability.IsBroken);
        }

        [Test]
        public void StabilityState_IsBroken_ReturnsFalseWhenPositive()
        {
            var stability = new StabilityState
            {
                Current = 1,
                Max = 100,
                RecoveryRate = 10f
            };

            Assert.IsFalse(stability.IsBroken);
        }

        [Test]
        public void StabilityState_Ratio_CalculatesCorrectly()
        {
            var stability = new StabilityState
            {
                Current = 25,
                Max = 100,
                RecoveryRate = 10f
            };

            Assert.AreEqual(0.25f, stability.Ratio);
        }

        [Test]
        public void StabilityState_Ratio_ReturnsOneWhenMaxIsZero()
        {
            var stability = new StabilityState
            {
                Current = 0,
                Max = 0,
                RecoveryRate = 10f
            };

            // When Max is zero, we return 1 (safe default)
            Assert.AreEqual(1f, stability.Ratio);
        }

        #endregion

        #region BreakState Tests

        [Test]
        public void BreakState_Default_HasCorrectValues()
        {
            var breakState = BreakState.Default;

            Assert.IsFalse(breakState.IsBroken);
            Assert.AreEqual(2f, breakState.BreakDuration);
            Assert.AreEqual(0f, breakState.RemainingBreakTime);
            Assert.AreEqual(0, breakState.BreakCount);
        }

        [Test]
        public void BreakState_CanTrackMultipleBreaks()
        {
            var breakState = BreakState.Default;
            breakState.BreakCount = 3;

            Assert.AreEqual(3, breakState.BreakCount);
        }

        [Test]
        public void BreakState_RemainingTime_TracksCorrectly()
        {
            var breakState = new BreakState
            {
                IsBroken = true,
                BreakDuration = 2f,
                RemainingBreakTime = 1.5f,
                BreakCount = 1
            };

            Assert.AreEqual(1.5f, breakState.RemainingBreakTime);
        }

        #endregion

        #region CharacterState Tests

        [Test]
        public void CharacterState_HasCorrectEnumValues()
        {
            Assert.AreEqual((byte)0, (byte)CharacterState.Idle);
            Assert.AreEqual((byte)5, (byte)CharacterState.Attacking);
            Assert.AreEqual((byte)8, (byte)CharacterState.Stunned);
            Assert.AreEqual((byte)9, (byte)CharacterState.Dead);
        }

        [Test]
        public void CharacterStateComponent_Default_IsIdle()
        {
            var state = CharacterStateComponent.Default;

            Assert.AreEqual(CharacterState.Idle, state.Current);
            Assert.AreEqual(CharacterState.Idle, state.Previous);
            Assert.AreEqual(0f, state.StateTime);
        }

        [Test]
        public void CharacterStateComponent_TracksStateTransition()
        {
            var state = CharacterStateComponent.Default;
            state.Previous = state.Current;
            state.Current = CharacterState.Attacking;
            state.StateTime = 0f;

            Assert.AreEqual(CharacterState.Attacking, state.Current);
            Assert.AreEqual(CharacterState.Idle, state.Previous);
        }

        #endregion

        #region CombatStats Tests

        [Test]
        public void CombatStats_FromRPGStats_CalculatesMeleeCorrectly()
        {
            // Ignition 30 -> 10 + 30 * 0.5 = 25
            var stats = CombatStats.FromRPGStats(10, 30, 10);

            Assert.AreEqual(25f, stats.MeleeAttackPower);
        }

        [Test]
        public void CombatStats_FromRPGStats_CalculatesRangedCorrectly()
        {
            // Logic 40 -> 10 + 40 * 0.5 = 30
            var stats = CombatStats.FromRPGStats(10, 10, 40);

            Assert.AreEqual(30f, stats.RangedAttackPower);
        }

        [Test]
        public void CombatStats_FromRPGStats_CalculatesDefenseCorrectly()
        {
            // Structure 50 -> 50 / 10 = 5
            var stats = CombatStats.FromRPGStats(50, 10, 10);

            Assert.AreEqual(5f, stats.Defense);
        }

        [Test]
        public void CombatStats_CritChance_CapsAtFiftyPercent()
        {
            // Ignition 100 -> 100 * 0.01 = 1.0, capped to 0.5
            var stats = CombatStats.FromRPGStats(10, 100, 10);

            Assert.AreEqual(0.5f, stats.CriticalChance);
        }

        [Test]
        public void CombatStats_CritChance_CalculatesUnderCap()
        {
            // Ignition 20 -> 20 * 0.01 = 0.2
            var stats = CombatStats.FromRPGStats(10, 20, 10);

            Assert.AreEqual(0.2f, stats.CriticalChance);
        }

        [Test]
        public void CombatStats_Default_UsesBaseStats()
        {
            var stats = CombatStats.Default;

            // Base 10 stats: 10 + 10 * 0.5 = 15
            Assert.AreEqual(15f, stats.MeleeAttackPower);
            Assert.AreEqual(15f, stats.RangedAttackPower);
            Assert.AreEqual(1.0f, stats.Defense);
            Assert.AreEqual(0.1f, stats.CriticalChance);
            Assert.AreEqual(1.5f, stats.CriticalMultiplier);
        }

        #endregion

        #region Hitbox Tests

        [Test]
        public void Hitbox_Activation_TracksCorrectly()
        {
            var hitbox = new Hitbox
            {
                Offset = new float3(0, 1, 0),
                Size = new float3(2, 2, 2),
                Duration = 0.3f,
                RemainingTime = 0.3f,
                IsActive = true
            };

            Assert.IsTrue(hitbox.IsActive);
            Assert.AreEqual(0.3f, hitbox.RemainingTime);
        }

        [Test]
        public void Hitbox_Deactivation_WhenTimeExpires()
        {
            var hitbox = new Hitbox
            {
                Offset = new float3(0, 1, 0),
                Size = new float3(2, 2, 2),
                Duration = 0.3f,
                RemainingTime = 0f,
                IsActive = false
            };

            Assert.IsFalse(hitbox.IsActive);
        }

        #endregion

        #region AABB Hit Detection Math Tests

        [Test]
        public void AABBIntersection_Overlapping_ReturnsTrue()
        {
            // Two overlapping boxes centered at origin
            float3 boxA_pos = new float3(0, 0, 0);
            float3 boxA_size = new float3(2, 2, 2);
            float3 boxB_pos = new float3(1, 0, 0);
            float3 boxB_size = new float3(2, 2, 2);

            bool result = CheckAABBIntersection(boxA_pos, boxA_size, boxB_pos, boxB_size);

            Assert.IsTrue(result);
        }

        [Test]
        public void AABBIntersection_NonOverlapping_ReturnsFalse()
        {
            float3 boxA_pos = new float3(0, 0, 0);
            float3 boxA_size = new float3(2, 2, 2);
            float3 boxB_pos = new float3(5, 0, 0);
            float3 boxB_size = new float3(2, 2, 2);

            bool result = CheckAABBIntersection(boxA_pos, boxA_size, boxB_pos, boxB_size);

            Assert.IsFalse(result);
        }

        [Test]
        public void AABBIntersection_JustTouching_ReturnsTrue()
        {
            float3 boxA_pos = new float3(0, 0, 0);
            float3 boxA_size = new float3(2, 2, 2);
            float3 boxB_pos = new float3(2, 0, 0);
            float3 boxB_size = new float3(2, 2, 2);

            bool result = CheckAABBIntersection(boxA_pos, boxA_size, boxB_pos, boxB_size);

            Assert.IsTrue(result);
        }

        [Test]
        public void AABBIntersection_JustSeparated_ReturnsFalse()
        {
            float3 boxA_pos = new float3(0, 0, 0);
            float3 boxA_size = new float3(2, 2, 2);
            float3 boxB_pos = new float3(2.001f, 0, 0);
            float3 boxB_size = new float3(2, 2, 2);

            bool result = CheckAABBIntersection(boxA_pos, boxA_size, boxB_pos, boxB_size);

            Assert.IsFalse(result);
        }

        [Test]
        public void AABBIntersection_ContainedBox_ReturnsTrue()
        {
            float3 boxA_pos = new float3(0, 0, 0);
            float3 boxA_size = new float3(4, 4, 4);
            float3 boxB_pos = new float3(0.5f, 0.5f, 0.5f);
            float3 boxB_size = new float3(1, 1, 1);

            bool result = CheckAABBIntersection(boxA_pos, boxA_size, boxB_pos, boxB_size);

            Assert.IsTrue(result);
        }

        [Test]
        public void AABBIntersection_OnlyYOverlap_ReturnsFalse()
        {
            // Boxes only overlap on Y axis, not X or Z
            float3 boxA_pos = new float3(0, 0, 0);
            float3 boxA_size = new float3(2, 2, 2);
            float3 boxB_pos = new float3(5, 0, 5);
            float3 boxB_size = new float3(2, 2, 2);

            bool result = CheckAABBIntersection(boxA_pos, boxA_size, boxB_pos, boxB_size);

            Assert.IsFalse(result);
        }

        [Test]
        public void AABBIntersection_AllAxesOverlap_ReturnsTrue()
        {
            // Partial overlap on all axes
            float3 boxA_pos = new float3(0, 0, 0);
            float3 boxA_size = new float3(2, 2, 2);
            float3 boxB_pos = new float3(0.5f, 0.5f, 0.5f);
            float3 boxB_size = new float3(2, 2, 2);

            bool result = CheckAABBIntersection(boxA_pos, boxA_size, boxB_pos, boxB_size);

            Assert.IsTrue(result);
        }

        /// <summary>
        /// AABB intersection test matching HitDetectionSystem logic
        /// </summary>
        private static bool CheckAABBIntersection(float3 posA, float3 sizeA, float3 posB, float3 sizeB)
        {
            float3 minA = posA - sizeA * 0.5f;
            float3 maxA = posA + sizeA * 0.5f;
            float3 minB = posB - sizeB * 0.5f;
            float3 maxB = posB + sizeB * 0.5f;

            return minA.x <= maxB.x && maxA.x >= minB.x &&
                   minA.y <= maxB.y && maxA.y >= minB.y &&
                   minA.z <= maxB.z && maxA.z >= minB.z;
        }

        #endregion

        #region Damage Calculation Tests

        [Test]
        public void DamageCalculation_BasicDamage_SubtractsFromHealth()
        {
            int health = 100;
            int damage = 25;

            int result = math.max(0, health - damage);

            Assert.AreEqual(75, result);
        }

        [Test]
        public void DamageCalculation_OverkillDamage_ClampsToZero()
        {
            int health = 50;
            int damage = 100;

            int result = math.max(0, health - damage);

            Assert.AreEqual(0, result);
        }

        [Test]
        public void DamageCalculation_WithDefense_ReducesDamage()
        {
            int baseDamage = 50;
            float defense = 5f;

            // Simple defense formula: damage - defense, min 1
            int result = math.max(1, (int)(baseDamage - defense));

            Assert.AreEqual(45, result);
        }

        [Test]
        public void DamageCalculation_HighDefense_GuaranteesMinDamage()
        {
            int baseDamage = 10;
            float defense = 50f;

            int result = math.max(1, (int)(baseDamage - defense));

            Assert.AreEqual(1, result);
        }

        [Test]
        public void CriticalDamage_AppliesMultiplier()
        {
            int baseDamage = 100;
            float critMultiplier = 1.5f;

            int critDamage = (int)(baseDamage * critMultiplier);

            Assert.AreEqual(150, critDamage);
        }

        #endregion

        #region DamageEvent Tests

        [Test]
        public void DamageEvent_CanStoreData()
        {
            var evt = new DamageEvent
            {
                Source = Entity.Null,
                Amount = 50,
                IsCritical = true,
                StabilityDamage = 25f
            };

            Assert.AreEqual(50, evt.Amount);
            Assert.IsTrue(evt.IsCritical);
            Assert.AreEqual(25f, evt.StabilityDamage);
        }

        [Test]
        public void DamageEvent_DefaultValues()
        {
            var evt = new DamageEvent();

            Assert.AreEqual(0, evt.Amount);
            Assert.IsFalse(evt.IsCritical);
            Assert.AreEqual(0f, evt.StabilityDamage);
        }

        #endregion

        #region AttackType Tests

        [Test]
        public void AttackType_HasCorrectEnumValues()
        {
            Assert.AreEqual((byte)0, (byte)AttackType.Melee);
            Assert.AreEqual((byte)1, (byte)AttackType.Ranged);
            Assert.AreEqual((byte)2, (byte)AttackType.Tech);
        }

        [Test]
        public void AttackType_Melee_UsesIgnition()
        {
            var stats = CombatStats.FromRPGStats(10, 50, 10);
            float meleePower = stats.MeleeAttackPower;

            // Ignition 50 -> 10 + 50 * 0.5 = 35
            Assert.AreEqual(35f, meleePower);
        }

        [Test]
        public void AttackType_Ranged_UsesLogic()
        {
            var stats = CombatStats.FromRPGStats(10, 10, 50);
            float rangedPower = stats.RangedAttackPower;

            // Logic 50 -> 10 + 50 * 0.5 = 35
            Assert.AreEqual(35f, rangedPower);
        }

        #endregion
    }
}
