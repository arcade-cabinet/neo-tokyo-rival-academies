using NUnit.Framework;
using Unity.Collections;
using NeoTokyo.Components.Equipment;
using NeoTokyo.Components.Faction;

namespace NeoTokyo.Tests.EditMode
{
    /// <summary>
    /// Unit tests for EquipmentSystem components and logic.
    /// Tests equip logic, stat bonuses, validation.
    /// Command: Unity -batchmode -runTests -testPlatform EditMode
    /// </summary>
    [TestFixture]
    public class EquipmentSystemTests
    {
        #region Equipment Component Tests

        [Test]
        public void Equipment_Empty()
        {
            var equipment = Equipment.Empty;

            Assert.AreEqual(0, equipment.WeaponId);
            Assert.AreEqual(0, equipment.ArmorId);
            Assert.AreEqual(0, equipment.Accessory1Id);
            Assert.AreEqual(0, equipment.Accessory2Id);
            Assert.AreEqual(0, equipment.GadgetId);
        }

        [Test]
        public void Equipment_GetSlotItemId()
        {
            var equipment = new Equipment
            {
                WeaponId = 101,
                ArmorId = 201,
                Accessory1Id = 301,
                Accessory2Id = 302,
                GadgetId = 401
            };

            Assert.AreEqual(101, equipment.GetSlotItemId(EquipmentSlot.Weapon));
            Assert.AreEqual(201, equipment.GetSlotItemId(EquipmentSlot.Armor));
            Assert.AreEqual(301, equipment.GetSlotItemId(EquipmentSlot.Accessory1));
            Assert.AreEqual(302, equipment.GetSlotItemId(EquipmentSlot.Accessory2));
            Assert.AreEqual(401, equipment.GetSlotItemId(EquipmentSlot.Gadget));
            Assert.AreEqual(0, equipment.GetSlotItemId(EquipmentSlot.None));
        }

        [Test]
        public void Equipment_IsSlotOccupied()
        {
            var equipment = new Equipment
            {
                WeaponId = 101,
                ArmorId = 0,
                Accessory1Id = 301
            };

            Assert.IsTrue(equipment.IsSlotOccupied(EquipmentSlot.Weapon));
            Assert.IsFalse(equipment.IsSlotOccupied(EquipmentSlot.Armor));
            Assert.IsTrue(equipment.IsSlotOccupied(EquipmentSlot.Accessory1));
            Assert.IsFalse(equipment.IsSlotOccupied(EquipmentSlot.Accessory2));
        }

        #endregion

        #region EquipmentSlot Tests

        [Test]
        public void EquipmentSlot_AllSlotsExist()
        {
            Assert.AreEqual((byte)0, (byte)EquipmentSlot.None);
            Assert.AreEqual((byte)1, (byte)EquipmentSlot.Weapon);
            Assert.AreEqual((byte)2, (byte)EquipmentSlot.Armor);
            Assert.AreEqual((byte)3, (byte)EquipmentSlot.Accessory1);
            Assert.AreEqual((byte)4, (byte)EquipmentSlot.Accessory2);
            Assert.AreEqual((byte)5, (byte)EquipmentSlot.Gadget);
        }

        #endregion

        #region EquipmentTier Tests

        [Test]
        public void EquipmentTier_AllTiersExist()
        {
            Assert.AreEqual((byte)0, (byte)EquipmentTier.Common);
            Assert.AreEqual((byte)1, (byte)EquipmentTier.Uncommon);
            Assert.AreEqual((byte)2, (byte)EquipmentTier.Rare);
            Assert.AreEqual((byte)3, (byte)EquipmentTier.Epic);
            Assert.AreEqual((byte)4, (byte)EquipmentTier.Legendary);
            Assert.AreEqual((byte)5, (byte)EquipmentTier.Unique);
        }

        #endregion

        #region EquipmentItem Tests

        [Test]
        public void EquipmentItem_Properties()
        {
            var item = new EquipmentItem
            {
                ItemId = 1001,
                Slot = EquipmentSlot.Weapon,
                Category = EquipmentCategory.Katana,
                Tier = EquipmentTier.Rare,
                Name = new FixedString64Bytes("Crimson Blade"),
                StatBonus_Structure = 5,
                StatBonus_Ignition = 15,
                StatBonus_Logic = 0,
                StatBonus_Flow = 10,
                RequiredLevel = 5,
                RequiredFaction = FactionType.Kurenai
            };

            Assert.AreEqual(1001, item.ItemId);
            Assert.AreEqual(EquipmentSlot.Weapon, item.Slot);
            Assert.AreEqual(EquipmentCategory.Katana, item.Category);
            Assert.AreEqual(EquipmentTier.Rare, item.Tier);
            Assert.AreEqual("Crimson Blade", item.Name.ToString());
            Assert.AreEqual(15, item.StatBonus_Ignition);
            Assert.AreEqual(5, item.RequiredLevel);
            Assert.AreEqual(FactionType.Kurenai, item.RequiredFaction);
        }

        [Test]
        public void EquipmentItem_TotalStatValue()
        {
            var item = new EquipmentItem
            {
                StatBonus_Structure = 10,
                StatBonus_Ignition = 5,
                StatBonus_Logic = 8,
                StatBonus_Flow = 7
            };

            Assert.AreEqual(30, item.TotalStatValue);
        }

        [Test]
        public void EquipmentItem_CanEquip_Level()
        {
            var item = new EquipmentItem
            {
                RequiredLevel = 10
            };

            Assert.IsFalse(item.CanEquip(5));
            Assert.IsFalse(item.CanEquip(9));
            Assert.IsTrue(item.CanEquip(10));
            Assert.IsTrue(item.CanEquip(15));
        }

        [Test]
        public void EquipmentItem_CanEquip_Faction()
        {
            var kurenaiItem = new EquipmentItem
            {
                RequiredFaction = FactionType.Kurenai
            };

            Assert.IsTrue(kurenaiItem.CanEquip(FactionType.Kurenai));
            Assert.IsFalse(kurenaiItem.CanEquip(FactionType.Azure));
            Assert.IsFalse(kurenaiItem.CanEquip(FactionType.Neutral));
        }

        [Test]
        public void EquipmentItem_CanEquip_NeutralFaction()
        {
            var neutralItem = new EquipmentItem
            {
                RequiredFaction = FactionType.Neutral
            };

            Assert.IsTrue(neutralItem.CanEquip(FactionType.Kurenai));
            Assert.IsTrue(neutralItem.CanEquip(FactionType.Azure));
            Assert.IsTrue(neutralItem.CanEquip(FactionType.Neutral));
        }

        [Test]
        public void EquipmentItem_CanEquip_Combined()
        {
            var item = new EquipmentItem
            {
                RequiredLevel = 10,
                RequiredFaction = FactionType.Kurenai
            };

            Assert.IsFalse(item.CanEquip(5, FactionType.Kurenai)); // Level too low
            Assert.IsFalse(item.CanEquip(15, FactionType.Azure)); // Wrong faction
            Assert.IsFalse(item.CanEquip(5, FactionType.Azure)); // Both fail
            Assert.IsTrue(item.CanEquip(10, FactionType.Kurenai)); // Both pass
            Assert.IsTrue(item.CanEquip(20, FactionType.Kurenai)); // Both pass
        }

        #endregion

        #region EquipmentCategory Tests

        [Test]
        public void EquipmentCategory_WeaponTypes()
        {
            Assert.AreEqual((byte)10, (byte)EquipmentCategory.Sword);
            Assert.AreEqual((byte)11, (byte)EquipmentCategory.Katana);
            Assert.AreEqual((byte)12, (byte)EquipmentCategory.Staff);
            Assert.AreEqual((byte)13, (byte)EquipmentCategory.Gauntlet);
            Assert.AreEqual((byte)14, (byte)EquipmentCategory.Ranged);
        }

        [Test]
        public void EquipmentCategory_ArmorTypes()
        {
            Assert.AreEqual((byte)20, (byte)EquipmentCategory.LightArmor);
            Assert.AreEqual((byte)21, (byte)EquipmentCategory.MediumArmor);
            Assert.AreEqual((byte)22, (byte)EquipmentCategory.HeavyArmor);
            Assert.AreEqual((byte)23, (byte)EquipmentCategory.Uniform);
        }

        [Test]
        public void EquipmentCategory_AccessoryTypes()
        {
            Assert.AreEqual((byte)30, (byte)EquipmentCategory.Ring);
            Assert.AreEqual((byte)31, (byte)EquipmentCategory.Necklace);
            Assert.AreEqual((byte)32, (byte)EquipmentCategory.Badge);
        }

        [Test]
        public void EquipmentCategory_GadgetTypes()
        {
            Assert.AreEqual((byte)40, (byte)EquipmentCategory.Drone);
            Assert.AreEqual((byte)41, (byte)EquipmentCategory.Grenade);
            Assert.AreEqual((byte)42, (byte)EquipmentCategory.Booster);
            Assert.AreEqual((byte)43, (byte)EquipmentCategory.Shield);
        }

        #endregion

        #region EquipmentStatBonuses Tests

        [Test]
        public void EquipmentStatBonuses_Default()
        {
            var bonuses = EquipmentStatBonuses.Default;

            Assert.AreEqual(0, bonuses.Structure);
            Assert.AreEqual(0, bonuses.Ignition);
            Assert.AreEqual(0, bonuses.Logic);
            Assert.AreEqual(0, bonuses.Flow);
            Assert.IsFalse(bonuses.IsDirty);
        }

        [Test]
        public void EquipmentStatBonuses_AddBonuses()
        {
            var bonuses = EquipmentStatBonuses.Default;
            var item = new EquipmentItem
            {
                StatBonus_Structure = 10,
                StatBonus_Ignition = 5,
                StatBonus_Logic = 8,
                StatBonus_Flow = 3
            };

            bonuses.AddBonuses(item);

            Assert.AreEqual(10, bonuses.Structure);
            Assert.AreEqual(5, bonuses.Ignition);
            Assert.AreEqual(8, bonuses.Logic);
            Assert.AreEqual(3, bonuses.Flow);
        }

        [Test]
        public void EquipmentStatBonuses_AddMultipleItems()
        {
            var bonuses = EquipmentStatBonuses.Default;

            var weapon = new EquipmentItem { StatBonus_Ignition = 15 };
            var armor = new EquipmentItem { StatBonus_Structure = 20 };
            var accessory = new EquipmentItem { StatBonus_Flow = 10 };

            bonuses.AddBonuses(weapon);
            bonuses.AddBonuses(armor);
            bonuses.AddBonuses(accessory);

            Assert.AreEqual(20, bonuses.Structure);
            Assert.AreEqual(15, bonuses.Ignition);
            Assert.AreEqual(0, bonuses.Logic);
            Assert.AreEqual(10, bonuses.Flow);
        }

        [Test]
        public void EquipmentStatBonuses_Clear()
        {
            var bonuses = new EquipmentStatBonuses
            {
                Structure = 25,
                Ignition = 15,
                Logic = 10,
                Flow = 5
            };

            bonuses.Clear();

            Assert.AreEqual(0, bonuses.Structure);
            Assert.AreEqual(0, bonuses.Ignition);
            Assert.AreEqual(0, bonuses.Logic);
            Assert.AreEqual(0, bonuses.Flow);
        }

        [Test]
        public void EquipmentStatBonuses_DirtyFlag()
        {
            var bonuses = EquipmentStatBonuses.Default;
            Assert.IsFalse(bonuses.IsDirty);

            bonuses.IsDirty = true;
            Assert.IsTrue(bonuses.IsDirty);

            bonuses.IsDirty = false;
            Assert.IsFalse(bonuses.IsDirty);
        }

        #endregion

        #region EquipmentValidationResult Tests

        [Test]
        public void EquipmentValidationResult_AllResultsExist()
        {
            Assert.AreEqual((byte)0, (byte)EquipmentValidationResult.Success);
            Assert.AreEqual((byte)1, (byte)EquipmentValidationResult.LevelTooLow);
            Assert.AreEqual((byte)2, (byte)EquipmentValidationResult.WrongFaction);
            Assert.AreEqual((byte)3, (byte)EquipmentValidationResult.SlotMismatch);
            Assert.AreEqual((byte)4, (byte)EquipmentValidationResult.ItemNotFound);
            Assert.AreEqual((byte)5, (byte)EquipmentValidationResult.SlotOccupied);
        }

        #endregion

        #region EquipRequest Tests

        [Test]
        public void EquipRequest_Properties()
        {
            var request = new EquipRequest
            {
                ItemEntity = Unity.Entities.Entity.Null,
                TargetSlot = EquipmentSlot.Weapon,
                ForceEquip = false
            };

            Assert.AreEqual(EquipmentSlot.Weapon, request.TargetSlot);
            Assert.IsFalse(request.ForceEquip);
        }

        [Test]
        public void EquipRequest_ForceEquip()
        {
            var request = new EquipRequest
            {
                TargetSlot = EquipmentSlot.Armor,
                ForceEquip = true
            };

            Assert.IsTrue(request.ForceEquip);
        }

        #endregion

        #region UnequipRequest Tests

        [Test]
        public void UnequipRequest_Properties()
        {
            var request = new UnequipRequest
            {
                Slot = EquipmentSlot.Accessory1,
                DropItem = false
            };

            Assert.AreEqual(EquipmentSlot.Accessory1, request.Slot);
            Assert.IsFalse(request.DropItem);
        }

        [Test]
        public void UnequipRequest_DropItem()
        {
            var request = new UnequipRequest
            {
                Slot = EquipmentSlot.Weapon,
                DropItem = true
            };

            Assert.IsTrue(request.DropItem);
        }

        #endregion

        #region EquipmentChangedEvent Tests

        [Test]
        public void EquipmentChangedEvent_Equip()
        {
            var evt = new EquipmentChangedEvent
            {
                Slot = EquipmentSlot.Weapon,
                PreviousItemId = 0,
                NewItemId = 1001,
                WasEquipped = true
            };

            Assert.AreEqual(EquipmentSlot.Weapon, evt.Slot);
            Assert.AreEqual(0, evt.PreviousItemId);
            Assert.AreEqual(1001, evt.NewItemId);
            Assert.IsTrue(evt.WasEquipped);
        }

        [Test]
        public void EquipmentChangedEvent_Unequip()
        {
            var evt = new EquipmentChangedEvent
            {
                Slot = EquipmentSlot.Armor,
                PreviousItemId = 2001,
                NewItemId = 0,
                WasEquipped = false
            };

            Assert.AreEqual(2001, evt.PreviousItemId);
            Assert.AreEqual(0, evt.NewItemId);
            Assert.IsFalse(evt.WasEquipped);
        }

        [Test]
        public void EquipmentChangedEvent_Replace()
        {
            var evt = new EquipmentChangedEvent
            {
                Slot = EquipmentSlot.Weapon,
                PreviousItemId = 1001,
                NewItemId = 1002,
                WasEquipped = true
            };

            Assert.AreEqual(1001, evt.PreviousItemId);
            Assert.AreEqual(1002, evt.NewItemId);
            Assert.IsTrue(evt.WasEquipped);
        }

        #endregion

        #region Equip Validation Logic Tests

        [Test]
        public void Validation_SlotMismatch()
        {
            var item = new EquipmentItem { Slot = EquipmentSlot.Weapon };
            var targetSlot = EquipmentSlot.Armor;

            bool slotMatches = item.Slot == targetSlot;

            Assert.IsFalse(slotMatches);
        }

        [Test]
        public void Validation_SlotMatch()
        {
            var item = new EquipmentItem { Slot = EquipmentSlot.Weapon };
            var targetSlot = EquipmentSlot.Weapon;

            bool slotMatches = item.Slot == targetSlot;

            Assert.IsTrue(slotMatches);
        }

        [Test]
        public void Validation_SlotOccupied_NoForce()
        {
            var equipment = new Equipment { WeaponId = 1001 };
            bool forceEquip = false;

            bool slotOccupied = equipment.IsSlotOccupied(EquipmentSlot.Weapon);
            bool canEquip = !slotOccupied || forceEquip;

            Assert.IsFalse(canEquip);
        }

        [Test]
        public void Validation_SlotOccupied_WithForce()
        {
            var equipment = new Equipment { WeaponId = 1001 };
            bool forceEquip = true;

            bool slotOccupied = equipment.IsSlotOccupied(EquipmentSlot.Weapon);
            bool canEquip = !slotOccupied || forceEquip;

            Assert.IsTrue(canEquip);
        }

        #endregion

        #region Stat Bonus Calculation Tests

        [Test]
        public void StatBonus_FullLoadout()
        {
            var bonuses = EquipmentStatBonuses.Default;

            var weapon = new EquipmentItem
            {
                StatBonus_Ignition = 20,
                StatBonus_Flow = 5
            };

            var armor = new EquipmentItem
            {
                StatBonus_Structure = 30,
                StatBonus_Flow = 5
            };

            var accessory1 = new EquipmentItem
            {
                StatBonus_Logic = 10
            };

            var accessory2 = new EquipmentItem
            {
                StatBonus_Flow = 15
            };

            var gadget = new EquipmentItem
            {
                StatBonus_Structure = 5,
                StatBonus_Ignition = 5,
                StatBonus_Logic = 5,
                StatBonus_Flow = 5
            };

            bonuses.AddBonuses(weapon);
            bonuses.AddBonuses(armor);
            bonuses.AddBonuses(accessory1);
            bonuses.AddBonuses(accessory2);
            bonuses.AddBonuses(gadget);

            Assert.AreEqual(35, bonuses.Structure); // 30 + 5
            Assert.AreEqual(25, bonuses.Ignition);  // 20 + 5
            Assert.AreEqual(15, bonuses.Logic);     // 10 + 5
            Assert.AreEqual(30, bonuses.Flow);      // 5 + 5 + 15 + 5
        }

        [Test]
        public void StatBonus_NegativeBonuses()
        {
            var bonuses = EquipmentStatBonuses.Default;

            // Item with tradeoffs
            var heavyArmor = new EquipmentItem
            {
                StatBonus_Structure = 50,
                StatBonus_Flow = -10 // Penalty to speed
            };

            bonuses.AddBonuses(heavyArmor);

            Assert.AreEqual(50, bonuses.Structure);
            Assert.AreEqual(-10, bonuses.Flow);
        }

        #endregion

        #region EquipmentSlotElement Tests

        [Test]
        public void EquipmentSlotElement_Empty()
        {
            var element = EquipmentSlotElement.Empty(EquipmentSlot.Weapon);

            Assert.AreEqual(EquipmentSlot.Weapon, element.Slot);
            Assert.AreEqual(Unity.Entities.Entity.Null, element.EquippedItem);
        }

        #endregion
    }
}
