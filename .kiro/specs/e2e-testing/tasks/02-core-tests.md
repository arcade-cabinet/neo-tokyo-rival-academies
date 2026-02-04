# 2. Core Tests

**Parent:** [tasks.md](../tasks.md)
**Validates:** Requirements 1, 2, 3

## Overview

Implement core functionality tests for scene loading, player movement, bounds checking, and collision detection.

## Prerequisites

- Section 1 (Infrastructure) complete
- GamePage and test helpers available

## Tasks

### 2.1. Scene Loading Tests

**Validates:** Requirement 1

- [ ] 2.1.1. Create `e2e/tests/core/scene-loading.spec.ts`
  - Test main menu loads within 5 seconds
  - Test Babylon.js canvas initializes
  - Test flooded world scene generates
  - Capture screenshots at each stage

- [ ] 2.1.2. Add asset loading verification
  - Test character assets load (or fallback gracefully)
  - Test tile assets load
  - Test background assets load
  - Log any 404 errors for missing assets

### 2.2. Player Movement Tests

**Validates:** Requirement 2

- [ ] 2.2.1. Create `e2e/tests/core/player-movement.spec.ts`
  - Test player can move up (keyboard/touch)
  - Test player can move down
  - Test player can move left
  - Test player can move right
  - Verify position changes after movement

- [ ] 2.2.2. Add hex grid snapping tests
  - Test player position snaps to hex centers
  - Test diagonal movement resolves to valid hex
  - Capture position before/after movement

### 2.3. Bounds Checking Tests

**Validates:** Requirement 2

- [ ] 2.3.1. Create `e2e/tests/core/bounds.spec.ts`
  - Test player cannot move beyond left boundary
  - Test player cannot move beyond right boundary
  - Test player cannot move beyond top boundary
  - Test player cannot move beyond bottom boundary

- [ ] 2.3.2. Add boundary edge case tests
  - Test player at corner positions
  - Test rapid movement doesn't bypass bounds
  - Verify player position stays within bounds after all tests

### 2.4. Collision Detection Tests

**Validates:** Requirement 3

- [ ] 2.4.1. Create `e2e/tests/core/collision.spec.ts`
  - Test collision with quest marker triggers dialogue
  - Test collision with data shard triggers collection
  - Verify collected items removed from scene

- [ ] 2.4.2. Add collision state verification
  - Test game state updates on collision
  - Test inventory updates on item collection
  - Test quest state updates on marker interaction

## Verification

After completing this section:
- [ ] All core tests pass: `pnpm -C e2e test -- core/`
- [ ] Screenshots captured in `e2e/verification/`
- [ ] No flaky tests (run 3 times)
- [ ] Test execution under 2 minutes

## Common Commands

```bash
# Run core tests
pnpm -C e2e test -- --project=game-chromium core/

# Run specific test
pnpm -C e2e test -- --project=game-chromium core/scene-loading.spec.ts

# Debug mode
pnpm -C e2e test -- --debug core/
```
