using Unity.Entities;
using Unity.Collections;
using UnityEngine;
using NeoTokyo.Components.Save;
using NeoTokyo.Components.Stats;
using NeoTokyo.Components.Faction;
using NeoTokyo.Components.Core;

namespace NeoTokyo.Systems.Save
{
    /// <summary>
    /// System that handles save/load requests.
    /// Uses Unity's PlayerPrefs for storage (like TypeScript localStorage).
    /// Supports 1 auto-save slot (0) and 3 manual slots (1-3).
    /// </summary>
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    public partial class SaveLoadSystem : SystemBase
    {
        private const string STORAGE_PREFIX = "neo_tokyo_save_";
        private const int AUTO_SAVE_SLOT = 0;
        private const int MAX_MANUAL_SLOTS = 3;

        protected override void OnCreate()
        {
            RequireForUpdate<SaveGameRequest>();
        }

        protected override void OnUpdate()
        {
            var ecb = new EntityCommandBuffer(Allocator.TempJob);

            // Process save requests
            foreach (var (request, entity) in
                SystemAPI.Query<RefRO<SaveGameRequest>>()
                    .WithEntityAccess())
            {
                PerformSave(request.ValueRO.SlotId.ToString());
                ecb.DestroyEntity(entity);
            }

            // Process load requests
            foreach (var (request, entity) in
                SystemAPI.Query<RefRO<LoadGameRequest>>()
                    .WithEntityAccess())
            {
                PerformLoad(request.ValueRO.SlotId.ToString());
                ecb.DestroyEntity(entity);
            }

            ecb.Playback(EntityManager);
            ecb.Dispose();
        }

        private void PerformSave(string slotId)
        {
            // Gather player data
            var snapshot = new PlayerProgressSnapshot();
            var location = new LocationSnapshot();

            foreach (var (stats, rep, transform) in
                SystemAPI.Query<RefRO<RPGStats>, RefRO<Reputation>, RefRO<Unity.Transforms.LocalTransform>>()
                    .WithAll<PlayerTag>())
            {
                snapshot.Structure = stats.ValueRO.Structure;
                snapshot.Ignition = stats.ValueRO.Ignition;
                snapshot.Logic = stats.ValueRO.Logic;
                snapshot.Flow = stats.ValueRO.Flow;
                snapshot.KurenaiRep = rep.ValueRO.Kurenai;
                snapshot.AzureRep = rep.ValueRO.Azure;

                location.PositionX = transform.ValueRO.Position.x;
                location.PositionY = transform.ValueRO.Position.y;
                location.PositionZ = transform.ValueRO.Position.z;
            }

            // Create save JSON
            var saveData = new SaveDataJson
            {
                version = "1.0.0",
                timestamp = System.DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
                slotId = slotId,
                structure = snapshot.Structure,
                ignition = snapshot.Ignition,
                logic = snapshot.Logic,
                flow = snapshot.Flow,
                kurenaiRep = snapshot.KurenaiRep,
                azureRep = snapshot.AzureRep,
                posX = location.PositionX,
                posY = location.PositionY,
                posZ = location.PositionZ
            };

            string json = JsonUtility.ToJson(saveData);
            string key = $"{STORAGE_PREFIX}{slotId}";
            PlayerPrefs.SetString(key, json);
            PlayerPrefs.Save();

            Debug.Log($"Game saved to slot {slotId}");
        }

        private void PerformLoad(string slotId)
        {
            string key = $"{STORAGE_PREFIX}{slotId}";
            string json = PlayerPrefs.GetString(key, "");

            if (string.IsNullOrEmpty(json))
            {
                Debug.LogWarning($"No save data in slot {slotId}");
                return;
            }

            var saveData = JsonUtility.FromJson<SaveDataJson>(json);

            // Restore player state
            foreach (var (stats, rep, transform) in
                SystemAPI.Query<RefRW<RPGStats>, RefRW<Reputation>, RefRW<Unity.Transforms.LocalTransform>>()
                    .WithAll<PlayerTag>())
            {
                stats.ValueRW.Structure = saveData.structure;
                stats.ValueRW.Ignition = saveData.ignition;
                stats.ValueRW.Logic = saveData.logic;
                stats.ValueRW.Flow = saveData.flow;

                rep.ValueRW.Kurenai = saveData.kurenaiRep;
                rep.ValueRW.Azure = saveData.azureRep;

                transform.ValueRW.Position = new Unity.Mathematics.float3(
                    saveData.posX,
                    saveData.posY,
                    saveData.posZ
                );
            }

            Debug.Log($"Game loaded from slot {slotId}");
        }

        /// <summary>
        /// Static helper to trigger auto-save
        /// </summary>
        public static void AutoSave(EntityManager em)
        {
            var entity = em.CreateEntity();
            em.AddComponentData(entity, new SaveGameRequest
            {
                SlotId = new FixedString64Bytes(AUTO_SAVE_SLOT.ToString())
            });
        }

        /// <summary>
        /// Static helper to trigger quick save (slot 1)
        /// </summary>
        public static void QuickSave(EntityManager em)
        {
            var entity = em.CreateEntity();
            em.AddComponentData(entity, new SaveGameRequest
            {
                SlotId = new FixedString64Bytes("1")
            });
        }

        /// <summary>
        /// Static helper to trigger quick load (slot 1)
        /// </summary>
        public static void QuickLoad(EntityManager em)
        {
            var entity = em.CreateEntity();
            em.AddComponentData(entity, new LoadGameRequest
            {
                SlotId = new FixedString64Bytes("1")
            });
        }

        [System.Serializable]
        private struct SaveDataJson
        {
            public string version;
            public long timestamp;
            public string slotId;
            public int structure;
            public int ignition;
            public int logic;
            public int flow;
            public int kurenaiRep;
            public int azureRep;
            public float posX;
            public float posY;
            public float posZ;
        }
    }
}
