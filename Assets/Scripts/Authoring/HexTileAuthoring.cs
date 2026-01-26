using Unity.Entities;
using Unity.Mathematics;
using UnityEngine;
using NeoTokyo.Components.Navigation;

namespace NeoTokyo.Authoring
{
    /// <summary>
    /// Authoring component for hex tile navigation mesh nodes.
    /// Converts to: HexTileNav, HexNeighbor buffer
    /// </summary>
    public class HexTileAuthoring : MonoBehaviour
    {
        [Header("Hex Coordinates")]
        [Tooltip("Axial Q coordinate (column)")]
        public int axialQ = 0;

        [Tooltip("Axial R coordinate (row)")]
        public int axialR = 0;

        [Header("Navigation Properties")]
        [Tooltip("Whether this tile can be traversed")]
        public bool isWalkable = true;

        [Tooltip("Movement cost multiplier (1.0 = normal, 2.0 = difficult terrain)")]
        [Range(0.5f, 5f)]
        public float movementCost = 1f;

        [Header("Tile Type")]
        [Tooltip("Visual/gameplay type of this tile")]
        public HexTileType tileType = HexTileType.Normal;

        [Header("Neighbors (Auto-linked at runtime)")]
        [Tooltip("Reference to neighboring hex tiles for manual linking")]
        public HexTileAuthoring[] manualNeighbors;

        [Tooltip("Edge costs for manual neighbors (matches array index)")]
        public float[] manualNeighborEdgeCosts;

        class Baker : Baker<HexTileAuthoring>
        {
            public override void Bake(HexTileAuthoring authoring)
            {
                var entity = GetEntity(TransformUsageFlags.Renderable);
                var position = authoring.transform.position;

                // Hex tile navigation data
                AddComponent(entity, new HexTileNav
                {
                    AxialCoords = new int2(authoring.axialQ, authoring.axialR),
                    WorldPosition = new float3(position.x, position.y, position.z),
                    IsWalkable = authoring.isWalkable,
                    MovementCost = authoring.movementCost
                });

                // Add neighbor buffer
                var neighborBuffer = AddBuffer<HexNeighbor>(entity);

                // Bake manual neighbor references if provided
                if (authoring.manualNeighbors != null)
                {
                    for (int i = 0; i < authoring.manualNeighbors.Length; i++)
                    {
                        if (authoring.manualNeighbors[i] != null)
                        {
                            float edgeCost = 1f;
                            if (authoring.manualNeighborEdgeCosts != null &&
                                i < authoring.manualNeighborEdgeCosts.Length)
                            {
                                edgeCost = authoring.manualNeighborEdgeCosts[i];
                            }

                            neighborBuffer.Add(new HexNeighbor
                            {
                                NeighborEntity = GetEntity(authoring.manualNeighbors[i], TransformUsageFlags.Renderable),
                                EdgeCost = edgeCost
                            });
                        }
                    }
                }

                // Add obstacle component if not walkable
                if (!authoring.isWalkable)
                {
                    AddComponent(entity, new NavObstacle
                    {
                        Radius = 0.5f, // Half hex size
                        IsDynamic = false
                    });
                }
            }
        }
    }

    /// <summary>
    /// Types of hex tiles for visual and gameplay purposes.
    /// </summary>
    public enum HexTileType : byte
    {
        Normal = 0,
        Water = 1,       // Flooded areas (Neo-Tokyo flooded world)
        Bridge = 2,      // Walkable over water
        Building = 3,    // Solid structure, not walkable
        Debris = 4,      // Difficult terrain
        Portal = 5,      // Stage transition
        Hazard = 6       // Damaging terrain
    }
}
