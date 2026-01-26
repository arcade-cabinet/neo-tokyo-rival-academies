using Unity.Burst;
using Unity.Collections;
using Unity.Entities;
using Unity.Mathematics;
using Unity.Transforms;

namespace NeoTokyo.Systems.World
{
    /// <summary>
    /// Hex coordinate component using axial coordinates.
    /// Equivalent to TypeScript: HexGridSystem.ts
    /// </summary>
    public struct HexCoordinate : IComponentData
    {
        public int Q;  // Axial q
        public int R;  // Axial r

        // Cube coordinate S (derived)
        public int S => -Q - R;

        public static HexCoordinate Zero => new HexCoordinate { Q = 0, R = 0 };

        /// <summary>
        /// Convert to world position (flat-top hexes).
        /// </summary>
        public float3 ToWorldPosition(float hexSize = 1f)
        {
            float x = hexSize * (math.sqrt(3f) * Q + math.sqrt(3f) / 2f * R);
            float z = hexSize * (3f / 2f * R);
            return new float3(x, 0f, z);
        }

        /// <summary>
        /// Distance between two hex coordinates.
        /// </summary>
        public int DistanceTo(HexCoordinate other)
        {
            return (math.abs(Q - other.Q) + math.abs(Q + R - other.Q - other.R) + math.abs(R - other.R)) / 2;
        }

        /// <summary>
        /// Get all neighbors of this hex.
        /// </summary>
        public static readonly int2[] Directions = new int2[]
        {
            new int2(1, 0),   // East
            new int2(1, -1),  // Northeast
            new int2(0, -1),  // Northwest
            new int2(-1, 0),  // West
            new int2(-1, 1),  // Southwest
            new int2(0, 1),   // Southeast
        };

        public HexCoordinate GetNeighbor(int direction)
        {
            var dir = Directions[direction % 6];
            return new HexCoordinate { Q = Q + dir.x, R = R + dir.y };
        }
    }

    /// <summary>
    /// Tile type for hex cells.
    /// Matches TypeScript tile types from the flooded world design.
    /// </summary>
    public enum TileType : byte
    {
        Water = 0,      // Deep water (impassable without boat)
        Shallow = 1,    // Shallow water (slow movement)
        Platform = 2,   // Rooftop platform (normal movement)
        Bridge = 3,     // Connecting bridge
        Dock = 4,       // Boat docking area
        Debris = 5,     // Floating debris (unstable)
    }

    /// <summary>
    /// Component for hex tile entities.
    /// </summary>
    public struct HexTile : IComponentData
    {
        public HexCoordinate Coordinate;
        public TileType Type;
        public float Elevation;  // Height above water level
        public bool IsPassable;
        public float MovementCost;  // 1.0 = normal, 2.0 = slow
    }

    /// <summary>
    /// System that synchronizes hex coordinates with world transforms.
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(TransformSystemGroup))]
    public partial struct HexToWorldPositionSystem : ISystem
    {
        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            const float HexSize = 1f;

            foreach (var (hex, transform) in
                SystemAPI.Query<RefRO<HexCoordinate>, RefRW<LocalTransform>>())
            {
                float3 worldPos = hex.ValueRO.ToWorldPosition(HexSize);
                transform.ValueRW.Position = worldPos;
            }
        }
    }

    /// <summary>
    /// Snaps entity positions to nearest hex center.
    /// Used for grid-based movement.
    /// </summary>
    [BurstCompile]
    public partial struct SnapToHexSystem : ISystem
    {
        /// <summary>
        /// Convert world position to nearest hex coordinate.
        /// </summary>
        public static HexCoordinate WorldToHex(float3 worldPos, float hexSize = 1f)
        {
            float q = (math.sqrt(3f) / 3f * worldPos.x - 1f / 3f * worldPos.z) / hexSize;
            float r = (2f / 3f * worldPos.z) / hexSize;

            // Round to nearest hex (cube coordinate rounding)
            float s = -q - r;

            int rq = (int)math.round(q);
            int rr = (int)math.round(r);
            int rs = (int)math.round(s);

            float qDiff = math.abs(rq - q);
            float rDiff = math.abs(rr - r);
            float sDiff = math.abs(rs - s);

            if (qDiff > rDiff && qDiff > sDiff)
                rq = -rr - rs;
            else if (rDiff > sDiff)
                rr = -rq - rs;

            return new HexCoordinate { Q = rq, R = rr };
        }
    }

    /// <summary>
    /// Component for entities that should snap to hex grid.
    /// </summary>
    public struct SnapToGrid : IComponentData
    {
        public bool Enabled;
        public float SnapSpeed;  // Lerp speed for smooth snapping
    }
}
