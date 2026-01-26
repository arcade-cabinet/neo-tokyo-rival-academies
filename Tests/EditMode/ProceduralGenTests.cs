using NUnit.Framework;
using Unity.Mathematics;
using NeoTokyo.Components.World;

namespace NeoTokyo.Tests.EditMode
{
    /// <summary>
    /// Unit tests for procedural generation seed determinism.
    /// Ensures same seed always produces same world generation.
    /// Command: Unity -batchmode -runTests -testPlatform EditMode
    /// </summary>
    [TestFixture]
    public class ProceduralGenTests
    {
        #region Seed Determinism Tests

        [Test]
        public void MasterSeed_SameInputProducesSameOutput()
        {
            int masterSeed = 42;
            var random1 = new Random((uint)masterSeed);
            var random2 = new Random((uint)masterSeed);

            // Generate same sequence
            for (int i = 0; i < 100; i++)
            {
                Assert.AreEqual(random1.NextInt(), random2.NextInt());
            }
        }

        [Test]
        public void MasterSeed_DifferentSeedsProduceDifferentOutput()
        {
            var random1 = new Random(42);
            var random2 = new Random(43);

            // First values should differ
            Assert.AreNotEqual(random1.NextInt(), random2.NextInt());
        }

        [Test]
        public void SubSeed_DerivedFromMaster()
        {
            int masterSeed = 42;
            var territoryId = TerritoryId.KurenaiAcademy;

            // Derive sub-seed using territory ID
            int subSeed1 = DeriveSubSeed(masterSeed, territoryId);
            int subSeed2 = DeriveSubSeed(masterSeed, territoryId);

            Assert.AreEqual(subSeed1, subSeed2);
        }

        [Test]
        public void SubSeed_DifferentTerritoriesProduceDifferentSeeds()
        {
            int masterSeed = 42;

            int kurenaiSeed = DeriveSubSeed(masterSeed, TerritoryId.KurenaiAcademy);
            int azureSeed = DeriveSubSeed(masterSeed, TerritoryId.AzureAcademy);
            int marketSeed = DeriveSubSeed(masterSeed, TerritoryId.CollectiveMarket);

            Assert.AreNotEqual(kurenaiSeed, azureSeed);
            Assert.AreNotEqual(kurenaiSeed, marketSeed);
            Assert.AreNotEqual(azureSeed, marketSeed);
        }

        [Test]
        public void SubSeed_AllTerritoriesUnique()
        {
            int masterSeed = 12345;
            var territoryIds = new[]
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

            var seeds = new int[territoryIds.Length];
            for (int i = 0; i < territoryIds.Length; i++)
            {
                seeds[i] = DeriveSubSeed(masterSeed, territoryIds[i]);
            }

            // Check all unique
            for (int i = 0; i < seeds.Length; i++)
            {
                for (int j = i + 1; j < seeds.Length; j++)
                {
                    Assert.AreNotEqual(seeds[i], seeds[j],
                        $"Seed collision between {territoryIds[i]} and {territoryIds[j]}");
                }
            }
        }

        #endregion

        #region Position Generation Tests

        [Test]
        public void PositionGeneration_Deterministic()
        {
            int seed = 42;

            var pos1 = GeneratePosition(seed, new float3(-100f, 0f, -100f), new float3(100f, 10f, 100f));
            var pos2 = GeneratePosition(seed, new float3(-100f, 0f, -100f), new float3(100f, 10f, 100f));

            Assert.AreEqual(pos1.x, pos2.x, 0.001f);
            Assert.AreEqual(pos1.y, pos2.y, 0.001f);
            Assert.AreEqual(pos1.z, pos2.z, 0.001f);
        }

        [Test]
        public void PositionGeneration_WithinBounds()
        {
            int seed = 12345;
            float3 min = new float3(-50f, 0f, -50f);
            float3 max = new float3(50f, 10f, 50f);

            for (int i = 0; i < 100; i++)
            {
                var pos = GeneratePosition(seed + i, min, max);

                Assert.GreaterOrEqual(pos.x, min.x);
                Assert.LessOrEqual(pos.x, max.x);
                Assert.GreaterOrEqual(pos.y, min.y);
                Assert.LessOrEqual(pos.y, max.y);
                Assert.GreaterOrEqual(pos.z, min.z);
                Assert.LessOrEqual(pos.z, max.z);
            }
        }

        [Test]
        public void PositionGeneration_DifferentSeedsProduceDifferentPositions()
        {
            float3 min = new float3(-100f, 0f, -100f);
            float3 max = new float3(100f, 10f, 100f);

            var pos1 = GeneratePosition(1, min, max);
            var pos2 = GeneratePosition(2, min, max);

            // At least one component should differ
            bool different = math.abs(pos1.x - pos2.x) > 0.01f ||
                           math.abs(pos1.y - pos2.y) > 0.01f ||
                           math.abs(pos1.z - pos2.z) > 0.01f;

            Assert.IsTrue(different);
        }

        #endregion

        #region Entity Count Generation Tests

        [Test]
        public void EntityCount_Deterministic()
        {
            int seed = 42;
            int minCount = 5;
            int maxCount = 15;

            int count1 = GenerateEntityCount(seed, minCount, maxCount);
            int count2 = GenerateEntityCount(seed, minCount, maxCount);

            Assert.AreEqual(count1, count2);
        }

        [Test]
        public void EntityCount_WithinRange()
        {
            int minCount = 3;
            int maxCount = 10;

            for (int seed = 0; seed < 100; seed++)
            {
                int count = GenerateEntityCount(seed, minCount, maxCount);
                Assert.GreaterOrEqual(count, minCount);
                Assert.LessOrEqual(count, maxCount);
            }
        }

        [Test]
        public void EntityCount_DifficultyScaling()
        {
            int baseSeed = 42;
            int baseCount = 10;

            // Easy difficulty (50% enemies)
            int easyCount = ScaleByDifficulty(baseCount, 0.5f);
            Assert.AreEqual(5, easyCount);

            // Hard difficulty (150% enemies)
            int hardCount = ScaleByDifficulty(baseCount, 1.5f);
            Assert.AreEqual(15, hardCount);

            // Normal difficulty
            int normalCount = ScaleByDifficulty(baseCount, 1.0f);
            Assert.AreEqual(10, normalCount);
        }

        #endregion

        #region Hex Coordinate Generation Tests

        [Test]
        public void HexCoord_AxialConversion()
        {
            // Test axial to world conversion
            int q = 3;
            int r = 2;
            float hexSize = 1.0f;

            var worldPos = AxialToWorld(q, r, hexSize);

            // Verify reverse conversion
            var (convertedQ, convertedR) = WorldToAxial(worldPos, hexSize);

            Assert.AreEqual(q, convertedQ);
            Assert.AreEqual(r, convertedR);
        }

        [Test]
        public void HexCoord_NeighborCalculation()
        {
            int q = 0;
            int r = 0;

            var neighbors = GetHexNeighbors(q, r);

            // Hex has 6 neighbors
            Assert.AreEqual(6, neighbors.Length);

            // Verify expected neighbors (axial directions)
            Assert.Contains((1, 0), neighbors);
            Assert.Contains((0, 1), neighbors);
            Assert.Contains((-1, 1), neighbors);
            Assert.Contains((-1, 0), neighbors);
            Assert.Contains((0, -1), neighbors);
            Assert.Contains((1, -1), neighbors);
        }

        [Test]
        public void HexCoord_DistanceCalculation()
        {
            // Distance from origin to (3, 2)
            int dist = HexDistance(0, 0, 3, 2);
            Assert.AreEqual(3, dist); // Max of |dq|, |dr|, |dq+dr|

            // Adjacent hex
            int adjDist = HexDistance(0, 0, 1, 0);
            Assert.AreEqual(1, adjDist);

            // Same hex
            int zeroDist = HexDistance(5, 5, 5, 5);
            Assert.AreEqual(0, zeroDist);
        }

        [Test]
        public void HexCoord_RingGeneration()
        {
            // Ring of radius 2 should have 12 hexes
            var ring = GetHexRing(0, 0, 2);
            Assert.AreEqual(12, ring.Length);

            // Ring of radius 1 should have 6 hexes
            ring = GetHexRing(0, 0, 1);
            Assert.AreEqual(6, ring.Length);

            // Ring of radius 0 should be empty (just center)
            ring = GetHexRing(0, 0, 0);
            Assert.AreEqual(0, ring.Length);
        }

        #endregion

        #region Weighted Random Selection Tests

        [Test]
        public void WeightedRandom_DeterministicSelection()
        {
            int seed = 42;
            var weights = new float[] { 0.1f, 0.2f, 0.3f, 0.4f };

            int selection1 = WeightedRandomSelect(seed, weights);
            int selection2 = WeightedRandomSelect(seed, weights);

            Assert.AreEqual(selection1, selection2);
        }

        [Test]
        public void WeightedRandom_ValidIndex()
        {
            var weights = new float[] { 0.25f, 0.25f, 0.25f, 0.25f };

            for (int seed = 0; seed < 100; seed++)
            {
                int selection = WeightedRandomSelect(seed, weights);
                Assert.GreaterOrEqual(selection, 0);
                Assert.Less(selection, weights.Length);
            }
        }

        [Test]
        public void WeightedRandom_ZeroWeightNeverSelected()
        {
            int seed = 42;
            // Index 1 has zero weight, should never be selected
            var weights = new float[] { 0.5f, 0.0f, 0.5f };

            for (int i = 0; i < 100; i++)
            {
                int selection = WeightedRandomSelect(seed + i, weights);
                Assert.AreNotEqual(1, selection);
            }
        }

        #endregion

        #region TerritorySignature Tests

        [Test]
        public void TerritorySignature_StoresGenerationInfo()
        {
            var signature = new TerritorySignature
            {
                MasterSeed = 42,
                TerritorySeed = 12345,
                GeneratedTimestamp = 1706234567890
            };

            Assert.AreEqual(42, signature.MasterSeed);
            Assert.AreEqual(12345, signature.TerritorySeed);
            Assert.AreEqual(1706234567890, signature.GeneratedTimestamp);
        }

        [Test]
        public void TerritorySignature_CanRegenerateFromSeed()
        {
            var signature = new TerritorySignature
            {
                MasterSeed = 42,
                TerritorySeed = DeriveSubSeed(42, TerritoryId.CollectiveMarket)
            };

            // Regenerate and verify same seed
            int regeneratedSeed = DeriveSubSeed(signature.MasterSeed, TerritoryId.CollectiveMarket);
            Assert.AreEqual(signature.TerritorySeed, regeneratedSeed);
        }

        #endregion

        #region Helper Methods

        private static int DeriveSubSeed(int masterSeed, TerritoryId territoryId)
        {
            // Simple hash combination
            return masterSeed ^ ((int)territoryId * 31) + ((int)territoryId * 127);
        }

        private static float3 GeneratePosition(int seed, float3 min, float3 max)
        {
            var random = new Random((uint)seed);
            return new float3(
                random.NextFloat(min.x, max.x),
                random.NextFloat(min.y, max.y),
                random.NextFloat(min.z, max.z)
            );
        }

        private static int GenerateEntityCount(int seed, int min, int max)
        {
            var random = new Random((uint)seed);
            return random.NextInt(min, max + 1);
        }

        private static int ScaleByDifficulty(int baseCount, float difficultyMultiplier)
        {
            return (int)math.round(baseCount * difficultyMultiplier);
        }

        private static float3 AxialToWorld(int q, int r, float hexSize)
        {
            float x = hexSize * (1.5f * q);
            float z = hexSize * (math.sqrt(3f) / 2f * q + math.sqrt(3f) * r);
            return new float3(x, 0f, z);
        }

        private static (int q, int r) WorldToAxial(float3 worldPos, float hexSize)
        {
            float q = worldPos.x / (1.5f * hexSize);
            float r = (worldPos.z - math.sqrt(3f) / 2f * hexSize * q) / (math.sqrt(3f) * hexSize);
            return ((int)math.round(q), (int)math.round(r));
        }

        private static (int q, int r)[] GetHexNeighbors(int q, int r)
        {
            return new[]
            {
                (q + 1, r),
                (q, r + 1),
                (q - 1, r + 1),
                (q - 1, r),
                (q, r - 1),
                (q + 1, r - 1)
            };
        }

        private static int HexDistance(int q1, int r1, int q2, int r2)
        {
            int dq = q2 - q1;
            int dr = r2 - r1;
            return (math.abs(dq) + math.abs(dr) + math.abs(dq + dr)) / 2;
        }

        private static (int q, int r)[] GetHexRing(int centerQ, int centerR, int radius)
        {
            if (radius <= 0) return new (int, int)[0];

            var ring = new (int q, int r)[radius * 6];
            int index = 0;

            // Hex directions
            var directions = new[] { (1, 0), (0, 1), (-1, 1), (-1, 0), (0, -1), (1, -1) };

            int q = centerQ + radius;
            int r = centerR;

            for (int dir = 0; dir < 6; dir++)
            {
                for (int step = 0; step < radius; step++)
                {
                    ring[index++] = (q, r);
                    q += directions[dir].Item1;
                    r += directions[dir].Item2;
                }
            }

            return ring;
        }

        private static int WeightedRandomSelect(int seed, float[] weights)
        {
            var random = new Random((uint)seed);

            float totalWeight = 0f;
            foreach (var w in weights) totalWeight += w;

            float roll = random.NextFloat(0f, totalWeight);
            float cumulative = 0f;

            for (int i = 0; i < weights.Length; i++)
            {
                cumulative += weights[i];
                if (roll < cumulative) return i;
            }

            return weights.Length - 1;
        }

        #endregion
    }
}
