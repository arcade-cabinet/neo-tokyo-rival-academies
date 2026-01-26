using NUnit.Framework;
using Unity.Mathematics;
using Unity.Collections;
using NeoTokyo.Components.World;

namespace NeoTokyo.Tests.EditMode
{
    /// <summary>
    /// Unit tests for WeatherSystem components and logic.
    /// Tests weather transitions, effect calculations.
    /// Command: Unity -batchmode -runTests -testPlatform EditMode
    /// </summary>
    [TestFixture]
    public class WeatherSystemTests
    {
        #region CurrentWeather Tests

        [Test]
        public void CurrentWeather_Default()
        {
            var weather = CurrentWeather.Default;

            Assert.AreEqual(WeatherType.Clear, weather.Type);
            Assert.AreEqual(0f, weather.Intensity);
            Assert.AreEqual(300f, weather.Duration);
            Assert.AreEqual(300f, weather.TimeRemaining);
            Assert.AreEqual(0f, weather.TransitionProgress);
            Assert.AreEqual(WeatherType.Clear, weather.NextWeather);
            Assert.IsFalse(weather.IsTransitioning);
        }

        [Test]
        public void CurrentWeather_IsTransitioning()
        {
            var weather = CurrentWeather.Default;

            // Not transitioning at 0
            weather.TransitionProgress = 0f;
            Assert.IsFalse(weather.IsTransitioning);

            // Transitioning in middle
            weather.TransitionProgress = 0.5f;
            Assert.IsTrue(weather.IsTransitioning);

            // Not transitioning at 1
            weather.TransitionProgress = 1f;
            Assert.IsFalse(weather.IsTransitioning);
        }

        [Test]
        public void CurrentWeather_TimeCountdown()
        {
            var weather = CurrentWeather.Default;
            weather.TimeRemaining = 100f;

            // Simulate time passing
            weather.TimeRemaining -= 25f;
            Assert.AreEqual(75f, weather.TimeRemaining);

            weather.TimeRemaining -= 80f;
            Assert.AreEqual(-5f, weather.TimeRemaining);

            // Check if expired
            bool expired = weather.TimeRemaining <= 0f;
            Assert.IsTrue(expired);
        }

        #endregion

        #region WeatherType Tests

        [Test]
        public void WeatherType_AllTypesExist()
        {
            Assert.AreEqual((byte)0, (byte)WeatherType.Clear);
            Assert.AreEqual((byte)1, (byte)WeatherType.Overcast);
            Assert.AreEqual((byte)2, (byte)WeatherType.Rain);
            Assert.AreEqual((byte)3, (byte)WeatherType.HeavyRain);
            Assert.AreEqual((byte)4, (byte)WeatherType.Storm);
            Assert.AreEqual((byte)5, (byte)WeatherType.Fog);
            Assert.AreEqual((byte)6, (byte)WeatherType.AcidRain);
            Assert.AreEqual((byte)7, (byte)WeatherType.Bioluminescent);
        }

        #endregion

        #region WeatherEffects Tests

        [Test]
        public void WeatherEffects_Clear()
        {
            var effects = WeatherEffects.FromWeather(WeatherType.Clear, 0.5f);

            Assert.AreEqual(1f, effects.VisibilityMultiplier);
            Assert.AreEqual(1f, effects.MovementSpeedMod);
            Assert.AreEqual(1f, effects.FireDamageMod);
            Assert.AreEqual(1f, effects.ElectricDamageMod);
            Assert.IsFalse(effects.SlipperyGround);
            Assert.AreEqual(1f, effects.AmbientSoundMod);
            Assert.AreEqual(0f, effects.AcidDamagePerSecond);
        }

        [Test]
        public void WeatherEffects_Overcast()
        {
            var effects = WeatherEffects.FromWeather(WeatherType.Overcast, 0.5f);

            Assert.AreEqual(0.9f, effects.VisibilityMultiplier);
            Assert.AreEqual(1f, effects.MovementSpeedMod);
            Assert.AreEqual(0.8f, effects.AmbientSoundMod);
        }

        [Test]
        public void WeatherEffects_Rain_LowIntensity()
        {
            var effects = WeatherEffects.FromWeather(WeatherType.Rain, 0.3f);

            Assert.AreEqual(0.7f, effects.VisibilityMultiplier);
            Assert.AreEqual(0.74f, effects.FireDamageMod, 0.01f); // 0.8 - 0.2 * 0.3
            Assert.AreEqual(1.26f, effects.ElectricDamageMod, 0.01f); // 1.2 + 0.2 * 0.3
            Assert.IsFalse(effects.SlipperyGround); // Only at > 0.5 intensity
        }

        [Test]
        public void WeatherEffects_Rain_HighIntensity()
        {
            var effects = WeatherEffects.FromWeather(WeatherType.Rain, 0.8f);

            Assert.AreEqual(0.64f, effects.FireDamageMod, 0.01f); // 0.8 - 0.2 * 0.8
            Assert.AreEqual(1.36f, effects.ElectricDamageMod, 0.01f); // 1.2 + 0.2 * 0.8
            Assert.IsTrue(effects.SlipperyGround); // > 0.5 intensity
        }

        [Test]
        public void WeatherEffects_HeavyRain()
        {
            var effects = WeatherEffects.FromWeather(WeatherType.HeavyRain, 0.5f);

            Assert.AreEqual(0.35f, effects.VisibilityMultiplier, 0.01f); // 0.4 - 0.1 * 0.5
            Assert.AreEqual(0.8f, effects.MovementSpeedMod, 0.01f); // 0.85 - 0.1 * 0.5
            Assert.AreEqual(0.4f, effects.FireDamageMod);
            Assert.AreEqual(2f, effects.ElectricDamageMod, 0.01f); // 1.8 + 0.4 * 0.5
            Assert.IsTrue(effects.SlipperyGround);
            Assert.AreEqual(1.8f, effects.AmbientSoundMod);
        }

        [Test]
        public void WeatherEffects_Storm()
        {
            var effects = WeatherEffects.FromWeather(WeatherType.Storm, 1f);

            Assert.AreEqual(0.3f, effects.VisibilityMultiplier);
            Assert.AreEqual(0.7f, effects.MovementSpeedMod);
            Assert.AreEqual(0.2f, effects.FireDamageMod);
            Assert.AreEqual(2.5f, effects.ElectricDamageMod);
            Assert.IsTrue(effects.SlipperyGround);
            Assert.AreEqual(2.5f, effects.AmbientSoundMod);
        }

        [Test]
        public void WeatherEffects_Fog()
        {
            var effects = WeatherEffects.FromWeather(WeatherType.Fog, 0.8f);

            Assert.AreEqual(0.12f, effects.VisibilityMultiplier, 0.01f); // 0.2 - 0.1 * 0.8
            Assert.AreEqual(1f, effects.MovementSpeedMod);
            Assert.AreEqual(0.5f, effects.AmbientSoundMod);
        }

        [Test]
        public void WeatherEffects_AcidRain()
        {
            var effects = WeatherEffects.FromWeather(WeatherType.AcidRain, 0.5f);

            Assert.AreEqual(0.5f, effects.VisibilityMultiplier);
            Assert.AreEqual(0.9f, effects.MovementSpeedMod);
            Assert.AreEqual(0.6f, effects.FireDamageMod);
            Assert.AreEqual(1.5f, effects.ElectricDamageMod);
            Assert.IsTrue(effects.SlipperyGround);
            Assert.AreEqual(6f, effects.AcidDamagePerSecond, 0.01f); // 2 + 8 * 0.5
            Assert.AreEqual(1.5f, effects.AmbientSoundMod);
        }

        [Test]
        public void WeatherEffects_AcidRain_MaxIntensity()
        {
            var effects = WeatherEffects.FromWeather(WeatherType.AcidRain, 1f);

            Assert.AreEqual(10f, effects.AcidDamagePerSecond); // 2 + 8 * 1
        }

        [Test]
        public void WeatherEffects_Bioluminescent()
        {
            var effects = WeatherEffects.FromWeather(WeatherType.Bioluminescent, 0.5f);

            Assert.AreEqual(0.6f, effects.VisibilityMultiplier);
            Assert.AreEqual(1f, effects.MovementSpeedMod);
            Assert.AreEqual(0.4f, effects.AmbientSoundMod); // Quiet atmosphere
        }

        #endregion

        #region WeatherZone Tests

        [Test]
        public void WeatherZone_LocalOverride()
        {
            var zone = new WeatherZone
            {
                LocalWeather = WeatherType.Fog,
                Center = new float3(100f, 0f, 100f),
                Radius = 50f,
                Intensity = 0.8f,
                Priority = 1,
                IsActive = true
            };

            Assert.AreEqual(WeatherType.Fog, zone.LocalWeather);
            Assert.AreEqual(50f, zone.Radius);
            Assert.AreEqual(1, zone.Priority);
            Assert.IsTrue(zone.IsActive);
        }

        [Test]
        public void WeatherZone_PriorityOrdering()
        {
            var zone1 = new WeatherZone { Priority = 0 };
            var zone2 = new WeatherZone { Priority = 1 };
            var zone3 = new WeatherZone { Priority = 5 };

            // Higher priority wins
            Assert.Greater(zone3.Priority, zone2.Priority);
            Assert.Greater(zone2.Priority, zone1.Priority);
        }

        [Test]
        public void WeatherZone_PositionInZone()
        {
            var zone = new WeatherZone
            {
                Center = new float3(0f, 0f, 0f),
                Radius = 10f,
                IsActive = true
            };

            float3 insidePosition = new float3(5f, 0f, 5f);
            float3 outsidePosition = new float3(15f, 0f, 0f);

            bool inside = math.distance(zone.Center, insidePosition) <= zone.Radius;
            bool outside = math.distance(zone.Center, outsidePosition) <= zone.Radius;

            Assert.IsTrue(inside);
            Assert.IsFalse(outside);
        }

        #endregion

        #region WeatherAffected Tests

        [Test]
        public void WeatherAffected_Sheltered()
        {
            var affected = new WeatherAffected
            {
                IsSheltered = true,
                AcidResistance = 0f,
                CurrentZonePriority = -1
            };

            Assert.IsTrue(affected.IsSheltered);
        }

        [Test]
        public void WeatherAffected_AcidResistance()
        {
            var affected = new WeatherAffected
            {
                IsSheltered = false,
                AcidResistance = 0.5f
            };

            float baseAcidDamage = 10f;
            float effectiveDamage = baseAcidDamage * (1f - affected.AcidResistance);

            Assert.AreEqual(5f, effectiveDamage);
        }

        [Test]
        public void WeatherAffected_FullAcidResistance()
        {
            var affected = new WeatherAffected
            {
                IsSheltered = false,
                AcidResistance = 1f // Immune
            };

            float baseAcidDamage = 10f;
            float effectiveDamage = baseAcidDamage * (1f - affected.AcidResistance);

            Assert.AreEqual(0f, effectiveDamage);
        }

        #endregion

        #region WeatherChangeRequest Tests

        [Test]
        public void WeatherChangeRequest_Properties()
        {
            var request = new WeatherChangeRequest
            {
                TargetWeather = WeatherType.Storm,
                TransitionDuration = 30f,
                NewDuration = 600f,
                Intensity = 0.9f
            };

            Assert.AreEqual(WeatherType.Storm, request.TargetWeather);
            Assert.AreEqual(30f, request.TransitionDuration);
            Assert.AreEqual(600f, request.NewDuration);
            Assert.AreEqual(0.9f, request.Intensity);
        }

        #endregion

        #region TerritoryWeatherConfig Tests

        [Test]
        public void TerritoryWeatherConfig_Default()
        {
            var config = TerritoryWeatherConfig.Default;

            Assert.AreEqual("default", config.TerritoryId.ToString());
            Assert.AreEqual(40, config.ClearWeight);
            Assert.AreEqual(25, config.OvercastWeight);
            Assert.AreEqual(20, config.RainWeight);
            Assert.AreEqual(8, config.HeavyRainWeight);
            Assert.AreEqual(3, config.StormWeight);
            Assert.AreEqual(2, config.FogWeight);
            Assert.AreEqual(1, config.AcidRainWeight);
            Assert.AreEqual(1, config.BioluminescentWeight);
        }

        [Test]
        public void TerritoryWeatherConfig_TotalWeight()
        {
            var config = TerritoryWeatherConfig.Default;

            int expected = 40 + 25 + 20 + 8 + 3 + 2 + 1 + 1;
            Assert.AreEqual(expected, config.TotalWeight);
        }

        [Test]
        public void TerritoryWeatherConfig_Industrial()
        {
            var config = TerritoryWeatherConfig.Industrial;

            Assert.AreEqual("industrial", config.TerritoryId.ToString());
            Assert.AreEqual(10, config.AcidRainWeight); // More acid rain
            Assert.AreEqual(0, config.BioluminescentWeight); // No bioluminescent
        }

        [Test]
        public void TerritoryWeatherConfig_Drowned()
        {
            var config = TerritoryWeatherConfig.Drowned;

            Assert.AreEqual("drowned", config.TerritoryId.ToString());
            Assert.AreEqual(15, config.FogWeight); // More fog
            Assert.AreEqual(15, config.BioluminescentWeight); // More bioluminescent
            Assert.AreEqual(0, config.AcidRainWeight); // No acid rain
        }

        #endregion

        #region Weather Transition Tests

        [Test]
        public void WeatherTransition_ProgressCalculation()
        {
            var weather = CurrentWeather.Default;
            weather.Type = WeatherType.Clear;
            weather.NextWeather = WeatherType.Rain;
            weather.TransitionProgress = 0f;

            float transitionDuration = 30f;
            float deltaTime = 10f;
            float transitionSpeed = 1f / transitionDuration;

            weather.TransitionProgress += deltaTime * transitionSpeed;

            Assert.AreEqual(0.333f, weather.TransitionProgress, 0.01f);
            Assert.IsTrue(weather.IsTransitioning);
        }

        [Test]
        public void WeatherTransition_BlendEffects()
        {
            var clearEffects = WeatherEffects.FromWeather(WeatherType.Clear, 0f);
            var rainEffects = WeatherEffects.FromWeather(WeatherType.Rain, 0.5f);

            float t = 0.5f; // 50% transition

            float blendedVisibility = math.lerp(
                clearEffects.VisibilityMultiplier,
                rainEffects.VisibilityMultiplier,
                t
            );

            float expected = (1f + 0.7f) / 2f; // 0.85
            Assert.AreEqual(expected, blendedVisibility, 0.01f);
        }

        [Test]
        public void WeatherTransition_Completion()
        {
            var weather = CurrentWeather.Default;
            weather.Type = WeatherType.Clear;
            weather.NextWeather = WeatherType.Storm;
            weather.TransitionProgress = 0.99f;

            // Complete transition
            weather.TransitionProgress = 1f;

            if (weather.TransitionProgress >= 1f)
            {
                weather.Type = weather.NextWeather;
                weather.TransitionProgress = 0f;
            }

            Assert.AreEqual(WeatherType.Storm, weather.Type);
            Assert.AreEqual(0f, weather.TransitionProgress);
            Assert.IsFalse(weather.IsTransitioning);
        }

        #endregion

        #region Weather Duration Tests

        [Test]
        public void WeatherDuration_RandomRange()
        {
            float minDuration = 60f;
            float maxDuration = 300f;

            var random = new Random(42);
            float duration = random.NextFloat(minDuration, maxDuration);

            Assert.GreaterOrEqual(duration, minDuration);
            Assert.LessOrEqual(duration, maxDuration);
        }

        [Test]
        public void WeatherDuration_IntensityAffectsDuration()
        {
            float baseDuration = 180f;
            float intensity = 0.8f;

            // Intense weather lasts shorter
            float scaledDuration = baseDuration * (1.5f - intensity * 0.5f);

            Assert.AreEqual(198f, scaledDuration); // 180 * (1.5 - 0.4) = 180 * 1.1
        }

        #endregion

        #region WeatherManagerSingleton Tests

        [Test]
        public void WeatherManagerSingleton_DefaultValues()
        {
            var manager = new WeatherManagerSingleton
            {
                Initialized = true,
                RandomSeed = 42,
                MinWeatherDuration = 60f,
                MaxWeatherDuration = 300f,
                TransitionSpeed = 0.1f
            };

            Assert.IsTrue(manager.Initialized);
            Assert.AreEqual(42u, manager.RandomSeed);
            Assert.AreEqual(60f, manager.MinWeatherDuration);
            Assert.AreEqual(300f, manager.MaxWeatherDuration);
            Assert.AreEqual(0.1f, manager.TransitionSpeed);
        }

        #endregion

        #region Intensity Calculation Tests

        [Test]
        public void Intensity_Clamping()
        {
            float intensity = 1.5f;
            intensity = math.clamp(intensity, 0f, 1f);
            Assert.AreEqual(1f, intensity);

            intensity = -0.5f;
            intensity = math.clamp(intensity, 0f, 1f);
            Assert.AreEqual(0f, intensity);
        }

        [Test]
        public void Intensity_RandomVariation()
        {
            var random = new Random(42);
            float baseIntensity = 0.5f;
            float variation = 0.2f;

            float intensity = baseIntensity + random.NextFloat(-variation, variation);
            intensity = math.clamp(intensity, 0f, 1f);

            Assert.GreaterOrEqual(intensity, 0f);
            Assert.LessOrEqual(intensity, 1f);
        }

        #endregion
    }
}
