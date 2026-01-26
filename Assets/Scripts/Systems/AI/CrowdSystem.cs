using Unity.Burst;
using Unity.Collections;
using Unity.Entities;
using Unity.Mathematics;
using Unity.Transforms;
using NeoTokyo.Components.Core;

namespace NeoTokyo.Systems.AI
{
    /// <summary>
    /// Crowd member component
    /// </summary>
    public struct CrowdMember : IComponentData
    {
        public FixedString64Bytes GroupId;
        public float WanderRadius;
        public float IdleChance;
        public float3 HomePosition;
    }

    /// <summary>
    /// Crowd behavior state
    /// </summary>
    public struct CrowdBehaviorState : IComponentData
    {
        public CrowdBehavior CurrentBehavior;
        public float StateTimer;
        public float3 TargetPosition;
    }

    public enum CrowdBehavior : byte
    {
        Idle = 0,
        Wandering = 1,
        Fleeing = 2,
        Watching = 3,
        Cheering = 4
    }

    /// <summary>
    /// Tag for entities that can trigger crowd reactions
    /// </summary>
    public struct CrowdTrigger : IComponentData
    {
        public CrowdReactionType ReactionType;
        public float Radius;
    }

    public enum CrowdReactionType : byte
    {
        None = 0,
        Flee = 1,
        Watch = 2,
        Cheer = 3
    }

    /// <summary>
    /// System that manages crowd behavior and reactions.
    /// Equivalent to TypeScript CrowdSystem.ts
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    public partial struct CrowdBehaviorSystem : ISystem
    {
        private Unity.Mathematics.Random _random;

        public void OnCreate(ref SystemState state)
        {
            _random = new Unity.Mathematics.Random(12345);
        }

        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            float deltaTime = SystemAPI.Time.DeltaTime;
            uint randomSeed = (uint)SystemAPI.Time.ElapsedTime * 1000 + 1;

            // Collect crowd triggers
            var triggers = new NativeList<TriggerData>(Allocator.TempJob);

            foreach (var (trigger, transform) in
                SystemAPI.Query<RefRO<CrowdTrigger>, RefRO<LocalTransform>>())
            {
                triggers.Add(new TriggerData
                {
                    Position = transform.ValueRO.Position,
                    Radius = trigger.ValueRO.Radius,
                    ReactionType = trigger.ValueRO.ReactionType
                });
            }

            new UpdateCrowdBehaviorJob
            {
                DeltaTime = deltaTime,
                Triggers = triggers.AsArray(),
                RandomSeed = randomSeed
            }.ScheduleParallel();

            state.Dependency.Complete();
            triggers.Dispose();
        }

        private struct TriggerData
        {
            public float3 Position;
            public float Radius;
            public CrowdReactionType ReactionType;
        }

        [BurstCompile]
        partial struct UpdateCrowdBehaviorJob : IJobEntity
        {
            public float DeltaTime;
            [ReadOnly] public NativeArray<TriggerData> Triggers;
            public uint RandomSeed;

            void Execute(
                ref LocalTransform transform,
                ref CrowdBehaviorState behaviorState,
                ref CrowdMember member,
                [EntityIndexInQuery] int entityIndex)
            {
                var random = new Unity.Mathematics.Random(RandomSeed + (uint)entityIndex);

                // Update timer
                behaviorState.StateTimer -= DeltaTime;

                // Check for trigger reactions
                foreach (var trigger in Triggers)
                {
                    float distance = math.length(transform.Position - trigger.Position);
                    if (distance <= trigger.Radius)
                    {
                        switch (trigger.ReactionType)
                        {
                            case CrowdReactionType.Flee:
                                behaviorState.CurrentBehavior = CrowdBehavior.Fleeing;
                                // Flee away from trigger
                                float3 fleeDir = math.normalize(transform.Position - trigger.Position);
                                behaviorState.TargetPosition = transform.Position + fleeDir * 10f;
                                behaviorState.StateTimer = 3f;
                                break;

                            case CrowdReactionType.Watch:
                                behaviorState.CurrentBehavior = CrowdBehavior.Watching;
                                behaviorState.TargetPosition = trigger.Position;
                                behaviorState.StateTimer = 5f;
                                break;

                            case CrowdReactionType.Cheer:
                                behaviorState.CurrentBehavior = CrowdBehavior.Cheering;
                                behaviorState.StateTimer = 2f;
                                break;
                        }
                    }
                }

                // State transitions when timer expires
                if (behaviorState.StateTimer <= 0f)
                {
                    if (random.NextFloat() < member.IdleChance)
                    {
                        behaviorState.CurrentBehavior = CrowdBehavior.Idle;
                        behaviorState.StateTimer = random.NextFloat(2f, 5f);
                    }
                    else
                    {
                        behaviorState.CurrentBehavior = CrowdBehavior.Wandering;
                        // Random point within wander radius of home
                        float2 offset = random.NextFloat2Direction() * random.NextFloat(0f, member.WanderRadius);
                        behaviorState.TargetPosition = member.HomePosition + new float3(offset.x, 0f, offset.y);
                        behaviorState.StateTimer = random.NextFloat(3f, 8f);
                    }
                }

                // Apply behavior
                switch (behaviorState.CurrentBehavior)
                {
                    case CrowdBehavior.Wandering:
                    case CrowdBehavior.Fleeing:
                        float3 toTarget = behaviorState.TargetPosition - transform.Position;
                        if (math.length(toTarget) > 0.5f)
                        {
                            float speed = behaviorState.CurrentBehavior == CrowdBehavior.Fleeing ? 4f : 1.5f;
                            transform.Position += math.normalize(toTarget) * speed * DeltaTime;

                            // Face movement direction
                            if (math.lengthsq(toTarget) > 0.01f)
                            {
                                transform.Rotation = quaternion.LookRotationSafe(
                                    math.normalize(new float3(toTarget.x, 0f, toTarget.z)),
                                    math.up()
                                );
                            }
                        }
                        break;

                    case CrowdBehavior.Watching:
                        // Face the thing being watched
                        float3 lookDir = behaviorState.TargetPosition - transform.Position;
                        if (math.lengthsq(lookDir) > 0.01f)
                        {
                            transform.Rotation = quaternion.LookRotationSafe(
                                math.normalize(new float3(lookDir.x, 0f, lookDir.z)),
                                math.up()
                            );
                        }
                        break;

                    case CrowdBehavior.Idle:
                    case CrowdBehavior.Cheering:
                        // No movement
                        break;
                }
            }
        }
    }

    /// <summary>
    /// System that spawns crowd members in designated areas
    /// </summary>
    [UpdateInGroup(typeof(InitializationSystemGroup))]
    public partial class CrowdSpawnerSystem : SystemBase
    {
        protected override void OnUpdate()
        {
            // Crowd spawning would be triggered by loading a stage
            // Implementation would read from JSON manifest
        }
    }
}
