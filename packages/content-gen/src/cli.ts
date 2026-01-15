import { Command } from 'commander';
import { generateFullStory } from './game/generators/story';
import * as assetsModule from './ui/generators/file-assets';
import { migrateContent } from './utils/migration';
import { ModelerAgent } from './agents/ModelerAgent';
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
  .description('Generate a fully rigged and animated 3D character')
  .argument('<name>', 'Name of the character (e.g., "hero_kai")')
  .argument('<prompt>', 'Visual description prompt')
  .option('-s, --style <style>', 'Art style', 'cartoon')
  .action(async (name, prompt, options) => {
      const apiKey = process.env.MESHY_API_KEY;
      if (!apiKey) {
          console.error("Error: MESHY_API_KEY is not set in .env");
          process.exit(1);
      }

      // Output to public/models/generated
      const outputDir = path.resolve(process.cwd(), '../../packages/game/public/models/generated');
      const fs = await import('node:fs');
      if (!fs.existsSync(outputDir)) {
          fs.mkdirSync(outputDir, { recursive: true });
      }

      const agent = new ModelerAgent(apiKey);
      try {
          const result = await agent.generateCharacter(name, prompt, outputDir, options.style);
          console.log("Character Generation Complete!");
          console.log(JSON.stringify(result, null, 2));
      } catch (e) {
          console.error("Character Generation Failed:", e);
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
