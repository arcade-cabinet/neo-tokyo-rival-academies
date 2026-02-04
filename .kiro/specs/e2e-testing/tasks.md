# Implementation Tasks: Comprehensive E2E Testing

## Overview

This task list implements comprehensive E2E testing for Neo-Tokyo: Rival Academies. The final task generates a handoff spec for the next agent.

## Version Requirements

- Node.js: >=22.22.0
- PNPM: >=10.0.0
- Playwright: 1.40+
- Angular: 19 (zoneless)
- Babylon.js: 8.46+

## Task Sections

| Section | File | Tasks | Status |
|---------|------|-------|--------|
| 1. Test Infrastructure | [tasks/01-infrastructure.md](tasks/01-infrastructure.md) | 6 | Not Started |
| 2. Core Tests | [tasks/02-core-tests.md](tasks/02-core-tests.md) | 8 | Not Started |
| 3. Gameplay Tests | [tasks/03-gameplay-tests.md](tasks/03-gameplay-tests.md) | 10 | Not Started |
| 4. UI Tests | [tasks/04-ui-tests.md](tasks/04-ui-tests.md) | 8 | Not Started |
| 5. Mobile & Performance | [tasks/05-mobile-performance.md](tasks/05-mobile-performance.md) | 6 | Not Started |
| 6. Handoff Spec | [tasks/06-handoff.md](tasks/06-handoff.md) | 4 | Not Started |

**Total Tasks:** 42

## Dependency Graph

```
┌─────────────────────┐
│ 1. Infrastructure   │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ 2. Core Tests       │
└─────────┬───────────┘
          │
    ┌─────┴─────┐
    ▼           ▼
┌───────┐   ┌───────┐
│ 3.    │   │ 4.    │
│ Game  │   │ UI    │
└───┬───┘   └───┬───┘
    │           │
    └─────┬─────┘
          ▼
┌─────────────────────┐
│ 5. Mobile & Perf    │
└─────────┬───────────┘
          │
          ▼
┌─────────────────────┐
│ 6. Handoff Spec     │
└─────────────────────┘
```

## Execution Notes

- Execute sections sequentially (1 → 2 → 3/4 → 5 → 6)
- Sections 3 and 4 can be parallelized
- Commit after each task or logical group
- Push to main after each section completes
- Run `pnpm check` before committing
- Run `pnpm test:e2e` after implementing tests
- Update memory-bank after each section

## Common Commands

```bash
# Run all E2E tests
pnpm test:e2e

# Run specific test file
pnpm -C e2e test -- --project=game-chromium {test-file}.spec.ts

# Run with UI mode
pnpm -C e2e test:ui

# Run with debug
pnpm -C e2e test -- --debug

# Generate report
pnpm -C e2e test -- --reporter=html
```
