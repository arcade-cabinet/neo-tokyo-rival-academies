using Unity.Burst;
using Unity.Collections;
using Unity.Entities;
using Unity.Mathematics;
using NeoTokyo.Components.Combat;
using NeoTokyo.Components.Stats;

namespace NeoTokyo.Systems.Combat
{
    /// <summary>
    /// Combat damage calculation system.
    /// Equivalent to TypeScript: CombatLogic.ts
    ///
    /// Base Formula:
    /// Damage = (Attacker.AttackPower * StatMultiplier) - (Defender.Defense / 2)
    ///
    /// StatMultiplier:
    /// - Ignition for melee attacks
    /// - Logic for ranged/tech attacks
    ///
    /// Critical Hit: 1.5x multiplier (chance based on Ignition, max 50%)
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateBefore(typeof(CombatSystem))]
    public partial struct CombatLogicSystem : ISystem
    {
        private const float BASE_ATTACK = 10f;
        private const float CRIT_MULTIPLIER = 1.5f;
        private const float MAX_CRIT_CHANCE = 0.5f;
        private const int MIN_DAMAGE = 1;

        [BurstCompile]
        public void OnCreate(ref SystemState state)
        {
            state.RequireForUpdate<DamageRequest>();
            state.RequireForUpdate<EndSimulationEntityCommandBufferSystem.Singleton>();
        }

        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            // Note: ECB not actively used in this method after review, but keeping singleton pattern
            // for consistency and future extensibility
            var ecb = SystemAPI.GetSingleton<EndSimulationEntityCommandBufferSystem.Singleton>()
                .CreateCommandBuffer(state.WorldUnmanaged);

            // Process all damage requests
            foreach (var (requests, results, entity) in
                SystemAPI.Query<DynamicBuffer<DamageRequest>, DynamicBuffer<CombatResult>>()
                    .WithEntityAccess())
            {
                foreach (var request in requests)
                {
                    if (!SystemAPI.HasComponent<RPGStats>(request.Attacker) ||
                        !SystemAPI.HasComponent<RPGStats>(request.Defender))
                    {
                        continue;
                    }

                    var attackerStats = SystemAPI.GetComponent<RPGStats>(request.Attacker);
                    var defenderStats = SystemAPI.GetComponent<RPGStats>(request.Defender);

                    var result = CalculateDamage(
                        attackerStats,
                        defenderStats,
                        request.Type,
                        request.RandomSeed);

                    result.Attacker = request.Attacker;
                    result.Defender = request.Defender;

                    results.Add(result);

                    // Also add damage event to defender
                    if (SystemAPI.HasBuffer<DamageEvent>(request.Defender))
                    {
                        var defenderDamageBuffer = SystemAPI.GetBuffer<DamageEvent>(request.Defender);
                        defenderDamageBuffer.Add(new DamageEvent
                        {
                            Source = request.Attacker,
                            Amount = result.Damage,
                            IsCritical = result.IsCritical,
                            StabilityDamage = result.Damage * 0.5f // 50% of damage as stability damage
                        });
                    }
                }

                requests.Clear();
            }
        }

        /// <summary>
        /// Calculate damage for an attack.
        /// Equivalent to TypeScript: calculateDamage()
        /// </summary>
        [BurstCompile]
        private CombatResult CalculateDamage(
            RPGStats attacker,
            RPGStats defender,
            AttackType attackType,
            uint randomSeed)
        {
            // Get attack power based on attack type
            float attackPower = GetAttackPower(attacker, attackType);

            // Get stat multiplier
            float statMultiplier = GetStatMultiplier(attacker, attackType);

            // Get defense
            float defense = GetDefense(defender);

            // Calculate base damage: (AttackPower * StatMultiplier) - (Defense / 2)
            float baseDamage = (attackPower * statMultiplier) - (defense / 2f);

            // Ensure minimum damage
            int damage = math.max(MIN_DAMAGE, (int)math.floor(baseDamage));

            // Critical hit logic (1% per Ignition point, max 50%)
            float critChance = math.min(attacker.Ignition * 0.01f, MAX_CRIT_CHANCE);
            var random = new Unity.Mathematics.Random(randomSeed);
            bool isCritical = random.NextFloat() < critChance;

            if (isCritical)
            {
                damage = (int)math.floor(damage * CRIT_MULTIPLIER);
            }

            return new CombatResult
            {
                Damage = damage,
                IsCritical = isCritical,
                Type = attackType
            };
        }

        /// <summary>
        /// Get attack power for an entity based on attack type.
        /// Equivalent to TypeScript: getAttackPower()
        /// </summary>
        [BurstCompile]
        private float GetAttackPower(RPGStats stats, AttackType attackType)
        {
            if (attackType == AttackType.Melee)
            {
                return BASE_ATTACK + stats.Ignition * 0.5f;
            }

            // Ranged and tech use Logic stat
            return BASE_ATTACK + stats.Logic * 0.5f;
        }

        /// <summary>
        /// Get stat multiplier based on attack type.
        /// Equivalent to TypeScript: getStatMultiplier()
        /// </summary>
        [BurstCompile]
        private float GetStatMultiplier(RPGStats stats, AttackType attackType)
        {
            if (attackType == AttackType.Melee)
            {
                return stats.Ignition / 10f;
            }

            // Ranged and tech use Logic stat
            return stats.Logic / 10f;
        }

        /// <summary>
        /// Get defense value for an entity.
        /// Equivalent to TypeScript: getDefense()
        /// </summary>
        [BurstCompile]
        private float GetDefense(RPGStats stats)
        {
            return stats.Structure / 10f;
        }
    }

    /// <summary>
    /// System to initialize CombatStats from RPGStats.
    /// Run once when entities are created or stats change.
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(InitializationSystemGroup))]
    public partial struct CombatStatsInitSystem : ISystem
    {
        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            foreach (var (rpgStats, combatStats) in
                SystemAPI.Query<RefRO<RPGStats>, RefRW<CombatStats>>())
            {
                // Recalculate combat stats from RPG stats
                combatStats.ValueRW = CombatStats.FromRPGStats(
                    rpgStats.ValueRO.Structure,
                    rpgStats.ValueRO.Ignition,
                    rpgStats.ValueRO.Logic
                );
            }
        }
    }

    /// <summary>
    /// Legacy combat resolution for backward compatibility.
    /// </summary>
    public static class CombatLogicHelpers
    {
        /// <summary>
        /// Calculate damage using melee attack type.
        /// Equivalent to TypeScript: resolveCombat()
        /// </summary>
        public static (int damage, bool isCritical) ResolveCombat(
            RPGStats attacker,
            RPGStats defender,
            uint randomSeed)
        {
            const float BASE_ATTACK = 10f;
            const float CRIT_MULTIPLIER = 1.5f;

            // Get attacker's attack power (Ignition-based for melee)
            float attackPower = attacker.Ignition;

            // Get defender's defense
            float defense = defender.Structure / 10f;

            // Calculate base damage
            float baseDamage = attackPower - defense;
            int damage = math.max(1, (int)math.floor(baseDamage));

            // Critical hit logic (1% per Ignition, max 50%)
            float critChance = math.min(attacker.Ignition * 0.01f, 0.5f);
            var random = new Unity.Mathematics.Random(randomSeed);
            bool isCritical = random.NextFloat() < critChance;

            if (isCritical)
            {
                damage = (int)math.floor(damage * CRIT_MULTIPLIER);
            }

            return (damage, isCritical);
        }

        /// <summary>
        /// Queue a damage request between two entities.
        /// </summary>
        public static void QueueDamageRequest(
            EntityManager entityManager,
            Entity combatProcessor,
            Entity attacker,
            Entity defender,
            AttackType type,
            uint randomSeed)
        {
            if (!entityManager.HasBuffer<DamageRequest>(combatProcessor))
            {
                entityManager.AddBuffer<DamageRequest>(combatProcessor);
            }

            var requests = entityManager.GetBuffer<DamageRequest>(combatProcessor);
            requests.Add(new DamageRequest
            {
                Attacker = attacker,
                Defender = defender,
                Type = type,
                RandomSeed = randomSeed
            });
        }

        /// <summary>
        /// Direct damage calculation without ECS (for utilities/testing).
        /// </summary>
        public static int CalculateDirectDamage(
            int attackerIgnition,
            int attackerLogic,
            int defenderStructure,
            AttackType attackType,
            bool forceCritical = false)
        {
            const float BASE_ATTACK = 10f;

            float attackPower = attackType == AttackType.Melee
                ? BASE_ATTACK + attackerIgnition * 0.5f
                : BASE_ATTACK + attackerLogic * 0.5f;

            float statMultiplier = attackType == AttackType.Melee
                ? attackerIgnition / 10f
                : attackerLogic / 10f;

            float defense = defenderStructure / 10f;

            float baseDamage = (attackPower * statMultiplier) - (defense / 2f);
            int damage = math.max(1, (int)math.floor(baseDamage));

            if (forceCritical)
            {
                damage = (int)math.floor(damage * 1.5f);
            }

            return damage;
        }
    }
}
