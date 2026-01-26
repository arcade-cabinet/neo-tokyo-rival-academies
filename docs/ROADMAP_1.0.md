# Neo-Tokyo: Rival Academies - Version 1.0 Roadmap

**Date**: January 26, 2026
**Current Phase**: Phase 2 (Content & Gameplay)
**Target Version**: 1.0 MVP (Unity 6 Native Mobile + Desktop)
**Timeline**: January - March 2026
**Status**: Foundation Complete, Content Phase In Progress

---

## Executive Summary

This roadmap outlines the path to version 1.0 following the successful **Unity 6 DOTS migration** completed on January 25, 2026. Version 1.0 will deliver a **playable 30-60 minute gameplay loop** as native Unity builds for mobile (Android/iOS) and desktop.

**Core Philosophy**: Ship a polished, focused experience rather than an incomplete ambitious vision.

---

## MIGRATION COMPLETE (January 25, 2026)

The TypeScript/Babylon.js runtime has been **fully migrated to Unity 6 DOTS**. Key achievements:

| Milestone | Status | Date |
|-----------|--------|------|
| Unity 6 project scaffold | COMPLETE | Jan 17 |
| DOTS architecture | COMPLETE | Jan 20 |
| Core systems (25+ systems) | COMPLETE | Jan 23 |
| CI/CD integration | COMPLETE | Jan 25 |
| TypeScript dev tools preserved | COMPLETE | Jan 25 |

See [UNITY_6_ARCHITECTURE.md](UNITY_6_ARCHITECTURE.md) for technical details.

---

## Version 1.0 Scope Definition

### What's IN Version 1.0 (Unity Native MVP)

1. **Single Territory Diorama**
   - Kurenai Academy rooftop territory
   - Hex grid environment with textured tiles
   - Player character (Kai) with animations (idle, run, combat)
   - Isometric camera with touch/mouse controls

2. **Core Gameplay Loop**
   - 3-4 handcrafted quests (Fetch Item -> Defeat Enemy -> Reward)
   - Real-time combat with DOTS-based hit detection
   - Experience/leveling system (1-10 levels)
   - Stat allocation (Structure, Ignition, Logic, Flow)

3. **Progression Systems**
   - Reputation tracking (Kurenai 0-100, Azure 0-100)
   - Basic alignment influence
   - Inventory (basic item storage)
   - Save/load system (Unity serialization)

4. **Narrative Foundation**
   - Intro narrative sequence
   - Static dialogue for quests
   - Reputation-based dialogue branching (basic)

5. **UI/Polish**
   - Main menu with title screen
   - HUD (Health, XP, Level, Stats)
   - Quest objectives display
   - Combat feedback (floating numbers, hit flashes)
   - Responsive layouts for phone/tablet/desktop

### What's OUT (Deferred to v2.0+)

- Procedural territory generation (10 territories)
- Full quest grammar generator
- Alignment scale (-1.0 to +1.0) with threshold gates
- Turn-based combat system
- Vera rivalry character (full arc)
- Audio/music/sound effects
- Multiple story endings
- GenAI landmark triggers at runtime
- Cutscenes/cinematics
- NG+ mode

---

## Implementation Status

### COMPLETE: Week 1-2 Foundation (Jan 15-25)

**Completed**:
- [x] Unity 6000.3.5f1 with DOTS packages
- [x] URP rendering pipeline
- [x] Component hierarchy (Core, Combat, Stats, AI, World)
- [x] 25+ DOTS systems implemented
- [x] Authoring/Baker pattern
- [x] ManifestLoader for TypeScript -> Unity bridge
- [x] CI/CD with GitHub Actions

### IN PROGRESS: Week 3-4 Territory (Feb 1-14)

**Tasks**:
- [ ] Kurenai Academy territory prefabs
- [ ] Hex tile rendering with URP shaders
- [ ] Character spawning via ManifestSpawnerSystem
- [ ] Isometric camera MonoBehaviour
- [ ] Mobile touch input integration

**Deliverable**: Playable empty territory with character spawn

---

### Week 5-6: Quest Foundation (Feb 15-28)

**Goal**: Implement quest system using QuestSystem and DialogueSystem

**Tasks**:
1. Create quest templates in `Assets/Scripts/Data/QuestTemplates.cs`
   - Hardcode 3-4 quests
   - Use seeded generation for variety
   - Link to reputation consequences

2. Build Quest UI (Unity UI Toolkit)
   - QuestLog panel
   - QuestObjective HUD element
   - QuestAcceptDialog modal

3. Integrate with existing systems
   - QuestSystem processes quest progression
   - DialogueSystem handles NPC conversations
   - ReputationSystem applies consequences

**Deliverable**: 3 playable quests with reputation consequences

---

### Week 7-8: Combat Polish (Mar 1-15)

**Goal**: Polish combat feel using existing DOTS systems

**Tasks**:
1. Refine CombatSystem damage flow
   - DamageEvent buffer processing
   - Visual feedback (HitFlash, shake)
   - Audio hooks (placeholder)

2. ArenaSystem integration
   - Combat zone transitions
   - Arena bounds enforcement
   - Environmental hazards (HazardSystem)

3. Enemy templates
   - Street Patrol (3 weak enemies)
   - Elite Patrol (1 strong enemy)
   - Boss Fight (tutorial boss)

4. Victory/defeat flow
   - Victory: XP reward -> level up check -> return to diorama
   - Defeat: Game over -> reload from save

**Deliverable**: Fully functional combat encounters

---

### Week 9-10: Polish & Persistence (Mar 16-31)

**Goal**: Complete progression loop and save system

**Tasks**:
1. SaveSystem integration
   - Save schema matching SaveComponents.cs
   - 3 save slots + auto-save
   - Cloud save prep (optional)

2. Alignment bonuses (AlignmentBonusSystem)
   - Kurenai rep >60: +10% Ignition, +10% Flow
   - Azure rep >60: +10% Structure, +10% Logic
   - Display bonuses in stat screen

3. Inventory UI
   - Grid-based inventory panel
   - Item tooltips
   - Basic item usage (healing items)

4. Physical device testing
   - Pixel 8a validation
   - 60 FPS target
   - <3.5s interactive time

**Deliverable**: Persistent progression with 3 save slots

---

## Technology Stack (Unity 6 DOTS)

| Layer | Technology | Status |
|-------|------------|--------|
| **Engine** | Unity 6000.3.5f1 | Active |
| **ECS** | Unity Entities 1.3.x | Active |
| **Compiler** | Burst 1.8.x | Active |
| **Rendering** | URP | Active |
| **Physics** | Unity Physics | Active |
| **Navigation** | AI Navigation | Active |
| **Input** | Input System | Active |
| **Build Tools** | TypeScript (content-gen) | Active |
| **Testing** | NUnit + Playwright | Active |

---

## Success Metrics (Version 1.0)

### Functional Requirements

- [ ] Player can complete 3 quests from start to finish
- [ ] Combat encounters trigger correctly and resolve (win/lose)
- [ ] XP/leveling system works (1-10 levels achievable)
- [ ] Reputation shifts based on quest choices
- [ ] Save/load preserves full game state
- [ ] No game-breaking bugs in core loop

### Performance Requirements

| Target | Requirement |
|--------|-------------|
| Mobile FPS | 60 FPS on Pixel 8a |
| Desktop FPS | 60 FPS on 2020+ hardware |
| Initial load | <3.5s interactive |
| Scene transitions | <2s |
| Save/load | <1s |
| Memory (mobile) | <200 MB |
| Draw calls | <100 per frame |

### Content Requirements

- [ ] 30-60 minutes of gameplay (first playthrough)
- [ ] 3 quests with branching dialogue
- [ ] 5+ enemy encounters
- [ ] 1 tutorial boss encounter
- [ ] Intro narrative sequence
- [ ] Tutorial prompts for core mechanics

---

## Post-1.0 Roadmap (Version 2.0+)

### Version 2.0: Story Expansion (Apr-Jun 2026)

- All 10 canonical territories
- Full quest grammar generator
- Vera rivalry character (full arc)
- Act 1-3 complete
- 3 story endings

### Version 2.5: Polish (Jul-Sep 2026)

- Audio/music/SFX
- Weather system visuals
- Particle effects
- Extended playtest
- Balance tuning

### Version 3.0: Launch (Oct-Dec 2026)

- App store submissions
- Desktop release (Steam/itch.io)
- Community features (seed sharing)
- Post-launch content

---

## Risk Mitigation

### Risk Assessment (Post-Migration)

| Risk | Impact | Mitigation |
|------|--------|-----------|
| DOTS learning curve | MEDIUM | Architecture docs complete; patterns established |
| Mobile performance | MEDIUM | Burst compilation; weekly device tests |
| Content velocity | MEDIUM | TypeScript content-gen preserved; manifest pipeline |
| Quest balance | LOW | Playtesting weeks 7-10; tuning knobs in templates |
| Save corruption | LOW | Schema versioning; validation in SaveSystem |

### Mitigated Risks (No Longer Concerns)

| Former Risk | Resolution |
|-------------|------------|
| Babylon.js limitations | Migrated to Unity |
| Navigation mesh support | Unity AI Navigation |
| TypeScript performance | C# with Burst |
| Browser limitations | Native builds |

---

## Development Principles

1. **Ship > Perfect**: Release a small, polished experience over incomplete ambition
2. **Mobile First**: Unity native builds are lowest friction for mobile
3. **DOTS First**: All game logic in ISystem structs; MonoBehaviours only for UI/Input/Camera
4. **Test Driven**: EditMode tests before implementation
5. **Commit Weekly**: Weekly commits to main with playable builds
6. **Manifest Pipeline**: TypeScript generates content; Unity consumes it

---

## Changelog

### v2.0 (January 26, 2026)

- **MAJOR**: Updated roadmap to reflect Unity 6 DOTS migration completion
- Updated technology stack to Unity 6 with DOTS
- Revised scope based on actual implemented systems
- Marked foundation phase as COMPLETE
- Updated success metrics for Unity native builds
- Removed browser/Capacitor references
- Added CI/CD milestone

### v1.0 (January 17, 2026)

- Initial roadmap based on TypeScript/Babylon.js stack
- Scope narrowed to realistic browser MVP
- Mobile/native deployment deferred to v2.0
- 10-week sprint timeline defined

---

*This roadmap represents the path to version 1.0 following the Unity 6 migration. Weekly updates will track progress and adjust timeline as needed.*
