using NUnit.Framework;
using Unity.Collections;
using Unity.Entities;
using Unity.Mathematics;
using NeoTokyo.Components.World;
using NeoTokyo.Components.Faction;

namespace NeoTokyo.Tests.EditMode
{
    /// <summary>
    /// Unit tests for TerritorySystem components and logic.
    /// Tests territory bounds, transitions, control mechanics.
    /// Command: Unity -batchmode -runTests -testPlatform EditMode
    /// </summary>
    [TestFixture]
    public class TerritorySystemTests
    {
        #region TerritoryBounds Tests

        [Test]
        public void TerritoryBounds_Contains_ReturnsTrueWhenInside()
        {
            var bounds = new TerritoryBounds
            {
                Min = new float3(-10f, 0f, -10f),
                Max = new float3(10f, 5f, 10f)
            };

            Assert.IsTrue(bounds.Contains(new float3(0f, 2f, 0f)));
            Assert.IsTrue(bounds.Contains(new float3(-5f, 1f, -5f)));
            Assert.IsTrue(bounds.Contains(new float3(5f, 4f, 5f)));
        }

        [Test]
        public void TerritoryBounds_Contains_ReturnsFalseWhenOutside()
        {
            var bounds = new TerritoryBounds
            {
                Min = new float3(-10f, 0f, -10f),
                Max = new float3(10f, 5f, 10f)
            };

            Assert.IsFalse(bounds.Contains(new float3(15f, 2f, 0f)));
            Assert.IsFalse(bounds.Contains(new float3(0f, -1f, 0f)));
            Assert.IsFalse(bounds.Contains(new float3(0f, 10f, 0f)));
            Assert.IsFalse(bounds.Contains(new float3(0f, 2f, -15f)));
        }

        [Test]
        public void TerritoryBounds_Contains_ReturnsTrueOnBoundary()
        {
            var bounds = new TerritoryBounds
            {
                Min = new float3(-10f, 0f, -10f),
                Max = new float3(10f, 5f, 10f)
            };

            Assert.IsTrue(bounds.Contains(new float3(-10f, 0f, -10f))); // Min corner
            Assert.IsTrue(bounds.Contains(new float3(10f, 5f, 10f)));   // Max corner
            Assert.IsTrue(bounds.Contains(new float3(0f, 0f, 0f)));     // Min Y edge
            Assert.IsTrue(bounds.Contains(new float3(10f, 2f, 0f)));    // Max X edge
        }

        [Test]
        public void TerritoryBounds_ContainsXZ_IgnoresYAxis()
        {
            var bounds = new TerritoryBounds
            {
                Min = new float3(-10f, 0f, -10f),
                Max = new float3(10f, 5f, 10f)
            };

            // Should be true even if Y is outside bounds
            Assert.IsTrue(bounds.ContainsXZ(new float3(0f, 100f, 0f)));
            Assert.IsTrue(bounds.ContainsXZ(new float3(0f, -50f, 0f)));

            // Should be false if X or Z outside
            Assert.IsFalse(bounds.ContainsXZ(new float3(15f, 2f, 0f)));
            Assert.IsFalse(bounds.ContainsXZ(new float3(0f, 2f, 15f)));
        }

        [Test]
        public void TerritoryBounds_Center_CalculatesCorrectly()
        {
            var bounds = new TerritoryBounds
            {
                Min = new float3(-10f, 0f, -10f),
                Max = new float3(10f, 10f, 10f)
            };

            var center = bounds.Center;

            Assert.AreEqual(0f, center.x);
            Assert.AreEqual(5f, center.y);
            Assert.AreEqual(0f, center.z);
        }

        [Test]
        public void TerritoryBounds_Size_CalculatesCorrectly()
        {
            var bounds = new TerritoryBounds
            {
                Min = new float3(-10f, 0f, -5f),
                Max = new float3(10f, 20f, 15f)
            };

            var size = bounds.Size;

            Assert.AreEqual(20f, size.x);
            Assert.AreEqual(20f, size.y);
            Assert.AreEqual(20f, size.z);
        }

        #endregion

        #region TerritoryData Tests

        [Test]
        public void TerritoryData_CanStoreAllProperties()
        {
            var data = new TerritoryData
            {
                Id = TerritoryId.KurenaiAcademy,
                Type = TerritoryType.Academy,
                Name = new FixedString64Bytes("Kurenai Academy"),
                ControllingFaction = FactionType.Kurenai,
                CenterPosition = new float3(100f, 0f, 100f),
                Radius = 50f,
                DifficultyLevel = 3
            };

            Assert.AreEqual(TerritoryId.KurenaiAcademy, data.Id);
            Assert.AreEqual(TerritoryType.Academy, data.Type);
            Assert.AreEqual("Kurenai Academy", data.Name.ToString());
            Assert.AreEqual(FactionType.Kurenai, data.ControllingFaction);
            Assert.AreEqual(50f, data.Radius);
            Assert.AreEqual(3, data.DifficultyLevel);
        }

        [Test]
        public void TerritoryId_HasAllCanonicalTerritories()
        {
            // Verify all 10 canonical territories from Golden Record
            Assert.AreEqual((byte)0, (byte)TerritoryId.None);
            Assert.AreEqual((byte)1, (byte)TerritoryId.KurenaiAcademy);
            Assert.AreEqual((byte)2, (byte)TerritoryId.AzureAcademy);
            Assert.AreEqual((byte)3, (byte)TerritoryId.CollectiveMarket);
            Assert.AreEqual((byte)4, (byte)TerritoryId.EasternRefuge);
            Assert.AreEqual((byte)5, (byte)TerritoryId.WesternRefuge);
            Assert.AreEqual((byte)6, (byte)TerritoryId.SyndicateDocks);
            Assert.AreEqual((byte)7, (byte)TerritoryId.RunnersCanal);
            Assert.AreEqual((byte)8, (byte)TerritoryId.ShrineHeights);
            Assert.AreEqual((byte)9, (byte)TerritoryId.DeepReach);
            Assert.AreEqual((byte)10, (byte)TerritoryId.DrownedArchives);
        }

        [Test]
        public void TerritoryType_HasAllTypes()
        {
            Assert.AreEqual((byte)0, (byte)TerritoryType.Academy);
            Assert.AreEqual((byte)1, (byte)TerritoryType.Market);
            Assert.AreEqual((byte)2, (byte)TerritoryType.Refuge);
            Assert.AreEqual((byte)3, (byte)TerritoryType.Industrial);
            Assert.AreEqual((byte)4, (byte)TerritoryType.Sacred);
            Assert.AreEqual((byte)5, (byte)TerritoryType.Depths);
            Assert.AreEqual((byte)6, (byte)TerritoryType.Transition);
        }

        #endregion

        #region TerritoryControl Tests

        [Test]
        public void TerritoryControl_DefaultValues()
        {
            var control = new TerritoryControl
            {
                CurrentController = FactionType.Kurenai,
                ControlStrength = 100f,
                IsContested = false,
                ContestedTimer = 0f,
                PreviousController = FactionType.Neutral,
                AttackerProgress = 0f,
                AttackingFaction = FactionType.Neutral
            };

            Assert.AreEqual(FactionType.Kurenai, control.CurrentController);
            Assert.AreEqual(100f, control.ControlStrength);
            Assert.IsFalse(control.IsContested);
        }

        [Test]
        public void TerritoryControl_ContestedState()
        {
            var control = new TerritoryControl
            {
                CurrentController = FactionType.Kurenai,
                ControlStrength = 45f, // Below contested threshold (50)
                IsContested = true,
                ContestedTimer = 30f,
                AttackingFaction = FactionType.Azure,
                AttackerProgress = 25f
            };

            Assert.IsTrue(control.IsContested);
            Assert.AreEqual(FactionType.Azure, control.AttackingFaction);
            Assert.AreEqual(25f, control.AttackerProgress);
        }

        [Test]
        public void TerritoryControl_StrengthClamp()
        {
            var control = new TerritoryControl
            {
                ControlStrength = 150f
            };

            // Verify manual clamping works
            control.ControlStrength = math.clamp(control.ControlStrength, 0f, 100f);
            Assert.AreEqual(100f, control.ControlStrength);

            control.ControlStrength = -50f;
            control.ControlStrength = math.clamp(control.ControlStrength, 0f, 100f);
            Assert.AreEqual(0f, control.ControlStrength);
        }

        #endregion

        #region ActiveTerritory Tests

        [Test]
        public void ActiveTerritory_TransitionTracking()
        {
            var active = new ActiveTerritory
            {
                CurrentTerritory = TerritoryId.None,
                PreviousTerritory = TerritoryId.None,
                TimeInTerritory = 0f,
                JustEntered = false,
                JustExited = false
            };

            // Simulate entering a territory
            active.PreviousTerritory = active.CurrentTerritory;
            active.CurrentTerritory = TerritoryId.KurenaiAcademy;
            active.TimeInTerritory = 0f;
            active.JustEntered = true;

            Assert.AreEqual(TerritoryId.KurenaiAcademy, active.CurrentTerritory);
            Assert.AreEqual(TerritoryId.None, active.PreviousTerritory);
            Assert.IsTrue(active.JustEntered);
        }

        [Test]
        public void ActiveTerritory_TimeAccumulation()
        {
            var active = new ActiveTerritory
            {
                CurrentTerritory = TerritoryId.CollectiveMarket,
                TimeInTerritory = 0f
            };

            // Simulate time passing
            active.TimeInTerritory += 1.5f;
            Assert.AreEqual(1.5f, active.TimeInTerritory, 0.001f);

            active.TimeInTerritory += 2.5f;
            Assert.AreEqual(4f, active.TimeInTerritory, 0.001f);
        }

        #endregion

        #region TerritoryConnection Tests

        [Test]
        public void TerritoryConnection_BridgeConnection()
        {
            var connection = new TerritoryConnection
            {
                SourceTerritory = TerritoryId.KurenaiAcademy,
                TargetTerritory = TerritoryId.CollectiveMarket,
                SourcePosition = new float3(100f, 5f, 0f),
                TargetPosition = new float3(200f, 5f, 0f),
                ConnectionType = ConnectionTypeFlag.Bridge,
                IsUnlocked = true,
                TravelTime = 30f
            };

            Assert.AreEqual(TerritoryId.KurenaiAcademy, connection.SourceTerritory);
            Assert.AreEqual(TerritoryId.CollectiveMarket, connection.TargetTerritory);
            Assert.AreEqual(ConnectionTypeFlag.Bridge, connection.ConnectionType);
            Assert.IsTrue(connection.IsUnlocked);
        }

        [Test]
        public void TerritoryConnection_BoatRoute()
        {
            var connection = new TerritoryConnection
            {
                SourceTerritory = TerritoryId.SyndicateDocks,
                TargetTerritory = TerritoryId.DeepReach,
                ConnectionType = ConnectionTypeFlag.BoatRoute,
                IsUnlocked = false,
                TravelTime = 60f
            };

            Assert.AreEqual(ConnectionTypeFlag.BoatRoute, connection.ConnectionType);
            Assert.IsFalse(connection.IsUnlocked);
            Assert.AreEqual(60f, connection.TravelTime);
        }

        [Test]
        public void ConnectionTypeFlag_CombinedConnections()
        {
            // Test combined connection types (Bridge + Cable)
            var combinedType = ConnectionTypeFlag.Bridge | ConnectionTypeFlag.Cable;

            Assert.IsTrue((combinedType & ConnectionTypeFlag.Bridge) != 0);
            Assert.IsTrue((combinedType & ConnectionTypeFlag.Cable) != 0);
            Assert.IsFalse((combinedType & ConnectionTypeFlag.BoatRoute) != 0);
        }

        #endregion

        #region TerritorySignature Tests

        [Test]
        public void TerritorySignature_DeterministicSeeding()
        {
            var signature = new TerritorySignature
            {
                MasterSeed = 42,
                TerritorySeed = 12345,
                GeneratedTimestamp = 1706234567890
            };

            // Same seeds should produce same results
            Assert.AreEqual(42, signature.MasterSeed);
            Assert.AreEqual(12345, signature.TerritorySeed);
        }

        [Test]
        public void TerritorySignature_DerivedSeed()
        {
            int masterSeed = 42;
            var territoryId = TerritoryId.KurenaiAcademy;

            // Deterministic seed derivation
            int derivedSeed = masterSeed ^ (int)territoryId * 31;

            // Same inputs should always produce same output
            int derivedSeed2 = masterSeed ^ (int)territoryId * 31;
            Assert.AreEqual(derivedSeed, derivedSeed2);

            // Different territory should produce different seed
            var otherTerritory = TerritoryId.AzureAcademy;
            int otherDerivedSeed = masterSeed ^ (int)otherTerritory * 31;
            Assert.AreNotEqual(derivedSeed, otherDerivedSeed);
        }

        #endregion

        #region TerritoryEnteredEvent Tests

        [Test]
        public void TerritoryEnteredEvent_HostileDetection()
        {
            var evt = new TerritoryEnteredEvent
            {
                Territory = TerritoryId.KurenaiAcademy,
                PreviousTerritory = TerritoryId.CollectiveMarket,
                ControllingFaction = FactionType.Kurenai,
                PlayerStanding = ReputationLevel.Hated,
                IsHostile = true,
                TimeStamp = 100f
            };

            Assert.IsTrue(evt.IsHostile);
            Assert.AreEqual(ReputationLevel.Hated, evt.PlayerStanding);
        }

        [Test]
        public void TerritoryEnteredEvent_FriendlyEntry()
        {
            var evt = new TerritoryEnteredEvent
            {
                Territory = TerritoryId.KurenaiAcademy,
                ControllingFaction = FactionType.Kurenai,
                PlayerStanding = ReputationLevel.Friendly,
                IsHostile = false,
                TimeStamp = 100f
            };

            Assert.IsFalse(evt.IsHostile);
            Assert.AreEqual(ReputationLevel.Friendly, evt.PlayerStanding);
        }

        #endregion

        #region TerritoryStateSingleton Tests

        [Test]
        public void TerritoryStateSingleton_DiscoveryTracking()
        {
            var singleton = new TerritoryStateSingleton
            {
                ActiveTerritory = TerritoryId.None,
                DiscoveredCount = 0,
                TotalTerritories = 10,
                HasContestedTerritory = false,
                WorldSeed = 42
            };

            // Simulate discovery
            singleton.DiscoveredCount++;
            Assert.AreEqual(1, singleton.DiscoveredCount);

            singleton.DiscoveredCount++;
            Assert.AreEqual(2, singleton.DiscoveredCount);

            // Calculate discovery percentage
            float percentage = (float)singleton.DiscoveredCount / singleton.TotalTerritories;
            Assert.AreEqual(0.2f, percentage, 0.001f);
        }

        #endregion

        #region DiscoveredTerritoryElement Tests

        [Test]
        public void DiscoveredTerritoryElement_VisitCounting()
        {
            var element = new DiscoveredTerritoryElement
            {
                Territory = TerritoryId.CollectiveMarket,
                DiscoveredTimestamp = 1706234567,
                VisitCount = 1
            };

            // Simulate multiple visits
            element.VisitCount++;
            element.VisitCount++;
            element.VisitCount++;

            Assert.AreEqual(4, element.VisitCount);
        }

        #endregion

        #region Control Decay Calculations

        [Test]
        public void ControlDecay_ContestedDecayRate()
        {
            const float CONTROL_DECAY_RATE = 0.5f;
            const float CONTROL_THRESHOLD = 50f;

            var control = new TerritoryControl
            {
                ControlStrength = 60f,
                IsContested = true,
                AttackingFaction = FactionType.Azure
            };

            // Simulate decay over 10 seconds
            float deltaTime = 10f;
            control.ControlStrength -= CONTROL_DECAY_RATE * deltaTime;
            control.ControlStrength = math.max(0f, control.ControlStrength);

            Assert.AreEqual(55f, control.ControlStrength, 0.001f);
        }

        [Test]
        public void ControlDecay_TakeoverThreshold()
        {
            const float TAKEOVER_THRESHOLD = 10f;

            var control = new TerritoryControl
            {
                CurrentController = FactionType.Kurenai,
                ControlStrength = 8f, // Below takeover threshold
                AttackingFaction = FactionType.Azure
            };

            // Should trigger takeover
            if (control.ControlStrength <= TAKEOVER_THRESHOLD)
            {
                control.PreviousController = control.CurrentController;
                control.CurrentController = control.AttackingFaction;
                control.ControlStrength = 50f;
                control.AttackingFaction = FactionType.Neutral;
                control.IsContested = false;
            }

            Assert.AreEqual(FactionType.Azure, control.CurrentController);
            Assert.AreEqual(FactionType.Kurenai, control.PreviousController);
            Assert.AreEqual(50f, control.ControlStrength);
            Assert.IsFalse(control.IsContested);
        }

        [Test]
        public void ControlDecay_Regeneration()
        {
            const float REGEN_RATE = 0.125f; // 0.5 * 0.25

            var control = new TerritoryControl
            {
                ControlStrength = 80f,
                IsContested = false
            };

            // Simulate regeneration over 20 seconds
            float deltaTime = 20f;
            control.ControlStrength += REGEN_RATE * deltaTime;
            control.ControlStrength = math.min(100f, control.ControlStrength);

            Assert.AreEqual(82.5f, control.ControlStrength, 0.001f);
        }

        #endregion
    }
}
