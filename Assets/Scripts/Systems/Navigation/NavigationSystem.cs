using Unity.Burst;
using Unity.Collections;
using Unity.Entities;
using Unity.Mathematics;
using Unity.Transforms;
using NeoTokyo.Components.Navigation;

namespace NeoTokyo.Systems.Navigation
{
    /// <summary>
    /// System that processes navigation path following
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    public partial struct NavAgentMovementSystem : ISystem
    {
        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            float deltaTime = SystemAPI.Time.DeltaTime;

            new FollowPathJob
            {
                DeltaTime = deltaTime
            }.ScheduleParallel();
        }

        [BurstCompile]
        partial struct FollowPathJob : IJobEntity
        {
            public float DeltaTime;

            void Execute(
                ref LocalTransform transform,
                ref NavAgent agent,
                in DynamicBuffer<Waypoint> waypoints)
            {
                if (!agent.HasPath || !agent.IsMoving || waypoints.Length == 0)
                    return;

                if (agent.CurrentWaypointIndex >= waypoints.Length)
                {
                    agent.IsMoving = false;
                    agent.HasPath = false;
                    return;
                }

                var targetWaypoint = waypoints[agent.CurrentWaypointIndex];
                float3 direction = targetWaypoint.Position - transform.Position;
                float distance = math.length(direction);

                if (distance <= agent.StoppingDistance)
                {
                    // Reached waypoint, move to next
                    agent.CurrentWaypointIndex++;

                    if (agent.CurrentWaypointIndex >= waypoints.Length)
                    {
                        agent.IsMoving = false;
                        agent.HasPath = false;
                    }
                    return;
                }

                // Move towards waypoint
                float3 normalizedDir = math.normalize(direction);
                float moveDistance = math.min(agent.Speed * DeltaTime, distance);
                transform.Position += normalizedDir * moveDistance;

                // Rotate towards movement direction
                if (math.lengthsq(normalizedDir) > 0.001f)
                {
                    quaternion targetRotation = quaternion.LookRotationSafe(normalizedDir, math.up());
                    transform.Rotation = math.slerp(
                        transform.Rotation,
                        targetRotation,
                        agent.RotationSpeed * DeltaTime
                    );
                }
            }
        }
    }

    /// <summary>
    /// System that follows target entities
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateBefore(typeof(NavAgentMovementSystem))]
    public partial struct NavTargetFollowSystem : ISystem
    {
        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            var localTransformLookup = SystemAPI.GetComponentLookup<LocalTransform>(true);

            new UpdateTargetPositionJob
            {
                LocalTransformLookup = localTransformLookup
            }.ScheduleParallel();
        }

        [BurstCompile]
        partial struct UpdateTargetPositionJob : IJobEntity
        {
            [ReadOnly] public ComponentLookup<LocalTransform> LocalTransformLookup;

            void Execute(ref NavTarget target)
            {
                if (!target.FollowTarget || target.TargetEntity == Entity.Null)
                    return;

                if (LocalTransformLookup.HasComponent(target.TargetEntity))
                {
                    target.Destination = LocalTransformLookup[target.TargetEntity].Position;
                }
            }
        }
    }

    /// <summary>
    /// Simple A* pathfinding on hex grid
    /// For production, integrate with Unity.AI.Navigation or RecastJS equivalent
    /// </summary>
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    public partial struct HexPathfindingSystem : ISystem
    {
        private struct PathNode
        {
            public Entity Entity;
            public int2 Coords;
            public float GCost;
            public float HCost;
            public float FCost => GCost + HCost;
            public Entity Parent;
        }

        public void OnCreate(ref SystemState state)
        {
            state.RequireForUpdate<PathRequest>();
            state.RequireForUpdate<EndSimulationEntityCommandBufferSystem.Singleton>();
        }

        public void OnUpdate(ref SystemState state)
        {
            var ecb = SystemAPI.GetSingleton<EndSimulationEntityCommandBufferSystem.Singleton>()
                .CreateCommandBuffer(state.WorldUnmanaged);

            // Build hex tile lookup
            var hexTiles = new NativeHashMap<int2, Entity>(256, Allocator.TempJob);

            foreach (var (tile, entity) in
                SystemAPI.Query<RefRO<HexTileNav>>()
                    .WithEntityAccess())
            {
                if (tile.ValueRO.IsWalkable)
                {
                    hexTiles.TryAdd(tile.ValueRO.AxialCoords, entity);
                }
            }

            // Process path requests
            foreach (var (request, waypointBuffer, agent, entity) in
                SystemAPI.Query<RefRO<PathRequest>, DynamicBuffer<Waypoint>, RefRW<NavAgent>>()
                    .WithEntityAccess())
            {
                var path = FindPath(
                    request.ValueRO.Start,
                    request.ValueRO.End,
                    hexTiles,
                    ref state
                );

                waypointBuffer.Clear();

                if (path.IsCreated && path.Length > 0)
                {
                    for (int i = 0; i < path.Length; i++)
                    {
                        waypointBuffer.Add(new Waypoint
                        {
                            Position = path[i],
                            Index = i
                        });
                    }
                    agent.ValueRW.HasPath = true;
                    agent.ValueRW.IsMoving = true;
                    agent.ValueRW.CurrentWaypointIndex = 0;

                    path.Dispose();
                }

                ecb.RemoveComponent<PathRequest>(entity);
            }

            hexTiles.Dispose();
        }

        private NativeList<float3> FindPath(
            float3 start,
            float3 end,
            NativeHashMap<int2, Entity> hexTiles,
            ref SystemState state)
        {
            var path = new NativeList<float3>(Allocator.TempJob);

            // Find closest hex tiles to start and end
            int2 startCoords = WorldToHex(start);
            int2 endCoords = WorldToHex(end);

            if (!hexTiles.ContainsKey(startCoords) || !hexTiles.ContainsKey(endCoords))
            {
                // Direct path if hex grid not set up
                path.Add(start);
                path.Add(end);
                return path;
            }

            // A* implementation
            var openSet = new NativeList<PathNode>(64, Allocator.Temp);
            var closedSet = new NativeHashSet<int2>(64, Allocator.Temp);
            var nodeMap = new NativeHashMap<int2, PathNode>(64, Allocator.Temp);

            var startNode = new PathNode
            {
                Entity = hexTiles[startCoords],
                Coords = startCoords,
                GCost = 0,
                HCost = HexDistance(startCoords, endCoords),
                Parent = Entity.Null
            };

            openSet.Add(startNode);
            nodeMap.Add(startCoords, startNode);

            while (openSet.Length > 0)
            {
                // Find node with lowest F cost
                int lowestIndex = 0;
                for (int i = 1; i < openSet.Length; i++)
                {
                    if (openSet[i].FCost < openSet[lowestIndex].FCost)
                        lowestIndex = i;
                }

                var current = openSet[lowestIndex];
                openSet.RemoveAtSwapBack(lowestIndex);
                closedSet.Add(current.Coords);

                // Found destination
                if (current.Coords.Equals(endCoords))
                {
                    ReconstructPath(current, nodeMap, ref path, ref state);
                    break;
                }

                // Check neighbors
                var neighbors = GetHexNeighbors(current.Coords);
                for (int i = 0; i < 6; i++)
                {
                    int2 neighborCoords = neighbors[i];

                    if (closedSet.Contains(neighborCoords) || !hexTiles.ContainsKey(neighborCoords))
                        continue;

                    float tentativeG = current.GCost + 1f; // Uniform cost for now

                    if (!nodeMap.ContainsKey(neighborCoords) ||
                        tentativeG < nodeMap[neighborCoords].GCost)
                    {
                        var neighborNode = new PathNode
                        {
                            Entity = hexTiles[neighborCoords],
                            Coords = neighborCoords,
                            GCost = tentativeG,
                            HCost = HexDistance(neighborCoords, endCoords),
                            Parent = current.Entity
                        };

                        if (nodeMap.ContainsKey(neighborCoords))
                        {
                            nodeMap[neighborCoords] = neighborNode;
                        }
                        else
                        {
                            nodeMap.Add(neighborCoords, neighborNode);
                            openSet.Add(neighborNode);
                        }
                    }
                }
            }

            openSet.Dispose();
            closedSet.Dispose();
            nodeMap.Dispose();

            return path;
        }

        private void ReconstructPath(
            PathNode endNode,
            NativeHashMap<int2, PathNode> nodeMap,
            ref NativeList<float3> path,
            ref SystemState state)
        {
            var coords = new NativeList<int2>(32, Allocator.Temp);
            var current = endNode;

            while (current.Parent != Entity.Null)
            {
                coords.Add(current.Coords);
                // Find parent in nodeMap by coords
                bool found = false;
                foreach (var kvp in nodeMap)
                {
                    if (SystemAPI.HasComponent<HexTileNav>(current.Parent))
                    {
                        var parentTile = SystemAPI.GetComponent<HexTileNav>(current.Parent);
                        if (nodeMap.TryGetValue(parentTile.AxialCoords, out var parentNode))
                        {
                            current = parentNode;
                            found = true;
                            break;
                        }
                    }
                }
                if (!found) break;
            }
            coords.Add(current.Coords);

            // Reverse and convert to world positions
            for (int i = coords.Length - 1; i >= 0; i--)
            {
                path.Add(HexToWorld(coords[i]));
            }

            coords.Dispose();
        }

        private int2 WorldToHex(float3 worldPos)
        {
            // Axial coordinates from world position
            // Using pointy-top hex orientation
            float size = 1f; // Hex size
            float q = (math.sqrt(3f) / 3f * worldPos.x - 1f / 3f * worldPos.z) / size;
            float r = (2f / 3f * worldPos.z) / size;
            return new int2((int)math.round(q), (int)math.round(r));
        }

        private float3 HexToWorld(int2 axialCoords)
        {
            float size = 1f;
            float x = size * (math.sqrt(3f) * axialCoords.x + math.sqrt(3f) / 2f * axialCoords.y);
            float z = size * (3f / 2f * axialCoords.y);
            return new float3(x, 0f, z);
        }

        private float HexDistance(int2 a, int2 b)
        {
            return (math.abs(a.x - b.x) +
                    math.abs(a.x + a.y - b.x - b.y) +
                    math.abs(a.y - b.y)) / 2f;
        }

        private NativeArray<int2> GetHexNeighbors(int2 coords)
        {
            var neighbors = new NativeArray<int2>(6, Allocator.Temp);
            neighbors[0] = coords + new int2(1, 0);
            neighbors[1] = coords + new int2(1, -1);
            neighbors[2] = coords + new int2(0, -1);
            neighbors[3] = coords + new int2(-1, 0);
            neighbors[4] = coords + new int2(-1, 1);
            neighbors[5] = coords + new int2(0, 1);
            return neighbors;
        }
    }
}
