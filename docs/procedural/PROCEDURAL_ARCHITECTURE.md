# Procedural Architecture (Scenes)

**Updated**: January 28, 2026

**Scope**: Procedural generation is applied to **scenes**, not the story. Story beats are fixed and authored; layouts, props, and encounters are generated per beat.

---

## Goals

- Deterministic scene layouts per story beat.
- Fast generation on mobile (Pixel 8a baseline).
- Reusable rules across rooftop, bridge, and waterline scenes.

---

## Determinism & Seeds

```
sceneSeed = `${storyBeatId}-${districtId}-${variant}`
```

- **storyBeatId**: authored beat (Act1-Intro, Act2-DeepDive, etc.)
- **districtId**: current territory
- **variant**: optional replay flavor

---

## Scene Outputs

- **Layout**: rooftops, bridges, docks, hazards
- **Props**: scatter sets by theme
- **Encounters**: enemy groups and trigger zones
- **Navigation**: walkable surfaces + player bounds

---

## Scene Pipeline

1. **Select Scene Template** based on story beat.
2. **Generate Layout** (tiles + structural blocks).
3. **Place Props** (faction + weather variants).
4. **Spawn Encounters** (combat zones, narrative triggers).
5. **Emit Scene Manifest** for Babylon runtime.

---

## Modular Assembly System

### Core Modules
- **Platforms**: rooftop tiles, stairs, ramps
- **Connectors**: bridges, ladders, catwalks
- **Shelters**: tarp huts, container rooms, scaffold tents
- **Infrastructure**: vents, tanks, solar arrays, antennas
- **Waterline**: docks, skiffs, ferries, crane barges

### Assembly Rules
- **Height safety**: no drops without railings or hazard marking.
- **Traversal clarity**: paths must read at a glance.
- **Faction styling**: color and prop sets swap by Kurenai/Azure.

### Prop Density
| Area Type | Density | Notes |
|-----------|---------|-------|
| Academy rooftops | Medium | training gear, banners |
| Market docks | High | stalls, crates, crowds |
| Ruins | Low | collapsed structures |
| Bridge spans | Low | hazards + railings |

### Material Palette
- Rusted metal, weathered concrete, salvaged wood, tarps, rope, corrugated sheets

---

## Block + Tile Architecture

### Block Categories
- **RTB (Rooftop Territory Block)**: rooftop settlements, docks, bridges.
- **SRB (Submerged Ruin Block)**: underwater interiors, salvage zones.
- **WTB (Waterway Transit Block)**: water routes, boat lanes, hazards.

### Grid Rules
- **Base unit**: 8m grid for block placement.
- **Standard sizes**:
  - small: 8x8m
  - medium: 16x16m
  - large: 24x24m

### Snap Points
Use snap points for deterministic connections. Each block declares edges, doors, and vertical attachments.

```ts
interface SnapPoint {
  id: string;
  type: 'floor_edge' | 'wall_door' | 'bridge_anchor' | 'ladder';
  direction: 'north' | 'south' | 'east' | 'west' | 'up' | 'down';
  localPosition: { x: number; y: number; z: number };
  width: number;
  tags?: string[];
}
```

### Deterministic Selection
Same seed + grid position must select the same block to guarantee reproducibility.

---

## Performance & Mobile Constraints

- **Instancing**: repeat props and railings via `InstancedMesh`.
- **Mesh merging**: merge static clusters to reduce draw calls.
- **LOD**: use `Mesh.addLODLevel()` for distance scaling.
- **Culling**: rely on frustum culling; avoid overdraw-heavy materials.

---

## Dependency Direction (Playground → Production)

If a playground/sandbox exists, it may import from production systems, but **production code must never depend on playground code**. All generated scene rules live in the production packages and are reused by any sandbox.

---

## Related Docs

- `/docs/story/STORY_FLOODED.md`
- `/docs/world/FLOODED_WORLD.md`
- `/docs/gameplay/QUEST_SYSTEM.md`
