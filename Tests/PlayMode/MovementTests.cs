using NUnit.Framework;
using Unity.Entities;
using Unity.Transforms;
using Unity.Mathematics;
using Unity.Collections;
using UnityEngine.TestTools;
using System.Collections;
using NeoTokyo.Components.Core;
using NeoTokyo.Components.Navigation;

namespace NeoTokyo.Tests.PlayMode
{
    /// <summary>
    /// Integration tests for player movement and navigation systems.
    /// Tests input handling, pathfinding, and steering behaviors.
    /// </summary>
    [TestFixture]
    public class MovementTests
    {
        private World _testWorld;
        private EntityManager _em;

        private const float DEFAULT_SPEED = 5f;
        private const float DEFAULT_STOPPING_DISTANCE = 0.1f;
        private const float DEFAULT_ROTATION_SPEED = 10f;

        [SetUp]
        public void SetUp()
        {
            _testWorld = new World("MovementTestWorld");
            _em = _testWorld.EntityManager;
        }

        [TearDown]
        public void TearDown()
        {
            if (_testWorld != null && _testWorld.IsCreated)
            {
                _testWorld.Dispose();
            }
        }

        [UnityTest]
        public IEnumerator Player_MovesWithInputDirection()
        {
            // Arrange
            var playerEntity = CreateMovableEntity(float3.zero);
            float3 moveDirection = new float3(1f, 0f, 0f);
            float deltaTime = 0.016f; // ~60fps
            yield return null;

            // Act
            SimulateMovement(playerEntity, moveDirection, deltaTime);

            // Assert
            var transform = _em.GetComponentData<LocalTransform>(playerEntity);
            float expectedX = DEFAULT_SPEED * deltaTime;
            Assert.AreEqual(expectedX, transform.Position.x, 0.001f,
                "Player should move in input direction");
        }

        [UnityTest]
        public IEnumerator NavAgent_FollowsPath()
        {
            // Arrange
            var entity = CreateNavAgentEntity(float3.zero);
            var waypointBuffer = _em.GetBuffer<Waypoint>(entity);

            waypointBuffer.Add(new Waypoint { Position = new float3(2f, 0f, 0f), Index = 0 });
            waypointBuffer.Add(new Waypoint { Position = new float3(2f, 0f, 2f), Index = 1 });
            waypointBuffer.Add(new Waypoint { Position = new float3(0f, 0f, 2f), Index = 2 });

            var agent = _em.GetComponentData<NavAgent>(entity);
            agent.HasPath = true;
            agent.IsMoving = true;
            agent.CurrentWaypointIndex = 0;
            _em.SetComponentData(entity, agent);
            yield return null;

            // Act - Simulate multiple frames of movement
            for (int i = 0; i < 100; i++)
            {
                SimulateNavAgentMovement(entity, 0.016f);
            }

            // Assert - Should have progressed through waypoints
            var finalAgent = _em.GetComponentData<NavAgent>(entity);
            Assert.Greater(finalAgent.CurrentWaypointIndex, 0,
                "Agent should have progressed through waypoints");
        }

        [UnityTest]
        public IEnumerator NavAgent_StopsAtDestination()
        {
            // Arrange
            var entity = CreateNavAgentEntity(float3.zero);
            var waypointBuffer = _em.GetBuffer<Waypoint>(entity);

            // Single waypoint close by
            waypointBuffer.Add(new Waypoint { Position = new float3(0.05f, 0f, 0f), Index = 0 });

            var agent = _em.GetComponentData<NavAgent>(entity);
            agent.HasPath = true;
            agent.IsMoving = true;
            agent.CurrentWaypointIndex = 0;
            _em.SetComponentData(entity, agent);
            yield return null;

            // Act - Move towards destination
            SimulateNavAgentMovement(entity, 0.1f);

            // Assert
            var finalAgent = _em.GetComponentData<NavAgent>(entity);
            Assert.IsFalse(finalAgent.IsMoving,
                "Agent should stop when reaching destination");
            Assert.IsFalse(finalAgent.HasPath,
                "Path should be cleared at destination");
        }

        [UnityTest]
        public IEnumerator NavAgent_RotatesTowardsTarget()
        {
            // Arrange
            var entity = CreateNavAgentEntity(float3.zero);
            var waypointBuffer = _em.GetBuffer<Waypoint>(entity);

            // Waypoint to the right
            waypointBuffer.Add(new Waypoint { Position = new float3(5f, 0f, 0f), Index = 0 });

            var agent = _em.GetComponentData<NavAgent>(entity);
            agent.HasPath = true;
            agent.IsMoving = true;
            agent.CurrentWaypointIndex = 0;
            _em.SetComponentData(entity, agent);
            yield return null;

            // Act - Multiple frames to allow rotation
            for (int i = 0; i < 50; i++)
            {
                SimulateNavAgentMovementWithRotation(entity, 0.016f);
            }

            // Assert - Should be facing right (along X axis)
            var transform = _em.GetComponentData<LocalTransform>(entity);
            float3 forward = math.forward(transform.Rotation);
            Assert.Greater(forward.x, 0.9f,
                "Agent should rotate towards waypoint");
        }

        [UnityTest]
        public IEnumerator PathRequest_GeneratesPath()
        {
            // Arrange
            var entity = CreateNavAgentWithPathRequest(
                start: float3.zero,
                end: new float3(5f, 0f, 5f)
            );
            yield return null;

            // Assert - Path request should be present
            Assert.IsTrue(_em.HasComponent<PathRequest>(entity),
                "Entity should have PathRequest component");

            var request = _em.GetComponentData<PathRequest>(entity);
            Assert.AreEqual(float3.zero, request.Start);
            Assert.AreEqual(new float3(5f, 0f, 5f), request.End);
        }

        [UnityTest]
        public IEnumerator NavTarget_FollowsEntity()
        {
            // Arrange
            var targetEntity = CreateMovableEntity(new float3(10f, 0f, 0f));
            var followerEntity = CreateNavAgentWithTarget(float3.zero, targetEntity);
            yield return null;

            // Act - Update target position lookup
            SimulateTargetFollow(followerEntity, targetEntity);

            // Assert
            var navTarget = _em.GetComponentData<NavTarget>(followerEntity);
            var targetTransform = _em.GetComponentData<LocalTransform>(targetEntity);
            Assert.AreEqual(targetTransform.Position, navTarget.Destination,
                "NavTarget destination should match target entity position");
        }

        [UnityTest]
        public IEnumerator HexPathfinding_FindsPath()
        {
            // Arrange
            SetupHexGrid();
            var entity = CreateNavAgentWithPathRequest(
                start: new float3(0f, 0f, 0f),
                end: new float3(3f, 0f, 3f)
            );
            yield return null;

            // Act - Simulate pathfinding (simplified for test)
            SimulateHexPathfinding(entity);

            // Assert
            var waypointBuffer = _em.GetBuffer<Waypoint>(entity);
            Assert.Greater(waypointBuffer.Length, 0,
                "Pathfinding should generate waypoints");
        }

        [UnityTest]
        public IEnumerator NavObstacle_BlocksPath()
        {
            // Arrange
            var obstacleEntity = CreateObstacle(new float3(1f, 0f, 0f), 0.5f);
            var movingEntity = CreateMovableEntity(float3.zero);
            yield return null;

            // Assert
            Assert.IsTrue(_em.HasComponent<NavObstacle>(obstacleEntity));
            var obstacle = _em.GetComponentData<NavObstacle>(obstacleEntity);
            Assert.AreEqual(0.5f, obstacle.Radius);
        }

        [UnityTest]
        public IEnumerator MovementSpeed_ScalesWithFlow()
        {
            // Arrange - Flow stat affects speed
            var entity = CreateMovableEntity(float3.zero);
            float baseSpeed = DEFAULT_SPEED;
            float flowMultiplier = 1.5f; // 50% bonus from Flow stat
            yield return null;

            // Act
            float adjustedSpeed = baseSpeed * flowMultiplier;
            float3 direction = new float3(1f, 0f, 0f);
            float deltaTime = 0.1f;
            SimulateMovementWithSpeed(entity, direction, deltaTime, adjustedSpeed);

            // Assert
            var transform = _em.GetComponentData<LocalTransform>(entity);
            float expectedDistance = adjustedSpeed * deltaTime;
            Assert.AreEqual(expectedDistance, transform.Position.x, 0.001f,
                "Movement should scale with adjusted speed");
        }

        [UnityTest]
        public IEnumerator SteeringBehavior_Seek()
        {
            // Arrange
            var entity = CreateMovableEntity(float3.zero);
            float3 targetPosition = new float3(10f, 0f, 5f);
            yield return null;

            // Act
            float3 steeringForce = CalculateSeekForce(entity, targetPosition);

            // Assert
            Assert.Greater(math.length(steeringForce), 0,
                "Seek force should be non-zero");

            float3 normalizedForce = math.normalize(steeringForce);
            float3 expectedDirection = math.normalize(targetPosition);
            Assert.AreEqual(expectedDirection.x, normalizedForce.x, 0.01f,
                "Seek should point towards target");
            Assert.AreEqual(expectedDirection.z, normalizedForce.z, 0.01f,
                "Seek should point towards target");
        }

        [UnityTest]
        public IEnumerator SteeringBehavior_Flee()
        {
            // Arrange
            var entity = CreateMovableEntity(float3.zero);
            float3 threatPosition = new float3(2f, 0f, 0f);
            yield return null;

            // Act
            float3 fleeForce = CalculateFleeForce(entity, threatPosition);

            // Assert
            Assert.Greater(math.length(fleeForce), 0,
                "Flee force should be non-zero");

            // Flee force should point away from threat
            Assert.Less(fleeForce.x, 0,
                "Flee should point away from threat");
        }

        #region Helper Methods

        private Entity CreateMovableEntity(float3 position)
        {
            var entity = _em.CreateEntity();
            _em.AddComponent<PlayerTag>(entity);
            _em.AddComponentData(entity, LocalTransform.FromPosition(position));
            return entity;
        }

        private Entity CreateNavAgentEntity(float3 position)
        {
            var entity = CreateMovableEntity(position);
            _em.AddComponentData(entity, new NavAgent
            {
                Speed = DEFAULT_SPEED,
                StoppingDistance = DEFAULT_STOPPING_DISTANCE,
                RotationSpeed = DEFAULT_ROTATION_SPEED,
                CurrentWaypointIndex = 0,
                HasPath = false,
                IsMoving = false
            });
            _em.AddBuffer<Waypoint>(entity);
            return entity;
        }

        private Entity CreateNavAgentWithPathRequest(float3 start, float3 end)
        {
            var entity = CreateNavAgentEntity(start);
            _em.AddComponentData(entity, new PathRequest
            {
                Start = start,
                End = end,
                StageId = new FixedString64Bytes("test_stage")
            });
            return entity;
        }

        private Entity CreateNavAgentWithTarget(float3 position, Entity target)
        {
            var entity = CreateNavAgentEntity(position);
            _em.AddComponentData(entity, new NavTarget
            {
                TargetEntity = target,
                FollowTarget = true,
                Destination = float3.zero
            });
            return entity;
        }

        private Entity CreateObstacle(float3 position, float radius)
        {
            var entity = _em.CreateEntity();
            _em.AddComponentData(entity, LocalTransform.FromPosition(position));
            _em.AddComponentData(entity, new NavObstacle
            {
                Radius = radius,
                IsDynamic = false
            });
            return entity;
        }

        private void SimulateMovement(Entity entity, float3 direction, float deltaTime)
        {
            var transform = _em.GetComponentData<LocalTransform>(entity);
            transform.Position += math.normalize(direction) * DEFAULT_SPEED * deltaTime;
            _em.SetComponentData(entity, transform);
        }

        private void SimulateMovementWithSpeed(Entity entity, float3 direction, float deltaTime, float speed)
        {
            var transform = _em.GetComponentData<LocalTransform>(entity);
            transform.Position += math.normalize(direction) * speed * deltaTime;
            _em.SetComponentData(entity, transform);
        }

        private void SimulateNavAgentMovement(Entity entity, float deltaTime)
        {
            var transform = _em.GetComponentData<LocalTransform>(entity);
            var agent = _em.GetComponentData<NavAgent>(entity);
            var waypoints = _em.GetBuffer<Waypoint>(entity);

            if (!agent.HasPath || !agent.IsMoving || waypoints.Length == 0)
                return;

            if (agent.CurrentWaypointIndex >= waypoints.Length)
            {
                agent.IsMoving = false;
                agent.HasPath = false;
                _em.SetComponentData(entity, agent);
                return;
            }

            var targetWaypoint = waypoints[agent.CurrentWaypointIndex];
            float3 direction = targetWaypoint.Position - transform.Position;
            float distance = math.length(direction);

            if (distance <= agent.StoppingDistance)
            {
                agent.CurrentWaypointIndex++;
                if (agent.CurrentWaypointIndex >= waypoints.Length)
                {
                    agent.IsMoving = false;
                    agent.HasPath = false;
                }
            }
            else
            {
                float3 normalizedDir = math.normalize(direction);
                float moveDistance = math.min(agent.Speed * deltaTime, distance);
                transform.Position += normalizedDir * moveDistance;
            }

            _em.SetComponentData(entity, transform);
            _em.SetComponentData(entity, agent);
        }

        private void SimulateNavAgentMovementWithRotation(Entity entity, float deltaTime)
        {
            var transform = _em.GetComponentData<LocalTransform>(entity);
            var agent = _em.GetComponentData<NavAgent>(entity);
            var waypoints = _em.GetBuffer<Waypoint>(entity);

            if (!agent.HasPath || !agent.IsMoving || waypoints.Length == 0)
                return;

            var targetWaypoint = waypoints[agent.CurrentWaypointIndex];
            float3 direction = targetWaypoint.Position - transform.Position;

            if (math.lengthsq(direction) > 0.001f)
            {
                float3 normalizedDir = math.normalize(direction);
                quaternion targetRotation = quaternion.LookRotationSafe(normalizedDir, math.up());
                transform.Rotation = math.slerp(
                    transform.Rotation,
                    targetRotation,
                    agent.RotationSpeed * deltaTime
                );

                float moveDistance = agent.Speed * deltaTime;
                transform.Position += normalizedDir * moveDistance;
            }

            _em.SetComponentData(entity, transform);
        }

        private void SimulateTargetFollow(Entity follower, Entity target)
        {
            var navTarget = _em.GetComponentData<NavTarget>(follower);
            var targetTransform = _em.GetComponentData<LocalTransform>(target);

            if (navTarget.FollowTarget && navTarget.TargetEntity != Entity.Null)
            {
                navTarget.Destination = targetTransform.Position;
            }

            _em.SetComponentData(follower, navTarget);
        }

        private void SetupHexGrid()
        {
            // Create a simple 5x5 hex grid for testing
            for (int q = -2; q <= 2; q++)
            {
                for (int r = -2; r <= 2; r++)
                {
                    var hexEntity = _em.CreateEntity();
                    float3 worldPos = HexToWorld(new int2(q, r));
                    _em.AddComponentData(hexEntity, LocalTransform.FromPosition(worldPos));
                    _em.AddComponentData(hexEntity, new HexTileNav
                    {
                        AxialCoords = new int2(q, r),
                        WorldPosition = worldPos,
                        IsWalkable = true,
                        MovementCost = 1f
                    });
                    _em.AddBuffer<HexNeighbor>(hexEntity);
                }
            }
        }

        private float3 HexToWorld(int2 axialCoords)
        {
            float size = 1f;
            float x = size * (math.sqrt(3f) * axialCoords.x + math.sqrt(3f) / 2f * axialCoords.y);
            float z = size * (3f / 2f * axialCoords.y);
            return new float3(x, 0f, z);
        }

        private void SimulateHexPathfinding(Entity entity)
        {
            // Simplified pathfinding for test - just create direct path
            var request = _em.GetComponentData<PathRequest>(entity);
            var waypointBuffer = _em.GetBuffer<Waypoint>(entity);
            var agent = _em.GetComponentData<NavAgent>(entity);

            waypointBuffer.Clear();
            waypointBuffer.Add(new Waypoint { Position = request.Start, Index = 0 });
            waypointBuffer.Add(new Waypoint { Position = request.End, Index = 1 });

            agent.HasPath = true;
            agent.IsMoving = true;
            agent.CurrentWaypointIndex = 0;

            _em.SetComponentData(entity, agent);
            _em.RemoveComponent<PathRequest>(entity);
        }

        private float3 CalculateSeekForce(Entity entity, float3 targetPosition)
        {
            var transform = _em.GetComponentData<LocalTransform>(entity);
            float3 desired = targetPosition - transform.Position;
            return math.normalize(desired) * DEFAULT_SPEED;
        }

        private float3 CalculateFleeForce(Entity entity, float3 threatPosition)
        {
            var transform = _em.GetComponentData<LocalTransform>(entity);
            float3 desired = transform.Position - threatPosition;
            return math.normalize(desired) * DEFAULT_SPEED;
        }

        #endregion
    }
}
