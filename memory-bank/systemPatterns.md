# System Patterns

## Architecture Overview

```text
┌─────────────────────────────────────────────────────────────────┐
│                         Browser                                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌────────────────────────┐ │
│  │    React     │  │   Three.js   │  │         Vite           │ │
│  │   (UI/HUD)   │  │   (3D/R3F)   │  │   (Build/Dev Server)   │ │
│  └──────┬───────┘  └──────┬───────┘  └────────────┬───────────┘ │
│         │                 │                       │              │
│         └─────────────────┼───────────────────────┘              │
│                           │                                      │
│              ┌────────────┴────────────┐                         │
│              │      Miniplex (ECS)     │                         │
│              │      Entity World       │                         │
│              └────────────┬────────────┘                         │
│                           │                                      │
│         ┌─────────────────┼─────────────────┐                    │
│         │                 │                 │                    │
│  ┌──────┴──────┐  ┌───────┴───────┐  ┌──────┴──────┐            │
│  │   Zustand   │  │    Rapier     │  │    YukaJS   │            │
│  │   (Store)   │  │  (Physics)    │  │   (AI/Nav)  │            │
│  └─────────────┘  └───────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────┘
```

## ECS Pattern (Miniplex)

### Entity Definition
```typescript
interface Entity {
  // Identity
  id?: string;

  // Position
  position?: THREE.Vector3;
  velocity?: THREE.Vector3;

  // Classification
  isPlayer?: boolean;
  isEnemy?: boolean;
  isCollectible?: boolean;

  // State
  characterState?: CharacterState;
  stats?: RPGStats;

  // Visual
  modelColor?: number;
}
```

### System Organization

```text
src/systems/
├── PhysicsSystem.tsx     # Movement, collision
├── CombatSystem.tsx      # Damage, combat flow
├── InputSystem.tsx       # Player input handling
├── CollectibleSystem.tsx # Item pickups
├── AISystem.ts           # Enemy behavior
└── StageSystem.ts        # Level progression
```

### Query Patterns
```typescript
// Get all players
const players = world.with('isPlayer', 'position');

// Get all enemies with stats
const enemies = world.with('isEnemy', 'stats', 'position');

// Get collectibles
const items = world.with('isCollectible', 'position');
```

## Component Hierarchy

```text
<Canvas>
  <Scene>
    <IsometricCamera />
    <Lighting />
    <HexTileFloor />           # Instanced mesh grid
    <WallBackdrops />          # 2.5D parallax backgrounds
    <ECS.Entities>
      <Character />            # Player/NPC rendering
      <Enemy />                # Enemy rendering
    </ECS.Entities>
    <Systems>
      <PhysicsSystem />
      <InputSystem />
      <CombatSystem />
    </Systems>
  </Scene>
</Canvas>
```

## State Management

### Zustand Store (UI State)
```typescript
interface GameStore {
  // Game flow
  isPaused: boolean;
  currentScene: string;

  // Player state
  health: number;
  xp: number;
  level: number;

  // Inventory
  items: Map<string, Item>;

  // Dialogue
  activeDialogue: DialogueNode | null;

  // Actions
  showDialogue: (speaker: string, text: string) => void;
  addItem: (id: string, name: string) => void;
  addXp: (amount: number) => void;
}
```

### ECS World (Game State)
- Entity positions and velocities
- Combat state (attacking, blocking, hit)
- AI state (patrolling, chasing, attacking)

## GenAI Pipeline Pattern

### Manifest-Driven Generation
```json
{
  "id": "kai",
  "name": "Kai",
  "type": "character",
  "textToImageTask": { "prompt": "...", "generateMultiView": true },
  "multiImageTo3DTask": { "targetPolycount": 30000 },
  "riggingTask": { "heightMeters": 1.78 },
  "animationTask": { "preset": "hero" },
  "tasks": {}  // Populated by pipeline
}
```

### Pipeline Flow

```text
manifest.json
    ↓
[concept] text-to-image → imageUrls[]
    ↓
[model] multi-image-to-3d → model.glb
    ↓
[rigging] rig → rigged.glb
    ↓
[animations] forEach(preset) → animations/*.glb
```

## Hex Grid Pattern

### Coordinate Systems
- **Axial (q, r)**: Primary storage format
- **Cube (q, r, s)**: Algorithm calculations (q + r + s = 0)
- **Offset (col, row)**: UI display

### Utilities
```typescript
// Convert hex to world position
const worldPos = hexToWorld(q, r, tileSize);

// Get neighbors
const neighbors = hexNeighbors(q, r);

// Calculate distance
const dist = hexDistance(hex1, hex2);
```

## Key Invariants

1. **ECS Ownership**: Game logic lives in systems, not components
2. **Render/Logic Separation**: Components render state, systems update it
3. **Manifest Truth**: GenAI assets defined by manifest.json
4. **Coordinate Consistency**: All hex operations use axial coordinates
5. **Resource Cleanup**: Three.js objects disposed on unmount

---

Last Updated: 2026-01-16
