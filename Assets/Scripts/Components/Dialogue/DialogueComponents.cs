using Unity.Entities;
using Unity.Collections;

namespace NeoTokyo.Components.Dialogue
{
    /// <summary>
    /// NPC that can engage in dialogue
    /// </summary>
    public struct DialogueSpeaker : IComponentData
    {
        public FixedString64Bytes SpeakerId;
        public FixedString64Bytes DisplayName;
        public bool IsInteractable;
    }

    /// <summary>
    /// Current dialogue state
    /// </summary>
    public struct DialogueState : IComponentData
    {
        public bool IsActive;
        public FixedString64Bytes CurrentDialogueId;
        public int CurrentNodeIndex;
        public Entity SpeakerEntity;
    }

    /// <summary>
    /// Dialogue node data - baked from JSON
    /// </summary>
    public struct DialogueNode : IComponentData
    {
        public FixedString64Bytes NodeId;
        public FixedString512Bytes Text;
        public FixedString64Bytes SpeakerId;
        public int NextNodeIndex;
        public bool HasChoices;
    }

    /// <summary>
    /// Dialogue choice option
    /// </summary>
    public struct DialogueChoice : IBufferElementData
    {
        public FixedString128Bytes Text;
        public int NextNodeIndex;
        public int ReputationChange;
        public FixedString64Bytes RequiredFlag;
    }

    /// <summary>
    /// Request to start dialogue
    /// </summary>
    public struct StartDialogueRequest : IComponentData
    {
        public Entity SpeakerEntity;
        public FixedString64Bytes DialogueId;
    }

    /// <summary>
    /// Request to advance dialogue
    /// </summary>
    public struct AdvanceDialogueRequest : IComponentData
    {
        public int ChoiceIndex; // -1 for continue, >= 0 for choice selection
    }

    /// <summary>
    /// Tag for player currently in dialogue
    /// </summary>
    public struct InDialogue : IComponentData { }
}
