# Decomposition & Ignore Guide

**What to Ignore (Dead Ends / Superseded Ideas)**:
- Pure Babylon.js (imperative, no Reactylon): Early discussions on vanilla Babylon setup, ArcRotateCamera without JSX, manual dispose/parenting, YukaJS navigation (replaced by Navigation V2), or Three.js primitives. These were exploratory**discard entirely**.
- Non-Reactylon declarative attempts: Any react-babylonjs mentions or generic JSX without Reactylon specifics.
- Heavy runtime GenAI: Ideas relying on live Meshy API calls during play**ignore**; we settled on build-time manifest pipeline only.
- Open-world infinity / MMO / gacha: Explicitly excluded per pillars.
- Early combat jank obscuring (DBZ explosions hiding limbs): Superseded by stats-driven, visible-preview system.
- Non-seeded randomness: All Math.random() without seedrandom**replace** with deterministic RNG.

**Core Canon to Preserve & Build On** (Current Truth as of Jan 15, 2026):
- Reactylon + Babylon.js declarative composition
- Seeded procedural generation (master/sub-seeds for world/quests/districts)
- Meshy build-time pipeline (manifest.json + CLI generate)
- 4 stats (Structure/Ignition/Logic/Flow)
- Alignment rivalry axis (-1.0 Kurenai passion to +1.0 Azure logic)
- Noun-verb-adjective grammar quests
- 10 district profiles + strata verticality
- Act 13 timelines + A/B/C branches
- Combat templates, progression/XP/rewards, save/NG+

**How to Decompose into docs/ (Recommended File Structure)**:
Split for clarityeach file self-contained, dated, with version header. Place in repo root docs/ or packages/game/docs/.

| Content Type              | Recommended File                  | Contents to Move/Write |
|---------------------------|-----------------------------------|-----------------------|
| Vision & Pillars          | DESIGN_PHILOSOPHY.md             | Core pillars, anti-patterns, stats/factions, vision statement |
| GenAI Pipeline            | GENAI_PIPELINE.md                | Manifest schema, pipeline types, animation presets, triggers |
| World Generation          | WORLD_GENERATION.md              | Macro pipeline, strata, district profiles table, seeded rules |
| Quest System              | QUEST_SYSTEM.md                  | Grammar tables, generator code, alignment bias logic |
| Alignment & Rivalry       | ALIGNMENT_SYSTEM.md              | Scale, shifts, UI, reputation, Vera ties |
| Combat & Progression      | COMBAT_PROGRESSION.md            | Formulas, encounter templates, XP curve, items/rewards |
| Act Timelines             | STORY_ARCS.md                    | Act 13 breakdowns, clusters, moments, endings |
| Save/Load & NG+           | PERSISTENCE.md                   | Data structure, mechanics, NG+ carry-over |
| Phase Roadmap             | PHASE_ROADMAP.md                 | This document (below) |
| Technical Architecture    | TECH_ARCHITECTURE.md             | Reactylon/Zustand, Navigation V2, Capacitor, etc. |
| UI/Sound Polish           | POLISH_RULES.md                  | HUD layout, SFX rules, particle guidelines |
| Ignore/Deprecations       | DEPRECATIONS.md                  | This guide section |

Agents: Always append/update with date + changelog. Reference PR #5 patterns for formatting.