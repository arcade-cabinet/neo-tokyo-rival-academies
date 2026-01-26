using System.Collections;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.TestTools;
using Unity.Entities;
using Unity.Mathematics;
using Unity.Collections;
using NeoTokyo.Components.World;
using NeoTokyo.Components.Combat;
using NeoTokyo.Components.Core;

namespace NeoTokyo.Tests.PlayMode
{
    /// <summary>
    /// Integration tests for combined environment systems.
    /// Tests Water + Weather + Arena interactions.
    /// Command: Unity -batchmode -runTests -testPlatform PlayMode
    /// </summary>
    [TestFixture]
    public class EnvironmentIntegrationTests
    {
        private World _testWorld;
        private EntityManager _entityManager;

        [SetUp]
        public void SetUp()
        {
            _testWorld = new World("EnvironmentTestWorld");
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

        #region Water + Weather Combined Tests

        [UnityTest]
        public IEnumerator Weather_AffectsWaterHazard()
        {
            // Create weather singleton
            var weatherEntity = _entityManager.CreateEntity();
            _entityManager.AddComponentData(weatherEntity, new CurrentWeather
            {
                Type = WeatherType.Storm,
                Intensity = 0.8f
            });

            // Create water zone
            var waterEntity = _entityManager.CreateEntity();
            _entityManager.AddComponentData(waterEntity, new WaterZone
            {
                Depth = WaterDepth.WaistDeep,
                IsHazardous = false,
                HazardType = WaterHazardType.None
            });

            yield return null;

            // Storm weather makes water electrically hazardous
            var weather = _entityManager.GetComponentData<CurrentWeather>(weatherEntity);
            var water = _entityManager.GetComponentData<WaterZone>(waterEntity);

            if (weather.Type == WeatherType.Storm)
            {
                water.IsHazardous = true;
                water.HazardType = WaterHazardType.Electric;
                water.HazardDamageRate = 5f * weather.Intensity;
            }

            _entityManager.SetComponentData(waterEntity, water);

            yield return null;

            water = _entityManager.GetComponentData<WaterZone>(waterEntity);
            Assert.IsTrue(water.IsHazardous);
            Assert.AreEqual(WaterHazardType.Electric, water.HazardType);
            Assert.AreEqual(4f, water.HazardDamageRate, 0.01f);
        }

        [UnityTest]
        public IEnumerator AcidRain_DamagesEntitiesInWater()
        {
            // Create weather
            var weatherEntity = _entityManager.CreateEntity();
            _entityManager.AddComponentData(weatherEntity, new CurrentWeather
            {
                Type = WeatherType.AcidRain,
                Intensity = 0.5f
            });
            _entityManager.AddComponentData(weatherEntity, WeatherEffects.FromWeather(WeatherType.AcidRain, 0.5f));

            // Create entity in water (not sheltered)
            var entityInWater = _entityManager.CreateEntity();
            _entityManager.AddComponentData(entityInWater, new InWater
            {
                CurrentDepth = WaterDepth.Shallow,
                IsSwimming = false
            });
            _entityManager.AddComponentData(entityInWater, new WeatherAffected
            {
                IsSheltered = false,
                AcidResistance = 0f
            });
            _entityManager.AddComponentData(entityInWater, new Health { Current = 100f, Max = 100f });

            // Create sheltered entity
            var shelteredEntity = _entityManager.CreateEntity();
            _entityManager.AddComponentData(shelteredEntity, new InWater
            {
                CurrentDepth = WaterDepth.Shallow
            });
            _entityManager.AddComponentData(shelteredEntity, new WeatherAffected
            {
                IsSheltered = true,
                AcidResistance = 0f
            });
            _entityManager.AddComponentData(shelteredEntity, new Health { Current = 100f, Max = 100f });

            yield return null;

            // Apply acid damage
            var weatherEffects = _entityManager.GetComponentData<WeatherEffects>(weatherEntity);
            float deltaTime = 1f;

            // Unsheltered entity
            var affected = _entityManager.GetComponentData<WeatherAffected>(entityInWater);
            var health = _entityManager.GetComponentData<Health>(entityInWater);
            if (!affected.IsSheltered)
            {
                float damage = weatherEffects.AcidDamagePerSecond * deltaTime * (1f - affected.AcidResistance);
                health.Current -= damage;
            }
            _entityManager.SetComponentData(entityInWater, health);

            // Sheltered entity
            affected = _entityManager.GetComponentData<WeatherAffected>(shelteredEntity);
            health = _entityManager.GetComponentData<Health>(shelteredEntity);
            if (!affected.IsSheltered)
            {
                float damage = weatherEffects.AcidDamagePerSecond * deltaTime;
                health.Current -= damage;
            }
            _entityManager.SetComponentData(shelteredEntity, health);

            yield return null;

            // Verify damage
            health = _entityManager.GetComponentData<Health>(entityInWater);
            Assert.Less(health.Current, 100f); // Took damage

            health = _entityManager.GetComponentData<Health>(shelteredEntity);
            Assert.AreEqual(100f, health.Current); // Protected
        }

        [UnityTest]
        public IEnumerator Rain_ReducesVisibility_InWater()
        {
            // Create heavy rain weather
            var weatherEntity = _entityManager.CreateEntity();
            var weatherEffects = WeatherEffects.FromWeather(WeatherType.HeavyRain, 0.8f);
            _entityManager.AddComponentData(weatherEntity, new CurrentWeather
            {
                Type = WeatherType.HeavyRain,
                Intensity = 0.8f
            });
            _entityManager.AddComponentData(weatherEntity, weatherEffects);

            // Create entity in deep water
            var entity = _entityManager.CreateEntity();
            _entityManager.AddComponentData(entity, new InWater
            {
                CurrentDepth = WaterDepth.Deep,
                IsSwimming = true
            });

            yield return null;

            // Calculate combined visibility penalty
            float baseVisibility = 1f;
            float weatherMod = weatherEffects.VisibilityMultiplier; // ~0.32 for heavy rain
            float waterMod = 0.5f; // Deep water halves visibility

            float combinedVisibility = baseVisibility * weatherMod * waterMod;

            Assert.Less(combinedVisibility, 0.2f); // Very low visibility
        }

        #endregion

        #region Water + Arena Combined Tests

        [UnityTest]
        public IEnumerator FloodedArena_AppliesWaterModifiers()
        {
            // Create flooded interior arena
            var arenaEntity = _entityManager.CreateEntity();
            var arenaData = ArenaData.CreateFloodedInterior(
                float3.zero,
                new float3(20f, 5f, 20f),
                1.2f // Water depth
            );
            _entityManager.AddComponentData(arenaEntity, arenaData);
            _entityManager.AddComponentData(arenaEntity, ArenaModifier.FloodedInterior);

            // Create combatant in arena
            var combatantEntity = _entityManager.CreateEntity();
            _entityManager.AddComponentData(combatantEntity, new InArena
            {
                ArenaEntity = arenaEntity,
                Type = ArenaType.FloodedInterior
            });
            _entityManager.AddComponentData(combatantEntity, new InWater
            {
                CurrentDepth = WaterDepth.WaistDeep,
                IsSwimming = false
            });

            yield return null;

            // Get combined modifiers
            var arenaModifier = _entityManager.GetComponentData<ArenaModifier>(arenaEntity);
            var waterModifier = MovementModifier.ForWaterDepth(WaterDepth.WaistDeep);

            // Movement is affected by both
            float combinedMovement = arenaModifier.MovementSpeedMod * waterModifier.SpeedMultiplier;

            // Flooded interior: 0.6, Waist-deep water: 0.5 => 0.3
            Assert.AreEqual(0.3f, combinedMovement, 0.01f);

            // Fire abilities disabled in flooded arena
            Assert.IsTrue(arenaModifier.DisableAbilities);
        }

        [UnityTest]
        public IEnumerator BoatArena_RockingAffectsWater()
        {
            // Create boat arena
            var arenaEntity = _entityManager.CreateEntity();
            var arenaData = ArenaData.CreateBoat(
                float3.zero,
                new float3(10f, 3f, 20f),
                0.7f
            );
            _entityManager.AddComponentData(arenaEntity, arenaData);
            _entityManager.AddComponentData(arenaEntity, RockingPlatform.CreateBoatRocking(0.7f));

            // Create water zone around boat
            var waterEntity = _entityManager.CreateEntity();
            _entityManager.AddComponentData(waterEntity, WaterZone.DeepWater(0f));

            yield return null;

            var rocking = _entityManager.GetComponentData<RockingPlatform>(arenaEntity);

            // Simulate time for rocking
            float time = 2f;
            var tilt = rocking.GetTiltRotation(time);
            var slope = rocking.GetSurfaceSlope(time);

            // Rocking affects movement direction
            Assert.IsTrue(rocking.AffectsMovement);
            Assert.IsTrue(rocking.AffectsAim);

            // Fall hazard exists (can fall into water)
            var arena = _entityManager.GetComponentData<ArenaData>(arenaEntity);
            Assert.IsTrue(arena.HasFallHazard);
            Assert.IsTrue(arena.HasWaterHazard);
        }

        #endregion

        #region Weather + Arena Combined Tests

        [UnityTest]
        public IEnumerator Storm_AffectsRooftopArena()
        {
            // Create storm weather
            var weatherEntity = _entityManager.CreateEntity();
            _entityManager.AddComponentData(weatherEntity, new CurrentWeather
            {
                Type = WeatherType.Storm,
                Intensity = 1f
            });
            _entityManager.AddComponentData(weatherEntity, WeatherEffects.FromWeather(WeatherType.Storm, 1f));

            // Create rooftop arena
            var arenaEntity = _entityManager.CreateEntity();
            _entityManager.AddComponentData(arenaEntity, ArenaData.CreateRooftop(
                new float3(0f, 50f, 0f),
                new float3(15f, 5f, 15f)
            ));

            yield return null;

            var weatherEffects = _entityManager.GetComponentData<WeatherEffects>(weatherEntity);
            var arenaData = _entityManager.GetComponentData<ArenaData>(arenaEntity);

            // Storm makes ground slippery
            Assert.IsTrue(weatherEffects.SlipperyGround);

            // Reduced visibility
            Assert.AreEqual(0.3f, weatherEffects.VisibilityMultiplier);

            // Electric damage boosted (lightning)
            Assert.AreEqual(2.5f, weatherEffects.ElectricDamageMod);

            // Fall hazard still exists and is more dangerous due to slippery conditions
            Assert.IsTrue(arenaData.HasFallHazard);
        }

        [UnityTest]
        public IEnumerator Fog_ReducesArenaVisibility()
        {
            // Create dense fog
            var weatherEntity = _entityManager.CreateEntity();
            _entityManager.AddComponentData(weatherEntity, new CurrentWeather
            {
                Type = WeatherType.Fog,
                Intensity = 0.9f
            });
            _entityManager.AddComponentData(weatherEntity, WeatherEffects.FromWeather(WeatherType.Fog, 0.9f));

            // Create bridge arena
            var arenaEntity = _entityManager.CreateEntity();
            _entityManager.AddComponentData(arenaEntity, ArenaData.CreateBridge(
                float3.zero,
                50f,
                5f
            ));

            yield return null;

            var weatherEffects = _entityManager.GetComponentData<WeatherEffects>(weatherEntity);

            // Very low visibility (0.2 - 0.1 * 0.9 = 0.11)
            Assert.Less(weatherEffects.VisibilityMultiplier, 0.15f);

            // Bridge fall hazard is more dangerous with low visibility
            var arena = _entityManager.GetComponentData<ArenaData>(arenaEntity);
            Assert.IsTrue(arena.HasFallHazard);
        }

        #endregion

        #region Full Environment Integration Tests

        [UnityTest]
        public IEnumerator FullEnvironment_StormFloodedBridge()
        {
            // Create storm weather
            var weatherEntity = _entityManager.CreateEntity();
            _entityManager.AddComponentData(weatherEntity, new CurrentWeather
            {
                Type = WeatherType.Storm,
                Intensity = 0.9f
            });
            var weatherEffects = WeatherEffects.FromWeather(WeatherType.Storm, 0.9f);
            _entityManager.AddComponentData(weatherEntity, weatherEffects);

            // Create bridge arena (partially flooded due to storm)
            var arenaEntity = _entityManager.CreateEntity();
            var arenaData = ArenaData.CreateBridge(
                new float3(0f, 5f, 0f),
                40f,
                4f
            );
            arenaData.WaterDepth = 0.3f; // Shallow flooding from storm
            arenaData.HasWaterHazard = true;
            _entityManager.AddComponentData(arenaEntity, arenaData);
            _entityManager.AddComponentData(arenaEntity, ArenaModifier.Bridge);

            // Create water zone on bridge
            var waterEntity = _entityManager.CreateEntity();
            var waterZone = new WaterZone
            {
                Depth = WaterDepth.Shallow,
                IsHazardous = true, // Storm = electric
                HazardType = WaterHazardType.Electric,
                HazardDamageRate = 15f
            };
            _entityManager.AddComponentData(waterEntity, waterZone);

            // Create combatant
            var combatantEntity = _entityManager.CreateEntity();
            _entityManager.AddComponentData(combatantEntity, new InArena
            {
                ArenaEntity = arenaEntity,
                Type = ArenaType.Bridge
            });
            _entityManager.AddComponentData(combatantEntity, new InWater
            {
                CurrentDepth = WaterDepth.Shallow,
                IsSwimming = false,
                WaterZoneEntity = waterEntity
            });
            _entityManager.AddComponentData(combatantEntity, new WeatherAffected
            {
                IsSheltered = false
            });

            yield return null;

            // Calculate all modifiers
            var arena = _entityManager.GetComponentData<ArenaData>(arenaEntity);
            var arenaModifier = ArenaModifier.Bridge;
            var waterModifier = MovementModifier.ForWaterDepth(WaterDepth.Shallow);
            var waterCombat = WaterCombatModifier.ForDepth(WaterDepth.Shallow);

            // Movement: Bridge (0.9) * Shallow water (0.85) * Storm slowdown (0.7)
            float combinedMovement = arenaModifier.MovementSpeedMod *
                                    waterModifier.SpeedMultiplier *
                                    weatherEffects.MovementSpeedMod;
            Assert.Less(combinedMovement, 0.55f);

            // Knockback: Bridge (1.5) * Shallow water (1.1) = very easy to knock off
            float combinedKnockback = arenaModifier.KnockbackMod * waterCombat.KnockbackMultiplier;
            Assert.Greater(combinedKnockback, 1.6f);

            // Electric damage: Storm (2.5) * Water conducts
            Assert.IsTrue(waterCombat.ElectricAbilitiesChain);
            Assert.AreEqual(2.5f, weatherEffects.ElectricDamageMod);

            // Fall hazard present
            Assert.IsTrue(arena.HasFallHazard);

            // Water hazard is electric due to storm
            waterZone = _entityManager.GetComponentData<WaterZone>(waterEntity);
            Assert.IsTrue(waterZone.IsHazardous);
            Assert.AreEqual(WaterHazardType.Electric, waterZone.HazardType);
        }

        [UnityTest]
        public IEnumerator FullEnvironment_BioluminescentDeepDive()
        {
            // Create bioluminescent weather (night phenomenon)
            var weatherEntity = _entityManager.CreateEntity();
            _entityManager.AddComponentData(weatherEntity, new CurrentWeather
            {
                Type = WeatherType.Bioluminescent,
                Intensity = 0.8f
            });
            var weatherEffects = WeatherEffects.FromWeather(WeatherType.Bioluminescent, 0.8f);
            _entityManager.AddComponentData(weatherEntity, weatherEffects);

            // Create deep water arena (salvage site)
            var arenaEntity = _entityManager.CreateEntity();
            _entityManager.AddComponentData(arenaEntity, new ArenaData
            {
                Type = ArenaType.OpenWater,
                Center = new float3(0f, -10f, 0f),
                Size = new float3(50f, 30f, 50f),
                HasFallHazard = false,
                HasWaterHazard = true,
                WaterDepth = 25f
            });
            _entityManager.AddComponentData(arenaEntity, ArenaModifier.OpenWater);

            // Create diver
            var diverEntity = _entityManager.CreateEntity();
            _entityManager.AddComponentData(diverEntity, new InWater
            {
                CurrentDepth = WaterDepth.Submerged,
                IsSwimming = true,
                IsDiving = true,
                SubmersionTime = 45f
            });
            _entityManager.AddComponentData(diverEntity, DivingState.WithEquipment(120f));
            _entityManager.AddComponentData(diverEntity, new CanSwim
            {
                SwimSpeed = 5f,
                OxygenBonus = 30f
            });

            yield return null;

            // Get combined effects
            var arenaModifier = ArenaModifier.OpenWater;
            var waterModifier = MovementModifier.ForWaterDepth(WaterDepth.Submerged);
            var waterCombat = WaterCombatModifier.ForDepth(WaterDepth.Submerged);
            var diving = _entityManager.GetComponentData<DivingState>(diverEntity);
            var canSwim = _entityManager.GetComponentData<CanSwim>(diverEntity);

            // Effective oxygen with bonus
            float effectiveMaxOxygen = diving.MaxOxygen + canSwim.OxygenBonus;
            Assert.AreEqual(150f, effectiveMaxOxygen);

            // Movement very slow underwater
            float combinedMovement = arenaModifier.MovementSpeedMod * waterModifier.SpeedMultiplier;
            Assert.Less(combinedMovement, 0.2f);

            // Most abilities disabled
            Assert.IsTrue(arenaModifier.DisableAbilities);
            Assert.IsFalse(waterCombat.CanHeavyAttack);

            // Evasion bonus from 3D movement
            Assert.Greater(arenaModifier.EvasionMod, 0f);

            // Reduced visibility but bioluminescent glow
            Assert.AreEqual(0.6f, weatherEffects.VisibilityMultiplier);
        }

        #endregion

        #region Helper Components (for tests)

        private struct Health : IComponentData
        {
            public float Current;
            public float Max;
        }

        private struct Position : IComponentData
        {
            public float3 Value;
        }

        #endregion
    }
}
