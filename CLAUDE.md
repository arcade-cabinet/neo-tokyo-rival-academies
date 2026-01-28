# Claude AI Assistant Guidelines

Welcome, Claude! This document provides specific context and guidelines for working on the **Neo-Tokyo: Rival Academies** project.

**⚠️ CRITICAL UPDATE (Jan 2026): The Golden Record is Active**
You MUST follow the documentation hierarchy below. Previous instructions (pure Babylon without Reactylon, unseeded GenAI, YukaJS) are **DEPRECATED**.

## 📚 Documentation Hierarchy (Golden Record)

1.  **START HERE**: [`docs/00-golden/MOBILE_WEB_GUIDE.md`](docs/00-golden/MOBILE_WEB_GUIDE.md) - Mobile-first constraints & Capacitor integration.
2.  **EXECUTION PLAN**: [`docs/00-golden/PHASE_ROADMAP.md`](docs/00-golden/PHASE_ROADMAP.md) - Chronological milestones.
3.  **DEPRECATIONS**: [`docs/00-golden/DEPRECATIONS.md`](docs/00-golden/DEPRECATIONS.md) - What to IGNORE.
4.  **MASTER INDEX**: [`docs/00-golden/GOLDEN_RECORD_MASTER.md`](docs/00-golden/GOLDEN_RECORD_MASTER.md) - Full system links.

## 🎯 Project Context

You are working on a **3D Action JRPG** built as a **single Ionic Angular app**.
- **Core App**: `src/` (Ionic + Angular + Babylon)
- **Shared Logic**: `src/lib/` (core systems, types, assets)
- **Content Generator**: `@agentic-dev-library/meshy-content-generator` (Meshy OSS generator)
- **E2E**: `e2e/` (Playwright)

## 🔧 Technology Stack

- **Framework**: Ionic + Angular (zoneless)
- **3D**: Babylon.js
- **State/Logic**: Miniplex (ECS) + Zustand + Navigation V2 (Replaces Yuka)
- **Mobile**: Capacitor (Mobile First)
- **Tooling**: PNPM, Biome, Vitest, Playwright

## 🧠 Your Role & Strengths

- **ECS Architect**: Design systems in `src/systems/` that operate on `src/state/ecs.ts`.
- **GenAI Integrator**: Use `-dev-library/meshy-content-generator` to procedurally fill the game world via build-time manifests.
- **Visual Stylist**: Maintain the Cel-Shaded/Cyberpunk aesthetic.

## 🚨 Critical Rules

1. **Governance**: All changes must be tracked in memory-bank (Issues optional per owner).
2. **Mobile First**: All features must run at 60 FPS on Pixel 8a baseline.
3. **Single App**: Work directly in the root app; no package filters.
4. **Zero Stubs**: Fully implement logic.
5. **Strict Types**: No `any`. Use interfaces exported from `src/state/ecs.ts`.

## 📚 Reference

- `AGENTS.md` for broader agent rules.
- `docs/00-golden/GOLDEN_RECORD_MASTER.md` for full design and architecture.
