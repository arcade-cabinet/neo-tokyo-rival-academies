# 1. BabylonJS Migration Foundation

**Parent:** [tasks.md](../tasks.md)
**Validates:** Requirements 1

## Overview

This section migrates the entire rendering engine from Three.js to BabylonJS with Reactylon integration. This is the foundation for all subsequent work and enables RecastJS navigation mesh support.

## Prerequisites

- Node.js 22.22.0+ installed
- PNPM 10+ installed
- Clean git working directory

## Tasks

### 1.1. Install BabylonJS Dependencies

**Validates:** Requirement 1.1

- [ ] 1.1.1. Install core BabylonJS packages
  - Run: `pnpm add @babylonjs/core @babylonjs/loaders @babylonjs/gui @babylonjs/materials`
  - Run: `pnpm add @babylonjs/addons` (for Navigation Plugin V2)
  - Verify package.json includes all packages

- [ ] 1.1.2. Install Reactylon for React integration
  - Run: `pnpm add reactylon`
  - Verify reactylon is compatible with React 19

- [ ] 1.1.3. Install RecastJS for navigation
  - Run: `pnpm add recast-detour`
  - Verify WASM module loads correctly

- [ ] 1.1.4. Remove Three.js dependencies
  - Run: `pnpm remove three @react-three/fiber @react-three/drei @react-three/rapier`
  - Remove unused Three.js type definitions
  - Clean up package.json

### 1.2. Create BabylonJS Engine Wrapper

**Validates:** Requirement 1.1

- [ ] 1.2.1. Create BabylonEngine class
  - File: `packages/game/src/engine/BabylonEngine.ts`
  - Implement engine initialization with canvas
  - Implement resize handling
  - Implement render loop
  - Implement disposal/cleanup

- [ ] 1.2.2. Create Reactylon scene wrapper component
  - File: `packages/game/src/components/react/babylon/BabylonCanvas.tsx`
  - Wrap Reactylon Engine and Scene components
  - Handle canvas ref forwarding
  - Implement error boundaries

- [ ]* 1.2.3. Write unit tests for BabylonEngine
  - File: `packages/game/src/engine/__tests__/BabylonEngine.test.ts`
  - Test engine initialization
  - Test resize handling
  - Test disposal cleanup

### 1.3. Setup Isometric Camera

**Validates:** Requirement 1.2

- [ ] 1.3.1. Create IsometricCamera component
  - File: `packages/game/src/components/react/babylon/IsometricCamera.tsx`
  - Implement ArcRotateCamera with orthographic mode
  - Set alpha = π/4 (45° rotation)
  - Set beta = π/3 (~60° elevation)
  - Configure ortho bounds for zoom

- [ ] 1.3.2. Match Three.js camera angles
  - Reference current Three.js camera: `cameraX=19.2, cameraY=23.4, cameraZ=19.2, zoom=21`
  - Calculate equivalent BabylonJS parameters
  - Test visual parity with screenshots

- [ ]* 1.3.3. Write property test for camera configuration
  - File: `packages/game/src/components/react/babylon/__tests__/IsometricCamera.test.ts`
  - **Property 2: Camera Orthographic Projection**
  - *For any* ortho bounds, camera should maintain isometric angles
  - **Validates: Requirements 1.2**

### 1.4. Create Test Scene

**Validates:** Requirement 1.1

- [ ] 1.4.1. Create BabylonDioramaScene component
  - File: `packages/game/src/components/react/babylon/BabylonDioramaScene.tsx`
  - Compose BabylonCanvas + IsometricCamera
  - Add hemispheric light for flat lighting
  - Add ground plane for reference

- [ ] 1.4.2. Replace IsometricScene with BabylonDioramaScene
  - File: `packages/game/src/components/react/scenes/NeoTokyoGame.tsx`
  - Import BabylonDioramaScene instead of IsometricScene
  - Remove Three.js Canvas import
  - Test scene renders correctly

- [ ] 1.4.3. Verify WebGL context and rendering
  - Check canvas element exists
  - Verify WebGL context is created
  - Confirm scene renders without errors
  - Take screenshot for visual regression

### 1.5. Migrate ECS Integration

**Validates:** Requirement 1.5

- [ ] 1.5.1. Update ECS entity structure for BabylonJS
  - File: `packages/game/src/state/ecs.ts`
  - Change mesh type from THREE.Mesh to BABYLON.AbstractMesh
  - Update Vector3 references to BABYLON.Vector3
  - Preserve all existing component structure

- [ ] 1.5.2. Create BabylonJS mesh factory utilities
  - File: `packages/game/src/utils/babylon-mesh-factory.ts`
  - Helper functions for creating common meshes
  - Conversion utilities for Three.js → BabylonJS types

- [ ]* 1.5.3. Write unit tests for ECS integration
  - File: `packages/game/src/state/__tests__/ecs.test.ts`
  - Test entity creation with BabylonJS meshes
  - Test component queries still work
  - **Validates: Requirements 1.5**

### 1.6. Setup Cel-Shaded Materials

**Validates:** Requirement 1.6

- [ ] 1.6.1. Create toon material factory
  - File: `packages/game/src/materials/ToonMaterial.ts`
  - Use BabylonJS CellMaterial or custom NodeMaterial
  - Configure stepped lighting for anime aesthetic
  - Add rim lighting for character pop

- [ ] 1.6.2. Apply toon materials to test meshes
  - Apply to ground plane
  - Apply to any test character meshes
  - Verify cel-shaded look matches Three.js version

- [ ] 1.6.3. Create material presets
  - Character material (skin tones)
  - Environment material (tiles, props)
  - Effect material (particles, glows)

### 1.7. Performance Baseline

**Validates:** Requirement 1.3

- [ ] 1.7.1. Setup performance monitoring
  - File: `packages/game/src/utils/performance-monitor.ts`
  - Track FPS using engine.getFps()
  - Track frame time
  - Log performance warnings

- [ ] 1.7.2. Establish baseline metrics
  - Measure FPS with empty scene
  - Measure FPS with ground plane + camera
  - Record baseline for comparison
  - Document in performance log

- [ ] 1.7.3. Configure quality settings
  - File: `packages/game/src/config/quality-settings.ts`
  - Define low/medium/high presets
  - Implement quality switching
  - Test on development machine

## Verification

After completing this section:
- [ ] BabylonJS scene renders in browser
- [ ] Isometric camera matches Three.js view
- [ ] No Three.js dependencies remain
- [ ] All TypeScript compiles without errors
- [ ] All tests pass
- [ ] Linting passes (`pnpm check`)
- [ ] No console errors in dev mode
- [ ] Performance baseline documented

## Common Commands

```bash
# Development
pnpm --filter @neo-tokyo/game dev

# Build
pnpm --filter @neo-tokyo/game build

# Test
pnpm --filter @neo-tokyo/game test

# Lint
pnpm --filter @neo-tokyo/game check
```

## Notes

- BabylonJS uses left-handed coordinate system (Three.js is right-handed)
- Camera angles may need fine-tuning for exact visual match
- Performance should be equal or better than Three.js
- Keep Three.js removal commits separate for easy rollback if needed
