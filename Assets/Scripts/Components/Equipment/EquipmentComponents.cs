using Unity.Entities;
using Unity.Collections;
using NeoTokyo.Components.Faction;

namespace NeoTokyo.Components.Equipment
{
    /// <summary>
    /// Equipment slot enumeration for character loadout.
    /// Matches TypeScript: EquipmentSlot type in ECSEntity
    /// </summary>
    public enum EquipmentSlot : byte
    {
        None = 0,
        Weapon = 1,
        Armor = 2,
        Accessory1 = 3,
        Accessory2 = 4,
        Gadget = 5
    }

    /// <summary>
    /// Equipment tier for item quality/power levels.
    /// </summary>
    public enum EquipmentTier : byte
    {
        Common = 0,
        Uncommon = 1,
        Rare = 2,
        Epic = 3,
        Legendary = 4,
        Unique = 5
    }

    /// <summary>
    /// Equipment category for filtering and UI organization.
    /// </summary>
    public enum EquipmentCategory : byte
    {
        None = 0,

        // Weapons
        Sword = 10,
        Katana = 11,
        Staff = 12,
        Gauntlet = 13,
        Ranged = 14,

        // Armor
        LightArmor = 20,
        MediumArmor = 21,
        HeavyArmor = 22,
        Uniform = 23,

        // Accessories
        Ring = 30,
        Necklace = 31,
        Badge = 32,

        // Gadgets
        Drone = 40,
        Grenade = 41,
        Booster = 42,
        Shield = 43
    }

    /// <summary>
    /// Primary equipment component tracking equipped item IDs.
    /// Attached to character entities to track their loadout.
    /// Equivalent to TypeScript: Equipment interface in ECSEntity
    /// </summary>
    public struct Equipment : IComponentData
    {
        /// <summary>Item ID for equipped weapon (0 = none)</summary>
        public int WeaponId;

        /// <summary>Item ID for equipped armor (0 = none)</summary>
        public int ArmorId;

        /// <summary>Item ID for first accessory slot (0 = none)</summary>
        public int Accessory1Id;

        /// <summary>Item ID for second accessory slot (0 = none)</summary>
        public int Accessory2Id;

        /// <summary>Item ID for gadget slot (0 = none)</summary>
        public int GadgetId;

        public static Equipment Empty => new Equipment
        {
            WeaponId = 0,
            ArmorId = 0,
            Accessory1Id = 0,
            Accessory2Id = 0,
            GadgetId = 0
        };

        /// <summary>
        /// Get the item ID for a specific slot.
        /// </summary>
        public int GetSlotItemId(EquipmentSlot slot)
        {
            return slot switch
            {
                EquipmentSlot.Weapon => WeaponId,
                EquipmentSlot.Armor => ArmorId,
                EquipmentSlot.Accessory1 => Accessory1Id,
                EquipmentSlot.Accessory2 => Accessory2Id,
                EquipmentSlot.Gadget => GadgetId,
                _ => 0
            };
        }

        /// <summary>
        /// Check if a slot is occupied.
        /// </summary>
        public bool IsSlotOccupied(EquipmentSlot slot) => GetSlotItemId(slot) != 0;
    }

    /// <summary>
    /// Equipment item definition component.
    /// Attached to item entities to define their properties.
    /// Equivalent to TypeScript: EquipmentItem interface
    /// </summary>
    public struct EquipmentItem : IComponentData
    {
        /// <summary>Unique item identifier for database lookup</summary>
        public int ItemId;

        /// <summary>Which slot this item can be equipped in</summary>
        public EquipmentSlot Slot;

        /// <summary>Item category for filtering</summary>
        public EquipmentCategory Category;

        /// <summary>Item quality tier</summary>
        public EquipmentTier Tier;

        /// <summary>Display name of the item</summary>
        public FixedString64Bytes Name;

        /// <summary>Structure stat bonus (HP, Defense)</summary>
        public int StatBonus_Structure;

        /// <summary>Ignition stat bonus (Attack, Crits)</summary>
        public int StatBonus_Ignition;

        /// <summary>Logic stat bonus (Skills, Specials)</summary>
        public int StatBonus_Logic;

        /// <summary>Flow stat bonus (Speed, Evasion)</summary>
        public int StatBonus_Flow;

        /// <summary>Minimum level required to equip</summary>
        public int RequiredLevel;

        /// <summary>Required faction (Neutral = any)</summary>
        public FactionType RequiredFaction;

        /// <summary>
        /// Check if a character can equip this item based on level.
        /// </summary>
        public bool CanEquip(int characterLevel) => characterLevel >= RequiredLevel;

        /// <summary>
        /// Check if a character can equip based on faction.
        /// </summary>
        public bool CanEquip(FactionType characterFaction)
        {
            return RequiredFaction == FactionType.Neutral || RequiredFaction == characterFaction;
        }

        /// <summary>
        /// Check full equip requirements.
        /// </summary>
        public bool CanEquip(int characterLevel, FactionType characterFaction)
        {
            return CanEquip(characterLevel) && CanEquip(characterFaction);
        }

        /// <summary>
        /// Calculate total stat bonus value for comparison.
        /// </summary>
        public int TotalStatValue => StatBonus_Structure + StatBonus_Ignition + StatBonus_Logic + StatBonus_Flow;
    }

    /// <summary>
    /// Buffer element for tracking equipped items by slot.
    /// Provides entity references for equipped items.
    /// </summary>
    public struct EquipmentSlotElement : IBufferElementData
    {
        /// <summary>The equipment slot</summary>
        public EquipmentSlot Slot;

        /// <summary>Entity reference to the equipped item (Entity.Null if empty)</summary>
        public Entity EquippedItem;

        public static EquipmentSlotElement Empty(EquipmentSlot slot) => new EquipmentSlotElement
        {
            Slot = slot,
            EquippedItem = Entity.Null
        };
    }

    /// <summary>
    /// Request to equip an item in a specific slot.
    /// Processed by EquipmentSystem.
    /// </summary>
    public struct EquipRequest : IBufferElementData
    {
        /// <summary>Entity of the item to equip</summary>
        public Entity ItemEntity;

        /// <summary>Target slot for the item</summary>
        public EquipmentSlot TargetSlot;

        /// <summary>Whether to force equip even if slot is occupied (will unequip existing)</summary>
        public bool ForceEquip;
    }

    /// <summary>
    /// Request to unequip an item from a specific slot.
    /// Processed by EquipmentSystem.
    /// </summary>
    public struct UnequipRequest : IBufferElementData
    {
        /// <summary>Slot to unequip from</summary>
        public EquipmentSlot Slot;

        /// <summary>Whether to drop the item or return to inventory</summary>
        public bool DropItem;
    }

    /// <summary>
    /// Event fired when equipment changes occur.
    /// Used for visual updates and stat recalculation triggers.
    /// </summary>
    public struct EquipmentChangedEvent : IComponentData
    {
        /// <summary>Slot that changed</summary>
        public EquipmentSlot Slot;

        /// <summary>Previous item ID (0 if was empty)</summary>
        public int PreviousItemId;

        /// <summary>New item ID (0 if now empty)</summary>
        public int NewItemId;

        /// <summary>Whether this was an equip or unequip</summary>
        public bool WasEquipped;
    }

    /// <summary>
    /// Calculated stat bonuses from all equipped items.
    /// Updated by EquipmentSystem when equipment changes.
    /// </summary>
    public struct EquipmentStatBonuses : IComponentData
    {
        /// <summary>Total Structure bonus from equipment</summary>
        public int Structure;

        /// <summary>Total Ignition bonus from equipment</summary>
        public int Ignition;

        /// <summary>Total Logic bonus from equipment</summary>
        public int Logic;

        /// <summary>Total Flow bonus from equipment</summary>
        public int Flow;

        /// <summary>Whether bonuses need recalculation</summary>
        public bool IsDirty;

        public static EquipmentStatBonuses Default => new EquipmentStatBonuses
        {
            Structure = 0,
            Ignition = 0,
            Logic = 0,
            Flow = 0,
            IsDirty = false
        };

        /// <summary>
        /// Add stat bonuses from an equipment item.
        /// </summary>
        public void AddBonuses(EquipmentItem item)
        {
            Structure += item.StatBonus_Structure;
            Ignition += item.StatBonus_Ignition;
            Logic += item.StatBonus_Logic;
            Flow += item.StatBonus_Flow;
        }

        /// <summary>
        /// Reset all bonuses to zero.
        /// </summary>
        public void Clear()
        {
            Structure = 0;
            Ignition = 0;
            Logic = 0;
            Flow = 0;
        }
    }

    /// <summary>
    /// Equipment validation result for UI feedback.
    /// </summary>
    public enum EquipmentValidationResult : byte
    {
        Success = 0,
        LevelTooLow = 1,
        WrongFaction = 2,
        SlotMismatch = 3,
        ItemNotFound = 4,
        SlotOccupied = 5
    }
}
