# Gemini AI Assistant Guidelines

Welcome, Gemini! This document provides specific context and guidelines for working on the Neo-Tokyo: Rival Academies project.

## Quick Reference

| Document | Purpose |
|----------|---------|
| [docs/NARRATIVE_DESIGN.md](docs/NARRATIVE_DESIGN.md) | A/B/C story architecture, 3-hour JRPG |
| [docs/GENAI_PIPELINE.md](docs/GENAI_PIPELINE.md) | **CRITICAL**: Asset generation with Meshy AI |
| [docs/JRPG_TRANSFORMATION.md](docs/JRPG_TRANSFORMATION.md) | Stats, combat, progression |
| [docs/BABYLON_MIGRATION_PLAN.md](docs/BABYLON_MIGRATION_PLAN.md) | Upcoming Babylon.js migration |
| [docs/UI_DESIGN_SYSTEM.md](docs/UI_DESIGN_SYSTEM.md) | Faction-themed UI design tokens |
| [AGENTS.md](AGENTS.md) | AI agent architecture |

---

## Project Context

**Neo-Tokyo: Rival Academies** is a **~3 hour Action JRPG** built with modern web technologies:
- Neon cyberpunk aesthetic (Neo-Tokyo setting)
- Isometric diorama view with hex-tile system
- GenAI-powered asset pipeline (Meshy AI)
- A/B/C Story architecture (main rivalry, parallel development, disruptor events)
- Two rival academies: Kurenai (Crimson) vs Azure

**Current State**: Combat systems implementation, preparing for Babylon.js migration.

---

## Technology Stack

### Core Framework
| Technology | Purpose |
|------------|---------|
| **Vite** | Build toolchain, dev server |
| **React 19** | UI and 3D component framework |
| **Three.js 0.182 + R3F 9.x** | 3D rendering (current) |
| **Rapier** | Physics simulation |
| **Miniplex** | Entity Component System |
| **Zustand** | UI state management |
| **Biome** | Linting + formatting (NOT ESLint/Prettier) |
| **PNPM 10** | Package management (NOT npm/yarn) |

### GenAI Pipeline (CRITICAL)
| Technology | Purpose |
|------------|---------|
| **Meshy AI** | Text-to-Image, Image-to-3D, Rigging, Animation |
| **Manifest System** | Declarative JSON asset definitions |

**Read [docs/GENAI_PIPELINE.md](docs/GENAI_PIPELINE.md) before working with assets.**

---

## Monorepo Structure

```
neo-tokyo-rival-academies/
├── packages/
│   ├── game/                       # React game client (Vite)
│   │   ├── public/assets/          # GenAI-generated assets
│   │   │   ├── characters/         # 9 characters with animations
│   │   │   │   ├── main/           # Kai, Vera (A-Story heroes)
│   │   │   │   ├── b-story/        # Yakuza, Bikers
│   │   │   │   └── c-story/        # Mall Guard, Alien, Tentacle
│   │   │   ├── tiles/              # Hex tile models
│   │   │   └── backgrounds/        # Scene backgrounds
│   │   └── src/
│   │       ├── components/react/   # Scenes, Objects, UI
│   │       ├── state/              # Miniplex ECS + Zustand
│   │       └── utils/              # Hex grid, helpers
│   │
│   ├── content-gen/                # GenAI toolchain
│   │   ├── README.md               # Content-gen documentation
│   │   └── src/
│   │       ├── api/                # Meshy AI client
│   │       ├── pipelines/          # Pipeline definitions
│   │       ├── tasks/              # Animation presets, registry
│   │       └── types/              # Manifest Zod schemas
│   │
│   └── e2e/                        # Playwright E2E tests
│
├── docs/                           # Design & architecture docs
└── memory-bank/                    # AI context files
```

---

## GenAI Asset Pipeline

### Manifest Schema

Each asset has a `manifest.json` with this structure:

```json
{
  "id": "kai",
  "name": "Kai",
  "type": "character",
  "description": "Protagonist from Crimson Academy",
  "textToImageTask": {
    "prompt": "Young adult Japanese man, athletic build... HANDS: five fingers... FACE: defined features...",
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

### Animation Presets

| Preset | Use Case | Animations |
|--------|----------|------------|
| `hero` | Main characters (Kai, Vera) | 7 animations |
| `enemy` | Standard enemies | 5 animations |
| `boss` | Boss characters | 7 animations |
| `prop` | Non-humanoid props | Model only |

### CLI Commands

```bash
# Generate specific character
pnpm --filter @neo-tokyo/content-gen generate characters/main/kai

# Generate all assets in a category
pnpm --filter @neo-tokyo/content-gen generate characters/

# Generate tiles
pnpm --filter @neo-tokyo/content-gen generate tiles/rooftop/base
```

### CRITICAL: Never Invent Manifest Fields

The manifest schema is defined in `packages/content-gen/src/types/manifest.ts`. Do NOT add fields like:
- ❌ `artStyle`
- ❌ `visualPrompt`
- ❌ `imageConfig`
- ❌ `modelConfig`

Use ONLY the documented fields: `textToImageTask`, `multiImageTo3DTask`, `riggingTask`, `animationTask`.

---

## Game Architecture

### Story Tiers (A/B/C)
- **A Story**: Kai vs Vera rivalry (8-10 major beats)
- **B Story**: Parallel character development, academy politics
- **C Story**: Disruptor events forcing team-ups (alien_ship, mall_drop)

### 9 Stages
1. `intro_cutscene` - Prologue
2. `sector7_streets` - Tutorial platformer
3. `alien_ship` - **C-Story** Boss (4-8 tentacle agents)
4. `mall_drop` - **C-Story** Platformer (improvised weapons)
5. `boss_ambush` - A-Story boss
6. `rooftop_chase` - Main platformer
7. `summit_climb` - Auto-runner
8. `final_battle` - Final boss vs Vera
9. `epilogue` - Victory cutscene

---

## Development Workflow

### Quick Commands
```bash
# Start dev server
pnpm dev

# Generate assets (requires MESHY_API_KEY in .env)
pnpm --filter @neo-tokyo/content-gen generate

# Quality checks
pnpm check

# Tests
pnpm test
```

### Before Working on Assets

1. **Read** [docs/GENAI_PIPELINE.md](docs/GENAI_PIPELINE.md)
2. **Read** existing manifests (e.g., `characters/main/kai/manifest.json`)
3. **Follow** the exact manifest schema
4. **Never** invent new fields

---

## Code Style

### Critical Rules
- **Use PNPM** - Never npm or yarn
- **Use Biome** - Never ESLint or Prettier
- **Use Vite** - NOT Astro (migrated)
- **Use Miniplex** - For ECS game logic
- **Dispose resources** - Clean up Three.js objects

### TypeScript
```typescript
import type { FC } from 'react';
import { useFrame } from '@react-three/fiber';
import { hexToWorld } from '@/utils/hex-grid';

interface CharacterProps {
  position: [number, number, number];
}

export const Character: FC<CharacterProps> = ({ position }) => {
  // ...
};
```

---

## Testing

| Level | Tool | Command |
|-------|------|---------|
| Unit | Vitest | `pnpm test` |
| E2E | Playwright | `pnpm test:e2e` |

---

## Key Reminders

1. **Read GENAI_PIPELINE.md** before touching assets
2. **Follow manifest schema exactly** - No invented fields
3. **Use PNPM** - Never npm/yarn
4. **Use Biome** - Never ESLint/Prettier
5. **3-Hour JRPG** - Full A/B/C story architecture
6. **9 Characters** - All generated via Meshy AI

---

Last Updated: 2026-01-16
