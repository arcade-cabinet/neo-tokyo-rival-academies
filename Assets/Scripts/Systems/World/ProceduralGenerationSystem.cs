using System.Collections.Generic;
using Unity.Burst;
using Unity.Collections;
using Unity.Entities;
using Unity.Mathematics;
using Unity.Transforms;
using UnityEngine;
using NeoTokyo.Components.World;
using NeoTokyo.Components.Faction;
using NeoTokyo.Components.Navigation;
using NeoTokyo.Data;
using NeoTokyo.Utilities;

namespace NeoTokyo.Systems.World
{
    #region Generation State Components

    /// <summary>
    /// Singleton component tracking the procedural generation state.
    /// </summary>
    public struct ProceduralGenerationState : IComponentData
    {
        public bool IsGenerating;
        public int CurrentPhase;
        public int TotalPhases;
        public float GenerationProgress;
        public uint ActiveMasterSeed;
        public FixedString64Bytes ActiveSeedName;
        public int GeneratedTerritoryCount;
        public int GeneratedConnectionCount;
        public int GeneratedEntityCount;
    }

    /// <summary>
    /// Generation phases for multi-frame generation.
    /// </summary>
    public enum GenerationPhase
    {
        Idle = 0,
        InitializingSeeds = 1,
        GeneratingTerritories = 2,
        GeneratingConnections = 3,
        PopulatingEntities = 4,
        PopulatingNPCs = 5,
        Finalizing = 6,
        Complete = 7
    }

    /// <summary>
    /// Buffer element for pending territory generation.
    /// </summary>
    public struct PendingTerritoryGeneration : IBufferElementData
    {
        public TerritorySeed Seed;
        public float3 WorldOffset;
        public bool IsGenerated;
    }

    /// <summary>
    /// Buffer element for pending connection generation.
    /// </summary>
    public struct PendingConnectionGeneration : IBufferElementData
    {
        public ConnectionSeed Seed;
        public bool IsGenerated;
    }

    /// <summary>
    /// Buffer element for pending population generation.
    /// </summary>
    public struct PendingPopulationGeneration : IBufferElementData
    {
        public PopulationSeed Seed;
        public bool IsGenerated;
    }

    #endregion

    /// <summary>
    /// Main system for seeded procedural world generation.
    /// Implements the Golden Record seed hierarchy:
    /// masterSeed -> territorySeeds[] -> connectionSeeds[] -> populationSeeds[]
    ///
    /// Key guarantee: Same seed = same world every time.
    ///
    /// The system uses Unity.Mathematics.Random seeded from computed values
    /// to ensure deterministic generation across all platforms.
    /// </summary>
    [UpdateInGroup(typeof(InitializationSystemGroup))]
    [UpdateAfter(typeof(ManifestSpawnerSystem))]
    public partial class ProceduralGenerationSystem : SystemBase
    {
        // Rate limiting for smooth generation
        private const int MaxTilesPerFrame = 100;
        private const int MaxEntitiesPerFrame = 50;
        private const int MaxConnectionsPerFrame = 20;

        // Generation queues
        private readonly Queue<TerritoryGenerationTask> _territoryQueue = new Queue<TerritoryGenerationTask>();
        private readonly Queue<ConnectionGenerationTask> _connectionQueue = new Queue<ConnectionGenerationTask>();
        private readonly Queue<PopulationGenerationTask> _populationQueue = new Queue<PopulationGenerationTask>();

        // Singleton entity
        private Entity _stateEntity;

        // Territory position mapping for connection generation
        private readonly Dictionary<TerritoryId, float3> _territoryPositions = new Dictionary<TerritoryId, float3>();

        protected override void OnCreate()
        {
            // Create singleton entity with generation state
            _stateEntity = EntityManager.CreateEntity();
            EntityManager.AddComponentData(_stateEntity, new ProceduralGenerationState
            {
                IsGenerating = false,
                CurrentPhase = (int)GenerationPhase.Idle,
                TotalPhases = 7,
                GenerationProgress = 0f,
                ActiveMasterSeed = 0,
                ActiveSeedName = default,
                GeneratedTerritoryCount = 0,
                GeneratedConnectionCount = 0,
                GeneratedEntityCount = 0
            });

            // Add buffers for pending work
            EntityManager.AddBuffer<PendingTerritoryGeneration>(_stateEntity);
            EntityManager.AddBuffer<PendingConnectionGeneration>(_stateEntity);
            EntityManager.AddBuffer<PendingPopulationGeneration>(_stateEntity);

            Debug.Log("[ProceduralGeneration] System initialized");
        }

        protected override void OnUpdate()
        {
            var ecb = new EntityCommandBuffer(Allocator.TempJob);

            // Process generation requests
            ProcessGenerationRequests(ref ecb);

            // Continue active generation
            ContinueGeneration(ref ecb);

            ecb.Playback(EntityManager);
            ecb.Dispose();
        }

        #region Request Processing

        private void ProcessGenerationRequests(ref EntityCommandBuffer ecb)
        {
            foreach (var (request, entity) in
                SystemAPI.Query<RefRO<GenerateWorldRequest>>()
                    .WithEntityAccess())
            {
                var seedName = request.ValueRO.SeedName.ToString();
                var clearExisting = request.ValueRO.ClearExisting;

                Debug.Log($"[ProceduralGeneration] Processing generation request for seed: {seedName}");

                if (clearExisting)
                {
                    ClearProcedurallyGeneratedEntities(ref ecb);
                }

                // Initialize world from seed
                var worldSeed = WorldSeed.FromName(seedName);
                InitializeWorldGeneration(worldSeed);

                // Destroy the request entity
                ecb.DestroyEntity(entity);
            }
        }

        private void ClearProcedurallyGeneratedEntities(ref EntityCommandBuffer ecb)
        {
            int clearedCount = 0;

            foreach (var (_, entity) in
                SystemAPI.Query<RefRO<ProcedurallyGenerated>>()
                    .WithEntityAccess())
            {
                ecb.DestroyEntity(entity);
                clearedCount++;
            }

            Debug.Log($"[ProceduralGeneration] Cleared {clearedCount} procedurally generated entities");
        }

        #endregion

        #region World Initialization

        private void InitializeWorldGeneration(WorldSeed worldSeed)
        {
            // Update state
            var state = SystemAPI.GetSingletonRW<ProceduralGenerationState>();
            state.ValueRW.IsGenerating = true;
            state.ValueRW.CurrentPhase = (int)GenerationPhase.InitializingSeeds;
            state.ValueRW.ActiveMasterSeed = worldSeed.MasterSeed;
            state.ValueRW.ActiveSeedName = worldSeed.SeedName;
            state.ValueRW.GenerationProgress = 0f;
            state.ValueRW.GeneratedTerritoryCount = 0;
            state.ValueRW.GeneratedConnectionCount = 0;
            state.ValueRW.GeneratedEntityCount = 0;

            Debug.Log($"[ProceduralGeneration] Initializing world with master seed: {worldSeed.MasterSeed}");

            // Store world seed entity
            var worldSeedEntity = EntityManager.CreateEntity();
            EntityManager.AddComponentData(worldSeedEntity, worldSeed);

            // Generate all territory seeds and queue them
            QueueTerritoryGeneration(worldSeed.MasterSeed);

            // Move to territory generation phase
            state.ValueRW.CurrentPhase = (int)GenerationPhase.GeneratingTerritories;
        }

        private void QueueTerritoryGeneration(uint masterSeed)
        {
            // Define canonical territory positions (in world units)
            // Layout based on Golden Record's flooded Neo-Tokyo geography
            var territoryLayouts = new (TerritoryId id, float3 position)[]
            {
                // Eastern District - Kurenai Territory
                (TerritoryId.KurenaiAcademy, new float3(50, 0, 50)),
                (TerritoryId.EasternRefuge, new float3(80, 0, 30)),

                // Western District - Azure Territory
                (TerritoryId.AzureAcademy, new float3(-50, 0, 50)),
                (TerritoryId.WesternRefuge, new float3(-80, 0, 30)),

                // Central District - Neutral
                (TerritoryId.CollectiveMarket, new float3(0, 0, 0)),
                (TerritoryId.ShrineHeights, new float3(0, 0, 80)),

                // Peripheral Territories
                (TerritoryId.SyndicateDocks, new float3(-60, 0, -40)),
                (TerritoryId.RunnersCanal, new float3(60, 0, -40)),

                // Deep Territories
                (TerritoryId.DeepReach, new float3(30, 0, -70)),
                (TerritoryId.DrownedArchives, new float3(-30, 0, -70))
            };

            _territoryPositions.Clear();
            _territoryQueue.Clear();

            foreach (var (territoryId, position) in territoryLayouts)
            {
                var territorySeed = SeedHelpers.CreateTerritorySeed(masterSeed, territoryId);

                _territoryQueue.Enqueue(new TerritoryGenerationTask
                {
                    Seed = territorySeed,
                    WorldOffset = position,
                    TileCount = 0,
                    EntityCount = 0
                });

                _territoryPositions[territoryId] = position;
            }

            Debug.Log($"[ProceduralGeneration] Queued {_territoryQueue.Count} territories for generation");
        }

        #endregion

        #region Generation Continuation

        private void ContinueGeneration(ref EntityCommandBuffer ecb)
        {
            var state = SystemAPI.GetSingletonRW<ProceduralGenerationState>();

            if (!state.ValueRO.IsGenerating)
                return;

            var stopwatch = System.Diagnostics.Stopwatch.StartNew();

            switch ((GenerationPhase)state.ValueRO.CurrentPhase)
            {
                case GenerationPhase.GeneratingTerritories:
                    ProcessTerritoryQueue(ref ecb, ref state.ValueRW);
                    break;

                case GenerationPhase.GeneratingConnections:
                    ProcessConnectionQueue(ref ecb, ref state.ValueRW);
                    break;

                case GenerationPhase.PopulatingEntities:
                case GenerationPhase.PopulatingNPCs:
                    ProcessPopulationQueue(ref ecb, ref state.ValueRW);
                    break;

                case GenerationPhase.Finalizing:
                    FinalizeGeneration(ref ecb, ref state.ValueRW);
                    break;
            }

            stopwatch.Stop();
        }

        #endregion

        #region Territory Generation

        private void ProcessTerritoryQueue(ref EntityCommandBuffer ecb, ref ProceduralGenerationState state)
        {
            int processedTiles = 0;

            while (_territoryQueue.Count > 0 && processedTiles < MaxTilesPerFrame)
            {
                var task = _territoryQueue.Peek();

                // Generate territory content
                int tilesGenerated = GenerateTerritoryTiles(ref ecb, task, MaxTilesPerFrame - processedTiles);
                processedTiles += tilesGenerated;

                if (tilesGenerated == 0 || task.IsComplete)
                {
                    // Territory complete
                    _territoryQueue.Dequeue();
                    state.GeneratedTerritoryCount++;

                    Debug.Log($"[ProceduralGeneration] Completed territory: {task.Seed.Territory} " +
                              $"({task.TileCount} tiles, {task.EntityCount} entities)");
                }
            }

            // Update progress
            float totalTerritories = 10f; // Canonical territory count
            state.GenerationProgress = (totalTerritories - _territoryQueue.Count) / totalTerritories * 0.4f;

            // Check if phase complete
            if (_territoryQueue.Count == 0)
            {
                Debug.Log("[ProceduralGeneration] Territory generation complete, starting connections");
                QueueConnectionGeneration(state.ActiveMasterSeed);
                state.CurrentPhase = (int)GenerationPhase.GeneratingConnections;
            }
        }

        private int GenerateTerritoryTiles(ref EntityCommandBuffer ecb, TerritoryGenerationTask task, int maxTiles)
        {
            var rng = SeedHelpers.CreateRandom(task.Seed.Seed);
            int tilesGenerated = 0;

            // Determine territory size based on type (derived from seed)
            int radius = DetermineTerritoryRadius(task.Seed.Territory);

            // Generate hex tiles in a hexagonal pattern
            for (int q = -radius; q <= radius && tilesGenerated < maxTiles; q++)
            {
                int r1 = math.max(-radius, -q - radius);
                int r2 = math.min(radius, -q + radius);

                for (int r = r1; r <= r2 && tilesGenerated < maxTiles; r++)
                {
                    // Check if already generated (for multi-frame generation)
                    if (task.GeneratedCoords.Contains((q, r)))
                        continue;

                    GenerateTile(ref ecb, task, q, r, ref rng);
                    task.GeneratedCoords.Add((q, r));
                    task.TileCount++;
                    tilesGenerated++;
                }
            }

            // Generate structures after tiles
            if (tilesGenerated < maxTiles && task.TileCount > 0 && !task.StructuresGenerated)
            {
                GenerateStructures(ref ecb, task);
                task.StructuresGenerated = true;
            }

            // Mark as complete when all tiles and structures are done
            task.IsComplete = task.GeneratedCoords.Count >= GetExpectedTileCount(radius) && task.StructuresGenerated;

            return tilesGenerated;
        }

        private void GenerateTile(ref EntityCommandBuffer ecb, TerritoryGenerationTask task, int q, int r, ref Random rng)
        {
            // Derive tile-specific seed for consistent generation
            uint tileSeed = SeedHelpers.DeriveIndexedSeed(
                task.Seed.Seed,
                q * 1000 + r
            );
            var tileRng = SeedHelpers.CreateRandom(tileSeed);

            // Calculate world position
            var hexCoord = new HexCoordinate { Q = q, R = r };
            float3 localPos = hexCoord.ToWorldPosition(1f);
            float3 worldPos = localPos + task.WorldOffset;

            // Determine tile type based on position and territory type
            TileType tileType = DetermineTileType(task.Seed.Territory, q, r, ref tileRng);

            // Calculate elevation using territory's elevation seed
            float elevation = CalculateTileElevation(task.Seed.ElevationSeed, q, r, tileType);

            // Create tile entity
            var entity = ecb.CreateEntity();

            // Add transform
            ecb.AddComponent(entity, new LocalTransform
            {
                Position = new float3(worldPos.x, elevation, worldPos.z),
                Rotation = quaternion.identity,
                Scale = 1f
            });

            // Add hex coordinate
            ecb.AddComponent(entity, hexCoord);

            // Add hex tile component
            ecb.AddComponent(entity, new HexTile
            {
                Coordinate = hexCoord,
                Type = tileType,
                Elevation = elevation,
                IsPassable = tileType != TileType.Water,
                MovementCost = GetMovementCost(tileType)
            });

            // Add navigation data
            ecb.AddComponent(entity, new HexTileNav
            {
                AxialCoords = new int2(q, r),
                WorldPosition = new float3(worldPos.x, elevation, worldPos.z),
                IsWalkable = tileType != TileType.Water,
                MovementCost = GetMovementCost(tileType)
            });

            // Add territory membership
            ecb.AddComponent(entity, new TerritoryMember
            {
                TerritoryId = task.Seed.Territory.Value
            });

            // Add procedural generation tag
            ecb.AddComponent(entity, new ProcedurallyGenerated
            {
                SourceSeed = tileSeed,
                GenerationPass = 0
            });
        }

        private void GenerateStructures(ref EntityCommandBuffer ecb, TerritoryGenerationTask task)
        {
            var rng = SeedHelpers.CreateRandom(task.Seed.StructureSeed);

            // Number of structures based on territory type
            int structureCount = DetermineStructureCount(task.Seed.Territory, ref rng);

            for (int i = 0; i < structureCount; i++)
            {
                // Derive structure-specific seed
                uint structureSeed = SeedHelpers.DeriveIndexedSeed(task.Seed.StructureSeed, i);
                var structureRng = SeedHelpers.CreateRandom(structureSeed);

                // Pick random position within territory
                int radius = DetermineTerritoryRadius(task.Seed.Territory);
                float angle = structureRng.NextFloat() * math.PI * 2f;
                float distance = structureRng.NextFloat() * radius * 0.8f;

                float3 localPos = new float3(
                    math.cos(angle) * distance,
                    0,
                    math.sin(angle) * distance
                );
                float3 worldPos = localPos + task.WorldOffset;

                // Create structure entity
                var entity = ecb.CreateEntity();

                ecb.AddComponent(entity, new LocalTransform
                {
                    Position = worldPos + new float3(0, 5f, 0), // Above water level
                    Rotation = quaternion.Euler(0, structureRng.NextFloat() * math.PI * 2f, 0),
                    Scale = 1f
                });

                ecb.AddComponent(entity, new TerritoryMember
                {
                    TerritoryId = task.Seed.Territory.Value
                });

                ecb.AddComponent(entity, new ProcedurallyGenerated
                {
                    SourceSeed = structureSeed,
                    GenerationPass = 0
                });

                task.EntityCount++;
            }
        }

        #endregion

        #region Connection Generation

        private void QueueConnectionGeneration(uint masterSeed)
        {
            _connectionQueue.Clear();

            // Define canonical connections from Golden Record
            var connections = new (TerritoryId from, TerritoryId to)[]
            {
                // Academy connections to central market
                (TerritoryId.KurenaiAcademy, TerritoryId.CollectiveMarket),
                (TerritoryId.AzureAcademy, TerritoryId.CollectiveMarket),

                // Academy connections to their refuges
                (TerritoryId.KurenaiAcademy, TerritoryId.EasternRefuge),
                (TerritoryId.AzureAcademy, TerritoryId.WesternRefuge),

                // Market connections
                (TerritoryId.CollectiveMarket, TerritoryId.ShrineHeights),
                (TerritoryId.CollectiveMarket, TerritoryId.SyndicateDocks),
                (TerritoryId.CollectiveMarket, TerritoryId.RunnersCanal),

                // Peripheral connections
                (TerritoryId.SyndicateDocks, TerritoryId.DrownedArchives),
                (TerritoryId.RunnersCanal, TerritoryId.DeepReach),

                // Cross connections
                (TerritoryId.EasternRefuge, TerritoryId.RunnersCanal),
                (TerritoryId.WesternRefuge, TerritoryId.SyndicateDocks),

                // Deep territory connection
                (TerritoryId.DeepReach, TerritoryId.DrownedArchives)
            };

            foreach (var (from, to) in connections)
            {
                var connectionSeed = SeedHelpers.CreateConnectionSeed(masterSeed, from, to);

                // Determine connection type based on distance
                if (_territoryPositions.TryGetValue(from, out float3 fromPos) &&
                    _territoryPositions.TryGetValue(to, out float3 toPos))
                {
                    float distance = math.length(toPos - fromPos);
                    connectionSeed.ConnectionType = DetermineConnectionType(distance);
                }

                _connectionQueue.Enqueue(new ConnectionGenerationTask
                {
                    Seed = connectionSeed
                });
            }

            Debug.Log($"[ProceduralGeneration] Queued {_connectionQueue.Count} connections for generation");
        }

        private void ProcessConnectionQueue(ref EntityCommandBuffer ecb, ref ProceduralGenerationState state)
        {
            int processed = 0;

            while (_connectionQueue.Count > 0 && processed < MaxConnectionsPerFrame)
            {
                var task = _connectionQueue.Dequeue();
                GenerateConnection(ref ecb, task);
                state.GeneratedConnectionCount++;
                processed++;
            }

            // Update progress
            state.GenerationProgress = 0.4f + (12f - _connectionQueue.Count) / 12f * 0.2f;

            // Check if phase complete
            if (_connectionQueue.Count == 0)
            {
                Debug.Log("[ProceduralGeneration] Connection generation complete, starting population");
                QueuePopulationGeneration(state.ActiveMasterSeed);
                state.CurrentPhase = (int)GenerationPhase.PopulatingEntities;
            }
        }

        private void GenerateConnection(ref EntityCommandBuffer ecb, ConnectionGenerationTask task)
        {
            if (!_territoryPositions.TryGetValue(task.Seed.FromTerritory, out float3 fromPos) ||
                !_territoryPositions.TryGetValue(task.Seed.ToTerritory, out float3 toPos))
            {
                Debug.LogWarning($"[ProceduralGeneration] Cannot generate connection - territory positions not found");
                return;
            }

            var rng = SeedHelpers.CreateRandom(task.Seed.Seed);

            // Create connection entity
            var entity = ecb.CreateEntity();

            // Calculate midpoint for connection position
            float3 midpoint = (fromPos + toPos) / 2f;
            float3 direction = math.normalize(toPos - fromPos);
            float distance = math.length(toPos - fromPos);

            // Add transform at midpoint
            ecb.AddComponent(entity, new LocalTransform
            {
                Position = midpoint + new float3(0, 5f, 0), // Above water
                Rotation = quaternion.LookRotation(direction, math.up()),
                Scale = distance
            });

            // Add connection seed for reference
            ecb.AddComponent(entity, task.Seed);

            // Add procedural generation tag
            ecb.AddComponent(entity, new ProcedurallyGenerated
            {
                SourceSeed = task.Seed.Seed,
                GenerationPass = 1
            });

            Debug.Log($"[ProceduralGeneration] Generated {task.Seed.ConnectionType} connection: " +
                      $"{task.Seed.FromTerritory} <-> {task.Seed.ToTerritory}");
        }

        #endregion

        #region Population Generation

        private void QueuePopulationGeneration(uint masterSeed)
        {
            _populationQueue.Clear();

            // Queue population for all territories, all layers
            TerritoryId[] territories = new TerritoryId[]
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

            foreach (var territory in territories)
            {
                // Generate essential, regular, enemy, and loot layers
                for (int layer = PopulationLayer.Essential; layer <= PopulationLayer.Loot; layer++)
                {
                    var populationSeed = SeedHelpers.CreatePopulationSeed(masterSeed, territory, layer);
                    _populationQueue.Enqueue(new PopulationGenerationTask
                    {
                        Seed = populationSeed
                    });
                }
            }

            Debug.Log($"[ProceduralGeneration] Queued {_populationQueue.Count} population passes for generation");
        }

        private void ProcessPopulationQueue(ref EntityCommandBuffer ecb, ref ProceduralGenerationState state)
        {
            int processed = 0;

            while (_populationQueue.Count > 0 && processed < MaxEntitiesPerFrame)
            {
                var task = _populationQueue.Dequeue();
                int entitiesSpawned = GeneratePopulation(ref ecb, task);
                state.GeneratedEntityCount += entitiesSpawned;
                processed += entitiesSpawned;
            }

            // Update progress
            float totalPasses = 40f; // 10 territories * 4 layers
            state.GenerationProgress = 0.6f + (totalPasses - _populationQueue.Count) / totalPasses * 0.35f;

            // Check if phase complete
            if (_populationQueue.Count == 0)
            {
                Debug.Log("[ProceduralGeneration] Population generation complete, finalizing");
                state.CurrentPhase = (int)GenerationPhase.Finalizing;
            }
        }

        private int GeneratePopulation(ref EntityCommandBuffer ecb, PopulationGenerationTask task)
        {
            if (!_territoryPositions.TryGetValue(task.Seed.Territory, out float3 territoryPos))
                return 0;

            var rng = SeedHelpers.CreateRandom(task.Seed.Seed);
            int spawned = 0;

            // Determine entity count based on layer and territory
            int entityCount = DeterminePopulationCount(task.Seed.Territory, task.Seed.Layer, ref rng);
            int radius = DetermineTerritoryRadius(task.Seed.Territory);

            for (int i = 0; i < entityCount; i++)
            {
                // Derive entity-specific seed
                uint entitySeed = SeedHelpers.DeriveIndexedSeed(task.Seed.SpawnPointSeed, i);
                var entityRng = SeedHelpers.CreateRandom(entitySeed);

                // Random position within territory
                float angle = entityRng.NextFloat() * math.PI * 2f;
                float distance = entityRng.NextFloat() * radius * 0.7f;

                float3 localPos = new float3(
                    math.cos(angle) * distance,
                    0,
                    math.sin(angle) * distance
                );
                float3 worldPos = localPos + territoryPos + new float3(0, 5f, 0);

                // Create entity
                var entity = ecb.CreateEntity();

                ecb.AddComponent(entity, new LocalTransform
                {
                    Position = worldPos,
                    Rotation = quaternion.Euler(0, entityRng.NextFloat() * math.PI * 2f, 0),
                    Scale = 1f
                });

                ecb.AddComponent(entity, new TerritoryMember
                {
                    TerritoryId = task.Seed.Territory.Value
                });

                ecb.AddComponent(entity, new ProcedurallyGenerated
                {
                    SourceSeed = entitySeed,
                    GenerationPass = 2 + task.Seed.Layer
                });

                // Add layer-specific components
                AddPopulationLayerComponents(ref ecb, entity, task.Seed, ref entityRng);

                spawned++;
            }

            return spawned;
        }

        private void AddPopulationLayerComponents(
            ref EntityCommandBuffer ecb,
            Entity entity,
            PopulationSeed seed,
            ref Random rng)
        {
            // Add faction based on territory
            FactionType faction = GetTerritoryFaction(seed.Territory);
            ecb.AddComponent(entity, new FactionMembership { Value = faction });

            // Add navigation agent for NPCs and enemies
            if (seed.Layer == PopulationLayer.Essential ||
                seed.Layer == PopulationLayer.Regular ||
                seed.Layer == PopulationLayer.Enemy)
            {
                ecb.AddComponent(entity, new NavAgent
                {
                    Speed = 2f + rng.NextFloat() * 2f,
                    StoppingDistance = 0.5f,
                    RotationSpeed = 180f,
                    CurrentWaypointIndex = 0,
                    HasPath = false,
                    IsMoving = false
                });
            }

            // Layer-specific tags
            switch (seed.Layer)
            {
                case PopulationLayer.Enemy:
                    ecb.AddComponent<EnemyTag>(entity);
                    break;
            }
        }

        #endregion

        #region Finalization

        private void FinalizeGeneration(ref EntityCommandBuffer ecb, ref ProceduralGenerationState state)
        {
            // Create completion event
            var eventEntity = ecb.CreateEntity();
            ecb.AddComponent(eventEntity, new WorldGeneratedEvent
            {
                MasterSeed = state.ActiveMasterSeed,
                SeedName = state.ActiveSeedName,
                TerritoryCount = state.GeneratedTerritoryCount,
                TotalTileCount = 0, // TODO: Track actual count
                TotalEntityCount = state.GeneratedEntityCount,
                TotalConnectionCount = state.GeneratedConnectionCount,
                TotalGenerationTimeMs = 0 // TODO: Track actual time
            });

            Debug.Log($"[ProceduralGeneration] World generation complete! " +
                      $"Territories: {state.GeneratedTerritoryCount}, " +
                      $"Connections: {state.GeneratedConnectionCount}, " +
                      $"Entities: {state.GeneratedEntityCount}");

            // Reset state
            state.IsGenerating = false;
            state.CurrentPhase = (int)GenerationPhase.Complete;
            state.GenerationProgress = 1f;
        }

        #endregion

        #region Helper Methods

        private static TileType DetermineTileType(TerritoryId territory, int q, int r, ref Random rng)
        {
            // Distance from center affects tile type
            float dist = math.sqrt(q * q + r * r + q * r);
            int radius = DetermineTerritoryRadius(territory);

            // Edge tiles are more likely to be water or debris
            float edgeFactor = dist / radius;

            if (edgeFactor > 0.9f)
            {
                // Edge - mostly water or debris
                return rng.NextFloat() < 0.7f ? TileType.Water : TileType.Debris;
            }
            else if (edgeFactor > 0.7f)
            {
                // Near edge - shallow or dock
                float roll = rng.NextFloat();
                if (roll < 0.4f) return TileType.Shallow;
                if (roll < 0.6f) return TileType.Dock;
                return TileType.Platform;
            }
            else
            {
                // Interior - mostly platform with some variation
                float roll = rng.NextFloat();
                if (roll < 0.1f) return TileType.Bridge;
                return TileType.Platform;
            }
        }

        private static float CalculateTileElevation(uint elevationSeed, int q, int r, TileType tileType)
        {
            // Base elevation by tile type
            float baseElevation = tileType switch
            {
                TileType.Water => 0f,
                TileType.Shallow => 1f,
                TileType.Debris => 2f,
                TileType.Dock => 4f,
                TileType.Bridge => 5f,
                TileType.Platform => 6f,
                _ => 5f
            };

            // Add noise variation using seed
            uint tileSeed = SeedHashUtility.Combine(elevationSeed, (uint)(q * 1000 + r));
            var rng = SeedHelpers.CreateRandom(tileSeed);

            return baseElevation + rng.NextFloat() * 2f;
        }

        private static int DetermineTerritoryRadius(TerritoryId territory)
        {
            // Academies and market are larger
            if (territory == TerritoryId.KurenaiAcademy ||
                territory == TerritoryId.AzureAcademy ||
                territory == TerritoryId.CollectiveMarket)
            {
                return 8;
            }

            // Refuges are medium
            if (territory == TerritoryId.EasternRefuge ||
                territory == TerritoryId.WesternRefuge)
            {
                return 6;
            }

            // Others are smaller
            return 5;
        }

        private static int DetermineStructureCount(TerritoryId territory, ref Random rng)
        {
            int baseCount = territory.Value.ToString() switch
            {
                "kurenai-academy" => 8,
                "azure-academy" => 8,
                "collective-market" => 12,
                "eastern-refuge" => 6,
                "western-refuge" => 6,
                "syndicate-docks" => 5,
                "runners-canal" => 4,
                "shrine-heights" => 4,
                "deep-reach" => 3,
                "drowned-archives" => 3,
                _ => 4
            };

            return baseCount + rng.NextInt(-1, 2);
        }

        private static int DeterminePopulationCount(TerritoryId territory, int layer, ref Random rng)
        {
            // Base counts by layer
            int baseCount = layer switch
            {
                PopulationLayer.Essential => 2,
                PopulationLayer.Regular => 5,
                PopulationLayer.Enemy => 3,
                PopulationLayer.Loot => 4,
                _ => 2
            };

            // Territory multipliers
            float multiplier = territory.Value.ToString() switch
            {
                "collective-market" => 2.0f,
                "kurenai-academy" => 1.5f,
                "azure-academy" => 1.5f,
                "syndicate-docks" => 1.2f,
                "deep-reach" => 0.5f,
                "drowned-archives" => 0.5f,
                _ => 1.0f
            };

            return (int)(baseCount * multiplier) + rng.NextInt(0, 2);
        }

        private static ConnectionGenerationType DetermineConnectionType(float distance)
        {
            if (distance < 30f)
                return ConnectionGenerationType.Bridge;
            if (distance < 50f)
                return ConnectionGenerationType.CableBridge;
            if (distance < 80f)
                return ConnectionGenerationType.PontoonBridge;
            return ConnectionGenerationType.BoatRoute;
        }

        private static FactionType GetTerritoryFaction(TerritoryId territory)
        {
            return territory.Value.ToString() switch
            {
                "kurenai-academy" => FactionType.Kurenai,
                "eastern-refuge" => FactionType.Kurenai,
                "azure-academy" => FactionType.Azure,
                "western-refuge" => FactionType.Azure,
                "syndicate-docks" => FactionType.Syndicate,
                "runners-canal" => FactionType.Runners,
                "collective-market" => FactionType.Collective,
                "drowned-archives" => FactionType.Drowned,
                "shrine-heights" => FactionType.Council,
                _ => FactionType.Neutral
            };
        }

        private static float GetMovementCost(TileType type)
        {
            return type switch
            {
                TileType.Water => float.MaxValue,
                TileType.Shallow => 2f,
                TileType.Platform => 1f,
                TileType.Bridge => 1f,
                TileType.Dock => 1f,
                TileType.Debris => 1.5f,
                _ => 1f
            };
        }

        private static int GetExpectedTileCount(int radius)
        {
            // Hexagonal number formula: 3n(n+1)+1
            return 3 * radius * (radius + 1) + 1;
        }

        #endregion

        #region Task Structures

        private class TerritoryGenerationTask
        {
            public TerritorySeed Seed;
            public float3 WorldOffset;
            public int TileCount;
            public int EntityCount;
            public bool StructuresGenerated;
            public bool IsComplete;
            public HashSet<(int q, int r)> GeneratedCoords = new HashSet<(int, int)>();
        }

        private struct ConnectionGenerationTask
        {
            public ConnectionSeed Seed;
        }

        private struct PopulationGenerationTask
        {
            public PopulationSeed Seed;
        }

        #endregion
    }

    #region Helper Components

    /// <summary>
    /// Tag component for enemy entities.
    /// </summary>
    public struct EnemyTag : IComponentData { }

    /// <summary>
    /// Tag component for ally entities.
    /// </summary>
    public struct AllyTag : IComponentData { }

    /// <summary>
    /// Tag component for boss entities.
    /// </summary>
    public struct BossTag : IComponentData { }

    #endregion

    #region Static Helpers

    /// <summary>
    /// Static helper methods for triggering world generation.
    /// </summary>
    public static class ProceduralGenerationHelpers
    {
        /// <summary>
        /// Request world generation from a seed name.
        /// </summary>
        public static void GenerateWorld(EntityManager em, string seedName, bool clearExisting = true)
        {
            var entity = em.CreateEntity();
            em.AddComponentData(entity, new GenerateWorldRequest
            {
                SeedName = new FixedString64Bytes(seedName),
                ClearExisting = clearExisting,
                TerritoriesToGenerate = default
            });

            Debug.Log($"[ProceduralGeneration] Generation request created for seed: {seedName}");
        }

        /// <summary>
        /// Get the current generation state.
        /// </summary>
        public static ProceduralGenerationState? GetGenerationState(EntityManager em)
        {
            var query = em.CreateEntityQuery(ComponentType.ReadOnly<ProceduralGenerationState>());
            if (query.IsEmpty) return null;

            var entity = query.GetSingletonEntity();
            return em.GetComponentData<ProceduralGenerationState>(entity);
        }

        /// <summary>
        /// Check if generation is currently in progress.
        /// </summary>
        public static bool IsGenerating(EntityManager em)
        {
            var state = GetGenerationState(em);
            return state?.IsGenerating ?? false;
        }

        /// <summary>
        /// Get generation progress as a percentage (0-100).
        /// </summary>
        public static float GetGenerationProgress(EntityManager em)
        {
            var state = GetGenerationState(em);
            return (state?.GenerationProgress ?? 0f) * 100f;
        }
    }

    #endregion
}
