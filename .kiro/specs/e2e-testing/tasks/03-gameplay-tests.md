# 3. Gameplay Tests

**Parent:** [tasks.md](../tasks.md)
**Validates:** Requirements 4, 5, 6, 7, 10

## Overview

Implement gameplay flow tests for quests, dialogue, combat, and inventory systems.

## Prerequisites

- Section 2 (Core Tests) complete
- Game can be started and intro skipped

## Tasks

### 3.1. Quest Flow Tests

**Validates:** Requirement 4

- [ ] 3.1.1. Create `e2e/tests/gameplay/quest-flow.spec.ts`
  - Test quest markers appear at correct locations
  - Test approaching marker shows accept dialog
  - Test accepting quest updates quest log
  - Test quest objectives display in HUD

- [ ] 3.1.2. Add quest completion tests
  - Test completing objectives updates progress
  - Test quest completion shows reward dialog
  - Test completed quests marked in quest log
  - Verify XP/rewards granted on completion

### 3.2. Dialogue System Tests

**Validates:** Requirement 5

- [ ] 3.2.1. Create `e2e/tests/gameplay/dialogue.spec.ts`
  - Test dialogue overlay appears when triggered
  - Test character portraits display correctly
  - Test dialogue text is readable and complete
  - Test dialogue choices are clickable

- [ ] 3.2.2. Add dialogue navigation tests
  - Test skip button advances dialogue
  - Test dialogue dismisses after completion
  - Test dialogue state persists correctly
  - Capture screenshots of dialogue states

### 3.3. Combat System Tests

**Validates:** Requirement 10

- [ ] 3.3.1. Create `e2e/tests/gameplay/combat.spec.ts`
  - Test combat arena opens on enemy encounter
  - Test attack actions deal damage
  - Test damage numbers display correctly
  - Test health bars update on damage

- [ ] 3.3.2. Add combat completion tests
  - Test combat ends when enemy defeated
  - Test XP awarded after combat
  - Test player returns to exploration after combat
  - Verify combat state resets correctly

### 3.4. Inventory System Tests

**Validates:** Requirement 7

- [ ] 3.4.1. Create `e2e/tests/gameplay/inventory.spec.ts`
  - Test inventory screen opens from HUD
  - Test collected items appear in inventory
  - Test item details display on selection
  - Test inventory closes correctly

- [ ] 3.4.2. Add item interaction tests
  - Test consumables can be used
  - Test equipment can be equipped
  - Test equipment can be unequipped
  - Verify stat changes from equipment

## Verification

After completing this section:
- [ ] All gameplay tests pass: `pnpm -C e2e test -- gameplay/`
- [ ] Quest flow works end-to-end
- [ ] Dialogue system is fully testable
- [ ] Combat system is fully testable
- [ ] Inventory system is fully testable

## Common Commands

```bash
# Run gameplay tests
pnpm -C e2e test -- --project=game-chromium gameplay/

# Run specific test
pnpm -C e2e test -- --project=game-chromium gameplay/quest-flow.spec.ts

# Debug mode
pnpm -C e2e test -- --debug gameplay/
```
