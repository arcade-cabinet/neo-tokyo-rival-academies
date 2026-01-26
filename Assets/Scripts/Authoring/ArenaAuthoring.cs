using Unity.Entities;
using Unity.Mathematics;
using UnityEngine;
using NeoTokyo.Components.Combat;

namespace NeoTokyo.Authoring
{
    /// <summary>
    /// Authoring component for combat arenas.
    /// Converts to: ArenaData, RockingPlatform (if applicable), ArenaHazard buffer.
    /// </summary>
    public class ArenaAuthoring : MonoBehaviour
    {
        [Header("Arena Configuration")]
        [Tooltip("Type of arena determining base mechanics")]
        public ArenaType arenaType = ArenaType.Rooftop;

        [Tooltip("Size of the arena (width, height, depth)")]
        public Vector3 size = new Vector3(15f, 4f, 15f);

        [Header("Hazard Settings")]
        [Tooltip("Whether entities can fall off the arena edges")]
        public bool hasFallHazard = true;

        [Tooltip("Whether the arena has water-based hazards")]
        public bool hasWaterHazard = false;

        [Tooltip("Water depth in the arena (0 for dry arenas)")]
        [Range(0f, 10f)]
        public float waterDepth = 0f;

        [Header("Rocking Settings (Boats)")]
        [Tooltip("Whether the platform rocks (boats)")]
        public bool isRocking = false;

        [Tooltip("Intensity of rocking motion (0-1 range)")]
        [Range(0f, 1f)]
        public float rockingIntensity = 0.5f;

        [Tooltip("Speed of rocking oscillation")]
        [Range(0.5f, 3f)]
        public float rockingSpeed = 1.5f;

        [Tooltip("Maximum rock angle in degrees")]
        [Range(1f, 20f)]
        public float maxRockAngle = 8f;

        [Header("Hazard Definitions")]
        [Tooltip("Custom hazards to spawn in the arena")]
        public HazardDefinition[] hazards;

        [Header("Boundary Warning")]
        [Tooltip("Distance from edge to start warning")]
        [Range(1f, 5f)]
        public float boundaryWarningDistance = 2f;

        [Header("Fall Zones")]
        [Tooltip("Rectangular fall zones (edges of arena)")]
        public FallZoneDefinition[] fallZones;

        [Header("Debug")]
        [Tooltip("Draw arena bounds in scene view")]
        public bool drawGizmos = true;

        [Tooltip("Gizmo color for arena bounds")]
        public Color gizmoBoundsColor = new Color(0f, 1f, 0f, 0.3f);

        [Tooltip("Gizmo color for hazard zones")]
        public Color gizmoHazardColor = new Color(1f, 0f, 0f, 0.3f);

        class Baker : Baker<ArenaAuthoring>
        {
            public override void Bake(ArenaAuthoring authoring)
            {
                var entity = GetEntity(TransformUsageFlags.Dynamic);
                var position = authoring.transform.position;

                // Arena data component
                AddComponent(entity, new ArenaData
                {
                    Type = authoring.arenaType,
                    Center = new float3(position.x, position.y, position.z),
                    Size = new float3(authoring.size.x, authoring.size.y, authoring.size.z),
                    HasFallHazard = authoring.hasFallHazard,
                    HasWaterHazard = authoring.hasWaterHazard,
                    IsRocking = authoring.isRocking,
                    RockingIntensity = authoring.rockingIntensity,
                    WaterDepth = authoring.waterDepth,
                    ActiveTime = 0f
                });

                // Rocking platform component (for boats)
                if (authoring.isRocking)
                {
                    AddComponent(entity, new RockingPlatform
                    {
                        RockAngle = 0f,
                        RockSpeed = authoring.rockingSpeed * authoring.rockingIntensity,
                        MaxRockAngle = math.radians(authoring.maxRockAngle * authoring.rockingIntensity),
                        RockAxis = new float3(1f, 0f, 0f),
                        PhaseOffset = 0f,
                        AffectsMovement = true,
                        AffectsAim = true
                    });
                }

                // Hazard buffer
                var hazardBuffer = AddBuffer<ArenaHazard>(entity);

                // Add custom hazards
                if (authoring.hazards != null)
                {
                    foreach (var hazardDef in authoring.hazards)
                    {
                        if (!hazardDef.enabled) continue;

                        float3 hazardWorldPos = new float3(position.x, position.y, position.z) +
                            new float3(hazardDef.localPosition.x, hazardDef.localPosition.y, hazardDef.localPosition.z);

                        hazardBuffer.Add(new ArenaHazard
                        {
                            Type = hazardDef.type,
                            Position = hazardWorldPos,
                            Radius = hazardDef.radius,
                            Damage = hazardDef.damage,
                            TickInterval = hazardDef.tickInterval,
                            Duration = hazardDef.duration,
                            RemainingDuration = hazardDef.duration,
                            IsActive = true,
                            StabilityDamage = hazardDef.stabilityDamage,
                            KnockbackForce = new float3(hazardDef.knockbackForce.x, hazardDef.knockbackForce.y, hazardDef.knockbackForce.z)
                        });
                    }
                }

                // Add default edge fall hazards if enabled and no custom fall hazards defined
                if (authoring.hasFallHazard && (authoring.hazards == null || !HasFallHazard(authoring.hazards)))
                {
                    float3 halfSize = new float3(authoring.size.x, authoring.size.y, authoring.size.z) * 0.5f;
                    float3 center = new float3(position.x, position.y, position.z);

                    // Add fall hazards at each edge
                    hazardBuffer.Add(ArenaHazard.CreateFallHazard(
                        center + new float3(halfSize.x + 1f, -halfSize.y - 1f, 0f),
                        authoring.size.z * 0.5f,
                        25f
                    ));

                    hazardBuffer.Add(ArenaHazard.CreateFallHazard(
                        center + new float3(-halfSize.x - 1f, -halfSize.y - 1f, 0f),
                        authoring.size.z * 0.5f,
                        25f
                    ));

                    hazardBuffer.Add(ArenaHazard.CreateFallHazard(
                        center + new float3(0f, -halfSize.y - 1f, halfSize.z + 1f),
                        authoring.size.x * 0.5f,
                        25f
                    ));

                    hazardBuffer.Add(ArenaHazard.CreateFallHazard(
                        center + new float3(0f, -halfSize.y - 1f, -halfSize.z - 1f),
                        authoring.size.x * 0.5f,
                        25f
                    ));
                }

                // Add water hazard if enabled
                if (authoring.hasWaterHazard && authoring.waterDepth > 0f)
                {
                    float3 center = new float3(position.x, position.y, position.z);

                    hazardBuffer.Add(ArenaHazard.CreateWaterHazard(
                        center + new float3(0f, -authoring.waterDepth * 0.5f, 0f),
                        math.max(authoring.size.x, authoring.size.z) * 0.5f,
                        authoring.waterDepth > 1.2f ? 8f : 5f,
                        authoring.waterDepth > 1.2f ? 1.5f : 2f
                    ));
                }
            }

            private static bool HasFallHazard(HazardDefinition[] hazards)
            {
                foreach (var hazard in hazards)
                {
                    if (hazard.enabled && hazard.type == HazardType.Fall)
                        return true;
                }
                return false;
            }
        }

#if UNITY_EDITOR
        private void OnDrawGizmos()
        {
            if (!drawGizmos) return;

            // Draw arena bounds
            Gizmos.color = gizmoBoundsColor;
            Gizmos.DrawWireCube(transform.position, size);
            Gizmos.DrawCube(transform.position, size);

            // Draw hazard zones
            if (hazards != null)
            {
                Gizmos.color = gizmoHazardColor;
                foreach (var hazard in hazards)
                {
                    if (!hazard.enabled) continue;

                    Vector3 hazardPos = transform.position + hazard.localPosition;
                    Gizmos.DrawWireSphere(hazardPos, hazard.radius);

                    // Draw filled sphere with transparency
                    Color filledColor = gizmoHazardColor;
                    filledColor.a *= 0.3f;
                    Gizmos.color = filledColor;
                    Gizmos.DrawSphere(hazardPos, hazard.radius);
                    Gizmos.color = gizmoHazardColor;
                }
            }

            // Draw fall zones
            if (fallZones != null)
            {
                Gizmos.color = new Color(1f, 0.5f, 0f, 0.3f);
                foreach (var zone in fallZones)
                {
                    if (!zone.enabled) continue;

                    Vector3 zoneCenter = transform.position + (zone.min + zone.max) * 0.5f;
                    Vector3 zoneSize = zone.max - zone.min;
                    Gizmos.DrawWireCube(zoneCenter, zoneSize);
                    Gizmos.DrawCube(zoneCenter, zoneSize);
                }
            }

            // Draw water level if applicable
            if (hasWaterHazard && waterDepth > 0f)
            {
                Gizmos.color = new Color(0f, 0.5f, 1f, 0.3f);
                Vector3 waterCenter = transform.position + Vector3.down * (size.y * 0.5f - waterDepth * 0.5f);
                Vector3 waterSize = new Vector3(size.x, waterDepth, size.z);
                Gizmos.DrawCube(waterCenter, waterSize);
            }
        }
#endif
    }

    /// <summary>
    /// Hazard definition for authoring component.
    /// </summary>
    [System.Serializable]
    public class HazardDefinition
    {
        [Tooltip("Whether this hazard is enabled")]
        public bool enabled = true;

        [Tooltip("Type of hazard")]
        public HazardType type = HazardType.Fire;

        [Tooltip("Position relative to arena center")]
        public Vector3 localPosition = Vector3.zero;

        [Tooltip("Radius of hazard effect")]
        public float radius = 2f;

        [Tooltip("Damage per tick")]
        public float damage = 10f;

        [Tooltip("Time between damage ticks (0 for instant)")]
        public float tickInterval = 0.5f;

        [Tooltip("Duration before hazard expires (0 for permanent)")]
        public float duration = 0f;

        [Tooltip("Stability damage per tick")]
        public float stabilityDamage = 0f;

        [Tooltip("Knockback force direction and magnitude")]
        public Vector3 knockbackForce = Vector3.zero;
    }

    /// <summary>
    /// Rectangular fall zone definition.
    /// </summary>
    [System.Serializable]
    public class FallZoneDefinition
    {
        [Tooltip("Whether this fall zone is enabled")]
        public bool enabled = true;

        [Tooltip("Minimum corner relative to arena center")]
        public Vector3 min = new Vector3(-5f, -5f, -5f);

        [Tooltip("Maximum corner relative to arena center")]
        public Vector3 max = new Vector3(5f, -2f, 5f);

        [Tooltip("Damage dealt when falling")]
        public float fallDamage = 20f;

        [Tooltip("Whether falling is instant death")]
        public bool isInstantKill = false;

        [Tooltip("Respawn position relative to arena center")]
        public Vector3 respawnPosition = Vector3.up * 2f;
    }
}
