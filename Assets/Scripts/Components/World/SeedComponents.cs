using Unity.Entities;
using Unity.Collections;
using Unity.Mathematics;

namespace NeoTokyo.Components.World
{
    /// <summary>
    /// Unique identifier for territories in the flooded Neo-Tokyo world.
    /// Uses FixedString for ECS compatibility while preserving the ID semantics
    /// from the Golden Record's 10 canonical territories.
    /// </summary>
    public struct TerritoryId
    {
        public FixedString64Bytes Value;

        public TerritoryId(string id)
        {
            Value = new FixedString64Bytes(id);
        }

        public static TerritoryId FromString(string id) => new TerritoryId(id);

        public override string ToString() => Value.ToString();

        public override int GetHashCode() => Value.GetHashCode();

        public bool Equals(TerritoryId other) => Value.Equals(other.Value);

        public static bool operator ==(TerritoryId left, TerritoryId right) => left.Equals(right);
        public static bool operator !=(TerritoryId left, TerritoryId right) => !left.Equals(right);

        public override bool Equals(object obj) => obj is TerritoryId other && Equals(other);

        // Pre-defined canonical territory IDs from Golden Record
        public static readonly TerritoryId KurenaiAcademy = new TerritoryId("kurenai-academy");
        public static readonly TerritoryId AzureAcademy = new TerritoryId("azure-academy");
        public static readonly TerritoryId CollectiveMarket = new TerritoryId("collective-market");
        public static readonly TerritoryId EasternRefuge = new TerritoryId("eastern-refuge");
        public static readonly TerritoryId WesternRefuge = new TerritoryId("western-refuge");
        public static readonly TerritoryId SyndicateDocks = new TerritoryId("syndicate-docks");
        public static readonly TerritoryId RunnersCanal = new TerritoryId("runners-canal");
        public static readonly TerritoryId ShrineHeights = new TerritoryId("shrine-heights");
        public static readonly TerritoryId DeepReach = new TerritoryId("deep-reach");
        public static readonly TerritoryId DrownedArchives = new TerritoryId("drowned-archives");
    }

    /// <summary>
    /// World-level seed component. The master seed from which all other seeds are derived.
    /// Following the Golden Record hierarchy: masterSeed -> territorySeeds[] -> connectionSeeds[] -> populationSeeds[]
    /// </summary>
    public struct WorldSeed : IComponentData
    {
        /// <summary>
        /// The master seed value used for all deterministic generation.
        /// Same master seed = same world every time.
        /// </summary>
        public uint MasterSeed;

        /// <summary>
        /// Human-readable seed name for identification and sharing.
        /// Example: "flooded-tokyo-2026", "tournament-arena-alpha"
        /// </summary>
        public FixedString64Bytes SeedName;

        /// <summary>
        /// Unix timestamp when this world was first generated.
        /// Used for versioning and cache invalidation.
        /// </summary>
        public long GeneratedTimestamp;

        /// <summary>
        /// Create a WorldSeed from a string name.
        /// The string is hashed to produce the numeric seed value.
        /// </summary>
        public static WorldSeed FromName(string seedName)
        {
            return new WorldSeed
            {
                MasterSeed = SeedHashUtility.HashString(seedName),
                SeedName = new FixedString64Bytes(seedName),
                GeneratedTimestamp = System.DateTimeOffset.UtcNow.ToUnixTimeSeconds()
            };
        }

        /// <summary>
        /// Create a WorldSeed from an explicit numeric value.
        /// </summary>
        public static WorldSeed FromValue(uint seedValue, string displayName = "")
        {
            return new WorldSeed
            {
                MasterSeed = seedValue,
                SeedName = new FixedString64Bytes(displayName),
                GeneratedTimestamp = System.DateTimeOffset.UtcNow.ToUnixTimeSeconds()
            };
        }
    }

    /// <summary>
    /// Per-territory seed component for deterministic territory generation.
    /// Each territory gets a unique seed derived from the master seed.
    /// </summary>
    public struct TerritorySeed : IComponentData
    {
        /// <summary>
        /// Derived seed value for this specific territory.
        /// Used to generate all terrain, structures, and layout within the territory.
        /// </summary>
        public uint Seed;

        /// <summary>
        /// The territory this seed belongs to.
        /// </summary>
        public TerritoryId Territory;

        /// <summary>
        /// Elevation seed sub-component for terrain height variation.
        /// </summary>
        public uint ElevationSeed;

        /// <summary>
        /// Structure seed sub-component for shelter/building placement.
        /// </summary>
        public uint StructureSeed;

        /// <summary>
        /// Decoration seed sub-component for props and details.
        /// </summary>
        public uint DecorationSeed;
    }

    /// <summary>
    /// Connection seed for deterministic bridge and route generation between territories.
    /// Ensures identical connections are generated for the same seed.
    /// </summary>
    public struct ConnectionSeed : IComponentData
    {
        /// <summary>
        /// Derived seed value for this connection.
        /// </summary>
        public uint Seed;

        /// <summary>
        /// Source territory of the connection.
        /// </summary>
        public TerritoryId FromTerritory;

        /// <summary>
        /// Destination territory of the connection.
        /// </summary>
        public TerritoryId ToTerritory;

        /// <summary>
        /// Connection type determined by seed and distance.
        /// </summary>
        public ConnectionGenerationType ConnectionType;

        /// <summary>
        /// Variation seed for aesthetic differences (texture, wear, etc.)
        /// </summary>
        public uint VariationSeed;
    }

    /// <summary>
    /// Types of connections that can be generated between territories.
    /// </summary>
    public enum ConnectionGenerationType : byte
    {
        /// <summary>Physical walking bridge (short distance)</summary>
        Bridge = 0,
        /// <summary>Cable suspension bridge (medium distance)</summary>
        CableBridge = 1,
        /// <summary>Pontoon floating bridge (over water)</summary>
        PontoonBridge = 2,
        /// <summary>Boat route requiring watercraft (long distance)</summary>
        BoatRoute = 3,
        /// <summary>Zip line or cable transport</summary>
        CableLine = 4
    }

    /// <summary>
    /// Population seed for deterministic NPC, enemy, and item placement within a territory.
    /// Supports layered generation (e.g., different seeds for enemies vs civilians).
    /// </summary>
    public struct PopulationSeed : IComponentData
    {
        /// <summary>
        /// Derived seed value for population generation.
        /// </summary>
        public uint Seed;

        /// <summary>
        /// Territory this population belongs to.
        /// </summary>
        public TerritoryId Territory;

        /// <summary>
        /// Population layer for multi-pass generation.
        /// Layer 0: Essential NPCs (quest givers, vendors)
        /// Layer 1: Regular NPCs (civilians, guards)
        /// Layer 2: Enemies
        /// Layer 3: Items and loot
        /// </summary>
        public int Layer;

        /// <summary>
        /// Sub-seed for spawn point selection.
        /// </summary>
        public uint SpawnPointSeed;

        /// <summary>
        /// Sub-seed for entity variant selection.
        /// </summary>
        public uint VariantSeed;

        /// <summary>
        /// Sub-seed for equipment and inventory generation.
        /// </summary>
        public uint EquipmentSeed;
    }

    /// <summary>
    /// Population layer constants for semantic clarity.
    /// </summary>
    public static class PopulationLayer
    {
        public const int Essential = 0;
        public const int Regular = 1;
        public const int Enemy = 2;
        public const int Loot = 3;
        public const int Ambient = 4;
    }

    /// <summary>
    /// Random state component for entities that need persistent RNG.
    /// Uses Unity.Mathematics.Random which is a Burst-compatible xorshift128+ implementation.
    /// </summary>
    public struct RandomState : IComponentData
    {
        /// <summary>
        /// The random number generator state.
        /// This preserves the full RNG state for save/load support.
        /// </summary>
        public Unity.Mathematics.Random Random;

        /// <summary>
        /// Create a RandomState seeded from a uint value.
        /// </summary>
        public static RandomState Create(uint seed)
        {
            // Unity.Mathematics.Random requires non-zero seed
            return new RandomState
            {
                Random = new Unity.Mathematics.Random(seed != 0 ? seed : 1u)
            };
        }

        /// <summary>
        /// Create a RandomState from an existing Random instance.
        /// </summary>
        public static RandomState FromRandom(Unity.Mathematics.Random random)
        {
            return new RandomState { Random = random };
        }
    }

    /// <summary>
    /// Tag component indicating an entity was procedurally generated.
    /// Useful for identifying which entities should be regenerated on seed change.
    /// </summary>
    public struct ProcedurallyGenerated : IComponentData
    {
        /// <summary>
        /// The seed value that was used to generate this entity.
        /// Used for regeneration validation.
        /// </summary>
        public uint SourceSeed;

        /// <summary>
        /// Generation pass index (for multi-pass generation).
        /// </summary>
        public int GenerationPass;
    }

    /// <summary>
    /// Request component to trigger world generation from a master seed.
    /// </summary>
    public struct GenerateWorldRequest : IComponentData
    {
        /// <summary>
        /// The seed name or value to use for generation.
        /// </summary>
        public FixedString64Bytes SeedName;

        /// <summary>
        /// Whether to clear existing procedurally generated entities first.
        /// </summary>
        public bool ClearExisting;

        /// <summary>
        /// Specific territories to generate (empty = all).
        /// </summary>
        public FixedList128Bytes<FixedString32Bytes> TerritoriesToGenerate;
    }

    /// <summary>
    /// Event fired when world generation completes for a territory.
    /// </summary>
    public struct TerritoryGeneratedEvent : IComponentData
    {
        public TerritoryId Territory;
        public uint Seed;
        public int TileCount;
        public int EntityCount;
        public int NPCCount;
        public int ConnectionCount;
        public float GenerationTimeMs;
    }

    /// <summary>
    /// Event fired when full world generation completes.
    /// </summary>
    public struct WorldGeneratedEvent : IComponentData
    {
        public uint MasterSeed;
        public FixedString64Bytes SeedName;
        public int TerritoryCount;
        public int TotalTileCount;
        public int TotalEntityCount;
        public int TotalConnectionCount;
        public float TotalGenerationTimeMs;
    }

    /// <summary>
    /// Utility class for seed hashing operations.
    /// Provides deterministic hash functions for deriving sub-seeds.
    /// </summary>
    public static class SeedHashUtility
    {
        // FNV-1a hash constants for 32-bit hashing
        private const uint FNV_OFFSET_BASIS = 2166136261u;
        private const uint FNV_PRIME = 16777619u;

        /// <summary>
        /// Hash a string to a uint seed value using FNV-1a.
        /// </summary>
        public static uint HashString(string input)
        {
            if (string.IsNullOrEmpty(input))
                return FNV_OFFSET_BASIS;

            uint hash = FNV_OFFSET_BASIS;
            foreach (char c in input)
            {
                hash ^= c;
                hash *= FNV_PRIME;
            }
            return hash;
        }

        /// <summary>
        /// Hash a FixedString64Bytes to a uint seed value.
        /// </summary>
        public static uint HashFixedString(FixedString64Bytes input)
        {
            uint hash = FNV_OFFSET_BASIS;
            for (int i = 0; i < input.Length; i++)
            {
                hash ^= input[i];
                hash *= FNV_PRIME;
            }
            return hash;
        }

        /// <summary>
        /// Combine two seeds into a new derived seed.
        /// Order matters: Combine(a, b) != Combine(b, a)
        /// </summary>
        public static uint Combine(uint seed1, uint seed2)
        {
            // Use a mixing function to combine seeds
            uint hash = seed1;
            hash ^= seed2 + 0x9e3779b9 + (hash << 6) + (hash >> 2);
            return hash;
        }

        /// <summary>
        /// Combine a seed with an integer index.
        /// Useful for generating arrays of sub-seeds.
        /// </summary>
        public static uint Combine(uint seed, int index)
        {
            return Combine(seed, (uint)index);
        }

        /// <summary>
        /// Combine a seed with a TerritoryId.
        /// </summary>
        public static uint Combine(uint seed, TerritoryId territoryId)
        {
            return Combine(seed, HashFixedString(territoryId.Value));
        }

        /// <summary>
        /// Generate a sequence of derived seeds from a base seed.
        /// </summary>
        public static void GenerateSequence(uint baseSeed, NativeArray<uint> output)
        {
            uint current = baseSeed;
            for (int i = 0; i < output.Length; i++)
            {
                current = Combine(current, (uint)i);
                output[i] = current;
            }
        }
    }
}
