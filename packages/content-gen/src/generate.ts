import { generateStory } from './generators/story';

async function main() {
  await generateStory();
  // Future: generateAssets(), generateQuests()
}

main().catch(console.error);
