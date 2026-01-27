# Neo-Tokyo: Rival Academies - Design Philosophy v2.0

**Purpose**: Define the foundational design principles for the Flooded Neo-Tokyo setting
**Last Updated**: 2026-01-19

---

## Vision Statement

**Neo-Tokyo: Rival Academies** is a browser-based 3D Action JRPG set in a drowned city where life persists on rooftops. Youth trained in rival academies navigate a world of makeshift bridges, salvaged boats, and contested territories. We prove that **procedural generation and hand-crafted assets can coexist beautifully** in a mobile-first web experience.

---

## Core Design Pillars

### 1. The Flooded World Aesthetic

**Principle**: Scarcity and survival shape every visual choice.

**How We Achieve This**:
- **Weathered Materials**: Rust, water stains, patched tarps, salt-crusted wood
- **Natural Lighting**: Sunlight, overcast skies, lanterns, bonfires (NO NEON)
- **Water Dominance**: Murky water below, reflections, tidal movement
- **Vertical Living**: Rooftops as territories, canopy antennas, flooded depths below
- **Makeshift Construction**: Salvaged materials, improvised engineering

**Anti-Patterns We Avoid**:
- Neon lights (power is scarce, displays wasteful)
- Clean technology (everything is salvaged, repaired)
- Corporate chrome (old world is underwater)
- Abundance (resources are contested, precious)
- Cyberpunk excess (this is post-apocalypse survival)

**Material Palette**:

| Material | Usage | Visual Treatment |
|----------|-------|------------------|
| **Rusted Metal** | Railings, scaffolds, salvage | Orange/brown patina, pitting |
| **Weathered Concrete** | Building surfaces | Water stains, moss, cracks |
| **Salvaged Wood** | Bridges, shelters | Grey, warped, salt-crusted |
| **Tarps/Canvas** | Roofs, walls | Faded colors, patches, tears |
| **Rope/Cable** | Bridges, rigging | Frayed, knotted, weathered |

**Lighting Sources**:

| Source | Context | Color Temperature |
|--------|---------|-------------------|
| **Sunlight** | Day scenes | Warm yellow-white |
| **Overcast** | Common weather | Cool grey, diffused |
| **Lanterns** | Night, interiors | Warm orange, flickering |
| **Bonfires** | Gathering spaces | Amber-red, animated |
| **Solar Lamps** | Academy grounds | Cool white LED (rare) |

---

### 2. Solid + Procedural Interplay

**Principle**: Hand-crafted assets (Meshy) and procedural generation must work flawlessly together.

**How We Achieve This**:
- **DDL-Defined Catalogs**: Every asset type has a declarative definition
- **Anchor Points**: Solid assets expose connection points for procedural placement
- **Collision Integration**: Meshy models have matching navmesh-compatible bounds
- **Rail-Based Systems**: Complex motion (boats, ferries) follows procedural paths
- **Clip Prevention**: Solid assets check procedural bounds before placement

**Asset Classification**:

| Category | Generation | Examples |
|----------|------------|----------|
| **Characters** | Meshy (solid) | Hero, Vera, NPCs, faction members |
| **Vehicles** | Meshy (solid) | Boats, barges, cable cars |
| **Landmarks** | Meshy (solid) | Academy towers, shrine elements |
| **Shelters** | Procedural shell + Meshy details | Tarps, containers, platforms |
| **Bridges** | Procedural + anchor points | Plank, scaffold, cable bridges |
| **Terrain** | Procedural surfaces | Rooftop floors, territory bounds |
| **Water** | Procedural shader | Flooded streets, surrounding sea |
| **Props** | Meshy (solid) + procedural placement | Equipment, salvage, furniture |

**Integration Rules**:
1. Solid assets define their bounding box and anchor points
2. Procedural systems query valid placement zones
3. Navigation mesh regenerates around placed solids
4. Rail paths avoid solid geometry with clearance buffers
5. LOD transitions happen at territory boundaries

---

### 3. Territory-Based Open World

**Principle**: The world is procedural but anchored by canonical territories.

**How We Achieve This**:
- **10 Canonical Territories**: Fixed locations with seeded variation
- **Connection Graph**: Bridges and boat routes form navigable network
- **Progressive Loading**: Current + adjacent territories in memory
- **Seed Reproducibility**: Same seed = same world, shareable
- **Story Anchors**: Key locations fixed for narrative beats

**Territory Generation Flow**:
```
masterSeed
    |
    +-> Territory Seed (kurenai_academy, market_collective, etc.)
    |       |
    |       +-> Surface generation (rooftop geometry)
    |       +-> Shelter placement (DDL catalog selection)
    |       +-> Equipment placement (faction-appropriate)
    |       +-> NPC distribution (schedule-based)
    |
    +-> Connection Seed
            |
            +-> Bridge generation (span, type, anchors)
            +-> Boat route generation (docks, paths)
```

**Anti-Patterns We Avoid**:
- Infinite procedural sprawl (no sense of place)
- Random disconnected areas (no navigable world)
- Fixed linear levels (no exploration freedom)
- Copy-paste territories (each must feel distinct)

---

### 4. Stats-Driven JRPG Combat (PRESERVED)

**Principle**: Every number matters, every choice counts.

**The Four Stats**:

| Stat | Purpose | Flooded World Context |
|------|---------|----------------------|
| **Structure** | HP, Defense | Survival in harsh conditions |
| **Ignition** | Attack, Criticals | Aggressive, passionate fighting |
| **Logic** | Skills, Special | Tactical, environmental use |
| **Flow** | Speed, Evasion | Water movement, agility |

**Combat Arenas by Territory**:

| Territory Type | Arena Characteristics |
|----------------|----------------------|
| Academy | Training platforms, fair ground |
| Market | Cluttered, environmental objects |
| Refuge | Tight spaces, civilian concerns |
| Factory | Industrial hazards, machines |
| Ruin | Unstable, collapsing sections |
| Water | Floating platforms, submersion risk |

**Spin-Out Combat**:
- Combat transitions to dedicated arena view
- Arena type determined by territory
- Environmental hazards from procedural elements
- Solid character models on procedural surfaces

---

### 5. Narrative Through Rivalry (PRESERVED)

**Principle**: Character relationships drive player engagement.

**Core Narrative Anchors** (preserved through all pivots):

| Element | Original | Flooded Adaptation |
|---------|----------|--------------------|
| **Hero** | Kai, academy student | Kai, Kurenai orphan survivor |
| **Rival** | Vera, Azure star | Vera, Azure engineering prodigy |
| **Academies** | Schools | Survival training communities |
| **Factions** | Street gangs | Syndicate, Runners, Collective, Drowned |
| **Tournament** | Academy competition | Territory championship |

**Alignment Scale**:
```
-1.0 <——— Kurenai ——— 0 ——— Azure ———> +1.0
          Passion       Neutral      Logic
```

The flooded world intensifies this: Kurenai's passion drives bold action in crisis; Azure's logic ensures calculated survival.

---

### 6. Mobile-First Performance

**Principle**: Every feature must run at 60 FPS on baseline devices.

**Performance Targets**:

| Metric | Target | Notes |
|--------|--------|-------|
| First Paint | < 1.5s | Core UI visible |
| Interactive | < 3.5s | Game playable |
| Frame Rate | 60 FPS | Consistent, no drops |
| Memory | < 200MB | Heap budget |
| Draw Calls | < 150 | Per territory |

**Baseline Device**: Pixel 8a

**LOD Strategy**:
- Current territory: Full detail
- Adjacent territories: Medium LOD
- Distant: Silhouette/skybox only
- Water: Shader quality scales with device

---

## Playground Primitive Requirements

### Existing Components (Flooded World Ready)

| Component | Status | Notes |
|-----------|--------|-------|
| `Water` | Ready | Murky presets, reflections |
| `TexturedWall` | Ready | Weathered materials |
| `Wall` | Ready | Basic geometry |
| `Floor` | Ready | Territory surfaces |
| `Roof` | Ready | Rooftop bases |
| `Platform` | Ready | Elevated surfaces |
| `RailPath` | Ready | Boat/ferry routes |
| `Hero` | Ready | Character placement |
| `NavMesh` | Ready | Navigation |

### New Components Required (Flooded World)

| Component | Purpose | Solid/Procedural |
|-----------|---------|------------------|
| `Shelter` | Makeshift housing (tarps, containers) | Procedural shell + solid props |
| `MakeshiftBridge` | Plank, scaffold, cable bridges | Procedural span + solid anchors |
| `Dock` | Boat landing points | Solid + procedural attachment |
| `Boat` | Vessels for water navigation | Solid on procedural rails |
| `SolarPanel` | Power collection arrays | Solid + procedural placement |
| `WaterCollector` | Rainwater cisterns | Solid + procedural placement |
| `RooftopGarden` | Food production patches | Procedural bounds + solid plants |
| `Antenna` | Canopy zone structures | Solid + procedural height |
| `Debris` | Floating water debris | Procedural placement |
| `Lantern` | Night lighting source | Solid + procedural placement |
| `Bonfire` | Gathering light source | Solid + procedural placement |

---

## Design Decision Framework

When making design choices, evaluate against these questions:

1. **Survival**: Does this fit a world of scarcity?
2. **Solid/Procedural**: Is this the right generation approach?
3. **Performance**: Does this run at 60 FPS on Pixel 8a?
4. **Narrative**: Does this serve the hero's journey?
5. **Reproducibility**: Can this be seeded deterministically?

If a feature fails multiple criteria, reconsider or simplify.

---

## What We Are Building

- **Flooded open world** with 10 canonical territories
- **Procedural generation** using Dagster-style factory patterns
- **Survival aesthetic** with weathered, makeshift visuals
- **Seamless solid/procedural** integration
- **Mobile-first** browser experience
- **Preserved narrative** with adapted setting

## What We Are NOT Building

- **Cyberpunk neon** - power is scarce
- **Clean high-tech** - everything is salvaged
- **Infinite procedural** - territories are bounded
- **MMO multiplayer** - single-player focused
- **Pay-to-win** - no stat purchases

---

## Inspiration Sources

### Visual
- **Waterworld** (1995) - Floating settlements, salvage culture
- **Wind Waker** - Flooded world, island hopping
- **Kowloon Walled City** - Dense vertical living
- **Studio Ghibli** - Weathered beauty, environmental themes

### Mechanical
- **Daggerfall** - Procedural world with anchored narrative
- **Dagster** - Declarative factory patterns
- **Persona** - Character-driven JRPG systems

### Thematic
- **Venice** - Water-based urban life
- **Subnautica** - Underwater exploration atmosphere
- **Mad Max** - Scarcity-driven aesthetics

---

*"The city drowned, but we learned to swim. The old world sank, but we built bridges. In the water's reflection, we see who we've become."*

---

Last Updated: 2026-01-19
