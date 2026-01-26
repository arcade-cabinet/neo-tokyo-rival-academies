using Unity.Entities;
using Unity.Mathematics;
using Unity.Collections;

namespace NeoTokyo.Components.World
{
    /// <summary>
    /// Water depth classification for flooded Neo-Tokyo.
    /// Determines movement penalties and combat modifiers.
    /// </summary>
    public enum WaterDepth : byte
    {
        None = 0,       // Dry land
        Shallow = 1,    // Ankle-deep (minor slowdown)
        WaistDeep = 2,  // Waist-deep (significant penalties)
        Deep = 3,       // Swimming required
        Submerged = 4   // Underwater/diving
    }

    /// <summary>
    /// Hazard types for water zones.
    /// </summary>
    public enum WaterHazardType : byte
    {
        None = 0,
        Toxic = 1,          // Poison damage over time
        Electric = 2,       // Shock damage, chain to nearby
        Freezing = 3,       // Slow effect, hypothermia
        Burning = 4,        // Oil fire on surface
        Acidic = 5          // Corrosive, equipment damage
    }

    /// <summary>
    /// Water zone component for hex tiles or area triggers.
    /// Defines the water properties for a region.
    /// </summary>
    public struct WaterZone : IComponentData
    {
        /// <summary>Depth classification of this water zone</summary>
        public WaterDepth Depth;

        /// <summary>Water current force (units per second)</summary>
        public float CurrentStrength;

        /// <summary>Direction of water current (normalized)</summary>
        public float3 CurrentDirection;

        /// <summary>Whether this zone has hazardous properties</summary>
        public bool IsHazardous;

        /// <summary>Type of hazard if IsHazardous is true</summary>
        public WaterHazardType HazardType;

        /// <summary>Damage per second from hazard</summary>
        public float HazardDamageRate;

        /// <summary>Visual water surface height</summary>
        public float SurfaceHeight;

        public static WaterZone Default => new WaterZone
        {
            Depth = WaterDepth.Shallow,
            CurrentStrength = 0f,
            CurrentDirection = float3.zero,
            IsHazardous = false,
            HazardType = WaterHazardType.None,
            HazardDamageRate = 0f,
            SurfaceHeight = 0f
        };

        public static WaterZone DeepWater(float surfaceHeight = 0f) => new WaterZone
        {
            Depth = WaterDepth.Deep,
            CurrentStrength = 0f,
            CurrentDirection = float3.zero,
            IsHazardous = false,
            HazardType = WaterHazardType.None,
            HazardDamageRate = 0f,
            SurfaceHeight = surfaceHeight
        };

        public static WaterZone ToxicWater(WaterDepth depth, float damageRate = 5f) => new WaterZone
        {
            Depth = depth,
            CurrentStrength = 0f,
            CurrentDirection = float3.zero,
            IsHazardous = true,
            HazardType = WaterHazardType.Toxic,
            HazardDamageRate = damageRate,
            SurfaceHeight = 0f
        };

        public static WaterZone ElectricWater(WaterDepth depth, float damageRate = 20f) => new WaterZone
        {
            Depth = depth,
            CurrentStrength = 0f,
            CurrentDirection = float3.zero,
            IsHazardous = true,
            HazardType = WaterHazardType.Electric,
            HazardDamageRate = damageRate,
            SurfaceHeight = 0f
        };
    }

    /// <summary>
    /// Component added to entities currently in water.
    /// Tracks water interaction state.
    /// </summary>
    public struct InWater : IComponentData
    {
        /// <summary>Current depth level the entity is experiencing</summary>
        public WaterDepth CurrentDepth;

        /// <summary>Total time spent submerged (for drowning)</summary>
        public float SubmersionTime;

        /// <summary>Whether entity is actively swimming</summary>
        public bool IsSwimming;

        /// <summary>Whether entity is underwater/diving</summary>
        public bool IsDiving;

        /// <summary>Reference to the water zone entity</summary>
        public Entity WaterZoneEntity;

        /// <summary>Accumulated hazard damage to apply</summary>
        public float AccumulatedHazardDamage;

        public static InWater Create(WaterDepth depth, Entity zoneEntity) => new InWater
        {
            CurrentDepth = depth,
            SubmersionTime = 0f,
            IsSwimming = depth >= WaterDepth.Deep,
            IsDiving = depth == WaterDepth.Submerged,
            WaterZoneEntity = zoneEntity,
            AccumulatedHazardDamage = 0f
        };
    }

    /// <summary>
    /// Movement modifier component applied based on water depth and conditions.
    /// Stacks with other movement modifiers.
    /// </summary>
    public struct MovementModifier : IComponentData
    {
        /// <summary>Multiplier for base movement speed (0.5 = half speed)</summary>
        public float SpeedMultiplier;

        /// <summary>Multiplier for jump height (0.0 = no jumping)</summary>
        public float JumpMultiplier;

        /// <summary>Whether dash/dodge abilities are available</summary>
        public bool CanDash;

        /// <summary>Whether sprinting is available</summary>
        public bool CanSprint;

        /// <summary>Additional drag from water currents</summary>
        public float3 CurrentForce;

        public static MovementModifier None => new MovementModifier
        {
            SpeedMultiplier = 1f,
            JumpMultiplier = 1f,
            CanDash = true,
            CanSprint = true,
            CurrentForce = float3.zero
        };

        public static MovementModifier ForWaterDepth(WaterDepth depth) => depth switch
        {
            WaterDepth.None => None,
            WaterDepth.Shallow => new MovementModifier
            {
                SpeedMultiplier = 0.85f,
                JumpMultiplier = 0.9f,
                CanDash = true,
                CanSprint = true,
                CurrentForce = float3.zero
            },
            WaterDepth.WaistDeep => new MovementModifier
            {
                SpeedMultiplier = 0.5f,
                JumpMultiplier = 0.5f,
                CanDash = false,
                CanSprint = false,
                CurrentForce = float3.zero
            },
            WaterDepth.Deep => new MovementModifier
            {
                SpeedMultiplier = 0.4f,
                JumpMultiplier = 0f,
                CanDash = false,
                CanSprint = false,
                CurrentForce = float3.zero
            },
            WaterDepth.Submerged => new MovementModifier
            {
                SpeedMultiplier = 0.35f,
                JumpMultiplier = 0f,
                CanDash = false,
                CanSprint = false,
                CurrentForce = float3.zero
            },
            _ => None
        };
    }

    /// <summary>
    /// Boat entity data for ferry routes and player-controlled boats.
    /// </summary>
    public struct BoatData : IComponentData
    {
        /// <summary>Unique identifier for this boat</summary>
        public FixedString64Bytes BoatId;

        /// <summary>Maximum passenger capacity</summary>
        public int Capacity;

        /// <summary>Current number of passengers aboard</summary>
        public int CurrentPassengers;

        /// <summary>Boat movement speed</summary>
        public float Speed;

        /// <summary>Rotation speed for steering</summary>
        public float TurnSpeed;

        /// <summary>Whether boat is currently in motion</summary>
        public bool IsMoving;

        /// <summary>Whether this is a ferry (follows fixed route)</summary>
        public bool IsFerry;

        /// <summary>Whether passengers can board</summary>
        public bool CanBoard;

        /// <summary>Current waypoint index in route</summary>
        public int CurrentWaypointIndex;

        /// <summary>Time waiting at current dock</summary>
        public float WaitTimer;

        public static BoatData Ferry(int capacity = 6, float speed = 5f) => new BoatData
        {
            BoatId = default,
            Capacity = capacity,
            CurrentPassengers = 0,
            Speed = speed,
            TurnSpeed = 2f,
            IsMoving = false,
            IsFerry = true,
            CanBoard = true,
            CurrentWaypointIndex = 0,
            WaitTimer = 0f
        };

        public static BoatData PlayerBoat(float speed = 8f) => new BoatData
        {
            BoatId = default,
            Capacity = 4,
            CurrentPassengers = 1,
            Speed = speed,
            TurnSpeed = 4f,
            IsMoving = false,
            IsFerry = false,
            CanBoard = false,
            CurrentWaypointIndex = 0,
            WaitTimer = 0f
        };

        public bool HasCapacity => CurrentPassengers < Capacity;
    }

    /// <summary>
    /// Tag component for entities currently on a boat.
    /// </summary>
    public struct OnBoat : IComponentData
    {
        /// <summary>The boat entity this passenger is on</summary>
        public Entity BoatEntity;

        /// <summary>Seat index on the boat (for positioning)</summary>
        public int SeatIndex;

        /// <summary>Whether this entity is the boat operator</summary>
        public bool IsOperator;
    }

    /// <summary>
    /// Waypoint buffer for boat routes (ferries).
    /// </summary>
    public struct BoatRoute : IBufferElementData
    {
        /// <summary>World position of this waypoint</summary>
        public float3 Waypoint;

        /// <summary>Time to wait at this stop (0 = pass through)</summary>
        public float WaitTime;

        /// <summary>Whether this is a dock (passengers can board/disembark)</summary>
        public bool IsDock;

        /// <summary>Dock entity for this stop (if IsDock)</summary>
        public Entity DockEntity;
    }

    /// <summary>
    /// Dock entity for boat boarding/disembarking.
    /// </summary>
    public struct DockData : IComponentData
    {
        /// <summary>Unique identifier for this dock</summary>
        public FixedString64Bytes DockId;

        /// <summary>Display name of the dock location</summary>
        public FixedString64Bytes LocationName;

        /// <summary>Position where passengers wait to board</summary>
        public float3 BoardingPosition;

        /// <summary>Position where passengers disembark</summary>
        public float3 DisembarkPosition;

        /// <summary>Whether a boat is currently docked here</summary>
        public bool HasBoatDocked;

        /// <summary>The docked boat entity (if any)</summary>
        public Entity DockedBoat;
    }

    /// <summary>
    /// Diving state for underwater exploration.
    /// </summary>
    public struct DivingState : IComponentData
    {
        /// <summary>Current oxygen remaining (seconds)</summary>
        public float OxygenRemaining;

        /// <summary>Maximum oxygen capacity (seconds)</summary>
        public float MaxOxygen;

        /// <summary>Current depth pressure (affects oxygen consumption)</summary>
        public float DepthPressure;

        /// <summary>Oxygen consumption rate multiplier</summary>
        public float OxygenConsumptionRate;

        /// <summary>Whether currently holding breath (vs using equipment)</summary>
        public bool IsHoldingBreath;

        /// <summary>Whether drowning damage is being applied</summary>
        public bool IsDrowning;

        public float OxygenRatio => MaxOxygen > 0 ? OxygenRemaining / MaxOxygen : 0f;
        public bool IsLowOxygen => OxygenRatio < 0.25f;
        public bool IsOutOfOxygen => OxygenRemaining <= 0f;

        public static DivingState Default => new DivingState
        {
            OxygenRemaining = 30f,
            MaxOxygen = 30f,
            DepthPressure = 1f,
            OxygenConsumptionRate = 1f,
            IsHoldingBreath = true,
            IsDrowning = false
        };

        public static DivingState WithEquipment(float maxOxygen = 120f) => new DivingState
        {
            OxygenRemaining = maxOxygen,
            MaxOxygen = maxOxygen,
            DepthPressure = 1f,
            OxygenConsumptionRate = 0.5f,
            IsHoldingBreath = false,
            IsDrowning = false
        };
    }

    /// <summary>
    /// Tag for entities that can swim (player, some NPCs).
    /// </summary>
    public struct CanSwim : IComponentData
    {
        /// <summary>Swimming proficiency (affects speed in water)</summary>
        public float SwimSpeed;

        /// <summary>Bonus to oxygen capacity</summary>
        public float OxygenBonus;
    }

    /// <summary>
    /// Tag for entities that cannot enter water (will avoid/take damage).
    /// </summary>
    public struct WaterAverse : IComponentData
    {
        /// <summary>Maximum water depth before taking damage</summary>
        public WaterDepth MaxTolerance;

        /// <summary>Damage per second when in intolerable water</summary>
        public float DamagePerSecond;
    }

    /// <summary>
    /// Request to board a boat.
    /// </summary>
    public struct BoardBoatRequest : IComponentData
    {
        public Entity Passenger;
        public Entity TargetBoat;
    }

    /// <summary>
    /// Request to disembark from a boat.
    /// </summary>
    public struct DisembarkRequest : IComponentData
    {
        public Entity Passenger;
        public Entity TargetDock;
    }

    /// <summary>
    /// Combat modifiers applied when in water.
    /// </summary>
    public struct WaterCombatModifier : IComponentData
    {
        /// <summary>Attack speed multiplier</summary>
        public float AttackSpeedMultiplier;

        /// <summary>Whether fire abilities are disabled</summary>
        public bool FireAbilitiesDisabled;

        /// <summary>Whether electric abilities chain to nearby targets</summary>
        public bool ElectricAbilitiesChain;

        /// <summary>Knockback distance multiplier (increased in water)</summary>
        public float KnockbackMultiplier;

        /// <summary>Whether heavy attacks are available</summary>
        public bool CanHeavyAttack;

        public static WaterCombatModifier ForDepth(WaterDepth depth) => depth switch
        {
            WaterDepth.None => new WaterCombatModifier
            {
                AttackSpeedMultiplier = 1f,
                FireAbilitiesDisabled = false,
                ElectricAbilitiesChain = false,
                KnockbackMultiplier = 1f,
                CanHeavyAttack = true
            },
            WaterDepth.Shallow => new WaterCombatModifier
            {
                AttackSpeedMultiplier = 0.95f,
                FireAbilitiesDisabled = false,
                ElectricAbilitiesChain = true,
                KnockbackMultiplier = 1.1f,
                CanHeavyAttack = true
            },
            WaterDepth.WaistDeep => new WaterCombatModifier
            {
                AttackSpeedMultiplier = 0.7f,
                FireAbilitiesDisabled = true,
                ElectricAbilitiesChain = true,
                KnockbackMultiplier = 1.5f,
                CanHeavyAttack = false
            },
            WaterDepth.Deep or WaterDepth.Submerged => new WaterCombatModifier
            {
                AttackSpeedMultiplier = 0.5f,
                FireAbilitiesDisabled = true,
                ElectricAbilitiesChain = true,
                KnockbackMultiplier = 2f,
                CanHeavyAttack = false
            },
            _ => new WaterCombatModifier
            {
                AttackSpeedMultiplier = 1f,
                FireAbilitiesDisabled = false,
                ElectricAbilitiesChain = false,
                KnockbackMultiplier = 1f,
                CanHeavyAttack = true
            }
        };
    }
}
