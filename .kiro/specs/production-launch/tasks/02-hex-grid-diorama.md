# 2. Hex Grid Diorama System

**Parent:** [tasks.md](../tasks.md)
**Validates:** Requirements 2

## Overview

This section implements the FF7-style isometric diorama with hexagonal tile floor, bounded by parallax backgrounds and clipping planes. This creates the core playable space for all stages.

## Prerequisites

- Section 1 (BabylonJS Migration) complete
- BabylonJS scene rendering correctly
- Isometric camera configured

## Tasks

### 2.1. Port Hex Grid Utilities

**Validates:** Requirement 2.1, 2.5

- [ ] 2.1.1. Create hex-grid-babylon.ts utilities
  - File: `packages/game/src/utils/hex-grid-babylon.ts`
  - Port hexToWorld() to return BABYLON.Vector3
  - Port worldToHex() to accept BABYLON.Vector3
  - Implement createHexMatrix() for thin instances

- [ ] 2.1.2. Implement hex coordinate conversion
  - Axial to world coordinates
  - World to axial coordinates
  - Cube coordinate support for pathfinding

- [ ]* 2.1.3. Write property test for hex coordinate round trip
  - File: `packages/game/src/utils/__tests__/hex-grid-babylon.test.ts`
  - **Property 2: Hex Coordinate Round Trip**
  - *For any* world position, converting to hex then back should snap to nearest center
  - **Validates: Requirements 2.5**

### 2.2. Create Hex Tile Geometry

**Validates:** Requirement 2.1

- [ ] 2.2.1. Create hex cylinder geometry
  - Use MeshBuilder.CreateCylinder with tessellation=6
  - Height=0.1, diameter=tileSize*2
  - Flat-top orientation

- [ ] 2.2.2. Setup thin instances for performance
  - Create master hex mesh
  - Generate transformation matrices for grid
  - Apply thin instances (not regular instances)

- [ ] 2.2.3. Optimize geometry
  - Minimize vertex count
  - Share materials across instances
  - Test with 100 tiles for performance

### 2.3. Implement Tile Type System

**Validates:** Requirement 2.2

- [ ] 2.3.1. Define tile type enum
  - File: `packages/game/src/types/tiles.ts`
  - Types: base, airvent, pipes, generator, antenna, edge
  - Each type has material and optional 3D model

- [ ] 2.3.2. Create tile material system
  - File: `packages/game/src/materials/TileMaterials.ts`
  - Material for each tile type
  - Use toon shading for consistency
  - Support texture swapping

- [ ] 2.3.3. Implement deterministic tile assignment
  - Use seeded RNG (seedrandom library)
  - Assign tile types based on position and seed
  - Ensure reproducibility

- [ ]* 2.3.4. Write property test for deterministic generation
  - File: `packages/game/src/systems/__tests__/HexGridSystem.test.ts`
  - **Property 1: Hex Grid Determinism**
  - *For any* seed, generating twice produces identical results
  - **Validates: Requirements 2.2**

### 2.4. Generate 10×10 Grid

**Validates:** Requirement 2.1, 2.6

- [ ] 2.4.1. Create HexGridSystem class
  - File: `packages/game/src/systems/HexGridSystem.ts`
  - generateGrid(seed, cols, rows, bounds)
  - Returns array of HexTile objects
  - Applies bounds trimming

- [ ] 2.4.2. Implement bounds trimming
  - Check each tile position against rectangular bounds
  - Skip tiles outside bounds
  - Log trimmed tile count

- [ ]* 2.4.3. Write property test for bounds constraint
  - File: `packages/game/src/systems/__tests__/HexGridSystem.test.ts`
  - **Property 3: Tile Bounds Constraint**
  - *For any* bounds, all tiles should be within bounds
  - **Validates: Requirements 2.6**

### 2.5. Implement Clipping Planes

**Validates:** Requirement 2.3, 2.7

- [ ] 2.5.1. Create clipping plane utilities
  - File: `packages/game/src/utils/clipping-planes.ts`
  - Create left/right clipping planes
  - Apply to materials

- [ ] 2.5.2. Apply clipping to edge tiles
  - Identify tiles at minX and maxX bounds
  - Apply left plane to minX tiles
  - Apply right plane to maxX tiles

- [ ] 2.5.3. Test clipping visual effect
  - Verify tiles are cut at edges
  - Check no z-fighting or artifacts
  - Adjust plane distances if needed

### 2.6. Create Parallax Backgrounds

**Validates:** Requirement 2.4

- [ ] 2.6.1. Create background panel meshes
  - File: `packages/game/src/components/react/babylon/BackgroundPanels.tsx`
  - Left panel at minX boundary
  - Right panel at maxX boundary
  - Use planes with textures

- [ ] 2.6.2. Load background textures
  - Create placeholder textures for now
  - Support different themes (neon, dark, sunset)
  - Apply to panel materials

- [ ] 2.6.3. Position and scale panels
  - Height should cover full diorama
  - Tilt slightly inward for depth
  - Test from isometric camera view

### 2.7. Create HexTileFloor Component

**Validates:** Requirement 2.1

- [ ] 2.7.1. Create React component for hex floor
  - File: `packages/game/src/components/react/babylon/HexTileFloor.tsx`
  - Accept props: seed, cols, rows, bounds
  - Use HexGridSystem to generate tiles
  - Render thin instances

- [ ] 2.7.2. Integrate with BabylonDioramaScene
  - Add HexTileFloor to scene
  - Configure default parameters (10×10, bounds ±20)
  - Test rendering

- [ ] 2.7.3. Add debug visualization
  - Optional wireframe overlay
  - Hex coordinate labels
  - Bounds visualization

### 2.8. Implement Snap-to-Hex Positioning

**Validates:** Requirement 2.5

- [ ] 2.8.1. Create snapToHex utility
  - File: `packages/game/src/utils/hex-grid-babylon.ts`
  - Takes world position, returns snapped position
  - Uses worldToHex → hexToWorld

- [ ] 2.8.2. Apply to character positioning
  - Update character spawn logic
  - Snap player position on movement
  - Snap enemy positions

- [ ]* 2.8.3. Write property test for snap-to-hex
  - File: `packages/game/src/utils/__tests__/hex-grid-babylon.test.ts`
  - **Property 2: Hex Coordinate Round Trip** (already covered in 2.1.3)
  - Verify snapping distance is within hex radius

## Verification

After completing this section:
- [ ] 10×10 hex grid renders correctly
- [ ] Grid matches Three.js positioning
- [ ] Clipping planes bound the diorama
- [ ] Background panels visible at edges
- [ ] Performance is acceptable (thin instances)
- [ ] All TypeScript compiles without errors
- [ ] All tests pass
- [ ] Linting passes (`pnpm check`)
- [ ] No console errors in dev mode

## Common Commands

```bash
# Development
pnpm --filter @neo-tokyo/game dev

# Test
pnpm --filter @neo-tokyo/game test

# Lint
pnpm --filter @neo-tokyo/game check
```

## Notes

- Hex grid uses flat-top orientation (not pointy-top)
- Tile size of 1.2 units works well for character scale
- Thin instances are critical for performance with 100+ tiles
- Clipping planes may need adjustment based on camera angle
- Background textures will be generated by Meshy AI in Section 9
