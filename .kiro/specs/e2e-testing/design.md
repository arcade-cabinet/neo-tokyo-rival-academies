# Design Document: Comprehensive E2E Testing

## Overview

This design document outlines the architecture and implementation approach for comprehensive E2E testing of Neo-Tokyo: Rival Academies using Playwright.

## Architecture

### Test Organization

```
e2e/
├── tests/
│   ├── core/                    # Core functionality tests
│   │   ├── scene-loading.spec.ts
│   │   ├── player-movement.spec.ts
│   │   └── collision.spec.ts
│   ├── gameplay/                # Gameplay flow tests
│   │   ├── quest-flow.spec.ts
│   │   ├── dialogue.spec.ts
│   │   ├── combat.spec.ts
│   │   └── inventory.spec.ts
│   ├── ui/                      # UI component tests
│   │   ├── hud.spec.ts
│   │   ├── settings.spec.ts
│   │   └── save-load.spec.ts
│   ├── mobile/                  # Mobile-specific tests
│   │   └── touch-controls.spec.ts
│   └── performance/             # Performance tests
│       └── metrics.spec.ts
├── fixtures/                    # Test fixtures and helpers
│   ├── game-page.ts            # Page object for game
│   └── test-data.ts            # Test data constants
├── verification/               # Screenshot output
└── playwright.config.ts        # Playwright configuration
```

### Page Object Pattern

We'll use the Page Object pattern to encapsulate game interactions:

```typescript
// e2e/fixtures/game-page.ts
export class GamePage {
  constructor(private page: Page) {}
  
  async navigateToGame() { ... }
  async startGame() { ... }
  async skipIntro() { ... }
  async movePlayer(direction: 'up' | 'down' | 'left' | 'right') { ... }
  async openInventory() { ... }
  async openSettings() { ... }
  async getPlayerPosition() { ... }
  async getHealthValue() { ... }
  // ... more methods
}
```

### Test Categories

#### 1. Core Tests
- Scene initialization
- Asset loading
- Player movement
- Collision detection
- Bounds checking

#### 2. Gameplay Tests
- Quest acceptance and completion
- Dialogue interactions
- Combat flow
- Inventory management

#### 3. UI Tests
- HUD accuracy
- Settings persistence
- Save/load functionality

#### 4. Mobile Tests
- Touch input
- Viewport scaling
- Orientation changes

#### 5. Performance Tests
- Load times
- Frame rate
- Memory usage

## Implementation Approach

### Test Helpers

```typescript
// e2e/fixtures/test-helpers.ts
export async function waitForGameReady(page: Page) {
  await page.waitForSelector('canvas', { state: 'visible' });
  await page.waitForSelector('.game-hud', { state: 'visible' });
}

export async function captureGameState(page: Page) {
  return {
    playerPosition: await page.evaluate(() => window.__gameState?.playerPosition),
    health: await page.evaluate(() => window.__gameState?.health),
    quests: await page.evaluate(() => window.__gameState?.quests),
  };
}
```

### Error Filtering

Known issues that should be filtered from error detection:

```typescript
const IGNORED_ERRORS = [
  /Failed to load character:.*combat_stance\.glb/i,
  /cannot be a descendant of/i,
  // Add more as discovered
];
```

### Screenshot Strategy

Screenshots will be captured at key points:
- After scene load
- After player movement
- After UI interactions
- On test failure

### Viewport Configurations

```typescript
const VIEWPORTS = {
  desktop: { width: 1280, height: 720 },
  mobile: { width: 390, height: 844 },  // iPhone 14
  tablet: { width: 820, height: 1180 }, // iPad
};
```

## Test Data

### Player Starting State
- Position: Center of hex grid
- Health: 10/10
- Level: 1
- XP: 0

### Quest Test Data
- Test quest with known marker position
- Test dialogue with known text
- Test rewards with known values

## Correctness Properties

### P1: Player Bounds Invariant
For all player movements, the player position must remain within the defined bounds:
```
∀ movement: bounds.minX ≤ player.x ≤ bounds.maxX
            bounds.minY ≤ player.y ≤ bounds.maxY
```

### P2: Collision Consistency
When player collides with a collectible, the collectible must be removed and inventory updated:
```
∀ collision with collectible:
  pre: collectible in scene, collectible not in inventory
  post: collectible not in scene, collectible in inventory
```

### P3: Quest State Machine
Quest state transitions must follow valid paths:
```
available → accepted → in_progress → completed
                    ↘ abandoned
```

### P4: Health Invariant
Health must remain within valid bounds:
```
∀ health changes: 0 ≤ health ≤ maxHealth
```

### P5: Save/Load Consistency
Loaded state must match saved state:
```
∀ save/load cycles: load(save(state)) == state
```

## Dependencies

- Playwright 1.40+
- @playwright/test
- Existing game running on localhost:4200

## Testing Commands

```bash
# Run all E2E tests
pnpm test:e2e

# Run specific test file
pnpm -C e2e test -- --project=game-chromium scene-loading.spec.ts

# Run with UI mode
pnpm -C e2e test:ui

# Run with debug
pnpm -C e2e test -- --debug
```

## Success Criteria

1. All 14 requirements have corresponding test coverage
2. Tests pass consistently (no flaky tests)
3. Test execution completes within 5 minutes
4. Screenshots captured for visual verification
5. Handoff spec generated with remaining work
