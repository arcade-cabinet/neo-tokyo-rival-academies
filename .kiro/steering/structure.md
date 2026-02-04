# Project Structure & Organization

> **Updated**: February 3, 2026 | **Platform**: Ionic Angular + Babylon.js

## ⚠️ Critical Architecture Notes

**Stack**: Ionic Angular + Babylon.js + Capacitor
- Code lives in `src/` (NOT `packages/game/` which is deleted)
- Babylon.js is imperative (NOT React-based, NOT Reactylon)
- All planning in memory-bank (NOT GitHub Issues)

## Current Directory Structure

```
neo-tokyo/
├── src/                       # Main application source
│   ├── app/                   # Angular application
│   │   ├── engine/           # Babylon.js scene services
│   │   ├── game-shell/       # Game container component
│   │   ├── state/            # Angular state services
│   │   ├── systems/          # Game logic systems
│   │   ├── ui/               # Angular UI components
│   │   └── utils/            # Helpers
│   ├── lib/                   # Shared libraries
│   │   ├── core/             # Shared ECS logic
│   │   ├── diorama/          # Legacy diorama (reference)
│   │   └── world-gen/        # World generation
│   ├── assets/               # Game assets
│   └── environments/         # Angular environments
├── e2e/                       # Playwright E2E tests
├── docs/                      # Documentation
│   ├── 00-golden/            # Canonical specs (source of truth)
│   ├── design/               # Design documents
│   ├── gameplay/             # Gameplay mechanics
│   ├── legacy/               # Archived docs
│   ├── procedural/           # Procedural generation
│   ├── process/              # Process docs
│   ├── story/                # Story content
│   ├── tech/                 # Technical docs
│   └── world/                # World building
├── memory-bank/               # Planning & tracking (source of truth)
├── _legacy/                   # Archived legacy code
└── .kiro/                     # Kiro specs and steering
```

## Documentation Structure

**Essential reading order**:

1. **`AGENTS.md`** - AI agent guidelines and critical rules
2. **`docs/00-golden/GOLDEN_RECORD_MASTER.md`** - Canonical game spec
3. **`docs/00-golden/MOBILE_WEB_GUIDE.md`** - Mobile-first constraints
4. **`docs/00-golden/PHASE_ROADMAP.md`** - Timeline and milestones
5. **`docs/00-golden/DEPRECATIONS.md`** - What to ignore

**Memory Bank (Planning)**:
- **`memory-bank/activeContext.md`** - Current focus and active work
- **`memory-bank/progress.md`** - Completed work history
- **`memory-bank/parity-assessment.md`** - Legacy porting status
- **`memory-bank/parity-matrix.md`** - Component mapping

## Application Structure (`src/app/`)

```
src/app/
├── engine/                    # Babylon.js services
│   ├── babylon-scene.service.ts    # Scene management
│   ├── character-loader.service.ts # Character loading
│   ├── animation-controller.ts     # Animation system
│   ├── quest-marker-manager.ts     # Quest markers
│   ├── data-shard-manager.ts       # Collectibles
│   ├── player-controller.ts        # Player input
│   └── compounds/                  # Building assemblies
│       ├── building.compound.ts
│       ├── bridge.compound.ts
│       └── street.compound.ts
│
├── game-shell/                # Main game container
│   └── game-shell.component.ts
│
├── state/                     # Angular state services
│   ├── game-state.service.ts      # Game state
│   ├── player-store.service.ts    # Player data
│   ├── dialogue.service.ts        # Dialogue system
│   ├── quest.service.ts           # Quest tracking
│   └── settings.service.ts        # User settings
│
├── systems/                   # Game logic systems
│   ├── combat-system.ts           # Combat logic
│   ├── progression-system.ts      # XP/leveling
│   ├── ai-system.ts               # Enemy AI
│   └── physics-system.ts          # Movement/collision
│
├── ui/                        # Angular UI components
│   ├── main-menu/                 # Main menu
│   ├── game-hud/                  # In-game HUD
│   ├── jrpg-hud/                  # JRPG-style HUD
│   ├── narrative-overlay/         # Dialogue system
│   ├── quest-log/                 # Quest tracking
│   ├── inventory-screen/          # Inventory
│   ├── settings-overlay/          # Settings
│   └── combat-text/               # Floating damage
│
└── utils/                     # Utility functions
    ├── game-config.ts             # Configuration
    ├── hex-grid.ts                # Hex utilities
    └── seed-phrase.ts             # Seed generation
```

## Shared Libraries (`src/lib/`)

```
src/lib/
├── core/                      # Shared ECS logic
│   └── src/
│       ├── state/            # ECS world and entities
│       │   └── ecs.ts
│       ├── systems/          # Core game systems
│       └── types/            # TypeScript types
│
├── diorama/                   # Legacy diorama (reference only)
│   └── src/
│       └── components/       # Legacy React components
│
└── world-gen/                 # World generation
    └── src/
        ├── flooded-world-builder.ts
        └── kits/             # Prop generation kits
            ├── maritime-kit.ts
            ├── vegetation-kit.ts
            ├── furniture-kit.ts
            └── signage-kit.ts
```

## E2E Testing (`e2e/`)

```
e2e/
├── tests/
│   ├── canal.spec.ts         # Canal scene tests
│   └── gameplay.spec.ts      # Gameplay tests
├── playwright.config.ts      # Playwright config
└── test-results/             # Test output
```

## Asset Organization

### Character Assets
```
src/assets/characters/{category}/{faction}/{role}/
├── animations/               # GLB animation files
│   ├── combat_stance.glb
│   ├── runfast.glb
│   ├── kung_fu_punch.glb
│   ├── behit_flyup.glb
│   └── dead.glb
└── manifest.json            # Character metadata
```

**Categories**: `main`, `b-story`, `c-story`
**Factions**: `kai`, `vera`, `bikers`, `yakuza`, `aliens`, `mall-security`
**Roles**: `boss`, `grunt`, `humanoid`, `guard`

### Background Assets
```
src/assets/backgrounds/{location}/{layer}/
├── concept.png              # Concept art
└── manifest.json           # Layer metadata
```

### Tile Assets
```
src/assets/tiles/{tileset}/{variant}/
├── concept.png             # Concept art
├── model.glb              # 3D model
└── manifest.json          # Tile metadata
```

## Configuration Files

### Root Level
- **`package.json`** - Root configuration
- **`angular.json`** - Angular CLI configuration
- **`biome.json`** - Linter/formatter configuration
- **`capacitor.config.ts`** - Capacitor mobile configuration
- **`karma.conf.js`** - Karma test configuration
- **`.nvmrc`** - Node version specification (22.22.0)
- **`.npmrc`** - NPM configuration

### TypeScript
- **`tsconfig.json`** - Base TypeScript configuration
- **`tsconfig.app.json`** - App-specific config
- **`tsconfig.spec.json`** - Test-specific config

## Key Conventions

### File Naming
- **Components**: kebab-case with `.component.ts` (`game-hud.component.ts`)
- **Services**: kebab-case with `.service.ts` (`game-state.service.ts`)
- **Systems**: kebab-case with `.ts` (`combat-system.ts`)
- **Tests**: Same name with `.spec.ts` suffix (`combat-system.spec.ts`)

### Import Patterns
- **Type imports**: Use `import type` for type-only imports
- **Relative imports**: Use relative paths within modules
- **Barrel exports**: Use `index.ts` for public APIs

### Component Organization
- **Engine**: Babylon.js scene services and managers
- **State**: Angular services for state management
- **Systems**: Pure game logic, no rendering
- **UI**: Angular components for HUD and overlays

## Development Workflow

1. **Read memory-bank**: Check `activeContext.md` before starting
2. **Check Golden Record**: Review `docs/00-golden/` for requirements
3. **Follow architecture**: Game logic in systems, rendering in components
4. **Write tests**: Create test file for new functionality
5. **Run quality checks**: `pnpm check` before committing
6. **Verify tests**: `pnpm test --watch=false` to ensure nothing breaks
7. **Update memory-bank**: Record progress in `progress.md`

## DELETED Directories (Do NOT Reference)

These directories no longer exist and should not be referenced:

- ❌ `packages/game/` - Deleted (was React/Vite)
- ❌ `packages/e2e/` - Moved to `e2e/`
- ❌ `apps/` - Archived to `_legacy/apps/`

## DEPRECATED Technologies (Do NOT Use)

- ❌ React / React Three Fiber
- ❌ Reactylon
- ❌ Three.js
- ❌ Vite (for main app)

## Performance Targets

| Metric | Target |
|--------|--------|
| Bundle Size | <2MB gzipped |
| Initial Load | <3.5s to interactive |
| Frame Rate | 60 FPS (Pixel 8a) |
| Memory Usage | <200MB (mobile) |
| Asset Load Time | <500ms per character |
