import { GoogleGenAI } from '@google/genai';
import fs from 'node:fs/promises';
import path from 'node:path';

const MODEL_NAME = 'imagen-3.0-generate-001'; // Fallback to stable if 4.0 is preview/unavailable
// Note: User mentioned "imagen 4" was used. I'll try to use the one from the script if possible, 
// but 'imagen-3.0-generate-001' is the current standard GA in many regions. 
// I will allow override.

export class ArtDirectorAgent {
  private client: GoogleGenAI;
  private modelName: string;

  constructor(apiKey: string, modelName = 'imagen-3.0-generate-001') {
    this.client = new GoogleGenAI({ apiKey });
    this.modelName = modelName;
  }

  async generateConceptArt(name: string, description: string, outputDir: string) {
    console.log(`[ArtDirector] Generating Concept Art for: ${name}`);
    const prompt = `Full body character design of ${description}, anime style, front view, T-pose or A-pose, neutral lighting, isolated on solid white background, high contrast, detailed, 8k, cel shaded, neo-tokyo cyberpunk aesthetic. --style raw`;
    
    return this.generateImage(name, prompt, outputDir, '9:16');
  }

  async generateBackground(name: string, description: string, outputDir: string) {
    console.log(`[ArtDirector] Generating Background: ${name}`);
    const prompt = `Anime background art, ${description}, neo-tokyo cyberpunk city, highly detailed, atmospheric, wide angle, 8k, cel shaded, no characters. --style raw`;
    
    return this.generateImage(name, prompt, outputDir, '16:9');
  }

  async generateImage(name: string, prompt: string, outputDir: string, aspectRatio: '1:1' | '16:9' | '9:16' = '16:9') {
    const fileName = `${name}.png`;
    const filePath = path.join(outputDir, fileName);

    // Idempotency check
    try {
        await fs.access(filePath);
        console.log(`[ArtDirector] Image exists: ${filePath}`);
        return filePath;
    } catch {
        // Continue
    }

    console.log(`[ArtDirector] Prompting ${this.modelName}...`);
    try {
        const response = await this.client.models.generateImages({
            model: this.modelName,
            prompt: prompt,
            config: {
                numberOfImages: 1,
                aspectRatio: aspectRatio,
                safetyFilterLevel: 'block_low_and_above',
                personGeneration: 'allow_adult',
            } as any,
        });

        const imgData = response.generatedImages?.[0]?.image?.imageBytes;
        if (imgData) {
            const buffer = Buffer.from(imgData, 'base64');
            await fs.mkdir(outputDir, { recursive: true });
            await fs.writeFile(filePath, buffer);
            console.log(`[ArtDirector] Saved: ${filePath}`);
            return filePath;
        } else {
            throw new Error('No image data returned.');
        }
    } catch (error) {
        console.error(`[ArtDirector] Failed to generate ${name}:`, error);
        throw error;
    }
  }
}
