using System;
using System.Collections.Generic;
using Unity.Entities;
using Unity.Mathematics;
using UnityEngine;
using NeoTokyo.Components.Combat;

namespace NeoTokyo.Data
{
    /// <summary>
    /// Arena template definitions for procedural and hand-crafted arenas.
    /// Matches Golden Record: Rooftop, Bridge, Boat, Flooded Interior variants.
    /// </summary>
    public static class ArenaTemplates
    {
        #region Rooftop Arena Templates

        /// <summary>
        /// Small rooftop arena for 1v1 encounters.
        /// </summary>
        public static ArenaTemplate SmallRooftop => new ArenaTemplate
        {
            Name = "Small Rooftop",
            Type = ArenaType.Rooftop,
            Size = new float3(8f, 3f, 8f),
            HasFallHazard = true,
            HasWaterHazard = false,
            IsRocking = false,
            RockingIntensity = 0f,
            WaterDepth = 0f,
            HazardPlacements = new[]
            {
                // Edge fall hazards
                new HazardPlacement { Type = HazardType.Fall, RelativePosition = new float3(0.5f, -0.5f, 0f), Radius = 1f, Damage = 25f },
                new HazardPlacement { Type = HazardType.Fall, RelativePosition = new float3(-0.5f, -0.5f, 0f), Radius = 1f, Damage = 25f },
                new HazardPlacement { Type = HazardType.Fall, RelativePosition = new float3(0f, -0.5f, 0.5f), Radius = 1f, Damage = 25f },
                new HazardPlacement { Type = HazardType.Fall, RelativePosition = new float3(0f, -0.5f, -0.5f), Radius = 1f, Damage = 25f }
            },
            RecommendedCombatants = 2,
            DangerLevel = 1
        };

        /// <summary>
        /// Medium rooftop arena for group encounters.
        /// </summary>
        public static ArenaTemplate MediumRooftop => new ArenaTemplate
        {
            Name = "Medium Rooftop",
            Type = ArenaType.Rooftop,
            Size = new float3(15f, 4f, 15f),
            HasFallHazard = true,
            HasWaterHazard = false,
            IsRocking = false,
            RockingIntensity = 0f,
            WaterDepth = 0f,
            HazardPlacements = new[]
            {
                // Edge fall hazards
                new HazardPlacement { Type = HazardType.Fall, RelativePosition = new float3(0.5f, -0.5f, 0f), Radius = 2f, Damage = 25f },
                new HazardPlacement { Type = HazardType.Fall, RelativePosition = new float3(-0.5f, -0.5f, 0f), Radius = 2f, Damage = 25f },
                new HazardPlacement { Type = HazardType.Fall, RelativePosition = new float3(0f, -0.5f, 0.5f), Radius = 2f, Damage = 25f },
                new HazardPlacement { Type = HazardType.Fall, RelativePosition = new float3(0f, -0.5f, -0.5f), Radius = 2f, Damage = 25f },
                // Debris hazard in corner
                new HazardPlacement { Type = HazardType.Debris, RelativePosition = new float3(0.3f, 0f, 0.3f), Radius = 1.5f, Damage = 10f, TickInterval = 0f }
            },
            RecommendedCombatants = 4,
            DangerLevel = 2
        };

        /// <summary>
        /// Large rooftop arena for boss fights.
        /// </summary>
        public static ArenaTemplate LargeRooftop => new ArenaTemplate
        {
            Name = "Large Rooftop",
            Type = ArenaType.Rooftop,
            Size = new float3(25f, 5f, 25f),
            HasFallHazard = true,
            HasWaterHazard = false,
            IsRocking = false,
            RockingIntensity = 0f,
            WaterDepth = 0f,
            HazardPlacements = new[]
            {
                // Edge fall hazards
                new HazardPlacement { Type = HazardType.Fall, RelativePosition = new float3(0.5f, -0.5f, 0f), Radius = 3f, Damage = 30f },
                new HazardPlacement { Type = HazardType.Fall, RelativePosition = new float3(-0.5f, -0.5f, 0f), Radius = 3f, Damage = 30f },
                new HazardPlacement { Type = HazardType.Fall, RelativePosition = new float3(0f, -0.5f, 0.5f), Radius = 3f, Damage = 30f },
                new HazardPlacement { Type = HazardType.Fall, RelativePosition = new float3(0f, -0.5f, -0.5f), Radius = 3f, Damage = 30f },
                // Center fire hazard (boss arena gimmick)
                new HazardPlacement { Type = HazardType.Fire, RelativePosition = new float3(0f, 0f, 0f), Radius = 2f, Damage = 15f, TickInterval = 0.5f, Duration = 0f }
            },
            RecommendedCombatants = 6,
            DangerLevel = 4
        };

        #endregion

        #region Bridge Arena Templates

        /// <summary>
        /// Short bridge arena - quick crossing, high tension.
        /// </summary>
        public static ArenaTemplate ShortBridge => new ArenaTemplate
        {
            Name = "Short Bridge",
            Type = ArenaType.Bridge,
            Size = new float3(3f, 3f, 12f),
            HasFallHazard = true,
            HasWaterHazard = true,
            IsRocking = false,
            RockingIntensity = 0f,
            WaterDepth = 0f,
            HazardPlacements = new[]
            {
                // Side fall hazards
                new HazardPlacement { Type = HazardType.Fall, RelativePosition = new float3(0.6f, -0.3f, 0f), Radius = 1f, Damage = 20f },
                new HazardPlacement { Type = HazardType.Fall, RelativePosition = new float3(-0.6f, -0.3f, 0f), Radius = 1f, Damage = 20f },
                // Water below
                new HazardPlacement { Type = HazardType.Water, RelativePosition = new float3(0f, -1f, 0f), Radius = 5f, Damage = 10f, TickInterval = 1.5f }
            },
            RecommendedCombatants = 2,
            DangerLevel = 3
        };

        /// <summary>
        /// Long bridge arena - extended tactical combat.
        /// </summary>
        public static ArenaTemplate LongBridge => new ArenaTemplate
        {
            Name = "Long Bridge",
            Type = ArenaType.Bridge,
            Size = new float3(4f, 4f, 25f),
            HasFallHazard = true,
            HasWaterHazard = true,
            IsRocking = false,
            RockingIntensity = 0f,
            WaterDepth = 0f,
            HazardPlacements = new[]
            {
                // Side fall hazards along length
                new HazardPlacement { Type = HazardType.Fall, RelativePosition = new float3(0.6f, -0.3f, -0.3f), Radius = 1.5f, Damage = 20f },
                new HazardPlacement { Type = HazardType.Fall, RelativePosition = new float3(-0.6f, -0.3f, -0.3f), Radius = 1.5f, Damage = 20f },
                new HazardPlacement { Type = HazardType.Fall, RelativePosition = new float3(0.6f, -0.3f, 0.3f), Radius = 1.5f, Damage = 20f },
                new HazardPlacement { Type = HazardType.Fall, RelativePosition = new float3(-0.6f, -0.3f, 0.3f), Radius = 1.5f, Damage = 20f },
                // Water below
                new HazardPlacement { Type = HazardType.Water, RelativePosition = new float3(0f, -1.5f, 0f), Radius = 8f, Damage = 10f, TickInterval = 1.5f }
            },
            RecommendedCombatants = 3,
            DangerLevel = 4
        };

        /// <summary>
        /// Damaged bridge arena - unstable sections.
        /// </summary>
        public static ArenaTemplate DamagedBridge => new ArenaTemplate
        {
            Name = "Damaged Bridge",
            Type = ArenaType.Bridge,
            Size = new float3(5f, 4f, 20f),
            HasFallHazard = true,
            HasWaterHazard = true,
            IsRocking = true, // Slight swaying
            RockingIntensity = 0.2f,
            WaterDepth = 0f,
            HazardPlacements = new[]
            {
                // Side fall hazards
                new HazardPlacement { Type = HazardType.Fall, RelativePosition = new float3(0.55f, -0.3f, 0f), Radius = 2f, Damage = 25f },
                new HazardPlacement { Type = HazardType.Fall, RelativePosition = new float3(-0.55f, -0.3f, 0f), Radius = 2f, Damage = 25f },
                // Gap in bridge (fall through)
                new HazardPlacement { Type = HazardType.Fall, RelativePosition = new float3(0f, -0.5f, 0.2f), Radius = 1f, Damage = 30f },
                // Debris hazard from damage
                new HazardPlacement { Type = HazardType.Debris, RelativePosition = new float3(-0.2f, 0f, 0.1f), Radius = 1f, Damage = 8f },
                // Water below
                new HazardPlacement { Type = HazardType.Water, RelativePosition = new float3(0f, -2f, 0f), Radius = 6f, Damage = 12f, TickInterval = 1.5f }
            },
            RecommendedCombatants = 2,
            DangerLevel = 5
        };

        #endregion

        #region Boat Arena Templates

        /// <summary>
        /// Small patrol boat - tight quarters, high instability.
        /// </summary>
        public static ArenaTemplate SmallBoat => new ArenaTemplate
        {
            Name = "Patrol Boat",
            Type = ArenaType.Boat,
            Size = new float3(4f, 2f, 8f),
            HasFallHazard = true,
            HasWaterHazard = true,
            IsRocking = true,
            RockingIntensity = 0.7f,
            WaterDepth = 0f,
            HazardPlacements = new[]
            {
                // Edge fall hazards
                new HazardPlacement { Type = HazardType.Fall, RelativePosition = new float3(0.55f, 0f, 0f), Radius = 1f, Damage = 15f },
                new HazardPlacement { Type = HazardType.Fall, RelativePosition = new float3(-0.55f, 0f, 0f), Radius = 1f, Damage = 15f },
                new HazardPlacement { Type = HazardType.Fall, RelativePosition = new float3(0f, 0f, 0.55f), Radius = 0.8f, Damage = 15f },
                new HazardPlacement { Type = HazardType.Fall, RelativePosition = new float3(0f, 0f, -0.55f), Radius = 0.8f, Damage = 15f },
                // Surrounding water
                new HazardPlacement { Type = HazardType.Water, RelativePosition = new float3(0f, -1f, 0f), Radius = 6f, Damage = 10f, TickInterval = 2f }
            },
            RecommendedCombatants = 2,
            DangerLevel = 4
        };

        /// <summary>
        /// Cargo barge - larger deck, moderate rocking.
        /// </summary>
        public static ArenaTemplate CargoBarge => new ArenaTemplate
        {
            Name = "Cargo Barge",
            Type = ArenaType.Boat,
            Size = new float3(10f, 3f, 15f),
            HasFallHazard = true,
            HasWaterHazard = true,
            IsRocking = true,
            RockingIntensity = 0.4f,
            WaterDepth = 0f,
            HazardPlacements = new[]
            {
                // Edge fall hazards
                new HazardPlacement { Type = HazardType.Fall, RelativePosition = new float3(0.55f, 0f, 0f), Radius = 2f, Damage = 15f },
                new HazardPlacement { Type = HazardType.Fall, RelativePosition = new float3(-0.55f, 0f, 0f), Radius = 2f, Damage = 15f },
                new HazardPlacement { Type = HazardType.Fall, RelativePosition = new float3(0f, 0f, 0.55f), Radius = 1.5f, Damage = 15f },
                new HazardPlacement { Type = HazardType.Fall, RelativePosition = new float3(0f, 0f, -0.55f), Radius = 1.5f, Damage = 15f },
                // Cargo crate debris
                new HazardPlacement { Type = HazardType.Debris, RelativePosition = new float3(0.2f, 0f, 0.2f), Radius = 1.5f, Damage = 5f },
                new HazardPlacement { Type = HazardType.Debris, RelativePosition = new float3(-0.2f, 0f, -0.15f), Radius = 1.2f, Damage = 5f },
                // Surrounding water
                new HazardPlacement { Type = HazardType.Water, RelativePosition = new float3(0f, -1.5f, 0f), Radius = 10f, Damage = 10f, TickInterval = 2f }
            },
            RecommendedCombatants = 4,
            DangerLevel = 3
        };

        /// <summary>
        /// Battleship deck - large stable platform, multiple hazards.
        /// </summary>
        public static ArenaTemplate BattleshipDeck => new ArenaTemplate
        {
            Name = "Battleship Deck",
            Type = ArenaType.Boat,
            Size = new float3(18f, 4f, 30f),
            HasFallHazard = true,
            HasWaterHazard = true,
            IsRocking = true,
            RockingIntensity = 0.2f, // Large ship = less rocking
            WaterDepth = 0f,
            HazardPlacements = new[]
            {
                // Edge fall hazards
                new HazardPlacement { Type = HazardType.Fall, RelativePosition = new float3(0.52f, 0f, 0f), Radius = 3f, Damage = 20f },
                new HazardPlacement { Type = HazardType.Fall, RelativePosition = new float3(-0.52f, 0f, 0f), Radius = 3f, Damage = 20f },
                // Fire hazard from damaged section
                new HazardPlacement { Type = HazardType.Fire, RelativePosition = new float3(0.25f, 0f, 0.3f), Radius = 2f, Damage = 12f, TickInterval = 0.5f },
                // Electric hazard from exposed wiring
                new HazardPlacement { Type = HazardType.Electric, RelativePosition = new float3(-0.2f, 0f, -0.2f), Radius = 1.5f, Damage = 18f, TickInterval = 0.8f },
                // Surrounding water
                new HazardPlacement { Type = HazardType.Water, RelativePosition = new float3(0f, -2f, 0f), Radius = 15f, Damage = 10f, TickInterval = 2f }
            },
            RecommendedCombatants = 6,
            DangerLevel = 5
        };

        #endregion

        #region Flooded Interior Templates

        /// <summary>
        /// Flooded subway station - waist-deep water, limited space.
        /// </summary>
        public static ArenaTemplate FloodedSubway => new ArenaTemplate
        {
            Name = "Flooded Subway",
            Type = ArenaType.FloodedInterior,
            Size = new float3(8f, 4f, 25f),
            HasFallHazard = false,
            HasWaterHazard = true,
            IsRocking = false,
            RockingIntensity = 0f,
            WaterDepth = 1.0f,
            HazardPlacements = new[]
            {
                // Deep water pit (subway track)
                new HazardPlacement { Type = HazardType.DeepWater, RelativePosition = new float3(0f, -0.5f, 0f), Radius = 2f, Damage = 8f, TickInterval = 2f },
                // Electric hazard from third rail
                new HazardPlacement { Type = HazardType.Electric, RelativePosition = new float3(0.3f, -0.3f, 0f), Radius = 1f, Damage = 25f, TickInterval = 0.3f },
                // Debris from collapsed ceiling
                new HazardPlacement { Type = HazardType.Debris, RelativePosition = new float3(-0.2f, 0f, 0.3f), Radius = 1.5f, Damage = 8f }
            },
            RecommendedCombatants = 3,
            DangerLevel = 4
        };

        /// <summary>
        /// Flooded warehouse - open space, variable water depth.
        /// </summary>
        public static ArenaTemplate FloodedWarehouse => new ArenaTemplate
        {
            Name = "Flooded Warehouse",
            Type = ArenaType.FloodedInterior,
            Size = new float3(20f, 5f, 20f),
            HasFallHazard = false,
            HasWaterHazard = true,
            IsRocking = false,
            RockingIntensity = 0f,
            WaterDepth = 0.8f,
            HazardPlacements = new[]
            {
                // Deep water section (drainage pit)
                new HazardPlacement { Type = HazardType.DeepWater, RelativePosition = new float3(0.25f, -0.6f, 0f), Radius = 3f, Damage = 6f, TickInterval = 2.5f },
                // Toxic spill from containers
                new HazardPlacement { Type = HazardType.Toxic, RelativePosition = new float3(-0.25f, 0f, 0.2f), Radius = 2.5f, Damage = 10f, TickInterval = 1f },
                // Fire from oil drums
                new HazardPlacement { Type = HazardType.Fire, RelativePosition = new float3(0.3f, 0.2f, -0.3f), Radius = 2f, Damage = 15f, TickInterval = 0.4f },
                // Debris obstacles
                new HazardPlacement { Type = HazardType.Debris, RelativePosition = new float3(-0.15f, 0f, -0.15f), Radius = 1.5f, Damage = 5f },
                new HazardPlacement { Type = HazardType.Debris, RelativePosition = new float3(0.1f, 0f, 0.3f), Radius = 1.2f, Damage = 5f }
            },
            RecommendedCombatants = 5,
            DangerLevel = 4
        };

        /// <summary>
        /// Flooded shrine - sacred water, healing and damage zones.
        /// </summary>
        public static ArenaTemplate FloodedShrine => new ArenaTemplate
        {
            Name = "Flooded Shrine",
            Type = ArenaType.Shrine,
            Size = new float3(15f, 6f, 15f),
            HasFallHazard = false,
            HasWaterHazard = true,
            IsRocking = false,
            RockingIntensity = 0f,
            WaterDepth = 0.5f, // Ankle-deep sacred water
            HazardPlacements = new[]
            {
                // Deep reflection pool (center)
                new HazardPlacement { Type = HazardType.DeepWater, RelativePosition = new float3(0f, -0.4f, 0f), Radius = 2f, Damage = 0f, TickInterval = 0f },
                // Slippery moss-covered stones
                new HazardPlacement { Type = HazardType.Slippery, RelativePosition = new float3(0.2f, 0f, 0.2f), Radius = 1.5f, Damage = 0f },
                new HazardPlacement { Type = HazardType.Slippery, RelativePosition = new float3(-0.2f, 0f, -0.2f), Radius = 1.5f, Damage = 0f }
            },
            RecommendedCombatants = 4,
            DangerLevel = 2
        };

        #endregion

        #region Special Arena Templates

        /// <summary>
        /// Underground sewer arena - confined with toxic hazards.
        /// </summary>
        public static ArenaTemplate UndergroundSewer => new ArenaTemplate
        {
            Name = "Underground Sewer",
            Type = ArenaType.Underground,
            Size = new float3(6f, 4f, 20f),
            HasFallHazard = false,
            HasWaterHazard = true,
            IsRocking = false,
            RockingIntensity = 0f,
            WaterDepth = 0.6f,
            HazardPlacements = new[]
            {
                // Toxic sludge
                new HazardPlacement { Type = HazardType.Toxic, RelativePosition = new float3(0f, -0.2f, 0f), Radius = 1.5f, Damage = 8f, TickInterval = 1.2f },
                new HazardPlacement { Type = HazardType.Toxic, RelativePosition = new float3(0.2f, -0.2f, 0.3f), Radius = 1f, Damage = 8f, TickInterval = 1.2f },
                // Debris from collapsed sections
                new HazardPlacement { Type = HazardType.Debris, RelativePosition = new float3(-0.3f, 0f, -0.2f), Radius = 1.5f, Damage = 10f }
            },
            RecommendedCombatants = 2,
            DangerLevel = 4
        };

        /// <summary>
        /// Open water arena - swimming combat.
        /// </summary>
        public static ArenaTemplate OpenWaterArena => new ArenaTemplate
        {
            Name = "Open Water",
            Type = ArenaType.OpenWater,
            Size = new float3(20f, 10f, 20f),
            HasFallHazard = false,
            HasWaterHazard = true,
            IsRocking = false,
            RockingIntensity = 0f,
            WaterDepth = 8f, // Deep water - swimming required
            HazardPlacements = new[]
            {
                // Deep water throughout
                new HazardPlacement { Type = HazardType.DeepWater, RelativePosition = new float3(0f, 0f, 0f), Radius = 12f, Damage = 5f, TickInterval = 3f },
                // Debris floating
                new HazardPlacement { Type = HazardType.Debris, RelativePosition = new float3(0.25f, 0.2f, 0.25f), Radius = 2f, Damage = 5f },
                new HazardPlacement { Type = HazardType.Debris, RelativePosition = new float3(-0.2f, 0.2f, -0.15f), Radius = 1.5f, Damage = 5f }
            },
            RecommendedCombatants = 2,
            DangerLevel = 5
        };

        #endregion

        #region Template Registry

        private static readonly Dictionary<string, ArenaTemplate> _templateRegistry = new Dictionary<string, ArenaTemplate>
        {
            { "small_rooftop", SmallRooftop },
            { "medium_rooftop", MediumRooftop },
            { "large_rooftop", LargeRooftop },
            { "short_bridge", ShortBridge },
            { "long_bridge", LongBridge },
            { "damaged_bridge", DamagedBridge },
            { "small_boat", SmallBoat },
            { "cargo_barge", CargoBarge },
            { "battleship_deck", BattleshipDeck },
            { "flooded_subway", FloodedSubway },
            { "flooded_warehouse", FloodedWarehouse },
            { "flooded_shrine", FloodedShrine },
            { "underground_sewer", UndergroundSewer },
            { "open_water", OpenWaterArena }
        };

        /// <summary>
        /// Get a template by ID.
        /// </summary>
        public static ArenaTemplate GetTemplate(string templateId)
        {
            if (_templateRegistry.TryGetValue(templateId.ToLowerInvariant(), out var template))
            {
                return template;
            }
            Debug.LogWarning($"Arena template not found: {templateId}, returning SmallRooftop");
            return SmallRooftop;
        }

        /// <summary>
        /// Get all templates of a specific type.
        /// </summary>
        public static IEnumerable<ArenaTemplate> GetTemplatesByType(ArenaType type)
        {
            foreach (var template in _templateRegistry.Values)
            {
                if (template.Type == type)
                {
                    yield return template;
                }
            }
        }

        /// <summary>
        /// Get all available template IDs.
        /// </summary>
        public static IEnumerable<string> GetAllTemplateIds() => _templateRegistry.Keys;

        /// <summary>
        /// Get a random template for the given type.
        /// </summary>
        public static ArenaTemplate GetRandomTemplateForType(ArenaType type, uint seed)
        {
            var templates = new List<ArenaTemplate>();
            foreach (var template in GetTemplatesByType(type))
            {
                templates.Add(template);
            }

            if (templates.Count == 0)
            {
                return SmallRooftop;
            }

            var random = new Unity.Mathematics.Random(seed);
            return templates[random.NextInt(templates.Count)];
        }

        #endregion
    }

    /// <summary>
    /// Arena template data structure.
    /// </summary>
    [Serializable]
    public struct ArenaTemplate
    {
        /// <summary>Display name of the arena.</summary>
        public string Name;

        /// <summary>Arena type category.</summary>
        public ArenaType Type;

        /// <summary>Size dimensions (width, height, depth).</summary>
        public float3 Size;

        /// <summary>Whether arena has fall hazards.</summary>
        public bool HasFallHazard;

        /// <summary>Whether arena has water hazards.</summary>
        public bool HasWaterHazard;

        /// <summary>Whether arena platform rocks.</summary>
        public bool IsRocking;

        /// <summary>Rocking intensity (0-1).</summary>
        public float RockingIntensity;

        /// <summary>Water depth (0 for dry arenas).</summary>
        public float WaterDepth;

        /// <summary>Hazard placement definitions.</summary>
        public HazardPlacement[] HazardPlacements;

        /// <summary>Recommended number of combatants.</summary>
        public int RecommendedCombatants;

        /// <summary>Danger level (1-5).</summary>
        public int DangerLevel;

        /// <summary>
        /// Spawn this arena at the given position.
        /// </summary>
        public Entity Spawn(EntityManager em, float3 center)
        {
            var entity = em.CreateEntity();

            // Create arena data
            var arenaData = new ArenaData
            {
                Type = Type,
                Center = center,
                Size = Size,
                HasFallHazard = HasFallHazard,
                HasWaterHazard = HasWaterHazard,
                IsRocking = IsRocking,
                RockingIntensity = RockingIntensity,
                WaterDepth = WaterDepth,
                ActiveTime = 0f
            };

            em.AddComponentData(entity, arenaData);

            // Add rocking platform if applicable
            if (IsRocking)
            {
                em.AddComponentData(entity, RockingPlatform.CreateBoatRocking(RockingIntensity));
            }

            // Add hazard buffer
            em.AddBuffer<ArenaHazard>(entity);
            var hazards = em.GetBuffer<ArenaHazard>(entity);

            // Spawn hazards from template
            if (HazardPlacements != null)
            {
                foreach (var placement in HazardPlacements)
                {
                    float3 worldPos = center + (placement.RelativePosition * Size);

                    var hazard = new ArenaHazard
                    {
                        Type = placement.Type,
                        Position = worldPos,
                        Radius = placement.Radius,
                        Damage = placement.Damage,
                        TickInterval = placement.TickInterval,
                        Duration = placement.Duration,
                        RemainingDuration = placement.Duration,
                        IsActive = true,
                        StabilityDamage = placement.Damage * GetStabilityRatio(placement.Type),
                        KnockbackForce = placement.KnockbackForce
                    };

                    hazards.Add(hazard);
                }
            }

            return entity;
        }

        private static float GetStabilityRatio(HazardType type)
        {
            switch (type)
            {
                case HazardType.Electric: return 0.3f;
                case HazardType.Debris: return 0.5f;
                case HazardType.Fall: return 0.5f;
                case HazardType.Fire: return 0.1f;
                default: return 0f;
            }
        }
    }

    /// <summary>
    /// Hazard placement definition within a template.
    /// Positions are relative to arena size (-0.5 to 0.5 range).
    /// </summary>
    [Serializable]
    public struct HazardPlacement
    {
        /// <summary>Type of hazard.</summary>
        public HazardType Type;

        /// <summary>Position relative to arena center (-0.5 to 0.5 for each axis).</summary>
        public float3 RelativePosition;

        /// <summary>Hazard effect radius.</summary>
        public float Radius;

        /// <summary>Damage per tick (or instant for fall hazards).</summary>
        public float Damage;

        /// <summary>Time between damage ticks (0 for instant).</summary>
        public float TickInterval;

        /// <summary>Duration before hazard expires (0 for permanent).</summary>
        public float Duration;

        /// <summary>Knockback direction and strength.</summary>
        public float3 KnockbackForce;
    }
}
