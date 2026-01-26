using Unity.Entities;
using Unity.Mathematics;

namespace NeoTokyo.Components.AI
{
    /// <summary>
    /// Threat entry for AI targeting
    /// </summary>
    public struct ThreatEntry : IBufferElementData
    {
        public Entity TargetEntity;
        public float ThreatValue;
        public float LastUpdateTime;
    }

    /// <summary>
    /// AI perception and threat management
    /// </summary>
    public struct ThreatTable : IComponentData
    {
        public Entity CurrentTarget;
        public float AggroRange;
        public float DeaggroRange;
        public float ThreatDecayRate;
        public bool InCombat;
    }

    /// <summary>
    /// Perception capabilities
    /// </summary>
    public struct Perception : IComponentData
    {
        public float SightRange;
        public float SightAngle;
        public float HearingRange;
        public bool CanSeeTarget;
        public bool CanHearTarget;
        public float3 LastKnownTargetPosition;
    }

    /// <summary>
    /// Event when threat is generated
    /// </summary>
    public struct ThreatGeneratedEvent : IComponentData
    {
        public Entity Source;
        public Entity Target;
        public float Amount;
        public ThreatType Type;
    }

    public enum ThreatType : byte
    {
        Damage = 0,
        Healing = 1,
        Taunt = 2,
        Proximity = 3
    }
}
