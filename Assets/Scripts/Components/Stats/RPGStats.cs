using Unity.Entities;

namespace NeoTokyo.Components.Stats
{
    /// <summary>
    /// Core RPG stats for characters.
    /// Equivalent to TypeScript: RPGStats in @neo-tokyo/core/types/entity.ts
    ///
    /// Stats based on Golden Record:
    /// - Structure: HP, Defense (survival)
    /// - Ignition: Attack, Crits (passionate fighting)
    /// - Logic: Skills, Specials (tactical use)
    /// - Flow: Speed, Evasion (water movement, agility)
    /// </summary>
    public struct RPGStats : IComponentData
    {
        /// <summary>HP, Defense - determines survival capability</summary>
        public int Structure;

        /// <summary>Attack, Crits - passionate fighting power</summary>
        public int Ignition;

        /// <summary>Skills, Specials - tactical ability usage</summary>
        public int Logic;

        /// <summary>Speed, Evasion - movement and dodge capability</summary>
        public int Flow;

        public static RPGStats Default => new RPGStats
        {
            Structure = 10,
            Ignition = 10,
            Logic = 10,
            Flow = 10
        };

        /// <summary>
        /// Calculate base stats for a given level.
        /// Matches TypeScript: getBaseStatsForLevel() in playerStore.ts
        /// </summary>
        public static RPGStats ForLevel(int level)
        {
            return new RPGStats
            {
                Structure = 10 + (level - 1) * 2,
                Ignition = 10 + (level - 1) * 2,
                Logic = 10 + (level - 1) * 2,
                Flow = 10 + (level - 1) * 2
            };
        }
    }

    /// <summary>
    /// Health component for damageable entities.
    /// Equivalent to TypeScript: health?: number in ECSEntity
    /// </summary>
    public struct Health : IComponentData
    {
        public int Current;
        public int Max;

        public float Ratio => Max > 0 ? (float)Current / Max : 0f;
        public bool IsDead => Current <= 0;
    }

    /// <summary>
    /// Mana/energy component for ability usage.
    /// Equivalent to TypeScript: mana?: number in ECSEntity
    /// </summary>
    public struct Mana : IComponentData
    {
        public int Current;
        public int Max;

        public float Ratio => Max > 0 ? (float)Current / Max : 0f;
    }

    /// <summary>
    /// Level progression component.
    /// Equivalent to TypeScript: LevelProgress in @neo-tokyo/core
    /// </summary>
    public struct LevelProgress : IComponentData
    {
        public int Level;
        public int XP;
        public int XPToNextLevel;

        public static LevelProgress Default => new LevelProgress
        {
            Level = 1,
            XP = 0,
            XPToNextLevel = 100
        };

        /// <summary>
        /// XP required for a given level. Matches TypeScript formula.
        /// </summary>
        public static int GetXPForLevel(int level) => 100 * level;
    }
}
