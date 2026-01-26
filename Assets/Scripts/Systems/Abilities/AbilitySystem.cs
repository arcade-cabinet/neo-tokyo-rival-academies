using Unity.Burst;
using Unity.Collections;
using Unity.Entities;
using Unity.Mathematics;
using NeoTokyo.Components.Abilities;
using NeoTokyo.Components.Stats;
using static Unity.Mathematics.math;

namespace NeoTokyo.Systems.Abilities
{
    /// <summary>
    /// System that processes ability cooldowns
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    public partial struct AbilityCooldownSystem : ISystem
    {
        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            float deltaTime = SystemAPI.Time.DeltaTime;

            new UpdateCooldownsJob
            {
                DeltaTime = deltaTime
            }.ScheduleParallel();
        }

        [BurstCompile]
        partial struct UpdateCooldownsJob : IJobEntity
        {
            public float DeltaTime;

            void Execute(ref AbilityCooldown cooldown)
            {
                if (cooldown.RemainingTime > 0f)
                {
                    cooldown.RemainingTime = math.max(0f, cooldown.RemainingTime - DeltaTime);
                }
            }
        }
    }

    /// <summary>
    /// System that processes ability execution requests
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateAfter(typeof(AbilityCooldownSystem))]
    public partial struct AbilityExecutionSystem : ISystem
    {
        public void OnCreate(ref SystemState state)
        {
            state.RequireForUpdate<AbilityExecuteRequest>();
            state.RequireForUpdate<EndSimulationEntityCommandBufferSystem.Singleton>();
        }

        public void OnUpdate(ref SystemState state)
        {
            var ecb = SystemAPI.GetSingleton<EndSimulationEntityCommandBufferSystem.Singleton>()
                .CreateCommandBuffer(state.WorldUnmanaged);

            foreach (var (request, entity) in
                SystemAPI.Query<RefRO<AbilityExecuteRequest>>()
                    .WithEntityAccess())
            {
                ProcessAbilityRequest(ref state, request.ValueRO, entity, ref ecb);
            }
        }

        private void ProcessAbilityRequest(
            ref SystemState state,
            AbilityExecuteRequest request,
            Entity requestEntity,
            ref EntityCommandBuffer ecb)
        {
            // Get ability data
            if (!SystemAPI.HasComponent<AbilityData>(request.Ability))
            {
                ecb.DestroyEntity(requestEntity);
                return;
            }

            var abilityData = SystemAPI.GetComponent<AbilityData>(request.Ability);

            // Check cooldown
            if (SystemAPI.HasComponent<AbilityCooldown>(request.Ability))
            {
                var cooldown = SystemAPI.GetComponent<AbilityCooldown>(request.Ability);
                if (cooldown.IsOnCooldown)
                {
                    CreateFailureResult(ref ecb, request, "Ability is on cooldown");
                    ecb.DestroyEntity(requestEntity);
                    return;
                }
            }

            // Check resource cost
            if (SystemAPI.HasComponent<ResourcePool>(request.Caster))
            {
                var resources = SystemAPI.GetComponent<ResourcePool>(request.Caster);
                if (!resources.CanAfford(abilityData.Cost))
                {
                    CreateFailureResult(ref ecb, request, "Insufficient mana");
                    ecb.DestroyEntity(requestEntity);
                    return;
                }

                // Deduct cost
                resources.Spend(abilityData.Cost);
                ecb.SetComponent(request.Caster, resources);
            }

            // Apply cooldown
            if (SystemAPI.HasComponent<AbilityCooldown>(request.Ability))
            {
                var cooldown = new AbilityCooldown
                {
                    RemainingTime = abilityData.CooldownDuration,
                    TotalDuration = abilityData.CooldownDuration
                };
                ecb.SetComponent(request.Ability, cooldown);
            }

            // Apply effect based on type
            bool success = ApplyAbilityEffect(ref state, abilityData, request.Target, ref ecb);

            if (success)
            {
                CreateSuccessResult(ref ecb, request, abilityData);
            }
            else
            {
                CreateFailureResult(ref ecb, request, "Invalid target");
            }

            ecb.DestroyEntity(requestEntity);
        }

        private bool ApplyAbilityEffect(
            ref SystemState state,
            AbilityData ability,
            Entity target,
            ref EntityCommandBuffer ecb)
        {
            switch (ability.EffectType)
            {
                case AbilityEffectType.Damage:
                    // Damage reduces Health.Current (not Structure which is base defense/HP capacity)
                    if (SystemAPI.HasComponent<Health>(target))
                    {
                        var health = SystemAPI.GetComponent<Health>(target);
                        health.Current = math.max(0, health.Current - ability.EffectValue);
                        ecb.SetComponent(target, health);
                        return true;
                    }
                    break;

                case AbilityEffectType.Heal:
                    // Heal restores Health.Current up to max
                    if (SystemAPI.HasComponent<Health>(target))
                    {
                        var health = SystemAPI.GetComponent<Health>(target);
                        health.Current = math.min(health.Max, health.Current + ability.EffectValue);
                        ecb.SetComponent(target, health);
                        return true;
                    }
                    break;

                case AbilityEffectType.Buff:
                case AbilityEffectType.Debuff:
                case AbilityEffectType.Utility:
                    // These would trigger buff/debuff system
                    return true;
            }

            return false;
        }

        private void CreateSuccessResult(
            ref EntityCommandBuffer ecb,
            AbilityExecuteRequest request,
            AbilityData ability)
        {
            var resultEntity = ecb.CreateEntity();
            ecb.AddComponent(resultEntity, new AbilityExecuteResult
            {
                Success = true,
                EffectType = ability.EffectType,
                EffectValue = ability.EffectValue,
                Target = request.Target,
                FailureReason = default
            });
        }

        private void CreateFailureResult(
            ref EntityCommandBuffer ecb,
            AbilityExecuteRequest request,
            FixedString64Bytes reason)
        {
            var resultEntity = ecb.CreateEntity();
            ecb.AddComponent(resultEntity, new AbilityExecuteResult
            {
                Success = false,
                EffectType = default,
                EffectValue = 0,
                Target = request.Target,
                FailureReason = reason
            });
        }
    }

    /// <summary>
    /// System that handles resource regeneration
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    public partial struct ResourceRegenSystem : ISystem
    {
        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            float deltaTime = SystemAPI.Time.DeltaTime;

            new RegenResourcesJob
            {
                DeltaTime = deltaTime
            }.ScheduleParallel();
        }

        [BurstCompile]
        partial struct RegenResourcesJob : IJobEntity
        {
            public float DeltaTime;

            void Execute(ref ResourcePool resources)
            {
                if (resources.Current < resources.Maximum && resources.RegenRate > 0f)
                {
                    int regenAmount = (int)(resources.RegenRate * DeltaTime);
                    resources.Current = math.min(resources.Maximum, resources.Current + regenAmount);
                }
            }
        }
    }
}
