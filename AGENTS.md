# AI Agent Documentation

This document provides guidelines and context for AI coding agents working on the Neo-Tokyo: Rival Academies project.

## 🎯 Project Overview

**Neo-Tokyo: Rival Academies** is a **3D Action JRPG** built with modern web technologies. The game features immersive 3D graphics powered by Three.js and React Three Fiber, delivered through a performant Astro-based architecture.

### Core Technologies

- **Astro 4.x**: Static site generator with partial hydration
- **React 18.3**: For interactive 3D components
- **Three.js 0.170**: Core 3D graphics library
- **React Three Fiber 8.x**: React renderer for Three.js
- **Miniplex**: Entity Component System (ECS) for game logic
- **PNPM 10**: Package manager
- **Biome 1.9.4**: Linter and formatter
- **Vitest**: Unit testing framework

## 🚨 CRITICAL RULES FOR AGENTS

1.  **ZERO STUBS POLICY**: Do not write `// TODO` or empty functions. If a feature is in the plan, implement it fully. If it is too complex, break it down, but do not leave broken code.
2.  **PRODUCTION QUALITY**: Code must be modular, typed (TypeScript), and commented.
3.  **VERIFY EVERYTHING**: After every file change, read the file back to ensure correctness. After every feature, run tests.
4.  **TEST DRIVEN**: Write tests for logic systems *before* or *during* implementation.

## 🏗️ Architecture Principles

### 1. ECS Architecture (Miniplex)
- Game logic lives in `src/systems/`.
- State lives in `src/state/ecs.ts`.
- React components in `src/components/react/game/` should primarily render based on ECS state.

### 2. Directory Structure
```
src/
├── components/react/   # React components
│   ├── scenes/        # 3D Scenes
│   ├── ui/            # HUD, Menus
│   └── game/          # Game Objects (Player, Enemy)
├── systems/           # ECS Systems (Logic)
├── state/             # Global State (ECS, Zustand)
├── data/              # Static Data (JSON)
└── utils/             # Helpers
```

## 🧪 Testing Strategy

- Run unit tests: `pnpm test`
- Lint code: `pnpm check`

## 🎮 Game Context (JRPG)

The game is a high-speed Action JRPG.
- **Stats**: Structure, Ignition, Logic, Flow.
- **Combat**: Real-time with RPG damage calculations.
- **Story**: Visual Novel style dialogue overlay.

Always refer to `docs/JRPG_TRANSFORMATION.md` for design details.
