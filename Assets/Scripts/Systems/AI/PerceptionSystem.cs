using Unity.Burst;
using Unity.Collections;
using Unity.Entities;
using Unity.Mathematics;
using Unity.Transforms;
using Unity.Physics;
using Unity.Physics.Systems;
using NeoTokyo.Components.AI;
using NeoTokyo.Components.Core;

namespace NeoTokyo.Systems.AI
{
    /// <summary>
    /// System group for all perception-related systems.
    /// Runs after physics to use raycast results.
    /// </summary>
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateAfter(typeof(ExportPhysicsWorld))]
    public partial class PerceptionSystemGroup : ComponentSystemGroup { }

    /// <summary>
    /// Main perception system that handles vision cone detection, line-of-sight checks,
    /// hearing detection, and target memory management.
    ///
    /// Features:
    /// - Vision cone detection using dot product
    /// - Line-of-sight raycast checks using Unity Physics
    /// - Hearing detection (distance-based with sound emission)
    /// - Target memory with decay
    /// - Integration with ThreatSystem via events
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(PerceptionSystemGroup))]
    public partial struct AdvancedPerceptionSystem : ISystem
    {
        private ComponentLookup<LocalTransform> _transformLookup;
        private ComponentLookup<SoundEmitter> _soundEmitterLookup;
        private ComponentLookup<PlayerTag> _playerTagLookup;

        [BurstCompile]
        public void OnCreate(ref SystemState state)
        {
            state.RequireForUpdate<PerceptionState>();
            state.RequireForUpdate<PhysicsWorldSingleton>();

            _transformLookup = state.GetComponentLookup<LocalTransform>(true);
            _soundEmitterLookup = state.GetComponentLookup<SoundEmitter>(true);
            _playerTagLookup = state.GetComponentLookup<PlayerTag>(true);
        }

        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            _transformLookup.Update(ref state);
            _soundEmitterLookup.Update(ref state);
            _playerTagLookup.Update(ref state);

            float deltaTime = SystemAPI.Time.DeltaTime;
            double currentTime = SystemAPI.Time.ElapsedTime;

            var physicsWorld = SystemAPI.GetSingleton<PhysicsWorldSingleton>();

            // Collect potential targets (players and other perceivable entities)
            var potentialTargets = new NativeList<TargetInfo>(Allocator.TempJob);

            foreach (var (transform, entity) in
                SystemAPI.Query<RefRO<LocalTransform>>()
                    .WithAll<PlayerTag>()
                    .WithEntityAccess())
            {
                float3 velocity = float3.zero;
                // In a full implementation, would get velocity from physics body

                potentialTargets.Add(new TargetInfo
                {
                    Entity = entity,
                    Position = transform.ValueRO.Position,
                    Velocity = velocity,
                    IsPlayer = true
                });
            }

            var ecb = new EntityCommandBuffer(Allocator.TempJob);

            // Process perception for all AI entities
            new PerceptionUpdateJob
            {
                DeltaTime = deltaTime,
                CurrentTime = currentTime,
                PhysicsWorld = physicsWorld.PhysicsWorld,
                PotentialTargets = potentialTargets.AsArray(),
                TransformLookup = _transformLookup,
                SoundEmitterLookup = _soundEmitterLookup,
                Ecb = ecb.AsParallelWriter()
            }.ScheduleParallel();

            state.Dependency.Complete();

            ecb.Playback(state.EntityManager);
            ecb.Dispose();
            potentialTargets.Dispose();
        }

        /// <summary>
        /// Lightweight struct for passing target information to jobs.
        /// </summary>
        private struct TargetInfo
        {
            public Entity Entity;
            public float3 Position;
            public float3 Velocity;
            public bool IsPlayer;
        }

        [BurstCompile]
        private partial struct PerceptionUpdateJob : IJobEntity
        {
            public float DeltaTime;
            public double CurrentTime;

            [ReadOnly] public PhysicsWorld PhysicsWorld;
            [ReadOnly] public NativeArray<TargetInfo> PotentialTargets;
            [ReadOnly] public ComponentLookup<LocalTransform> TransformLookup;
            [ReadOnly] public ComponentLookup<SoundEmitter> SoundEmitterLookup;

            public EntityCommandBuffer.ParallelWriter Ecb;

            void Execute(
                Entity entity,
                [EntityIndexInQuery] int sortKey,
                ref PerceptionState perception,
                ref SightCone sightCone,
                ref LineOfSight lineOfSight,
                ref HearingState hearing,
                ref DynamicBuffer<PerceivedTarget> perceivedTargets,
                in LocalTransform transform)
            {
                if (!perception.IsActive) return;

                // Update timing
                perception.TimeSinceLastUpdate += DeltaTime;
                if (perception.TimeSinceLastUpdate < perception.UpdateInterval) return;
                perception.TimeSinceLastUpdate = 0f;

                // Update sight cone direction based on entity rotation
                sightCone.Direction = math.forward(transform.Rotation);

                float3 eyePosition = transform.Position + new float3(0f, sightCone.EyeHeight, 0f);

                // Reset hearing state for this update
                hearing.HearsSound = false;
                hearing.SoundIntensity = 0f;

                // Process each potential target
                for (int i = 0; i < PotentialTargets.Length; i++)
                {
                    var targetInfo = PotentialTargets[i];

                    // Skip self
                    if (targetInfo.Entity == entity) continue;

                    float3 toTarget = targetInfo.Position - eyePosition;
                    float distance = math.length(toTarget);

                    // Check vision
                    bool inVisionCone = false;
                    bool inPeripheral = false;
                    bool hasLineOfSight = false;

                    if (distance <= perception.SightRange && distance >= sightCone.NearPlane)
                    {
                        inVisionCone = PerceptionHelpers.IsInVisionCone(
                            eyePosition,
                            sightCone.Direction,
                            sightCone.HalfAngle,
                            sightCone.Range,
                            targetInfo.Position
                        );
                    }

                    if (!inVisionCone && distance <= perception.PeripheralRange)
                    {
                        inPeripheral = PerceptionHelpers.IsInVisionCone(
                            eyePosition,
                            sightCone.Direction,
                            perception.PeripheralAngle * 0.5f,
                            perception.PeripheralRange,
                            targetInfo.Position
                        );
                    }

                    // Perform line-of-sight raycast if in vision cone
                    if (inVisionCone || inPeripheral)
                    {
                        hasLineOfSight = CheckLineOfSight(
                            eyePosition,
                            targetInfo.Position,
                            targetInfo.Entity,
                            ref lineOfSight
                        );
                    }

                    // Check hearing
                    bool canHear = false;
                    float soundIntensity = 0f;

                    if (distance <= perception.HearingRange)
                    {
                        if (SoundEmitterLookup.HasComponent(targetInfo.Entity))
                        {
                            var emitter = SoundEmitterLookup[targetInfo.Entity];
                            if (emitter.IsEmitting)
                            {
                                float effectiveRange = emitter.EffectiveRange;
                                if (distance <= effectiveRange)
                                {
                                    canHear = true;
                                    soundIntensity = 1f - (distance / effectiveRange);
                                }
                            }
                        }
                        else
                        {
                            // Default: players always emit footstep sounds at base range
                            if (targetInfo.IsPlayer && math.length(targetInfo.Velocity) > 0.1f)
                            {
                                canHear = distance <= perception.HearingRange * 0.5f;
                                soundIntensity = canHear ?
                                    (1f - (distance / (perception.HearingRange * 0.5f))) : 0f;
                            }
                        }
                    }

                    // Update hearing state
                    if (canHear && soundIntensity > hearing.SoundIntensity)
                    {
                        hearing.HearsSound = true;
                        hearing.SoundDirection = math.normalize(toTarget);
                        hearing.SoundDistance = distance;
                        hearing.SoundIntensity = soundIntensity;
                        hearing.SoundSource = targetInfo.Entity;
                        hearing.DetectedSoundType = SoundType.Footstep;
                        hearing.LastSoundTime = CurrentTime;
                    }

                    // Determine if target is detected
                    bool isDetected = (inVisionCone && hasLineOfSight) || (inPeripheral && hasLineOfSight) || canHear;
                    bool isVisible = (inVisionCone || inPeripheral) && hasLineOfSight;

                    // Update perceived targets buffer
                    UpdatePerceivedTarget(
                        ref perceivedTargets,
                        targetInfo,
                        isDetected,
                        isVisible,
                        canHear,
                        distance,
                        perception.MemoryDuration,
                        CurrentTime,
                        DeltaTime,
                        entity,
                        sortKey,
                        ref Ecb
                    );
                }

                // Decay targets that weren't updated
                DecayPerceivedTargets(
                    ref perceivedTargets,
                    perception.MemoryDuration,
                    DeltaTime,
                    entity,
                    sortKey,
                    ref Ecb
                );

                // Update alert level
                if (perceivedTargets.Length > 0)
                {
                    // Find highest threat
                    float maxThreat = 0f;
                    for (int i = 0; i < perceivedTargets.Length; i++)
                    {
                        if (perceivedTargets[i].ThreatLevel > maxThreat)
                        {
                            maxThreat = perceivedTargets[i].ThreatLevel;
                        }
                    }
                    perception.AlertLevel = math.min(1f, perception.AlertLevel + maxThreat / 100f * DeltaTime * 2f);
                }
                else
                {
                    perception.AlertLevel = math.max(0f, perception.AlertLevel - perception.AlertDecayRate * DeltaTime);
                }
            }

            private bool CheckLineOfSight(
                float3 origin,
                float3 target,
                Entity targetEntity,
                ref LineOfSight los)
            {
                float3 direction = target - origin;
                float distance = math.length(direction);

                if (distance < 0.01f)
                {
                    los.HasLOS = true;
                    los.Distance = 0f;
                    los.BlockingEntity = Entity.Null;
                    return true;
                }

                direction = direction / distance;

                var rayInput = new RaycastInput
                {
                    Start = origin,
                    End = target,
                    Filter = new CollisionFilter
                    {
                        BelongsTo = ~0u,
                        CollidesWith = ~0u,
                        GroupIndex = 0
                    }
                };

                if (PhysicsWorld.CastRay(rayInput, out var hit))
                {
                    // Check if we hit the target or something in between
                    // Use distance comparison since we can't directly compare entities in physics
                    float hitDistance = hit.Fraction * distance;

                    // If hit is very close to target distance, we have LOS
                    if (math.abs(hitDistance - distance) < 0.5f)
                    {
                        los.HasLOS = true;
                        los.Distance = distance;
                        los.BlockingEntity = Entity.Null;
                        los.LastCheckTime = CurrentTime;
                        return true;
                    }
                    else
                    {
                        // Something is blocking
                        los.HasLOS = false;
                        los.Distance = hitDistance;
                        los.BlockPoint = hit.Position;
                        los.BlockNormal = hit.SurfaceNormal;
                        los.LastCheckTime = CurrentTime;
                        return false;
                    }
                }
                else
                {
                    // No hit means clear line of sight
                    los.HasLOS = true;
                    los.Distance = distance;
                    los.BlockingEntity = Entity.Null;
                    los.LastCheckTime = CurrentTime;
                    return true;
                }
            }

            private void UpdatePerceivedTarget(
                ref DynamicBuffer<PerceivedTarget> targets,
                TargetInfo targetInfo,
                bool isDetected,
                bool isVisible,
                bool canHear,
                float distance,
                float memoryDuration,
                double currentTime,
                float deltaTime,
                Entity detectorEntity,
                int sortKey,
                ref EntityCommandBuffer.ParallelWriter ecb)
            {
                // Find existing entry
                int existingIndex = -1;
                for (int i = 0; i < targets.Length; i++)
                {
                    if (targets[i].Target == targetInfo.Entity)
                    {
                        existingIndex = i;
                        break;
                    }
                }

                if (isDetected)
                {
                    float threatLevel = PerceptionHelpers.CalculateThreatLevel(
                        distance,
                        15f, // Max range for threat calc
                        false, // Would check weapon component
                        math.length(targetInfo.Velocity) > 0.1f && math.dot(math.normalize(targetInfo.Velocity), math.normalize(targetInfo.Position)) < 0
                    );

                    if (existingIndex >= 0)
                    {
                        // Update existing
                        var entry = targets[existingIndex];
                        entry.LastKnownPosition = targetInfo.Position;
                        entry.LastKnownVelocity = targetInfo.Velocity;
                        entry.LastKnownDistance = distance;
                        entry.IsCurrentlyVisible = isVisible;
                        entry.DetectedByHearing = canHear && !isVisible;
                        entry.ThreatLevel = math.max(entry.ThreatLevel, threatLevel);

                        if (isVisible)
                        {
                            entry.TimeSinceLastSeen = 0f;
                        }

                        targets[existingIndex] = entry;
                    }
                    else
                    {
                        // New target detected
                        targets.Add(new PerceivedTarget
                        {
                            Target = targetInfo.Entity,
                            LastKnownPosition = targetInfo.Position,
                            LastKnownVelocity = targetInfo.Velocity,
                            LastKnownDistance = distance,
                            TimeSinceLastSeen = isVisible ? 0f : memoryDuration * 0.5f,
                            IsCurrentlyVisible = isVisible,
                            DetectedByHearing = canHear && !isVisible,
                            ThreatLevel = threatLevel,
                            FirstDetectedTime = currentTime,
                            IsPrimaryTarget = targets.Length == 0
                        });

                        // Fire detection event
                        var eventEntity = ecb.CreateEntity(sortKey);
                        ecb.AddComponent(sortKey, eventEntity, new TargetDetectedEvent
                        {
                            Detector = detectorEntity,
                            Target = targetInfo.Entity,
                            Method = isVisible ? DetectionMethod.Sight :
                                     canHear ? DetectionMethod.Hearing : DetectionMethod.Peripheral,
                            ThreatLevel = threatLevel,
                            DetectedPosition = targetInfo.Position
                        });
                    }
                }
                else if (existingIndex >= 0)
                {
                    // Target not currently detected, update memory
                    var entry = targets[existingIndex];
                    entry.IsCurrentlyVisible = false;
                    entry.TimeSinceLastSeen += deltaTime;

                    // Update threat decay
                    entry.ThreatLevel = math.max(0f, entry.ThreatLevel - deltaTime * 5f);

                    targets[existingIndex] = entry;
                }
            }

            private void DecayPerceivedTargets(
                ref DynamicBuffer<PerceivedTarget> targets,
                float memoryDuration,
                float deltaTime,
                Entity detectorEntity,
                int sortKey,
                ref EntityCommandBuffer.ParallelWriter ecb)
            {
                // Remove targets that have been forgotten
                for (int i = targets.Length - 1; i >= 0; i--)
                {
                    var target = targets[i];

                    if (target.TimeSinceLastSeen >= memoryDuration)
                    {
                        // Fire lost event
                        var eventEntity = ecb.CreateEntity(sortKey);
                        ecb.AddComponent(sortKey, eventEntity, new TargetLostEvent
                        {
                            Detector = detectorEntity,
                            Target = target.Target,
                            LastKnownPosition = target.LastKnownPosition,
                            TrackingDuration = (float)(target.TimeSinceLastSeen)
                        });

                        targets.RemoveAt(i);
                    }
                }

                // Update primary target
                if (targets.Length > 0)
                {
                    int primaryIndex = 0;
                    float highestThreat = targets[0].ThreatLevel;

                    for (int i = 1; i < targets.Length; i++)
                    {
                        var entry = targets[i];
                        entry.IsPrimaryTarget = false;
                        targets[i] = entry;

                        if (entry.ThreatLevel > highestThreat)
                        {
                            highestThreat = entry.ThreatLevel;
                            primaryIndex = i;
                        }
                    }

                    var primary = targets[primaryIndex];
                    primary.IsPrimaryTarget = true;
                    targets[primaryIndex] = primary;
                }
            }
        }
    }

    /// <summary>
    /// System that integrates perception events with the threat system.
    /// Converts TargetDetectedEvent into ThreatGeneratedEvent for the threat table.
    /// </summary>
    [UpdateInGroup(typeof(PerceptionSystemGroup))]
    [UpdateAfter(typeof(AdvancedPerceptionSystem))]
    public partial struct PerceptionThreatIntegrationSystem : ISystem
    {
        public void OnUpdate(ref SystemState state)
        {
            var ecb = new EntityCommandBuffer(Allocator.TempJob);

            // Convert detection events to threat events
            foreach (var (detectionEvent, eventEntity) in
                SystemAPI.Query<RefRO<TargetDetectedEvent>>()
                    .WithEntityAccess())
            {
                // Create threat event for the threat system
                if (SystemAPI.HasComponent<ThreatTable>(detectionEvent.ValueRO.Detector))
                {
                    var threatEventEntity = ecb.CreateEntity();
                    ecb.AddComponent(threatEventEntity, new ThreatGeneratedEvent
                    {
                        Source = detectionEvent.ValueRO.Detector,
                        Target = detectionEvent.ValueRO.Target,
                        Amount = detectionEvent.ValueRO.ThreatLevel,
                        Type = ThreatType.Proximity
                    });
                }

                ecb.DestroyEntity(eventEntity);
            }

            // Cleanup lost events
            foreach (var (_, eventEntity) in
                SystemAPI.Query<RefRO<TargetLostEvent>>()
                    .WithEntityAccess())
            {
                ecb.DestroyEntity(eventEntity);
            }

            ecb.Playback(state.EntityManager);
            ecb.Dispose();
        }
    }

    /// <summary>
    /// System that processes perception scan requests for immediate updates.
    /// </summary>
    [UpdateInGroup(typeof(PerceptionSystemGroup))]
    public partial struct PerceptionScanRequestSystem : ISystem
    {
        public void OnUpdate(ref SystemState state)
        {
            var ecb = new EntityCommandBuffer(Allocator.TempJob);

            foreach (var (request, eventEntity) in
                SystemAPI.Query<RefRO<PerceptionScanRequest>>()
                    .WithEntityAccess())
            {
                // Reset the perception update timer to force immediate scan
                if (SystemAPI.HasComponent<PerceptionState>(request.ValueRO.RequestingEntity))
                {
                    var perception = SystemAPI.GetComponentRW<PerceptionState>(request.ValueRO.RequestingEntity);
                    perception.ValueRW.TimeSinceLastUpdate = perception.ValueRO.UpdateInterval;
                }

                ecb.DestroyEntity(eventEntity);
            }

            ecb.Playback(state.EntityManager);
            ecb.Dispose();
        }
    }

    /// <summary>
    /// Static helpers for perception system usage.
    /// </summary>
    public static class PerceptionSystemHelpers
    {
        /// <summary>
        /// Add full perception capabilities to an entity.
        /// </summary>
        public static void AddPerception(
            EntityManager em,
            Entity entity,
            PerceptionState state = default,
            SightCone cone = default,
            bool includeHearing = true)
        {
            if (state.Equals(default(PerceptionState)))
            {
                state = PerceptionState.Default;
            }

            if (cone.Equals(default(SightCone)))
            {
                cone = SightCone.Default;
            }

            em.AddComponentData(entity, state);
            em.AddComponentData(entity, cone);
            em.AddComponentData(entity, new LineOfSight());
            em.AddBuffer<PerceivedTarget>(entity);

            if (includeHearing)
            {
                em.AddComponentData(entity, new HearingState());
            }
        }

        /// <summary>
        /// Add sound emitter to an entity.
        /// </summary>
        public static void AddSoundEmitter(
            EntityManager em,
            Entity entity,
            float baseVolume = 1f,
            SoundType defaultType = SoundType.Footstep)
        {
            em.AddComponentData(entity, new SoundEmitter
            {
                BaseVolume = baseVolume,
                CurrentMultiplier = 1f,
                SoundType = defaultType,
                IsEmitting = false
            });
        }

        /// <summary>
        /// Request an immediate perception scan for an entity.
        /// </summary>
        public static void RequestScan(EntityManager em, Entity entity, bool forceScan = false)
        {
            var requestEntity = em.CreateEntity();
            em.AddComponentData(requestEntity, new PerceptionScanRequest
            {
                RequestingEntity = entity,
                ForceScan = forceScan,
                SpecificTarget = Entity.Null
            });
        }

        /// <summary>
        /// Get the primary target from perceived targets buffer.
        /// </summary>
        public static bool TryGetPrimaryTarget(
            DynamicBuffer<PerceivedTarget> targets,
            out PerceivedTarget primaryTarget)
        {
            primaryTarget = default;

            for (int i = 0; i < targets.Length; i++)
            {
                if (targets[i].IsPrimaryTarget)
                {
                    primaryTarget = targets[i];
                    return true;
                }
            }

            // Fallback: return highest threat if no primary marked
            if (targets.Length > 0)
            {
                float highestThreat = -1f;
                int bestIndex = 0;

                for (int i = 0; i < targets.Length; i++)
                {
                    if (targets[i].ThreatLevel > highestThreat)
                    {
                        highestThreat = targets[i].ThreatLevel;
                        bestIndex = i;
                    }
                }

                primaryTarget = targets[bestIndex];
                return true;
            }

            return false;
        }
    }
}
