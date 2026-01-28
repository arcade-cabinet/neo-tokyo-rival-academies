# Architecture and Data Flow (Web + Mobile)

**Scope**: Runtime architecture for the unified Ionic Angular + Babylon.js app.

## Core Stack (Current)

| Layer | Technology | Notes |
|-------|------------|-------|
| UI | **Ionic + Angular (zoneless)** | Mobile-first UI, routing, accessibility |
| 3D | **Babylon.js** | WebGL scene, toon shading |
| ECS/Logic | **Miniplex + Zustand** | Systems + state in `packages/core` |
| Physics | **Rapier** | Deterministic physics where needed |
| Native | **Capacitor 8** | Android/iOS wrapper |
| Build | **Angular CLI (Vite-based)** | Production and dev builds |
| Tests | **Vitest, Playwright** | Unit + E2E |

## System Overview

```
┌────────────────────────────────────────────────────────────────────────────┐
│                         Ionic Angular App (Web)                             │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ UI Layer (Angular Components + Ionic)                                │  │
│  │  - GameShell / Menus / HUD / Dialogue / Inventory                     │  │
│  │  - Touch input + accessibility                                        │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                      │                                       │
│                                      ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ State + Systems (TypeScript)                                         │  │
│  │  - Zustand stores (player, quest, combat, alignment, world)           │  │
│  │  - Deterministic generators (quests, districts, scene seeds)          │  │
│  │  - SaveSystem + persistence                                           │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
│                                      │                                       │
│                                      ▼                                       │
│  ┌──────────────────────────────────────────────────────────────────────┐  │
│  │ 3D Runtime (Babylon.js)                                               │  │
│  │  - SceneService: camera/lights/meshes/controllers                     │  │
│  │  - Cel-shaded materials, instanced tiles, scene props                 │  │
│  └──────────────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│                          Content (Build-Time)                               │
│  ┌─────────────────────────────┐  ┌──────────────────┐  ┌─────────────────┐ │
│  │  @agentic-dev-library/      │→ │ JSON + manifests │→ │ /src/assets/*   │ │
│  │  meshy-content-generator    │  │                 │  │                │ │
│  └─────────────────────────────┘  └──────────────────┘  └─────────────────┘ │
└────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow

1. **Input** (touch/keyboard) updates `InputStateService`.
2. **Systems** update stores (`@neo-tokyo/core`) and emit derived state.
3. **UI** subscribes to stores/services and renders HUD + overlays.
4. **Scene** pulls the same state for character movement, markers, and FX.
5. **SaveSystem** snapshots state to local storage and restores on boot.

## Core Directories

- `src/app/engine/`: Babylon scene setup, camera, lighting, markers, controllers.
- `src/app/state/`: Angular services wrapping core Zustand stores.
- `src/app/ui/`: Angular UI/HUD components.
- `packages/core/`: Platform-agnostic systems and stores.
- `packages/shared-assets/`: Shared manifest helpers and asset loaders.
- `src/assets/`: Runtime assets and story JSON.

## Package Map

- `packages/core`: ECS systems, stores, types.
- `packages/shared-assets`: Shared asset manifests and helpers.
- `e2e/`: Playwright test suite.

## Runtime Principles

- **Single app**: one web bundle, wrapped by Capacitor for Android/iOS.
- **Fixed story, procedural scenes**: authored beats, but rooftop layouts and props are generated per scene seed.
- **Cel-shaded rendering**: Babylon toon-style materials for characters and props.
- **Mobile-first**: 60 FPS on Pixel 8a baseline.

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

## Decision: Single Unified App

### Why We Dropped Multi-App Shells
Multiple app shells (web, React Native, desktop) created divergent behavior and higher maintenance cost.

### Unified App Standard
We ship **one** Ionic Angular app and wrap it with Capacitor for Android/iOS. Desktop uses the same web bundle.

### Migration Steps (Current Scope)
1. Port React/Reactylon UI and Babylon scene code to Angular + Babylon imperative.
2. Wire ECS packages into the app.
3. Archive legacy React/Expo apps and Unity runtime notes.
4. Keep Electron optional and non-divergent.

## Related Docs

- `/docs/00-golden/GOLDEN_RECORD_MASTER.md`
- `/docs/00-golden/MOBILE_WEB_GUIDE.md`
- `/docs/procedural/PROCEDURAL_ARCHITECTURE.md`
- `/docs/story/STORY_FLOODED.md`
