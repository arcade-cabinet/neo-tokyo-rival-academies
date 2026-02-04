# 1. Test Infrastructure

**Parent:** [tasks.md](../tasks.md)
**Validates:** Requirements 1, 12, 13

## Overview

Set up the test infrastructure including page objects, fixtures, helpers, and configuration updates.

## Prerequisites

- Playwright installed (`pnpm -C e2e install`)
- Game builds and runs (`pnpm start`)

## Tasks

### 1.1. Update Playwright Configuration

**Validates:** Requirement 12.1

- [ ] 1.1.1. Update `e2e/playwright.config.ts` to include all test directories
  - Add test patterns for `core/`, `gameplay/`, `ui/`, `mobile/`, `performance/`
  - Configure viewport sizes for desktop and mobile
  - Set appropriate timeouts for WebGL initialization

- [ ] 1.1.2. Add mobile device configurations
  - Add iPhone 14 viewport (390x844)
  - Add iPad viewport (820x1180)
  - Add Pixel 8a viewport (412x915)

### 1.2. Create Page Object

**Validates:** Requirements 1, 2, 3

- [ ] 1.2.1. Create `e2e/fixtures/game-page.ts` with GamePage class
  - `navigateToGame()` - Navigate to game URL
  - `waitForReady()` - Wait for canvas and HUD
  - `startGame()` - Click start button
  - `skipIntro()` - Skip intro dialogue
  - `movePlayer(direction)` - Simulate player movement
  - `getPlayerPosition()` - Get current player position
  - `getHealthValue()` - Get current health
  - `getLevelValue()` - Get current level
  - `captureScreenshot(name)` - Take named screenshot

- [ ] 1.2.2. Add UI interaction methods to GamePage
  - `openInventory()` - Open inventory screen
  - `closeInventory()` - Close inventory screen
  - `openSettings()` - Open settings overlay
  - `closeSettings()` - Close settings overlay
  - `openQuestLog()` - Open quest log
  - `closeQuestLog()` - Close quest log

### 1.3. Create Test Helpers

**Validates:** Requirements 1.6, 13

- [ ] 1.3.1. Create `e2e/fixtures/test-helpers.ts`
  - `waitForGameReady(page)` - Wait for game initialization
  - `captureGameState(page)` - Capture current game state
  - `filterKnownErrors(errors)` - Filter known console errors
  - `assertNoErrors(errors)` - Assert no unexpected errors

- [ ] 1.3.2. Create `e2e/fixtures/test-data.ts`
  - Define starting player state constants
  - Define bounds constants
  - Define known quest data
  - Define expected UI element selectors

### 1.4. Create Test Fixtures

**Validates:** Requirement 1

- [ ] 1.4.1. Create Playwright fixture for game page
  - Export `test` with `gamePage` fixture
  - Auto-navigate to game on test start
  - Auto-capture screenshot on failure

## Verification

After completing this section:
- [ ] `pnpm -C e2e test -- --project=game-chromium canal.spec.ts` passes
- [ ] GamePage class is importable
- [ ] Test helpers are importable
- [ ] No TypeScript errors in e2e directory

## Common Commands

```bash
# Verify e2e setup
pnpm -C e2e test -- --project=game-chromium canal.spec.ts

# Check TypeScript
pnpm -C e2e tsc --noEmit
```
