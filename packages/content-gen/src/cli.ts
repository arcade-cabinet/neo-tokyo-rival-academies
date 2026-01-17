import { Command } from 'commander';
import path from 'path';
import { generateFullStory } from './game/generators/story';
import { generateAssets } from './ui/generators/assets';
import { PipelineExecutor } from './pipelines/pipeline-executor';

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

program
  .command('pipeline <pipelineName> <assetDir>')
  .description('Run a generation pipeline')
  .option('--step <stepId>', 'Run a specific step')
  .action(async (pipelineName, assetDir, options) => {
    // const apiKey = process.env.MESHY_API_KEY;
    // if (!apiKey) {
    //   console.error('MESHY_API_KEY environment variable not set.');
    //   process.exit(1);
    // }
    const apiKey = 'mock-api-key';
    const absoluteAssetDir = path.resolve(process.cwd(), assetDir);

    try {
      const executor = new PipelineExecutor(apiKey);
      await executor.execute(pipelineName, absoluteAssetDir, {
        step: options.step,
      });
    } catch (error) {
      console.error(`Pipeline execution failed:`, error);
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

program.parse();
