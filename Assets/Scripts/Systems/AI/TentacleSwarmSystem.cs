using Unity.Burst;
using Unity.Collections;
using Unity.Entities;
using Unity.Mathematics;
using Unity.Transforms;
using NeoTokyo.Components.AI;
using NeoTokyo.Components.Core;
using NeoTokyo.Components.Stats;
using NeoTokyo.Components.Combat;

namespace NeoTokyo.Systems.AI
{
    /// <summary>
    /// Manages 8 independent tentacle agents for the Alien Ship boss stage.
    /// Equivalent to TypeScript: TentacleSwarm.ts
    ///
    /// Responsibilities:
    /// - Update individual tentacle AI behavior
    /// - Movement toward formation positions
    /// - Attack cooldown management
    /// - Health monitoring and death/regeneration cycle
    /// - Swarm defeat detection
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateAfter(typeof(SwarmCoordinationSystem))]
    public partial struct TentacleSwarmSystem : ISystem
    {
        private const int TENTACLE_COUNT = 8;
        private const float DEFAULT_HEALTH = 50f;
        private const float DEFAULT_SURROUND_RADIUS = 8f;
        private const float DEFAULT_ATTACK_INTERVAL = 2.0f;
        private const float REGENERATION_TIME = 10f;
        private const float MOVEMENT_THRESHOLD = 0.5f;
        private const float BASE_MOVE_SPEED = 3f;

        [BurstCompile]
        public void OnCreate(ref SystemState state)
        {
            state.RequireForUpdate<TentacleAgent>();
        }

        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            float deltaTime = SystemAPI.Time.DeltaTime;

            // Get player position for targeting
            float3 playerPos = float3.zero;
            bool hasPlayer = false;

            foreach (var (_, transform) in
                SystemAPI.Query<RefRO<PlayerTag>, RefRO<LocalTransform>>())
            {
                playerPos = transform.ValueRO.Position;
                hasPlayer = true;
                break;
            }

            if (!hasPlayer) return;

            // Process all tentacle agents
            new TentacleUpdateJob
            {
                DeltaTime = deltaTime,
                PlayerPosition = playerPos
            }.ScheduleParallel();
        }

        /// <summary>
        /// Job to update individual tentacle agents.
        /// Handles movement, cooldowns, and state transitions.
        /// </summary>
        [BurstCompile]
        partial struct TentacleUpdateJob : IJobEntity
        {
            public float DeltaTime;
            public float3 PlayerPosition;

            void Execute(
                ref LocalTransform transform,
                ref TentacleAgent agent,
                ref Health health)
            {
                // Handle regeneration cycle
                if (agent.IsRegenerating)
                {
                    agent.RegenerationTimer -= DeltaTime;
                    if (agent.RegenerationTimer <= 0f)
                    {
                        // Regeneration complete
                        agent.IsAlive = true;
                        agent.IsRegenerating = false;
                        agent.AttackCooldown = 0f;
                        health.Current = health.Max;
                    }
                    return; // Skip normal update while regenerating
                }

                // Check for death
                if (!agent.IsAlive) return;

                if (health.Current <= 0)
                {
                    // Tentacle defeated - start regeneration
                    agent.IsAlive = false;
                    agent.IsRegenerating = true;
                    agent.RegenerationTimer = agent.RegenerationDuration;
                    return;
                }

                // Update attack cooldown
                if (agent.AttackCooldown > 0f)
                {
                    agent.AttackCooldown -= DeltaTime;
                }

                // Move toward formation position
                float3 toTarget = agent.TargetFormationPosition - transform.Position;
                float distance = math.length(toTarget);

                if (distance > MOVEMENT_THRESHOLD)
                {
                    float3 moveDir = math.normalize(toTarget);
                    float moveAmount = math.min(agent.MoveSpeed * DeltaTime, distance);
                    transform.Position += moveDir * moveAmount;

                    // Face movement direction (on XZ plane)
                    if (math.lengthsq(new float2(moveDir.x, moveDir.z)) > 0.001f)
                    {
                        transform.Rotation = quaternion.LookRotationSafe(
                            new float3(moveDir.x, 0f, moveDir.z),
                            math.up()
                        );
                    }
                }
            }
        }
    }

    /// <summary>
    /// System to handle tentacle attack execution and cooldown reset.
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateAfter(typeof(TentacleSwarmSystem))]
    public partial struct TentacleAttackSystem : ISystem
    {
        [BurstCompile]
        public void OnCreate(ref SystemState state)
        {
            state.RequireForUpdate<SwarmCoordinator>();
        }

        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            var ecb = new EntityCommandBuffer(Allocator.TempJob);
            float deltaTime = SystemAPI.Time.DeltaTime;

            // Get player position and entity
            float3 playerPos = float3.zero;
            Entity playerEntity = Entity.Null;

            foreach (var (_, transform, entity) in
                SystemAPI.Query<RefRO<PlayerTag>, RefRO<LocalTransform>>()
                    .WithEntityAccess())
            {
                playerPos = transform.ValueRO.Position;
                playerEntity = entity;
                break;
            }

            if (playerEntity == Entity.Null) return;

            // Process attack requests from swarm coordinators
            foreach (var (coordinator, attackRequests, members) in
                SystemAPI.Query<RefRW<SwarmCoordinator>, DynamicBuffer<SwarmAttackRequest>, DynamicBuffer<SwarmMemberElement>>())
            {
                // Don't attack while retreating
                if (coordinator.ValueRO.ShouldRetreat)
                {
                    attackRequests.Clear();
                    continue;
                }

                // Find next attacker using round-robin sequence
                foreach (var member in members)
                {
                    if (!SystemAPI.HasComponent<TentacleAgent>(member.MemberEntity)) continue;

                    var agent = SystemAPI.GetComponent<TentacleAgent>(member.MemberEntity);

                    // Check if this tentacle can attack
                    if (agent.IsAlive && agent.AttackCooldown <= 0f)
                    {
                        var memberTransform = SystemAPI.GetComponent<LocalTransform>(member.MemberEntity);
                        float distToPlayer = math.distance(memberTransform.Position, playerPos);

                        // Within attack range (formation radius + buffer)
                        if (distToPlayer <= coordinator.ValueRO.FormationRadius + 2f)
                        {
                            // Queue damage event on player
                            if (SystemAPI.HasBuffer<DamageEvent>(playerEntity))
                            {
                                var damageBuffer = SystemAPI.GetBuffer<DamageEvent>(playerEntity);
                                damageBuffer.Add(new DamageEvent
                                {
                                    Source = member.MemberEntity,
                                    Amount = 15, // Tentacle base damage
                                    IsCritical = false,
                                    StabilityDamage = 10f
                                });
                            }

                            // Reset cooldown
                            agent.AttackCooldown = agent.AttackInterval;
                            SystemAPI.SetComponent(member.MemberEntity, agent);

                            // Update sequence index
                            coordinator.ValueRW.SequenceIndex =
                                (coordinator.ValueRO.SequenceIndex + 1) % members.Length;

                            // Only one attack per frame from this swarm
                            break;
                        }
                    }
                }

                attackRequests.Clear();
            }

            ecb.Playback(state.EntityManager);
            ecb.Dispose();
        }
    }

    /// <summary>
    /// System to check swarm defeat status and trigger boss phase changes.
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateAfter(typeof(TentacleAttackSystem))]
    public partial struct SwarmDefeatCheckSystem : ISystem
    {
        /// <summary>
        /// Event fired when a swarm is defeated.
        /// </summary>
        public struct SwarmDefeatedEvent : IComponentData
        {
            public Entity CoordinatorEntity;
        }

        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            var ecb = new EntityCommandBuffer(Allocator.TempJob);

            foreach (var (coordinator, members, entity) in
                SystemAPI.Query<RefRO<SwarmCoordinator>, DynamicBuffer<SwarmMemberElement>>()
                    .WithEntityAccess())
            {
                bool allDead = true;

                foreach (var member in members)
                {
                    if (!SystemAPI.HasComponent<TentacleAgent>(member.MemberEntity)) continue;

                    var agent = SystemAPI.GetComponent<TentacleAgent>(member.MemberEntity);
                    if (agent.IsAlive || agent.IsRegenerating)
                    {
                        allDead = false;
                        break;
                    }
                }

                // Fire defeat event if all tentacles are dead (not regenerating)
                if (allDead)
                {
                    var eventEntity = ecb.CreateEntity();
                    ecb.AddComponent(eventEntity, new SwarmDefeatedEvent
                    {
                        CoordinatorEntity = entity
                    });
                }
            }

            ecb.Playback(state.EntityManager);
            ecb.Dispose();
        }
    }

    /// <summary>
    /// Helper class for spawning and managing tentacle swarms.
    /// </summary>
    public static class TentacleSwarmHelpers
    {
        /// <summary>
        /// Initialize a swarm with 8 tentacles around a center point.
        /// Equivalent to TypeScript: TentacleSwarm.initialize()
        /// </summary>
        public static void SpawnTentacleSwarm(
            EntityManager entityManager,
            Entity coordinatorEntity,
            float3 swarmCenter,
            Entity tentaclePrefab,
            float surroundRadius = 8f)
        {
            const int TENTACLE_COUNT = 8;

            var members = entityManager.GetBuffer<SwarmMemberElement>(coordinatorEntity);
            members.Clear();

            for (int i = 0; i < TENTACLE_COUNT; i++)
            {
                float angle = ((float)i / TENTACLE_COUNT) * math.PI * 2f;
                float3 position = new float3(
                    swarmCenter.x + math.cos(angle) * surroundRadius,
                    0f,
                    swarmCenter.z + math.sin(angle) * surroundRadius
                );

                // Spawn tentacle entity
                Entity tentacle = entityManager.Instantiate(tentaclePrefab);

                // Set position
                entityManager.SetComponentData(tentacle, LocalTransform.FromPosition(position));

                // Configure tentacle agent
                entityManager.SetComponentData(tentacle, TentacleAgent.Create(i));

                // Set initial health
                entityManager.SetComponentData(tentacle, new Health
                {
                    Current = 50,
                    Max = 50
                });

                // Add swarm membership
                entityManager.SetComponentData(tentacle, new SwarmMemberTag
                {
                    CoordinatorEntity = coordinatorEntity
                });

                // Register in coordinator's member list
                members.Add(new SwarmMemberElement
                {
                    MemberEntity = tentacle,
                    MemberIndex = i
                });
            }

            // Configure coordinator
            var coordinator = entityManager.GetComponentData<SwarmCoordinator>(coordinatorEntity);
            coordinator.SwarmCenter = swarmCenter;
            coordinator.FormationRadius = surroundRadius;
            entityManager.SetComponentData(coordinatorEntity, coordinator);
        }

        /// <summary>
        /// Damage a specific tentacle.
        /// Equivalent to TypeScript: TentacleSwarm.damageTentacle()
        /// </summary>
        public static void DamageTentacle(
            EntityManager entityManager,
            Entity tentacleEntity,
            int damage)
        {
            if (!entityManager.HasComponent<Health>(tentacleEntity)) return;

            var health = entityManager.GetComponentData<Health>(tentacleEntity);
            health.Current = math.max(0, health.Current - damage);
            entityManager.SetComponentData(tentacleEntity, health);
        }

        /// <summary>
        /// Check if a tentacle can attack.
        /// Equivalent to TypeScript: TentacleSwarm.canAttack()
        /// </summary>
        public static bool CanAttack(EntityManager entityManager, Entity tentacleEntity)
        {
            if (!entityManager.HasComponent<TentacleAgent>(tentacleEntity)) return false;

            var agent = entityManager.GetComponentData<TentacleAgent>(tentacleEntity);
            return agent.IsAlive && agent.AttackCooldown <= 0f;
        }

        /// <summary>
        /// Get count of alive tentacles in a swarm.
        /// </summary>
        public static int GetAliveCount(
            EntityManager entityManager,
            DynamicBuffer<SwarmMemberElement> members)
        {
            int count = 0;

            foreach (var member in members)
            {
                if (!entityManager.HasComponent<TentacleAgent>(member.MemberEntity)) continue;

                var agent = entityManager.GetComponentData<TentacleAgent>(member.MemberEntity);
                if (agent.IsAlive) count++;
            }

            return count;
        }
    }
}
