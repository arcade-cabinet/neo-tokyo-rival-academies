import fs from 'node:fs/promises';
import path from 'node:path';

// import { GoogleGenerativeAI } from '@google/genai';

// Mock config if env var is missing
const API_KEY = process.env.GOOGLE_GENAI_API_KEY;

// Defined scenes from STORY.md
const SCENES = [
  {
    id: 'intro_01',
    title: 'The Start Line',
    context: 'A rain-slicked rooftop in Neo-Tokyo Sector 0. Thunder roars.',
    characters: [
      'Kai (Red/Gold, holding massive piston hammer)',
      'Vera (Blue/Silver, floating geometric lance)',
    ],
    action: 'Kai slams his weapon down, cracking the concrete. Vera hovers calmly.',
  },
  {
    id: 'intro_02',
    title: 'The Rivalry',
    context: 'Close up on faces.',
    characters: ['Kai', 'Vera'],
    action: 'Kai shouts excitedly. Vera looks disdainful.',
  },
  {
    id: 'boss_intro',
    title: 'The Ambush',
    context: 'Mid-air above a shattered bridge.',
    characters: ['Vera'],
    action: 'Vera drops from the sky, her weapon glowing with azure energy.',
  },
];

async function generateManifests() {
  console.log('Generating Story Manifests...');

  const manifest: Record<string, { prompt: string; description: string; imagePath: string }> = {};

  if (!API_KEY) {
    console.warn('GOOGLE_GENAI_API_KEY not found. Generating placeholder manifests.');

    for (const scene of SCENES) {
      manifest[scene.id] = {
        description: `Generated Description for ${scene.title}: ${scene.context}`,
        prompt: `Anime style, cel shaded, ${scene.context} ${scene.action} --ar 16:9 --style raw`,
        imagePath: `/assets/story/${scene.id}_placeholder.png`,
      };
    }
  } else {
    // Real generation logic would go here using the SDK
    // const genAI = new GoogleGenerativeAI(API_KEY);
    // ...
    console.log('API Key detected (Mock logic for safety in this env).');
  }

  // Write Manifest
  const outDir = path.join(process.cwd(), 'src/content/story');
  await fs.mkdir(outDir, { recursive: true });
  await fs.writeFile(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));

  console.log(`Manifest written to ${path.join(outDir, 'manifest.json')}`);
}

generateManifests().catch(console.error);
