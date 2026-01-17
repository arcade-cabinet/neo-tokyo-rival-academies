import { Command } from 'commander';
import { generateFullStory } from './game/generators/story';
import { generateAssets } from './ui/generators/assets';

const program = new Command();

program
  .name('content-gen')
  .description('CLI for Neo-Tokyo Content Generation')
  .version('0.1.0');

program.command('story')
  .description('Generate narrative content (A/B/C stories)')
  .action(async () => {
    console.log('Running Story Generation...');
    try {
      await generateFullStory();
    } catch (error) {
      console.error('Story generation failed:', error);
      process.exit(1);
    }
  });

program.command('assets')
  .description('Generate UI assets (Icons, Splash)')
  .action(async () => {
    console.log('Running Asset Generation...');
    try {
      await generateAssets();
    } catch (error) {
      console.error('Asset generation failed:', error);
      process.exit(1);
    }
  });

program.command('all')
  .description('Generate all content')
  .action(async () => {
    console.log('Running Story Generation...');
    try {
      await generateFullStory();
    } catch (error) {
      console.error('Story generation failed:', error);
      process.exit(1);
    }

    console.log('Running Asset Generation...');
    try {
      await generateAssets();
    } catch (error) {
      console.error('Asset generation failed:', error);
      process.exit(1);
    }
  });

import { MeshyClient } from './api/meshy-client.js';
import { PipelineExecutor } from './pipelines/pipeline-executor.js';

program
  .command('pipeline <assetPath>')
  .description('Run a generation pipeline for a specific asset')
  .action(async (assetPath: string) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY; // Using GEMINI_API_KEY as per docs
      if (!apiKey) {
        console.error('❌ Error: GEMINI_API_KEY environment variable not set.');
        process.exit(1);
      }

      const client = new MeshyClient({ apiKey });
      const executor = new PipelineExecutor(client, assetPath);
      await executor.run();
    } catch (error) {
      console.error(`\n❌ Pipeline execution failed:`, error);
      process.exit(1);
    }
  });

program.parse();
