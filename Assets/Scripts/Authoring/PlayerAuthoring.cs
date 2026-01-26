using Unity.Entities;
using Unity.Mathematics;
using UnityEngine;
using NeoTokyo.Components.Core;
using NeoTokyo.Components.Stats;
using NeoTokyo.Components.Faction;
using NeoTokyo.Components.Abilities;

namespace NeoTokyo.Authoring
{
    /// <summary>
    /// Authoring component for player entities.
    /// Converts to: PlayerTag, RPGStats, Reputation, LevelProgress, ResourcePool
    /// </summary>
    public class PlayerAuthoring : MonoBehaviour
    {
        [Header("RPG Stats")]
        [Tooltip("HP, Defense - determines survival capability")]
        public int structure = 10;

        [Tooltip("Attack, Crits - passionate fighting power")]
        public int ignition = 10;

        [Tooltip("Skills, Specials - tactical ability usage")]
        public int logic = 10;

        [Tooltip("Speed, Evasion - movement and dodge capability")]
        public int flow = 10;

        [Header("Health & Resources")]
        [Tooltip("Current health points")]
        public int currentHealth = 100;

        [Tooltip("Maximum health points")]
        public int maxHealth = 100;

        [Tooltip("Current resource pool (mana/energy)")]
        public int currentResource = 50;

        [Tooltip("Maximum resource pool")]
        public int maxResource = 50;

        [Tooltip("Resource regeneration per second")]
        public float resourceRegenRate = 2f;

        [Header("Level & Progression")]
        [Tooltip("Current player level")]
        public int level = 1;

        [Tooltip("Current XP amount")]
        public int xp = 0;

        [Tooltip("XP required to reach next level")]
        public int xpToNextLevel = 100;

        [Header("Faction Reputation")]
        [Tooltip("Standing with Kurenai Academy (0-100)")]
        [Range(0, 100)]
        public int kurenaiReputation = 50;

        [Tooltip("Standing with Azure Academy (0-100)")]
        [Range(0, 100)]
        public int azureReputation = 50;

        class Baker : Baker<PlayerAuthoring>
        {
            public override void Bake(PlayerAuthoring authoring)
            {
                var entity = GetEntity(TransformUsageFlags.Dynamic);

                // Tag component to identify player
                AddComponent(entity, new PlayerTag());

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

                // Faction reputation
                AddComponent(entity, new Reputation
                {
                    Kurenai = authoring.kurenaiReputation,
                    Azure = authoring.azureReputation
                });

                // Level progression
                AddComponent(entity, new LevelProgress
                {
                    Level = authoring.level,
                    XP = authoring.xp,
                    XPToNextLevel = authoring.xpToNextLevel
                });

                // Resource pool for abilities
                AddComponent(entity, new ResourcePool
                {
                    Current = authoring.currentResource,
                    Maximum = authoring.maxResource,
                    RegenRate = authoring.resourceRegenRate
                });

                // Add ability slots (empty by default, populated at runtime)
                AddComponent(entity, new AbilitySlots
                {
                    Ability0 = Entity.Null,
                    Ability1 = Entity.Null,
                    Ability2 = Entity.Null,
                    Ability3 = Entity.Null
                });

                // Add reputation change buffer for tracking pending changes
                AddBuffer<ReputationChangeElement>(entity);
            }
        }
    }
}
