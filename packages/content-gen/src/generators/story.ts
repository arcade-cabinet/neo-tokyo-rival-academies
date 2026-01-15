import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import { STORY_A_PROMPT, STORY_B_PROMPT, STORY_C_PROMPT } from '../prompts';

async function generateArc(model: any, prompt: string, arcName: string) {
  console.log(`Generating ${arcName}...`);
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    // Sanitize JSON
    text = text.replace(/```json/g, '').replace(/```/g, '');
    return JSON.parse(text);
  } catch (e) {
    console.error(`Failed to generate ${arcName}:`, e);
    return null;
  }
}

export async function generateFullStory() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('Skipping Story Generation: GEMINI_API_KEY not found.');
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash', generationConfig: { responseMimeType: "application/json" } });

  const [storyA, storyB, storyC] = await Promise.all([
    generateArc(model, STORY_A_PROMPT, 'A-Story'),
    generateArc(model, STORY_B_PROMPT, 'B-Story'),
    generateArc(model, STORY_C_PROMPT, 'C-Story'),
  ]);

  const mergedStory = {
    a_story: storyA,
    b_story: storyB,
    c_story: storyC,
    generated_at: new Date().toISOString()
  };

  const outputPath = path.resolve(__dirname, '../../../../packages/game/src/data/story_gen.json');
  fs.writeFileSync(outputPath, JSON.stringify(mergedStory, null, 2));
  console.log(`Full Story written to ${outputPath}`);
}
