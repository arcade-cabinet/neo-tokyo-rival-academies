# Component Promotion: Playground → Production Blocks

This document defines the validation and promotion process for moving components from the playground sandbox to the production procedural generation system.

## Critical: Dependency Direction

```
CORRECT:   playground → imports from → world-gen (codebase)
WRONG:     world-gen → imports from → playground
```

**The codebase NEVER depends on playground.** Playground is a sandbox that can import production code for testing, but production code must remain independent.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          WORLD-GEN PACKAGE (Production)                  │
│  packages/world-gen/                                                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │
│  │  blocks/    │  │ assemblages/│  │ generators/ │  │  catalog/   │   │
│  │ (production)│  │ (composed)  │  │ (procedural)│  │  (DDL)      │   │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │
│                                                                          │
│  This is the SOURCE OF TRUTH for production blocks                       │
└─────────────────────────────────────────────────────────────────────────┘
                    ▲                               │
                    │ COPY validated code           │ IMPORTS
                    │                               ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          PLAYGROUND PACKAGE (Sandbox)                    │
│  packages/playground/                                                    │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                     │
│  │ experiments/│  │  tests/     │  │ prototypes/ │                     │
│  │ (new ideas) │  │ (visual)    │  │ (WIP)       │                     │
│  └─────────────┘  └─────────────┘  └─────────────┘                     │
│                                                                          │
│  Sandbox for experimentation - CAN import from world-gen                │
└─────────────────────────────────────────────────────────────────────────┘
                                                    │
                                                    ▼ IMPORTS
┌─────────────────────────────────────────────────────────────────────────┐
│                           GAME PACKAGE                                   │
│  packages/game/                                                          │
│  - Imports blocks/assemblages from world-gen                             │
│  - Uses generators to create scenes                                      │
│  - Handles runtime instancing and LOD                                   │
└─────────────────────────────────────────────────────────────────────────┘
```

## Promotion Stages

### Stage 1: Primitive Validation (playground/components/)

**Entry Criteria:**
- Component renders without errors
- Has proper TypeScript types exported
- Follows Babylonjs/Reactylon patterns
- Uses PBR materials with proper disposal

**Validation Checklist:**
- [ ] Visual test page exists (`tests/{component}.html`)
- [ ] Leva controls exposed for all variant props
- [ ] Renders at 60fps on target device (Pixel 8a)
- [ ] Memory: no leaks (materials/meshes disposed in cleanup)
- [ ] Works with seeded random for determinism
- [ ] Documented in COMPONENT_SPECS.md

### Stage 2: Compound Validation (playground/compounds/)

**Entry Criteria:**
- Composes multiple primitives
- Has snap points defined
- Can be placed via grid coordinates

**Validation Checklist:**
- [ ] Snap points work with adjacent blocks
- [ ] Rotation (0/90/180/270) works correctly
- [ ] Grid placement is deterministic from seed
- [ ] Props density is procedurally controllable

### Stage 3: Block Registration (playground/blocks/)

**Entry Criteria:**
- Implements `BlockDefinition` interface
- Has complete snap point configuration
- Category assigned (RTB/SRB/WTB)
- Faction affinity defined

**Validation Checklist:**
- [ ] Block snaps correctly to all adjacent types
- [ ] Grid overlap detection works
- [ ] Seed produces consistent results
- [ ] Debug visualization renders

### Stage 4: Production Promotion (world-gen package)

**Entry Criteria:**
- Block validated in playground
- Performance benchmarked
- No playground dependencies

**Promotion Process:**
1. Copy block definition to `packages/world-gen/blocks/`
2. Register in category pool (`world-gen/catalog/`)
3. Create production renderer (optimized)
4. Add to Dagster-style pipeline

## File Structure After Promotion

```
packages/world-gen/
├── blocks/
│   ├── rtb/                    # Rooftop Territory Blocks
│   │   ├── shelter/
│   │   │   ├── ShelterBlock.ts       # Block definition + snap points
│   │   │   ├── ShelterRenderer.tsx   # Production renderer
│   │   │   └── index.ts
│   │   ├── market/
│   │   ├── equipment/
│   │   └── landing/
│   ├── srb/                    # Submerged Ruin Blocks
│   └── wtb/                    # Waterway Transit Blocks
├── assemblages/
│   ├── rooftop/               # Multi-block rooftop compositions
│   ├── territory/             # Full territory assemblies
│   └── waterway/              # Canal/transit compositions
├── generators/
│   ├── TerritoryGenerator.ts  # Generates full territories
│   ├── BlockPlacer.ts         # Handles grid placement
│   └── ConnectionResolver.ts  # Resolves snap connections
├── catalog/
│   ├── BlockCatalog.ts        # DDL-style block registry
│   ├── AssemblageCatalog.ts   # Composed assemblage registry
│   └── PoolDefinitions.ts     # Category pool configs
└── index.ts
```

## Daggerfall-Inspired Features

### 1. Snap Point System
```typescript
// From Block.ts
interface SnapPoint {
  id: string;
  type: SnapPointType;      // floor_edge, wall_doorway, etc.
  direction: SnapDirection; // north, south, east, west, up, down
  localPosition: { x, y, z };
  width: number;
  tags?: string[];
}
```

### 2. Grid System
```typescript
// 8m base unit (allows 2-3 shelters per edge)
const GRID_UNIT_SIZE = 8;

// Standard sizes
const STANDARD_BLOCK_SIZES = {
  small: { x: 1, y: 1, z: 1 },    // 8x8m
  medium: { x: 2, y: 1, z: 2 },   // 16x16m
  large: { x: 3, y: 1, z: 3 },    // 24x24m
};
```

### 3. Seeded Selection
```typescript
// Same seed + position = same block every time
function selectBlockFromPool(pool, seed, gridX, gridZ) {
  const locationSeed = seed ^ (gridX * 73856093) ^ (gridZ * 19349663);
  const rng = createSeededRandom(locationSeed);
  return rng.pick(pool);
}
```

### 4. Block Categories (Pools)
- **RTB (Rooftop Territory Block)** - exterior city blocks
- **SRB (Submerged Ruin Block)** - dungeon/interior blocks
- **WTB (Waterway Transit Block)** - connections between rooftops

## Babylon.js Optimization Features

### Instancing
- Use `InstancedMesh` for repeated elements (railings, crates, etc.)
- Merge static geometry with `Mesh.MergeMeshes()`
- GPU instancing for high-volume props

### LOD System
- Define LOD levels per block (LOD0-3)
- Use `Mesh.addLODLevel()` for automatic switching
- Billboard imposters for distant blocks

### Material Atlasing
- Combine PBR textures into atlases
- Share materials across block instances
- Use `MaterialPluginManager` for variants

### Culling
- Frustum culling (automatic in Babylon)
- Occlusion culling for dense blocks
- Portal-based culling for interiors (SRB)

## Promotion Automation

### CLI Command (Future)
```bash
# Validate component in playground
pnpm --filter @neo-tokyo/playground validate Wall

# Promote to world-gen
pnpm --filter @neo-tokyo/world-gen promote-block rtb_shelter
```

### Automated Checks
1. TypeScript compiles without errors
2. All Leva controls have defaults
3. Disposal cleanup passes memory check
4. Determinism test (same seed = same output)
5. Performance benchmark passes

## Current Status

### Validated Primitives (101 components)
- Structural: Wall, Floor, Roof, Platform, Stairs, Ramp, etc.
- Water/Flooded: Water, Pier, Boat, DockingStation, etc.
- Props: Crate, Barrel, Debris, Tarp, etc.
- Vegetation: Tree, Shrub, Vine, etc.
- Utilities: SolarPanel, RainCollector, RooftopGarden, Aquafarm

### Validated Compounds
- Building (multi-story)
- Room (enclosed space)
- Street (linear)
- Alley (narrow)
- Bridge (connection)

### Blocks Ready for Promotion
- `packages/playground/src/blocks/RTBBlocks.ts` - Initial RTB definitions

## Package Structure

### @neo-tokyo/assets (Shared)
```
packages/assets/
├── src/index.ts              # Typed asset paths and catalogs
├── textures/ambientcg/       # PBR textures (gitignored, local copy)
├── models/                   # 3D models
├── sounds/                   # Audio files
└── scripts/copy-textures.sh  # Local asset setup
```

### @neo-tokyo/world-gen (Production)
```
packages/world-gen/
├── src/
│   ├── blocks/               # Production block definitions
│   │   ├── BlockSystem.ts    # Core system (types, utils)
│   │   └── rtb/              # Rooftop Territory Blocks
│   ├── catalog/              # Block catalog (DDL registry)
│   ├── assemblages/          # Multi-block compositions
│   └── generators/           # Procedural generators
└── package.json
```

### @neo-tokyo/playground (Sandbox)
```
packages/playground/
├── src/
│   ├── experiments/          # New component ideas
│   ├── tests/                # Visual test pages
│   └── prototypes/           # Work in progress
└── CAN import from: @neo-tokyo/assets, @neo-tokyo/world-gen
```

## Next Steps

1. ✅ **Create world-gen package** with production structure
2. ✅ **Create shared assets package** for textures/models
3. ✅ **Define first production blocks** (rtb_shelter variants)
4. **Update playground** to import from shared packages
5. **Build TerritoryGenerator** for procedural placement
6. **Implement LOD and instancing** optimizations
7. **Create validation CLI** for automated promotion
