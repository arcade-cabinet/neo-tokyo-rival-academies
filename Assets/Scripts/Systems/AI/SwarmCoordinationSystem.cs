using Unity.Burst;
using Unity.Collections;
using Unity.Entities;
using Unity.Mathematics;
using Unity.Transforms;
using NeoTokyo.Components.AI;
using NeoTokyo.Components.Core;
using NeoTokyo.Components.Stats;

namespace NeoTokyo.Systems.AI
{
    /// <summary>
    /// Coordinates attack patterns and formation behaviors for enemy swarms.
    /// Equivalent to TypeScript: SwarmCoordination.ts
    ///
    /// Responsibilities:
    /// - Calculates formation positions (Surround, Pincer, Wave)
    /// - Manages attack sequencing (staggered timing)
    /// - Determines retreat conditions
    /// - Updates swarm member target positions
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateBefore(typeof(TentacleSwarmSystem))]
    public partial struct SwarmCoordinationSystem : ISystem
    {
        [BurstCompile]
        public void OnCreate(ref SystemState state)
        {
            state.RequireForUpdate<SwarmCoordinator>();
        }

        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            float deltaTime = SystemAPI.Time.DeltaTime;

            // Get player position
            float3 playerPos = float3.zero;
            bool hasPlayer = false;

            foreach (var (_, transform) in
                SystemAPI.Query<RefRO<PlayerTag>, RefRO<LocalTransform>>())
            {
                playerPos = transform.ValueRO.Position;
                hasPlayer = true;
                break;
            }

            if (!hasPlayer) return;

            // Process each swarm coordinator
            foreach (var (coordinator, members, entity) in
                SystemAPI.Query<RefRW<SwarmCoordinator>, DynamicBuffer<SwarmMemberElement>>()
                    .WithEntityAccess())
            {
                // Update swarm center to track player
                coordinator.ValueRW.SwarmCenter = playerPos;

                // Count alive members
                int aliveCount = 0;
                int totalCount = members.Length;

                foreach (var member in members)
                {
                    if (SystemAPI.HasComponent<TentacleAgent>(member.MemberEntity))
                    {
                        var agent = SystemAPI.GetComponent<TentacleAgent>(member.MemberEntity);
                        if (agent.IsAlive) aliveCount++;
                    }
                }

                // Check retreat condition (50% casualties)
                float aliveRatio = totalCount > 0 ? (float)aliveCount / totalCount : 0f;
                coordinator.ValueRW.ShouldRetreat = aliveRatio < coordinator.ValueRO.RetreatThreshold;

                // Calculate formation positions and assign to members
                float radius = coordinator.ValueRO.ShouldRetreat
                    ? coordinator.ValueRO.RetreatRadius
                    : coordinator.ValueRO.FormationRadius;

                NativeArray<float3> formationPositions = CalculateFormationPositions(
                    playerPos,
                    aliveCount,
                    radius,
                    coordinator.ValueRO.CurrentFormation,
                    Allocator.Temp);

                // Assign formation positions to alive members
                int positionIndex = 0;
                foreach (var member in members)
                {
                    if (!SystemAPI.HasComponent<TentacleAgent>(member.MemberEntity)) continue;

                    var agent = SystemAPI.GetComponent<TentacleAgent>(member.MemberEntity);
                    if (!agent.IsAlive) continue;

                    if (positionIndex < formationPositions.Length)
                    {
                        agent.TargetFormationPosition = formationPositions[positionIndex];
                        SystemAPI.SetComponent(member.MemberEntity, agent);
                        positionIndex++;
                    }
                }

                formationPositions.Dispose();
            }
        }

        /// <summary>
        /// Calculate formation positions based on formation type.
        /// Equivalent to TypeScript: getFormationPositions()
        /// </summary>
        [BurstCompile]
        private NativeArray<float3> CalculateFormationPositions(
            float3 center,
            int memberCount,
            float radius,
            SwarmFormation formation,
            Allocator allocator)
        {
            var positions = new NativeArray<float3>(memberCount, allocator);

            switch (formation)
            {
                case SwarmFormation.Surround:
                    CalculateSurroundFormation(center, memberCount, radius, ref positions);
                    break;

                case SwarmFormation.Pincer:
                    CalculatePincerFormation(center, memberCount, radius, ref positions);
                    break;

                case SwarmFormation.Wave:
                    CalculateWaveFormation(center, memberCount, radius, ref positions);
                    break;
            }

            return positions;
        }

        /// <summary>
        /// Evenly distributed circle around target.
        /// </summary>
        [BurstCompile]
        private void CalculateSurroundFormation(
            float3 center,
            int count,
            float radius,
            ref NativeArray<float3> positions)
        {
            for (int i = 0; i < count; i++)
            {
                float angle = ((float)i / count) * math.PI * 2f;
                positions[i] = new float3(
                    center.x + math.cos(angle) * radius,
                    0f,
                    center.z + math.sin(angle) * radius
                );
            }
        }

        /// <summary>
        /// Two groups on opposite sides.
        /// </summary>
        [BurstCompile]
        private void CalculatePincerFormation(
            float3 center,
            int count,
            float radius,
            ref NativeArray<float3> positions)
        {
            int halfCount = count / 2;
            int remaining = count - halfCount;

            // Left group
            for (int i = 0; i < halfCount; i++)
            {
                float offset = (i - halfCount / 2f) * 2f;
                positions[i] = new float3(center.x - radius, 0f, center.z + offset);
            }

            // Right group
            for (int i = 0; i < remaining; i++)
            {
                float offset = (i - remaining / 2f) * 2f;
                positions[halfCount + i] = new float3(center.x + radius, 0f, center.z + offset);
            }
        }

        /// <summary>
        /// Line formation.
        /// </summary>
        [BurstCompile]
        private void CalculateWaveFormation(
            float3 center,
            int count,
            float radius,
            ref NativeArray<float3> positions)
        {
            for (int i = 0; i < count; i++)
            {
                float offset = (i - count / 2f) * 2f;
                positions[i] = new float3(center.x + offset, 0f, center.z - radius);
            }
        }
    }

    /// <summary>
    /// Helper methods for swarm coordination.
    /// </summary>
    public static class SwarmCoordinationHelpers
    {
        /// <summary>
        /// Get the next attacker from a sequence (round-robin with alive check).
        /// Equivalent to TypeScript: getNextAttacker()
        /// </summary>
        public static bool TryGetNextAttacker(
            DynamicBuffer<SwarmMemberElement> members,
            ref int sequenceIndex,
            ref ComponentLookup<TentacleAgent> agentLookup,
            out Entity attacker)
        {
            attacker = Entity.Null;
            if (members.Length == 0) return false;

            int startIndex = sequenceIndex;
            int attempts = 0;

            while (attempts < members.Length)
            {
                int index = sequenceIndex % members.Length;
                var member = members[index];

                sequenceIndex = (sequenceIndex + 1) % members.Length;

                if (agentLookup.HasComponent(member.MemberEntity))
                {
                    var agent = agentLookup[member.MemberEntity];
                    if (agent.IsAlive && agent.AttackCooldown <= 0f)
                    {
                        attacker = member.MemberEntity;
                        return true;
                    }
                }

                attempts++;
            }

            return false;
        }

        /// <summary>
        /// Initialize attack sequence with staggered timing.
        /// Equivalent to TypeScript: initializeAttackSequence()
        /// </summary>
        public static void InitializeAttackSequence(
            DynamicBuffer<SwarmMemberElement> members,
            ref ComponentLookup<TentacleAgent> agentLookup)
        {
            for (int i = 0; i < members.Length; i++)
            {
                var member = members[i];
                if (agentLookup.HasComponent(member.MemberEntity))
                {
                    var agent = agentLookup.GetRefRW(member.MemberEntity);
                    agent.ValueRW.AttackCooldown = i * 0.25f; // Stagger by 0.25s
                }
            }
        }

        /// <summary>
        /// Change swarm formation.
        /// </summary>
        public static void SetFormation(ref SwarmCoordinator coordinator, SwarmFormation formation)
        {
            coordinator.CurrentFormation = formation;
        }
    }
}
