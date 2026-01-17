import type { SaveData, SaveSlot } from '@neo-tokyo/core';
import { createDefaultSaveData, validateSaveData } from '@neo-tokyo/core';
import {
  usePlayerStore,
  useAlignmentStore,
  useQuestStore,
  useWorldStore,
} from '@neo-tokyo/core';

const STORAGE_PREFIX = 'neo_tokyo_save_';
const AUTO_SAVE_SLOT = 0;
const MAX_MANUAL_SLOTS = 3;

/**
 * SaveSystem
 * Handles save/load operations using localStorage
 * Supports 1 auto-save slot (0) and 3 manual slots (1-3)
 */
export const SaveSystem = {
  /**
   * Get all save slots
   */
  getAllSlots(): SaveSlot[] {
    const slots: SaveSlot[] = [];

    for (let i = 0; i <= MAX_MANUAL_SLOTS; i++) {
      const slot = this.getSlot(i);
      slots.push(slot);
    }

    return slots;
  },

  /**
   * Get a specific save slot
   */
  getSlot(slotNumber: number): SaveSlot {
    if (typeof window === 'undefined') {
      return { slotNumber, data: null, lastSaved: null };
    }

    const key = `${STORAGE_PREFIX}${slotNumber}`;
    const raw = localStorage.getItem(key);

    if (!raw) {
      return { slotNumber, data: null, lastSaved: null };
    }

    try {
      const data = JSON.parse(raw);
      if (validateSaveData(data)) {
        return {
          slotNumber,
          data,
          lastSaved: data.timestamp,
        };
      }
    } catch (error) {
      console.error(`Failed to load save slot ${slotNumber}:`, error);
    }

    return { slotNumber, data: null, lastSaved: null };
  },

  /**
   * Save current game state to a slot
   */
  save(slotNumber: number): boolean {
    if (typeof window === 'undefined') return false;

    const playerStore = usePlayerStore.getState();
    const alignmentStore = useAlignmentStore.getState();
    const questStore = useQuestStore.getState();
    const worldStore = useWorldStore.getState();

    const currentDistrict = worldStore.currentDistrictId || 'district_0';
    const seed = worldStore.masterSeed || 'default-seed';

    const saveData: SaveData = {
      version: '1.0.0',
      timestamp: Date.now(),
      slotNumber,

      seed,
      act: 1, // TODO: Track act progression
      currentDistrictId: currentDistrict,

      kurenaiRep: alignmentStore.kurenaiRep,
      azureRep: alignmentStore.azureRep,
      alignment: alignmentStore.alignment,

      level: playerStore.level,
      xp: playerStore.xp,
      stats: { ...playerStore.stats },

      inventory: playerStore.inventory.map((item) => ({ ...item })),
      credits: playerStore.credits,

      completedQuests: questStore.getCompletedQuests(),
      activeQuests: Array.from(questStore.activeQuests.values()).map((quest) => ({
        id: quest.id,
        startedAt: Date.now(), // TODO: Track actual start time
      })),

      unlocks: {
        districts: [currentDistrict],
        abilities: [],
        items: [],
      },

      playtimeMinutes: 0, // TODO: Track playtime
    };

    try {
      const key = `${STORAGE_PREFIX}${slotNumber}`;
      localStorage.setItem(key, JSON.stringify(saveData));
      console.log(`Game saved to slot ${slotNumber}:`, saveData);
      return true;
    } catch (error) {
      console.error(`Failed to save to slot ${slotNumber}:`, error);
      return false;
    }
  },

  /**
   * Load game state from a slot
   */
  load(slotNumber: number): boolean {
    const slot = this.getSlot(slotNumber);

    if (!slot.data) {
      console.warn(`No save data in slot ${slotNumber}`);
      return false;
    }

    try {
      const playerStore = usePlayerStore.getState();
      const alignmentStore = useAlignmentStore.getState();
      const questStore = useQuestStore.getState();
      const worldStore = useWorldStore.getState();

      // Restore player state
      playerStore.reset();
      playerStore.addXP(slot.data.xp); // Will auto-level
      playerStore.addCredits(slot.data.credits - 1000); // Subtract initial credits

      // Restore inventory
      for (const item of slot.data.inventory) {
        playerStore.addItem(item, item.quantity);
        if (item.equipped) {
          playerStore.equipItem(item.id);
        }
      }

      // Restore alignment
      alignmentStore.setKurenaiRep(slot.data.kurenaiRep);
      alignmentStore.setAzureRep(slot.data.azureRep);

      // Restore world state
      worldStore.initialize(slot.data.seed);
      // TODO: Load districts and set current district

      // Restore quests
      questStore.reset();
      // TODO: Restore quest clusters and active quests

      console.log(`Game loaded from slot ${slotNumber}`);
      return true;
    } catch (error) {
      console.error(`Failed to load from slot ${slotNumber}:`, error);
      return false;
    }
  },

  /**
   * Auto-save current game state
   */
  autoSave(): boolean {
    return this.save(AUTO_SAVE_SLOT);
  },

  /**
   * Delete a save slot
   */
  deleteSave(slotNumber: number): boolean {
    if (typeof window === 'undefined') return false;

    try {
      const key = `${STORAGE_PREFIX}${slotNumber}`;
      localStorage.removeItem(key);
      console.log(`Deleted save slot ${slotNumber}`);
      return true;
    } catch (error) {
      console.error(`Failed to delete slot ${slotNumber}:`, error);
      return false;
    }
  },

  /**
   * Clear all saves
   */
  clearAll(): void {
    for (let i = 0; i <= MAX_MANUAL_SLOTS; i++) {
      this.deleteSave(i);
    }
  },

  /**
   * Export save data as JSON string (for backup/transfer)
   */
  exportSave(slotNumber: number): string | null {
    const slot = this.getSlot(slotNumber);
    if (!slot.data) return null;
    return JSON.stringify(slot.data, null, 2);
  },

  /**
   * Import save data from JSON string
   */
  importSave(slotNumber: number, jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      if (!validateSaveData(data)) {
        console.error('Invalid save data format');
        return false;
      }

      const key = `${STORAGE_PREFIX}${slotNumber}`;
      localStorage.setItem(key, JSON.stringify(data));
      console.log(`Save imported to slot ${slotNumber}`);
      return true;
    } catch (error) {
      console.error('Failed to import save:', error);
      return false;
    }
  },
};

// Export convenience functions
export function autoSave(): void {
  SaveSystem.autoSave();
}

export function quickSave(): void {
  SaveSystem.save(1);
}

export function quickLoad(): void {
  SaveSystem.load(1);
}
