# Procedural World Architecture

**Date**: January 19, 2026
**Purpose**: Comprehensive technical specification for Daggerfall-scale procedural world generation
**Baseline**: The Elder Scrolls II: Daggerfall (1996) via Daggerfall Unity

---

## Executive Summary

This document defines how Neo-Tokyo: Rival Academies will generate a world of **Daggerfall-scale** (15,000+ locations, 750,000+ NPCs) using modern technology:

- **Babylon.js** for 3D rendering and streaming
- **GenAI (Meshy)** for high-quality asset seed pools
- **Deterministic seeds** for reproducible world generation
- **Modular block assembly** adapted for flooded archipelago

**Key Innovation**: Where Daggerfall used ~500 hand-crafted blocks, we use GenAI to generate thousands of high-quality block variants at build time, then deterministically select from them at runtime.

---

## Part 1: Daggerfall's Architecture (What We're Adapting)

### 1.1 World Dimensions

```
DAGGERFALL WORLD:
├── Map: 1000 x 500 pixels
├── Each pixel: 128 x 128 terrain tiles
├── Total area: ~160,000 km² (size of Great Britain)
├── Locations: 15,000+
├── NPCs: 750,000+ (seed-generated, not stored)
└── Dungeons: Thousands of unique layouts

COORDINATE HIERARCHY:
Map Pixel (256-unit)
  └── Terrain Tile (128x128 per pixel)
    └── RMB Block (4096 units, city)
      └── Building positions (256-unit grid)
        └── Model vertices (world units)
```

### 1.2 Block Types

**RMB Blocks** (Residential/Municipal Blocks):
- Size: 4096 x 4096 world units
- Used for: Cities, villages, outdoor locations
- Contains: Buildings, streets, NPCs, scenery
- Ground: 16x16 tile grid with scenery overlay

**RDB Blocks** (Random Dungeon Blocks):
- Size: 2048 x 2048 world units
- Used for: Dungeons, crypts, caves
- Contains: Rooms, corridors, enemies, loot
- Assembly: Grid-based, X/Z positioning

### 1.3 Location Types

| Type | Block Size | Description |
|------|------------|-------------|
| TownCity | 6-8 x 6-8 | Large settlement |
| TownHamlet | 3-4 x 3-4 | Medium settlement |
| TownVillage | 1-3 x 1-3 | Small settlement |
| HomeFarms | 1 x 1 | Single farmhouse |
| DungeonLabyrinth | 20+ blocks | Large dungeon |
| DungeonKeep | 10-20 blocks | Medium dungeon |
| DungeonRuin | 3-10 blocks | Small dungeon |

### 1.4 Streaming Architecture

```typescript
// Daggerfall's streaming pattern
TerrainDistance = N
LoadedTerrains = (2*N+1) × (2*N+1)
// N=4 → 81 terrains (9×9 grid around player)

// Floating origin compensation
// As player moves, world objects compensate
// Prevents floating-point precision loss
WorldCompensation: Vector3  // Cumulative offset
```

### 1.5 NPC Generation Strategy

**Critical Insight**: Daggerfall doesn't store 750,000 NPCs. It stores:
- Faction definitions (~500)
- Location metadata (15,000)
- NPC seeds (compact integers)

NPCs are **regenerated on demand** using deterministic seeds:
```
NPC = Generate(locationSeed + factionSeed + timeSeed)
// Same inputs → same NPC every time
```

---

## Part 2: Neo-Tokyo Adaptation

### 2.1 World Structure: Flooded Archipelago

```
NEO-TOKYO WORLD:
├── Map: 500 x 500 pixels (250,000 km² water area)
├── Each pixel: 64 x 64 water tiles
├── Islands: Rooftop clusters emerging from water
├── Cities: 5 major flooded cities
│   ├── Neo-Tokyo (central, largest)
│   ├── Neo-Yokohama (industrial, south)
│   ├── Neo-Kawasaki (between, contested)
│   ├── Chiba Ruins (east, dangerous)
│   └── Mountain Refuge (north, dry land)
├── Locations per city: 2,000-5,000
├── Total locations: ~15,000
└── NPCs: 100,000+ (seed-generated)
```

### 2.2 Block Types: Flooded World

**RTB Blocks** (Rooftop Territory Blocks):
- Size: 4096 x 4096 world units
- Used for: Rooftop settlements, territories
- Contains: Shelters, aquafarms, docks, bridges
- Ground: Rooftop surface with edge dropoffs

**SRB Blocks** (Submerged Ruin Blocks):
- Size: 2048 x 2048 world units
- Used for: Underwater dungeons, flooded buildings
- Contains: Salvage, hazards, loot, air pockets
- Assembly: 3D grid (includes depth/Y axis)

**WTB Blocks** (Waterway Transit Blocks):
- Size: Variable (path-based)
- Used for: Ferry routes, boat paths
- Contains: Navigation markers, hazards, waypoints
- Assembly: Spline-based connections

### 2.3 Location Types: Faction Territories

| Type | RTB Size | Faction Affinity | Description |
|------|----------|------------------|-------------|
| AcademyCampus | 6-8 x 6-8 | Academy | Large school complex |
| SyndicateStronghold | 4-6 x 4-6 | Syndicate | Criminal headquarters |
| CollectiveMarket | 4-6 x 4-6 | Collective | Trading hub |
| RefugeSettlement | 2-4 x 2-4 | Refuge | Civilian housing |
| RunnerOutpost | 1-2 x 1-2 | Runners | Mobile courier base |
| DrownedShrine | 1 x 1 | Drowned | Cult gathering |
| SubmergedRuin | 3-10 SRB | None | Underwater dungeon |
| SalvageZone | 1-3 SRB | Contested | Loot area |

### 2.4 Coordinate System

```typescript
interface WorldCoordinates {
  // Map-level (city selection)
  cityIndex: number;        // 0-4 (which city)

  // Region-level (territory selection)
  regionX: number;          // 0-499 within city
  regionY: number;          // 0-499 within city

  // Block-level (RTB/SRB placement)
  blockX: number;           // Block grid position
  blockZ: number;           // Block grid position
  blockY: number;           // Elevation (rooftop vs submerged)

  // Local-level (within block)
  localPosition: Vector3;   // World units within block
}

// Constants
const BLOCK_SIZE = 4096;           // RTB size in world units
const DUNGEON_BLOCK_SIZE = 2048;   // SRB size
const TILES_PER_BLOCK = 16;        // Ground tile grid
const WATER_LEVEL = 0;             // Y=0 is water surface
const ROOFTOP_MIN_HEIGHT = 10;     // Minimum rooftop elevation
```

---

## Part 3: GenAI Integration (Our Innovation)

### 3.1 The GenAI Advantage

**Daggerfall's Limitation**: ~500 hand-crafted blocks, assembled procedurally.
- Players eventually recognize repeating patterns
- Limited visual variety
- Years of artist time to create

**Our Solution**: GenAI-generated seed pools at build time.
- 10,000+ unique block variants
- Consistent style via prompt engineering
- Generated in days, not years
- Deterministically selected at runtime

### 3.2 Build-Time Asset Generation Pipeline

```
BUILD PIPELINE:

1. PROMPT TEMPLATES (human-authored)
   ├── Rooftop styles by faction
   ├── Building types by function
   ├── Weathering levels by age
   └── Detail density by importance

2. MESHY GENERATION (automated)
   ├── Generate 100+ variants per template
   ├── Apply style consistency checks
   ├── Export as GLB with LOD variants
   └── Generate metadata (anchors, bounds)

3. SEED POOL COMPILATION (automated)
   ├── Index all generated assets
   ├── Tag with semantic metadata
   ├── Compute compatibility matrices
   └── Export as binary manifest

4. RUNTIME SELECTION (deterministic)
   ├── Seed → Asset index mapping
   ├── Same seed → Same asset always
   └── No GenAI calls at runtime
```

### 3.3 Asset Seed Pool Structure

```typescript
interface AssetSeedPool {
  version: string;
  generatedAt: Date;

  blocks: {
    rtb: RTBManifest[];      // Rooftop blocks
    srb: SRBManifest[];      // Submerged ruins
    wtb: WTBManifest[];      // Waterway transit
  };

  buildings: {
    shelter: BuildingManifest[];
    aquafarm: BuildingManifest[];
    dock: BuildingManifest[];
    // ... per building type
  };

  props: {
    debris: PropManifest[];
    vegetation: PropManifest[];
    furniture: PropManifest[];
  };

  npcs: {
    civilian: NPCManifest[];
    faction: Record<Faction, NPCManifest[]>;
  };
}

interface RTBManifest {
  id: string;                    // Unique asset ID
  seedRange: [number, number];   // Seeds that select this
  glbPath: string;               // Asset file path
  lodPaths: string[];            // LOD variants

  metadata: {
    faction: Faction[];          // Compatible factions
    wealth: 'poor' | 'moderate' | 'wealthy';
    density: 'sparse' | 'normal' | 'dense';
    hasWater: boolean;           // Contains water features
    hasPower: boolean;           // Has electricity
  };

  anchors: AnchorPoint[];        // Connection points
  bounds: BoundingBox;           // Collision bounds
  navMesh: string;               // NavMesh data path
}
```

### 3.4 Deterministic Selection Algorithm

```typescript
function selectAsset(
  pool: AssetManifest[],
  seed: number,
  constraints: AssetConstraints
): AssetManifest {
  // Filter by constraints
  const compatible = pool.filter(asset =>
    matchesConstraints(asset, constraints)
  );

  // Deterministic selection from compatible set
  const index = seededRandom(seed) % compatible.length;
  return compatible[index];
}

function seededRandom(seed: number): number {
  // Mulberry32 PRNG - fast, deterministic
  let t = seed + 0x6D2B79F5;
  t = Math.imul(t ^ t >>> 15, t | 1);
  t ^= t + Math.imul(t ^ t >>> 7, t | 61);
  return ((t ^ t >>> 14) >>> 0) / 4294967296;
}

// Usage
const blockSeed = hashLocation(cityIndex, regionX, regionY);
const block = selectAsset(pool.blocks.rtb, blockSeed, {
  faction: 'academy',
  wealth: 'moderate'
});
// Same location → same block, always
```

---

## Part 4: Streaming World Implementation

### 4.1 Babylon.js Streaming Architecture

```typescript
class StreamingWorld {
  private loadedRegions: Map<string, LoadedRegion>;
  private playerPosition: Vector3;
  private loadDistance: number = 4;  // Regions in each direction

  // Floating origin compensation (like Daggerfall)
  private worldOffset: Vector3 = Vector3.Zero();
  private readonly REBASE_THRESHOLD = 10000;

  update(playerPos: Vector3): void {
    this.playerPosition = playerPos;

    // Check for floating origin rebase
    if (playerPos.length() > this.REBASE_THRESHOLD) {
      this.rebaseOrigin(playerPos);
    }

    // Determine which regions should be loaded
    const currentRegion = this.worldToRegion(playerPos);
    const neededRegions = this.getRegionsInRange(currentRegion, this.loadDistance);

    // Unload distant regions
    for (const [key, region] of this.loadedRegions) {
      if (!neededRegions.has(key)) {
        this.unloadRegion(region);
        this.loadedRegions.delete(key);
      }
    }

    // Load new regions
    for (const regionKey of neededRegions) {
      if (!this.loadedRegions.has(regionKey)) {
        this.loadRegionAsync(regionKey);
      }
    }
  }

  private rebaseOrigin(playerPos: Vector3): void {
    // Shift all world objects to keep player near origin
    const offset = playerPos.clone();
    this.worldOffset.addInPlace(offset);

    for (const region of this.loadedRegions.values()) {
      region.rootNode.position.subtractInPlace(offset);
    }

    // Player position reset to near-origin
    // (handled by player controller)
  }
}
```

### 4.2 Region Loading Pipeline

```typescript
interface LoadedRegion {
  key: string;
  coordinates: RegionCoordinates;
  rootNode: TransformNode;
  blocks: LoadedBlock[];
  npcs: LoadedNPC[];
  waterMesh: Mesh | null;
  navMesh: NavMeshData;
  state: 'loading' | 'ready' | 'unloading';
}

async function loadRegion(
  coords: RegionCoordinates,
  seedPool: AssetSeedPool
): Promise<LoadedRegion> {
  const regionSeed = computeRegionSeed(coords);

  // 1. Determine region type from world data
  const regionType = getRegionType(coords);

  // 2. Select blocks for this region
  const blockLayout = generateBlockLayout(regionSeed, regionType);

  // 3. Load block assets (async, parallel)
  const blockPromises = blockLayout.map(async (blockDef) => {
    const manifest = selectAsset(
      seedPool.blocks.rtb,
      blockDef.seed,
      blockDef.constraints
    );
    return loadBlock(manifest, blockDef.position);
  });

  // 4. Generate water plane
  const waterMesh = createWaterPlane(coords, regionType);

  // 5. Wait for all blocks
  const blocks = await Promise.all(blockPromises);

  // 6. Generate NPCs (seed-based, not stored)
  const npcs = generateRegionNPCs(regionSeed, regionType);

  // 7. Compile navmesh from blocks
  const navMesh = compileNavMesh(blocks);

  return {
    key: regionKey(coords),
    coordinates: coords,
    rootNode: createRegionRoot(coords),
    blocks,
    npcs,
    waterMesh,
    navMesh,
    state: 'ready'
  };
}
```

### 4.3 LOD System

```typescript
interface LODConfig {
  levels: LODLevel[];
  transitionDistance: number;
}

interface LODLevel {
  distance: number;      // Distance threshold
  meshPath: string;      // LOD mesh file
  shadowsEnabled: boolean;
  billboardFallback: boolean;
}

const BUILDING_LOD: LODConfig = {
  transitionDistance: 50,
  levels: [
    { distance: 0, meshPath: 'lod0.glb', shadowsEnabled: true, billboardFallback: false },
    { distance: 100, meshPath: 'lod1.glb', shadowsEnabled: true, billboardFallback: false },
    { distance: 300, meshPath: 'lod2.glb', shadowsEnabled: false, billboardFallback: false },
    { distance: 500, meshPath: null, shadowsEnabled: false, billboardFallback: true },
  ]
};

// Babylon.js LOD implementation
function setupLOD(mesh: Mesh, config: LODConfig): void {
  for (const level of config.levels) {
    if (level.meshPath) {
      const lodMesh = await loadMesh(level.meshPath);
      mesh.addLODLevel(level.distance, lodMesh);
    } else if (level.billboardFallback) {
      mesh.addLODLevel(level.distance, null); // Culled at this distance
    }
  }
}
```

---

## Part 5: NPC System

### 5.1 Seed-Based NPC Generation

```typescript
interface NPCSeed {
  locationSeed: number;    // From region coordinates
  slotIndex: number;       // NPC slot within location
  factionSeed: number;     // Faction affiliation
  timeSeed: number;        // Time-based variation (schedules)
}

interface GeneratedNPC {
  id: string;              // Unique identifier (derived from seed)
  name: string;            // Generated from name bank
  gender: 'male' | 'female';
  faction: Faction;
  role: NPCRole;
  appearance: NPCAppearance;
  schedule: NPCSchedule;
  dialogue: DialogueTree;
}

function generateNPC(seed: NPCSeed): GeneratedNPC {
  const rng = createSeededRNG(combineSeed(seed));

  // Deterministic generation - same seed = same NPC
  const faction = selectFaction(rng, seed.factionSeed);
  const gender = rng.next() > 0.5 ? 'male' : 'female';
  const name = generateName(rng, faction, gender);
  const role = selectRole(rng, faction);
  const appearance = generateAppearance(rng, faction, role);
  const schedule = generateSchedule(rng, role);
  const dialogue = selectDialogue(rng, faction, role);

  return {
    id: `npc_${hashSeed(seed)}`,
    name,
    gender,
    faction,
    role,
    appearance,
    schedule,
    dialogue
  };
}
```

### 5.2 NPC Scheduling System

```typescript
interface NPCSchedule {
  // 24-hour schedule, hour -> activity
  activities: Map<number, ScheduledActivity>;
}

interface ScheduledActivity {
  type: 'sleep' | 'work' | 'eat' | 'wander' | 'guard' | 'trade';
  location: LocationReference;
  interruptible: boolean;
}

// Example: Fish farmer schedule
const FISH_FARMER_SCHEDULE: NPCSchedule = {
  activities: new Map([
    [5, { type: 'work', location: 'aquafarm', interruptible: true }],
    [12, { type: 'eat', location: 'home', interruptible: true }],
    [13, { type: 'work', location: 'aquafarm', interruptible: true }],
    [18, { type: 'wander', location: 'market', interruptible: true }],
    [21, { type: 'sleep', location: 'home', interruptible: false }],
  ])
};
```

### 5.3 NPC State Persistence

```typescript
// Only persist state for NPCs player has interacted with
interface NPCStateOverride {
  npcId: string;           // Generated NPC ID
  reputation: number;      // Player reputation with this NPC
  questState: QuestState;  // Active quest progress
  isAlive: boolean;        // Can be killed
  customDialogue: string[];// Unlocked dialogue options
  lastInteraction: Date;   // For time-based changes
}

class NPCStateManager {
  private overrides: Map<string, NPCStateOverride> = new Map();

  getNPC(seed: NPCSeed): GeneratedNPC {
    const npc = generateNPC(seed);  // Always regenerate base

    // Apply any saved overrides
    const override = this.overrides.get(npc.id);
    if (override) {
      return applyOverride(npc, override);
    }

    return npc;
  }

  // Only called when player interacts
  saveInteraction(npcId: string, interaction: Interaction): void {
    const existing = this.overrides.get(npcId) || createDefaultOverride(npcId);
    existing.lastInteraction = new Date();
    // Update based on interaction...
    this.overrides.set(npcId, existing);
  }
}
```

---

## Part 6: Quest System Integration

### 6.1 Location-Based Quest References

```typescript
interface QuestLocationRef {
  type: 'fixed' | 'remote' | 'local' | 'faction';

  // For 'fixed': exact coordinates
  fixedLocation?: WorldCoordinates;

  // For 'remote': search criteria
  remoteSearch?: {
    locationType: LocationType;
    faction?: Faction;
    minDistance?: number;
    maxDistance?: number;
  };

  // For 'local': near player
  localRadius?: number;

  // For 'faction': faction-controlled location
  factionOwner?: Faction;
}

// Quest resolves location at runtime
function resolveQuestLocation(
  ref: QuestLocationRef,
  playerPos: WorldCoordinates
): WorldCoordinates {
  switch (ref.type) {
    case 'fixed':
      return ref.fixedLocation!;

    case 'remote':
      return findMatchingLocation(ref.remoteSearch!);

    case 'local':
      return findNearbyLocation(playerPos, ref.localRadius!);

    case 'faction':
      return findFactionLocation(ref.factionOwner!);
  }
}
```

### 6.2 Procedural Quest Generation

```typescript
interface QuestTemplate {
  id: string;
  type: 'delivery' | 'fetch' | 'eliminate' | 'escort' | 'investigate';
  giver: NPCRole[];           // Who can give this quest
  targets: QuestLocationRef[];// Where quest takes place
  rewards: RewardTable;
  prerequisites: QuestPrereq[];
}

function generateQuest(
  template: QuestTemplate,
  giverNPC: GeneratedNPC,
  seed: number
): GeneratedQuest {
  const rng = createSeededRNG(seed);

  // Select specific locations from template options
  const targetLocation = resolveQuestLocation(
    rng.select(template.targets),
    giverNPC.location
  );

  // Generate quest-specific NPCs/items
  const targetNPC = template.type === 'eliminate'
    ? generateQuestTarget(rng, targetLocation)
    : null;

  const questItem = template.type === 'fetch'
    ? generateQuestItem(rng, template)
    : null;

  // Calculate rewards based on distance/difficulty
  const rewards = calculateRewards(
    template.rewards,
    giverNPC.location,
    targetLocation
  );

  return {
    id: `quest_${seed}`,
    template: template.id,
    giver: giverNPC.id,
    targetLocation,
    targetNPC,
    questItem,
    rewards,
    state: 'available'
  };
}
```

---

## Part 7: Data Formats

### 7.1 World Data File Structure

```
/data/
├── world/
│   ├── manifest.json           # World metadata
│   ├── cities/
│   │   ├── neo-tokyo.json      # City definition
│   │   ├── neo-yokohama.json
│   │   └── ...
│   └── regions/
│       ├── climate.bin         # Climate data (binary)
│       ├── factions.bin        # Faction control map
│       └── elevation.bin       # Height map
│
├── assets/
│   ├── seed-pool.json          # Asset manifest
│   ├── blocks/
│   │   ├── rtb/               # Rooftop blocks (GLB)
│   │   ├── srb/               # Submerged blocks (GLB)
│   │   └── wtb/               # Waterway blocks (GLB)
│   ├── buildings/
│   │   └── {type}/            # By building type (GLB)
│   └── npcs/
│       └── {faction}/         # By faction (GLB)
│
├── quests/
│   ├── templates/             # Quest template JSON
│   └── dialogue/              # Dialogue trees
│
└── localization/
    ├── en/
    │   ├── names.json         # Name generation banks
    │   └── strings.json       # UI strings
    └── ja/
        └── ...
```

### 7.2 City Definition Format

```typescript
interface CityDefinition {
  id: string;
  name: string;
  localizedName: Record<string, string>;

  // Geographic bounds
  bounds: {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
  };

  // Climate/appearance
  climate: 'temperate' | 'industrial' | 'tropical' | 'arctic';
  waterColor: Color3;
  skyboxId: string;

  // Faction presence
  factions: {
    [faction: string]: {
      controlPercentage: number;
      headquarters?: RegionCoordinates;
      influence: 'dominant' | 'strong' | 'moderate' | 'weak';
    };
  };

  // Special locations
  landmarks: LandmarkDefinition[];

  // Inter-city connections
  ferryRoutes: FerryRoute[];
}
```

### 7.3 Save Game Format

```typescript
interface SaveGame {
  version: string;
  timestamp: Date;
  playTime: number;

  // Player state
  player: {
    position: WorldCoordinates;
    stats: PlayerStats;
    inventory: InventorySlot[];
    equipment: Equipment;
    skills: SkillLevels;
  };

  // World state overrides (sparse - only changed things)
  worldState: {
    // NPCs player has interacted with
    npcOverrides: Map<string, NPCStateOverride>;

    // Locations player has discovered
    discoveredLocations: Set<string>;

    // Faction reputation
    factionReputation: Map<Faction, number>;

    // Active/completed quests
    quests: QuestState[];

    // World events triggered
    events: WorldEvent[];
  };

  // Runtime state (not world-affecting)
  session: {
    currentCity: string;
    activeQuest: string | null;
    mapMarkers: MapMarker[];
  };
}
```

---

## Part 8: Performance Targets

### 8.1 Memory Budget

```
TARGET DEVICE: Mid-range mobile (Pixel 8a equivalent)

MEMORY BUDGET:
├── Total: 4GB device, 2GB available to app
├── Babylon.js runtime: ~100MB
├── Loaded regions: ~400MB (9 regions at 45MB each)
├── Asset cache: ~200MB (frequently used blocks)
├── NPC data: ~50MB (active NPCs only)
├── Quest/dialogue: ~50MB
├── Audio: ~100MB
├── UI/misc: ~100MB
└── Headroom: ~500MB

STREAMING LIMITS:
├── Max loaded regions: 9 (3x3 grid)
├── Max active NPCs: 50 (LOD culls distant)
├── Max visible blocks: 81 (9x9 at close range)
└── LOD transition: 100m / 300m / 500m
```

### 8.2 Performance Metrics

```
TARGET: 60 FPS on Pixel 8a

FRAME BUDGET: 16.67ms
├── Render: 8ms
├── Physics: 2ms
├── AI/NPC: 2ms
├── Streaming: 2ms (async, but budget for sync work)
└── Headroom: 2.67ms

ASYNC BUDGETS (per frame, amortized):
├── Region loading: 100ms (spread across multiple frames)
├── Block instantiation: 20ms per block
├── NPC generation: 1ms per NPC
└── Quest resolution: 5ms
```

### 8.3 Loading Times

```
TARGET LOADING TIMES:
├── Initial load: <10 seconds
├── Region transition: <500ms (async, no hitch)
├── Inter-city ferry: <5 seconds (with loading screen)
├── Building interior: <1 second
└── Save/load: <3 seconds
```

---

## Part 9: Implementation Phases

### Phase 1: Foundation (Weeks 1-4)
- [ ] Implement streaming world architecture
- [ ] Create coordinate system and conversion functions
- [ ] Build basic RTB block loading from GLB
- [ ] Implement floating origin compensation
- [ ] Create water plane system

### Phase 2: Asset Pipeline (Weeks 5-8)
- [ ] Define GenAI prompt templates for blocks
- [ ] Generate initial seed pool (1,000 blocks)
- [ ] Build asset manifest compiler
- [ ] Implement deterministic asset selection
- [ ] Create LOD system

### Phase 3: World Generation (Weeks 9-12)
- [ ] Implement region type determination
- [ ] Build block layout generator
- [ ] Create NavMesh compilation
- [ ] Implement faction territory system
- [ ] Add climate/weather variation

### Phase 4: NPC System (Weeks 13-16)
- [ ] Build seed-based NPC generation
- [ ] Implement scheduling system
- [ ] Create state persistence for interacted NPCs
- [ ] Add dialogue system integration
- [ ] Build faction reputation system

### Phase 5: Quest Integration (Weeks 17-20)
- [ ] Implement quest template system
- [ ] Build procedural quest generation
- [ ] Create location reference resolution
- [ ] Add quest state persistence
- [ ] Integrate with NPC dialogue

### Phase 6: Multi-City (Weeks 21-24)
- [ ] Implement inter-city ferry system
- [ ] Create city transition loading
- [ ] Add city-specific variations
- [ ] Build trade/economy between cities
- [ ] Polish and optimize

---

## Part 10: Key Differences from Daggerfall

| Aspect | Daggerfall | Neo-Tokyo |
|--------|------------|-----------|
| **Terrain** | Heightmap land | Water with islands |
| **Navigation** | Walking/horses | Boats/ferries/bridges |
| **Blocks** | ~500 hand-crafted | 10,000+ GenAI-generated |
| **Dungeons** | Underground | Submerged buildings |
| **NPCs** | Medieval fantasy | Post-apocalyptic survival |
| **Factions** | Kingdoms/guilds | Academy/Syndicate/etc |
| **Time period** | Fantasy | Near-future |
| **Vertical** | Flat + dungeons | Multi-level rooftops |
| **Assets** | Fixed at ship | Generated at build |

---

## References

- Daggerfall Unity source: `/Users/jbogaty/src/reference-codebases/daggerfall-unity`
- Key files: `MapsFile.cs`, `StreamingWorld.cs`, `RMBLayout.cs`, `RDBLayout.cs`
- Meshy API documentation for GenAI asset generation
- Babylon.js LOD and streaming documentation

---

*"Generate once, select forever. The seed is the source of truth."*

---

Last Updated: 2026-01-19
