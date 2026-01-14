# Implementation Roadmap - Full JRPG Transformation

This document outlines the complete implementation plan for transforming Neo-Tokyo: Rival Academies into a comprehensive 3-hour Action JRPG experience.

## 🎯 Project Vision

Transform the game from a simple 3D runner into a full JRPG with:
- **A-Story**: Main rivalry arc between Kai and Vera
- **B-Story**: Mystery/conspiracy arc (Project TITAN, alien origins)
- **C-Story**: Event disruptor stages forcing unexpected team-ups
- 3-hour gameplay with optional content
- GenAI-powered content generation
- FF7-style isometric exploration
- Visual novel-style dialogue system

---

## ✅ PHASE 1: Foundation (COMPLETE)

**Status**: Fully implemented and tested

### Architecture
- [x] Monorepo structure (packages/game, packages/content-gen, packages/e2e)
- [x] Vite migration (from Astro)
- [x] Miniplex ECS integration
- [x] React Three Fiber setup

### Core Systems
- [x] RPG stats system (Structure, Ignition, Logic, Flow)
- [x] Combat system with stat-based damage calculations
- [x] Progression system (XP, leveling, stat points)
- [x] Dialogue system (JSON-driven, node-based)
- [x] Inventory/equipment system

### Testing Infrastructure
- [x] Vitest unit testing
- [x] Test coverage for all systems (>90%)
- [x] E2E verification framework

### Documentation
- [x] AGENTS.md (AI agent guidelines)
- [x] JRPG_TRANSFORMATION.md (vision document)
- [x] TESTING_STRATEGY.md (testing approach)
- [x] GENAI_SETUP.md (GenAI integration guide)

---

## 🔄 PHASE 2: Narrative Expansion (70% COMPLETE)

**Status**: Core narrative in place, needs expansion

### Completed
- [x] Expanded story.json (335 lines, 9 dialogue sequences)
- [x] Alien abduction arc (C-Story disruptor)
- [x] Mall drop arc (C-Story disruptor)
- [x] Mystery conspiracy arc (B-Story)
- [x] Item/equipment catalog (8 items)
- [x] Lore system (8 data shards)
- [x] Quest system structure (5 quests)

### Remaining Work
- [ ] Additional dialogue for remaining stages:
  - boss_ambush (Vera confrontation)
  - rooftop_chase (high-speed pursuit dialogue)
  - summit_climb (pre-final battle buildup)
  - final_battle (climactic showdown)
  - epilogue (resolution and character growth)
- [ ] Branching dialogue system:
  - Player choice nodes (at least 3 major decision points)
  - Consequence tracking (affects ending)
  - Relationship values (Kai/Vera trust level)
- [ ] Character arc tracking:
  - Kai's trauma resolution
  - Vera's humanity discovery
  - Director confrontation buildup
- [ ] Additional C-Story disruptors (2-3 more surprise events)

**Estimated Time**: 4-6 hours

---

## 🎮 PHASE 3: Enhanced Event Stages (0% COMPLETE)

**Status**: Basic stages exist, need enhancement

### Alien Abduction Stage
**Current State**: Basic tentacle and Alien Queen spawning
**Required Enhancements**:

#### 3.1 Vertical Tentacle Grab Cinematic
- [ ] Create cinematic sequence component
- [ ] Implement camera transition (ground → upward pan)
- [ ] Add tentacle descent animation
- [ ] Particle effects (alien energy)
- [ ] Trigger dialogue: `alien_abduction` sequence

**Technical Approach**:
```typescript
// New component: AlienAbductionCinematic.tsx
- Camera lerp from ground to sky view
- Spawn tentacles from above (negative Y velocity)
- Grab animation (player + Vera entities frozen)
- Fade to black → load alien_ship stage
```

#### 3.2 Yuka-Driven Independent Tentacles
- [ ] Extend AISystem to support tentacle agents
- [ ] Create 4-8 tentacle entities with individual behaviors
- [ ] Implement tentacle attack patterns:
  - Sweeping horizontal attacks
  - Vertical slam attacks
  - Grab and hold (player must break free)
- [ ] Add tentacle health and defeat conditions

**Technical Approach**:
```typescript
// In AISystem.ts
class TentacleState extends State<YukaAgent> {
  - Patrol between anchor points
  - Attack when player in range
  - Coordinate with other tentacles (avoid overlap)
}
```

#### 3.3 Alien Queen Boss
- [ ] Center-positioned boss (fixed at x: 50, y: 10)
- [ ] Extending tentacle attacks (spawned as separate entities)
- [ ] Multi-phase fight:
  - Phase 1: 4 tentacles active
  - Phase 2 (50% HP): 6 tentacles + laser beam
  - Phase 3 (25% HP): 8 tentacles + area denial
- [ ] Defeat condition triggers mall_drop stage

#### 3.4 Vera Cooperation AI
- [ ] Spawn Vera as ally entity (faction: 'ALLY')
- [ ] Implement dynamic focus system:
  - Default: Attack nearest tentacle
  - When player health < 30%: Prioritize healing/defense
  - When boss vulnerable: Focus fire on queen
- [ ] Add coordination bonus (+10% damage when both attack same target)

#### 3.5 Difficulty Scaling
- [ ] Detect co-op state (Vera alive?)
- [ ] Scale enemy stats: HP × 2, damage × 1.5
- [ ] Increase enemy spawn rate by 50%
- [ ] Add "Perfect Sync" bonus for synchronized attacks

**Estimated Time**: 8-10 hours

---

### Mall Drop Stage
**Current State**: Basic mall cop spawning
**Required Enhancements**:

#### 3.6 Weapon Loss & Switching System
- [ ] Trigger weapon drop on stage transition
- [ ] Add weapon pickup entities (scissors, broom, sign post)
- [ ] Implement weapon swap UI
- [ ] Different weapon stats:
  - Giant Scissors: High damage, slow
  - Mall Sign: Medium damage, medium speed
  - Broom: Low damage, fast, knockback

**Technical Approach**:
```typescript
// In gameStore.ts
interface EquipmentState {
  currentWeapon: string | null;
  availableWeapons: string[];
}

// In GameWorld.tsx
- Spawn weapon pickups at random positions
- On collision, swap equipment
- Update combat stats based on weapon
```

#### 3.7 Environmental Combat
- [ ] Escalator ramps:
  - Speed boost when running up/down
  - Enemy knockback potential
- [ ] Fountains:
  - Push enemies into water (stun effect)
  - Visual splash effects
- [ ] Glass displays:
  - Destructible obstacles
  - Shard projectiles on break

**Estimated Time**: 6-8 hours

---

## 🖥️ PHASE 4: JRPG HUD Overhaul (0% COMPLETE)

**Status**: Basic JRPGHUD exists, needs major expansion

### 4.1 Quest Log Side Panel
- [ ] Create QuestLog.tsx component
- [ ] Display active quest + objectives
- [ ] Track A/B/C story progress visually
- [ ] Completion checkmarks
- [ ] Reward preview

**Technical Approach**:
```typescript
// QuestLog.tsx
- Query gameStore for activeQuest
- Map quest objectives to checkboxes
- Show rewards on completion
- Toggle visibility with Tab key
```

### 4.2 Minimap Component
- [ ] Create Minimap.tsx component
- [ ] Render 2D top-down view of stage
- [ ] Show player position (red dot)
- [ ] Show enemies (blue dots)
- [ ] Show collectibles (yellow dots)
- [ ] Show stage boundaries

**Technical Approach**:
```typescript
// Minimap.tsx
- Query ECS world for all entities with position
- Project 3D positions to 2D minimap space
- Render using HTML5 Canvas or SVG
- Update at 10 FPS (performance optimization)
```

### 4.3 Enhanced Dialogue UI
- [ ] Add character portraits (left/right positioning)
- [ ] Implement text typewriter effect
- [ ] Add dialogue history (scroll back)
- [ ] Support branching choices (button UI)
- [ ] Visual novel-style overlay (not blocking full screen)

**Technical Approach**:
```typescript
// DialogueOverlay.tsx
- Import character portraits from public/assets/portraits/
- Use Framer Motion for typewriter animation
- Store dialogue history in gameStore
- Render choice buttons for branching nodes
```

### 4.4 Progress Indicators
- [ ] Quest objective tracker (persistent UI)
- [ ] Stage completion percentage
- [ ] Data shard collection count (x/8)
- [ ] Enemy defeat counter (for side quests)

### 4.5 Controls Redesign
- [ ] Remove cyberpunk neon aesthetic
- [ ] Adopt JRPG UI style (borders, menus, fonts)
- [ ] Add button prompts (Space to advance, Tab for menu)
- [ ] Implement pause menu with:
  - Inventory
  - Quest log
  - Lore database
  - Settings

**Estimated Time**: 12-15 hours

---

## 🌍 PHASE 5: World Exploration & Connectors (0% COMPLETE)

**Status**: Linear progression only, needs exploration

### 5.1 Bidirectional Movement
- [ ] Remove forward-only restriction
- [ ] Add backwards running animation
- [ ] Handle camera following for reverse movement
- [ ] Persist stage state when returning

**Technical Approach**:
```typescript
// In PhysicsSystem.tsx
- Allow negative velocity.x
- Update camera to follow player in both directions
- Store stage progress in stageSystem (don't reset on re-entry)
```

### 5.2 Vertical Exploration
- [ ] Add jumpable platforms at multiple heights
- [ ] Implement ledge grabbing
- [ ] Hidden paths above/below main route
- [ ] Secret areas with collectibles

### 5.3 Stage Connectors
- [ ] Doors (enter buildings)
- [ ] Bridges (cross gaps)
- [ ] Gates (locked until quest complete)
- [ ] Elevators (vertical stage transitions)

**Technical Approach**:
```typescript
// Connector.tsx (already exists, needs expansion)
- Add interaction trigger (E key)
- Play transition animation
- Load target stage
- Preserve player stats/inventory
```

### 5.4 Isometric Diorama Perspective
- [ ] Adjust camera angle (45-degree isometric view)
- [ ] Add depth-based rendering (objects scale with distance)
- [ ] Implement click-to-move (optional)
- [ ] FF7-style pre-rendered background layers

**Technical Approach**:
```typescript
// In NeoTokyoGame.tsx
- Update camera position: [x, y + 20, z + 20]
- Set camera rotation: lookAt(player.position)
- Add orthographic camera option (toggle in settings)
```

### 5.5 3D Transition Effects
- [ ] Fade to black
- [ ] Wipe transitions
- [ ] Zoom in/out effects
- [ ] Stage-specific transitions (e.g., elevator rising)

**Estimated Time**: 10-12 hours

---

## 🤖 PHASE 6: GenAI Content Pipeline (JULES'S RESPONSIBILITY)

**Status**: Infrastructure missing, documentation exists

### 6.1 GitHub Actions Workflow
- [ ] Create `.github/workflows/generate-content.yml`
- [ ] Configure `GEMINI_API_KEY` secret
- [ ] Set up manual workflow trigger
- [ ] Add automated trigger on story.json changes

**Owner**: Jules (has workflow permissions)

### 6.2 Gemini Flash 3 Integration
- [ ] Dialogue generation script
- [ ] Quest generation script
- [ ] Lore generation script
- [ ] Prompt engineering templates

**Owner**: Jules (has Gemini API key)

### 6.3 Imagen 4 Integration
- [ ] Character portrait generation
- [ ] Parallax background layer generation
- [ ] Asset caching system
- [ ] Cost tracking and budgeting

**Owner**: Jules (has Imagen API access)

### 6.4 Content Validation
- [ ] JSON schema validation
- [ ] Dialogue flow verification
- [ ] Asset quality checks
- [ ] Manual review process

**Estimated Time**: 8-10 hours (Jules)

---

## 📊 Overall Progress Tracking

| Phase | Status | Completion | Est. Remaining Time |
|-------|--------|------------|---------------------|
| Phase 1: Foundation | ✅ Complete | 100% | 0 hours |
| Phase 2: Narrative Expansion | 🔄 In Progress | 70% | 4-6 hours |
| Phase 3: Enhanced Event Stages | ⏳ Not Started | 0% | 14-18 hours |
| Phase 4: JRPG HUD Overhaul | ⏳ Not Started | 0% | 12-15 hours |
| Phase 5: World Exploration | ⏳ Not Started | 0% | 10-12 hours |
| Phase 6: GenAI Pipeline | ⏳ Not Started | 0% | 8-10 hours (Jules) |

**Total Estimated Remaining Time**: 48-61 hours
**Parallel Work Possible**: Claude (Phases 2-5) + Jules (Phase 6) = ~30-40 hours if concurrent

---

## 🎯 Immediate Next Steps

### For Claude (This Session):
1. ✅ Complete Phase 2 narrative expansion
2. Begin Phase 3.1 (Alien abduction cinematic)
3. Start Phase 4.1 (Quest log component)

### For Jules (Immediate):
1. Create GenAI workflow file
2. Implement Gemini integration scripts
3. Generate first batch of character portraits

---

## 📝 Notes

- **User Feedback**: "3-hour JRPG with A/B/C stories, non-linear flow, FF7-style exploration"
- **Critical Requirement**: Event disruptors (alien, mall) must be fully polished
- **Design Philosophy**: Agents should BUILD and DEVELOP, not just parrot requirements
- **Testing**: All new features must have unit tests
- **Documentation**: Update AGENTS.md as patterns evolve

---

*Last Updated: 2026-01-14 by Claude*
*Next Review: After Phase 3 completion*
