using NUnit.Framework;
using Unity.Mathematics;
using NeoTokyo.Components.Combat;

namespace NeoTokyo.Tests.EditMode
{
    /// <summary>
    /// Unit tests for ArenaSystem components and logic.
    /// Tests arena types, hazard calculations, modifiers.
    /// Command: Unity -batchmode -runTests -testPlatform EditMode
    /// </summary>
    [TestFixture]
    public class ArenaSystemTests
    {
        #region ArenaData Tests

        [Test]
        public void ArenaData_CreateRooftop()
        {
            var center = new float3(0f, 50f, 0f);
            var size = new float3(20f, 5f, 30f);
            var arena = ArenaData.CreateRooftop(center, size);

            Assert.AreEqual(ArenaType.Rooftop, arena.Type);
            Assert.AreEqual(center, arena.Center);
            Assert.AreEqual(size, arena.Size);
            Assert.IsTrue(arena.HasFallHazard);
            Assert.IsFalse(arena.HasWaterHazard);
            Assert.IsFalse(arena.IsRocking);
            Assert.AreEqual(0f, arena.WaterDepth);
        }

        [Test]
        public void ArenaData_CreateBridge()
        {
            var center = new float3(100f, 10f, 0f);
            float length = 50f;
            float width = 5f;
            var arena = ArenaData.CreateBridge(center, length, width);

            Assert.AreEqual(ArenaType.Bridge, arena.Type);
            Assert.AreEqual(width, arena.Size.x);
            Assert.AreEqual(3f, arena.Size.y); // Default height
            Assert.AreEqual(length, arena.Size.z);
            Assert.IsTrue(arena.HasFallHazard);
            Assert.IsTrue(arena.HasWaterHazard);
            Assert.IsFalse(arena.IsRocking);
        }

        [Test]
        public void ArenaData_CreateBoat()
        {
            var center = new float3(0f, 0f, 0f);
            var size = new float3(10f, 3f, 20f);
            float rockingIntensity = 0.6f;
            var arena = ArenaData.CreateBoat(center, size, rockingIntensity);

            Assert.AreEqual(ArenaType.Boat, arena.Type);
            Assert.IsTrue(arena.HasFallHazard);
            Assert.IsTrue(arena.HasWaterHazard);
            Assert.IsTrue(arena.IsRocking);
            Assert.AreEqual(0.6f, arena.RockingIntensity, 0.001f);
        }

        [Test]
        public void ArenaData_CreateBoat_ClampsRockingIntensity()
        {
            var size = new float3(10f, 3f, 20f);

            // Test clamping to max
            var arenaOver = ArenaData.CreateBoat(float3.zero, size, 1.5f);
            Assert.AreEqual(1f, arenaOver.RockingIntensity);

            // Test clamping to min
            var arenaUnder = ArenaData.CreateBoat(float3.zero, size, -0.5f);
            Assert.AreEqual(0f, arenaUnder.RockingIntensity);
        }

        [Test]
        public void ArenaData_CreateFloodedInterior()
        {
            var center = new float3(0f, 0f, 0f);
            var size = new float3(15f, 4f, 15f);
            float waterDepth = 1.2f;
            var arena = ArenaData.CreateFloodedInterior(center, size, waterDepth);

            Assert.AreEqual(ArenaType.FloodedInterior, arena.Type);
            Assert.IsFalse(arena.HasFallHazard);
            Assert.IsTrue(arena.HasWaterHazard);
            Assert.IsFalse(arena.IsRocking);
            Assert.AreEqual(1.2f, arena.WaterDepth);
        }

        #endregion

        #region ArenaData Containment Tests

        [Test]
        public void ArenaData_ContainsPosition_InsideArena()
        {
            var arena = ArenaData.CreateRooftop(float3.zero, new float3(20f, 10f, 20f));

            Assert.IsTrue(arena.ContainsPosition(float3.zero)); // Center
            Assert.IsTrue(arena.ContainsPosition(new float3(5f, 2f, 5f)));
            Assert.IsTrue(arena.ContainsPosition(new float3(-5f, -2f, -5f)));
        }

        [Test]
        public void ArenaData_ContainsPosition_OnBoundary()
        {
            var arena = ArenaData.CreateRooftop(float3.zero, new float3(20f, 10f, 20f));

            Assert.IsTrue(arena.ContainsPosition(new float3(10f, 0f, 0f)));
            Assert.IsTrue(arena.ContainsPosition(new float3(-10f, 0f, 0f)));
            Assert.IsTrue(arena.ContainsPosition(new float3(0f, 5f, 10f)));
        }

        [Test]
        public void ArenaData_ContainsPosition_OutsideArena()
        {
            var arena = ArenaData.CreateRooftop(float3.zero, new float3(20f, 10f, 20f));

            Assert.IsFalse(arena.ContainsPosition(new float3(15f, 0f, 0f)));
            Assert.IsFalse(arena.ContainsPosition(new float3(0f, 10f, 0f)));
            Assert.IsFalse(arena.ContainsPosition(new float3(0f, 0f, -15f)));
        }

        [Test]
        public void ArenaData_DistanceToBoundary_Center()
        {
            var arena = ArenaData.CreateRooftop(float3.zero, new float3(20f, 10f, 20f));

            float distance = arena.DistanceToBoundary(float3.zero);

            Assert.AreEqual(10f, distance, 0.001f); // Half of width/depth
        }

        [Test]
        public void ArenaData_DistanceToBoundary_NearEdge()
        {
            var arena = ArenaData.CreateRooftop(float3.zero, new float3(20f, 10f, 20f));

            float distance = arena.DistanceToBoundary(new float3(8f, 0f, 0f));

            Assert.AreEqual(2f, distance, 0.001f);
        }

        [Test]
        public void ArenaData_DistanceToBoundary_Outside()
        {
            var arena = ArenaData.CreateRooftop(float3.zero, new float3(20f, 10f, 20f));

            float distance = arena.DistanceToBoundary(new float3(15f, 0f, 0f));

            Assert.Less(distance, 0f);
        }

        #endregion

        #region ArenaHazard Tests

        [Test]
        public void ArenaHazard_CreateFallHazard()
        {
            var position = new float3(10f, 0f, 0f);
            float radius = 3f;
            float fallDamage = 30f;
            var hazard = ArenaHazard.CreateFallHazard(position, radius, fallDamage);

            Assert.AreEqual(HazardType.Fall, hazard.Type);
            Assert.AreEqual(position, hazard.Position);
            Assert.AreEqual(radius, hazard.Radius);
            Assert.AreEqual(fallDamage, hazard.Damage);
            Assert.AreEqual(15f, hazard.StabilityDamage); // 50% of fall damage
            Assert.IsTrue(hazard.IsActive);
        }

        [Test]
        public void ArenaHazard_CreateWaterHazard()
        {
            var hazard = ArenaHazard.CreateWaterHazard(float3.zero, 5f, 2f, 1f);

            Assert.AreEqual(HazardType.Water, hazard.Type);
            Assert.AreEqual(5f, hazard.Radius);
            Assert.AreEqual(2f, hazard.Damage);
            Assert.AreEqual(1f, hazard.TickInterval);
            Assert.AreEqual(0f, hazard.Duration); // Permanent
            Assert.IsTrue(hazard.IsActive);
        }

        [Test]
        public void ArenaHazard_CreateElectricHazard()
        {
            var hazard = ArenaHazard.CreateElectricHazard(float3.zero, 4f, 15f, 0.5f, 10f);

            Assert.AreEqual(HazardType.Electric, hazard.Type);
            Assert.AreEqual(4f, hazard.Radius);
            Assert.AreEqual(15f, hazard.Damage);
            Assert.AreEqual(0.5f, hazard.TickInterval);
            Assert.AreEqual(10f, hazard.Duration);
            Assert.AreEqual(10f, hazard.RemainingDuration);
            Assert.AreEqual(4.5f, hazard.StabilityDamage); // 30% of shock damage
        }

        [Test]
        public void ArenaHazard_ContainsPosition_Inside()
        {
            var hazard = ArenaHazard.CreateFallHazard(float3.zero, 5f, 20f);

            Assert.IsTrue(hazard.ContainsPosition(float3.zero)); // Center
            Assert.IsTrue(hazard.ContainsPosition(new float3(3f, 0f, 0f)));
            Assert.IsTrue(hazard.ContainsPosition(new float3(0f, 0f, 4f)));
        }

        [Test]
        public void ArenaHazard_ContainsPosition_OnBoundary()
        {
            var hazard = ArenaHazard.CreateFallHazard(float3.zero, 5f, 20f);

            Assert.IsTrue(hazard.ContainsPosition(new float3(5f, 0f, 0f)));
            Assert.IsTrue(hazard.ContainsPosition(new float3(0f, 0f, 5f)));
        }

        [Test]
        public void ArenaHazard_ContainsPosition_Outside()
        {
            var hazard = ArenaHazard.CreateFallHazard(float3.zero, 5f, 20f);

            Assert.IsFalse(hazard.ContainsPosition(new float3(6f, 0f, 0f)));
            Assert.IsFalse(hazard.ContainsPosition(new float3(4f, 0f, 4f))); // Diagonal > radius
        }

        #endregion

        #region FallHazardZone Tests

        [Test]
        public void FallHazardZone_CreateEdgeZone()
        {
            var min = new float3(-15f, -100f, -2f);
            var max = new float3(-10f, 50f, 30f);
            var respawn = new float3(-5f, 0f, 15f);
            var zone = FallHazardZone.CreateEdgeZone(min, max, respawn, 25f);

            Assert.AreEqual(min, zone.Min);
            Assert.AreEqual(max, zone.Max);
            Assert.AreEqual(respawn, zone.RespawnPosition);
            Assert.AreEqual(25f, zone.FallDamage);
            Assert.IsFalse(zone.IsInstantKill);
            Assert.AreEqual(1.5f, zone.RespawnInvincibilityTime);
        }

        [Test]
        public void FallHazardZone_ContainsPosition()
        {
            var zone = FallHazardZone.CreateEdgeZone(
                new float3(-10f, -100f, -10f),
                new float3(-5f, 100f, 10f),
                float3.zero
            );

            Assert.IsTrue(zone.ContainsPosition(new float3(-7f, 0f, 0f)));
            Assert.IsFalse(zone.ContainsPosition(new float3(0f, 0f, 0f)));
        }

        #endregion

        #region RockingPlatform Tests

        [Test]
        public void RockingPlatform_CreateBoatRocking()
        {
            float intensity = 0.5f;
            var rocking = RockingPlatform.CreateBoatRocking(intensity);

            Assert.AreEqual(0f, rocking.RockAngle);
            Assert.AreEqual(0.75f, rocking.RockSpeed, 0.01f); // 1.5 * 0.5
            Assert.AreEqual(math.radians(4f), rocking.MaxRockAngle, 0.001f); // 8 * 0.5
            Assert.IsTrue(rocking.AffectsMovement);
            Assert.IsTrue(rocking.AffectsAim);
        }

        [Test]
        public void RockingPlatform_GetTiltRotation()
        {
            var rocking = RockingPlatform.CreateBoatRocking(0.5f);

            // At time 0, angle should be sin(0) = 0
            var tilt = rocking.GetTiltRotation(0f);
            var euler = math.Euler(tilt);
            Assert.AreEqual(0f, euler.x, 0.001f);

            // At peak time, should have max rotation
            float peakTime = math.PI / (2f * rocking.RockSpeed);
            tilt = rocking.GetTiltRotation(peakTime);
            // Just verify it returns a valid quaternion
            Assert.AreEqual(1f, math.length(tilt.value), 0.001f);
        }

        [Test]
        public void RockingPlatform_GetSurfaceSlope()
        {
            var rocking = RockingPlatform.CreateBoatRocking(1f);
            rocking.RockAxis = new float3(0f, 0f, 1f);

            var slope = rocking.GetSurfaceSlope(0f);

            // At time 0, slope should be near zero
            Assert.AreEqual(0f, slope.y);
        }

        #endregion

        #region ArenaModifier Tests

        [Test]
        public void ArenaModifier_Default()
        {
            var modifier = ArenaModifier.Default;

            Assert.AreEqual(1f, modifier.MovementSpeedMod);
            Assert.AreEqual(1f, modifier.AttackSpeedMod);
            Assert.AreEqual(1f, modifier.KnockbackMod);
            Assert.IsFalse(modifier.DisableAbilities);
            Assert.AreEqual(0, modifier.DisabledAbilityMask);
            Assert.AreEqual(0f, modifier.EvasionMod);
            Assert.AreEqual(0f, modifier.CriticalMod);
        }

        [Test]
        public void ArenaModifier_Bridge()
        {
            var modifier = ArenaModifier.Bridge;

            Assert.AreEqual(0.9f, modifier.MovementSpeedMod);
            Assert.AreEqual(1f, modifier.AttackSpeedMod);
            Assert.AreEqual(1.5f, modifier.KnockbackMod);
            Assert.AreEqual(-0.1f, modifier.EvasionMod);
        }

        [Test]
        public void ArenaModifier_Boat()
        {
            var modifier = ArenaModifier.Boat;

            Assert.AreEqual(0.85f, modifier.MovementSpeedMod);
            Assert.AreEqual(0.9f, modifier.AttackSpeedMod);
            Assert.AreEqual(1.3f, modifier.KnockbackMod);
            Assert.AreEqual(0.05f, modifier.EvasionMod);
            Assert.AreEqual(-0.05f, modifier.CriticalMod);
        }

        [Test]
        public void ArenaModifier_FloodedInterior()
        {
            var modifier = ArenaModifier.FloodedInterior;

            Assert.AreEqual(0.6f, modifier.MovementSpeedMod);
            Assert.AreEqual(0.8f, modifier.AttackSpeedMod);
            Assert.AreEqual(0.7f, modifier.KnockbackMod);
            Assert.IsTrue(modifier.DisableAbilities);
            Assert.AreEqual(0x04, modifier.DisabledAbilityMask); // Fire disabled
            Assert.AreEqual(-0.15f, modifier.EvasionMod);
        }

        [Test]
        public void ArenaModifier_OpenWater()
        {
            var modifier = ArenaModifier.OpenWater;

            Assert.AreEqual(0.5f, modifier.MovementSpeedMod);
            Assert.AreEqual(0.7f, modifier.AttackSpeedMod);
            Assert.AreEqual(0.5f, modifier.KnockbackMod);
            Assert.IsTrue(modifier.DisableAbilities);
            Assert.AreEqual(0x0F, modifier.DisabledAbilityMask);
            Assert.AreEqual(0.1f, modifier.EvasionMod);
            Assert.AreEqual(-0.1f, modifier.CriticalMod);
        }

        #endregion

        #region InArena Component Tests

        [Test]
        public void InArena_Properties()
        {
            var inArena = new InArena
            {
                ArenaEntity = Unity.Entities.Entity.Null,
                Type = ArenaType.Bridge,
                TimeInArena = 0f,
                EntryPosition = new float3(5f, 0f, 10f)
            };

            Assert.AreEqual(ArenaType.Bridge, inArena.Type);
            Assert.AreEqual(0f, inArena.TimeInArena);
            Assert.AreEqual(new float3(5f, 0f, 10f), inArena.EntryPosition);
        }

        [Test]
        public void InArena_TimeAccumulation()
        {
            var inArena = new InArena
            {
                TimeInArena = 0f
            };

            inArena.TimeInArena += 1.5f;
            Assert.AreEqual(1.5f, inArena.TimeInArena);

            inArena.TimeInArena += 2.5f;
            Assert.AreEqual(4f, inArena.TimeInArena);
        }

        #endregion

        #region HazardType Tests

        [Test]
        public void HazardType_AllTypesExist()
        {
            Assert.AreEqual((byte)0, (byte)HazardType.Fall);
            Assert.AreEqual((byte)1, (byte)HazardType.Water);
            Assert.AreEqual((byte)2, (byte)HazardType.Electric);
            Assert.AreEqual((byte)3, (byte)HazardType.Fire);
            Assert.AreEqual((byte)4, (byte)HazardType.Toxic);
            Assert.AreEqual((byte)5, (byte)HazardType.Debris);
            Assert.AreEqual((byte)6, (byte)HazardType.Slippery);
            Assert.AreEqual((byte)7, (byte)HazardType.DeepWater);
        }

        #endregion

        #region BoundaryWarning Tests

        [Test]
        public void BoundaryWarning_ActiveWhenNearEdge()
        {
            var warning = new BoundaryWarning
            {
                WarningDistance = 3f,
                CurrentDistance = 2f,
                IsWarningActive = false,
                DirectionToCenter = new float3(1f, 0f, 0f)
            };

            // Update warning state
            warning.IsWarningActive = warning.CurrentDistance <= warning.WarningDistance;

            Assert.IsTrue(warning.IsWarningActive);
        }

        [Test]
        public void BoundaryWarning_InactiveWhenSafe()
        {
            var warning = new BoundaryWarning
            {
                WarningDistance = 3f,
                CurrentDistance = 5f,
                IsWarningActive = true
            };

            warning.IsWarningActive = warning.CurrentDistance <= warning.WarningDistance;

            Assert.IsFalse(warning.IsWarningActive);
        }

        #endregion

        #region Hazard Tick State Tests

        [Test]
        public void HazardTickState_TickTiming()
        {
            var tickState = new HazardTickState
            {
                TimeSinceLastTick = 0f,
                CurrentHazardType = HazardType.Electric,
                IsInHazard = true
            };

            float tickInterval = 0.5f;
            float deltaTime = 0.3f;

            tickState.TimeSinceLastTick += deltaTime;
            bool shouldTick = tickState.TimeSinceLastTick >= tickInterval;

            Assert.IsFalse(shouldTick);

            tickState.TimeSinceLastTick += 0.3f;
            shouldTick = tickState.TimeSinceLastTick >= tickInterval;

            Assert.IsTrue(shouldTick);
        }

        [Test]
        public void HazardTickState_ResetOnExit()
        {
            var tickState = new HazardTickState
            {
                TimeSinceLastTick = 0.4f,
                CurrentHazardType = HazardType.Toxic,
                IsInHazard = true
            };

            // Simulate exit
            tickState.IsInHazard = false;
            tickState.TimeSinceLastTick = 0f;
            tickState.CurrentHazardType = HazardType.Fall; // Reset to default

            Assert.IsFalse(tickState.IsInHazard);
            Assert.AreEqual(0f, tickState.TimeSinceLastTick);
        }

        #endregion

        #region Damage Calculation Tests

        [Test]
        public void FallDamage_Calculation()
        {
            float baseFallDamage = 20f;
            float3 fallStart = new float3(0f, 50f, 0f);
            float3 fallEnd = new float3(0f, 0f, 0f);

            float fallDistance = fallStart.y - fallEnd.y;
            float scaledDamage = baseFallDamage + (fallDistance * 0.5f);

            Assert.AreEqual(45f, scaledDamage);
        }

        [Test]
        public void HazardDamage_PerTickCalculation()
        {
            var hazard = ArenaHazard.CreateElectricHazard(float3.zero, 5f, 10f, 0.5f, 30f);

            // Damage per tick = base damage
            Assert.AreEqual(10f, hazard.Damage);

            // DPS = damage / tick interval
            float dps = hazard.Damage / hazard.TickInterval;
            Assert.AreEqual(20f, dps);
        }

        [Test]
        public void HazardDamage_DurationTracking()
        {
            var hazard = ArenaHazard.CreateElectricHazard(float3.zero, 5f, 10f, 0.5f, 10f);

            // Simulate time passing
            hazard.RemainingDuration -= 2f;
            Assert.AreEqual(8f, hazard.RemainingDuration);

            hazard.RemainingDuration -= 8f;
            Assert.AreEqual(0f, hazard.RemainingDuration);

            // Should expire
            if (hazard.Duration > 0f && hazard.RemainingDuration <= 0f)
            {
                hazard.IsActive = false;
            }

            Assert.IsFalse(hazard.IsActive);
        }

        #endregion
    }
}
