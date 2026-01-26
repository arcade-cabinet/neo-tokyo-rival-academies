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
    /// NOTE: This legacy struct tracks only Kurenai/Azure for backward compatibility.
    /// Use ExtendedReputation for full 8-faction tracking.
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

        public static ReputationLevel GetLevel(int value)
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
    /// Extended reputation tracking for all 8 factions in Neo-Tokyo.
    /// Golden Record specifies 0-100 range for reputation meters.
    ///
    /// Faction relationships and spillover effects are defined in FactionRelationships.
    /// </summary>
    public struct ExtendedReputation : IComponentData
    {
        /// <summary>Standing with Kurenai Academy (passion/red)</summary>
        public int Kurenai;

        /// <summary>Standing with Azure Academy (logic/blue)</summary>
        public int Azure;

        /// <summary>Standing with the Syndicate (criminal organization)</summary>
        public int Syndicate;

        /// <summary>Standing with the Runners (speedboat racers)</summary>
        public int Runners;

        /// <summary>Standing with the Collective (market traders)</summary>
        public int Collective;

        /// <summary>Standing with the Drowned (mysterious cult)</summary>
        public int Drowned;

        /// <summary>Standing with the Council of Seven (governance)</summary>
        public int Council;

        /// <summary>Standing with Civilians (neutral population)</summary>
        public int Civilian;

        public static ExtendedReputation Default => new ExtendedReputation
        {
            Kurenai = 50,
            Azure = 50,
            Syndicate = 30,   // Slightly hostile by default
            Runners = 50,
            Collective = 50,
            Drowned = 25,     // Mysterious, starts unfriendly
            Council = 40,     // Bureaucratic, slightly skeptical
            Civilian = 50
        };

        /// <summary>
        /// Get reputation value for a specific faction
        /// </summary>
        public int GetReputation(FactionType faction)
        {
            return faction switch
            {
                FactionType.Kurenai => Kurenai,
                FactionType.Azure => Azure,
                FactionType.Syndicate => Syndicate,
                FactionType.Runners => Runners,
                FactionType.Collective => Collective,
                FactionType.Drowned => Drowned,
                FactionType.Council => Council,
                FactionType.Neutral => Civilian,
                _ => 50
            };
        }

        /// <summary>
        /// Set reputation value for a specific faction (clamped to 0-100)
        /// </summary>
        public void SetReputation(FactionType faction, int value)
        {
            value = Unity.Mathematics.math.clamp(value, 0, 100);

            switch (faction)
            {
                case FactionType.Kurenai: Kurenai = value; break;
                case FactionType.Azure: Azure = value; break;
                case FactionType.Syndicate: Syndicate = value; break;
                case FactionType.Runners: Runners = value; break;
                case FactionType.Collective: Collective = value; break;
                case FactionType.Drowned: Drowned = value; break;
                case FactionType.Council: Council = value; break;
                case FactionType.Neutral: Civilian = value; break;
            }
        }

        /// <summary>
        /// Get reputation level for any faction
        /// </summary>
        public ReputationLevel GetLevel(FactionType faction)
        {
            return Reputation.GetLevel(GetReputation(faction));
        }

        /// <summary>
        /// Get aggression multiplier for any faction
        /// </summary>
        public float GetAggressionMultiplier(FactionType faction)
        {
            int value = GetReputation(faction);

            if (value <= 25) return 2.0f;  // Hated/Hostile
            if (value <= 40) return 1.5f;  // Unfriendly
            if (value <= 60) return 1.0f;  // Neutral
            if (value <= 75) return 0.75f; // Friendly
            return 0.5f;                    // Honored/Revered
        }

        /// <summary>
        /// Convert to legacy Reputation for backward compatibility
        /// </summary>
        public Reputation ToLegacyReputation()
        {
            return new Reputation
            {
                Kurenai = Kurenai,
                Azure = Azure
            };
        }

        /// <summary>
        /// Create from legacy Reputation, with defaults for other factions
        /// </summary>
        public static ExtendedReputation FromLegacy(Reputation legacy)
        {
            var extended = Default;
            extended.Kurenai = legacy.Kurenai;
            extended.Azure = legacy.Azure;
            return extended;
        }
    }

    /// <summary>
    /// Buffer element for pending extended reputation changes.
    /// Processed by ExtendedReputationSystem each frame.
    /// Supports spillover effects via FactionRelationships.
    /// </summary>
    public struct ExtendedReputationChangeElement : IBufferElementData
    {
        public FactionType Faction;
        public int Amount;
        public FixedString64Bytes Reason;
        public bool ApplySpillover;  // Whether to apply relationship spillover effects
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
