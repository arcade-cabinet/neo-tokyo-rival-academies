# GenAI Asset Pipeline Documentation

## Overview

The **GenAI Pipeline** is a specialized subsystem responsible for autonomously creating production-ready game assets. It is designed to be **idempotent**, **resumable**, and **manifest-driven**.

## Related Documentation

- [CLAUDE.md](../CLAUDE.md) - Quick reference and development workflow
- [AGENTS.md](../AGENTS.md) - Agent architecture details
- [DESIGN_MASTER_PLAN.md](DESIGN_MASTER_PLAN.md) - Overall project vision

---

## Core Components

### 1. The Manifest System

Each asset folder contains a `manifest.json` that defines the desired state:

**Location Pattern**: `packages/game/public/assets/<category>/<subcategory>/<name>/manifest.json`

**Schema** (`packages/content-gen/src/types/manifest.ts`):
```typescript
interface AssetManifest {
  name: string;
  type: 'character' | 'background' | 'tile';
  visualPrompt: string;
  imageConfig?: {
    aiModel?: string;
    aspectRatio?: '1:1' | '9:16' | '16:9' | '4:3' | '3:4';
    negativePrompt?: string;
  };
  modelConfig?: {
    aiModel?: string;
    topology?: 'quad' | 'triangle';
    targetPolycount?: number;
    enablePbr?: boolean;
  };
  riggingConfig?: {
    heightMeters?: number;
  };
  animationConfig?: {
    animations?: AnimationType[];
  };
  tasks?: TaskState;  // Auto-populated by agent
}
```

### 2. ModelerAgent

**Location**: `packages/content-gen/src/agents/ModelerAgent.ts`

The primary worker class that interfaces with the **Meshy AI API**.

**Capabilities by Asset Type**:

| Type | Concept Art | 3D Model | Rigging | Animations |
|------|-------------|----------|---------|------------|
| `character` | 9:16, t-pose | 50K poly, quad | Yes | Configurable |
| `tile` | 1:1, no pose | 10K poly, quad | No | No |
| `background` | 16:9, no pose | No | No | No |

### 3. CLI

**Location**: `packages/content-gen/src/cli.ts`

**Commands**:
```bash
# Process entire assets folder (recursive)
pnpm --filter @neo-tokyo/content-gen generate

# Process specific asset path
pnpm --filter @neo-tokyo/content-gen generate characters/main/kai
pnpm --filter @neo-tokyo/content-gen generate tiles/rooftop/base
pnpm --filter @neo-tokyo/content-gen generate backgrounds/sector0/wall_left
```

---

## Asset Type Workflows

### Character Pipeline

```
manifest.json (character)
    ↓
[1] Text-to-Image (9:16, t-pose)
    → concept.png
    ↓
[2] Image-to-3D (50K poly, quad)
    → model.glb
    ↓
[3] Auto-Rigging (1.7m default)
    → rigged.glb
    ↓
[4] Animations (IDLE, RUN, ATTACK, etc.)
    → animations/idle_combat.glb
    → animations/run_in_place.glb
    → animations/attack_melee_1.glb
    → ...
```

### Tile Pipeline

```
manifest.json (tile)
    ↓
[1] Text-to-Image (1:1, no pose)
    → concept.png
    ↓
[2] Image-to-3D (10K poly, quad)
    → model.glb
```

### Background Pipeline

```
manifest.json (background)
    ↓
[1] Text-to-Image (16:9, no pose)
    → concept.png
```

---

## API Integration Details

### Meshy AI Endpoints

| Step | Endpoint | Key Parameters |
|------|----------|----------------|
| Concept Art | `POST /v1/text-to-image` | `ai_model`, `prompt`, `aspect_ratio`, `pose_mode` |
| 3D Model | `POST /v1/image-to-3d` | `image_url` (data URI), `target_polycount`, `topology`, `enable_pbr` |
| Rigging | `POST /v1/rigging` | `input_task_id`, `height_meters` |
| Animation | `POST /v1/animations` | `rig_task_id`, `action_id` |

### Animation IDs

**Location**: `packages/content-gen/src/game/generators/animation-ids.ts`

```typescript
const ANIMATION_IDS = {
  IDLE_COMBAT: 89,
  RUN_IN_PLACE: 68,
  ATTACK_MELEE_1: 73,
  HIT_REACTION: 92,
  DEATH: 103,
  // ... more
};
```

---

## The "White Animation" Fix

To prevent animations from losing texture data:

1. Generate **Textured Concept Art** first with proper lighting
2. Feed into `Image-to-3D` with `enable_pbr: true` and `should_texture: true`
3. Use `pose_mode: "t-pose"` to ensure rig-ready geometry
4. Pass the *Rigged Model ID* (`rig_task_id`) to Animation endpoint

---

## Configuration

### Environment Variables

Create `.env` in project root:
```env
MESHY_API_KEY=your_key_here
```

### Default Configuration

**Location**: `packages/content-gen/src/agents/ModelerAgent.ts`

```typescript
const DEFAULTS = {
  image: {
    aiModel: 'nano-banana-pro',
    aspectRatio: '9:16',
    poseMode: 't-pose',
  },
  model: {
    aiModel: 'latest',
    topology: 'quad',
    targetPolycount: 50000,
    symmetryMode: 'auto',
    poseMode: 't-pose',
    enablePbr: true,
  },
  rigging: {
    heightMeters: 1.7,
  },
  animations: ['IDLE_COMBAT', 'RUN_IN_PLACE', 'ATTACK_MELEE_1', 'HIT_REACTION', 'DEATH'],
};
```

---

## Adding New Content

### New Tile Type

1. Create directory: `packages/game/public/assets/tiles/<category>/<type>/`
2. Create `manifest.json`:
```json
{
  "name": "Rooftop Vent Tile",
  "type": "tile",
  "visualPrompt": "cyberpunk industrial air conditioning unit, metal grating, neon accent lights, top-down view, game asset, clean edges",
  "imageConfig": {
    "aspectRatio": "1:1"
  },
  "modelConfig": {
    "targetPolycount": 10000
  }
}
```
3. Run: `pnpm --filter @neo-tokyo/content-gen generate tiles/<category>/<type>`

### New Character

1. Create directory: `packages/game/public/assets/characters/<faction>/<name>/`
2. Create `manifest.json`:
```json
{
  "name": "Academy Student - Akira",
  "type": "character",
  "visualPrompt": "anime-style male teenage student, cyberpunk school uniform, blue hair, determined expression, t-pose, full body, white background",
  "modelConfig": {
    "targetPolycount": 50000
  },
  "riggingConfig": {
    "heightMeters": 1.65
  },
  "animationConfig": {
    "animations": ["IDLE_COMBAT", "RUN_IN_PLACE", "ATTACK_MELEE_1"]
  }
}
```
3. Run: `pnpm --filter @neo-tokyo/content-gen generate characters/<faction>/<name>`

### New Background

1. Create directory: `packages/game/public/assets/backgrounds/<sector>/<element>/`
2. Create `manifest.json`:
```json
{
  "name": "Sector 7 Skyline",
  "type": "background",
  "visualPrompt": "panoramic cyberpunk city skyline, neon signs, rain, flying vehicles, night scene, detailed architecture",
  "imageConfig": {
    "aspectRatio": "16:9"
  }
}
```
3. Run: `pnpm --filter @neo-tokyo/content-gen generate backgrounds/<sector>/<element>`

---

## Resumability

The manifest tracks task state for each step:

```json
{
  "tasks": {
    "conceptArt": {
      "taskId": "019bc123-55c0-7b64-953a-5b6fd6c117c0",
      "status": "SUCCEEDED",
      "resultUrl": "https://...",
      "localPath": "/full/path/to/concept.png"
    },
    "model3d": {
      "taskId": "019bc124-...",
      "status": "IN_PROGRESS"
    }
  }
}
```

**Statuses**: `IN_PROGRESS`, `SUCCEEDED`, `FAILED`

Re-running the generator skips completed tasks and resumes from failures.

---

## Troubleshooting

### API Rate Limits
Meshy AI has rate limits. If you hit them, wait and retry.

### Failed Tasks
Check `manifest.json` for error details in the `error` field of failed tasks.

### Missing Textures
Ensure `enable_pbr: true` and `should_texture: true` in model config.

### Animation Issues
- Verify rigging completed successfully
- Check that `rig_task_id` is being passed correctly
- Some animations may not work with certain model geometries

---

*Last Updated: 2025-01-15*
