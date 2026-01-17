import { create } from 'zustand';
import type { RPGStats } from '../types/entity';
import type { InventoryItem } from '../types/SaveData';

interface PlayerState {
  // Progression
  level: number;
  xp: number;
  xpToNextLevel: number;

  // Stats
  stats: RPGStats;

  // Economy
  credits: number;
  inventory: InventoryItem[];

  // Actions
  addXP: (amount: number) => { leveledUp: boolean; newLevel: number };
  addCredits: (amount: number) => void;
  spendCredits: (amount: number) => boolean;
  addItem: (item: Omit<InventoryItem, 'quantity'>, quantity?: number) => void;
  removeItem: (itemId: string, quantity?: number) => boolean;
  getItem: (itemId: string) => InventoryItem | undefined;
  equipItem: (itemId: string) => void;
  unequipItem: (itemId: string) => void;
  calculateStats: () => RPGStats;
  reset: () => void;
}

// XP curve: Level N requires 100 * N XP
function getXPForLevel(level: number): number {
  return 100 * level;
}

// Base stats increase per level
function getBaseStatsForLevel(level: number): RPGStats {
  return {
    structure: 10 + (level - 1) * 2,
    ignition: 10 + (level - 1) * 2,
    logic: 10 + (level - 1) * 2,
    flow: 10 + (level - 1) * 2,
  };
}

export const usePlayerStore = create<PlayerState>((set, get) => ({
  level: 1,
  xp: 0,
  xpToNextLevel: 100,

  stats: {
    structure: 10,
    ignition: 10,
    logic: 10,
    flow: 10,
  },

  credits: 1000,
  inventory: [],

  addXP: (amount: number) => {
    const { level, xp, xpToNextLevel } = get();
    let newXP = xp + amount;
    let newLevel = level;
    let leveledUp = false;

    // Check for level ups
    while (newXP >= xpToNextLevel) {
      newXP -= xpToNextLevel;
      newLevel++;
      leveledUp = true;
    }

    const newXPToNextLevel = getXPForLevel(newLevel);
    const newStats = leveledUp ? getBaseStatsForLevel(newLevel) : get().stats;

    set({
      level: newLevel,
      xp: newXP,
      xpToNextLevel: newXPToNextLevel,
      stats: newStats,
    });

    return { leveledUp, newLevel };
  },

  addCredits: (amount: number) => {
    set((state) => ({ credits: state.credits + amount }));
  },

  spendCredits: (amount: number) => {
    const { credits } = get();
    if (credits < amount) {
      return false;
    }
    set({ credits: credits - amount });
    return true;
  },

  addItem: (item: Omit<InventoryItem, 'quantity'>, quantity = 1) => {
    const { inventory } = get();
    const existingItem = inventory.find((i) => i.id === item.id);

    if (existingItem) {
      // Stack items
      const newInventory = inventory.map((i) =>
        i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i,
      );
      set({ inventory: newInventory });
    } else {
      // Add new item
      const newInventory = [...inventory, { ...item, quantity }];
      set({ inventory: newInventory });
    }
  },

  removeItem: (itemId: string, quantity = 1) => {
    const { inventory } = get();
    const item = inventory.find((i) => i.id === itemId);

    if (!item || item.quantity < quantity) {
      return false;
    }

    if (item.quantity === quantity) {
      // Remove entirely
      const newInventory = inventory.filter((i) => i.id !== itemId);
      set({ inventory: newInventory });
    } else {
      // Reduce quantity
      const newInventory = inventory.map((i) =>
        i.id === itemId ? { ...i, quantity: i.quantity - quantity } : i,
      );
      set({ inventory: newInventory });
    }

    return true;
  },

  getItem: (itemId: string) => {
    return get().inventory.find((i) => i.id === itemId);
  },

  equipItem: (itemId: string) => {
    const { inventory } = get();
    const item = inventory.find((i) => i.id === itemId);

    if (!item || (item.type !== 'weapon' && item.type !== 'accessory')) {
      return;
    }

    // Unequip other items of same type
    const newInventory = inventory.map((i) => {
      if (i.id === itemId) {
        return { ...i, equipped: true };
      }
      if (i.type === item.type && i.equipped) {
        return { ...i, equipped: false };
      }
      return i;
    });

    set({ inventory: newInventory });
  },

  unequipItem: (itemId: string) => {
    const { inventory } = get();
    const newInventory = inventory.map((i) =>
      i.id === itemId ? { ...i, equipped: false } : i,
    );
    set({ inventory: newInventory });
  },

  calculateStats: () => {
    const { stats, inventory } = get();
    const baseStats = { ...stats };

    // Apply equipment bonuses
    const equippedItems = inventory.filter((i) => i.equipped);

    // TODO: Implement item stat bonuses
    // For now, just return base stats
    return baseStats;
  },

  reset: () => {
    set({
      level: 1,
      xp: 0,
      xpToNextLevel: 100,
      stats: {
        structure: 10,
        ignition: 10,
        logic: 10,
        flow: 10,
      },
      credits: 1000,
      inventory: [],
    });
  },
}));
