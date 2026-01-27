# Architecture and Data Flow (Web + Mobile)

**Scope**: Runtime architecture for the unified Ionic Angular + Babylon.js app.

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
│  ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐    │
│  │  content-gen     │ ──→ │ JSON + manifests │ ──→ │ /src/assets/*     │    │
│  └──────────────────┘     └──────────────────┘     └──────────────────┘    │
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
- `packages/content-gen/`: Build-time content pipeline (manifests, audio, story).
- `src/assets/`: Runtime assets and story JSON.

## Runtime Principles

- **Single app**: one web bundle, wrapped by Capacitor for Android/iOS.
- **Fixed story, procedural scenes**: authored beats, but rooftop layouts and props are generated per scene seed.
- **Cel-shaded rendering**: Babylon toon-style materials for characters and props.
- **Mobile-first**: 60 FPS on Pixel 8a baseline.

## Related Docs

- `/docs/00-golden/GOLDEN_RECORD_MASTER.md`
- `/docs/00-golden/MOBILE_WEB_GUIDE.md`
- `/docs/procedural/PROCEDURAL_ARCHITECTURE.md`
- `/docs/story/STORY_FLOODED.md`
