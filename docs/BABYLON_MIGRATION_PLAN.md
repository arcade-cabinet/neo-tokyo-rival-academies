# Reactylon Migration Plan

**Status**: ACTIVE
**Priority**: Current Phase
**Target**: Isometric diorama with navigation mesh, replacing Three.js/R3F
**Framework**: [Reactylon](https://www.reactylon.com/docs) - Custom React renderer for Babylon.js

---

## Why Migrate?

### Current Stack Limitations (Three.js + R3F)
- **YukaJS unmaintained**: AI/pathfinding library with no updates since 2022
- **Manual navigation**: No built-in nav mesh support
- **Physics coupling**: Rapier integration works but limited

### Reactylon Benefits
- **RecastJS built-in**: Navigation mesh generation and pathfinding
- **Havok physics**: Production-grade physics engine
- **Reactylon**: Custom React renderer with auto-disposal, XR support
- **Asset optimization**: Better GLB/GLTF handling and LOD
- **TypeScript**: Full type safety from Babylon.js classes

---

## Migration Scope

### Components to Migrate

| Current (Three.js) | Target (Babylon.js) | Priority |
|--------------------|---------------------|----------|
| `IsometricScene.tsx` | `BabylonDioramaScene.tsx` | HIGH |
| `HexTileFloor` | Instanced hex grid with clipping | HIGH |
| `WallBackdrops` | Parallax panel system | HIGH |
| `KaiCharacter` | Character with nav mesh agent | HIGH |
| `hex-grid.ts` utilities | Port to Babylon Vector3 | MEDIUM |
| Rapier physics | Havok physics | MEDIUM |
| ECS (Miniplex) | Keep or migrate to Babylon | LOW |

### Files Affected

```
packages/game/src/
├── components/react/scenes/
│   ├── IsometricScene.tsx    → BabylonDioramaScene.tsx
│   └── NeoTokyoGame.tsx      → Update imports
├── components/react/objects/
│   ├── Character.tsx         → BabylonCharacter.tsx
│   └── Enemy.tsx             → BabylonEnemy.tsx
├── utils/
│   └── hex-grid.ts           → hex-grid-babylon.ts
└── state/
    └── ecs.ts                → Keep (Miniplex is engine-agnostic)
```

---

## Implementation Phases

### Phase 1: Reactylon Foundation

**Goal**: Basic scene rendering with Reactylon

**Tasks**:
1. Install dependencies:
   ```bash
   pnpm add @babylonjs/core @babylonjs/loaders @babylonjs/gui reactylon
   ```

2. Create `ReactylonCanvas.tsx` wrapper:
   ```typescript
   import { Engine } from 'reactylon/web';
   import { Scene, useScene } from 'reactylon';
   import type { FC, ReactNode } from 'react';

   interface ReactylonCanvasProps {
     children: ReactNode;
   }

   export const ReactylonCanvas: FC<ReactylonCanvasProps> = ({ children }) => {
     return (
       <Engine>
         <Scene>
           {children}
         </Scene>
       </Engine>
     );
   };
   ```

3. Create isometric camera setup:
   ```typescript
   import { Camera } from '@babylonjs/core/Cameras/camera';
   import { Vector3 } from '@babylonjs/core/Maths/math.vector';

   // Orthographic isometric camera
   <arcRotateCamera
     name="isometric-camera"
     alpha={Math.PI / 4}
     beta={Math.PI / 3}
     radius={50}
     target={new Vector3(0, 0, 0)}
     mode={Camera.ORTHOGRAPHIC_CAMERA}
     orthoTop={20}
     orthoBottom={-20}
     orthoLeft={-20}
     orthoRight={20}
   />
   ```

4. Add required CSS to `index.css`:
   ```css
   #reactylon-canvas {
     width: 100%;
     height: 100%;
     touch-action: none;
   }
   ```

**Deliverable**: Reactylon scene renders with isometric camera

---

### Phase 2: Hex Grid System

**Goal**: Replicate `HexTileFloor` with Reactylon instancing

**Current Implementation** (`IsometricScene.tsx:62-130`):
- Uses `THREE.InstancedMesh` for performance
- 6 tile types with textures
- Seeded random placement
- Centered grid offset

**Reactylon Equivalent**:
```typescript
import { useScene } from 'reactylon';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { Matrix } from '@babylonjs/core/Maths/math.vector';

const HexTileGrid: FC = () => {
  const scene = useScene();
  const hexRef = useRef(null);

  useEffect(() => {
    if (!hexRef.current) return;

    // Add thin instances for performance
    for (const pos of hexPositions) {
      const matrix = Matrix.Translation(pos.x, pos.y, pos.z);
      hexRef.current.thinInstanceAdd(matrix);
    }
  }, []);

  return (
    <cylinder
      ref={hexRef}
      name="hex-tile"
      options={{ height: 0.1, tessellation: 6, diameter: hexSize * 2 }}
    />
  );
};
```

**Tasks**:
1. Port `hexToWorld()` to Babylon Vector3
2. Create `HexTileGrid.tsx` component with thin instances
3. Implement tile type material assignment
4. Add clipping planes for diorama boundaries

**Deliverable**: Hex grid renders with multiple tile types

---

### Phase 3: Diorama Boundaries (Week 3)

**Goal**: FF7-style bounded diorama with parallax walls

**Current Implementation** (`WallBackdrops`):
- Left/right wall planes with parallax textures
- Positioned at grid edges

**Babylon.js Enhancements**:
1. **Clipping planes**: Constrain hex tiles to diorama bounds
   ```typescript
   const clipPlaneLeft = new Plane(-1, 0, 0, dioramaWidth / 2);
   const clipPlaneRight = new Plane(1, 0, 0, dioramaWidth / 2);
   material.clipPlane = clipPlaneLeft;
   ```

2. **Half-tile rendering**: Tiles at edges rendered as halves
3. **Parallax depth**: Multiple background layers

**Tasks**:
1. Implement clipping plane system
2. Create parallax background component
3. Handle edge tile cutting
4. Add lighting for depth

**Deliverable**: Complete bounded diorama with walls

---

### Phase 4: Navigation Mesh (Week 4)

**Goal**: Replace YukaJS with RecastJS navigation

**Why Critical**:
- C-Story stages require AI pathfinding (Vera cooperation, tentacle AI)
- Alien Queen boss fight has 4-8 independent tentacle agents
- Enemy AI needs proper nav mesh movement

**Implementation**:
```typescript
import { RecastJSPlugin } from '@babylonjs/core/Navigation/Plugins/recastJSPlugin';

// Create navigation plugin
const navigationPlugin = new RecastJSPlugin();

// Generate nav mesh from floor geometry
const navMesh = navigationPlugin.createNavMesh(
  [hexFloorMesh],
  {
    cs: 0.2,           // Cell size
    ch: 0.2,           // Cell height
    walkableSlopeAngle: 35,
    walkableHeight: 1,
    walkableClimb: 0.5,
    walkableRadius: 0.5
  }
);

// Create agents
const agent = navigationPlugin.createCrowd(maxAgents, maxAgentRadius, scene);
```

**Tasks**:
1. Install RecastJS plugin
2. Generate nav mesh from hex floor
3. Create agent wrapper component
4. Integrate with ECS for enemy movement

**Deliverable**: AI characters navigate hex grid properly

---

### Phase 5: Character Migration (Week 5)

**Goal**: Port character loading and animation

**Current Implementation** (`Character.tsx`):
- GLB loading with `useGLTF`
- Animation playback with `useAnimations`
- Rapier physics body

**Babylon.js Equivalent**:
```typescript
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import '@babylonjs/loaders/glTF';

// Load character
const result = await SceneLoader.ImportMeshAsync(
  '',
  '/assets/characters/main/kai/',
  'rigged.glb',
  scene
);

// Play animation
const animGroup = result.animationGroups[0];
animGroup.play(true);
```

**Tasks**:
1. Create `BabylonCharacter.tsx` component
2. Port animation system
3. Integrate with nav mesh agents
4. Add Havok physics body

**Deliverable**: Kai character loads and animates

---

### Phase 6: Integration & Testing (Week 6)

**Goal**: Full scene integration and regression testing

**Tasks**:
1. Update `NeoTokyoGame.tsx` to use Babylon scene
2. Port GameWorld logic to Babylon context
3. Update stage transitions
4. E2E tests for diorama rendering
5. Performance benchmarks

**Deliverable**: Complete Babylon.js diorama scene

---

## Code Migration Examples

### Camera Setup

**Three.js (Current)**:
```typescript
<OrthographicCamera
  makeDefault
  position={[cameraX, cameraY, cameraZ]}
  zoom={zoom}
/>
```

**Reactylon (Target)**:
```typescript
import { Camera } from '@babylonjs/core/Cameras/camera';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';

<arcRotateCamera
  name="isometric-camera"
  alpha={Math.PI / 4}
  beta={Math.PI / 3}
  radius={50}
  target={new Vector3(0, 0, 0)}
  mode={Camera.ORTHOGRAPHIC_CAMERA}
  orthoTop={20}
  orthoBottom={-20}
  orthoLeft={-20}
  orthoRight={20}
/>
```

### Scene Setup

**Three.js (Current)**:
```typescript
import { Canvas } from '@react-three/fiber';

<Canvas>
  <ambientLight intensity={0.5} />
  <mesh>
    <boxGeometry args={[1, 1, 1]} />
    <meshStandardMaterial color="orange" />
  </mesh>
</Canvas>
```

**Reactylon (Target)**:
```typescript
import { Engine } from 'reactylon/web';
import { Scene, useScene } from 'reactylon';

<Engine>
  <Scene>
    <hemisphericLight name="light" intensity={0.7} direction={new Vector3(0, 1, 0)} />
    <box name="box" options={{ size: 1 }}>
      <standardMaterial name="mat" diffuseColor={new Color3(1, 0.5, 0)} />
    </box>
  </Scene>
</Engine>
```

### Hex Grid Position

**Three.js (Current)** - `IsometricScene.tsx:15-21`:
```typescript
function hexToWorld(col: number, row: number, size: number): [number, number, number] {
  const width = size * 2;
  const height = Math.sqrt(3) * size;
  const x = col * width * 0.75;
  const z = row * height + (col % 2 === 1 ? height / 2 : 0);
  return [x, 0, z];
}
```

**Reactylon (Target)**:
```typescript
import { Vector3 } from '@babylonjs/core/Maths/math.vector';

function hexToWorld(col: number, row: number, size: number): Vector3 {
  const width = size * 2;
  const height = Math.sqrt(3) * size;
  const x = col * width * 0.75;
  const z = row * height + (col % 2 === 1 ? height / 2 : 0);
  return new Vector3(x, 0, z);
}
```

### GLTF Loading

**Three.js (Current)**:
```typescript
import { useGLTF } from '@react-three/drei';

const { scene } = useGLTF('/assets/characters/main/kai/rigged.glb');
return <primitive object={scene} />;
```

**Reactylon (Target)**:
```typescript
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import '@babylonjs/loaders/glTF';
import { useScene } from 'reactylon';

const scene = useScene();
const [model, setModel] = useState(null);

useEffect(() => {
  SceneLoader.ImportMeshAsync('', '/assets/characters/main/kai/', 'rigged.glb', scene)
    .then(result => setModel(result.meshes[0]));
}, []);
```

---

## Dependencies

### To Add
```json
{
  "@babylonjs/core": "^7.x",
  "@babylonjs/loaders": "^7.x",
  "@babylonjs/gui": "^7.x",
  "reactylon": "^latest",
  "recast-detour": "^0.x"
}
```

**Install Command**:
```bash
pnpm add @babylonjs/core @babylonjs/loaders @babylonjs/gui reactylon
```

### To Remove (After Migration)
```json
{
  "@react-three/fiber": "^9.x",
  "@react-three/drei": "^10.x",
  "@react-three/rapier": "^2.x",
  "three": "^0.182.x",
  "yuka": "^0.7.x"
}
```

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| react-babylonjs learning curve | Start with simple scene, iterate |
| Performance regression | Benchmark before/after |
| Asset compatibility | Test all GLBs early |
| ECS integration | Keep Miniplex, it's engine-agnostic |

---

## Success Criteria

- [ ] Hex grid renders with same visual quality
- [ ] Isometric camera matches current view
- [ ] Character loads and animates
- [ ] Navigation mesh functional
- [ ] Performance >= current (60 FPS)
- [ ] All stages transition correctly

---

*Last Updated: 2026-01-15*
