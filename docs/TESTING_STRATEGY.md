# Testing Strategy

## Overview

We employ a rigorous testing strategy to ensure the stability of the JRPG transformation.

## 1. Unit Testing (Vitest)

- **Scope**: Pure logic systems (Math, ECS Systems, State Machines).
- **Location**: `src/systems/__tests__/` and `src/utils/__tests__/`.
- **Requirement**: All new systems (Progression, Combat, Dialogue) must have >90% code coverage.
- **Tool**: Vitest.

## 2. Component Testing (React)

- **Scope**: UI Components (`RPGInterface`, `HealthBar`).
- **Tool**: Vitest + React Testing Library (Future implementation).

## 3. End-to-End Verification (Playwright)

- **Scope**: Critical user flows (Start Game -> Kill Enemy -> Level Up).
- **Method**: Scripted browser sessions that capture screenshots for manual verification.
- **Requirement**: Every major feature merge requires a visual verification screenshot.

## 4. Manual Verification

- Developers must run `pnpm dev` and verify gameplay feel.
- Use `scripts/verify_rpg_gameplay.py` to automate smoke tests.
