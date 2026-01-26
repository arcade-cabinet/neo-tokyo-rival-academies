using Unity.Collections;
using Unity.Mathematics;
using NeoTokyo.Components.Faction;

namespace NeoTokyo.Data
{
    /// <summary>
    /// Defines faction relationships including rivalries, alliances, and reputation spillover rules.
    /// When player reputation changes with one faction, related factions are affected.
    ///
    /// Relationship Types:
    /// - Allied: Gain rep with one = gain with ally, lose = lose with ally
    /// - Rival: Gain rep with one = lose with rival
    /// - Neutral: No spillover effect
    /// - Complex: Custom spillover rules (e.g., Council monitors all)
    /// </summary>
    public static class FactionRelationships
    {
        /// <summary>
        /// Relationship types between factions
        /// </summary>
        public enum RelationshipType : byte
        {
            Neutral = 0,    // No spillover
            Allied = 1,     // Positive correlation
            Rival = 2,      // Negative correlation
            Complex = 3     // Custom rules apply
        }

        /// <summary>
        /// Spillover multiplier when reputation changes.
        /// Positive = same direction, Negative = opposite direction.
        /// Value of 0.5 means 50% of the change spills over.
        /// </summary>
        public struct SpilloverRule
        {
            public FactionType SourceFaction;
            public FactionType AffectedFaction;
            public float Multiplier;  // -1.0 to 1.0

            public SpilloverRule(FactionType source, FactionType affected, float multiplier)
            {
                SourceFaction = source;
                AffectedFaction = affected;
                Multiplier = math.clamp(multiplier, -1f, 1f);
            }
        }

        /// <summary>
        /// All faction relationship spillover rules.
        /// These define how gaining/losing rep with one faction affects others.
        /// </summary>
        public static readonly SpilloverRule[] AllRules = new SpilloverRule[]
        {
            // === KURENAI vs AZURE (Primary Rivalry) ===
            // The two academies are direct rivals
            new SpilloverRule(FactionType.Kurenai, FactionType.Azure, -0.5f),
            new SpilloverRule(FactionType.Azure, FactionType.Kurenai, -0.5f),

            // === SYNDICATE Relationships ===
            // Syndicate opposes Council (governance vs crime)
            new SpilloverRule(FactionType.Syndicate, FactionType.Council, -0.7f),
            new SpilloverRule(FactionType.Council, FactionType.Syndicate, -0.7f),
            // Syndicate works with Runners (smuggling routes)
            new SpilloverRule(FactionType.Syndicate, FactionType.Runners, 0.3f),
            new SpilloverRule(FactionType.Runners, FactionType.Syndicate, 0.3f),
            // Syndicate exploits Collective (protection rackets)
            new SpilloverRule(FactionType.Syndicate, FactionType.Collective, -0.2f),

            // === RUNNERS Relationships ===
            // Runners are free spirits, light alliance with Kurenai (passion)
            new SpilloverRule(FactionType.Runners, FactionType.Kurenai, 0.2f),
            new SpilloverRule(FactionType.Kurenai, FactionType.Runners, 0.2f),
            // Runners distrust Azure's rigid logic
            new SpilloverRule(FactionType.Runners, FactionType.Azure, -0.15f),

            // === COLLECTIVE Relationships ===
            // Collective is mercantile, friendly with everyone except Syndicate
            // Helping Collective slightly improves Civilian relations
            new SpilloverRule(FactionType.Collective, FactionType.Neutral, 0.2f),
            // Collective appreciates Council stability
            new SpilloverRule(FactionType.Collective, FactionType.Council, 0.15f),
            new SpilloverRule(FactionType.Council, FactionType.Collective, 0.15f),

            // === DROWNED Relationships ===
            // Drowned are mysterious, distrusted by Council
            new SpilloverRule(FactionType.Drowned, FactionType.Council, -0.4f),
            new SpilloverRule(FactionType.Council, FactionType.Drowned, -0.4f),
            // Drowned have strange affinity with Azure (both seek knowledge)
            new SpilloverRule(FactionType.Drowned, FactionType.Azure, 0.15f),
            // Civilians fear the Drowned
            new SpilloverRule(FactionType.Drowned, FactionType.Neutral, -0.3f),

            // === COUNCIL Relationships ===
            // Council wants order, somewhat allied with Azure (logic/structure)
            new SpilloverRule(FactionType.Council, FactionType.Azure, 0.2f),
            new SpilloverRule(FactionType.Azure, FactionType.Council, 0.2f),
            // Council is wary of Kurenai's passion
            new SpilloverRule(FactionType.Council, FactionType.Kurenai, -0.1f),

            // === CIVILIAN Relationships ===
            // Helping civilians improves standing with legitimate factions
            new SpilloverRule(FactionType.Neutral, FactionType.Council, 0.2f),
            new SpilloverRule(FactionType.Neutral, FactionType.Collective, 0.2f),
            // Civilians appreciate both academies
            new SpilloverRule(FactionType.Neutral, FactionType.Kurenai, 0.1f),
            new SpilloverRule(FactionType.Neutral, FactionType.Azure, 0.1f),
        };

        /// <summary>
        /// Get the relationship type between two factions
        /// </summary>
        public static RelationshipType GetRelationship(FactionType a, FactionType b)
        {
            if (a == b) return RelationshipType.Neutral;

            // Check for specific relationships
            // Kurenai vs Azure: Rivals
            if ((a == FactionType.Kurenai && b == FactionType.Azure) ||
                (a == FactionType.Azure && b == FactionType.Kurenai))
                return RelationshipType.Rival;

            // Syndicate vs Council: Rivals
            if ((a == FactionType.Syndicate && b == FactionType.Council) ||
                (a == FactionType.Council && b == FactionType.Syndicate))
                return RelationshipType.Rival;

            // Syndicate + Runners: Allied
            if ((a == FactionType.Syndicate && b == FactionType.Runners) ||
                (a == FactionType.Runners && b == FactionType.Syndicate))
                return RelationshipType.Allied;

            // Council + Azure: Allied
            if ((a == FactionType.Council && b == FactionType.Azure) ||
                (a == FactionType.Azure && b == FactionType.Council))
                return RelationshipType.Allied;

            // Drowned relationships are complex
            if (a == FactionType.Drowned || b == FactionType.Drowned)
                return RelationshipType.Complex;

            return RelationshipType.Neutral;
        }

        /// <summary>
        /// Calculate all spillover effects for a reputation change.
        /// Returns a NativeArray that must be disposed by caller.
        /// </summary>
        public static NativeArray<ReputationSpillover> CalculateSpillover(
            FactionType sourceFaction,
            int amount,
            Allocator allocator)
        {
            var spillovers = new NativeList<ReputationSpillover>(8, allocator);

            foreach (var rule in AllRules)
            {
                if (rule.SourceFaction == sourceFaction)
                {
                    int spilloverAmount = (int)math.round(amount * rule.Multiplier);
                    if (spilloverAmount != 0)
                    {
                        spillovers.Add(new ReputationSpillover
                        {
                            Faction = rule.AffectedFaction,
                            Amount = spilloverAmount
                        });
                    }
                }
            }

            var result = spillovers.ToArray(allocator);
            spillovers.Dispose();
            return result;
        }

        /// <summary>
        /// Get a description of faction relationship for UI
        /// </summary>
        public static string GetRelationshipDescription(FactionType a, FactionType b)
        {
            var relationship = GetRelationship(a, b);
            string aName = GetFactionName(a);
            string bName = GetFactionName(b);

            return relationship switch
            {
                RelationshipType.Allied => $"{aName} and {bName} are allied.",
                RelationshipType.Rival => $"{aName} and {bName} are rivals.",
                RelationshipType.Complex => $"{aName} has a complicated relationship with {bName}.",
                _ => $"{aName} and {bName} are neutral."
            };
        }

        /// <summary>
        /// Get display name for a faction
        /// </summary>
        public static string GetFactionName(FactionType faction)
        {
            return faction switch
            {
                FactionType.Kurenai => "Kurenai Academy",
                FactionType.Azure => "Azure Academy",
                FactionType.Syndicate => "The Syndicate",
                FactionType.Runners => "The Runners",
                FactionType.Collective => "The Collective",
                FactionType.Drowned => "The Drowned",
                FactionType.Council => "Council of Seven",
                FactionType.Neutral => "Civilians",
                _ => "Unknown"
            };
        }

        /// <summary>
        /// Get faction color for UI (as hex string)
        /// </summary>
        public static string GetFactionColorHex(FactionType faction)
        {
            return faction switch
            {
                FactionType.Kurenai => "#DC143C",   // Crimson Red
                FactionType.Azure => "#4169E1",     // Royal Blue
                FactionType.Syndicate => "#800080", // Purple
                FactionType.Runners => "#00CED1",   // Dark Cyan
                FactionType.Collective => "#FFD700", // Gold
                FactionType.Drowned => "#008B8B",   // Dark Cyan/Teal
                FactionType.Council => "#C0C0C0",   // Silver
                FactionType.Neutral => "#808080",   // Gray
                _ => "#FFFFFF"
            };
        }

        /// <summary>
        /// Get faction icon/symbol name for asset loading
        /// </summary>
        public static string GetFactionIconName(FactionType faction)
        {
            return faction switch
            {
                FactionType.Kurenai => "icon_kurenai_flame",
                FactionType.Azure => "icon_azure_crystal",
                FactionType.Syndicate => "icon_syndicate_snake",
                FactionType.Runners => "icon_runners_wave",
                FactionType.Collective => "icon_collective_coin",
                FactionType.Drowned => "icon_drowned_eye",
                FactionType.Council => "icon_council_scales",
                FactionType.Neutral => "icon_civilian",
                _ => "icon_unknown"
            };
        }
    }

    /// <summary>
    /// Represents a spillover reputation change to apply
    /// </summary>
    public struct ReputationSpillover
    {
        public FactionType Faction;
        public int Amount;
    }

    /// <summary>
    /// Faction lore and context information
    /// </summary>
    public static class FactionLore
    {
        public static string GetFactionDescription(FactionType faction)
        {
            return faction switch
            {
                FactionType.Kurenai =>
                    "The Kurenai Academy teaches that passion and emotion are the path to true power. " +
                    "Their students embrace their feelings, channeling raw energy into devastating techniques.",

                FactionType.Azure =>
                    "Azure Academy pursues knowledge and logic above all else. " +
                    "Their calculated approach to combat makes them formidable strategists.",

                FactionType.Syndicate =>
                    "The Syndicate controls the underworld of flooded Neo-Tokyo. " +
                    "Their criminal network spans every district, and they always collect their debts.",

                FactionType.Runners =>
                    "Speedboat racers and messengers who know every waterway in the city. " +
                    "They prize freedom above all and owe allegiance to no one.",

                FactionType.Collective =>
                    "Merchants and traders who keep the economy flowing. " +
                    "The Collective believes that wealth is the truest form of power.",

                FactionType.Drowned =>
                    "A mysterious cult that worships the flooded depths. " +
                    "They claim to hear voices from below and possess unsettling abilities.",

                FactionType.Council =>
                    "The Council of Seven maintains order in the chaos of Neo-Tokyo. " +
                    "Their authority is absolute in matters of law, though enforcement is another matter.",

                FactionType.Neutral =>
                    "The everyday citizens of Neo-Tokyo struggle to survive between the factions. " +
                    "They want only peace and stability.",

                _ => "Unknown faction."
            };
        }

        public static string GetFactionMotto(FactionType faction)
        {
            return faction switch
            {
                FactionType.Kurenai => "Passion ignites the soul.",
                FactionType.Azure => "Knowledge conquers all.",
                FactionType.Syndicate => "Everyone has a price.",
                FactionType.Runners => "Faster than the flood.",
                FactionType.Collective => "Trade makes the world turn.",
                FactionType.Drowned => "The depths call us home.",
                FactionType.Council => "Order through law.",
                FactionType.Neutral => "We just want to live.",
                _ => ""
            };
        }
    }
}
