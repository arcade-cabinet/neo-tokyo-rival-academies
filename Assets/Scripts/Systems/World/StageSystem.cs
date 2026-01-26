using Unity.Entities;
using Unity.Collections;
using Unity.Mathematics;
using Unity.Transforms;
using NeoTokyo.Components.Core;

namespace NeoTokyo.Systems.World
{
    /// <summary>
    /// Stage state enum matching TypeScript StageState
    /// </summary>
    public enum StageState : byte
    {
        Loading = 0,
        Playing = 1,
        Cutscene = 2,
        Complete = 3,
        Event = 4
    }

    /// <summary>
    /// Current stage component
    /// </summary>
    public struct CurrentStage : IComponentData
    {
        public FixedString64Bytes StageId;
        public StageState State;
        public float Progress;
        public float Length;
        public FixedString64Bytes NextStageId;
        public FixedString64Bytes ActiveEvent;
        public bool HasCutscene;
    }

    /// <summary>
    /// Request to load a new stage
    /// </summary>
    public struct LoadStageRequest : IComponentData
    {
        public FixedString64Bytes StageId;
    }

    /// <summary>
    /// Request to trigger a stage event
    /// </summary>
    public struct TriggerEventRequest : IComponentData
    {
        public FixedString64Bytes EventId;
    }

    /// <summary>
    /// Singleton component for stage management
    /// </summary>
    public struct StageManagerSingleton : IComponentData
    {
        public bool Initialized;
    }

    /// <summary>
    /// System that manages stage loading and transitions.
    /// Equivalent to TypeScript StageSystem class.
    /// </summary>
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    public partial class StageManagementSystem : SystemBase
    {
        protected override void OnCreate()
        {
            RequireForUpdate<EndSimulationEntityCommandBufferSystem.Singleton>();

            // Create singleton if not exists
            if (!SystemAPI.HasSingleton<StageManagerSingleton>())
            {
                var entity = EntityManager.CreateEntity();
                EntityManager.AddComponentData(entity, new StageManagerSingleton { Initialized = true });
                EntityManager.AddComponentData(entity, new CurrentStage
                {
                    StageId = new FixedString64Bytes("intro_cutscene"),
                    State = StageState.Loading,
                    Progress = 0f,
                    Length = 0f
                });
            }
        }

        protected override void OnUpdate()
        {
            var ecb = SystemAPI.GetSingleton<EndSimulationEntityCommandBufferSystem.Singleton>()
                .CreateCommandBuffer(World.Unmanaged);

            // Process load stage requests
            ProcessLoadRequests(ref ecb);

            // Process event triggers
            ProcessEventTriggers(ref ecb);

            // Update stage progress
            UpdateStageProgress();
        }

        private void ProcessLoadRequests(ref EntityCommandBuffer ecb)
        {
            foreach (var (request, entity) in
                SystemAPI.Query<RefRO<LoadStageRequest>>()
                    .WithEntityAccess())
            {
                LoadStage(request.ValueRO.StageId);
                ecb.DestroyEntity(entity);
            }
        }

        private void ProcessEventTriggers(ref EntityCommandBuffer ecb)
        {
            foreach (var (request, entity) in
                SystemAPI.Query<RefRO<TriggerEventRequest>>()
                    .WithEntityAccess())
            {
                TriggerEvent(request.ValueRO.EventId);
                ecb.DestroyEntity(entity);
            }
        }

        private void LoadStage(FixedString64Bytes stageId)
        {
            foreach (var stage in SystemAPI.Query<RefRW<CurrentStage>>())
            {
                stage.ValueRW.StageId = stageId;
                stage.ValueRW.Progress = 0f;
                stage.ValueRW.ActiveEvent = default;

                // Stage config would be loaded from JSON manifest
                // For now, use defaults
                stage.ValueRW.State = stage.ValueRO.HasCutscene ? StageState.Cutscene : StageState.Playing;

                UnityEngine.Debug.Log($"Loading Stage: {stageId}");
            }
        }

        private void TriggerEvent(FixedString64Bytes eventId)
        {
            foreach (var stage in SystemAPI.Query<RefRW<CurrentStage>>())
            {
                stage.ValueRW.State = StageState.Event;
                stage.ValueRW.ActiveEvent = eventId;

                UnityEngine.Debug.Log($"Triggering Event: {eventId}");
            }
        }

        private void UpdateStageProgress()
        {
            // Get player X position for progress tracking
            float playerX = 0f;
            foreach (var transform in SystemAPI.Query<RefRO<LocalTransform>>().WithAll<PlayerTag>())
            {
                playerX = transform.ValueRO.Position.x;
            }

            foreach (var stage in SystemAPI.Query<RefRW<CurrentStage>>())
            {
                if (stage.ValueRO.State != StageState.Playing) continue;

                stage.ValueRW.Progress = playerX;

                // Check end condition
                if (stage.ValueRO.Length > 0 && stage.ValueRO.Progress >= stage.ValueRO.Length)
                {
                    CompleteStage(ref stage.ValueRW);
                }
            }
        }

        private void CompleteStage(ref CurrentStage stage)
        {
            stage.State = StageState.Complete;

            if (stage.NextStageId.Length > 0)
            {
                LoadStage(stage.NextStageId);
            }
            else
            {
                UnityEngine.Debug.Log("Game Complete!");
            }
        }
    }

    /// <summary>
    /// Static helpers for stage system
    /// </summary>
    public static class StageHelpers
    {
        /// <summary>
        /// Request to load a specific stage
        /// </summary>
        public static void LoadStage(EntityManager em, string stageId)
        {
            var entity = em.CreateEntity();
            em.AddComponentData(entity, new LoadStageRequest
            {
                StageId = new FixedString64Bytes(stageId)
            });
        }

        /// <summary>
        /// Trigger a stage event
        /// </summary>
        public static void TriggerEvent(EntityManager em, string eventId)
        {
            var entity = em.CreateEntity();
            em.AddComponentData(entity, new TriggerEventRequest
            {
                EventId = new FixedString64Bytes(eventId)
            });
        }
    }
}
