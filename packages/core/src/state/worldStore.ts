import { create } from 'zustand';

export interface District {
  id: string;
  name: string;
  seed: string;
  stratum: 'upper' | 'mid' | 'lower';
  elevation: number;
  profile: DistrictProfile;
}

export interface DistrictProfile {
  name: string;
  theme: string;
  tileDistribution: Record<string, number>;
  enemyTypes: string[];
  landmarkCount: number;
  description: string;
}

interface WorldState {
  masterSeed: string;
  activeDistricts: Map<string, District>;
  currentDistrictId: string | null;
  initialized: boolean;

  // Actions
  initialize: (seed: string) => void;
  loadDistrict: (district: District) => void;
  unloadDistrict: (id: string) => void;
  setCurrentDistrict: (id: string) => void;
  getDistrict: (id: string) => District | undefined;
  reset: () => void;
}

export const useWorldStore = create<WorldState>((set, get) => ({
  masterSeed: '',
  activeDistricts: new Map(),
  currentDistrictId: null,
  initialized: false,

  initialize: (seed: string) => {
    set({
      masterSeed: seed,
      initialized: true,
      activeDistricts: new Map(),
      currentDistrictId: null,
    });
  },

  loadDistrict: (district: District) => {
    const { activeDistricts } = get();
    const newDistricts = new Map(activeDistricts);
    newDistricts.set(district.id, district);
    set({ activeDistricts: newDistricts });
  },

  unloadDistrict: (id: string) => {
    const { activeDistricts, currentDistrictId } = get();
    const newDistricts = new Map(activeDistricts);
    newDistricts.delete(id);
    set({
      activeDistricts: newDistricts,
      currentDistrictId: currentDistrictId === id ? null : currentDistrictId,
    });
  },

  setCurrentDistrict: (id: string) => {
    const { activeDistricts } = get();
    if (activeDistricts.has(id)) {
      set({ currentDistrictId: id });
    }
  },

  getDistrict: (id: string) => {
    return get().activeDistricts.get(id);
  },

  reset: () => {
    set({
      masterSeed: '',
      activeDistricts: new Map(),
      currentDistrictId: null,
      initialized: false,
    });
  },
}));
