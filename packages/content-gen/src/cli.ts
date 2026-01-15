import { Command } from 'commander';
import { generateFullStory } from './game/generators/story';
import * as assetsModule from './ui/generators/file-assets';
import { migrateContent } from './utils/migration';
import { ModelerAgent } from './agents/ModelerAgent';
import { ArtDirectorAgent } from './agents/ArtDirectorAgent';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config();

const generateAssets = (assetsModule as any).generateAssets ?? (assetsModule as any).default;

const program = new Command();

program.name('content-gen').description('CLI for Neo-Tokyo Content Generation').version('0.1.0');

program
  .command('story')
  .description('Generate narrative content (A/B/C stories)')
  .action(async () => {
    try {
      await generateFullStory();
      console.log('Story generation complete.');
    } catch (error) {
      console.error('Story generation failed:', error);
      process.exit(1);
    }
  });

program
  .command('assets')
  .description('Generate UI assets (Icons, Splash)')
  .action(async () => {
    try {
      await generateAssets();
      console.log('Asset generation complete.');
    } catch (error) {
      console.error('Asset generation failed:', error);
      process.exit(1);
    }
  });

program
  .command('character')
  .description('Generate a fully rigged and animated 3D character from Image Concept')
  .argument('<name>', 'Name of the character (e.g., "hero_kai")')
  .argument('<prompt>', 'Visual description prompt')
  .option('-s, --style <style>', 'Art style', 'cartoon')
  .action(async (name, prompt, options) => {
      const meshyKey = process.env.MESHY_API_KEY;
      const googleKey = process.env.GOOGLE_GENAI_API_KEY;

      if (!meshyKey) {
          console.error("Error: MESHY_API_KEY is not set in .env");
          process.exit(1);
      }
      if (!googleKey) {
          console.error("Error: GOOGLE_GENAI_API_KEY is not set in .env");
          process.exit(1);
      }

      // Output dirs
      const baseDir = path.resolve(process.cwd(), '../../packages/game/public');
      const modelsDir = path.join(baseDir, 'models/generated');
      const conceptsDir = path.join(baseDir, 'assets/concepts');

      const fs = await import('node:fs');
      if (!fs.existsSync(modelsDir)) fs.mkdirSync(modelsDir, { recursive: true });
      if (!fs.existsSync(conceptsDir)) fs.mkdirSync(conceptsDir, { recursive: true });

      const artDirector = new ArtDirectorAgent(googleKey);
      const modeler = new ModelerAgent(meshyKey);

      try {
          // 1. Generate Concept Art
          console.log("=== Step 1: Generating Concept Art (Imagen) ===");
          const conceptPath = await artDirector.generateConceptArt(name, prompt, conceptsDir);
          
          // 2. Generate 3D Model from Image
          console.log("=== Step 2: Generating 3D Model & Animation (Meshy) ===");
          const result = await modeler.generateCharacterFromImage(name, conceptPath, modelsDir);
          
          console.log("=== Character Generation Complete! ===");
          console.log(JSON.stringify(result, null, 2));
      } catch (e) {
          console.error("CRITICAL FAILURE in Character Generation Pipeline:", e);
          process.exit(1);
      }
  });

program
  .command('migrate')
  .description('Decompose monolithic JSON into granular files')
  .action(async () => {
    try {
      await migrateContent();
    } catch (error) {
      console.error('Migration failed:', error);
      process.exit(1);
    }
  });

program
  .command('all')
  .description('Generate all content')
  .action(async () => {
    try {
      console.log('Starting full generation pipeline...');
      await generateFullStory();
      await generateAssets();
      console.log('All content generated successfully.');
    } catch (error) {
      console.error('Generation pipeline failed:', error);
      process.exit(1);
    }
  });

program.parse();