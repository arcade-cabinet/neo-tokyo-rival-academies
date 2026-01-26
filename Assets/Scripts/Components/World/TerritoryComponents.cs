using Unity.Collections;
using Unity.Entities;
using Unity.Mathematics;
using NeoTokyo.Components.Faction;

namespace NeoTokyo.Components.World
{
    /// <summary>
    /// Territory type classification based on Golden Record.
    /// Determines environmental hazards, NPC spawning, and visual theming.
    /// </summary>
    public enum TerritoryType : byte
    {
        Academy = 0,    // Training platforms, fair ground (Kurenai, Azure)
        Market = 1,     // Cluttered, environmental objects (Collective Market)
        Refuge = 2,     // Tight spaces, civilian concerns (Eastern/Western Refuge)
        Industrial = 3, // Industrial hazards, machines (Syndicate Docks)
        Sacred = 4,     // Sacred peace, council meetings (Shrine Heights)
        Depths = 5,     // Salvage site, dangerous diving (Deep Reach, Drowned Archives)
        Transition = 6  // Canal networks, speedboat docks (Runner's Canal)
    }

    /// <summary>
    /// Canonical territory identifiers from Golden Record v2.0.
    /// 10 territories representing the flooded Neo-Tokyo world.
    /// </summary>
    public enum TerritoryId : byte
    {
        None = 0,
        KurenaiAcademy = 1,     // #1: Training platforms, red tarps (Kurenai faction)
        AzureAcademy = 2,       // #2: Workshop towers, blue canopies (Azure faction)
        CollectiveMarket = 3,   // #3: Floating stalls, crowded docks (Neutral)
        EasternRefuge = 4,      // #4: Dense housing, gardens (Kurenai-leaning)
        WesternRefuge = 5,      // #5: Organized shelters, cisterns (Azure-leaning)
        SyndicateDocks = 6,     // #6: Gambling barges, warehouses (Syndicate faction)
        RunnersCanal = 7,       // #7: Speedboat docks, racing course (Runners faction)
        ShrineHeights = 8,      // #8: Sacred peace, council meetings (Neutral)
        DeepReach = 9,          // #9: Salvage site, dangerous diving (Contested)
        DrownedArchives = 10    // #10: Submerged library, cult territory (Drowned faction)
    }

    /// <summary>
    /// Core territory data defining static properties.
    /// Attached to territory entities created by TerritoryDefinitions factory.
    /// </summary>
    public struct TerritoryData : IComponentData
    {
        /// <summary>Canonical territory identifier.</summary>
        public TerritoryId Id;

        /// <summary>Territory classification (Academy, Market, etc.).</summary>
        public TerritoryType Type;

        /// <summary>Display name for UI.</summary>
        public FixedString64Bytes Name;

        /// <summary>Default controlling faction.</summary>
        public FactionType ControllingFaction;

        /// <summary>World-space center position.</summary>
        public float3 CenterPosition;

        /// <summary>Approximate radius for territory detection.</summary>
        public float Radius;

        /// <summary>
        /// Challenge rating 1-10.
        /// 1-3: Tutorial/safe zones
        /// 4-6: Standard gameplay
        /// 7-9: Challenging areas
        /// 10: End-game content
        /// </summary>
        public int DifficultyLevel;

        /// <summary>Ambient sound identifier.</summary>
        public FixedString32Bytes AmbientSound;

        /// <summary>Music track identifier.</summary>
        public FixedString32Bytes MusicTrack;
    }

    /// <summary>
    /// Dynamic territory control state.
    /// Changes based on faction warfare, quest outcomes, and player actions.
    /// </summary>
    public struct TerritoryControl : IComponentData
    {
        /// <summary>Current controlling faction (may differ from default).</summary>
        public FactionType CurrentController;

        /// <summary>Control strength 0-100. Below 50 triggers contested state.</summary>
        public float ControlStrength;

        /// <summary>True when multiple factions are fighting for control.</summary>
        public bool IsContested;

        /// <summary>Time remaining in contested state (seconds).</summary>
        public float ContestedTimer;

        /// <summary>Previous controller before takeover began.</summary>
        public FactionType PreviousController;

        /// <summary>Control points accumulated by attacker.</summary>
        public float AttackerProgress;

        /// <summary>Faction attempting takeover (if contested).</summary>
        public FactionType AttackingFaction;
    }

    /// <summary>
    /// Axis-aligned bounding box for territory spatial queries.
    /// Used for fast point-in-territory checks.
    /// </summary>
    public struct TerritoryBounds : IComponentData
    {
        /// <summary>Minimum corner of AABB (x, y, z).</summary>
        public float3 Min;

        /// <summary>Maximum corner of AABB (x, y, z).</summary>
        public float3 Max;

        /// <summary>
        /// Check if a world position is within bounds.
        /// </summary>
        public readonly bool Contains(float3 position)
        {
            return position.x >= Min.x && position.x <= Max.x &&
                   position.y >= Min.y && position.y <= Max.y &&
                   position.z >= Min.z && position.z <= Max.z;
        }

        /// <summary>
        /// Check if position is within bounds on XZ plane (ignoring height).
        /// </summary>
        public readonly bool ContainsXZ(float3 position)
        {
            return position.x >= Min.x && position.x <= Max.x &&
                   position.z >= Min.z && position.z <= Max.z;
        }

        /// <summary>
        /// Get the center of the bounds.
        /// </summary>
        public readonly float3 Center => (Min + Max) * 0.5f;

        /// <summary>
        /// Get the size of the bounds.
        /// </summary>
        public readonly float3 Size => Max - Min;
    }

    /// <summary>
    /// Attached to player entity to track current territory location.
    /// Updated by TerritorySystem based on player position.
    /// </summary>
    public struct ActiveTerritory : IComponentData
    {
        /// <summary>Territory the entity is currently in.</summary>
        public TerritoryId CurrentTerritory;

        /// <summary>Previous territory (for transition detection).</summary>
        public TerritoryId PreviousTerritory;

        /// <summary>Time spent in current territory (seconds).</summary>
        public float TimeInTerritory;

        /// <summary>True if entity just entered a new territory this frame.</summary>
        public bool JustEntered;

        /// <summary>True if entity just exited a territory this frame.</summary>
        public bool JustExited;
    }

    /// <summary>
    /// Procedural generation signature for deterministic world creation.
    /// Matches Golden Record seed-based generation approach.
    /// </summary>
    public struct TerritorySignature : IComponentData
    {
        /// <summary>Master world seed.</summary>
        public int MasterSeed;

        /// <summary>Derived seed for this specific territory.</summary>
        public int TerritorySeed;

        /// <summary>Generation timestamp (for versioning).</summary>
        public long GeneratedTimestamp;
    }

    /// <summary>
    /// Tag for the territory manager singleton entity.
    /// </summary>
    public struct TerritoryManagerTag : IComponentData { }

    /// <summary>
    /// Request to enter a territory (triggers loading, events).
    /// </summary>
    public struct EnterTerritoryRequest : IComponentData
    {
        public TerritoryId TargetTerritory;
        public float3 SpawnPosition;
        public bool ForceReload;
    }

    /// <summary>
    /// Event fired when player enters a new territory.
    /// Consumed by UI, audio, and quest systems.
    /// </summary>
    public struct TerritoryEnteredEvent : IComponentData
    {
        public TerritoryId Territory;
        public TerritoryId PreviousTerritory;
        public FactionType ControllingFaction;
        public ReputationLevel PlayerStanding;
        public bool IsHostile;
        public float TimeStamp;
    }

    /// <summary>
    /// Event fired when territory control changes.
    /// </summary>
    public struct TerritoryControlChangedEvent : IComponentData
    {
        public TerritoryId Territory;
        public FactionType OldController;
        public FactionType NewController;
        public float TimeStamp;
    }

    /// <summary>
    /// Buffer for tracking discovered territories.
    /// Attached to player entity for save/load.
    /// </summary>
    public struct DiscoveredTerritoryElement : IBufferElementData
    {
        public TerritoryId Territory;
        public long DiscoveredTimestamp;
        public int VisitCount;
    }

    /// <summary>
    /// Singleton tracking global territory state.
    /// </summary>
    public struct TerritoryStateSingleton : IComponentData
    {
        /// <summary>Currently active territory for streaming.</summary>
        public TerritoryId ActiveTerritory;

        /// <summary>Number of territories discovered by player.</summary>
        public int DiscoveredCount;

        /// <summary>Total territories in the world.</summary>
        public int TotalTerritories;

        /// <summary>True if any territory is currently contested.</summary>
        public bool HasContestedTerritory;

        /// <summary>Master world seed for generation.</summary>
        public int WorldSeed;
    }

    /// <summary>
    /// Connection between two territories (bridge, boat route, etc.).
    /// </summary>
    public struct TerritoryConnection : IComponentData
    {
        public TerritoryId SourceTerritory;
        public TerritoryId TargetTerritory;
        public float3 SourcePosition;
        public float3 TargetPosition;
        public ConnectionTypeFlag ConnectionType;
        public bool IsUnlocked;
        public float TravelTime;
    }

    /// <summary>
    /// Connection type flags (can be combined).
    /// </summary>
    [System.Flags]
    public enum ConnectionTypeFlag : byte
    {
        None = 0,
        Bridge = 1,
        BoatRoute = 2,
        Cable = 4,
        Tunnel = 8,
        Door = 16
    }
}
