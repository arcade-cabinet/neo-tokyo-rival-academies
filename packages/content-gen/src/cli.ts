import { Command } from 'commander';
import { generateFullStory } from './game/generators/story';
import { generateAssets } from './ui/generators/assets';

const program = new Command();

program.name('content-gen').description('CLI for Neo-Tokyo Content Generation').version('0.1.0');

program
  .command('story')
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

program
  .command('assets')
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
  .command('all')
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
