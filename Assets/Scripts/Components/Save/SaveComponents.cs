using Unity.Entities;
using Unity.Collections;

namespace NeoTokyo.Components.Save
{
    /// <summary>
    /// Tag for entities that should be saved
    /// </summary>
    public struct Saveable : IComponentData
    {
        public FixedString64Bytes SaveId;
    }

    /// <summary>
    /// Save file metadata
    /// </summary>
    public struct SaveMetadata : IComponentData
    {
        public FixedString64Bytes SaveSlotId;
        public FixedString64Bytes PlayerName;
        public int PlayTimeSeconds;
        public int SaveVersion;
        public long TimestampUnix;
    }

    /// <summary>
    /// Player progress snapshot for saving
    /// </summary>
    public struct PlayerProgressSnapshot : IComponentData
    {
        public int Level;
        public int Experience;
        public int Currency;
        public int Structure;
        public int Ignition;
        public int Logic;
        public int Flow;
        public int KurenaiRep;
        public int AzureRep;
    }

    /// <summary>
    /// Current stage/location for saving
    /// </summary>
    public struct LocationSnapshot : IComponentData
    {
        public FixedString64Bytes StageId;
        public FixedString64Bytes AreaId;
        public float PositionX;
        public float PositionY;
        public float PositionZ;
    }

    /// <summary>
    /// Quest state for saving
    /// </summary>
    public struct QuestStateSnapshot : IBufferElementData
    {
        public FixedString64Bytes QuestId;
        public int CurrentStep;
        public bool IsCompleted;
        public bool IsActive;
    }

    /// <summary>
    /// Request to save game
    /// </summary>
    public struct SaveGameRequest : IComponentData
    {
        public FixedString64Bytes SlotId;
    }

    /// <summary>
    /// Request to load game
    /// </summary>
    public struct LoadGameRequest : IComponentData
    {
        public FixedString64Bytes SlotId;
    }
}
