# GenAI Asset Pipeline Documentation

## Overview

The **GenAI Pipeline** is a declarative, JSON-driven subsystem for creating production-ready game assets. It is designed to be **idempotent**, **resumable**, and **manifest-driven**.

## Related Documentation

- [CLAUDE.md](../CLAUDE.md) - Quick reference and development workflow
- [DESIGN_MASTER_PLAN.md](DESIGN_MASTER_PLAN.md) - Overall project vision
- [PROJECT-STRUCTURE.md](../PROJECT-STRUCTURE.md) - Directory layout

---

## Architecture

### Declarative Pipelines

Pipelines are defined as JSON files that describe the sequence of steps:

**Location**: `packages/content-gen/src/pipelines/definitions/`

| Pipeline | Description | Steps |
|----------|-------------|-------|
| `character.pipeline.json` | Full character workflow | concept → model → rigging → animations |
| `prop.pipeline.json` | Non-humanoid props | concept → model (no rigging) |
| `tile.pipeline.json` | Hex tile assets | concept → model |
| `background.pipeline.json` | 2D backgrounds | concept only |

### Key Components

```
packages/content-gen/
├── src/
│   ├── api/
│   │   └── meshy-client.ts        # Meshy AI API client
│   ├── pipelines/
│   │   ├── definitions/           # JSON pipeline definitions
│   │   │   ├── character.pipeline.json
│   │   │   └── prop.pipeline.json
│   │   └── pipeline-executor.ts   # Runtime executor
│   ├── tasks/
│   │   ├── registry.ts            # Task definitions & animation IDs
│   │   └── definitions/
│   │       └── animation-presets.json
│   ├── types/
│   │   └── manifest.ts            # Asset manifest schema
│   └── cli.ts                     # Command line interface
```

---

## Manifest Schema

Each asset folder contains a `manifest.json`:

**Location Pattern**: `packages/game/public/assets/<category>/<subcategory>/<name>/manifest.json`

### Character Manifest

```json
{
  "id": "kai",
  "name": "Kai",
  "type": "character",
  "description": "The hot-headed protagonist from the Crimson Academy.",
  "textToImageTask": {
    "prompt": "Young adult Japanese man, athletic lean build... HANDS: two hands with five distinct fingers each... FACE: small well-shaped ears...",
    "generateMultiView": true,
    "poseMode": "a-pose"
  },
  "multiImageTo3DTask": {
    "topology": "quad",
    "targetPolycount": 30000,
    "symmetryMode": "auto",
    "shouldRemesh": true,
    "shouldTexture": true,
    "enablePbr": false,
    "poseMode": "a-pose"
  },
  "riggingTask": {
    "heightMeters": 1.78
  },
  "animationTask": {
    "preset": "hero"
  },
  "tasks": {},
  "seed": 2902765030
}
```

### Prop Manifest

```json
{
  "id": "tentacle-single",
  "name": "Alien Tentacle",
  "type": "prop",
  "description": "Environmental hazard prop.",
  "textToImageTask": {
    "prompt": "Single alien tentacle appendage...",
    "generateMultiView": true,
    "poseMode": "a-pose"
  },
  "multiImageTo3DTask": {
    "topology": "quad",
    "targetPolycount": 10000,
    "symmetryMode": "off"
  },
  "tasks": {}
}
```

---

## Animation Presets

Instead of listing animations explicitly, use presets:

**Location**: `packages/content-gen/src/tasks/definitions/animation-presets.json`

| Preset | Description | Animations |
|--------|-------------|------------|
| `hero` | Playable main characters | Combat_Stance, RunFast, Kung_Fu_Punch, BeHit_FlyUp, Dead, Basic_Jump, Dodge_and_Counter |
| `enemy` | Standard enemy NPCs | Combat_Stance, RunFast, Double_Combo_Attack, BeHit_FlyUp, Dead |
| `boss` | Enhanced boss characters | Combat_Stance, RunFast, Double_Combo_Attack, Kung_Fu_Punch, BeHit_FlyUp, Dead, Block1 |
| `prop` | Animated props/hazards | Idle |

Usage in manifest:
```json
"animationTask": {
  "preset": "hero"
}
```

---

## Prompt Engineering

### Preventing AI Deformities

Character prompts must include explicit HANDS and FACE sections:

```
HANDS: two hands with five distinct fingers each, proper finger proportions
with defined knuckles, natural finger spacing, thumbs positioned correctly.

FACE: small well-shaped ears with defined curves, straight nose with defined
bridge, distinct naturally shaped lips with clear upper and lower lip separation.
```

End prompts with: `anatomically correct extremities`

---

## CLI Commands

```bash
# Generate specific asset
pnpm --filter @neo-tokyo/content-gen generate characters/main/kai
pnpm --filter @neo-tokyo/content-gen generate characters/c-story/tentacles/single

# Generate all assets in a category
pnpm --filter @neo-tokyo/content-gen generate characters/
pnpm --filter @neo-tokyo/content-gen generate tiles/
```

---

## API Integration

### Meshy AI Endpoints

| Step | Endpoint | Key Parameters |
|------|----------|----------------|
| Concept Art | `POST /v1/text-to-image` | `ai_model`, `prompt`, `generate_multi_view`, `pose_mode` |
| 3D Model | `POST /v1/multi-image-to-3d` | `image_urls[]`, `target_polycount`, `topology`, `symmetry_mode` |
| Rigging | `POST /v1/rigging` | `input_task_id`, `height_meters`, `texture_image_url` |
| Animation | `POST /v1/animations` | `rig_task_id`, `action_id` |

### Animation IDs

**Location**: `packages/content-gen/src/tasks/registry.ts`

```typescript
export const ANIMATION_IDS: Record<string, number> = {
  Combat_Stance: 89,
  RunFast: 68,
  Kung_Fu_Punch: 73,
  Double_Combo_Attack: 74,
  BeHit_FlyUp: 92,
  Dead: 103,
  Block1: 95,
  Basic_Jump: 84,
  Dodge_and_Counter: 96,
  Idle: 1,
};
```

---

## Pipeline Execution Flow

### Character Pipeline

```
manifest.json (type: character)
    ↓
[1] text-to-image (multi-view, a-pose)
    → tasks.concept.outputs.imageUrls[]
    ↓
[2] multi-image-to-3d (30K poly, quad)
    → tasks.model.outputs.model (URL)
    → tasks.model.outputs.textureUrl
    ↓
[3] rigging (height from manifest)
    → tasks.rigging.outputs.riggedModel (URL)
    ↓
[4] animations (forEach from preset)
    → tasks.animations[].outputs
    → animations/*.glb (downloaded)
```

### Prop Pipeline

```
manifest.json (type: prop)
    ↓
[1] text-to-image (multi-view)
    → tasks.concept.outputs.imageUrls[]
    ↓
[2] multi-image-to-3d
    → tasks.model.outputs.model (URL)

(No rigging or animations)
```

---

## Resumability

The manifest tracks task state for each step:

```json
{
  "tasks": {
    "concept": {
      "taskId": "019bc441-c542-7214-8a09-efa6fa89b32a",
      "status": "SUCCEEDED",
      "completedAt": 1768524224599,
      "outputs": {
        "taskId": "...",
        "imageUrls": ["..."]
      },
      "artifacts": {}
    },
    "model": {
      "taskId": "019bc442-1904-721e-ada2-22bc59d5c037",
      "status": "SUCCEEDED",
      ...
    },
    "animations": [
      {
        "taskId": "...",
        "status": "SUCCEEDED",
        "animationName": "COMBAT_STANCE",
        "outputs": {
          "animations/combat_stance.glb": "animations/combat_stance.glb"
        }
      }
    ]
  }
}
```

**Statuses**: `PENDING`, `IN_PROGRESS`, `SUCCEEDED`, `FAILED`

Re-running the generator skips completed tasks and resumes from failures.

---

## Configuration

### Environment Variables

Create `.env` in project root:
```env
MESHY_API_KEY=your_key_here
```

### Git LFS

Binary assets are tracked via Git LFS:
```
*.glb filter=lfs diff=lfs merge=lfs -text
*.fbx filter=lfs diff=lfs merge=lfs -text
*.png filter=lfs diff=lfs merge=lfs -text
```

---

## Generated Assets Summary

### Main Characters (2)
- **Vera** - hero preset (7 animations)
- **Kai** - hero preset (7 animations)

### B-Story Characters (4)
- **Yakuza Grunt** - enemy preset (5 animations)
- **Yakuza Boss** - boss preset (7 animations)
- **Biker Grunt** - enemy preset (5 animations)
- **Biker Boss** - boss preset (7 animations)

### C-Story Characters (3)
- **Mall Security Guard** - enemy preset (5 animations)
- **Alien Humanoid** - enemy preset (5 animations)
- **Tentacle Single** - prop type (model only)

---

## Troubleshooting

### API Rate Limits
Meshy AI has rate limits. If you hit them, wait and retry.

### Pose Estimation Failed
Non-humanoid models (tentacles, props) cannot be rigged. Use `type: "prop"` instead.

### Missing Textures
Ensure `shouldTexture: true` in multiImageTo3DTask config.

### Animation Issues
- Verify rigging completed successfully
- Check that `rig_task_id` is being passed correctly
- Some animations may not work with certain model geometries

---

*Last Updated: 2026-01-15*
