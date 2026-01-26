using Unity.Burst;
using Unity.Collections;
using Unity.Entities;
using Unity.Mathematics;
using NeoTokyo.Components.Faction;
using NeoTokyo.Data;

namespace NeoTokyo.Systems.Progression
{
    /// <summary>
    /// Processes reputation changes each frame (legacy 2-faction system).
    /// Equivalent to TypeScript: applyReputationChange() in ReputationSystem.ts
    ///
    /// This system:
    /// 1. Reads pending ReputationChangeElement buffers
    /// 2. Applies changes to Reputation component
    /// 3. Clamps values to 0-100 range (per Golden Record)
    /// 4. Clears the buffer after processing
    ///
    /// NOTE: For full 8-faction support, use ExtendedReputationSystem.
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    public partial struct ReputationSystem : ISystem
    {
        [BurstCompile]
        public void OnCreate(ref SystemState state)
        {
            state.RequireForUpdate<Reputation>();
        }

        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            new ProcessReputationChangesJob().ScheduleParallel();
        }
    }

    [BurstCompile]
    public partial struct ProcessReputationChangesJob : IJobEntity
    {
        public void Execute(
            ref Reputation reputation,
            ref DynamicBuffer<ReputationChangeElement> changes)
        {
            foreach (var change in changes)
            {
                switch (change.Faction)
                {
                    case FactionType.Kurenai:
                        reputation.Kurenai = math.clamp(
                            reputation.Kurenai + change.Amount,
                            0,
                            100
                        );
                        break;

                    case FactionType.Azure:
                        reputation.Azure = math.clamp(
                            reputation.Azure + change.Amount,
                            0,
                            100
                        );
                        break;
                }
            }

            changes.Clear();
        }
    }

    /// <summary>
    /// Processes extended reputation changes for all 8 factions.
    /// Supports spillover effects based on faction relationships.
    ///
    /// Features:
    /// - Tracks all 8 factions (Kurenai, Azure, Syndicate, Runners, Collective, Drowned, Council, Civilian)
    /// - Applies relationship spillover (e.g., +10 Kurenai = -5 Azure)
    /// - Optional reputation decay over time
    /// </summary>
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateAfter(typeof(ReputationSystem))]
    public partial class ExtendedReputationSystem : SystemBase
    {
        private const float DECAY_INTERVAL = 60f;  // Check decay every 60 seconds
        private const int DECAY_AMOUNT = 1;        // Decay 1 point toward neutral
        private const int NEUTRAL_VALUE = 50;

        private float _decayTimer;
        private bool _enableDecay;

        protected override void OnCreate()
        {
            _decayTimer = 0f;
            _enableDecay = false;  // Decay disabled by default
        }

        protected override void OnUpdate()
        {
            float deltaTime = SystemAPI.Time.DeltaTime;

            // Process extended reputation changes
            ProcessExtendedReputationChanges();

            // Handle decay if enabled
            if (_enableDecay)
            {
                _decayTimer += deltaTime;
                if (_decayTimer >= DECAY_INTERVAL)
                {
                    _decayTimer = 0f;
                    ApplyReputationDecay();
                }
            }
        }

        private void ProcessExtendedReputationChanges()
        {
            var ecb = new EntityCommandBuffer(Allocator.Temp);

            foreach (var (reputation, changes, entity) in
                SystemAPI.Query<RefRW<ExtendedReputation>, DynamicBuffer<ExtendedReputationChangeElement>>()
                    .WithEntityAccess())
            {
                foreach (var change in changes)
                {
                    // Apply primary reputation change
                    ApplyReputationChange(ref reputation.ValueRW, change.Faction, change.Amount);

                    // Apply spillover effects if enabled
                    if (change.ApplySpillover)
                    {
                        ApplySpilloverEffects(ref reputation.ValueRW, change.Faction, change.Amount);
                    }

                    // Log significant changes
                    if (math.abs(change.Amount) >= 10)
                    {
                        string factionName = FactionRelationships.GetFactionName(change.Faction);
                        string direction = change.Amount > 0 ? "increased" : "decreased";
                        UnityEngine.Debug.Log(
                            $"Reputation with {factionName} {direction} by {math.abs(change.Amount)}: {change.Reason}"
                        );
                    }
                }

                changes.Clear();
            }

            ecb.Playback(EntityManager);
            ecb.Dispose();
        }

        private void ApplyReputationChange(ref ExtendedReputation reputation, FactionType faction, int amount)
        {
            int currentValue = reputation.GetReputation(faction);
            int newValue = math.clamp(currentValue + amount, 0, 100);
            reputation.SetReputation(faction, newValue);
        }

        private void ApplySpilloverEffects(ref ExtendedReputation reputation, FactionType sourceFaction, int amount)
        {
            // Use pre-defined spillover rules
            using var spillovers = FactionRelationships.CalculateSpillover(
                sourceFaction,
                amount,
                Allocator.Temp
            );

            foreach (var spillover in spillovers)
            {
                ApplyReputationChange(ref reputation, spillover.Faction, spillover.Amount);
            }
        }

        private void ApplyReputationDecay()
        {
            foreach (var reputation in SystemAPI.Query<RefRW<ExtendedReputation>>())
            {
                DecayTowardNeutral(ref reputation.ValueRW);
            }
        }

        private void DecayTowardNeutral(ref ExtendedReputation reputation)
        {
            // Decay each faction toward neutral (50)
            reputation.Kurenai = DecayValue(reputation.Kurenai);
            reputation.Azure = DecayValue(reputation.Azure);
            reputation.Syndicate = DecayValue(reputation.Syndicate);
            reputation.Runners = DecayValue(reputation.Runners);
            reputation.Collective = DecayValue(reputation.Collective);
            reputation.Drowned = DecayValue(reputation.Drowned);
            reputation.Council = DecayValue(reputation.Council);
            reputation.Civilian = DecayValue(reputation.Civilian);
        }

        private int DecayValue(int current)
        {
            if (current > NEUTRAL_VALUE)
                return current - DECAY_AMOUNT;
            if (current < NEUTRAL_VALUE)
                return current + DECAY_AMOUNT;
            return current;
        }

        /// <summary>
        /// Enable or disable reputation decay
        /// </summary>
        public void SetDecayEnabled(bool enabled)
        {
            _enableDecay = enabled;
            _decayTimer = 0f;
        }
    }

    /// <summary>
    /// Helper methods for reputation queries.
    /// Static utilities matching TypeScript functions.
    /// </summary>
    public static class ReputationHelpers
    {
        /// <summary>
        /// Check if a quest is unlocked based on reputation requirements.
        /// Matches TypeScript: isQuestUnlocked() function
        /// </summary>
        public static bool IsQuestUnlocked(
            Reputation reputation,
            int? kurenaiRequired = null,
            int? azureRequired = null)
        {
            if (kurenaiRequired.HasValue && reputation.Kurenai < kurenaiRequired.Value)
                return false;

            if (azureRequired.HasValue && reputation.Azure < azureRequired.Value)
                return false;

            return true;
        }

        /// <summary>
        /// Check if a quest is unlocked based on extended reputation requirements.
        /// Supports requirements for any faction.
        /// </summary>
        public static bool IsQuestUnlockedExtended(
            ExtendedReputation reputation,
            FactionType? requiredFaction = null,
            int? requiredAmount = null,
            ReputationLevel? requiredLevel = null)
        {
            if (!requiredFaction.HasValue) return true;

            int currentRep = reputation.GetReputation(requiredFaction.Value);

            if (requiredAmount.HasValue && currentRep < requiredAmount.Value)
                return false;

            if (requiredLevel.HasValue)
            {
                var currentLevel = Reputation.GetLevel(currentRep);
                if ((int)currentLevel < (int)requiredLevel.Value)
                    return false;
            }

            return true;
        }

        /// <summary>
        /// Get available dialogue options based on reputation level.
        /// Matches TypeScript: getDialogueOptions() function
        /// </summary>
        public static void GetDialogueOptions(
            Reputation reputation,
            FactionType faction,
            ref NativeList<FixedString32Bytes> options)
        {
            options.Clear();

            // Base options always available
            options.Add(new FixedString32Bytes("Talk"));
            options.Add(new FixedString32Bytes("Leave"));

            var level = faction == FactionType.Kurenai
                ? reputation.GetKurenaiLevel()
                : reputation.GetAzureLevel();

            switch (level)
            {
                case ReputationLevel.Hated:
                case ReputationLevel.Hostile:
                    options.Add(new FixedString32Bytes("Threaten"));
                    break;

                case ReputationLevel.Friendly:
                case ReputationLevel.Honored:
                case ReputationLevel.Revered:
                    options.Add(new FixedString32Bytes("Ask for Help"));
                    options.Add(new FixedString32Bytes("Trade"));
                    break;
            }
        }

        /// <summary>
        /// Get available dialogue options for any faction (extended).
        /// </summary>
        public static void GetDialogueOptionsExtended(
            ExtendedReputation reputation,
            FactionType faction,
            ref NativeList<FixedString32Bytes> options)
        {
            options.Clear();

            // Base options always available
            options.Add(new FixedString32Bytes("Talk"));
            options.Add(new FixedString32Bytes("Leave"));

            var level = reputation.GetLevel(faction);

            switch (level)
            {
                case ReputationLevel.Hated:
                    options.Add(new FixedString32Bytes("Beg"));
                    break;

                case ReputationLevel.Hostile:
                    options.Add(new FixedString32Bytes("Threaten"));
                    options.Add(new FixedString32Bytes("Bribe"));
                    break;

                case ReputationLevel.Unfriendly:
                    options.Add(new FixedString32Bytes("Persuade"));
                    break;

                case ReputationLevel.Neutral:
                    options.Add(new FixedString32Bytes("Inquire"));
                    break;

                case ReputationLevel.Friendly:
                    options.Add(new FixedString32Bytes("Ask for Help"));
                    options.Add(new FixedString32Bytes("Trade"));
                    break;

                case ReputationLevel.Honored:
                    options.Add(new FixedString32Bytes("Ask for Help"));
                    options.Add(new FixedString32Bytes("Trade"));
                    options.Add(new FixedString32Bytes("Request Mission"));
                    break;

                case ReputationLevel.Revered:
                    options.Add(new FixedString32Bytes("Ask for Help"));
                    options.Add(new FixedString32Bytes("Trade"));
                    options.Add(new FixedString32Bytes("Request Mission"));
                    options.Add(new FixedString32Bytes("Access Inner Circle"));
                    break;
            }

            // Faction-specific options
            switch (faction)
            {
                case FactionType.Collective:
                    if (level >= ReputationLevel.Neutral)
                        options.Add(new FixedString32Bytes("Browse Wares"));
                    break;

                case FactionType.Runners:
                    if (level >= ReputationLevel.Friendly)
                        options.Add(new FixedString32Bytes("Request Transport"));
                    break;

                case FactionType.Drowned:
                    if (level >= ReputationLevel.Honored)
                        options.Add(new FixedString32Bytes("Seek Prophecy"));
                    break;
            }
        }

        /// <summary>
        /// Create a reputation change request entity for extended reputation
        /// </summary>
        public static void RequestReputationChange(
            EntityManager em,
            Entity targetEntity,
            FactionType faction,
            int amount,
            string reason,
            bool applySpillover = true)
        {
            if (!em.HasBuffer<ExtendedReputationChangeElement>(targetEntity))
            {
                em.AddBuffer<ExtendedReputationChangeElement>(targetEntity);
            }

            var buffer = em.GetBuffer<ExtendedReputationChangeElement>(targetEntity);
            buffer.Add(new ExtendedReputationChangeElement
            {
                Faction = faction,
                Amount = amount,
                Reason = new FixedString64Bytes(reason),
                ApplySpillover = applySpillover
            });
        }
    }

    /// <summary>
    /// Extended reputation change amounts for all factions.
    /// </summary>
    public static class ExtendedReputationChanges
    {
        // Combat actions
        public const int DEFEAT_FACTION_MEMBER = -8;
        public const int DEFEAT_FACTION_LEADER = -20;
        public const int SPARE_FACTION_MEMBER = 5;
        public const int HELP_FACTION_IN_COMBAT = 10;

        // Quest actions
        public const int COMPLETE_FACTION_QUEST = 15;
        public const int FAIL_FACTION_QUEST = -10;
        public const int BETRAY_FACTION = -30;

        // Social actions
        public const int HELP_CIVILIAN = 5;
        public const int HARM_CIVILIAN = -10;
        public const int BRIBE_ACCEPTED = -3;
        public const int GIFT_GIVEN = 8;

        // Territory actions
        public const int DEFEND_TERRITORY = 12;
        public const int ATTACK_TERRITORY = -15;
        public const int TRADE_COMPLETED = 3;

        // Special actions
        public const int DISCOVER_SECRET = 10;
        public const int EXPOSE_CORRUPTION = 15;  // Council/Syndicate specific
        public const int RACE_VICTORY = 10;       // Runners specific
        public const int PROPHECY_FULFILLED = 20; // Drowned specific
    }
}
