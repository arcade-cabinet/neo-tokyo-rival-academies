using Unity.Burst;
using Unity.Collections;
using Unity.Entities;
using Unity.Mathematics;
using NeoTokyo.Components.Faction;

namespace NeoTokyo.Systems.Progression
{
    /// <summary>
    /// Processes reputation changes each frame.
    /// Equivalent to TypeScript: applyReputationChange() in ReputationSystem.ts
    ///
    /// This system:
    /// 1. Reads pending ReputationChangeElement buffers
    /// 2. Applies changes to Reputation component
    /// 3. Clamps values to 0-100 range (per Golden Record)
    /// 4. Clears the buffer after processing
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
    }
}
