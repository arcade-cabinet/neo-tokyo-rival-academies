using Unity.Burst;
using Unity.Collections;
using Unity.Entities;
using Unity.Mathematics;
using Unity.Transforms;
using NeoTokyo.Components.World;
using NeoTokyo.Components.Navigation;
using NeoTokyo.Components.Core;

namespace NeoTokyo.Systems.World
{
    /// <summary>
    /// System that manages ferry boat route following.
    /// Ferries transport passengers between territories in flooded Neo-Tokyo.
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    public partial struct BoatRouteSystem : ISystem
    {
        [BurstCompile]
        public void OnCreate(ref SystemState state)
        {
            state.RequireForUpdate<BoatData>();
            state.RequireForUpdate<EndSimulationEntityCommandBufferSystem.Singleton>();
        }

        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            float deltaTime = SystemAPI.Time.DeltaTime;
            var ecb = SystemAPI.GetSingleton<EndSimulationEntityCommandBufferSystem.Singleton>()
                .CreateCommandBuffer(state.WorldUnmanaged);

            foreach (var (boat, transform, routeBuffer, entity) in
                SystemAPI.Query<RefRW<BoatData>, RefRW<LocalTransform>, DynamicBuffer<BoatRoute>>()
                    .WithEntityAccess())
            {
                // Only process ferries with routes
                if (!boat.ValueRO.IsFerry || routeBuffer.Length == 0)
                    continue;

                int waypointIndex = boat.ValueRO.CurrentWaypointIndex;
                if (waypointIndex >= routeBuffer.Length)
                {
                    // Loop back to start
                    waypointIndex = 0;
                    boat.ValueRW.CurrentWaypointIndex = 0;
                }

                var currentWaypoint = routeBuffer[waypointIndex];

                // Check if waiting at dock
                if (boat.ValueRO.WaitTimer > 0)
                {
                    boat.ValueRW.WaitTimer -= deltaTime;
                    boat.ValueRW.IsMoving = false;
                    boat.ValueRW.CanBoard = currentWaypoint.IsDock;

                    if (boat.ValueRO.WaitTimer <= 0)
                    {
                        // Done waiting, move to next waypoint
                        boat.ValueRW.CurrentWaypointIndex = (waypointIndex + 1) % routeBuffer.Length;
                        boat.ValueRW.CanBoard = false;

                        // Undock if at dock
                        if (currentWaypoint.IsDock && currentWaypoint.DockEntity != Entity.Null)
                        {
                            if (SystemAPI.HasComponent<DockData>(currentWaypoint.DockEntity))
                            {
                                var dock = SystemAPI.GetComponent<DockData>(currentWaypoint.DockEntity);
                                dock.HasBoatDocked = false;
                                dock.DockedBoat = Entity.Null;
                                ecb.SetComponent(currentWaypoint.DockEntity, dock);
                            }
                        }
                    }
                    continue;
                }

                // Move towards current waypoint
                float3 targetPos = currentWaypoint.Waypoint;
                float3 currentPos = transform.ValueRO.Position;
                float3 direction = targetPos - currentPos;
                float distance = math.length(direction);

                const float arrivalThreshold = 0.5f;

                if (distance <= arrivalThreshold)
                {
                    // Arrived at waypoint
                    transform.ValueRW.Position = targetPos;

                    if (currentWaypoint.WaitTime > 0 || currentWaypoint.IsDock)
                    {
                        // Start waiting
                        boat.ValueRW.WaitTimer = math.max(currentWaypoint.WaitTime, 2f);
                        boat.ValueRW.IsMoving = false;

                        // Dock if at dock
                        if (currentWaypoint.IsDock && currentWaypoint.DockEntity != Entity.Null)
                        {
                            if (SystemAPI.HasComponent<DockData>(currentWaypoint.DockEntity))
                            {
                                var dock = SystemAPI.GetComponent<DockData>(currentWaypoint.DockEntity);
                                dock.HasBoatDocked = true;
                                dock.DockedBoat = entity;
                                ecb.SetComponent(currentWaypoint.DockEntity, dock);
                            }
                        }
                    }
                    else
                    {
                        // Pass through, move to next
                        boat.ValueRW.CurrentWaypointIndex = (waypointIndex + 1) % routeBuffer.Length;
                    }
                }
                else
                {
                    // Move towards waypoint
                    boat.ValueRW.IsMoving = true;
                    float3 normalizedDir = math.normalize(direction);
                    float moveDistance = math.min(boat.ValueRO.Speed * deltaTime, distance);
                    transform.ValueRW.Position += normalizedDir * moveDistance;

                    // Rotate to face movement direction
                    if (math.lengthsq(normalizedDir) > 0.001f)
                    {
                        quaternion targetRotation = quaternion.LookRotationSafe(normalizedDir, math.up());
                        transform.ValueRW.Rotation = math.slerp(
                            transform.ValueRO.Rotation,
                            targetRotation,
                            boat.ValueRO.TurnSpeed * deltaTime
                        );
                    }
                }
            }
        }
    }

    /// <summary>
    /// System that handles passenger boarding onto boats.
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    public partial struct BoatBoardingSystem : ISystem
    {
        [BurstCompile]
        public void OnCreate(ref SystemState state)
        {
            state.RequireForUpdate<BoardBoatRequest>();
            state.RequireForUpdate<EndSimulationEntityCommandBufferSystem.Singleton>();
        }

        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            var ecb = SystemAPI.GetSingleton<EndSimulationEntityCommandBufferSystem.Singleton>()
                .CreateCommandBuffer(state.WorldUnmanaged);

            foreach (var (request, entity) in
                SystemAPI.Query<RefRO<BoardBoatRequest>>()
                    .WithEntityAccess())
            {
                var passenger = request.ValueRO.Passenger;
                var targetBoat = request.ValueRO.TargetBoat;

                // Validate boat exists and has capacity
                if (!SystemAPI.HasComponent<BoatData>(targetBoat))
                {
                    ecb.DestroyEntity(entity);
                    continue;
                }

                var boat = SystemAPI.GetComponent<BoatData>(targetBoat);

                if (!boat.CanBoard || !boat.HasCapacity)
                {
                    ecb.DestroyEntity(entity);
                    continue;
                }

                // Check passenger isn't already on a boat
                if (SystemAPI.HasComponent<OnBoat>(passenger))
                {
                    ecb.DestroyEntity(entity);
                    continue;
                }

                // Board the passenger
                int seatIndex = boat.CurrentPassengers;
                boat.CurrentPassengers++;
                ecb.SetComponent(targetBoat, boat);

                ecb.AddComponent(passenger, new OnBoat
                {
                    BoatEntity = targetBoat,
                    SeatIndex = seatIndex,
                    IsOperator = seatIndex == 0 && !boat.IsFerry // First passenger on player boat is operator
                });

                // Remove water-related components since they're on the boat now
                if (SystemAPI.HasComponent<InWater>(passenger))
                {
                    ecb.RemoveComponent<InWater>(passenger);
                    ecb.RemoveComponent<MovementModifier>(passenger);
                    ecb.RemoveComponent<WaterCombatModifier>(passenger);
                }

                if (SystemAPI.HasComponent<DivingState>(passenger))
                {
                    ecb.RemoveComponent<DivingState>(passenger);
                }

                // Consume the request
                ecb.DestroyEntity(entity);
            }
        }
    }

    /// <summary>
    /// System that handles passenger disembarking from boats.
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    public partial struct BoatDisembarkingSystem : ISystem
    {
        [BurstCompile]
        public void OnCreate(ref SystemState state)
        {
            state.RequireForUpdate<DisembarkRequest>();
            state.RequireForUpdate<EndSimulationEntityCommandBufferSystem.Singleton>();
        }

        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            var ecb = SystemAPI.GetSingleton<EndSimulationEntityCommandBufferSystem.Singleton>()
                .CreateCommandBuffer(state.WorldUnmanaged);

            foreach (var (request, entity) in
                SystemAPI.Query<RefRO<DisembarkRequest>>()
                    .WithEntityAccess())
            {
                var passenger = request.ValueRO.Passenger;
                var targetDock = request.ValueRO.TargetDock;

                // Validate passenger is on a boat
                if (!SystemAPI.HasComponent<OnBoat>(passenger))
                {
                    ecb.DestroyEntity(entity);
                    continue;
                }

                var onBoat = SystemAPI.GetComponent<OnBoat>(passenger);
                var boatEntity = onBoat.BoatEntity;

                // Validate boat exists
                if (!SystemAPI.HasComponent<BoatData>(boatEntity))
                {
                    ecb.DestroyEntity(entity);
                    continue;
                }

                var boat = SystemAPI.GetComponent<BoatData>(boatEntity);

                // Can only disembark when boat is stopped (ferry at dock or player boat)
                if (boat.IsFerry && boat.IsMoving)
                {
                    ecb.DestroyEntity(entity);
                    continue;
                }

                // Disembark passenger
                boat.CurrentPassengers = math.max(0, boat.CurrentPassengers - 1);
                ecb.SetComponent(boatEntity, boat);

                ecb.RemoveComponent<OnBoat>(passenger);

                // Position passenger at dock or boat position
                if (targetDock != Entity.Null && SystemAPI.HasComponent<DockData>(targetDock))
                {
                    var dock = SystemAPI.GetComponent<DockData>(targetDock);
                    if (SystemAPI.HasComponent<LocalTransform>(passenger))
                    {
                        var passengerTransform = SystemAPI.GetComponent<LocalTransform>(passenger);
                        passengerTransform.Position = dock.DisembarkPosition;
                        ecb.SetComponent(passenger, passengerTransform);
                    }
                }
                else if (SystemAPI.HasComponent<LocalTransform>(boatEntity) &&
                         SystemAPI.HasComponent<LocalTransform>(passenger))
                {
                    // Disembark at boat position (offset slightly)
                    var boatTransform = SystemAPI.GetComponent<LocalTransform>(boatEntity);
                    var passengerTransform = SystemAPI.GetComponent<LocalTransform>(passenger);
                    passengerTransform.Position = boatTransform.Position + new float3(2f, 0f, 0f);
                    ecb.SetComponent(passenger, passengerTransform);
                }

                // Consume the request
                ecb.DestroyEntity(entity);
            }
        }
    }

    /// <summary>
    /// System that synchronizes passenger positions to boat positions.
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(TransformSystemGroup))]
    public partial struct BoatPassengerSyncSystem : ISystem
    {
        // Seat offsets relative to boat center
        private static readonly float3[] SeatOffsets = new float3[]
        {
            new float3(0f, 0.5f, 0.3f),      // Seat 0: Front center (operator)
            new float3(-0.4f, 0.5f, -0.2f),  // Seat 1: Back left
            new float3(0.4f, 0.5f, -0.2f),   // Seat 2: Back right
            new float3(0f, 0.5f, -0.5f),     // Seat 3: Back center
            new float3(-0.6f, 0.5f, 0f),     // Seat 4: Left
            new float3(0.6f, 0.5f, 0f),      // Seat 5: Right
        };

        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            var boatTransformLookup = SystemAPI.GetComponentLookup<LocalTransform>(true);
            var boatDataLookup = SystemAPI.GetComponentLookup<BoatData>(true);

            foreach (var (onBoat, transform) in
                SystemAPI.Query<RefRO<OnBoat>, RefRW<LocalTransform>>())
            {
                if (!boatTransformLookup.HasComponent(onBoat.ValueRO.BoatEntity))
                    continue;

                var boatTransform = boatTransformLookup[onBoat.ValueRO.BoatEntity];

                // Get seat offset
                int seatIndex = math.clamp(onBoat.ValueRO.SeatIndex, 0, SeatOffsets.Length - 1);
                float3 seatOffset = SeatOffsets[seatIndex];

                // Rotate offset by boat rotation
                float3 rotatedOffset = math.rotate(boatTransform.Rotation, seatOffset);

                // Set passenger position
                transform.ValueRW.Position = boatTransform.Position + rotatedOffset;

                // Match boat rotation (passengers face forward)
                transform.ValueRW.Rotation = boatTransform.Rotation;
            }
        }
    }

    /// <summary>
    /// System that handles player-controlled boat movement.
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    public partial struct PlayerBoatControlSystem : ISystem
    {
        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            float deltaTime = SystemAPI.Time.DeltaTime;

            // Find player-controlled boats (boats with a player operator)
            foreach (var (boat, transform, entity) in
                SystemAPI.Query<RefRW<BoatData>, RefRW<LocalTransform>>()
                    .WithNone<BoatRoute>() // Non-ferry boats
                    .WithEntityAccess())
            {
                // Check if player is operating this boat
                bool hasPlayerOperator = false;

                foreach (var (onBoat, playerTag) in
                    SystemAPI.Query<RefRO<OnBoat>, RefRO<PlayerTag>>())
                {
                    if (onBoat.ValueRO.BoatEntity == entity && onBoat.ValueRO.IsOperator)
                    {
                        hasPlayerOperator = true;
                        break;
                    }
                }

                if (!hasPlayerOperator)
                    continue;

                // Player boat controls would be read from input system here
                // For now, this is a placeholder for the control integration

                // The actual movement would be:
                // - Read input (forward/backward, turn)
                // - Apply boat speed and turn speed
                // - Update transform
            }
        }
    }

    /// <summary>
    /// System that handles boat spawning at docks.
    /// </summary>
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    public partial struct BoatSpawnSystem : ISystem
    {
        public void OnCreate(ref SystemState state)
        {
            // Create ferry routes on demand
        }

        public void OnUpdate(ref SystemState state)
        {
            // Boat spawning would be triggered by:
            // - Level load (spawn ferries)
            // - Player purchasing a boat
            // - Scripted events
        }

        /// <summary>
        /// Helper to create a ferry entity with a route.
        /// Call from authoring or runtime spawning.
        /// </summary>
        public static Entity CreateFerry(
            EntityManager em,
            float3 startPosition,
            NativeArray<float3> waypoints,
            NativeArray<float> waitTimes,
            NativeArray<Entity> dockEntities,
            int capacity = 6)
        {
            var entity = em.CreateEntity();

            em.AddComponent(entity, BoatData.Ferry(capacity));
            em.AddComponent(entity, LocalTransform.FromPosition(startPosition));

            var routeBuffer = em.AddBuffer<BoatRoute>(entity);
            for (int i = 0; i < waypoints.Length; i++)
            {
                routeBuffer.Add(new BoatRoute
                {
                    Waypoint = waypoints[i],
                    WaitTime = i < waitTimes.Length ? waitTimes[i] : 0f,
                    IsDock = i < dockEntities.Length && dockEntities[i] != Entity.Null,
                    DockEntity = i < dockEntities.Length ? dockEntities[i] : Entity.Null
                });
            }

            return entity;
        }
    }

    /// <summary>
    /// System that handles boat rocking during combat (unstable platform mechanics).
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    public partial struct BoatRockingSystem : ISystem
    {
        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            float time = (float)SystemAPI.Time.ElapsedTime;

            foreach (var (boat, transform) in
                SystemAPI.Query<RefRO<BoatData>, RefRW<LocalTransform>>())
            {
                if (!boat.ValueRO.IsMoving)
                {
                    // Idle rocking
                    float rockAngle = math.sin(time * 1.5f) * 0.02f;
                    float pitchAngle = math.sin(time * 1.2f + 0.5f) * 0.015f;

                    quaternion rockRotation = quaternion.Euler(pitchAngle, 0f, rockAngle);

                    // Preserve forward direction, add rock
                    float3 forward = math.forward(transform.ValueRO.Rotation);
                    quaternion baseRotation = quaternion.LookRotationSafe(forward, math.up());
                    transform.ValueRW.Rotation = math.mul(baseRotation, rockRotation);
                }
                else
                {
                    // Moving boats have more pronounced wave motion
                    float rockAngle = math.sin(time * 2.5f) * 0.04f;
                    float pitchAngle = math.sin(time * 2f + 0.5f) * 0.03f;

                    quaternion rockRotation = quaternion.Euler(pitchAngle, 0f, rockAngle);

                    float3 forward = math.forward(transform.ValueRO.Rotation);
                    quaternion baseRotation = quaternion.LookRotationSafe(forward, math.up());
                    transform.ValueRW.Rotation = math.mul(baseRotation, rockRotation);
                }
            }
        }
    }

    /// <summary>
    /// Component for tracking boat combat events (knockback into water, etc.)
    /// </summary>
    public struct BoatCombatEvent : IBufferElementData
    {
        public enum EventType : byte
        {
            PassengerKnockedOff = 0,
            HeavyImpact = 1,
            Collision = 2
        }

        public EventType Type;
        public Entity AffectedEntity;
        public float3 KnockbackDirection;
        public float Force;
    }

    /// <summary>
    /// System that processes combat events on boats (knockback off boat, etc.)
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    public partial struct BoatCombatEventSystem : ISystem
    {
        [BurstCompile]
        public void OnCreate(ref SystemState state)
        {
            state.RequireForUpdate<EndSimulationEntityCommandBufferSystem.Singleton>();
        }

        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            var ecb = SystemAPI.GetSingleton<EndSimulationEntityCommandBufferSystem.Singleton>()
                .CreateCommandBuffer(state.WorldUnmanaged);

            foreach (var (eventBuffer, boat, entity) in
                SystemAPI.Query<DynamicBuffer<BoatCombatEvent>, RefRW<BoatData>>()
                    .WithEntityAccess())
            {
                foreach (var combatEvent in eventBuffer)
                {
                    switch (combatEvent.Type)
                    {
                        case BoatCombatEvent.EventType.PassengerKnockedOff:
                            // Remove passenger from boat
                            if (SystemAPI.HasComponent<OnBoat>(combatEvent.AffectedEntity))
                            {
                                ecb.RemoveComponent<OnBoat>(combatEvent.AffectedEntity);
                                boat.ValueRW.CurrentPassengers = math.max(0, boat.ValueRO.CurrentPassengers - 1);

                                // Apply knockback to passenger (they'll enter water)
                                if (SystemAPI.HasComponent<LocalTransform>(combatEvent.AffectedEntity))
                                {
                                    var transform = SystemAPI.GetComponent<LocalTransform>(combatEvent.AffectedEntity);
                                    transform.Position += combatEvent.KnockbackDirection * combatEvent.Force;
                                    ecb.SetComponent(combatEvent.AffectedEntity, transform);
                                }
                            }
                            break;

                        case BoatCombatEvent.EventType.HeavyImpact:
                            // Could destabilize all passengers, cause boat rocking
                            break;

                        case BoatCombatEvent.EventType.Collision:
                            // Boat collision with obstacle
                            break;
                    }
                }

                eventBuffer.Clear();
            }
        }
    }
}
