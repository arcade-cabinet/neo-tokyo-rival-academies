import { Command } from 'commander';
import { ModelerAgent } from './agents/ModelerAgent';
import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';

dotenv.config();

const program = new Command();

// Assets root - all content lives here in organized subdirectories
const ASSETS_ROOT = path.resolve(process.cwd(), '../../packages/game/public/assets');

program
  .name('content-gen')
  .description('Idempotent, declarative content generation bound to directory structure')
  .version('0.1.0');

program
  .command('generate [path]')
  .description(`
Generate assets for a path relative to assets root.
Each asset directory must contain a manifest.json.

Examples:
  pnpm generate                     # Process all assets
  pnpm generate characters          # All characters
  pnpm generate characters/main     # All main characters
  pnpm generate characters/main/kai # Just Kai
  pnpm generate backgrounds/sector0 # Backgrounds for sector 0
`)
  .action(async (targetPath?: string) => {
    const meshyKey = process.env.MESHY_API_KEY;

    if (!meshyKey) {
      console.error('Error: MESHY_API_KEY not set in .env');
      process.exit(1);
    }

    const fullPath = targetPath
      ? path.join(ASSETS_ROOT, targetPath)
      : ASSETS_ROOT;

    if (!fs.existsSync(fullPath)) {
      console.error(`Path not found: ${fullPath}`);
      console.error(`\nCreate the directory structure and add manifest.json files.`);
      console.error(`Assets root: ${ASSETS_ROOT}`);
      process.exit(1);
    }

    console.log(`\n=== Content Generation ===`);
    console.log(`Target: ${fullPath}`);
    console.log(`Assets Root: ${ASSETS_ROOT}\n`);

    const modeler = new ModelerAgent(meshyKey);

    try {
      await modeler.processPath(fullPath);
      console.log('\n=== Generation Complete ===');
    } catch (error) {
      console.error('\nGeneration failed:', error);
      process.exit(1);
    }
  });

program
  .command('init <path>')
  .description('Initialize a new asset directory with template manifest.json')
  .option('-t, --type <type>', 'Asset type (character, background, prop, environment)', 'character')
  .option('-n, --name <name>', 'Display name')
  .action((targetPath: string, options: { type: string; name?: string }) => {
    const fullPath = path.join(ASSETS_ROOT, targetPath);
    const id = path.basename(targetPath);
    const name = options.name ?? id.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

    if (fs.existsSync(path.join(fullPath, 'manifest.json'))) {
      console.error(`manifest.json already exists in ${fullPath}`);
      process.exit(1);
    }

    fs.mkdirSync(fullPath, { recursive: true });

    const manifest = {
      id,
      name,
      type: options.type,
      description: `TODO: Add description for ${name}`,
      visualPrompt: `TODO: Add visual prompt for ${name}`,
      ...(options.type === 'character' ? {
        riggingConfig: { heightMeters: 1.7 },
        animationConfig: {
          animations: ['IDLE_COMBAT', 'RUN_IN_PLACE', 'ATTACK_MELEE_1', 'HIT_REACTION', 'DEATH']
        }
      } : {}),
      tasks: {}
    };

    fs.writeFileSync(
      path.join(fullPath, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );

    console.log(`Created: ${path.join(fullPath, 'manifest.json')}`);
    console.log(`\nEdit the manifest.json to configure the asset, then run:`);
    console.log(`  pnpm generate ${targetPath}`);
  });

program
  .command('status [path]')
  .description('Show generation status for assets')
  .action((targetPath?: string) => {
    const fullPath = targetPath
      ? path.join(ASSETS_ROOT, targetPath)
      : ASSETS_ROOT;

    if (!fs.existsSync(fullPath)) {
      console.error(`Path not found: ${fullPath}`);
      process.exit(1);
    }

    console.log(`\n=== Asset Status ===\n`);
    printStatus(fullPath, '');
  });

function printStatus(dir: string, indent: string) {
  const manifestPath = path.join(dir, 'manifest.json');

  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const tasks = manifest.tasks ?? {};

    const status = (task: any) => {
      if (!task) return '⬜ pending';
      if (task.status === 'SUCCEEDED') return '✅ done';
      if (task.status === 'FAILED') return '❌ failed';
      if (task.status === 'IN_PROGRESS') return '🔄 running';
      return '⬜ pending';
    };

    console.log(`${indent}📁 ${manifest.name} (${manifest.type})`);
    console.log(`${indent}   concept: ${status(tasks.conceptArt)}`);

    if (manifest.type === 'character') {
      console.log(`${indent}   model:   ${status(tasks.model3d)}`);
      console.log(`${indent}   rigging: ${status(tasks.rigging)}`);

      const anims = tasks.animations ?? [];
      const done = anims.filter((a: any) => a.status === 'SUCCEEDED').length;
      const total = manifest.animationConfig?.animations?.length ?? 5;
      console.log(`${indent}   anims:   ${done}/${total}`);
    }
    console.log();
    return;
  }

  // Recurse
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && !entry.name.startsWith('.')) {
      printStatus(path.join(dir, entry.name), indent);
    }
  }
}

program.parse();
