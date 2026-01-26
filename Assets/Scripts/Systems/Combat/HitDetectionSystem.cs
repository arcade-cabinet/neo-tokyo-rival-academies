using Unity.Burst;
using Unity.Collections;
using Unity.Entities;
using Unity.Mathematics;
using Unity.Transforms;
using Unity.Physics;
using NeoTokyo.Components.Core;
using NeoTokyo.Components.Combat;
using NeoTokyo.Components.Stats;

namespace NeoTokyo.Systems.Combat
{
    /// <summary>
    /// Hitbox configuration component
    /// </summary>
    public struct Hitbox : IComponentData
    {
        public float3 Offset;
        public float3 Size;
        public float Duration;
        public float RemainingTime;
        public bool IsActive;
    }

    /// <summary>
    /// Invincibility state component
    /// </summary>
    public struct Invincibility : IComponentData
    {
        public bool IsInvincible;
        public float EndsAt;

        public static Invincibility Apply(float durationSeconds, float currentTime)
        {
            return new Invincibility
            {
                IsInvincible = true,
                EndsAt = currentTime + durationSeconds
            };
        }

        public bool CheckInvincible(float currentTime)
        {
            return IsInvincible && currentTime < EndsAt;
        }
    }

    /// <summary>
    /// Hit registration event
    /// </summary>
    public struct HitEvent : IComponentData
    {
        public Entity Attacker;
        public Entity Target;
        public int Damage;
        public float3 HitPoint;
    }

    /// <summary>
    /// System that manages hitbox activation and timing
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    public partial struct HitboxTimingSystem : ISystem
    {
        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            float deltaTime = SystemAPI.Time.DeltaTime;

            new UpdateHitboxTimingJob
            {
                DeltaTime = deltaTime
            }.ScheduleParallel();
        }

        [BurstCompile]
        partial struct UpdateHitboxTimingJob : IJobEntity
        {
            public float DeltaTime;

            void Execute(ref Hitbox hitbox)
            {
                if (!hitbox.IsActive) return;

                hitbox.RemainingTime -= DeltaTime;
                if (hitbox.RemainingTime <= 0f)
                {
                    hitbox.IsActive = false;
                    hitbox.RemainingTime = 0f;
                }
            }
        }
    }

    /// <summary>
    /// System that updates invincibility state
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    public partial struct InvincibilitySystem : ISystem
    {
        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            float currentTime = (float)SystemAPI.Time.ElapsedTime;

            new UpdateInvincibilityJob
            {
                CurrentTime = currentTime
            }.ScheduleParallel();
        }

        [BurstCompile]
        partial struct UpdateInvincibilityJob : IJobEntity
        {
            public float CurrentTime;

            void Execute(ref Invincibility invincibility)
            {
                if (invincibility.IsInvincible && CurrentTime >= invincibility.EndsAt)
                {
                    invincibility.IsInvincible = false;
                }
            }
        }
    }

    /// <summary>
    /// System that performs hit detection between attackers and targets
    /// Uses AABB intersection for hitbox overlap detection
    /// </summary>
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateAfter(typeof(HitboxTimingSystem))]
    public partial class HitDetectionSystem : SystemBase
    {
        protected override void OnUpdate()
        {
            var ecb = new EntityCommandBuffer(Allocator.TempJob);
            float currentTime = (float)SystemAPI.Time.ElapsedTime;

            // Collect all active hitboxes (attackers)
            var attackerList = new NativeList<AttackerData>(Allocator.TempJob);

            foreach (var (hitbox, transform, damageSource, entity) in
                SystemAPI.Query<RefRO<Hitbox>, RefRO<LocalTransform>, RefRO<DamageSource>>()
                    .WithEntityAccess())
            {
                if (hitbox.ValueRO.IsActive)
                {
                    attackerList.Add(new AttackerData
                    {
                        Entity = entity,
                        Position = transform.ValueRO.Position,
                        Offset = hitbox.ValueRO.Offset,
                        Size = hitbox.ValueRO.Size,
                        Damage = damageSource.ValueRO.BaseDamage
                    });
                }
            }

            // Check each attacker against potential targets
            foreach (var (transform, invincibility, stats, targetEntity) in
                SystemAPI.Query<RefRO<LocalTransform>, RefRW<Invincibility>, RefRW<RPGStats>>()
                    .WithAll<EnemyTag>()
                    .WithEntityAccess())
            {
                // Skip if invincible
                if (invincibility.ValueRO.CheckInvincible(currentTime))
                    continue;

                float3 targetPos = transform.ValueRO.Position;
                float targetRadius = 0.5f; // Default target radius

                foreach (var attacker in attackerList)
                {
                    if (CheckHitboxOverlap(attacker, targetPos, targetRadius))
                    {
                        // Register hit
                        stats.ValueRW.Structure = math.max(0, stats.ValueRO.Structure - attacker.Damage);

                        // Apply invincibility frames (0.5 seconds)
                        invincibility.ValueRW = Invincibility.Apply(0.5f, currentTime);

                        // Create hit event
                        var hitEventEntity = ecb.CreateEntity();
                        ecb.AddComponent(hitEventEntity, new HitEvent
                        {
                            Attacker = attacker.Entity,
                            Target = targetEntity,
                            Damage = attacker.Damage,
                            HitPoint = targetPos
                        });

                        break; // Only register one hit per frame
                    }
                }
            }

            // Also check player being hit by enemies
            foreach (var (transform, invincibility, stats, playerEntity) in
                SystemAPI.Query<RefRO<LocalTransform>, RefRW<Invincibility>, RefRW<RPGStats>>()
                    .WithAll<PlayerTag>()
                    .WithEntityAccess())
            {
                if (invincibility.ValueRO.CheckInvincible(currentTime))
                    continue;

                // Check against enemy hitboxes
                foreach (var (hitbox, enemyTransform, damageSource, enemyEntity) in
                    SystemAPI.Query<RefRO<Hitbox>, RefRO<LocalTransform>, RefRO<DamageSource>>()
                        .WithAll<EnemyTag>()
                        .WithEntityAccess())
                {
                    if (!hitbox.ValueRO.IsActive) continue;

                    var attackerData = new AttackerData
                    {
                        Entity = enemyEntity,
                        Position = enemyTransform.ValueRO.Position,
                        Offset = hitbox.ValueRO.Offset,
                        Size = hitbox.ValueRO.Size,
                        Damage = damageSource.ValueRO.BaseDamage
                    };

                    if (CheckHitboxOverlap(attackerData, transform.ValueRO.Position, 0.5f))
                    {
                        stats.ValueRW.Structure = math.max(0, stats.ValueRO.Structure - attackerData.Damage);
                        invincibility.ValueRW = Invincibility.Apply(0.5f, currentTime);

                        var hitEventEntity = ecb.CreateEntity();
                        ecb.AddComponent(hitEventEntity, new HitEvent
                        {
                            Attacker = enemyEntity,
                            Target = playerEntity,
                            Damage = attackerData.Damage,
                            HitPoint = transform.ValueRO.Position
                        });

                        break;
                    }
                }
            }

            attackerList.Dispose();
            ecb.Playback(EntityManager);
            ecb.Dispose();
        }

        private struct AttackerData
        {
            public Entity Entity;
            public float3 Position;
            public float3 Offset;
            public float3 Size;
            public int Damage;
        }

        private static bool CheckHitboxOverlap(AttackerData attacker, float3 targetPos, float targetRadius)
        {
            // Calculate hitbox world position
            float3 hitboxPos = attacker.Position + attacker.Offset;

            // AABB bounds
            float3 hitboxMin = hitboxPos - attacker.Size * 0.5f;
            float3 hitboxMax = hitboxPos + attacker.Size * 0.5f;

            // Target bounds (simplified sphere as AABB)
            float3 targetMin = targetPos - new float3(targetRadius);
            float3 targetMax = targetPos + new float3(targetRadius);

            // AABB intersection
            return hitboxMin.x <= targetMax.x && hitboxMax.x >= targetMin.x &&
                   hitboxMin.y <= targetMax.y && hitboxMax.y >= targetMin.y &&
                   hitboxMin.z <= targetMax.z && hitboxMax.z >= targetMin.z;
        }
    }

    /// <summary>
    /// System that cleans up hit events after processing
    /// </summary>
    [UpdateInGroup(typeof(LateSimulationSystemGroup))]
    public partial class HitEventCleanupSystem : SystemBase
    {
        protected override void OnUpdate()
        {
            var ecb = new EntityCommandBuffer(Allocator.TempJob);

            foreach (var (evt, entity) in
                SystemAPI.Query<RefRO<HitEvent>>()
                    .WithEntityAccess())
            {
                ecb.DestroyEntity(entity);
            }

            ecb.Playback(EntityManager);
            ecb.Dispose();
        }
    }
}
