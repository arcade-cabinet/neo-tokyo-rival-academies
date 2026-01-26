using Unity.Entities;
using Unity.Collections;

namespace NeoTokyo.Components.Faction
{
    /// <summary>
    /// Faction types in the flooded Neo-Tokyo world.
    /// Matches TypeScript: Faction type in ReputationSystem.ts
    /// </summary>
    public enum FactionType : byte
    {
        Neutral = 0,
        Kurenai = 1,    // Passion academy (red)
        Azure = 2,       // Logic academy (blue)
        Syndicate = 3,   // Criminal organization
        Runners = 4,     // Speedboat racers
        Collective = 5,  // Market traders
        Drowned = 6,     // Mysterious cult
        Council = 7      // Council of Seven (governance)
    }

    /// <summary>
    /// Faction membership component.
    /// Equivalent to TypeScript: faction?: Faction in ECSEntity
    /// </summary>
    public struct FactionMembership : IComponentData
    {
        public FactionType Value;
    }

    /// <summary>
    /// Reputation levels based on numeric value.
    /// Matches TypeScript: ReputationLevel type
    /// </summary>
    public enum ReputationLevel : byte
    {
        Hated = 0,      // 0-10
        Hostile = 1,    // 11-25
        Unfriendly = 2, // 26-40
        Neutral = 3,    // 41-60
        Friendly = 4,   // 61-75
        Honored = 5,    // 76-90
        Revered = 6     // 91-100
    }

    /// <summary>
    /// Reputation state tracking player standing with factions.
    /// Equivalent to TypeScript: ReputationState in ReputationSystem.ts
    ///
    /// Golden Record specifies 0-100 range for reputation meters.
    /// </summary>
    public struct Reputation : IComponentData
    {
        /// <summary>Standing with Kurenai Academy (passion)</summary>
        public int Kurenai;

        /// <summary>Standing with Azure Academy (logic)</summary>
        public int Azure;

        public static Reputation Default => new Reputation
        {
            Kurenai = 50,
            Azure = 50
        };

        /// <summary>
        /// Get reputation level for Kurenai.
        /// Matches TypeScript: getReputationLevel() function
        /// </summary>
        public ReputationLevel GetKurenaiLevel() => GetLevel(Kurenai);

        /// <summary>
        /// Get reputation level for Azure.
        /// </summary>
        public ReputationLevel GetAzureLevel() => GetLevel(Azure);

        private static ReputationLevel GetLevel(int value)
        {
            if (value <= 10) return ReputationLevel.Hated;
            if (value <= 25) return ReputationLevel.Hostile;
            if (value <= 40) return ReputationLevel.Unfriendly;
            if (value <= 60) return ReputationLevel.Neutral;
            if (value <= 75) return ReputationLevel.Friendly;
            if (value <= 90) return ReputationLevel.Honored;
            return ReputationLevel.Revered;
        }

        /// <summary>
        /// Get aggression multiplier for a faction.
        /// Matches TypeScript: getAggressionLevel() function
        /// </summary>
        public float GetAggressionMultiplier(FactionType faction)
        {
            int value = faction == FactionType.Kurenai ? Kurenai : Azure;

            if (value <= 25) return 2.0f;  // Hated/Hostile
            if (value <= 40) return 1.5f;  // Unfriendly
            if (value <= 60) return 1.0f;  // Neutral
            if (value <= 75) return 0.75f; // Friendly
            return 0.5f;                    // Honored/Revered
        }
    }

    /// <summary>
    /// Buffer element for pending reputation changes.
    /// Processed by ReputationSystem each frame.
    /// </summary>
    public struct ReputationChangeElement : IBufferElementData
    {
        public FactionType Faction;
        public int Amount;
        public FixedString64Bytes Reason;
    }

    /// <summary>
    /// Common reputation change amounts.
    /// Matches TypeScript: REPUTATION_CHANGES constant
    /// </summary>
    public static class ReputationChanges
    {
        public const int DEFEAT_ENEMY = -5;
        public const int DEFEAT_BOSS = -15;
        public const int COMPLETE_QUEST = 10;
        public const int HELP_CIVILIAN = 5;
        public const int BETRAY_FACTION = -25;
        public const int SPARE_ENEMY = 3;
        public const int DESTROY_PROPERTY = -10;
    }
}
