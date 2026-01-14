export interface StageConfig {
  id: string;
  name: string;
  type: 'runner' | 'platformer' | 'boss';
  backgroundTheme: 'neon' | 'dark' | 'sunset';
  length: number; // For runner/platformer
  platforms: 'procedural' | 'fixed_sector7';
  nextStageId?: string;
  cutsceneId?: string; // If set, plays this cutscene manifest before starting
}

export const STAGES: Record<string, StageConfig> = {
  intro_cutscene: {
    id: 'intro_cutscene',
    name: 'Prologue',
    type: 'runner', // Dummy type
    backgroundTheme: 'dark',
    length: 0,
    platforms: 'procedural',
    cutsceneId: 'intro_01',
    nextStageId: 'sector7_streets',
  },
  sector7_streets: {
    id: 'sector7_streets',
    name: 'Sector 7: Streets',
    type: 'platformer',
    backgroundTheme: 'neon',
    length: 500,
    platforms: 'procedural',
    nextStageId: 'boss_ambush',
  },
  boss_ambush: {
    id: 'boss_ambush',
    name: 'The Ambush',
    type: 'boss',
    backgroundTheme: 'dark',
    length: 100, // Arena width
    platforms: 'fixed_sector7',
    cutsceneId: 'boss_intro',
    nextStageId: 'rooftop_chase',
  },
};
