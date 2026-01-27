# AI Agent Documentation & Governance

**⚠️ CRITICAL UPDATE (Jan 2026): The Golden Record is Active**
All agents MUST follow the documentation hierarchy below. The project is migrating from Three.js/R3F to Babylon.js/Reactylon - follow the current stack in this document.

## 📚 Documentation Hierarchy (Golden Record)

1.  **START HERE**: [`docs/00-golden/MOBILE_WEB_GUIDE.md`](docs/00-golden/MOBILE_WEB_GUIDE.md) - Mobile-first constraints & Capacitor integration.
2.  **EXECUTION PLAN**: [`docs/00-golden/PHASE_ROADMAP.md`](docs/00-golden/PHASE_ROADMAP.md) - Chronological milestones.
3.  **DEPRECATIONS**: [`docs/00-golden/DEPRECATIONS.md`](docs/00-golden/DEPRECATIONS.md) - What to IGNORE.
4.  **MASTER INDEX**: [`docs/00-golden/GOLDEN_RECORD_MASTER.md`](docs/00-golden/GOLDEN_RECORD_MASTER.md) - Full system links.

## 🚨 Governance & Workflow

1.  **GitHub Projects**: All tasks MUST be tracked on the GitHub Project board.
2.  **Issues First**: No code changes without an associated Issue.
    - Create an Issue if one doesn't exist.
    - Link PRs to Issues.
3.  **Governance Doc**: See [`docs/AGENT_GOVERNANCE.md`](docs/AGENT_GOVERNANCE.md) for detailed workflow.

## 🎯 Project Overview

**Neo-Tokyo: Rival Academies** is a **3D Action JRPG** built with modern web technologies. The game features immersive 3D cel-shaded graphics powered by Babylon.js and Reactylon, delivered through a performant Vite-based SPA architecture.

### Core Technologies

- **Vite 6.x**: Fast build tooling with HMR
- **React 19**: For interactive 3D components
- **Babylon.js / Reactylon**: Core 3D engine (Replacing Three.js/R3F)
- **Miniplex**: Entity Component System (ECS) for game logic
- **PNPM 10**: Package manager (Strictly use `pnpm`)
- **Biome 2.3**: Linter and formatter (Strictly use `pnpm check`)
- **Vitest**: Unit testing framework
- **Capacitor 8**: Native mobile wrapper

## 🚨 CRITICAL RULES FOR AGENTS

1.  **ZERO STUBS POLICY**: Do not write `// TODO` or empty functions. If a feature is in the plan, implement it fully. If it is too complex, break it down, but do not leave broken code.
2.  **PRODUCTION QUALITY**: Code must be modular, strictly typed (TypeScript, no `any`, no `@ts-ignore`), and commented.
3.  **VERIFY EVERYTHING**: After every file change, read the file back to ensure correctness. After every feature, run tests.
4.  **TEST DRIVEN**: Write tests for logic systems *before* or *during* implementation.
5.  **VISUAL STYLE**: Use `meshToonMaterial` (or Babylon equivalent) for characters and assets to maintain the cel-shaded anime aesthetic.
6.  **MOBILE FIRST**: All features must run at 60 FPS on Pixel 8a baseline. See `docs/00-golden/MOBILE_WEB_GUIDE.md`.

## 🏗️ Architecture Principles

### 1. ECS Architecture (Miniplex)
- Game logic lives in `src/systems/`.
- State lives in `src/state/ecs.ts`.
- React components in `src/components/react/game/` should primarily render based on ECS state.

### 2. Directory Structure
```text
src/
├── components/react/   # React components (Reactylon)
│   ├── objects/       # 3D Objects (Character, Enemy)
│   ├── ui/            # HUD, Menus
│   └── game/          # Game World & Managers
├── systems/           # ECS Systems (Logic: Physics, Combat, AI)
├── state/             # Global State (ECS, Zustand)
├── data/              # Static Data (JSON)
└── utils/             # Helpers
```

## 🧪 Testing Strategy

- Run unit tests: `pnpm test`
- Lint code: `pnpm check`
- E2E Verification: `pnpm test:e2e` (Playwright)

## 🎮 Game Context (JRPG)

The game is a high-speed Action JRPG.
- **Stats**: Structure, Ignition, Logic, Flow.
- **Combat**: Real-time with RPG damage calculations.
- **Story**: Data-driven Visual Novel style dialogue overlay (`src/data/story.json`).
- **Visuals**: Cel-shaded characters with animated physics.

Always refer to `docs/00-golden/GOLDEN_RECORD_MASTER.md` for design details.
