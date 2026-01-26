using Unity.Burst;
using Unity.Collections;
using Unity.Entities;
using NeoTokyo.Components.Equipment;
using NeoTokyo.Components.Faction;
using NeoTokyo.Components.Stats;

namespace NeoTokyo.Systems.Equipment
{
    /// <summary>
    /// Processes equipment equip/unequip requests and updates stat bonuses.
    /// Equivalent to TypeScript: EquipmentSystem.ts
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    public partial struct EquipmentSystem : ISystem
    {
        [BurstCompile]
        public void OnCreate(ref SystemState state)
        {
            state.RequireForUpdate<Components.Equipment.Equipment>();
            state.RequireForUpdate<EndSimulationEntityCommandBufferSystem.Singleton>();
        }

        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            var ecb = SystemAPI.GetSingleton<EndSimulationEntityCommandBufferSystem.Singleton>()
                .CreateCommandBuffer(state.WorldUnmanaged);

            // Process equip requests
            ProcessEquipRequests(ref state, ref ecb);

            // Process unequip requests
            ProcessUnequipRequests(ref state, ref ecb);

            // Recalculate stat bonuses for dirty entities
            RecalculateStatBonuses(ref state, ref ecb);
        }

        private void ProcessEquipRequests(ref SystemState state, ref EntityCommandBuffer ecb)
        {
            foreach (var (equipment, level, faction, equipRequests, statBonuses, entity) in
                SystemAPI.Query<RefRW<Components.Equipment.Equipment>, RefRO<LevelProgress>, RefRO<FactionMembership>,
                    DynamicBuffer<EquipRequest>, RefRW<EquipmentStatBonuses>>()
                    .WithEntityAccess())
            {
                if (equipRequests.Length == 0) continue;

                for (int i = 0; i < equipRequests.Length; i++)
                {
                    var request = equipRequests[i];

                    // Skip invalid item entities
                    if (request.ItemEntity == Entity.Null) continue;

                    // Get item data
                    if (!SystemAPI.HasComponent<EquipmentItem>(request.ItemEntity)) continue;

                    var item = SystemAPI.GetComponent<EquipmentItem>(request.ItemEntity);

                    // Validate slot match
                    if (item.Slot != request.TargetSlot) continue;

                    // Validate level requirement
                    if (!item.CanEquip(level.ValueRO.Level)) continue;

                    // Validate faction requirement
                    if (!item.CanEquip(faction.ValueRO.Value)) continue;

                    // Check if slot is occupied
                    int previousItemId = equipment.ValueRO.GetSlotItemId(request.TargetSlot);
                    bool slotOccupied = previousItemId != 0;

                    if (slotOccupied && !request.ForceEquip) continue;

                    // Update equipment slot
                    UpdateEquipmentSlot(ref equipment.ValueRW, request.TargetSlot, item.ItemId);

                    // Mark stat bonuses as dirty
                    statBonuses.ValueRW.IsDirty = true;

                    // Fire equipment changed event
                    ecb.AddComponent(entity, new EquipmentChangedEvent
                    {
                        Slot = request.TargetSlot,
                        PreviousItemId = previousItemId,
                        NewItemId = item.ItemId,
                        WasEquipped = true
                    });
                }

                equipRequests.Clear();
            }
        }

        private void ProcessUnequipRequests(ref SystemState state, ref EntityCommandBuffer ecb)
        {
            foreach (var (equipment, unequipRequests, statBonuses, entity) in
                SystemAPI.Query<RefRW<Components.Equipment.Equipment>,
                    DynamicBuffer<UnequipRequest>, RefRW<EquipmentStatBonuses>>()
                    .WithEntityAccess())
            {
                if (unequipRequests.Length == 0) continue;

                for (int i = 0; i < unequipRequests.Length; i++)
                {
                    var request = unequipRequests[i];

                    // Get current item in slot
                    int previousItemId = equipment.ValueRO.GetSlotItemId(request.Slot);

                    // Skip if slot is empty
                    if (previousItemId == 0) continue;

                    // Clear the equipment slot
                    UpdateEquipmentSlot(ref equipment.ValueRW, request.Slot, 0);

                    // Mark stat bonuses as dirty
                    statBonuses.ValueRW.IsDirty = true;

                    // Fire equipment changed event
                    ecb.AddComponent(entity, new EquipmentChangedEvent
                    {
                        Slot = request.Slot,
                        PreviousItemId = previousItemId,
                        NewItemId = 0,
                        WasEquipped = false
                    });

                    // TODO: Handle drop vs inventory return based on request.DropItem
                }

                unequipRequests.Clear();
            }
        }

        private void RecalculateStatBonuses(ref SystemState state, ref EntityCommandBuffer ecb)
        {
            // Get equipment database for item lookup
            var itemLookup = SystemAPI.GetComponentLookup<EquipmentItem>(true);

            foreach (var (equipment, statBonuses, entity) in
                SystemAPI.Query<RefRO<Components.Equipment.Equipment>, RefRW<EquipmentStatBonuses>>()
                    .WithEntityAccess())
            {
                if (!statBonuses.ValueRO.IsDirty) continue;

                // Reset bonuses
                statBonuses.ValueRW.Clear();

                // Accumulate bonuses from each slot
                AccumulateSlotBonus(ref statBonuses.ValueRW, equipment.ValueRO.WeaponId, ref state);
                AccumulateSlotBonus(ref statBonuses.ValueRW, equipment.ValueRO.ArmorId, ref state);
                AccumulateSlotBonus(ref statBonuses.ValueRW, equipment.ValueRO.Accessory1Id, ref state);
                AccumulateSlotBonus(ref statBonuses.ValueRW, equipment.ValueRO.Accessory2Id, ref state);
                AccumulateSlotBonus(ref statBonuses.ValueRW, equipment.ValueRO.GadgetId, ref state);

                statBonuses.ValueRW.IsDirty = false;
            }
        }

        private void AccumulateSlotBonus(ref EquipmentStatBonuses bonuses, int itemId, ref SystemState state)
        {
            if (itemId == 0) return;

            // Find entity with matching item ID
            foreach (var (item, entity) in SystemAPI.Query<RefRO<EquipmentItem>>().WithEntityAccess())
            {
                if (item.ValueRO.ItemId == itemId)
                {
                    bonuses.AddBonuses(item.ValueRO);
                    break;
                }
            }
        }

        private void UpdateEquipmentSlot(ref Components.Equipment.Equipment equipment, EquipmentSlot slot, int itemId)
        {
            switch (slot)
            {
                case EquipmentSlot.Weapon:
                    equipment.WeaponId = itemId;
                    break;
                case EquipmentSlot.Armor:
                    equipment.ArmorId = itemId;
                    break;
                case EquipmentSlot.Accessory1:
                    equipment.Accessory1Id = itemId;
                    break;
                case EquipmentSlot.Accessory2:
                    equipment.Accessory2Id = itemId;
                    break;
                case EquipmentSlot.Gadget:
                    equipment.GadgetId = itemId;
                    break;
            }
        }
    }

    /// <summary>
    /// Cleans up EquipmentChangedEvent components after they're processed.
    /// </summary>
    [UpdateInGroup(typeof(LateSimulationSystemGroup))]
    public partial struct EquipmentEventCleanupSystem : ISystem
    {
        public void OnCreate(ref SystemState state)
        {
            state.RequireForUpdate<EndSimulationEntityCommandBufferSystem.Singleton>();
        }

        public void OnUpdate(ref SystemState state)
        {
            var ecb = SystemAPI.GetSingleton<EndSimulationEntityCommandBufferSystem.Singleton>()
                .CreateCommandBuffer(state.WorldUnmanaged);

            foreach (var (_, entity) in SystemAPI.Query<EquipmentChangedEvent>().WithEntityAccess())
            {
                ecb.RemoveComponent<EquipmentChangedEvent>(entity);
            }
        }
    }

    /// <summary>
    /// Validates equipment requests before processing.
    /// Provides detailed validation results for UI feedback.
    /// </summary>
    public static class EquipmentValidator
    {
        /// <summary>
        /// Validate an equip request and return the result.
        /// </summary>
        public static EquipmentValidationResult ValidateEquipRequest(
            in EquipmentItem item,
            in LevelProgress level,
            in FactionMembership faction,
            in Components.Equipment.Equipment equipment,
            EquipmentSlot targetSlot,
            bool forceEquip)
        {
            // Check slot match
            if (item.Slot != targetSlot)
            {
                return EquipmentValidationResult.SlotMismatch;
            }

            // Check level requirement
            if (!item.CanEquip(level.Level))
            {
                return EquipmentValidationResult.LevelTooLow;
            }

            // Check faction requirement
            if (!item.CanEquip(faction.Value))
            {
                return EquipmentValidationResult.WrongFaction;
            }

            // Check slot occupation
            if (equipment.IsSlotOccupied(targetSlot) && !forceEquip)
            {
                return EquipmentValidationResult.SlotOccupied;
            }

            return EquipmentValidationResult.Success;
        }
    }

    /// <summary>
    /// Helper system to apply equipment stat bonuses to RPGStats.
    /// Updates final stats after equipment bonuses are calculated.
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateAfter(typeof(EquipmentSystem))]
    public partial struct EquipmentStatApplicationSystem : ISystem
    {
        [BurstCompile]
        public void OnCreate(ref SystemState state)
        {
            state.RequireForUpdate<EquipmentStatBonuses>();
        }

        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            // This system would apply equipment bonuses to derived stats
            // For now, consumers should read both RPGStats and EquipmentStatBonuses
            // and combine them for final stat calculations

            // Example usage in combat:
            // finalStructure = baseStats.Structure + equipBonuses.Structure;

            // Future: Could maintain a FinalStats component that combines all sources
        }
    }
}
