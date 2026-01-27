import type { SaveData, SaveSlot } from '@neo-tokyo/core';
import {
  useAlignmentStore,
  usePlayerStore,
  useQuestStore,
  useWorldStore,
  validateSaveData,
} from '@neo-tokyo/core';

const STORAGE_PREFIX = 'neo_tokyo_save_';
const AUTO_SAVE_SLOT = 0;
const MAX_MANUAL_SLOTS = 3;

export const SaveSystem = {
  getAllSlots(): SaveSlot[] {
    const slots: SaveSlot[] = [];
    for (let i = 0; i <= MAX_MANUAL_SLOTS; i++) {
      slots.push(this.getSlot(i));
    }
    return slots;
  },

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
        return { slotNumber, data, lastSaved: data.timestamp };
      }
    } catch (error) {
      console.error(`Failed to load save slot ${slotNumber}:`, error);
    }

    return { slotNumber, data: null, lastSaved: null };
  },

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
      act: 1,
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
        startedAt: Date.now(),
      })),
      unlocks: {
        districts: [currentDistrict],
        abilities: [],
        items: [],
      },
      playtimeMinutes: 0,
    };

    try {
      const key = `${STORAGE_PREFIX}${slotNumber}`;
      localStorage.setItem(key, JSON.stringify(saveData));
      return true;
    } catch (error) {
      console.error(`Failed to save to slot ${slotNumber}:`, error);
      return false;
    }
  },

  load(slotNumber: number): boolean {
    const slot = this.getSlot(slotNumber);

    if (!slot.data) {
      return false;
    }

    try {
      const playerStore = usePlayerStore.getState();
      const alignmentStore = useAlignmentStore.getState();
      const questStore = useQuestStore.getState();
      const worldStore = useWorldStore.getState();

      playerStore.reset();
      playerStore.addXP(slot.data.xp);
      playerStore.addCredits(slot.data.credits - 1000);

      for (const item of slot.data.inventory) {
        playerStore.addItem(item, item.quantity);
        if (item.equipped) {
          playerStore.equipItem(item.id);
        }
      }

      alignmentStore.setKurenaiRep(slot.data.kurenaiRep);
      alignmentStore.setAzureRep(slot.data.azureRep);

      worldStore.initialize(slot.data.seed);

      questStore.reset();

      return true;
    } catch (error) {
      console.error(`Failed to load from slot ${slotNumber}:`, error);
      return false;
    }
  },

  autoSave(): boolean {
    return this.save(AUTO_SAVE_SLOT);
  },

  deleteSave(slotNumber: number): boolean {
    if (typeof window === 'undefined') return false;

    try {
      const key = `${STORAGE_PREFIX}${slotNumber}`;
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error(`Failed to delete slot ${slotNumber}:`, error);
      return false;
    }
  },

  clearAll(): void {
    for (let i = 0; i <= MAX_MANUAL_SLOTS; i++) {
      this.deleteSave(i);
    }
  },

  exportSave(slotNumber: number): string | null {
    const slot = this.getSlot(slotNumber);
    if (!slot.data) return null;
    return JSON.stringify(slot.data, null, 2);
  },

  importSave(slotNumber: number, jsonData: string): boolean {
    try {
      const data = JSON.parse(jsonData);
      if (!validateSaveData(data)) {
        return false;
      }

      const key = `${STORAGE_PREFIX}${slotNumber}`;
      localStorage.setItem(key, JSON.stringify(data));
      return true;
    } catch (error) {
      console.error('Failed to import save:', error);
      return false;
    }
  },
};

export function autoSave(): void {
  SaveSystem.autoSave();
}

export function quickSave(): void {
  SaveSystem.save(1);
}

export function quickLoad(): void {
  SaveSystem.load(1);
}
