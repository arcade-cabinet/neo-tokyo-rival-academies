# Claude AI Assistant Guidelines

Welcome, Claude! This document provides specific context and guidelines for working on the **Neo-Tokyo: Rival Academies** project.

## 🎯 Project Context

You are working on a **3D Action JRPG** built as a **Monorepo**.
- **Core Package**: `packages/game` (Vite + React + R3F)
- **Content Package**: `packages/content-gen` (Node.js CLI + Gemini)
- **Test Package**: `packages/e2e` (Playwright)

## 🔧 Technology Stack

- **Framework**: Vite (SPA) + React 19
- **3D**: Three.js + React Three Fiber + Drei
- **State/Logic**: Miniplex (ECS) + Zustand + Yuka (AI)
- **Mobile**: Capacitor
- **Tooling**: PNPM, Biome, Vitest, Playwright

## 🧠 Your Role & strengths

- **ECS Architect**: Design systems in `src/systems/` that operate on `src/state/ecs.ts`.
- **GenAI Integrator**: Use `packages/content-gen` to procedurally fill the game world.
- **Visual Stylist**: Maintain the Cel-Shaded/Cyberpunk aesthetic (`ToonMat`, `PostProcessing`).

## 📋 Common Tasks

### Task: Add a New Game System
1. Create `src/systems/MySystem.tsx`.
2. Use `useFrame` to iterate over entities: `const entities = ECS.world.with('myComponent')`.
3. Implement logic (Physics, AI, etc.).
4. Add to `GameWorld.tsx`.

### Task: Generate New Content
1. Update prompts in `packages/content-gen/src/game/prompts/`.
2. Run `pnpm gen:story` or `pnpm gen:assets`.
3. Verify output in `packages/game/src/data/story_gen.json`.

### Task: Debug Rendering
1. Check `GameWorld.tsx` loop.
2. Verify `ToonMat` usage (memoized).
3. Check `useEffect` for memory leaks (dispose geometries).

## 🚨 Critical Rules

1. **Monorepo Awareness**: Run commands with `pnpm --filter <package>`.
2. **Zero Stubs**: Fully implement logic.
3. **Strict Types**: No `any`. Use interfaces exported from `src/state/ecs.ts`.
4. **Performance**: Avoid `new Vector3` in `useFrame`. Use refs/pools.

## 📚 Reference
- `AGENTS.md` for broader agent rules.
- `docs/JRPG_TRANSFORMATION.md` for game design.
