# @neo-tokyo/content-gen

GenAI asset generation pipeline for Neo-Tokyo: Rival Academies.

## Architecture

```text
src/
├── api/                    # Meshy API client
│   └── meshy-client.ts     # HTTP client with streaming support
├── cli.ts                  # CLI entry point (pnpm gen)
├── pipelines/
│   ├── definitions/        # Pipeline orchestration JSONs
│   │   └── character.pipeline.json
│   └── pipeline-executor.ts # Executes pipelines from JSON definitions
├── tasks/
│   ├── definitions/        # Individual task type JSONs
│   │   ├── text-to-image.json
│   │   ├── text-to-3d-preview.json
│   │   ├── text-to-3d-refine.json
│   │   ├── rigging.json
│   │   └── animation.json
│   └── registry.ts         # Animation ID mappings
└── types/
    └── manifest.ts         # Zod schemas for asset manifests
```

## Key Concepts

### 1. Task Definitions (`tasks/definitions/*.json`)

Each Meshy API endpoint has a corresponding task definition that declares:
- API endpoint and version
- Input parameters (with manifest source paths)
- Output artifacts to download
- Dependencies on other tasks

Example: `text-to-3d-preview.json`
```json
{
  "type": "text-to-3d-preview",
  "apiVersion": "v2",
  "endpoint": "text-to-3d",
  "inputs": [
    {
      "name": "prompt",
      "source": "manifest",
      "sourcePath": "textTo3DPreviewTask.prompt"
    }
  ],
  "outputs": [
    {
      "name": "model",
      "responsePath": "model_urls.glb",
      "localFilename": "preview.glb"
    }
  ]
}
```

### 2. Pipeline Definitions (`pipelines/definitions/*.pipeline.json`)

Pipelines orchestrate multiple tasks in sequence with dependencies:

```json
{
  "name": "character",
  "steps": [
    { "id": "preview", "task": "text-to-3d-preview" },
    { "id": "refine", "task": "text-to-3d-refine", "dependsOn": ["preview"] },
    { "id": "rigging", "task": "rigging", "dependsOn": ["refine"] },
    { "id": "animations", "task": "animation", "dependsOn": ["rigging"], "forEach": {...} }
  ]
}
```

### 3. Asset Manifests (`manifest.json`)

Each asset directory contains a manifest with:
- **Metadata**: id, name, type, description
- **Task configs**: Parameters for each task (prompts, settings)
- **Task state**: Execution results (taskId, status, outputs)
- **Seed**: For reproducible generation

Example:
```json
{
  "id": "vera",
  "name": "Vera",
  "type": "character",
  "textTo3DPreviewTask": {
    "prompt": "...",
    "artStyle": "sculpture",
    "poseMode": "t-pose"
  },
  "textTo3DRefineTask": {
    "texturePrompt": "...",
    "enablePbr": false
  },
  "tasks": {
    "text-to-3d-preview": { "taskId": "...", "status": "SUCCEEDED" }
  },
  "seed": 1234567890
}
```

### 4. Pipeline Executor

The executor (`pipeline-executor.ts`):
1. Loads pipeline definition JSON
2. Loads asset manifest
3. Generates seed if not present (using seedrandom)
4. Executes steps in dependency order
5. Downloads artifacts to asset directory
6. Updates manifest with task state

## CLI Usage

```bash
# From repo root
pnpm gen generate <asset-path> [--step <step-id>]

# Examples
pnpm gen generate characters/main/vera              # Full pipeline
pnpm gen generate characters/main/vera --step preview   # Single step
pnpm gen generate characters/main/vera --step refine    # Single step
```

## Adding New Task Types

1. Create task definition in `tasks/definitions/<task-type>.json`
2. Add Zod schema to `types/manifest.ts`
3. Add endpoint mapping in `pipeline-executor.ts` (getEndpointForTask)
4. Add step to relevant pipeline definition
5. Update asset manifest with new task config

## Meshy API Endpoints

| Task Type | API Version | Endpoint |
|-----------|-------------|----------|
| text-to-image | v1 | /v1/text-to-image |
| text-to-3d-preview | v2 | /v2/text-to-3d |
| text-to-3d-refine | v2 | /v2/text-to-3d |
| rigging | v1 | /v1/rigging |
| animation | v1 | /v1/animations |

## Prompt Strategy

**Preview prompts** (geometry only):
- Focus on form, pose, proportions
- NO colors (handled by texture)
- Use negative keywords for unwanted features

**Texture prompts** (refine step):
- Colors: skin tone, hair color, eye color
- Material properties: subsurface scattering, sheen
- Style: anime, realistic, etc.

## Seeds

Seeds ensure reproducible generation:
- Auto-generated using `seedrandom` if not in manifest
- Stored as unsigned 32-bit integer (Meshy requirement)
- Same seed + same prompt = same output
