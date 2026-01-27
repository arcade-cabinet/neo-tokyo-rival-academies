# Neo-Tokyo: Rival Academies - Golden Record v3.0

**Date**: January 27, 2026
**Purpose**: Canonical spec for the Flooded Neo-Tokyo Action JRPG

---

## The Core Goal

A **3-hour, non-procedural JRPG** set in post-apocalyptic Neo-Tokyo rooftops.
- **Story**: fully authored and fixed.
- **Scenes**: procedurally generated (layouts, props, encounters) per story beat.

---

## World Summary (Flooded Neo-Tokyo)

Forty years ago, Neo-Tokyo flooded. The waterline stabilized at the fourth story. Life happens on rooftops connected by bridges and boats.

**World Bible**: `/docs/world/FLOODED_WORLD.md`

---

## Narrative Anchors

### The Hero
- **Name**: Kai (player-named option)
- **Origin**: Orphan raised by Kurenai Academy
- **Age**: 17
- **Starting Location**: Kurenai Academy rooftop territory
- **Drive**: Prove themselves, discover their past

### The Rival
- **Name**: Vera
- **Origin**: Rising star of Azure Academy
- **Philosophy**: Cold logic, calculated precision
- **Relationship**: Antagonist → reluctant ally → climactic rival
- **Weapon**: The Null Set (collapsible lance)

### The Academies
| Academy | Philosophy | Territory | Specialty |
|---------|------------|-----------|-----------|
| **Kurenai** | Passion burns brighter | Eastern rooftops | Combat, athletics |
| **Azure** | Adapt or drown | Western rooftops | Navigation, engineering |

### Factions
| Faction | Role | Territory |
|---------|------|-----------|
| **The Syndicate** | Yakuza successors | Barges and docks |
| **The Runners** | Boat crews | Canal routes |
| **The Collective** | Merchant alliance | Central market |
| **The Drowned** | Deep cult | Submerged ruins |

---

## Story Structure (Authored)

**Canonical Narrative**: `/docs/story/STORY_FLOODED.md`

### Act 1: Surface Tensions (~45 min)
- Academy life, rivalry setup, Descent announced

### Act 2: Into the Deep (~60 min)
- Underwater trials, storm disruption, forced alliance

### Act 3: Rising Tide (~45 min)
- Conspiracy reveal, final rivalry, endings

---

## Gameplay Pillars

### Alignment System
- Axis: **Kurenai ← 0 → Azure**
- Impacts stats, dialogue, and quest access
- Reference: `/docs/gameplay/ALIGNMENT_SYSTEM.md`

### Combat
- Turn-based spin-out arenas
- Stats: **Structure, Ignition, Logic, Flow**
- Reference: `/docs/gameplay/COMBAT_PROGRESSION.md`

### Quests
- Authored main quests + procedural side objectives per scene
- Reference: `/docs/gameplay/QUEST_SYSTEM.md`

---

## Procedural Scenes (Non-Procedural Story)

Scenes are generated per story beat using deterministic seeds:
- Rooftop layouts and prop placement
- Encounter composition
- Environmental hazards

Procedural rules: `/docs/procedural/PROCEDURAL_ARCHITECTURE.md`

---

## Technology Constraints

### Stack (Current)
- **Ionic + Angular (zoneless)** for UI and routing
- **Babylon.js** for 3D rendering
- **Miniplex + Zustand** for ECS/state
- **Rapier** for physics
- **Capacitor 8** for Android/iOS
- Optional Electron target via Capacitor community plugin

### Performance
- **Target**: 60 FPS on Pixel 8a
- **Memory**: <200MB heap
- **Boot**: <3.5s to interactive

---

## Visual Direction

- **No neon** (scarcity, weathered materials)
- Rust, concrete, salvaged wood, tarps
- Natural lighting: sunlight, lanterns, bonfires

Design references: `/docs/design/DESIGN_PHILOSOPHY.md`

---

## Key Docs (Current)

- `/docs/00-golden/MOBILE_WEB_GUIDE.md`
- `/docs/tech/ARCHITECTURE.md`
- `/docs/story/STORY_FLOODED.md`
- `/docs/world/FLOODED_WORLD.md`
- `/docs/00-golden/DEPRECATIONS.md`

---

Last Updated: 2026-01-27
