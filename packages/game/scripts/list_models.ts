import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
dotenv.config();

async function listModels() {
    const apiKey = process.env.GOOGLE_GENAI_API_KEY || process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API key found");
        return;
    }
    const client = new GoogleGenAI({ apiKey });
    try {
        const models = await client.models.list();
        console.log(JSON.stringify(models, null, 2));
    } catch (e) {
        console.error(e);
    }
}

listModels();