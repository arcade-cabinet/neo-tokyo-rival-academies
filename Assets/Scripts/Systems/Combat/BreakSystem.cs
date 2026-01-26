using Unity.Burst;
using Unity.Entities;
using Unity.Mathematics;
using NeoTokyo.Components.Combat;

namespace NeoTokyo.Systems.Combat
{
    /// <summary>
    /// Break/stagger mechanics system.
    /// Equivalent to TypeScript: BreakSystem.ts
    ///
    /// When stability reaches 0, entity enters "broken" state:
    /// - Vulnerable to increased damage
    /// - Cannot act for breakDuration
    /// - Stability slowly recovers
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateAfter(typeof(CombatSystem))]
    public partial struct BreakSystem : ISystem
    {
        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            float dt = SystemAPI.Time.DeltaTime;

            foreach (var (stability, breakState, charState) in
                SystemAPI.Query<RefRW<StabilityState>, RefRW<BreakState>, RefRW<CharacterStateComponent>>())
            {
                // Handle broken state duration
                if (breakState.ValueRO.IsBroken)
                {
                    breakState.ValueRW.RemainingBreakTime -= dt;

                    if (breakState.ValueRO.RemainingBreakTime <= 0)
                    {
                        // Exit broken state
                        breakState.ValueRW.IsBroken = false;
                        breakState.ValueRW.RemainingBreakTime = 0;

                        // Restore some stability
                        stability.ValueRW.Current = stability.ValueRO.Max / 4;

                        // Return to idle
                        charState.ValueRW.Previous = charState.ValueRO.Current;
                        charState.ValueRW.Current = CharacterState.Idle;
                        charState.ValueRW.StateTime = 0;
                    }
                    continue;
                }

                // Check for break trigger
                if (stability.ValueRO.IsBroken && !breakState.ValueRO.IsBroken)
                {
                    // Enter broken state
                    breakState.ValueRW.IsBroken = true;
                    breakState.ValueRW.RemainingBreakTime = breakState.ValueRO.BreakDuration;
                    breakState.ValueRW.BreakCount++;

                    // Set character to stunned
                    charState.ValueRW.Previous = charState.ValueRO.Current;
                    charState.ValueRW.Current = CharacterState.Stunned;
                    charState.ValueRW.StateTime = 0;
                    continue;
                }

                // Recover stability over time (if not broken and not at max)
                if (stability.ValueRO.Current < stability.ValueRO.Max)
                {
                    float recovery = stability.ValueRO.RecoveryRate * dt;
                    stability.ValueRW.Current = math.min(
                        stability.ValueRO.Max,
                        stability.ValueRO.Current + (int)recovery
                    );
                }
            }
        }
    }

    /// <summary>
    /// Applies stability damage from attacks.
    /// Reduces stability when hit, potentially triggering break.
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateBefore(typeof(BreakSystem))]
    public partial struct StabilityDamageSystem : ISystem
    {
        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            foreach (var (stability, damageBuffer) in
                SystemAPI.Query<RefRW<StabilityState>, DynamicBuffer<DamageEvent>>())
            {
                foreach (var damage in damageBuffer)
                {
                    if (damage.StabilityDamage > 0)
                    {
                        stability.ValueRW.Current = math.max(
                            0,
                            stability.ValueRO.Current - (int)damage.StabilityDamage
                        );
                    }
                }
                // Note: DamageEvent buffer is cleared by CombatSystem
            }
        }
    }
}
