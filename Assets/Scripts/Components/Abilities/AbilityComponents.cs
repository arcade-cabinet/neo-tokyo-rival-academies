using Unity.Entities;
using Unity.Collections;

namespace NeoTokyo.Components.Abilities
{
    /// <summary>
    /// Types of ability effects
    /// </summary>
    public enum AbilityEffectType : byte
    {
        Damage = 0,
        Heal = 1,
        Buff = 2,
        Debuff = 3,
        Utility = 4
    }

    /// <summary>
    /// Core ability data - baked from JSON manifests
    /// </summary>
    public struct AbilityData : IComponentData
    {
        public FixedString64Bytes Id;
        public FixedString64Bytes Name;
        public int Cost;
        public float CooldownDuration;
        public AbilityEffectType EffectType;
        public int EffectValue;
    }

    /// <summary>
    /// Ability slot on an entity (up to 4 abilities)
    /// </summary>
    public struct AbilitySlots : IComponentData
    {
        public Entity Ability0;
        public Entity Ability1;
        public Entity Ability2;
        public Entity Ability3;

        public Entity GetAbility(int slot)
        {
            return slot switch
            {
                0 => Ability0,
                1 => Ability1,
                2 => Ability2,
                3 => Ability3,
                _ => Entity.Null
            };
        }
    }

    /// <summary>
    /// Cooldown state for an ability
    /// </summary>
    public struct AbilityCooldown : IComponentData
    {
        public float RemainingTime;
        public float TotalDuration;

        public bool IsOnCooldown => RemainingTime > 0f;
        public float CooldownPercent => TotalDuration > 0f ? RemainingTime / TotalDuration : 0f;
    }

    /// <summary>
    /// Tag for when an ability is being cast
    /// </summary>
    public struct CastingAbility : IComponentData
    {
        public Entity AbilityEntity;
        public Entity TargetEntity;
        public float CastProgress;
        public float CastDuration;
    }

    /// <summary>
    /// Resource pool (mana, energy, etc.)
    /// </summary>
    public struct ResourcePool : IComponentData
    {
        public int Current;
        public int Maximum;
        public float RegenRate;

        public bool CanAfford(int cost) => Current >= cost;

        public void Spend(int amount)
        {
            Current = math.max(0, Current - amount);
        }

        public void Regenerate(float deltaTime)
        {
            Current = math.min(Maximum, Current + (int)(RegenRate * deltaTime));
        }
    }

    /// <summary>
    /// Request to execute an ability (command pattern)
    /// </summary>
    public struct AbilityExecuteRequest : IComponentData
    {
        public Entity Caster;
        public Entity Target;
        public Entity Ability;
    }

    /// <summary>
    /// Result of ability execution for visualization
    /// </summary>
    public struct AbilityExecuteResult : IComponentData
    {
        public bool Success;
        public AbilityEffectType EffectType;
        public int EffectValue;
        public Entity Target;
        public FixedString64Bytes FailureReason;
    }
}
