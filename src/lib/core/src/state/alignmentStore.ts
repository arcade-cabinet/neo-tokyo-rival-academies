import { create } from 'zustand';

/**
 * Alignment state management
 * As per docs/ALIGNMENT_SYSTEM.md
 *
 * Alignment Scale: -1.0 (Kurenai/Passion) to +1.0 (Azure/Logic)
 * Reputation: Kurenai 0-100, Azure 0-100 (dual meters)
 * Alignment derived from: (azureRep - kurenaiRep) / 100
 */

export interface AlignmentState {
  // Dual reputation meters (0-100)
  kurenaiRep: number;
  azureRep: number;

  // Derived alignment scale (-1.0 to +1.0)
  alignment: number;

  // Actions
  shiftAlignment: (delta: number) => void;
  addKurenaiRep: (amount: number) => void;
  addAzureRep: (amount: number) => void;
  setKurenaiRep: (value: number) => void;
  setAzureRep: (value: number) => void;
  getAlignmentLabel: () => string;
  getStatBonuses: () => {
    structure: number;
    ignition: number;
    logic: number;
    flow: number;
  };
  isThresholdMet: (threshold: number) => boolean;
  reset: () => void;
}

export const useAlignmentStore = create<AlignmentState>((set, get) => ({
  kurenaiRep: 50,
  azureRep: 50,
  alignment: 0.0,

  shiftAlignment: (delta: number) => {
    const { kurenaiRep, azureRep } = get();

    // Apply shift to appropriate reputation meter
    if (delta < 0) {
      // Shift toward Kurenai (negative)
      const newKurenaiRep = Math.min(100, Math.max(0, kurenaiRep + Math.abs(delta)));
      const newAlignment = (azureRep - newKurenaiRep) / 100;
      set({
        kurenaiRep: newKurenaiRep,
        alignment: Math.max(-1.0, Math.min(1.0, newAlignment)),
      });
    } else if (delta > 0) {
      // Shift toward Azure (positive)
      const newAzureRep = Math.min(100, Math.max(0, azureRep + delta));
      const newAlignment = (newAzureRep - kurenaiRep) / 100;
      set({
        azureRep: newAzureRep,
        alignment: Math.max(-1.0, Math.min(1.0, newAlignment)),
      });
    }
  },

  addKurenaiRep: (amount: number) => {
    const { azureRep } = get();
    const newKurenaiRep = Math.min(100, Math.max(0, get().kurenaiRep + amount));
    const newAlignment = (azureRep - newKurenaiRep) / 100;
    set({
      kurenaiRep: newKurenaiRep,
      alignment: Math.max(-1.0, Math.min(1.0, newAlignment)),
    });
  },

  addAzureRep: (amount: number) => {
    const { kurenaiRep } = get();
    const newAzureRep = Math.min(100, Math.max(0, get().azureRep + amount));
    const newAlignment = (newAzureRep - kurenaiRep) / 100;
    set({
      azureRep: newAzureRep,
      alignment: Math.max(-1.0, Math.min(1.0, newAlignment)),
    });
  },

  setKurenaiRep: (value: number) => {
    const { azureRep } = get();
    const newKurenaiRep = Math.min(100, Math.max(0, value));
    const newAlignment = (azureRep - newKurenaiRep) / 100;
    set({
      kurenaiRep: newKurenaiRep,
      alignment: Math.max(-1.0, Math.min(1.0, newAlignment)),
    });
  },

  setAzureRep: (value: number) => {
    const { kurenaiRep } = get();
    const newAzureRep = Math.min(100, Math.max(0, value));
    const newAlignment = (newAzureRep - kurenaiRep) / 100;
    set({
      azureRep: newAzureRep,
      alignment: Math.max(-1.0, Math.min(1.0, newAlignment)),
    });
  },

  getAlignmentLabel: () => {
    const { alignment } = get();
    if (alignment > 0.8) return 'Azure Devotee';
    if (alignment > 0.6) return 'Azure Leaning';
    if (alignment > 0.2) return 'Slightly Azure';
    if (alignment > -0.2) return 'Neutral';
    if (alignment > -0.6) return 'Slightly Kurenai';
    if (alignment > -0.8) return 'Kurenai Leaning';
    return 'Kurenai Devotee';
  },

  getStatBonuses: () => {
    const { alignment } = get();
    const bonuses = { structure: 0, ignition: 0, logic: 0, flow: 0 };

    // Kurenai lean (< -0.6): +10% Ignition, +10% Flow
    if (alignment < -0.6) {
      bonuses.ignition = 0.1;
      bonuses.flow = 0.1;
    }

    // Azure lean (> 0.6): +10% Structure, +10% Logic
    if (alignment > 0.6) {
      bonuses.structure = 0.1;
      bonuses.logic = 0.1;
    }

    return bonuses;
  },

  isThresholdMet: (threshold: number) => {
    const { alignment } = get();
    return Math.abs(alignment) >= Math.abs(threshold);
  },

  reset: () => {
    set({
      kurenaiRep: 50,
      azureRep: 50,
      alignment: 0.0,
    });
  },
}));
