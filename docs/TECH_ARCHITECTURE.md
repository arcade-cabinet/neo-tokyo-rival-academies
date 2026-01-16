# Technical Architecture

> **Purpose**: Define the technology stack, patterns, and system architecture.

## Technology Stack

### Core Framework

| Technology | Purpose | Package |
|------------|---------|---------|
| **Reactylon** | React renderer for Babylon.js | `reactylon`, `reactylon/web` |
| **Babylon.js** | 3D rendering engine | `@babylonjs/core` |
| **Navigation V2** | Pathfinding, crowd AI | `@babylonjs/addons` |
| **Zustand** | State management | `zustand` |
| **Vite** | Build tooling | `vite` |
| **Capacitor** | Native mobile wrapper | `@capacitor/core` |

### Supporting Libraries

| Library | Purpose |
|---------|---------|
| `seedrandom` | Deterministic RNG |
| `howler` | Web audio |
| `@capacitor/haptics` | Native haptics |
| `delaunator` | Delaunay triangulation (roads) |
| `simplex-noise` | Procedural noise |

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│                    App Shell                         │
│  ┌─────────────────────────────────────────────────┐│
│  │               Reactylon Engine                   ││
│  │  ┌─────────────────────────────────────────────┐││
│  │  │                 Scene                        │││
│  │  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ │││
│  │  │  │  Camera   │ │  Lights   │ │    Fog    │ │││
│  │  │  └───────────┘ └───────────┘ └───────────┘ │││
│  │  │  ┌───────────────────────────────────────┐ │││
│  │  │  │           District Layer               │ │││
│  │  │  │  ┌────────┐ ┌────────┐ ┌────────┐    │ │││
│  │  │  │  │ Tiles  │ │ Roads  │ │Bridges │    │ │││
│  │  │  │  └────────┘ └────────┘ └────────┘    │ │││
│  │  │  └───────────────────────────────────────┘ │││
│  │  │  ┌───────────────────────────────────────┐ │││
│  │  │  │           Entity Layer                 │ │││
│  │  │  │  ┌────────┐ ┌────────┐ ┌────────┐    │ │││
│  │  │  │  │ Player │ │ Enemies│ │  NPCs  │    │ │││
│  │  │  │  └────────┘ └────────┘ └────────┘    │ │││
│  │  │  └───────────────────────────────────────┘ │││
│  │  └─────────────────────────────────────────────┘││
│  └─────────────────────────────────────────────────┘│
│  ┌─────────────────────────────────────────────────┐│
│  │                 HUD Overlay                      ││
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐  ││
│  │  │ Stats  │ │ Quests │ │Alignment│ │Controls│  ││
│  │  └────────┘ └────────┘ └────────┘ └────────┘  ││
│  └─────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────┘
```

## State Management

### Store Architecture

```typescript
// stores/index.ts
export { useWorldStore } from './worldStore';
export { usePlayerStore } from './playerStore';
export { useQuestStore } from './questStore';
export { useAlignmentStore } from './alignmentStore';
export { useInventoryStore } from './inventoryStore';
export { useCombatStore } from './combatStore';
export { useSettingsStore } from './settingsStore';
```

### World Store

```typescript
// stores/worldStore.ts
interface WorldStore {
  masterSeed: string;
  activeDistricts: Set<string>;
  currentDistrict: string;

  setSeed: (seed: string) => void;
  loadDistrict: (id: string) => Promise<void>;
  unloadDistrict: (id: string) => void;
  setCurrentDistrict: (id: string) => void;
}
```

### Player Store

```typescript
// stores/playerStore.ts
interface PlayerStore {
  position: [number, number, number];
  rotation: number;
  stats: Stats;
  level: number;
  xp: number;

  move: (delta: [number, number, number]) => void;
  addXP: (amount: number) => void;
  levelUp: () => void;
  allocateStat: (stat: keyof Stats) => void;
}
```

## Navigation System (V2)

### Setup

```typescript
import * as ADDONS from '@babylonjs/addons';

const createNavigation = async (scene: Scene, meshes: Mesh[]): Promise<NavigationPlugin> => {
  const plugin = await ADDONS.CreateNavigationPluginAsync();

  const params = {
    cs: 0.3,                    // Cell size
    ch: 0.2,                    // Cell height
    walkableHeight: 2,
    walkableClimb: 0.5,
    walkableRadius: 1,
    walkableSlopeAngle: 45,
    maxEdgeLen: 4,
    maxSimplificationError: 1.1,
    minRegionArea: 4,
    mergeRegionArea: 10,
    maxVertsPerPoly: 6,
    detailSampleDist: 4,
    detailSampleMaxError: 1,
  };

  await plugin.createNavMesh(meshes, params);

  return plugin;
};
```

### Crowd Management

```typescript
const createCrowd = (plugin: NavigationPlugin, maxAgents: number = 16) => {
  return plugin.createCrowd(maxAgents, {
    agentHeight: 2,
    agentRadius: 0.8,
    maxAgents,
    maxAgentRadius: 1,
    maxAgentHeight: 3,
    collisionQueryRange: 3.0,
    pathOptimizationRange: 1.0,
    separationWeight: 2.0,
  });
};
```

## Reactylon Component Patterns

### Scene Setup

```tsx
// components/DioramaScene.tsx
import { Engine } from 'reactylon/web';
import { Scene, useScene } from 'reactylon';

const DioramaScene: FC = () => {
  return (
    <Engine engineOptions={{ antialias: true, adaptToDeviceRatio: true }}>
      <Scene clearColor={new Color4(0.04, 0.04, 0.06, 1)}>
        <IsometricCamera />
        <SceneLighting />
        <SceneFog />
        <DistrictLayer />
        <EntityLayer />
      </Scene>
    </Engine>
  );
};
```

### Custom Hooks

```typescript
// hooks/useKeyboard.ts
const useKeyboard = () => {
  const [keys, setKeys] = useState({ w: false, a: false, s: false, d: false, space: false });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') setKeys(k => ({ ...k, w: true }));
      // ... other keys
    };
    const up = (e: KeyboardEvent) => {
      // ... opposite
    };

    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  return keys;
};
```

### Scene Registration

```typescript
// hooks/useBeforeRender.ts (Reactylon provides this)
const MovementSystem: FC = () => {
  const scene = useScene();
  const keys = useKeyboard();
  const meshRef = useRef<Mesh>(null);

  useEffect(() => {
    if (!scene) return;

    const update = () => {
      if (!meshRef.current) return;
      // Movement logic
    };

    scene.registerBeforeRender(update);
    return () => scene.unregisterBeforeRender(update);
  }, [scene, keys]);

  return <transformNode ref={meshRef} name="player" />;
};
```

## Asset Loading

### GLB Models

```typescript
import { useModel } from 'reactylon';

const CharacterModel: FC<{ path: string }> = ({ path }) => {
  const model = useModel(path, {}, (result) => {
    // Play idle animation
    if (result.animationGroups?.[0]) {
      result.animationGroups[0].start(true);
    }
  });

  return null; // Model added by useModel
};
```

### Texture Loading

```typescript
// Declarative in Reactylon
<standardMaterial
  name="tile-mat"
  diffuseTexture-url="/assets/tiles/rooftop/base/concept.png"
  roughness={0.7}
/>
```

## Performance Patterns

### Thin Instances

```typescript
const TileGroup: FC<{ positions: Vector3[]; texture: string }> = ({ positions, texture }) => {
  const meshRef = useRef<Mesh>(null);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || positions.length === 0) return;

    mesh.position = positions[0];

    for (let i = 1; i < positions.length; i++) {
      const matrix = Matrix.Translation(positions[i].x, positions[i].y, positions[i].z);
      mesh.thinInstanceAdd(matrix);
    }
    mesh.thinInstanceRefreshBoundingInfo();
  }, [positions]);

  return (
    <cylinder
      ref={meshRef}
      options={{ height: 0.1, tessellation: 6, diameter: 1.9 }}
    >
      <standardMaterial diffuseTexture-url={texture} />
    </cylinder>
  );
};
```

### District Streaming

```typescript
const useDistrictStreaming = () => {
  const { activeDistricts, loadDistrict, unloadDistrict } = useWorldStore();
  const scene = useScene();

  useEffect(() => {
    if (!scene) return;

    const update = () => {
      const playerPos = getPlayerPosition();
      const current = getDistrictFromPos(playerPos);
      const adjacent = getAdjacentDistricts(current);

      adjacent.forEach(id => {
        if (!activeDistricts.has(id)) loadDistrict(id);
      });

      activeDistricts.forEach(id => {
        if (distanceToDistrict(id, playerPos) > 100) unloadDistrict(id);
      });
    };

    scene.registerBeforeRender(update);
    return () => scene.unregisterBeforeRender(update);
  }, [scene, activeDistricts]);
};
```

## Mobile Integration

### Capacitor Setup

```typescript
// capacitor.config.ts
const config: CapacitorConfig = {
  appId: 'com.neotokyo.rivalacademies',
  appName: 'Neo-Tokyo',
  webDir: 'dist',
  plugins: {
    Haptics: {},
  },
};
```

### Haptic Feedback

```typescript
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const triggerHaptic = async (style: 'light' | 'medium' | 'heavy') => {
  const impactStyle = style === 'light' ? ImpactStyle.Light :
                      style === 'medium' ? ImpactStyle.Medium :
                      ImpactStyle.Heavy;

  await Haptics.impact({ style: impactStyle });
};
```

## Build Pipeline

### Vite Configuration

```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        manualChunks: {
          'babylon': ['@babylonjs/core'],
          'reactylon': ['reactylon'],
        },
      },
    },
  },
});
```

### Asset Pipeline

```bash
# GenAI asset generation
pnpm --filter @neo-tokyo/content-gen generate

# Build
pnpm --filter @neo-tokyo/game build

# Preview mobile
npx cap run android
```

---

*Modern stack, declarative patterns, mobile-first performance.*
