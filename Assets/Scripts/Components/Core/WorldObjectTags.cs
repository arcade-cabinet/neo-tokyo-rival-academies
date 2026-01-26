using Unity.Entities;
using Unity.Mathematics;

namespace NeoTokyo.Components.Core
{
    /// <summary>
    /// Tag component for platform entities (walkable surfaces).
    /// Equivalent to TypeScript: isPlatform?: boolean in ECSEntity
    /// </summary>
    public struct PlatformTag : IComponentData { }

    /// <summary>
    /// Tag component for collectible entities (pickups, items).
    /// Equivalent to TypeScript: isCollectible?: boolean in ECSEntity
    /// </summary>
    public struct CollectibleTag : IComponentData { }

    /// <summary>
    /// Tag component for interactable entities (doors, switches, NPCs).
    /// Equivalent to TypeScript: isInteractable?: boolean in ECSEntity
    /// </summary>
    public struct InteractableTag : IComponentData { }

    /// <summary>
    /// Tag component for destructible entities (breakable objects).
    /// Equivalent to TypeScript: isDestructible?: boolean in ECSEntity
    /// </summary>
    public struct DestructibleTag : IComponentData { }

    /// <summary>
    /// Tag component for trigger zone entities (area triggers, event zones).
    /// Equivalent to TypeScript: isTriggerZone?: boolean in ECSEntity
    /// </summary>
    public struct TriggerZoneTag : IComponentData { }

    /// <summary>
    /// Obstacle type enumeration for world obstacles.
    /// Matches flooded Neo-Tokyo environment types.
    /// </summary>
    public enum ObstacleType : byte
    {
        Wall = 0,
        Fence = 1,
        Debris = 2,
        Vehicle = 3,
        Furniture = 4,
        Natural = 5
    }

    /// <summary>
    /// Obstacle component for blocking entities in the world.
    /// Equivalent to TypeScript: Obstacle interface in ECSEntity
    /// </summary>
    public struct Obstacle : IComponentData
    {
        /// <summary>The type of obstacle for interaction/collision behavior</summary>
        public ObstacleType Type;

        /// <summary>Whether this obstacle can be destroyed</summary>
        public bool IsDestructible;

        /// <summary>Health for destructible obstacles (0 = not destructible)</summary>
        public int Health;

        public static Obstacle Create(ObstacleType type, bool destructible = false, int health = 0)
        {
            return new Obstacle
            {
                Type = type,
                IsDestructible = destructible,
                Health = destructible ? health : 0
            };
        }

        /// <summary>
        /// Create a standard wall obstacle.
        /// </summary>
        public static Obstacle Wall => new Obstacle
        {
            Type = ObstacleType.Wall,
            IsDestructible = false,
            Health = 0
        };

        /// <summary>
        /// Create a destructible debris obstacle.
        /// </summary>
        public static Obstacle Debris(int health = 50) => new Obstacle
        {
            Type = ObstacleType.Debris,
            IsDestructible = true,
            Health = health
        };
    }

    /// <summary>
    /// Platform data component for extended platform functionality.
    /// Supports static and moving platforms in flooded Neo-Tokyo.
    /// </summary>
    public struct PlatformData : IComponentData
    {
        /// <summary>Height of the platform above water level</summary>
        public float Height;

        /// <summary>Whether the platform moves along a path</summary>
        public bool IsMoving;

        /// <summary>Direction of movement (normalized)</summary>
        public float3 MoveDirection;

        /// <summary>Speed of platform movement in units/second</summary>
        public float MoveSpeed;

        /// <summary>Total distance the platform travels before reversing</summary>
        public float MoveDistance;

        /// <summary>Current position along the movement path (0 to MoveDistance)</summary>
        public float CurrentOffset;

        /// <summary>Movement direction multiplier (+1 forward, -1 reverse)</summary>
        public int MovePhase;

        public static PlatformData Static(float height = 0f) => new PlatformData
        {
            Height = height,
            IsMoving = false,
            MoveDirection = float3.zero,
            MoveSpeed = 0f,
            MoveDistance = 0f,
            CurrentOffset = 0f,
            MovePhase = 1
        };

        public static PlatformData Moving(float height, float3 direction, float speed, float distance) => new PlatformData
        {
            Height = height,
            IsMoving = true,
            MoveDirection = math.normalize(direction),
            MoveSpeed = speed,
            MoveDistance = distance,
            CurrentOffset = 0f,
            MovePhase = 1
        };
    }

    /// <summary>
    /// Collectible type enumeration matching ECSEntity types.
    /// </summary>
    public enum CollectibleType : byte
    {
        HealthPickup = 0,
        ManaPickup = 1,
        Currency = 2,
        KeyItem = 3,
        Equipment = 4,
        Consumable = 5,
        QuestItem = 6,
        Material = 7,
        Rare = 8
    }

    /// <summary>
    /// Collectible data component for pickup items.
    /// Equivalent to TypeScript: Collectible interface in ECSEntity
    /// </summary>
    public struct CollectibleData : IComponentData
    {
        /// <summary>The type of collectible</summary>
        public CollectibleType Type;

        /// <summary>Value of the collectible (amount healed, currency value, etc.)</summary>
        public int Value;

        /// <summary>Whether this collectible has been picked up</summary>
        public bool IsCollected;

        /// <summary>Time in seconds before respawn (-1 for no respawn)</summary>
        public float RespawnTime;

        /// <summary>Time remaining until respawn (0 when available)</summary>
        public float RespawnTimer;

        /// <summary>Item ID reference for equipment/key items</summary>
        public int ItemId;

        public static CollectibleData HealthPickup(int healAmount = 25) => new CollectibleData
        {
            Type = CollectibleType.HealthPickup,
            Value = healAmount,
            IsCollected = false,
            RespawnTime = 30f,
            RespawnTimer = 0f,
            ItemId = 0
        };

        public static CollectibleData ManaPickup(int manaAmount = 15) => new CollectibleData
        {
            Type = CollectibleType.ManaPickup,
            Value = manaAmount,
            IsCollected = false,
            RespawnTime = 30f,
            RespawnTimer = 0f,
            ItemId = 0
        };

        public static CollectibleData Currency(int amount = 10) => new CollectibleData
        {
            Type = CollectibleType.Currency,
            Value = amount,
            IsCollected = false,
            RespawnTime = -1f,
            RespawnTimer = 0f,
            ItemId = 0
        };

        public static CollectibleData KeyItem(int itemId) => new CollectibleData
        {
            Type = CollectibleType.KeyItem,
            Value = 1,
            IsCollected = false,
            RespawnTime = -1f,
            RespawnTimer = 0f,
            ItemId = itemId
        };

        public static CollectibleData EquipmentDrop(int itemId) => new CollectibleData
        {
            Type = CollectibleType.Equipment,
            Value = 1,
            IsCollected = false,
            RespawnTime = -1f,
            RespawnTimer = 0f,
            ItemId = itemId
        };

        public static CollectibleData QuestItem(int itemId) => new CollectibleData
        {
            Type = CollectibleType.QuestItem,
            Value = 1,
            IsCollected = false,
            RespawnTime = -1f,
            RespawnTimer = 0f,
            ItemId = itemId
        };
    }

    /// <summary>
    /// Model color component for visual customization.
    /// Supports tinting and emissive effects for characters and objects.
    /// </summary>
    public struct ModelColor : IComponentData
    {
        /// <summary>RGBA color value (linear space)</summary>
        public float4 Color;

        /// <summary>Emissive intensity multiplier (0 = no emission)</summary>
        public float EmissiveIntensity;

        /// <summary>Whether the color is dirty and needs shader update</summary>
        public bool IsDirty;

        public static ModelColor Default => new ModelColor
        {
            Color = new float4(1f, 1f, 1f, 1f),
            EmissiveIntensity = 0f,
            IsDirty = false
        };

        public static ModelColor FromRGB(float r, float g, float b, float alpha = 1f) => new ModelColor
        {
            Color = new float4(r, g, b, alpha),
            EmissiveIntensity = 0f,
            IsDirty = true
        };

        public static ModelColor WithEmission(float r, float g, float b, float intensity) => new ModelColor
        {
            Color = new float4(r, g, b, 1f),
            EmissiveIntensity = intensity,
            IsDirty = true
        };

        /// <summary>
        /// Kurenai Academy faction color (passionate red).
        /// </summary>
        public static ModelColor Kurenai => new ModelColor
        {
            Color = new float4(0.9f, 0.2f, 0.2f, 1f),
            EmissiveIntensity = 0.3f,
            IsDirty = true
        };

        /// <summary>
        /// Azure Academy faction color (logical blue).
        /// </summary>
        public static ModelColor Azure => new ModelColor
        {
            Color = new float4(0.2f, 0.4f, 0.9f, 1f),
            EmissiveIntensity = 0.3f,
            IsDirty = true
        };
    }

    /// <summary>
    /// Trigger zone data for area-based events.
    /// Supports various trigger conditions and effects.
    /// </summary>
    public struct TriggerZoneData : IComponentData
    {
        /// <summary>The type of trigger effect</summary>
        public TriggerType Type;

        /// <summary>Radius of the trigger zone in world units</summary>
        public float Radius;

        /// <summary>Whether the trigger has been activated</summary>
        public bool IsTriggered;

        /// <summary>Whether the trigger resets after activation</summary>
        public bool IsOneShot;

        /// <summary>Cooldown time before trigger can activate again</summary>
        public float Cooldown;

        /// <summary>Current cooldown timer</summary>
        public float CooldownTimer;

        /// <summary>Associated quest ID (for quest triggers)</summary>
        public int QuestId;

        /// <summary>Associated event ID (for scripted events)</summary>
        public int EventId;
    }

    /// <summary>
    /// Trigger type enumeration for zone effects.
    /// </summary>
    public enum TriggerType : byte
    {
        None = 0,
        Dialogue = 1,
        Combat = 2,
        QuestUpdate = 3,
        Teleport = 4,
        Cutscene = 5,
        Spawn = 6,
        Hazard = 7,
        Checkpoint = 8
    }
}
