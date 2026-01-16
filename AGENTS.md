# AI Agents Architecture

This document describes the specialized agents and utilities operating within the Neo-Tokyo project.

## Essential Reading (Before Touching Code)

| Document | Purpose |
|----------|---------|
| [docs/GENAI_PIPELINE.md](docs/GENAI_PIPELINE.md) | **CRITICAL**: Asset generation with Meshy AI |
| [docs/NARRATIVE_DESIGN.md](docs/NARRATIVE_DESIGN.md) | A/B/C story architecture, 3-hour JRPG |
| [docs/BABYLON_MIGRATION_PLAN.md](docs/BABYLON_MIGRATION_PLAN.md) | Reactylon migration roadmap |

## Memory Bank (AI Context)

| Document | Purpose |
|----------|---------|
| [memory-bank/projectbrief.md](memory-bank/projectbrief.md) | Core project summary |
| [memory-bank/techContext.md](memory-bank/techContext.md) | Technical stack details |
| [memory-bank/activeContext.md](memory-bank/activeContext.md) | Current work focus |
| [memory-bank/systemPatterns.md](memory-bank/systemPatterns.md) | Architecture patterns |

## Related Documentation

- [CLAUDE.md](CLAUDE.md) - Claude AI assistant guidelines and quick reference
- [docs/DESIGN_MASTER_PLAN.md](docs/DESIGN_MASTER_PLAN.md) - Overall architecture vision

---

## 1. ModelerAgent

**Role**: 3D Asset Factory

**Responsibility**: Converting text/image concepts into fully rigged and animated GLB files.

**Location**: `packages/content-gen/src/agents/ModelerAgent.ts`

**Tools**: Meshy AI API
- `POST /v1/text-to-image` - Concept art generation
- `POST /v1/image-to-3d` - 3D model from image
- `POST /v1/rigging` - Auto-rigging for characters
- `POST /v1/animations` - Animation generation

**Capabilities**:

| Asset Type | Concept Art | 3D Model | Rigging | Animations |
|------------|-------------|----------|---------|------------|
| `character` | 9:16, T-pose | 50K poly | Yes | IDLE, RUN, ATTACK, etc. |
| `tile` | 1:1 | 10K poly | No | No |
| `background` | 16:9 | No | No | No |

**Usage**:
```bash
# Full manifest processing
pnpm --filter @neo-tokyo/content-gen generate

# Specific asset
pnpm --filter @neo-tokyo/content-gen generate tiles/rooftop/base
pnpm --filter @neo-tokyo/content-gen generate characters/main/kai
```

**Manifest Schema** (CRITICAL - Do NOT invent fields):
```json
{
  "id": "kai",
  "name": "Kai",
  "type": "character",
  "description": "Protagonist from Crimson Academy",
  "textToImageTask": { "prompt": "...", "generateMultiView": true, "poseMode": "a-pose" },
  "multiImageTo3DTask": { "topology": "quad", "targetPolycount": 30000, "shouldRemesh": true },
  "riggingTask": { "heightMeters": 1.78 },
  "animationTask": { "preset": "hero" },
  "tasks": {},
  "seed": 2902765030
}
```

**NEVER add fields like**: `artStyle`, `visualPrompt`, `imageConfig`, `modelConfig`.

**Key Configuration** (`packages/content-gen/src/agents/ModelerAgent.ts`):
```typescript
const DEFAULTS = {
  image: { aiModel: 'nano-banana-pro', aspectRatio: '9:16', poseMode: 't-pose' },
  model: { aiModel: 'latest', topology: 'quad', targetPolycount: 50000, enablePbr: true },
  rigging: { heightMeters: 1.7 },
  animations: ['IDLE_COMBAT', 'RUN_IN_PLACE', 'ATTACK_MELEE_1', 'HIT_REACTION', 'DEATH']
};
```

---

## 2. ArtDirectorAgent

**Role**: 2D Concept & Background Artist

**Responsibility**: Generating high-fidelity 2D assets for backgrounds and storyboards.

**Location**: `packages/content-gen/src/agents/ArtDirectorAgent.ts`

**Tools**: Google Imagen (via `@google/genai`)

**Note**: Character concept art is now primarily handled by `ModelerAgent` via Meshy for tighter 3D pipeline integration. ArtDirector remains useful for:
- Scene backgrounds
- Storyboard frames
- UI concept art
- Marketing materials

---

## 3. NarrativeAgent (Planned)

**Role**: Storyteller

**Responsibility**: Generating quest text, dialogue, and flavor text.

**Tools**: LLM (Gemini/Claude)

**Status**: Not yet implemented

---

## 4. Hex Grid Utilities (NEW)

**Role**: Procedural Grid System

**Location**: `packages/game/src/utils/hex-grid.ts`

**Based On**: [Red Blob Games Hexagonal Grids](https://www.redblobgames.com/grids/hexagons/)

**Key Functions**:
```typescript
// Coordinate conversions
hexToWorld(hex: HexAxial, layout: HexLayout): WorldPosition
worldToHex(world: WorldPosition, layout: HexLayout): HexAxial
offsetToAxial(offset: HexOffset, orientation: HexOrientation): HexAxial

// Grid generation
generateRectGrid(width: number, height: number, layout: HexLayout): HexAxial[]
generateHexGrid(radius: number): HexAxial[]

// Algorithms
hexDistance(a: HexAxial, b: HexAxial): number
hexNeighbors(hex: HexAxial): HexAxial[]
hexRing(center: HexAxial, radius: number): HexAxial[]

// Three.js integration
createHexMatrix(hex: HexAxial, layout: HexLayout, rotation: number, scale: number): number[]
generateGridPositions(width: number, height: number, layout: HexLayout): [number, number, number][]
```

---

## 5. Hex Normalizer (NEW)

**Role**: GLTF Model Constraint System

**Location**: `packages/game/src/utils/hex-normalizer.ts`

**Purpose**: Force any 3D model to fit within exact hex tile dimensions regardless of original geometry.

**Key Functions**:
```typescript
// Main normalizer
normalizeToHex(gltf: GLTF, config: HexNormalizerConfig): NormalizedModel

// Geometry helpers
createStandardHexGeometry(hexSize: number, height: number, orientation: HexOrientation): CylinderGeometry

// Instanced mesh setup
setupHexInstancedMesh(mesh: InstancedMesh, positions: [number, number, number][], rotations?: number[], scales?: number[]): void
```

**Configuration**:
```typescript
interface HexNormalizerConfig {
  hexSize: number;           // Target hex outer radius
  orientation: 'pointy' | 'flat';
  targetHeight: number;      // Y-axis height
  overflowMode: 'scale' | 'clip' | 'mask';
  centerModel: boolean;
  alignToGround: boolean;
  padding: number;           // 0-1, percentage of hex size
}
```

---

## Agent Orchestration

Agents are invoked via the `content-gen` CLI. They do not run autonomously in the background but are triggered by build/generate commands to ensure human-in-the-loop verification.

### Workflow

```
manifest.json  →  ModelerAgent  →  Generated Assets
                       ↓
              Meshy AI API Calls
                       ↓
              concept.png, model.glb, rigged.glb, animations/
```

### Error Handling

The manifest tracks task status for resumability:
```json
{
  "tasks": {
    "conceptArt": { "taskId": "...", "status": "SUCCEEDED", "localPath": "concept.png" },
    "model3d": { "taskId": "...", "status": "SUCCEEDED", "localPath": "model.glb" },
    "rigging": { "taskId": "...", "status": "IN_PROGRESS" }
  }
}
```

Re-running `pnpm generate` skips completed tasks automatically.

---

## Future Considerations

### Reactylon Migration (ACTIVE)

Migration to **Reactylon** (custom React renderer for Babylon.js) is underway:
- **Navigation Mesh**: Built-in RecastJS plugin (replaces unmaintained YukaJS)
- **Physics**: Havok integration
- **React Binding**: [Reactylon](https://www.reactylon.com/docs) - newer, auto-disposal, XR support
- **MCP Tooling**: `babylonjs-mcp` for AI-assisted scene manipulation

See [docs/BABYLON_MIGRATION_PLAN.md](docs/BABYLON_MIGRATION_PLAN.md) for full implementation guide.

---

*Last Updated: 2025-01-15*
