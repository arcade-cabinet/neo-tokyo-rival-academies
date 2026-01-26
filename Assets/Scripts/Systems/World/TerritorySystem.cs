using Unity.Burst;
using Unity.Collections;
using Unity.Entities;
using Unity.Mathematics;
using Unity.Transforms;
using UnityEngine;
using NeoTokyo.Components.World;
using NeoTokyo.Components.Core;
using NeoTokyo.Components.Faction;
using NeoTokyo.Data;

namespace NeoTokyo.Systems.World
{
    #region Territory Tracking System

    /// <summary>
    /// Tracks player position and updates ActiveTerritory component.
    /// Fires TerritoryEnteredEvent when player crosses territory boundaries.
    ///
    /// Runs every frame in SimulationSystemGroup to ensure accurate position tracking.
    /// Uses Burst compilation for performance on mobile devices.
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateAfter(typeof(TransformSystemGroup))]
    public partial struct TerritoryTrackingSystem : ISystem
    {
        private EntityQuery _territoryQuery;
        private EntityQuery _playerQuery;
        private bool _initialized;

        [BurstCompile]
        public void OnCreate(ref SystemState state)
        {
            _territoryQuery = state.GetEntityQuery(
                ComponentType.ReadOnly<TerritoryData>(),
                ComponentType.ReadOnly<TerritoryBounds>()
            );

            _playerQuery = state.GetEntityQuery(
                ComponentType.ReadOnly<PlayerTag>(),
                ComponentType.ReadOnly<LocalTransform>(),
                ComponentType.ReadWrite<ActiveTerritory>()
            );

            state.RequireForUpdate<TerritoryManagerTag>();
            state.RequireForUpdate<PlayerTag>();
        }

        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            float deltaTime = SystemAPI.Time.DeltaTime;

            // Get territory data arrays
            var territoryEntities = _territoryQuery.ToEntityArray(Allocator.TempJob);
            var territoryDataArray = _territoryQuery.ToComponentDataArray<TerritoryData>(Allocator.TempJob);
            var territoryBoundsArray = _territoryQuery.ToComponentDataArray<TerritoryBounds>(Allocator.TempJob);

            // Schedule parallel job for all entities with ActiveTerritory
            var job = new UpdateActiveTerritoryJob
            {
                DeltaTime = deltaTime,
                TerritoryDataArray = territoryDataArray,
                TerritoryBoundsArray = territoryBoundsArray
            };

            state.Dependency = job.ScheduleParallel(state.Dependency);
            state.Dependency.Complete();

            // Clean up
            territoryEntities.Dispose();
            territoryDataArray.Dispose();
            territoryBoundsArray.Dispose();
        }
    }

    /// <summary>
    /// Job to update ActiveTerritory based on position.
    /// </summary>
    [BurstCompile]
    public partial struct UpdateActiveTerritoryJob : IJobEntity
    {
        [ReadOnly] public float DeltaTime;
        [ReadOnly] public NativeArray<TerritoryData> TerritoryDataArray;
        [ReadOnly] public NativeArray<TerritoryBounds> TerritoryBoundsArray;

        public void Execute(
            in LocalTransform transform,
            ref ActiveTerritory active)
        {
            float3 position = transform.Position;
            TerritoryId foundTerritory = TerritoryId.None;
            float closestDistance = float.MaxValue;

            // Check all territories for containment
            for (int i = 0; i < TerritoryDataArray.Length; i++)
            {
                var bounds = TerritoryBoundsArray[i];
                var data = TerritoryDataArray[i];

                // Check XZ bounds (ignore Y for territory detection)
                if (bounds.ContainsXZ(position))
                {
                    // If inside bounds, check distance to center
                    float dist = math.distance(position.xz, data.CenterPosition.xz);
                    if (dist < closestDistance)
                    {
                        closestDistance = dist;
                        foundTerritory = data.Id;
                    }
                }
                else
                {
                    // Check radius-based fallback
                    float dist = math.distance(position.xz, data.CenterPosition.xz);
                    if (dist <= data.Radius && dist < closestDistance)
                    {
                        closestDistance = dist;
                        foundTerritory = data.Id;
                    }
                }
            }

            // Update active territory state
            active.JustEntered = false;
            active.JustExited = false;

            if (foundTerritory != active.CurrentTerritory)
            {
                // Territory transition detected
                if (active.CurrentTerritory != TerritoryId.None)
                {
                    active.JustExited = true;
                }

                active.PreviousTerritory = active.CurrentTerritory;
                active.CurrentTerritory = foundTerritory;
                active.TimeInTerritory = 0f;

                if (foundTerritory != TerritoryId.None)
                {
                    active.JustEntered = true;
                }
            }
            else
            {
                // Same territory, accumulate time
                active.TimeInTerritory += DeltaTime;
            }
        }
    }

    #endregion

    #region Territory Event System

    /// <summary>
    /// Creates events when players enter new territories.
    /// Integrates with faction reputation to determine hostility.
    ///
    /// Non-Burst due to entity creation (ECB).
    /// </summary>
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateAfter(typeof(TerritoryTrackingSystem))]
    public partial class TerritoryEventSystem : SystemBase
    {
        private EndSimulationEntityCommandBufferSystem _ecbSystem;

        protected override void OnCreate()
        {
            _ecbSystem = World.GetOrCreateSystemManaged<EndSimulationEntityCommandBufferSystem>();
            RequireForUpdate<TerritoryManagerTag>();
        }

        protected override void OnUpdate()
        {
            var ecb = _ecbSystem.CreateCommandBuffer();
            float timestamp = (float)SystemAPI.Time.ElapsedTime;

            // Process territory entries
            foreach (var (active, reputation, entity) in
                SystemAPI.Query<RefRO<ActiveTerritory>, RefRO<Reputation>>()
                    .WithAll<PlayerTag>()
                    .WithEntityAccess())
            {
                if (!active.ValueRO.JustEntered) continue;

                var territoryId = active.ValueRO.CurrentTerritory;
                if (territoryId == TerritoryId.None) continue;

                // Find territory data
                FactionType controllingFaction = FactionType.Neutral;
                foreach (var (data, control) in
                    SystemAPI.Query<RefRO<TerritoryData>, RefRO<TerritoryControl>>())
                {
                    if (data.ValueRO.Id == territoryId)
                    {
                        controllingFaction = control.ValueRO.CurrentController;
                        break;
                    }
                }

                // Determine player standing with controlling faction
                var standing = GetPlayerStanding(reputation.ValueRO, controllingFaction);
                bool isHostile = standing == ReputationLevel.Hated || standing == ReputationLevel.Hostile;

                // Create event entity
                var eventEntity = ecb.CreateEntity();
                ecb.AddComponent(eventEntity, new TerritoryEnteredEvent
                {
                    Territory = territoryId,
                    PreviousTerritory = active.ValueRO.PreviousTerritory,
                    ControllingFaction = controllingFaction,
                    PlayerStanding = standing,
                    IsHostile = isHostile,
                    TimeStamp = timestamp
                });

                // Update singleton
                foreach (var singleton in SystemAPI.Query<RefRW<TerritoryStateSingleton>>())
                {
                    singleton.ValueRW.ActiveTerritory = territoryId;
                }

                Debug.Log($"[TerritoryEventSystem] Player entered {territoryId} (Controller: {controllingFaction}, Hostile: {isHostile})");
            }

            _ecbSystem.AddJobHandleForProducer(Dependency);
        }

        private static ReputationLevel GetPlayerStanding(Reputation reputation, FactionType faction)
        {
            return faction switch
            {
                FactionType.Kurenai => reputation.GetKurenaiLevel(),
                FactionType.Azure => reputation.GetAzureLevel(),
                // Other factions default to neutral for now
                _ => ReputationLevel.Neutral
            };
        }
    }

    #endregion

    #region Territory Control System

    /// <summary>
    /// Manages territory control changes and contested states.
    /// Processes faction warfare and control point accumulation.
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    public partial struct TerritoryControlSystem : ISystem
    {
        private const float CONTROL_DECAY_RATE = 0.5f; // Per second when contested
        private const float CONTROL_THRESHOLD = 50f;   // Below this = contested
        private const float TAKEOVER_THRESHOLD = 10f;  // Below this = faction change

        [BurstCompile]
        public void OnCreate(ref SystemState state)
        {
            state.RequireForUpdate<TerritoryManagerTag>();
        }

        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            float deltaTime = SystemAPI.Time.DeltaTime;

            new UpdateTerritoryControlJob
            {
                DeltaTime = deltaTime,
                ControlDecayRate = CONTROL_DECAY_RATE,
                ControlThreshold = CONTROL_THRESHOLD,
                TakeoverThreshold = TAKEOVER_THRESHOLD
            }.ScheduleParallel();
        }
    }

    /// <summary>
    /// Job to update territory control states.
    /// </summary>
    [BurstCompile]
    public partial struct UpdateTerritoryControlJob : IJobEntity
    {
        [ReadOnly] public float DeltaTime;
        [ReadOnly] public float ControlDecayRate;
        [ReadOnly] public float ControlThreshold;
        [ReadOnly] public float TakeoverThreshold;

        public void Execute(ref TerritoryControl control, in TerritoryData data)
        {
            // Update contested timer
            if (control.IsContested)
            {
                control.ContestedTimer += DeltaTime;

                // Decay control when contested
                if (control.AttackingFaction != FactionType.Neutral)
                {
                    control.ControlStrength -= ControlDecayRate * DeltaTime;
                    control.AttackerProgress += ControlDecayRate * DeltaTime * 0.5f;

                    // Clamp values
                    control.ControlStrength = math.max(0f, control.ControlStrength);
                    control.AttackerProgress = math.min(100f, control.AttackerProgress);

                    // Check for takeover
                    if (control.ControlStrength <= TakeoverThreshold)
                    {
                        // Territory changes hands
                        control.PreviousController = control.CurrentController;
                        control.CurrentController = control.AttackingFaction;
                        control.ControlStrength = 50f; // Start at contested threshold
                        control.AttackingFaction = FactionType.Neutral;
                        control.AttackerProgress = 0f;
                        control.IsContested = false;
                        control.ContestedTimer = 0f;
                    }
                }
            }
            else
            {
                // Slowly regenerate control when not contested
                if (control.ControlStrength < 100f)
                {
                    control.ControlStrength += ControlDecayRate * 0.25f * DeltaTime;
                    control.ControlStrength = math.min(100f, control.ControlStrength);
                }
            }

            // Check contested state based on control strength
            if (control.ControlStrength < ControlThreshold && !control.IsContested)
            {
                control.IsContested = true;
                control.ContestedTimer = 0f;
            }
            else if (control.ControlStrength >= ControlThreshold && control.IsContested &&
                     control.AttackingFaction == FactionType.Neutral)
            {
                control.IsContested = false;
                control.ContestedTimer = 0f;
            }
        }
    }

    #endregion

    #region Territory Request Processing System

    /// <summary>
    /// Processes EnterTerritoryRequest components.
    /// Handles territory loading and player teleportation.
    /// </summary>
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    public partial class TerritoryRequestSystem : SystemBase
    {
        private EndSimulationEntityCommandBufferSystem _ecbSystem;

        protected override void OnCreate()
        {
            _ecbSystem = World.GetOrCreateSystemManaged<EndSimulationEntityCommandBufferSystem>();
            RequireForUpdate<TerritoryManagerTag>();
        }

        protected override void OnUpdate()
        {
            var ecb = _ecbSystem.CreateCommandBuffer();

            foreach (var (request, entity) in
                SystemAPI.Query<RefRO<EnterTerritoryRequest>>()
                    .WithEntityAccess())
            {
                ProcessEnterRequest(request.ValueRO, ref ecb);
                ecb.DestroyEntity(entity);
            }

            _ecbSystem.AddJobHandleForProducer(Dependency);
        }

        private void ProcessEnterRequest(EnterTerritoryRequest request, ref EntityCommandBuffer ecb)
        {
            var targetTerritory = request.TargetTerritory;

            Debug.Log($"[TerritoryRequestSystem] Processing enter request for {targetTerritory}");

            // Find territory bounds for spawn position
            float3 spawnPos = request.SpawnPosition;
            bool useDefaultSpawn = math.lengthsq(spawnPos) < 0.01f;

            foreach (var (data, bounds) in
                SystemAPI.Query<RefRO<TerritoryData>, RefRO<TerritoryBounds>>())
            {
                if (data.ValueRO.Id == targetTerritory)
                {
                    if (useDefaultSpawn)
                    {
                        // Use territory center as default spawn
                        spawnPos = data.ValueRO.CenterPosition;
                        // Offset slightly above center
                        spawnPos.y += 2f;
                    }

                    // Create load territory request if needed
                    if (request.ForceReload)
                    {
                        var loadEntity = ecb.CreateEntity();
                        ecb.AddComponent(loadEntity, new LoadTerritoryRequest
                        {
                            Seed = default,
                            TerritoryId = new FixedString64Bytes(targetTerritory.ToString()),
                            Offset = float3.zero,
                            ClearExisting = true
                        });
                    }

                    break;
                }
            }

            // Teleport player to spawn position
            foreach (var (transform, entity) in
                SystemAPI.Query<RefRW<LocalTransform>>()
                    .WithAll<PlayerTag>()
                    .WithEntityAccess())
            {
                transform.ValueRW.Position = spawnPos;
                Debug.Log($"[TerritoryRequestSystem] Teleported player to {spawnPos}");
            }
        }
    }

    #endregion

    #region Territory Discovery System

    /// <summary>
    /// Tracks which territories have been discovered by the player.
    /// Updates DiscoveredTerritoryElement buffer on first entry.
    /// </summary>
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateAfter(typeof(TerritoryEventSystem))]
    public partial class TerritoryDiscoverySystem : SystemBase
    {
        protected override void OnCreate()
        {
            RequireForUpdate<TerritoryManagerTag>();
        }

        protected override void OnUpdate()
        {
            // Process territory entered events
            Entities
                .ForEach((Entity entity, in TerritoryEnteredEvent evt) =>
                {
                    // Find player and update discovery buffer
                    // This runs on main thread due to buffer access
                })
                .WithoutBurst()
                .Run();

            // Clean up event entities
            var ecb = new EntityCommandBuffer(Allocator.TempJob);

            foreach (var (evt, entity) in
                SystemAPI.Query<RefRO<TerritoryEnteredEvent>>()
                    .WithEntityAccess())
            {
                // Mark event for cleanup after one frame
                ecb.DestroyEntity(entity);
            }

            ecb.Playback(EntityManager);
            ecb.Dispose();

            // Update discovery tracking for player
            foreach (var (active, discoveredBuffer) in
                SystemAPI.Query<RefRO<ActiveTerritory>, DynamicBuffer<DiscoveredTerritoryElement>>()
                    .WithAll<PlayerTag>())
            {
                if (!active.ValueRO.JustEntered) continue;

                var territory = active.ValueRO.CurrentTerritory;
                if (territory == TerritoryId.None) continue;

                bool alreadyDiscovered = false;
                for (int i = 0; i < discoveredBuffer.Length; i++)
                {
                    if (discoveredBuffer[i].Territory == territory)
                    {
                        // Update visit count
                        var element = discoveredBuffer[i];
                        element.VisitCount++;
                        discoveredBuffer[i] = element;
                        alreadyDiscovered = true;
                        break;
                    }
                }

                if (!alreadyDiscovered)
                {
                    // First discovery
                    discoveredBuffer.Add(new DiscoveredTerritoryElement
                    {
                        Territory = territory,
                        DiscoveredTimestamp = System.DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
                        VisitCount = 1
                    });

                    // Update singleton count
                    foreach (var singleton in SystemAPI.Query<RefRW<TerritoryStateSingleton>>())
                    {
                        singleton.ValueRW.DiscoveredCount++;
                    }

                    Debug.Log($"[TerritoryDiscoverySystem] Discovered new territory: {territory}");
                }
            }
        }
    }

    #endregion

    #region Territory Control Change Event System

    /// <summary>
    /// Creates events when territory control changes hands.
    /// </summary>
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateAfter(typeof(TerritoryControlSystem))]
    public partial class TerritoryControlEventSystem : SystemBase
    {
        private EndSimulationEntityCommandBufferSystem _ecbSystem;

        // Track previous control state
        private NativeHashMap<TerritoryId, FactionType> _previousControllers;

        protected override void OnCreate()
        {
            _ecbSystem = World.GetOrCreateSystemManaged<EndSimulationEntityCommandBufferSystem>();
            _previousControllers = new NativeHashMap<TerritoryId, FactionType>(16, Allocator.Persistent);
            RequireForUpdate<TerritoryManagerTag>();
        }

        protected override void OnDestroy()
        {
            if (_previousControllers.IsCreated)
            {
                _previousControllers.Dispose();
            }
        }

        protected override void OnUpdate()
        {
            var ecb = _ecbSystem.CreateCommandBuffer();
            float timestamp = (float)SystemAPI.Time.ElapsedTime;

            foreach (var (data, control) in
                SystemAPI.Query<RefRO<TerritoryData>, RefRO<TerritoryControl>>())
            {
                var territoryId = data.ValueRO.Id;
                var currentController = control.ValueRO.CurrentController;

                // Check if we have previous data
                if (_previousControllers.TryGetValue(territoryId, out var previousController))
                {
                    if (currentController != previousController)
                    {
                        // Control changed - fire event
                        var eventEntity = ecb.CreateEntity();
                        ecb.AddComponent(eventEntity, new TerritoryControlChangedEvent
                        {
                            Territory = territoryId,
                            OldController = previousController,
                            NewController = currentController,
                            TimeStamp = timestamp
                        });

                        Debug.Log($"[TerritoryControlEventSystem] {territoryId} control changed: {previousController} -> {currentController}");
                    }
                }

                // Update tracking
                _previousControllers[territoryId] = currentController;
            }

            _ecbSystem.AddJobHandleForProducer(Dependency);
        }
    }

    #endregion

    #region Static Helpers

    /// <summary>
    /// Static helper methods for territory system interactions.
    /// </summary>
    public static class TerritoryHelpers
    {
        /// <summary>
        /// Request to enter a specific territory.
        /// </summary>
        public static void RequestEnterTerritory(
            EntityManager em,
            TerritoryId territory,
            float3 spawnPosition = default,
            bool forceReload = false)
        {
            var entity = em.CreateEntity();
            em.AddComponentData(entity, new EnterTerritoryRequest
            {
                TargetTerritory = territory,
                SpawnPosition = spawnPosition,
                ForceReload = forceReload
            });
        }

        /// <summary>
        /// Start a territory contest (faction attack).
        /// </summary>
        public static void StartTerritoryContest(
            EntityManager em,
            TerritoryId territory,
            FactionType attackingFaction)
        {
            var query = em.CreateEntityQuery(ComponentType.ReadOnly<TerritoryData>());
            var entities = query.ToEntityArray(Allocator.Temp);
            var dataArray = query.ToComponentDataArray<TerritoryData>(Allocator.Temp);

            for (int i = 0; i < entities.Length; i++)
            {
                if (dataArray[i].Id == territory)
                {
                    var control = em.GetComponentData<TerritoryControl>(entities[i]);
                    control.IsContested = true;
                    control.AttackingFaction = attackingFaction;
                    control.ContestedTimer = 0f;
                    em.SetComponentData(entities[i], control);
                    break;
                }
            }

            entities.Dispose();
            dataArray.Dispose();
        }

        /// <summary>
        /// Get current territory the player is in.
        /// </summary>
        public static TerritoryId GetPlayerTerritory(EntityManager em)
        {
            var query = em.CreateEntityQuery(
                ComponentType.ReadOnly<PlayerTag>(),
                ComponentType.ReadOnly<ActiveTerritory>()
            );

            if (query.IsEmpty) return TerritoryId.None;

            var entity = query.GetSingletonEntity();
            var active = em.GetComponentData<ActiveTerritory>(entity);
            return active.CurrentTerritory;
        }

        /// <summary>
        /// Check if a territory is hostile to the player.
        /// </summary>
        public static bool IsTerritoryHostile(EntityManager em, TerritoryId territory)
        {
            // Get player reputation
            var playerQuery = em.CreateEntityQuery(
                ComponentType.ReadOnly<PlayerTag>(),
                ComponentType.ReadOnly<Reputation>()
            );

            if (playerQuery.IsEmpty) return false;

            var playerEntity = playerQuery.GetSingletonEntity();
            var reputation = em.GetComponentData<Reputation>(playerEntity);

            // Get territory controller
            var territoryQuery = em.CreateEntityQuery(
                ComponentType.ReadOnly<TerritoryData>(),
                ComponentType.ReadOnly<TerritoryControl>()
            );

            var dataArray = territoryQuery.ToComponentDataArray<TerritoryData>(Allocator.Temp);
            var controlArray = territoryQuery.ToComponentDataArray<TerritoryControl>(Allocator.Temp);

            bool isHostile = false;

            for (int i = 0; i < dataArray.Length; i++)
            {
                if (dataArray[i].Id == territory)
                {
                    var controller = controlArray[i].CurrentController;
                    var standing = controller switch
                    {
                        FactionType.Kurenai => reputation.GetKurenaiLevel(),
                        FactionType.Azure => reputation.GetAzureLevel(),
                        _ => ReputationLevel.Neutral
                    };

                    isHostile = standing == ReputationLevel.Hated || standing == ReputationLevel.Hostile;
                    break;
                }
            }

            dataArray.Dispose();
            controlArray.Dispose();

            return isHostile;
        }

        /// <summary>
        /// Get all connected territories from a source.
        /// </summary>
        public static NativeList<TerritoryId> GetConnectedTerritories(
            EntityManager em,
            TerritoryId source,
            bool onlyUnlocked = true)
        {
            var result = new NativeList<TerritoryId>(Allocator.Temp);
            var query = em.CreateEntityQuery(ComponentType.ReadOnly<TerritoryConnection>());
            var connections = query.ToComponentDataArray<TerritoryConnection>(Allocator.Temp);

            for (int i = 0; i < connections.Length; i++)
            {
                if (connections[i].SourceTerritory == source)
                {
                    if (!onlyUnlocked || connections[i].IsUnlocked)
                    {
                        result.Add(connections[i].TargetTerritory);
                    }
                }
            }

            connections.Dispose();
            return result;
        }

        /// <summary>
        /// Initialize territory system with all canonical territories.
        /// Call once at game start.
        /// </summary>
        public static void InitializeTerritorySystem(EntityManager em, int worldSeed = 42)
        {
            // Create all territory entities from definitions
            TerritoryDefinitions.CreateTerritoryEntities(em, worldSeed);

            // Ensure player has ActiveTerritory component
            var playerQuery = em.CreateEntityQuery(ComponentType.ReadOnly<PlayerTag>());
            if (!playerQuery.IsEmpty)
            {
                var playerEntity = playerQuery.GetSingletonEntity();

                if (!em.HasComponent<ActiveTerritory>(playerEntity))
                {
                    em.AddComponentData(playerEntity, new ActiveTerritory
                    {
                        CurrentTerritory = TerritoryId.None,
                        PreviousTerritory = TerritoryId.None,
                        TimeInTerritory = 0f,
                        JustEntered = false,
                        JustExited = false
                    });
                }

                // Add discovery buffer if not present
                if (!em.HasBuffer<DiscoveredTerritoryElement>(playerEntity))
                {
                    em.AddBuffer<DiscoveredTerritoryElement>(playerEntity);
                }
            }

            Debug.Log($"[TerritoryHelpers] Territory system initialized with seed {worldSeed}");
        }
    }

    #endregion
}
