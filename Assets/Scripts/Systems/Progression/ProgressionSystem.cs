using Unity.Burst;
using Unity.Collections;
using Unity.Entities;
using Unity.Mathematics;
using NeoTokyo.Components.Stats;

namespace NeoTokyo.Systems.Progression
{
    /// <summary>
    /// XP gain event for the progression system.
    /// </summary>
    public struct XPGainEvent : IBufferElementData
    {
        public int Amount;
        public FixedString64Bytes Source;
    }

    /// <summary>
    /// Event fired when entity levels up.
    /// </summary>
    public struct LevelUpEvent : IComponentData
    {
        public int OldLevel;
        public int NewLevel;
    }

    /// <summary>
    /// Processes XP gains and level ups.
    /// Equivalent to TypeScript: ProgressionSystem.ts / playerStore.addXP()
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    public partial struct ProgressionSystem : ISystem
    {
        [BurstCompile]
        public void OnCreate(ref SystemState state)
        {
            state.RequireForUpdate<LevelProgress>();
        }

        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            var ecb = new EntityCommandBuffer(Allocator.TempJob);

            foreach (var (level, stats, xpBuffer, entity) in
                SystemAPI.Query<RefRW<LevelProgress>, RefRW<RPGStats>, DynamicBuffer<XPGainEvent>>()
                    .WithEntityAccess())
            {
                if (xpBuffer.Length == 0) continue;

                int totalXP = 0;
                foreach (var xpEvent in xpBuffer)
                {
                    totalXP += xpEvent.Amount;
                }
                xpBuffer.Clear();

                int oldLevel = level.ValueRO.Level;
                int newXP = level.ValueRO.XP + totalXP;
                int newLevel = oldLevel;
                int xpToNext = level.ValueRO.XPToNextLevel;

                // Process level ups
                while (newXP >= xpToNext)
                {
                    newXP -= xpToNext;
                    newLevel++;
                    xpToNext = LevelProgress.GetXPForLevel(newLevel);
                }

                // Update level progress
                level.ValueRW.XP = newXP;
                level.ValueRW.Level = newLevel;
                level.ValueRW.XPToNextLevel = xpToNext;

                // If leveled up, update stats and fire event
                if (newLevel > oldLevel)
                {
                    stats.ValueRW = RPGStats.ForLevel(newLevel);

                    ecb.AddComponent(entity, new LevelUpEvent
                    {
                        OldLevel = oldLevel,
                        NewLevel = newLevel
                    });
                }
            }

            ecb.Playback(state.EntityManager);
            ecb.Dispose();
        }
    }

    /// <summary>
    /// Cleans up LevelUpEvent components after they're processed.
    /// </summary>
    [UpdateInGroup(typeof(LateSimulationSystemGroup))]
    public partial struct LevelUpEventCleanupSystem : ISystem
    {
        public void OnUpdate(ref SystemState state)
        {
            var ecb = new EntityCommandBuffer(Allocator.TempJob);

            foreach (var (_, entity) in SystemAPI.Query<LevelUpEvent>().WithEntityAccess())
            {
                ecb.RemoveComponent<LevelUpEvent>(entity);
            }

            ecb.Playback(state.EntityManager);
            ecb.Dispose();
        }
    }
}
