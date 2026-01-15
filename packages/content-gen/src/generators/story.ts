import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

// Define schemas for generation
const STORY_PROMPT = `
Generate a JSON object for a Cyberpunk JRPG story.
Structure:
{
  "dialogues": {
    "dialogue_id": [ { "id": "node_id", "speaker": "Name", "text": "Content", "next": "next_node_id" } ]
  },
  "quests": [
    { "id": "quest_id", "title": "Title", "description": "Desc", "objectives": ["obj1"] }
  ]
}
Context: A rivalry between two academies in Neo-Tokyo. A-Story: The Race. B-Story: Glitch in simulation. C-Story: Alien Invasion.
`;

export async function generateStory() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('Skipping Generation: GEMINI_API_KEY not found.');
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  console.log('Generating Story Content...');
  const result = await model.generateContent(STORY_PROMPT);
  const response = await result.response;
  const text = response.text();

  // Parse and Save (Mock implementation of saving)
  // In a real scenario, we'd validate JSON and write to packages/game/src/data/story.json
  const outputPath = path.resolve(__dirname, '../../../../packages/game/src/data/story_gen.json');

  // Clean markdown code blocks if present
  const jsonStr = text.replace(/```json/g, '').replace(/```/g, '');

  try {
      // Validate
      JSON.parse(jsonStr);
      fs.writeFileSync(outputPath, jsonStr);
      console.log(`Story written to ${outputPath}`);
  } catch (e) {
      console.error('Failed to parse generated story JSON', e);
  }
}
