# Claude AI Assistant Guidelines

Welcome, Claude! This document provides specific context and guidelines for working on the **Neo-Tokyo: Rival Academies** project.

**⚠️ CRITICAL UPDATE (Jan 2026): The Golden Record is Active**
You MUST follow the documentation hierarchy below. Previous instructions (pure Babylon without Reactylon, unseeded GenAI, YukaJS) are **DEPRECATED**.

## 📚 Documentation Hierarchy (Golden Record)

1.  **START HERE**: [`docs/MOBILE_WEB_GUIDE.md`](docs/MOBILE_WEB_GUIDE.md) - Mobile-first constraints & Capacitor integration.
2.  **EXECUTION PLAN**: [`docs/PHASE_ROADMAP.md`](docs/PHASE_ROADMAP.md) - Chronological milestones.
3.  **DEPRECATIONS**: [`docs/DEPRECATIONS.md`](docs/DEPRECATIONS.md) - What to IGNORE.
4.  **MASTER INDEX**: [`docs/GOLDEN_RECORD_MASTER.md`](docs/GOLDEN_RECORD_MASTER.md) - Full system links.

## 🎯 Project Context

You are working on a **3D Action JRPG** built as a **Monorepo**.
- **Core Package**: `packages/game` (Vite + React + Babylon/Reactylon)
- **Content Package**: `packages/content-gen` (Node.js CLI + Meshy)
- **Test Package**: `packages/e2e` (Playwright)

## 🔧 Technology Stack

- **Framework**: Vite (SPA) + React 19
- **3D**: Babylon.js + Reactylon (Replaces Three/R3F)
- **State/Logic**: Miniplex (ECS) + Zustand + Navigation V2 (Replaces Yuka)
- **Mobile**: Capacitor (Mobile First)
- **Tooling**: PNPM, Biome, Vitest, Playwright

## 🧠 Your Role & Strengths

- **ECS Architect**: Design systems in `src/systems/` that operate on `src/state/ecs.ts`.
- **GenAI Integrator**: Use `packages/content-gen` to procedurally fill the game world via build-time manifests.
- **Visual Stylist**: Maintain the Cel-Shaded/Cyberpunk aesthetic.

## 🚨 Critical Rules

1. **Governance**: All changes must be tracked on GitHub Projects/Issues.
2. **Mobile First**: All features must run at 60 FPS on Pixel 8a baseline.
3. **Monorepo Awareness**: Run commands with `pnpm --filter <package>`.
4. **Zero Stubs**: Fully implement logic.
5. **Strict Types**: No `any`. Use interfaces exported from `src/state/ecs.ts`.

## 📚 Reference
- `AGENTS.md` for broader agent rules.
- `docs/GOLDEN_RECORD_MASTER.md` for full design and architecture.