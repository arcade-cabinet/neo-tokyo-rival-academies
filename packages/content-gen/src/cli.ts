import { Command } from 'commander';
import { generateFullStory } from './game/generators/story';
import { generateAssets } from './ui/generators/assets';

const program = new Command();

async function runGenerator(name: string, generator: () => Promise<void>): Promise<void> {
  console.log(`Running ${name}...`);
  try {
    await generator();
  } catch (error) {
    console.error(`${name} failed:`, error);
    process.exit(1);
  }
}

program
  .name('content-gen')
  .description('CLI for Neo-Tokyo Content Generation')
  .version('0.1.0');

program.command('story')
  .description('Generate narrative content (A/B/C stories)')
  .action(() => runGenerator('Story Generation', generateFullStory));

program.command('assets')
  .description('Generate UI assets (Icons, Splash)')
  .action(() => runGenerator('Asset Generation', generateAssets));

program.command('all')
  .description('Generate all content')
  .action(async () => {
    await runGenerator('Story Generation', generateFullStory);
    await runGenerator('Asset Generation', generateAssets);
  });

program.parse();
