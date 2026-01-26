using Unity.Entities;
using Unity.Collections;
using NeoTokyo.Components.Dialogue;

namespace NeoTokyo.Systems.Dialogue
{
    /// <summary>
    /// System that processes dialogue requests and advances dialogue state.
    /// Equivalent to TypeScript DialogueSystem.ts
    /// </summary>
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    public partial class DialogueManagementSystem : SystemBase
    {
        protected override void OnUpdate()
        {
            var ecb = new EntityCommandBuffer(Allocator.TempJob);

            // Process start dialogue requests
            ProcessStartRequests(ref ecb);

            // Process advance dialogue requests
            ProcessAdvanceRequests(ref ecb);

            ecb.Playback(EntityManager);
            ecb.Dispose();
        }

        private void ProcessStartRequests(ref EntityCommandBuffer ecb)
        {
            foreach (var (request, entity) in
                SystemAPI.Query<RefRO<StartDialogueRequest>>()
                    .WithEntityAccess())
            {
                // Find or create dialogue state on player
                foreach (var (dialogueState, playerEntity) in
                    SystemAPI.Query<RefRW<DialogueState>>()
                        .WithAll<Components.Core.PlayerTag>()
                        .WithEntityAccess())
                {
                    dialogueState.ValueRW.IsActive = true;
                    dialogueState.ValueRW.CurrentDialogueId = request.ValueRO.DialogueId;
                    dialogueState.ValueRW.CurrentNodeIndex = 0;
                    dialogueState.ValueRW.SpeakerEntity = request.ValueRO.SpeakerEntity;

                    // Add InDialogue tag
                    if (!SystemAPI.HasComponent<InDialogue>(playerEntity))
                    {
                        ecb.AddComponent<InDialogue>(playerEntity);
                    }
                }

                ecb.DestroyEntity(entity);
            }
        }

        private void ProcessAdvanceRequests(ref EntityCommandBuffer ecb)
        {
            foreach (var (request, entity) in
                SystemAPI.Query<RefRO<AdvanceDialogueRequest>>()
                    .WithEntityAccess())
            {
                foreach (var (dialogueState, choices, playerEntity) in
                    SystemAPI.Query<RefRW<DialogueState>, DynamicBuffer<DialogueChoice>>()
                        .WithAll<Components.Core.PlayerTag>()
                        .WithEntityAccess())
                {
                    if (!dialogueState.ValueRO.IsActive) continue;

                    if (request.ValueRO.ChoiceIndex >= 0 && choices.Length > request.ValueRO.ChoiceIndex)
                    {
                        // Choice selected
                        var choice = choices[request.ValueRO.ChoiceIndex];
                        dialogueState.ValueRW.CurrentNodeIndex = choice.NextNodeIndex;

                        // Apply reputation change if any
                        if (choice.ReputationChange != 0)
                        {
                            ApplyReputationFromChoice(playerEntity, choice.ReputationChange, ref ecb);
                        }
                    }
                    else
                    {
                        // Continue to next node
                        dialogueState.ValueRW.CurrentNodeIndex++;
                    }

                    // Check if dialogue ended (would need node lookup)
                    // For now, signal end after index exceeds buffer
                    // In real implementation, check against dialogue data asset
                }

                ecb.DestroyEntity(entity);
            }
        }

        private void ApplyReputationFromChoice(Entity playerEntity, int change, ref EntityCommandBuffer ecb)
        {
            if (SystemAPI.HasBuffer<Components.Faction.ReputationChangeElement>(playerEntity))
            {
                var buffer = SystemAPI.GetBuffer<Components.Faction.ReputationChangeElement>(playerEntity);
                buffer.Add(new Components.Faction.ReputationChangeElement
                {
                    Faction = Components.Faction.FactionType.Kurenai, // Default, would be determined by context
                    Amount = change,
                    Reason = new FixedString64Bytes("Dialogue choice")
                });
            }
        }
    }

    /// <summary>
    /// System that ends dialogue when conditions are met
    /// </summary>
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateAfter(typeof(DialogueManagementSystem))]
    public partial class DialogueEndSystem : SystemBase
    {
        protected override void OnUpdate()
        {
            var ecb = new EntityCommandBuffer(Allocator.TempJob);

            // Check for dialogues that should end
            foreach (var (dialogueState, entity) in
                SystemAPI.Query<RefRW<DialogueState>>()
                    .WithAll<InDialogue>()
                    .WithEntityAccess())
            {
                // Check end conditions (simplified - real impl needs dialogue data)
                if (dialogueState.ValueRO.CurrentNodeIndex < 0)
                {
                    dialogueState.ValueRW.IsActive = false;
                    dialogueState.ValueRW.CurrentDialogueId = default;
                    dialogueState.ValueRW.SpeakerEntity = Entity.Null;

                    ecb.RemoveComponent<InDialogue>(entity);
                }
            }

            ecb.Playback(EntityManager);
            ecb.Dispose();
        }
    }

    /// <summary>
    /// Static helpers for dialogue system
    /// </summary>
    public static class DialogueHelpers
    {
        /// <summary>
        /// Start a dialogue with an NPC
        /// </summary>
        public static void StartDialogue(EntityManager em, Entity speaker, FixedString64Bytes dialogueId)
        {
            var entity = em.CreateEntity();
            em.AddComponentData(entity, new StartDialogueRequest
            {
                SpeakerEntity = speaker,
                DialogueId = dialogueId
            });
        }

        /// <summary>
        /// Advance to next dialogue node or select a choice
        /// </summary>
        public static void AdvanceDialogue(EntityManager em, int choiceIndex = -1)
        {
            var entity = em.CreateEntity();
            em.AddComponentData(entity, new AdvanceDialogueRequest
            {
                ChoiceIndex = choiceIndex
            });
        }
    }
}
