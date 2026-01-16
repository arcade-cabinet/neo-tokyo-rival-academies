# 5. Quest & Dialogue Systems

**Parent:** [tasks.md](../tasks.md)
**Validates:** Requirements 10, 11, 12

## Overview
Implements procedural quest generation, visual novel dialogue system, and narrative branching based on player choices.

## Prerequisites
- Reputation system functional (Section 4)
- Stage system operational
- UI components ready

## Tasks

### 5.1. Quest Data Model

**Validates:** Requirement 10.1

- [ ] 5.1.1. Define quest schema
  - Quest types: main, side, faction, bounty
  - Properties: id, title, description, objectives, rewards
  - State tracking: not_started, active, completed, failed
  - _File: `packages/game/src/types/quest.ts`_
  - _Validates: Requirements 10.1_

- [ ] 5.1.2. Create quest objective system
  - Objective types: defeat, collect, reach, interact
  - Progress tracking per objective
  - Completion conditions
  - _File: `packages/game/src/systems/QuestObjectives.ts`_

- [ ]* 5.1.3. Write property test for quest state transitions
  - **Property 28: Quest state validity**
  - **Validates: Requirements 10.1**
  - For any quest, state transitions should follow valid flow
  - Quest should never transition from completed to active

### 5.2. Procedural Quest Generation

**Validates:** Requirement 10.2, 10.3

- [ ] 5.2.1. Implement quest template system
  - Define quest templates with variable slots
  - Templates for each quest type
  - Parameterize: enemy type, location, item, reward
  - _File: `packages/game/src/systems/QuestGenerator.ts`_
  - _Validates: Requirements 10.2_

- [ ] 5.2.2. Create quest generation pipeline
  - Select template based on player level and reputation
  - Fill template slots with contextual data
  - Validate quest feasibility (enemies exist, location accessible)
  - _File: `packages/game/src/systems/QuestGenerator.ts`_

- [ ] 5.2.3. Implement quest reward calculation
  - Scale XP and currency by quest difficulty
  - Reputation rewards based on faction
  - Rare item drops for high-tier quests
  - _File: `packages/game/src/systems/QuestRewards.ts`_
  - _Validates: Requirements 10.3_

- [ ]* 5.2.4. Write property test for quest generation
  - **Property 29: Quest feasibility**
  - **Validates: Requirements 10.2**
  - For any generated quest, all objectives should be achievable
  - Required enemies/items should exist in game

### 5.3. Quest Tracking System

**Validates:** Requirement 10.4

- [ ] 5.3.1. Create quest log system
  - Track active quests (max 5 simultaneous)
  - Store completed quest history
  - Persist quest state to save file
  - _File: `packages/game/src/systems/QuestLog.ts`_
  - _Validates: Requirements 10.4_

- [ ] 5.3.2. Implement quest objective tracking
  - Listen to game events (enemy defeated, item collected)
  - Update objective progress automatically
  - Trigger quest completion when all objectives met
  - _File: `packages/game/src/systems/QuestTracker.ts`_

- [ ]* 5.3.3. Write property test for quest tracking
  - **Property 30: Progress monotonicity**
  - **Validates: Requirements 10.4**
  - For any quest, objective progress should never decrease
  - Completion should trigger when all objectives at 100%

### 5.4. Dialogue System Core

**Validates:** Requirement 11.1, 11.2

- [ ] 5.4.1. Define dialogue data schema
  - Dialogue nodes: speaker, text, choices, next
  - Support branching based on conditions
  - Integrate with reputation system
  - _File: `packages/game/src/types/dialogue.ts`_
  - _Validates: Requirements 11.1_

- [ ] 5.4.2. Implement dialogue state machine
  - Track current dialogue node
  - Evaluate choice conditions (reputation, quest state)
  - Navigate dialogue tree based on player choices
  - _File: `packages/game/src/systems/DialogueSystem.ts`_
  - _Validates: Requirements 11.2_

- [ ]* 5.4.3. Write property test for dialogue branching
  - **Property 31: Dialogue tree validity**
  - **Validates: Requirements 11.2**
  - For any dialogue tree, all branches should lead to terminal node
  - No infinite loops should exist

### 5.5. Visual Novel UI

**Validates:** Requirement 11.3

- [ ] 5.5.1. Create dialogue overlay component
  - Full-screen overlay with character portraits
  - Text box with typewriter effect
  - Choice buttons for branching
  - _File: `packages/game/src/components/react/ui/DialogueOverlay.tsx`_
  - _Validates: Requirements 11.3_

- [ ] 5.5.2. Implement character portrait system
  - Load character portraits from assets
  - Support multiple expressions per character
  - Animate portrait transitions
  - _File: `packages/game/src/components/react/ui/CharacterPortrait.tsx`_

- [ ] 5.5.3. Create dialogue history log
  - Store all viewed dialogue
  - Allow scrollback to review previous text
  - Persist to save file
  - _File: `packages/game/src/systems/DialogueHistory.ts`_

### 5.6. Procedural Dialogue Generation

**Validates:** Requirement 12.1, 12.2

- [ ] 5.6.1. Integrate Gemini API for dialogue
  - Configure API client with rate limiting
  - Create prompt templates for dialogue generation
  - Cache generated dialogue to reduce API calls
  - _File: `packages/game/src/systems/DialogueGenerator.ts`_
  - _Validates: Requirements 12.1_

- [ ] 5.6.2. Implement context-aware generation
  - Pass player stats, reputation, quest state to API
  - Generate dialogue that references game state
  - Maintain character voice consistency
  - _File: `packages/game/src/systems/DialogueGenerator.ts`_
  - _Validates: Requirements 12.2_

- [ ] 5.6.3. Create fallback dialogue system
  - Pre-written dialogue for critical story moments
  - Fallback to static dialogue if API unavailable
  - Blend procedural and static seamlessly
  - _File: `packages/game/src/data/fallback_dialogue.json`_

- [ ]* 5.6.4. Write property test for dialogue generation
  - **Property 32: Dialogue coherence**
  - **Validates: Requirements 12.1**
  - For any generated dialogue, text should be non-empty
  - Dialogue should reference correct character names

### 5.7. Quest UI Integration

**Validates:** Requirement 10.5

- [ ] 5.7.1. Create quest log UI
  - Display active quests with progress bars
  - Show quest objectives and completion status
  - Allow quest selection for tracking
  - _File: `packages/game/src/components/react/ui/QuestLog.tsx`_
  - _Validates: Requirements 10.5_

- [ ] 5.7.2. Implement quest notification system
  - Toast notifications for quest updates
  - Quest complete fanfare animation
  - Objective progress indicators
  - _File: `packages/game/src/components/react/ui/QuestNotification.tsx`_

- [ ] 5.7.3. Add quest markers to HUD
  - Directional arrow to quest objective
  - Distance indicator
  - Toggle quest tracking on/off
  - _File: `packages/game/src/components/react/ui/JRPGHUD.tsx`_

## Verification

After completing this section:
- [ ] Quests generate with valid objectives
- [ ] Quest tracking updates automatically
- [ ] Dialogue system navigates trees correctly
- [ ] Visual novel UI displays properly
- [ ] Procedural dialogue integrates with Gemini
- [ ] Quest log UI shows all active quests
- [ ] All property tests pass (100+ iterations each)
- [ ] TypeScript compiles without errors
- [ ] Linting passes (`pnpm check`)
- [ ] Dialogue loads without frame drops

## Common Commands

```bash
# Development
pnpm --filter @neo-tokyo/game dev

# Test quest systems
pnpm --filter @neo-tokyo/game test QuestGenerator
pnpm --filter @neo-tokyo/game test QuestTracker

# Test dialogue systems
pnpm --filter @neo-tokyo/game test DialogueSystem
pnpm --filter @neo-tokyo/game test DialogueGenerator

# Lint
pnpm --filter @neo-tokyo/game check
```
