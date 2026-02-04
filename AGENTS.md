# AI Agent Documentation & Governance

**⚠️ CRITICAL UPDATE (Feb 2026): Ionic Angular + Babylon.js Stack**
All agents MUST follow the documentation hierarchy below. The project uses **Ionic Angular + Babylon.js + Capacitor** - NOT React, NOT Reactylon, NOT Three.js.

## 📚 Documentation Hierarchy (Golden Record)

1.  **START HERE**: [`docs/00-golden/MOBILE_WEB_GUIDE.md`](docs/00-golden/MOBILE_WEB_GUIDE.md) - Mobile-first constraints & Capacitor integration.
2.  **EXECUTION PLAN**: [`docs/00-golden/PHASE_ROADMAP.md`](docs/00-golden/PHASE_ROADMAP.md) - Chronological milestones.
3.  **DEPRECATIONS**: [`docs/00-golden/DEPRECATIONS.md`](docs/00-golden/DEPRECATIONS.md) - What to IGNORE.
4.  **MASTER INDEX**: [`docs/00-golden/GOLDEN_RECORD_MASTER.md`](docs/00-golden/GOLDEN_RECORD_MASTER.md) - Full system links.

## 🚨 Governance & Workflow

1.  **Memory Bank Tracking**: ALL planning and task tracking MUST use `memory-bank/` directory.
2.  **NO GitHub Issues/Projects**: Do NOT use GitHub Issues or Projects for planning. Memory-bank is the sole source of truth.
3.  **Main Branch Workflow**: Work directly on `main` unless owner requests a PR.
4.  **Governance Doc**: See [`docs/process/AGENT_GOVERNANCE.md`](docs/process/AGENT_GOVERNANCE.md) for detailed workflow.

## ⚠️ CRITICAL: Architecture Verification

**BEFORE writing any code**, verify you understand the current architecture:
1. Read `memory-bank/activeContext.md` for current state
2. Read `memory-bank/progress.md` for completed work
3. Confirm the stack: **Ionic Angular + Babylon.js** (imperative, NOT React)
4. Code lives in `src/` (NOT `packages/game/` which is deleted)

## 🎯 Project Overview

**Neo-Tokyo: Rival Academies** is a **3D Action JRPG** built with Ionic Angular and Babylon.js. The game features immersive 3D cel-shaded graphics delivered through a performant mobile-first architecture.

### Core Technologies (Current Truth)

- **Ionic + Angular (zoneless)**: UI framework and routing
- **Babylon.js**: 3D engine (imperative, NOT React-based)
- **Miniplex**: Entity Component System (ECS) for game logic
- **Zustand**: UI state management
- **Capacitor 8**: Native mobile wrapper (Android/iOS)
- **PNPM 10**: Package manager (Strictly use `pnpm`)
- **Biome 2.3**: Linter and formatter (Strictly use `pnpm check`)
- **Karma/Jasmine**: Unit testing framework
- **Playwright**: E2E testing

### DEPRECATED Technologies (Do NOT Use)
- ❌ React / React Three Fiber
- ❌ Reactylon
- ❌ Three.js
- ❌ Vite (for game package)
- ❌ `packages/game/` directory (deleted)

## 🚨 CRITICAL RULES FOR AGENTS

1.  **ZERO STUBS POLICY**: Do not write `// TODO` or empty functions. If a feature is in the plan, implement it fully. If it is too complex, break it down, but do not leave broken code.
2.  **PRODUCTION QUALITY**: Code must be modular, strictly typed (TypeScript, no `any`, no `@ts-ignore`), and commented.
3.  **VERIFY EVERYTHING**: After every file change, read the file back to ensure correctness. After every feature, run tests.
4.  **TEST DRIVEN**: Write tests for logic systems *before* or *during* implementation.
5.  **VISUAL STYLE**: Use `meshToonMaterial` (or Babylon equivalent) for characters and assets to maintain the cel-shaded anime aesthetic.
6.  **MOBILE FIRST**: All features must run at 60 FPS on Pixel 8a baseline. See `docs/00-golden/MOBILE_WEB_GUIDE.md`.

## 🏗️ Architecture Principles

### 1. ECS Architecture (Miniplex)
- Game logic lives in `src/lib/core/src/systems/` and `src/app/systems/`.
- State lives in `src/lib/core/src/state/` and `src/app/state/`.
- Angular components in `src/app/ui/` render based on ECS state.

### 2. Directory Structure (Current)
```text
src/
├── app/
│   ├── engine/        # Babylon.js scene services
│   ├── game-shell/    # Game container component
│   ├── state/         # Angular state services
│   ├── systems/       # Game logic systems
│   ├── ui/            # Angular UI components
│   └── utils/         # Helpers
├── lib/
│   ├── core/          # Shared ECS logic
│   ├── diorama/       # Legacy diorama components (for reference)
│   └── world-gen/     # World generation
└── assets/            # Game assets
```

### 3. DELETED Directories (Do NOT Reference)
- `packages/game/` - Deleted, was React/Vite
- `packages/e2e/` - Moved to `e2e/`
- `apps/` - Archived to `_legacy/apps/`

## 🧪 Testing Strategy

- Run unit tests: `pnpm test --watch=false`
- Lint code: `pnpm check`
- E2E Verification: `pnpm test:e2e` (Playwright)
- Build: `pnpm build`

## 📋 Memory Bank Usage

**ALL planning and tracking uses memory-bank, NOT GitHub Issues.**

### Key Files
- `memory-bank/activeContext.md` - Current focus and active work
- `memory-bank/progress.md` - Completed work log
- `memory-bank/parity-assessment.md` - Legacy porting status
- `memory-bank/parity-matrix.md` - Component mapping

### Workflow
1. Read `activeContext.md` before starting work
2. Update `progress.md` after completing work
3. Update `activeContext.md` with next steps
4. Commit changes to memory-bank with code changes

## 🎮 Game Context (JRPG)

The game is a high-speed Action JRPG.
- **Stats**: Structure, Ignition, Logic, Flow.
- **Combat**: Real-time with RPG damage calculations.
- **Story**: Data-driven Visual Novel style dialogue overlay (`src/data/story.json`).
- **Visuals**: Cel-shaded characters with animated physics.

Always refer to `docs/00-golden/GOLDEN_RECORD_MASTER.md` for design details.
