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
   * STRICT: Fails hard on any error.
   */
  async generateCharacter(
    name: string,
    prompt: string,
    outputDir: string,
    artStyle: 'realistic' | 'cartoon' | 'low-poly' | 'voxel' = 'cartoon'
  ) {
    console.log(`[Modeler] Generating character (Text-to-3D): ${name}...`);

    // 1. Generate 3D Model (Text-to-3D)
    console.log(`[Modeler] Step 1: Text-to-3D generation...`);
    const modelTask = await this.client.post('/v2/text-to-3d', {
      mode: 'refined', // FORCE REFINED. No preview.
      prompt,
      art_style: artStyle,
      should_remesh: true
    }) as any;

    if (modelTask.error) throw new Error(`Text-to-3D Init Failed: ${JSON.stringify(modelTask.error)}`);

    const modelId = modelTask.result;
    console.log(`[Modeler] Model Task ID: ${modelId}`);
    
    const modelResult = await this.client.stream(`/v2/text-to-3d/${modelId}/stream`) as any;
    if (modelResult.status !== 'SUCCEEDED') {
        throw new Error(`Model generation failed: ${JSON.stringify(modelResult)}`);
    }
    
    const glbUrl = modelResult.model_urls.glb;
    console.log(`[Modeler] Model generated: ${glbUrl}`);
    const baseModelPath = path.join(outputDir, `${name}_base.glb`);
    await this.downloadFile(glbUrl, baseModelPath);

    return this.processRiggingAndAnimation(name, glbUrl, outputDir);
  }

  /**
   * Generates a 3D model from an existing image, rigs it, and applies animations.
   * STRICT: Fails hard on any error.
   */
  async generateCharacterFromImage(
    name: string,
    imagePath: string,
    outputDir: string
  ) {
    console.log(`[Modeler] Generating character (Image-to-3D): ${name} from ${imagePath}...`);

    // Read image and convert to Data URI
    const imageBuffer = fs.readFileSync(imagePath);
    const base64Image = imageBuffer.toString('base64');
    const dataUri = `data:image/png;base64,${base64Image}`; // Assuming PNG from ArtDirector

    // 1. Generate 3D Model (Image-to-3D)
    console.log(`[Modeler] Step 1: Image-to-3D generation...`);
    const modelTask = await this.client.post('/v1/image-to-3d', {
      image_url: dataUri,
      enable_pbr: true,
      should_remesh: true
    }) as any;

    if (modelTask.error) throw new Error(`Image-to-3D Init Failed: ${JSON.stringify(modelTask.error)}`);

    const modelId = modelTask.result;
    console.log(`[Modeler] Model Task ID: ${modelId}`);

    const modelResult = await this.client.stream(`/v1/image-to-3d/${modelId}/stream`) as any;
    if (modelResult.status !== 'SUCCEEDED') {
        throw new Error(`Model generation failed: ${JSON.stringify(modelResult)}`);
    }

    const glbUrl = modelResult.model_urls.glb;
    console.log(`[Modeler] Model generated: ${glbUrl}`);
    const baseModelPath = path.join(outputDir, `${name}_base.glb`);
    await this.downloadFile(glbUrl, baseModelPath);

    return this.processRiggingAndAnimation(name, glbUrl, outputDir);
  }

  private async processRiggingAndAnimation(name: string, glbUrl: string, outputDir: string) {
    // 2. Rigging
    console.log(`[Modeler] Step 2: Auto-Rigging...`);
    const rigTask = await this.client.post('/v1/rigging', {
        model_url: glbUrl,
        mode: "auto" 
    }) as any;

    if (rigTask.error) throw new Error(`Rigging Init Failed: ${JSON.stringify(rigTask.error)}`);
    
    const rigId = rigTask.result;
    const rigResult = await this.client.stream(`/v1/rigging/${rigId}/stream`) as any;
    if (rigResult.status !== 'SUCCEEDED') throw new Error(`Rigging failed: ${JSON.stringify(rigResult)}`);
    
    const riggedUrl = rigResult.model_urls.glb; 
    console.log(`[Modeler] Rigged model: ${riggedUrl}`);
    
    const riggedPath = path.join(outputDir, `${name}_rigged.glb`);
    await this.downloadFile(riggedUrl, riggedPath);

    // 3. Animation
    const requiredAnimations: AnimationType[] = ['IDLE_COMBAT', 'RUN_IN_PLACE', 'ATTACK_MELEE_1', 'HIT_REACTION', 'DEATH'];
    const animationPaths: Record<string, string> = {};

    console.log(`[Modeler] Step 3: Generating Animations (${requiredAnimations.length})...`);
    
    for (const animKey of requiredAnimations) {
        const actionId = ANIMATION_IDS[animKey];
        if (actionId === undefined) continue;

        console.log(`   -> Animating ${animKey} (ID: ${actionId})...`);
        const animTask = await this.client.post('/v1/animation', {
            model_url: riggedUrl,
            action_id: actionId
        }) as any;

        if (animTask.error) throw new Error(`Animation Init Failed for ${animKey}: ${JSON.stringify(animTask.error)}`);

        const animTaskId = animTask.result;
        const animResult = await this.client.stream(`/v1/animation/${animTaskId}/stream`) as any;
        
        if (animResult.status === 'SUCCEEDED') {
             const animUrl = animResult.model_urls.glb;
             const animPath = path.join(outputDir, `${name}_anim_${animKey.toLowerCase()}.glb`);
             await this.downloadFile(animUrl, animPath);
             animationPaths[animKey] = animPath;
        } else {
            // STRICT MODE: Fail hard on animation failure too?
            // Yes. User said "YOU SOLVE."
            throw new Error(`Animation Failed for ${animKey}: ${JSON.stringify(animResult)}`);
        }
    }

    return {
        base: path.resolve(outputDir, `${name}_base.glb`),
        rigged: path.resolve(riggedPath),
        animations: animationPaths
    };
  }

  private async downloadFile(url: string, dest: string) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status} ${res.statusText}`);
    if (!res.body) throw new Error(`No body for ${url}`);
    
    // @ts-ignore
    await pipeline(res.body, createWriteStream(dest));
    console.log(`[Modeler] Downloaded to ${dest}`);
  }
}
