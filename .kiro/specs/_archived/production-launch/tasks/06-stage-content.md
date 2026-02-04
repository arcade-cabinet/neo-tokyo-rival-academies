# 6. Stage Content & Narrative

**Parent:** [tasks.md](../tasks.md)
**Validates:** Requirements 13, 14

## Overview
Implements all 9 stages with complete narrative content, storyboards, and stage-specific mechanics.

## Prerequisites
- Hex grid system functional (Section 2)
- Navigation and AI operational (Section 3)
- Quest and dialogue systems ready (Section 5)

## Tasks

### 6.1. Stage Data Architecture

**Validates:** Requirement 13.1

- [ ] 6.1.1. Define stage schema
  - Properties: id, name, type, grid_layout, enemies, objectives
  - Stage types: cutscene, combat, exploration, boss
  - Progression conditions
  - _File: `packages/game/src/types/stage.ts`_
  - _Validates: Requirements 13.1_

- [ ] 6.1.2. Create stage loader system
  - Load stage data from JSON manifests
  - Instantiate hex grid from layout
  - Spawn enemies and NPCs
  - _File: `packages/game/src/systems/StageLoader.ts`_

- [ ]* 6.1.3. Write property test for stage loading
  - **Property 33: Stage completeness**
  - **Validates: Requirements 13.1**
  - For any stage manifest, all referenced assets should exist
  - Grid layout should be valid hex configuration

### 6.2. Stage 1: Intro Cutscene

**Validates:** Requirement 14.1

- [ ] 6.2.1. Create intro cutscene stage
  - Load storyboard images from `public/assets/story/intro_01.png`, `intro_02.png`
  - Implement image sequence with fade transitions
  - Add narration text overlays
  - _File: `packages/game/src/content/stages/01_intro_cutscene.json`_
  - _Validates: Requirements 14.1_

- [ ] 6.2.2. Implement cutscene player component
  - Display storyboard images full-screen
  - Advance on user input or timer
  - Skip cutscene option
  - _File: `packages/game/src/components/react/ui/CutscenePlayer.tsx`_

### 6.3. Stage 2: Sector 7 Streets

**Validates:** Requirement 14.2

- [ ] 6.3.1. Create Sector 7 stage layout
  - 20x15 hex grid with street tiles
  - Spawn 5 Biker grunts
  - Place data shards (3 collectibles)
  - _File: `packages/game/src/content/stages/02_sector7_streets.json`_
  - _Validates: Requirements 14.2_

- [ ] 6.3.2. Implement stage objectives
  - Objective: Defeat all Biker grunts
  - Objective: Collect all data shards
  - Unlock next stage on completion
  - _File: `packages/game/src/systems/StageObjectives.ts`_

- [ ] 6.3.3. Add stage-specific dialogue
  - Intro dialogue with Vera
  - Mid-combat banter
  - Victory dialogue
  - _File: `packages/game/src/content/dialogue/02_sector7.json`_

### 6.4. Stage 3: Alien Ship

**Validates:** Requirement 14.3

- [ ] 6.4.1. Create Alien Ship stage layout
  - 25x20 hex grid with spaceship interior tiles
  - Spawn 8 tentacle agents
  - Navigation mesh for multi-agent pathfinding
  - _File: `packages/game/src/content/stages/03_alien_ship.json`_
  - _Validates: Requirements 14.3_

- [ ] 6.4.2. Implement tentacle swarm mechanics
  - 8 independent tentacle entities
  - Coordinated attack patterns
  - Regeneration on defeat (respawn after 10s)
  - _File: `packages/game/src/systems/TentacleSwarm.ts`_

- [ ] 6.4.3. Create alien ship environment
  - Pulsing bio-luminescent walls
  - Organic floor textures
  - Ambient alien sounds
  - _File: `packages/game/src/components/react/game/AlienShipBackground.tsx`_

### 6.5. Stage 4: Mall Drop

**Validates:** Requirement 14.4

- [ ] 6.5.1. Create Mall Drop stage layout
  - 18x18 hex grid with mall tiles
  - Spawn 6 Mall Security guards
  - Interactive shop NPCs
  - _File: `packages/game/src/content/stages/04_mall_drop.json`_
  - _Validates: Requirements 14.4_

- [ ] 6.5.2. Implement mall exploration mechanics
  - Optional side quests from NPCs
  - Shop system for buying items
  - Hidden data shards in stores
  - _File: `packages/game/src/systems/MallExploration.ts`_

- [ ] 6.5.3. Add mall background visuals
  - Neon store signs
  - Escalators and fountains
  - Crowd NPCs (non-combat)
  - _File: `packages/game/src/components/react/game/MallBackground.tsx`_

### 6.6. Stage 5: Boss Ambush

**Validates:** Requirement 14.5

- [ ] 6.6.1. Create Boss Ambush stage layout
  - 15x15 hex grid arena
  - Spawn Yakuza Boss
  - Spawn 3 Yakuza grunts as adds
  - _File: `packages/game/src/content/stages/05_boss_ambush.json`_
  - _Validates: Requirements 14.5_

- [ ] 6.6.2. Implement boss fight mechanics
  - Boss has 3 phases (100%, 66%, 33% HP)
  - Phase transitions trigger new attack patterns
  - Adds spawn at phase transitions
  - _File: `packages/game/src/systems/BossFight.ts`_

- [ ] 6.6.3. Add boss cutscenes
  - Pre-fight dialogue with boss
  - Mid-fight phase transition cutscenes
  - Victory cutscene
  - _File: `packages/game/src/content/dialogue/05_boss_ambush.json`_

### 6.7. Stage 6: Rooftop Chase

**Validates:** Requirement 14.6

- [ ] 6.7.1. Create Rooftop Chase stage layout
  - 30x12 hex grid (long horizontal)
  - Moving platform tiles
  - Spawn 8 Biker grunts in waves
  - _File: `packages/game/src/content/stages/06_rooftop_chase.json`_
  - _Validates: Requirements 14.6_

- [ ] 6.7.2. Implement chase mechanics
  - Auto-scroll stage (player must keep up)
  - Falling off edge = instant death
  - Enemies spawn ahead of player
  - _File: `packages/game/src/systems/ChaseSequence.ts`_

- [ ] 6.7.3. Add rooftop parallax background
  - Multi-layer parallax with city skyline
  - Moving clouds
  - Neon signs in distance
  - _File: `packages/game/src/components/react/game/ParallaxBackground.tsx`_

### 6.8. Stage 7: Summit Climb

**Validates:** Requirement 14.7

- [ ] 6.8.1. Create Summit Climb stage layout
  - 20x25 hex grid (vertical climb)
  - Spawn mixed enemies: Bikers, Yakuza, Aliens
  - Platforming challenges
  - _File: `packages/game/src/content/stages/07_summit_climb.json`_
  - _Validates: Requirements 14.7_

- [ ] 6.8.2. Implement vertical progression
  - Player climbs upward through grid
  - Camera follows player vertically
  - Checkpoints every 5 rows
  - _File: `packages/game/src/systems/VerticalProgression.ts`_

### 6.9. Stage 8: Final Battle

**Validates:** Requirement 14.8

- [ ] 6.9.1. Create Final Battle stage layout
  - 20x20 hex grid arena
  - Spawn final boss (Biker Boss)
  - Dynamic environment hazards
  - _File: `packages/game/src/content/stages/08_final_battle.json`_
  - _Validates: Requirements 14.8_

- [ ] 6.9.2. Implement final boss mechanics
  - 4 phases with unique attack patterns
  - Environmental attacks (lightning, explosions)
  - Summon adds at 50% and 25% HP
  - _File: `packages/game/src/systems/FinalBoss.ts`_

- [ ] 6.9.3. Add dramatic cutscenes
  - Pre-battle confrontation
  - Mid-battle story reveals
  - Victory sequence
  - _File: `packages/game/src/content/dialogue/08_final_battle.json`_

### 6.10. Stage 9: Epilogue

**Validates:** Requirement 14.9

- [ ] 6.10.1. Create epilogue cutscene
  - Load victory storyboard images
  - Show player stats summary
  - Display reputation standings
  - _File: `packages/game/src/content/stages/09_epilogue.json`_
  - _Validates: Requirements 14.9_

- [ ] 6.10.2. Implement credits sequence
  - Scrolling credits with game stats
  - Thank you message
  - New Game+ unlock prompt
  - _File: `packages/game/src/components/react/ui/CreditsSequence.tsx`_

## Verification

After completing this section:
- [ ] All 9 stages load without errors
- [ ] Stage transitions work correctly
- [ ] All enemies spawn as configured
- [ ] Objectives track properly per stage
- [ ] Cutscenes play with correct timing
- [ ] Boss fights execute all phases
- [ ] All property tests pass
- [ ] TypeScript compiles without errors
- [ ] Linting passes (`pnpm check`)
- [ ] 60 FPS maintained across all stages

## Common Commands

```bash
# Development
pnpm --filter @neo-tokyo/game dev

# Test stage loading
pnpm --filter @neo-tokyo/game test StageLoader

# Test specific stage mechanics
pnpm --filter @neo-tokyo/game test TentacleSwarm
pnpm --filter @neo-tokyo/game test BossFight

# Lint
pnpm --filter @neo-tokyo/game check
```
