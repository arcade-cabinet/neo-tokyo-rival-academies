import { GoogleGenerativeAI } from '@google/generative-ai';
import type { MacroStory } from '../types/schemas';

const SYSTEM_PROMPT = `
You are the MACRO ARCHITECT for "Neo-Tokyo: Rival Academies".
GOAL: Design a comprehensive 3-HOUR Action JRPG Narrative Structure.

THEMES: Cyberpunk, Academic Rivalry, Transhumanism, Glitch Horror.
STRUCTURE:
- 3 Acts (Setup, Confrontation, Resolution)
- ~15-20 minutes per "Chapter" (total 9-12 chapters)
- Horizontal Exploration: Neo-Tokyo Districts (Shibuya, Akihabara, Slums)
- Vertical Exploration: Street Level -> Rooftops -> Cloud Spire

OUTPUT: Strictly typed JSON matching the MacroStory interface.
`;

export class MacroArchitect {
  private model: any;

  constructor(apiKey: string) {
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      generationConfig: { responseMimeType: 'application/json' },
    });
  }

  async designStory(): Promise<MacroStory> {
    console.log('MacroArchitect: Designing 3-Hour Narrative Arc...');
    const prompt = `
      Create a full 3-hour game structure.
      Act 1: The Rivalry (Kai vs Vera).
      Act 2: The Glitch (Reality breaks).
      Act 3: The Ascension (Climbing the Spire).
      
      Define 3 distinct vertical regions.
      Break down into exactly 9 Chapters (3 per Act).

      RETURN EXACTLY THIS JSON STRUCTURE:
      {
        "title": "Neo-Tokyo...",
        "theme": "Cyberpunk...",
        "total_playtime_estimate": "3 hours",
        "acts": [
          { "id": "act_1", "title": "...", "description": "...", "chapters": ["ch_1", "ch_2", "ch_3"] }
        ],
        "world_atlas": [
          { "id": "region_1", "name": "...", "verticality": "Low", "theme": "...", "key_locations": ["..."] }
        ]
      }
    `;

    const result = await this.model.generateContent(SYSTEM_PROMPT + prompt);
    const response = result.response;
    const text = response.text();
    console.log('Macro Raw Response:', `${text.substring(0, 200)}...`);
    try {
      return JSON.parse(text) as MacroStory;
    } catch (e) {
      console.error('JSON Parse Error. Raw Text:', text);
      throw e;
    }
  }
}
