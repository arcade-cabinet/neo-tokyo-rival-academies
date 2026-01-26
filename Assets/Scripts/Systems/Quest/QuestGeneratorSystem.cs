using Unity.Burst;
using Unity.Collections;
using Unity.Entities;
using Unity.Mathematics;
using NeoTokyo.Components.Quest;
using NeoTokyo.Components.Faction;
using NeoTokyo.Data;

namespace NeoTokyo.Systems.Quest
{
    /// <summary>
    /// Procedural quest generator using grammar tables from Golden Record.
    /// Creates faction-appropriate quests with difficulty scaling by territory.
    ///
    /// Grammar Structure:
    /// - Verb + Adjective + Noun + at Location → to Outcome
    /// - Example: "Retrieve the submerged artifact at the Docks to unlock elevator access"
    /// </summary>
    [UpdateInGroup(typeof(InitializationSystemGroup))]
    public partial struct QuestGeneratorSystem : ISystem
    {
        private Random _random;
        private bool _initialized;

        public void OnCreate(ref SystemState state)
        {
            state.RequireForUpdate<QuestSystemState>();
            state.RequireForUpdate<BeginInitializationEntityCommandBufferSystem.Singleton>();
            _initialized = false;
        }

        public void OnUpdate(ref SystemState state)
        {
            if (!_initialized)
            {
                // Initialize random with time-based seed
                _random = new Random((uint)(SystemAPI.Time.ElapsedTime * 10000 + 1));
                _initialized = true;
            }

            var ecb = SystemAPI.GetSingleton<BeginInitializationEntityCommandBufferSystem.Singleton>()
                .CreateCommandBuffer(state.WorldUnmanaged);

            // Process quest generation requests
            foreach (var (request, requestEntity) in
                SystemAPI.Query<RefRO<QuestGenerateRequest>>()
                    .WithEntityAccess())
            {
                GenerateQuest(ref state, request.ValueRO, ref ecb);
                ecb.DestroyEntity(requestEntity);
            }

            // Process batch generation requests
            foreach (var (request, requestEntity) in
                SystemAPI.Query<RefRO<QuestBatchGenerateRequest>>()
                    .WithEntityAccess())
            {
                for (int i = 0; i < request.ValueRO.Count; i++)
                {
                    var singleRequest = new QuestGenerateRequest
                    {
                        Seed = request.ValueRO.BaseSeed + (uint)i,
                        Faction = request.ValueRO.Faction,
                        TerritoryId = request.ValueRO.TerritoryId,
                        DangerLevel = request.ValueRO.DangerLevel,
                        ForceType = QuestType.Fetch, // Will be randomized
                        UseRandomType = true
                    };
                    GenerateQuest(ref state, singleRequest, ref ecb);
                }
                ecb.DestroyEntity(requestEntity);
            }
        }

        private void GenerateQuest(
            ref SystemState state,
            QuestGenerateRequest request,
            ref EntityCommandBuffer ecb)
        {
            // Seed random for reproducibility
            var rng = new Random(request.Seed != 0 ? request.Seed : _random.NextUInt());

            // Get next quest ID
            int questId = 0;
            foreach (var systemState in SystemAPI.Query<RefRW<QuestSystemState>>())
            {
                questId = systemState.ValueRW.NextQuestId++;
                systemState.ValueRW.TotalQuestsGenerated++;
            }

            // Determine quest type based on faction alignment
            QuestType questType = request.UseRandomType
                ? SelectQuestTypeForFaction(request.Faction, ref rng)
                : request.ForceType;

            // Select grammar elements
            var grammar = SelectGrammarElements(questType, request.Faction, request.DangerLevel, ref rng);

            // Calculate rewards based on danger level
            int baseXP = 50 + request.DangerLevel * 25;
            int baseRep = 5 + request.DangerLevel * 2;
            int baseCredits = 25 + request.DangerLevel * 15;

            // Faction-specific bonuses
            float factionBonus = 1.0f;
            int repPenalty = 0;
            FactionType opposingFaction = FactionType.Neutral;

            switch (request.Faction)
            {
                case FactionType.Kurenai:
                    factionBonus = 1.1f; // Kurenai quests are more combat-focused, higher rewards
                    opposingFaction = FactionType.Azure;
                    repPenalty = request.DangerLevel >= 5 ? 3 : 0;
                    break;

                case FactionType.Azure:
                    factionBonus = 1.0f;
                    opposingFaction = FactionType.Kurenai;
                    repPenalty = request.DangerLevel >= 5 ? 3 : 0;
                    break;

                case FactionType.Syndicate:
                    factionBonus = 1.2f; // Higher risk, higher reward
                    repPenalty = 5; // Always some rep cost with academies
                    break;

                case FactionType.Runners:
                    factionBonus = 0.9f; // Faster but lower rewards
                    break;
            }

            // Calculate time limit for urgent quests
            float timeLimit = 0f;
            if (rng.NextFloat() < 0.3f) // 30% chance of time limit
            {
                timeLimit = 300f + request.DangerLevel * 60f; // 5-15 minutes
            }

            // Calculate alignment shift
            float alignmentShift = 0f;
            if (request.Faction == FactionType.Kurenai)
                alignmentShift = -0.1f * request.DangerLevel / 10f;
            else if (request.Faction == FactionType.Azure)
                alignmentShift = 0.1f * request.DangerLevel / 10f;

            // Create quest entity
            var questEntity = ecb.CreateEntity();

            // Add quest component
            ecb.AddComponent(questEntity, new Components.Quest.Quest
            {
                QuestId = questId,
                Type = questType,
                Status = QuestStatus.Available,
                Priority = request.DangerLevel >= 7 ? QuestPriority.Side : QuestPriority.Daily,
                GiverFaction = request.Faction,
                RequiredReputation = math.max(0, (request.DangerLevel - 3) * 10),
                RequiredLevel = math.max(1, request.DangerLevel / 2),
                ReputationReward = (int)(baseRep * factionBonus),
                ReputationPenalty = repPenalty,
                OpposingFaction = opposingFaction,
                XPReward = (int)(baseXP * factionBonus),
                CreditReward = (int)(baseCredits * factionBonus),
                TimeLimit = timeLimit,
                TimeRemaining = timeLimit,
                AlignmentShift = alignmentShift,
                DangerLevel = request.DangerLevel,
                IsGenerated = true
            });

            // Add grammar component
            ecb.AddComponent(questEntity, grammar);

            // Generate title and description
            var display = GenerateQuestDisplay(grammar, questType);
            ecb.AddComponent(questEntity, display);

            // Add objectives buffer
            var objectives = ecb.AddBuffer<QuestObjective>(questEntity);
            GenerateObjectives(questType, grammar, request.DangerLevel, ref rng, ref objectives);

            // Create generated event for UI
            var generatedEvent = ecb.CreateEntity();
            ecb.AddComponent(generatedEvent, new QuestGeneratedEvent
            {
                QuestId = questId,
                QuestEntity = questEntity
            });
        }

        /// <summary>
        /// Select quest type based on faction alignment bias.
        /// </summary>
        private QuestType SelectQuestTypeForFaction(FactionType faction, ref Random rng)
        {
            // Faction-biased type selection from Golden Record
            float roll = rng.NextFloat();

            switch (faction)
            {
                case FactionType.Kurenai:
                    // Passion: combat-focused, rescue, reckless diving
                    if (roll < 0.30f) return QuestType.Combat;
                    if (roll < 0.45f) return QuestType.Rescue;
                    if (roll < 0.55f) return QuestType.Territory;
                    if (roll < 0.70f) return QuestType.Dive;
                    if (roll < 0.80f) return QuestType.Escort;
                    if (roll < 0.90f) return QuestType.Fetch;
                    return QuestType.Sabotage;

                case FactionType.Azure:
                    // Logic: investigation, planned navigation, defense
                    if (roll < 0.25f) return QuestType.Investigation;
                    if (roll < 0.40f) return QuestType.Navigate;
                    if (roll < 0.55f) return QuestType.Territory;
                    if (roll < 0.70f) return QuestType.Delivery;
                    if (roll < 0.80f) return QuestType.Infiltrate;
                    if (roll < 0.90f) return QuestType.Fetch;
                    return QuestType.Negotiate;

                case FactionType.Syndicate:
                    // Yakuza: sabotage, theft, intimidation
                    if (roll < 0.25f) return QuestType.Sabotage;
                    if (roll < 0.40f) return QuestType.Delivery;
                    if (roll < 0.55f) return QuestType.Combat;
                    if (roll < 0.70f) return QuestType.Infiltrate;
                    if (roll < 0.85f) return QuestType.Fetch;
                    return QuestType.Territory;

                case FactionType.Runners:
                    // Speedboat crews: navigation, racing, delivery
                    if (roll < 0.35f) return QuestType.Navigate;
                    if (roll < 0.55f) return QuestType.Delivery;
                    if (roll < 0.70f) return QuestType.Escort;
                    if (roll < 0.85f) return QuestType.Fetch;
                    return QuestType.Rescue;

                case FactionType.Collective:
                    // Merchants: trade, delivery, negotiation
                    if (roll < 0.30f) return QuestType.Delivery;
                    if (roll < 0.50f) return QuestType.Negotiate;
                    if (roll < 0.65f) return QuestType.Fetch;
                    if (roll < 0.80f) return QuestType.Investigation;
                    return QuestType.Escort;

                case FactionType.Drowned:
                    // Cult: diving, mystery, ritual
                    if (roll < 0.40f) return QuestType.Dive;
                    if (roll < 0.60f) return QuestType.Investigation;
                    if (roll < 0.75f) return QuestType.Fetch;
                    if (roll < 0.90f) return QuestType.Rescue;
                    return QuestType.Sabotage;

                default: // Neutral
                    // Balanced distribution
                    if (roll < 0.15f) return QuestType.Fetch;
                    if (roll < 0.30f) return QuestType.Combat;
                    if (roll < 0.40f) return QuestType.Delivery;
                    if (roll < 0.50f) return QuestType.Investigation;
                    if (roll < 0.60f) return QuestType.Escort;
                    if (roll < 0.70f) return QuestType.Rescue;
                    if (roll < 0.80f) return QuestType.Navigate;
                    if (roll < 0.90f) return QuestType.Territory;
                    return QuestType.Dive;
            }
        }

        /// <summary>
        /// Select grammar elements based on quest type and faction.
        /// </summary>
        private QuestGrammar SelectGrammarElements(
            QuestType questType,
            FactionType faction,
            int dangerLevel,
            ref Random rng)
        {
            var grammar = new QuestGrammar();

            // Select verb based on quest type
            grammar.Verb = SelectVerb(questType, faction, ref rng);

            // Select noun based on quest type
            grammar.Noun = SelectNoun(questType, ref rng);

            // Select adjective based on danger level and faction
            grammar.Adjective = SelectAdjective(dangerLevel, faction, ref rng);

            // Select location
            grammar.Location = SelectLocation(faction, ref rng);

            // Select outcome
            grammar.Outcome = SelectOutcome(questType, ref rng);

            return grammar;
        }

        private FixedString32Bytes SelectVerb(QuestType questType, FactionType faction, ref Random rng)
        {
            // Verbs from Golden Record grammar tables
            switch (questType)
            {
                case QuestType.Fetch:
                    return rng.NextFloat() < 0.5f
                        ? new FixedString32Bytes("Retrieve")
                        : new FixedString32Bytes("Find");

                case QuestType.Escort:
                    return new FixedString32Bytes("Escort");

                case QuestType.Combat:
                    return rng.NextFloat() < 0.5f
                        ? new FixedString32Bytes("Defeat")
                        : new FixedString32Bytes("Eliminate");

                case QuestType.Investigation:
                    var investigateRoll = rng.NextFloat();
                    if (investigateRoll < 0.33f) return new FixedString32Bytes("Investigate");
                    if (investigateRoll < 0.66f) return new FixedString32Bytes("Uncover");
                    return new FixedString32Bytes("Trace");

                case QuestType.Delivery:
                    return new FixedString32Bytes("Deliver");

                case QuestType.Sabotage:
                    return faction == FactionType.Kurenai
                        ? new FixedString32Bytes("Destroy")
                        : new FixedString32Bytes("Sabotage");

                case QuestType.Rescue:
                    return new FixedString32Bytes("Rescue");

                case QuestType.Territory:
                    return rng.NextFloat() < 0.5f
                        ? new FixedString32Bytes("Defend")
                        : new FixedString32Bytes("Secure");

                case QuestType.Dive:
                    return new FixedString32Bytes("Dive");

                case QuestType.Navigate:
                    return new FixedString32Bytes("Navigate");

                case QuestType.Infiltrate:
                    return rng.NextFloat() < 0.5f
                        ? new FixedString32Bytes("Infiltrate")
                        : new FixedString32Bytes("Hack");

                case QuestType.Negotiate:
                    return new FixedString32Bytes("Negotiate");

                default:
                    return new FixedString32Bytes("Complete");
            }
        }

        private FixedString32Bytes SelectNoun(QuestType questType, ref Random rng)
        {
            // Nouns from Golden Record grammar tables
            int roll = rng.NextInt(0, 5);

            switch (questType)
            {
                case QuestType.Fetch:
                    return roll switch
                    {
                        0 => new FixedString32Bytes("salvage crate"),
                        1 => new FixedString32Bytes("water filter"),
                        2 => new FixedString32Bytes("academy token"),
                        3 => new FixedString32Bytes("boat parts"),
                        _ => new FixedString32Bytes("historical artifact")
                    };

                case QuestType.Escort:
                case QuestType.Rescue:
                    return roll switch
                    {
                        0 => new FixedString32Bytes("student"),
                        1 => new FixedString32Bytes("merchant"),
                        2 => new FixedString32Bytes("refugee"),
                        3 => new FixedString32Bytes("informant"),
                        _ => new FixedString32Bytes("engineer")
                    };

                case QuestType.Combat:
                    return roll switch
                    {
                        0 => new FixedString32Bytes("raiders"),
                        1 => new FixedString32Bytes("pirates"),
                        2 => new FixedString32Bytes("enforcers"),
                        3 => new FixedString32Bytes("gang"),
                        _ => new FixedString32Bytes("patrol")
                    };

                case QuestType.Investigation:
                    return roll switch
                    {
                        0 => new FixedString32Bytes("conspiracy"),
                        1 => new FixedString32Bytes("disappearance"),
                        2 => new FixedString32Bytes("smuggling ring"),
                        3 => new FixedString32Bytes("sabotage"),
                        _ => new FixedString32Bytes("ancient secret")
                    };

                case QuestType.Delivery:
                    return roll switch
                    {
                        0 => new FixedString32Bytes("package"),
                        1 => new FixedString32Bytes("medical supplies"),
                        2 => new FixedString32Bytes("trade goods"),
                        3 => new FixedString32Bytes("intel"),
                        _ => new FixedString32Bytes("sealed container")
                    };

                case QuestType.Sabotage:
                    return roll switch
                    {
                        0 => new FixedString32Bytes("generator"),
                        1 => new FixedString32Bytes("communications"),
                        2 => new FixedString32Bytes("supply cache"),
                        3 => new FixedString32Bytes("bridge"),
                        _ => new FixedString32Bytes("dock")
                    };

                case QuestType.Territory:
                    return roll switch
                    {
                        0 => new FixedString32Bytes("outpost"),
                        1 => new FixedString32Bytes("checkpoint"),
                        2 => new FixedString32Bytes("shelter"),
                        3 => new FixedString32Bytes("marketplace"),
                        _ => new FixedString32Bytes("docking platform")
                    };

                case QuestType.Dive:
                    return roll switch
                    {
                        0 => new FixedString32Bytes("sunken vault"),
                        1 => new FixedString32Bytes("flooded archives"),
                        2 => new FixedString32Bytes("submerged shrine"),
                        3 => new FixedString32Bytes("underwater cache"),
                        _ => new FixedString32Bytes("drowned passage")
                    };

                case QuestType.Navigate:
                    return roll switch
                    {
                        0 => new FixedString32Bytes("canal route"),
                        1 => new FixedString32Bytes("racing course"),
                        2 => new FixedString32Bytes("patrol circuit"),
                        3 => new FixedString32Bytes("smuggler's path"),
                        _ => new FixedString32Bytes("expedition route")
                    };

                case QuestType.Infiltrate:
                    return roll switch
                    {
                        0 => new FixedString32Bytes("compound"),
                        1 => new FixedString32Bytes("headquarters"),
                        2 => new FixedString32Bytes("warehouse"),
                        3 => new FixedString32Bytes("server room"),
                        _ => new FixedString32Bytes("secure facility")
                    };

                case QuestType.Negotiate:
                    return roll switch
                    {
                        0 => new FixedString32Bytes("ceasefire"),
                        1 => new FixedString32Bytes("trade agreement"),
                        2 => new FixedString32Bytes("alliance"),
                        3 => new FixedString32Bytes("territory deal"),
                        _ => new FixedString32Bytes("resource sharing")
                    };

                default:
                    return new FixedString32Bytes("objective");
            }
        }

        private FixedString32Bytes SelectAdjective(int dangerLevel, FactionType faction, ref Random rng)
        {
            // Adjectives from Golden Record - themed by district/danger
            int roll = rng.NextInt(0, 6);

            if (dangerLevel >= 7)
            {
                // High danger adjectives
                return roll switch
                {
                    0 => new FixedString32Bytes("dangerous"),
                    1 => new FixedString32Bytes("heavily-guarded"),
                    2 => new FixedString32Bytes("treacherous"),
                    3 => new FixedString32Bytes("volatile"),
                    4 => new FixedString32Bytes("contested"),
                    _ => new FixedString32Bytes("forbidden")
                };
            }
            else if (dangerLevel >= 4)
            {
                // Medium danger adjectives
                return roll switch
                {
                    0 => new FixedString32Bytes("hidden"),
                    1 => new FixedString32Bytes("rusted"),
                    2 => new FixedString32Bytes("submerged"),
                    3 => new FixedString32Bytes("guarded"),
                    4 => new FixedString32Bytes("unstable"),
                    _ => new FixedString32Bytes("disputed")
                };
            }
            else
            {
                // Low danger adjectives
                return roll switch
                {
                    0 => new FixedString32Bytes("lost"),
                    1 => new FixedString32Bytes("abandoned"),
                    2 => new FixedString32Bytes("forgotten"),
                    3 => new FixedString32Bytes("damaged"),
                    4 => new FixedString32Bytes("stranded"),
                    _ => new FixedString32Bytes("missing")
                };
            }
        }

        private FixedString32Bytes SelectLocation(FactionType faction, ref Random rng)
        {
            // Locations from Golden Record territory list
            int roll = rng.NextInt(0, 10);

            return roll switch
            {
                0 => new FixedString32Bytes("the Docks"),
                1 => new FixedString32Bytes("the Market"),
                2 => new FixedString32Bytes("Eastern Refuge"),
                3 => new FixedString32Bytes("Western Refuge"),
                4 => new FixedString32Bytes("Runner's Canal"),
                5 => new FixedString32Bytes("Shrine Heights"),
                6 => new FixedString32Bytes("the Deep Reach"),
                7 => new FixedString32Bytes("Drowned Archives"),
                8 => new FixedString32Bytes("the Rooftops"),
                _ => new FixedString32Bytes("the Floating Plaza")
            };
        }

        private FixedString32Bytes SelectOutcome(QuestType questType, ref Random rng)
        {
            // Outcomes from Golden Record
            int roll = rng.NextInt(0, 5);

            switch (questType)
            {
                case QuestType.Territory:
                case QuestType.Infiltrate:
                    return roll switch
                    {
                        0 => new FixedString32Bytes("gain access"),
                        1 => new FixedString32Bytes("unlock passage"),
                        2 => new FixedString32Bytes("establish foothold"),
                        _ => new FixedString32Bytes("secure route")
                    };

                case QuestType.Investigation:
                    return roll switch
                    {
                        0 => new FixedString32Bytes("reveal the truth"),
                        1 => new FixedString32Bytes("expose the plot"),
                        2 => new FixedString32Bytes("uncover secrets"),
                        _ => new FixedString32Bytes("find answers")
                    };

                case QuestType.Combat:
                case QuestType.Sabotage:
                    return roll switch
                    {
                        0 => new FixedString32Bytes("weaken their hold"),
                        1 => new FixedString32Bytes("disrupt operations"),
                        2 => new FixedString32Bytes("send a message"),
                        _ => new FixedString32Bytes("restore balance")
                    };

                default:
                    return roll switch
                    {
                        0 => new FixedString32Bytes("earn their trust"),
                        1 => new FixedString32Bytes("gain reputation"),
                        2 => new FixedString32Bytes("strengthen ties"),
                        3 => new FixedString32Bytes("prove your worth"),
                        _ => new FixedString32Bytes("complete the task")
                    };
            }
        }

        /// <summary>
        /// Generate quest display text from grammar components.
        /// </summary>
        private QuestDisplay GenerateQuestDisplay(QuestGrammar grammar, QuestType questType)
        {
            // Build title: "Verb the Adjective Noun"
            var titleBuilder = new FixedString128Bytes();
            titleBuilder.Append(grammar.Verb);
            titleBuilder.Append(" the ");
            titleBuilder.Append(grammar.Adjective);
            titleBuilder.Append(' ');
            titleBuilder.Append(grammar.Noun);

            // Build description: Full sentence with location and outcome
            var descBuilder = new FixedString512Bytes();
            descBuilder.Append(grammar.Verb);
            descBuilder.Append(" the ");
            descBuilder.Append(grammar.Adjective);
            descBuilder.Append(' ');
            descBuilder.Append(grammar.Noun);
            descBuilder.Append(" at ");
            descBuilder.Append(grammar.Location);
            descBuilder.Append(" to ");
            descBuilder.Append(grammar.Outcome);
            descBuilder.Append('.');

            // Completion text
            var completionBuilder = new FixedString256Bytes();
            completionBuilder.Append("You have successfully completed the task. ");
            completionBuilder.Append(grammar.Outcome);
            completionBuilder.Append('.');

            return new QuestDisplay
            {
                Title = titleBuilder,
                Description = descBuilder,
                CompletionText = completionBuilder
            };
        }

        /// <summary>
        /// Generate objectives for quest based on type and difficulty.
        /// </summary>
        private void GenerateObjectives(
            QuestType questType,
            QuestGrammar grammar,
            int dangerLevel,
            ref Random rng,
            ref DynamicBuffer<QuestObjective> objectives)
        {
            // Primary objective based on quest type
            var primaryObjective = new QuestObjective
            {
                ObjectiveIndex = 0,
                Type = GetObjectiveTypeForQuestType(questType),
                TargetCount = CalculateTargetCount(questType, dangerLevel),
                CurrentCount = 0,
                IsOptional = false,
                IsComplete = false
            };

            // Build objective description
            var descBuilder = new FixedString128Bytes();
            descBuilder.Append(grammar.Verb);
            descBuilder.Append(' ');
            descBuilder.Append(grammar.Noun);
            primaryObjective.Description = descBuilder;

            objectives.Add(primaryObjective);

            // Add secondary objectives for higher danger quests
            if (dangerLevel >= 5 && rng.NextFloat() < 0.5f)
            {
                var secondaryObjective = new QuestObjective
                {
                    ObjectiveIndex = 1,
                    Type = ObjectiveType.Explore,
                    Description = new FixedString128Bytes("Reach the designated area"),
                    TargetCount = 1,
                    CurrentCount = 0,
                    IsOptional = false,
                    IsComplete = false
                };
                objectives.Add(secondaryObjective);
            }

            // Add optional bonus objectives for high danger quests
            if (dangerLevel >= 7 && rng.NextFloat() < 0.4f)
            {
                var bonusObjective = new QuestObjective
                {
                    ObjectiveIndex = objectives.Length,
                    Type = ObjectiveType.Collect,
                    Description = new FixedString128Bytes("Find bonus salvage"),
                    TargetCount = 3,
                    CurrentCount = 0,
                    IsOptional = true,
                    IsComplete = false
                };
                objectives.Add(bonusObjective);
            }
        }

        private ObjectiveType GetObjectiveTypeForQuestType(QuestType questType)
        {
            return questType switch
            {
                QuestType.Fetch => ObjectiveType.Collect,
                QuestType.Escort => ObjectiveType.Escort,
                QuestType.Combat => ObjectiveType.Kill,
                QuestType.Investigation => ObjectiveType.Interact,
                QuestType.Delivery => ObjectiveType.Deliver,
                QuestType.Sabotage => ObjectiveType.Sabotage,
                QuestType.Rescue => ObjectiveType.Escort,
                QuestType.Territory => ObjectiveType.Defend,
                QuestType.Dive => ObjectiveType.Dive,
                QuestType.Navigate => ObjectiveType.Navigate,
                QuestType.Infiltrate => ObjectiveType.Explore,
                QuestType.Negotiate => ObjectiveType.Talk,
                _ => ObjectiveType.Custom
            };
        }

        private int CalculateTargetCount(QuestType questType, int dangerLevel)
        {
            return questType switch
            {
                QuestType.Combat => 3 + dangerLevel,
                QuestType.Fetch or QuestType.Collect => 1 + dangerLevel / 3,
                QuestType.Escort or QuestType.Rescue => 1,
                QuestType.Delivery => 1,
                QuestType.Territory or QuestType.Defend => 1,
                QuestType.Navigate or QuestType.Dive => 1,
                _ => 1
            };
        }
    }

    /// <summary>
    /// Request to generate a single quest.
    /// </summary>
    public struct QuestGenerateRequest : IComponentData
    {
        /// <summary>Seed for reproducible generation</summary>
        public uint Seed;

        /// <summary>Faction offering the quest</summary>
        public FactionType Faction;

        /// <summary>Territory where quest originates</summary>
        public FixedString64Bytes TerritoryId;

        /// <summary>Danger level 1-10</summary>
        public int DangerLevel;

        /// <summary>Force specific quest type</summary>
        public QuestType ForceType;

        /// <summary>Use random type selection</summary>
        public bool UseRandomType;
    }

    /// <summary>
    /// Request to generate multiple quests at once.
    /// </summary>
    public struct QuestBatchGenerateRequest : IComponentData
    {
        /// <summary>Base seed for batch</summary>
        public uint BaseSeed;

        /// <summary>Faction for all quests</summary>
        public FactionType Faction;

        /// <summary>Territory for all quests</summary>
        public FixedString64Bytes TerritoryId;

        /// <summary>Danger level for all quests</summary>
        public int DangerLevel;

        /// <summary>Number of quests to generate</summary>
        public int Count;
    }

    /// <summary>
    /// Event fired when a quest is generated.
    /// </summary>
    public struct QuestGeneratedEvent : IComponentData
    {
        public int QuestId;
        public Entity QuestEntity;
    }

    /// <summary>
    /// Helper methods for quest generation.
    /// </summary>
    public static class QuestGeneratorHelpers
    {
        /// <summary>
        /// Request generation of a single quest.
        /// </summary>
        public static Entity RequestQuestGeneration(
            EntityManager em,
            FactionType faction,
            string territoryId,
            int dangerLevel,
            uint seed = 0)
        {
            var entity = em.CreateEntity();
            em.AddComponentData(entity, new QuestGenerateRequest
            {
                Seed = seed,
                Faction = faction,
                TerritoryId = string.IsNullOrEmpty(territoryId)
                    ? new FixedString64Bytes()
                    : new FixedString64Bytes(territoryId),
                DangerLevel = math.clamp(dangerLevel, 1, 10),
                UseRandomType = true
            });
            return entity;
        }

        /// <summary>
        /// Request batch generation of quests for a territory.
        /// </summary>
        public static Entity RequestBatchGeneration(
            EntityManager em,
            FactionType faction,
            string territoryId,
            int dangerLevel,
            int count,
            uint baseSeed = 0)
        {
            var entity = em.CreateEntity();
            em.AddComponentData(entity, new QuestBatchGenerateRequest
            {
                BaseSeed = baseSeed,
                Faction = faction,
                TerritoryId = string.IsNullOrEmpty(territoryId)
                    ? new FixedString64Bytes()
                    : new FixedString64Bytes(territoryId),
                DangerLevel = math.clamp(dangerLevel, 1, 10),
                Count = math.clamp(count, 1, 20)
            });
            return entity;
        }

        /// <summary>
        /// Generate a seeded random value for reproducible quest generation.
        /// </summary>
        public static uint GenerateSeed(string worldSeed, string territoryId, int questIndex)
        {
            uint hash = 2166136261;
            foreach (char c in worldSeed)
            {
                hash ^= c;
                hash *= 16777619;
            }
            foreach (char c in territoryId)
            {
                hash ^= c;
                hash *= 16777619;
            }
            hash ^= (uint)questIndex;
            hash *= 16777619;
            return hash;
        }
    }
}
