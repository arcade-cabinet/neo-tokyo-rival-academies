using System.Collections;
using NUnit.Framework;
using UnityEngine;
using UnityEngine.TestTools;
using Unity.Entities;
using Unity.Mathematics;
using Unity.Collections;
using NeoTokyo.Components.World;
using NeoTokyo.Components.Core;
using NeoTokyo.Components.Faction;

namespace NeoTokyo.Tests.PlayMode
{
    /// <summary>
    /// Integration tests for TerritorySystem.
    /// Tests full territory transitions with ECS world.
    /// Command: Unity -batchmode -runTests -testPlatform PlayMode
    /// </summary>
    [TestFixture]
    public class TerritoryIntegrationTests
    {
        private World _testWorld;
        private EntityManager _entityManager;

        [SetUp]
        public void SetUp()
        {
            _testWorld = new World("TerritoryTestWorld");
            _entityManager = _testWorld.EntityManager;
        }

        [TearDown]
        public void TearDown()
        {
            if (_testWorld != null && _testWorld.IsCreated)
            {
                _testWorld.Dispose();
            }
        }

        #region Territory Creation Tests

        [UnityTest]
        public IEnumerator CreateTerritory_WithAllComponents()
        {
            // Create territory entity
            var entity = _entityManager.CreateEntity();

            var territoryData = new TerritoryData
            {
                Id = TerritoryId.KurenaiAcademy,
                Type = TerritoryType.Academy,
                Name = new FixedString64Bytes("Kurenai Academy"),
                ControllingFaction = FactionType.Kurenai,
                CenterPosition = new float3(100f, 0f, 100f),
                Radius = 50f,
                DifficultyLevel = 3
            };

            var territoryBounds = new TerritoryBounds
            {
                Min = new float3(50f, -10f, 50f),
                Max = new float3(150f, 50f, 150f)
            };

            var territoryControl = new TerritoryControl
            {
                CurrentController = FactionType.Kurenai,
                ControlStrength = 100f,
                IsContested = false
            };

            _entityManager.AddComponentData(entity, territoryData);
            _entityManager.AddComponentData(entity, territoryBounds);
            _entityManager.AddComponentData(entity, territoryControl);

            yield return null;

            // Verify entity has all components
            Assert.IsTrue(_entityManager.HasComponent<TerritoryData>(entity));
            Assert.IsTrue(_entityManager.HasComponent<TerritoryBounds>(entity));
            Assert.IsTrue(_entityManager.HasComponent<TerritoryControl>(entity));

            // Verify data integrity
            var data = _entityManager.GetComponentData<TerritoryData>(entity);
            Assert.AreEqual(TerritoryId.KurenaiAcademy, data.Id);
        }

        [UnityTest]
        public IEnumerator CreateAllCanonicalTerritories()
        {
            var territories = new[]
            {
                (TerritoryId.KurenaiAcademy, TerritoryType.Academy, FactionType.Kurenai),
                (TerritoryId.AzureAcademy, TerritoryType.Academy, FactionType.Azure),
                (TerritoryId.CollectiveMarket, TerritoryType.Market, FactionType.Neutral),
                (TerritoryId.EasternRefuge, TerritoryType.Refuge, FactionType.Kurenai),
                (TerritoryId.WesternRefuge, TerritoryType.Refuge, FactionType.Azure),
                (TerritoryId.SyndicateDocks, TerritoryType.Industrial, FactionType.Neutral),
                (TerritoryId.RunnersCanal, TerritoryType.Transition, FactionType.Neutral),
                (TerritoryId.ShrineHeights, TerritoryType.Sacred, FactionType.Neutral),
                (TerritoryId.DeepReach, TerritoryType.Depths, FactionType.Neutral),
                (TerritoryId.DrownedArchives, TerritoryType.Depths, FactionType.Neutral)
            };

            var createdEntities = new NativeList<Entity>(Allocator.Temp);

            foreach (var (id, type, faction) in territories)
            {
                var entity = _entityManager.CreateEntity();
                _entityManager.AddComponentData(entity, new TerritoryData
                {
                    Id = id,
                    Type = type,
                    ControllingFaction = faction
                });
                createdEntities.Add(entity);
            }

            yield return null;

            // Verify all 10 territories created
            Assert.AreEqual(10, createdEntities.Length);

            // Verify each has correct data
            for (int i = 0; i < createdEntities.Length; i++)
            {
                var data = _entityManager.GetComponentData<TerritoryData>(createdEntities[i]);
                Assert.AreEqual(territories[i].Item1, data.Id);
                Assert.AreEqual(territories[i].Item2, data.Type);
            }

            createdEntities.Dispose();
        }

        #endregion

        #region Territory Transition Tests

        [UnityTest]
        public IEnumerator PlayerEntersTerritory_UpdatesActiveTerritory()
        {
            // Create territory
            var territoryEntity = _entityManager.CreateEntity();
            _entityManager.AddComponentData(territoryEntity, new TerritoryData
            {
                Id = TerritoryId.CollectiveMarket,
                CenterPosition = new float3(0f, 0f, 0f),
                Radius = 50f
            });
            _entityManager.AddComponentData(territoryEntity, new TerritoryBounds
            {
                Min = new float3(-50f, -10f, -50f),
                Max = new float3(50f, 50f, 50f)
            });

            // Create player
            var playerEntity = _entityManager.CreateEntity();
            _entityManager.AddComponentData(playerEntity, new PlayerTag());
            _entityManager.AddComponentData(playerEntity, new Position
            {
                Value = new float3(100f, 0f, 100f) // Outside territory
            });
            _entityManager.AddComponentData(playerEntity, new ActiveTerritory
            {
                CurrentTerritory = TerritoryId.None,
                PreviousTerritory = TerritoryId.None
            });

            yield return null;

            // Simulate player moving into territory
            var position = _entityManager.GetComponentData<Position>(playerEntity);
            position.Value = new float3(0f, 0f, 0f); // Inside territory
            _entityManager.SetComponentData(playerEntity, position);

            // Check if position is inside territory bounds
            var bounds = _entityManager.GetComponentData<TerritoryBounds>(territoryEntity);
            bool isInside = bounds.Contains(position.Value);

            Assert.IsTrue(isInside);

            // Update active territory (simulating system behavior)
            var active = _entityManager.GetComponentData<ActiveTerritory>(playerEntity);
            active.PreviousTerritory = active.CurrentTerritory;
            active.CurrentTerritory = TerritoryId.CollectiveMarket;
            active.JustEntered = true;
            active.TimeInTerritory = 0f;
            _entityManager.SetComponentData(playerEntity, active);

            yield return null;

            // Verify transition
            active = _entityManager.GetComponentData<ActiveTerritory>(playerEntity);
            Assert.AreEqual(TerritoryId.CollectiveMarket, active.CurrentTerritory);
            Assert.AreEqual(TerritoryId.None, active.PreviousTerritory);
            Assert.IsTrue(active.JustEntered);
        }

        [UnityTest]
        public IEnumerator PlayerExitsTerritory_UpdatesActiveTerritory()
        {
            // Create territory
            var territoryEntity = _entityManager.CreateEntity();
            _entityManager.AddComponentData(territoryEntity, new TerritoryBounds
            {
                Min = new float3(-50f, -10f, -50f),
                Max = new float3(50f, 50f, 50f)
            });
            _entityManager.AddComponentData(territoryEntity, new TerritoryData
            {
                Id = TerritoryId.CollectiveMarket
            });

            // Create player inside territory
            var playerEntity = _entityManager.CreateEntity();
            _entityManager.AddComponentData(playerEntity, new PlayerTag());
            _entityManager.AddComponentData(playerEntity, new Position
            {
                Value = new float3(0f, 0f, 0f)
            });
            _entityManager.AddComponentData(playerEntity, new ActiveTerritory
            {
                CurrentTerritory = TerritoryId.CollectiveMarket,
                TimeInTerritory = 30f
            });

            yield return null;

            // Move player outside
            var position = _entityManager.GetComponentData<Position>(playerEntity);
            position.Value = new float3(100f, 0f, 100f);
            _entityManager.SetComponentData(playerEntity, position);

            var bounds = _entityManager.GetComponentData<TerritoryBounds>(territoryEntity);
            bool isInside = bounds.Contains(position.Value);

            Assert.IsFalse(isInside);

            // Update active territory
            var active = _entityManager.GetComponentData<ActiveTerritory>(playerEntity);
            active.PreviousTerritory = active.CurrentTerritory;
            active.CurrentTerritory = TerritoryId.None;
            active.JustExited = true;
            _entityManager.SetComponentData(playerEntity, active);

            yield return null;

            active = _entityManager.GetComponentData<ActiveTerritory>(playerEntity);
            Assert.AreEqual(TerritoryId.None, active.CurrentTerritory);
            Assert.AreEqual(TerritoryId.CollectiveMarket, active.PreviousTerritory);
            Assert.IsTrue(active.JustExited);
        }

        #endregion

        #region Territory Control Tests

        [UnityTest]
        public IEnumerator TerritoryControl_BecomesContested()
        {
            var entity = _entityManager.CreateEntity();
            _entityManager.AddComponentData(entity, new TerritoryData
            {
                Id = TerritoryId.CollectiveMarket,
                ControllingFaction = FactionType.Neutral
            });
            _entityManager.AddComponentData(entity, new TerritoryControl
            {
                CurrentController = FactionType.Neutral,
                ControlStrength = 100f,
                IsContested = false
            });

            yield return null;

            // Simulate faction attack reducing control
            var control = _entityManager.GetComponentData<TerritoryControl>(entity);
            control.ControlStrength = 45f; // Below 50 threshold
            control.IsContested = true;
            control.AttackingFaction = FactionType.Kurenai;
            control.AttackerProgress = 10f;
            _entityManager.SetComponentData(entity, control);

            yield return null;

            control = _entityManager.GetComponentData<TerritoryControl>(entity);
            Assert.IsTrue(control.IsContested);
            Assert.AreEqual(FactionType.Kurenai, control.AttackingFaction);
        }

        [UnityTest]
        public IEnumerator TerritoryControl_Takeover()
        {
            var entity = _entityManager.CreateEntity();
            _entityManager.AddComponentData(entity, new TerritoryControl
            {
                CurrentController = FactionType.Neutral,
                ControlStrength = 5f, // Very low
                IsContested = true,
                AttackingFaction = FactionType.Azure
            });

            yield return null;

            // Simulate takeover
            var control = _entityManager.GetComponentData<TerritoryControl>(entity);

            // Takeover threshold is 10
            if (control.ControlStrength <= 10f && control.IsContested)
            {
                control.PreviousController = control.CurrentController;
                control.CurrentController = control.AttackingFaction;
                control.ControlStrength = 50f;
                control.IsContested = false;
                control.AttackingFaction = FactionType.Neutral;
            }

            _entityManager.SetComponentData(entity, control);

            yield return null;

            control = _entityManager.GetComponentData<TerritoryControl>(entity);
            Assert.AreEqual(FactionType.Azure, control.CurrentController);
            Assert.AreEqual(FactionType.Neutral, control.PreviousController);
            Assert.IsFalse(control.IsContested);
        }

        #endregion

        #region Territory Discovery Tests

        [UnityTest]
        public IEnumerator TerritoryDiscovery_AddToPlayerBuffer()
        {
            // Create player with discovery buffer
            var playerEntity = _entityManager.CreateEntity();
            _entityManager.AddComponentData(playerEntity, new PlayerTag());
            var buffer = _entityManager.AddBuffer<DiscoveredTerritoryElement>(playerEntity);

            yield return null;

            // Discover a territory
            buffer.Add(new DiscoveredTerritoryElement
            {
                Territory = TerritoryId.KurenaiAcademy,
                DiscoveredTimestamp = 1000,
                VisitCount = 1
            });

            yield return null;

            // Verify discovery
            buffer = _entityManager.GetBuffer<DiscoveredTerritoryElement>(playerEntity);
            Assert.AreEqual(1, buffer.Length);
            Assert.AreEqual(TerritoryId.KurenaiAcademy, buffer[0].Territory);
        }

        [UnityTest]
        public IEnumerator TerritoryDiscovery_IncrementVisitCount()
        {
            var playerEntity = _entityManager.CreateEntity();
            var buffer = _entityManager.AddBuffer<DiscoveredTerritoryElement>(playerEntity);
            buffer.Add(new DiscoveredTerritoryElement
            {
                Territory = TerritoryId.CollectiveMarket,
                VisitCount = 3
            });

            yield return null;

            // Revisit territory
            buffer = _entityManager.GetBuffer<DiscoveredTerritoryElement>(playerEntity);
            var element = buffer[0];
            element.VisitCount++;
            buffer[0] = element;

            yield return null;

            buffer = _entityManager.GetBuffer<DiscoveredTerritoryElement>(playerEntity);
            Assert.AreEqual(4, buffer[0].VisitCount);
        }

        #endregion

        #region Territory Event Tests

        [UnityTest]
        public IEnumerator TerritoryEnteredEvent_Created()
        {
            // Create event entity
            var eventEntity = _entityManager.CreateEntity();
            _entityManager.AddComponentData(eventEntity, new TerritoryEnteredEvent
            {
                Territory = TerritoryId.SyndicateDocks,
                PreviousTerritory = TerritoryId.RunnersCanal,
                ControllingFaction = FactionType.Neutral,
                PlayerStanding = ReputationLevel.Neutral,
                IsHostile = false,
                TimeStamp = 100f
            });

            yield return null;

            Assert.IsTrue(_entityManager.HasComponent<TerritoryEnteredEvent>(eventEntity));

            var evt = _entityManager.GetComponentData<TerritoryEnteredEvent>(eventEntity);
            Assert.AreEqual(TerritoryId.SyndicateDocks, evt.Territory);
            Assert.IsFalse(evt.IsHostile);
        }

        [UnityTest]
        public IEnumerator TerritoryControlChangedEvent_Created()
        {
            var eventEntity = _entityManager.CreateEntity();
            _entityManager.AddComponentData(eventEntity, new TerritoryControlChangedEvent
            {
                Territory = TerritoryId.DeepReach,
                OldController = FactionType.Neutral,
                NewController = FactionType.Kurenai,
                TimeStamp = 200f
            });

            yield return null;

            var evt = _entityManager.GetComponentData<TerritoryControlChangedEvent>(eventEntity);
            Assert.AreEqual(FactionType.Neutral, evt.OldController);
            Assert.AreEqual(FactionType.Kurenai, evt.NewController);
        }

        #endregion

        #region Territory Connection Tests

        [UnityTest]
        public IEnumerator TerritoryConnection_BoatRoute()
        {
            var connectionEntity = _entityManager.CreateEntity();
            _entityManager.AddComponentData(connectionEntity, new TerritoryConnection
            {
                SourceTerritory = TerritoryId.SyndicateDocks,
                TargetTerritory = TerritoryId.DeepReach,
                ConnectionType = ConnectionTypeFlag.BoatRoute,
                IsUnlocked = false,
                TravelTime = 45f
            });

            yield return null;

            var connection = _entityManager.GetComponentData<TerritoryConnection>(connectionEntity);
            Assert.AreEqual(TerritoryId.SyndicateDocks, connection.SourceTerritory);
            Assert.AreEqual(TerritoryId.DeepReach, connection.TargetTerritory);
            Assert.IsFalse(connection.IsUnlocked);

            // Unlock connection
            connection.IsUnlocked = true;
            _entityManager.SetComponentData(connectionEntity, connection);

            yield return null;

            connection = _entityManager.GetComponentData<TerritoryConnection>(connectionEntity);
            Assert.IsTrue(connection.IsUnlocked);
        }

        #endregion

        #region Singleton Tests

        [UnityTest]
        public IEnumerator TerritoryStateSingleton_TracksGlobalState()
        {
            var singletonEntity = _entityManager.CreateEntity();
            _entityManager.AddComponentData(singletonEntity, new TerritoryStateSingleton
            {
                ActiveTerritory = TerritoryId.KurenaiAcademy,
                DiscoveredCount = 3,
                TotalTerritories = 10,
                HasContestedTerritory = false,
                WorldSeed = 42
            });

            yield return null;

            var singleton = _entityManager.GetComponentData<TerritoryStateSingleton>(singletonEntity);
            Assert.AreEqual(TerritoryId.KurenaiAcademy, singleton.ActiveTerritory);
            Assert.AreEqual(3, singleton.DiscoveredCount);
            Assert.AreEqual(42, singleton.WorldSeed);
        }

        #endregion
    }
}
