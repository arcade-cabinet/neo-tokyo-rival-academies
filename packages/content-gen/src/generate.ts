import { generateFullStory } from './generators/story';

async function main() {
  console.log('Starting GenAI Content Generation...');
  await generateFullStory();
  // Future: generateQuests(), generateAssets()
  console.log('Generation Complete.');
}

main().catch(console.error);
