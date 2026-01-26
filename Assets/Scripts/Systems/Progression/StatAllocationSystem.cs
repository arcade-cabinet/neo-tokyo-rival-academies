using Unity.Burst;
using Unity.Collections;
using Unity.Entities;
using Unity.Mathematics;
using NeoTokyo.Components.Stats;

namespace NeoTokyo.Systems.Progression
{
    /// <summary>
    /// Stat point allocation request
    /// </summary>
    public struct AllocateStatPointRequest : IComponentData
    {
        public Entity TargetEntity;
        public StatType StatType;
        public int Points;
    }

    /// <summary>
    /// Types of stats that can be allocated
    /// </summary>
    public enum StatType : byte
    {
        Structure = 0,
        Ignition = 1,
        Logic = 2,
        Flow = 3
    }

    /// <summary>
    /// Unallocated stat points available
    /// </summary>
    public struct UnallocatedPoints : IComponentData
    {
        public int Points;
    }

    /// <summary>
    /// System that handles stat point allocation.
    /// Equivalent to TypeScript StatAllocation.ts
    /// </summary>
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    public partial class StatAllocationSystem : SystemBase
    {
        // Points gained per level
        private const int POINTS_PER_LEVEL = 3;

        // Maximum points per stat
        private const int MAX_STAT_VALUE = 100;

        protected override void OnCreate()
        {
            RequireForUpdate<EndSimulationEntityCommandBufferSystem.Singleton>();
        }

        protected override void OnUpdate()
        {
            var ecb = SystemAPI.GetSingleton<EndSimulationEntityCommandBufferSystem.Singleton>()
                .CreateCommandBuffer(World.Unmanaged);

            // Process allocation requests
            foreach (var (request, entity) in
                SystemAPI.Query<RefRO<AllocateStatPointRequest>>()
                    .WithEntityAccess())
            {
                ProcessAllocation(request.ValueRO, ref ecb);
                ecb.DestroyEntity(entity);
            }
        }

        private void ProcessAllocation(AllocateStatPointRequest request, ref EntityCommandBuffer ecb)
        {
            if (!SystemAPI.HasComponent<RPGStats>(request.TargetEntity) ||
                !SystemAPI.HasComponent<UnallocatedPoints>(request.TargetEntity))
            {
                return;
            }

            var stats = SystemAPI.GetComponent<RPGStats>(request.TargetEntity);
            var unallocated = SystemAPI.GetComponent<UnallocatedPoints>(request.TargetEntity);

            // Validate points available
            if (unallocated.Points < request.Points || request.Points <= 0)
            {
                return;
            }

            // Apply allocation based on stat type
            int actualPointsUsed = 0;
            switch (request.StatType)
            {
                case StatType.Structure:
                    actualPointsUsed = AllocateToStat(ref stats.Structure, request.Points);
                    break;
                case StatType.Ignition:
                    actualPointsUsed = AllocateToStat(ref stats.Ignition, request.Points);
                    break;
                case StatType.Logic:
                    actualPointsUsed = AllocateToStat(ref stats.Logic, request.Points);
                    break;
                case StatType.Flow:
                    actualPointsUsed = AllocateToStat(ref stats.Flow, request.Points);
                    break;
            }

            if (actualPointsUsed > 0)
            {
                unallocated.Points -= actualPointsUsed;
                ecb.SetComponent(request.TargetEntity, stats);
                ecb.SetComponent(request.TargetEntity, unallocated);
            }
        }

        private int AllocateToStat(ref int statValue, int pointsToAdd)
        {
            int available = MAX_STAT_VALUE - statValue;
            int toAdd = math.min(pointsToAdd, available);
            statValue += toAdd;
            return toAdd;
        }
    }

    /// <summary>
    /// System that grants stat points on level up
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateAfter(typeof(ProgressionSystem))]
    public partial struct LevelUpPointsSystem : ISystem
    {
        private int _lastKnownLevel;

        public void OnCreate(ref SystemState state)
        {
            _lastKnownLevel = 1;
        }

        public void OnUpdate(ref SystemState state)
        {
            foreach (var (levelProgress, unallocated) in
                SystemAPI.Query<RefRO<LevelProgress>, RefRW<UnallocatedPoints>>())
            {
                int currentLevel = levelProgress.ValueRO.CurrentLevel;

                // Grant points for level up
                if (currentLevel > _lastKnownLevel)
                {
                    int levelsGained = currentLevel - _lastKnownLevel;
                    unallocated.ValueRW.Points += levelsGained * 3; // POINTS_PER_LEVEL
                    _lastKnownLevel = currentLevel;
                }
            }
        }
    }

    /// <summary>
    /// Static helpers for stat allocation
    /// </summary>
    public static class StatAllocationHelpers
    {
        /// <summary>
        /// Request to allocate points to a stat
        /// </summary>
        public static void AllocatePoints(EntityManager em, Entity target, StatType stat, int points)
        {
            var entity = em.CreateEntity();
            em.AddComponentData(entity, new AllocateStatPointRequest
            {
                TargetEntity = target,
                StatType = stat,
                Points = points
            });
        }

        /// <summary>
        /// Get total stat points at a given level
        /// </summary>
        public static int GetTotalPointsForLevel(int level)
        {
            // Base points + level-up points
            return 40 + (level - 1) * 3; // Starting 10 in each stat (40 total) + 3 per level
        }

        /// <summary>
        /// Calculate derived stat values
        /// </summary>
        public static DerivedStats CalculateDerivedStats(RPGStats baseStats)
        {
            return new DerivedStats
            {
                MaxHealth = baseStats.Structure * 10,
                Defense = baseStats.Structure / 2,
                Attack = baseStats.Ignition * 2,
                CritChance = baseStats.Ignition / 100f,
                SkillPower = baseStats.Logic * 15 / 10,
                MaxMana = baseStats.Logic * 5,
                MoveSpeed = 3f + baseStats.Flow / 20f,
                Evasion = baseStats.Flow / 100f
            };
        }
    }

    /// <summary>
    /// Derived stats calculated from base stats
    /// </summary>
    public struct DerivedStats
    {
        public int MaxHealth;
        public int Defense;
        public int Attack;
        public float CritChance;
        public int SkillPower;
        public int MaxMana;
        public float MoveSpeed;
        public float Evasion;
    }
}
