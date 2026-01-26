using Unity.Burst;
using Unity.Collections;
using Unity.Entities;
using Unity.Mathematics;
using Unity.Transforms;

namespace NeoTokyo.Systems.AI
{
    /// <summary>
    /// Steering behavior weights
    /// </summary>
    public struct SteeringWeights : IComponentData
    {
        public float Seek;
        public float Flee;
        public float Arrive;
        public float Wander;
        public float Separation;
        public float Cohesion;
        public float Alignment;
        public float ObstacleAvoidance;
    }

    /// <summary>
    /// Steering agent properties
    /// </summary>
    public struct SteeringAgent : IComponentData
    {
        public float MaxSpeed;
        public float MaxForce;
        public float Mass;
        public float3 Velocity;
        public float3 DesiredVelocity;
        public float SlowingRadius;
        public float WanderAngle;
        public float WanderRadius;
        public float WanderDistance;
    }

    /// <summary>
    /// Steering target
    /// </summary>
    public struct SteeringTarget : IComponentData
    {
        public float3 Position;
        public Entity TargetEntity;
        public bool UseEntity;
    }

    /// <summary>
    /// Flocking group membership
    /// </summary>
    public struct FlockMember : IComponentData
    {
        public FixedString32Bytes GroupId;
        public float NeighborRadius;
    }

    /// <summary>
    /// System that calculates and applies steering behaviors.
    /// Equivalent to TypeScript SteeringBehaviors.ts
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    public partial struct SteeringSystem : ISystem
    {
        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            float deltaTime = SystemAPI.Time.DeltaTime;
            uint randomSeed = (uint)(SystemAPI.Time.ElapsedTime * 1000) + 1;

            // Collect all agent positions for flocking
            var agentPositions = new NativeList<float3>(Allocator.TempJob);
            var agentVelocities = new NativeList<float3>(Allocator.TempJob);

            foreach (var (transform, agent) in
                SystemAPI.Query<RefRO<LocalTransform>, RefRO<SteeringAgent>>())
            {
                agentPositions.Add(transform.ValueRO.Position);
                agentVelocities.Add(agent.ValueRO.Velocity);
            }

            new SteeringJob
            {
                DeltaTime = deltaTime,
                AgentPositions = agentPositions.AsArray(),
                AgentVelocities = agentVelocities.AsArray(),
                RandomSeed = randomSeed
            }.ScheduleParallel();

            state.Dependency.Complete();
            agentPositions.Dispose();
            agentVelocities.Dispose();
        }

        [BurstCompile]
        partial struct SteeringJob : IJobEntity
        {
            public float DeltaTime;
            [ReadOnly] public NativeArray<float3> AgentPositions;
            [ReadOnly] public NativeArray<float3> AgentVelocities;
            public uint RandomSeed;

            void Execute(
                ref LocalTransform transform,
                ref SteeringAgent agent,
                in SteeringWeights weights,
                in SteeringTarget target,
                [EntityIndexInQuery] int entityIndex)
            {
                var random = new Unity.Mathematics.Random(RandomSeed + (uint)entityIndex);

                float3 steeringForce = float3.zero;
                float3 targetPos = target.Position;

                // Seek
                if (weights.Seek > 0f)
                {
                    float3 seek = Seek(transform.Position, targetPos, agent.MaxSpeed);
                    steeringForce += seek * weights.Seek;
                }

                // Flee
                if (weights.Flee > 0f)
                {
                    float3 flee = Flee(transform.Position, targetPos, agent.MaxSpeed);
                    steeringForce += flee * weights.Flee;
                }

                // Arrive
                if (weights.Arrive > 0f)
                {
                    float3 arrive = Arrive(transform.Position, targetPos, agent.MaxSpeed, agent.SlowingRadius);
                    steeringForce += arrive * weights.Arrive;
                }

                // Wander
                if (weights.Wander > 0f)
                {
                    float3 wander = Wander(
                        transform.Position,
                        agent.Velocity,
                        ref agent.WanderAngle,
                        agent.WanderRadius,
                        agent.WanderDistance,
                        ref random
                    );
                    steeringForce += wander * weights.Wander;
                }

                // Flocking behaviors
                if (weights.Separation > 0f || weights.Cohesion > 0f || weights.Alignment > 0f)
                {
                    float3 separation = float3.zero;
                    float3 cohesion = float3.zero;
                    float3 alignment = float3.zero;
                    int neighborCount = 0;
                    float neighborRadius = 5f;

                    for (int i = 0; i < AgentPositions.Length; i++)
                    {
                        if (i == entityIndex) continue;

                        float3 toNeighbor = AgentPositions[i] - transform.Position;
                        float distance = math.length(toNeighbor);

                        if (distance < neighborRadius && distance > 0.001f)
                        {
                            // Separation - move away from close neighbors
                            separation -= math.normalize(toNeighbor) / distance;

                            // Cohesion - move toward center of neighbors
                            cohesion += AgentPositions[i];

                            // Alignment - match velocity of neighbors
                            alignment += AgentVelocities[i];

                            neighborCount++;
                        }
                    }

                    if (neighborCount > 0)
                    {
                        separation /= neighborCount;
                        if (math.lengthsq(separation) > 0.001f)
                            separation = math.normalize(separation) * agent.MaxSpeed;
                        steeringForce += separation * weights.Separation;

                        cohesion /= neighborCount;
                        float3 cohesionForce = Seek(transform.Position, cohesion, agent.MaxSpeed);
                        steeringForce += cohesionForce * weights.Cohesion;

                        alignment /= neighborCount;
                        float3 alignmentForce = alignment - agent.Velocity;
                        steeringForce += alignmentForce * weights.Alignment;
                    }
                }

                // Truncate steering force
                if (math.length(steeringForce) > agent.MaxForce)
                {
                    steeringForce = math.normalize(steeringForce) * agent.MaxForce;
                }

                // Apply steering
                float3 acceleration = steeringForce / agent.Mass;
                agent.Velocity += acceleration * DeltaTime;

                // Truncate velocity
                if (math.length(agent.Velocity) > agent.MaxSpeed)
                {
                    agent.Velocity = math.normalize(agent.Velocity) * agent.MaxSpeed;
                }

                // Update position
                transform.Position += agent.Velocity * DeltaTime;

                // Update rotation to face movement direction
                if (math.lengthsq(agent.Velocity) > 0.01f)
                {
                    float3 forward = math.normalize(new float3(agent.Velocity.x, 0f, agent.Velocity.z));
                    transform.Rotation = quaternion.LookRotationSafe(forward, math.up());
                }
            }

            private float3 Seek(float3 position, float3 target, float maxSpeed)
            {
                float3 desired = target - position;
                if (math.lengthsq(desired) > 0.001f)
                {
                    desired = math.normalize(desired) * maxSpeed;
                }
                return desired;
            }

            private float3 Flee(float3 position, float3 target, float maxSpeed)
            {
                return -Seek(position, target, maxSpeed);
            }

            private float3 Arrive(float3 position, float3 target, float maxSpeed, float slowingRadius)
            {
                float3 toTarget = target - position;
                float distance = math.length(toTarget);

                if (distance < 0.1f) return float3.zero;

                float speed = maxSpeed;
                if (distance < slowingRadius)
                {
                    speed = maxSpeed * (distance / slowingRadius);
                }

                return math.normalize(toTarget) * speed;
            }

            private float3 Wander(
                float3 position,
                float3 velocity,
                ref float wanderAngle,
                float radius,
                float distance,
                ref Unity.Mathematics.Random random)
            {
                // Update wander angle
                wanderAngle += random.NextFloat(-0.5f, 0.5f);

                // Calculate wander circle center
                float3 forward = math.lengthsq(velocity) > 0.001f
                    ? math.normalize(velocity)
                    : new float3(0f, 0f, 1f);

                float3 circleCenter = position + forward * distance;

                // Calculate displacement force
                float3 displacement = new float3(
                    math.cos(wanderAngle) * radius,
                    0f,
                    math.sin(wanderAngle) * radius
                );

                return circleCenter + displacement - position;
            }
        }
    }
}
