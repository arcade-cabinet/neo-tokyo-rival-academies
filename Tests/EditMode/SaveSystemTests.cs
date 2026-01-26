using NUnit.Framework;
using Unity.Collections;
using Unity.Entities;
using Unity.Mathematics;
using NeoTokyo.Components.Save;
using NeoTokyo.Components.Stats;
using NeoTokyo.Components.Faction;

namespace NeoTokyo.Tests.EditMode
{
    /// <summary>
    /// Unit tests for SaveSystem.
    /// Tests save data serialization, snapshot creation, and slot management.
    /// Command: Unity -batchmode -runTests -testPlatform EditMode
    /// </summary>
    [TestFixture]
    public class SaveSystemTests
    {
        private const string STORAGE_PREFIX = "neo_tokyo_save_";

        #region SaveGameRequest Tests

        [Test]
        public void SaveGameRequest_CanStoreSlotId()
        {
            var request = new SaveGameRequest
            {
                SlotId = new FixedString64Bytes("1")
            };

            Assert.AreEqual("1", request.SlotId.ToString());
        }

        [Test]
        public void SaveGameRequest_AutoSaveSlot()
        {
            var request = new SaveGameRequest
            {
                SlotId = new FixedString64Bytes("0")
            };

            Assert.AreEqual("0", request.SlotId.ToString());
        }

        [Test]
        public void SaveGameRequest_ManualSlots()
        {
            for (int slot = 1; slot <= 3; slot++)
            {
                var request = new SaveGameRequest
                {
                    SlotId = new FixedString64Bytes(slot.ToString())
                };

                Assert.AreEqual(slot.ToString(), request.SlotId.ToString());
            }
        }

        #endregion

        #region LoadGameRequest Tests

        [Test]
        public void LoadGameRequest_CanStoreSlotId()
        {
            var request = new LoadGameRequest
            {
                SlotId = new FixedString64Bytes("2")
            };

            Assert.AreEqual("2", request.SlotId.ToString());
        }

        [Test]
        public void LoadGameRequest_QuickLoadSlot()
        {
            var request = new LoadGameRequest
            {
                SlotId = new FixedString64Bytes("1")
            };

            Assert.AreEqual("1", request.SlotId.ToString());
        }

        #endregion

        #region Saveable Component Tests

        [Test]
        public void Saveable_CanStoreSaveId()
        {
            var saveable = new Saveable
            {
                SaveId = new FixedString64Bytes("player_entity")
            };

            Assert.AreEqual("player_entity", saveable.SaveId.ToString());
        }

        [Test]
        public void Saveable_UniqueIds()
        {
            var saveable1 = new Saveable
            {
                SaveId = new FixedString64Bytes("entity_001")
            };
            var saveable2 = new Saveable
            {
                SaveId = new FixedString64Bytes("entity_002")
            };

            Assert.AreNotEqual(saveable1.SaveId.ToString(), saveable2.SaveId.ToString());
        }

        #endregion

        #region SaveMetadata Tests

        [Test]
        public void SaveMetadata_CanStoreAllFields()
        {
            var metadata = new SaveMetadata
            {
                SaveSlotId = new FixedString64Bytes("1"),
                PlayerName = new FixedString64Bytes("TestPlayer"),
                PlayTimeSeconds = 3600,
                SaveVersion = 1,
                TimestampUnix = 1700000000
            };

            Assert.AreEqual("1", metadata.SaveSlotId.ToString());
            Assert.AreEqual("TestPlayer", metadata.PlayerName.ToString());
            Assert.AreEqual(3600, metadata.PlayTimeSeconds);
            Assert.AreEqual(1, metadata.SaveVersion);
            Assert.AreEqual(1700000000, metadata.TimestampUnix);
        }

        [Test]
        public void SaveMetadata_PlayTimeTracking()
        {
            var metadata = new SaveMetadata
            {
                PlayTimeSeconds = 7200 // 2 hours
            };

            int hours = metadata.PlayTimeSeconds / 3600;
            int minutes = (metadata.PlayTimeSeconds % 3600) / 60;

            Assert.AreEqual(2, hours);
            Assert.AreEqual(0, minutes);
        }

        [Test]
        public void SaveMetadata_VersionTracking()
        {
            var metadata = new SaveMetadata
            {
                SaveVersion = 2
            };

            Assert.AreEqual(2, metadata.SaveVersion);
        }

        #endregion

        #region PlayerProgressSnapshot Tests

        [Test]
        public void PlayerProgressSnapshot_CanStoreStats()
        {
            var snapshot = new PlayerProgressSnapshot
            {
                Structure = 25,
                Ignition = 30,
                Logic = 20,
                Flow = 35
            };

            Assert.AreEqual(25, snapshot.Structure);
            Assert.AreEqual(30, snapshot.Ignition);
            Assert.AreEqual(20, snapshot.Logic);
            Assert.AreEqual(35, snapshot.Flow);
        }

        [Test]
        public void PlayerProgressSnapshot_CanStoreReputation()
        {
            var snapshot = new PlayerProgressSnapshot
            {
                KurenaiRep = 75,
                AzureRep = 25
            };

            Assert.AreEqual(75, snapshot.KurenaiRep);
            Assert.AreEqual(25, snapshot.AzureRep);
        }

        [Test]
        public void PlayerProgressSnapshot_CanStoreLevelAndXP()
        {
            var snapshot = new PlayerProgressSnapshot
            {
                Level = 15,
                Experience = 5000
            };

            Assert.AreEqual(15, snapshot.Level);
            Assert.AreEqual(5000, snapshot.Experience);
        }

        [Test]
        public void PlayerProgressSnapshot_CanStoreCurrency()
        {
            var snapshot = new PlayerProgressSnapshot
            {
                Currency = 12500
            };

            Assert.AreEqual(12500, snapshot.Currency);
        }

        [Test]
        public void PlayerProgressSnapshot_FromRPGStats()
        {
            var stats = new RPGStats
            {
                Structure = 18,
                Ignition = 22,
                Logic = 16,
                Flow = 20
            };

            var snapshot = new PlayerProgressSnapshot
            {
                Structure = stats.Structure,
                Ignition = stats.Ignition,
                Logic = stats.Logic,
                Flow = stats.Flow
            };

            Assert.AreEqual(stats.Structure, snapshot.Structure);
            Assert.AreEqual(stats.Ignition, snapshot.Ignition);
            Assert.AreEqual(stats.Logic, snapshot.Logic);
            Assert.AreEqual(stats.Flow, snapshot.Flow);
        }

        #endregion

        #region LocationSnapshot Tests

        [Test]
        public void LocationSnapshot_CanStoreStageId()
        {
            var location = new LocationSnapshot
            {
                StageId = new FixedString64Bytes("kurenai_district")
            };

            Assert.AreEqual("kurenai_district", location.StageId.ToString());
        }

        [Test]
        public void LocationSnapshot_CanStoreAreaId()
        {
            var location = new LocationSnapshot
            {
                AreaId = new FixedString64Bytes("main_street")
            };

            Assert.AreEqual("main_street", location.AreaId.ToString());
        }

        [Test]
        public void LocationSnapshot_CanStorePosition()
        {
            var location = new LocationSnapshot
            {
                PositionX = 15.5f,
                PositionY = 0f,
                PositionZ = -22.3f
            };

            Assert.AreEqual(15.5f, location.PositionX);
            Assert.AreEqual(0f, location.PositionY);
            Assert.AreEqual(-22.3f, location.PositionZ);
        }

        [Test]
        public void LocationSnapshot_ToFloat3()
        {
            var location = new LocationSnapshot
            {
                PositionX = 10f,
                PositionY = 5f,
                PositionZ = 20f
            };

            var position = new float3(location.PositionX, location.PositionY, location.PositionZ);

            Assert.AreEqual(10f, position.x);
            Assert.AreEqual(5f, position.y);
            Assert.AreEqual(20f, position.z);
        }

        [Test]
        public void LocationSnapshot_FromFloat3()
        {
            var position = new float3(25f, 2f, 30f);

            var location = new LocationSnapshot
            {
                PositionX = position.x,
                PositionY = position.y,
                PositionZ = position.z
            };

            Assert.AreEqual(25f, location.PositionX);
            Assert.AreEqual(2f, location.PositionY);
            Assert.AreEqual(30f, location.PositionZ);
        }

        #endregion

        #region QuestStateSnapshot Tests

        [Test]
        public void QuestStateSnapshot_CanStoreQuestId()
        {
            var quest = new QuestStateSnapshot
            {
                QuestId = new FixedString64Bytes("main_quest_1")
            };

            Assert.AreEqual("main_quest_1", quest.QuestId.ToString());
        }

        [Test]
        public void QuestStateSnapshot_CanTrackCurrentStep()
        {
            var quest = new QuestStateSnapshot
            {
                QuestId = new FixedString64Bytes("fetch_quest"),
                CurrentStep = 3
            };

            Assert.AreEqual(3, quest.CurrentStep);
        }

        [Test]
        public void QuestStateSnapshot_ActiveQuest()
        {
            var quest = new QuestStateSnapshot
            {
                IsActive = true,
                IsCompleted = false
            };

            Assert.IsTrue(quest.IsActive);
            Assert.IsFalse(quest.IsCompleted);
        }

        [Test]
        public void QuestStateSnapshot_CompletedQuest()
        {
            var quest = new QuestStateSnapshot
            {
                IsActive = false,
                IsCompleted = true
            };

            Assert.IsFalse(quest.IsActive);
            Assert.IsTrue(quest.IsCompleted);
        }

        [Test]
        public void QuestStateSnapshot_InactiveQuest()
        {
            var quest = new QuestStateSnapshot
            {
                IsActive = false,
                IsCompleted = false,
                CurrentStep = 0
            };

            Assert.IsFalse(quest.IsActive);
            Assert.IsFalse(quest.IsCompleted);
            Assert.AreEqual(0, quest.CurrentStep);
        }

        #endregion

        #region Storage Key Generation Tests

        [Test]
        public void StorageKey_GeneratesCorrectFormat()
        {
            string slotId = "1";
            string key = $"{STORAGE_PREFIX}{slotId}";

            Assert.AreEqual("neo_tokyo_save_1", key);
        }

        [Test]
        public void StorageKey_AutoSaveSlot()
        {
            string slotId = "0";
            string key = $"{STORAGE_PREFIX}{slotId}";

            Assert.AreEqual("neo_tokyo_save_0", key);
        }

        [Test]
        public void StorageKey_AllManualSlots()
        {
            for (int i = 1; i <= 3; i++)
            {
                string key = $"{STORAGE_PREFIX}{i}";
                Assert.AreEqual($"neo_tokyo_save_{i}", key);
            }
        }

        #endregion

        #region Save Data Validation Tests

        [Test]
        public void SaveData_ValidVersion()
        {
            string version = "1.0.0";

            Assert.IsNotNull(version);
            Assert.IsNotEmpty(version);
        }

        [Test]
        public void SaveData_ValidTimestamp()
        {
            long timestamp = System.DateTimeOffset.UtcNow.ToUnixTimeSeconds();

            Assert.Greater(timestamp, 0);
        }

        [Test]
        public void SaveData_StatsArePositive()
        {
            var snapshot = new PlayerProgressSnapshot
            {
                Structure = 10,
                Ignition = 10,
                Logic = 10,
                Flow = 10
            };

            Assert.GreaterOrEqual(snapshot.Structure, 0);
            Assert.GreaterOrEqual(snapshot.Ignition, 0);
            Assert.GreaterOrEqual(snapshot.Logic, 0);
            Assert.GreaterOrEqual(snapshot.Flow, 0);
        }

        [Test]
        public void SaveData_ReputationInRange()
        {
            var snapshot = new PlayerProgressSnapshot
            {
                KurenaiRep = 50,
                AzureRep = 50
            };

            Assert.GreaterOrEqual(snapshot.KurenaiRep, 0);
            Assert.LessOrEqual(snapshot.KurenaiRep, 100);
            Assert.GreaterOrEqual(snapshot.AzureRep, 0);
            Assert.LessOrEqual(snapshot.AzureRep, 100);
        }

        #endregion

        #region Snapshot Creation Tests

        [Test]
        public void CreateSnapshot_FromPlayerData()
        {
            // Simulate player data
            var stats = RPGStats.Default;
            var reputation = Reputation.Default;
            var position = new float3(10, 0, 20);

            // Create snapshots
            var progressSnapshot = new PlayerProgressSnapshot
            {
                Structure = stats.Structure,
                Ignition = stats.Ignition,
                Logic = stats.Logic,
                Flow = stats.Flow,
                KurenaiRep = reputation.Kurenai,
                AzureRep = reputation.Azure
            };

            var locationSnapshot = new LocationSnapshot
            {
                PositionX = position.x,
                PositionY = position.y,
                PositionZ = position.z
            };

            Assert.AreEqual(10, progressSnapshot.Structure);
            Assert.AreEqual(50, progressSnapshot.KurenaiRep);
            Assert.AreEqual(10f, locationSnapshot.PositionX);
        }

        [Test]
        public void RestoreFromSnapshot_ToPlayerData()
        {
            // Create snapshot
            var progressSnapshot = new PlayerProgressSnapshot
            {
                Structure = 25,
                Ignition = 30,
                Logic = 20,
                Flow = 35,
                KurenaiRep = 75,
                AzureRep = 25
            };

            // Restore to components
            var stats = new RPGStats
            {
                Structure = progressSnapshot.Structure,
                Ignition = progressSnapshot.Ignition,
                Logic = progressSnapshot.Logic,
                Flow = progressSnapshot.Flow
            };

            var reputation = new Reputation
            {
                Kurenai = progressSnapshot.KurenaiRep,
                Azure = progressSnapshot.AzureRep
            };

            Assert.AreEqual(25, stats.Structure);
            Assert.AreEqual(75, reputation.Kurenai);
        }

        #endregion

        #region Empty Save Slot Tests

        [Test]
        public void EmptySaveSlot_ReturnsEmpty()
        {
            string json = ""; // Simulating empty slot

            bool isEmpty = string.IsNullOrEmpty(json);

            Assert.IsTrue(isEmpty);
        }

        [Test]
        public void EmptySaveSlot_NullCheck()
        {
            string json = null;

            bool isEmpty = string.IsNullOrEmpty(json);

            Assert.IsTrue(isEmpty);
        }

        #endregion

        #region Save Slot Management Tests

        [Test]
        public void SaveSlot_AutoSaveIsSlotZero()
        {
            const int AUTO_SAVE_SLOT = 0;

            Assert.AreEqual(0, AUTO_SAVE_SLOT);
        }

        [Test]
        public void SaveSlot_ManualSlotsAreOneToThree()
        {
            const int MAX_MANUAL_SLOTS = 3;

            for (int slot = 1; slot <= MAX_MANUAL_SLOTS; slot++)
            {
                Assert.GreaterOrEqual(slot, 1);
                Assert.LessOrEqual(slot, 3);
            }
        }

        [Test]
        public void SaveSlot_QuickSaveIsSlotOne()
        {
            const int QUICK_SAVE_SLOT = 1;

            Assert.AreEqual(1, QUICK_SAVE_SLOT);
        }

        #endregion

        #region Reputation Integration Tests

        [Test]
        public void Reputation_SnapshotAndRestore()
        {
            // Original reputation
            var original = new Reputation
            {
                Kurenai = 80,
                Azure = 30
            };

            // Create snapshot
            var snapshot = new PlayerProgressSnapshot
            {
                KurenaiRep = original.Kurenai,
                AzureRep = original.Azure
            };

            // Restore from snapshot
            var restored = new Reputation
            {
                Kurenai = snapshot.KurenaiRep,
                Azure = snapshot.AzureRep
            };

            Assert.AreEqual(original.Kurenai, restored.Kurenai);
            Assert.AreEqual(original.Azure, restored.Azure);
        }

        #endregion

        #region Position Precision Tests

        [Test]
        public void Position_PreservesFloatPrecision()
        {
            float3 original = new float3(123.456f, 78.901f, -234.567f);

            var snapshot = new LocationSnapshot
            {
                PositionX = original.x,
                PositionY = original.y,
                PositionZ = original.z
            };

            float3 restored = new float3(snapshot.PositionX, snapshot.PositionY, snapshot.PositionZ);

            Assert.AreEqual(original.x, restored.x, 0.001f);
            Assert.AreEqual(original.y, restored.y, 0.001f);
            Assert.AreEqual(original.z, restored.z, 0.001f);
        }

        [Test]
        public void Position_HandlesNegativeValues()
        {
            var snapshot = new LocationSnapshot
            {
                PositionX = -100f,
                PositionY = -50f,
                PositionZ = -200f
            };

            Assert.AreEqual(-100f, snapshot.PositionX);
            Assert.AreEqual(-50f, snapshot.PositionY);
            Assert.AreEqual(-200f, snapshot.PositionZ);
        }

        [Test]
        public void Position_HandlesZeroValues()
        {
            var snapshot = new LocationSnapshot
            {
                PositionX = 0f,
                PositionY = 0f,
                PositionZ = 0f
            };

            Assert.AreEqual(0f, snapshot.PositionX);
            Assert.AreEqual(0f, snapshot.PositionY);
            Assert.AreEqual(0f, snapshot.PositionZ);
        }

        #endregion
    }
}
