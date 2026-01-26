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
    /// Arena management system.
    /// Tracks active combat arena, applies modifiers, handles boundaries.
    /// Equivalent to TypeScript: ArenaManager in flooded world integration.
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateBefore(typeof(CombatSystem))]
    public partial struct ArenaSystem : ISystem
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

            // Update arena active time
            foreach (var (arena, entity) in
                SystemAPI.Query<RefRW<ArenaData>>()
                    .WithEntityAccess())
            {
                arena.ValueRW.ActiveTime += dt;
            }

            // Process entities entering/exiting arenas
            foreach (var (transform, inArena, entity) in
                SystemAPI.Query<RefRO<LocalTransform>, RefRW<InArena>>()
                    .WithEntityAccess())
            {
                // Update time in arena
                inArena.ValueRW.TimeInArena += dt;

                // Verify entity is still in arena bounds
                if (SystemAPI.HasComponent<ArenaData>(inArena.ValueRO.ArenaEntity))
                {
                    var arena = SystemAPI.GetComponent<ArenaData>(inArena.ValueRO.ArenaEntity);
                    if (!arena.ContainsPosition(transform.ValueRO.Position))
                    {
                        // Entity has left the arena - handle boundary exit
                        HandleArenaExit(ref ecb, entity, inArena.ValueRO.ArenaEntity, transform.ValueRO.Position);
                    }
                }
            }

            // Check combatants without InArena component for arena entry
            foreach (var (transform, entity) in
                SystemAPI.Query<RefRO<LocalTransform>>()
                    .WithAll<CombatantTag>()
                    .WithNone<InArena>()
                    .WithEntityAccess())
            {
                // Check if entity is inside any arena
                foreach (var (arena, arenaEntity) in
                    SystemAPI.Query<RefRO<ArenaData>>()
                        .WithEntityAccess())
                {
                    if (arena.ValueRO.ContainsPosition(transform.ValueRO.Position))
                    {
                        // Entity has entered an arena
                        HandleArenaEntry(ref ecb, entity, arenaEntity, arena.ValueRO, transform.ValueRO.Position);
                        break;
                    }
                }
            }

            // Update boundary warnings
            foreach (var (transform, inArena, warning, entity) in
                SystemAPI.Query<RefRO<LocalTransform>, RefRO<InArena>, RefRW<BoundaryWarning>>()
                    .WithEntityAccess())
            {
                if (SystemAPI.HasComponent<ArenaData>(inArena.ValueRO.ArenaEntity))
                {
                    var arena = SystemAPI.GetComponent<ArenaData>(inArena.ValueRO.ArenaEntity);
                    float distToBoundary = arena.DistanceToBoundary(transform.ValueRO.Position);

                    warning.ValueRW.CurrentDistance = distToBoundary;
                    warning.ValueRW.IsWarningActive = distToBoundary <= warning.ValueRO.WarningDistance;
                    warning.ValueRW.DirectionToCenter = math.normalizesafe(arena.Center - transform.ValueRO.Position);
                }
            }

        }

        private void HandleArenaEntry(ref EntityCommandBuffer ecb, Entity entity, Entity arenaEntity, ArenaData arena, float3 position)
        {
            // Add InArena component
            ecb.AddComponent(entity, new InArena
            {
                ArenaEntity = arenaEntity,
                Type = arena.Type,
                TimeInArena = 0f,
                EntryPosition = position
            });

            // Add arena modifier based on type
            var modifier = GetModifierForArenaType(arena.Type);
            ecb.AddComponent(entity, modifier);

            // Add boundary warning component
            ecb.AddComponent(entity, new BoundaryWarning
            {
                WarningDistance = 2f,
                CurrentDistance = arena.DistanceToBoundary(position),
                IsWarningActive = false,
                DirectionToCenter = math.normalizesafe(arena.Center - position)
            });

            // Add hazard tick state for tracking damage timing
            ecb.AddComponent(entity, new HazardTickState
            {
                TimeSinceLastTick = 0f,
                CurrentHazardType = HazardType.Fall,
                IsInHazard = false
            });
        }

        private void HandleArenaExit(ref EntityCommandBuffer ecb, Entity entity, Entity arenaEntity, float3 position)
        {
            // Remove arena-related components
            ecb.RemoveComponent<InArena>(entity);
            ecb.RemoveComponent<ArenaModifier>(entity);
            ecb.RemoveComponent<BoundaryWarning>(entity);
            ecb.RemoveComponent<HazardTickState>(entity);
        }

        private ArenaModifier GetModifierForArenaType(ArenaType type)
        {
            switch (type)
            {
                case ArenaType.Bridge:
                    return ArenaModifier.Bridge;
                case ArenaType.Boat:
                    return ArenaModifier.Boat;
                case ArenaType.FloodedInterior:
                    return ArenaModifier.FloodedInterior;
                case ArenaType.OpenWater:
                    return ArenaModifier.OpenWater;
                case ArenaType.Rooftop:
                case ArenaType.Underground:
                case ArenaType.Shrine:
                default:
                    return ArenaModifier.Default;
            }
        }
    }

    /// <summary>
    /// Applies arena modifiers to combat calculations.
    /// Runs before damage calculation to modify stats.
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateBefore(typeof(CombatLogicSystem))]
    public partial struct ArenaModifierSystem : ISystem
    {
        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            // Apply arena modifiers to combat stats for entities in arenas
            // This modifies the effective stats used in damage calculations

            foreach (var (combatStats, modifier, entity) in
                SystemAPI.Query<RefRW<CombatStats>, RefRO<ArenaModifier>>()
                    .WithEntityAccess())
            {
                // Adjust critical chance based on arena
                combatStats.ValueRW.CriticalChance = math.clamp(
                    combatStats.ValueRO.CriticalChance + modifier.ValueRO.CriticalMod,
                    0f,
                    0.5f
                );
            }
        }
    }

    /// <summary>
    /// Handles rocking platform physics for boat arenas.
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    public partial struct RockingPlatformSystem : ISystem
    {
        [BurstCompile]
        public void OnCreate(ref SystemState state)
        {
            state.RequireForUpdate<RockingPlatform>();
        }

        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            float time = (float)SystemAPI.Time.ElapsedTime;
            float dt = SystemAPI.Time.DeltaTime;

            // Update rocking platforms
            foreach (var (rocking, transform, entity) in
                SystemAPI.Query<RefRW<RockingPlatform>, RefRW<LocalTransform>>()
                    .WithEntityAccess())
            {
                // Calculate current rock angle
                float targetAngle = math.sin((time * rocking.ValueRO.RockSpeed) + rocking.ValueRO.PhaseOffset)
                    * rocking.ValueRO.MaxRockAngle;

                rocking.ValueRW.RockAngle = targetAngle;

                // Apply rotation to platform
                quaternion rockRotation = quaternion.AxisAngle(rocking.ValueRO.RockAxis, targetAngle);
                transform.ValueRW.Rotation = rockRotation;
            }

            // Apply rocking effects to entities on boats
            foreach (var (transform, velocity, inArena, modifier, entity) in
                SystemAPI.Query<RefRW<LocalTransform>, RefRW<Velocity>, RefRO<InArena>, RefRO<ArenaModifier>>()
                    .WithEntityAccess())
            {
                if (inArena.ValueRO.Type != ArenaType.Boat)
                    continue;

                // Check if the arena has a rocking component
                if (!SystemAPI.HasComponent<RockingPlatform>(inArena.ValueRO.ArenaEntity))
                    continue;

                var rocking = SystemAPI.GetComponent<RockingPlatform>(inArena.ValueRO.ArenaEntity);

                if (rocking.AffectsMovement)
                {
                    // Add slope-based movement influence
                    float3 slope = rocking.GetSurfaceSlope(time);
                    float slopeInfluence = 2f; // Strength of slope effect

                    velocity.ValueRW.Value += slope * slopeInfluence * dt;
                }
            }
        }
    }

    /// <summary>
    /// Handles fall detection and respawn for arena boundaries.
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateAfter(typeof(ArenaSystem))]
    public partial struct FallDetectionSystem : ISystem
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
            float time = (float)SystemAPI.Time.ElapsedTime;

            // Check fall hazard zones
            foreach (var (transform, health, inArena, entity) in
                SystemAPI.Query<RefRO<LocalTransform>, RefRW<Health>, RefRO<InArena>>()
                    .WithEntityAccess())
            {
                if (!SystemAPI.HasComponent<ArenaData>(inArena.ValueRO.ArenaEntity))
                    continue;

                var arena = SystemAPI.GetComponent<ArenaData>(inArena.ValueRO.ArenaEntity);

                // Check if entity has fallen below arena
                if (arena.HasFallHazard)
                {
                    float arenaFloor = arena.Center.y - (arena.Size.y * 0.5f);

                    if (transform.ValueRO.Position.y < arenaFloor - 1f)
                    {
                        // Entity has fallen - check for fall hazard zones
                        if (SystemAPI.HasBuffer<ArenaHazard>(inArena.ValueRO.ArenaEntity))
                        {
                            var hazards = SystemAPI.GetBuffer<ArenaHazard>(inArena.ValueRO.ArenaEntity);

                            foreach (var hazard in hazards)
                            {
                                if (hazard.Type == HazardType.Fall && hazard.IsActive)
                                {
                                    // Apply fall damage
                                    health.ValueRW.Current = math.max(0, health.ValueRO.Current - (int)hazard.Damage);

                                    // Create fall event
                                    var fallEventEntity = ecb.CreateEntity();
                                    ecb.AddComponent(fallEventEntity, new FallEvent
                                    {
                                        FallenEntity = entity,
                                        ArenaEntity = inArena.ValueRO.ArenaEntity,
                                        FallPosition = transform.ValueRO.Position,
                                        Damage = hazard.Damage,
                                        IsLethal = health.ValueRO.Current <= 0
                                    });

                                    break;
                                }
                            }
                        }
                    }
                }
            }

            // Check rectangular fall hazard zones
            foreach (var (fallZone, entity) in
                SystemAPI.Query<RefRO<FallHazardZone>>()
                    .WithEntityAccess())
            {
                foreach (var (transform, health, respawnEntity) in
                    SystemAPI.Query<RefRW<LocalTransform>, RefRW<Health>>()
                        .WithAll<CombatantTag>()
                        .WithEntityAccess())
                {
                    if (fallZone.ValueRO.ContainsPosition(transform.ValueRO.Position))
                    {
                        if (fallZone.ValueRO.IsInstantKill)
                        {
                            health.ValueRW.Current = 0;
                        }
                        else
                        {
                            health.ValueRW.Current = math.max(0, health.ValueRO.Current - (int)fallZone.ValueRO.FallDamage);
                        }

                        // Respawn at safe location
                        transform.ValueRW.Position = fallZone.ValueRO.RespawnPosition;

                        // Grant invincibility after respawn
                        if (SystemAPI.HasComponent<InvincibilityState>(respawnEntity))
                        {
                            SystemAPI.SetComponent(respawnEntity, InvincibilityState.Create(fallZone.ValueRO.RespawnInvincibilityTime));
                        }
                    }
                }
            }

        }
    }

    /// <summary>
    /// Cleans up fall events after processing.
    /// </summary>
    [UpdateInGroup(typeof(LateSimulationSystemGroup))]
    public partial class FallEventCleanupSystem : SystemBase
    {
        protected override void OnCreate()
        {
            RequireForUpdate<EndSimulationEntityCommandBufferSystem.Singleton>();
        }

        protected override void OnUpdate()
        {
            var ecb = SystemAPI.GetSingleton<EndSimulationEntityCommandBufferSystem.Singleton>()
                .CreateCommandBuffer(World.Unmanaged);

            foreach (var (evt, entity) in
                SystemAPI.Query<RefRO<FallEvent>>()
                    .WithEntityAccess())
            {
                ecb.DestroyEntity(entity);
            }
        }
    }

    /// <summary>
    /// Arena spawner helper system for creating combat arenas.
    /// </summary>
    public static class ArenaSpawner
    {
        /// <summary>
        /// Spawn a rooftop arena.
        /// </summary>
        public static Entity SpawnRooftopArena(EntityManager em, float3 center, float3 size)
        {
            var entity = em.CreateEntity();

            em.AddComponentData(entity, ArenaData.CreateRooftop(center, size));
            em.AddBuffer<ArenaHazard>(entity);

            // Add edge fall hazards
            var hazards = em.GetBuffer<ArenaHazard>(entity);
            float3 halfSize = size * 0.5f;

            // North edge
            hazards.Add(ArenaHazard.CreateFallHazard(
                center + new float3(0f, -halfSize.y - 1f, halfSize.z + 1f),
                size.x * 0.5f,
                25f
            ));

            // South edge
            hazards.Add(ArenaHazard.CreateFallHazard(
                center + new float3(0f, -halfSize.y - 1f, -halfSize.z - 1f),
                size.x * 0.5f,
                25f
            ));

            // East edge
            hazards.Add(ArenaHazard.CreateFallHazard(
                center + new float3(halfSize.x + 1f, -halfSize.y - 1f, 0f),
                size.z * 0.5f,
                25f
            ));

            // West edge
            hazards.Add(ArenaHazard.CreateFallHazard(
                center + new float3(-halfSize.x - 1f, -halfSize.y - 1f, 0f),
                size.z * 0.5f,
                25f
            ));

            return entity;
        }

        /// <summary>
        /// Spawn a bridge arena.
        /// </summary>
        public static Entity SpawnBridgeArena(EntityManager em, float3 center, float length, float width)
        {
            var entity = em.CreateEntity();

            em.AddComponentData(entity, ArenaData.CreateBridge(center, length, width));
            em.AddBuffer<ArenaHazard>(entity);

            var hazards = em.GetBuffer<ArenaHazard>(entity);
            float halfWidth = width * 0.5f;

            // Water hazards on sides
            hazards.Add(ArenaHazard.CreateWaterHazard(
                center + new float3(halfWidth + 2f, -2f, 0f),
                length * 0.6f,
                10f,
                1f
            ));

            hazards.Add(ArenaHazard.CreateWaterHazard(
                center + new float3(-halfWidth - 2f, -2f, 0f),
                length * 0.6f,
                10f,
                1f
            ));

            // Fall hazards at edges
            hazards.Add(ArenaHazard.CreateFallHazard(
                center + new float3(halfWidth + 1f, 0f, 0f),
                length * 0.5f,
                20f
            ));

            hazards.Add(ArenaHazard.CreateFallHazard(
                center + new float3(-halfWidth - 1f, 0f, 0f),
                length * 0.5f,
                20f
            ));

            return entity;
        }

        /// <summary>
        /// Spawn a boat arena.
        /// </summary>
        public static Entity SpawnBoatArena(EntityManager em, float3 center, float3 size, float rockingIntensity)
        {
            var entity = em.CreateEntity();

            em.AddComponentData(entity, ArenaData.CreateBoat(center, size, rockingIntensity));
            em.AddComponentData(entity, RockingPlatform.CreateBoatRocking(rockingIntensity));
            em.AddBuffer<ArenaHazard>(entity);

            var hazards = em.GetBuffer<ArenaHazard>(entity);

            // Water hazard surrounding boat
            hazards.Add(ArenaHazard.CreateWaterHazard(
                center + new float3(0f, -2f, 0f),
                math.max(size.x, size.z) + 3f,
                15f,
                1.5f
            ));

            // Fall hazards at boat edges
            float3 halfSize = size * 0.5f;

            hazards.Add(ArenaHazard.CreateFallHazard(
                center + new float3(halfSize.x + 0.5f, 0f, 0f),
                size.z * 0.4f,
                15f
            ));

            hazards.Add(ArenaHazard.CreateFallHazard(
                center + new float3(-halfSize.x - 0.5f, 0f, 0f),
                size.z * 0.4f,
                15f
            ));

            return entity;
        }

        /// <summary>
        /// Spawn a flooded interior arena.
        /// </summary>
        public static Entity SpawnFloodedInteriorArena(EntityManager em, float3 center, float3 size, float waterDepth)
        {
            var entity = em.CreateEntity();

            em.AddComponentData(entity, ArenaData.CreateFloodedInterior(center, size, waterDepth));
            em.AddBuffer<ArenaHazard>(entity);

            var hazards = em.GetBuffer<ArenaHazard>(entity);

            // Deep water hazard in center (optional drowning zone)
            if (waterDepth > 1.2f)
            {
                hazards.Add(ArenaHazard.CreateWaterHazard(
                    center + new float3(0f, -waterDepth * 0.5f, 0f),
                    math.min(size.x, size.z) * 0.3f,
                    5f,
                    2f
                ));
            }

            // Electric hazard near exposed wiring (environmental flavor)
            hazards.Add(ArenaHazard.CreateElectricHazard(
                center + new float3(size.x * 0.3f, waterDepth * 0.5f, size.z * 0.3f),
                2f,
                12f,
                0.5f,
                10f
            ));

            return entity;
        }
    }
}
