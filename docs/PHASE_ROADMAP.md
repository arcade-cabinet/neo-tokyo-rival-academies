# Phase Roadmap v1.1 (Mobile-First, Dated Milestones)

**Current Date**: January 15, 2026
**Target Launch**: Q3 2026 (browser MVP) ’ Q4 2026 (mobile/Capacitor)
**Team Assumption**: Solo or small (13 devs) + AI agents for content gen

## Overall Targets
- **Launch**: Q4 2026 (browser PWA + Capacitor mobile)
- **Team**: Solo/core + AI agents for content gen
- **Weekly Rhythm**: Seed-locked playtest + commit
- **Risk Gates**: Physical device validation (Pixel 8a + OnePlus Open)

## Phase 1: Mobile MVP (Core Loop Playable on Phone/Foldable)  Jan 15 ’ Mar 31, 2026
**Goal**: Fun 3045 min loop on Pixel 8a (60 FPS, touch controls, clean fold transitions).
**Milestones**:
- **Week 12 (Jan 1531)**: Project scaffold + Capacitor wrapper
  - Reactylon/Vite setup
  - Canvas + responsive detection (phone/tablet modes, visualViewport resize)
  - Virtual controls prototype (joystick + buttons)
- **Week 34 (Feb 114)**: Core diorama + mobile init flow
  - Isometric camera + hex grid (instanced tiles)
  - Hero spawn + basic movement (touch snap to hex)
  - LoadingScreen + progressive core assets
  - Physical test #1: Pixel 8a boot (<3.5s interactive)
- **Week 56 (Feb 1528)**: Combat + stats basics
  - 4 stats implementation + visible previews
  - Simple encounter template (street patrol)
  - Touch targeting + haptics (Capacitor plugin)
- **Week 78 (Mar 115)**: Quest generator v1 + Act 1 Cluster 1
  - Grammar tables + alignment UI
  - Starter district + main/side quests
  - Save/load localStorage
- **Week 910 (Mar 1631)**: Polish + foldable validation
  - HUD responsive layouts (phone vertical ’ tablet horizontal)
  - OnePlus Open physical test (fold/unfold cycles, no jank)
  - Success Gate: 30 min playable loop on both devices

**Deliverable**: Internal MVP build (shareable URL + APK testflight)

## Phase 2: Story & Rivalry Depth (Full 3-Hour Arc)  Apr 1 ’ Jun 30, 2026
**Goal**: Branching narrative with meaningful rivalry choices.
**Milestones**:
- **Month 1 (Apr)**: District system + procedural city
  - 10 profiles implementation
  - Roads/bridges + strata verticality
  - GenAI triggers for landmarks
- **Month 2 (May)**: Act 12 full timelines
  - Quest clusters 17
  - Vera intro + rivalry dialogue
  - Alignment consequences (stat bonuses, branch gates)
- **Month 3 (Jun)**: Act 3 + endings + progression polish
  - Final boss + 3 endings
  - Item/reward system full
  - NG+ hooks
  - Physical test #2: Full playthrough on Pixel 8a (battery >4h)

**Deliverable**: Complete single-playthrough build (all branches testable via seeds)

## Phase 3: Polish & Optimization  Jul 1 ’ Sep 30, 2026
**Goal**: Production shine + 60 FPS locked on baseline.
**Milestones**:
- **Month 1 (Jul)**: Sound/UI implementation
  - Ambient loops + SFX/haptics
  - Responsive HUD animations + touch feedback
- **Month 2 (Aug)**: Visual/performance polish
  - Particles, weather, bloom
  - Memory/heap optimization (district streaming)
  - Offline cache full
- **Month 3 (Sep)**: External playtest
  - 10+ testers (mobile focus)
  - Balance tweaks + bug squash
  - Physical test #3: OnePlus Open extended session

**Deliverable**: Beta build (public test links)

## Phase 4: Launch & Expansion  Oct 1 ’ Dec 31, 2026
**Goal**: Public release + post-launch content.
**Milestones**:
- **Month 12 (OctNov)**: Launch prep
  - PWA manifest + app stores
  - Marketing seeds/shares
  - Launch day!
- **Month 3 (Dec)**: First expansion
  - New districts/quests
  - Community features (seed sharing)

**Success Metric**: 10k+ plays first quarter