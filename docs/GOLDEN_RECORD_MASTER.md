# Neo-Tokyo: Rival Academies – Golden Record v1.0
**Date**: January 15, 2026
**Author**: Grok + Jon (conversation chronicle)
**Purpose**: Complete, chronological, agent-executable spec for browser/mobile Action-JRPG.

## 1. Mobile/Web Integration (Critical Constraint)
- Baseline: Pixel 8a fun (60 FPS, <3.5s interactive, touch kinetic)
- Complex: OnePlus Open foldable transitions seamless
- Delivery: PWA instant + Capacitor native wrapper
- Detection: visualViewport resize + media queries → phone/tablet modes
- Perf Targets: <150MB heap, battery >4h, haptic feedback
- **Doc**: [MOBILE_WEB_GUIDE.md](MOBILE_WEB_GUIDE.md)

## 2. Vision & Pillars
- Production Quality GenAI (Meshy build-time pipeline)
- Isometric Diorama Toy-Box
- Stats-Driven Combat (Structure/Ignition/Logic/Flow)
- Narrative Through Rivalry (Kurenai passion vs Azure logic alignment)
- Browser-First (instant, offline-capable)
- **Doc**: [DESIGN_PHILOSOPHY.md](DESIGN_PHILOSOPHY.md)

## 3. Core Systems
- **World Gen**: Master seed → strata → 10 districts (profiles table) → procedural roads/bridges/buildings
- **Quest Gen**: Grammar (noun/verb/adjective) + alignment bias → clusters auto-populate acts
- **Alignment**: -1.0 Kurenai to +1.0 Azure → biases quests/combat/UI/endings
- **Combat**: Visible formulas, templates (waves/phases), stat expression
- **Progression**: XP curve, items (faction gear), reputation, NG+ carry
- **Persistence**: localStorage JSON + NG+ hooks
- **Docs**: [WORLD_GENERATION.md](WORLD_GENERATION.md), [QUEST_SYSTEM.md](QUEST_SYSTEM.md), [ALIGNMENT_SYSTEM.md](ALIGNMENT_SYSTEM.md), [COMBAT_PROGRESSION.md](COMBAT_PROGRESSION.md)

## 4. Story Arc (3-Hour Playable)
- Act 1: Awakening (Arrival → Training → Neon Slums boss)
- Act 2: Tournament (Prep → Rounds → Vera showdown → Fallout)
- Act 3: Mirror Climax (Extremes → Final Vera → Conspiracy boss + endings)
- **Doc**: [STORY_ARCS.md](STORY_ARCS.md)

## 5. Polish & Expansion
- Sound: District ambients + haptic SFX
- UI: Responsive HUD (phone compact → tablet wide)
- Endgame: Cutscenes, branch endings, credits + seed share
- Community: Seed URLs, user manifests
- **Docs**: [POLISH_RULES.md](POLISH_RULES.md), [COMMUNITY_EXPANSION.md](COMMUNITY_EXPANSION.md)

## 6. Phase Roadmap
- Phase 1 MVP (Mar 31): Core loop mobile
- Phase 2 Story (Jun 30): Full arc
- Phase 3 Polish (Sep 30): Shine
- Phase 4 Launch (Dec 31): Public
- **Doc**: [PHASE_ROADMAP.md](PHASE_ROADMAP.md)

**Agent Instructions**: Start with MOBILE_WEB_GUIDE.md → PHASE_ROADMAP.md → implement phase-by-phase. All systems seeded for repro. Physical test on Pixel 8a/OnePlus Open mandatory gates.

*"In Neo-Tokyo, your rival is your mirror. In defeating them, you discover yourself."*