using Unity.Burst;
using Unity.Collections;
using Unity.Entities;
using Unity.Mathematics;
using Unity.Transforms;
using NeoTokyo.Components.Core;
using NeoTokyo.Components.AI;
using NeoTokyo.Components.Stats;

namespace NeoTokyo.Systems.AI
{
    /// <summary>
    /// Enemy AI state
    /// </summary>
    public enum EnemyAIState : byte
    {
        Idle = 0,
        Patrolling = 1,
        Chasing = 2,
        Attacking = 3,
        Retreating = 4,
        Stunned = 5
    }

    /// <summary>
    /// Enemy AI component
    /// </summary>
    public struct EnemyAI : IComponentData
    {
        public EnemyAIState State;
        public float StateTimer;
        public float AggroRange;
        public float AttackRange;
        public float AttackCooldown;
        public float CurrentCooldown;
        public float3 PatrolOrigin;
        public float PatrolRadius;
        public float3 CurrentPatrolTarget;
    }

    /// <summary>
    /// System that manages enemy AI behavior.
    /// Equivalent to TypeScript EnemyAI.ts
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    public partial struct EnemyAISystem : ISystem
    {
        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            float deltaTime = SystemAPI.Time.DeltaTime;
            uint randomSeed = (uint)(SystemAPI.Time.ElapsedTime * 1000) + 1;

            // Collect player positions
            var playerPositions = new NativeList<float3>(Allocator.TempJob);
            var playerEntities = new NativeList<Entity>(Allocator.TempJob);

            foreach (var (transform, entity) in
                SystemAPI.Query<RefRO<LocalTransform>>()
                    .WithAll<PlayerTag>()
                    .WithEntityAccess())
            {
                playerPositions.Add(transform.ValueRO.Position);
                playerEntities.Add(entity);
            }

            new EnemyAIJob
            {
                DeltaTime = deltaTime,
                PlayerPositions = playerPositions.AsArray(),
                PlayerEntities = playerEntities.AsArray(),
                RandomSeed = randomSeed
            }.ScheduleParallel();

            state.Dependency.Complete();
            playerPositions.Dispose();
            playerEntities.Dispose();
        }

        [BurstCompile]
        partial struct EnemyAIJob : IJobEntity
        {
            public float DeltaTime;
            [ReadOnly] public NativeArray<float3> PlayerPositions;
            [ReadOnly] public NativeArray<Entity> PlayerEntities;
            public uint RandomSeed;

            void Execute(
                ref LocalTransform transform,
                ref EnemyAI ai,
                ref ThreatTable threatTable,
                [EntityIndexInQuery] int entityIndex)
            {
                var random = new Unity.Mathematics.Random(RandomSeed + (uint)entityIndex);

                // Update timers
                ai.StateTimer -= DeltaTime;
                ai.CurrentCooldown -= DeltaTime;

                // Find closest player
                float3 closestPlayerPos = float3.zero;
                Entity closestPlayer = Entity.Null;
                float closestDistance = float.MaxValue;

                for (int i = 0; i < PlayerPositions.Length; i++)
                {
                    float distance = math.length(PlayerPositions[i] - transform.Position);
                    if (distance < closestDistance)
                    {
                        closestDistance = distance;
                        closestPlayerPos = PlayerPositions[i];
                        closestPlayer = PlayerEntities[i];
                    }
                }

                // State machine
                switch (ai.State)
                {
                    case EnemyAIState.Idle:
                        HandleIdle(ref transform, ref ai, closestPlayerPos, closestDistance, ref random);
                        break;

                    case EnemyAIState.Patrolling:
                        HandlePatrolling(ref transform, ref ai, closestPlayerPos, closestDistance, ref random);
                        break;

                    case EnemyAIState.Chasing:
                        HandleChasing(ref transform, ref ai, ref threatTable, closestPlayerPos, closestPlayer, closestDistance);
                        break;

                    case EnemyAIState.Attacking:
                        HandleAttacking(ref transform, ref ai, closestPlayerPos, closestDistance);
                        break;

                    case EnemyAIState.Retreating:
                        HandleRetreating(ref transform, ref ai);
                        break;

                    case EnemyAIState.Stunned:
                        HandleStunned(ref ai);
                        break;
                }
            }

            private void HandleIdle(
                ref LocalTransform transform,
                ref EnemyAI ai,
                float3 playerPos,
                float playerDistance,
                ref Unity.Mathematics.Random random)
            {
                // Check for player in aggro range
                if (playerDistance <= ai.AggroRange)
                {
                    ai.State = EnemyAIState.Chasing;
                    ai.StateTimer = 10f;
                    return;
                }

                // Transition to patrol after idle timer
                if (ai.StateTimer <= 0f)
                {
                    ai.State = EnemyAIState.Patrolling;
                    ai.CurrentPatrolTarget = GetRandomPatrolPoint(ai.PatrolOrigin, ai.PatrolRadius, ref random);
                    ai.StateTimer = 5f;
                }
            }

            private void HandlePatrolling(
                ref LocalTransform transform,
                ref EnemyAI ai,
                float3 playerPos,
                float playerDistance,
                ref Unity.Mathematics.Random random)
            {
                // Check for player
                if (playerDistance <= ai.AggroRange)
                {
                    ai.State = EnemyAIState.Chasing;
                    ai.StateTimer = 10f;
                    return;
                }

                // Move toward patrol target
                float3 toTarget = ai.CurrentPatrolTarget - transform.Position;
                float distance = math.length(toTarget);

                if (distance > 0.5f)
                {
                    float3 moveDir = math.normalize(toTarget);
                    transform.Position += moveDir * 2f * DeltaTime;

                    // Face movement direction
                    transform.Rotation = quaternion.LookRotationSafe(
                        new float3(moveDir.x, 0f, moveDir.z),
                        math.up()
                    );
                }
                else
                {
                    // Reached patrol point
                    ai.State = EnemyAIState.Idle;
                    ai.StateTimer = random.NextFloat(2f, 4f);
                }
            }

            private void HandleChasing(
                ref LocalTransform transform,
                ref EnemyAI ai,
                ref ThreatTable threatTable,
                float3 playerPos,
                Entity playerEntity,
                float playerDistance)
            {
                // Update threat table
                threatTable.CurrentTarget = playerEntity;
                threatTable.InCombat = true;

                // Check if in attack range
                if (playerDistance <= ai.AttackRange && ai.CurrentCooldown <= 0f)
                {
                    ai.State = EnemyAIState.Attacking;
                    ai.StateTimer = 0.5f; // Attack duration
                    return;
                }

                // Check if player escaped
                if (playerDistance > ai.AggroRange * 1.5f || ai.StateTimer <= 0f)
                {
                    ai.State = EnemyAIState.Retreating;
                    ai.StateTimer = 3f;
                    threatTable.InCombat = false;
                    return;
                }

                // Chase player
                float3 toPlayer = playerPos - transform.Position;
                float3 moveDir = math.normalize(toPlayer);
                transform.Position += moveDir * 4f * DeltaTime; // Faster than patrol

                transform.Rotation = quaternion.LookRotationSafe(
                    new float3(moveDir.x, 0f, moveDir.z),
                    math.up()
                );
            }

            private void HandleAttacking(
                ref LocalTransform transform,
                ref EnemyAI ai,
                float3 playerPos,
                float playerDistance)
            {
                // Face player during attack
                float3 toPlayer = playerPos - transform.Position;
                if (math.lengthsq(toPlayer) > 0.01f)
                {
                    transform.Rotation = quaternion.LookRotationSafe(
                        math.normalize(new float3(toPlayer.x, 0f, toPlayer.z)),
                        math.up()
                    );
                }

                // Attack animation/hitbox would be triggered here
                // For now, just wait for attack duration

                if (ai.StateTimer <= 0f)
                {
                    ai.CurrentCooldown = ai.AttackCooldown;
                    ai.State = EnemyAIState.Chasing;
                    ai.StateTimer = 10f;
                }
            }

            private void HandleRetreating(
                ref LocalTransform transform,
                ref EnemyAI ai)
            {
                // Move back to patrol origin
                float3 toOrigin = ai.PatrolOrigin - transform.Position;
                float distance = math.length(toOrigin);

                if (distance > 1f)
                {
                    float3 moveDir = math.normalize(toOrigin);
                    transform.Position += moveDir * 3f * DeltaTime;
                    transform.Rotation = quaternion.LookRotationSafe(
                        new float3(moveDir.x, 0f, moveDir.z),
                        math.up()
                    );
                }
                else
                {
                    ai.State = EnemyAIState.Idle;
                    ai.StateTimer = 2f;
                }
            }

            private void HandleStunned(ref EnemyAI ai)
            {
                if (ai.StateTimer <= 0f)
                {
                    ai.State = EnemyAIState.Idle;
                    ai.StateTimer = 0.5f;
                }
            }

            private float3 GetRandomPatrolPoint(float3 origin, float radius, ref Unity.Mathematics.Random random)
            {
                float2 offset = random.NextFloat2Direction() * random.NextFloat(0f, radius);
                return origin + new float3(offset.x, 0f, offset.y);
            }
        }
    }

    /// <summary>
    /// Static helpers for enemy AI
    /// </summary>
    public static class EnemyAIHelpers
    {
        /// <summary>
        /// Stun an enemy for a duration
        /// </summary>
        public static void StunEnemy(ref EnemyAI ai, float duration)
        {
            ai.State = EnemyAIState.Stunned;
            ai.StateTimer = duration;
        }

        /// <summary>
        /// Force enemy to retreat
        /// </summary>
        public static void ForceRetreat(ref EnemyAI ai)
        {
            ai.State = EnemyAIState.Retreating;
            ai.StateTimer = 5f;
        }
    }
}
