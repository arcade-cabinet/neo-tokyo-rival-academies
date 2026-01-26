using NUnit.Framework;
using Unity.Mathematics;
using Unity.Entities;
using NeoTokyo.Components.World;

namespace NeoTokyo.Tests.EditMode
{
    /// <summary>
    /// Unit tests for WaterSystem components and logic.
    /// Tests depth detection, movement modifiers, swimming mechanics.
    /// Command: Unity -batchmode -runTests -testPlatform EditMode
    /// </summary>
    [TestFixture]
    public class WaterSystemTests
    {
        #region WaterZone Tests

        [Test]
        public void WaterZone_DefaultValues()
        {
            var zone = WaterZone.Default;

            Assert.AreEqual(WaterDepth.Shallow, zone.Depth);
            Assert.AreEqual(0f, zone.CurrentStrength);
            Assert.AreEqual(float3.zero, zone.CurrentDirection);
            Assert.IsFalse(zone.IsHazardous);
            Assert.AreEqual(WaterHazardType.None, zone.HazardType);
            Assert.AreEqual(0f, zone.HazardDamageRate);
            Assert.AreEqual(0f, zone.SurfaceHeight);
        }

        [Test]
        public void WaterZone_DeepWater()
        {
            var zone = WaterZone.DeepWater(5f);

            Assert.AreEqual(WaterDepth.Deep, zone.Depth);
            Assert.AreEqual(5f, zone.SurfaceHeight);
            Assert.IsFalse(zone.IsHazardous);
        }

        [Test]
        public void WaterZone_ToxicWater()
        {
            var zone = WaterZone.ToxicWater(WaterDepth.WaistDeep, 10f);

            Assert.AreEqual(WaterDepth.WaistDeep, zone.Depth);
            Assert.IsTrue(zone.IsHazardous);
            Assert.AreEqual(WaterHazardType.Toxic, zone.HazardType);
            Assert.AreEqual(10f, zone.HazardDamageRate);
        }

        [Test]
        public void WaterZone_ElectricWater()
        {
            var zone = WaterZone.ElectricWater(WaterDepth.Deep, 25f);

            Assert.AreEqual(WaterDepth.Deep, zone.Depth);
            Assert.IsTrue(zone.IsHazardous);
            Assert.AreEqual(WaterHazardType.Electric, zone.HazardType);
            Assert.AreEqual(25f, zone.HazardDamageRate);
        }

        [Test]
        public void WaterZone_CustomHazard()
        {
            var zone = new WaterZone
            {
                Depth = WaterDepth.Shallow,
                IsHazardous = true,
                HazardType = WaterHazardType.Acidic,
                HazardDamageRate = 3f,
                CurrentStrength = 2f,
                CurrentDirection = new float3(1f, 0f, 0f)
            };

            Assert.AreEqual(WaterHazardType.Acidic, zone.HazardType);
            Assert.AreEqual(3f, zone.HazardDamageRate);
            Assert.AreEqual(2f, zone.CurrentStrength);
        }

        #endregion

        #region WaterDepth Tests

        [Test]
        public void WaterDepth_AllDepthsExist()
        {
            Assert.AreEqual((byte)0, (byte)WaterDepth.None);
            Assert.AreEqual((byte)1, (byte)WaterDepth.Shallow);
            Assert.AreEqual((byte)2, (byte)WaterDepth.WaistDeep);
            Assert.AreEqual((byte)3, (byte)WaterDepth.Deep);
            Assert.AreEqual((byte)4, (byte)WaterDepth.Submerged);
        }

        [Test]
        public void WaterDepth_ComparisonWorks()
        {
            Assert.IsTrue(WaterDepth.Deep > WaterDepth.Shallow);
            Assert.IsTrue(WaterDepth.Submerged > WaterDepth.Deep);
            Assert.IsTrue(WaterDepth.None < WaterDepth.Shallow);
        }

        #endregion

        #region MovementModifier Tests

        [Test]
        public void MovementModifier_None()
        {
            var modifier = MovementModifier.None;

            Assert.AreEqual(1f, modifier.SpeedMultiplier);
            Assert.AreEqual(1f, modifier.JumpMultiplier);
            Assert.IsTrue(modifier.CanDash);
            Assert.IsTrue(modifier.CanSprint);
            Assert.AreEqual(float3.zero, modifier.CurrentForce);
        }

        [Test]
        public void MovementModifier_Shallow()
        {
            var modifier = MovementModifier.ForWaterDepth(WaterDepth.Shallow);

            Assert.AreEqual(0.85f, modifier.SpeedMultiplier);
            Assert.AreEqual(0.9f, modifier.JumpMultiplier);
            Assert.IsTrue(modifier.CanDash);
            Assert.IsTrue(modifier.CanSprint);
        }

        [Test]
        public void MovementModifier_WaistDeep()
        {
            var modifier = MovementModifier.ForWaterDepth(WaterDepth.WaistDeep);

            Assert.AreEqual(0.5f, modifier.SpeedMultiplier);
            Assert.AreEqual(0.5f, modifier.JumpMultiplier);
            Assert.IsFalse(modifier.CanDash);
            Assert.IsFalse(modifier.CanSprint);
        }

        [Test]
        public void MovementModifier_Deep()
        {
            var modifier = MovementModifier.ForWaterDepth(WaterDepth.Deep);

            Assert.AreEqual(0.4f, modifier.SpeedMultiplier);
            Assert.AreEqual(0f, modifier.JumpMultiplier);
            Assert.IsFalse(modifier.CanDash);
            Assert.IsFalse(modifier.CanSprint);
        }

        [Test]
        public void MovementModifier_Submerged()
        {
            var modifier = MovementModifier.ForWaterDepth(WaterDepth.Submerged);

            Assert.AreEqual(0.35f, modifier.SpeedMultiplier);
            Assert.AreEqual(0f, modifier.JumpMultiplier);
            Assert.IsFalse(modifier.CanDash);
            Assert.IsFalse(modifier.CanSprint);
        }

        [Test]
        public void MovementModifier_CurrentForceApplication()
        {
            var modifier = MovementModifier.None;
            modifier.CurrentForce = new float3(5f, 0f, 0f);

            // Apply current to movement
            float3 velocity = new float3(0f, 0f, 10f);
            velocity += modifier.CurrentForce;

            Assert.AreEqual(5f, velocity.x);
            Assert.AreEqual(0f, velocity.y);
            Assert.AreEqual(10f, velocity.z);
        }

        #endregion

        #region InWater Component Tests

        [Test]
        public void InWater_Create()
        {
            var inWater = InWater.Create(WaterDepth.Deep, Entity.Null);

            Assert.AreEqual(WaterDepth.Deep, inWater.CurrentDepth);
            Assert.AreEqual(0f, inWater.SubmersionTime);
            Assert.IsTrue(inWater.IsSwimming);
            Assert.IsFalse(inWater.IsDiving);
            Assert.AreEqual(0f, inWater.AccumulatedHazardDamage);
        }

        [Test]
        public void InWater_SubmergedSetsDiving()
        {
            var inWater = InWater.Create(WaterDepth.Submerged, Entity.Null);

            Assert.IsTrue(inWater.IsDiving);
            Assert.IsTrue(inWater.IsSwimming);
        }

        [Test]
        public void InWater_ShallowNoSwimming()
        {
            var inWater = InWater.Create(WaterDepth.Shallow, Entity.Null);

            Assert.IsFalse(inWater.IsSwimming);
            Assert.IsFalse(inWater.IsDiving);
        }

        [Test]
        public void InWater_AccumulateHazardDamage()
        {
            var inWater = InWater.Create(WaterDepth.WaistDeep, Entity.Null);
            float hazardRate = 5f;
            float deltaTime = 2f;

            inWater.AccumulatedHazardDamage += hazardRate * deltaTime;

            Assert.AreEqual(10f, inWater.AccumulatedHazardDamage);
        }

        #endregion

        #region DivingState Tests

        [Test]
        public void DivingState_Default()
        {
            var diving = DivingState.Default;

            Assert.AreEqual(30f, diving.OxygenRemaining);
            Assert.AreEqual(30f, diving.MaxOxygen);
            Assert.AreEqual(1f, diving.DepthPressure);
            Assert.AreEqual(1f, diving.OxygenConsumptionRate);
            Assert.IsTrue(diving.IsHoldingBreath);
            Assert.IsFalse(diving.IsDrowning);
        }

        [Test]
        public void DivingState_WithEquipment()
        {
            var diving = DivingState.WithEquipment(120f);

            Assert.AreEqual(120f, diving.OxygenRemaining);
            Assert.AreEqual(120f, diving.MaxOxygen);
            Assert.AreEqual(0.5f, diving.OxygenConsumptionRate);
            Assert.IsFalse(diving.IsHoldingBreath);
        }

        [Test]
        public void DivingState_OxygenRatio()
        {
            var diving = DivingState.Default;
            diving.OxygenRemaining = 15f;

            Assert.AreEqual(0.5f, diving.OxygenRatio, 0.001f);
        }

        [Test]
        public void DivingState_IsLowOxygen()
        {
            var diving = DivingState.Default;

            diving.OxygenRemaining = 10f; // 33%
            Assert.IsFalse(diving.IsLowOxygen);

            diving.OxygenRemaining = 6f; // 20%
            Assert.IsTrue(diving.IsLowOxygen);
        }

        [Test]
        public void DivingState_IsOutOfOxygen()
        {
            var diving = DivingState.Default;

            diving.OxygenRemaining = 1f;
            Assert.IsFalse(diving.IsOutOfOxygen);

            diving.OxygenRemaining = 0f;
            Assert.IsTrue(diving.IsOutOfOxygen);

            diving.OxygenRemaining = -5f;
            Assert.IsTrue(diving.IsOutOfOxygen);
        }

        [Test]
        public void DivingState_OxygenConsumption()
        {
            var diving = DivingState.Default;
            float deltaTime = 5f;

            // Consume oxygen
            diving.OxygenRemaining -= diving.OxygenConsumptionRate * deltaTime;

            Assert.AreEqual(25f, diving.OxygenRemaining);
        }

        [Test]
        public void DivingState_DepthPressureEffect()
        {
            var diving = DivingState.Default;
            diving.DepthPressure = 2f; // Double pressure at depth

            float deltaTime = 5f;
            float consumption = diving.OxygenConsumptionRate * diving.DepthPressure * deltaTime;

            Assert.AreEqual(10f, consumption);
        }

        #endregion

        #region CanSwim Tests

        [Test]
        public void CanSwim_DefaultValues()
        {
            var canSwim = new CanSwim
            {
                SwimSpeed = 5f,
                OxygenBonus = 0f
            };

            Assert.AreEqual(5f, canSwim.SwimSpeed);
            Assert.AreEqual(0f, canSwim.OxygenBonus);
        }

        [Test]
        public void CanSwim_WithOxygenBonus()
        {
            var canSwim = new CanSwim
            {
                SwimSpeed = 6f,
                OxygenBonus = 15f
            };

            var diving = DivingState.Default;
            float effectiveMaxOxygen = diving.MaxOxygen + canSwim.OxygenBonus;

            Assert.AreEqual(45f, effectiveMaxOxygen);
        }

        #endregion

        #region WaterAverse Tests

        [Test]
        public void WaterAverse_MaxTolerance()
        {
            var averse = new WaterAverse
            {
                MaxTolerance = WaterDepth.Shallow,
                DamagePerSecond = 10f
            };

            // Check if depth is tolerable
            bool toleratesShallow = WaterDepth.Shallow <= averse.MaxTolerance;
            bool toleratesWaist = WaterDepth.WaistDeep <= averse.MaxTolerance;

            Assert.IsTrue(toleratesShallow);
            Assert.IsFalse(toleratesWaist);
        }

        [Test]
        public void WaterAverse_DamageCalculation()
        {
            var averse = new WaterAverse
            {
                MaxTolerance = WaterDepth.None,
                DamagePerSecond = 15f
            };

            float deltaTime = 2f;
            float damage = averse.DamagePerSecond * deltaTime;

            Assert.AreEqual(30f, damage);
        }

        #endregion

        #region WaterCombatModifier Tests

        [Test]
        public void WaterCombatModifier_DryLand()
        {
            var modifier = WaterCombatModifier.ForDepth(WaterDepth.None);

            Assert.AreEqual(1f, modifier.AttackSpeedMultiplier);
            Assert.IsFalse(modifier.FireAbilitiesDisabled);
            Assert.IsFalse(modifier.ElectricAbilitiesChain);
            Assert.AreEqual(1f, modifier.KnockbackMultiplier);
            Assert.IsTrue(modifier.CanHeavyAttack);
        }

        [Test]
        public void WaterCombatModifier_ShallowWater()
        {
            var modifier = WaterCombatModifier.ForDepth(WaterDepth.Shallow);

            Assert.AreEqual(0.95f, modifier.AttackSpeedMultiplier);
            Assert.IsFalse(modifier.FireAbilitiesDisabled);
            Assert.IsTrue(modifier.ElectricAbilitiesChain); // Water conducts electricity
            Assert.AreEqual(1.1f, modifier.KnockbackMultiplier);
            Assert.IsTrue(modifier.CanHeavyAttack);
        }

        [Test]
        public void WaterCombatModifier_WaistDeep()
        {
            var modifier = WaterCombatModifier.ForDepth(WaterDepth.WaistDeep);

            Assert.AreEqual(0.7f, modifier.AttackSpeedMultiplier);
            Assert.IsTrue(modifier.FireAbilitiesDisabled); // Fire can't work
            Assert.IsTrue(modifier.ElectricAbilitiesChain);
            Assert.AreEqual(1.5f, modifier.KnockbackMultiplier);
            Assert.IsFalse(modifier.CanHeavyAttack);
        }

        [Test]
        public void WaterCombatModifier_DeepWater()
        {
            var modifier = WaterCombatModifier.ForDepth(WaterDepth.Deep);

            Assert.AreEqual(0.5f, modifier.AttackSpeedMultiplier);
            Assert.IsTrue(modifier.FireAbilitiesDisabled);
            Assert.IsTrue(modifier.ElectricAbilitiesChain);
            Assert.AreEqual(2f, modifier.KnockbackMultiplier);
            Assert.IsFalse(modifier.CanHeavyAttack);
        }

        #endregion

        #region BoatData Tests

        [Test]
        public void BoatData_Ferry()
        {
            var ferry = BoatData.Ferry(8, 4f);

            Assert.AreEqual(8, ferry.Capacity);
            Assert.AreEqual(0, ferry.CurrentPassengers);
            Assert.AreEqual(4f, ferry.Speed);
            Assert.IsTrue(ferry.IsFerry);
            Assert.IsTrue(ferry.CanBoard);
            Assert.IsTrue(ferry.HasCapacity);
        }

        [Test]
        public void BoatData_PlayerBoat()
        {
            var playerBoat = BoatData.PlayerBoat(10f);

            Assert.AreEqual(4, playerBoat.Capacity);
            Assert.AreEqual(1, playerBoat.CurrentPassengers); // Player is aboard
            Assert.AreEqual(10f, playerBoat.Speed);
            Assert.IsFalse(playerBoat.IsFerry);
            Assert.IsFalse(playerBoat.CanBoard);
        }

        [Test]
        public void BoatData_HasCapacity()
        {
            var boat = BoatData.Ferry(4);

            Assert.IsTrue(boat.HasCapacity);

            boat.CurrentPassengers = 4;
            Assert.IsFalse(boat.HasCapacity);
        }

        #endregion

        #region DockData Tests

        [Test]
        public void DockData_Properties()
        {
            var dock = new DockData
            {
                DockId = new Unity.Collections.FixedString64Bytes("dock_market_01"),
                LocationName = new Unity.Collections.FixedString64Bytes("Market Dock"),
                BoardingPosition = new float3(10f, 0f, 20f),
                DisembarkPosition = new float3(15f, 0f, 20f),
                HasBoatDocked = false,
                DockedBoat = Entity.Null
            };

            Assert.AreEqual("dock_market_01", dock.DockId.ToString());
            Assert.AreEqual("Market Dock", dock.LocationName.ToString());
            Assert.IsFalse(dock.HasBoatDocked);
        }

        #endregion

        #region Depth Detection Logic Tests

        [Test]
        public void DepthDetection_FromHeight()
        {
            float surfaceHeight = 5f;
            float entityHeight = 1.8f; // Player height

            // Entity at water level
            float entityY = 5f;
            var depth = CalculateDepthFromPosition(entityY, surfaceHeight, entityHeight);
            Assert.AreEqual(WaterDepth.Shallow, depth);

            // Entity waist-deep
            entityY = 4f;
            depth = CalculateDepthFromPosition(entityY, surfaceHeight, entityHeight);
            Assert.AreEqual(WaterDepth.WaistDeep, depth);

            // Entity swimming
            entityY = 2f;
            depth = CalculateDepthFromPosition(entityY, surfaceHeight, entityHeight);
            Assert.AreEqual(WaterDepth.Deep, depth);

            // Entity submerged
            entityY = 0f;
            depth = CalculateDepthFromPosition(entityY, surfaceHeight, entityHeight);
            Assert.AreEqual(WaterDepth.Submerged, depth);
        }

        [Test]
        public void DepthDetection_AboveWater()
        {
            float surfaceHeight = 5f;
            float entityHeight = 1.8f;
            float entityY = 10f;

            var depth = CalculateDepthFromPosition(entityY, surfaceHeight, entityHeight);
            Assert.AreEqual(WaterDepth.None, depth);
        }

        #endregion

        #region Current Effect Tests

        [Test]
        public void Current_ForceApplication()
        {
            var zone = new WaterZone
            {
                CurrentStrength = 3f,
                CurrentDirection = math.normalize(new float3(1f, 0f, 1f))
            };

            // Calculate force vector
            float3 currentForce = zone.CurrentDirection * zone.CurrentStrength;

            Assert.Greater(currentForce.x, 0f);
            Assert.AreEqual(0f, currentForce.y);
            Assert.Greater(currentForce.z, 0f);
            Assert.AreEqual(3f, math.length(currentForce), 0.01f);
        }

        [Test]
        public void Current_ZeroStrength()
        {
            var zone = new WaterZone
            {
                CurrentStrength = 0f,
                CurrentDirection = new float3(1f, 0f, 0f)
            };

            float3 currentForce = zone.CurrentDirection * zone.CurrentStrength;

            Assert.AreEqual(float3.zero, currentForce);
        }

        #endregion

        #region Helper Methods

        private static WaterDepth CalculateDepthFromPosition(float entityY, float surfaceHeight, float entityHeight)
        {
            float submersion = surfaceHeight - entityY;

            if (submersion <= 0) return WaterDepth.None;
            if (submersion < entityHeight * 0.3f) return WaterDepth.Shallow;
            if (submersion < entityHeight * 0.6f) return WaterDepth.WaistDeep;
            if (submersion < entityHeight) return WaterDepth.Deep;
            return WaterDepth.Submerged;
        }

        #endregion
    }
}
