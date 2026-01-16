# GitHub Copilot Instructions

This file provides context for GitHub Copilot when suggesting code for the Neo-Tokyo: Rival Academies project.

## Essential Reading (Before Touching Code)

| Document | Purpose |
|----------|---------|
| [docs/GENAI_PIPELINE.md](../docs/GENAI_PIPELINE.md) | **CRITICAL**: Asset generation with Meshy AI |
| [docs/NARRATIVE_DESIGN.md](../docs/NARRATIVE_DESIGN.md) | A/B/C story architecture, 3-hour JRPG |
| [docs/JRPG_TRANSFORMATION.md](../docs/JRPG_TRANSFORMATION.md) | Stats, combat, progression |
| [docs/BABYLON_MIGRATION_PLAN.md](../docs/BABYLON_MIGRATION_PLAN.md) | Upcoming Babylon.js migration |
| [docs/UI_DESIGN_SYSTEM.md](../docs/UI_DESIGN_SYSTEM.md) | Faction-themed UI design tokens |

## Memory Bank (AI Context)

| Document | Purpose |
|----------|---------|
| [memory-bank/projectbrief.md](../memory-bank/projectbrief.md) | Core project summary |
| [memory-bank/techContext.md](../memory-bank/techContext.md) | Technical stack details |
| [memory-bank/activeContext.md](../memory-bank/activeContext.md) | Current work focus |
| [memory-bank/systemPatterns.md](../memory-bank/systemPatterns.md) | Architecture patterns |

---

## Project Overview

**Neo-Tokyo: Rival Academies** is a **~3 hour Action JRPG** built with:
- **Vite** - Build toolchain (NOT Astro - migrated)
- **React 19** - UI and 3D components
- **Three.js 0.182 + R3F 9.x** - 3D rendering
- **Miniplex** - Entity Component System
- **Zustand** - UI state management
- **PNPM 10** - Package manager (NOT npm/yarn)
- **Biome** - Linter/formatter (NOT ESLint/Prettier)
- **TypeScript 5.x** - Strict mode enabled

---

## GenAI Asset Pipeline (CRITICAL)

### Before Working on Assets

1. **Read** [docs/GENAI_PIPELINE.md](../docs/GENAI_PIPELINE.md)
2. **Read** existing manifests (e.g., `packages/game/public/assets/characters/main/kai/manifest.json`)
3. **Follow** the exact manifest schema
4. **Never** invent new fields

### Manifest Schema

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

### NEVER Invent Manifest Fields

Do NOT add fields like:
- ❌ `artStyle`
- ❌ `visualPrompt`
- ❌ `imageConfig`
- ❌ `modelConfig`

Use ONLY: `textToImageTask`, `multiImageTo3DTask`, `riggingTask`, `animationTask`.

### CLI Commands

```bash
pnpm --filter @neo-tokyo/content-gen generate characters/main/kai
pnpm --filter @neo-tokyo/content-gen generate tiles/rooftop/base
```

---

## Monorepo Structure

```
neo-tokyo-rival-academies/
├── packages/
│   ├── game/                       # React game client (Vite)
│   │   ├── public/assets/          # GenAI-generated assets
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
│   │       ├── tasks/              # Animation presets
│   │       └── types/              # Manifest Zod schemas
│   │
│   └── e2e/                        # Playwright E2E tests
│
├── docs/                           # Design & architecture docs
├── memory-bank/                    # AI context files
└── README.md
```

---

## Code Style & Conventions

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

### Imports
- Use ES6 imports
- Use path aliases: `@/`, `@components/`, `@utils/`
- Type-only imports: `import type { FC } from 'react';`

### Formatting
- Single quotes for strings
- Semicolons required
- 2 space indentation
- Use Biome's rules (see `biome.json`)

---

## Game Architecture

### Story Tiers (A/B/C)
- **A Story**: Kai vs Vera rivalry (8-10 major beats)
- **B Story**: Parallel character development
- **C Story**: Disruptor events (alien_ship, mall_drop)

### 9 Characters
| Tier | Characters | Preset |
|------|------------|--------|
| A-Story | Kai, Vera | hero (7 animations) |
| B-Story | Yakuza Grunt/Boss, Biker Grunt/Boss | enemy/boss |
| C-Story | Mall Guard, Alien Humanoid, Tentacle | enemy/prop |

---

## Commands Reference

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production

# Code Quality
pnpm check            # Run Biome checks

# Tests
pnpm test             # Unit tests (Vitest)
pnpm test:e2e         # E2E tests (Playwright)

# GenAI
pnpm --filter @neo-tokyo/content-gen generate <path>
```

---

## DO / DON'T

### DO
- ✅ Read docs/GENAI_PIPELINE.md before touching assets
- ✅ Read memory-bank/ for project context
- ✅ Use PNPM commands
- ✅ Use Biome for linting/formatting
- ✅ Use TypeScript with proper types
- ✅ Use Miniplex for ECS game logic
- ✅ Dispose Three.js resources
- ✅ Follow existing manifest schema exactly

### DON'T
- ❌ Use npm or yarn
- ❌ Use ESLint or Prettier
- ❌ Use `any` type
- ❌ Invent new manifest fields
- ❌ Create memory leaks
- ❌ Skip reading the docs

---

*Last Updated: 2026-01-15*
