using NUnit.Framework;
using Unity.Mathematics;
using NeoTokyo.Components.AI;

namespace NeoTokyo.Tests.EditMode
{
    /// <summary>
    /// Unit tests for PerceptionSystem components and logic.
    /// Tests vision cone math, line-of-sight checks, hearing detection.
    /// Command: Unity -batchmode -runTests -testPlatform EditMode
    /// </summary>
    [TestFixture]
    public class PerceptionSystemTests
    {
        #region VisionCone Tests

        [Test]
        public void VisionCone_DefaultValues()
        {
            var vision = VisionCone.Default;

            Assert.AreEqual(15f, vision.Range);
            Assert.AreEqual(120f, vision.AngleDegrees);
            Assert.AreEqual(0.5f, vision.PeripheralModifier);
            Assert.IsTrue(vision.IsActive);
        }

        [Test]
        public void VisionCone_NarrowVision()
        {
            var vision = VisionCone.Narrow;

            Assert.AreEqual(25f, vision.Range);
            Assert.AreEqual(60f, vision.AngleDegrees);
        }

        [Test]
        public void VisionCone_WideVision()
        {
            var vision = VisionCone.Wide;

            Assert.AreEqual(10f, vision.Range);
            Assert.AreEqual(180f, vision.AngleDegrees);
        }

        [Test]
        public void VisionCone_AngleToRadians()
        {
            var vision = VisionCone.Default;
            vision.AngleDegrees = 90f;

            float halfAngleRad = math.radians(vision.AngleDegrees / 2f);

            Assert.AreEqual(math.PI / 4f, halfAngleRad, 0.001f);
        }

        #endregion

        #region Vision Cone Point-In-Cone Tests

        [Test]
        public void VisionCone_PointInCone_DirectlyAhead()
        {
            float3 observerPos = float3.zero;
            float3 observerForward = new float3(0f, 0f, 1f);
            float range = 10f;
            float angleDegrees = 90f;

            float3 targetPos = new float3(0f, 0f, 5f);

            bool inCone = IsPointInVisionCone(observerPos, observerForward, targetPos, range, angleDegrees);

            Assert.IsTrue(inCone);
        }

        [Test]
        public void VisionCone_PointInCone_WithinAngle()
        {
            float3 observerPos = float3.zero;
            float3 observerForward = new float3(0f, 0f, 1f);
            float range = 10f;
            float angleDegrees = 90f;

            // 30 degrees to the right
            float3 targetPos = new float3(2.5f, 0f, 4.33f);

            bool inCone = IsPointInVisionCone(observerPos, observerForward, targetPos, range, angleDegrees);

            Assert.IsTrue(inCone);
        }

        [Test]
        public void VisionCone_PointInCone_OutsideAngle()
        {
            float3 observerPos = float3.zero;
            float3 observerForward = new float3(0f, 0f, 1f);
            float range = 10f;
            float angleDegrees = 60f; // Narrow cone

            // 45 degrees to the right (outside 30 degree half-angle)
            float3 targetPos = new float3(5f, 0f, 5f);

            bool inCone = IsPointInVisionCone(observerPos, observerForward, targetPos, range, angleDegrees);

            Assert.IsFalse(inCone);
        }

        [Test]
        public void VisionCone_PointInCone_BeyondRange()
        {
            float3 observerPos = float3.zero;
            float3 observerForward = new float3(0f, 0f, 1f);
            float range = 10f;
            float angleDegrees = 90f;

            float3 targetPos = new float3(0f, 0f, 15f);

            bool inCone = IsPointInVisionCone(observerPos, observerForward, targetPos, range, angleDegrees);

            Assert.IsFalse(inCone);
        }

        [Test]
        public void VisionCone_PointInCone_Behind()
        {
            float3 observerPos = float3.zero;
            float3 observerForward = new float3(0f, 0f, 1f);
            float range = 10f;
            float angleDegrees = 120f;

            float3 targetPos = new float3(0f, 0f, -5f);

            bool inCone = IsPointInVisionCone(observerPos, observerForward, targetPos, range, angleDegrees);

            Assert.IsFalse(inCone);
        }

        [Test]
        public void VisionCone_PointInCone_ExactEdge()
        {
            float3 observerPos = float3.zero;
            float3 observerForward = new float3(0f, 0f, 1f);
            float range = 10f;
            float angleDegrees = 90f;

            // Exactly at half-angle (45 degrees)
            float sin45 = math.sin(math.PI / 4f);
            float cos45 = math.cos(math.PI / 4f);
            float3 targetPos = new float3(sin45 * 5f, 0f, cos45 * 5f);

            bool inCone = IsPointInVisionCone(observerPos, observerForward, targetPos, range, angleDegrees);

            Assert.IsTrue(inCone);
        }

        #endregion

        #region HearingRange Tests

        [Test]
        public void HearingRange_DefaultValues()
        {
            var hearing = HearingRange.Default;

            Assert.AreEqual(20f, hearing.Range);
            Assert.AreEqual(1f, hearing.Sensitivity);
            Assert.AreEqual(2f, hearing.AlertThreshold);
            Assert.IsTrue(hearing.IsActive);
        }

        [Test]
        public void HearingRange_CanHear_InRange()
        {
            var hearing = HearingRange.Default;

            float3 listenerPos = float3.zero;
            float3 sourcePos = new float3(10f, 0f, 10f);
            float soundVolume = 1f;

            float distance = math.distance(listenerPos, sourcePos);
            bool canHear = distance <= hearing.Range;

            Assert.IsTrue(canHear);
        }

        [Test]
        public void HearingRange_CanHear_OutOfRange()
        {
            var hearing = HearingRange.Default;

            float3 listenerPos = float3.zero;
            float3 sourcePos = new float3(20f, 0f, 20f);

            float distance = math.distance(listenerPos, sourcePos);
            bool canHear = distance <= hearing.Range;

            Assert.IsFalse(canHear);
        }

        [Test]
        public void HearingRange_VolumeFalloff()
        {
            var hearing = HearingRange.Default;
            float baseVolume = 1f;

            float3 listenerPos = float3.zero;
            float3 nearSource = new float3(5f, 0f, 0f);
            float3 farSource = new float3(15f, 0f, 0f);

            float nearPerceived = CalculatePerceivedVolume(hearing, listenerPos, nearSource, baseVolume);
            float farPerceived = CalculatePerceivedVolume(hearing, listenerPos, farSource, baseVolume);

            Assert.Greater(nearPerceived, farPerceived);
        }

        [Test]
        public void HearingRange_SensitivityAffectsPerception()
        {
            var normalHearing = HearingRange.Default;
            normalHearing.Sensitivity = 1f;

            var sharpHearing = HearingRange.Default;
            sharpHearing.Sensitivity = 2f;

            float3 listenerPos = float3.zero;
            float3 sourcePos = new float3(15f, 0f, 0f);
            float baseVolume = 0.5f;

            float normalPerceived = CalculatePerceivedVolume(normalHearing, listenerPos, sourcePos, baseVolume);
            float sharpPerceived = CalculatePerceivedVolume(sharpHearing, listenerPos, sourcePos, baseVolume);

            Assert.Greater(sharpPerceived, normalPerceived);
        }

        #endregion

        #region Perception Component Tests

        [Test]
        public void Perception_DefaultValues()
        {
            var perception = Perception.Default;

            Assert.AreEqual(AIAwarenessState.Unaware, perception.CurrentState);
            Assert.AreEqual(0f, perception.AlertLevel);
            Assert.AreEqual(0f, perception.TimeSinceLastSighting);
            Assert.AreEqual(Unity.Entities.Entity.Null, perception.LastKnownTarget);
        }

        [Test]
        public void Perception_AlertLevelClamping()
        {
            var perception = Perception.Default;

            perception.AlertLevel = 1.5f;
            perception.AlertLevel = math.clamp(perception.AlertLevel, 0f, 1f);
            Assert.AreEqual(1f, perception.AlertLevel);

            perception.AlertLevel = -0.5f;
            perception.AlertLevel = math.clamp(perception.AlertLevel, 0f, 1f);
            Assert.AreEqual(0f, perception.AlertLevel);
        }

        [Test]
        public void Perception_StateTransitions()
        {
            var perception = Perception.Default;

            // Unaware -> Suspicious
            perception.AlertLevel = 0.3f;
            perception.CurrentState = GetAwarenessState(perception.AlertLevel);
            Assert.AreEqual(AIAwarenessState.Suspicious, perception.CurrentState);

            // Suspicious -> Alert
            perception.AlertLevel = 0.7f;
            perception.CurrentState = GetAwarenessState(perception.AlertLevel);
            Assert.AreEqual(AIAwarenessState.Alert, perception.CurrentState);

            // Alert -> Combat
            perception.AlertLevel = 1f;
            perception.CurrentState = GetAwarenessState(perception.AlertLevel);
            Assert.AreEqual(AIAwarenessState.Combat, perception.CurrentState);
        }

        #endregion

        #region Line-of-Sight Tests

        [Test]
        public void LineOfSight_DirectPath()
        {
            float3 from = float3.zero;
            float3 to = new float3(10f, 0f, 0f);

            // No obstacles
            bool hasLOS = CheckLineOfSight(from, to, out float distance);

            Assert.IsTrue(hasLOS);
            Assert.AreEqual(10f, distance, 0.001f);
        }

        [Test]
        public void LineOfSight_DistanceCalculation()
        {
            float3 from = float3.zero;
            float3 to = new float3(3f, 4f, 0f);

            CheckLineOfSight(from, to, out float distance);

            Assert.AreEqual(5f, distance, 0.001f); // 3-4-5 triangle
        }

        #endregion

        #region PerceptionMemory Tests

        [Test]
        public void PerceptionMemory_AddTarget()
        {
            var memory = new PerceptionMemory
            {
                LastKnownPosition = new float3(10f, 0f, 10f),
                LastSeenTime = 100f,
                TargetVelocity = new float3(1f, 0f, 0f),
                ThreatLevel = 0.5f,
                HasBeenSeen = true,
                HasBeenHeard = false
            };

            Assert.AreEqual(new float3(10f, 0f, 10f), memory.LastKnownPosition);
            Assert.AreEqual(100f, memory.LastSeenTime);
            Assert.IsTrue(memory.HasBeenSeen);
        }

        [Test]
        public void PerceptionMemory_PredictedPosition()
        {
            var memory = new PerceptionMemory
            {
                LastKnownPosition = new float3(10f, 0f, 10f),
                LastSeenTime = 100f,
                TargetVelocity = new float3(2f, 0f, 0f)
            };

            float currentTime = 102f; // 2 seconds later
            float3 predicted = PredictPosition(memory, currentTime);

            // Should be 4 units further in X
            Assert.AreEqual(14f, predicted.x, 0.001f);
            Assert.AreEqual(0f, predicted.y, 0.001f);
            Assert.AreEqual(10f, predicted.z, 0.001f);
        }

        [Test]
        public void PerceptionMemory_MemoryDecay()
        {
            var memory = new PerceptionMemory
            {
                LastSeenTime = 100f,
                ThreatLevel = 1f
            };

            float currentTime = 110f;
            float memoryDuration = 15f;

            float timeSinceSeen = currentTime - memory.LastSeenTime;
            float decayedThreat = memory.ThreatLevel * (1f - timeSinceSeen / memoryDuration);
            decayedThreat = math.max(0f, decayedThreat);

            Assert.AreEqual(0.333f, decayedThreat, 0.01f);
        }

        [Test]
        public void PerceptionMemory_MemoryExpired()
        {
            var memory = new PerceptionMemory
            {
                LastSeenTime = 100f,
                ThreatLevel = 1f
            };

            float currentTime = 120f;
            float memoryDuration = 15f;

            float timeSinceSeen = currentTime - memory.LastSeenTime;
            bool isExpired = timeSinceSeen >= memoryDuration;

            Assert.IsTrue(isExpired);
        }

        #endregion

        #region AIAwarenessState Tests

        [Test]
        public void AIAwarenessState_AllStatesExist()
        {
            Assert.AreEqual((byte)0, (byte)AIAwarenessState.Unaware);
            Assert.AreEqual((byte)1, (byte)AIAwarenessState.Suspicious);
            Assert.AreEqual((byte)2, (byte)AIAwarenessState.Alert);
            Assert.AreEqual((byte)3, (byte)AIAwarenessState.Combat);
            Assert.AreEqual((byte)4, (byte)AIAwarenessState.Searching);
        }

        #endregion

        #region Detection Modifier Tests

        [Test]
        public void DetectionModifier_StealthReducesDetection()
        {
            float baseDetection = 1f;
            float stealthModifier = 0.3f; // 30% harder to detect

            float effectiveDetection = baseDetection * (1f - stealthModifier);

            Assert.AreEqual(0.7f, effectiveDetection, 0.001f);
        }

        [Test]
        public void DetectionModifier_CrouchingReducesDetection()
        {
            float baseDetection = 1f;
            float crouchModifier = 0.5f;

            float effectiveDetection = baseDetection * crouchModifier;

            Assert.AreEqual(0.5f, effectiveDetection);
        }

        [Test]
        public void DetectionModifier_DarknessReducesVision()
        {
            var vision = VisionCone.Default;
            float darknessLevel = 0.7f; // 70% darkness

            float effectiveRange = vision.Range * (1f - darknessLevel * 0.5f);

            Assert.AreEqual(9.75f, effectiveRange, 0.001f);
        }

        [Test]
        public void DetectionModifier_MovementIncreasesDetection()
        {
            float baseDetection = 1f;
            float movementSpeed = 5f;
            float movementMultiplier = 1f + movementSpeed * 0.1f;

            float effectiveDetection = baseDetection * movementMultiplier;

            Assert.AreEqual(1.5f, effectiveDetection);
        }

        #endregion

        #region Sound Event Tests

        [Test]
        public void SoundEvent_LoudSound()
        {
            var sound = new SoundEvent
            {
                Position = new float3(10f, 0f, 10f),
                Volume = 1f, // Max volume
                SoundType = SoundType.Combat,
                SourceEntity = Unity.Entities.Entity.Null
            };

            Assert.AreEqual(1f, sound.Volume);
            Assert.AreEqual(SoundType.Combat, sound.SoundType);
        }

        [Test]
        public void SoundEvent_QuietSound()
        {
            var sound = new SoundEvent
            {
                Position = float3.zero,
                Volume = 0.2f,
                SoundType = SoundType.Footstep
            };

            Assert.AreEqual(0.2f, sound.Volume);
        }

        [Test]
        public void SoundType_AllTypesExist()
        {
            Assert.AreEqual((byte)0, (byte)SoundType.Footstep);
            Assert.AreEqual((byte)1, (byte)SoundType.Combat);
            Assert.AreEqual((byte)2, (byte)SoundType.Explosion);
            Assert.AreEqual((byte)3, (byte)SoundType.Voice);
            Assert.AreEqual((byte)4, (byte)SoundType.Object);
            Assert.AreEqual((byte)5, (byte)SoundType.Water);
        }

        #endregion

        #region Peripheral Vision Tests

        [Test]
        public void PeripheralVision_ReducedDetection()
        {
            var vision = VisionCone.Default;

            float3 observerPos = float3.zero;
            float3 observerForward = new float3(0f, 0f, 1f);

            // Target at edge of vision
            float3 edgeTarget = new float3(7f, 0f, 7f);

            float dotProduct = math.dot(observerForward,
                math.normalize(edgeTarget - observerPos));
            float halfAngle = math.radians(vision.AngleDegrees / 2f);
            float edgeThreshold = math.cos(halfAngle);

            // Calculate peripheral factor
            float centerThreshold = math.cos(halfAngle * 0.5f);
            bool isPeripheral = dotProduct < centerThreshold;
            float detectionModifier = isPeripheral ? vision.PeripheralModifier : 1f;

            Assert.AreEqual(0.5f, detectionModifier);
        }

        #endregion

        #region Helper Methods

        private static bool IsPointInVisionCone(
            float3 observerPos,
            float3 observerForward,
            float3 targetPos,
            float range,
            float angleDegrees)
        {
            float3 toTarget = targetPos - observerPos;
            float distance = math.length(toTarget);

            if (distance > range) return false;
            if (distance < 0.001f) return true;

            float3 dirToTarget = toTarget / distance;
            float dotProduct = math.dot(observerForward, dirToTarget);
            float halfAngleRad = math.radians(angleDegrees / 2f);
            float cosHalfAngle = math.cos(halfAngleRad);

            return dotProduct >= cosHalfAngle;
        }

        private static float CalculatePerceivedVolume(
            HearingRange hearing,
            float3 listenerPos,
            float3 sourcePos,
            float baseVolume)
        {
            float distance = math.distance(listenerPos, sourcePos);
            if (distance > hearing.Range) return 0f;

            float falloff = 1f - (distance / hearing.Range);
            return baseVolume * falloff * hearing.Sensitivity;
        }

        private static bool CheckLineOfSight(float3 from, float3 to, out float distance)
        {
            // Simplified LOS check (no obstacles)
            distance = math.distance(from, to);
            return true;
        }

        private static float3 PredictPosition(PerceptionMemory memory, float currentTime)
        {
            float timeDelta = currentTime - memory.LastSeenTime;
            return memory.LastKnownPosition + memory.TargetVelocity * timeDelta;
        }

        private static AIAwarenessState GetAwarenessState(float alertLevel)
        {
            if (alertLevel >= 1f) return AIAwarenessState.Combat;
            if (alertLevel >= 0.6f) return AIAwarenessState.Alert;
            if (alertLevel >= 0.2f) return AIAwarenessState.Suspicious;
            return AIAwarenessState.Unaware;
        }

        #endregion
    }
}
