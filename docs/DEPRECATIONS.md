# Deprecations & Ignore Guide

**Last Updated**: January 19, 2026

---

## What to Ignore (Dead Ends / Superseded Ideas)

### Technical Deprecations
- **Pure Babylon.js (imperative)**: Early discussions on vanilla Babylon setup, ArcRotateCamera without JSX, manual dispose/parenting, YukaJS navigation (replaced by Navigation V2), or Three.js primitives. These were exploratory—**discard entirely**.
- **Non-Reactylon declarative attempts**: Any react-babylonjs mentions or generic JSX without Reactylon specifics.
- **Heavy runtime GenAI**: Ideas relying on live Meshy API calls during play—**ignore**; we settled on build-time manifest pipeline only.
- **Open-world infinity / MMO / gacha**: Explicitly excluded per pillars.
- **Early combat jank obscuring**: DBZ explosions hiding limbs—superseded by stats-driven, visible-preview system.
- **Non-seeded randomness**: All Math.random() without seedrandom—**replace** with deterministic RNG.

### Narrative/Aesthetic Deprecations (Jan 19, 2026)

- **Cyberpunk Neon Aesthetic**: COMPLETELY DEPRECATED. No neon lights, no corporate chrome, no high-tech displays. Replaced by flooded post-apocalyptic world with weathered materials, natural lighting (lanterns, bonfires, sunlight), salvage tech.
- **"Midnight Exam" Race Storyline**: Replaced by "The Descent" salvage competition in STORY_FLOODED.md
- **NARRATIVE_DESIGN.md**: DELETED. Content translated to STORY_FLOODED.md
- **STORY_ARCS.md**: DELETED. Content translated to STORY_FLOODED.md
- **Neon Slums, HoloPlaza, etc.**: Old cyberpunk locations—**ignore**. Use rooftop territories, flooded zones, markets.
- **Pink/Green Neon UI Colors**: DEPRECATED. Use blues + rust/amber palette per DESIGN_PHILOSOPHY.md

### Design Anchor Principle

The "pre-flood" world is anchored to **2020s-2030s** (our current era), NOT retro-futurism like Fallout's 1950s. See WORLD_TIMELINE.md for full timeline.

**Typography**: Technical Precision (Rajdhani + Inter) - modern, digital-native fonts that would appear on 2030s infrastructure.

---

## Core Canon to Preserve & Build On

**Current Truth as of January 19, 2026**:

### Technical
- Reactylon + Babylon.js declarative composition
- Seeded procedural generation (master/sub-seeds for world/quests/territories)
- Meshy build-time pipeline (manifest.json + CLI generate)
- Daggerfall-style block architecture (modular, snap points, rules-based content)
- Mobile-first (Capacitor, 60fps on Pixel 8a baseline)

### Narrative
- Flooded World setting (see FLOODED_WORLD.md, WORLD_TIMELINE.md)
- Year 40 post-flood timeline
- Academy rivalry (Kurenai vs Azure)
- Kai vs Vera character dynamics
- "The Descent" as main competition storyline
- Procedural quests with hand-crafted story beats (Daggerfall model)

### Design
- Blues as primary color (water theme, accessibility)
- Rust/amber complementary accents
- Weathered materials palette (rust, concrete, salvaged wood)
- Natural lighting (NO NEON)
- Technical Precision typography (Rajdhani headers, Inter body)

### Game Systems
- 4 stats (Structure/Ignition/Logic/Flow)
- Alignment rivalry axis (-1.0 Kurenai passion to +1.0 Azure logic)
- Territory-based world structure
- Salvage economy

---

## Document Structure

| Content Type | Current File | Status |
|--------------|--------------|--------|
| Vision & Pillars | DESIGN_PHILOSOPHY.md | Active |
| World Setting | FLOODED_WORLD.md | Active |
| Timeline & Backstory | WORLD_TIMELINE.md | Active |
| Story & Narrative | STORY_FLOODED.md | Active |
| Geography | WORLD_GEOGRAPHY.md | Active |
| Block Architecture | MODULAR_ASSEMBLY_SYSTEM.md | Active |
| Procedural World | PROCEDURAL_WORLD_ARCHITECTURE.md | Active |
| Technical Stack | TECH_ARCHITECTURE.md | Active |
| GenAI Pipeline | GENAI_PIPELINE.md | Active |
| Deprecations | DEPRECATIONS.md | This file |

**Deleted Files** (content migrated):
- NARRATIVE_DESIGN.md → STORY_FLOODED.md
- STORY_ARCS.md → STORY_FLOODED.md

---

## The Daggerfall Principle

If Bethesda could create a world the size of Great Britain with branching storylines on a 486 processor with 8MB RAM in 1996, we can do better with modern tech.

**The formula**:
1. **Hand-craft the story beats** - Small amount of curated content
2. **Procedurally generate everything else** - Templates + seeds = infinite content
3. **Let player choices ripple** - Faction reputation affects generated content

This is why the Block system exists. Procedural world, injected story.

---

*Agents: Always check this file before implementing features. When in doubt, consult FLOODED_WORLD.md and DESIGN_PHILOSOPHY.md for current canon.*
