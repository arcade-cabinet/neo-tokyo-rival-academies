# Neo-Tokyo: Rival Academies – Golden Record v1.2
**Date**: January 16, 2026
**Author**: Grok + Jon (conversation chronicle)
**Purpose**: Complete, chronological, agent-executable spec for NATIVE Mobile Action-JRPG.

## 1. Native Mobile Integration (Critical Pivot)
- **Architecture**: Monorepo (`apps/mobile` + `apps/web` + `packages/core`).
- **Engine**: Babylon Native (React Native) for primary delivery.
- **Baseline**: Pixel 8a (60 FPS Native).
- **Complex**: OnePlus Open foldable transitions.
- **Doc**: [MOBILE_NATIVE_GUIDE.md](MOBILE_NATIVE_GUIDE.md), [ARCHITECTURE_PIVOT_NATIVE.md](ARCHITECTURE_PIVOT_NATIVE.md)

## 2. Vision & Pillars
- Production Quality GenAI (Meshy build-time pipeline)
- Isometric Diorama Toy-Box (Native Rendered)
- Stats-Driven Combat (Structure/Ignition/Logic/Flow)
- Narrative Through Rivalry (Kurenai passion vs Azure logic alignment)
- **Doc**: [DESIGN_PHILOSOPHY.md](DESIGN_PHILOSOPHY.md)

## 3. Core Systems
- **World Gen**: Master seed → strata → 10 districts (profiles table).
- **Quest Gen**: Grammar (noun/verb/adjective) + alignment bias.
- **Alignment**: -1.0 Kurenai to +1.0 Azure.
- **Combat**: Spin-Out to Dedicated Arena (Native View).
- **Progression**: XP curve, items, reputation.
- **Persistence**: Shared State (JSON).
- **Docs**: [WORLD_GENERATION.md](WORLD_GENERATION.md), [QUEST_SYSTEM.md](QUEST_SYSTEM.md), [ALIGNMENT_SYSTEM.md](ALIGNMENT_SYSTEM.md), [COMBAT_PROGRESSION.md](COMBAT_PROGRESSION.md)

## 4. Story Arc (3-Hour Playable)
- Act 1: Awakening (Arrival → Training → Neon Slums boss)
- Act 2: Tournament (Prep → Rounds → Vera showdown → Fallout)
- Act 3: Mirror Climax (Extremes → Final Vera → Conspiracy boss + endings)
- **Doc**: [STORY_ARCS.md](STORY_ARCS.md)

## 5. Polish & Expansion
- Sound: Native Audio (District ambients + haptic SFX).
- UI: React Native Views (Responsive).
- Endgame: Cutscenes, branch endings, credits + seed share.
- Community: Seed URLs, user manifests.
- **Docs**: [POLISH_RULES.md](POLISH_RULES.md), [COMMUNITY_EXPANSION.md](COMMUNITY_EXPANSION.md)

## 6. Phase Roadmap
- Phase 1 Architecture (Mar 31): Monorepo + Native Baseline.
- Phase 2 Story (Jun 30): Full arc.
- Phase 3 Polish (Sep 30): Shine.
- Phase 4 Launch (Dec 31): Public.
- **Doc**: [PHASE_ROADMAP.md](PHASE_ROADMAP.md)

**Agent Instructions**: Start with ARCHITECTURE_PIVOT_NATIVE.md → PHASE_ROADMAP.md → implement phase-by-phase. All systems seeded for repro. Physical test on Pixel 8a/OnePlus Open mandatory gates.

---

> "In Neo-Tokyo, your rival is your mirror. In defeating them, you discover yourself."