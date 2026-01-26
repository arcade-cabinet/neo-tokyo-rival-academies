using Unity.Burst;
using Unity.Collections;
using Unity.Entities;
using Unity.Mathematics;
using Unity.Transforms;
using NeoTokyo.Components.AI;
using NeoTokyo.Components.Core;
using NeoTokyo.Components.Stats;
using NeoTokyo.Components.Combat;
using NeoTokyo.Components.Faction;

namespace NeoTokyo.Systems.AI
{
    /// <summary>
    /// Faction type for AI behavior differentiation.
    /// Equivalent to TypeScript: faction property on YukaAgent
    /// </summary>
    public enum AIFaction : byte
    {
        Enemy = 0,
        Ally = 1,
        Boss = 2
    }

    /// <summary>
    /// AI agent state for the master AI coordinator.
    /// </summary>
    public enum AIAgentState : byte
    {
        Idle = 0,
        Chase = 1,
        Attack = 2,
        CoopFollow = 3,
        CoopAttack = 4,
        BossHover = 5,
        BossSlam = 6
    }

    /// <summary>
    /// Master AI agent component.
    /// Equivalent to TypeScript: YukaAgent class
    /// </summary>
    public struct AIAgent : IComponentData
    {
        public AIFaction Faction;
        public AIAgentState CurrentState;
        public float StateTimer;
        public float3 TargetPosition;
        public Entity TargetEntity;

        public static AIAgent CreateEnemy() => new AIAgent
        {
            Faction = AIFaction.Enemy,
            CurrentState = AIAgentState.Idle,
            StateTimer = 0f,
            TargetPosition = float3.zero,
            TargetEntity = Entity.Null
        };

        public static AIAgent CreateAlly() => new AIAgent
        {
            Faction = AIFaction.Ally,
            CurrentState = AIAgentState.CoopFollow,
            StateTimer = 0f,
            TargetPosition = float3.zero,
            TargetEntity = Entity.Null
        };

        public static AIAgent CreateBoss() => new AIAgent
        {
            Faction = AIFaction.Boss,
            CurrentState = AIAgentState.BossHover,
            StateTimer = 0f,
            TargetPosition = float3.zero,
            TargetEntity = Entity.Null
        };
    }

    /// <summary>
    /// Master AI coordinator system.
    /// Equivalent to TypeScript: AISystem.ts
    ///
    /// Responsibilities:
    /// - Synchronize entity states with AI behavior
    /// - Execute state machines for different faction types
    /// - Update velocity/movement based on AI decisions
    /// - Coordinate enemy, ally, and boss behaviors
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateBefore(typeof(AIStateMachineSystem))]
    public partial struct AISystem : ISystem
    {
        private const float ENEMY_DETECT_RANGE = 30f;
        private const float ALLY_DETECT_RANGE = 15f;
        private const float ALLY_FOLLOW_DISTANCE = 3f;
        private const float ATTACK_RANGE = 2f;
        private const float ENEMY_CHASE_SPEED = 8f;
        private const float ALLY_FOLLOW_SPEED = 2f;
        private const float ALLY_ATTACK_SPEED = 10f;
        private const float BOSS_HOVER_HEIGHT = 6f;
        private const float BOSS_HOVER_AMPLITUDE = 2f;
        private const float BOSS_SLAM_SPEED = 25f;

        [BurstCompile]
        public void OnCreate(ref SystemState state)
        {
            state.RequireForUpdate<AIAgent>();
        }

        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            float deltaTime = SystemAPI.Time.DeltaTime;
            float elapsedTime = (float)SystemAPI.Time.ElapsedTime;
            uint randomSeed = (uint)(elapsedTime * 1000) + 1;

            // Collect player and enemy positions
            var playerPositions = new NativeList<float3>(Allocator.TempJob);
            var playerEntities = new NativeList<Entity>(Allocator.TempJob);
            var enemyPositions = new NativeList<float3>(Allocator.TempJob);
            var enemyEntities = new NativeList<Entity>(Allocator.TempJob);

            // Gather player data
            foreach (var (transform, entity) in
                SystemAPI.Query<RefRO<LocalTransform>>()
                    .WithAll<PlayerTag>()
                    .WithEntityAccess())
            {
                playerPositions.Add(transform.ValueRO.Position);
                playerEntities.Add(entity);
            }

            // Gather enemy data
            foreach (var (transform, entity) in
                SystemAPI.Query<RefRO<LocalTransform>>()
                    .WithAll<EnemyTag>()
                    .WithEntityAccess())
            {
                enemyPositions.Add(transform.ValueRO.Position);
                enemyEntities.Add(entity);
            }

            // Schedule parallel job for AI updates
            new AIUpdateJob
            {
                DeltaTime = deltaTime,
                ElapsedTime = elapsedTime,
                RandomSeed = randomSeed,
                PlayerPositions = playerPositions.AsArray(),
                PlayerEntities = playerEntities.AsArray(),
                EnemyPositions = enemyPositions.AsArray(),
                EnemyEntities = enemyEntities.AsArray()
            }.ScheduleParallel();

            state.Dependency.Complete();

            playerPositions.Dispose();
            playerEntities.Dispose();
            enemyPositions.Dispose();
            enemyEntities.Dispose();
        }

        [BurstCompile]
        partial struct AIUpdateJob : IJobEntity
        {
            public float DeltaTime;
            public float ElapsedTime;
            public uint RandomSeed;

            [ReadOnly] public NativeArray<float3> PlayerPositions;
            [ReadOnly] public NativeArray<Entity> PlayerEntities;
            [ReadOnly] public NativeArray<float3> EnemyPositions;
            [ReadOnly] public NativeArray<Entity> EnemyEntities;

            void Execute(
                ref LocalTransform transform,
                ref AIAgent agent,
                ref Velocity velocity,
                [EntityIndexInQuery] int entityIndex)
            {
                var random = new Unity.Mathematics.Random(RandomSeed + (uint)entityIndex);

                // Update state timer
                agent.StateTimer += DeltaTime;

                // Get closest player
                float3 closestPlayerPos = float3.zero;
                Entity closestPlayer = Entity.Null;
                float playerDist = float.MaxValue;

                for (int i = 0; i < PlayerPositions.Length; i++)
                {
                    float dist = math.distance(transform.Position, PlayerPositions[i]);
                    if (dist < playerDist)
                    {
                        playerDist = dist;
                        closestPlayerPos = PlayerPositions[i];
                        closestPlayer = PlayerEntities[i];
                    }
                }

                // Get closest enemy (for allies)
                float3 closestEnemyPos = float3.zero;
                Entity closestEnemy = Entity.Null;
                float enemyDist = float.MaxValue;

                for (int i = 0; i < EnemyPositions.Length; i++)
                {
                    float dist = math.distance(transform.Position, EnemyPositions[i]);
                    if (dist < enemyDist)
                    {
                        enemyDist = dist;
                        closestEnemyPos = EnemyPositions[i];
                        closestEnemy = EnemyEntities[i];
                    }
                }

                // Execute faction-specific behavior
                switch (agent.Faction)
                {
                    case AIFaction.Enemy:
                        ExecuteEnemyBehavior(
                            ref transform, ref agent, ref velocity,
                            closestPlayerPos, closestPlayer, playerDist,
                            ref random);
                        break;

                    case AIFaction.Ally:
                        ExecuteAllyBehavior(
                            ref transform, ref agent, ref velocity,
                            closestPlayerPos, closestEnemyPos, closestEnemy,
                            playerDist, enemyDist);
                        break;

                    case AIFaction.Boss:
                        ExecuteBossBehavior(
                            ref transform, ref agent, ref velocity,
                            closestPlayerPos, ref random);
                        break;
                }
            }

            /// <summary>
            /// Enemy AI behavior - chase and attack player.
            /// Equivalent to TypeScript: IdleState, ChaseState, AttackState
            /// </summary>
            private void ExecuteEnemyBehavior(
                ref LocalTransform transform,
                ref AIAgent agent,
                ref Velocity velocity,
                float3 playerPos,
                Entity playerEntity,
                float playerDist,
                ref Unity.Mathematics.Random random)
            {
                switch (agent.CurrentState)
                {
                    case AIAgentState.Idle:
                        // Look for player in range
                        if (playerDist < ENEMY_DETECT_RANGE)
                        {
                            agent.CurrentState = AIAgentState.Chase;
                            agent.TargetEntity = playerEntity;
                            agent.StateTimer = 0f;
                        }
                        velocity.Value = float3.zero;
                        break;

                    case AIAgentState.Chase:
                        float dx = playerPos.x - transform.Position.x;
                        if (math.abs(dx) > ATTACK_RANGE)
                        {
                            // Move toward player
                            velocity.Value = new float3(math.sign(dx) * ENEMY_CHASE_SPEED, velocity.Value.y, 0f);

                            // Face movement direction
                            if (math.abs(dx) > 0.1f)
                            {
                                transform.Rotation = quaternion.LookRotationSafe(
                                    new float3(math.sign(dx), 0f, 0f),
                                    math.up()
                                );
                            }
                        }
                        else
                        {
                            // In range - attack
                            agent.CurrentState = AIAgentState.Attack;
                            agent.StateTimer = 0f;
                        }
                        break;

                    case AIAgentState.Attack:
                        // Attack state - velocity stops
                        velocity.Value = new float3(0f, velocity.Value.y, 0f);

                        // Random chance to exit attack
                        if (random.NextFloat() < 0.02f)
                        {
                            agent.CurrentState = AIAgentState.Idle;
                            agent.StateTimer = 0f;
                        }
                        break;
                }
            }

            /// <summary>
            /// Ally AI behavior - follow player and assist in combat.
            /// Equivalent to TypeScript: CoopFollowState, CoopAttackState
            /// </summary>
            private void ExecuteAllyBehavior(
                ref LocalTransform transform,
                ref AIAgent agent,
                ref Velocity velocity,
                float3 playerPos,
                float3 enemyPos,
                Entity enemyEntity,
                float playerDist,
                float enemyDist)
            {
                switch (agent.CurrentState)
                {
                    case AIAgentState.Idle:
                    case AIAgentState.CoopFollow:
                        // Check for nearby enemies to engage
                        if (enemyEntity != Entity.Null && enemyDist < ALLY_DETECT_RANGE)
                        {
                            agent.CurrentState = AIAgentState.CoopAttack;
                            agent.TargetEntity = enemyEntity;
                            agent.StateTimer = 0f;
                            break;
                        }

                        // Follow player
                        float targetX = playerPos.x - ALLY_FOLLOW_DISTANCE;
                        float followDx = targetX - transform.Position.x;

                        if (math.abs(followDx) > 1f)
                        {
                            velocity.Value = new float3(followDx * ALLY_FOLLOW_SPEED, velocity.Value.y, 0f);
                        }
                        else
                        {
                            velocity.Value = new float3(0f, velocity.Value.y, 0f);
                        }
                        break;

                    case AIAgentState.CoopAttack:
                        if (enemyEntity == Entity.Null)
                        {
                            // No enemy - return to following
                            agent.CurrentState = AIAgentState.CoopFollow;
                            agent.StateTimer = 0f;
                            break;
                        }

                        float attackDx = enemyPos.x - transform.Position.x;
                        if (math.abs(attackDx) > ATTACK_RANGE)
                        {
                            // Rush toward enemy
                            velocity.Value = new float3(math.sign(attackDx) * ALLY_ATTACK_SPEED, velocity.Value.y, 0f);

                            // Face movement direction
                            transform.Rotation = quaternion.LookRotationSafe(
                                new float3(math.sign(attackDx), 0f, 0f),
                                math.up()
                            );
                        }
                        else
                        {
                            // In attack range
                            velocity.Value = new float3(0f, velocity.Value.y, 0f);
                        }

                        // Return to follow if enemy too far
                        if (enemyDist > 20f)
                        {
                            agent.CurrentState = AIAgentState.CoopFollow;
                            agent.StateTimer = 0f;
                        }
                        break;
                }
            }

            /// <summary>
            /// Boss AI behavior - hover and slam attacks.
            /// Equivalent to TypeScript: BossHoverState, BossSlamState
            /// </summary>
            private void ExecuteBossBehavior(
                ref LocalTransform transform,
                ref AIAgent agent,
                ref Velocity velocity,
                float3 playerPos,
                ref Unity.Mathematics.Random random)
            {
                switch (agent.CurrentState)
                {
                    case AIAgentState.BossHover:
                        // Horizontal tracking
                        float targetX = playerPos.x + 10f;
                        float hoverDx = targetX - transform.Position.x;
                        velocity.Value.x = hoverDx * 1.0f;

                        // Vertical oscillation
                        float targetY = BOSS_HOVER_HEIGHT + math.sin(ElapsedTime * 3f) * BOSS_HOVER_AMPLITUDE;
                        float hoverDy = targetY - transform.Position.y;
                        velocity.Value.y = hoverDy * 2.0f;

                        // Random chance to slam
                        if (random.NextFloat() < 0.005f)
                        {
                            agent.CurrentState = AIAgentState.BossSlam;
                            agent.StateTimer = 0f;
                        }
                        break;

                    case AIAgentState.BossSlam:
                        // Stop horizontal, slam down
                        velocity.Value.x = 0f;
                        velocity.Value.y = -BOSS_SLAM_SPEED;

                        // Check for ground impact
                        if (transform.Position.y <= 0.5f)
                        {
                            velocity.Value.y = 0f;
                            transform.Position = new float3(transform.Position.x, 0.5f, transform.Position.z);

                            // Random chance to return to hover
                            if (random.NextFloat() < 0.1f)
                            {
                                agent.CurrentState = AIAgentState.BossHover;
                                agent.StateTimer = 0f;
                            }
                        }
                        break;
                }
            }
        }
    }

    /// <summary>
    /// System to sync AIAgent state with CharacterStateComponent for animation.
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateAfter(typeof(AISystem))]
    public partial struct AISyncSystem : ISystem
    {
        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            foreach (var (agent, charState) in
                SystemAPI.Query<RefRO<AIAgent>, RefRW<CharacterStateComponent>>())
            {
                CharacterState targetState = agent.ValueRO.CurrentState switch
                {
                    AIAgentState.Idle => CharacterState.Idle,
                    AIAgentState.Chase => CharacterState.Running,
                    AIAgentState.Attack => CharacterState.Attacking,
                    AIAgentState.CoopFollow => CharacterState.Walking,
                    AIAgentState.CoopAttack => CharacterState.Attacking,
                    AIAgentState.BossHover => CharacterState.Idle,
                    AIAgentState.BossSlam => CharacterState.Attacking,
                    _ => CharacterState.Idle
                };

                if (charState.ValueRO.Current != targetState)
                {
                    charState.ValueRW.Previous = charState.ValueRO.Current;
                    charState.ValueRW.Current = targetState;
                    charState.ValueRW.StateTime = 0f;
                }
            }
        }
    }

    /// <summary>
    /// Helper utilities for the AI system.
    /// </summary>
    public static class AISystemHelpers
    {
        /// <summary>
        /// Create an AIAgent component based on entity tags.
        /// </summary>
        public static AIAgent CreateAgentFromTags(bool isEnemy, bool isAlly, bool isBoss)
        {
            if (isBoss || (isEnemy && false)) // Legacy check for boss color removed
            {
                return AIAgent.CreateBoss();
            }

            if (isAlly)
            {
                return AIAgent.CreateAlly();
            }

            return AIAgent.CreateEnemy();
        }

        /// <summary>
        /// Force an AI agent into a specific state.
        /// </summary>
        public static void ForceState(ref AIAgent agent, AIAgentState newState)
        {
            agent.CurrentState = newState;
            agent.StateTimer = 0f;
        }
    }
}
