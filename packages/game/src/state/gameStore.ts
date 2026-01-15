import { create } from 'zustand';

export interface Quest {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

export interface InventoryItem {
  id: string;
  name: string;
  count: number;
}

export interface GameStore {
  // Player Stats
  hp: number;
  maxHp: number;
  xp: number;
  level: number;

  // Quests
  activeQuest: Quest | null;
  questLog: Quest[];

  // Dialogue
  dialogueHistory: { speaker: string; text: string }[];
  currentDialogue: { speaker: string; text: string } | null;

  // Inventory
  inventory: InventoryItem[];

  // Actions
  setHp: (hp: number) => void;
  addXp: (amount: number) => void;
  startQuest: (quest: Quest) => void;
  completeQuest: (questId: string) => void;
  showDialogue: (speaker: string, text: string) => void;
  hideDialogue: () => void;
  addItem: (id: string, name: string) => void;
  onCombatText?: (message: string, color: string) => void;
}

export const useGameStore = create<GameStore>((set) => ({
  hp: 100,
  maxHp: 100,
  xp: 0,
  level: 1,

  activeQuest: null,
  questLog: [],

  dialogueHistory: [],
  currentDialogue: null,

  inventory: [],

  setHp: (hp) => set({ hp }),

  addXp: (amount) =>
    set((state) => {
      const newXp = state.xp + amount;
      // Simple level up logic
      const nextLevelXp = state.level * 1000;
      if (newXp >= nextLevelXp) {
        return {
          xp: newXp - nextLevelXp,
          level: state.level + 1,
          maxHp: state.maxHp + 20,
          hp: state.maxHp + 20,
        };
      }
      return { xp: newXp };
    }),

  // Fix race condition: use state callback
  startQuest: (quest) =>
    set((state) => ({
      activeQuest: quest,
      questLog: [...state.questLog, quest]
    })),

  completeQuest: (questId) =>
    set((state) => ({
      activeQuest: state.activeQuest?.id === questId ? null : state.activeQuest,
      questLog: state.questLog.map((q) => (q.id === questId ? { ...q, completed: true } : q)),
    })),

  showDialogue: (speaker, text) =>
    set((state) => ({
      currentDialogue: { speaker, text },
      dialogueHistory: [...state.dialogueHistory, { speaker, text }],
    })),

  hideDialogue: () => set({ currentDialogue: null }),

  addItem: (id, name) =>
    set((state) => {
      const existing = state.inventory.find((i) => i.id === id);
      if (existing) {
        return {
          inventory: state.inventory.map((i) => (i.id === id ? { ...i, count: i.count + 1 } : i)),
        };
      }
      return { inventory: [...state.inventory, { id, name, count: 1 }] };
    }),
}));
