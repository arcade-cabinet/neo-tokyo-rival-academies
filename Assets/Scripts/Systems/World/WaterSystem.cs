using Unity.Burst;
using Unity.Collections;
using Unity.Entities;
using Unity.Mathematics;
using Unity.Transforms;
using NeoTokyo.Components.World;
using NeoTokyo.Components.Combat;
using NeoTokyo.Components.Stats;
using NeoTokyo.Components.Navigation;

namespace NeoTokyo.Systems.World
{
    /// <summary>
    /// System that detects when entities enter/exit water zones
    /// and manages water interaction state.
    /// Equivalent to Flooded World mechanics from Golden Record.
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    public partial struct WaterZoneDetectionSystem : ISystem
    {
        [BurstCompile]
        public void OnCreate(ref SystemState state)
        {
            state.RequireForUpdate<WaterZone>();
            state.RequireForUpdate<EndSimulationEntityCommandBufferSystem.Singleton>();
        }

        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            var ecb = SystemAPI.GetSingleton<EndSimulationEntityCommandBufferSystem.Singleton>()
                .CreateCommandBuffer(state.WorldUnmanaged);

            // Build lookup of water zones by position (simplified spatial query)
            var waterZones = new NativeList<WaterZoneData>(64, Allocator.TempJob);

            foreach (var (zone, transform, entity) in
                SystemAPI.Query<RefRO<WaterZone>, RefRO<LocalTransform>>()
                    .WithEntityAccess())
            {
                waterZones.Add(new WaterZoneData
                {
                    Entity = entity,
                    Position = transform.ValueRO.Position,
                    Zone = zone.ValueRO,
                    Radius = 1.5f // Hex tile radius approximation
                });
            }

            // Also check HexTile water tiles
            foreach (var (hexTile, transform, entity) in
                SystemAPI.Query<RefRO<HexTile>, RefRO<LocalTransform>>()
                    .WithEntityAccess())
            {
                if (hexTile.ValueRO.Type == TileType.Water)
                {
                    waterZones.Add(new WaterZoneData
                    {
                        Entity = entity,
                        Position = transform.ValueRO.Position,
                        Zone = WaterZone.DeepWater(),
                        Radius = 1f
                    });
                }
                else if (hexTile.ValueRO.Type == TileType.Shallow)
                {
                    waterZones.Add(new WaterZoneData
                    {
                        Entity = entity,
                        Position = transform.ValueRO.Position,
                        Zone = WaterZone.Default,
                        Radius = 1f
                    });
                }
            }

            // Check entities that can enter water (have transform, not already handled)
            foreach (var (transform, entity) in
                SystemAPI.Query<RefRO<LocalTransform>>()
                    .WithNone<WaterZone, HexTile, BoatData, OnBoat>()
                    .WithEntityAccess())
            {
                float3 entityPos = transform.ValueRO.Position;
                bool inWater = false;
                WaterZoneData closestZone = default;
                float closestDist = float.MaxValue;

                // Find if entity is in any water zone
                for (int i = 0; i < waterZones.Length; i++)
                {
                    float dist = math.distance(entityPos.xz, waterZones[i].Position.xz);
                    if (dist < waterZones[i].Radius && dist < closestDist)
                    {
                        closestDist = dist;
                        closestZone = waterZones[i];
                        inWater = true;
                    }
                }

                bool hasInWater = SystemAPI.HasComponent<InWater>(entity);

                if (inWater && !hasInWater)
                {
                    // Entity entered water - add InWater component
                    ecb.AddComponent(entity, InWater.Create(closestZone.Zone.Depth, closestZone.Entity));
                    ecb.AddComponent(entity, MovementModifier.ForWaterDepth(closestZone.Zone.Depth));
                    ecb.AddComponent(entity, WaterCombatModifier.ForDepth(closestZone.Zone.Depth));

                    // Add diving state if submerged
                    if (closestZone.Zone.Depth == WaterDepth.Submerged)
                    {
                        ecb.AddComponent(entity, DivingState.Default);
                    }
                }
                else if (!inWater && hasInWater)
                {
                    // Entity exited water - remove water components
                    ecb.RemoveComponent<InWater>(entity);
                    ecb.RemoveComponent<MovementModifier>(entity);
                    ecb.RemoveComponent<WaterCombatModifier>(entity);

                    if (SystemAPI.HasComponent<DivingState>(entity))
                    {
                        ecb.RemoveComponent<DivingState>(entity);
                    }
                }
                else if (inWater && hasInWater)
                {
                    // Update water depth if changed
                    var currentInWater = SystemAPI.GetComponent<InWater>(entity);
                    if (currentInWater.CurrentDepth != closestZone.Zone.Depth)
                    {
                        ecb.SetComponent(entity, InWater.Create(closestZone.Zone.Depth, closestZone.Entity));
                        ecb.SetComponent(entity, MovementModifier.ForWaterDepth(closestZone.Zone.Depth));
                        ecb.SetComponent(entity, WaterCombatModifier.ForDepth(closestZone.Zone.Depth));

                        // Handle diving state transitions
                        bool wasDiving = currentInWater.CurrentDepth == WaterDepth.Submerged;
                        bool isDiving = closestZone.Zone.Depth == WaterDepth.Submerged;

                        if (isDiving && !wasDiving)
                        {
                            ecb.AddComponent(entity, DivingState.Default);
                        }
                        else if (!isDiving && wasDiving)
                        {
                            ecb.RemoveComponent<DivingState>(entity);
                        }
                    }
                }
            }

            waterZones.Dispose();
        }

        private struct WaterZoneData
        {
            public Entity Entity;
            public float3 Position;
            public WaterZone Zone;
            public float Radius;
        }
    }

    /// <summary>
    /// System that processes water current effects on entities.
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateAfter(typeof(WaterZoneDetectionSystem))]
    public partial struct WaterCurrentSystem : ISystem
    {
        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            float deltaTime = SystemAPI.Time.DeltaTime;
            var waterZoneLookup = SystemAPI.GetComponentLookup<WaterZone>(true);

            foreach (var (inWater, modifier, transform) in
                SystemAPI.Query<RefRO<InWater>, RefRW<MovementModifier>, RefRW<LocalTransform>>())
            {
                if (inWater.ValueRO.WaterZoneEntity == Entity.Null)
                    continue;

                if (!waterZoneLookup.HasComponent(inWater.ValueRO.WaterZoneEntity))
                    continue;

                var zone = waterZoneLookup[inWater.ValueRO.WaterZoneEntity];

                if (zone.CurrentStrength > 0)
                {
                    // Apply current force to movement modifier
                    modifier.ValueRW.CurrentForce = zone.CurrentDirection * zone.CurrentStrength;

                    // Also directly move entity by current
                    float3 currentMovement = zone.CurrentDirection * zone.CurrentStrength * deltaTime;
                    transform.ValueRW.Position += currentMovement;
                }
                else
                {
                    modifier.ValueRW.CurrentForce = float3.zero;
                }
            }
        }
    }

    /// <summary>
    /// System that manages oxygen consumption and drowning for diving entities.
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateAfter(typeof(WaterZoneDetectionSystem))]
    public partial struct DivingSystem : ISystem
    {
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

            foreach (var (diving, inWater, entity) in
                SystemAPI.Query<RefRW<DivingState>, RefRW<InWater>>()
                    .WithEntityAccess())
            {
                // Only consume oxygen when submerged
                if (inWater.ValueRO.CurrentDepth != WaterDepth.Submerged)
                {
                    // Surface - restore oxygen
                    diving.ValueRW.OxygenRemaining = math.min(
                        diving.ValueRO.MaxOxygen,
                        diving.ValueRO.OxygenRemaining + deltaTime * 5f // Recover 5 seconds of oxygen per second
                    );
                    diving.ValueRW.IsDrowning = false;
                    inWater.ValueRW.SubmersionTime = 0f;
                    continue;
                }

                // Consume oxygen
                float consumption = deltaTime * diving.ValueRO.OxygenConsumptionRate * diving.ValueRO.DepthPressure;
                diving.ValueRW.OxygenRemaining = math.max(0f, diving.ValueRO.OxygenRemaining - consumption);
                inWater.ValueRW.SubmersionTime += deltaTime;

                // Check for drowning
                if (diving.ValueRO.IsOutOfOxygen && !diving.ValueRO.IsDrowning)
                {
                    diving.ValueRW.IsDrowning = true;
                }
            }
        }
    }

    /// <summary>
    /// System that applies drowning damage to entities out of oxygen.
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateAfter(typeof(DivingSystem))]
    public partial struct DrowningDamageSystem : ISystem
    {
        private const float DrowningDamageInterval = 1f;
        private const int DrowningDamagePerTick = 10;

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

            foreach (var (diving, inWater, damageBuffer, entity) in
                SystemAPI.Query<RefRO<DivingState>, RefRW<InWater>, DynamicBuffer<DamageEvent>>()
                    .WithEntityAccess())
            {
                if (!diving.ValueRO.IsDrowning)
                    continue;

                // Apply damage every interval based on submersion time
                float timeSinceLastDamage = inWater.ValueRO.SubmersionTime % DrowningDamageInterval;

                // Check if we crossed a damage tick
                float previousTime = inWater.ValueRO.SubmersionTime - SystemAPI.Time.DeltaTime;
                int previousTicks = (int)(previousTime / DrowningDamageInterval);
                int currentTicks = (int)(inWater.ValueRO.SubmersionTime / DrowningDamageInterval);

                if (currentTicks > previousTicks)
                {
                    damageBuffer.Add(new DamageEvent
                    {
                        Source = Entity.Null, // Environmental damage
                        Amount = DrowningDamagePerTick,
                        IsCritical = false,
                        StabilityDamage = 0f
                    });
                }
            }
        }
    }

    /// <summary>
    /// System that applies hazard damage from toxic/electric water zones.
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateAfter(typeof(WaterZoneDetectionSystem))]
    public partial struct WaterHazardSystem : ISystem
    {
        [BurstCompile]
        public void OnCreate(ref SystemState state)
        {
            state.RequireForUpdate<EndSimulationEntityCommandBufferSystem.Singleton>();
        }

        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            float deltaTime = SystemAPI.Time.DeltaTime;
            var waterZoneLookup = SystemAPI.GetComponentLookup<WaterZone>(true);
            var ecb = SystemAPI.GetSingleton<EndSimulationEntityCommandBufferSystem.Singleton>()
                .CreateCommandBuffer(state.WorldUnmanaged);

            foreach (var (inWater, damageBuffer, entity) in
                SystemAPI.Query<RefRW<InWater>, DynamicBuffer<DamageEvent>>()
                    .WithEntityAccess())
            {
                if (inWater.ValueRO.WaterZoneEntity == Entity.Null)
                    continue;

                if (!waterZoneLookup.HasComponent(inWater.ValueRO.WaterZoneEntity))
                    continue;

                var zone = waterZoneLookup[inWater.ValueRO.WaterZoneEntity];

                if (!zone.IsHazardous)
                    continue;

                // Accumulate hazard damage
                inWater.ValueRW.AccumulatedHazardDamage += zone.HazardDamageRate * deltaTime;

                // Apply damage when threshold reached (1 point at a time for smoothness)
                while (inWater.ValueRO.AccumulatedHazardDamage >= 1f)
                {
                    damageBuffer.Add(new DamageEvent
                    {
                        Source = inWater.ValueRO.WaterZoneEntity,
                        Amount = 1,
                        IsCritical = false,
                        StabilityDamage = zone.HazardType == WaterHazardType.Electric ? 5f : 0f
                    });
                    inWater.ValueRW.AccumulatedHazardDamage -= 1f;
                }
            }
        }
    }

    /// <summary>
    /// System that damages water-averse entities when in water.
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateAfter(typeof(WaterZoneDetectionSystem))]
    public partial struct WaterAverseSystem : ISystem
    {
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

            foreach (var (averse, inWater, damageBuffer, entity) in
                SystemAPI.Query<RefRO<WaterAverse>, RefRO<InWater>, DynamicBuffer<DamageEvent>>()
                    .WithEntityAccess())
            {
                // Check if water depth exceeds tolerance
                if ((byte)inWater.ValueRO.CurrentDepth <= (byte)averse.ValueRO.MaxTolerance)
                    continue;

                // Apply damage over time
                int damage = (int)math.ceil(averse.ValueRO.DamagePerSecond * deltaTime);
                if (damage > 0)
                {
                    damageBuffer.Add(new DamageEvent
                    {
                        Source = Entity.Null,
                        Amount = damage,
                        IsCritical = false,
                        StabilityDamage = 0f
                    });
                }
            }
        }
    }

    /// <summary>
    /// System that applies movement modifiers to navigation agents.
    /// Integrates with NavAgentMovementSystem.
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateBefore(typeof(NeoTokyo.Systems.Navigation.NavAgentMovementSystem))]
    public partial struct WaterMovementModifierSystem : ISystem
    {
        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            foreach (var (modifier, agent) in
                SystemAPI.Query<RefRO<MovementModifier>, RefRW<NavAgent>>())
            {
                // Store original speed if not already stored (handled by state)
                // Apply speed modifier to nav agent
                // Note: This assumes base speed is stored elsewhere or this is called each frame
                // In a full implementation, we'd store base speed and modify a "current" speed

                // For now, we assume the NavAgent.Speed is the effective speed
                // and other systems should read MovementModifier to get actual speed
            }
        }
    }

    /// <summary>
    /// System that handles swimming state transitions.
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateAfter(typeof(WaterZoneDetectionSystem))]
    public partial struct SwimmingStateSystem : ISystem
    {
        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            foreach (var (inWater, charState) in
                SystemAPI.Query<RefRW<InWater>, RefRW<CharacterStateComponent>>())
            {
                bool shouldSwim = inWater.ValueRO.CurrentDepth >= WaterDepth.Deep;

                if (shouldSwim != inWater.ValueRO.IsSwimming)
                {
                    inWater.ValueRW.IsSwimming = shouldSwim;

                    // Could trigger swimming animation state here
                    // For now, we just track the state
                }

                bool shouldDive = inWater.ValueRO.CurrentDepth == WaterDepth.Submerged;
                if (shouldDive != inWater.ValueRO.IsDiving)
                {
                    inWater.ValueRW.IsDiving = shouldDive;
                }
            }
        }
    }
}
