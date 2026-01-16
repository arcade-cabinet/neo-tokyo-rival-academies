/**
 * Content Generation CLI
 *
 * Idempotent, declarative content generation bound to directory structure.
 * Uses JSON-defined pipelines to orchestrate asset generation.
 */

import { Command } from 'commander';
import path from 'node:path';
import fs from 'node:fs';
import dotenv from 'dotenv';
import { parse as parseHtml } from 'node-html-parser';
import { PipelineExecutor } from './pipelines/pipeline-executor';
import { AssetManifestSchema } from './types/manifest';
import { taskRegistry, ANIMATION_IDS } from './tasks/registry';

// Load .env from repo root if running from there, or from content-gen if running locally
const repoRoot = findRepoRoot();
dotenv.config({ path: path.join(repoRoot, '.env') });

const program = new Command();

// __dirname for ESM
const __filename = new URL(import.meta.url).pathname;
const __dirname = path.dirname(__filename);

// Assets root - resolved relative to this source file, not cwd
// Path: src/ -> content-gen/ -> packages/ -> packages/game/public/assets
const ASSETS_ROOT = path.resolve(__dirname, '../../game/public/assets');

/**
 * Find the repository root by looking for package.json with workspaces or pnpm-workspace.yaml
 */
function findRepoRoot(): string {
  let dir = process.cwd();
  while (dir !== path.dirname(dir)) {
    if (fs.existsSync(path.join(dir, 'pnpm-workspace.yaml'))) {
      return dir;
    }
    dir = path.dirname(dir);
  }
  return process.cwd();
}

// Asset type to pipeline mapping
const PIPELINE_MAP: Record<string, string> = {
  character: 'character',
  tile: 'tile',  // Will use tile.pipeline.json when created
  background: 'background',
  prop: 'prop',
  environment: 'environment',
};

program
  .name('content-gen')
  .description('Idempotent, declarative content generation bound to directory structure')
  .version('0.2.0');

// ============================================================================
// GENERATE COMMAND
// ============================================================================

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

Steps (use --step to run individually):
  - preview   : Text-to-3D geometry generation
  - refine    : Texturing and PBR map generation
  - rigging   : Skeletal setup (characters only)
  - animations: Animation generation (characters only)
`)
  .option('-s, --step <step>', 'Run only a specific step (preview, refine, rigging, animations)')
  .action(async (targetPath?: string, options?: { step?: string }) => {
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

    console.log(`\n╔═══════════════════════════════════════════════════════════════╗`);
    console.log(`║                    Content Generation                         ║`);
    console.log(`╚═══════════════════════════════════════════════════════════════╝`);
    console.log(`  Target: ${fullPath}`);
    if (options?.step) {
      console.log(`  Step: ${options.step}`);
    }
    console.log();

    const executor = new PipelineExecutor(meshyKey);

    try {
      await processPath(fullPath, executor, options?.step);
      console.log('\n✅ Generation complete');
    } catch (error) {
      console.error('\n❌ Generation failed:', error);
      process.exit(1);
    }
  });

// ============================================================================
// INIT COMMAND
// ============================================================================

program
  .command('init <path>')
  .description('Initialize a new asset directory with template manifest.json')
  .option('-t, --type <type>', 'Asset type (character, background, prop, environment, tile)', 'character')
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

    const manifest: Record<string, unknown> = {
      id,
      name,
      type: options.type,
      description: `TODO: Add description for ${name}`,
    };

    // Add type-specific task configs
    if (options.type === 'character') {
      manifest.textTo3DPreviewTask = {
        prompt: `TODO: Add detailed prompt for ${name}`,
        artStyle: 'realistic',
        aiModel: 'latest',
        topology: 'quad',
        targetPolycount: 50000,
        shouldRemesh: true,
        symmetryMode: 'auto',
        poseMode: 'a-pose',
        moderation: false,
      };
      manifest.textTo3DRefineTask = {
        enablePbr: true,
        texturePrompt: `TODO: Add texture prompt for ${name}`,
        aiModel: 'latest',
        moderation: false,
      };
      manifest.riggingTask = { heightMeters: 1.7 };
      manifest.animationTask = {
        animations: ['IDLE_COMBAT', 'RUN_IN_PLACE', 'ATTACK_MELEE_1', 'HIT_REACTION', 'DEATH'],
      };
    } else if (options.type === 'tile') {
      manifest.textTo3DPreviewTask = {
        prompt: `TODO: Add detailed prompt for ${name}`,
        artStyle: 'realistic',
        aiModel: 'latest',
        topology: 'quad',
        targetPolycount: 10000,
        shouldRemesh: true,
        symmetryMode: 'off',
        poseMode: '',
        moderation: false,
      };
      manifest.textTo3DRefineTask = {
        enablePbr: true,
        texturePrompt: `TODO: Add texture prompt for ${name}`,
        aiModel: 'latest',
        moderation: false,
      };
    }

    manifest.tasks = {};

    fs.writeFileSync(
      path.join(fullPath, 'manifest.json'),
      JSON.stringify(manifest, null, 2)
    );

    console.log(`Created: ${path.join(fullPath, 'manifest.json')}`);
    console.log(`\nEdit the manifest.json to configure the asset, then run:`);
    console.log(`  pnpm generate ${targetPath}`);
  });

// ============================================================================
// STATUS COMMAND
// ============================================================================

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

    console.log(`\n╔═══════════════════════════════════════════════════════════════╗`);
    console.log(`║                      Asset Status                             ║`);
    console.log(`╚═══════════════════════════════════════════════════════════════╝\n`);
    printStatus(fullPath, '');
  });

// ============================================================================
// PIPELINES COMMAND
// ============================================================================

program
  .command('pipelines')
  .description('List available pipeline definitions')
  .action(() => {
    console.log(`\n╔═══════════════════════════════════════════════════════════════╗`);
    console.log(`║                  Available Pipelines                          ║`);
    console.log(`╚═══════════════════════════════════════════════════════════════╝\n`);

    const defsDir = path.join(__dirname, 'pipelines/definitions');
    if (!fs.existsSync(defsDir)) {
      console.log('  No pipeline definitions found.');
      return;
    }

    const files = fs.readdirSync(defsDir).filter(f => f.endsWith('.pipeline.json'));

    for (const file of files) {
      const content = JSON.parse(fs.readFileSync(path.join(defsDir, file), 'utf-8'));
      console.log(`  ${content.name}`);
      console.log(`    Version: ${content.version ?? '1.0.0'}`);
      console.log(`    Steps: ${content.steps.map((s: { id: string }) => s.id).join(' → ')}`);
      if (content.description) {
        console.log(`    ${content.description}`);
      }
      console.log();
    }
  });

// ============================================================================
// TASKS COMMAND
// ============================================================================

program
  .command('tasks')
  .description('List available task definitions')
  .action(() => {
    console.log(`\n╔═══════════════════════════════════════════════════════════════╗`);
    console.log(`║                   Available Tasks                             ║`);
    console.log(`╚═══════════════════════════════════════════════════════════════╝\n`);

    const tasks = taskRegistry.getAll();
    for (const task of tasks) {
      console.log(`  ${task.type}`);
      console.log(`    Name: ${task.name}`);
      console.log(`    API: ${task.apiVersion}/${task.endpoint}`);
      if (task.dependsOn?.length) {
        console.log(`    Depends on: ${task.dependsOn.join(', ')}`);
      }
      console.log();
    }
  });

// ============================================================================
// ANIMATIONS COMMAND
// ============================================================================

program
  .command('animations')
  .description('List available animation IDs')
  .action(() => {
    console.log(`\n╔═══════════════════════════════════════════════════════════════╗`);
    console.log(`║                 Available Animations                          ║`);
    console.log(`╚═══════════════════════════════════════════════════════════════╝\n`);

    const categories: Record<string, string[]> = {
      Combat: ['IDLE_COMBAT', 'ATTACK_MELEE_1', 'ATTACK_MELEE_2', 'ATTACK_MELEE_3', 'BLOCK', 'DODGE_BACK', 'HIT_REACTION', 'DEATH'],
      Movement: ['RUN_IN_PLACE', 'WALK_IN_PLACE', 'SPRINT_IN_PLACE', 'JUMP_IDLE', 'JUMP_RUNNING'],
      Magic: ['CAST_SPELL', 'CAST_SPELL_2'],
      Emotes: ['WAVE', 'BOW', 'CHEER', 'CLAP'],
    };

    for (const [category, anims] of Object.entries(categories)) {
      console.log(`  ${category}:`);
      for (const anim of anims) {
        const id = ANIMATION_IDS[anim];
        if (id !== undefined) {
          console.log(`    ${anim.padEnd(20)} (ID: ${id})`);
        }
      }
      console.log();
    }
  });

// ============================================================================
// SYNC-ANIMATIONS COMMAND
// ============================================================================

program
  .command('sync-animations')
  .description('Fetch and parse the Meshy animation library into animation-library.json')
  .action(async () => {
    console.log(`\n╔═══════════════════════════════════════════════════════════════╗`);
    console.log(`║              Syncing Animation Library                        ║`);
    console.log(`╚═══════════════════════════════════════════════════════════════╝\n`);

    const url = 'https://docs.meshy.ai/en/api/animation-library';
    console.log(`  Fetching: ${url}`);

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.status}`);
      }

      const html = await response.text();
      console.log(`  Received ${html.length} bytes`);

      // Parse HTML and find the animation table
      const root = parseHtml(html);
      const rows = root.querySelectorAll('table tr');

      const animations: Array<{ id: number; name: string; category: string; subCategory: string }> = [];

      for (const row of rows) {
        const cells = row.querySelectorAll('td');
        if (cells.length < 4) continue;

        const idText = cells[0].text.trim();
        const id = parseInt(idText, 10);
        if (isNaN(id)) continue; // Skip header row

        animations.push({
          id,
          name: cells[1].text.trim(),
          category: cells[2].text.trim(),
          subCategory: cells[3].text.trim(),
        });
      }

      console.log(`  Parsed ${animations.length} animations`);

      if (animations.length === 0) {
        console.error('  No animations found - HTML structure may have changed');
        process.exit(1);
      }

      // Simple flat map: "category.subCategory.Name" -> id
      // Also create a direct name lookup for convenience
      const byPath: Record<string, number> = {};
      const byName: Record<string, number> = {};

      for (const anim of animations) {
        const dotPath = `${anim.category}.${anim.subCategory}.${anim.name}`;
        byPath[dotPath] = anim.id;
        byName[anim.name] = anim.id;
      }

      const library = {
        name: 'meshy-animation-library',
        description: 'Meshy Animation Library - auto-synced from docs.meshy.ai',
        source: url,
        syncedAt: new Date().toISOString(),
        totalAnimations: animations.length,
        byPath,
        byName,
      };

      const outputPath = path.join(__dirname, 'tasks/definitions/animation-library.json');
      fs.writeFileSync(outputPath, JSON.stringify(library, null, 2));

      // Show relative path from cwd for cleaner output
      const relativePath = path.relative(process.cwd(), outputPath);
      console.log(`  Written to: ${relativePath}`);
      console.log(`\n✅ Animation library synced: ${animations.length} animations`);
    } catch (error) {
      console.error('❌ Sync failed:', error);
      process.exit(1);
    }
  });

// ============================================================================
// HELPERS
// ============================================================================

async function processPath(targetPath: string, executor: PipelineExecutor, step?: string): Promise<void> {
  const stat = fs.statSync(targetPath);

  if (!stat.isDirectory()) {
    throw new Error(`${targetPath} is not a directory`);
  }

  const manifestPath = path.join(targetPath, 'manifest.json');

  // If this directory has a manifest, process it
  if (fs.existsSync(manifestPath)) {
    const raw = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const manifest = AssetManifestSchema.parse(raw);

    // Get pipeline name for this asset type
    const pipelineName = PIPELINE_MAP[manifest.type];
    if (!pipelineName) {
      console.log(`No pipeline defined for type: ${manifest.type}`);
      return;
    }

    // Check if pipeline definition exists
    const pipelineDefPath = path.join(__dirname, 'pipelines/definitions', `${pipelineName}.pipeline.json`);
    if (!fs.existsSync(pipelineDefPath)) {
      console.log(`[TODO] Pipeline '${pipelineName}' not yet implemented for ${manifest.name}`);
      return;
    }

    await executor.execute(pipelineName, targetPath, { step });
    return;
  }

  // Otherwise, recurse into subdirectories
  const entries = fs.readdirSync(targetPath, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isDirectory() && !entry.name.startsWith('.')) {
      await processPath(path.join(targetPath, entry.name), executor, step);
    }
  }
}

function printStatus(dir: string, indent: string) {
  const manifestPath = path.join(dir, 'manifest.json');

  if (fs.existsSync(manifestPath)) {
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    const tasks = manifest.tasks ?? {};

    const status = (task: Record<string, unknown> | undefined) => {
      if (!task) return '⬜ pending';
      const s = task.status as string;
      if (s === 'SUCCEEDED') return '✅ done';
      if (s === 'FAILED') return '❌ failed';
      if (s === 'IN_PROGRESS') return '🔄 running';
      return '⬜ pending';
    };

    console.log(`${indent}📁 ${manifest.name} (${manifest.type})`);

    if (manifest.type === 'character') {
      console.log(`${indent}   preview: ${status(tasks['text-to-3d-preview'])}`);
      console.log(`${indent}   refine:  ${status(tasks['text-to-3d-refine'])}`);
      console.log(`${indent}   rigging: ${status(tasks.rigging)}`);

      const anims = tasks.animations ?? [];
      const animConfig = manifest.animationTask?.animations ?? manifest.animationConfig?.animations ?? [];
      const done = anims.filter((a: Record<string, unknown>) => a.status === 'SUCCEEDED').length;
      const total = animConfig.length || 5;
      console.log(`${indent}   anims:   ${done}/${total}`);

      // Legacy status (if present)
      if (tasks.conceptArt || tasks.model3d) {
        console.log(`${indent}   [legacy]`);
        if (tasks.conceptArt) console.log(`${indent}     concept: ${status(tasks.conceptArt)}`);
        if (tasks.model3d) console.log(`${indent}     model:   ${status(tasks.model3d)}`);
      }
    } else if (manifest.type === 'tile') {
      console.log(`${indent}   preview: ${status(tasks['text-to-3d-preview'])}`);
      console.log(`${indent}   refine:  ${status(tasks['text-to-3d-refine'])}`);
    } else {
      console.log(`${indent}   preview: ${status(tasks['text-to-3d-preview'])}`);
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
