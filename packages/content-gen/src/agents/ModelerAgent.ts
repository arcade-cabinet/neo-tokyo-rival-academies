import { MeshyClient } from '../utils/meshy-client';
import fs from 'node:fs';
import path from 'node:path';
import { pipeline } from 'node:stream/promises';
import { createWriteStream } from 'node:fs';
import { ANIMATION_IDS, type AnimationType } from '../game/generators/animation-ids';
import { AssetManifestSchema, type AssetManifest } from '../types/manifest';

// Defaults for generation config
const DEFAULTS = {
  image: {
    aiModel: 'nano-banana-pro' as const,
    aspectRatio: '9:16' as const,
    poseMode: 't-pose' as const,
  },
  model: {
    aiModel: 'latest' as const,
    topology: 'quad' as const,
    targetPolycount: 50000,
    symmetryMode: 'auto' as const,
    poseMode: 't-pose' as const,
    enablePbr: true,
  },
  rigging: {
    heightMeters: 1.7,
  },
  animations: ['IDLE_COMBAT', 'RUN_IN_PLACE', 'ATTACK_MELEE_1', 'HIT_REACTION', 'DEATH'] as AnimationType[],
};

export class ModelerAgent {
  private client: MeshyClient;

  constructor(apiKey: string) {
    this.client = new MeshyClient(apiKey);
  }

  /**
   * Process a single asset directory containing manifest.json
   * All outputs go into the same directory as the manifest.
   */
  async processAssetDir(assetDir: string): Promise<AssetManifest> {
    const manifestPath = path.join(assetDir, 'manifest.json');

    if (!fs.existsSync(manifestPath)) {
      throw new Error(`No manifest.json found in ${assetDir}`);
    }

    const raw = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    let manifest = AssetManifestSchema.parse(raw);

    console.log(`\n[Modeler] Processing: ${manifest.name} (${manifest.type}) in ${assetDir}`);

    // Process based on type
    if (manifest.type === 'character') {
      manifest = await this.processCharacter(manifest, assetDir);
    } else if (manifest.type === 'background') {
      manifest = await this.processBackground(manifest, assetDir);
    } else {
      console.log(`[Modeler] Skipping unsupported type: ${manifest.type}`);
    }

    // Save manifest after processing
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    return manifest;
  }

  /**
   * Recursively find and process all manifest.json files under a path
   */
  async processPath(targetPath: string): Promise<void> {
    const stat = fs.statSync(targetPath);

    if (!stat.isDirectory()) {
      throw new Error(`${targetPath} is not a directory`);
    }

    const manifestPath = path.join(targetPath, 'manifest.json');

    // If this directory has a manifest, process it
    if (fs.existsSync(manifestPath)) {
      await this.processAssetDir(targetPath);
      return;
    }

    // Otherwise, recurse into subdirectories
    const entries = fs.readdirSync(targetPath, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        await this.processPath(path.join(targetPath, entry.name));
      }
    }
  }

  private async processCharacter(manifest: AssetManifest, outputDir: string): Promise<AssetManifest> {
    // Initialize tasks object if needed
    if (!manifest.tasks) manifest.tasks = {};

    // 1. Concept Art
    manifest = await this.ensureConceptArt(manifest, outputDir);

    // 2. 3D Model
    manifest = await this.ensureModel3d(manifest, outputDir);

    // 3. Rigging
    manifest = await this.ensureRigging(manifest, outputDir);

    // 4. Animations
    manifest = await this.ensureAnimations(manifest, outputDir);

    return manifest;
  }

  private async processBackground(manifest: AssetManifest, outputDir: string): Promise<AssetManifest> {
    // Initialize tasks object if needed
    if (!manifest.tasks) manifest.tasks = {};

    // Backgrounds only need concept art (image generation)
    manifest = await this.ensureConceptArt(manifest, outputDir, true);

    return manifest;
  }

  private async ensureConceptArt(manifest: AssetManifest, outputDir: string, isBackground = false): Promise<AssetManifest> {
    const localPath = path.join(outputDir, 'concept.png');

    // Check if already done (handle both relative and absolute paths)
    if (manifest.tasks.conceptArt?.status === 'SUCCEEDED') {
      const checkPath = manifest.tasks.conceptArt.localPath?.startsWith('/')
        ? manifest.tasks.conceptArt.localPath
        : path.join(outputDir, manifest.tasks.conceptArt.localPath ?? 'concept.png');
      if (fs.existsSync(checkPath)) {
        console.log(`[Modeler] Concept Art exists: ${checkPath}`);
        return manifest;
      }
    }

    const cfg = { ...DEFAULTS.image, ...manifest.imageConfig };

    // Background images don't need pose
    const poseStr = isBackground ? '' : `, ${cfg.poseMode}`;
    const aspectRatio = isBackground ? '16:9' : cfg.aspectRatio;

    console.log(`[Modeler] Generating Concept Art...`);
    console.log(`[Modeler] Config: model=${cfg.aiModel}, aspect=${aspectRatio}`);

    const task = await this.client.post('/v1/text-to-image', {
      ai_model: cfg.aiModel,
      prompt: `${manifest.visualPrompt}${poseStr}, full body character sheet, neutral lighting, white background, high detailed, 8k`,
      pose_mode: isBackground ? undefined : cfg.poseMode,
      aspect_ratio: aspectRatio,
      negative_prompt: 'blurry, low quality, distorted, watermark, text, cropped, out of frame'
    }) as any;

    if (task.error) throw new Error(`Concept Art Init Failed: ${JSON.stringify(task.error)}`);

    const taskId = task.result;
    console.log(`[Modeler] Task ID: ${taskId}`);

    manifest.tasks.conceptArt = { taskId, status: 'IN_PROGRESS' };

    const result = await this.client.stream(`/v1/text-to-image/${taskId}/stream`) as any;

    if (result.status === 'SUCCEEDED') {
      const imageUrl = result.image_urls[0];
      await this.downloadFile(imageUrl, localPath);

      manifest.tasks.conceptArt = {
        taskId,
        status: 'SUCCEEDED',
        resultUrl: imageUrl,
        localPath
      };
    } else {
      manifest.tasks.conceptArt = { taskId, status: 'FAILED', error: JSON.stringify(result) };
      throw new Error(`Concept Art Failed: ${JSON.stringify(result)}`);
    }

    return manifest;
  }

  private async ensureModel3d(manifest: AssetManifest, outputDir: string): Promise<AssetManifest> {
    const localPath = path.join(outputDir, 'model.glb');

    // Check if already done (handle both relative and absolute paths)
    if (manifest.tasks.model3d?.status === 'SUCCEEDED') {
      const checkPath = manifest.tasks.model3d.localPath?.startsWith('/')
        ? manifest.tasks.model3d.localPath
        : path.join(outputDir, manifest.tasks.model3d.localPath ?? 'model.glb');
      if (fs.existsSync(checkPath)) {
        console.log(`[Modeler] 3D Model exists: ${checkPath}`);
        return manifest;
      }
    }

    const conceptPath = path.join(outputDir, 'concept.png');
    if (!fs.existsSync(conceptPath)) {
      throw new Error(`Cannot generate 3D model without concept.png in ${outputDir}`);
    }

    const cfg = { ...DEFAULTS.model, ...manifest.modelConfig };

    console.log(`[Modeler] Generating 3D Model (Image-to-3D)...`);
    console.log(`[Modeler] Config: topology=${cfg.topology}, polycount=${cfg.targetPolycount}, pbr=${cfg.enablePbr}`);

    const imageBuffer = fs.readFileSync(conceptPath);
    const dataUri = `data:image/png;base64,${imageBuffer.toString('base64')}`;

    const task = await this.client.post('/v1/image-to-3d', {
      image_url: dataUri,
      ai_model: cfg.aiModel,
      model_type: 'standard',
      target_polycount: cfg.targetPolycount,
      topology: cfg.topology,
      should_remesh: true,
      enable_pbr: cfg.enablePbr,
      should_texture: true,
      pose_mode: cfg.poseMode,
      symmetry_mode: cfg.symmetryMode
    }) as any;

    if (task.error) throw new Error(`Image-to-3D Init Failed: ${JSON.stringify(task.error)}`);

    const taskId = task.result;
    console.log(`[Modeler] Task ID: ${taskId}`);

    manifest.tasks.model3d = { taskId, status: 'IN_PROGRESS' };

    const result = await this.client.stream(`/v1/image-to-3d/${taskId}/stream`) as any;

    if (result.status === 'SUCCEEDED') {
      const glbUrl = result.model_urls.glb;
      await this.downloadFile(glbUrl, localPath);

      manifest.tasks.model3d = {
        taskId,
        status: 'SUCCEEDED',
        resultUrl: glbUrl,
        localPath
      };
    } else {
      manifest.tasks.model3d = { taskId, status: 'FAILED', error: JSON.stringify(result) };
      throw new Error(`Image-to-3D Failed: ${JSON.stringify(result)}`);
    }

    return manifest;
  }

  private async ensureRigging(manifest: AssetManifest, outputDir: string): Promise<AssetManifest> {
    const localPath = path.join(outputDir, 'rigged.glb');

    if (manifest.tasks.rigging?.status === 'SUCCEEDED') {
      const checkPath = manifest.tasks.rigging.localPath?.startsWith('/')
        ? manifest.tasks.rigging.localPath
        : path.join(outputDir, manifest.tasks.rigging.localPath ?? 'rigged.glb');
      if (fs.existsSync(checkPath)) {
        console.log(`[Modeler] Rigging exists: ${checkPath}`);
        return manifest;
      }
    }

    if (!manifest.tasks.model3d?.taskId) {
      throw new Error(`Cannot rig model without 3D Model Task ID`);
    }

    const cfg = { ...DEFAULTS.rigging, ...manifest.riggingConfig };

    console.log(`[Modeler] Rigging Model...`);
    console.log(`[Modeler] Config: height=${cfg.heightMeters}m`);

    const task = await this.client.post('/v1/rigging', {
      input_task_id: manifest.tasks.model3d.taskId,
      height_meters: cfg.heightMeters,
    }) as any;

    if (task.error) throw new Error(`Rigging Init Failed: ${JSON.stringify(task.error)}`);

    const taskId = task.result;
    console.log(`[Modeler] Task ID: ${taskId}`);

    manifest.tasks.rigging = { taskId, status: 'IN_PROGRESS' };

    const result = await this.client.stream(`/v1/rigging/${taskId}/stream`) as any;

    if (result.status === 'SUCCEEDED') {
      const riggedUrl = result.result.rigged_character_glb_url;
      await this.downloadFile(riggedUrl, localPath);

      manifest.tasks.rigging = {
        taskId,
        status: 'SUCCEEDED',
        resultUrl: riggedUrl,
        localPath
      };
    } else {
      manifest.tasks.rigging = { taskId, status: 'FAILED', error: JSON.stringify(result) };
      throw new Error(`Rigging Failed: ${JSON.stringify(result)}`);
    }

    return manifest;
  }

  private async ensureAnimations(manifest: AssetManifest, outputDir: string): Promise<AssetManifest> {
    if (!manifest.tasks.rigging?.taskId) {
      throw new Error(`Cannot animate without Rigging Task ID`);
    }

    const animDir = path.join(outputDir, 'animations');
    if (!fs.existsSync(animDir)) {
      fs.mkdirSync(animDir, { recursive: true });
    }

    const animationNames = (manifest.animationConfig?.animations ?? DEFAULTS.animations) as AnimationType[];
    if (!manifest.tasks.animations) manifest.tasks.animations = [];

    console.log(`[Modeler] Animations: ${animationNames.join(', ')}`);

    for (const animKey of animationNames) {
      const actionId = ANIMATION_IDS[animKey];
      if (actionId === undefined) {
        console.warn(`[Modeler] Unknown animation: ${animKey}, skipping`);
        continue;
      }

      const localPath = path.join(animDir, `${animKey.toLowerCase()}.glb`);
      const existing = manifest.tasks.animations.find(a => a.animationName === animKey);

      if (existing?.status === 'SUCCEEDED' && fs.existsSync(localPath)) {
        console.log(`[Modeler] Animation ${animKey} exists`);
        continue;
      }

      console.log(`[Modeler] Generating ${animKey} (ID: ${actionId})...`);

      const task = await this.client.post('/v1/animations', {
        rig_task_id: manifest.tasks.rigging.taskId,
        action_id: actionId
      }) as any;

      if (task.error) throw new Error(`Animation Init Failed for ${animKey}: ${JSON.stringify(task.error)}`);

      const taskId = task.result;

      let animEntry = manifest.tasks.animations.find(a => a.animationName === animKey);
      if (!animEntry) {
        animEntry = { taskId, status: 'IN_PROGRESS', animationName: animKey, actionId };
        manifest.tasks.animations.push(animEntry);
      } else {
        animEntry.taskId = taskId;
        animEntry.status = 'IN_PROGRESS';
      }

      const result = await this.client.stream(`/v1/animations/${taskId}/stream`) as any;

      if (result.status === 'SUCCEEDED') {
        const animUrl = result.result.animation_glb_url;
        if (animUrl) {
          await this.downloadFile(animUrl, localPath);
          animEntry.status = 'SUCCEEDED';
          animEntry.resultUrl = animUrl;
          animEntry.localPath = localPath;
        } else {
          throw new Error(`No GLB URL in animation result: ${JSON.stringify(result)}`);
        }
      } else {
        animEntry.status = 'FAILED';
        animEntry.error = JSON.stringify(result);
        throw new Error(`Animation ${animKey} Failed: ${JSON.stringify(result)}`);
      }
    }

    return manifest;
  }

  private async downloadFile(url: string, dest: string) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status} ${res.statusText}`);
    if (!res.body) throw new Error(`No body for ${url}`);

    const dir = path.dirname(dest);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    // @ts-ignore
    await pipeline(res.body, createWriteStream(dest));
    console.log(`[Modeler] Downloaded: ${dest}`);
  }
}
