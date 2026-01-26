# Phase Roadmap v2.0 (Unity 6 DOTS - Post-Migration)

**Current Date**: January 26, 2026
**Target Launch**: Q3-Q4 2026 (Unity native mobile)
**Team Assumption**: Solo or small (1-3 devs) + AI agents for content gen

---

## MIGRATION STATUS: COMPLETE

The Unity 6 DOTS migration was completed on January 25, 2026. The TypeScript/Babylon.js runtime has been archived to `_reference/typescript-runtime/`. All game development now uses Unity 6 with the DOTS architecture.

See: [UNITY_6_ARCHITECTURE.md](UNITY_6_ARCHITECTURE.md) for technical details.

---

## Overall Targets
- **Launch**: Q4 2026 (Unity native mobile + desktop)
- **Team**: Solo/core + AI agents for content gen
- **Weekly Rhythm**: Seed-locked playtest + commit
- **Risk Gates**: Physical device validation (Pixel 8a + OnePlus Open)

---

## Phase 1: Foundation & Core Systems - COMPLETE (Jan 15 - Jan 25, 2026)

**Status**: COMPLETE

**Completed Milestones**:
- [x] Unity 6 project scaffold (Jan 15-17)
  - Unity 6000.3.5f1 with DOTS packages (Entities 1.3.x, Burst 1.8.x)
  - URP rendering pipeline configured
  - Input System configured for mobile
- [x] DOTS architecture implementation (Jan 17-20)
  - Component hierarchy (Core, Combat, Stats, AI, World, Quest)
  - System groups and update order
  - Authoring/Baker pattern for entity conversion
- [x] Core systems implementation (Jan 20-23)
  - Combat: CombatSystem, HitDetectionSystem, BreakSystem, HazardSystem, ArenaSystem
  - AI: AIStateMachineSystem, ThreatSystem, SteeringSystem, CrowdSystem, SwarmCoordinationSystem
  - Progression: ReputationSystem, ProgressionSystem, AlignmentBonusSystem, AlignmentGateSystem
  - World: HexGridSystem, TerritorySystem, WaterSystem, WeatherSystem, BoatSystem
  - Other: AbilitySystem, NavigationSystem, EquipmentSystem, DialogueSystem, QuestSystem, SaveSystem
- [x] TypeScript dev tools preserved (Jan 23-25)
  - content-gen (Meshy/Gemini pipeline) - ACTIVE
  - e2e tests (Playwright) - ACTIVE
  - Manifest bridge (JSON manifests -> Unity)
- [x] CI/CD integration (Jan 25)
  - GitHub Actions with game-ci/unity-test-runner
  - EditMode and PlayMode test workflows

**Deliverable**: Working Unity 6 DOTS foundation with all core systems

---

## Phase 2: Content & Gameplay (Feb 1 - Mar 31, 2026)

**Status**: IN PROGRESS

**Goal**: 30-60 min playable loop with full quest system.

**Milestones**:
- **Week 1-2 (Feb 1-14)**: Territory implementation
  - [ ] Kurenai Academy territory complete
  - [ ] Azure Academy territory complete
  - [ ] Territory transitions and loading
  - [ ] Mobile touch controls (virtual joystick + buttons)
- **Week 3-4 (Feb 15-28)**: Combat polish
  - [ ] Combat arena system refinement
  - [ ] Enemy AI behaviors tuning
  - [ ] Hit detection feedback (flash, shake, haptics)
  - [ ] Physical test #1: Pixel 8a boot (<3.5s interactive)
- **Week 5-6 (Mar 1-14)**: Quest system
  - [ ] Quest grammar tables
  - [ ] Act 1 Cluster 1 quests (main + 2 side)
  - [ ] Dialogue system integration
  - [ ] Alignment consequences
- **Week 7-8 (Mar 15-31)**: Progression & persistence
  - [ ] Save/load system (Unity serialization)
  - [ ] Inventory system UI
  - [ ] Equipment system UI
  - [ ] Success Gate: 30 min playable loop on Pixel 8a

**Deliverable**: Internal MVP build (Android APK + desktop)

---

## Phase 3: Story & Rivalry Depth (Apr 1 - Jun 30, 2026)

**Status**: PLANNED

**Goal**: Branching narrative with meaningful rivalry choices.

**Milestones**:
- **Month 1 (Apr)**: Territory expansion
  - [ ] All 10 canonical territories implemented
  - [ ] Bridges/boats connection system
  - [ ] Market Collective territory
  - [ ] Syndicate Docks territory
- **Month 2 (May)**: Act 1-2 full implementation
  - [ ] Quest clusters 1-7
  - [ ] Vera introduction + rivalry dialogue
  - [ ] Alignment consequences (stat bonuses, branch gates)
  - [ ] Faction reputation effects
- **Month 3 (Jun)**: Act 3 + endings
  - [ ] Final boss encounter
  - [ ] 3 endings implementation
  - [ ] Item/reward system complete
  - [ ] NG+ hooks
  - [ ] Physical test #2: Full playthrough on Pixel 8a (battery >4h)

**Deliverable**: Complete single-playthrough build (all branches testable via seeds)

---

## Phase 4: Polish & Optimization (Jul 1 - Sep 30, 2026)

**Status**: PLANNED

**Goal**: Production shine + 60 FPS locked on baseline.

**Milestones**:
- **Month 1 (Jul)**: Sound/UI implementation
  - [ ] Ambient loops (water, wind, crowds)
  - [ ] SFX + haptics
  - [ ] Responsive HUD animations
  - [ ] Touch feedback polish
- **Month 2 (Aug)**: Visual/performance polish
  - [ ] Particle effects
  - [ ] Weather system visuals
  - [ ] Memory optimization (territory streaming)
  - [ ] Draw call optimization
- **Month 3 (Sep)**: External playtest
  - [ ] 10+ testers (mobile focus)
  - [ ] Balance tweaks + bug squash
  - [ ] Physical test #3: OnePlus Open extended session

**Deliverable**: Beta build (TestFlight + Play Store internal)

---

## Phase 5: Launch & Expansion (Oct 1 - Dec 31, 2026)

**Status**: PLANNED

**Goal**: Public release + post-launch content.

**Milestones**:
- **Month 1-2 (Oct-Nov)**: Launch prep
  - [ ] App store submissions (iOS + Android)
  - [ ] Desktop builds (Steam/itch.io)
  - [ ] Marketing + seed sharing features
  - [ ] Launch day!
- **Month 3 (Dec)**: First expansion
  - [ ] New territories/quests
  - [ ] Community features (seed sharing)

**Success Metric**: 10k+ plays first quarter

---

## Changelog

### v2.0 (January 26, 2026)
- Updated roadmap to reflect Unity 6 DOTS migration completion
- Marked Phase 1 as COMPLETE
- Updated technology references (TypeScript -> Unity C#)
- Removed browser/Capacitor references (now Unity native)
- Updated all system names to match Unity implementation
- Added CI/CD integration milestone

### v1.1 (January 15, 2026)
- Initial roadmap with TypeScript/Babylon.js stack
- Mobile-first with Capacitor

---

*This roadmap reflects the Unity 6 DOTS architecture. All game development uses Unity - TypeScript is retained only for build-time tools (content-gen, e2e tests).*
