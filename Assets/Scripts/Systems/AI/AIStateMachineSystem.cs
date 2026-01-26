using Unity.Burst;
using Unity.Collections;
using Unity.Entities;
using Unity.Mathematics;
using NeoTokyo.Components.Combat;
using NeoTokyo.Components.Core;
using NeoTokyo.Components.Faction;

namespace NeoTokyo.Systems.AI
{
    /// <summary>
    /// AI behavior states.
    /// Equivalent to TypeScript: AIStateMachine.ts
    /// </summary>
    public enum AIState : byte
    {
        Idle = 0,
        Patrol = 1,
        Chase = 2,
        Attack = 3,
        Flee = 4,
        Search = 5,
        Return = 6,
    }

    /// <summary>
    /// AI state machine component.
    /// </summary>
    public struct AIBrain : IComponentData
    {
        public AIState CurrentState;
        public AIState PreviousState;
        public float StateTime;
        public float DetectionRange;
        public float AttackRange;
        public float FleeHealthThreshold;  // Flee when health below this ratio
        public Entity Target;
    }

    /// <summary>
    /// Patrol waypoints for AI.
    /// </summary>
    public struct PatrolWaypoint : IBufferElementData
    {
        public float3 Position;
    }

    /// <summary>
    /// Current patrol state.
    /// </summary>
    public struct PatrolState : IComponentData
    {
        public int CurrentWaypointIndex;
        public float WaitTime;
        public float WaitDuration;
    }

    /// <summary>
    /// AI state machine system.
    /// Equivalent to TypeScript: AIStateMachine.ts / AISystem.ts
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    public partial struct AIStateMachineSystem : ISystem
    {
        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            float dt = SystemAPI.Time.DeltaTime;

            // Get player position for target detection
            float3 playerPos = float3.zero;
            bool hasPlayer = false;

            foreach (var (_, transform) in
                SystemAPI.Query<RefRO<PlayerTag>, RefRO<Position>>())
            {
                playerPos = transform.ValueRO.Value;
                hasPlayer = true;
                break;
            }

            if (!hasPlayer) return;

            foreach (var (brain, position, health, faction, charState) in
                SystemAPI.Query<
                    RefRW<AIBrain>,
                    RefRO<Position>,
                    RefRO<Components.Stats.Health>,
                    RefRO<FactionMembership>,
                    RefRW<CharacterStateComponent>>()
                .WithAll<EnemyTag>())
            {
                brain.ValueRW.StateTime += dt;

                float distToPlayer = math.distance(position.ValueRO.Value, playerPos);
                float healthRatio = health.ValueRO.Ratio;

                AIState newState = brain.ValueRO.CurrentState;

                // State transitions
                switch (brain.ValueRO.CurrentState)
                {
                    case AIState.Idle:
                    case AIState.Patrol:
                        // Detect player
                        if (distToPlayer <= brain.ValueRO.DetectionRange)
                        {
                            newState = AIState.Chase;
                        }
                        break;

                    case AIState.Chase:
                        // Check for attack range
                        if (distToPlayer <= brain.ValueRO.AttackRange)
                        {
                            newState = AIState.Attack;
                        }
                        // Lost player
                        else if (distToPlayer > brain.ValueRO.DetectionRange * 1.5f)
                        {
                            newState = AIState.Search;
                        }
                        // Low health - flee
                        if (healthRatio < brain.ValueRO.FleeHealthThreshold)
                        {
                            newState = AIState.Flee;
                        }
                        break;

                    case AIState.Attack:
                        // Target moved out of range
                        if (distToPlayer > brain.ValueRO.AttackRange * 1.2f)
                        {
                            newState = AIState.Chase;
                        }
                        // Low health
                        if (healthRatio < brain.ValueRO.FleeHealthThreshold)
                        {
                            newState = AIState.Flee;
                        }
                        break;

                    case AIState.Flee:
                        // Health recovered or far enough away
                        if (healthRatio > brain.ValueRO.FleeHealthThreshold * 1.5f ||
                            distToPlayer > brain.ValueRO.DetectionRange * 2f)
                        {
                            newState = AIState.Return;
                        }
                        break;

                    case AIState.Search:
                        // Re-detected player
                        if (distToPlayer <= brain.ValueRO.DetectionRange)
                        {
                            newState = AIState.Chase;
                        }
                        // Give up after 5 seconds
                        else if (brain.ValueRO.StateTime > 5f)
                        {
                            newState = AIState.Return;
                        }
                        break;

                    case AIState.Return:
                        // Back at patrol start, resume patrol
                        if (brain.ValueRO.StateTime > 2f)
                        {
                            newState = AIState.Patrol;
                        }
                        // Re-detect player while returning
                        if (distToPlayer <= brain.ValueRO.DetectionRange * 0.8f)
                        {
                            newState = AIState.Chase;
                        }
                        break;
                }

                // Apply state change
                if (newState != brain.ValueRO.CurrentState)
                {
                    brain.ValueRW.PreviousState = brain.ValueRO.CurrentState;
                    brain.ValueRW.CurrentState = newState;
                    brain.ValueRW.StateTime = 0f;

                    // Update character state based on AI state
                    CharacterState targetCharState = newState switch
                    {
                        AIState.Idle => CharacterState.Idle,
                        AIState.Patrol => CharacterState.Walking,
                        AIState.Chase => CharacterState.Running,
                        AIState.Attack => CharacterState.Attacking,
                        AIState.Flee => CharacterState.Running,
                        AIState.Search => CharacterState.Walking,
                        AIState.Return => CharacterState.Walking,
                        _ => CharacterState.Idle
                    };

                    charState.ValueRW.Previous = charState.ValueRO.Current;
                    charState.ValueRW.Current = targetCharState;
                    charState.ValueRW.StateTime = 0f;
                }
            }
        }
    }
}
