import { GoogleGenerativeAI } from '@google/generative-ai';
import { MesoChapter, Region } from '../types/schemas';

export class MesoDesigner {
  private model: any;

  constructor(apiKey: string) {
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp', 
      generationConfig: { responseMimeType: "application/json" } 
    });
  }

  async designChapter(chapterId: string, actContext: string, region: Region): Promise<MesoChapter> {
    console.log(`MesoDesigner: Detailing Chapter ${chapterId}...`);
    
    const prompt = `
      You are the MESO DESIGNER.
      CONTEXT: Act: ${actContext}, Region: ${region.name} (${region.verticality}).
      TASK: Design Chapter ${chapterId}.
      
      REQUIREMENTS:
      - Duration: ~20 minutes gameplay.
      - Mix of Combat, Platforming (Vertical), and Dialogue.
      - 1 Main Quest + 1 Side Quest.
      
      OUTPUT: JSON matching EXACTLY this structure:
      {
        "id": "${chapterId}",
        "act_id": "...",
        "title": "...",
        "region_id": "...",
        "estimated_duration_minutes": 20,
        "story_beats": [
          { "id": "beat_1", "description": "...", "type": "Combat", "required_assets": [] },
          { "id": "beat_2", "description": "...", "type": "Dialogue", "required_assets": [] }
        ],
        "quests": [
          { "id": "quest_1", "title": "...", "giver": "...", "objectives": ["..."], "rewards": ["..."] }
        ]
      }
    `;

    const result = await this.model.generateContent(prompt);
    return JSON.parse(result.response.text()) as MesoChapter;
  }
}
