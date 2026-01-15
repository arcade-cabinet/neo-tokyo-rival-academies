import { GoogleGenerativeAI } from '@google/generative-ai';

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GEMINI_API_KEY not found');
    return;
  }
  const genAI = new GoogleGenerativeAI(apiKey);
  try {
    const models = await genAI.listModels();
    console.log("AVAILABLE MODELS:");
    const modelParams = models.models
        .filter(m => m.name.includes('gemini'))
        .map(m => ({
            name: m.name,
            version: m.version,
            displayName: m.displayName
        }));
    console.table(modelParams);
  } catch (error) {
    console.error("Error listing models:", error);
  }
}

main();
