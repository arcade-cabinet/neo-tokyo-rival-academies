using Unity.Entities;
using Unity.Mathematics;
using Unity.Collections;
using UnityEngine;
using NeoTokyo.Systems.AI;

namespace NeoTokyo.Authoring
{
    /// <summary>
    /// Authoring component for crowd member entities.
    /// Converts to: CrowdMember, CrowdBehaviorState
    /// </summary>
    public class CrowdMemberAuthoring : MonoBehaviour
    {
        [Header("Crowd Identity")]
        [Tooltip("Group identifier for coordinated behavior")]
        public string groupId = "crowd_default";

        [Header("Behavior Settings")]
        [Tooltip("Radius within which crowd member can wander")]
        public float wanderRadius = 5f;

        [Tooltip("Probability of entering idle state (0-1)")]
        [Range(0f, 1f)]
        public float idleChance = 0.3f;

        [Tooltip("Initial behavior state")]
        public CrowdBehavior initialBehavior = CrowdBehavior.Idle;

        [Tooltip("Initial state duration in seconds")]
        public float initialStateDuration = 2f;

        [Header("Visual Variation")]
        [Tooltip("Index for visual variation (skin, outfit, etc.)")]
        public int visualVariantIndex = 0;

        [Tooltip("Animation speed multiplier for variation")]
        [Range(0.8f, 1.2f)]
        public float animationSpeedMultiplier = 1f;

        [Header("Reaction Settings")]
        [Tooltip("How quickly this crowd member reacts to triggers")]
        [Range(0f, 2f)]
        public float reactionDelay = 0f;

        [Tooltip("Distance multiplier for flee behavior")]
        [Range(0.5f, 2f)]
        public float fleeDistanceMultiplier = 1f;

        class Baker : Baker<CrowdMemberAuthoring>
        {
            public override void Bake(CrowdMemberAuthoring authoring)
            {
                var entity = GetEntity(TransformUsageFlags.Dynamic);
                var position = authoring.transform.position;

                // Core crowd member data
                AddComponent(entity, new CrowdMember
                {
                    GroupId = new FixedString64Bytes(authoring.groupId),
                    WanderRadius = authoring.wanderRadius,
                    IdleChance = authoring.idleChance,
                    HomePosition = new float3(position.x, position.y, position.z)
                });

                // Behavior state machine
                AddComponent(entity, new CrowdBehaviorState
                {
                    CurrentBehavior = authoring.initialBehavior,
                    StateTimer = authoring.initialStateDuration,
                    TargetPosition = new float3(position.x, position.y, position.z)
                });

                // Extended data for visual variation and reactions
                AddComponent(entity, new CrowdMemberExtendedData
                {
                    VisualVariantIndex = authoring.visualVariantIndex,
                    AnimationSpeedMultiplier = authoring.animationSpeedMultiplier,
                    ReactionDelay = authoring.reactionDelay,
                    FleeDistanceMultiplier = authoring.fleeDistanceMultiplier
                });
            }
        }
    }

    /// <summary>
    /// Extended crowd member data for visual variation and reaction tuning.
    /// </summary>
    public struct CrowdMemberExtendedData : IComponentData
    {
        public int VisualVariantIndex;
        public float AnimationSpeedMultiplier;
        public float ReactionDelay;
        public float FleeDistanceMultiplier;
    }
}
