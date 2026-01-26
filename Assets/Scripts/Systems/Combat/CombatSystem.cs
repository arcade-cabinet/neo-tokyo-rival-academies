using Unity.Burst;
using Unity.Collections;
using Unity.Entities;
using Unity.Mathematics;
using NeoTokyo.Components.Combat;
using NeoTokyo.Components.Stats;

namespace NeoTokyo.Systems.Combat
{
    /// <summary>
    /// Processes damage events and applies to entity health.
    /// Equivalent to TypeScript: CombatLogic.ts / CombatSystem.ts
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateAfter(typeof(HitDetectionSystem))]
    public partial struct CombatSystem : ISystem
    {
        [BurstCompile]
        public void OnCreate(ref SystemState state)
        {
            state.RequireForUpdate<Health>();
        }

        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            var ecb = new EntityCommandBuffer(Allocator.TempJob);

            foreach (var (health, invincibility, damageBuffer, entity) in
                SystemAPI.Query<RefRW<Health>, RefRW<InvincibilityState>, DynamicBuffer<DamageEvent>>()
                    .WithEntityAccess())
            {
                // Skip if invincible
                if (invincibility.ValueRO.IsActive)
                {
                    damageBuffer.Clear();
                    continue;
                }

                foreach (var damage in damageBuffer)
                {
                    // Apply damage
                    health.ValueRW.Current = math.max(0, health.ValueRO.Current - damage.Amount);

                    // Grant invincibility frames
                    invincibility.ValueRW = InvincibilityState.Create(0.5f);

                    // Check for death
                    if (health.ValueRO.IsDead)
                    {
                        // Add death tag for cleanup system
                        ecb.AddComponent<DeadTag>(entity);
                        break;
                    }
                }

                damageBuffer.Clear();
            }

            ecb.Playback(state.EntityManager);
            ecb.Dispose();
        }
    }

    /// <summary>
    /// Tag for entities that have died and need cleanup.
    /// </summary>
    public struct DeadTag : IComponentData { }

    /// <summary>
    /// Updates invincibility timers each frame.
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    public partial struct InvincibilitySystem : ISystem
    {
        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            float dt = SystemAPI.Time.DeltaTime;

            foreach (var invincibility in SystemAPI.Query<RefRW<InvincibilityState>>())
            {
                if (!invincibility.ValueRO.IsActive) continue;

                invincibility.ValueRW.RemainingTime -= dt;

                if (invincibility.ValueRO.RemainingTime <= 0)
                {
                    invincibility.ValueRW.IsActive = false;
                    invincibility.ValueRW.RemainingTime = 0;
                }
            }
        }
    }

    /// <summary>
    /// Hit detection system - checks for collisions and generates damage events.
    /// Equivalent to TypeScript: HitDetection.ts
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    public partial struct HitDetectionSystem : ISystem
    {
        [BurstCompile]
        public void OnCreate(ref SystemState state)
        {
            // Will use Unity Physics for actual collision detection
            // For now, this is a placeholder for the system structure
        }

        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            // Collision detection will be implemented with Unity Physics
            // This system will query collision events and generate DamageEvents
        }
    }
}
