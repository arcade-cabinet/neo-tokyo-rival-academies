using System;
using System.Collections.Generic;
using Unity.Collections;
using NeoTokyo.Components.Quest;
using NeoTokyo.Components.Faction;

namespace NeoTokyo.Data
{
    /// <summary>
    /// Static quest templates and grammar tables for procedural quest generation.
    /// Based on Golden Record v2.0 Quest Grammar specification.
    ///
    /// Grammar Structure:
    /// Verb + Adjective + Noun + at Location -> to Outcome
    /// </summary>
    public static class QuestTemplates
    {
        #region Grammar Tables - Verbs

        /// <summary>
        /// Corporate/Azure-aligned verbs (logic, strategy).
        /// </summary>
        public static readonly string[] CorporateVerbs =
        {
            "Deliver",
            "Negotiate",
            "Secure",
            "Escort",
            "Report",
            "Analyze",
            "Defend",
            "Coordinate"
        };

        /// <summary>
        /// Rebel/Kurenai-aligned verbs (passion, action).
        /// </summary>
        public static readonly string[] RebelVerbs =
        {
            "Sabotage",
            "Steal",
            "Destroy",
            "Hack",
            "Expose",
            "Raid",
            "Liberate",
            "Challenge"
        };

        /// <summary>
        /// Mystery/Investigation verbs (neutral exploration).
        /// </summary>
        public static readonly string[] MysteryVerbs =
        {
            "Investigate",
            "Uncover",
            "Eavesdrop",
            "Trace",
            "Decipher",
            "Discover",
            "Document",
            "Follow"
        };

        /// <summary>
        /// Universal verbs (no alignment bias).
        /// </summary>
        public static readonly string[] UniversalVerbs =
        {
            "Retrieve",
            "Find",
            "Defeat",
            "Explore",
            "Activate",
            "Rescue",
            "Collect",
            "Navigate"
        };

        /// <summary>
        /// Flooded world specific verbs.
        /// </summary>
        public static readonly string[] FloodedVerbs =
        {
            "Dive",
            "Salvage",
            "Navigate",
            "Ferry",
            "Anchor",
            "Surface"
        };

        #endregion

        #region Grammar Tables - Nouns

        /// <summary>
        /// Tech/Corporate nouns (valuable tech items).
        /// </summary>
        public static readonly string[] TechNouns =
        {
            "datavault",
            "passcode",
            "synth-sapphire",
            "drone-core",
            "holo-projector",
            "comm relay",
            "nav beacon",
            "power cell"
        };

        /// <summary>
        /// People/Contact nouns (NPCs to interact with).
        /// </summary>
        public static readonly string[] PeopleNouns =
        {
            "info-broker",
            "fixer",
            "vendor",
            "runner",
            "hacker",
            "student",
            "merchant",
            "refugee"
        };

        /// <summary>
        /// Location/Item nouns (places and objects).
        /// </summary>
        public static readonly string[] LocationNouns =
        {
            "salvage cache",
            "rooftop antenna",
            "bridge junction",
            "docking platform",
            "water filter",
            "supply depot",
            "signal tower",
            "boat parts"
        };

        /// <summary>
        /// Mystery nouns (investigation targets).
        /// </summary>
        public static readonly string[] MysteryNouns =
        {
            "encrypted file",
            "cursed implant",
            "ancient relic",
            "glowing artifact",
            "sealed records",
            "hidden truth",
            "lost technology",
            "forbidden knowledge"
        };

        /// <summary>
        /// Threat nouns (combat targets).
        /// </summary>
        public static readonly string[] ThreatNouns =
        {
            "patrol drone",
            "security bot",
            "lurking shadow",
            "corporate enforcer",
            "pirate crew",
            "rival gang",
            "rogue agent",
            "cult fanatics"
        };

        /// <summary>
        /// Flooded world specific nouns.
        /// </summary>
        public static readonly string[] FloodedNouns =
        {
            "sunken vault",
            "flooded archives",
            "submerged shrine",
            "waterlogged crate",
            "drowned passage",
            "underwater cache",
            "sealed chamber",
            "flooded laboratory"
        };

        #endregion

        #region Grammar Tables - Adjectives

        /// <summary>
        /// Neon/Entertainment district adjectives.
        /// Note: Per Golden Record, neon is deprecated for flooded world.
        /// </summary>
        public static readonly string[] NeonAdjectives =
        {
            "glowing",
            "overbright",
            "flickering",
            "holo-lit",
            "jittery",
            "pulsing"
        };

        /// <summary>
        /// Corporate/Upper district adjectives.
        /// </summary>
        public static readonly string[] CorporateAdjectives =
        {
            "encrypted",
            "secure",
            "elite",
            "pristine",
            "guarded",
            "classified",
            "restricted",
            "high-priority"
        };

        /// <summary>
        /// Slum/Lower district adjectives (flooded world adapted).
        /// </summary>
        public static readonly string[] SlumAdjectives =
        {
            "cursed",
            "rusted",
            "hidden",
            "overgrown",
            "damp",
            "abandoned",
            "forgotten",
            "deteriorating"
        };

        /// <summary>
        /// Industrial district adjectives.
        /// </summary>
        public static readonly string[] IndustrialAdjectives =
        {
            "industrial",
            "heavy",
            "leaking",
            "sparking",
            "massive",
            "corroded",
            "unstable",
            "volatile"
        };

        /// <summary>
        /// Universal adjectives.
        /// </summary>
        public static readonly string[] UniversalAdjectives =
        {
            "ancient",
            "mysterious",
            "valuable",
            "dangerous",
            "forgotten",
            "legendary",
            "contested",
            "urgent"
        };

        /// <summary>
        /// Flooded world specific adjectives.
        /// </summary>
        public static readonly string[] FloodedAdjectives =
        {
            "submerged",
            "waterlogged",
            "flooded",
            "drifting",
            "half-sunk",
            "storm-battered",
            "tide-worn",
            "salt-crusted"
        };

        #endregion

        #region Grammar Tables - Landmarks

        /// <summary>
        /// Fixed landmarks from the 10 canonical territories.
        /// </summary>
        public static readonly string[] CanonicalLandmarks =
        {
            "Kurenai Academy",
            "Azure Academy",
            "The Collective Market",
            "Eastern Refuge",
            "Western Refuge",
            "Syndicate Docks",
            "Runner's Canal",
            "Shrine Heights",
            "The Deep Reach",
            "Drowned Archives"
        };

        /// <summary>
        /// Dynamic/procedural landmarks.
        /// </summary>
        public static readonly string[] DynamicLandmarks =
        {
            "the floating plaza",
            "the rooftop gardens",
            "the boat graveyard",
            "the signal tower",
            "the old bridge",
            "the sunken market",
            "the tidal flats",
            "the anchor point",
            "the canal junction",
            "the makeshift dock"
        };

        #endregion

        #region Grammar Tables - Outcomes

        /// <summary>
        /// Progression outcomes (unlock new content).
        /// </summary>
        public static readonly string[] ProgressionOutcomes =
        {
            "unlock the upper elevator",
            "gain rooftop access",
            "reveal the resistance base",
            "open new trade routes",
            "establish a foothold",
            "secure passage rights"
        };

        /// <summary>
        /// Reward outcomes (items, currency, stats).
        /// </summary>
        public static readonly string[] RewardOutcomes =
        {
            "obtain credits",
            "acquire new gear",
            "earn faction favor",
            "gain valuable intel",
            "receive rare materials",
            "unlock equipment upgrades"
        };

        /// <summary>
        /// Narrative outcomes (story progression).
        /// </summary>
        public static readonly string[] NarrativeOutcomes =
        {
            "learn a corporate secret",
            "expose a betrayal",
            "uncover a hidden truth",
            "reveal the conspiracy",
            "discover your past",
            "understand the flooding"
        };

        /// <summary>
        /// Risk/Failure outcomes (consequences).
        /// </summary>
        public static readonly string[] RiskOutcomes =
        {
            "trigger alarm",
            "attract enforcers",
            "lose reputation",
            "alert the syndicate",
            "compromise the mission",
            "expose an ally"
        };

        #endregion

        #region Faction Quest Templates

        /// <summary>
        /// Get quest type weights for a specific faction.
        /// Returns array of weights for each QuestType value.
        /// </summary>
        public static float[] GetFactionQuestWeights(FactionType faction)
        {
            // Weights for: Fetch, Escort, Combat, Investigation, Delivery, Sabotage, Rescue, Territory, Dive, Navigate, Infiltrate, Negotiate
            return faction switch
            {
                FactionType.Kurenai => new float[]
                {
                    0.10f, // Fetch
                    0.10f, // Escort
                    0.25f, // Combat - high
                    0.05f, // Investigation
                    0.05f, // Delivery
                    0.10f, // Sabotage
                    0.15f, // Rescue - high
                    0.10f, // Territory
                    0.05f, // Dive
                    0.03f, // Navigate
                    0.02f, // Infiltrate
                    0.00f  // Negotiate
                },
                FactionType.Azure => new float[]
                {
                    0.10f, // Fetch
                    0.05f, // Escort
                    0.05f, // Combat
                    0.20f, // Investigation - high
                    0.15f, // Delivery
                    0.05f, // Sabotage
                    0.05f, // Rescue
                    0.10f, // Territory
                    0.05f, // Dive
                    0.10f, // Navigate
                    0.05f, // Infiltrate
                    0.05f  // Negotiate
                },
                FactionType.Syndicate => new float[]
                {
                    0.10f, // Fetch
                    0.05f, // Escort
                    0.15f, // Combat
                    0.10f, // Investigation
                    0.15f, // Delivery
                    0.20f, // Sabotage - high
                    0.00f, // Rescue
                    0.10f, // Territory
                    0.00f, // Dive
                    0.05f, // Navigate
                    0.10f, // Infiltrate - high
                    0.00f  // Negotiate
                },
                FactionType.Runners => new float[]
                {
                    0.05f, // Fetch
                    0.15f, // Escort
                    0.05f, // Combat
                    0.00f, // Investigation
                    0.25f, // Delivery - high
                    0.00f, // Sabotage
                    0.10f, // Rescue
                    0.00f, // Territory
                    0.00f, // Dive
                    0.35f, // Navigate - high
                    0.00f, // Infiltrate
                    0.05f  // Negotiate
                },
                FactionType.Collective => new float[]
                {
                    0.15f, // Fetch
                    0.10f, // Escort
                    0.00f, // Combat
                    0.10f, // Investigation
                    0.25f, // Delivery - high
                    0.00f, // Sabotage
                    0.05f, // Rescue
                    0.05f, // Territory
                    0.00f, // Dive
                    0.05f, // Navigate
                    0.00f, // Infiltrate
                    0.25f  // Negotiate - high
                },
                FactionType.Drowned => new float[]
                {
                    0.10f, // Fetch
                    0.05f, // Escort
                    0.05f, // Combat
                    0.20f, // Investigation
                    0.00f, // Delivery
                    0.05f, // Sabotage
                    0.10f, // Rescue
                    0.00f, // Territory
                    0.35f, // Dive - high
                    0.00f, // Navigate
                    0.05f, // Infiltrate
                    0.05f  // Negotiate
                },
                _ => new float[] // Neutral
                {
                    0.12f, 0.10f, 0.10f, 0.10f, 0.10f, 0.08f, 0.10f, 0.08f, 0.08f, 0.06f, 0.04f, 0.04f
                }
            };
        }

        #endregion

        #region Story Beat Templates

        /// <summary>
        /// Hand-crafted story beat quests for main storyline.
        /// These use fixed grammar rather than procedural generation.
        /// </summary>
        public static readonly StoryBeatQuest[] MainStoryBeats = new StoryBeatQuest[]
        {
            // Act 1: Awakening
            new StoryBeatQuest
            {
                Id = "main_001",
                Act = 1,
                Title = "The Morning Patrol",
                Description = "Complete your first patrol of the academy bridges and deal with any trouble.",
                Type = QuestType.Territory,
                GiverFaction = FactionType.Kurenai,
                Prerequisites = Array.Empty<string>(),
                Objectives = new StoryObjective[]
                {
                    new StoryObjective { Type = ObjectiveType.Explore, Description = "Patrol the eastern bridges", Count = 3 },
                    new StoryObjective { Type = ObjectiveType.Kill, Description = "Handle the canal pirates", Count = 5 }
                },
                ReputationReward = 15,
                XPReward = 200,
                AlignmentShift = -0.1f,
                UnlocksQuests = new[] { "main_002" }
            },
            new StoryBeatQuest
            {
                Id = "main_002",
                Act = 1,
                Title = "Rival Waters",
                Description = "Represent Kurenai in the inter-academy boat race and face your first encounter with Vera.",
                Type = QuestType.Navigate,
                GiverFaction = FactionType.Kurenai,
                Prerequisites = new[] { "main_001" },
                Objectives = new StoryObjective[]
                {
                    new StoryObjective { Type = ObjectiveType.Navigate, Description = "Complete the racing course", Count = 1 },
                    new StoryObjective { Type = ObjectiveType.Talk, Description = "Confront Vera at the finish line", Count = 1 }
                },
                ReputationReward = 20,
                XPReward = 300,
                AlignmentShift = 0f, // Player choice affects this
                UnlocksQuests = new[] { "main_003" }
            },
            new StoryBeatQuest
            {
                Id = "main_003",
                Act = 1,
                Title = "The Pirate Captain",
                Description = "Hunt down the canal pirate captain who has been terrorizing the eastern territories.",
                Type = QuestType.Combat,
                GiverFaction = FactionType.Kurenai,
                Prerequisites = new[] { "main_002" },
                Objectives = new StoryObjective[]
                {
                    new StoryObjective { Type = ObjectiveType.Explore, Description = "Track the pirate hideout", Count = 1 },
                    new StoryObjective { Type = ObjectiveType.Kill, Description = "Defeat Captain Blackwater", Count = 1 }
                },
                ReputationReward = 25,
                XPReward = 500,
                AlignmentShift = -0.15f,
                UnlocksQuests = new[] { "main_004" },
                IsBossFight = true
            },
            new StoryBeatQuest
            {
                Id = "main_004",
                Act = 1,
                Title = "Drowned Secrets",
                Description = "Dive into the flooded archives to discover what the pirates were really after.",
                Type = QuestType.Dive,
                GiverFaction = FactionType.Neutral,
                Prerequisites = new[] { "main_003" },
                Objectives = new StoryObjective[]
                {
                    new StoryObjective { Type = ObjectiveType.Dive, Description = "Enter the flooded archives", Count = 1 },
                    new StoryObjective { Type = ObjectiveType.Collect, Description = "Recover the sealed data core", Count = 1 },
                    new StoryObjective { Type = ObjectiveType.Survive, Description = "Escape before the tide rises", Count = 1 }
                },
                ReputationReward = 20,
                XPReward = 400,
                AlignmentShift = 0f,
                UnlocksQuests = new[] { "main_101" }, // Act 2 start
                IsActEnder = true
            },

            // Act 2: The Tournament
            new StoryBeatQuest
            {
                Id = "main_101",
                Act = 2,
                Title = "Council Summons",
                Description = "The Council of Seven has announced a tournament. Report to Shrine Heights.",
                Type = QuestType.Negotiate,
                GiverFaction = FactionType.Council,
                Prerequisites = new[] { "main_004" },
                Objectives = new StoryObjective[]
                {
                    new StoryObjective { Type = ObjectiveType.Explore, Description = "Travel to Shrine Heights", Count = 1 },
                    new StoryObjective { Type = ObjectiveType.Talk, Description = "Speak with the Council representative", Count = 1 }
                },
                ReputationReward = 10,
                XPReward = 250,
                AlignmentShift = 0f,
                UnlocksQuests = new[] { "main_102", "main_102b" } // Branch point
            },

            // Act 3: Mirror Climax
            new StoryBeatQuest
            {
                Id = "main_201",
                Act = 3,
                Title = "The Truth Below",
                Description = "Dive deep into the flooded city core to discover why Neo-Tokyo really flooded.",
                Type = QuestType.Dive,
                GiverFaction = FactionType.Neutral,
                Prerequisites = new[] { "main_199" }, // End of Act 2
                Objectives = new StoryObjective[]
                {
                    new StoryObjective { Type = ObjectiveType.Dive, Description = "Reach the city core", Count = 1 },
                    new StoryObjective { Type = ObjectiveType.Interact, Description = "Access the sealed records", Count = 1 },
                    new StoryObjective { Type = ObjectiveType.Survive, Description = "Survive the guardians", Count = 1 }
                },
                ReputationReward = 30,
                XPReward = 800,
                AlignmentShift = 0f,
                UnlocksQuests = new[] { "main_202" }
            },
            new StoryBeatQuest
            {
                Id = "main_final",
                Act = 3,
                Title = "The Architect",
                Description = "Confront the one responsible for the flooding and decide the fate of Neo-Tokyo.",
                Type = QuestType.Combat,
                GiverFaction = FactionType.Neutral,
                Prerequisites = new[] { "main_299" },
                Objectives = new StoryObjective[]
                {
                    new StoryObjective { Type = ObjectiveType.Kill, Description = "Defeat the Architect", Count = 1 },
                    new StoryObjective { Type = ObjectiveType.Talk, Description = "Make your final choice", Count = 1 }
                },
                ReputationReward = 50,
                XPReward = 2000,
                AlignmentShift = 0f, // Determined by final choice
                UnlocksQuests = Array.Empty<string>(),
                IsBossFight = true,
                IsActEnder = true
            }
        };

        /// <summary>
        /// Faction-specific story quests that unlock based on reputation.
        /// </summary>
        public static readonly StoryBeatQuest[] FactionStoryBeats = new StoryBeatQuest[]
        {
            // Kurenai Faction Line
            new StoryBeatQuest
            {
                Id = "kurenai_001",
                Act = 1,
                Title = "Burning Passion",
                Description = "Prove your dedication to Kurenai by competing in the combat trials.",
                Type = QuestType.Combat,
                GiverFaction = FactionType.Kurenai,
                Prerequisites = Array.Empty<string>(),
                RequiredReputation = 60,
                Objectives = new StoryObjective[]
                {
                    new StoryObjective { Type = ObjectiveType.Kill, Description = "Win three arena matches", Count = 3 }
                },
                ReputationReward = 15,
                XPReward = 350,
                AlignmentShift = -0.2f
            },

            // Azure Faction Line
            new StoryBeatQuest
            {
                Id = "azure_001",
                Act = 1,
                Title = "Calculated Risk",
                Description = "Azure needs someone to retrieve sensitive data from a compromised facility.",
                Type = QuestType.Infiltrate,
                GiverFaction = FactionType.Azure,
                Prerequisites = Array.Empty<string>(),
                RequiredReputation = 60,
                Objectives = new StoryObjective[]
                {
                    new StoryObjective { Type = ObjectiveType.Explore, Description = "Infiltrate the data center", Count = 1 },
                    new StoryObjective { Type = ObjectiveType.Interact, Description = "Download the encrypted files", Count = 1 },
                    new StoryObjective { Type = ObjectiveType.Explore, Description = "Extract without detection", Count = 1 }
                },
                ReputationReward = 15,
                XPReward = 350,
                AlignmentShift = 0.2f
            },

            // Syndicate Faction Line
            new StoryBeatQuest
            {
                Id = "syndicate_001",
                Act = 2,
                Title = "Favor Owed",
                Description = "The Syndicate has a job that requires discretion. Boss Tanaka is watching.",
                Type = QuestType.Sabotage,
                GiverFaction = FactionType.Syndicate,
                Prerequisites = Array.Empty<string>(),
                RequiredReputation = 50,
                Objectives = new StoryObjective[]
                {
                    new StoryObjective { Type = ObjectiveType.Sabotage, Description = "Destroy the rival's supply cache", Count = 1 },
                    new StoryObjective { Type = ObjectiveType.Explore, Description = "Leave no witnesses", Count = 1, IsOptional = true }
                },
                ReputationReward = 20,
                XPReward = 400,
                AlignmentShift = 0f // Neutral - criminal but not aligned
            },

            // Drowned Faction Line
            new StoryBeatQuest
            {
                Id = "drowned_001",
                Act = 2,
                Title = "The Deep Calling",
                Description = "The Drowned cult senses something ancient stirring beneath the waters.",
                Type = QuestType.Dive,
                GiverFaction = FactionType.Drowned,
                Prerequisites = Array.Empty<string>(),
                RequiredReputation = 45,
                Objectives = new StoryObjective[]
                {
                    new StoryObjective { Type = ObjectiveType.Dive, Description = "Descend to the third depth", Count = 1 },
                    new StoryObjective { Type = ObjectiveType.Interact, Description = "Touch the sleeping relic", Count = 1 }
                },
                ReputationReward = 15,
                XPReward = 500,
                AlignmentShift = 0f,
                IsSecret = true
            }
        };

        #endregion

        #region Template Structures

        /// <summary>
        /// Story beat quest definition for hand-crafted content.
        /// </summary>
        [Serializable]
        public struct StoryBeatQuest
        {
            public string Id;
            public int Act;
            public string Title;
            public string Description;
            public QuestType Type;
            public FactionType GiverFaction;
            public string[] Prerequisites;
            public int RequiredReputation;
            public StoryObjective[] Objectives;
            public int ReputationReward;
            public int XPReward;
            public float AlignmentShift;
            public string[] UnlocksQuests;
            public bool IsBossFight;
            public bool IsActEnder;
            public bool IsSecret;
        }

        /// <summary>
        /// Story objective definition.
        /// </summary>
        [Serializable]
        public struct StoryObjective
        {
            public ObjectiveType Type;
            public string Description;
            public int Count;
            public bool IsOptional;
        }

        #endregion

        #region Utility Methods

        /// <summary>
        /// Get a random verb for the given alignment bias.
        /// </summary>
        /// <param name="alignment">-1.0 (Kurenai) to +1.0 (Azure)</param>
        /// <param name="rng">Random number generator</param>
        public static string GetBiasedVerb(float alignment, System.Random rng)
        {
            // Determine which verb list to use based on alignment
            string[] verbs;
            float roll = (float)rng.NextDouble();

            if (alignment < -0.3f)
            {
                // Kurenai-leaning: favor rebel verbs
                if (roll < 0.4f) verbs = RebelVerbs;
                else if (roll < 0.7f) verbs = UniversalVerbs;
                else verbs = FloodedVerbs;
            }
            else if (alignment > 0.3f)
            {
                // Azure-leaning: favor corporate verbs
                if (roll < 0.4f) verbs = CorporateVerbs;
                else if (roll < 0.7f) verbs = UniversalVerbs;
                else verbs = MysteryVerbs;
            }
            else
            {
                // Neutral: balanced distribution
                if (roll < 0.25f) verbs = MysteryVerbs;
                else if (roll < 0.5f) verbs = UniversalVerbs;
                else if (roll < 0.75f) verbs = FloodedVerbs;
                else verbs = roll < 0.875f ? CorporateVerbs : RebelVerbs;
            }

            return verbs[rng.Next(verbs.Length)];
        }

        /// <summary>
        /// Get a random noun for the given quest type.
        /// </summary>
        public static string GetNounForQuestType(QuestType type, System.Random rng)
        {
            string[] nouns = type switch
            {
                QuestType.Combat => ThreatNouns,
                QuestType.Investigation => MysteryNouns,
                QuestType.Dive => FloodedNouns,
                QuestType.Escort or QuestType.Rescue or QuestType.Negotiate => PeopleNouns,
                QuestType.Sabotage or QuestType.Territory => LocationNouns,
                _ => TechNouns
            };

            return nouns[rng.Next(nouns.Length)];
        }

        /// <summary>
        /// Get a random adjective based on danger level.
        /// </summary>
        public static string GetAdjectiveForDanger(int dangerLevel, System.Random rng)
        {
            string[] adjectives;

            if (dangerLevel >= 7)
            {
                adjectives = IndustrialAdjectives;
            }
            else if (dangerLevel >= 4)
            {
                var roll = rng.NextDouble();
                adjectives = roll < 0.5 ? SlumAdjectives : FloodedAdjectives;
            }
            else
            {
                adjectives = UniversalAdjectives;
            }

            return adjectives[rng.Next(adjectives.Length)];
        }

        /// <summary>
        /// Get a random landmark, preferring canonical for main quests.
        /// </summary>
        public static string GetLandmark(bool preferCanonical, System.Random rng)
        {
            if (preferCanonical || rng.NextDouble() < 0.6)
            {
                return CanonicalLandmarks[rng.Next(CanonicalLandmarks.Length)];
            }
            return DynamicLandmarks[rng.Next(DynamicLandmarks.Length)];
        }

        /// <summary>
        /// Get a random outcome based on quest type.
        /// </summary>
        public static string GetOutcome(QuestType type, System.Random rng)
        {
            string[] outcomes = type switch
            {
                QuestType.Territory or QuestType.Infiltrate => ProgressionOutcomes,
                QuestType.Investigation => NarrativeOutcomes,
                _ => RewardOutcomes
            };

            return outcomes[rng.Next(outcomes.Length)];
        }

        /// <summary>
        /// Find a story beat quest by ID.
        /// </summary>
        public static StoryBeatQuest? FindStoryBeat(string questId)
        {
            foreach (var beat in MainStoryBeats)
            {
                if (beat.Id == questId) return beat;
            }
            foreach (var beat in FactionStoryBeats)
            {
                if (beat.Id == questId) return beat;
            }
            return null;
        }

        /// <summary>
        /// Get all available story beats for a faction at a given reputation level.
        /// </summary>
        public static List<StoryBeatQuest> GetAvailableFactionQuests(
            FactionType faction,
            int reputation,
            HashSet<string> completedQuests)
        {
            var available = new List<StoryBeatQuest>();

            foreach (var beat in FactionStoryBeats)
            {
                if (beat.GiverFaction != faction) continue;
                if (beat.RequiredReputation > reputation) continue;
                if (completedQuests.Contains(beat.Id)) continue;

                // Check prerequisites
                bool prereqsMet = true;
                if (beat.Prerequisites != null)
                {
                    foreach (var prereq in beat.Prerequisites)
                    {
                        if (!completedQuests.Contains(prereq))
                        {
                            prereqsMet = false;
                            break;
                        }
                    }
                }

                if (prereqsMet)
                {
                    available.Add(beat);
                }
            }

            return available;
        }

        #endregion
    }
}
