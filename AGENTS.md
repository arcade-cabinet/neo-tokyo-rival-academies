# AI Agent Documentation

This document provides guidelines and context for AI coding agents working on the Neo-Tokyo: Rival Academies project.

## 🎯 Project Overview

**Neo-Tokyo: Rival Academies** is a **3D Action JRPG** built with modern web technologies. The game features immersive 3D cel-shaded graphics powered by Three.js and React Three Fiber, delivered through a performant Astro-based architecture.

### Core Technologies

- **Astro 5.x**: Static site generator with partial hydration
- **React 19**: For interactive 3D components
- **Three.js 0.182**: Core 3D graphics library
- **React Three Fiber 9.x**: React renderer for Three.js
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
5.  **VISUAL STYLE**: Use `meshToonMaterial` for characters and assets to maintain the cel-shaded anime aesthetic.

## 🏗️ Architecture Principles

### 1. ECS Architecture (Miniplex)
- Game logic lives in `src/systems/`.
- State lives in `src/state/ecs.ts`.
- React components in `src/components/react/game/` should primarily render based on ECS state.

### 2. Directory Structure
```
src/
├── components/react/   # React components
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
- E2E Verification: `python3 scripts/verify_rpg_gameplay.py`

## 🎮 Game Context (JRPG)

The game is a high-speed Action JRPG.
- **Stats**: Structure, Ignition, Logic, Flow.
- **Combat**: Real-time with RPG damage calculations.
- **Story**: Data-driven Visual Novel style dialogue overlay (`src/data/story.json`).
- **Visuals**: Cel-shaded characters with animated physics.

Always refer to `docs/JRPG_TRANSFORMATION.md` for design details.
