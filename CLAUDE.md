# Claude AI Assistant Guidelines

Welcome, Claude! This document provides specific context and guidelines for working on the Neo-Tokyo: Rival Academies project.

## Quick Reference

| Document | Purpose |
|----------|---------|
| [docs/DESIGN_MASTER_PLAN.md](docs/DESIGN_MASTER_PLAN.md) | Vision, architecture, player journey |
| [docs/GENAI_PIPELINE.md](docs/GENAI_PIPELINE.md) | Asset generation workflow with Meshy AI |
| [docs/PROTOTYPE_STRATEGY.md](docs/PROTOTYPE_STRATEGY.md) | Isometric vs Side-Scroll evaluation |
| [docs/JRPG_TRANSFORMATION.md](docs/JRPG_TRANSFORMATION.md) | Stats, combat, progression systems |
| [docs/TESTING_STRATEGY.md](docs/TESTING_STRATEGY.md) | Unit, component, E2E testing approach |
| [AGENTS.md](AGENTS.md) | AI agent architecture (ModelerAgent, ArtDirectorAgent) |
| [PROJECT-STRUCTURE.md](PROJECT-STRUCTURE.md) | Full directory layout and conventions |

---

## Project Context

You're working on a **3D Action-JRPG** built with modern web technologies. The game runs in the browser and features:
- Neon cyberpunk aesthetic (Neo-Tokyo setting)
- Isometric diorama view with hex-tile system (current prototype)
- GenAI-powered asset pipeline (Meshy AI for 3D models, animations)
- Multiple rival academies with unique characteristics

**Current State**: Implementing hex-grid tile system with GenAI-generated 3D tile models.

---

## Technology Stack

### Core Framework
| Technology | Purpose | Key Files |
|------------|---------|-----------|
| **Astro** | Static site generation, island architecture | `packages/game/astro.config.mjs` |
| **React** | Interactive 3D components (islands) | `packages/game/src/components/react/` |
| **Three.js + R3F** | 3D rendering, declarative scene graphs | `packages/game/src/components/react/scenes/` |
| **Rapier** | Physics simulation | `@react-three/rapier` |
| **Biome** | Linting + formatting (NOT ESLint/Prettier) | `biome.json` |
| **PNPM 10** | Package management (NOT npm/yarn) | `pnpm-workspace.yaml` |

### GenAI Pipeline
| Technology | Purpose | Key Files |
|------------|---------|-----------|
| **Meshy AI** | Text-to-Image, Image-to-3D, Rigging, Animation | `packages/content-gen/src/agents/ModelerAgent.ts` |
| **Google Imagen** | Background/storyboard generation | `packages/content-gen/src/agents/ArtDirectorAgent.ts` |
| **Manifest System** | Declarative asset definitions | `packages/game/public/assets/**/manifest.json` |

---

## Monorepo Structure

```
neo-tokyo-rival-academies/
├── packages/
│   ├── game/                          # React Three Fiber game client
│   │   ├── public/assets/             # GenAI-generated assets (organized)
│   │   │   ├── characters/            # Character models + animations
│   │   │   │   └── main/kai/          # Example: rigged.glb, animations/
│   │   │   ├── tiles/                 # Hex tile assets (NEW)
│   │   │   │   └── rooftop/           # base/, airvent/, pipes/, etc.
│   │   │   └── backgrounds/           # Scene backgrounds
│   │   │       └── sector0/           # wall_left/, wall_right/, parallax_far/
│   │   └── src/
│   │       ├── components/react/
│   │       │   └── scenes/
│   │       │       └── IsometricScene.tsx  # Main scene with hex grid
│   │       └── utils/
│   │           ├── hex-grid.ts        # Red Blob Games hex utilities (NEW)
│   │           └── hex-normalizer.ts  # GLTF model normalization (NEW)
│   │
│   └── content-gen/                   # Node.js GenAI toolchain
│       └── src/
│           ├── agents/
│           │   ├── ModelerAgent.ts    # Primary 3D asset factory
│           │   └── ArtDirectorAgent.ts
│           ├── types/
│           │   └── manifest.ts        # Asset manifest schema
│           └── cli.ts                 # `pnpm generate` entry point
│
├── docs/                              # Design & architecture docs
├── CLAUDE.md                          # This file
├── AGENTS.md                          # AI agent architecture
└── README.md                          # Quick start guide
```

---

## Key Codebase Tools

### Hex Grid System (`packages/game/src/utils/`)

**`hex-grid.ts`** - Comprehensive hex grid utilities based on Red Blob Games:
- Coordinate systems: Axial (q,r), Cube (q,r,s), Offset (col,row)
- Conversions: `hexToWorld()`, `worldToHex()`, `offsetToAxial()`
- Grid generation: `generateRectGrid()`, `generateHexGrid()`
- Algorithms: `hexDistance()`, `hexNeighbors()`, `hexRing()`
- Three.js integration: `createHexMatrix()`, `generateGridPositions()`

**`hex-normalizer.ts`** - Force-fit any GLTF model to hex constraints:
- `normalizeToHex()` - Scale/center any model to exact hex dimensions
- `createStandardHexGeometry()` - Generate perfect hex cylinder
- `setupHexInstancedMesh()` - Efficient instanced rendering
- Supports clipping modes: `scale`, `clip`, `mask`

### GenAI Asset Pipeline (`packages/content-gen/`)

**CLI Commands:**
```bash
# Generate all assets from manifest
pnpm --filter @neo-tokyo/content-gen generate

# Generate specific asset path
pnpm --filter @neo-tokyo/content-gen generate tiles/rooftop/base
pnpm --filter @neo-tokyo/content-gen generate characters/main/kai
```

**Asset Types Supported:**
- `character` - Full pipeline: concept → 3D → rig → animations
- `background` - 2D concept art only (16:9 aspect)
- `tile` - Concept + 3D model (1:1 aspect, 10K polycount)

### Scene Components (`packages/game/src/components/react/scenes/`)

**`IsometricScene.tsx`** - Current main scene:
- `HexTileFloor` - Instanced hex tiles with texture variety
- `TileInstanceGroup` - Per-tile-type instanced meshes
- `WallBackdrops` - FF7-style 2.5D parallax backgrounds
- `KaiCharacter` - Animated player with physics + WASD controls
- Leva controls for camera adjustment

---

## Development Workflow

### Quick Commands
```bash
# Start game dev server
pnpm --filter @neo-tokyo/game dev

# Generate GenAI assets
pnpm --filter @neo-tokyo/content-gen generate

# Run all checks (lint + format)
pnpm check

# Run tests
pnpm test
```

### Adding New Content

**New Tile Type:**
1. Create `packages/game/public/assets/tiles/<category>/<type>/manifest.json`
2. Run `pnpm --filter @neo-tokyo/content-gen generate tiles/<category>/<type>`
3. Update `IsometricScene.tsx` to include new texture path

**New Character:**
1. Create `packages/game/public/assets/characters/<faction>/<name>/manifest.json`
2. Run `pnpm --filter @neo-tokyo/content-gen generate characters/<faction>/<name>`
3. Outputs: `concept.png`, `model.glb`, `rigged.glb`, `animations/*.glb`

### Manifest Schema
```json
{
  "name": "Rooftop Base Tile",
  "type": "tile",
  "visualPrompt": "cyberpunk rooftop floor tile, industrial metal grating...",
  "imageConfig": { "aspectRatio": "1:1" },
  "modelConfig": { "targetPolycount": 10000 }
}
```

---

## Architecture Decisions

### Current: Three.js + React Three Fiber
- Mature React ecosystem
- Strong community and documentation
- YukaJS for AI/pathfinding (note: library is unmaintained)

### Under Evaluation: Babylon.js Migration
Research conducted on potential migration benefits:
- Built-in RecastJS navigation mesh (replaces dead YukaJS)
- Havok physics engine
- `react-babylonjs` provides similar declarative API
- `babylonjs-mcp` enables AI-assisted scene manipulation

**Decision**: Pending user evaluation. Current Three.js implementation continues.

---

## Common Tasks

### Create New 3D Scene
1. Create `packages/game/src/components/react/scenes/YourScene.tsx`
2. Import Three.js/R3F primitives and Drei helpers
3. Export component
4. Use in Astro page with `client:load` directive

### Debug Rendering Issues
1. Check browser console for Three.js warnings
2. Verify asset paths (should be `/assets/...` not `/public/assets/...`)
3. Check WebGL context: `gl.getError()` in console
4. Ensure Suspense boundaries for async asset loading
5. Monitor canvas dimensions and pixel ratio

### Optimize Performance
- Use `useMemo` for geometries and materials
- Implement instanced meshes for repeated objects (see `TileInstanceGroup`)
- Dispose resources on unmount
- Use LOD for distant objects
- Profile with Chrome DevTools Performance tab

---

## Code Style

### TypeScript
```typescript
// Always type props
interface HexTileProps {
  position: [number, number, number];
  tileType: number;
}

// Use FC for functional components
export const HexTile: FC<HexTileProps> = ({ position, tileType }) => {
  // ...
};
```

### Imports
```typescript
// Organize: types first, then external, then internal
import type { FC } from 'react';
import { useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

import { hexToWorld } from '@/utils/hex-grid';
```

---

## Testing

| Level | Tool | Location |
|-------|------|----------|
| Unit | Vitest | `packages/game/src/**/__tests__/` |
| Component | RTL | `packages/game/src/components/__tests__/` |
| E2E | Playwright | `test/` |

Run: `pnpm test` (unit), `pnpm test:e2e` (end-to-end)

---

## CI/CD

- **PR Checks**: Biome lint, TypeScript compilation, Astro build
- **Deploy**: Automatic to GitHub Pages on merge to `main`
- **URL**: `https://arcade-cabinet.github.io/neo-tokyo-rival-academies`

---

## Key Reminders

1. **Use PNPM** - Never npm or yarn
2. **Use Biome** - Never ESLint or Prettier
3. **Asset paths** - Use `/assets/...` (public folder root)
4. **Client directives** - Always `client:load` for 3D components
5. **Dispose resources** - Clean up Three.js objects in useEffect cleanup
6. **Check docs/** - Detailed design docs live there

---

*Last Updated: 2025-01-15*
