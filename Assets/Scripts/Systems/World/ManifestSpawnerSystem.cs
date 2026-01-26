using System;
using System.Collections.Generic;
using Unity.Collections;
using Unity.Entities;
using Unity.Mathematics;
using Unity.Transforms;
using UnityEngine;
using NeoTokyo.Data;
using NeoTokyo.Utilities;
using NeoTokyo.Components.Core;
using NeoTokyo.Components.Faction;
using NeoTokyo.Components.Navigation;

namespace NeoTokyo.Systems.World
{
    #region Manifest Spawner Components

    /// <summary>
    /// Singleton component tracking loaded territories.
    /// </summary>
    public struct ManifestSpawnerSingleton : IComponentData
    {
        public bool Initialized;
        public FixedString64Bytes ActiveSeed;
        public int LoadedTerritoryCount;
        public int SpawnedTileCount;
        public int SpawnedEntityCount;
        public int SpawnedNPCCount;
    }

    /// <summary>
    /// Request to load and spawn a territory from manifest.
    /// </summary>
    public struct LoadTerritoryRequest : IComponentData
    {
        public FixedString64Bytes Seed;
        public FixedString64Bytes TerritoryId;
        public float3 Offset;
        public bool ClearExisting;
    }

    /// <summary>
    /// Request to unload a territory.
    /// </summary>
    public struct UnloadTerritoryRequest : IComponentData
    {
        public FixedString64Bytes TerritoryId;
    }

    /// <summary>
    /// Tag for entities that belong to a specific territory.
    /// </summary>
    public struct TerritoryMember : IComponentData
    {
        public FixedString64Bytes TerritoryId;
    }

    /// <summary>
    /// Component for spawned hex tiles.
    /// </summary>
    public struct ManifestTile : IComponentData
    {
        public FixedString64Bytes TerritoryId;
        public int Q;
        public int R;
        public TileType Type;
        public float Elevation;
    }

    /// <summary>
    /// Component for spawned entities from manifest.
    /// </summary>
    public struct ManifestEntity : IComponentData
    {
        public FixedString64Bytes TerritoryId;
        public FixedString64Bytes EntityId;
        public FixedString64Bytes EntityType;
        public FixedString64Bytes Variant;
    }

    /// <summary>
    /// Component for spawned NPCs from manifest.
    /// </summary>
    public struct ManifestNPC : IComponentData
    {
        public FixedString64Bytes TerritoryId;
        public FixedString64Bytes NPCId;
        public FixedString64Bytes NPCName;
        public FixedString64Bytes Archetype;
    }

    /// <summary>
    /// Event fired when a territory is fully loaded.
    /// </summary>
    public struct TerritoryLoadedEvent : IComponentData
    {
        public FixedString64Bytes TerritoryId;
        public int TileCount;
        public int EntityCount;
        public int NPCCount;
        public float LoadTimeMs;
    }

    #endregion

    #region Prefab References

    /// <summary>
    /// Prefab lookup for tile types.
    /// This should be populated from a ScriptableObject or Addressables.
    /// </summary>
    public struct TilePrefabLookup : IComponentData
    {
        public Entity WaterPrefab;
        public Entity ShallowPrefab;
        public Entity PlatformPrefab;
        public Entity BridgePrefab;
        public Entity DockPrefab;
        public Entity DebrisPrefab;
    }

    /// <summary>
    /// Buffer of entity prefab mappings.
    /// </summary>
    public struct EntityPrefabMapping : IBufferElementData
    {
        public FixedString64Bytes EntityType;
        public Entity Prefab;
    }

    /// <summary>
    /// Buffer of NPC prefab mappings.
    /// </summary>
    public struct NPCPrefabMapping : IBufferElementData
    {
        public FixedString64Bytes Archetype;
        public Entity Prefab;
    }

    #endregion

    /// <summary>
    /// System that processes manifest load requests and spawns world content.
    /// Bridges TypeScript-generated JSON manifests to Unity ECS entities.
    /// </summary>
    [UpdateInGroup(typeof(InitializationSystemGroup))]
    public partial class ManifestSpawnerSystem : SystemBase
    {
        private EntityQuery _loadRequestQuery;
        private EntityQuery _unloadRequestQuery;
        private EntityQuery _territoryMemberQuery;

        // Cached manifest data for pending spawns
        private readonly Dictionary<string, TerritoryManifest> _pendingManifests
            = new Dictionary<string, TerritoryManifest>();

        // Spawn queue for rate-limiting
        private readonly Queue<SpawnTask> _spawnQueue = new Queue<SpawnTask>();
        private const int MaxSpawnsPerFrame = 50;

        protected override void OnCreate()
        {
            // Create singleton
            var singletonEntity = EntityManager.CreateEntity();
            EntityManager.AddComponentData(singletonEntity, new ManifestSpawnerSingleton
            {
                Initialized = true,
                ActiveSeed = default,
                LoadedTerritoryCount = 0,
                SpawnedTileCount = 0,
                SpawnedEntityCount = 0,
                SpawnedNPCCount = 0
            });

            // Setup queries
            _loadRequestQuery = GetEntityQuery(ComponentType.ReadOnly<LoadTerritoryRequest>());
            _unloadRequestQuery = GetEntityQuery(ComponentType.ReadOnly<UnloadTerritoryRequest>());
            _territoryMemberQuery = GetEntityQuery(ComponentType.ReadOnly<TerritoryMember>());

            Debug.Log("[ManifestSpawner] System initialized");
        }

        protected override void OnUpdate()
        {
            var ecb = new EntityCommandBuffer(Allocator.TempJob);

            // Process load requests
            ProcessLoadRequests(ref ecb);

            // Process unload requests
            ProcessUnloadRequests(ref ecb);

            // Process spawn queue (rate-limited)
            ProcessSpawnQueue(ref ecb);

            ecb.Playback(EntityManager);
            ecb.Dispose();
        }

        #region Load Request Processing

        private void ProcessLoadRequests(ref EntityCommandBuffer ecb)
        {
            foreach (var (request, entity) in
                SystemAPI.Query<RefRO<LoadTerritoryRequest>>()
                    .WithEntityAccess())
            {
                var seed = request.ValueRO.Seed.ToString();
                var territoryId = request.ValueRO.TerritoryId.ToString();
                var offset = request.ValueRO.Offset;
                var clearExisting = request.ValueRO.ClearExisting;

                Debug.Log($"[ManifestSpawner] Processing load request: {territoryId}");

                // Clear existing territory entities if requested
                if (clearExisting)
                {
                    QueueUnloadTerritory(territoryId, ref ecb);
                }

                // Load manifest
                var result = ManifestLoader.LoadTerritory(seed, territoryId);
                if (!result.Success)
                {
                    Debug.LogError($"[ManifestSpawner] Failed to load territory: {result.Error}");
                    ecb.DestroyEntity(entity);
                    continue;
                }

                // Validate manifest
                var errors = ManifestLoader.ValidateTerritoryManifest(result.Data);
                if (errors.Count > 0)
                {
                    Debug.LogWarning($"[ManifestSpawner] Territory {territoryId} has validation warnings:");
                    foreach (var error in errors)
                    {
                        Debug.LogWarning($"  - {error}");
                    }
                }

                // Queue spawning tasks
                QueueTerritorySpawn(result.Data, offset);

                // Update singleton
                foreach (var singleton in SystemAPI.Query<RefRW<ManifestSpawnerSingleton>>())
                {
                    singleton.ValueRW.ActiveSeed = new FixedString64Bytes(seed);
                    singleton.ValueRW.LoadedTerritoryCount++;
                }

                // Destroy the request entity
                ecb.DestroyEntity(entity);
            }
        }

        private void QueueTerritorySpawn(TerritoryManifest manifest, float3 offset)
        {
            var territoryId = manifest.id;
            _pendingManifests[territoryId] = manifest;

            // Queue tile spawns
            if (manifest.tiles != null)
            {
                foreach (var tile in manifest.tiles)
                {
                    _spawnQueue.Enqueue(new SpawnTask
                    {
                        Type = SpawnTaskType.Tile,
                        TerritoryId = territoryId,
                        TileData = tile,
                        Offset = offset
                    });
                }
            }

            // Queue entity spawns
            if (manifest.entities != null)
            {
                foreach (var entityDef in manifest.entities)
                {
                    _spawnQueue.Enqueue(new SpawnTask
                    {
                        Type = SpawnTaskType.Entity,
                        TerritoryId = territoryId,
                        EntityData = entityDef,
                        Offset = offset
                    });
                }
            }

            // Queue NPC spawns
            if (manifest.npcs != null)
            {
                foreach (var npc in manifest.npcs)
                {
                    _spawnQueue.Enqueue(new SpawnTask
                    {
                        Type = SpawnTaskType.NPC,
                        TerritoryId = territoryId,
                        NPCData = npc,
                        Offset = offset
                    });
                }
            }

            Debug.Log($"[ManifestSpawner] Queued {_spawnQueue.Count} spawn tasks for {territoryId}");
        }

        #endregion

        #region Unload Request Processing

        private void ProcessUnloadRequests(ref EntityCommandBuffer ecb)
        {
            foreach (var (request, entity) in
                SystemAPI.Query<RefRO<UnloadTerritoryRequest>>()
                    .WithEntityAccess())
            {
                var territoryId = request.ValueRO.TerritoryId.ToString();
                QueueUnloadTerritory(territoryId, ref ecb);
                ecb.DestroyEntity(entity);
            }
        }

        private void QueueUnloadTerritory(string territoryId, ref EntityCommandBuffer ecb)
        {
            var fixedId = new FixedString64Bytes(territoryId);
            int destroyedCount = 0;

            foreach (var (member, entity) in
                SystemAPI.Query<RefRO<TerritoryMember>>()
                    .WithEntityAccess())
            {
                if (member.ValueRO.TerritoryId.Equals(fixedId))
                {
                    ecb.DestroyEntity(entity);
                    destroyedCount++;
                }
            }

            // Clean up pending manifest
            _pendingManifests.Remove(territoryId);

            Debug.Log($"[ManifestSpawner] Unloaded territory {territoryId}: {destroyedCount} entities destroyed");

            // Update singleton
            foreach (var singleton in SystemAPI.Query<RefRW<ManifestSpawnerSingleton>>())
            {
                singleton.ValueRW.LoadedTerritoryCount = math.max(0, singleton.ValueRW.LoadedTerritoryCount - 1);
            }
        }

        #endregion

        #region Spawn Queue Processing

        private void ProcessSpawnQueue(ref EntityCommandBuffer ecb)
        {
            int spawned = 0;
            var stopwatch = System.Diagnostics.Stopwatch.StartNew();

            while (_spawnQueue.Count > 0 && spawned < MaxSpawnsPerFrame)
            {
                var task = _spawnQueue.Dequeue();

                switch (task.Type)
                {
                    case SpawnTaskType.Tile:
                        SpawnTile(ref ecb, task);
                        break;
                    case SpawnTaskType.Entity:
                        SpawnEntity(ref ecb, task);
                        break;
                    case SpawnTaskType.NPC:
                        SpawnNPC(ref ecb, task);
                        break;
                }

                spawned++;
            }

            stopwatch.Stop();

            if (spawned > 0)
            {
                Debug.Log($"[ManifestSpawner] Spawned {spawned} objects in {stopwatch.ElapsedMilliseconds}ms, {_spawnQueue.Count} remaining");
            }

            // Check if territory spawn is complete
            CheckTerritoryComplete(ref ecb);
        }

        private void SpawnTile(ref EntityCommandBuffer ecb, SpawnTask task)
        {
            var tile = task.TileData;
            if (tile == null || tile.hex == null) return;

            // Calculate world position
            float3 worldPos = new float3(
                tile.hex.ToWorldPosition().x + task.Offset.x,
                tile.elevation,
                tile.hex.ToWorldPosition().z + task.Offset.z
            );

            // Create tile entity
            var entity = ecb.CreateEntity();

            // Add transform
            ecb.AddComponent(entity, new LocalTransform
            {
                Position = worldPos,
                Rotation = quaternion.identity,
                Scale = 1f
            });

            // Add territory membership
            ecb.AddComponent(entity, new TerritoryMember
            {
                TerritoryId = new FixedString64Bytes(task.TerritoryId)
            });

            // Add hex coordinate
            ecb.AddComponent(entity, new HexCoordinate
            {
                Q = tile.hex.q,
                R = tile.hex.r
            });

            // Add hex tile component
            var tileType = ParseTileType(tile.type);
            ecb.AddComponent(entity, new HexTile
            {
                Coordinate = new HexCoordinate { Q = tile.hex.q, R = tile.hex.r },
                Type = tileType,
                Elevation = tile.elevation,
                IsPassable = tileType != TileType.Water,
                MovementCost = GetMovementCost(tileType)
            });

            // Add manifest tile tracking
            ecb.AddComponent(entity, new ManifestTile
            {
                TerritoryId = new FixedString64Bytes(task.TerritoryId),
                Q = tile.hex.q,
                R = tile.hex.r,
                Type = tileType,
                Elevation = tile.elevation
            });

            // Add navigation data
            ecb.AddComponent(entity, new HexTileNav
            {
                AxialCoords = new int2(tile.hex.q, tile.hex.r),
                WorldPosition = worldPos,
                IsWalkable = tileType != TileType.Water,
                MovementCost = GetMovementCost(tileType)
            });

            // Update singleton count
            foreach (var singleton in SystemAPI.Query<RefRW<ManifestSpawnerSingleton>>())
            {
                singleton.ValueRW.SpawnedTileCount++;
            }
        }

        private void SpawnEntity(ref EntityCommandBuffer ecb, SpawnTask task)
        {
            var entityDef = task.EntityData;
            if (entityDef == null) return;

            // Calculate world position
            var pos = entityDef.GetPosition();
            float3 worldPos = new float3(
                pos.x + task.Offset.x,
                pos.y,
                pos.z + task.Offset.z
            );

            // Create entity
            var entity = ecb.CreateEntity();

            // Add transform
            ecb.AddComponent(entity, new LocalTransform
            {
                Position = worldPos,
                Rotation = entityDef.GetRotation(),
                Scale = entityDef.GetScale().x
            });

            // Add territory membership
            ecb.AddComponent(entity, new TerritoryMember
            {
                TerritoryId = new FixedString64Bytes(task.TerritoryId)
            });

            // Add manifest entity tracking
            ecb.AddComponent(entity, new ManifestEntity
            {
                TerritoryId = new FixedString64Bytes(task.TerritoryId),
                EntityId = new FixedString64Bytes(entityDef.id ?? ""),
                EntityType = new FixedString64Bytes(entityDef.type ?? ""),
                Variant = new FixedString64Bytes(entityDef.variant ?? "")
            });

            // Add type-specific components
            AddEntityTypeComponents(ref ecb, entity, entityDef);

            // Update singleton count
            foreach (var singleton in SystemAPI.Query<RefRW<ManifestSpawnerSingleton>>())
            {
                singleton.ValueRW.SpawnedEntityCount++;
            }
        }

        private void SpawnNPC(ref EntityCommandBuffer ecb, SpawnTask task)
        {
            var npc = task.NPCData;
            if (npc == null) return;

            // Calculate world position
            var pos = npc.GetPosition();
            float3 worldPos = new float3(
                pos.x + task.Offset.x,
                pos.y,
                pos.z + task.Offset.z
            );

            // Create entity
            var entity = ecb.CreateEntity();

            // Add transform
            ecb.AddComponent(entity, new LocalTransform
            {
                Position = worldPos,
                Rotation = npc.GetRotation(),
                Scale = 1f
            });

            // Add territory membership
            ecb.AddComponent(entity, new TerritoryMember
            {
                TerritoryId = new FixedString64Bytes(task.TerritoryId)
            });

            // Add manifest NPC tracking
            ecb.AddComponent(entity, new ManifestNPC
            {
                TerritoryId = new FixedString64Bytes(task.TerritoryId),
                NPCId = new FixedString64Bytes(npc.id ?? ""),
                NPCName = new FixedString64Bytes(npc.name ?? ""),
                Archetype = new FixedString64Bytes(npc.archetype ?? "")
            });

            // Add faction membership
            if (!string.IsNullOrEmpty(npc.faction))
            {
                var factionType = ParseFactionType(npc.faction);
                ecb.AddComponent(entity, new FactionMembership { Value = factionType });
            }

            // Add navigation agent
            ecb.AddComponent(entity, new NavAgent
            {
                Speed = 3f,
                StoppingDistance = 0.5f,
                RotationSpeed = 180f,
                CurrentWaypointIndex = 0,
                HasPath = false,
                IsMoving = false
            });

            // Add archetype-specific components
            AddNPCArchetypeComponents(ref ecb, entity, npc);

            // Update singleton count
            foreach (var singleton in SystemAPI.Query<RefRW<ManifestSpawnerSingleton>>())
            {
                singleton.ValueRW.SpawnedNPCCount++;
            }
        }

        private void CheckTerritoryComplete(ref EntityCommandBuffer ecb)
        {
            // This would check if all spawns for a territory are complete
            // and fire a TerritoryLoadedEvent
            // For now, simplified implementation
        }

        #endregion

        #region Component Helpers

        private void AddEntityTypeComponents(ref EntityCommandBuffer ecb, Entity entity, EntityDefinition entityDef)
        {
            var entityType = entityDef.GetEntityType();

            switch (entityType)
            {
                case EntityTypeEnum.Enemy:
                case EntityTypeEnum.Boss:
                    ecb.AddComponent<EnemyTag>(entity);
                    if (entityType == EntityTypeEnum.Boss)
                    {
                        ecb.AddComponent<BossTag>(entity);
                    }
                    break;

                case EntityTypeEnum.Shelter:
                case EntityTypeEnum.Dock:
                case EntityTypeEnum.Tower:
                    // Add interactable components
                    break;

                case EntityTypeEnum.Chest:
                case EntityTypeEnum.Crate:
                case EntityTypeEnum.Barrel:
                    // Add lootable components
                    break;

                case EntityTypeEnum.Turret:
                case EntityTypeEnum.Trap:
                    ecb.AddComponent<EnemyTag>(entity);
                    // Add hazard components
                    break;
            }

            // Add faction if specified
            if (entityDef.properties != null && !string.IsNullOrEmpty(entityDef.properties.faction))
            {
                var factionType = ParseFactionType(entityDef.properties.faction);
                ecb.AddComponent(entity, new FactionMembership { Value = factionType });
            }
        }

        private void AddNPCArchetypeComponents(ref EntityCommandBuffer ecb, Entity entity, NPCDefinition npc)
        {
            var archetype = npc.GetArchetype();

            switch (archetype)
            {
                case NPCArchetype.Student:
                case NPCArchetype.Teacher:
                case NPCArchetype.Civilian:
                    // Add civilian AI
                    break;

                case NPCArchetype.Guard:
                    // Add guard patrol AI
                    break;

                case NPCArchetype.Vendor:
                    // Add merchant components
                    break;

                case NPCArchetype.QuestGiver:
                    // Add quest giver components
                    break;

                case NPCArchetype.Ally:
                    ecb.AddComponent<AllyTag>(entity);
                    break;

                case NPCArchetype.Hostile:
                    ecb.AddComponent<EnemyTag>(entity);
                    break;
            }

            // Check if NPC is essential (cannot be killed)
            if (npc.properties != null && npc.properties.essential)
            {
                // Add essential tag
            }
        }

        #endregion

        #region Parsing Helpers

        private static TileType ParseTileType(string type)
        {
            if (string.IsNullOrEmpty(type)) return TileType.Platform;

            return type.ToLowerInvariant() switch
            {
                "water" => TileType.Water,
                "shallow" => TileType.Shallow,
                "platform" => TileType.Platform,
                "rooftop" => TileType.Platform,
                "bridge" => TileType.Bridge,
                "dock" => TileType.Dock,
                "debris" => TileType.Debris,
                _ => TileType.Platform
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

        private static FactionType ParseFactionType(string faction)
        {
            if (string.IsNullOrEmpty(faction)) return FactionType.Neutral;

            return faction.ToLowerInvariant() switch
            {
                "kurenai" => FactionType.Kurenai,
                "azure" => FactionType.Azure,
                "syndicate" => FactionType.Syndicate,
                "runners" => FactionType.Runners,
                "collective" => FactionType.Collective,
                "drowned" => FactionType.Drowned,
                "council" => FactionType.Council,
                _ => FactionType.Neutral
            };
        }

        #endregion

        #region Spawn Task Types

        private enum SpawnTaskType
        {
            Tile,
            Entity,
            NPC
        }

        private struct SpawnTask
        {
            public SpawnTaskType Type;
            public string TerritoryId;
            public float3 Offset;
            public TileDefinition TileData;
            public EntityDefinition EntityData;
            public NPCDefinition NPCData;
        }

        #endregion
    }

    #region Static Helpers

    /// <summary>
    /// Static helper methods for territory loading.
    /// </summary>
    public static class ManifestSpawnerHelpers
    {
        /// <summary>
        /// Request to load a territory from manifest.
        /// </summary>
        public static void LoadTerritory(
            EntityManager em,
            string seed,
            string territoryId,
            Vector3 offset = default,
            bool clearExisting = true)
        {
            var entity = em.CreateEntity();
            em.AddComponentData(entity, new LoadTerritoryRequest
            {
                Seed = new FixedString64Bytes(seed),
                TerritoryId = new FixedString64Bytes(territoryId),
                Offset = new float3(offset.x, offset.y, offset.z),
                ClearExisting = clearExisting
            });

            Debug.Log($"[ManifestSpawner] Load request created for: {territoryId}");
        }

        /// <summary>
        /// Request to unload a territory.
        /// </summary>
        public static void UnloadTerritory(EntityManager em, string territoryId)
        {
            var entity = em.CreateEntity();
            em.AddComponentData(entity, new UnloadTerritoryRequest
            {
                TerritoryId = new FixedString64Bytes(territoryId)
            });

            Debug.Log($"[ManifestSpawner] Unload request created for: {territoryId}");
        }

        /// <summary>
        /// Get the spawner singleton data.
        /// </summary>
        public static ManifestSpawnerSingleton? GetSpawnerStatus(EntityManager em)
        {
            var query = em.CreateEntityQuery(ComponentType.ReadOnly<ManifestSpawnerSingleton>());
            if (query.IsEmpty) return null;

            var entity = query.GetSingletonEntity();
            return em.GetComponentData<ManifestSpawnerSingleton>(entity);
        }

        /// <summary>
        /// Get all entities belonging to a territory.
        /// </summary>
        public static NativeList<Entity> GetTerritoryEntities(EntityManager em, string territoryId)
        {
            var result = new NativeList<Entity>(Allocator.Temp);
            var fixedId = new FixedString64Bytes(territoryId);

            var query = em.CreateEntityQuery(ComponentType.ReadOnly<TerritoryMember>());
            var entities = query.ToEntityArray(Allocator.Temp);
            var members = query.ToComponentDataArray<TerritoryMember>(Allocator.Temp);

            for (int i = 0; i < entities.Length; i++)
            {
                if (members[i].TerritoryId.Equals(fixedId))
                {
                    result.Add(entities[i]);
                }
            }

            entities.Dispose();
            members.Dispose();

            return result;
        }
    }

    #endregion
}
