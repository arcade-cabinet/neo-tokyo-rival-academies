using Unity.Entities;
using Unity.Mathematics;
using Unity.Collections;

namespace NeoTokyo.Components.Navigation
{
    /// <summary>
    /// Waypoint in a navigation path
    /// </summary>
    public struct Waypoint : IBufferElementData
    {
        public float3 Position;
        public int Index;
    }

    /// <summary>
    /// Navigation agent that can pathfind
    /// </summary>
    public struct NavAgent : IComponentData
    {
        public float Speed;
        public float StoppingDistance;
        public float RotationSpeed;
        public int CurrentWaypointIndex;
        public bool HasPath;
        public bool IsMoving;
    }

    /// <summary>
    /// Navigation target destination
    /// </summary>
    public struct NavTarget : IComponentData
    {
        public float3 Destination;
        public Entity TargetEntity;
        public bool FollowTarget;
    }

    /// <summary>
    /// Request to calculate a new path
    /// </summary>
    public struct PathRequest : IComponentData
    {
        public float3 Start;
        public float3 End;
        public FixedString64Bytes StageId;
    }

    /// <summary>
    /// Hex tile data for navigation mesh
    /// </summary>
    public struct HexTileNav : IComponentData
    {
        public int2 AxialCoords;
        public float3 WorldPosition;
        public bool IsWalkable;
        public float MovementCost;
    }

    /// <summary>
    /// Buffer of neighboring hex tiles for pathfinding
    /// </summary>
    public struct HexNeighbor : IBufferElementData
    {
        public Entity NeighborEntity;
        public float EdgeCost;
    }

    /// <summary>
    /// Tag for obstacles that block navigation
    /// </summary>
    public struct NavObstacle : IComponentData
    {
        public float Radius;
        public bool IsDynamic;
    }
}
