# Neo-Tokyo Playground Vision

## World Concept: Flooded City on Rooftops

Neo-Tokyo after global flooding (NOT nuclear - avoiding Akira trope). The city has "become its rooftops".

### Why Flooding?

1. **Natural Boundaries** - Streets underwater = no invisible walls needed
2. **Eliminates Complexity** - No street-level shops, crowds, traffic to build
3. **Interior Access** - Playable areas via roof hatches (mall, parking structures)
4. **Environmental Storytelling** - Submerged signs, cars, old street lights

### Setting

- Residents live on upper floors and rooftops
- Rooftops connected by bridges, ferries, ziplines
- Buildings retrofitted upward - life moved to upper levels
- Verticality matters: higher = safer/richer, lower = danger

### Visual Elements

- Water reflections in flooded streets
- Weathered/water-damaged lower building textures
- "Water line" on buildings - cleaner above, corroded below
- Rooftop infrastructure: AC units, vents, solar panels, gardens
- Rickety bridges, cables, walkways between buildings
- Neon signs face UP toward rooftop foot traffic

---

## Transport System

### Platform Ferry Concept

Instead of complex boat meshes with water physics:

- **Flat platforms** with railings (simple geometry)
- **Hidden underwater rail track**
- **Babylon.js rail animation** for smooth movement
- **Docking stations** at building edges
- **No clipping issues** - character stands on moving floor

### Benefits

- No boat hull + water collision nightmares
- No "stepping into boat" animation sync
- Rail mechanics are predictable
- Same system for ferries, elevators, gondolas

### Connector Types

| Type | Placement Rule | Constraint |
|------|---------------|------------|
| Bridge | Adjacent rooftops, height diff < 2m | Straight line |
| Ferry | Water gap, distance 20-100m | Bezier rail |
| Zipline | Height diff > 3m, downward | One-way |
| Elevator | Same building, floor diff | Vertical rail |

---

## Component Architecture

### Core Principle: REUSABILITY

Nothing built once is of value. Every component is a **primitive** that gets reused:

| Primitive | Reuse As |
|-----------|----------|
| Wall | Building sides, barriers, room dividers, billboards |
| Platform | Floors, ferry decks, elevator cars, bridges |
| Rail | Transport, conveyors, sliding doors, moving cover |
| Neon Strip | Signs, edge lighting, path markers, danger zones |
| Water | Flooded streets, rooftop pools, reflective surfaces |

### Mental Shift

```
❌ "Build a ferry"
✅ "Build a rail-following platform"

❌ "Build an elevator"
✅ "It's just a vertical rail"

❌ "Build a bridge"
✅ "It's a static platform between two docks"
```

### Procedural Generation

Each system is a **closed loop** that procedural generation can randomly place:

```typescript
interface FerryRoute {
  id: string;
  docks: DockingStation[];
  railPath: Vector3[];
  platformCount: number;
  timing: number;
}
```

The world generator just needs placement rules, not system internals.

---

## Testing Approach

### Gradual Complexity

1. **Single Component** - Wall, Platform, Water in isolation
2. **Combinations** - Corner (2 walls), Room (4 walls)
3. **Systems** - Ferry (Water + Rail + Platform + Dock)
4. **Integration** - Full scenes combining everything

### AI Test Controller

Instead of manual click testing:
- Babylon.js navigation mesh + pathfinding
- Send high-level commands: "travel to building X"
- AI figures out: walk → wait → board → ride → exit → walk
- Automated, repeatable, scriptable tests

---

## Components Status

### Structural Primitives
- [x] TexturedWall - PBR textures, neon, bloom
- [x] CornerWall - 90° arrangement test
- [ ] Floor/Rooftop
- [ ] Roof/Ceiling

### Transport System
- [x] Water - Reflective surface, presets
- [x] RailPath - Spline paths, presets
- [x] Platform - Static and animated
- [ ] DockingStation
- [ ] Ferry integration test

### Environment
- [ ] Farground (distant skyline)
- [ ] Neon Signs
- [ ] Props (AC units, vents)

### Character
- [ ] Hero Controller
- [ ] Navigation Mesh
- [ ] AI Pathfinding

---

## Dev Server

```bash
pnpm --filter @neo-tokyo/playground dev
# http://localhost:3001/
```
