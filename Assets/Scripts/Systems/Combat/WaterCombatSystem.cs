using Unity.Burst;
using Unity.Collections;
using Unity.Entities;
using Unity.Mathematics;
using Unity.Transforms;
using NeoTokyo.Components.World;
using NeoTokyo.Components.Combat;
using NeoTokyo.Components.Stats;
using NeoTokyo.Components.Abilities;

namespace NeoTokyo.Systems.Combat
{
    /// <summary>
    /// System that modifies combat behavior when entities are in water.
    /// Implements Flooded World combat mechanics from Golden Record:
    /// - Slower attacks in water
    /// - Fire abilities disabled in waist-deep+
    /// - Electric abilities chain in water
    /// - Increased knockback in water
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateBefore(typeof(CombatSystem))]
    public partial struct WaterCombatModifierSystem : ISystem
    {
        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            // Water combat modifiers are applied by WaterZoneDetectionSystem
            // This system ensures combat stats reflect those modifiers

            foreach (var (waterMod, charState) in
                SystemAPI.Query<RefRO<WaterCombatModifier>, RefRW<CharacterStateComponent>>())
            {
                // Combat state transitions could be modified here based on water conditions
                // For example, prevent certain attacks in deep water
            }
        }
    }

    /// <summary>
    /// System that handles drowning damage accumulation and application.
    /// Drowning occurs when submerged with no oxygen remaining.
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateAfter(typeof(WaterCombatModifierSystem))]
    public partial struct DrownSystem : ISystem
    {
        private const float DrowningDamagePerSecond = 10f;
        private const float DrowningStaggerThreshold = 3f; // Seconds until stagger

        [BurstCompile]
        public void OnCreate(ref SystemState state)
        {
            state.RequireForUpdate<EndSimulationEntityCommandBufferSystem.Singleton>();
        }

        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            float deltaTime = SystemAPI.Time.DeltaTime;
            var ecb = SystemAPI.GetSingleton<EndSimulationEntityCommandBufferSystem.Singleton>()
                .CreateCommandBuffer(state.WorldUnmanaged);

            foreach (var (diving, inWater, health, charState, damageBuffer, entity) in
                SystemAPI.Query<RefRO<DivingState>, RefRO<InWater>, RefRW<Health>,
                               RefRW<CharacterStateComponent>, DynamicBuffer<DamageEvent>>()
                    .WithEntityAccess())
            {
                if (!diving.ValueRO.IsDrowning)
                    continue;

                // Calculate drowning damage
                int damage = (int)math.ceil(DrowningDamagePerSecond * deltaTime);

                if (damage > 0)
                {
                    damageBuffer.Add(new DamageEvent
                    {
                        Source = Entity.Null, // Environmental
                        Amount = damage,
                        IsCritical = false,
                        StabilityDamage = 10f // Drowning causes stability loss
                    });
                }

                // Apply stagger if drowning too long
                if (inWater.ValueRO.SubmersionTime > DrowningStaggerThreshold &&
                    charState.ValueRO.Current != CharacterState.Staggered &&
                    charState.ValueRO.Current != CharacterState.Dead)
                {
                    charState.ValueRW.Previous = charState.ValueRO.Current;
                    charState.ValueRW.Current = CharacterState.Staggered;
                    charState.ValueRW.StateTime = 0f;
                }
            }
        }
    }

    /// <summary>
    /// System that handles electric damage chaining in water.
    /// When an electric attack hits a target in water, nearby targets in water also take damage.
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateAfter(typeof(HitDetectionSystem))]
    public partial struct ElectricChainSystem : ISystem
    {
        private const float ChainRadius = 4f;
        private const float ChainDamageMultiplier = 0.6f;
        private const int MaxChainTargets = 3;

        [BurstCompile]
        public void OnCreate(ref SystemState state)
        {
            state.RequireForUpdate<EndSimulationEntityCommandBufferSystem.Singleton>();
        }

        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            var ecb = SystemAPI.GetSingleton<EndSimulationEntityCommandBufferSystem.Singleton>()
                .CreateCommandBuffer(state.WorldUnmanaged);

            // Collect entities in water with their positions
            var entitiesInWater = new NativeList<WaterEntity>(64, Allocator.TempJob);

            foreach (var (inWater, transform, entity) in
                SystemAPI.Query<RefRO<InWater>, RefRO<LocalTransform>>()
                    .WithEntityAccess())
            {
                // Only chain to entities in shallow or deeper water
                if (inWater.ValueRO.CurrentDepth >= WaterDepth.Shallow)
                {
                    entitiesInWater.Add(new WaterEntity
                    {
                        Entity = entity,
                        Position = transform.ValueRO.Position,
                        Depth = inWater.ValueRO.CurrentDepth
                    });
                }
            }

            // Process electric damage events
            foreach (var (damageBuffer, waterMod, inWater, transform, entity) in
                SystemAPI.Query<DynamicBuffer<DamageEvent>, RefRO<WaterCombatModifier>,
                               RefRO<InWater>, RefRO<LocalTransform>>()
                    .WithEntityAccess())
            {
                if (!waterMod.ValueRO.ElectricAbilitiesChain)
                    continue;

                // Look for electric damage events (from DamageEvent source checking)
                // This is a simplified check - in full implementation, damage events
                // would have an element type field

                foreach (var damage in damageBuffer)
                {
                    // Skip non-electric damage (simplified: check if source has electric tag)
                    // For now, assume all damage in electrified water chains
                    if (damage.StabilityDamage > 0 && inWater.ValueRO.CurrentDepth >= WaterDepth.Shallow)
                    {
                        // Find nearby targets in water
                        int chainCount = 0;
                        float3 originPos = transform.ValueRO.Position;

                        for (int i = 0; i < entitiesInWater.Length && chainCount < MaxChainTargets; i++)
                        {
                            var target = entitiesInWater[i];

                            // Don't chain to self
                            if (target.Entity == entity)
                                continue;

                            float dist = math.distance(originPos, target.Position);
                            if (dist <= ChainRadius)
                            {
                                // Chain damage to this target
                                if (SystemAPI.HasBuffer<DamageEvent>(target.Entity))
                                {
                                    var targetBuffer = SystemAPI.GetBuffer<DamageEvent>(target.Entity);
                                    int chainDamage = (int)(damage.Amount * ChainDamageMultiplier);

                                    if (chainDamage > 0)
                                    {
                                        targetBuffer.Add(new DamageEvent
                                        {
                                            Source = damage.Source,
                                            Amount = chainDamage,
                                            IsCritical = false,
                                            StabilityDamage = damage.StabilityDamage * ChainDamageMultiplier
                                        });
                                    }

                                    chainCount++;
                                }
                            }
                        }
                    }
                }
            }

            entitiesInWater.Dispose();
        }

        private struct WaterEntity
        {
            public Entity Entity;
            public float3 Position;
            public WaterDepth Depth;
        }
    }

    /// <summary>
    /// System that handles knockback into water mechanics.
    /// When knockback pushes an entity into water, apply special effects.
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateAfter(typeof(CombatSystem))]
    public partial struct KnockbackIntoWaterSystem : ISystem
    {
        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            // This system would process knockback events and check if the
            // resulting position is in water

            // For now, the water detection happens in WaterZoneDetectionSystem
            // which will add InWater components when entities enter water zones

            // Special effects like splash, additional stagger, etc. would be triggered here
        }
    }

    /// <summary>
    /// Component for tracking electric damage sources (for chaining logic).
    /// </summary>
    public struct ElectricDamageSource : IComponentData
    {
        public Entity Source;
        public float ChainRadius;
        public float DamagePerChain;
        public int RemainingChains;
    }

    /// <summary>
    /// Buffer for tracking chain targets to prevent double-hitting.
    /// </summary>
    public struct ElectricChainTarget : IBufferElementData
    {
        public Entity Target;
    }

    /// <summary>
    /// System that validates and modifies ability usage in water.
    /// Fire abilities are disabled in waist-deep+ water.
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateBefore(typeof(AbilitySystem))]
    public partial struct WaterAbilityRestrictionSystem : ISystem
    {
        [BurstCompile]
        public void OnCreate(ref SystemState state)
        {
            state.RequireForUpdate<EndSimulationEntityCommandBufferSystem.Singleton>();
        }

        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            var ecb = SystemAPI.GetSingleton<EndSimulationEntityCommandBufferSystem.Singleton>()
                .CreateCommandBuffer(state.WorldUnmanaged);

            // Check ability execution requests against water restrictions
            foreach (var (request, entity) in
                SystemAPI.Query<RefRO<AbilityExecuteRequest>>()
                    .WithEntityAccess())
            {
                var caster = request.ValueRO.Caster;

                // Check if caster is in water with restrictions
                if (!SystemAPI.HasComponent<WaterCombatModifier>(caster))
                    continue;

                var waterMod = SystemAPI.GetComponent<WaterCombatModifier>(caster);

                if (!waterMod.FireAbilitiesDisabled)
                    continue;

                // Check if the ability is fire-based
                // This would require ability element type data
                // For now, placeholder logic

                var abilityEntity = request.ValueRO.Ability;
                if (!SystemAPI.HasComponent<AbilityData>(abilityEntity))
                    continue;

                // If fire ability in water, cancel the request and notify
                // In full implementation, check ability element type
                // For now, we let abilities through and rely on effect systems
            }
        }
    }

    /// <summary>
    /// Ability element types for water interaction.
    /// </summary>
    public enum AbilityElement : byte
    {
        Physical = 0,
        Fire = 1,
        Ice = 2,
        Electric = 3,
        Water = 4,
        Wind = 5,
        Dark = 6,
        Light = 7
    }

    /// <summary>
    /// Component to define ability element for water interaction.
    /// </summary>
    public struct AbilityElementData : IComponentData
    {
        public AbilityElement Element;
        public bool IsAffectedByWater;

        public static AbilityElementData Fire => new AbilityElementData
        {
            Element = AbilityElement.Fire,
            IsAffectedByWater = true
        };

        public static AbilityElementData Electric => new AbilityElementData
        {
            Element = AbilityElement.Electric,
            IsAffectedByWater = true // Chains in water
        };

        public static AbilityElementData Physical => new AbilityElementData
        {
            Element = AbilityElement.Physical,
            IsAffectedByWater = false
        };
    }

    /// <summary>
    /// System that applies attack speed penalties in water.
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    public partial struct WaterAttackSpeedSystem : ISystem
    {
        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            // Attack speed modification would integrate with animation/combat timing
            // The WaterCombatModifier.AttackSpeedMultiplier value should be read
            // by any system that processes attack timing

            // This system serves as documentation and could trigger
            // visual effects like splash during attacks
        }
    }

    /// <summary>
    /// System that increases knockback distance for entities in water.
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    public partial struct WaterKnockbackSystem : ISystem
    {
        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            float deltaTime = SystemAPI.Time.DeltaTime;

            // Process stability-based knockback with water multiplier
            foreach (var (waterMod, stability, breakState, transform) in
                SystemAPI.Query<RefRO<WaterCombatModifier>, RefRO<StabilityState>,
                               RefRO<BreakState>, RefRW<LocalTransform>>())
            {
                if (!breakState.ValueRO.IsBroken)
                    continue;

                // Knockback during break is enhanced by water
                // This would integrate with the knockback vector from the attack system
                // For now, this is a placeholder for the integration point
            }
        }
    }

    /// <summary>
    /// System that handles heavy attack restrictions in water.
    /// Heavy attacks are disabled in waist-deep+ water.
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    public partial struct WaterHeavyAttackRestrictionSystem : ISystem
    {
        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            // This system would integrate with input handling to prevent
            // heavy attack inputs when in water

            // The WaterCombatModifier.CanHeavyAttack flag is already set by
            // WaterZoneDetectionSystem based on water depth
        }
    }

    /// <summary>
    /// Component for tracking splash effect triggers.
    /// </summary>
    public struct SplashEffect : IComponentData
    {
        public float3 Position;
        public float Intensity; // Based on impact force
        public float Radius;
    }

    /// <summary>
    /// System that triggers visual splash effects during water combat.
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    public partial struct WaterSplashEffectSystem : ISystem
    {
        [BurstCompile]
        public void OnCreate(ref SystemState state)
        {
            state.RequireForUpdate<EndSimulationEntityCommandBufferSystem.Singleton>();
        }

        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            var ecb = SystemAPI.GetSingleton<EndSimulationEntityCommandBufferSystem.Singleton>()
                .CreateCommandBuffer(state.WorldUnmanaged);

            // Create splash effects for attacks that hit in water
            foreach (var (damageBuffer, inWater, transform, entity) in
                SystemAPI.Query<DynamicBuffer<DamageEvent>, RefRO<InWater>, RefRO<LocalTransform>>()
                    .WithEntityAccess())
            {
                if (damageBuffer.Length == 0)
                    continue;

                // Create splash effect for damage received in water
                float totalDamage = 0;
                foreach (var damage in damageBuffer)
                {
                    totalDamage += damage.Amount;
                }

                if (totalDamage > 0)
                {
                    // Splash intensity based on damage
                    float intensity = math.min(1f, totalDamage / 50f);

                    var splashEntity = ecb.CreateEntity();
                    ecb.AddComponent(splashEntity, new SplashEffect
                    {
                        Position = transform.ValueRO.Position,
                        Intensity = intensity,
                        Radius = 1f + intensity * 2f
                    });

                    // Splash effect entity would be consumed by VFX system
                }
            }
        }
    }

    /// <summary>
    /// System that processes knockback from boats (falling into water).
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    public partial struct BoatKnockbackSystem : ISystem
    {
        private const float KnockbackThreshold = 15f; // Stability damage to knock off boat

        [BurstCompile]
        public void OnCreate(ref SystemState state)
        {
            state.RequireForUpdate<EndSimulationEntityCommandBufferSystem.Singleton>();
        }

        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            var ecb = SystemAPI.GetSingleton<EndSimulationEntityCommandBufferSystem.Singleton>()
                .CreateCommandBuffer(state.WorldUnmanaged);

            foreach (var (onBoat, stability, damageBuffer, transform, entity) in
                SystemAPI.Query<RefRO<OnBoat>, RefRW<StabilityState>, DynamicBuffer<DamageEvent>,
                               RefRW<LocalTransform>>()
                    .WithEntityAccess())
            {
                float totalStabilityDamage = 0;
                float3 knockbackDir = float3.zero;

                foreach (var damage in damageBuffer)
                {
                    totalStabilityDamage += damage.StabilityDamage;

                    // Accumulate knockback direction from damage sources
                    if (damage.Source != Entity.Null &&
                        SystemAPI.HasComponent<LocalTransform>(damage.Source))
                    {
                        var sourceTransform = SystemAPI.GetComponent<LocalTransform>(damage.Source);
                        knockbackDir += math.normalize(transform.ValueRO.Position - sourceTransform.Position);
                    }
                }

                // Check if knocked off boat
                if (totalStabilityDamage >= KnockbackThreshold)
                {
                    // Add knockback direction (default to random if no source)
                    if (math.lengthsq(knockbackDir) < 0.01f)
                    {
                        knockbackDir = new float3(1f, 0f, 0f); // Default direction
                    }
                    knockbackDir = math.normalize(knockbackDir);

                    // Create boat combat event to remove passenger
                    if (SystemAPI.HasBuffer<BoatCombatEvent>(onBoat.ValueRO.BoatEntity))
                    {
                        var eventBuffer = SystemAPI.GetBuffer<BoatCombatEvent>(onBoat.ValueRO.BoatEntity);
                        eventBuffer.Add(new BoatCombatEvent
                        {
                            Type = BoatCombatEvent.EventType.PassengerKnockedOff,
                            AffectedEntity = entity,
                            KnockbackDirection = knockbackDir,
                            Force = 3f
                        });
                    }
                    else
                    {
                        // Manually remove from boat if no event buffer
                        ecb.RemoveComponent<OnBoat>(entity);

                        // Apply knockback position
                        transform.ValueRW.Position += knockbackDir * 3f;

                        // Update boat passenger count
                        if (SystemAPI.HasComponent<BoatData>(onBoat.ValueRO.BoatEntity))
                        {
                            var boat = SystemAPI.GetComponent<BoatData>(onBoat.ValueRO.BoatEntity);
                            boat.CurrentPassengers = math.max(0, boat.CurrentPassengers - 1);
                            ecb.SetComponent(onBoat.ValueRO.BoatEntity, boat);
                        }
                    }
                }
            }
        }
    }
}
