using Unity.Burst;
using Unity.Collections;
using Unity.Entities;
using Unity.Mathematics;
using Unity.Transforms;
using NeoTokyo.Components.Combat;
using NeoTokyo.Components.Core;
using NeoTokyo.Components.Stats;

namespace NeoTokyo.Systems.Combat
{
    /// <summary>
    /// Environmental hazard processing system.
    /// Handles periodic damage, knockback, and hazard lifecycle.
    /// Equivalent to TypeScript: HazardManager in flooded world integration.
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateAfter(typeof(ArenaSystem))]
    [UpdateBefore(typeof(CombatSystem))]
    public partial struct HazardSystem : ISystem
    {
        [BurstCompile]
        public void OnCreate(ref SystemState state)
        {
            state.RequireForUpdate<ArenaData>();
            state.RequireForUpdate<EndSimulationEntityCommandBufferSystem.Singleton>();
        }

        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            float dt = SystemAPI.Time.DeltaTime;
            float time = (float)SystemAPI.Time.ElapsedTime;
            var ecb = SystemAPI.GetSingleton<EndSimulationEntityCommandBufferSystem.Singleton>()
                .CreateCommandBuffer(state.WorldUnmanaged);

            // Update hazard durations and deactivate expired hazards
            foreach (var (arena, hazards, arenaEntity) in
                SystemAPI.Query<RefRO<ArenaData>, DynamicBuffer<ArenaHazard>>()
                    .WithEntityAccess())
            {
                for (int i = 0; i < hazards.Length; i++)
                {
                    var hazard = hazards[i];

                    // Skip permanent or inactive hazards
                    if (!hazard.IsActive || hazard.Duration <= 0f)
                        continue;

                    // Update remaining duration
                    hazard.RemainingDuration -= dt;

                    if (hazard.RemainingDuration <= 0f)
                    {
                        hazard.IsActive = false;
                        hazard.RemainingDuration = 0f;
                    }

                    hazards[i] = hazard;
                }
            }

            // Process entities in hazard zones
            foreach (var (transform, health, tickState, inArena, damageBuffer, entity) in
                SystemAPI.Query<RefRO<LocalTransform>, RefRW<Health>, RefRW<HazardTickState>,
                    RefRO<InArena>, DynamicBuffer<DamageEvent>>()
                    .WithEntityAccess())
            {
                if (!SystemAPI.HasBuffer<ArenaHazard>(inArena.ValueRO.ArenaEntity))
                    continue;

                var hazards = SystemAPI.GetBuffer<ArenaHazard>(inArena.ValueRO.ArenaEntity);
                float3 entityPos = transform.ValueRO.Position;

                bool foundHazard = false;
                HazardType activeHazardType = HazardType.Fall;
                float damage = 0f;
                float tickInterval = 1f;
                float stabilityDamage = 0f;
                float3 knockbackForce = float3.zero;

                // Check each hazard in the arena
                foreach (var hazard in hazards)
                {
                    if (!hazard.IsActive)
                        continue;

                    if (hazard.ContainsPosition(entityPos))
                    {
                        foundHazard = true;
                        activeHazardType = hazard.Type;
                        damage = hazard.Damage;
                        tickInterval = hazard.TickInterval;
                        stabilityDamage = hazard.StabilityDamage;
                        knockbackForce = hazard.KnockbackForce;
                        break;
                    }
                }

                // Update hazard tick state
                if (foundHazard)
                {
                    tickState.ValueRW.IsInHazard = true;
                    tickState.ValueRW.CurrentHazardType = activeHazardType;

                    // Only process ticking hazards (water, electric, fire, toxic)
                    if (tickInterval > 0f)
                    {
                        tickState.ValueRW.TimeSinceLastTick += dt;

                        if (tickState.ValueRO.TimeSinceLastTick >= tickInterval)
                        {
                            // Apply damage tick
                            damageBuffer.Add(new DamageEvent
                            {
                                Source = Entity.Null, // Environmental damage
                                Amount = (int)damage,
                                IsCritical = false,
                                StabilityDamage = stabilityDamage
                            });

                            // Reset tick timer
                            tickState.ValueRW.TimeSinceLastTick = 0f;

                            // Create hazard contact event for visual feedback
                            if (SystemAPI.HasBuffer<HazardContactEvent>(entity))
                            {
                                var contacts = SystemAPI.GetBuffer<HazardContactEvent>(entity);
                                contacts.Add(new HazardContactEvent
                                {
                                    AffectedEntity = entity,
                                    HazardType = activeHazardType,
                                    ContactPosition = entityPos,
                                    Damage = damage,
                                    LastTickTime = time
                                });
                            }
                        }
                    }

                    // Apply knockback if applicable
                    if (math.lengthsq(knockbackForce) > 0.01f)
                    {
                        if (SystemAPI.HasComponent<Velocity>(entity))
                        {
                            var velocity = SystemAPI.GetComponent<Velocity>(entity);
                            velocity.Value += knockbackForce * dt;
                            ecb.SetComponent(entity, velocity);
                        }
                    }
                }
                else
                {
                    // Entity left hazard zone
                    if (tickState.ValueRO.IsInHazard)
                    {
                        tickState.ValueRW.IsInHazard = false;
                        tickState.ValueRW.TimeSinceLastTick = 0f;
                    }
                }
            }

        }
    }

    /// <summary>
    /// Handles knockback into hazards (ring-out mechanics).
    /// Checks if knockback would push entity into hazard zone.
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateAfter(typeof(BreakSystem))]
    public partial struct KnockbackHazardSystem : ISystem
    {
        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            float dt = SystemAPI.Time.DeltaTime;
            var ecb = new EntityCommandBuffer(Allocator.TempJob);

            // Process entities that are being knocked back
            foreach (var (transform, velocity, modifier, inArena, entity) in
                SystemAPI.Query<RefRW<LocalTransform>, RefRW<Velocity>, RefRO<ArenaModifier>, RefRO<InArena>>()
                    .WithEntityAccess())
            {
                // Skip if not moving significantly
                if (math.lengthsq(velocity.ValueRO.Value) < 0.1f)
                    continue;

                // Apply knockback modifier from arena
                float3 modifiedVelocity = velocity.ValueRO.Value * modifier.ValueRO.KnockbackMod;

                // Predict future position
                float3 futurePos = transform.ValueRO.Position + modifiedVelocity * dt;

                // Check if future position is in a hazard
                if (SystemAPI.HasBuffer<ArenaHazard>(inArena.ValueRO.ArenaEntity))
                {
                    var hazards = SystemAPI.GetBuffer<ArenaHazard>(inArena.ValueRO.ArenaEntity);

                    foreach (var hazard in hazards)
                    {
                        if (!hazard.IsActive)
                            continue;

                        if (hazard.ContainsPosition(futurePos))
                        {
                            // Entity will be knocked into hazard
                            // For fall hazards, apply immediate effect
                            if (hazard.Type == HazardType.Fall)
                            {
                                // Apply modified knockback velocity
                                velocity.ValueRW.Value = modifiedVelocity;

                                // Create hazard contact event
                                if (SystemAPI.HasBuffer<HazardContactEvent>(entity))
                                {
                                    var contacts = SystemAPI.GetBuffer<HazardContactEvent>(entity);
                                    contacts.Add(new HazardContactEvent
                                    {
                                        AffectedEntity = entity,
                                        HazardType = HazardType.Fall,
                                        ContactPosition = futurePos,
                                        Damage = hazard.Damage,
                                        LastTickTime = (float)SystemAPI.Time.ElapsedTime
                                    });
                                }
                            }
                            break;
                        }
                    }
                }
            }

            ecb.Playback(state.EntityManager);
            ecb.Dispose();
        }
    }

    /// <summary>
    /// Water-specific hazard effects.
    /// Handles movement penalties and special water mechanics.
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    public partial struct WaterHazardSystem : ISystem
    {
        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            float dt = SystemAPI.Time.DeltaTime;

            // Apply water depth movement penalties
            foreach (var (transform, velocity, tickState, inArena, modifier, entity) in
                SystemAPI.Query<RefRO<LocalTransform>, RefRW<Velocity>, RefRO<HazardTickState>,
                    RefRO<InArena>, RefRO<ArenaModifier>>()
                    .WithEntityAccess())
            {
                // Check if in water hazard
                if (!tickState.ValueRO.IsInHazard)
                    continue;

                if (tickState.ValueRO.CurrentHazardType != HazardType.Water &&
                    tickState.ValueRO.CurrentHazardType != HazardType.DeepWater)
                    continue;

                // Apply water resistance
                float waterResistance = 0.95f; // Damping factor per frame

                if (tickState.ValueRO.CurrentHazardType == HazardType.DeepWater)
                {
                    waterResistance = 0.9f; // Stronger damping in deep water
                }

                // Apply movement speed modifier
                velocity.ValueRW.Value *= waterResistance;

                // Check for flying entities (exempt from water effects)
                if (SystemAPI.HasComponent<FlyingTag>(entity))
                {
                    continue;
                }

                // Apply vertical movement restriction in water
                if (inArena.ValueRO.Type == ArenaType.FloodedInterior ||
                    inArena.ValueRO.Type == ArenaType.OpenWater)
                {
                    // Limit jump height in water
                    if (velocity.ValueRO.Value.y > 2f)
                    {
                        var v = velocity.ValueRO.Value;
                        v.y = 2f;
                        velocity.ValueRW.Value = v;
                    }
                }
            }
        }
    }

    /// <summary>
    /// Electric hazard special effects.
    /// Periodic stun and chain lightning mechanics.
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateAfter(typeof(HazardSystem))]
    public partial struct ElectricHazardSystem : ISystem
    {
        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            var ecb = new EntityCommandBuffer(Allocator.TempJob);

            // Apply electric stun effects
            foreach (var (tickState, charState, entity) in
                SystemAPI.Query<RefRO<HazardTickState>, RefRW<CharacterStateComponent>>()
                    .WithEntityAccess())
            {
                if (!tickState.ValueRO.IsInHazard)
                    continue;

                if (tickState.ValueRO.CurrentHazardType != HazardType.Electric)
                    continue;

                // 20% chance to stun on each tick
                uint seed = (uint)(SystemAPI.Time.ElapsedTime * 1000) + (uint)entity.Index;
                var random = new Unity.Mathematics.Random(seed);

                if (random.NextFloat() < 0.2f)
                {
                    // Apply short stun
                    if (charState.ValueRO.Current != CharacterState.Stunned &&
                        charState.ValueRO.Current != CharacterState.Dead)
                    {
                        charState.ValueRW.Previous = charState.ValueRO.Current;
                        charState.ValueRW.Current = CharacterState.Staggered;
                        charState.ValueRW.StateTime = 0f;
                    }
                }
            }

            // Check for electric hazard chain effects (water conducts electricity)
            foreach (var (transform, inArena, entity) in
                SystemAPI.Query<RefRO<LocalTransform>, RefRO<InArena>>()
                    .WithEntityAccess())
            {
                // Skip non-flooded arenas
                if (inArena.ValueRO.Type != ArenaType.FloodedInterior &&
                    inArena.ValueRO.Type != ArenaType.OpenWater)
                    continue;

                if (!SystemAPI.HasBuffer<ArenaHazard>(inArena.ValueRO.ArenaEntity))
                    continue;

                var hazards = SystemAPI.GetBuffer<ArenaHazard>(inArena.ValueRO.ArenaEntity);

                // Check for nearby electric hazards (water conducts)
                foreach (var hazard in hazards)
                {
                    if (!hazard.IsActive || hazard.Type != HazardType.Electric)
                        continue;

                    // Extended range in water (50% bonus)
                    float effectiveRadius = hazard.Radius * 1.5f;
                    float distSq = math.distancesq(transform.ValueRO.Position, hazard.Position);

                    if (distSq <= effectiveRadius * effectiveRadius)
                    {
                        // Apply reduced damage from conducted electricity
                        if (SystemAPI.HasBuffer<DamageEvent>(entity))
                        {
                            var damageBuffer = SystemAPI.GetBuffer<DamageEvent>(entity);

                            // Only apply if not directly in hazard zone
                            if (distSq > hazard.Radius * hazard.Radius)
                            {
                                damageBuffer.Add(new DamageEvent
                                {
                                    Source = Entity.Null,
                                    Amount = (int)(hazard.Damage * 0.5f), // Half damage from conduction
                                    IsCritical = false,
                                    StabilityDamage = hazard.StabilityDamage * 0.3f
                                });
                            }
                        }
                    }
                }
            }

            ecb.Playback(state.EntityManager);
            ecb.Dispose();
        }
    }

    /// <summary>
    /// Hazard visual feedback trigger system.
    /// Sends events for VFX/SFX when hazards affect entities.
    /// </summary>
    [UpdateInGroup(typeof(LateSimulationSystemGroup))]
    public partial class HazardFeedbackSystem : SystemBase
    {
        protected override void OnUpdate()
        {
            var ecb = new EntityCommandBuffer(Allocator.TempJob);

            // Process and cleanup hazard contact events
            foreach (var (contacts, entity) in
                SystemAPI.Query<DynamicBuffer<HazardContactEvent>>()
                    .WithEntityAccess())
            {
                // Events are processed here - in a real implementation,
                // this would trigger visual/audio feedback systems

                // Clear processed events
                contacts.Clear();
            }

            ecb.Playback(EntityManager);
            ecb.Dispose();
        }
    }

    /// <summary>
    /// Helper methods for creating and managing hazards at runtime.
    /// </summary>
    public static class HazardHelpers
    {
        /// <summary>
        /// Add a temporary hazard to an arena.
        /// </summary>
        public static void AddTemporaryHazard(EntityManager em, Entity arenaEntity,
            HazardType type, float3 position, float radius, float damage, float duration)
        {
            if (!em.HasBuffer<ArenaHazard>(arenaEntity))
            {
                em.AddBuffer<ArenaHazard>(arenaEntity);
            }

            var hazards = em.GetBuffer<ArenaHazard>(arenaEntity);

            var hazard = new ArenaHazard
            {
                Type = type,
                Position = position,
                Radius = radius,
                Damage = damage,
                TickInterval = GetDefaultTickInterval(type),
                Duration = duration,
                RemainingDuration = duration,
                IsActive = true,
                StabilityDamage = damage * GetStabilityDamageRatio(type),
                KnockbackForce = float3.zero
            };

            hazards.Add(hazard);
        }

        /// <summary>
        /// Add a knockback hazard (pushes entities).
        /// </summary>
        public static void AddKnockbackHazard(EntityManager em, Entity arenaEntity,
            float3 position, float radius, float3 knockbackDirection, float knockbackStrength, float duration)
        {
            if (!em.HasBuffer<ArenaHazard>(arenaEntity))
            {
                em.AddBuffer<ArenaHazard>(arenaEntity);
            }

            var hazards = em.GetBuffer<ArenaHazard>(arenaEntity);

            var hazard = new ArenaHazard
            {
                Type = HazardType.Debris,
                Position = position,
                Radius = radius,
                Damage = 0f,
                TickInterval = 0.1f,
                Duration = duration,
                RemainingDuration = duration,
                IsActive = true,
                StabilityDamage = 5f,
                KnockbackForce = math.normalizesafe(knockbackDirection) * knockbackStrength
            };

            hazards.Add(hazard);
        }

        /// <summary>
        /// Remove all hazards of a specific type from an arena.
        /// </summary>
        public static void RemoveHazardsByType(EntityManager em, Entity arenaEntity, HazardType type)
        {
            if (!em.HasBuffer<ArenaHazard>(arenaEntity))
                return;

            var hazards = em.GetBuffer<ArenaHazard>(arenaEntity);

            for (int i = hazards.Length - 1; i >= 0; i--)
            {
                if (hazards[i].Type == type)
                {
                    hazards.RemoveAt(i);
                }
            }
        }

        /// <summary>
        /// Deactivate all hazards in an arena.
        /// </summary>
        public static void DeactivateAllHazards(EntityManager em, Entity arenaEntity)
        {
            if (!em.HasBuffer<ArenaHazard>(arenaEntity))
                return;

            var hazards = em.GetBuffer<ArenaHazard>(arenaEntity);

            for (int i = 0; i < hazards.Length; i++)
            {
                var hazard = hazards[i];
                hazard.IsActive = false;
                hazards[i] = hazard;
            }
        }

        private static float GetDefaultTickInterval(HazardType type)
        {
            switch (type)
            {
                case HazardType.Electric:
                    return 0.5f;
                case HazardType.Fire:
                    return 0.3f;
                case HazardType.Toxic:
                    return 1f;
                case HazardType.Water:
                    return 1.5f;
                case HazardType.DeepWater:
                    return 2f;
                default:
                    return 0f;
            }
        }

        private static float GetStabilityDamageRatio(HazardType type)
        {
            switch (type)
            {
                case HazardType.Electric:
                    return 0.3f;
                case HazardType.Fire:
                    return 0.1f;
                case HazardType.Debris:
                    return 0.5f;
                case HazardType.Fall:
                    return 0.5f;
                default:
                    return 0f;
            }
        }
    }
}
