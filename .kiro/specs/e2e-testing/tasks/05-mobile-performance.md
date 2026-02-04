# 5. Mobile & Performance Tests

**Parent:** [tasks.md](../tasks.md)
**Validates:** Requirements 11, 12, 13

## Overview

Implement mobile-specific tests and performance verification tests.

## Prerequisites

- Sections 2, 3, 4 complete
- Core gameplay tests passing

## Tasks

### 5.1. Touch Control Tests

**Validates:** Requirement 11

- [ ] 5.1.1. Create `e2e/tests/mobile/touch-controls.spec.ts`
  - Test touch input for movement (swipe gestures)
  - Test touch input for UI interactions (tap)
  - Test virtual d-pad works correctly
  - Verify touch events translate to game actions

- [ ] 5.1.2. Add mobile viewport tests
  - Test HUD scales correctly on iPhone viewport
  - Test HUD scales correctly on iPad viewport
  - Test HUD scales correctly on Pixel viewport
  - Capture screenshots at each viewport size

### 5.2. Responsive Layout Tests

**Validates:** Requirement 11

- [ ] 5.2.1. Add orientation tests
  - Test portrait orientation layout
  - Test landscape orientation layout
  - Test orientation change handling
  - Verify safe area insets are respected

### 5.3. Performance Tests

**Validates:** Requirement 12

- [ ] 5.3.1. Create `e2e/tests/performance/metrics.spec.ts`
  - Test initial load completes within 5 seconds
  - Test scene transitions complete within 2 seconds
  - Measure and log load times
  - Capture performance metrics

- [ ] 5.3.2. Add memory tests
  - Test no memory leaks during gameplay loop
  - Test memory usage stays reasonable
  - Log memory metrics for analysis

### 5.4. Error Handling Tests

**Validates:** Requirement 13

- [ ] 5.4.1. Create `e2e/tests/core/error-handling.spec.ts`
  - Test missing assets show fallback content
  - Test game recovers from unexpected states
  - Test corrupted save data handled gracefully
  - Verify error boundaries work correctly

## Verification

After completing this section:
- [ ] All mobile tests pass on mobile viewports
- [ ] Performance metrics meet targets
- [ ] Error handling works correctly
- [ ] No flaky tests

## Common Commands

```bash
# Run mobile tests
pnpm -C e2e test -- --project=game-chromium mobile/

# Run performance tests
pnpm -C e2e test -- --project=game-chromium performance/

# Run all tests
pnpm test:e2e
```
