# Modular Assembly System - Daggerfall-Inspired Procedural Generation

**Date**: January 19, 2026
**Purpose**: Define self-contained loop systems for procedural world assembly
**Inspiration**: The Elder Scrolls II: Daggerfall (1996)

---

## Daggerfall's Genius (What We're Learning)

Daggerfall procedurally generated 15,000+ locations and 750,000+ NPCs in 1996. The key insight:

> **Pre-made modular pieces + connection rules + semantic meaning = infinite meaningful worlds**

### How Daggerfall Did It

1. **Modular Prefabs**: Pre-built pieces (dungeon rooms, corridors, junctions, buildings)
2. **Exit/Anchor Points**: Each piece has tagged connection points defining where other pieces attach
3. **Matching Rules**: Exits match when positions align and orientations oppose
4. **Build-Time Generation**: World generated at studio, shipped deterministically
5. **Semantic Tagging**: Pieces tagged by type (crypt, castle, cave) → different loot/enemies

### The Critical Insight

Daggerfall's dungeons weren't just random geometry - they had **meaning**:
- Crypt dungeon → undead enemies, burial loot
- Castle dungeon → knights, noble treasure
- Cave dungeon → beasts, natural resources

**Our primitives must have the same semantic richness.**

---

## Self-Contained Loop System Definition

Every playground primitive must be a **self-contained loop system** with:

```typescript
interface LoopSystem {
  // 1. ANCHOR POINTS - How it connects to other pieces
  anchors: AnchorDefinition[];

  // 2. FACTION AFFINITY - Who owns/uses this
  factionAffinity: FactionAffinity[];

  // 3. GAMEPLAY LOOPS - What player activities it enables
  loops: GameplayLoop[];

  // 4. PLACEMENT RULES - Where the factory can place this
  placementRules: PlacementRule[];

  // 5. VISUAL SIGNAL - What it tells the player
  signals: VisualSignal[];
}
```

---

## Anchor Point System

### Anchor Types

```typescript
type AnchorType =
  | 'floor_surface'      // Things can be placed on top
  | 'wall_mount'         // Things attach to vertical surface
  | 'ceiling_hang'       // Things hang from above
  | 'edge_attach'        // Things attach at boundaries
  | 'water_float'        // Things float on water surface
  | 'rail_follow'        // Things move along rail paths
  | 'dock_berth';        // Boats land here

interface AnchorDefinition {
  type: AnchorType;
  position: Vector3;      // Relative to component origin
  direction: Vector3;     // Normal direction (for matching)
  tags: string[];         // Compatibility tags
  capacity?: number;      // How many things can attach
}
```

### Matching Algorithm (from Daggerfall)

```typescript
function anchorsMatch(a: Anchor, b: Anchor): boolean {
  // Positions must align
  const positionMatch = a.position.equals(b.position);

  // Directions must oppose (face each other)
  const directionOppose = a.direction.dot(b.direction) < -0.9;

  // Tags must have overlap
  const tagMatch = a.tags.some(t => b.tags.includes(t));

  return positionMatch && directionOppose && tagMatch;
}
```

---

## Faction Affinity System

### The Electricity Economy

**Critical World Context**: Most of flooded Neo-Tokyo is **pre-industrial**.

The majority of survivors live without electricity:
- **Day/night cycle** governs life (work by day, sleep by dark)
- **Lanterns and bonfires** for night illumination
- **Rooftop aquafarms** for protein (fish, algae)
- **Solar panels** are hoarded, traded like gold
- **Generators** are rare, fuel even rarer

This means **electricity is a luxury**, and displaying it is a **power statement**.

### The Neon Sign Revelation

**Original thinking**: Neon is deprecated, doesn't fit survival world.

**SMARTER thinking**: Neon signs are **salvaged pre-flood luxury items**:
- Require hoarded solar panels + batteries + generators
- Only the wealthy/powerful can run them
- Wealth in flooded world = **CRIME**
- Running neon at night is an **obscene display of hoarded resources**
- It says: "We have power. We have control. Fear us."

### Faction Resource Tiers

| Faction | Power Access | Display Wealth | Neon Use |
|---------|--------------|----------------|----------|
| **Syndicate** | Generator hoards | High | YES - territory markers |
| **Academy** | Solar arrays | Medium | Rare - special occasions |
| **Collective** | Shared solar | Low | NO - trade for necessities |
| **Runners** | Boat fuel priority | Low | NO - mobile, no infrastructure |
| **Drowned** | Scavenged | Minimal | BROKEN - cult symbolism |
| **Refuge** | Minimal | None | NO - survival focus |

### NeonSign Faction Context

```typescript
interface NeonSignContext {
  // Who would have this
  factionAffinity: ['syndicate', 'black_market', 'gambling'];

  // What it signals to the player
  signals: [
    'controlled_territory',   // Someone powerful owns this area
    'trade_opportunity',      // Black market goods available
    'danger_zone',            // Criminal activity
    'quest_giver_nearby',     // Syndicate contacts
    'power_display'           // "We have resources"
  ];

  // Placement rules
  placement: {
    territories: ['syndicate_docks', 'market_collective_black_zone'],
    structures: ['gambling_barge', 'syndicate_warehouse', 'black_market_stall'],
    density: 'sparse',  // Rare, valuable
    requiresPower: true
  };
}
```

---

## Gameplay Loop Integration

### Core Gameplay Loops

| Loop | Description | Primitives Involved |
|------|-------------|---------------------|
| **Navigation** | Get from A to B | Bridge, Dock, Boat, RailPath, Platform |
| **Combat** | Encounter → Arena → Resolution | Floor, Wall, Platform (arena bounds) |
| **Quest** | Get task → Travel → Do task → Return | All (quest markers, objectives) |
| **Trade** | Find resources → Trade → Acquire | Market stalls, NeonSign (indicates trade) |
| **Salvage** | Explore → Find → Extract | Debris, Ruin structures, Water (diving) |
| **Faction** | Reputation → Access → Rewards | Faction markers (NeonSign, Banners) |

### Primitive Loop Participation

```typescript
// Every primitive declares what loops it participates in
interface LoopParticipation {
  navigation?: {
    role: 'path' | 'node' | 'obstacle' | 'landmark';
    navMeshContribution: boolean;
  };
  combat?: {
    role: 'arena_floor' | 'cover' | 'hazard' | 'boundary';
    affectsMovement: boolean;
  };
  quest?: {
    role: 'objective_location' | 'giver_location' | 'item_container';
    interactable: boolean;
  };
  trade?: {
    role: 'market_indicator' | 'stall' | 'storage';
    factionSpecific: boolean;
  };
  faction?: {
    role: 'territory_marker' | 'reputation_gate' | 'faction_asset';
    affinity: Faction[];
  };
}
```

---

## Primitive Catalog (Loop-Integrated)

### NeonSign (REPURPOSED, not deprecated)

```typescript
const NeonSignSystem: LoopSystem = {
  anchors: [
    { type: 'wall_mount', tags: ['signage', 'power_required'] },
    { type: 'ceiling_hang', tags: ['signage', 'power_required'] },
  ],

  factionAffinity: [
    { faction: 'syndicate', strength: 'high' },
    { faction: 'collective', strength: 'low', context: 'black_market_only' },
  ],

  loops: {
    navigation: { role: 'landmark', navMeshContribution: false },
    trade: { role: 'market_indicator', factionSpecific: true },
    faction: { role: 'territory_marker', affinity: ['syndicate'] },
  },

  placementRules: [
    { territory: 'syndicate_docks', density: 'medium' },
    { territory: 'market_collective', density: 'sparse', zone: 'black_market' },
    { structure: 'gambling_barge', density: 'high' },
  ],

  signals: [
    'power_wealth',      // "They have electricity"
    'syndicate_control', // "Yakuza territory"
    'trade_illegal',     // "Black market here"
    'danger_high',       // "Criminal activity"
  ],
};
```

### Shelter (NEW - with loop integration)

```typescript
const ShelterSystem: LoopSystem = {
  anchors: [
    { type: 'floor_surface', tags: ['shelter_base'], capacity: 1 },
    { type: 'edge_attach', tags: ['shelter_wall'] },
  ],

  factionAffinity: [
    { faction: 'refuge', strength: 'high' },
    { faction: 'academy', strength: 'medium' },
    { faction: 'collective', strength: 'medium' },
  ],

  loops: {
    quest: { role: 'giver_location', interactable: true },
    navigation: { role: 'landmark', navMeshContribution: true },
    faction: { role: 'faction_asset', affinity: ['refuge', 'academy'] },
  },

  placementRules: [
    { territory: 'refuge', density: 'high' },
    { territory: 'academy', density: 'medium' },
    { minDistance: 2, from: 'other_shelter' },
  ],

  signals: [
    'civilian_presence',  // "People live here"
    'safe_zone',          // "Not hostile"
    'quest_available',    // "NPCs with tasks"
  ],
};
```

### MakeshiftBridge (with loop integration)

```typescript
const BridgeSystem: LoopSystem = {
  anchors: [
    { type: 'edge_attach', tags: ['bridge_anchor'], position: 'start' },
    { type: 'edge_attach', tags: ['bridge_anchor'], position: 'end' },
  ],

  factionAffinity: [
    { faction: 'neutral', strength: 'high' },  // Bridges serve everyone
  ],

  loops: {
    navigation: { role: 'path', navMeshContribution: true },
    combat: { role: 'arena_floor', affectsMovement: true },  // Narrow = tactical
    quest: { role: 'objective_location', interactable: false },  // "Meet at bridge"
  },

  placementRules: [
    { connectsTerritory: true, maxSpan: 40 },
    { requiresAnchors: ['bridge_anchor', 'bridge_anchor'] },
  ],

  signals: [
    'navigation_route',   // "You can cross here"
    'chokepoint',         // "Tactical position"
    'territory_boundary', // "Crossing into new area"
  ],
};
```

### Aquafarm (NEW - survival economy)

```typescript
const AquafarmSystem: LoopSystem = {
  anchors: [
    { type: 'floor_surface', tags: ['aquafarm_base'], capacity: 1 },
    { type: 'water_float', tags: ['aquafarm_raft'] },  // Can float on water
  ],

  factionAffinity: [
    { faction: 'collective', strength: 'high' },   // Primary food source
    { faction: 'refuge', strength: 'high' },        // Survival necessity
    { faction: 'academy', strength: 'medium' },     // Institutional farms
    { faction: 'syndicate', strength: 'low' },      // They buy, not grow
  ],

  loops: {
    trade: { role: 'resource_producer', factionSpecific: false },
    quest: { role: 'objective_location', interactable: true },  // "Deliver fish to..."
    faction: { role: 'faction_asset', affinity: ['collective', 'refuge'] },
  },

  placementRules: [
    { territory: 'collective', density: 'high' },
    { territory: 'refuge', density: 'high' },
    { territory: 'academy', density: 'medium' },
    { requiresSunlight: true },  // Solar-powered pumps or open-air
    { nearWater: true, maxDistance: 10 },
  ],

  signals: [
    'food_source',        // "Protein available"
    'civilian_presence',  // "People depend on this"
    'trade_resource',     // "Tradeable goods"
    'neutral_zone',       // "Don't fight here"
  ],
};
```

---

## Survival Economy System

### Resource Scarcity Tiers

The flooded world operates on a **pre-industrial economy** for most survivors:

| Resource | Availability | Who Has It | Gameplay Signal |
|----------|--------------|------------|-----------------|
| **Fish/Algae** | Common | Everyone | Baseline, no signal |
| **Fresh Water** | Moderate | Collective cisterns | Trade resource |
| **Chicken/Eggs** | Uncommon | Established settlements | Moderate prosperity |
| **Electricity** | Rare | Syndicate, Academy | Wealth display |
| **Fuel** | Very Rare | Syndicate, Runners | Power/mobility |
| **Mammals** | Extremely Rare | Only elite (bosses) | Extreme prestige |

### Livestock Prestige Hierarchy

Maintaining animals in a flooded rooftop world is extraordinarily difficult:

```
FISH (aquafarms)        → Everyone has this → No signal
    ↓
CHICKENS (coops)        → Requires feed, space → "This settlement is established"
    ↓
GOATS (rare)            → Requires grazing, freshwater → "This leader has RESOURCES"
    ↓
DOGS (guard/companion)  → Requires meat, care → "This person has POWER"
    ↓
HORSES (impossible?)    → Would require massive resources → "This is a faction LEADER"
```

**Why mammals are hard:**
- Limited rooftop space for grazing
- Fresh water requirements (not seawater)
- Feed must be grown or traded (expensive)
- Veterinary care non-existent
- Noise/smell attracts attention

**Gameplay implication**: Seeing a dog or goat immediately tells the player they're dealing with someone wealthy and powerful. Syndicate bosses might keep dogs as status symbols. Academy headmasters might have cats. A horse would be legendary.

### Food Production Primitives

| Primitive | Description | Faction |
|-----------|-------------|---------|
| **Aquafarm** | Fish tanks, algae vats, floating nets | Collective, Refuge |
| **ChickenCoop** | Small rooftop coops for eggs | Established settlements |
| **HydroponicsRack** | Vertical vegetable growing | Academy, Collective |
| **RainCatcher** | Fresh water collection | All factions |
| **SolarStill** | Desalination equipment | Rare, valuable |

### Power Display Primitives

| Primitive | Power Cost | Who Uses | Signal |
|-----------|------------|----------|--------|
| **Lantern** | None (fire) | Everyone | Basic illumination |
| **SolarLamp** | Solar panel | Collective, Academy | "We plan ahead" |
| **NeonSign** | Generator/battery | Syndicate only | "We have POWER" |
| **Floodlight** | Major power | Syndicate, Academy events | "We control this area" |

---

## Factory Assembly Rules

### Territory Generation Pipeline

```
1. Select territory template (academy, market, refuge, etc.)
2. Generate base rooftop geometry (Floor primitives)
3. Place faction-appropriate structures (Shelter, Equipment)
4. Add navigation infrastructure (Bridges, Docks)
5. Apply faction markers (NeonSign for Syndicate, Banners for Academy)
6. Populate with NPCs (schedule-based)
7. Generate navmesh from placed primitives
8. Validate gameplay loop accessibility
```

### Collision Prevention (Daggerfall's Problem)

```typescript
function placeModule(
  module: LoopSystem,
  position: Vector3,
  existing: PlacedModule[]
): PlacementResult {
  // Check bounding box collision
  const bounds = module.getBounds(position);
  for (const placed of existing) {
    if (bounds.intersects(placed.bounds)) {
      return { success: false, reason: 'collision' };
    }
  }

  // Check anchor compatibility
  const availableAnchors = findAvailableAnchors(existing);
  const compatible = module.anchors.some(a =>
    availableAnchors.some(b => anchorsMatch(a, b))
  );

  if (!compatible) {
    return { success: false, reason: 'no_compatible_anchor' };
  }

  return { success: true };
}
```

---

## Visual Signal Language

### Color Coding by Faction

| Faction | Primary Color | Accent | Neon Color (if applicable) |
|---------|---------------|--------|---------------------------|
| **Kurenai Academy** | Deep Red | Gold | N/A (rare use) |
| **Azure Academy** | Navy Blue | Silver | N/A (rare use) |
| **Syndicate** | Black | Purple/Magenta | **Magenta/Cyan** |
| **Runners** | Orange | White | N/A (mobile) |
| **Collective** | Brown/Tan | Green | N/A (trades power) |
| **Drowned** | Dark Green | Pale Blue | Broken/flickering |

### Signal Priority

When procedural generation places elements, signals help players understand the world:

1. **DANGER** (red, neon, spikes) - Highest priority
2. **TRADE** (market indicators, stalls) - High priority
3. **NAVIGATION** (bridges, docks, signs) - Medium priority
4. **FACTION** (colors, banners, markers) - Medium priority
5. **ATMOSPHERE** (weathering, debris) - Low priority

---

## Implementation Checklist

### Phase 1: Anchor System
- [ ] Define anchor point interface
- [ ] Add anchors to existing primitives (Floor, Wall, etc.)
- [ ] Implement matching algorithm
- [ ] Test anchor compatibility

### Phase 2: Faction Context
- [ ] Update NeonSign with faction affinity
- [ ] Add faction parameter to all primitives
- [ ] Implement placement rules based on faction

### Phase 3: Loop Integration
- [ ] Define loop participation for each primitive
- [ ] NavMesh generation from placed primitives
- [ ] Quest marker integration
- [ ] Combat arena detection

### Phase 4: Factory Assembly
- [ ] Territory template definitions
- [ ] Collision-aware placement algorithm
- [ ] Seed-based deterministic generation
- [ ] Validation passes for gameplay loops

---

## References

- [Bake Your Own 3D Dungeons With Procedural Recipes](https://code.tutsplus.com/bake-your-own-3d-dungeons-with-procedural-recipes--gamedev-14360t) - Module connection algorithm
- [Wayward Realms Devlog](https://forums.dfworkshop.net/viewtopic.php?t=5841) - Modern Daggerfall approach
- [Daggerfall Procedural Generation Discussion](https://rpgcodex.net/forums/threads/daggerfall-procedural-generation-is-not-the-issue.145291/) - Lessons learned

---

*"The same pieces, assembled by the same rules, with the same seed, build the same world. But every piece tells a story."*

---

Last Updated: 2026-01-19
