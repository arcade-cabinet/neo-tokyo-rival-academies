# 12. Testing & Quality Assurance

**Parent:** [tasks.md](../tasks.md)
**Validates:** Requirements 23

## Overview
Comprehensive testing suite including unit tests, property-based tests, integration tests, and E2E tests with Playwright.

## Prerequisites
- All game systems complete
- All features implemented
- Property tests written for each system

## Tasks

### 12.1. Unit Test Coverage

**Validates:** Requirement 23.1

- [ ] 12.1.1. Audit unit test coverage
  - Run coverage report: `pnpm test --coverage`
  - Identify untested modules
  - Target 80%+ coverage for game logic
  - _Validates: Requirements 23.1_

- [ ] 12.1.2. Write missing unit tests
  - Test all combat calculations
  - Test all progression formulas
  - Test all quest logic
  - _Directory: `packages/game/src/systems/__tests__/`_

- [ ] 12.1.3. Test edge cases
  - Zero values (0 HP, 0 damage)
  - Maximum values (level 30, max stats)
  - Negative values (should be rejected)
  - _Add to existing test files_

- [ ]* 12.1.4. Verify all unit tests pass
  - Run: `pnpm test`
  - Fix any failing tests
  - Ensure no flaky tests

### 12.2. Property-Based Test Execution

**Validates:** Requirement 23.2

- [ ] 12.2.1. Run all property tests
  - Execute all 55 property tests from design
  - Minimum 100 iterations per property
  - Log any failures with counterexamples
  - _Validates: Requirements 23.2_

- [ ] 12.2.2. Fix property test failures
  - Analyze counterexamples
  - Fix underlying bugs in code
  - Re-run tests to verify fixes
  - _Use updatePBTStatus tool to track_

- [ ] 12.2.3. Optimize property test generators
  - Ensure generators cover full input space
  - Add shrinking for better counterexamples
  - Balance randomness with edge cases
  - _Files: `packages/game/src/__tests__/generators/`_

- [ ]* 12.2.4. Document property test results
  - Create test report with all property results
  - Include pass/fail status
  - Document any known limitations
  - _File: `docs/PROPERTY_TEST_REPORT.md`_

### 12.3. Integration Testing

**Validates:** Requirement 23.3

- [ ] 12.3.1. Test system interactions
  - Combat + Progression (XP gain on enemy defeat)
  - Quest + Dialogue (quest triggers from dialogue)
  - Save + Load (full game state persistence)
  - _File: `packages/game/src/__tests__/integration/`_
  - _Validates: Requirements 23.3_

- [ ] 12.3.2. Test stage transitions
  - Load stage → play → complete → next stage
  - Verify state persists across transitions
  - Test all 9 stage sequences
  - _File: `packages/game/src/__tests__/integration/stage-flow.test.ts`_

- [ ] 12.3.3. Test multi-system scenarios
  - Combat during dialogue (should pause combat)
  - Save during combat (should save mid-fight state)
  - Level up during boss fight (should apply immediately)
  - _File: `packages/game/src/__tests__/integration/complex-scenarios.test.ts`_

### 12.4. End-to-End Testing with Playwright

**Validates:** Requirement 23.4

- [ ] 12.4.1. Set up Playwright test suite
  - Configure Playwright for game testing
  - Set up test fixtures (mock saves, test data)
  - Configure viewport sizes (desktop, mobile)
  - _File: `packages/e2e/playwright.config.ts`_
  - _Validates: Requirements 23.4_

- [ ] 12.4.2. Write E2E test: Complete playthrough
  - Start new game
  - Complete tutorial
  - Play through all 9 stages
  - Verify victory screen
  - _File: `packages/e2e/tests/full-playthrough.spec.ts`_

- [ ] 12.4.3. Write E2E test: Combat mechanics
  - Test attack, dodge, abilities
  - Test break system
  - Test enemy AI behavior
  - _File: `packages/e2e/tests/combat.spec.ts`_

- [ ] 12.4.4. Write E2E test: Progression
  - Gain XP and level up
  - Allocate stat points
  - Test reputation changes
  - _File: `packages/e2e/tests/progression.spec.ts`_

- [ ] 12.4.5. Write E2E test: Quest system
  - Accept quest
  - Complete objectives
  - Claim rewards
  - _File: `packages/e2e/tests/quests.spec.ts`_

- [ ] 12.4.6. Write E2E test: Save/Load
  - Save game
  - Reload page
  - Load save
  - Verify state restored
  - _File: `packages/e2e/tests/save-load.spec.ts`_

- [ ] 12.4.7. Write E2E test: Mobile controls
  - Test virtual joystick
  - Test touch buttons
  - Test gesture controls
  - _File: `packages/e2e/tests/mobile-controls.spec.ts`_

- [ ]* 12.4.8. Run all E2E tests
  - Execute: `pnpm test:e2e`
  - Fix any failing tests
  - Capture screenshots on failure

### 12.5. Performance Testing

**Validates:** Requirement 23.5

- [ ] 12.5.1. Create performance benchmarks
  - Measure frame rate during combat
  - Measure memory usage per stage
  - Measure load times
  - _File: `packages/game/src/__tests__/performance/benchmarks.test.ts`_
  - _Validates: Requirements 23.5_

- [ ] 12.5.2. Test on target devices
  - Pixel 8a: 60 FPS, <200MB memory
  - OnePlus Open: 60 FPS both modes
  - iPhone 12+: 60 FPS, <200MB memory
  - _Manual testing with performance monitor_

- [ ] 12.5.3. Stress test with max entities
  - Spawn maximum enemies (20+)
  - Spawn maximum particles (1000)
  - Verify performance remains acceptable
  - _File: `packages/game/src/__tests__/performance/stress.test.ts`_

- [ ]* 12.5.4. Document performance results
  - Create performance report
  - Include benchmarks per device
  - Document any performance issues
  - _File: `docs/PERFORMANCE_REPORT.md`_

### 12.6. Regression Testing

**Validates:** Requirement 23.6

- [ ] 12.6.1. Create regression test suite
  - Test all previously fixed bugs
  - Ensure bugs don't reappear
  - Run on every commit
  - _File: `packages/game/src/__tests__/regression/`_
  - _Validates: Requirements 23.6_

- [ ] 12.6.2. Set up CI/CD testing
  - Run tests on every PR
  - Block merge if tests fail
  - Generate test reports
  - _File: `.github/workflows/test.yml`_

- [ ] 12.6.3. Implement visual regression testing
  - Capture screenshots of UI
  - Compare against baseline
  - Flag visual changes
  - _File: `packages/e2e/tests/visual-regression.spec.ts`_

### 12.7. User Acceptance Testing

**Validates:** Requirement 23.7

- [ ] 12.7.1. Create UAT test plan
  - Define test scenarios
  - Create test scripts for testers
  - Set acceptance criteria
  - _File: `docs/UAT_TEST_PLAN.md`_
  - _Validates: Requirements 23.7_

- [ ] 12.7.2. Conduct internal playtesting
  - Recruit 5+ playtesters
  - Observe gameplay sessions
  - Collect feedback
  - _Document in: `docs/PLAYTEST_FEEDBACK.md`_

- [ ] 12.7.3. Fix critical issues from UAT
  - Prioritize game-breaking bugs
  - Address major UX issues
  - Re-test after fixes
  - _Track in GitHub issues_

### 12.8. Final QA Pass

**Validates:** Requirement 23.8

- [ ] 12.8.1. Execute full test suite
  - Run all unit tests: `pnpm test`
  - Run all property tests (verify all 55 pass)
  - Run all E2E tests: `pnpm test:e2e`
  - _Validates: Requirements 23.8_

- [ ] 12.8.2. Verify all requirements met
  - Check each requirement in requirements.md
  - Verify acceptance criteria satisfied
  - Document any deviations
  - _File: `docs/REQUIREMENTS_VERIFICATION.md`_

- [ ] 12.8.3. Create final test report
  - Summarize all test results
  - Include coverage metrics
  - List known issues
  - Sign off for production
  - _File: `docs/FINAL_TEST_REPORT.md`_

- [ ] 12.8.4. Prepare release notes
  - List all features
  - Document known issues
  - Include credits
  - _File: `RELEASE_NOTES.md`_

## Verification

After completing this section:
- [ ] All unit tests pass (80%+ coverage)
- [ ] All 55 property tests pass (100+ iterations each)
- [ ] All integration tests pass
- [ ] All E2E tests pass
- [ ] Performance meets targets on all devices
- [ ] No critical bugs remain
- [ ] UAT feedback addressed
- [ ] Requirements verified
- [ ] Final test report complete
- [ ] Ready for production release

## Common Commands

```bash
# Run all tests
pnpm test

# Run with coverage
pnpm test --coverage

# Run E2E tests
pnpm test:e2e

# Run E2E with UI
pnpm --filter @neo-tokyo/e2e test:ui

# Run specific test file
pnpm test CombatSystem.test.ts

# Run property tests only
pnpm test --grep "Property"

# Lint
pnpm check

# Build for production
pnpm build
```
