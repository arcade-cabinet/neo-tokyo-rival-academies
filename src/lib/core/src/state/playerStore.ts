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
  useConsumable: (itemId: string) => {
    applied: boolean;
    message: string;
    xpGained?: number;
    creditsGained?: number;
  };
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

const EQUIPMENT_BONUSES: Record<string, Partial<RPGStats>> = {
  'redline-piston': { ignition: 2 },
  'null-set': { logic: 2 },
  'salvage-vest': { structure: 2 },
  'water-filter-core': { structure: 1, logic: 1 },
  'salvagers-rope': { flow: 2 },
};

const CONSUMABLE_EFFECTS: Record<string, { xp?: number; credits?: number; message: string }> = {
  'storm-adrenaline': { xp: 25, message: 'Adrenaline surges (+25 XP)' },
};

function applyEquipmentBonuses(base: RPGStats, inventory: InventoryItem[]): RPGStats {
  const bonus: RPGStats = {
    structure: 0,
    ignition: 0,
    logic: 0,
    flow: 0,
  };

  for (const item of inventory) {
    if (!item.equipped) continue;
    const itemBonus =
      EQUIPMENT_BONUSES[item.id] ||
      (item.type === 'weapon'
        ? { ignition: 1 }
        : item.type === 'accessory'
          ? { structure: 1 }
          : {});
    bonus.structure += itemBonus.structure ?? 0;
    bonus.ignition += itemBonus.ignition ?? 0;
    bonus.logic += itemBonus.logic ?? 0;
    bonus.flow += itemBonus.flow ?? 0;
  }

  return {
    structure: base.structure + bonus.structure,
    ignition: base.ignition + bonus.ignition,
    logic: base.logic + bonus.logic,
    flow: base.flow + bonus.flow,
  };
}

function resolveStats(level: number, inventory: InventoryItem[]): RPGStats {
  return applyEquipmentBonuses(getBaseStatsForLevel(level), inventory);
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
    const newStats = resolveStats(newLevel, get().inventory);

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
        i.id === item.id ? { ...i, quantity: i.quantity + quantity } : i
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
        i.id === itemId ? { ...i, quantity: i.quantity - quantity } : i
      );
      set({ inventory: newInventory });
    }

    return true;
  },

  getItem: (itemId: string) => {
    return get().inventory.find((i) => i.id === itemId);
  },

  equipItem: (itemId: string) => {
    const { inventory, level } = get();
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

    set({ inventory: newInventory, stats: resolveStats(level, newInventory) });
  },

  unequipItem: (itemId: string) => {
    const { inventory, level } = get();
    const newInventory = inventory.map((i) => (i.id === itemId ? { ...i, equipped: false } : i));
    set({ inventory: newInventory, stats: resolveStats(level, newInventory) });
  },

  useConsumable: (itemId: string) => {
    const { inventory } = get();
    const item = inventory.find((i) => i.id === itemId);
    if (!item || item.type !== 'consumable') {
      return { applied: false, message: 'Item not usable.' };
    }

    const effect = CONSUMABLE_EFFECTS[item.id] || {
      message: `${item.name} used.`,
    };

    let xpGained: number | undefined;
    let creditsGained: number | undefined;
    if (effect.xp) {
      get().addXP(effect.xp);
      xpGained = effect.xp;
    }
    if (effect.credits) {
      get().addCredits(effect.credits);
      creditsGained = effect.credits;
    }

    get().removeItem(item.id, 1);
    return {
      applied: true,
      message: effect.message,
      xpGained,
      creditsGained,
    };
  },

  calculateStats: () => {
    const { level, inventory } = get();
    return resolveStats(level, inventory);
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
