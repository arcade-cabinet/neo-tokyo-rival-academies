using Unity.Entities;
using Unity.Collections;
using NeoTokyo.Components.Faction;

namespace NeoTokyo.Components.Quest
{
    /// <summary>
    /// Quest type enumeration aligned with Golden Record grammar.
    /// Each type maps to different verb/noun combinations in procedural generation.
    /// </summary>
    public enum QuestType : byte
    {
        /// <summary>Retrieve object from location (Retrieve + Noun)</summary>
        Fetch = 0,

        /// <summary>Escort NPC to safety (Escort + Person)</summary>
        Escort = 1,

        /// <summary>Defeat enemies (Defeat + Threat)</summary>
        Combat = 2,

        /// <summary>Investigate mystery (Investigate/Uncover + Mystery)</summary>
        Investigation = 3,

        /// <summary>Deliver item to destination (Deliver + Object)</summary>
        Delivery = 4,

        /// <summary>Sabotage enemy operations (Sabotage/Destroy + Target)</summary>
        Sabotage = 5,

        /// <summary>Rescue person from danger (Find + Person + Urgent)</summary>
        Rescue = 6,

        /// <summary>Claim or defend territory (Defend/Secure + Location)</summary>
        Territory = 7,

        /// <summary>Underwater salvage missions (Dive + Submerged)</summary>
        Dive = 8,

        /// <summary>Boat chase/race missions (Navigate + Route)</summary>
        Navigate = 9,

        /// <summary>Covert infiltration (Infiltrate + Location + Covert)</summary>
        Infiltrate = 10,

        /// <summary>Faction negotiation (Negotiate + Person)</summary>
        Negotiate = 11
    }

    /// <summary>
    /// Quest status tracking lifecycle from available to completion.
    /// </summary>
    public enum QuestStatus : byte
    {
        /// <summary>Quest exists but not yet offered to player</summary>
        Hidden = 0,

        /// <summary>Quest available for acceptance</summary>
        Available = 1,

        /// <summary>Player has accepted quest</summary>
        Active = 2,

        /// <summary>All objectives complete, awaiting turn-in</summary>
        ReadyToComplete = 3,

        /// <summary>Quest successfully completed</summary>
        Completed = 4,

        /// <summary>Quest failed (objectives missed, time expired, etc.)</summary>
        Failed = 5,

        /// <summary>Quest expired before acceptance</summary>
        Expired = 6,

        /// <summary>Quest abandoned by player</summary>
        Abandoned = 7
    }

    /// <summary>
    /// Quest priority for story beat integration.
    /// </summary>
    public enum QuestPriority : byte
    {
        /// <summary>Main story progression quest</summary>
        Main = 0,

        /// <summary>Important side content with story impact</summary>
        Side = 1,

        /// <summary>Faction reputation quests</summary>
        Faction = 2,

        /// <summary>Daily repeatable quests</summary>
        Daily = 3,

        /// <summary>Time-limited event quests</summary>
        Event = 4,

        /// <summary>Secret/hidden quests</summary>
        Secret = 5
    }

    /// <summary>
    /// Main quest component containing all quest state.
    /// Attached to quest entities spawned by QuestGeneratorSystem.
    /// </summary>
    public struct Quest : IComponentData
    {
        /// <summary>Unique quest identifier (seeded from generation)</summary>
        public int QuestId;

        /// <summary>Quest type determines available actions and objectives</summary>
        public QuestType Type;

        /// <summary>Current quest status</summary>
        public QuestStatus Status;

        /// <summary>Quest priority for display and story integration</summary>
        public QuestPriority Priority;

        /// <summary>Faction that offers this quest</summary>
        public FactionType GiverFaction;

        /// <summary>Minimum reputation required to accept quest</summary>
        public int RequiredReputation;

        /// <summary>Minimum player level required</summary>
        public int RequiredLevel;

        /// <summary>Reputation reward with giver faction</summary>
        public int ReputationReward;

        /// <summary>Reputation penalty with opposing faction (if any)</summary>
        public int ReputationPenalty;

        /// <summary>Opposing faction affected by penalty</summary>
        public FactionType OpposingFaction;

        /// <summary>Experience points reward</summary>
        public int XPReward;

        /// <summary>Credit reward (currency)</summary>
        public int CreditReward;

        /// <summary>Time limit in seconds (0 = no limit)</summary>
        public float TimeLimit;

        /// <summary>Remaining time (counts down when active)</summary>
        public float TimeRemaining;

        /// <summary>Alignment shift on completion (-1.0 Kurenai to +1.0 Azure)</summary>
        public float AlignmentShift;

        /// <summary>Danger level (1-10) for difficulty scaling</summary>
        public int DangerLevel;

        /// <summary>Quest was procedurally generated (vs hand-crafted)</summary>
        public bool IsGenerated;

        /// <summary>
        /// Check if quest has time limit.
        /// </summary>
        public bool HasTimeLimit => TimeLimit > 0f;

        /// <summary>
        /// Check if quest time has expired.
        /// </summary>
        public bool IsExpired => HasTimeLimit && TimeRemaining <= 0f;

        /// <summary>
        /// Create a default quest with neutral settings.
        /// </summary>
        public static Quest Default => new Quest
        {
            QuestId = 0,
            Type = QuestType.Fetch,
            Status = QuestStatus.Hidden,
            Priority = QuestPriority.Side,
            GiverFaction = FactionType.Neutral,
            RequiredReputation = 0,
            RequiredLevel = 1,
            ReputationReward = 10,
            ReputationPenalty = 0,
            OpposingFaction = FactionType.Neutral,
            XPReward = 100,
            CreditReward = 50,
            TimeLimit = 0f,
            TimeRemaining = 0f,
            AlignmentShift = 0f,
            DangerLevel = 1,
            IsGenerated = true
        };
    }

    /// <summary>
    /// Quest display information for UI.
    /// Separated for memory efficiency (only loaded when displaying).
    /// </summary>
    public struct QuestDisplay : IComponentData
    {
        /// <summary>Quest title (generated from grammar)</summary>
        public FixedString128Bytes Title;

        /// <summary>Quest description (generated from grammar)</summary>
        public FixedString512Bytes Description;

        /// <summary>Completion summary shown on turn-in</summary>
        public FixedString256Bytes CompletionText;
    }

    /// <summary>
    /// Individual quest objective stored in buffer.
    /// Multiple objectives per quest supported.
    /// </summary>
    public struct QuestObjective : IBufferElementData
    {
        /// <summary>Index of this objective in the quest</summary>
        public int ObjectiveIndex;

        /// <summary>Objective type for tracking logic</summary>
        public ObjectiveType Type;

        /// <summary>Objective description for UI</summary>
        public FixedString128Bytes Description;

        /// <summary>Target entity ID (for kill/escort objectives)</summary>
        public int TargetEntityId;

        /// <summary>Target item ID (for collect/deliver objectives)</summary>
        public int TargetItemId;

        /// <summary>Number of targets required</summary>
        public int TargetCount;

        /// <summary>Current progress toward target count</summary>
        public int CurrentCount;

        /// <summary>Territory ID for location-based objectives</summary>
        public FixedString64Bytes TargetTerritory;

        /// <summary>Target world position (for exploration objectives)</summary>
        public float TargetX;
        public float TargetY;
        public float TargetZ;

        /// <summary>Radius for proximity-based completion</summary>
        public float TargetRadius;

        /// <summary>Optional objective (not required for completion)</summary>
        public bool IsOptional;

        /// <summary>Objective has been completed</summary>
        public bool IsComplete;

        /// <summary>Check if objective is satisfied (count met or marked complete)</summary>
        public bool IsSatisfied => IsComplete || CurrentCount >= TargetCount;
    }

    /// <summary>
    /// Objective type enumeration matching Golden Record verbs.
    /// </summary>
    public enum ObjectiveType : byte
    {
        /// <summary>Defeat specific enemies or count</summary>
        Kill = 0,

        /// <summary>Collect items from world or enemies</summary>
        Collect = 1,

        /// <summary>Deliver item to NPC or location</summary>
        Deliver = 2,

        /// <summary>Talk to specific NPC</summary>
        Talk = 3,

        /// <summary>Reach specific location</summary>
        Explore = 4,

        /// <summary>Escort NPC to destination</summary>
        Escort = 5,

        /// <summary>Defend location for duration</summary>
        Defend = 6,

        /// <summary>Survive for duration</summary>
        Survive = 7,

        /// <summary>Interact with world object</summary>
        Interact = 8,

        /// <summary>Complete underwater retrieval</summary>
        Dive = 9,

        /// <summary>Complete boat navigation</summary>
        Navigate = 10,

        /// <summary>Sabotage target object</summary>
        Sabotage = 11,

        /// <summary>Custom scripted objective</summary>
        Custom = 255
    }

    /// <summary>
    /// Quest giver component attached to NPC entities.
    /// Links NPC to available quests.
    /// </summary>
    public struct QuestGiver : IComponentData
    {
        /// <summary>Entity reference to the giver NPC</summary>
        public Entity GiverEntity;

        /// <summary>Territory where giver is located</summary>
        public FixedString64Bytes TerritoryId;

        /// <summary>Faction this giver represents</summary>
        public FactionType Faction;

        /// <summary>Maximum concurrent quests this giver can offer</summary>
        public int MaxActiveQuests;

        /// <summary>Current number of active quests from this giver</summary>
        public int CurrentActiveQuests;

        /// <summary>Cooldown before new quest generation (in seconds)</summary>
        public float QuestCooldown;

        /// <summary>Time remaining until new quest available</summary>
        public float CooldownRemaining;
    }

    /// <summary>
    /// Buffer of quest IDs available from a quest giver.
    /// </summary>
    public struct QuestGiverQuest : IBufferElementData
    {
        /// <summary>Quest entity reference</summary>
        public Entity QuestEntity;

        /// <summary>Quest ID for quick lookup</summary>
        public int QuestId;
    }

    /// <summary>
    /// Tag component for active quests on player.
    /// Multiple active quests supported via buffer.
    /// </summary>
    public struct ActiveQuest : IBufferElementData
    {
        /// <summary>Reference to quest entity</summary>
        public Entity QuestEntity;

        /// <summary>Quest ID for quick lookup</summary>
        public int QuestId;

        /// <summary>Timestamp when quest was accepted</summary>
        public float AcceptedTime;
    }

    /// <summary>
    /// Completed quest tracking for history/statistics.
    /// </summary>
    public struct CompletedQuest : IBufferElementData
    {
        /// <summary>Quest ID that was completed</summary>
        public int QuestId;

        /// <summary>Completion status (success/fail)</summary>
        public QuestStatus FinalStatus;

        /// <summary>Time when completed</summary>
        public float CompletedTime;

        /// <summary>Reputation earned</summary>
        public int ReputationEarned;

        /// <summary>XP earned</summary>
        public int XPEarned;
    }

    /// <summary>
    /// Grammar element for procedural quest generation.
    /// Stores the components used to construct quest title/description.
    /// </summary>
    public struct QuestGrammar : IComponentData
    {
        /// <summary>Action verb: "Find", "Defeat", "Escort", "Deliver", etc.</summary>
        public FixedString32Bytes Verb;

        /// <summary>Target noun: "artifact", "student", "package", "intel", etc.</summary>
        public FixedString32Bytes Noun;

        /// <summary>Modifier adjective: "stolen", "missing", "dangerous", "submerged"</summary>
        public FixedString32Bytes Adjective;

        /// <summary>Location landmark: "Docks", "Market", "Archives", etc.</summary>
        public FixedString32Bytes Location;

        /// <summary>Outcome verb: "unlock", "reveal", "obtain", "expose"</summary>
        public FixedString32Bytes Outcome;
    }

    /// <summary>
    /// Quest prerequisites for story beat integration.
    /// </summary>
    public struct QuestPrerequisite : IBufferElementData
    {
        /// <summary>Required quest ID that must be completed</summary>
        public int RequiredQuestId;

        /// <summary>Required status of prerequisite quest</summary>
        public QuestStatus RequiredStatus;
    }

    /// <summary>
    /// Quest event for objective progress tracking.
    /// Created by game systems, consumed by QuestSystem.
    /// </summary>
    public struct QuestEvent : IComponentData
    {
        /// <summary>Type of event that occurred</summary>
        public QuestEventType EventType;

        /// <summary>Entity involved in event</summary>
        public Entity SourceEntity;

        /// <summary>Target entity (if applicable)</summary>
        public Entity TargetEntity;

        /// <summary>Item ID (for collect/deliver events)</summary>
        public int ItemId;

        /// <summary>Count/amount (for numeric events)</summary>
        public int Count;

        /// <summary>Territory where event occurred</summary>
        public FixedString64Bytes TerritoryId;

        /// <summary>World position of event</summary>
        public float PositionX;
        public float PositionY;
        public float PositionZ;
    }

    /// <summary>
    /// Event types that can trigger quest objective progress.
    /// </summary>
    public enum QuestEventType : byte
    {
        /// <summary>Enemy was defeated</summary>
        EnemyKilled = 0,

        /// <summary>Item was collected</summary>
        ItemCollected = 1,

        /// <summary>Item was delivered</summary>
        ItemDelivered = 2,

        /// <summary>NPC dialogue completed</summary>
        NPCTalked = 3,

        /// <summary>Location reached</summary>
        LocationReached = 4,

        /// <summary>NPC reached destination</summary>
        EscortCompleted = 5,

        /// <summary>Defense time elapsed</summary>
        DefenseCompleted = 6,

        /// <summary>Object interacted with</summary>
        ObjectInteracted = 7,

        /// <summary>Underwater retrieval complete</summary>
        DiveCompleted = 8,

        /// <summary>Navigation route complete</summary>
        NavigationCompleted = 9,

        /// <summary>Object sabotaged</summary>
        SabotageCompleted = 10,

        /// <summary>Time elapsed (for survival)</summary>
        TimeElapsed = 11,

        /// <summary>Territory entered</summary>
        TerritoryEntered = 12,

        /// <summary>Territory exited</summary>
        TerritoryExited = 13
    }

    /// <summary>
    /// Singleton component for quest system state.
    /// </summary>
    public struct QuestSystemState : IComponentData
    {
        /// <summary>Total quests generated this session</summary>
        public int TotalQuestsGenerated;

        /// <summary>Total quests completed</summary>
        public int TotalQuestsCompleted;

        /// <summary>Total quests failed</summary>
        public int TotalQuestsFailed;

        /// <summary>Current active quest count</summary>
        public int ActiveQuestCount;

        /// <summary>Maximum concurrent active quests</summary>
        public int MaxActiveQuests;

        /// <summary>Global quest difficulty modifier (1.0 = normal)</summary>
        public float DifficultyModifier;

        /// <summary>Next quest ID to assign</summary>
        public int NextQuestId;

        public static QuestSystemState Default => new QuestSystemState
        {
            TotalQuestsGenerated = 0,
            TotalQuestsCompleted = 0,
            TotalQuestsFailed = 0,
            ActiveQuestCount = 0,
            MaxActiveQuests = 5,
            DifficultyModifier = 1.0f,
            NextQuestId = 1
        };
    }
}
