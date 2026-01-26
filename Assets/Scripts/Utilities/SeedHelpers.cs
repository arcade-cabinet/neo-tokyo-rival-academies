using Unity.Collections;
using Unity.Mathematics;
using NeoTokyo.Components.World;

namespace NeoTokyo.Utilities
{
    /// <summary>
    /// Helper functions for deriving deterministic sub-seeds from the master seed.
    /// Implements the Golden Record seed hierarchy:
    /// masterSeed -> territorySeeds[] -> connectionSeeds[] -> populationSeeds[]
    ///
    /// All functions are pure and deterministic: same inputs always produce same outputs.
    /// </summary>
    public static class SeedHelpers
    {
        // Domain separation constants to prevent seed collision across different generation passes
        private const uint DOMAIN_TERRITORY = 0x54455252u;     // "TERR"
        private const uint DOMAIN_CONNECTION = 0x434F4E4Eu;    // "CONN"
        private const uint DOMAIN_POPULATION = 0x504F5055u;    // "POPU"
        private const uint DOMAIN_ELEVATION = 0x454C4556u;     // "ELEV"
        private const uint DOMAIN_STRUCTURE = 0x53545255u;     // "STRU"
        private const uint DOMAIN_DECORATION = 0x4445434Fu;    // "DECO"
        private const uint DOMAIN_SPAWN = 0x5350574Eu;         // "SPWN"
        private const uint DOMAIN_VARIANT = 0x56415249u;       // "VARI"
        private const uint DOMAIN_EQUIPMENT = 0x45515549u;     // "EQUI"
        private const uint DOMAIN_WEATHER = 0x57454154u;       // "WEAT"
        private const uint DOMAIN_EVENT = 0x4556454Eu;         // "EVEN"

        #region Territory Seeds

        /// <summary>
        /// Derive a territory seed from the master seed and territory ID.
        /// Used for generating terrain, structures, and layout within a territory.
        /// </summary>
        /// <param name="masterSeed">The world's master seed</param>
        /// <param name="territoryId">The target territory identifier</param>
        /// <returns>A deterministic seed unique to this territory</returns>
        public static uint DeriveTerritorySeed(uint masterSeed, TerritoryId territoryId)
        {
            uint territoryHash = SeedHashUtility.HashFixedString(territoryId.Value);
            return SeedHashUtility.Combine(
                SeedHashUtility.Combine(masterSeed, DOMAIN_TERRITORY),
                territoryHash
            );
        }

        /// <summary>
        /// Derive a territory seed from the master seed and territory ID string.
        /// Convenience overload for string-based territory IDs.
        /// </summary>
        public static uint DeriveTerritorySeed(uint masterSeed, string territoryId)
        {
            return DeriveTerritorySeed(masterSeed, new TerritoryId(territoryId));
        }

        /// <summary>
        /// Derive the elevation sub-seed for a territory.
        /// Used for terrain height map generation.
        /// </summary>
        public static uint DeriveElevationSeed(uint territorySeed)
        {
            return SeedHashUtility.Combine(territorySeed, DOMAIN_ELEVATION);
        }

        /// <summary>
        /// Derive the structure sub-seed for a territory.
        /// Used for shelter and building placement.
        /// </summary>
        public static uint DeriveStructureSeed(uint territorySeed)
        {
            return SeedHashUtility.Combine(territorySeed, DOMAIN_STRUCTURE);
        }

        /// <summary>
        /// Derive the decoration sub-seed for a territory.
        /// Used for props, debris, and aesthetic details.
        /// </summary>
        public static uint DeriveDecorationSeed(uint territorySeed)
        {
            return SeedHashUtility.Combine(territorySeed, DOMAIN_DECORATION);
        }

        /// <summary>
        /// Create a complete TerritorySeed component with all sub-seeds derived.
        /// </summary>
        public static TerritorySeed CreateTerritorySeed(uint masterSeed, TerritoryId territoryId)
        {
            uint baseSeed = DeriveTerritorySeed(masterSeed, territoryId);
            return new TerritorySeed
            {
                Seed = baseSeed,
                Territory = territoryId,
                ElevationSeed = DeriveElevationSeed(baseSeed),
                StructureSeed = DeriveStructureSeed(baseSeed),
                DecorationSeed = DeriveDecorationSeed(baseSeed)
            };
        }

        #endregion

        #region Connection Seeds

        /// <summary>
        /// Derive a connection seed from the master seed and the two territory endpoints.
        /// The seed is symmetric: Derive(A, B) == Derive(B, A) for bidirectional consistency.
        /// </summary>
        /// <param name="masterSeed">The world's master seed</param>
        /// <param name="fromTerritory">One endpoint of the connection</param>
        /// <param name="toTerritory">Other endpoint of the connection</param>
        /// <returns>A deterministic seed unique to this connection</returns>
        public static uint DeriveConnectionSeed(uint masterSeed, TerritoryId fromTerritory, TerritoryId toTerritory)
        {
            uint fromHash = SeedHashUtility.HashFixedString(fromTerritory.Value);
            uint toHash = SeedHashUtility.HashFixedString(toTerritory.Value);

            // Make the seed symmetric by combining hashes in a commutative way
            // This ensures the same seed regardless of direction
            uint combinedHash = (fromHash < toHash)
                ? SeedHashUtility.Combine(fromHash, toHash)
                : SeedHashUtility.Combine(toHash, fromHash);

            return SeedHashUtility.Combine(
                SeedHashUtility.Combine(masterSeed, DOMAIN_CONNECTION),
                combinedHash
            );
        }

        /// <summary>
        /// Derive a connection seed using string territory IDs.
        /// </summary>
        public static uint DeriveConnectionSeed(uint masterSeed, string fromTerritory, string toTerritory)
        {
            return DeriveConnectionSeed(
                masterSeed,
                new TerritoryId(fromTerritory),
                new TerritoryId(toTerritory)
            );
        }

        /// <summary>
        /// Derive a directional connection seed (different for A->B vs B->A).
        /// Use for one-way connections or when direction matters.
        /// </summary>
        public static uint DeriveDirectionalConnectionSeed(
            uint masterSeed,
            TerritoryId fromTerritory,
            TerritoryId toTerritory)
        {
            uint fromHash = SeedHashUtility.HashFixedString(fromTerritory.Value);
            uint toHash = SeedHashUtility.HashFixedString(toTerritory.Value);

            // Non-commutative combination preserves direction
            uint combinedHash = SeedHashUtility.Combine(fromHash, toHash);

            return SeedHashUtility.Combine(
                SeedHashUtility.Combine(masterSeed, DOMAIN_CONNECTION),
                combinedHash
            );
        }

        /// <summary>
        /// Derive variation seed for connection aesthetics.
        /// </summary>
        public static uint DeriveConnectionVariationSeed(uint connectionSeed)
        {
            return SeedHashUtility.Combine(connectionSeed, DOMAIN_VARIANT);
        }

        /// <summary>
        /// Create a complete ConnectionSeed component.
        /// </summary>
        public static ConnectionSeed CreateConnectionSeed(
            uint masterSeed,
            TerritoryId fromTerritory,
            TerritoryId toTerritory)
        {
            uint baseSeed = DeriveConnectionSeed(masterSeed, fromTerritory, toTerritory);
            return new ConnectionSeed
            {
                Seed = baseSeed,
                FromTerritory = fromTerritory,
                ToTerritory = toTerritory,
                ConnectionType = ConnectionGenerationType.Bridge, // Determined by system based on distance
                VariationSeed = DeriveConnectionVariationSeed(baseSeed)
            };
        }

        #endregion

        #region Population Seeds

        /// <summary>
        /// Derive a population seed from the master seed, territory, and layer.
        /// Different layers are used for different entity types (NPCs, enemies, items).
        /// </summary>
        /// <param name="masterSeed">The world's master seed</param>
        /// <param name="territoryId">The territory to populate</param>
        /// <param name="layer">Population layer (0=essential, 1=regular, 2=enemy, 3=loot)</param>
        /// <returns>A deterministic seed for this population layer</returns>
        public static uint DerivePopulationSeed(uint masterSeed, TerritoryId territoryId, int layer)
        {
            uint territoryHash = SeedHashUtility.HashFixedString(territoryId.Value);

            return SeedHashUtility.Combine(
                SeedHashUtility.Combine(
                    SeedHashUtility.Combine(masterSeed, DOMAIN_POPULATION),
                    territoryHash
                ),
                (uint)layer
            );
        }

        /// <summary>
        /// Derive a population seed using string territory ID.
        /// </summary>
        public static uint DerivePopulationSeed(uint masterSeed, string territoryId, int layer)
        {
            return DerivePopulationSeed(masterSeed, new TerritoryId(territoryId), layer);
        }

        /// <summary>
        /// Derive spawn point sub-seed for entity placement.
        /// </summary>
        public static uint DeriveSpawnPointSeed(uint populationSeed)
        {
            return SeedHashUtility.Combine(populationSeed, DOMAIN_SPAWN);
        }

        /// <summary>
        /// Derive variant sub-seed for entity appearance/type selection.
        /// </summary>
        public static uint DeriveVariantSeed(uint populationSeed)
        {
            return SeedHashUtility.Combine(populationSeed, DOMAIN_VARIANT);
        }

        /// <summary>
        /// Derive equipment sub-seed for NPC gear and inventory.
        /// </summary>
        public static uint DeriveEquipmentSeed(uint populationSeed)
        {
            return SeedHashUtility.Combine(populationSeed, DOMAIN_EQUIPMENT);
        }

        /// <summary>
        /// Create a complete PopulationSeed component with all sub-seeds derived.
        /// </summary>
        public static PopulationSeed CreatePopulationSeed(
            uint masterSeed,
            TerritoryId territoryId,
            int layer)
        {
            uint baseSeed = DerivePopulationSeed(masterSeed, territoryId, layer);
            return new PopulationSeed
            {
                Seed = baseSeed,
                Territory = territoryId,
                Layer = layer,
                SpawnPointSeed = DeriveSpawnPointSeed(baseSeed),
                VariantSeed = DeriveVariantSeed(baseSeed),
                EquipmentSeed = DeriveEquipmentSeed(baseSeed)
            };
        }

        #endregion

        #region Utility Seeds

        /// <summary>
        /// Derive a weather seed for dynamic weather generation.
        /// </summary>
        public static uint DeriveWeatherSeed(uint masterSeed, int dayIndex)
        {
            return SeedHashUtility.Combine(
                SeedHashUtility.Combine(masterSeed, DOMAIN_WEATHER),
                (uint)dayIndex
            );
        }

        /// <summary>
        /// Derive an event seed for random event generation.
        /// </summary>
        public static uint DeriveEventSeed(uint masterSeed, TerritoryId territoryId, int eventIndex)
        {
            uint territoryHash = SeedHashUtility.HashFixedString(territoryId.Value);
            return SeedHashUtility.Combine(
                SeedHashUtility.Combine(
                    SeedHashUtility.Combine(masterSeed, DOMAIN_EVENT),
                    territoryHash
                ),
                (uint)eventIndex
            );
        }

        /// <summary>
        /// Derive a seed for a specific indexed element within a generation pass.
        /// Useful for generating arrays of items deterministically.
        /// </summary>
        public static uint DeriveIndexedSeed(uint baseSeed, int index)
        {
            return SeedHashUtility.Combine(baseSeed, (uint)index);
        }

        #endregion

        #region Random State Creation

        /// <summary>
        /// Create a Unity.Mathematics.Random instance from a seed.
        /// This is the preferred way to get an RNG for procedural generation.
        /// </summary>
        public static Unity.Mathematics.Random CreateRandom(uint seed)
        {
            // Unity.Mathematics.Random requires non-zero seed
            return new Unity.Mathematics.Random(seed != 0 ? seed : 1u);
        }

        /// <summary>
        /// Create a RandomState component from a seed.
        /// </summary>
        public static RandomState CreateRandomState(uint seed)
        {
            return RandomState.Create(seed);
        }

        /// <summary>
        /// Create an array of Random instances for parallel generation.
        /// Each Random is seeded from the base seed plus its index.
        /// </summary>
        public static void CreateRandomArray(uint baseSeed, NativeArray<Unity.Mathematics.Random> output)
        {
            for (int i = 0; i < output.Length; i++)
            {
                uint seed = DeriveIndexedSeed(baseSeed, i);
                output[i] = CreateRandom(seed);
            }
        }

        #endregion

        #region Batch Seed Generation

        /// <summary>
        /// Generate TerritorySeed components for all canonical territories.
        /// </summary>
        public static void GenerateAllTerritorySeeds(uint masterSeed, NativeList<TerritorySeed> output)
        {
            TerritoryId[] canonicalTerritories = new TerritoryId[]
            {
                TerritoryId.KurenaiAcademy,
                TerritoryId.AzureAcademy,
                TerritoryId.CollectiveMarket,
                TerritoryId.EasternRefuge,
                TerritoryId.WesternRefuge,
                TerritoryId.SyndicateDocks,
                TerritoryId.RunnersCanal,
                TerritoryId.ShrineHeights,
                TerritoryId.DeepReach,
                TerritoryId.DrownedArchives
            };

            foreach (var territory in canonicalTerritories)
            {
                output.Add(CreateTerritorySeed(masterSeed, territory));
            }
        }

        /// <summary>
        /// Generate ConnectionSeed components for a list of territory pairs.
        /// </summary>
        public static void GenerateConnectionSeeds(
            uint masterSeed,
            NativeArray<TerritoryId> fromTerritories,
            NativeArray<TerritoryId> toTerritories,
            NativeList<ConnectionSeed> output)
        {
            int count = math.min(fromTerritories.Length, toTerritories.Length);
            for (int i = 0; i < count; i++)
            {
                output.Add(CreateConnectionSeed(masterSeed, fromTerritories[i], toTerritories[i]));
            }
        }

        /// <summary>
        /// Generate PopulationSeed components for all layers of a territory.
        /// </summary>
        public static void GenerateAllPopulationSeeds(
            uint masterSeed,
            TerritoryId territoryId,
            NativeList<PopulationSeed> output)
        {
            for (int layer = PopulationLayer.Essential; layer <= PopulationLayer.Ambient; layer++)
            {
                output.Add(CreatePopulationSeed(masterSeed, territoryId, layer));
            }
        }

        #endregion

        #region Validation

        /// <summary>
        /// Validate that a seed produces consistent results.
        /// Useful for debugging determinism issues.
        /// </summary>
        public static bool ValidateDeterminism(uint seed, int iterations = 100)
        {
            var rng1 = CreateRandom(seed);
            var rng2 = CreateRandom(seed);

            for (int i = 0; i < iterations; i++)
            {
                if (rng1.NextUInt() != rng2.NextUInt())
                    return false;
            }

            return true;
        }

        /// <summary>
        /// Validate territory seed derivation is deterministic.
        /// </summary>
        public static bool ValidateTerritorySeedDeterminism(uint masterSeed, TerritoryId territoryId)
        {
            uint seed1 = DeriveTerritorySeed(masterSeed, territoryId);
            uint seed2 = DeriveTerritorySeed(masterSeed, territoryId);
            return seed1 == seed2;
        }

        /// <summary>
        /// Validate connection seed symmetry.
        /// </summary>
        public static bool ValidateConnectionSeedSymmetry(
            uint masterSeed,
            TerritoryId territoryA,
            TerritoryId territoryB)
        {
            uint seedAB = DeriveConnectionSeed(masterSeed, territoryA, territoryB);
            uint seedBA = DeriveConnectionSeed(masterSeed, territoryB, territoryA);
            return seedAB == seedBA;
        }

        #endregion
    }
}
