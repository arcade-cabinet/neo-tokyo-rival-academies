# Open World Architecture - Daggerfall-Style Neo-Tokyo

**Date**: January 2026
**Status**: Design Phase

## Core Concept

Replace 9 linear scenes with a **procedurally generated open world Neo-Tokyo** that players can explore freely. Story quests are woven into the world, not gated by linear progression.

## Daggerfall Lessons Applied

| Daggerfall Technique | Neo-Tokyo Application |
|---------------------|----------------------|
| Procedural city blocks | District-based generation from seed |
| Building interiors | Key locations are enterable (optional) |
| NPC placement | Seeded spawns based on district profile |
| Quest markers in world | Quest objectives appear at world positions |
| LOD/streaming | Load active + adjacent districts only |

## World Structure

```
Neo-Tokyo Open World
├── 10 Districts (from WORLD_GENERATION.md)
│   ├── Academy Gate Slums (starter)
│   ├── Neon Spire Entertainment
│   ├── Corporate Pinnacle
│   ├── Industrial Forge
│   ├── Underground Sewers
│   ├── Rooftop Skybridge
│   ├── Abandoned Overgrowth
│   ├── Club Eclipse Nightlife
│   ├── Central Pillar Hub
│   └── Fringe Resistance Alley
├── Connecting Infrastructure
│   ├── Main streets
│   ├── Elevators (strata transitions)
│   └── Bridges (rooftop connections)
└── Vertical Strata
    ├── Upper (y=60-100): Corporate
    ├── Mid (y=0-40): Entertainment/Mixed
    └── Lower (y=-30-0): Slums/Underground
```

## Generation Pipeline

### 1. World Grid

```ts
interface WorldCell {
  districtId: string;
  stratum: 'upper' | 'mid' | 'lower';
  cellType: 'building' | 'street' | 'plaza' | 'bridge' | 'elevator';
  seed: string; // Deterministic sub-seed
  loaded: boolean;
}

// Grid covers entire Neo-Tokyo
const WORLD_SIZE = { x: 100, z: 100 }; // 10,000 cells
const CELL_SIZE = 20; // meters
```

### 2. District Assignment

Using Voronoi + noise from master seed:
```ts
function assignDistrict(cellX: number, cellZ: number, masterSeed: string): DistrictProfile {
  // Voronoi centers from seed
  const centers = generateVoronoiCenters(masterSeed, 10);
  // Find nearest center
  const nearest = findNearestCenter(cellX, cellZ, centers);
  // Return district profile
  return DISTRICT_PROFILES[nearest.districtIndex];
}
```

### 3. Cell Content Generation

Each cell generates:
1. **Ground mesh** - Asphalt, concrete, grating based on district
2. **Buildings** - Height/style from district profile
3. **Props** - Density from district profile
4. **NPCs** - Faction-appropriate spawns
5. **Collision** - Walkable bounds

```ts
function generateCell(cell: WorldCell): CellContent {
  const rng = createSeededRNG(cell.seed);
  const profile = getDistrictProfile(cell.districtId);

  return {
    ground: generateGround(cell.cellType, profile, rng),
    buildings: generateBuildings(profile, rng),
    props: generateProps(profile.density, rng),
    npcs: generateNPCs(profile.faction, rng),
    collision: generateCollision(buildings, props),
  };
}
```

### 4. LOD/Streaming

```
Player Position → Active Cell
├── Load: Active cell + 8 adjacent cells (3x3 grid)
├── Keep: Cells within 3 cell radius
└── Unload: Cells beyond 5 cell radius
```

## Player Experience

### Movement
- Free movement within loaded cells
- Collide with buildings/props
- Enter key locations (marked)
- Use elevators to change strata

### Exploration
- Discover new districts
- Find quest givers/objectives
- Collect data shards
- Encounter faction NPCs

### Quests
- Main story: Midnight Exam rivalry (Kai vs Vera)
- B-story: Faction reputation quests
- C-story: Disruptor events (aliens, mall)
- Side quests: Procedural from grammar

## Technical Implementation

### Phase 1: Grid + Districts
1. Implement WorldGrid class
2. Voronoi district assignment
3. Basic cell content generation
4. Streaming loader

### Phase 2: Content
1. Building generation per district style
2. Prop placement
3. NPC spawning
4. Collision mesh generation

### Phase 3: Integration
1. Quest markers in world
2. Dialogue triggers
3. Combat encounters
4. Story progression

### Phase 4: Polish
1. LOD optimization
2. Night/day cycle
3. Weather effects
4. Performance tuning

## Files to Create

```
packages/diorama/src/
├── world/
│   ├── WorldGrid.ts          # Cell grid management
│   ├── DistrictGenerator.ts  # Per-district content gen
│   ├── CellStreamer.ts       # LOD/loading
│   └── WorldRenderer.tsx     # React component
├── generation/
│   ├── BuildingGenerator.ts  # Procedural buildings
│   ├── PropGenerator.ts      # Seeded prop placement
│   └── NPCSpawner.ts         # NPC placement
└── districts/
    ├── profiles.ts           # District configurations
    └── themes.ts             # Visual theme data
```

## Migration from Linear Scenes

| Linear Component | Open World Equivalent |
|-----------------|----------------------|
| SceneManager | WorldGrid + CellStreamer |
| Sector7Scene | District: Academy Gate Slums |
| AlienShipScene | Event trigger in world |
| BossAmbushScene | Encounter trigger |
| Intro cutscene | Triggered on game start |

## Questions to Resolve

1. **Building interiors**: Generate or skip for v1?
2. **Vertical traversal**: Elevators only or climbing?
3. **Day/night**: Static night or dynamic cycle?
4. **Save system**: How to persist world state?
5. **Vera rival**: Static position or AI-driven movement?

---

This is a significant architectural change from linear scenes to open world. The seeded generation system we have is well-suited for this approach.
