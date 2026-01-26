using Unity.Entities;
using Unity.Mathematics;

namespace NeoTokyo.Components.AI
{
    /// <summary>
    /// Swarm formation types for coordinated attacks.
    /// Equivalent to TypeScript: SwarmFormation enum in SwarmCoordination.ts
    /// </summary>
    public enum SwarmFormation : byte
    {
        Surround = 0,   // Evenly distributed circle around target
        Pincer = 1,     // Two groups on opposite sides
        Wave = 2        // Line formation
    }

    /// <summary>
    /// Swarm coordinator component - manages group tactics.
    /// Equivalent to TypeScript: SwarmCoordination class
    /// </summary>
    public struct SwarmCoordinator : IComponentData
    {
        public SwarmFormation CurrentFormation;
        public int SequenceIndex;
        public float FormationRadius;
        public float RetreatRadius;
        public float RetreatThreshold;  // Retreat when alive ratio below this (0.5 = 50%)
        public float3 SwarmCenter;
        public Entity TargetEntity;
        public bool ShouldRetreat;

        public static SwarmCoordinator Default => new SwarmCoordinator
        {
            CurrentFormation = SwarmFormation.Surround,
            SequenceIndex = 0,
            FormationRadius = 8f,
            RetreatRadius = 15f,
            RetreatThreshold = 0.5f,
            SwarmCenter = float3.zero,
            TargetEntity = Entity.Null,
            ShouldRetreat = false
        };
    }

    /// <summary>
    /// Tentacle agent component for boss swarm mechanics.
    /// Equivalent to TypeScript: TentacleAgent interface in TentacleSwarm.ts
    /// </summary>
    public struct TentacleAgent : IComponentData
    {
        public int TentacleIndex;           // 0-7 for 8 tentacles
        public float AttackCooldown;        // Current cooldown timer
        public float AttackInterval;        // Base attack interval (2.0s default)
        public float RegenerationTimer;    // Time until regeneration (10s default)
        public float RegenerationDuration;  // Duration before regen completes
        public bool IsAlive;
        public bool IsRegenerating;
        public float3 TargetFormationPosition;
        public float MoveSpeed;

        public static TentacleAgent Create(int index) => new TentacleAgent
        {
            TentacleIndex = index,
            AttackCooldown = index * 0.25f, // Stagger initial attacks
            AttackInterval = 2.0f,
            RegenerationTimer = 0f,
            RegenerationDuration = 10f,
            IsAlive = true,
            IsRegenerating = false,
            TargetFormationPosition = float3.zero,
            MoveSpeed = 3f
        };
    }

    /// <summary>
    /// Tag to identify entities that belong to a swarm.
    /// </summary>
    public struct SwarmMemberTag : IComponentData
    {
        public Entity CoordinatorEntity;  // Reference to the SwarmCoordinator
    }

    /// <summary>
    /// Tag for the alien ship boss entity that controls tentacle swarms.
    /// </summary>
    public struct AlienShipBossTag : IComponentData { }

    /// <summary>
    /// Buffer to track all swarm members for a coordinator.
    /// </summary>
    public struct SwarmMemberElement : IBufferElementData
    {
        public Entity MemberEntity;
        public int MemberIndex;
    }

    /// <summary>
    /// Attack request buffer for swarm coordination.
    /// </summary>
    public struct SwarmAttackRequest : IBufferElementData
    {
        public Entity AttackerEntity;
        public int AttackerIndex;
        public float3 TargetPosition;
    }
}
