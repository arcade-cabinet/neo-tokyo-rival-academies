import fs from 'node:fs/promises';
import path from 'node:path';

// import { GoogleGenerativeAI } from '@google/genai';

// Mock config if env var is missing
const API_KEY = process.env.GOOGLE_GENAI_API_KEY;

// Defined scenes from STORY.md - Expanded for Full Narrative
const SCENES = [
  // --- ACT 1: SECTOR 7 ---
  {
    id: 'intro_01',
    title: 'The Start Line',
    context:
      'A rain-slicked rooftop in Neo-Tokyo Sector 0. Thunder roars. Neon signs reflect in puddles.',
    characters: [
      'Kai (Red/Gold, holding massive piston hammer, energetic)',
      'Vera (Blue/Silver, floating geometric lance, cold)',
    ],
    action:
      'Kai slams his weapon down, cracking the concrete with sparks flying. Vera hovers calmly, looking at a holographic display.',
  },
  {
    id: 'intro_02',
    title: 'The Rivalry',
    context: 'Cinematic close-up, split screen effect.',
    characters: ['Kai', 'Vera'],
    action:
      'Kai shouts excitedly with a fiery aura. Vera adjusts her glasses with a disdainful icy glare.',
  },

  // --- ACT 2: THE AMBUSH ---
  {
    id: 'boss_intro',
    title: 'The Ambush',
    context: 'Mid-air above a shattered bridge. Debris falling.',
    characters: ['Vera'],
    action:
      'Vera drops from the sky, her weapon glowing with azure energy, surrounded by drone swarms.',
  },
  {
    id: 'boss_mid',
    title: 'Calculated Destruction',
    context: 'The bridge is collapsing. Digital grids overlay the vision.',
    characters: ['Vera'],
    action: 'Vera unleashes a barrage of geometric lasers. Kai dodges narrowly.',
  },

  // --- ACT 3: THE ROOFTOPS ---
  {
    id: 'rooftop_chase',
    title: 'High Velocity',
    context: 'Running vertically up a skyscraper side. Motion blur.',
    characters: ['Kai'],
    action: 'Kai sprints up the side of a building, smashing a window to enter a shortcut.',
  },

  // --- ACT 4: THE SUMMIT ---
  {
    id: 'summit_view',
    title: 'The Orbital Elevator',
    context: 'Above the clouds. The massive space elevator structure pierces the sky.',
    characters: ['Kai', 'Vera'],
    action:
      'Both racers are side-by-side, exhausted but pushing limits. The "Data Core" glows at the top.',
  },
  {
    id: 'final_clash',
    title: 'Ignition vs Calculation',
    context: 'The peak of the tower. Storm clouds swirling below.',
    characters: ['Kai', 'Vera'],
    action:
      'Kai swings his hammer with maximum force. Vera parries with a focused energy shield. Shockwave ripples.',
  },

  // --- ACT 5: VICTORY ---
  {
    id: 'victory_kai',
    title: 'Ignition Victory',
    context: 'Kai holding the glowing Data Core triumphantly.',
    characters: ['Kai'],
    action:
      'Kai grins, thumbs up. Vera floats in the background, analyzing data on a screen, looking annoyed but impressed.',
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
