# Claude AI Assistant Guidelines

Welcome, Claude! This document provides specific context and guidelines for working on the **Neo-Tokyo: Rival Academies** project.

**⚠️ CRITICAL UPDATE (Feb 2026): Ionic Angular + Babylon.js Stack**
You MUST follow the documentation hierarchy below. The project uses **Ionic Angular + Babylon.js + Capacitor** - NOT React, NOT Reactylon, NOT Three.js.

## 📚 Documentation Hierarchy (Golden Record)

1.  **START HERE**: [`docs/00-golden/MOBILE_WEB_GUIDE.md`](docs/00-golden/MOBILE_WEB_GUIDE.md) - Mobile-first constraints & Capacitor integration.
2.  **EXECUTION PLAN**: [`docs/00-golden/PHASE_ROADMAP.md`](docs/00-golden/PHASE_ROADMAP.md) - Chronological milestones.
3.  **DEPRECATIONS**: [`docs/00-golden/DEPRECATIONS.md`](docs/00-golden/DEPRECATIONS.md) - What to IGNORE.
4.  **MASTER INDEX**: [`docs/00-golden/GOLDEN_RECORD_MASTER.md`](docs/00-golden/GOLDEN_RECORD_MASTER.md) - Full system links.

## ⚠️ CRITICAL: Before Writing ANY Code

1. **Read `memory-bank/activeContext.md`** - Understand current state
2. **Read `memory-bank/progress.md`** - Know what's been done
3. **Verify architecture** - Code is in `src/`, NOT `packages/game/`
4. **Check Golden Record** - Ensure alignment with specs

## 🎯 Project Context

You are working on a **3D Action JRPG** built as a **single Ionic Angular app**.
- **Core App**: `src/` (Ionic + Angular + Babylon.js)
- **Shared Logic**: `src/lib/` (core systems, types, assets)
- **Content Generator**: `@agentic-dev-library/meshy-content-generator` (external OSS package)
- **E2E**: `e2e/` (Playwright)

## 🔧 Technology Stack (Current Truth)

- **Framework**: Ionic + Angular (zoneless)
- **3D**: Babylon.js (imperative, NOT React-based)
- **State/Logic**: Miniplex (ECS) + Zustand
- **Mobile**: Capacitor 8 (Mobile First)
- **Tooling**: PNPM, Biome, Karma/Jasmine, Playwright

### DEPRECATED (Do NOT Use)
- ❌ React / React Three Fiber / Reactylon
- ❌ Three.js
- ❌ Vite (for game)
- ❌ Vitest
- ❌ `packages/game/` directory

## 📋 Planning & Tracking

**USE MEMORY-BANK, NOT GitHub Issues/Projects**

- `memory-bank/activeContext.md` - Current focus
- `memory-bank/progress.md` - Work log
- `memory-bank/parity-assessment.md` - Porting status

## 🧠 Your Role & Strengths

- **ECS Architect**: Design systems in `src/lib/core/src/systems/` and `src/app/systems/`.
- **Babylon Expert**: Work with imperative Babylon.js in `src/app/engine/`.
- **GenAI Integrator**: Use external meshy-content-generator for assets.
- **Visual Stylist**: Maintain the Cel-Shaded/Flooded-World aesthetic.

## 🚨 Critical Rules

1. **Memory-Bank First**: ALL planning in memory-bank, NOT GitHub Issues.
2. **Mobile First**: All features must run at 60 FPS on Pixel 8a baseline.
3. **Single App**: Work directly in `src/`; no package filters.
4. **Zero Stubs**: Fully implement logic.
5. **Strict Types**: No `any`. Use interfaces from `src/lib/core/src/types/`.
6. **Verify Architecture**: Read memory-bank BEFORE writing code.

## 📚 Reference

- `AGENTS.md` for broader agent rules.
- `docs/00-golden/GOLDEN_RECORD_MASTER.md` for full design and architecture.
- `memory-bank/activeContext.md` for current state.
