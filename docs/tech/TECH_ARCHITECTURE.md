# Technical Architecture (Current Stack)

**Purpose**: Define the active technology stack and integration boundaries.

## Core Stack

| Layer | Technology | Notes |
|-------|------------|-------|
| UI | **Ionic + Angular (zoneless)** | Mobile-first UI, routing, accessibility |
| 3D | **Babylon.js** | WebGL scene, toon shading |
| ECS/Logic | **Miniplex + Zustand** | Systems + state in `packages/core` |
| Physics | **Rapier** | Deterministic physics where needed |
| Native | **Capacitor 8** | Android/iOS wrapper |
| Build | **Angular CLI (Vite-based)** | Production and dev builds |
| Tests | **Vitest, Playwright** | Unit + E2E |

## Package Map

- `packages/core`: ECS systems, stores, types.
- `packages/content-gen`: Build-time generators (music, story, manifests).
- `packages/shared-assets`: Shared asset manifests and helpers.
- `e2e/`: Playwright test suite.

## Runtime Targets

- **Web**: SPA served from `www` after `ng build`.
- **Android/iOS**: `cap sync` uses the same `www` bundle.
- **Desktop**: Optional Electron target via Capacitor community plugin.

## Build & Test Commands

- `pnpm start` — local dev server.
- `pnpm build` — production build.
- `pnpm test` — unit tests.
- `pnpm test:e2e` — Playwright E2E.
- `pnpm check` — lint/format (Biome).

## Constraints

- **Story is fixed** (3-hour authored JRPG), **scenes are procedural**.
- **No neon** (post-apocalyptic, weathered materials).
- **Touch-first UI** (48px minimum targets).

## Related Docs

- `/docs/00-golden/GOLDEN_RECORD_MASTER.md`
- `/docs/00-golden/MOBILE_WEB_GUIDE.md`
- `/docs/story/STORY_FLOODED.md`
- `/docs/world/FLOODED_WORLD.md`
