using System.Collections.Generic;
using Unity.Collections;
using Unity.Entities;
using Unity.Mathematics;
using UnityEngine;
using NeoTokyo.Components.World;
using NeoTokyo.Components.Faction;

namespace NeoTokyo.Data
{
    /// <summary>
    /// Static territory definitions from Golden Record v2.0.
    /// Provides canonical data for all 10 territories in flooded Neo-Tokyo.
    ///
    /// Territory layout (world coordinates):
    /// - Academies in opposite corners (NE Kurenai, SW Azure)
    /// - Market in central position
    /// - Refuges adjacent to their aligned academies
    /// - Syndicate Docks on southern waterfront
    /// - Runner's Canal connecting territories
    /// - Shrine Heights elevated neutral zone
    /// - Deep Reach and Archives in dangerous waters
    /// </summary>
    public static class TerritoryDefinitions
    {
        /// <summary>
        /// Canonical territory data for all 10 Golden Record territories.
        /// </summary>
        public static readonly TerritoryDefinition[] AllTerritories = new TerritoryDefinition[]
        {
            // #1: Kurenai Academy - Passion academy, eastern rooftops
            new TerritoryDefinition
            {
                Id = TerritoryId.KurenaiAcademy,
                Type = TerritoryType.Academy,
                Name = "Kurenai Academy",
                ControllingFaction = FactionType.Kurenai,
                CenterPosition = new float3(150f, 15f, 150f),
                Radius = 80f,
                BoundsMin = new float3(70f, 0f, 70f),
                BoundsMax = new float3(230f, 50f, 230f),
                DifficultyLevel = 2,
                AmbientSound = "amb_academy_kurenai",
                MusicTrack = "mus_kurenai_theme",
                Description = "Training platforms draped in red tarps. The passionate heart of combat education.",
                Tags = new[] { "starter", "combat_training", "safe_zone" }
            },

            // #2: Azure Academy - Logic academy, western rooftops
            new TerritoryDefinition
            {
                Id = TerritoryId.AzureAcademy,
                Type = TerritoryType.Academy,
                Name = "Azure Academy",
                ControllingFaction = FactionType.Azure,
                CenterPosition = new float3(-150f, 15f, -150f),
                Radius = 80f,
                BoundsMin = new float3(-230f, 0f, -230f),
                BoundsMax = new float3(-70f, 50f, -70f),
                DifficultyLevel = 2,
                AmbientSound = "amb_academy_azure",
                MusicTrack = "mus_azure_theme",
                Description = "Workshop towers marked by blue canopies. Where adaptation is the highest virtue.",
                Tags = new[] { "starter", "engineering", "safe_zone" }
            },

            // #3: The Collective Market - Neutral trading hub
            new TerritoryDefinition
            {
                Id = TerritoryId.CollectiveMarket,
                Type = TerritoryType.Market,
                Name = "The Collective Market",
                ControllingFaction = FactionType.Collective,
                CenterPosition = new float3(0f, 10f, 0f),
                Radius = 100f,
                BoundsMin = new float3(-100f, 0f, -100f),
                BoundsMax = new float3(100f, 40f, 100f),
                DifficultyLevel = 3,
                AmbientSound = "amb_market_busy",
                MusicTrack = "mus_market_theme",
                Description = "Floating stalls on crowded docks. Every faction trades here under uneasy truce.",
                Tags = new[] { "trading", "neutral", "social_hub" }
            },

            // #4: Eastern Refuge - Kurenai-aligned civilian area
            new TerritoryDefinition
            {
                Id = TerritoryId.EasternRefuge,
                Type = TerritoryType.Refuge,
                Name = "Eastern Refuge",
                ControllingFaction = FactionType.Kurenai,
                CenterPosition = new float3(100f, 8f, 50f),
                Radius = 60f,
                BoundsMin = new float3(40f, 0f, -10f),
                BoundsMax = new float3(160f, 35f, 110f),
                DifficultyLevel = 3,
                AmbientSound = "amb_refuge_quiet",
                MusicTrack = "mus_refuge_east",
                Description = "Dense housing with rooftop gardens. Kurenai sympathizers protect their own.",
                Tags = new[] { "residential", "kurenai_aligned", "gardens" }
            },

            // #5: Western Refuge - Azure-aligned civilian area
            new TerritoryDefinition
            {
                Id = TerritoryId.WesternRefuge,
                Type = TerritoryType.Refuge,
                Name = "Western Refuge",
                ControllingFaction = FactionType.Azure,
                CenterPosition = new float3(-100f, 8f, -50f),
                Radius = 60f,
                BoundsMin = new float3(-160f, 0f, -110f),
                BoundsMax = new float3(-40f, 35f, 10f),
                DifficultyLevel = 3,
                AmbientSound = "amb_refuge_machinery",
                MusicTrack = "mus_refuge_west",
                Description = "Organized shelters with cistern systems. Azure efficiency keeps water pure.",
                Tags = new[] { "residential", "azure_aligned", "water_purification" }
            },

            // #6: Syndicate Docks - Criminal faction headquarters
            new TerritoryDefinition
            {
                Id = TerritoryId.SyndicateDocks,
                Type = TerritoryType.Industrial,
                Name = "Syndicate Docks",
                ControllingFaction = FactionType.Syndicate,
                CenterPosition = new float3(0f, 5f, -200f),
                Radius = 90f,
                BoundsMin = new float3(-90f, -5f, -290f),
                BoundsMax = new float3(90f, 30f, -110f),
                DifficultyLevel = 6,
                AmbientSound = "amb_docks_industrial",
                MusicTrack = "mus_syndicate_theme",
                Description = "Gambling barges and warehouses. Boss Tanaka's territory - enter at your own risk.",
                Tags = new[] { "criminal", "gambling", "dangerous", "black_market" }
            },

            // #7: Runner's Canal - Racing faction territory
            new TerritoryDefinition
            {
                Id = TerritoryId.RunnersCanal,
                Type = TerritoryType.Transition,
                Name = "Runner's Canal",
                ControllingFaction = FactionType.Runners,
                CenterPosition = new float3(-50f, 3f, 100f),
                Radius = 70f,
                BoundsMin = new float3(-120f, -2f, 30f),
                BoundsMax = new float3(20f, 25f, 170f),
                DifficultyLevel = 4,
                AmbientSound = "amb_canal_water",
                MusicTrack = "mus_runners_theme",
                Description = "Speedboat docks and racing courses. Road Queen Mika's crew runs these waters.",
                Tags = new[] { "racing", "boats", "transport_hub" }
            },

            // #8: Shrine Heights - Neutral sacred zone
            new TerritoryDefinition
            {
                Id = TerritoryId.ShrineHeights,
                Type = TerritoryType.Sacred,
                Name = "Shrine Heights",
                ControllingFaction = FactionType.Council,
                CenterPosition = new float3(50f, 25f, -50f),
                Radius = 50f,
                BoundsMin = new float3(0f, 10f, -100f),
                BoundsMax = new float3(100f, 45f, 0f),
                DifficultyLevel = 1,
                AmbientSound = "amb_shrine_peaceful",
                MusicTrack = "mus_shrine_theme",
                Description = "Sacred peace enforced by the Council of Seven. All factions meet here.",
                Tags = new[] { "sacred", "neutral", "council", "safe_zone", "story_location" }
            },

            // #9: The Deep Reach - Contested salvage zone
            new TerritoryDefinition
            {
                Id = TerritoryId.DeepReach,
                Type = TerritoryType.Depths,
                Name = "The Deep Reach",
                ControllingFaction = FactionType.Neutral,
                CenterPosition = new float3(100f, -10f, -100f),
                Radius = 70f,
                BoundsMin = new float3(30f, -30f, -170f),
                BoundsMax = new float3(170f, 15f, -30f),
                DifficultyLevel = 8,
                AmbientSound = "amb_underwater_creepy",
                MusicTrack = "mus_deep_tension",
                Description = "Dangerous salvage site in flooded ruins. Rich rewards for those who survive.",
                Tags = new[] { "contested", "salvage", "underwater", "dangerous", "loot" }
            },

            // #10: Drowned Archives - Cult territory
            new TerritoryDefinition
            {
                Id = TerritoryId.DrownedArchives,
                Type = TerritoryType.Depths,
                Name = "Drowned Archives",
                ControllingFaction = FactionType.Drowned,
                CenterPosition = new float3(-100f, -15f, 150f),
                Radius = 60f,
                BoundsMin = new float3(-160f, -35f, 90f),
                BoundsMax = new float3(-40f, 10f, 210f),
                DifficultyLevel = 9,
                AmbientSound = "amb_archives_whispers",
                MusicTrack = "mus_drowned_theme",
                Description = "Submerged library guarded by The Prophet's cult. Secrets of the flood lie here.",
                Tags = new[] { "cult", "underwater", "lore", "dangerous", "story_location" }
            }
        };

        /// <summary>
        /// Territory connections defining how players can travel between areas.
        /// </summary>
        public static readonly TerritoryConnectionDefinition[] AllConnections = new TerritoryConnectionDefinition[]
        {
            // Academy to adjacent areas
            new TerritoryConnectionDefinition
            {
                Source = TerritoryId.KurenaiAcademy,
                Target = TerritoryId.EasternRefuge,
                Type = ConnectionTypeFlag.Bridge,
                SourceOffset = new float3(-40f, 0f, -40f),
                TargetOffset = new float3(30f, 0f, 30f),
                TravelTime = 5f,
                InitiallyUnlocked = true
            },
            new TerritoryConnectionDefinition
            {
                Source = TerritoryId.KurenaiAcademy,
                Target = TerritoryId.CollectiveMarket,
                Type = ConnectionTypeFlag.Bridge,
                SourceOffset = new float3(-60f, 0f, -60f),
                TargetOffset = new float3(60f, 0f, 60f),
                TravelTime = 15f,
                InitiallyUnlocked = true
            },
            new TerritoryConnectionDefinition
            {
                Source = TerritoryId.AzureAcademy,
                Target = TerritoryId.WesternRefuge,
                Type = ConnectionTypeFlag.Bridge,
                SourceOffset = new float3(40f, 0f, 40f),
                TargetOffset = new float3(-30f, 0f, -30f),
                TravelTime = 5f,
                InitiallyUnlocked = true
            },
            new TerritoryConnectionDefinition
            {
                Source = TerritoryId.AzureAcademy,
                Target = TerritoryId.CollectiveMarket,
                Type = ConnectionTypeFlag.Bridge,
                SourceOffset = new float3(60f, 0f, 60f),
                TargetOffset = new float3(-60f, 0f, -60f),
                TravelTime = 15f,
                InitiallyUnlocked = true
            },

            // Market connections (central hub)
            new TerritoryConnectionDefinition
            {
                Source = TerritoryId.CollectiveMarket,
                Target = TerritoryId.RunnersCanal,
                Type = ConnectionTypeFlag.BoatRoute,
                SourceOffset = new float3(-40f, 0f, 50f),
                TargetOffset = new float3(10f, 0f, -30f),
                TravelTime = 10f,
                InitiallyUnlocked = true
            },
            new TerritoryConnectionDefinition
            {
                Source = TerritoryId.CollectiveMarket,
                Target = TerritoryId.ShrineHeights,
                Type = ConnectionTypeFlag.Bridge,
                SourceOffset = new float3(40f, 0f, -40f),
                TargetOffset = new float3(-20f, 0f, 20f),
                TravelTime = 8f,
                InitiallyUnlocked = true
            },
            new TerritoryConnectionDefinition
            {
                Source = TerritoryId.CollectiveMarket,
                Target = TerritoryId.SyndicateDocks,
                Type = ConnectionTypeFlag.BoatRoute,
                SourceOffset = new float3(0f, 0f, -60f),
                TargetOffset = new float3(0f, 0f, 50f),
                TravelTime = 12f,
                InitiallyUnlocked = true
            },

            // Refuge connections
            new TerritoryConnectionDefinition
            {
                Source = TerritoryId.EasternRefuge,
                Target = TerritoryId.CollectiveMarket,
                Type = ConnectionTypeFlag.Bridge,
                SourceOffset = new float3(-30f, 0f, -20f),
                TargetOffset = new float3(50f, 0f, 30f),
                TravelTime = 8f,
                InitiallyUnlocked = true
            },
            new TerritoryConnectionDefinition
            {
                Source = TerritoryId.WesternRefuge,
                Target = TerritoryId.CollectiveMarket,
                Type = ConnectionTypeFlag.Bridge,
                SourceOffset = new float3(30f, 0f, 20f),
                TargetOffset = new float3(-50f, 0f, -30f),
                TravelTime = 8f,
                InitiallyUnlocked = true
            },

            // Runner's Canal connections (transport network)
            new TerritoryConnectionDefinition
            {
                Source = TerritoryId.RunnersCanal,
                Target = TerritoryId.DrownedArchives,
                Type = ConnectionTypeFlag.BoatRoute,
                SourceOffset = new float3(-30f, 0f, 40f),
                TargetOffset = new float3(20f, 0f, -30f),
                TravelTime = 20f,
                InitiallyUnlocked = false  // Requires faction standing
            },
            new TerritoryConnectionDefinition
            {
                Source = TerritoryId.RunnersCanal,
                Target = TerritoryId.EasternRefuge,
                Type = ConnectionTypeFlag.BoatRoute,
                SourceOffset = new float3(10f, 0f, -20f),
                TargetOffset = new float3(-20f, 0f, 30f),
                TravelTime = 10f,
                InitiallyUnlocked = true
            },

            // Syndicate Docks connections
            new TerritoryConnectionDefinition
            {
                Source = TerritoryId.SyndicateDocks,
                Target = TerritoryId.DeepReach,
                Type = ConnectionTypeFlag.BoatRoute,
                SourceOffset = new float3(50f, 0f, 30f),
                TargetOffset = new float3(-30f, 0f, -40f),
                TravelTime = 15f,
                InitiallyUnlocked = false  // Requires Syndicate reputation
            },

            // Shrine Heights connections
            new TerritoryConnectionDefinition
            {
                Source = TerritoryId.ShrineHeights,
                Target = TerritoryId.DeepReach,
                Type = ConnectionTypeFlag.Cable,
                SourceOffset = new float3(30f, 0f, -30f),
                TargetOffset = new float3(-20f, 15f, 20f),
                TravelTime = 12f,
                InitiallyUnlocked = true
            },

            // Deep territories
            new TerritoryConnectionDefinition
            {
                Source = TerritoryId.DeepReach,
                Target = TerritoryId.DrownedArchives,
                Type = ConnectionTypeFlag.Tunnel,
                SourceOffset = new float3(-40f, -10f, 30f),
                TargetOffset = new float3(30f, -10f, -40f),
                TravelTime = 25f,
                InitiallyUnlocked = false  // Requires story progress
            }
        };

        /// <summary>
        /// Get territory definition by ID.
        /// </summary>
        public static TerritoryDefinition GetTerritory(TerritoryId id)
        {
            foreach (var territory in AllTerritories)
            {
                if (territory.Id == id)
                    return territory;
            }
            return null;
        }

        /// <summary>
        /// Get all connections from a specific territory.
        /// </summary>
        public static List<TerritoryConnectionDefinition> GetConnectionsFrom(TerritoryId source)
        {
            var connections = new List<TerritoryConnectionDefinition>();
            foreach (var conn in AllConnections)
            {
                if (conn.Source == source)
                    connections.Add(conn);
            }
            return connections;
        }

        /// <summary>
        /// Get all connections to a specific territory.
        /// </summary>
        public static List<TerritoryConnectionDefinition> GetConnectionsTo(TerritoryId target)
        {
            var connections = new List<TerritoryConnectionDefinition>();
            foreach (var conn in AllConnections)
            {
                if (conn.Target == target)
                    connections.Add(conn);
            }
            return connections;
        }

        /// <summary>
        /// Create territory entities in the ECS world.
        /// Factory method for spawning all canonical territories.
        /// </summary>
        public static void CreateTerritoryEntities(EntityManager em, int worldSeed = 0)
        {
            // Create manager singleton
            var managerEntity = em.CreateEntity();
            em.AddComponentData(managerEntity, new TerritoryManagerTag());
            em.AddComponentData(managerEntity, new TerritoryStateSingleton
            {
                ActiveTerritory = TerritoryId.None,
                DiscoveredCount = 0,
                TotalTerritories = AllTerritories.Length,
                HasContestedTerritory = false,
                WorldSeed = worldSeed
            });

            // Create entity for each territory
            foreach (var def in AllTerritories)
            {
                CreateTerritoryEntity(em, def, worldSeed);
            }

            // Create connection entities
            foreach (var conn in AllConnections)
            {
                CreateConnectionEntity(em, conn);
            }

            Debug.Log($"[TerritoryDefinitions] Created {AllTerritories.Length} territories and {AllConnections.Length} connections");
        }

        /// <summary>
        /// Create a single territory entity from definition.
        /// </summary>
        public static Entity CreateTerritoryEntity(EntityManager em, TerritoryDefinition def, int worldSeed = 0)
        {
            var entity = em.CreateEntity();

            // Add core data
            em.AddComponentData(entity, new TerritoryData
            {
                Id = def.Id,
                Type = def.Type,
                Name = new FixedString64Bytes(def.Name),
                ControllingFaction = def.ControllingFaction,
                CenterPosition = def.CenterPosition,
                Radius = def.Radius,
                DifficultyLevel = def.DifficultyLevel,
                AmbientSound = new FixedString32Bytes(def.AmbientSound ?? ""),
                MusicTrack = new FixedString32Bytes(def.MusicTrack ?? "")
            });

            // Add bounds
            em.AddComponentData(entity, new TerritoryBounds
            {
                Min = def.BoundsMin,
                Max = def.BoundsMax
            });

            // Add control state
            em.AddComponentData(entity, new TerritoryControl
            {
                CurrentController = def.ControllingFaction,
                ControlStrength = 100f,
                IsContested = false,
                ContestedTimer = 0f,
                PreviousController = def.ControllingFaction,
                AttackerProgress = 0f,
                AttackingFaction = FactionType.Neutral
            });

            // Add generation signature
            int territorySeed = CombineSeeds(worldSeed, (int)def.Id);
            em.AddComponentData(entity, new TerritorySignature
            {
                MasterSeed = worldSeed,
                TerritorySeed = territorySeed,
                GeneratedTimestamp = System.DateTimeOffset.UtcNow.ToUnixTimeSeconds()
            });

            return entity;
        }

        /// <summary>
        /// Create a territory connection entity.
        /// </summary>
        public static Entity CreateConnectionEntity(EntityManager em, TerritoryConnectionDefinition conn)
        {
            var entity = em.CreateEntity();

            var sourceDef = GetTerritory(conn.Source);
            var targetDef = GetTerritory(conn.Target);

            if (sourceDef == null || targetDef == null)
            {
                Debug.LogWarning($"[TerritoryDefinitions] Invalid connection: {conn.Source} -> {conn.Target}");
                em.DestroyEntity(entity);
                return Entity.Null;
            }

            em.AddComponentData(entity, new TerritoryConnection
            {
                SourceTerritory = conn.Source,
                TargetTerritory = conn.Target,
                SourcePosition = sourceDef.CenterPosition + conn.SourceOffset,
                TargetPosition = targetDef.CenterPosition + conn.TargetOffset,
                ConnectionType = conn.Type,
                IsUnlocked = conn.InitiallyUnlocked,
                TravelTime = conn.TravelTime
            });

            return entity;
        }

        /// <summary>
        /// Combine master seed with territory ID for deterministic generation.
        /// </summary>
        private static int CombineSeeds(int masterSeed, int territoryId)
        {
            // Simple hash combination
            unchecked
            {
                int hash = 17;
                hash = hash * 31 + masterSeed;
                hash = hash * 31 + territoryId;
                return hash;
            }
        }

        /// <summary>
        /// Get starting territory based on alignment.
        /// </summary>
        public static TerritoryId GetStartingTerritory(FactionType alignment)
        {
            return alignment switch
            {
                FactionType.Kurenai => TerritoryId.KurenaiAcademy,
                FactionType.Azure => TerritoryId.AzureAcademy,
                _ => TerritoryId.CollectiveMarket
            };
        }

        /// <summary>
        /// Check if territory is safe (no hostile NPCs spawn).
        /// </summary>
        public static bool IsSafeZone(TerritoryId id)
        {
            var def = GetTerritory(id);
            if (def?.Tags == null) return false;

            foreach (var tag in def.Tags)
            {
                if (tag == "safe_zone") return true;
            }
            return false;
        }

        /// <summary>
        /// Check if territory is underwater/submerged.
        /// </summary>
        public static bool IsUnderwaterTerritory(TerritoryId id)
        {
            var def = GetTerritory(id);
            if (def?.Tags == null) return false;

            foreach (var tag in def.Tags)
            {
                if (tag == "underwater") return true;
            }
            return false;
        }
    }

    /// <summary>
    /// Full territory definition for static data.
    /// </summary>
    public class TerritoryDefinition
    {
        public TerritoryId Id;
        public TerritoryType Type;
        public string Name;
        public FactionType ControllingFaction;
        public float3 CenterPosition;
        public float Radius;
        public float3 BoundsMin;
        public float3 BoundsMax;
        public int DifficultyLevel;
        public string AmbientSound;
        public string MusicTrack;
        public string Description;
        public string[] Tags;
    }

    /// <summary>
    /// Territory connection definition.
    /// </summary>
    public class TerritoryConnectionDefinition
    {
        public TerritoryId Source;
        public TerritoryId Target;
        public ConnectionTypeFlag Type;
        public float3 SourceOffset;
        public float3 TargetOffset;
        public float TravelTime;
        public bool InitiallyUnlocked;
    }
}
