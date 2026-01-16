# Tech Stack

## Core Technologies

- **Node.js**: >=22.22.0 (strict requirement)
- **Package Manager**: PNPM 10+ (always use `pnpm`, never `npm` or `yarn`)
- **Build Tool**: Vite 5.x with HMR
- **Language**: TypeScript 5.9+ (strict mode, no `any`, no `@ts-ignore`)
- **Framework**: React 19

## 3D Graphics Stack

- **Three.js**: v0.182 (core 3D engine)
- **React Three Fiber**: v9.x (React renderer for Three.js)
- **React Three Drei**: v10.x (helpers and abstractions)
- **React Three Rapier**: v2.x (physics)
- **Babylon.js**: v8.46+ (migration in progress, see `docs/BABYLON_MIGRATION_PLAN.md`)

## Game Architecture

- **ECS**: Miniplex v2.0 (entity component system for game logic)
- **State Management**: Zustand v5.0 (UI state, inventory, menus)
- **AI**: Yuka v0.7 (FSM for enemy behavior)
- **Physics**: Rapier (via @react-three/rapier)

## Code Quality Tools

- **Linter/Formatter**: Biome 2.3 (replaces ESLint + Prettier)
- **Testing**: Vitest 4.x (unit tests), Playwright (E2E)
- **Type Checking**: TypeScript strict mode

## Mobile

- **Capacitor**: v8.0 (native wrapper for iOS/Android)
- **Plugins**: Haptics, Motion, ScreenOrientation

## Content Generation

- **AI**: Google Gemini API (narrative, assets)
- **Pipeline**: Custom CLI in `packages/content-gen`

## Common Commands

```bash
# Development
pnpm dev                    # Start dev server (http://localhost:4321)
pnpm --filter @neo-tokyo/game dev

# Building
pnpm build                  # Build all packages
pnpm --filter @neo-tokyo/game build

# Code Quality
pnpm check                  # Run Biome linter + formatter
pnpm check:fix              # Auto-fix issues
pnpm --filter @neo-tokyo/game check

# Testing
pnpm test                   # Run unit tests (Vitest)
pnpm test:e2e               # Run E2E tests (Playwright)
pnpm --filter @neo-tokyo/e2e test:ui  # E2E with UI

# Content Generation (requires GEMINI_API_KEY)
pnpm --filter @neo-tokyo/content-gen generate
```

## Code Style (Biome Config)

- **Indentation**: 2 spaces
- **Line Width**: 100 characters
- **Quotes**: Single quotes (JS/TS), double quotes (JSX)
- **Semicolons**: Always
- **Trailing Commas**: ES5 style
- **Import Organization**: Auto-organize on save
- **Type Imports**: Use `import type` for types

## Path Aliases (Vite)

```typescript
'@' → './src'
'@components' → './src/components'
'@utils' → './src/utils'
'@systems' → './src/systems'
'@state' → './src/state'
```

## Critical Rules

1. Always use `pnpm` (never npm/yarn)
2. Run `pnpm check` before committing
3. No `any` types, no `@ts-ignore` comments
4. Write tests for all game logic systems
5. Use `meshToonMaterial` for cel-shaded visuals
