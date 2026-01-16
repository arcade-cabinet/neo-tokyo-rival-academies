# Phase Roadmap

> **Purpose**: Dated milestones for project execution with mobile-first validation gates.

## Overview

| Phase | Goal | Timeline | Success Metric |
|-------|------|----------|----------------|
| 1 | Mobile MVP | Jan 15 - Mar 31, 2026 | 30 min playable on Pixel 8a |
| 2 | Full Story | Apr 1 - Jun 30, 2026 | 3h content, all branches |
| 3 | Polish | Jul 1 - Sep 30, 2026 | Beta quality, external tests |
| 4 | Launch | Oct 1 - Dec 31, 2026 | Public release |

---

## Phase 1: Mobile MVP (Jan 15 - Mar 31, 2026)

**Goal**: Fun 30-45 minute loop on Pixel 8a (60 FPS, touch controls, clean fold transitions)

### Week 1-2: Project Scaffold (Jan 15-31)

**Deliverables**:
- [ ] Reactylon/Vite project setup
- [ ] Capacitor wrapper configuration
- [ ] Canvas + responsive viewport detection
- [ ] Virtual joystick prototype
- [ ] Action button cluster prototype

**Validation**: App builds and runs on Pixel 8a emulator

### Week 3-4: Core Diorama (Feb 1-14)

**Deliverables**:
- [ ] Isometric orthographic camera
- [ ] Hex grid floor (instanced tiles)
- [ ] Hero spawn + basic movement
- [ ] Touch snap-to-hex navigation
- [ ] LoadingScreen with progress bar
- [ ] Core asset preloading

**Physical Test #1**: Pixel 8a boot <3.5s interactive

### Week 5-6: Combat Basics (Feb 15-28)

**Deliverables**:
- [ ] Four stats implementation (Structure, Ignition, Logic, Flow)
- [ ] Visible damage previews
- [ ] Simple encounter template (street patrol)
- [ ] Touch targeting
- [ ] Capacitor haptics integration

**Validation**: Combat feels responsive on touch

### Week 7-8: Quest Generator v1 (Mar 1-15)

**Deliverables**:
- [ ] Grammar tables (nouns, verbs, adjectives)
- [ ] Quest cluster generation
- [ ] Alignment UI meter
- [ ] Starter district (Academy Gate)
- [ ] Main + side quests functional
- [ ] localStorage save/load

**Validation**: Quest flow works end-to-end

### Week 9-10: Polish + Foldable (Mar 16-31)

**Deliverables**:
- [ ] HUD responsive layouts (phone/tablet)
- [ ] Fold/unfold transition handling
- [ ] Performance profiling and optimization
- [ ] Bug fixes from testing

**Physical Test #2**: OnePlus Open fold/unfold cycles (100x, no jank)

**Phase 1 Gate**: 30 min playable loop on both devices

---

## Phase 2: Story & Rivalry (Apr 1 - Jun 30, 2026)

**Goal**: Full 3-hour branching narrative with meaningful rivalry

### Month 1: District System (April)

**Deliverables**:
- [ ] 10 district profiles implementation
- [ ] Procedural roads and bridges
- [ ] Vertical strata system (upper/mid/lower)
- [ ] District streaming (load/unload)
- [ ] GenAI triggers for landmarks

**Validation**: All districts navigable

### Month 2: Acts 1-2 Content (May)

**Deliverables**:
- [ ] Quest clusters 1-7 implemented
- [ ] Vera character introduction
- [ ] Rivalry dialogue system
- [ ] Tournament combat sequences
- [ ] Alignment consequences (stat bonuses, gates)

**Validation**: Act 1-2 playable start to finish

### Month 3: Act 3 + Endings (June)

**Deliverables**:
- [ ] Act 3 quest clusters
- [ ] Final boss encounter
- [ ] Three endings (Kurenai/Neutral/Azure)
- [ ] Epilogue cutscenes
- [ ] Full item/reward system
- [ ] NG+ hooks implementation

**Physical Test #3**: Full playthrough on Pixel 8a (battery >4h)

**Phase 2 Gate**: Complete single-playthrough build

---

## Phase 3: Polish & Optimization (Jul 1 - Sep 30, 2026)

**Goal**: Production shine, locked 60 FPS, external validation

### Month 1: Audio/UI (July)

**Deliverables**:
- [ ] District ambient loops
- [ ] Combat SFX library
- [ ] Haptic mapping (light/medium/heavy)
- [ ] Music tracks (exploration/combat/rivalry)
- [ ] Responsive HUD animations
- [ ] Touch feedback polish

**Validation**: Audio enhances immersion

### Month 2: Visual/Performance (August)

**Deliverables**:
- [ ] Particle effects (combat, environment)
- [ ] Weather system (rain, fog)
- [ ] Bloom and post-processing (mobile-safe)
- [ ] Memory optimization (<150MB heap)
- [ ] Offline cache full implementation
- [ ] District streaming optimization

**Validation**: 60 FPS locked on Pixel 8a

### Month 3: External Playtest (September)

**Deliverables**:
- [ ] 10+ external testers recruited
- [ ] Mobile-focused test sessions
- [ ] Balance adjustments from feedback
- [ ] Bug squash sprint
- [ ] Localization preparation

**Physical Test #4**: OnePlus Open extended session (2h no jank)

**Phase 3 Gate**: Beta build quality

---

## Phase 4: Launch & Beyond (Oct 1 - Dec 31, 2026)

**Goal**: Public release and first expansion

### Month 1-2: Launch Prep (Oct-Nov)

**Deliverables**:
- [ ] PWA manifest finalization
- [ ] App store submissions (iOS, Google Play)
- [ ] Landing page and marketing
- [ ] Trailer video
- [ ] Press kit
- [ ] Launch day coordination

**Launch Day**: November 2026

### Month 3: First Expansion (December)

**Deliverables**:
- [ ] New district content
- [ ] Additional quest clusters
- [ ] Community seed sharing feature
- [ ] User feedback integration
- [ ] Performance monitoring

**Success Metric**: 10k+ plays in first quarter

---

## Physical Testing Schedule

| Test | Phase | Device | Criteria | Pass Condition |
|------|-------|--------|----------|----------------|
| #1 | 1.3 | Pixel 8a | Boot time | <3.5s interactive |
| #2 | 1.5 | OnePlus Open | Fold cycles | 100x no jank |
| #3 | 2.6 | Pixel 8a | Full playthrough | Battery >4h |
| #4 | 3.3 | OnePlus Open | Extended session | 2h no jank |
| #5 | 4.1 | Both | Release build | All criteria pass |

## Resource Allocation

| Phase | Primary Focus | Secondary Focus |
|-------|---------------|-----------------|
| 1 | Core mechanics | Mobile optimization |
| 2 | Content creation | Combat balance |
| 3 | Polish | Performance |
| 4 | Launch ops | Community |

## Risk Mitigation

| Risk | Mitigation | Trigger |
|------|------------|---------|
| Performance issues | Early profiling, phase 1 gates | FPS <50 on Pixel 8a |
| Content scope creep | Fixed act structure, cut sides first | Behind schedule by >2 weeks |
| Mobile UX problems | Weekly device testing | Touch latency >50ms |
| Asset pipeline delays | Meshy batch generation | >5 day turnaround |

---

*Ship phase by phase. Test on real devices. No shortcuts.*
