import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY not found');
    return;
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  const models = await genAI.listModels();
  for (const model of models.models) {
    console.log(`${model.name} - ${model.supportedGenerationMethods}`);
  }
}

main().catch(console.error);
