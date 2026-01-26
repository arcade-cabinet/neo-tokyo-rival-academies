using Unity.Entities;
using Unity.Mathematics;

namespace NeoTokyo.Components.Combat
{
    /// <summary>
    /// Attack type enumeration for damage calculation.
    /// Equivalent to TypeScript: AttackType in CombatLogic.ts
    /// </summary>
    public enum AttackType : byte
    {
        Melee = 0,      // Uses Ignition stat
        Ranged = 1,     // Uses Logic stat
        Tech = 2        // Uses Logic stat
    }

    /// <summary>
    /// Combat damage request - triggers damage calculation.
    /// </summary>
    public struct DamageRequest : IBufferElementData
    {
        public Entity Attacker;
        public Entity Defender;
        public AttackType Type;
        public uint RandomSeed;  // For critical hit calculation
    }

    /// <summary>
    /// Result of combat damage calculation.
    /// </summary>
    public struct CombatResult : IBufferElementData
    {
        public Entity Attacker;
        public Entity Defender;
        public int Damage;
        public bool IsCritical;
        public AttackType Type;
    }

    /// <summary>
    /// Combat stats derived from RPG stats for quick access.
    /// Calculated from base stats to avoid repeated computation.
    /// </summary>
    public struct CombatStats : IComponentData
    {
        public float MeleeAttackPower;      // Based on Ignition
        public float RangedAttackPower;     // Based on Logic
        public float TechAttackPower;       // Based on Logic
        public float Defense;               // Based on Structure
        public float CriticalChance;        // Based on Ignition (max 50%)
        public float CriticalMultiplier;    // Default 1.5x

        /// <summary>
        /// Calculate combat stats from RPG stats.
        /// Equivalent to TypeScript: getAttackPower, getDefense functions
        /// </summary>
        public static CombatStats FromRPGStats(int structure, int ignition, int logic)
        {
            const float BASE_ATTACK = 10f;

            return new CombatStats
            {
                MeleeAttackPower = BASE_ATTACK + ignition * 0.5f,
                RangedAttackPower = BASE_ATTACK + logic * 0.5f,
                TechAttackPower = BASE_ATTACK + logic * 0.5f,
                Defense = structure / 10f,
                CriticalChance = math.min(ignition * 0.01f, 0.5f),
                CriticalMultiplier = 1.5f
            };
        }

        public static CombatStats Default => FromRPGStats(10, 10, 10);
    }

    /// <summary>
    /// Flag component for entities that can participate in combat.
    /// </summary>
    public struct CombatantTag : IComponentData { }
}
