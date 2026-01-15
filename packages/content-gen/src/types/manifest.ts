import { z } from 'zod';

// --- Task State Schemas ---

export const TaskStatusSchema = z.enum(['PENDING', 'IN_PROGRESS', 'SUCCEEDED', 'FAILED', 'CANCELED']);

export const GenerationTaskSchema = z.object({
  taskId: z.string(),
  status: TaskStatusSchema,
  resultUrl: z.string().optional(),
  localPath: z.string().optional(),
  error: z.string().optional(),
});

export const AnimationTaskSchema = GenerationTaskSchema.extend({
  actionId: z.number(),
  animationName: z.string(),
});

// --- Generation Config Schemas ---

export const ImageGenConfigSchema = z.object({
  aiModel: z.enum(['nano-banana', 'nano-banana-pro']).default('nano-banana-pro'),
  aspectRatio: z.enum(['1:1', '16:9', '9:16', '4:3', '3:4']).default('9:16'),
  poseMode: z.enum(['t-pose', 'a-pose', '']).default('t-pose'),
}).partial();

export const Model3dConfigSchema = z.object({
  aiModel: z.enum(['meshy-5', 'meshy-6', 'latest']).default('latest'),
  topology: z.enum(['quad', 'triangle']).default('quad'),
  targetPolycount: z.number().min(100).max(300000).default(50000),
  symmetryMode: z.enum(['off', 'auto', 'on']).default('auto'),
  poseMode: z.enum(['t-pose', 'a-pose', '']).default('t-pose'),
  enablePbr: z.boolean().default(true),
}).partial();

export const RiggingConfigSchema = z.object({
  heightMeters: z.number().positive().default(1.7),
}).partial();

export const AnimationConfigSchema = z.object({
  animations: z.array(z.string()).default(['IDLE_COMBAT', 'RUN_IN_PLACE', 'ATTACK_MELEE_1', 'HIT_REACTION', 'DEATH']),
}).partial();

// --- Asset Manifest (per-asset manifest.json in each directory) ---

export const AssetManifestSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: z.enum(['character', 'background', 'prop', 'environment']),
  description: z.string(),
  visualPrompt: z.string(),

  // Per-asset generation config (overrides defaults)
  imageConfig: ImageGenConfigSchema.optional(),
  modelConfig: Model3dConfigSchema.optional(),
  riggingConfig: RiggingConfigSchema.optional(),
  animationConfig: AnimationConfigSchema.optional(),

  // State Tracking
  tasks: z.object({
    conceptArt: GenerationTaskSchema.optional(),
    model3d: GenerationTaskSchema.optional(),
    rigging: GenerationTaskSchema.optional(),
    animations: z.array(AnimationTaskSchema).optional(),
  }).default({}),
});

export type AssetManifest = z.infer<typeof AssetManifestSchema>;
export type GenerationTask = z.infer<typeof GenerationTaskSchema>;
export type AnimationTask = z.infer<typeof AnimationTaskSchema>;

// Legacy types for backwards compat during migration
export type CharacterManifest = AssetManifest;
export type BackgroundManifest = AssetManifest;
