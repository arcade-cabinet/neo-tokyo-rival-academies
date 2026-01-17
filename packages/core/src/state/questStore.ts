import { create } from 'zustand';
import type { Quest, QuestCluster } from '../systems/QuestGenerator';

interface QuestState {
  clusters: Map<string, QuestCluster>;
  activeQuests: Map<string, Quest>;
  completedQuests: Set<string>;

  // Actions
  addCluster: (cluster: QuestCluster) => void;
  activateQuest: (questId: string) => void;
  completeQuest: (questId: string) => void;
  getQuest: (questId: string) => Quest | undefined;
  getActiveQuests: () => Quest[];
  getCompletedQuests: () => string[];
  isQuestCompleted: (questId: string) => boolean;
  isQuestActive: (questId: string) => boolean;
  reset: () => void;
}

export const useQuestStore = create<QuestState>((set, get) => ({
  clusters: new Map(),
  activeQuests: new Map(),
  completedQuests: new Set(),

  addCluster: (cluster: QuestCluster) => {
    const { clusters } = get();
    const newClusters = new Map(clusters);
    newClusters.set(cluster.districtId, cluster);
    set({ clusters: newClusters });
  },

  activateQuest: (questId: string) => {
    const { clusters, activeQuests, completedQuests } = get();

    // Don't activate if already completed
    if (completedQuests.has(questId)) {
      console.warn(`Quest ${questId} is already completed`);
      return;
    }

    // Find the quest in clusters
    let foundQuest: Quest | undefined;

    for (const cluster of clusters.values()) {
      if (cluster.main.id === questId) {
        foundQuest = cluster.main;
        break;
      }

      for (const side of cluster.sides) {
        if (side.id === questId) {
          foundQuest = side;
          break;
        }
      }

      if (cluster.secret.id === questId) {
        foundQuest = cluster.secret;
        break;
      }

      if (foundQuest) break;
    }

    if (!foundQuest) {
      console.warn(`Quest ${questId} not found in any cluster`);
      return;
    }

    // Add to active quests
    const newActiveQuests = new Map(activeQuests);
    newActiveQuests.set(questId, foundQuest);
    set({ activeQuests: newActiveQuests });
  },

  completeQuest: (questId: string) => {
    const { activeQuests, completedQuests } = get();

    // Remove from active quests
    const newActiveQuests = new Map(activeQuests);
    newActiveQuests.delete(questId);

    // Add to completed quests
    const newCompletedQuests = new Set(completedQuests);
    newCompletedQuests.add(questId);

    set({
      activeQuests: newActiveQuests,
      completedQuests: newCompletedQuests,
    });
  },

  getQuest: (questId: string) => {
    const { clusters } = get();

    for (const cluster of clusters.values()) {
      if (cluster.main.id === questId) return cluster.main;

      for (const side of cluster.sides) {
        if (side.id === questId) return side;
      }

      if (cluster.secret.id === questId) return cluster.secret;
    }

    return undefined;
  },

  getActiveQuests: () => {
    return Array.from(get().activeQuests.values());
  },

  getCompletedQuests: () => {
    return Array.from(get().completedQuests);
  },

  isQuestCompleted: (questId: string) => {
    return get().completedQuests.has(questId);
  },

  isQuestActive: (questId: string) => {
    return get().activeQuests.has(questId);
  },

  reset: () => {
    set({
      clusters: new Map(),
      activeQuests: new Map(),
      completedQuests: new Set(),
    });
  },
}));
