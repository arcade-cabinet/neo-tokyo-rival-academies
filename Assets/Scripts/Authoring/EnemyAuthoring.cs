using Unity.Entities;
using Unity.Mathematics;
using UnityEngine;
using NeoTokyo.Components.Core;
using NeoTokyo.Components.Stats;
using NeoTokyo.Components.AI;
using NeoTokyo.Components.Combat;
using NeoTokyo.Systems.AI;

namespace NeoTokyo.Authoring
{
    /// <summary>
    /// Authoring component for enemy entities.
    /// Converts to: EnemyTag, RPGStats, EnemyAI, ThreatTable, Perception
    /// </summary>
    public class EnemyAuthoring : MonoBehaviour
    {
        [Header("RPG Stats")]
        [Tooltip("HP, Defense - determines survival capability")]
        public int structure = 8;

        [Tooltip("Attack, Crits - passionate fighting power")]
        public int ignition = 8;

        [Tooltip("Skills, Specials - tactical ability usage")]
        public int logic = 6;

        [Tooltip("Speed, Evasion - movement and dodge capability")]
        public int flow = 6;

        [Header("Health")]
        [Tooltip("Current health points")]
        public int currentHealth = 80;

        [Tooltip("Maximum health points")]
        public int maxHealth = 80;

        [Header("AI Behavior")]
        [Tooltip("Initial AI state")]
        public EnemyAIState initialState = EnemyAIState.Idle;

        [Tooltip("Range at which enemy detects and chases player")]
        public float aggroRange = 10f;

        [Tooltip("Range at which enemy can attack")]
        public float attackRange = 2f;

        [Tooltip("Cooldown between attacks in seconds")]
        public float attackCooldown = 1.5f;

        [Tooltip("Radius for patrol behavior")]
        public float patrolRadius = 5f;

        [Header("Threat System")]
        [Tooltip("Range at which threat is acquired")]
        public float threatAggroRange = 12f;

        [Tooltip("Range at which threat is lost")]
        public float threatDeaggroRange = 20f;

        [Tooltip("Rate at which threat decays per second")]
        public float threatDecayRate = 5f;

        [Header("Perception")]
        [Tooltip("Visual detection range")]
        public float sightRange = 15f;

        [Tooltip("Field of view angle in degrees")]
        [Range(0f, 360f)]
        public float sightAngle = 120f;

        [Tooltip("Audio detection range")]
        public float hearingRange = 8f;

        [Header("Combat State")]
        [Tooltip("Stability points (stagger resistance)")]
        public int stabilityMax = 100;

        [Tooltip("Break duration when stability depleted")]
        public float breakDuration = 2f;

        [Header("Boss Settings")]
        [Tooltip("Mark this enemy as a boss")]
        public bool isBoss = false;

        class Baker : Baker<EnemyAuthoring>
        {
            public override void Bake(EnemyAuthoring authoring)
            {
                var entity = GetEntity(TransformUsageFlags.Dynamic);
                var position = authoring.transform.position;

                // Tag component to identify enemy
                AddComponent(entity, new EnemyTag());

                // Add boss tag if applicable
                if (authoring.isBoss)
                {
                    AddComponent(entity, new BossTag());
                }

                // Core RPG stats
                AddComponent(entity, new RPGStats
                {
                    Structure = authoring.structure,
                    Ignition = authoring.ignition,
                    Logic = authoring.logic,
                    Flow = authoring.flow
                });

                // Health component
                AddComponent(entity, new Health
                {
                    Current = authoring.currentHealth,
                    Max = authoring.maxHealth
                });

                // Enemy AI component
                AddComponent(entity, new EnemyAI
                {
                    State = authoring.initialState,
                    StateTimer = 2f,
                    AggroRange = authoring.aggroRange,
                    AttackRange = authoring.attackRange,
                    AttackCooldown = authoring.attackCooldown,
                    CurrentCooldown = 0f,
                    PatrolOrigin = new float3(position.x, position.y, position.z),
                    PatrolRadius = authoring.patrolRadius,
                    CurrentPatrolTarget = new float3(position.x, position.y, position.z)
                });

                // Threat table for targeting
                AddComponent(entity, new ThreatTable
                {
                    CurrentTarget = Entity.Null,
                    AggroRange = authoring.threatAggroRange,
                    DeaggroRange = authoring.threatDeaggroRange,
                    ThreatDecayRate = authoring.threatDecayRate,
                    InCombat = false
                });

                // Perception capabilities
                AddComponent(entity, new Perception
                {
                    SightRange = authoring.sightRange,
                    SightAngle = authoring.sightAngle,
                    HearingRange = authoring.hearingRange,
                    CanSeeTarget = false,
                    CanHearTarget = false,
                    LastKnownTargetPosition = float3.zero
                });

                // Stability state for stagger mechanics
                AddComponent(entity, new StabilityState
                {
                    Current = authoring.stabilityMax,
                    Max = authoring.stabilityMax,
                    RecoveryRate = 10f
                });

                // Break state
                AddComponent(entity, new BreakState
                {
                    IsBroken = false,
                    BreakDuration = authoring.breakDuration,
                    RemainingBreakTime = 0f,
                    BreakCount = 0
                });

                // Character state tracking
                AddComponent(entity, CharacterStateComponent.Default);

                // Threat entry buffer for tracking multiple threats
                AddBuffer<ThreatEntry>(entity);

                // Damage event buffer
                AddBuffer<DamageEvent>(entity);
            }
        }
    }
}
