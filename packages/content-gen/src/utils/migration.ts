import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Target Directory: packages/game/src/content/data
const TARGET_DIR = path.resolve(__dirname, '../../../../game/src/content/data');

export async function migrateContent() {
  console.log('Migrating Monolithic JSON to Granular Files...');

  const sourcePath = path.resolve(__dirname, '../../../../game/src/data/generated_jrpg.json');

  if (!fs.existsSync(sourcePath)) {
    console.error(`Source file not found: ${sourcePath}`);
    return;
  }

  const rawData = fs.readFileSync(sourcePath, 'utf-8');
  const data = JSON.parse(rawData);

  // Ensure directories exist
  const dirs = ['chapters', 'quests', 'atlas', 'lore', 'items'];
  for (const dir of dirs) {
    fs.mkdirSync(path.join(TARGET_DIR, dir), { recursive: true });
  }

  // 1. Migrate Atlas (Regions)
  if (data.world_atlas) {
    console.log(`Processing ${data.world_atlas.length} regions...`);
    for (const region of data.world_atlas) {
      const filePath = path.join(TARGET_DIR, 'atlas', `${region.id}.json`);
      fs.writeFileSync(filePath, JSON.stringify(region, null, 2));
    }
  }

  // 2. Migrate Chapters
  if (data.chapters) {
    console.log(`Processing ${data.chapters.length} chapters...`);
    for (const chapter of data.chapters) {
      // Extract Quests from Chapter if present
      if (chapter.quests) {
        for (const quest of chapter.quests) {
          // Normalize Quest ID to filename safe
          const questId = quest.id || `quest_${Date.now()}`;
          const questPath = path.join(TARGET_DIR, 'quests', `${questId}.json`);
          fs.writeFileSync(questPath, JSON.stringify(quest, null, 2));
        }
        // Remove quests from chapter file to avoid duplication (store ref instead?)
        // For now, we keep them embedded or refactor later. Let's keep a sanitized version.
        // chapter.quests = chapter.quests.map(q => ({ $ref: `quests/${q.id}.json` }));
      }

      const filePath = path.join(TARGET_DIR, 'chapters', `${chapter.id}.json`);
      fs.writeFileSync(filePath, JSON.stringify(chapter, null, 2));
    }
  }

  // 3. Migrate Metadata (Acts, Theme)
  const meta = {
    meta: data.meta,
    acts: data.acts,
  };
  fs.writeFileSync(path.join(TARGET_DIR, 'manifest.json'), JSON.stringify(meta, null, 2));

  console.log(`Migration Complete. Data written to ${TARGET_DIR}`);
}
