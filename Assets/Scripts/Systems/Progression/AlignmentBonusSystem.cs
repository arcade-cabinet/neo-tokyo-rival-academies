using Unity.Burst;
using Unity.Collections;
using Unity.Entities;
using Unity.Mathematics;
using NeoTokyo.Components.Faction;
using NeoTokyo.Components.Stats;

namespace NeoTokyo.Systems.Progression
{
    /// <summary>
    /// Component that stores calculated alignment stat modifiers.
    /// Updated by AlignmentBonusSystem based on Kurenai/Azure reputation delta.
    /// </summary>
    public struct AlignmentStatModifier : IComponentData
    {
        /// <summary>Bonus to Ignition stat (from Kurenai alignment)</summary>
        public int IgnitionBonus;

        /// <summary>Bonus to Logic stat (from Azure alignment)</summary>
        public int LogicBonus;

        /// <summary>The alignment delta used to calculate these bonuses</summary>
        public int AlignmentDelta;

        public static AlignmentStatModifier Default => new AlignmentStatModifier
        {
            IgnitionBonus = 0,
            LogicBonus = 0,
            AlignmentDelta = 0
        };
    }

    /// <summary>
    /// System that calculates and applies alignment-based stat bonuses.
    ///
    /// Per Golden Record specification:
    /// - Extreme Kurenai (rep diff > 50): +2 Ignition
    /// - Strong Kurenai (rep diff > 25): +1 Ignition
    /// - Strong Azure (rep diff > 25): +1 Logic
    /// - Extreme Azure (rep diff > 50): +2 Logic
    ///
    /// Alignment delta = Kurenai - Azure
    /// Positive delta = Kurenai-aligned (Ignition bonus)
    /// Negative delta = Azure-aligned (Logic bonus)
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateAfter(typeof(ReputationSystem))]
    public partial struct AlignmentBonusSystem : ISystem
    {
        [BurstCompile]
        public void OnCreate(ref SystemState state)
        {
            state.RequireForUpdate<Reputation>();
        }

        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            new CalculateAlignmentBonusJob().ScheduleParallel();
        }
    }

    [BurstCompile]
    public partial struct CalculateAlignmentBonusJob : IJobEntity
    {
        public void Execute(
            in Reputation reputation,
            ref AlignmentStatModifier modifier)
        {
            // Calculate alignment delta: positive = Kurenai, negative = Azure
            int delta = reputation.Kurenai - reputation.Azure;

            // Only recalculate if delta changed
            if (delta == modifier.AlignmentDelta)
                return;

            modifier.AlignmentDelta = delta;
            modifier.IgnitionBonus = 0;
            modifier.LogicBonus = 0;

            if (delta > 50)
            {
                // Extreme Kurenai alignment: +2 Ignition
                modifier.IgnitionBonus = 2;
            }
            else if (delta > 25)
            {
                // Strong Kurenai alignment: +1 Ignition
                modifier.IgnitionBonus = 1;
            }
            else if (delta < -50)
            {
                // Extreme Azure alignment: +2 Logic
                modifier.LogicBonus = 2;
            }
            else if (delta < -25)
            {
                // Strong Azure alignment: +1 Logic
                modifier.LogicBonus = 1;
            }
            // Neutral alignment (-25 to +25): no bonuses
        }
    }

    /// <summary>
    /// System that applies alignment modifiers to the effective stats.
    /// Creates EffectiveStats component that combines base RPGStats with modifiers.
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateAfter(typeof(AlignmentBonusSystem))]
    public partial struct ApplyAlignmentModifiersSystem : ISystem
    {
        [BurstCompile]
        public void OnCreate(ref SystemState state)
        {
            state.RequireForUpdate<RPGStats>();
        }

        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            new ApplyModifiersJob().ScheduleParallel();
        }
    }

    [BurstCompile]
    public partial struct ApplyModifiersJob : IJobEntity
    {
        public void Execute(
            in RPGStats baseStats,
            in AlignmentStatModifier alignmentModifier,
            ref EffectiveStats effectiveStats)
        {
            // Apply alignment modifiers to base stats
            effectiveStats.Structure = baseStats.Structure;
            effectiveStats.Ignition = baseStats.Ignition + alignmentModifier.IgnitionBonus;
            effectiveStats.Logic = baseStats.Logic + alignmentModifier.LogicBonus;
            effectiveStats.Flow = baseStats.Flow;
        }
    }

    /// <summary>
    /// Effective stats after all modifiers are applied.
    /// This is what combat and ability systems should read.
    /// </summary>
    public struct EffectiveStats : IComponentData
    {
        /// <summary>HP, Defense - survival capability (from Structure)</summary>
        public int Structure;

        /// <summary>Attack, Crits - fighting power (from Ignition + alignment bonus)</summary>
        public int Ignition;

        /// <summary>Skills, Specials - tactical ability (from Logic + alignment bonus)</summary>
        public int Logic;

        /// <summary>Speed, Evasion - movement/dodge (from Flow)</summary>
        public int Flow;

        public static EffectiveStats FromBase(RPGStats baseStats) => new EffectiveStats
        {
            Structure = baseStats.Structure,
            Ignition = baseStats.Ignition,
            Logic = baseStats.Logic,
            Flow = baseStats.Flow
        };
    }

    /// <summary>
    /// Helper utilities for alignment calculations.
    /// </summary>
    public static class AlignmentHelpers
    {
        /// <summary>
        /// Get the alignment level description for UI display.
        /// </summary>
        public static FixedString32Bytes GetAlignmentLabel(int kurenai, int azure)
        {
            int delta = kurenai - azure;

            if (delta > 50) return new FixedString32Bytes("Extreme Kurenai");
            if (delta > 25) return new FixedString32Bytes("Strong Kurenai");
            if (delta < -50) return new FixedString32Bytes("Extreme Azure");
            if (delta < -25) return new FixedString32Bytes("Strong Azure");
            return new FixedString32Bytes("Neutral");
        }

        /// <summary>
        /// Calculate total stat bonus from alignment.
        /// </summary>
        public static (int ignitionBonus, int logicBonus) GetAlignmentBonuses(int kurenai, int azure)
        {
            int delta = kurenai - azure;

            if (delta > 50) return (2, 0);
            if (delta > 25) return (1, 0);
            if (delta < -50) return (0, 2);
            if (delta < -25) return (0, 1);
            return (0, 0);
        }
    }
}
