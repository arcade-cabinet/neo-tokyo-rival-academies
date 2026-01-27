# Neo-Tokyo: Rival Academies - Design Philosophy v2.1

**Purpose**: Foundational design principles for the Flooded Neo-Tokyo setting
**Last Updated**: 2026-01-27

---

## Vision Statement

**Neo-Tokyo: Rival Academies** is a mobile-first, cel-shaded Action JRPG set on the rooftops of a drowned city. We combine **authored narrative** with **procedurally generated scenes** to create replayable moments without sacrificing story clarity.

---

## Core Design Pillars

### 1. The Flooded World Aesthetic

**Principle**: Scarcity and survival shape every visual choice.

**How We Achieve This**
- **Weathered Materials**: rust, water stains, patched tarps, salt-crusted wood
- **Natural Lighting**: sunlight, overcast haze, lanterns, bonfires (NO NEON)
- **Water Dominance**: murky water below, reflections, tidal movement
- **Vertical Living**: rooftops as territories, canopy antennas, flooded depths below
- **Makeshift Construction**: salvaged materials, improvised engineering

**Anti-Patterns We Avoid**
- Neon glow or cyberpunk chrome
- Clean, high-tech interiors
- Abundance or pristine materials
- Futuristic corporate towers

---

### 2. Solid + Procedural Interplay

**Principle**: Hand-authored assets and procedural placement must feel seamless.

**How We Achieve This**
- **Manifest catalogs** for all assets
- **Anchor points** for procedural placement
- **Collision + navigation** aligned to placement bounds
- **Deterministic seeds** per scene for reproducibility

**Asset Classification**
- **Characters**: authored GLB (Kai, Vera, NPCs)
- **Landmarks**: authored anchors (Academies, Shrine, Market)
- **Structures**: modular shells (bridges, shelters, docks)
- **Props**: scatter sets per faction and district

---

### 3. Scene-Anchored World

**Principle**: The story is fixed; scene layouts flex around it.

**Rules**
- **Story beats are canonical**.
- **Scenes are generated** per beat with a deterministic seed.
- **District anchors** (Kurenai, Azure, Market, Shrine, Reach) are fixed.

---

### 4. Stats-Driven JRPG Combat

**Principle**: Every number matters, every choice counts.

**The Four Stats**
- **Structure**: HP, Defense
- **Ignition**: Attack, Criticals
- **Logic**: Skills, Specials
- **Flow**: Speed, Evasion

Combat uses **spin-out arenas** with clean UI and high readability.

---

### 5. Narrative Through Rivalry

**Principle**: Character relationships drive engagement.

- **Kai vs Vera** is the emotional backbone.
- **Kurenai vs Azure** aligns with stats and choices.
- **Alignment shifts** steer dialogue and rewards.

---

### 6. Mobile-First Performance

**Principle**: 60 FPS on Pixel 8a baseline.

**Targets**
- Boot to interactive: < 3.5s
- Memory: < 200MB heap
- Draw calls: < 150 per scene

---

## Design Decision Framework

When making design choices, evaluate against these questions:

1. **Survival**: Does this fit a world of scarcity?
2. **Solid/Procedural**: Is this the right generation approach?
3. **Performance**: Does this run at 60 FPS on Pixel 8a?
4. **Narrative**: Does this serve the hero's journey?
5. **Reproducibility**: Can this be seeded deterministically?

---

## What We Are Building

- Flooded Neo-Tokyo rooftop districts
- Authored 3-hour story with rival academies
- Procedural scenes per story beat
- Cel-shaded visual style
- Mobile-first web app wrapped by Capacitor

## What We Are NOT Building

- Cyberpunk neon aesthetic
- Infinite procedural open world
- MMO or live service
- Multi-city travel in base story

---

## Inspirations

**Visual**: Waterworld, Wind Waker, Studio Ghibli, Kowloon Walled City

**Mechanical**: Persona (character-driven JRPG), Daggerfall (procedural + anchors)

---

*The city drowned, but we learned to swim. The old world sank, but we built bridges.*
