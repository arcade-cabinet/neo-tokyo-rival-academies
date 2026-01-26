using Unity.Entities;
using Unity.Mathematics;
using Unity.Collections;

namespace NeoTokyo.Components.World
{
    /// <summary>
    /// Weather types available in the flooded Neo-Tokyo world.
    /// Golden Record Phase 3 specifies weather for atmospheric effects.
    /// </summary>
    public enum WeatherType : byte
    {
        Clear = 0,          // Normal visibility, no effects
        Overcast = 1,       // Reduced lighting, slight mood change
        Rain = 2,           // Light rain, minor visibility reduction
        HeavyRain = 3,      // Torrential rain, significant visibility/movement impact
        Storm = 4,          // Thunder and lightning, dangerous conditions
        Fog = 5,            // Dense fog, severely reduced visibility
        AcidRain = 6,       // Toxic rain, damages exposed entities
        Bioluminescent = 7  // Night phenomenon, eerie glow in water
    }

    /// <summary>
    /// Current global weather state singleton.
    /// Tracks active weather, transitions, and timing.
    /// </summary>
    public struct CurrentWeather : IComponentData
    {
        /// <summary>Current active weather type</summary>
        public WeatherType Type;

        /// <summary>Weather intensity 0.0 (mild) to 1.0 (severe)</summary>
        public float Intensity;

        /// <summary>Total duration of current weather in seconds</summary>
        public float Duration;

        /// <summary>Time remaining until weather change</summary>
        public float TimeRemaining;

        /// <summary>Progress of transition to next weather (0-1)</summary>
        public float TransitionProgress;

        /// <summary>Next weather type when transition completes</summary>
        public WeatherType NextWeather;

        /// <summary>Whether currently in transition</summary>
        public bool IsTransitioning => TransitionProgress > 0f && TransitionProgress < 1f;

        public static CurrentWeather Default => new CurrentWeather
        {
            Type = WeatherType.Clear,
            Intensity = 0f,
            Duration = 300f,  // 5 minutes default
            TimeRemaining = 300f,
            TransitionProgress = 0f,
            NextWeather = WeatherType.Clear
        };
    }

    /// <summary>
    /// Gameplay effects derived from current weather conditions.
    /// Applied by WeatherSystem to modify game mechanics.
    /// </summary>
    public struct WeatherEffects : IComponentData
    {
        /// <summary>Visibility range multiplier (1.0 = normal)</summary>
        public float VisibilityMultiplier;

        /// <summary>Movement speed modifier (1.0 = normal)</summary>
        public float MovementSpeedMod;

        /// <summary>Fire damage multiplier (rain reduces fire damage)</summary>
        public float FireDamageMod;

        /// <summary>Electric damage multiplier (rain increases electric damage)</summary>
        public float ElectricDamageMod;

        /// <summary>Whether ground surfaces are slippery</summary>
        public bool SlipperyGround;

        /// <summary>Ambient sound intensity modifier</summary>
        public float AmbientSoundMod;

        /// <summary>Damage per second from acid rain (0 if not acid rain)</summary>
        public float AcidDamagePerSecond;

        public static WeatherEffects FromWeather(WeatherType type, float intensity)
        {
            var effects = new WeatherEffects
            {
                VisibilityMultiplier = 1f,
                MovementSpeedMod = 1f,
                FireDamageMod = 1f,
                ElectricDamageMod = 1f,
                SlipperyGround = false,
                AmbientSoundMod = 1f,
                AcidDamagePerSecond = 0f
            };

            switch (type)
            {
                case WeatherType.Clear:
                    // No modifications
                    break;

                case WeatherType.Overcast:
                    effects.VisibilityMultiplier = 0.9f;
                    effects.AmbientSoundMod = 0.8f;
                    break;

                case WeatherType.Rain:
                    effects.VisibilityMultiplier = 0.7f;
                    effects.FireDamageMod = 0.8f - (0.2f * intensity);
                    effects.ElectricDamageMod = 1.2f + (0.2f * intensity);
                    effects.SlipperyGround = intensity > 0.5f;
                    effects.AmbientSoundMod = 1.3f;
                    break;

                case WeatherType.HeavyRain:
                    effects.VisibilityMultiplier = 0.4f - (0.1f * intensity);
                    effects.MovementSpeedMod = 0.85f - (0.1f * intensity);
                    effects.FireDamageMod = 0.4f;
                    effects.ElectricDamageMod = 1.8f + (0.4f * intensity);
                    effects.SlipperyGround = true;
                    effects.AmbientSoundMod = 1.8f;
                    break;

                case WeatherType.Storm:
                    effects.VisibilityMultiplier = 0.3f;
                    effects.MovementSpeedMod = 0.7f;
                    effects.FireDamageMod = 0.2f;
                    effects.ElectricDamageMod = 2.5f;
                    effects.SlipperyGround = true;
                    effects.AmbientSoundMod = 2.5f;
                    break;

                case WeatherType.Fog:
                    effects.VisibilityMultiplier = 0.2f - (0.1f * intensity);
                    effects.AmbientSoundMod = 0.5f;
                    break;

                case WeatherType.AcidRain:
                    effects.VisibilityMultiplier = 0.5f;
                    effects.MovementSpeedMod = 0.9f;
                    effects.FireDamageMod = 0.6f;
                    effects.ElectricDamageMod = 1.5f;
                    effects.SlipperyGround = true;
                    effects.AcidDamagePerSecond = 2f + (8f * intensity);
                    effects.AmbientSoundMod = 1.5f;
                    break;

                case WeatherType.Bioluminescent:
                    effects.VisibilityMultiplier = 0.6f;  // Dark but glowing
                    effects.AmbientSoundMod = 0.4f;
                    break;
            }

            return effects;
        }
    }

    /// <summary>
    /// Defines a localized weather zone that overrides global weather.
    /// Used for territory-specific weather patterns.
    /// </summary>
    public struct WeatherZone : IComponentData
    {
        /// <summary>Local weather type in this zone</summary>
        public WeatherType LocalWeather;

        /// <summary>Center position of the weather zone</summary>
        public float3 Center;

        /// <summary>Radius of the weather zone</summary>
        public float Radius;

        /// <summary>Intensity of local weather</summary>
        public float Intensity;

        /// <summary>Priority when zones overlap (higher wins)</summary>
        public int Priority;

        /// <summary>Whether this zone is currently active</summary>
        public bool IsActive;
    }

    /// <summary>
    /// Component marking an entity as affected by weather.
    /// Entities with this component receive weather effect modifiers.
    /// </summary>
    public struct WeatherAffected : IComponentData
    {
        /// <summary>Whether entity is sheltered from weather</summary>
        public bool IsSheltered;

        /// <summary>Resistance to acid rain (0-1, 1 = immune)</summary>
        public float AcidResistance;

        /// <summary>Current weather zone priority affecting this entity (-1 = global)</summary>
        public int CurrentZonePriority;
    }

    /// <summary>
    /// Request to change weather, processed by WeatherSystem.
    /// </summary>
    public struct WeatherChangeRequest : IComponentData
    {
        public WeatherType TargetWeather;
        public float TransitionDuration;
        public float NewDuration;
        public float Intensity;
    }

    /// <summary>
    /// Configuration for weather probabilities per territory.
    /// </summary>
    public struct TerritoryWeatherConfig : IComponentData
    {
        public FixedString32Bytes TerritoryId;

        // Probability weights (0-100) for each weather type
        public byte ClearWeight;
        public byte OvercastWeight;
        public byte RainWeight;
        public byte HeavyRainWeight;
        public byte StormWeight;
        public byte FogWeight;
        public byte AcidRainWeight;
        public byte BioluminescentWeight;

        public static TerritoryWeatherConfig Default => new TerritoryWeatherConfig
        {
            TerritoryId = new FixedString32Bytes("default"),
            ClearWeight = 40,
            OvercastWeight = 25,
            RainWeight = 20,
            HeavyRainWeight = 8,
            StormWeight = 3,
            FogWeight = 2,
            AcidRainWeight = 1,
            BioluminescentWeight = 1
        };

        /// <summary>
        /// Industrial zone: more acid rain, less bioluminescent
        /// </summary>
        public static TerritoryWeatherConfig Industrial => new TerritoryWeatherConfig
        {
            TerritoryId = new FixedString32Bytes("industrial"),
            ClearWeight = 20,
            OvercastWeight = 30,
            RainWeight = 20,
            HeavyRainWeight = 10,
            StormWeight = 5,
            FogWeight = 5,
            AcidRainWeight = 10,
            BioluminescentWeight = 0
        };

        /// <summary>
        /// Drowned territory: more fog, bioluminescent, heavy rain
        /// </summary>
        public static TerritoryWeatherConfig Drowned => new TerritoryWeatherConfig
        {
            TerritoryId = new FixedString32Bytes("drowned"),
            ClearWeight = 10,
            OvercastWeight = 15,
            RainWeight = 15,
            HeavyRainWeight = 20,
            StormWeight = 10,
            FogWeight = 15,
            AcidRainWeight = 0,
            BioluminescentWeight = 15
        };

        /// <summary>
        /// Get total weight for probability calculations
        /// </summary>
        public int TotalWeight =>
            ClearWeight + OvercastWeight + RainWeight + HeavyRainWeight +
            StormWeight + FogWeight + AcidRainWeight + BioluminescentWeight;
    }

    /// <summary>
    /// Singleton for weather manager state
    /// </summary>
    public struct WeatherManagerSingleton : IComponentData
    {
        public bool Initialized;
        public uint RandomSeed;
        public float MinWeatherDuration;
        public float MaxWeatherDuration;
        public float TransitionSpeed;
    }
}
