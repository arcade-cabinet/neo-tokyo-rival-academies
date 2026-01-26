using Unity.Burst;
using Unity.Collections;
using Unity.Entities;
using Unity.Mathematics;
using Unity.Transforms;
using NeoTokyo.Components.AI;
using NeoTokyo.Components.Core;

namespace NeoTokyo.Systems.AI
{
    /// <summary>
    /// System that processes threat events and updates threat tables
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    public partial struct ThreatProcessingSystem : ISystem
    {
        public void OnCreate(ref SystemState state)
        {
            state.RequireForUpdate<ThreatGeneratedEvent>();
            state.RequireForUpdate<EndSimulationEntityCommandBufferSystem.Singleton>();
        }

        public void OnUpdate(ref SystemState state)
        {
            var ecb = SystemAPI.GetSingleton<EndSimulationEntityCommandBufferSystem.Singleton>()
                .CreateCommandBuffer(state.WorldUnmanaged);
            float currentTime = (float)SystemAPI.Time.ElapsedTime;

            // Process threat events
            foreach (var (evt, eventEntity) in
                SystemAPI.Query<RefRO<ThreatGeneratedEvent>>()
                    .WithEntityAccess())
            {
                if (!SystemAPI.HasComponent<ThreatTable>(evt.ValueRO.Source))
                {
                    ecb.DestroyEntity(eventEntity);
                    continue;
                }

                // Get threat table and buffer
                if (!SystemAPI.HasBuffer<ThreatEntry>(evt.ValueRO.Source))
                {
                    ecb.DestroyEntity(eventEntity);
                    continue;
                }

                var threatBuffer = SystemAPI.GetBuffer<ThreatEntry>(evt.ValueRO.Source);
                var threatTable = SystemAPI.GetComponent<ThreatTable>(evt.ValueRO.Source);

                // Find or create threat entry for target
                bool found = false;
                for (int i = 0; i < threatBuffer.Length; i++)
                {
                    if (threatBuffer[i].TargetEntity == evt.ValueRO.Target)
                    {
                        var entry = threatBuffer[i];
                        entry.ThreatValue += CalculateThreatAmount(evt.ValueRO);
                        entry.LastUpdateTime = currentTime;
                        threatBuffer[i] = entry;
                        found = true;
                        break;
                    }
                }

                if (!found)
                {
                    threatBuffer.Add(new ThreatEntry
                    {
                        TargetEntity = evt.ValueRO.Target,
                        ThreatValue = CalculateThreatAmount(evt.ValueRO),
                        LastUpdateTime = currentTime
                    });
                }

                // Mark as in combat
                if (!threatTable.InCombat)
                {
                    threatTable.InCombat = true;
                    ecb.SetComponent(evt.ValueRO.Source, threatTable);
                }

                ecb.DestroyEntity(eventEntity);
            }
        }

        private float CalculateThreatAmount(ThreatGeneratedEvent evt)
        {
            float multiplier = evt.Type switch
            {
                ThreatType.Damage => 1.0f,
                ThreatType.Healing => 0.5f,
                ThreatType.Taunt => 2.0f,
                ThreatType.Proximity => 0.1f,
                _ => 1.0f
            };
            return evt.Amount * multiplier;
        }
    }

    /// <summary>
    /// System that decays threat over time and selects targets
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateAfter(typeof(ThreatProcessingSystem))]
    public partial struct ThreatDecayAndTargetingSystem : ISystem
    {
        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            float deltaTime = SystemAPI.Time.DeltaTime;
            float currentTime = (float)SystemAPI.Time.ElapsedTime;

            new DecayAndTargetJob
            {
                DeltaTime = deltaTime,
                CurrentTime = currentTime
            }.Schedule();
        }

        [BurstCompile]
        partial struct DecayAndTargetJob : IJobEntity
        {
            public float DeltaTime;
            public float CurrentTime;

            void Execute(
                ref ThreatTable threatTable,
                ref DynamicBuffer<ThreatEntry> entries)
            {
                if (entries.Length == 0)
                {
                    threatTable.InCombat = false;
                    threatTable.CurrentTarget = Entity.Null;
                    return;
                }

                Entity highestThreatTarget = Entity.Null;
                float highestThreat = 0f;

                // Decay threat and find highest
                for (int i = entries.Length - 1; i >= 0; i--)
                {
                    var entry = entries[i];

                    // Decay based on time since last update
                    float timeSinceUpdate = CurrentTime - entry.LastUpdateTime;
                    entry.ThreatValue -= threatTable.ThreatDecayRate * timeSinceUpdate;
                    entry.LastUpdateTime = CurrentTime;

                    if (entry.ThreatValue <= 0f)
                    {
                        entries.RemoveAt(i);
                        continue;
                    }

                    entries[i] = entry;

                    if (entry.ThreatValue > highestThreat)
                    {
                        highestThreat = entry.ThreatValue;
                        highestThreatTarget = entry.TargetEntity;
                    }
                }

                threatTable.CurrentTarget = highestThreatTarget;
                threatTable.InCombat = entries.Length > 0;
            }
        }
    }

    /// <summary>
    /// System that handles perception and aggro detection
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    public partial struct PerceptionSystem : ISystem
    {
        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            var playerPositions = new NativeList<float3>(Allocator.TempJob);
            var playerEntities = new NativeList<Entity>(Allocator.TempJob);

            // Collect player positions
            foreach (var (transform, entity) in
                SystemAPI.Query<RefRO<LocalTransform>>()
                    .WithAll<PlayerTag>()
                    .WithEntityAccess())
            {
                playerPositions.Add(transform.ValueRO.Position);
                playerEntities.Add(entity);
            }

            new PerceptionJob
            {
                PlayerPositions = playerPositions.AsArray(),
                PlayerEntities = playerEntities.AsArray()
            }.ScheduleParallel();

            state.Dependency.Complete();
            playerPositions.Dispose();
            playerEntities.Dispose();
        }

        [BurstCompile]
        partial struct PerceptionJob : IJobEntity
        {
            [ReadOnly] public NativeArray<float3> PlayerPositions;
            [ReadOnly] public NativeArray<Entity> PlayerEntities;

            void Execute(
                in LocalTransform transform,
                ref Perception perception,
                ref ThreatTable threatTable)
            {
                perception.CanSeeTarget = false;
                perception.CanHearTarget = false;

                for (int i = 0; i < PlayerPositions.Length; i++)
                {
                    float3 toPlayer = PlayerPositions[i] - transform.Position;
                    float distance = math.length(toPlayer);

                    // Check hearing range
                    if (distance <= perception.HearingRange)
                    {
                        perception.CanHearTarget = true;
                        perception.LastKnownTargetPosition = PlayerPositions[i];
                    }

                    // Check sight range and angle
                    if (distance <= perception.SightRange)
                    {
                        float3 forward = math.forward(transform.Rotation);
                        float3 dirToPlayer = math.normalize(toPlayer);
                        float dot = math.dot(forward, dirToPlayer);
                        float angle = math.degrees(math.acos(dot));

                        if (angle <= perception.SightAngle * 0.5f)
                        {
                            perception.CanSeeTarget = true;
                            perception.LastKnownTargetPosition = PlayerPositions[i];
                        }
                    }
                }
            }
        }
    }
}
