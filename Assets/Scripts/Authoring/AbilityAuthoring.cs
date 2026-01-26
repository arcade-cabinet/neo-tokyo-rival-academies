using Unity.Entities;
using Unity.Collections;
using UnityEngine;
using NeoTokyo.Components.Abilities;

namespace NeoTokyo.Authoring
{
    /// <summary>
    /// Authoring component for ability entities.
    /// Converts to: AbilityData, AbilityCooldown
    /// </summary>
    public class AbilityAuthoring : MonoBehaviour
    {
        [Header("Ability Identity")]
        [Tooltip("Unique identifier for this ability")]
        public string abilityId = "ability_001";

        [Tooltip("Display name shown in UI")]
        public string abilityName = "Unnamed Ability";

        [Header("Cost & Cooldown")]
        [Tooltip("Resource cost to use this ability")]
        public int cost = 10;

        [Tooltip("Cooldown duration in seconds")]
        public float cooldownDuration = 5f;

        [Header("Effect")]
        [Tooltip("Type of effect this ability produces")]
        public AbilityEffectType effectType = AbilityEffectType.Damage;

        [Tooltip("Base value of the effect (damage, heal amount, etc.)")]
        public int effectValue = 25;

        [Header("Targeting")]
        [Tooltip("Range of the ability (0 = self-target)")]
        public float range = 5f;

        [Tooltip("Area of effect radius (0 = single target)")]
        public float aoeRadius = 0f;

        [Header("Cast Time")]
        [Tooltip("Time required to cast (0 = instant)")]
        public float castTime = 0f;

        [Tooltip("Whether ability can be interrupted during cast")]
        public bool canBeInterrupted = true;

        [Header("Stat Scaling")]
        [Tooltip("Which stat this ability scales with")]
        public AbilityScalingStat scalingStat = AbilityScalingStat.Ignition;

        [Tooltip("Scaling multiplier (0.5 = 50% of stat added to base)")]
        [Range(0f, 2f)]
        public float scalingMultiplier = 0.5f;

        class Baker : Baker<AbilityAuthoring>
        {
            public override void Bake(AbilityAuthoring authoring)
            {
                // Abilities use WorldSpace since they're data-only entities
                var entity = GetEntity(TransformUsageFlags.None);

                // Core ability data
                AddComponent(entity, new AbilityData
                {
                    Id = new FixedString64Bytes(authoring.abilityId),
                    Name = new FixedString64Bytes(authoring.abilityName),
                    Cost = authoring.cost,
                    CooldownDuration = authoring.cooldownDuration,
                    EffectType = authoring.effectType,
                    EffectValue = authoring.effectValue
                });

                // Cooldown state (starts ready to use)
                AddComponent(entity, new AbilityCooldown
                {
                    RemainingTime = 0f,
                    TotalDuration = authoring.cooldownDuration
                });

                // Extended ability data for targeting and scaling
                AddComponent(entity, new AbilityExtendedData
                {
                    Range = authoring.range,
                    AoERadius = authoring.aoeRadius,
                    CastTime = authoring.castTime,
                    CanBeInterrupted = authoring.canBeInterrupted,
                    ScalingStat = authoring.scalingStat,
                    ScalingMultiplier = authoring.scalingMultiplier
                });
            }
        }
    }

    /// <summary>
    /// Which stat an ability scales with.
    /// </summary>
    public enum AbilityScalingStat : byte
    {
        None = 0,
        Structure = 1,  // Defensive abilities
        Ignition = 2,   // Attack abilities
        Logic = 3,      // Utility/buff abilities
        Flow = 4        // Speed/evasion abilities
    }

    /// <summary>
    /// Extended ability data for targeting and scaling.
    /// Separated to keep AbilityData lightweight.
    /// </summary>
    public struct AbilityExtendedData : IComponentData
    {
        public float Range;
        public float AoERadius;
        public float CastTime;
        public bool CanBeInterrupted;
        public AbilityScalingStat ScalingStat;
        public float ScalingMultiplier;
    }
}
