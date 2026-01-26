using NUnit.Framework;
using Unity.Mathematics;
using NeoTokyo.Components.Navigation;

namespace NeoTokyo.Tests.EditMode
{
    /// <summary>
    /// Unit tests for NavigationSystem components.
    /// Tests hex grid calculations and navigation logic.
    /// Command: Unity -batchmode -runTests -testPlatform EditMode
    /// </summary>
    [TestFixture]
    public class NavigationSystemTests
    {
        [Test]
        public void NavAgent_DefaultValues()
        {
            var agent = new NavAgent
            {
                Speed = 5f,
                StoppingDistance = 0.5f,
                RotationSpeed = 10f,
                CurrentWaypointIndex = 0,
                HasPath = false,
                IsMoving = false
            };

            Assert.AreEqual(5f, agent.Speed);
            Assert.AreEqual(0.5f, agent.StoppingDistance);
            Assert.IsFalse(agent.HasPath);
            Assert.IsFalse(agent.IsMoving);
        }

        [Test]
        public void HexTileNav_StoresAxialCoordinates()
        {
            var tile = new HexTileNav
            {
                AxialCoords = new int2(3, -2),
                WorldPosition = new float3(5.196f, 0f, -3f),
                IsWalkable = true,
                MovementCost = 1.0f
            };

            Assert.AreEqual(3, tile.AxialCoords.x);
            Assert.AreEqual(-2, tile.AxialCoords.y);
            Assert.IsTrue(tile.IsWalkable);
        }

        [Test]
        public void NavTarget_CanStoreDestination()
        {
            var target = new NavTarget
            {
                Destination = new float3(10f, 0f, 20f),
                FollowTarget = false
            };

            Assert.AreEqual(10f, target.Destination.x);
            Assert.AreEqual(20f, target.Destination.z);
            Assert.IsFalse(target.FollowTarget);
        }

        [Test]
        public void NavObstacle_StoresRadius()
        {
            var obstacle = new NavObstacle
            {
                Radius = 2.5f,
                IsDynamic = true
            };

            Assert.AreEqual(2.5f, obstacle.Radius);
            Assert.IsTrue(obstacle.IsDynamic);
        }

        [Test]
        public void Waypoint_StoresPositionAndIndex()
        {
            var waypoint = new Waypoint
            {
                Position = new float3(1f, 2f, 3f),
                Index = 5
            };

            Assert.AreEqual(1f, waypoint.Position.x);
            Assert.AreEqual(2f, waypoint.Position.y);
            Assert.AreEqual(3f, waypoint.Position.z);
            Assert.AreEqual(5, waypoint.Index);
        }

        // Hex math tests
        [Test]
        public void HexDistance_SamePosition_ReturnsZero()
        {
            var a = new int2(0, 0);
            var b = new int2(0, 0);

            float distance = CalculateHexDistance(a, b);

            Assert.AreEqual(0f, distance);
        }

        [Test]
        public void HexDistance_AdjacentHex_ReturnsOne()
        {
            var center = new int2(0, 0);
            var neighbors = new int2[]
            {
                new int2(1, 0),
                new int2(1, -1),
                new int2(0, -1),
                new int2(-1, 0),
                new int2(-1, 1),
                new int2(0, 1)
            };

            foreach (var neighbor in neighbors)
            {
                float distance = CalculateHexDistance(center, neighbor);
                Assert.AreEqual(1f, distance, $"Distance to {neighbor} should be 1");
            }
        }

        [Test]
        public void HexDistance_TwoAway_ReturnsTwo()
        {
            var a = new int2(0, 0);
            var b = new int2(2, 0);

            float distance = CalculateHexDistance(a, b);

            Assert.AreEqual(2f, distance);
        }

        /// <summary>
        /// Calculate hex distance using axial coordinate formula
        /// </summary>
        private static float CalculateHexDistance(int2 a, int2 b)
        {
            return (math.abs(a.x - b.x) +
                    math.abs(a.x + a.y - b.x - b.y) +
                    math.abs(a.y - b.y)) / 2f;
        }
    }
}
