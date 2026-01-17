import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { pipelineExecutor } from '../../pipelines/pipeline-executor.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PIPELINE_FILE = path.resolve(__dirname, '../../pipelines/definitions/tile.pipeline.json');

export async function generateTile(tileType: string) {
  console.log(`Generating tile: ${tileType}`);

  const pipeline = JSON.parse(await fs.readFile(PIPELINE_FILE, 'utf-8'));

  // Replace placeholders in the pipeline
  const populatedPipeline = JSON.parse(
    JSON.stringify(pipeline).replace(/{{tileType}}/g, tileType)
  );

  await pipelineExecutor(populatedPipeline.steps);

  console.log(`Tile generation complete for: ${tileType}`);
}
