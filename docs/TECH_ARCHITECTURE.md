# Technical Architecture

> **Purpose**: Define the technology stack, patterns, and system architecture for the unified Ionic Angular app.

## Technology Stack

### Core Framework

| Technology | Purpose | Package |
|------------|---------|---------|
| **Ionic + Angular (zoneless)** | UI, routing, app shell | `@ionic/angular`, `@angular/*` |
| **Babylon.js** | 3D rendering engine | `@babylonjs/core` |
| **Babylon.js Addons** | Navigation/aux systems | `@babylonjs/addons` |
| **Miniplex** | ECS for game logic | `miniplex` |
| **Zustand** | State containers (framework-agnostic use) | `zustand` |
| **Rapier** | Physics | `@dimforge/rapier3d-compat` |
| **Anime.js** | UI animation | `animejs` |
| **Capacitor** | Native wrapper (Android/iOS) | `@capacitor/*` |

## Architecture Overview

```text
┌─────────────────────────────────────────────────────┐
│                    App Shell (Ionic)                │
│  ┌─────────────────────────────────────────────────┐│
│  │                Babylon.js Scene                 ││
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐      ││
│  │  │  Camera   │ │  Lights   │ │    Fog    │      ││
│  │  └───────────┘ └───────────┘ └───────────┘      ││
│  │  ┌───────────────────────────────────────────┐ ││
│  │  │                World Layer                │ ││
│  │  │  Tiles, props, characters, markers        │ ││
│  │  └───────────────────────────────────────────┘ ││
│  └─────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────┐│
│  │                 HUD Overlay (Ionic)             ││
│  │  Stats, Quests, Alignment, Controls             ││
│  └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

## State Management

### Store Architecture

```typescript
// packages/core/src/state/index.ts
export { useWorldStore } from './worldStore';
export { usePlayerStore } from './playerStore';
export { useQuestStore } from './questStore';
export { useAlignmentStore } from './alignmentStore';
export { useInventoryStore } from './inventoryStore';
export { useCombatStore } from './combatStore';
export { useSettingsStore } from './settingsStore';
```

### Angular Access Pattern

```typescript
// app/src/app/state/quest-store.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { useQuestStore } from '@neo-tokyo/core';

@Injectable({ providedIn: 'root' })
export class QuestStoreService {
  private readonly store = useQuestStore;
  private readonly activeQuests$ = new BehaviorSubject(this.store.getState().getActiveQuests());

  constructor() {
    this.store.subscribe(() => {
      this.activeQuests$.next(this.store.getState().getActiveQuests());
    });
  }

  watchActiveQuests() {
    return this.activeQuests$.asObservable();
  }
}
```

## Babylon Scene Setup

```typescript
// app/src/app/engine/babylon-scene.service.ts
import { Engine, Scene } from '@babylonjs/core';

export class BabylonSceneService {
  private engine?: Engine;
  private scene?: Scene;

  init(canvas: HTMLCanvasElement) {
    this.engine = new Engine(canvas, true, { preserveDrawingBuffer: true });
    this.scene = new Scene(this.engine);
    this.engine.runRenderLoop(() => this.scene?.render());
  }

  dispose() {
    this.scene?.dispose();
    this.engine?.dispose();
  }
}
```

## Capacitor Setup

```typescript
// app/capacitor.config.ts
const config: CapacitorConfig = {
  appId: 'com.arcade-cabinet.neo-tokyo-rival-academies',
  appName: 'Neo-Tokyo: Rival Academies',
  webDir: 'www',
  server: { androidScheme: 'https' },
};
```

## UI Guidelines

- Ionic components handle layout and accessibility.
- HUD uses absolute overlay containers to avoid interfering with the canvas.
- UI animation uses Anime.js for staged reveals and combat text.

---

*Agents: Always check `docs/MOBILE_WEB_GUIDE.md` before implementing platform changes.*
