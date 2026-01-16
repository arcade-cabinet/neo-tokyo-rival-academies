# Neo-Tokyo: Rival Academies - Technical Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              Browser                                     │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌────────────────┐  ┌────────────────┐  ┌────────────────────────────┐ │
│  │     React      │  │    Three.js    │  │        Astro               │ │
│  │   (UI/Menus)   │  │   (3D/WebGL)   │  │   (Islands/SSG)            │ │
│  └───────┬────────┘  └───────┬────────┘  └─────────────┬──────────────┘ │
│          │                   │                         │                 │
│          └───────────────────┼─────────────────────────┘                 │
│                              │                                           │
│                    ┌─────────┴─────────┐                                 │
│                    │  React Three Fiber │                                 │
│                    │   (Declarative 3D) │                                 │
│                    └─────────┬─────────┘                                 │
│                              │                                           │
│         ┌────────────────────┼────────────────────┐                      │
│         │                    │                    │                      │
│  ┌──────┴──────┐   ┌─────────┴─────────┐  ┌──────┴──────┐               │
│  │  Miniplex   │   │      Rapier       │  │   Zustand   │               │
│  │    (ECS)    │   │    (Physics)      │  │   (Store)   │               │
│  │             │   │                   │  │             │               │
│  │  Entities   │   │  Collision        │  │  UI State   │               │
│  │  Systems    │   │  Rigid Bodies     │  │  Inventory  │               │
│  │  Queries    │   │  Forces           │  │  Dialogue   │               │
│  └─────────────┘   └───────────────────┘  └─────────────┘               │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
neo-tokyo-rival-academies/
├── packages/
│   ├── game/                          # Main game client
│   │   ├── public/
│   │   │   └── assets/                # GenAI-generated assets
│   │   │       ├── characters/        # Character GLBs + animations
│   │   │       │   ├── main/          # Kai, Vera
│   │   │       │   ├── b-story/       # Yakuza, Bikers
│   │   │       │   └── c-story/       # Mall Guard, Alien, Tentacle
│   │   │       ├── tiles/             # Hex tile models
│   │   │       └── backgrounds/       # Scene backgrounds
│   │   └── src/
│   │       ├── components/
│   │       │   └── react/
│   │       │       ├── scenes/        # IsometricScene, etc.
│   │       │       ├── objects/       # Character, Enemy
│   │       │       ├── ui/            # HUD, Menus, Dialogue
│   │       │       └── game/          # GameWorld, Managers
│   │       ├── systems/               # ECS Systems
│   │       │   ├── PhysicsSystem.tsx
│   │       │   ├── CombatSystem.tsx
│   │       │   ├── InputSystem.tsx
│   │       │   ├── CollectibleSystem.tsx
│   │       │   └── AISystem.ts
│   │       ├── state/
│   │       │   ├── ecs.ts             # Miniplex world
│   │       │   └── gameStore.ts       # Zustand store
│   │       ├── utils/
│   │       │   ├── hex-grid.ts        # Hex coordinate utilities
│   │       │   └── hex-normalizer.ts  # GLTF normalization
│   │       └── types/
│   │           └── game.ts            # TypeScript types
│   │
│   ├── content-gen/                   # GenAI asset pipeline
│   │   └── src/
│   │       ├── api/
│   │       │   └── meshy-client.ts    # Meshy AI client
│   │       ├── pipelines/
│   │       │   ├── definitions/       # JSON pipeline specs
│   │       │   └── pipeline-executor.ts
│   │       ├── tasks/
│   │       │   ├── registry.ts        # Animation IDs
│   │       │   └── definitions/
│   │       │       └── animation-presets.json
│   │       └── types/
│   │           └── manifest.ts        # Schema definitions
│   │
│   └── e2e/                           # Playwright tests
│
├── docs/                              # Documentation
├── memory-bank/                       # AI context files
└── .github/                           # CI/CD workflows
```

## Core Systems

### 1. Entity Component System (Miniplex)

The ECS architecture separates game logic from rendering:

```typescript
// src/state/ecs.ts
import { World } from 'miniplex';

export interface Entity {
  // Identity
  id?: string;

  // Transform
  position?: THREE.Vector3;
  velocity?: THREE.Vector3;
  rotation?: THREE.Euler;

  // Classification
  isPlayer?: boolean;
  isEnemy?: boolean;
  isAlly?: boolean;
  isCollectible?: boolean;

  // Game State
  characterState?: CharacterState;
  stats?: RPGStats;

  // Visual
  modelColor?: number;
  modelPath?: string;
}

export const world = new World<Entity>();
export const ECS = world.Entity;
```

### 2. Isometric Scene Architecture

```
<Canvas>
  <Scene>
    ┌─────────────────────────────────────────┐
    │              Camera Layer               │
    │  ┌───────────────────────────────────┐  │
    │  │     Orthographic Camera           │  │
    │  │     (Fixed Isometric Angle)       │  │
    │  └───────────────────────────────────┘  │
    ├─────────────────────────────────────────┤
    │              Backdrop Layer             │
    │  ┌───────────────────────────────────┐  │
    │  │     WallBackdrops                 │  │
    │  │     (2.5D Parallax Planes)        │  │
    │  └───────────────────────────────────┘  │
    ├─────────────────────────────────────────┤
    │              World Layer                │
    │  ┌───────────────────────────────────┐  │
    │  │     HexTileFloor                  │  │
    │  │     (Instanced Mesh Grid)         │  │
    │  └───────────────────────────────────┘  │
    ├─────────────────────────────────────────┤
    │              Entity Layer               │
    │  ┌─────────────┐  ┌─────────────────┐  │
    │  │   Player    │  │     Enemies     │  │
    │  │   (Kai)     │  │  (via ECS)      │  │
    │  └─────────────┘  └─────────────────┘  │
    ├─────────────────────────────────────────┤
    │              System Layer               │
    │  ┌─────────┐ ┌─────────┐ ┌──────────┐  │
    │  │ Physics │ │  Input  │ │  Combat  │  │
    │  │ System  │ │ System  │ │  System  │  │
    │  └─────────┘ └─────────┘ └──────────┘  │
    └─────────────────────────────────────────┘
  </Scene>
</Canvas>
```

### 3. Hex Grid System

Based on Red Blob Games hex grid research:

```typescript
// Coordinate Systems
type AxialCoord = { q: number; r: number };
type CubeCoord = { q: number; r: number; s: number };
type OffsetCoord = { col: number; row: number };

// Conversions
hexToWorld(q, r, size) → { x, y, z }
worldToHex(x, z, size) → { q, r }

// Algorithms
hexDistance(a, b) → number
hexNeighbors(q, r) → AxialCoord[]
hexRing(center, radius) → AxialCoord[]
hexLine(start, end) → AxialCoord[]
```

### 4. GenAI Asset Pipeline

```
┌──────────────────────────────────────────────────────────────┐
│                    GenAI Pipeline Flow                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│   manifest.json                                               │
│       │                                                       │
│       ▼                                                       │
│   ┌─────────────────┐                                         │
│   │  text-to-image  │  Meshy AI API                          │
│   │  (Multi-view)   │  → 4 view concept images               │
│   └────────┬────────┘                                         │
│            │                                                  │
│            ▼                                                  │
│   ┌─────────────────┐                                         │
│   │ multi-image-to  │  Meshy AI API                          │
│   │      -3d        │  → model.glb (30K poly)                │
│   └────────┬────────┘                                         │
│            │                                                  │
│            ▼                                                  │
│   ┌─────────────────┐                                         │
│   │    rigging      │  Meshy AI API                          │
│   │   (humanoid)    │  → rigged.glb (skeleton)               │
│   └────────┬────────┘                                         │
│            │                                                  │
│            ▼                                                  │
│   ┌─────────────────┐                                         │
│   │   animations    │  Meshy AI API (forEach preset)         │
│   │  (from preset)  │  → animations/*.glb                    │
│   └─────────────────┘                                         │
│                                                               │
│   Output: character folder with all assets                    │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

## Data Flow

### Combat System Flow

```
Player Input
     │
     ▼
┌─────────────┐
│InputSystem  │  Captures WASD, mouse, touch
└──────┬──────┘
       │
       ▼
┌─────────────┐
│PhysicsSystem│  Updates positions, handles collision
└──────┬──────┘
       │
       ▼
┌─────────────┐
│CombatSystem │  Damage calculation, hit detection
└──────┬──────┘
       │
       ├──────────────────────┐
       ▼                      ▼
┌─────────────┐        ┌─────────────┐
│ ECS World   │        │ Zustand     │
│ (Entities)  │        │ (UI State)  │
└─────────────┘        └─────────────┘
```

### RPG Stats Calculation

```typescript
// Damage Formula
function calculateDamage(attacker: Entity, defender: Entity): number {
  const baseAttack = attacker.stats.ignition * 2;
  const defense = defender.stats.structure * 0.5;
  const variance = Math.random() * 0.2 + 0.9; // 90-110%

  return Math.max(1, Math.floor((baseAttack - defense) * variance));
}

// Critical Hit
function isCritical(attacker: Entity): boolean {
  const critChance = attacker.stats.flow * 0.01; // 1% per Flow point
  return Math.random() < critChance;
}
```

## Performance Considerations

### Instanced Rendering

Hex tiles use THREE.InstancedMesh for efficient rendering:

```typescript
// TileInstanceGroup renders all tiles of one type in a single draw call
const instancedMesh = new THREE.InstancedMesh(
  hexGeometry,
  tileMaterial,
  tileCount
);

// Set transforms per instance
tiles.forEach((tile, i) => {
  matrix.setPosition(tile.x, 0, tile.z);
  instancedMesh.setMatrixAt(i, matrix);
});
```

### Resource Cleanup

All Three.js resources disposed on unmount:

```typescript
useEffect(() => {
  return () => {
    geometry.dispose();
    material.dispose();
    texture.dispose();
  };
}, []);
```

### Memory Budget

| Asset Type | Target | Notes |
|------------|--------|-------|
| Character GLB | < 2MB | 30K poly limit |
| Animation GLB | < 500KB | Per animation |
| Tile Model | < 100KB | 10K poly limit |
| Textures | < 1MB | Compressed PNG |

## API Integration

### Meshy AI Endpoints

| Endpoint | Purpose | Rate Limit |
|----------|---------|------------|
| `POST /v1/text-to-image` | Concept art | 10/min |
| `POST /v1/multi-image-to-3d` | 3D model | 5/min |
| `POST /v1/rigging` | Character rig | 5/min |
| `POST /v1/animations` | Animation | 10/min |

### Environment Variables

```env
GEMINI_API_KEY=...     # Google Imagen (planned)
MESHY_API_KEY=...      # Meshy AI (active)
JULES_API_KEY=...      # Jules CLI (session history)
```

---

*Last Updated: 2026-01-15*
