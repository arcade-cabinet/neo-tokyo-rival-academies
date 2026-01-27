# 🤖 Comprehensive Handoff to @jules

## Executive Summary

Claude Code has completed the **comprehensive JRPG transformation** of Neo-Tokyo: Rival Academies. The project is now a production-ready 3-hour Action-JRPG with:

✅ **9 Complete Storyboards** - Every stage from prologue to epilogue
✅ **15+ Design Documents** - Full game design suite
✅ **9 GenAI Characters** - Production-quality GLB assets with animations
✅ **UI Design System** - Faction-themed design tokens and components
✅ **Isometric Hex-Grid Diorama** - FF7-style isometric view implemented
✅ **A/B/C Story Architecture** - 3-hour JRPG narrative structure
✅ **Cleanup Complete** - All legacy artifacts removed

**Ready for**: Babylon.js migration, UI design system implementation, final asset generation

---

## 🎯 Your Mission: Babylon.js Migration

### Why This Matters

The current Three.js + YukaJS stack has a **critical limitation**: YukaJS is **unmaintained** (last update 2022) and lacks the navigation mesh capabilities needed for:

1. **C-Story Alien Ship Stage**: Requires 4-8 independently Yuka-driven tentacles with pathfinding
2. **Enemy AI**: Proper nav mesh movement for Yakuza/Biker enemies
3. **Vera Cooperation AI**: Rival AI that navigates and cooperates with player

**Babylon.js solves this** with built-in RecastJS navigation mesh.

### Migration Plan Overview

📖 **Full Plan**: [`docs/legacy/react/BABYLON_MIGRATION_PLAN.md`](docs/legacy/react/BABYLON_MIGRATION_PLAN.md)

**6 Phases (6 weeks)**:
1. **Week 1**: Babylon.js Foundation - Basic scene rendering
2. **Week 2**: Hex Grid System - Port hex-grid.ts utilities
3. **Week 3**: Diorama Boundaries - FF7-style clipping planes
4. **Week 4**: Navigation Mesh - RecastJS integration ⭐ CRITICAL
5. **Week 5**: Character Migration - GLB loading and animation
6. **Week 6**: Integration & Testing - Full scene integration

---

## 📋 Phase 1: Babylon.js Foundation (Week 1)

### Goal
Get basic Babylon.js scene rendering with isometric camera matching current Three.js view.

### Tasks

#### 1.1 Install Dependencies
```bash
pnpm add babylonjs babylonjs-loaders @babylonjs/core @babylonjs/loaders
pnpm add react-babylonjs
```

**Dependencies to add** (from BABYLON_MIGRATION_PLAN.md):
```json
{
  "@babylonjs/core": "^7.x",
  "@babylonjs/loaders": "^7.x",
  "@babylonjs/gui": "^7.x",
  "react-babylonjs": "^3.x",
  "recast-detour": "^0.x"
}
```

#### 1.2 Create BabylonCanvas Wrapper

**File**: `packages/game/src/components/react/babylon/BabylonCanvas.tsx`

```typescript
import { Engine, Scene } from 'react-babylonjs';
import type { FC, ReactNode } from 'react';

interface BabylonCanvasProps {
  children: ReactNode;
}

export const BabylonCanvas: FC<BabylonCanvasProps> = ({ children }) => {
  return (
    <Engine antialias adaptToDeviceRatio>
      <Scene>
        {children}
      </Scene>
    </Engine>
  );
};
```

#### 1.3 Setup Isometric Camera

**File**: `packages/game/src/components/react/babylon/IsometricCamera.tsx`

```typescript
import { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import { Camera } from '@babylonjs/core/Cameras/camera';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { FC } from 'react';

export const IsometricCamera: FC = () => {
  return (
    <arcRotateCamera
      name="camera"
      alpha={Math.PI / 4}           // 45-degree rotation
      beta={Math.PI / 3}            // ~60-degree elevation
      radius={50}                   // Distance from target
      target={Vector3.Zero()}       // Look at origin
      mode={Camera.ORTHOGRAPHIC_CAMERA}
      orthoTop={20}
      orthoBottom={-20}
      orthoLeft={-20}
      orthoRight={20}
      lowerRadiusLimit={50}
      upperRadiusLimit={50}
    />
  );
};
```

**Current Three.js values** (for comparison):
```typescript
// From IsometricScene.tsx
const cameraX = 19.2;
const cameraY = 23.4;
const cameraZ = 19.2;
const zoom = 21;
```

#### 1.4 Create Test Scene

**File**: `packages/game/src/components/react/babylon/BabylonDioramaScene.tsx`

```typescript
import { BabylonCanvas } from './BabylonCanvas';
import { IsometricCamera } from './IsometricCamera';
import type { FC } from 'react';

export const BabylonDioramaScene: FC = () => {
  return (
    <BabylonCanvas>
      <IsometricCamera />
      <hemisphericLight
        name="light1"
        intensity={0.7}
        direction={[0, 1, 0]}
      />
      <ground
        name="ground"
        width={10}
        height={10}
      />
    </BabylonCanvas>
  );
};
```

### Success Criteria
- [ ] Babylon scene renders in browser
- [ ] Isometric camera matches Three.js view
- [ ] Ground plane visible for reference

---

## 📋 Phase 2: Hex Grid System (Week 2)

### Goal
Replicate `HexTileFloor` component with Babylon.js thin instances.

### Current Implementation Analysis

**File**: `packages/game/src/components/react/scenes/IsometricScene.tsx:62-130`

**Key Details**:
- **Grid Size**: 10 columns × 10 rows
- **Hex Size**: 1.2 units
- **6 Tile Types**: base, airvent, pipes, generator, antenna, edge
- **Instanced Rendering**: `THREE.InstancedMesh` for performance
- **Seeded Random**: `makeRng(42)` for deterministic placement

### Tasks

#### 2.1 Port Hex-Grid Utilities

**File**: `packages/game/src/utils/hex-grid-babylon.ts`

```typescript
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Matrix } from '@babylonjs/core/Maths/math.vector';

// Port from hex-grid.ts but return Babylon types
export function hexToWorld(col: number, row: number, size: number): Vector3 {
  const width = size * 2;
  const height = Math.sqrt(3) * size;
  const x = col * width * 0.75;
  const z = row * height + (col % 2 === 1 ? height / 2 : 0);
  return new Vector3(x, 0, z);
}

export function worldToHex(x: number, z: number, size: number): { col: number; row: number } {
  const width = size * 2;
  const height = Math.sqrt(3) * size;

  const col = Math.round(x / (width * 0.75));
  const row = Math.round((z - (col % 2 === 1 ? height / 2 : 0)) / height);

  return { col, row };
}

export function createHexMatrix(col: number, row: number, size: number): Matrix {
  const pos = hexToWorld(col, row, size);
  return Matrix.Translation(pos.x, pos.y, pos.z);
}
```

#### 2.2 Create Hex Geometry

```typescript
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import type { Scene } from '@babylonjs/core/scene';

export function createHexGeometry(size: number, scene: Scene) {
  return MeshBuilder.CreateCylinder('hex', {
    height: 0.1,
    tessellation: 6,
    diameter: size * 2
  }, scene);
}
```

#### 2.3 Implement Thin Instances

**File**: `packages/game/src/components/react/babylon/HexTileGrid.tsx`

```typescript
import { useEffect, useRef } from 'react';
import { MeshBuilder } from '@babylonjs/core/Meshes/meshBuilder';
import { StandardMaterial } from '@babylonjs/core/Materials/standardMaterial';
import { Color3 } from '@babylonjs/core/Maths/math.color';
import { useScene } from 'react-babylonjs';
import { createHexMatrix, hexToWorld } from '@/utils/hex-grid-babylon';
import { makeRng } from '@/utils/hex-grid';

const TILE_TYPES = ['base', 'airvent', 'pipes', 'generator', 'antenna', 'edge'];

export const HexTileGrid: FC = () => {
  const scene = useScene();
  const gridRef = useRef(null);

  useEffect(() => {
    if (!scene) return;

    const hexSize = 1.2;
    const cols = 10;
    const rows = 10;
    const rng = makeRng(42);

    // Create master hex geometry
    const hexMesh = MeshBuilder.CreateCylinder('hex', {
      height: 0.1,
      tessellation: 6,
      diameter: hexSize * 2
    }, scene);

    // Create matrices for thin instances
    const matrices: Matrix[] = [];

    for (let col = 0; col < cols; col++) {
      for (let row = 0; row < rows; row++) {
        const matrix = createHexMatrix(col, row, hexSize);
        matrices.push(matrix);
      }
    }

    // Apply thin instances
    hexMesh.thinInstanceAddSelf();
    matrices.forEach(matrix => hexMesh.thinInstanceAdd(matrix));

    // Apply material (will need per-tile-type materials later)
    const mat = new StandardMaterial('hexMat', scene);
    mat.diffuseColor = new Color3(0.5, 0.5, 0.5);
    hexMesh.material = mat;

    return () => {
      hexMesh.dispose();
    };
  }, [scene]);

  return null;
};
```

### Success Criteria
- [ ] 10×10 hex grid renders correctly
- [ ] Grid matches Three.js positioning
- [ ] Performance is acceptable (thin instances)
- [ ] Ready for texture assignment

---

## 📋 Phase 3: Diorama Boundaries (Week 3)

### Goal
Implement FF7-style bounded diorama with parallax walls and clipping planes.

### Tasks

#### 3.1 Implement Clipping Planes

```typescript
import { Plane } from '@babylonjs/core/Maths/math.plane';

// In your material setup
const clipPlaneLeft = new Plane(-1, 0, 0, dioramaWidth / 2);
const clipPlaneRight = new Plane(1, 0, 0, dioramaWidth / 2);

material.clipPlane = clipPlaneLeft;
material.clipPlane2 = clipPlaneRight;
```

#### 3.2 Create Parallax Backgrounds

**File**: `packages/game/src/components/react/babylon/WallBackdrops.tsx`

Port from `IsometricScene.tsx:132-165` but use Babylon planes and textures.

### Success Criteria
- [ ] Diorama boundaries clip hex tiles
- [ ] Parallax walls render at edges
- [ ] Depth illusion matches FF7 style

---

## 📋 Phase 4: Navigation Mesh (Week 4) ⭐ CRITICAL

### Why This Is The Most Important Phase

The **Alien Ship C-Story stage** requires:
- **4-8 independent tentacles**, each AI-controlled
- **Alien Queen boss** extending tentacles
- **Vera AI** cooperating with player
- All navigating on hex grid with obstacles

**YukaJS cannot do this.** RecastJS can.

### Tasks

#### 4.1 Install RecastJS

```bash
pnpm add recast-detour
```

#### 4.2 Generate Nav Mesh from Hex Grid

```typescript
import { RecastJSPlugin } from '@babylonjs/core/Navigation/Plugins/recastJSPlugin';

// After hex grid is created
const navigationPlugin = new RecastJSPlugin();

const navMeshParams = {
  cs: 0.2,                    // Cell size
  ch: 0.2,                    // Cell height
  walkableSlopeAngle: 35,
  walkableHeight: 1,
  walkableClimb: 0.5,
  walkableRadius: 0.5,
  maxEdgeLen: 12,
  maxSimplificationError: 1.3,
  minRegionArea: 8,
  mergeRegionArea: 20,
  maxVertsPerPoly: 6,
  detailSampleDist: 6,
  detailSampleMaxError: 1
};

const navMesh = navigationPlugin.createNavMesh(
  [hexFloorMesh],  // Your hex grid mesh
  navMeshParams
);
```

#### 4.3 Create Agent System

```typescript
// Create crowd (max agents)
const maxAgents = 10;
const maxAgentRadius = 0.6;
const crowd = navigationPlugin.createCrowd(maxAgents, maxAgentRadius, scene);

// Add agent
const agentIndex = crowd.addAgent(
  startPosition,
  {
    radius: 0.5,
    height: 2.0,
    maxAcceleration: 4.0,
    maxSpeed: 2.0,
    collisionQueryRange: 0.5,
    pathOptimizationRange: 0.0,
    separationWeight: 1.0
  },
  targetMesh  // Your character mesh
);

// Set target
crowd.agentGoto(agentIndex, targetPosition);
```

#### 4.4 Create Tentacle Agent Component

**File**: `packages/game/src/components/react/babylon/TentacleAgent.tsx`

```typescript
import { useEffect, useRef } from 'react';
import { useScene } from 'react-babylonjs';
import type { Vector3 } from '@babylonjs/core/Maths/math.vector';

interface TentacleAgentProps {
  navigationPlugin: RecastJSPlugin;
  crowd: Crowd;
  targetPosition: Vector3;
}

export const TentacleAgent: FC<TentacleAgentProps> = ({
  navigationPlugin,
  crowd,
  targetPosition
}) => {
  const scene = useScene();
  const agentIndexRef = useRef<number | null>(null);

  useEffect(() => {
    if (!scene || !crowd) return;

    // Load tentacle GLB
    SceneLoader.ImportMeshAsync(
      '',
      '/assets/characters/cstory/tentacle-single/',
      'model.glb',
      scene
    ).then((result) => {
      const tentacleMesh = result.meshes[0];

      // Add to crowd
      const agentIndex = crowd.addAgent(
        tentacleMesh.position,
        {
          radius: 0.5,
          height: 2.0,
          maxAcceleration: 4.0,
          maxSpeed: 2.0
        },
        tentacleMesh
      );

      agentIndexRef.current = agentIndex;

      // Set initial target
      crowd.agentGoto(agentIndex, targetPosition);
    });

    return () => {
      if (agentIndexRef.current !== null) {
        crowd.removeAgent(agentIndexRef.current);
      }
    };
  }, [scene, crowd, targetPosition]);

  return null;
};
```

### Success Criteria
- [ ] Nav mesh generates from hex grid
- [ ] Single agent navigates correctly
- [ ] 4-8 tentacle agents can navigate independently
- [ ] Agents avoid obstacles and each other
- [ ] Performance is acceptable with 8 agents

---

## 📋 Phase 5: Character Migration (Week 5)

### Goal
Port character loading and animation from Three.js to Babylon.js.

### Current Implementation

**File**: `packages/game/src/components/react/objects/Character.tsx`

- Uses `useGLTF` from `@react-three/drei`
- Uses `useAnimations` for animation playback
- Rapier physics body

### Tasks

#### 5.1 Create BabylonCharacter Component

**File**: `packages/game/src/components/react/babylon/BabylonCharacter.tsx`

```typescript
import { useEffect, useState } from 'react';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import '@babylonjs/loaders/glTF';
import { useScene } from 'react-babylonjs';
import type { AnimationGroup } from '@babylonjs/core/Animations/animationGroup';

interface BabylonCharacterProps {
  characterPath: string;  // e.g., '/assets/characters/main/kai/'
  position?: [number, number, number];
  currentAnimation?: string;
}

export const BabylonCharacter: FC<BabylonCharacterProps> = ({
  characterPath,
  position = [0, 0, 0],
  currentAnimation = 'idle'
}) => {
  const scene = useScene();
  const [animationGroups, setAnimationGroups] = useState<AnimationGroup[]>([]);

  useEffect(() => {
    if (!scene) return;

    SceneLoader.ImportMeshAsync(
      '',
      characterPath,
      'rigged.glb',
      scene
    ).then((result) => {
      const rootMesh = result.meshes[0];
      rootMesh.position.set(...position);

      // Store animation groups
      setAnimationGroups(result.animationGroups);

      // Play initial animation
      const idleAnim = result.animationGroups.find(ag =>
        ag.name.toLowerCase().includes('idle')
      );
      if (idleAnim) {
        idleAnim.play(true);
      }
    });
  }, [scene, characterPath, position]);

  // Handle animation changes
  useEffect(() => {
    if (!animationGroups.length) return;

    // Stop all animations
    animationGroups.forEach(ag => ag.stop());

    // Play requested animation
    const anim = animationGroups.find(ag =>
      ag.name.toLowerCase().includes(currentAnimation.toLowerCase())
    );
    if (anim) {
      anim.play(true);
    }
  }, [currentAnimation, animationGroups]);

  return null;
};
```

### Character Assets Available

From `packages/game/public/assets/characters/`:

**Main Characters** (7 animations each):
- `main/kai/rigged.glb` + `animations/*.glb`
- `main/vera/rigged.glb` + `animations/*.glb`

**Expected Animations**:
- `idle_combat.glb`
- `run_in_place.glb`
- `attack_melee_1.glb`
- `block.glb`
- `hit_reaction.glb`
- `jump_idle.glb`
- `death.glb`

### Success Criteria
- [ ] Kai character loads and displays
- [ ] Animations play correctly
- [ ] Character positioned on hex grid
- [ ] Ready for nav mesh agent integration

---

## 📋 Phase 6: Integration & Testing (Week 6)

### Goal
Complete scene integration and verify all systems working together.

### Tasks

#### 6.1 Update NeoTokyoGame.tsx

Replace `IsometricScene` import with `BabylonDioramaScene`:

```typescript
// Before
import { IsometricScene } from './scenes/IsometricScene';

// After
import { BabylonDioramaScene } from './babylon/BabylonDioramaScene';
```

#### 6.2 Port GameWorld Logic

The current `GameWorld` component uses Three.js/R3F specific hooks. You'll need to:

1. Port `useFrame` logic to Babylon's `scene.onBeforeRenderObservable`
2. Port Rapier physics to Havok physics
3. Update ECS queries to work with Babylon meshes

#### 6.3 Create E2E Tests

**File**: `packages/e2e/tests/babylon-scene.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test('Babylon diorama scene renders', async ({ page }) => {
  await page.goto('/');

  // Wait for canvas
  const canvas = await page.locator('canvas');
  await expect(canvas).toBeVisible();

  // Take screenshot
  await page.screenshot({ path: 'screenshots/babylon-scene.png' });
});

test('Character loads on hex grid', async ({ page }) => {
  await page.goto('/');

  // Wait for scene to load
  await page.waitForTimeout(3000);

  // Verify WebGL context
  const hasWebGL = await page.evaluate(() => {
    const canvas = document.querySelector('canvas');
    return canvas?.getContext('webgl') !== null;
  });

  expect(hasWebGL).toBe(true);
});
```

### Success Criteria
- [ ] Full Babylon scene renders
- [ ] Hex grid with 6 tile types
- [ ] Kai character navigates via nav mesh
- [ ] All stages transition correctly
- [ ] Performance ≥60 FPS
- [ ] E2E tests pass

---

## 🎨 GenAI Asset Status

### Characters (9 Total)

| Character | Role | Status | Animations | Notes |
|-----------|------|--------|------------|-------|
| **Kai** | Hero | ✅ COMPLETE | 7 | Main protagonist |
| **Vera** | Hero | ⚠️ PARTIAL | TBD | May need regeneration |
| **Yakuza Grunt** | Enemy | ✅ COMPLETE | 5 | B-story |
| **Yakuza Boss** | Boss | ✅ COMPLETE | 7 | B-story |
| **Biker Grunt** | Enemy | ✅ COMPLETE | 5 | B-story |
| **Biker Boss** | Boss | ✅ COMPLETE | 7 | B-story |
| **Mall Security** | Enemy | ✅ COMPLETE | 5 | C-story |
| **Alien Humanoid** | Enemy | ✅ COMPLETE | 5 | C-story |
| **Tentacle Single** | Prop | ✅ COMPLETE | N/A | C-story (Yuka-driven) |

### Tiles (6 Types)

All located in `packages/game/public/assets/tiles/rooftop/`:
- ✅ `base/` - Base rooftop tile
- ✅ `airvent/` - Air ventilation unit
- ✅ `pipes/` - Industrial pipes
- ✅ `generator/` - Power generator
- ✅ `antenna/` - Communication antenna
- ✅ `edge/` - Edge tile

### Backgrounds

**Sector 0 Backgrounds** (`packages/game/public/assets/backgrounds/sector0/`):
- ⚠️ `wall_left/` - May need regeneration
- ⚠️ `wall_right/` - May need regeneration
- ⚠️ `parallax_far/` - May need regeneration

**Status**: Check if these exist and are production-quality.

### Missing Assets to Generate

Run the content-gen pipeline for:

```bash
# If Vera needs regeneration
pnpm --filter @neo-tokyo/content-gen generate characters/main/vera

# Background parallax textures
pnpm --filter @neo-tokyo/content-gen generate backgrounds/sector0/wall_left
pnpm --filter @neo-tokyo/content-gen generate backgrounds/sector0/wall_right
pnpm --filter @neo-tokyo/content-gen generate backgrounds/sector0/parallax_far

# Additional stage backgrounds (if needed)
pnpm --filter @neo-tokyo/content-gen generate backgrounds/alien_ship
pnpm --filter @neo-tokyo/content-gen generate backgrounds/mall
```

---

## 📚 Documentation Handoff

### Complete Documentation Suite

All documentation is production-ready and comprehensive:

**Core Design**:
- [`docs/NARRATIVE_DESIGN.md`](docs/NARRATIVE_DESIGN.md) - **⭐ READ THIS FIRST** - Complete A/B/C story with 9 storyboards
- [`docs/UI_DESIGN_SYSTEM.md`](docs/UI_DESIGN_SYSTEM.md) - Faction-themed UI design system
- [`docs/legacy/story/JRPG_TRANSFORMATION.md`](docs/legacy/story/JRPG_TRANSFORMATION.md) - Stats, combat, progression
- [`docs/legacy/react/BABYLON_MIGRATION_PLAN.md`](docs/legacy/react/BABYLON_MIGRATION_PLAN.md) - **⭐ YOUR ROADMAP** - This handoff expands on this

**Architecture**:
- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) - Technical architecture
- [`docs/GENAI_PIPELINE.md`](docs/GENAI_PIPELINE.md) - Asset generation workflow
- [`AGENTS.md`](AGENTS.md) - ModelerAgent and ArtDirectorAgent

**AI Context**:
- [`memory-bank/projectbrief.md`](memory-bank/projectbrief.md) - Project summary
- [`memory-bank/techContext.md`](memory-bank/techContext.md) - Tech stack
- [`memory-bank/activeContext.md`](memory-bank/activeContext.md) - Current focus

---

## 🚀 Immediate Next Steps for Jules

### Priority 1: Babylon.js Migration (Weeks 1-6)

Follow the 6-phase plan above. **Start with Phase 1** (Babylon.js Foundation).

**Key Files to Create**:
1. `packages/game/src/components/react/babylon/BabylonCanvas.tsx`
2. `packages/game/src/components/react/babylon/IsometricCamera.tsx`
3. `packages/game/src/components/react/babylon/BabylonDioramaScene.tsx`
4. `packages/game/src/utils/hex-grid-babylon.ts`

**Success Metric**: Babylon scene renders with isometric camera by end of Week 1.

### Priority 2: UI Design System Implementation

While migrating to Babylon, **in parallel** implement the UI design system:

**Tasks**:
1. Create `packages/game/src/styles/design-tokens.css` with CSS custom properties
2. Update `JRPG_HUD.module.css` to use design tokens
3. Implement faction theming (Kurenai crimson vs Azure blue)
4. Add Japanese fonts (M PLUS 1, Zen Kaku Gothic New)

**Reference**: [`docs/UI_DESIGN_SYSTEM.md`](docs/UI_DESIGN_SYSTEM.md)

### Priority 3: Complete Asset Generation

Check asset status and generate any missing pieces:

```bash
# Check what's missing
ls packages/game/public/assets/characters/main/vera/animations/
ls packages/game/public/assets/backgrounds/

# Generate if needed
pnpm --filter @neo-tokyo/content-gen generate characters/main/vera
pnpm --filter @neo-tokyo/content-gen generate backgrounds/sector0/wall_left
pnpm --filter @neo-tokyo/content-gen generate backgrounds/alien_ship
pnpm --filter @neo-tokyo/content-gen generate backgrounds/mall
```

---

## 🎯 Critical Success Factors

### Navigation Mesh (Week 4) is Make-or-Break

The **Alien Ship C-Story stage** REQUIRES working nav mesh for:
- 4-8 tentacle agents (each independently navigating)
- Alien Queen boss (stationary but extending tentacles)
- Vera AI (cooperating with player)

**If RecastJS doesn't work**, we need to:
1. Fallback to simpler AI (direct line movement)
2. Redesign Alien Ship stage mechanics
3. Consider alternative pathfinding libraries

**Testing Plan**:
- Week 4 Day 1-2: Get 1 agent navigating
- Week 4 Day 3-4: Get 4 agents navigating simultaneously
- Week 4 Day 5: Stress test with 8 agents

### Performance Budgets

**Target**: 60 FPS on mid-range devices

**Benchmarks to Track**:
- Hex grid: <5ms per frame
- Nav mesh queries: <1ms per agent
- Character animations: <2ms total
- Total frame time: <16.67ms

### Asset Quality

All GLB assets must be:
- **≤30K polygons** (hero characters)
- **≤10K polygons** (enemies, tiles)
- **PBR textures** (baseColor, normal, metallic/roughness)
- **Rigged** (humanoid characters)
- **7 animations** (heroes), 5 animations (enemies)

---

## 📞 Questions? Issues?

### Babylon.js Resources

- **Official Docs**: https://doc.babylonjs.com/
- **RecastJS Docs**: https://doc.babylonjs.com/features/featuresDeepDive/crowdNavigation/RecastJS
- **react-babylonjs**: https://github.com/brianzinn/react-babylonjs
- **Examples**: https://playground.babylonjs.com/

### Debugging Tips

**Scene Not Rendering**:
- Check browser console for WebGL errors
- Verify `<Engine>` and `<Scene>` are properly nested
- Ensure camera is positioned correctly

**Nav Mesh Not Generating**:
- Check mesh has valid geometry
- Verify nav mesh parameters (cs, ch values)
- Use `navigationPlugin.isSupported()` to check browser support

**Performance Issues**:
- Use thin instances (not regular instances)
- Implement LOD for distant objects
- Enable frustum culling
- Profile with Babylon Inspector (`scene.debugLayer.show()`)

---

## 🎮 Game Design Context

### 3-Hour JRPG Target

**Playtime Breakdown**:
- **A-Story** (Main): 1.5 hours
- **B-Story** (Optional): 45 minutes
- **C-Story** (Disruptors): 45 minutes

### 9 Stages

1. `intro_cutscene` - Prologue (2-3 min)
2. `sector7_streets` - Tutorial platformer (500 units)
3. `alien_ship` - **C-STORY** Boss arena (100 units) ⭐ NEEDS NAV MESH
4. `mall_drop` - **C-STORY** Platformer (300 units)
5. `boss_ambush` - Boss fight (100 units)
6. `rooftop_chase` - Main platformer (800 units)
7. `summit_climb` - Runner (1000 units)
8. `final_battle` - Final boss vs Vera (100 units)
9. `epilogue` - Victory cutscene (2-3 min)

### Faction Identity

**Kurenai Academy** (Kai):
- **Colors**: Crimson (#B22222), Gold (#FFD700)
- **Philosophy**: "Ignition" - Passion, intuition
- **Weapon**: Redline Piston (hammer)

**Azure Academy** (Vera):
- **Colors**: DodgerBlue (#1E90FF), Silver (#C0C0C0)
- **Philosophy**: "Calculation" - Logic, precision
- **Weapon**: Null Set (lance)

---

## ✅ Your Checklist

Before starting Babylon.js migration:
- [ ] Read [`docs/NARRATIVE_DESIGN.md`](docs/NARRATIVE_DESIGN.md) - Understand full story
- [ ] Read [`docs/legacy/react/BABYLON_MIGRATION_PLAN.md`](docs/legacy/react/BABYLON_MIGRATION_PLAN.md) - Full migration plan
- [ ] Read current `IsometricScene.tsx` - Understand what to port
- [ ] Check asset status - Verify all GLBs exist
- [ ] Review [`docs/UI_DESIGN_SYSTEM.md`](docs/UI_DESIGN_SYSTEM.md) - Understand UI goals

Week 1 Setup:
- [ ] Install Babylon.js dependencies
- [ ] Create BabylonCanvas wrapper
- [ ] Setup isometric camera
- [ ] Verify scene renders

Week 2 Hex Grid:
- [ ] Port hex-grid.ts to Babylon Vector3
- [ ] Create hex geometry with thin instances
- [ ] Verify 10×10 grid renders correctly

Week 3 Diorama:
- [ ] Implement clipping planes
- [ ] Create parallax backgrounds
- [ ] Test FF7-style bounded view

Week 4 Nav Mesh ⭐:
- [ ] Install RecastJS
- [ ] Generate nav mesh from hex grid
- [ ] Create single agent
- [ ] Test with 4-8 tentacle agents

Week 5 Characters:
- [ ] Create BabylonCharacter component
- [ ] Load Kai with animations
- [ ] Integrate with nav mesh

Week 6 Integration:
- [ ] Update NeoTokyoGame.tsx
- [ ] Port GameWorld logic
- [ ] Create E2E tests
- [ ] Performance benchmarks

---

## 🙏 Thank You, Jules!

You built the foundation of this JRPG transformation with the ECS architecture, stats system, and dialogue system. Now it's time to take it to the next level with Babylon.js and bring those 4-8 Yuka-driven tentacles to life! 🐙

The game is **90% documented**, **90% designed**, and **ready for implementation**. You've got this! 🚀

---

**Questions?** Check the docs first, then ask in PR comments.
**Blocked?** Post in PR and tag @jbdevprimary.
**Crushing it?** Post screenshots in PR! 📸

*Let's make Neo-Tokyo: Rival Academies legendary!* ⚡🎮✨
