# 4. UI Tests

**Parent:** [tasks.md](../tasks.md)
**Validates:** Requirements 6, 8, 9

## Overview

Implement UI component tests for HUD accuracy, save/load functionality, and settings persistence.

## Prerequisites

- Section 2 (Core Tests) complete
- Game can be started and intro skipped

## Tasks

### 4.1. HUD Tests

**Validates:** Requirement 6

- [ ] 4.1.1. Create `e2e/tests/ui/hud.spec.ts`
  - Test health bar displays correct value
  - Test level indicator shows current level
  - Test XP bar shows progress to next level
  - Test alignment bar shows current alignment

- [ ] 4.1.2. Add HUD update tests
  - Test quest objective tracker updates correctly
  - Test floating damage numbers appear on combat
  - Test toast notifications appear for events
  - Verify HUD reflects game state changes

### 4.2. Save/Load Tests

**Validates:** Requirement 8

- [ ] 4.2.1. Create `e2e/tests/ui/save-load.spec.ts`
  - Test auto-save triggers at checkpoints
  - Test save slot selection works
  - Test manual save creates save data
  - Verify save data in localStorage

- [ ] 4.2.2. Add load verification tests
  - Test game state persists after reload
  - Test player position is restored correctly
  - Test quest progress is restored correctly
  - Test inventory is restored correctly

### 4.3. Settings Tests

**Validates:** Requirement 9

- [ ] 4.3.1. Create `e2e/tests/ui/settings.spec.ts`
  - Test settings overlay opens from HUD
  - Test haptics toggle works
  - Test gyro toggle works
  - Test settings overlay closes correctly

- [ ] 4.3.2. Add settings persistence tests
  - Test music volume slider works
  - Test SFX volume slider works
  - Test HUD scale slider works
  - Test settings persist after reload

### 4.4. Menu Tests

**Validates:** Requirement 1

- [ ] 4.4.1. Create `e2e/tests/ui/menu.spec.ts`
  - Test main menu displays correctly
  - Test start button is clickable
  - Test continue button appears with save data
  - Test menu navigation works

## Verification

After completing this section:
- [ ] All UI tests pass: `pnpm -C e2e test -- ui/`
- [ ] HUD displays accurate information
- [ ] Save/load works correctly
- [ ] Settings persist correctly
- [ ] Menu navigation works

## Common Commands

```bash
# Run UI tests
pnpm -C e2e test -- --project=game-chromium ui/

# Run specific test
pnpm -C e2e test -- --project=game-chromium ui/hud.spec.ts

# Debug mode
pnpm -C e2e test -- --debug ui/
```
