using Unity.Entities;
using Unity.Mathematics;
using Unity.Collections;

namespace NeoTokyo.Components.AI
{
    /// <summary>
    /// Enhanced perception component for AI vision cone and line-of-sight detection.
    /// This is a more detailed version than the basic Perception in ThreatComponents.cs,
    /// providing full memory and multi-target tracking capabilities.
    ///
    /// Used by PerceptionSystem for:
    /// - Vision cone detection (dot product based)
    /// - Line-of-sight raycast checks (Unity Physics)
    /// - Hearing detection (distance-based)
    /// - Target memory with decay
    /// </summary>
    public struct PerceptionState : IComponentData
    {
        /// <summary>Maximum distance at which targets can be seen</summary>
        public float SightRange;

        /// <summary>Field of view angle in degrees (full cone width)</summary>
        public float SightAngle;

        /// <summary>Maximum distance at which sounds can be heard</summary>
        public float HearingRange;

        /// <summary>How long to remember targets after losing sight (seconds)</summary>
        public float MemoryDuration;

        /// <summary>Peripheral vision range (reduced detection at edges)</summary>
        public float PeripheralRange;

        /// <summary>Peripheral vision angle (wider but less accurate)</summary>
        public float PeripheralAngle;

        /// <summary>Minimum time between perception updates (performance)</summary>
        public float UpdateInterval;

        /// <summary>Time since last perception update</summary>
        public float TimeSinceLastUpdate;

        /// <summary>Current alert level (0 = unaware, 1 = fully alert)</summary>
        public float AlertLevel;

        /// <summary>Rate at which alert level decays when no threats</summary>
        public float AlertDecayRate;

        /// <summary>Whether perception is currently active</summary>
        public bool IsActive;

        /// <summary>Create default perception settings</summary>
        public static PerceptionState Default => new PerceptionState
        {
            SightRange = 15f,
            SightAngle = 90f,
            HearingRange = 10f,
            MemoryDuration = 5f,
            PeripheralRange = 20f,
            PeripheralAngle = 150f,
            UpdateInterval = 0.1f,
            TimeSinceLastUpdate = 0f,
            AlertLevel = 0f,
            AlertDecayRate = 0.2f,
            IsActive = true
        };

        /// <summary>Create perception for a patrolling guard</summary>
        public static PerceptionState Guard => new PerceptionState
        {
            SightRange = 20f,
            SightAngle = 120f,
            HearingRange = 15f,
            MemoryDuration = 10f,
            PeripheralRange = 25f,
            PeripheralAngle = 180f,
            UpdateInterval = 0.05f,
            TimeSinceLastUpdate = 0f,
            AlertLevel = 0f,
            AlertDecayRate = 0.1f,
            IsActive = true
        };

        /// <summary>Create perception for a civilian NPC</summary>
        public static PerceptionState Civilian => new PerceptionState
        {
            SightRange = 8f,
            SightAngle = 60f,
            HearingRange = 5f,
            MemoryDuration = 2f,
            PeripheralRange = 12f,
            PeripheralAngle = 120f,
            UpdateInterval = 0.2f,
            TimeSinceLastUpdate = 0f,
            AlertLevel = 0f,
            AlertDecayRate = 0.5f,
            IsActive = true
        };
    }

    /// <summary>
    /// Buffer element for tracking perceived targets with memory.
    /// Each entry represents a target the AI has seen or heard.
    /// </summary>
    public struct PerceivedTarget : IBufferElementData
    {
        /// <summary>The target entity being tracked</summary>
        public Entity Target;

        /// <summary>Last known position of the target</summary>
        public float3 LastKnownPosition;

        /// <summary>Time since the target was last seen (increases when not visible)</summary>
        public float TimeSinceLastSeen;

        /// <summary>Whether the target is currently visible</summary>
        public bool IsCurrentlyVisible;

        /// <summary>Calculated threat level (0-100)</summary>
        public float ThreatLevel;

        /// <summary>Whether target was detected by hearing (vs sight)</summary>
        public bool DetectedByHearing;

        /// <summary>Last known velocity for prediction</summary>
        public float3 LastKnownVelocity;

        /// <summary>Distance when last seen</summary>
        public float LastKnownDistance;

        /// <summary>Time this target was first detected</summary>
        public double FirstDetectedTime;

        /// <summary>Whether this is the primary (highest priority) target</summary>
        public bool IsPrimaryTarget;
    }

    /// <summary>
    /// Vision cone configuration and current state.
    /// Defines the AI's field of view for visual detection.
    /// </summary>
    public struct SightCone : IComponentData
    {
        /// <summary>Current look direction (normalized)</summary>
        public float3 Direction;

        /// <summary>Half angle of the cone in degrees</summary>
        public float HalfAngle;

        /// <summary>Maximum range of the cone</summary>
        public float Range;

        /// <summary>Near plane distance (minimum detection range)</summary>
        public float NearPlane;

        /// <summary>Height offset from entity position (eye height)</summary>
        public float EyeHeight;

        /// <summary>Layer mask for blocking objects (if using physics)</summary>
        public uint BlockingLayers;

        /// <summary>Whether cone visualization is enabled (debug)</summary>
        public bool DebugVisualize;

        /// <summary>Create default sight cone</summary>
        public static SightCone Default => new SightCone
        {
            Direction = new float3(0f, 0f, 1f),
            HalfAngle = 45f,
            Range = 15f,
            NearPlane = 0.5f,
            EyeHeight = 1.6f,
            BlockingLayers = uint.MaxValue,
            DebugVisualize = false
        };
    }

    /// <summary>
    /// Line-of-sight check result.
    /// Stores the result of a raycast between the AI and a target.
    /// </summary>
    public struct LineOfSight : IComponentData
    {
        /// <summary>Whether there is unobstructed line of sight to current target</summary>
        public bool HasLOS;

        /// <summary>Entity blocking the line of sight (if any)</summary>
        public Entity BlockingEntity;

        /// <summary>Point where the ray was blocked</summary>
        public float3 BlockPoint;

        /// <summary>Distance to the blocking point (or target if no block)</summary>
        public float Distance;

        /// <summary>Surface normal at the block point</summary>
        public float3 BlockNormal;

        /// <summary>Whether the blocking object is destructible</summary>
        public bool BlockIsDestructible;

        /// <summary>Time of last LOS check</summary>
        public double LastCheckTime;
    }

    /// <summary>
    /// Hearing detection results.
    /// Tracks sounds the AI has detected.
    /// </summary>
    public struct HearingState : IComponentData
    {
        /// <summary>Whether a sound is currently detected</summary>
        public bool HearsSound;

        /// <summary>Direction to the sound source</summary>
        public float3 SoundDirection;

        /// <summary>Estimated distance to sound</summary>
        public float SoundDistance;

        /// <summary>Intensity of the sound (0-1)</summary>
        public float SoundIntensity;

        /// <summary>Type of sound detected</summary>
        public SoundType DetectedSoundType;

        /// <summary>Entity that made the sound (if known)</summary>
        public Entity SoundSource;

        /// <summary>Time of last sound detection</summary>
        public double LastSoundTime;
    }

    /// <summary>
    /// Types of sounds that can be detected.
    /// </summary>
    public enum SoundType : byte
    {
        None = 0,
        Footstep = 1,
        Combat = 2,
        Voice = 3,
        Gunshot = 4,
        Explosion = 5,
        Alert = 6,
        Environment = 7
    }

    /// <summary>
    /// Sound emission component for entities that make noise.
    /// </summary>
    public struct SoundEmitter : IComponentData
    {
        /// <summary>Base volume of sounds emitted (affects detection range)</summary>
        public float BaseVolume;

        /// <summary>Current volume multiplier (movement, combat, etc.)</summary>
        public float CurrentMultiplier;

        /// <summary>Type of sound being emitted</summary>
        public SoundType SoundType;

        /// <summary>Whether currently making sound</summary>
        public bool IsEmitting;

        /// <summary>Range at which sound can be heard at full volume</summary>
        public float EffectiveRange => BaseVolume * CurrentMultiplier * 10f;
    }

    /// <summary>
    /// Request to perform a perception scan.
    /// Created to trigger immediate perception update.
    /// </summary>
    public struct PerceptionScanRequest : IComponentData
    {
        /// <summary>Entity requesting the scan</summary>
        public Entity RequestingEntity;

        /// <summary>Whether to force a full scan (ignore cooldown)</summary>
        public bool ForceScan;

        /// <summary>Specific target to check (Entity.Null for all targets)</summary>
        public Entity SpecificTarget;
    }

    /// <summary>
    /// Event fired when a new target is detected.
    /// </summary>
    public struct TargetDetectedEvent : IComponentData
    {
        /// <summary>Entity that detected the target</summary>
        public Entity Detector;

        /// <summary>Entity that was detected</summary>
        public Entity Target;

        /// <summary>How the target was detected</summary>
        public DetectionMethod Method;

        /// <summary>Initial threat assessment</summary>
        public float ThreatLevel;

        /// <summary>Position where detected</summary>
        public float3 DetectedPosition;
    }

    /// <summary>
    /// Event fired when a target is lost (memory expired).
    /// </summary>
    public struct TargetLostEvent : IComponentData
    {
        /// <summary>Entity that lost track of target</summary>
        public Entity Detector;

        /// <summary>Entity that was lost</summary>
        public Entity Target;

        /// <summary>Last known position</summary>
        public float3 LastKnownPosition;

        /// <summary>How long the target was tracked</summary>
        public float TrackingDuration;
    }

    /// <summary>
    /// Method by which a target was detected.
    /// </summary>
    public enum DetectionMethod : byte
    {
        /// <summary>Direct line of sight</summary>
        Sight = 0,

        /// <summary>Peripheral vision (less accurate)</summary>
        Peripheral = 1,

        /// <summary>Sound detection</summary>
        Hearing = 2,

        /// <summary>Alert from another AI</summary>
        Alert = 3,

        /// <summary>Damage taken from target</summary>
        Damage = 4,

        /// <summary>Investigation of suspicious activity</summary>
        Investigation = 5
    }

    /// <summary>
    /// Static helper methods for perception calculations.
    /// </summary>
    public static class PerceptionHelpers
    {
        /// <summary>
        /// Check if a point is within a vision cone.
        /// </summary>
        /// <param name="origin">Origin of the cone</param>
        /// <param name="direction">Direction the cone faces (normalized)</param>
        /// <param name="halfAngle">Half angle of the cone in degrees</param>
        /// <param name="range">Maximum range of the cone</param>
        /// <param name="targetPoint">Point to check</param>
        /// <returns>True if point is within cone</returns>
        public static bool IsInVisionCone(
            float3 origin,
            float3 direction,
            float halfAngle,
            float range,
            float3 targetPoint)
        {
            float3 toTarget = targetPoint - origin;
            float distance = math.length(toTarget);

            if (distance > range || distance < 0.01f) return false;

            float3 dirToTarget = math.normalize(toTarget);
            float dot = math.dot(direction, dirToTarget);
            float angle = math.degrees(math.acos(math.clamp(dot, -1f, 1f)));

            return angle <= halfAngle;
        }

        /// <summary>
        /// Calculate threat level based on target properties.
        /// </summary>
        /// <param name="distance">Distance to target</param>
        /// <param name="maxRange">Maximum perception range</param>
        /// <param name="isArmed">Whether target appears armed</param>
        /// <param name="isMovingToward">Whether target is approaching</param>
        /// <returns>Threat level 0-100</returns>
        public static float CalculateThreatLevel(
            float distance,
            float maxRange,
            bool isArmed,
            bool isMovingToward)
        {
            // Base threat from proximity (closer = more threat)
            float proximityThreat = (1f - math.clamp(distance / maxRange, 0f, 1f)) * 40f;

            // Armed targets are more threatening
            float armedBonus = isArmed ? 30f : 0f;

            // Approaching targets are more threatening
            float approachBonus = isMovingToward ? 20f : 0f;

            // Base threat for any detected target
            float baseThreat = 10f;

            return math.clamp(baseThreat + proximityThreat + armedBonus + approachBonus, 0f, 100f);
        }

        /// <summary>
        /// Calculate how long until target memory expires.
        /// </summary>
        /// <param name="timeSinceLastSeen">Time since target was visible</param>
        /// <param name="memoryDuration">Total memory duration</param>
        /// <returns>Remaining memory time (0 if expired)</returns>
        public static float GetRemainingMemoryTime(float timeSinceLastSeen, float memoryDuration)
        {
            return math.max(0f, memoryDuration - timeSinceLastSeen);
        }

        /// <summary>
        /// Predict target position based on last known position and velocity.
        /// </summary>
        /// <param name="lastPosition">Last known position</param>
        /// <param name="lastVelocity">Last known velocity</param>
        /// <param name="timeSinceLastSeen">Time elapsed since last seen</param>
        /// <returns>Predicted current position</returns>
        public static float3 PredictTargetPosition(
            float3 lastPosition,
            float3 lastVelocity,
            float timeSinceLastSeen)
        {
            // Simple linear prediction
            return lastPosition + lastVelocity * timeSinceLastSeen;
        }

        /// <summary>
        /// Calculate detection difficulty based on environmental factors.
        /// </summary>
        /// <param name="lightLevel">Ambient light level 0-1</param>
        /// <param name="targetIsMoving">Whether target is moving</param>
        /// <param name="targetInCover">Whether target is behind cover</param>
        /// <returns>Detection difficulty multiplier (higher = harder to detect)</returns>
        public static float GetDetectionDifficulty(
            float lightLevel,
            bool targetIsMoving,
            bool targetInCover)
        {
            float baseDifficulty = 1f;

            // Darkness makes detection harder
            baseDifficulty *= math.lerp(2f, 1f, lightLevel);

            // Moving targets are easier to spot
            if (targetIsMoving) baseDifficulty *= 0.7f;

            // Cover provides concealment
            if (targetInCover) baseDifficulty *= 1.5f;

            return baseDifficulty;
        }
    }
}
