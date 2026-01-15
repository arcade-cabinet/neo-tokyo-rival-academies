import { GoogleGenerativeAI } from '@google/generative-ai';
import { MicroDialogue, StoryBeat } from '../types/schemas';

export class MicroWriter {
  private model: any;

  constructor(apiKey: string) {
    const genAI = new GoogleGenerativeAI(apiKey);
    this.model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash-exp', 
      generationConfig: { responseMimeType: "application/json" } 
    });
  }

  async writeDialogue(beat: StoryBeat): Promise<MicroDialogue[]> {
    // Only process Dialogue beats
    if (beat.type !== 'Dialogue') return [];

    console.log(`MicroWriter: Scripting beat ${beat.id}...`);
    
    const prompt = `
      You are the MICRO WRITER.
      SCENE: ${beat.description}.
      CHARACTERS: Kai (Rebel, Hot-headed), Vera (Academic, Cold/Logical).
      
      TASK: Write a branching dialogue sequence.
      STYLE: Cyberpunk Anime, snappy, high-stakes.
      
      OUTPUT: List of MicroDialogue objects.
    `;

    const result = await this.model.generateContent(prompt);
    return JSON.parse(result.response.text()) as MicroDialogue[];
  }
}
