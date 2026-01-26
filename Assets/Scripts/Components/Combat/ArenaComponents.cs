using Unity.Entities;
using Unity.Mathematics;

namespace NeoTokyo.Components.Combat
{
    /// <summary>
    /// Arena type enumeration for combat environments.
    /// Matches Golden Record: Rooftop, Bridge, Boat, Flooded Interior variants.
    /// </summary>
    public enum ArenaType : byte
    {
        /// <summary>Standard rooftop arena - flat surface, urban environment.</summary>
        Rooftop = 0,

        /// <summary>Narrow bridge arena - fall hazards on sides.</summary>
        Bridge = 1,

        /// <summary>Boat arena - rocking platform, water hazards.</summary>
        Boat = 2,

        /// <summary>Flooded interior - waist-deep water, movement penalties.</summary>
        FloodedInterior = 3,

        /// <summary>Open water arena - deep water, swimming required.</summary>
        OpenWater = 4,

        /// <summary>Underground arena - confined space, debris hazards.</summary>
        Underground = 5,

        /// <summary>Shrine arena - sacred ground, special rules may apply.</summary>
        Shrine = 6
    }

    /// <summary>
    /// Main arena data component defining combat area properties.
    /// Attached to arena entity to define boundaries and behaviors.
    /// </summary>
    public struct ArenaData : IComponentData
    {
        /// <summary>Type of arena determining base mechanics.</summary>
        public ArenaType Type;

        /// <summary>World-space center of the arena.</summary>
        public float3 Center;

        /// <summary>Dimensions of the arena (width, height, depth).</summary>
        public float3 Size;

        /// <summary>Whether entities can fall off the arena edges.</summary>
        public bool HasFallHazard;

        /// <summary>Whether the arena has water-based hazards.</summary>
        public bool HasWaterHazard;

        /// <summary>Whether the platform rocks (boats).</summary>
        public bool IsRocking;

        /// <summary>Intensity of rocking motion (0-1 range).</summary>
        public float RockingIntensity;

        /// <summary>Water depth in the arena (0 for dry arenas).</summary>
        public float WaterDepth;

        /// <summary>Time elapsed since arena was activated.</summary>
        public float ActiveTime;

        /// <summary>
        /// Check if a position is within arena bounds.
        /// </summary>
        public bool ContainsPosition(float3 position)
        {
            float3 halfSize = Size * 0.5f;
            float3 min = Center - halfSize;
            float3 max = Center + halfSize;

            return position.x >= min.x && position.x <= max.x &&
                   position.y >= min.y && position.y <= max.y &&
                   position.z >= min.z && position.z <= max.z;
        }

        /// <summary>
        /// Get distance from position to nearest arena boundary.
        /// Returns negative if outside arena.
        /// </summary>
        public float DistanceToBoundary(float3 position)
        {
            float3 halfSize = Size * 0.5f;
            float3 localPos = position - Center;

            float dx = halfSize.x - math.abs(localPos.x);
            float dz = halfSize.z - math.abs(localPos.z);

            return math.min(dx, dz);
        }

        /// <summary>
        /// Create standard rooftop arena.
        /// </summary>
        public static ArenaData CreateRooftop(float3 center, float3 size) => new ArenaData
        {
            Type = ArenaType.Rooftop,
            Center = center,
            Size = size,
            HasFallHazard = true,
            HasWaterHazard = false,
            IsRocking = false,
            RockingIntensity = 0f,
            WaterDepth = 0f,
            ActiveTime = 0f
        };

        /// <summary>
        /// Create bridge arena with narrow fighting space.
        /// </summary>
        public static ArenaData CreateBridge(float3 center, float length, float width) => new ArenaData
        {
            Type = ArenaType.Bridge,
            Center = center,
            Size = new float3(width, 3f, length),
            HasFallHazard = true,
            HasWaterHazard = true,
            IsRocking = false,
            RockingIntensity = 0f,
            WaterDepth = 0f,
            ActiveTime = 0f
        };

        /// <summary>
        /// Create boat arena with rocking mechanics.
        /// </summary>
        public static ArenaData CreateBoat(float3 center, float3 size, float rockingIntensity) => new ArenaData
        {
            Type = ArenaType.Boat,
            Center = center,
            Size = size,
            HasFallHazard = true,
            HasWaterHazard = true,
            IsRocking = true,
            RockingIntensity = math.clamp(rockingIntensity, 0f, 1f),
            WaterDepth = 0f,
            ActiveTime = 0f
        };

        /// <summary>
        /// Create flooded interior arena.
        /// </summary>
        public static ArenaData CreateFloodedInterior(float3 center, float3 size, float waterDepth) => new ArenaData
        {
            Type = ArenaType.FloodedInterior,
            Center = center,
            Size = size,
            HasFallHazard = false,
            HasWaterHazard = true,
            IsRocking = false,
            RockingIntensity = 0f,
            WaterDepth = waterDepth,
            ActiveTime = 0f
        };
    }

    /// <summary>
    /// Hazard type enumeration for environmental dangers.
    /// </summary>
    public enum HazardType : byte
    {
        /// <summary>Fall hazard - instant repositioning or damage.</summary>
        Fall = 0,

        /// <summary>Water hazard - drowning damage, movement penalty.</summary>
        Water = 1,

        /// <summary>Electric hazard - periodic shock damage.</summary>
        Electric = 2,

        /// <summary>Fire hazard - burning damage over time.</summary>
        Fire = 3,

        /// <summary>Toxic hazard - poison damage over time.</summary>
        Toxic = 4,

        /// <summary>Debris hazard - falling objects, impact damage.</summary>
        Debris = 5,

        /// <summary>Slippery surface - reduced traction.</summary>
        Slippery = 6,

        /// <summary>Deep water - swimming required, abilities disabled.</summary>
        DeepWater = 7
    }

    /// <summary>
    /// Buffer element for hazard zones within an arena.
    /// Multiple hazards can exist per arena.
    /// </summary>
    public struct ArenaHazard : IBufferElementData
    {
        /// <summary>Type of hazard.</summary>
        public HazardType Type;

        /// <summary>World-space position of hazard center.</summary>
        public float3 Position;

        /// <summary>Radius of the hazard effect.</summary>
        public float Radius;

        /// <summary>Damage per tick when in hazard zone.</summary>
        public float Damage;

        /// <summary>Time between damage ticks in seconds.</summary>
        public float TickInterval;

        /// <summary>Time until hazard expires (0 = permanent).</summary>
        public float Duration;

        /// <summary>Remaining duration for temporary hazards.</summary>
        public float RemainingDuration;

        /// <summary>Whether hazard is currently active.</summary>
        public bool IsActive;

        /// <summary>Stability damage per tick (for knockback hazards).</summary>
        public float StabilityDamage;

        /// <summary>Knockback force direction and magnitude.</summary>
        public float3 KnockbackForce;

        /// <summary>
        /// Check if a position is within the hazard zone.
        /// </summary>
        public bool ContainsPosition(float3 position)
        {
            float distSq = math.distancesq(position, Position);
            return distSq <= Radius * Radius;
        }

        /// <summary>
        /// Create a fall hazard zone.
        /// </summary>
        public static ArenaHazard CreateFallHazard(float3 position, float radius, float fallDamage) => new ArenaHazard
        {
            Type = HazardType.Fall,
            Position = position,
            Radius = radius,
            Damage = fallDamage,
            TickInterval = 0f,
            Duration = 0f,
            RemainingDuration = 0f,
            IsActive = true,
            StabilityDamage = fallDamage * 0.5f,
            KnockbackForce = float3.zero
        };

        /// <summary>
        /// Create a water hazard zone.
        /// </summary>
        public static ArenaHazard CreateWaterHazard(float3 position, float radius, float drownDamage, float tickInterval) => new ArenaHazard
        {
            Type = HazardType.Water,
            Position = position,
            Radius = radius,
            Damage = drownDamage,
            TickInterval = tickInterval,
            Duration = 0f,
            RemainingDuration = 0f,
            IsActive = true,
            StabilityDamage = 0f,
            KnockbackForce = float3.zero
        };

        /// <summary>
        /// Create an electric hazard zone.
        /// </summary>
        public static ArenaHazard CreateElectricHazard(float3 position, float radius, float shockDamage, float tickInterval, float duration) => new ArenaHazard
        {
            Type = HazardType.Electric,
            Position = position,
            Radius = radius,
            Damage = shockDamage,
            TickInterval = tickInterval,
            Duration = duration,
            RemainingDuration = duration,
            IsActive = true,
            StabilityDamage = shockDamage * 0.3f,
            KnockbackForce = float3.zero
        };
    }

    /// <summary>
    /// Component for rectangular fall hazard zones (arena edges).
    /// </summary>
    public struct FallHazardZone : IComponentData
    {
        /// <summary>Minimum corner of the hazard zone.</summary>
        public float3 Min;

        /// <summary>Maximum corner of the hazard zone.</summary>
        public float3 Max;

        /// <summary>Damage dealt when falling.</summary>
        public float FallDamage;

        /// <summary>Whether falling is instant death.</summary>
        public bool IsInstantKill;

        /// <summary>Respawn position after falling.</summary>
        public float3 RespawnPosition;

        /// <summary>Time invincible after respawn.</summary>
        public float RespawnInvincibilityTime;

        /// <summary>
        /// Check if a position is within the fall zone.
        /// </summary>
        public bool ContainsPosition(float3 position)
        {
            return position.x >= Min.x && position.x <= Max.x &&
                   position.y >= Min.y && position.y <= Max.y &&
                   position.z >= Min.z && position.z <= Max.z;
        }

        /// <summary>
        /// Create fall zone at arena edge.
        /// </summary>
        public static FallHazardZone CreateEdgeZone(float3 min, float3 max, float3 respawn, float damage = 20f) => new FallHazardZone
        {
            Min = min,
            Max = max,
            FallDamage = damage,
            IsInstantKill = false,
            RespawnPosition = respawn,
            RespawnInvincibilityTime = 1.5f
        };
    }

    /// <summary>
    /// Component for rocking platform physics (boats).
    /// </summary>
    public struct RockingPlatform : IComponentData
    {
        /// <summary>Current rock angle in radians.</summary>
        public float RockAngle;

        /// <summary>Rocking oscillation speed.</summary>
        public float RockSpeed;

        /// <summary>Maximum rock angle in radians.</summary>
        public float MaxRockAngle;

        /// <summary>Axis of rotation (normalized).</summary>
        public float3 RockAxis;

        /// <summary>Phase offset for the rocking motion.</summary>
        public float PhaseOffset;

        /// <summary>Whether rocking affects movement direction.</summary>
        public bool AffectsMovement;

        /// <summary>Whether rocking affects aim/attacks.</summary>
        public bool AffectsAim;

        /// <summary>
        /// Calculate current tilt quaternion.
        /// </summary>
        public quaternion GetTiltRotation(float time)
        {
            float angle = math.sin((time * RockSpeed) + PhaseOffset) * MaxRockAngle;
            return quaternion.AxisAngle(RockAxis, angle);
        }

        /// <summary>
        /// Calculate surface slope at current time.
        /// Returns slope as a normalized direction vector.
        /// </summary>
        public float3 GetSurfaceSlope(float time)
        {
            float angle = math.sin((time * RockSpeed) + PhaseOffset) * MaxRockAngle;
            float slopeX = math.sin(angle) * RockAxis.z;
            float slopeZ = -math.sin(angle) * RockAxis.x;
            return new float3(slopeX, 0f, slopeZ);
        }

        /// <summary>
        /// Create default boat rocking configuration.
        /// </summary>
        public static RockingPlatform CreateBoatRocking(float intensity) => new RockingPlatform
        {
            RockAngle = 0f,
            RockSpeed = 1.5f * intensity,
            MaxRockAngle = math.radians(8f * intensity),
            RockAxis = new float3(1f, 0f, 0f),
            PhaseOffset = 0f,
            AffectsMovement = true,
            AffectsAim = true
        };
    }

    /// <summary>
    /// Tag component for entities currently in an arena.
    /// </summary>
    public struct InArena : IComponentData
    {
        /// <summary>Reference to the arena entity.</summary>
        public Entity ArenaEntity;

        /// <summary>Type of arena for quick access.</summary>
        public ArenaType Type;

        /// <summary>Time spent in arena.</summary>
        public float TimeInArena;

        /// <summary>Position where entity entered arena.</summary>
        public float3 EntryPosition;
    }

    /// <summary>
    /// Modifiers applied to combatants based on arena type.
    /// </summary>
    public struct ArenaModifier : IComponentData
    {
        /// <summary>Movement speed multiplier (1.0 = normal).</summary>
        public float MovementSpeedMod;

        /// <summary>Attack speed multiplier (1.0 = normal).</summary>
        public float AttackSpeedMod;

        /// <summary>Knockback force multiplier (1.0 = normal).</summary>
        public float KnockbackMod;

        /// <summary>Whether certain abilities are disabled.</summary>
        public bool DisableAbilities;

        /// <summary>Bitmask of disabled ability categories.</summary>
        public int DisabledAbilityMask;

        /// <summary>Evasion chance modifier (additive).</summary>
        public float EvasionMod;

        /// <summary>Critical hit chance modifier (additive).</summary>
        public float CriticalMod;

        /// <summary>
        /// Get default modifiers (no changes).
        /// </summary>
        public static ArenaModifier Default => new ArenaModifier
        {
            MovementSpeedMod = 1f,
            AttackSpeedMod = 1f,
            KnockbackMod = 1f,
            DisableAbilities = false,
            DisabledAbilityMask = 0,
            EvasionMod = 0f,
            CriticalMod = 0f
        };

        /// <summary>
        /// Get modifiers for bridge arena (narrow space).
        /// </summary>
        public static ArenaModifier Bridge => new ArenaModifier
        {
            MovementSpeedMod = 0.9f,       // Slightly slower due to careful movement
            AttackSpeedMod = 1f,
            KnockbackMod = 1.5f,           // Increased knockback (easier to fall)
            DisableAbilities = false,
            DisabledAbilityMask = 0,
            EvasionMod = -0.1f,            // Harder to dodge
            CriticalMod = 0f
        };

        /// <summary>
        /// Get modifiers for boat arena (rocking).
        /// </summary>
        public static ArenaModifier Boat => new ArenaModifier
        {
            MovementSpeedMod = 0.85f,      // Unsteady footing
            AttackSpeedMod = 0.9f,         // Harder to aim
            KnockbackMod = 1.3f,           // Easier to knock off
            DisableAbilities = false,
            DisabledAbilityMask = 0,
            EvasionMod = 0.05f,            // Unpredictable movement helps evasion
            CriticalMod = -0.05f           // Harder to land precise hits
        };

        /// <summary>
        /// Get modifiers for flooded interior (waist-deep water).
        /// </summary>
        public static ArenaModifier FloodedInterior => new ArenaModifier
        {
            MovementSpeedMod = 0.6f,       // Significant movement penalty
            AttackSpeedMod = 0.8f,         // Slower attacks in water
            KnockbackMod = 0.7f,           // Water resistance reduces knockback
            DisableAbilities = true,       // Some abilities disabled
            DisabledAbilityMask = 0x04,    // Disable fire-based abilities
            EvasionMod = -0.15f,           // Much harder to dodge in water
            CriticalMod = 0f
        };

        /// <summary>
        /// Get modifiers for open water (swimming).
        /// </summary>
        public static ArenaModifier OpenWater => new ArenaModifier
        {
            MovementSpeedMod = 0.5f,       // Swimming is slow
            AttackSpeedMod = 0.7f,         // Very hard to attack
            KnockbackMod = 0.5f,           // Water absorbs knockback
            DisableAbilities = true,       // Many abilities disabled
            DisabledAbilityMask = 0x0F,    // Disable most ability types
            EvasionMod = 0.1f,             // 3D movement aids evasion
            CriticalMod = -0.1f            // Hard to land precision hits
        };
    }

    /// <summary>
    /// Event raised when an entity falls off the arena.
    /// </summary>
    public struct FallEvent : IComponentData
    {
        public Entity FallenEntity;
        public Entity ArenaEntity;
        public float3 FallPosition;
        public float Damage;
        public bool IsLethal;
    }

    /// <summary>
    /// Event raised when an entity enters a hazard zone.
    /// </summary>
    public struct HazardContactEvent : IBufferElementData
    {
        public Entity AffectedEntity;
        public HazardType HazardType;
        public float3 ContactPosition;
        public float Damage;
        public float LastTickTime;
    }

    /// <summary>
    /// Tracks hazard tick timing per entity.
    /// </summary>
    public struct HazardTickState : IComponentData
    {
        public float TimeSinceLastTick;
        public HazardType CurrentHazardType;
        public bool IsInHazard;
    }

    /// <summary>
    /// Arena boundary warning component.
    /// Triggers UI/audio feedback when near edge.
    /// </summary>
    public struct BoundaryWarning : IComponentData
    {
        /// <summary>Distance from edge to start warning.</summary>
        public float WarningDistance;

        /// <summary>Current distance to nearest boundary.</summary>
        public float CurrentDistance;

        /// <summary>Whether warning is currently active.</summary>
        public bool IsWarningActive;

        /// <summary>Direction to arena center (for UI indicator).</summary>
        public float3 DirectionToCenter;
    }
}
