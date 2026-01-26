using System.Collections.Generic;
using Unity.Collections;
using Unity.Entities;
using NeoTokyo.Components.Equipment;
using NeoTokyo.Components.Faction;

namespace NeoTokyo.Data
{
    /// <summary>
    /// Static equipment database for item definitions.
    /// Provides lookup methods and predefined equipment for Neo-Tokyo: Rival Academies.
    /// </summary>
    public static class EquipmentDatabase
    {
        #region Item ID Ranges

        // ID ranges by category for organized lookup
        public const int WEAPON_ID_START = 1000;
        public const int ARMOR_ID_START = 2000;
        public const int ACCESSORY_ID_START = 3000;
        public const int GADGET_ID_START = 4000;

        // ID ranges by tier
        public const int TIER_COMMON_OFFSET = 0;
        public const int TIER_UNCOMMON_OFFSET = 100;
        public const int TIER_RARE_OFFSET = 200;
        public const int TIER_EPIC_OFFSET = 300;
        public const int TIER_LEGENDARY_OFFSET = 400;

        #endregion

        #region Database Storage

        private static readonly Dictionary<int, EquipmentDefinition> _equipmentDatabase = new();
        private static bool _isInitialized = false;

        #endregion

        #region Equipment Definition

        /// <summary>
        /// Runtime equipment definition for database storage.
        /// </summary>
        public class EquipmentDefinition
        {
            public int ItemId;
            public string Name;
            public string Description;
            public EquipmentSlot Slot;
            public EquipmentCategory Category;
            public EquipmentTier Tier;
            public int StatBonus_Structure;
            public int StatBonus_Ignition;
            public int StatBonus_Logic;
            public int StatBonus_Flow;
            public int RequiredLevel;
            public FactionType RequiredFaction;
            public string PrefabPath;
            public string IconPath;

            /// <summary>
            /// Convert to ECS component.
            /// </summary>
            public EquipmentItem ToComponent()
            {
                return new EquipmentItem
                {
                    ItemId = ItemId,
                    Slot = Slot,
                    Category = Category,
                    Tier = Tier,
                    Name = new FixedString64Bytes(Name),
                    StatBonus_Structure = StatBonus_Structure,
                    StatBonus_Ignition = StatBonus_Ignition,
                    StatBonus_Logic = StatBonus_Logic,
                    StatBonus_Flow = StatBonus_Flow,
                    RequiredLevel = RequiredLevel,
                    RequiredFaction = RequiredFaction
                };
            }
        }

        #endregion

        #region Initialization

        /// <summary>
        /// Initialize the equipment database with all predefined items.
        /// Call once at game startup.
        /// </summary>
        public static void Initialize()
        {
            if (_isInitialized) return;

            _equipmentDatabase.Clear();

            // Register all equipment
            RegisterWeapons();
            RegisterArmor();
            RegisterAccessories();
            RegisterGadgets();

            _isInitialized = true;
        }

        private static void RegisterWeapons()
        {
            // Common Weapons (Level 1)
            Register(new EquipmentDefinition
            {
                ItemId = WEAPON_ID_START + TIER_COMMON_OFFSET + 1,
                Name = "Training Blade",
                Description = "A basic training weapon issued to new students.",
                Slot = EquipmentSlot.Weapon,
                Category = EquipmentCategory.Sword,
                Tier = EquipmentTier.Common,
                StatBonus_Ignition = 2,
                RequiredLevel = 1,
                RequiredFaction = FactionType.Neutral
            });

            Register(new EquipmentDefinition
            {
                ItemId = WEAPON_ID_START + TIER_COMMON_OFFSET + 2,
                Name = "Rusty Pipe",
                Description = "Salvaged from the flooded district. Better than nothing.",
                Slot = EquipmentSlot.Weapon,
                Category = EquipmentCategory.Staff,
                Tier = EquipmentTier.Common,
                StatBonus_Ignition = 1,
                StatBonus_Structure = 1,
                RequiredLevel = 1,
                RequiredFaction = FactionType.Neutral
            });

            // Uncommon Weapons (Level 5)
            Register(new EquipmentDefinition
            {
                ItemId = WEAPON_ID_START + TIER_UNCOMMON_OFFSET + 1,
                Name = "Kurenai Practice Katana",
                Description = "A weighted practice weapon favored by Kurenai students.",
                Slot = EquipmentSlot.Weapon,
                Category = EquipmentCategory.Katana,
                Tier = EquipmentTier.Uncommon,
                StatBonus_Ignition = 5,
                StatBonus_Flow = 2,
                RequiredLevel = 5,
                RequiredFaction = FactionType.Kurenai
            });

            Register(new EquipmentDefinition
            {
                ItemId = WEAPON_ID_START + TIER_UNCOMMON_OFFSET + 2,
                Name = "Azure Logic Staff",
                Description = "A precision instrument for Azure Academy's tactical fighters.",
                Slot = EquipmentSlot.Weapon,
                Category = EquipmentCategory.Staff,
                Tier = EquipmentTier.Uncommon,
                StatBonus_Logic = 5,
                StatBonus_Ignition = 2,
                RequiredLevel = 5,
                RequiredFaction = FactionType.Azure
            });

            // Rare Weapons (Level 10)
            Register(new EquipmentDefinition
            {
                ItemId = WEAPON_ID_START + TIER_RARE_OFFSET + 1,
                Name = "Crimson Edge",
                Description = "A blade infused with Kurenai passion. Burns with inner fire.",
                Slot = EquipmentSlot.Weapon,
                Category = EquipmentCategory.Katana,
                Tier = EquipmentTier.Rare,
                StatBonus_Ignition = 10,
                StatBonus_Flow = 3,
                StatBonus_Structure = 2,
                RequiredLevel = 10,
                RequiredFaction = FactionType.Kurenai
            });

            Register(new EquipmentDefinition
            {
                ItemId = WEAPON_ID_START + TIER_RARE_OFFSET + 2,
                Name = "Neural Gauntlets",
                Description = "Azure tech that enhances neural combat responses.",
                Slot = EquipmentSlot.Weapon,
                Category = EquipmentCategory.Gauntlet,
                Tier = EquipmentTier.Rare,
                StatBonus_Logic = 8,
                StatBonus_Ignition = 5,
                StatBonus_Flow = 2,
                RequiredLevel = 10,
                RequiredFaction = FactionType.Azure
            });

            // Epic Weapons (Level 20)
            Register(new EquipmentDefinition
            {
                ItemId = WEAPON_ID_START + TIER_EPIC_OFFSET + 1,
                Name = "Inferno Wakizashi",
                Description = "Forged in the deepest Kurenai furnaces. Legendary craftsmanship.",
                Slot = EquipmentSlot.Weapon,
                Category = EquipmentCategory.Katana,
                Tier = EquipmentTier.Epic,
                StatBonus_Ignition = 18,
                StatBonus_Flow = 8,
                StatBonus_Structure = 4,
                RequiredLevel = 20,
                RequiredFaction = FactionType.Kurenai
            });

            Register(new EquipmentDefinition
            {
                ItemId = WEAPON_ID_START + TIER_EPIC_OFFSET + 2,
                Name = "Quantum Processor Blade",
                Description = "Azure's finest technology. Predicts enemy movements.",
                Slot = EquipmentSlot.Weapon,
                Category = EquipmentCategory.Sword,
                Tier = EquipmentTier.Epic,
                StatBonus_Logic = 15,
                StatBonus_Ignition = 10,
                StatBonus_Flow = 5,
                RequiredLevel = 20,
                RequiredFaction = FactionType.Azure
            });

            // Legendary Weapons (Level 30)
            Register(new EquipmentDefinition
            {
                ItemId = WEAPON_ID_START + TIER_LEGENDARY_OFFSET + 1,
                Name = "Phoenix Flame",
                Description = "The legendary blade of Kurenai's founder. Said to never lose its edge.",
                Slot = EquipmentSlot.Weapon,
                Category = EquipmentCategory.Katana,
                Tier = EquipmentTier.Legendary,
                StatBonus_Ignition = 30,
                StatBonus_Flow = 15,
                StatBonus_Structure = 10,
                StatBonus_Logic = 5,
                RequiredLevel = 30,
                RequiredFaction = FactionType.Kurenai
            });

            Register(new EquipmentDefinition
            {
                ItemId = WEAPON_ID_START + TIER_LEGENDARY_OFFSET + 2,
                Name = "Absolute Zero",
                Description = "Azure's ultimate creation. Freezes probability itself.",
                Slot = EquipmentSlot.Weapon,
                Category = EquipmentCategory.Staff,
                Tier = EquipmentTier.Legendary,
                StatBonus_Logic = 28,
                StatBonus_Ignition = 15,
                StatBonus_Flow = 10,
                StatBonus_Structure = 7,
                RequiredLevel = 30,
                RequiredFaction = FactionType.Azure
            });

            // Neutral Legendary (Level 25)
            Register(new EquipmentDefinition
            {
                ItemId = WEAPON_ID_START + TIER_LEGENDARY_OFFSET + 10,
                Name = "Tide Breaker",
                Description = "Found in the deepest flooded ruins. Accepted by any faction.",
                Slot = EquipmentSlot.Weapon,
                Category = EquipmentCategory.Sword,
                Tier = EquipmentTier.Legendary,
                StatBonus_Ignition = 20,
                StatBonus_Flow = 20,
                StatBonus_Structure = 10,
                StatBonus_Logic = 10,
                RequiredLevel = 25,
                RequiredFaction = FactionType.Neutral
            });
        }

        private static void RegisterArmor()
        {
            // Common Armor (Level 1)
            Register(new EquipmentDefinition
            {
                ItemId = ARMOR_ID_START + TIER_COMMON_OFFSET + 1,
                Name = "Student Uniform",
                Description = "Standard academy uniform. Offers minimal protection.",
                Slot = EquipmentSlot.Armor,
                Category = EquipmentCategory.Uniform,
                Tier = EquipmentTier.Common,
                StatBonus_Structure = 2,
                RequiredLevel = 1,
                RequiredFaction = FactionType.Neutral
            });

            Register(new EquipmentDefinition
            {
                ItemId = ARMOR_ID_START + TIER_COMMON_OFFSET + 2,
                Name = "Scrap Metal Vest",
                Description = "Makeshift protection from salvaged materials.",
                Slot = EquipmentSlot.Armor,
                Category = EquipmentCategory.LightArmor,
                Tier = EquipmentTier.Common,
                StatBonus_Structure = 3,
                RequiredLevel = 1,
                RequiredFaction = FactionType.Neutral
            });

            // Uncommon Armor (Level 5)
            Register(new EquipmentDefinition
            {
                ItemId = ARMOR_ID_START + TIER_UNCOMMON_OFFSET + 1,
                Name = "Kurenai Combat Gi",
                Description = "Traditional fighting attire enhanced for modern combat.",
                Slot = EquipmentSlot.Armor,
                Category = EquipmentCategory.LightArmor,
                Tier = EquipmentTier.Uncommon,
                StatBonus_Structure = 4,
                StatBonus_Flow = 3,
                RequiredLevel = 5,
                RequiredFaction = FactionType.Kurenai
            });

            Register(new EquipmentDefinition
            {
                ItemId = ARMOR_ID_START + TIER_UNCOMMON_OFFSET + 2,
                Name = "Azure Tech Suit",
                Description = "Lightweight armor with integrated sensors.",
                Slot = EquipmentSlot.Armor,
                Category = EquipmentCategory.MediumArmor,
                Tier = EquipmentTier.Uncommon,
                StatBonus_Structure = 5,
                StatBonus_Logic = 2,
                RequiredLevel = 5,
                RequiredFaction = FactionType.Azure
            });

            // Rare Armor (Level 10)
            Register(new EquipmentDefinition
            {
                ItemId = ARMOR_ID_START + TIER_RARE_OFFSET + 1,
                Name = "Flame-Weave Jacket",
                Description = "Kurenai armor that responds to the wearer's passion.",
                Slot = EquipmentSlot.Armor,
                Category = EquipmentCategory.MediumArmor,
                Tier = EquipmentTier.Rare,
                StatBonus_Structure = 8,
                StatBonus_Ignition = 3,
                StatBonus_Flow = 4,
                RequiredLevel = 10,
                RequiredFaction = FactionType.Kurenai
            });

            Register(new EquipmentDefinition
            {
                ItemId = ARMOR_ID_START + TIER_RARE_OFFSET + 2,
                Name = "Probability Mesh",
                Description = "Azure armor that deflects attacks through prediction.",
                Slot = EquipmentSlot.Armor,
                Category = EquipmentCategory.MediumArmor,
                Tier = EquipmentTier.Rare,
                StatBonus_Structure = 7,
                StatBonus_Logic = 5,
                StatBonus_Flow = 3,
                RequiredLevel = 10,
                RequiredFaction = FactionType.Azure
            });

            // Epic Armor (Level 20)
            Register(new EquipmentDefinition
            {
                ItemId = ARMOR_ID_START + TIER_EPIC_OFFSET + 1,
                Name = "Phoenix Feather Mantle",
                Description = "Said to rise from ashes when the wearer's spirit burns brightest.",
                Slot = EquipmentSlot.Armor,
                Category = EquipmentCategory.LightArmor,
                Tier = EquipmentTier.Epic,
                StatBonus_Structure = 12,
                StatBonus_Ignition = 8,
                StatBonus_Flow = 10,
                RequiredLevel = 20,
                RequiredFaction = FactionType.Kurenai
            });

            Register(new EquipmentDefinition
            {
                ItemId = ARMOR_ID_START + TIER_EPIC_OFFSET + 2,
                Name = "Quantum Field Generator",
                Description = "Creates a probability shield around the wearer.",
                Slot = EquipmentSlot.Armor,
                Category = EquipmentCategory.HeavyArmor,
                Tier = EquipmentTier.Epic,
                StatBonus_Structure = 15,
                StatBonus_Logic = 10,
                StatBonus_Flow = 5,
                RequiredLevel = 20,
                RequiredFaction = FactionType.Azure
            });
        }

        private static void RegisterAccessories()
        {
            // Common Accessories (Level 1)
            Register(new EquipmentDefinition
            {
                ItemId = ACCESSORY_ID_START + TIER_COMMON_OFFSET + 1,
                Name = "Student ID Badge",
                Description = "Standard academy identification. Minor stat boost.",
                Slot = EquipmentSlot.Accessory1,
                Category = EquipmentCategory.Badge,
                Tier = EquipmentTier.Common,
                StatBonus_Structure = 1,
                StatBonus_Logic = 1,
                RequiredLevel = 1,
                RequiredFaction = FactionType.Neutral
            });

            Register(new EquipmentDefinition
            {
                ItemId = ACCESSORY_ID_START + TIER_COMMON_OFFSET + 2,
                Name = "Lucky Charm",
                Description = "A simple good luck charm. Might actually help.",
                Slot = EquipmentSlot.Accessory2,
                Category = EquipmentCategory.Necklace,
                Tier = EquipmentTier.Common,
                StatBonus_Flow = 2,
                RequiredLevel = 1,
                RequiredFaction = FactionType.Neutral
            });

            // Uncommon Accessories (Level 5)
            Register(new EquipmentDefinition
            {
                ItemId = ACCESSORY_ID_START + TIER_UNCOMMON_OFFSET + 1,
                Name = "Kurenai Spirit Band",
                Description = "A wristband infused with Kurenai fighting spirit.",
                Slot = EquipmentSlot.Accessory1,
                Category = EquipmentCategory.Ring,
                Tier = EquipmentTier.Uncommon,
                StatBonus_Ignition = 4,
                StatBonus_Flow = 2,
                RequiredLevel = 5,
                RequiredFaction = FactionType.Kurenai
            });

            Register(new EquipmentDefinition
            {
                ItemId = ACCESSORY_ID_START + TIER_UNCOMMON_OFFSET + 2,
                Name = "Azure Analysis Lens",
                Description = "Enhances pattern recognition and tactical awareness.",
                Slot = EquipmentSlot.Accessory1,
                Category = EquipmentCategory.Badge,
                Tier = EquipmentTier.Uncommon,
                StatBonus_Logic = 5,
                StatBonus_Flow = 1,
                RequiredLevel = 5,
                RequiredFaction = FactionType.Azure
            });

            // Rare Accessories (Level 10)
            Register(new EquipmentDefinition
            {
                ItemId = ACCESSORY_ID_START + TIER_RARE_OFFSET + 1,
                Name = "Ember Heart Pendant",
                Description = "Kurenai artifact that amplifies emotional resonance.",
                Slot = EquipmentSlot.Accessory1,
                Category = EquipmentCategory.Necklace,
                Tier = EquipmentTier.Rare,
                StatBonus_Ignition = 6,
                StatBonus_Structure = 4,
                StatBonus_Flow = 2,
                RequiredLevel = 10,
                RequiredFaction = FactionType.Kurenai
            });

            Register(new EquipmentDefinition
            {
                ItemId = ACCESSORY_ID_START + TIER_RARE_OFFSET + 2,
                Name = "Neural Interface Ring",
                Description = "Azure tech that enhances cognitive processing speed.",
                Slot = EquipmentSlot.Accessory1,
                Category = EquipmentCategory.Ring,
                Tier = EquipmentTier.Rare,
                StatBonus_Logic = 7,
                StatBonus_Flow = 3,
                StatBonus_Structure = 2,
                RequiredLevel = 10,
                RequiredFaction = FactionType.Azure
            });
        }

        private static void RegisterGadgets()
        {
            // Common Gadgets (Level 1)
            Register(new EquipmentDefinition
            {
                ItemId = GADGET_ID_START + TIER_COMMON_OFFSET + 1,
                Name = "Smoke Bomb",
                Description = "Creates a cloud of concealing smoke.",
                Slot = EquipmentSlot.Gadget,
                Category = EquipmentCategory.Grenade,
                Tier = EquipmentTier.Common,
                StatBonus_Flow = 2,
                RequiredLevel = 1,
                RequiredFaction = FactionType.Neutral
            });

            Register(new EquipmentDefinition
            {
                ItemId = GADGET_ID_START + TIER_COMMON_OFFSET + 2,
                Name = "Repair Drone",
                Description = "A small drone that provides minor healing over time.",
                Slot = EquipmentSlot.Gadget,
                Category = EquipmentCategory.Drone,
                Tier = EquipmentTier.Common,
                StatBonus_Structure = 2,
                RequiredLevel = 1,
                RequiredFaction = FactionType.Neutral
            });

            // Uncommon Gadgets (Level 5)
            Register(new EquipmentDefinition
            {
                ItemId = GADGET_ID_START + TIER_UNCOMMON_OFFSET + 1,
                Name = "Flash Bang",
                Description = "Blinds and disorients enemies in a radius.",
                Slot = EquipmentSlot.Gadget,
                Category = EquipmentCategory.Grenade,
                Tier = EquipmentTier.Uncommon,
                StatBonus_Ignition = 3,
                StatBonus_Flow = 2,
                RequiredLevel = 5,
                RequiredFaction = FactionType.Neutral
            });

            Register(new EquipmentDefinition
            {
                ItemId = GADGET_ID_START + TIER_UNCOMMON_OFFSET + 2,
                Name = "Scout Drone",
                Description = "Reveals enemies in a large area.",
                Slot = EquipmentSlot.Gadget,
                Category = EquipmentCategory.Drone,
                Tier = EquipmentTier.Uncommon,
                StatBonus_Logic = 4,
                StatBonus_Flow = 2,
                RequiredLevel = 5,
                RequiredFaction = FactionType.Neutral
            });

            // Rare Gadgets (Level 10)
            Register(new EquipmentDefinition
            {
                ItemId = GADGET_ID_START + TIER_RARE_OFFSET + 1,
                Name = "Energy Shield",
                Description = "Projects a temporary barrier that absorbs damage.",
                Slot = EquipmentSlot.Gadget,
                Category = EquipmentCategory.Shield,
                Tier = EquipmentTier.Rare,
                StatBonus_Structure = 8,
                StatBonus_Logic = 2,
                RequiredLevel = 10,
                RequiredFaction = FactionType.Neutral
            });

            Register(new EquipmentDefinition
            {
                ItemId = GADGET_ID_START + TIER_RARE_OFFSET + 2,
                Name = "Combat Booster",
                Description = "Injects stimulants that temporarily enhance combat ability.",
                Slot = EquipmentSlot.Gadget,
                Category = EquipmentCategory.Booster,
                Tier = EquipmentTier.Rare,
                StatBonus_Ignition = 5,
                StatBonus_Flow = 5,
                RequiredLevel = 10,
                RequiredFaction = FactionType.Neutral
            });
        }

        private static void Register(EquipmentDefinition definition)
        {
            _equipmentDatabase[definition.ItemId] = definition;
        }

        #endregion

        #region Lookup Methods

        /// <summary>
        /// Get equipment definition by ID.
        /// </summary>
        public static EquipmentDefinition GetById(int itemId)
        {
            EnsureInitialized();
            return _equipmentDatabase.TryGetValue(itemId, out var definition) ? definition : null;
        }

        /// <summary>
        /// Check if an item ID exists in the database.
        /// </summary>
        public static bool Exists(int itemId)
        {
            EnsureInitialized();
            return _equipmentDatabase.ContainsKey(itemId);
        }

        /// <summary>
        /// Get all equipment definitions.
        /// </summary>
        public static IEnumerable<EquipmentDefinition> GetAll()
        {
            EnsureInitialized();
            return _equipmentDatabase.Values;
        }

        /// <summary>
        /// Get all equipment for a specific slot.
        /// </summary>
        public static IEnumerable<EquipmentDefinition> GetBySlot(EquipmentSlot slot)
        {
            EnsureInitialized();
            foreach (var item in _equipmentDatabase.Values)
            {
                if (item.Slot == slot)
                {
                    yield return item;
                }
            }
        }

        /// <summary>
        /// Get all equipment for a specific tier.
        /// </summary>
        public static IEnumerable<EquipmentDefinition> GetByTier(EquipmentTier tier)
        {
            EnsureInitialized();
            foreach (var item in _equipmentDatabase.Values)
            {
                if (item.Tier == tier)
                {
                    yield return item;
                }
            }
        }

        /// <summary>
        /// Get all equipment for a specific faction (including neutral).
        /// </summary>
        public static IEnumerable<EquipmentDefinition> GetByFaction(FactionType faction)
        {
            EnsureInitialized();
            foreach (var item in _equipmentDatabase.Values)
            {
                if (item.RequiredFaction == faction || item.RequiredFaction == FactionType.Neutral)
                {
                    yield return item;
                }
            }
        }

        /// <summary>
        /// Get all equipment available at or below a specific level.
        /// </summary>
        public static IEnumerable<EquipmentDefinition> GetByMaxLevel(int maxLevel)
        {
            EnsureInitialized();
            foreach (var item in _equipmentDatabase.Values)
            {
                if (item.RequiredLevel <= maxLevel)
                {
                    yield return item;
                }
            }
        }

        /// <summary>
        /// Get equipment suitable for a character (level and faction filtered).
        /// </summary>
        public static IEnumerable<EquipmentDefinition> GetEquippableBy(int level, FactionType faction)
        {
            EnsureInitialized();
            foreach (var item in _equipmentDatabase.Values)
            {
                if (item.RequiredLevel <= level &&
                    (item.RequiredFaction == faction || item.RequiredFaction == FactionType.Neutral))
                {
                    yield return item;
                }
            }
        }

        /// <summary>
        /// Get the total number of items in the database.
        /// </summary>
        public static int Count
        {
            get
            {
                EnsureInitialized();
                return _equipmentDatabase.Count;
            }
        }

        private static void EnsureInitialized()
        {
            if (!_isInitialized)
            {
                Initialize();
            }
        }

        #endregion

        #region Entity Creation Helpers

        /// <summary>
        /// Create an entity with EquipmentItem component from a database item.
        /// </summary>
        public static Entity CreateItemEntity(EntityManager entityManager, int itemId)
        {
            var definition = GetById(itemId);
            if (definition == null) return Entity.Null;

            var entity = entityManager.CreateEntity();
            entityManager.AddComponentData(entity, definition.ToComponent());

            return entity;
        }

        /// <summary>
        /// Add equipment components to an existing character entity.
        /// </summary>
        public static void AddEquipmentComponentsToCharacter(EntityManager entityManager, Entity characterEntity)
        {
            if (!entityManager.HasComponent<Components.Equipment.Equipment>(characterEntity))
            {
                entityManager.AddComponentData(characterEntity, Components.Equipment.Equipment.Empty);
            }

            if (!entityManager.HasComponent<EquipmentStatBonuses>(characterEntity))
            {
                entityManager.AddComponentData(characterEntity, EquipmentStatBonuses.Default);
            }

            if (!entityManager.HasBuffer<EquipRequest>(characterEntity))
            {
                entityManager.AddBuffer<EquipRequest>(characterEntity);
            }

            if (!entityManager.HasBuffer<UnequipRequest>(characterEntity))
            {
                entityManager.AddBuffer<UnequipRequest>(characterEntity);
            }
        }

        #endregion
    }
}
