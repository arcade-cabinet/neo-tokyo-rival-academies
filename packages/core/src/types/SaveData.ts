/**
 * Save data schema for Neo-Tokyo: Rival Academies
 * As per docs/PERSISTENCE.md and ROADMAP_1.0.md
 */

import type { RPGStats } from './entity';

export interface InventoryItem {
  id: string;
  name: string;
  type: 'weapon' | 'accessory' | 'consumable' | 'key_item';
  quantity: number;
  equipped?: boolean;
}

export interface ActiveQuest {
  id: string;
  progress?: number;
  startedAt: number;
}

export interface SaveData {
  // Metadata
  version: string;
  timestamp: number;
  slotNumber: number; // 0 = auto-save, 1-3 = manual slots

  // World state
  seed: string;
  act: number;
  currentDistrictId: string;

  // Alignment & Reputation
  kurenaiRep: number;
  azureRep: number;
  alignment: number; // Derived but saved for consistency

  // Player progression
  level: number;
  xp: number;
  stats: RPGStats;

  // Inventory
  inventory: InventoryItem[];
  credits: number;

  // Quest progress
  completedQuests: string[];
  activeQuests: ActiveQuest[];

  // Unlocks
  unlocks: {
    districts: string[];
    abilities: string[];
    items: string[];
  };

  // Playtime
  playtimeMinutes: number;

  // Ending flag (for NG+)
  endingFlag?: 'azure' | 'kurenai' | 'neutral';
}

export interface SaveSlot {
  slotNumber: number;
  data: SaveData | null;
  lastSaved: number | null;
}

/**
 * Default save data factory
 */
export function createDefaultSaveData(
  seed: string,
  slotNumber: number,
): SaveData {
  return {
    version: '1.0.0',
    timestamp: Date.now(),
    slotNumber,

    seed,
    act: 1,
    currentDistrictId: 'district_0', // Academy Gate Slums

    kurenaiRep: 50,
    azureRep: 50,
    alignment: 0.0,

    level: 1,
    xp: 0,
    stats: {
      structure: 10,
      ignition: 10,
      logic: 10,
      flow: 10,
    },

    inventory: [],
    credits: 1000,

    completedQuests: [],
    activeQuests: [],

    unlocks: {
      districts: ['district_0'],
      abilities: [],
      items: [],
    },

    playtimeMinutes: 0,
  };
}

/**
 * Validate save data structure
 */
export function validateSaveData(data: unknown): data is SaveData {
  if (typeof data !== 'object' || data === null) return false;

  const save = data as Partial<SaveData>;

  // Check required fields
  return (
    typeof save.version === 'string' &&
    typeof save.timestamp === 'number' &&
    typeof save.slotNumber === 'number' &&
    typeof save.seed === 'string' &&
    typeof save.act === 'number' &&
    typeof save.level === 'number' &&
    typeof save.xp === 'number' &&
    save.stats !== undefined &&
    Array.isArray(save.inventory) &&
    Array.isArray(save.completedQuests) &&
    Array.isArray(save.activeQuests)
  );
}
