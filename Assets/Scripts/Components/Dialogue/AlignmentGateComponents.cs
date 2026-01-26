using Unity.Entities;
using Unity.Collections;
using NeoTokyo.Components.Faction;

namespace NeoTokyo.Components.Dialogue
{
    /// <summary>
    /// Alignment requirements for gated content.
    /// Based on Golden Record v2.0 alignment system:
    /// - Kurenai (Passion) vs Azure (Logic) on -1.0 to +1.0 scale
    /// - Reputation values 0-100 for each faction
    ///
    /// Reference: docs/GOLDEN_RECORD_MASTER.md Alignment System section
    /// </summary>
    public enum AlignmentRequirement : byte
    {
        /// <summary>No alignment requirement - always unlocked</summary>
        None = 0,

        /// <summary>Kurenai rep > Azure + 25 (strong passion lean)</summary>
        KurenaiStrong = 1,

        /// <summary>Kurenai rep > Azure + 50 (extreme passion - unlocks Kurenai coup questline)</summary>
        KurenaiExtreme = 2,

        /// <summary>Azure rep > Kurenai + 25 (strong logic lean)</summary>
        AzureStrong = 3,

        /// <summary>Azure rep > Kurenai + 50 (extreme logic - unlocks Azure takeover questline)</summary>
        AzureExtreme = 4,

        /// <summary>|Kurenai - Azure| < 10 (balanced/neutral path)</summary>
        Neutral = 5,

        /// <summary>Both Kurenai and Azure > 60 (respected by both academies)</summary>
        HighReputation = 6,

        /// <summary>Both Kurenai and Azure < 40 (distrusted by both academies)</summary>
        LowReputation = 7
    }

    /// <summary>
    /// Base alignment gate component for content gating.
    /// Attach to any entity that should be locked/unlocked based on alignment.
    /// </summary>
    public struct AlignmentGate : IComponentData
    {
        /// <summary>The alignment requirement to unlock this gate</summary>
        public AlignmentRequirement Requirement;

        /// <summary>Whether the gate is currently unlocked for the player</summary>
        public bool IsUnlocked;

        /// <summary>Optional: timestamp when gate was unlocked</summary>
        public double UnlockedAtTime;
    }

    /// <summary>
    /// Dialogue-specific gate for alignment-locked dialogue options.
    /// Used to show/hide dialogue choices based on player alignment.
    /// </summary>
    public struct DialogueGate : IComponentData
    {
        /// <summary>ID of the dialogue this gate controls</summary>
        public int DialogueId;

        /// <summary>Alignment requirement to access this dialogue</summary>
        public AlignmentRequirement Requirement;

        /// <summary>Alternative dialogue ID if gate is locked (0 = no alternative)</summary>
        public int LockedAlternativeId;

        /// <summary>Whether this is a one-time unlock or requires continuous alignment</summary>
        public bool PermanentUnlock;
    }

    /// <summary>
    /// Quest-specific gate for alignment and faction-locked quests.
    /// Supports both alignment requirements and faction reputation checks.
    ///
    /// Golden Record specifies faction-specific questlines:
    /// - Extreme Kurenai: Kurenai coup questline
    /// - Extreme Azure: Azure takeover questline
    /// </summary>
    public struct QuestGate : IComponentData
    {
        /// <summary>ID of the quest this gate controls</summary>
        public int QuestId;

        /// <summary>Alignment requirement (optional)</summary>
        public AlignmentRequirement Requirement;

        /// <summary>Required faction membership (Neutral = any faction)</summary>
        public FactionType RequiredFaction;

        /// <summary>Minimum reputation with RequiredFaction (0-100)</summary>
        public int MinFactionReputation;

        /// <summary>Whether quest becomes permanently available once unlocked</summary>
        public bool PermanentUnlock;

        /// <summary>Whether this quest is part of the main story</summary>
        public bool IsMainStory;
    }

    /// <summary>
    /// Area/territory gate for alignment-locked regions.
    /// Controls access to territories based on alignment and faction standing.
    ///
    /// Reference: Golden Record Territory Profiles (10 canonical territories)
    /// </summary>
    public struct AreaGate : IComponentData
    {
        /// <summary>Territory identifier (matches TerritoryManifest.id)</summary>
        public FixedString64Bytes TerritoryId;

        /// <summary>Alignment requirement for territory access</summary>
        public AlignmentRequirement Requirement;

        /// <summary>Whether entry requires explicit faction permission</summary>
        public bool RequiresFactionPermission;

        /// <summary>Faction that controls this territory</summary>
        public FactionType ControllingFaction;

        /// <summary>Minimum reputation with controlling faction to enter freely</summary>
        public int MinReputationForEntry;

        /// <summary>Whether hostile entry triggers combat</summary>
        public bool HostileEntryTriggersCombat;
    }

    /// <summary>
    /// Story branch tracking component for Act structure.
    /// Tracks which story branches the player has unlocked/completed.
    ///
    /// Golden Record Story Structure:
    /// - Act 1: Awakening (Kurenai Academy territories)
    /// - Act 2: The Tournament (Expanding territories)
    /// - Act 3: Mirror Climax (Deep territories, alignment-based endings)
    /// </summary>
    public struct StoryBranch : IComponentData
    {
        /// <summary>Unique branch identifier</summary>
        public int BranchId;

        /// <summary>Alignment requirement to unlock this branch</summary>
        public AlignmentRequirement UnlockRequirement;

        /// <summary>Whether this is part of the main story (vs side content)</summary>
        public bool IsMainStory;

        /// <summary>Display name for this branch</summary>
        public FixedString64Bytes BranchName;

        /// <summary>Act number this branch belongs to (1-3)</summary>
        public byte ActNumber;

        /// <summary>Whether the branch has been started</summary>
        public bool IsStarted;

        /// <summary>Whether the branch has been completed</summary>
        public bool IsCompleted;

        /// <summary>Progress percentage (0-100)</summary>
        public byte Progress;
    }

    /// <summary>
    /// Buffer element for tracking unlocked story branches on the player.
    /// </summary>
    public struct UnlockedBranchElement : IBufferElementData
    {
        public int BranchId;
        public double UnlockedAtTime;
        public bool IsCompleted;
        public byte Progress;
    }

    /// <summary>
    /// Event raised when a gate is unlocked.
    /// Processed by UI systems to show notifications.
    /// </summary>
    public struct GateUnlockedEvent : IComponentData
    {
        public AlignmentRequirement Requirement;
        public FixedString64Bytes ContentName;
        public GateType Type;
    }

    /// <summary>
    /// Type of content gate for event handling.
    /// </summary>
    public enum GateType : byte
    {
        Dialogue = 0,
        Quest = 1,
        Area = 2,
        StoryBranch = 3
    }

    /// <summary>
    /// Static helper for checking alignment requirements against reputation.
    /// </summary>
    public static class AlignmentGateHelpers
    {
        /// <summary>
        /// Check if a reputation state meets an alignment requirement.
        /// </summary>
        /// <param name="reputation">Current player reputation</param>
        /// <param name="requirement">Alignment requirement to check</param>
        /// <returns>True if requirement is met</returns>
        public static bool MeetsRequirement(in Reputation reputation, AlignmentRequirement requirement)
        {
            return requirement switch
            {
                AlignmentRequirement.None => true,
                AlignmentRequirement.KurenaiStrong => reputation.Kurenai > reputation.Azure + 25,
                AlignmentRequirement.KurenaiExtreme => reputation.Kurenai > reputation.Azure + 50,
                AlignmentRequirement.AzureStrong => reputation.Azure > reputation.Kurenai + 25,
                AlignmentRequirement.AzureExtreme => reputation.Azure > reputation.Kurenai + 50,
                AlignmentRequirement.Neutral => System.Math.Abs(reputation.Kurenai - reputation.Azure) < 10,
                AlignmentRequirement.HighReputation => reputation.Kurenai > 60 && reputation.Azure > 60,
                AlignmentRequirement.LowReputation => reputation.Kurenai < 40 && reputation.Azure < 40,
                _ => false
            };
        }

        /// <summary>
        /// Get a human-readable description of an alignment requirement.
        /// </summary>
        public static FixedString128Bytes GetRequirementDescription(AlignmentRequirement requirement)
        {
            return requirement switch
            {
                AlignmentRequirement.None => new FixedString128Bytes("No requirement"),
                AlignmentRequirement.KurenaiStrong => new FixedString128Bytes("Strong Kurenai alignment"),
                AlignmentRequirement.KurenaiExtreme => new FixedString128Bytes("Extreme Kurenai alignment"),
                AlignmentRequirement.AzureStrong => new FixedString128Bytes("Strong Azure alignment"),
                AlignmentRequirement.AzureExtreme => new FixedString128Bytes("Extreme Azure alignment"),
                AlignmentRequirement.Neutral => new FixedString128Bytes("Balanced alignment"),
                AlignmentRequirement.HighReputation => new FixedString128Bytes("High reputation with both"),
                AlignmentRequirement.LowReputation => new FixedString128Bytes("Outcast from both"),
                _ => new FixedString128Bytes("Unknown requirement")
            };
        }

        /// <summary>
        /// Calculate how close the player is to meeting a requirement (0-100%).
        /// Useful for UI progress indicators.
        /// </summary>
        public static float GetRequirementProgress(in Reputation reputation, AlignmentRequirement requirement)
        {
            if (MeetsRequirement(reputation, requirement)) return 100f;

            return requirement switch
            {
                AlignmentRequirement.None => 100f,
                AlignmentRequirement.KurenaiStrong =>
                    Unity.Mathematics.math.clamp((reputation.Kurenai - reputation.Azure + 25f) / 50f * 100f, 0f, 100f),
                AlignmentRequirement.KurenaiExtreme =>
                    Unity.Mathematics.math.clamp((reputation.Kurenai - reputation.Azure + 50f) / 100f * 100f, 0f, 100f),
                AlignmentRequirement.AzureStrong =>
                    Unity.Mathematics.math.clamp((reputation.Azure - reputation.Kurenai + 25f) / 50f * 100f, 0f, 100f),
                AlignmentRequirement.AzureExtreme =>
                    Unity.Mathematics.math.clamp((reputation.Azure - reputation.Kurenai + 50f) / 100f * 100f, 0f, 100f),
                AlignmentRequirement.Neutral =>
                    Unity.Mathematics.math.clamp((10f - System.Math.Abs(reputation.Kurenai - reputation.Azure)) / 10f * 100f, 0f, 100f),
                AlignmentRequirement.HighReputation =>
                    Unity.Mathematics.math.clamp(((reputation.Kurenai + reputation.Azure) - 120f) / 80f * 100f, 0f, 100f),
                AlignmentRequirement.LowReputation =>
                    Unity.Mathematics.math.clamp((80f - (reputation.Kurenai + reputation.Azure)) / 80f * 100f, 0f, 100f),
                _ => 0f
            };
        }
    }
}
