# System Patterns

## Architecture Overview

```text
┌─────────────────────────────────────────────────────────────────┐
│                         Web / Mobile                            │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │ Ionic/Angular│  │  Babylon.js  │  │   Capacitor 8          │ │
│  │  (UI/HUD)    │  │   (3D)       │  │  (Native wrapper)      │ │
│  └──────┬───────┘  └──────┬───────┘  └────────────┬───────────┘ │
│         │                 │                       │             │
│         └─────────────────┼───────────────────────┘             │
│                           │                                     │
│              ┌────────────┴────────────┐                        │
│              │      Miniplex (ECS)     │                        │
│              │      Entity World       │                        │
│              └────────────┬────────────┘                        │
│                           │                                     │
│         ┌─────────────────┼─────────────────┐                   │
│         │                 │                 │                   │
│  ┌──────┴──────┐  ┌───────┴───────┐  ┌──────┴──────┐            │
│  │   Zustand   │  │    Rapier     │  │ Navigation  │            │
│  │  (Store)    │  │  (Physics)    │  │  (Babylon)  │            │
│  └─────────────┘  └───────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

## ECS Pattern (Miniplex)

### Entity Definition
```typescript
interface Entity {
  id?: string;
  position?: { x: number; y: number; z: number };
  velocity?: { x: number; y: number; z: number };
  isPlayer?: boolean;
  isEnemy?: boolean;
  stats?: RPGStats;
}
```

### System Organization

```text
src/lib/core/src/systems/
├── PhysicsSystem.ts
├── CombatSystem.ts
├── InputSystem.ts
├── QuestSystem.ts
└── SaveSystem.ts
```

## Render Pattern

- Babylon scene is created in a dedicated service.
- Angular components render HUD overlays and bind to ECS/store state.
- Babylon scene updates read-only state from ECS each frame.

## State Management

- Zustand stores are used via `getState()` and `subscribe()` from Angular services.
- Angular services expose Observables to components.

## Key Invariants

1. **ECS Ownership**: Game logic lives in systems, not UI components.
2. **Render/Logic Separation**: Babylon reads ECS state; systems update state.
3. **Manifest Truth**: GenAI assets are defined by manifest.json.
4. **Resource Cleanup**: Babylon meshes/materials disposed on teardown.

---

Last Updated: 2026-01-27
