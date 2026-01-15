export interface MacroStory {
  title: string;
  theme: string;
  total_playtime_estimate: string;
  acts: ActStructure[];
  world_atlas: Region[];
}

export interface ActStructure {
  id: string;
  title: string;
  description: string;
  chapters: string[]; // IDs of chapters
}

export interface Region {
  id: string;
  name: string;
  verticality: 'Low' | 'Medium' | 'High'; // For 3D exploration
  theme: string;
  key_locations: string[];
}

export interface MesoChapter {
  id: string;
  act_id: string;
  title: string;
  region_id: string;
  estimated_duration_minutes: number;
  story_beats: StoryBeat[];
  quests: QuestOutline[];
}

export interface StoryBeat {
  id: string;
  description: string;
  type: 'Combat' | 'Dialogue' | 'Exploration' | 'Puzzle';
  required_assets: string[];
}

export interface QuestOutline {
  id: string;
  title: string;
  giver: string;
  objectives: string[];
  rewards: string[];
}

export interface MicroDialogue {
  id: string;
  speaker: string;
  text: string;
  emotion?: string;
  animation?: string; // For 3D characters
  next?: string | null;
  choices?: { text: string; next: string }[];
}
