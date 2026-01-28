# Testing Strategy

**Updated**: January 27, 2026

## Goals

- Prevent regressions in core gameplay systems.
- Verify UI flows on mobile and web.
- Maintain 60 FPS performance targets.

## Test Types

### Unit Tests (Vitest)
- Location: `src/lib/**/*.test.ts`
- Run: `pnpm test`

### E2E Tests (Playwright)
- Location: `e2e/tests/`
- Run: `pnpm test:e2e`

### Mobile E2E (Maestro)
- Target: Android/iOS builds via Capacitor
- Run: `maestro test maestro/`

## CI Checklist

- `pnpm check`
- `pnpm test`
- `pnpm test:e2e`

## Manual Validation

- Scene generation matches story beat
- Combat spin-out transitions
- Save/load integrity
- Performance on Pixel 8a baseline
