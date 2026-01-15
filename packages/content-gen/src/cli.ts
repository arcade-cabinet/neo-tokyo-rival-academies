import { Command } from 'commander';
import { generateFullStory } from './game/generators/story';
import * as assetsModule from './ui/generators/assets';
import { migrateContent } from './utils/migration';

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
