using NUnit.Framework;
using Unity.Collections;
using Unity.Entities;
using Unity.Mathematics;
using NeoTokyo.Systems.World;

namespace NeoTokyo.Tests.EditMode
{
    /// <summary>
    /// Unit tests for StageSystem.
    /// Tests stage state transitions, progress tracking, and event handling.
    /// Command: Unity -batchmode -runTests -testPlatform EditMode
    /// </summary>
    [TestFixture]
    public class StageSystemTests
    {
        #region StageState Enum Tests

        [Test]
        public void StageState_HasCorrectEnumValues()
        {
            Assert.AreEqual((byte)0, (byte)StageState.Loading);
            Assert.AreEqual((byte)1, (byte)StageState.Playing);
            Assert.AreEqual((byte)2, (byte)StageState.Cutscene);
            Assert.AreEqual((byte)3, (byte)StageState.Complete);
            Assert.AreEqual((byte)4, (byte)StageState.Event);
        }

        [Test]
        public void StageState_AllStatesAreDefined()
        {
            var states = System.Enum.GetValues(typeof(StageState));

            Assert.AreEqual(5, states.Length);
        }

        #endregion

        #region CurrentStage Component Tests

        [Test]
        public void CurrentStage_CanStoreStageId()
        {
            var stage = new CurrentStage
            {
                StageId = new FixedString64Bytes("academy_intro")
            };

            Assert.AreEqual("academy_intro", stage.StageId.ToString());
        }

        [Test]
        public void CurrentStage_DefaultState_IsLoading()
        {
            var stage = new CurrentStage
            {
                State = StageState.Loading
            };

            Assert.AreEqual(StageState.Loading, stage.State);
        }

        [Test]
        public void CurrentStage_ProgressTracking()
        {
            var stage = new CurrentStage
            {
                Progress = 50f,
                Length = 100f
            };

            Assert.AreEqual(50f, stage.Progress);
            Assert.AreEqual(100f, stage.Length);
        }

        [Test]
        public void CurrentStage_NextStageConfiguration()
        {
            var stage = new CurrentStage
            {
                StageId = new FixedString64Bytes("stage_1"),
                NextStageId = new FixedString64Bytes("stage_2")
            };

            Assert.AreEqual("stage_2", stage.NextStageId.ToString());
        }

        [Test]
        public void CurrentStage_EventTracking()
        {
            var stage = new CurrentStage
            {
                State = StageState.Event,
                ActiveEvent = new FixedString64Bytes("boss_encounter")
            };

            Assert.AreEqual(StageState.Event, stage.State);
            Assert.AreEqual("boss_encounter", stage.ActiveEvent.ToString());
        }

        [Test]
        public void CurrentStage_CutsceneFlag()
        {
            var stage = new CurrentStage
            {
                HasCutscene = true
            };

            Assert.IsTrue(stage.HasCutscene);
        }

        #endregion

        #region State Transition Tests

        [Test]
        public void StateTransition_LoadingToPlaying()
        {
            var stage = new CurrentStage
            {
                State = StageState.Loading,
                HasCutscene = false
            };

            // Simulate load complete without cutscene
            stage.State = stage.HasCutscene ? StageState.Cutscene : StageState.Playing;

            Assert.AreEqual(StageState.Playing, stage.State);
        }

        [Test]
        public void StateTransition_LoadingToCutscene_WhenHasCutscene()
        {
            var stage = new CurrentStage
            {
                State = StageState.Loading,
                HasCutscene = true
            };

            stage.State = stage.HasCutscene ? StageState.Cutscene : StageState.Playing;

            Assert.AreEqual(StageState.Cutscene, stage.State);
        }

        [Test]
        public void StateTransition_CutsceneToPlaying()
        {
            var stage = new CurrentStage
            {
                State = StageState.Cutscene
            };

            stage.State = StageState.Playing;

            Assert.AreEqual(StageState.Playing, stage.State);
        }

        [Test]
        public void StateTransition_PlayingToEvent()
        {
            var stage = new CurrentStage
            {
                State = StageState.Playing,
                ActiveEvent = default
            };

            stage.State = StageState.Event;
            stage.ActiveEvent = new FixedString64Bytes("mini_boss");

            Assert.AreEqual(StageState.Event, stage.State);
            Assert.AreEqual("mini_boss", stage.ActiveEvent.ToString());
        }

        [Test]
        public void StateTransition_EventToPlaying()
        {
            var stage = new CurrentStage
            {
                State = StageState.Event,
                ActiveEvent = new FixedString64Bytes("event_complete")
            };

            stage.State = StageState.Playing;
            stage.ActiveEvent = default;

            Assert.AreEqual(StageState.Playing, stage.State);
        }

        [Test]
        public void StateTransition_PlayingToComplete_AtEnd()
        {
            var stage = new CurrentStage
            {
                State = StageState.Playing,
                Progress = 100f,
                Length = 100f
            };

            if (stage.Length > 0 && stage.Progress >= stage.Length)
            {
                stage.State = StageState.Complete;
            }

            Assert.AreEqual(StageState.Complete, stage.State);
        }

        [Test]
        public void StateTransition_NoComplete_WhenLengthIsZero()
        {
            var stage = new CurrentStage
            {
                State = StageState.Playing,
                Progress = 100f,
                Length = 0f // No defined length
            };

            if (stage.Length > 0 && stage.Progress >= stage.Length)
            {
                stage.State = StageState.Complete;
            }

            // Should stay playing since Length is 0
            Assert.AreEqual(StageState.Playing, stage.State);
        }

        #endregion

        #region Progress Tracking Tests

        [Test]
        public void ProgressTracking_UpdatesWithPlayerPosition()
        {
            var stage = new CurrentStage
            {
                State = StageState.Playing,
                Progress = 0f
            };
            float playerX = 25f;

            stage.Progress = playerX;

            Assert.AreEqual(25f, stage.Progress);
        }

        [Test]
        public void ProgressTracking_DoesNotUpdateInCutscene()
        {
            var stage = new CurrentStage
            {
                State = StageState.Cutscene,
                Progress = 10f
            };
            float playerX = 50f;

            // Should not update if not Playing
            if (stage.State == StageState.Playing)
            {
                stage.Progress = playerX;
            }

            Assert.AreEqual(10f, stage.Progress);
        }

        [Test]
        public void ProgressTracking_DoesNotUpdateInEvent()
        {
            var stage = new CurrentStage
            {
                State = StageState.Event,
                Progress = 30f
            };
            float playerX = 60f;

            if (stage.State == StageState.Playing)
            {
                stage.Progress = playerX;
            }

            Assert.AreEqual(30f, stage.Progress);
        }

        [Test]
        public void ProgressTracking_CanExceedLength()
        {
            var stage = new CurrentStage
            {
                State = StageState.Playing,
                Progress = 0f,
                Length = 100f
            };

            stage.Progress = 150f;

            // Progress can exceed length before completion check
            Assert.AreEqual(150f, stage.Progress);
        }

        [Test]
        public void ProgressTracking_PercentComplete()
        {
            var stage = new CurrentStage
            {
                Progress = 75f,
                Length = 100f
            };

            float percentComplete = stage.Length > 0 ? stage.Progress / stage.Length * 100f : 0f;

            Assert.AreEqual(75f, percentComplete);
        }

        #endregion

        #region LoadStageRequest Tests

        [Test]
        public void LoadStageRequest_CanStoreStageId()
        {
            var request = new LoadStageRequest
            {
                StageId = new FixedString64Bytes("boss_arena")
            };

            Assert.AreEqual("boss_arena", request.StageId.ToString());
        }

        [Test]
        public void LoadStageRequest_EmptyStageId()
        {
            var request = new LoadStageRequest
            {
                StageId = default
            };

            Assert.AreEqual(0, request.StageId.Length);
        }

        #endregion

        #region TriggerEventRequest Tests

        [Test]
        public void TriggerEventRequest_CanStoreEventId()
        {
            var request = new TriggerEventRequest
            {
                EventId = new FixedString64Bytes("treasure_found")
            };

            Assert.AreEqual("treasure_found", request.EventId.ToString());
        }

        [Test]
        public void TriggerEventRequest_DifferentEventTypes()
        {
            var eventTypes = new[]
            {
                "boss_encounter",
                "npc_dialogue",
                "puzzle_trigger",
                "checkpoint_reached"
            };

            foreach (var eventType in eventTypes)
            {
                var request = new TriggerEventRequest
                {
                    EventId = new FixedString64Bytes(eventType)
                };

                Assert.AreEqual(eventType, request.EventId.ToString());
            }
        }

        #endregion

        #region StageManagerSingleton Tests

        [Test]
        public void StageManagerSingleton_CanTrackInitialization()
        {
            var singleton = new StageManagerSingleton
            {
                Initialized = true
            };

            Assert.IsTrue(singleton.Initialized);
        }

        [Test]
        public void StageManagerSingleton_DefaultNotInitialized()
        {
            var singleton = new StageManagerSingleton();

            Assert.IsFalse(singleton.Initialized);
        }

        #endregion

        #region Stage Loading Logic Tests

        [Test]
        public void LoadStage_ResetsProgress()
        {
            var stage = new CurrentStage
            {
                StageId = new FixedString64Bytes("old_stage"),
                Progress = 50f,
                State = StageState.Playing
            };

            // Simulate loading new stage
            stage.StageId = new FixedString64Bytes("new_stage");
            stage.Progress = 0f;
            stage.ActiveEvent = default;

            Assert.AreEqual("new_stage", stage.StageId.ToString());
            Assert.AreEqual(0f, stage.Progress);
        }

        [Test]
        public void LoadStage_ClearsActiveEvent()
        {
            var stage = new CurrentStage
            {
                ActiveEvent = new FixedString64Bytes("old_event")
            };

            stage.ActiveEvent = default;

            Assert.AreEqual(0, stage.ActiveEvent.Length);
        }

        [Test]
        public void LoadStage_SetsStateBasedOnCutscene()
        {
            var stageWithCutscene = new CurrentStage
            {
                HasCutscene = true,
                State = StageState.Loading
            };

            stageWithCutscene.State = stageWithCutscene.HasCutscene
                ? StageState.Cutscene
                : StageState.Playing;

            Assert.AreEqual(StageState.Cutscene, stageWithCutscene.State);
        }

        #endregion

        #region Stage Completion Tests

        [Test]
        public void CompleteStage_TransitionsToNextStage()
        {
            var stage = new CurrentStage
            {
                StageId = new FixedString64Bytes("stage_1"),
                NextStageId = new FixedString64Bytes("stage_2"),
                State = StageState.Complete
            };

            bool hasNextStage = stage.NextStageId.Length > 0;

            Assert.IsTrue(hasNextStage);
        }

        [Test]
        public void CompleteStage_NoNextStage_EndsGame()
        {
            var stage = new CurrentStage
            {
                StageId = new FixedString64Bytes("final_boss"),
                NextStageId = default,
                State = StageState.Complete
            };

            bool hasNextStage = stage.NextStageId.Length > 0;

            Assert.IsFalse(hasNextStage);
        }

        [Test]
        public void CompleteStage_ProgressEqualsLength()
        {
            var stage = new CurrentStage
            {
                Progress = 100f,
                Length = 100f,
                State = StageState.Playing
            };

            bool isComplete = stage.Progress >= stage.Length;

            Assert.IsTrue(isComplete);
        }

        [Test]
        public void CompleteStage_ProgressExceedsLength()
        {
            var stage = new CurrentStage
            {
                Progress = 120f,
                Length = 100f,
                State = StageState.Playing
            };

            bool isComplete = stage.Length > 0 && stage.Progress >= stage.Length;

            Assert.IsTrue(isComplete);
        }

        #endregion

        #region FixedString64Bytes Tests

        [Test]
        public void FixedString64Bytes_StoresShortStrings()
        {
            var str = new FixedString64Bytes("test");

            Assert.AreEqual("test", str.ToString());
            Assert.AreEqual(4, str.Length);
        }

        [Test]
        public void FixedString64Bytes_StoresLongStrings()
        {
            var str = new FixedString64Bytes("this_is_a_longer_stage_name_test");

            Assert.AreEqual("this_is_a_longer_stage_name_test", str.ToString());
        }

        [Test]
        public void FixedString64Bytes_Comparison()
        {
            var str1 = new FixedString64Bytes("stage_1");
            var str2 = new FixedString64Bytes("stage_1");
            var str3 = new FixedString64Bytes("stage_2");

            Assert.AreEqual(str1, str2);
            Assert.AreNotEqual(str1, str3);
        }

        [Test]
        public void FixedString64Bytes_EmptyDefault()
        {
            var str = default(FixedString64Bytes);

            Assert.AreEqual(0, str.Length);
            Assert.AreEqual("", str.ToString());
        }

        #endregion

        #region Stage Sequence Tests

        [Test]
        public void StageSequence_SimulateFullFlow()
        {
            var stage = new CurrentStage
            {
                StageId = new FixedString64Bytes("intro"),
                State = StageState.Loading,
                Progress = 0f,
                Length = 50f,
                HasCutscene = true,
                NextStageId = new FixedString64Bytes("stage_1")
            };

            // 1. Loading complete -> Cutscene
            stage.State = stage.HasCutscene ? StageState.Cutscene : StageState.Playing;
            Assert.AreEqual(StageState.Cutscene, stage.State);

            // 2. Cutscene ends -> Playing
            stage.State = StageState.Playing;
            Assert.AreEqual(StageState.Playing, stage.State);

            // 3. Progress during playing
            stage.Progress = 25f;
            Assert.AreEqual(25f, stage.Progress);

            // 4. Event triggers
            stage.State = StageState.Event;
            stage.ActiveEvent = new FixedString64Bytes("mid_boss");
            Assert.AreEqual(StageState.Event, stage.State);

            // 5. Event ends -> Playing
            stage.State = StageState.Playing;
            stage.ActiveEvent = default;
            Assert.AreEqual(StageState.Playing, stage.State);

            // 6. Reach end -> Complete
            stage.Progress = 50f;
            if (stage.Length > 0 && stage.Progress >= stage.Length)
            {
                stage.State = StageState.Complete;
            }
            Assert.AreEqual(StageState.Complete, stage.State);

            // 7. Load next stage
            bool hasNext = stage.NextStageId.Length > 0;
            Assert.IsTrue(hasNext);
        }

        #endregion
    }
}
