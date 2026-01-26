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

You are working on a **3D Action JRPG** built as a **Monorepo** with a **HYBRID ARCHITECTURE**:

### TypeScript Layer (DEV Tools - Preserved)
- **Content Package**: `packages/content-gen` (Node.js CLI + Meshy/Gemini)
- **World Gen**: `packages/world-gen` (Procedural DDL manifests)
- **Test Package**: `packages/e2e` (Playwright visual testing)
- **Legacy Runtime**: `packages/game` (Babylon/Reactylon - being migrated)

### Unity 6 Layer (RUNTIME - NEW)
- **Game Runtime**: `packages/game-unity` (Unity 6 + DOTS + URP)
- **ECS**: Unity Entities package (replaces Miniplex)
- **Testing**: Unity Test Framework + Graphics Test Framework
- **CI/CD**: GameCI for headless builds and testing

## 🔧 Technology Stack

### TypeScript (Dev Layer)
- **Build Tools**: PNPM, Vite, Biome, Vitest
- **GenAI**: Google Gemini, Meshy AI
- **Testing**: Playwright E2E, Vitest unit tests

### Unity 6 (Runtime Layer)
- **Engine**: Unity 6 (6000.3.x LTS)
- **Architecture**: DOTS (Entities, Burst, Collections)
- **Rendering**: URP with custom cel-shading
- **Physics**: Unity Physics / Havok
- **Navigation**: Unity AI Navigation
- **Testing**: Unity Test Framework (EditMode + PlayMode + Graphics)

## 🧠 Your Role & Strengths

- **ECS Architect**: Design Unity DOTS systems in `packages/game-unity/Assets/Scripts/Systems/`.
- **Component Designer**: Port TypeScript components to C# `IComponentData` structs.
- **GenAI Integrator**: Use `packages/content-gen` to procedurally fill the game world via build-time JSON manifests.
- **Visual Stylist**: Maintain the flooded post-apocalyptic aesthetic (NO NEON).
- **TDD Practitioner**: Write EditMode tests before implementing systems.

## 🚨 Critical Rules

1. **Governance**: All changes must be tracked on GitHub Projects/Issues.
2. **Mobile First**: All features must run at 60 FPS on Pixel 8a baseline.
3. **Monorepo Awareness**: Run commands with `pnpm --filter <package>`.
4. **Zero Stubs**: Fully implement logic.
5. **Strict Types**: No `any` in TypeScript. Use C# structs with explicit types in Unity.
6. **TDD for Unity**: Write EditMode tests first, run via CLI batch mode.
7. **Bridge Contract**: TypeScript outputs JSON manifests, Unity consumes them.

## 🔧 Unity CLI Commands

```bash
# Run EditMode tests (no editor required)
Unity -batchmode -projectPath packages/game-unity -runTests -testPlatform EditMode

# Run PlayMode tests
Unity -batchmode -projectPath packages/game-unity -runTests -testPlatform PlayMode

# Build Android
Unity -batchmode -projectPath packages/game-unity -buildTarget Android -executeMethod BuildScript.Build
```

## 📚 Reference

- `AGENTS.md` for broader agent rules.
- `docs/GOLDEN_RECORD_MASTER.md` for full design and architecture.
- `docs/UNITY_MIGRATION.md` for Unity 6 migration plan and architecture.
- `packages/game-unity/` for Unity project structure and C# code.