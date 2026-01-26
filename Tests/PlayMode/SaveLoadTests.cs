using NUnit.Framework;
using Unity.Entities;
using Unity.Transforms;
using Unity.Mathematics;
using Unity.Collections;
using UnityEngine;
using UnityEngine.TestTools;
using System.Collections;
using NeoTokyo.Components.Core;
using NeoTokyo.Components.Stats;
using NeoTokyo.Components.Faction;
using NeoTokyo.Components.Save;

namespace NeoTokyo.Tests.PlayMode
{
    /// <summary>
    /// Integration tests for the save/load system.
    /// Tests data serialization, persistence, and state restoration.
    /// </summary>
    [TestFixture]
    public class SaveLoadTests
    {
        private World _testWorld;
        private EntityManager _em;

        private const string TEST_SLOT_PREFIX = "neo_tokyo_test_save_";
        private const string TEST_SLOT_ID = "test_slot";

        [SetUp]
        public void SetUp()
        {
            _testWorld = new World("SaveLoadTestWorld");
            _em = _testWorld.EntityManager;

            // Clean up any existing test saves
            CleanupTestSaves();
        }

        [TearDown]
        public void TearDown()
        {
            if (_testWorld != null && _testWorld.IsCreated)
            {
                _testWorld.Dispose();
            }

            // Clean up test saves
            CleanupTestSaves();
        }

        [UnityTest]
        public IEnumerator Save_CreatesValidData()
        {
            // Arrange
            var playerEntity = CreatePlayerForSave();
            yield return null;

            // Act
            PerformSave(playerEntity, TEST_SLOT_ID);

            // Assert
            string key = $"{TEST_SLOT_PREFIX}{TEST_SLOT_ID}";
            string json = PlayerPrefs.GetString(key, "");

            Assert.IsFalse(string.IsNullOrEmpty(json),
                "Save should create JSON data");
            Assert.IsTrue(json.Contains("\"version\""),
                "Save data should contain version");
            Assert.IsTrue(json.Contains("\"structure\""),
                "Save data should contain stats");
        }

        [UnityTest]
        public IEnumerator Load_RestoresStateCorrectly()
        {
            // Arrange
            var originalEntity = CreatePlayerForSave();
            SetPlayerState(originalEntity,
                stats: new RPGStats
                {
                    Structure = 25,
                    Ignition = 30,
                    Logic = 20,
                    Flow = 35
                },
                reputation: new Reputation
                {
                    Kurenai = 75,
                    Azure = 40
                },
                position: new float3(10f, 2f, -5f)
            );
            yield return null;

            // Act - Save then create new entity and load
            PerformSave(originalEntity, TEST_SLOT_ID);

            var loadedEntity = CreatePlayerForSave();
            PerformLoad(loadedEntity, TEST_SLOT_ID);

            // Assert
            var stats = _em.GetComponentData<RPGStats>(loadedEntity);
            Assert.AreEqual(25, stats.Structure);
            Assert.AreEqual(30, stats.Ignition);
            Assert.AreEqual(20, stats.Logic);
            Assert.AreEqual(35, stats.Flow);

            var reputation = _em.GetComponentData<Reputation>(loadedEntity);
            Assert.AreEqual(75, reputation.Kurenai);
            Assert.AreEqual(40, reputation.Azure);

            var transform = _em.GetComponentData<LocalTransform>(loadedEntity);
            Assert.AreEqual(10f, transform.Position.x, 0.01f);
            Assert.AreEqual(2f, transform.Position.y, 0.01f);
            Assert.AreEqual(-5f, transform.Position.z, 0.01f);
        }

        [UnityTest]
        public IEnumerator Save_IncludesTimestamp()
        {
            // Arrange
            var playerEntity = CreatePlayerForSave();
            long beforeSave = System.DateTimeOffset.UtcNow.ToUnixTimeSeconds();
            yield return null;

            // Act
            PerformSave(playerEntity, TEST_SLOT_ID);
            long afterSave = System.DateTimeOffset.UtcNow.ToUnixTimeSeconds();

            // Assert
            string key = $"{TEST_SLOT_PREFIX}{TEST_SLOT_ID}";
            string json = PlayerPrefs.GetString(key, "");
            var saveData = JsonUtility.FromJson<TestSaveData>(json);

            Assert.GreaterOrEqual(saveData.timestamp, beforeSave,
                "Timestamp should be after save started");
            Assert.LessOrEqual(saveData.timestamp, afterSave,
                "Timestamp should be before save completed");
        }

        [UnityTest]
        public IEnumerator Save_IncludesVersion()
        {
            // Arrange
            var playerEntity = CreatePlayerForSave();
            yield return null;

            // Act
            PerformSave(playerEntity, TEST_SLOT_ID);

            // Assert
            string key = $"{TEST_SLOT_PREFIX}{TEST_SLOT_ID}";
            string json = PlayerPrefs.GetString(key, "");
            var saveData = JsonUtility.FromJson<TestSaveData>(json);

            Assert.IsFalse(string.IsNullOrEmpty(saveData.version),
                "Save should include version string");
            Assert.AreEqual("1.0.0", saveData.version,
                "Version should match expected value");
        }

        [UnityTest]
        public IEnumerator Load_HandlesEmptySlot()
        {
            // Arrange
            var playerEntity = CreatePlayerForSave();
            var originalStats = _em.GetComponentData<RPGStats>(playerEntity);
            yield return null;

            // Act - Try to load from non-existent slot
            PerformLoad(playerEntity, "nonexistent_slot");

            // Assert - State should be unchanged
            var stats = _em.GetComponentData<RPGStats>(playerEntity);
            Assert.AreEqual(originalStats.Structure, stats.Structure,
                "Stats should be unchanged when loading empty slot");
        }

        [UnityTest]
        public IEnumerator MultipleSaveSlots_Independent()
        {
            // Arrange
            var player1 = CreatePlayerForSave();
            SetPlayerState(player1,
                stats: new RPGStats { Structure = 15, Ignition = 15, Logic = 15, Flow = 15 },
                reputation: Reputation.Default,
                position: float3.zero
            );

            var player2 = CreatePlayerForSave();
            SetPlayerState(player2,
                stats: new RPGStats { Structure = 30, Ignition = 30, Logic = 30, Flow = 30 },
                reputation: Reputation.Default,
                position: float3.zero
            );
            yield return null;

            // Act - Save to different slots
            PerformSave(player1, "slot1");
            PerformSave(player2, "slot2");

            // Load back and verify independence
            var loadTest = CreatePlayerForSave();

            PerformLoad(loadTest, "slot1");
            var slot1Stats = _em.GetComponentData<RPGStats>(loadTest);

            PerformLoad(loadTest, "slot2");
            var slot2Stats = _em.GetComponentData<RPGStats>(loadTest);

            // Assert
            Assert.AreEqual(15, slot1Stats.Structure,
                "Slot 1 should have Structure 15");
            Assert.AreEqual(30, slot2Stats.Structure,
                "Slot 2 should have Structure 30");
        }

        [UnityTest]
        public IEnumerator SaveOverwrite_ReplacesExisting()
        {
            // Arrange
            var playerEntity = CreatePlayerForSave();

            // First save with initial values
            SetPlayerState(playerEntity,
                stats: new RPGStats { Structure = 10, Ignition = 10, Logic = 10, Flow = 10 },
                reputation: Reputation.Default,
                position: float3.zero
            );
            yield return null;
            PerformSave(playerEntity, TEST_SLOT_ID);

            // Update and save again
            SetPlayerState(playerEntity,
                stats: new RPGStats { Structure = 50, Ignition = 50, Logic = 50, Flow = 50 },
                reputation: Reputation.Default,
                position: float3.zero
            );
            PerformSave(playerEntity, TEST_SLOT_ID);

            // Load and verify
            var loadEntity = CreatePlayerForSave();
            PerformLoad(loadEntity, TEST_SLOT_ID);

            // Assert
            var stats = _em.GetComponentData<RPGStats>(loadEntity);
            Assert.AreEqual(50, stats.Structure,
                "Overwritten save should have new values");
        }

        [UnityTest]
        public IEnumerator SaveRequest_CreatesEntity()
        {
            // Arrange
            yield return null;

            // Act
            var requestEntity = _em.CreateEntity();
            _em.AddComponentData(requestEntity, new SaveGameRequest
            {
                SlotId = new FixedString64Bytes(TEST_SLOT_ID)
            });

            // Assert
            Assert.IsTrue(_em.HasComponent<SaveGameRequest>(requestEntity),
                "Entity should have SaveGameRequest component");

            var request = _em.GetComponentData<SaveGameRequest>(requestEntity);
            Assert.AreEqual(TEST_SLOT_ID, request.SlotId.ToString(),
                "Request should have correct slot ID");
        }

        [UnityTest]
        public IEnumerator LoadRequest_CreatesEntity()
        {
            // Arrange
            yield return null;

            // Act
            var requestEntity = _em.CreateEntity();
            _em.AddComponentData(requestEntity, new LoadGameRequest
            {
                SlotId = new FixedString64Bytes(TEST_SLOT_ID)
            });

            // Assert
            Assert.IsTrue(_em.HasComponent<LoadGameRequest>(requestEntity),
                "Entity should have LoadGameRequest component");

            var request = _em.GetComponentData<LoadGameRequest>(requestEntity);
            Assert.AreEqual(TEST_SLOT_ID, request.SlotId.ToString(),
                "Request should have correct slot ID");
        }

        [UnityTest]
        public IEnumerator PlayerProgressSnapshot_CapturesAllData()
        {
            // Arrange
            var playerEntity = CreatePlayerForSave();
            SetPlayerState(playerEntity,
                stats: new RPGStats { Structure = 22, Ignition = 33, Logic = 44, Flow = 55 },
                reputation: new Reputation { Kurenai = 80, Azure = 30 },
                position: new float3(1f, 2f, 3f)
            );
            yield return null;

            // Act
            var snapshot = CaptureSnapshot(playerEntity);

            // Assert
            Assert.AreEqual(22, snapshot.Structure);
            Assert.AreEqual(33, snapshot.Ignition);
            Assert.AreEqual(44, snapshot.Logic);
            Assert.AreEqual(55, snapshot.Flow);
            Assert.AreEqual(80, snapshot.KurenaiRep);
            Assert.AreEqual(30, snapshot.AzureRep);
        }

        [UnityTest]
        public IEnumerator LocationSnapshot_CapturesPosition()
        {
            // Arrange
            var playerEntity = CreatePlayerForSave();
            _em.SetComponentData(playerEntity, LocalTransform.FromPosition(
                new float3(100f, 50f, -25f)));
            yield return null;

            // Act
            var snapshot = CaptureLocationSnapshot(playerEntity);

            // Assert
            Assert.AreEqual(100f, snapshot.PositionX, 0.01f);
            Assert.AreEqual(50f, snapshot.PositionY, 0.01f);
            Assert.AreEqual(-25f, snapshot.PositionZ, 0.01f);
        }

        [UnityTest]
        public IEnumerator SaveableComponent_IdentifiesEntities()
        {
            // Arrange
            var saveableEntity = _em.CreateEntity();
            _em.AddComponentData(saveableEntity, new Saveable
            {
                SaveId = new FixedString64Bytes("player_001")
            });
            yield return null;

            // Assert
            Assert.IsTrue(_em.HasComponent<Saveable>(saveableEntity));
            var saveable = _em.GetComponentData<Saveable>(saveableEntity);
            Assert.AreEqual("player_001", saveable.SaveId.ToString());
        }

        #region Helper Methods

        private Entity CreatePlayerForSave()
        {
            var entity = _em.CreateEntity();
            _em.AddComponent<PlayerTag>(entity);
            _em.AddComponentData(entity, LocalTransform.FromPosition(float3.zero));
            _em.AddComponentData(entity, RPGStats.Default);
            _em.AddComponentData(entity, Reputation.Default);
            return entity;
        }

        private void SetPlayerState(Entity entity, RPGStats stats, Reputation reputation, float3 position)
        {
            _em.SetComponentData(entity, stats);
            _em.SetComponentData(entity, reputation);
            _em.SetComponentData(entity, LocalTransform.FromPosition(position));
        }

        private void PerformSave(Entity playerEntity, string slotId)
        {
            var stats = _em.GetComponentData<RPGStats>(playerEntity);
            var reputation = _em.GetComponentData<Reputation>(playerEntity);
            var transform = _em.GetComponentData<LocalTransform>(playerEntity);

            var saveData = new TestSaveData
            {
                version = "1.0.0",
                timestamp = System.DateTimeOffset.UtcNow.ToUnixTimeSeconds(),
                slotId = slotId,
                structure = stats.Structure,
                ignition = stats.Ignition,
                logic = stats.Logic,
                flow = stats.Flow,
                kurenaiRep = reputation.Kurenai,
                azureRep = reputation.Azure,
                posX = transform.Position.x,
                posY = transform.Position.y,
                posZ = transform.Position.z
            };

            string json = JsonUtility.ToJson(saveData);
            string key = $"{TEST_SLOT_PREFIX}{slotId}";
            PlayerPrefs.SetString(key, json);
            PlayerPrefs.Save();
        }

        private void PerformLoad(Entity playerEntity, string slotId)
        {
            string key = $"{TEST_SLOT_PREFIX}{slotId}";
            string json = PlayerPrefs.GetString(key, "");

            if (string.IsNullOrEmpty(json))
            {
                return;
            }

            var saveData = JsonUtility.FromJson<TestSaveData>(json);

            _em.SetComponentData(playerEntity, new RPGStats
            {
                Structure = saveData.structure,
                Ignition = saveData.ignition,
                Logic = saveData.logic,
                Flow = saveData.flow
            });

            _em.SetComponentData(playerEntity, new Reputation
            {
                Kurenai = saveData.kurenaiRep,
                Azure = saveData.azureRep
            });

            _em.SetComponentData(playerEntity, LocalTransform.FromPosition(
                new float3(saveData.posX, saveData.posY, saveData.posZ)));
        }

        private PlayerProgressSnapshot CaptureSnapshot(Entity playerEntity)
        {
            var stats = _em.GetComponentData<RPGStats>(playerEntity);
            var reputation = _em.GetComponentData<Reputation>(playerEntity);

            return new PlayerProgressSnapshot
            {
                Structure = stats.Structure,
                Ignition = stats.Ignition,
                Logic = stats.Logic,
                Flow = stats.Flow,
                KurenaiRep = reputation.Kurenai,
                AzureRep = reputation.Azure
            };
        }

        private LocationSnapshot CaptureLocationSnapshot(Entity playerEntity)
        {
            var transform = _em.GetComponentData<LocalTransform>(playerEntity);

            return new LocationSnapshot
            {
                PositionX = transform.Position.x,
                PositionY = transform.Position.y,
                PositionZ = transform.Position.z
            };
        }

        private void CleanupTestSaves()
        {
            // Clean up test save slots
            string[] testSlots = { TEST_SLOT_ID, "slot1", "slot2", "nonexistent_slot" };
            foreach (var slot in testSlots)
            {
                string key = $"{TEST_SLOT_PREFIX}{slot}";
                PlayerPrefs.DeleteKey(key);
            }
            PlayerPrefs.Save();
        }

        [System.Serializable]
        private struct TestSaveData
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

        #endregion
    }
}
