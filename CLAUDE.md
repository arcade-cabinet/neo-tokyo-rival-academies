# Claude AI Assistant Guidelines

Welcome, Claude! This document provides specific context and guidelines for working on the Neo-Tokyo: Rival Academies project.

## Essential Reading (Before Touching Code)

| Document | Purpose |
|----------|---------|
| [docs/GENAI_PIPELINE.md](docs/GENAI_PIPELINE.md) | **CRITICAL**: Asset generation with Meshy AI |
| [docs/NARRATIVE_DESIGN.md](docs/NARRATIVE_DESIGN.md) | A/B/C story architecture, 3-hour JRPG |
| [docs/JRPG_TRANSFORMATION.md](docs/JRPG_TRANSFORMATION.md) | Stats, combat, progression |
| [docs/BABYLON_MIGRATION_PLAN.md](docs/BABYLON_MIGRATION_PLAN.md) | Upcoming Babylon.js migration |
| [docs/UI_DESIGN_SYSTEM.md](docs/UI_DESIGN_SYSTEM.md) | Faction-themed UI design tokens |

## Memory Bank (AI Context)

| Document | Purpose |
|----------|---------|
| [memory-bank/projectbrief.md](memory-bank/projectbrief.md) | Core project summary |
| [memory-bank/techContext.md](memory-bank/techContext.md) | Technical stack details |
| [memory-bank/activeContext.md](memory-bank/activeContext.md) | Current work focus |
| [memory-bank/systemPatterns.md](memory-bank/systemPatterns.md) | Architecture patterns |

## Additional References

| Document | Purpose |
|----------|---------|
| [docs/DESIGN_MASTER_PLAN.md](docs/DESIGN_MASTER_PLAN.md) | Vision, architecture, player journey |
| [docs/TESTING_STRATEGY.md](docs/TESTING_STRATEGY.md) | Unit, component, E2E testing approach |
| [AGENTS.md](AGENTS.md) | AI agent architecture |

---

## Project Context

**Neo-Tokyo: Rival Academies** is a **~3 hour Action JRPG** built with modern web technologies:
- Neon cyberpunk aesthetic (Neo-Tokyo setting)
- Isometric diorama view with hex-tile system
- GenAI-powered asset pipeline (Meshy AI for 3D models, animations)
- A/B/C Story architecture (main rivalry, parallel development, disruptor events)
- Multiple rival academies with unique characteristics

**Current State**: Implementing combat systems and preparing for Babylon.js migration.

---

## Technology Stack

### Core Framework
| Technology | Purpose | Key Files |
|------------|---------|-----------|
| **Vite** | Build toolchain, dev server | `packages/game/vite.config.ts` |
| **React 19** | UI and 3D component framework | `packages/game/src/` |
| **Three.js + R3F** | 3D rendering (current) | `packages/game/src/components/react/scenes/` |
| **Rapier** | Physics simulation | `@react-three/rapier` |
| **Miniplex** | Entity Component System | `packages/game/src/state/ecs.ts` |
| **Zustand** | UI state management | `packages/game/src/state/gameStore.ts` |
| **Biome** | Linting + formatting (NOT ESLint/Prettier) | `biome.json` |
| **PNPM 10** | Package management (NOT npm/yarn) | `pnpm-workspace.yaml` |

### GenAI Pipeline
| Technology | Purpose | Key Files |
|------------|---------|-----------|
| **Meshy AI** | Text-to-Image, Image-to-3D, Rigging, Animation | `packages/content-gen/src/api/meshy-client.ts` |
| **Manifest System** | Declarative asset definitions | `packages/game/public/assets/**/manifest.json` |

### Active: Reactylon Migration
| Technology | Purpose | Status |
|------------|---------|--------|
| **Babylon.js** | 3D engine with navigation mesh | ACTIVE |
| **Reactylon** | Custom React renderer for Babylon.js | ACTIVE |
| **RecastJS** | Built-in pathfinding (replaces YukaJS) | ACTIVE |

See [docs/BABYLON_MIGRATION_PLAN.md](docs/BABYLON_MIGRATION_PLAN.md) for implementation guide.

---

## Monorepo Structure

```
neo-tokyo-rival-academies/
├── packages/
│   ├── game/                          # React game client (Vite)
│   │   ├── public/assets/             # GenAI-generated assets
│   │   │   ├── characters/            # Character models + animations
│   │   │   │   ├── main/              # Kai, Vera (A-Story)
│   │   │   │   ├── b-story/           # Yakuza, Bikers
│   │   │   │   └── c-story/           # Mall Guard, Alien, Tentacle
│   │   │   ├── tiles/                 # Hex tile assets
│   │   │   └── backgrounds/           # Scene backgrounds
│   │   └── src/
│   │       ├── components/react/
│   │       │   ├── scenes/            # 3D scenes (IsometricScene, etc.)
│   │       │   ├── objects/           # 3D entities (Character, Enemy)
│   │       │   ├── ui/                # HUD, Menus, Dialogue
│   │       │   └── game/              # GameWorld, Managers
│   │       ├── systems/               # ECS Systems (Combat, Physics, etc.)
│   │       ├── state/                 # Miniplex ECS + Zustand
│   │       ├── content/               # Stage definitions
│   │       └── utils/                 # Hex grid, helpers
│   │
│   ├── content-gen/                   # GenAI toolchain
│   │   └── src/
│   │       ├── api/                   # Meshy AI client
│   │       ├── pipelines/             # Pipeline definitions
│   │       ├── tasks/                 # Animation presets
│   │       └── types/                 # Manifest schemas
│   │
│   └── e2e/                           # Playwright E2E tests
│
├── docs/                              # Design & architecture docs
├── memory-bank/                       # AI context files
└── README.md                          # Quick start guide
```

---

## Development Workflow

### Quick Commands
```bash
# Start game dev server
pnpm dev

# Generate GenAI assets
pnpm --filter @neo-tokyo/content-gen generate

# Run all checks (lint + format)
pnpm check

# Run tests
pnpm test

# Build for production
pnpm build
```

### GenAI Asset Pipeline (CRITICAL)

**Before Working on Assets:**
1. **Read** [docs/GENAI_PIPELINE.md](docs/GENAI_PIPELINE.md)
2. **Read** existing manifests (e.g., `packages/game/public/assets/characters/main/kai/manifest.json`)
3. **Follow** the exact manifest schema
4. **Never** invent new fields

**Manifest Schema:**
```json
{
  "id": "kai",
  "name": "Kai",
  "type": "character",
  "description": "Protagonist from Crimson Academy",
  "textToImageTask": {
    "prompt": "...",
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

**NEVER Invent Manifest Fields:**
Do NOT add fields like:
- ❌ `artStyle`
- ❌ `visualPrompt`
- ❌ `imageConfig`
- ❌ `modelConfig`

Use ONLY: `textToImageTask`, `multiImageTo3DTask`, `riggingTask`, `animationTask`.

**CLI Commands:**
```bash
pnpm --filter @neo-tokyo/content-gen generate characters/main/kai
pnpm --filter @neo-tokyo/content-gen generate tiles/rooftop/base
```

### Adding New Content

**New Character:**
1. Create `packages/game/public/assets/characters/<tier>/<name>/manifest.json`
2. Run `pnpm --filter @neo-tokyo/content-gen generate characters/<tier>/<name>`
3. Outputs: `concept.png`, `model.glb`, `rigged.glb`, `animations/*.glb`

**New Stage:**
1. Add stage config to `packages/game/src/content/stages.ts`
2. Create background assets in `packages/game/public/assets/backgrounds/`
3. Add stage logic to GameWorld.tsx

---

## Game Architecture

### Story Tiers (A/B/C)
- **A Story**: Kai vs Vera rivalry (8-10 major beats)
- **B Story**: Parallel character development, academy politics
- **C Story**: Disruptor events forcing team-ups (alien_ship, mall_drop)

### Stage System
```
intro_cutscene → sector7_streets → boss_ambush → rooftop_chase → summit_climb → final_battle → epilogue
                        ↓
                  [C-Story Triggers]
                        ↓
              alien_ship → mall_drop
```

### Characters (9 Generated)
| Tier | Characters | Preset |
|------|------------|--------|
| A-Story | Kai, Vera | hero (7 animations) |
| B-Story | Yakuza Grunt/Boss, Biker Grunt/Boss | enemy/boss |
| C-Story | Mall Guard, Alien Humanoid, Tentacle | enemy/prop |

---

## Implementation Roadmap

### Current Phase: Combat & Systems
- [ ] Combat system implementation
- [ ] Dialogue system integration
- [ ] JRPG HUD improvements (quest log, minimap)
- [ ] C-Story disruptor stage polish

### Next Phase: Babylon.js Migration
See **[docs/BABYLON_MIGRATION_PLAN.md](docs/BABYLON_MIGRATION_PLAN.md)** for full implementation guide:
- Isometric diorama camera setup
- Hex tile grid with clipping/bounding
- Navigation mesh (RecastJS)
- Parallax background panels

### Future Phase: Polish
- Sound design
- Visual effects
- Save/load system
- Mobile optimization

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
| E2E | Playwright | `packages/e2e/` |

Run: `pnpm test` (unit), `pnpm test:e2e` (end-to-end)

---

## CI/CD

- **PR Checks**: Biome lint, TypeScript compilation, Vite build
- **Deploy**: Automatic to GitHub Pages on merge to `main`
- **URL**: `https://arcade-cabinet.github.io/neo-tokyo-rival-academies`

---

## Key Reminders

1. **Use PNPM** - Never npm or yarn
2. **Use Biome** - Never ESLint or Prettier
3. **Use Vite** - NOT Astro (migrated)
4. **Asset paths** - Use `/assets/...` (public folder root)
5. **ECS patterns** - Use Miniplex for game logic, not React state
6. **Dispose resources** - Clean up Three.js objects in useEffect cleanup
7. **Check docs/** - Detailed design docs live there
8. **3-Hour Target** - Full JRPG with A/B/C story architecture

---

*Last Updated: 2026-01-15*
