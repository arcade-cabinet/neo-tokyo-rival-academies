# Neo-Tokyo: Rival Academies - Version 1.0 Roadmap

**Date**: January 17, 2026
**Current Phase**: Phase 1, Week 1-2 (Jan 15-31)
**Target Version**: 1.0 MVP (Browser-based playable)
**Timeline**: January - March 2026
**Status**: Architecture Complete, Core Systems In Progress

---

## Executive Summary

This roadmap outlines a **realistic path to version 1.0** based on comprehensive documentation analysis and current implementation status. Version 1.0 will deliver a **playable 30-60 minute gameplay loop** running in the browser (Vite + Babylon.js + Reactylon), with mobile/native deployment deferred to Version 2.0.

**Core Philosophy**: Ship a polished, focused experience rather than an incomplete ambitious vision.

---

## Version 1.0 Scope Definition

### What's IN Version 1.0 (Browser MVP)

1. **Single District Diorama**
   - Academy Gate Slums (hardcoded, not procedurally generated)
   - Hex grid environment with textured tiles
   - Player character (Kai) with animations (idle, run, combat)
   - Isometric camera with keyboard/mouse controls

2. **Core Gameplay Loop**
   - 3-4 static, handcrafted quests (Fetch Item → Defeat Enemy → Reward)
   - Real-time combat with hit/damage formulas
   - Experience/leveling system (1-10 levels)
   - Stat allocation (Structure, Ignition, Logic, Flow)

3. **Progression Systems**
   - Reputation tracking (Kurenai 0-100, Azure 0-100)
   - Basic alignment influence (reputation-based, not -1.0 to +1.0)
   - Inventory (basic item storage, no equip system)
   - 3-slot save/load system (localStorage)

4. **Narrative Foundation**
   - Intro narrative sequence
   - Static dialogue for quests
   - Reputation-based dialogue branching (basic)

5. **UI/Polish**
   - Main menu with title screen
   - HUD (Health, XP, Level, Stats)
   - Quest objectives display
   - Combat feedback (floating numbers, hit flashes)
   - Responsive canvas for different screen sizes

### What's OUT (Deferred to v2.0+)

- ❌ Babylon Native / React Native mobile app
- ❌ Physical device testing (Pixel 8a, OnePlus Open)
- ❌ Procedural district generation (10 districts)
- ❌ Full quest grammar generator
- ❌ Alignment scale (-1.0 to +1.0) with threshold gates
- ❌ Turn-based combat system
- ❌ Vera rivalry character
- ❌ Audio/music/sound effects
- ❌ Multiple story endings
- ❌ GenAI landmark triggers
- ❌ Cutscenes/cinematics
- ❌ NG+ mode

---

## Critical Path: 10-Week Sprint (Jan 15 - Mar 31)

### Week 1-2: Foundation & Architecture (Jan 15-31) ✅ 70% COMPLETE

**Status**: Architecture established, core rendering functional

**Completed**:
- ✅ Monorepo structure (apps/, packages/)
- ✅ Babylon.js 8.46.2 + Reactylon 3.5.2 integration
- ✅ Three.js fully removed
- ✅ Dependencies updated to latest
- ✅ Hex grid rendering with textured tiles
- ✅ Character model loading with animations
- ✅ Basic camera and lighting

**Remaining This Week**:
- Extract game logic to `packages/core`
- Implement `WorldGenerator` class (single district mode)
- Create `DistrictManager` Zustand store
- Fix camera to isometric projection

**Deliverable**: Playable empty diorama with character spawn

---

### Week 3-4: Quest Foundation (Feb 1-14)

**Goal**: Implement quest system architecture without full procedural generation

**Tasks**:
1. Create `QuestGenerator` with static grammar tables
   - Hardcode noun/verb/adjective tables
   - Use seedrandom for deterministic quest generation
   - Generate 1 main quest + 2 side quests

2. Build Quest UI components
   - QuestLog.tsx (list of active/completed quests)
   - QuestObjective.tsx (current objective display)
   - QuestAcceptDialog.tsx (quest start confirmation)

3. Implement quest state management
   - QuestStore (Zustand)
   - Quest completion tracking
   - XP/item reward distribution

4. Wire quest choices to reputation
   - Each choice shifts Kurenai or Azure rep by ±10-20
   - Display reputation change feedback

**Deliverable**: 3 playable quests with reputation consequences

---

### Week 5-6: Combat System (Feb 15-28)

**Goal**: Implement functional combat loop (real-time, not turn-based)

**Tasks**:
1. Create combat screen component
   - CombatArena.tsx (Babylon scene wrapper)
   - CombatUI.tsx (HP bars, action buttons)
   - Spin-out transition effect

2. Enhance combat formulas
   - Damage: `base = max(1, floor(attacker.Ignition * 2 - defender.Structure * 0.5))`
   - Critical: `chance = min(0.5, attacker.Ignition * 0.01)`
   - Hit/Evade: `hitChance = 0.8 + (attacker.Flow - defender.Flow) * 0.05`

3. Create enemy encounter templates
   - Street Patrol (3 weak enemies)
   - Elite Patrol (1 strong enemy)
   - Boss Fight (single high-stat enemy)

4. Implement combat victory/defeat flow
   - Victory: XP reward → level up check → return to diorama
   - Defeat: Game over screen → reload from save

**Deliverable**: Fully functional combat encounters

---

### Week 7-8: Progression & Persistence (Mar 1-15)

**Goal**: Complete progression loop and save system

**Tasks**:
1. Extend save schema
   ```typescript
   interface SaveData {
     version: string;
     seed: string;
     act: number;
     kurenaiRep: number;
     azureRep: number;
     level: number;
     stats: RPGStats;
     inventory: InventoryItem[];
     completedQuests: string[];
     activeQuests: ActiveQuest[];
     playtimeMinutes: number;
     timestamp: number;
   }
   ```

2. Create save/load UI
   - SaveSlotSelect.tsx (3 slots + auto-save)
   - Manual save button in pause menu
   - Load game from title screen

3. Implement alignment influence on stats
   - Kurenai rep >60: +10% Ignition, +10% Flow
   - Azure rep >60: +10% Structure, +10% Logic
   - Display bonuses in stat screen

4. Add inventory UI
   - InventoryScreen.tsx (grid display)
   - Item tooltips
   - Basic item usage (healing items)

**Deliverable**: Persistent progression with 3 save slots

---

### Week 9-10: Polish & Playtesting (Mar 16-31)

**Goal**: Bug fixes, responsive UI, and internal playtesting

**Tasks**:
1. Responsive HUD implementation
   - Phone portrait layout (640x960)
   - Tablet landscape layout (1280x800)
   - Desktop layout (1920x1080)

2. Visual polish
   - Combat hit effects (flash, shake)
   - Quest completion celebrations
   - Level-up animation
   - Smooth transitions

3. Bug fixing pass
   - Combat edge cases (death mid-attack, flee)
   - Quest completion bugs
   - Save/load corruption prevention
   - Input edge cases

4. Internal playtest
   - Full 30-60 minute playthrough
   - Balance tweaks (XP curve, damage, difficulty)
   - UX improvements

**Deliverable**: Polished, bug-free 1.0 release candidate

---

## File-by-File Implementation Checklist

### WEEK 1-2: Foundation

| File | Action | Priority |
|------|--------|----------|
| `packages/core/src/systems/WorldGenerator.ts` | CREATE | 🔴 CRITICAL |
| `packages/core/src/systems/DistrictManager.ts` | CREATE | 🔴 CRITICAL |
| `packages/core/src/state/worldStore.ts` | CREATE | 🔴 CRITICAL |
| `packages/diorama/src/camera/IsometricCamera.tsx` | ENHANCE (add isometric projection) | 🔴 CRITICAL |

### WEEK 3-4: Quests

| File | Action | Priority |
|------|--------|----------|
| `packages/core/src/systems/QuestGenerator.ts` | CREATE | 🔴 CRITICAL |
| `packages/core/src/data/questGrammar.ts` | CREATE (static tables) | 🔴 CRITICAL |
| `packages/core/src/state/questStore.ts` | CREATE | 🔴 CRITICAL |
| `packages/game/src/components/react/ui/QuestLog.tsx` | CREATE | 🟠 HIGH |
| `packages/game/src/components/react/ui/QuestObjective.tsx` | CREATE | 🟠 HIGH |
| `packages/game/src/components/react/ui/QuestAcceptDialog.tsx` | CREATE | 🟠 HIGH |

### WEEK 5-6: Combat

| File | Action | Priority |
|------|--------|----------|
| `packages/game/src/components/react/babylon/CombatArena.tsx` | CREATE | 🔴 CRITICAL |
| `packages/game/src/components/react/ui/CombatUI.tsx` | CREATE | 🔴 CRITICAL |
| `packages/core/src/systems/CombatScene.ts` | CREATE | 🔴 CRITICAL |
| `packages/core/src/data/enemyTemplates.ts` | CREATE | 🟠 HIGH |
| `packages/game/src/systems/CombatLogic.ts` | ENHANCE (formulas) | 🟠 HIGH |

### WEEK 7-8: Progression

| File | Action | Priority |
|------|--------|----------|
| `packages/core/src/types/SaveData.ts` | CREATE (schema) | 🔴 CRITICAL |
| `packages/core/src/systems/SaveSystem.ts` | ENHANCE | 🔴 CRITICAL |
| `packages/game/src/components/react/ui/SaveSlotSelect.tsx` | CREATE | 🟠 HIGH |
| `packages/game/src/components/react/ui/InventoryScreen.tsx` | CREATE | 🟠 HIGH |
| `packages/core/src/systems/AlignmentBonuses.ts` | CREATE | 🟢 MEDIUM |

### WEEK 9-10: Polish

| File | Action | Priority |
|------|--------|----------|
| `packages/game/src/styles/responsive.css` | CREATE | 🟠 HIGH |
| `packages/game/src/components/react/ui/LevelUpAnimation.tsx` | CREATE | 🟢 MEDIUM |
| `packages/game/src/components/react/effects/HitFlash.tsx` | CREATE | 🟢 MEDIUM |
| `packages/game/src/components/react/ui/PauseMenu.tsx` | CREATE | 🟢 MEDIUM |

---

## Success Metrics (Version 1.0)

### Functional Requirements

- [ ] Player can complete 3 quests from start to finish
- [ ] Combat encounters trigger correctly and resolve (win/lose)
- [ ] XP/leveling system works (1-10 levels achievable)
- [ ] Reputation shifts based on quest choices
- [ ] Save/load preserves full game state
- [ ] No game-breaking bugs in core loop

### Performance Requirements (Web Browser)

- [ ] 60 FPS on modern desktop (2020+ laptop)
- [ ] 30 FPS minimum on mobile browsers (iPhone 12, Pixel 6)
- [ ] <5s initial load time (first asset)
- [ ] <2s between quest transitions
- [ ] Save/load completes in <1s

### Content Requirements

- [ ] 30-60 minutes of gameplay (first playthrough)
- [ ] 3 quests with branching dialogue
- [ ] 5+ enemy encounters
- [ ] 1 "boss" encounter
- [ ] Intro narrative sequence
- [ ] Tutorial prompts for core mechanics

---

## Post-1.0 Roadmap (Version 2.0+)

### Version 2.0: Mobile Native (Apr-Jun 2026)

- Babylon Native integration
- React Native UI components
- Touch gesture controls
- Physical device testing (Pixel 8a, OnePlus Open)
- Haptic feedback
- Offline asset bundling

### Version 2.5: Content Expansion (Jul-Sep 2026)

- Procedural district generation (10 districts)
- Full quest grammar generator
- Alignment scale (-1.0 to +1.0) with thresholds
- Vera rivalry character
- Multiple story endings (3)
- Audio/music/SFX

### Version 3.0: Polish & Launch (Oct-Dec 2026)

- Turn-based combat system
- GenAI landmark triggers
- Cutscenes/cinematics
- NG+ mode
- Community features (seed sharing)
- Public launch

---

## Risk Mitigation

### High Risk Items

| Risk | Impact | Mitigation |
|------|--------|-----------|
| **Babylon Native integration complexity** | 🔴 HIGH | Defer to v2.0; ship browser-first |
| **Quest generation too ambitious** | 🟠 MEDIUM | Use static quests for v1.0; procedural in v2.0 |
| **Combat balance issues** | 🟠 MEDIUM | Playtesting weeks 5-10; tuning knobs |
| **Save system corruption** | 🟠 MEDIUM | Version field + schema validation |
| **Scope creep (features beyond MVP)** | 🟠 MEDIUM | Strict adherence to "What's OUT" list |

---

## Development Principles

1. **Ship > Perfect**: Release a small, polished experience over incomplete ambition
2. **Web First**: Browser deployment is lowest friction; mobile is optimization
3. **Static > Procedural**: Handcrafted content for v1.0 validates systems before automation
4. **Test Early**: Playtest after Week 6 (first combat encounter)
5. **Commit Weekly**: Weekly commits to main with playable builds
6. **Documentation Updates**: Update this roadmap weekly with progress notes

---

## Changelog

### v1.0 (January 17, 2026)

- Initial roadmap created based on comprehensive documentation analysis
- Scope narrowed to realistic browser MVP
- Mobile/native deployment deferred to v2.0
- 10-week sprint timeline defined (Jan 15 - Mar 31)
- File-by-file implementation checklist created
- Success metrics defined

---

*This roadmap represents a realistic, achievable path to version 1.0 based on current architecture and resources. Weekly updates will track progress and adjust timeline as needed.*
