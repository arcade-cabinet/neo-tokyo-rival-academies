using Unity.Entities;
using Unity.Mathematics;
using Unity.Collections;
using UnityEngine;
using NeoTokyo.Components.Dialogue;
using NeoTokyo.Components.Faction;
using NeoTokyo.Components.Navigation;

namespace NeoTokyo.Authoring
{
    /// <summary>
    /// Authoring component for NPC entities.
    /// Converts to: DialogueSpeaker, FactionMembership, NavAgent
    /// </summary>
    public class NPCAuthoring : MonoBehaviour
    {
        [Header("Identity")]
        [Tooltip("Unique identifier for this NPC")]
        public string speakerId = "npc_001";

        [Tooltip("Display name shown in dialogue")]
        public string displayName = "Unnamed NPC";

        [Tooltip("Whether player can interact with this NPC")]
        public bool isInteractable = true;

        [Header("Faction")]
        [Tooltip("Which faction this NPC belongs to")]
        public FactionType faction = FactionType.Neutral;

        [Header("Navigation")]
        [Tooltip("Movement speed")]
        public float moveSpeed = 3f;

        [Tooltip("Distance at which NPC stops moving toward target")]
        public float stoppingDistance = 0.5f;

        [Tooltip("Rotation speed in degrees per second")]
        public float rotationSpeed = 360f;

        [Header("Patrol Behavior")]
        [Tooltip("Enable patrol behavior")]
        public bool enablePatrol = false;

        [Tooltip("Patrol waypoints (optional)")]
        public Transform[] patrolWaypoints;

        class Baker : Baker<NPCAuthoring>
        {
            public override void Bake(NPCAuthoring authoring)
            {
                var entity = GetEntity(TransformUsageFlags.Dynamic);

                // Dialogue speaker component
                AddComponent(entity, new DialogueSpeaker
                {
                    SpeakerId = new FixedString64Bytes(authoring.speakerId),
                    DisplayName = new FixedString64Bytes(authoring.displayName),
                    IsInteractable = authoring.isInteractable
                });

                // Faction membership
                AddComponent(entity, new FactionMembership
                {
                    Value = authoring.faction
                });

                // Navigation agent
                AddComponent(entity, new NavAgent
                {
                    Speed = authoring.moveSpeed,
                    StoppingDistance = authoring.stoppingDistance,
                    RotationSpeed = authoring.rotationSpeed,
                    CurrentWaypointIndex = 0,
                    HasPath = false,
                    IsMoving = false
                });

                // Add waypoint buffer for navigation paths
                var waypointBuffer = AddBuffer<Waypoint>(entity);

                // If patrol waypoints are defined, bake them
                if (authoring.enablePatrol && authoring.patrolWaypoints != null)
                {
                    for (int i = 0; i < authoring.patrolWaypoints.Length; i++)
                    {
                        if (authoring.patrolWaypoints[i] != null)
                        {
                            var pos = authoring.patrolWaypoints[i].position;
                            waypointBuffer.Add(new Waypoint
                            {
                                Position = new float3(pos.x, pos.y, pos.z),
                                Index = i
                            });
                        }
                    }
                }

                // Add dialogue choice buffer for dialogue interactions
                AddBuffer<DialogueChoice>(entity);
            }
        }
    }
}
