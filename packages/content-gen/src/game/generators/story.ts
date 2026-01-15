import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { MacroArchitect } from '../../agents/MacroArchitect';
import { MesoDesigner } from '../../agents/MesoDesigner';
import { MicroWriter } from '../../agents/MicroWriter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to batch promises
async function batchProcess<T, R>(
  items: T[],
  batchSize: number,
  processor: (item: T) => Promise<R>
): Promise<R[]> {
  const results: R[] = [];
  for (let i = 0; i < items.length; i += batchSize) {
    const batch = items.slice(i, i + batchSize);
    console.log(
      `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(items.length / batchSize)}...`
    );
    try {
      const batchResults = await Promise.all(batch.map(processor));
      results.push(...batchResults);
    } catch (e) {
      console.error('Batch processing error:', e);
    }
    // Delay between batches to respect rate limits
    if (i + batchSize < items.length) await new Promise((resolve) => setTimeout(resolve, 5000));
  }
  return results;
}

export async function generateFullStory() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY required');

  // 1. MACRO PHASE
  const macroAgent = new MacroArchitect(apiKey);
  const macroStory = await macroAgent.designStory();

  console.log(`Macro Phase Complete: ${macroStory.title}`);

  // Prepare Meso Tasks
  const mesoTasks = [];
  if (!macroStory.acts || !macroStory.world_atlas) {
    throw new Error('Macro Story generation failed to return valid acts or world_atlas');
  }

  for (const act of macroStory.acts) {
    for (const chapterId of act.chapters) {
      mesoTasks.push({
        chapterId,
        actDesc: act.description,
        // Simple round-robin region assignment for variety if multiple regions exist
        region: macroStory.world_atlas[mesoTasks.length % macroStory.world_atlas.length],
      });
    }
  }

  // 2. MESO PHASE (Batched)
  const mesoAgent = new MesoDesigner(apiKey);
  const chapters = await batchProcess(mesoTasks, 2, async (task) => {
    return mesoAgent.designChapter(task.chapterId, task.actDesc, task.region);
  });

  console.log(`Meso Phase Complete: ${chapters.length} Chapters Generated.`);

  // Prepare Micro Tasks
  const microTasks = [];
  for (const chapter of chapters) {
    if (!chapter.story_beats) continue;
    for (const beat of chapter.story_beats) {
      if (beat.type === 'Dialogue') {
        microTasks.push({ beat, chapterId: chapter.id });
      }
    }
  }

  // 3. MICRO PHASE (Batched)
  const microAgent = new MicroWriter(apiKey);
  const scripts = await batchProcess(microTasks, 3, async (task) => {
    const dialogues = await microAgent.writeDialogue(task.beat);
    return {
      chapterId: task.chapterId,
      beatId: task.beat.id,
      dialogues,
    };
  });

  console.log(`Micro Phase Complete: ${scripts.length} Dialogue Sequences.`);

  // 4. ASSEMBLY
  const fullGameData = {
    meta: macroStory,
    chapters: chapters,
    scripts: scripts,
  };

  // Adjust path for new location (src/game/generators/story.ts -> ../../../../packages/game/src/data)
  const outputPath = path.resolve(
    __dirname,
    '../../../../../packages/game/src/data/generated_jrpg.json'
  );
  fs.writeFileSync(outputPath, JSON.stringify(fullGameData, null, 2));
  console.log(`JRPG Generated: ${outputPath}`);
}
