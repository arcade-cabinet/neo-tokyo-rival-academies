import { MeshyClient } from '../utils/meshy-client';
import fs from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { createWriteStream } from 'node:fs';
import { ANIMATION_IDS, type AnimationType } from '../game/generators/animation-ids';

export class ModelerAgent {
  private client: MeshyClient;

  constructor(apiKey: string) {
    this.client = new MeshyClient(apiKey);
  }

  /**
   * Generates a 3D model from text, rigs it, and applies animations.
   * Returns the paths to the downloaded GLB files.
   */
  async generateCharacter(
    name: string,
    prompt: string,
    outputDir: string,
    artStyle: 'realistic' | 'cartoon' | 'low-poly' | 'voxel' = 'cartoon'
  ) {
    console.log(`[Modeler] Generating character: ${name}...`);

    // 1. Generate 3D Model (Text-to-3D)
    console.log(`[Modeler] Step 1: Text-to-3D generation...`);
    const modelTask = await this.client.post('/v2/text-to-3d', {
      mode: 'preview', // Use 'refined' for production, 'preview' for speed
      prompt,
      art_style: artStyle,
      should_remesh: true // Ensure topology is decent for rigging
    }) as any;

    const modelId = modelTask.result;
    console.log(`[Modeler] Model Task ID: ${modelId}`);
    
    // Wait for completion
    const modelResult = await this.client.stream(`/v2/text-to-3d/${modelId}/stream`) as any;
    if (modelResult.status !== 'SUCCEEDED') {
        throw new Error(`Model generation failed: ${modelResult.error}`);
    }
    
    const glbUrl = modelResult.model_urls.glb;
    console.log(`[Modeler] Model generated: ${glbUrl}`);

    // Download Base Model
    const baseModelPath = path.join(outputDir, `${name}_base.glb`);
    await this.downloadFile(glbUrl, baseModelPath);

    // 2. Rigging
    console.log(`[Modeler] Step 2: Auto-Rigging...`);
    const rigTask = await this.client.post('/v1/rigging', {
        model_url: glbUrl,
        // mode: "auto" 
    }) as any;
    
    const rigId = rigTask.result;
    const rigResult = await this.client.stream(`/v1/rigging/${rigId}/stream`) as any;
    if (rigResult.status !== 'SUCCEEDED') throw new Error('Rigging failed');
    
    const riggedUrl = rigResult.model_urls.glb; 
    console.log(`[Modeler] Rigged model: ${riggedUrl}`);
    
    const riggedPath = path.join(outputDir, `${name}_rigged.glb`);
    await this.downloadFile(riggedUrl, riggedPath);

    // 3. Animation (Basic Set)
    const requiredAnimations: AnimationType[] = ['IDLE_COMBAT', 'RUN_IN_PLACE', 'ATTACK_MELEE_1', 'HIT_REACTION', 'DEATH'];
    const animationPaths: Record<string, string> = {};

    console.log(`[Modeler] Step 3: Generating Animations (${requiredAnimations.length})...`);
    
    for (const animKey of requiredAnimations) {
        const actionId = ANIMATION_IDS[animKey];
        if (actionId === undefined) continue;

        console.log(`   -> Animating ${animKey} (ID: ${actionId})...`);
        const animTask = await this.client.post('/v1/animation', {
            model_url: riggedUrl, // Use the rigged model URL from previous step
            action_id: actionId
        }) as any;

        const animTaskId = animTask.result;
        const animResult = await this.client.stream(`/v1/animation/${animTaskId}/stream`) as any;
        
        if (animResult.status === 'SUCCEEDED') {
             const animUrl = animResult.model_urls.glb;
             const animPath = path.join(outputDir, `${name}_anim_${animKey.toLowerCase()}.glb`);
             await this.downloadFile(animUrl, animPath);
             animationPaths[animKey] = animPath;
        } else {
            console.error(`   -> Failed to animate ${animKey}: ${animResult.error}`);
        }
    }

    return {
        base: baseModelPath,
        rigged: riggedPath,
        animations: animationPaths
    };
  }

  private async downloadFile(url: string, dest: string) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to download ${url}`);
    if (!res.body) throw new Error(`No body for ${url}`);
    
    // @ts-ignore
    await pipeline(res.body, createWriteStream(dest));
    console.log(`[Modeler] Downloaded to ${dest}`);
  }
}