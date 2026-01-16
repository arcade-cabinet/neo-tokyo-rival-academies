# Project Structure & Organization

## Monorepo Architecture

Neo-Tokyo: Rival Academies uses a PNPM workspace monorepo with 3 specialized packages:

```
packages/
├── game/              # Main game application (Vite + React)
├── content-gen/       # GenAI content generation CLI
└── e2e/              # Playwright end-to-end tests
```

## Documentation Structure

**Essential reading order**:

1. **`AGENTS.md`** - AI agent guidelines and critical rules
2. **`docs/JRPG_TRANSFORMATION.md`** - Core game design and mechanics
3. **`docs/ARCHITECTURE.md`** - System architecture and data flow
4. **`docs/TESTING_STRATEGY.md`** - Testing approach and standards
5. **`docs/BABYLON_MIGRATION_PLAN.md`** - Ongoing migration from Three.js to Babylon.js

**Additional docs**:
- **Game Design**: `docs/COMBAT_PROGRESSION.md`, `docs/QUEST_SYSTEM.md`, `docs/NARRATIVE_DESIGN.md`
- **Technical**: `docs/TECH_ARCHITECTURE.md`, `docs/GENAI_PIPELINE.md`, `docs/PERSISTENCE.md`
- **UI/UX**: `docs/UI_DESIGN_SYSTEM.md`, `docs/MOBILE_WEB_GUIDE.md`
- **Project Management**: `docs/PHASE_ROADMAP.md`, `docs/PROJECT_EVOLUTION.md`

## Game Package Structure (`packages/game/`)

```
packages/game/src/
├── components/react/          # React components
│   ├── game/                 # Game world managers
│   │   ├── GameWorld.tsx     # Main game loop and ECS orchestration
│   │   ├── ParallaxBackground.tsx
│   │   ├── MallBackground.tsx
│   │   └── SpaceshipBackground.tsx
│   ├── objects/              # 3D game objects
│   │   ├── Character.tsx     # Player character renderer
│   │   ├── Enemy.tsx         # Enemy renderer
│   │   ├── Platform.tsx      # Platform/terrain
│   │   ├── Obstacle.tsx      # Interactive obstacles
│   │   └── DataShard.tsx     # Collectibles
│   ├── scenes/               # Scene compositions
│   │   ├── WelcomeScene.tsx  # Main menu
│   │   ├── SideScrollScene.tsx
│   │   ├── IsometricScene.tsx
│   │   └── NeoTokyoGame.tsx  # Main game scene
│   └── ui/                   # HUD and UI overlays
│       ├── MainMenu.tsx      # Main menu UI
│       ├── GameHUD.tsx       # In-game HUD
│       ├── JRPGHUD.tsx       # JRPG-style HUD
│       ├── NarrativeOverlay.tsx  # Dialogue system
│       ├── CombatText.tsx    # Floating damage numbers
│       └── SplashScreen.tsx  # Loading screen
│
├── systems/                   # ECS game logic systems
│   ├── PhysicsSystem.tsx     # Movement, collision, gravity
│   ├── CombatSystem.tsx      # Combat interactions
│   ├── CombatLogic.ts        # Damage calculations
│   ├── AISystem.ts           # Enemy AI (Yuka FSM)
│   ├── InputSystem.tsx       # Player input handling
│   ├── DialogueSystem.ts     # Narrative triggers
│   ├── ProgressionSystem.ts  # XP, leveling, stats
│   ├── SaveSystem.ts         # Save/load game state
│   ├── StageSystem.ts        # Stage/level management
│   └── __tests__/            # System unit tests
│
├── state/                     # Global state management
│   ├── ecs.ts                # Miniplex ECS world and entities
│   └── gameStore.ts          # Zustand UI state (menus, inventory)
│
├── content/                   # Game content data
│   ├── stages.ts             # Stage definitions
│   └── story/                # Story content
│       └── manifest.json     # Story asset manifest
│
├── data/                      # Static game data (JSON)
│   ├── story.json            # Hand-crafted story data
│   └── story_gen.json        # AI-generated story content
│
├── types/                     # TypeScript type definitions
│   └── game.ts               # Core game types (Entity, Stats, etc.)
│
├── utils/                     # Utility functions
│   ├── gameConfig.ts         # Game configuration constants
│   ├── hex-grid.ts           # Hex grid utilities
│   └── hex-normalizer.ts     # Coordinate normalization
│
├── main.tsx                   # Application entry point
├── index.css                  # Global styles
└── env.d.ts                   # Environment type definitions

public/                        # Static assets
├── assets/
│   ├── characters/           # Character 3D models and animations
│   │   ├── main/            # Kai, Vera (protagonists)
│   │   ├── b-story/         # Bikers, Yakuza (antagonists)
│   │   └── c-story/         # Aliens, Mall Security
│   ├── backgrounds/          # Background layers
│   │   └── sector0/         # Rooftop scene backgrounds
│   ├── tiles/               # Environment tiles
│   │   └── rooftop/         # Rooftop tile assets
│   └── story/               # Story cutscene images
└── ui/                       # UI assets
```

## Content Generation Package (`packages/content-gen/`)

```
packages/content-gen/src/
├── api/
│   └── meshy-client.ts       # Meshy API integration (3D generation)
│
├── game/
│   ├── generators/
│   │   └── story.ts          # Story content generator
│   └── prompts/
│       └── index.ts          # Game-specific prompts
│
├── ui/
│   ├── generators/
│   │   └── assets.ts         # UI asset generator
│   └── prompts/
│       └── index.ts          # UI-specific prompts
│
├── pipelines/                 # Multi-step generation pipelines
│   ├── definitions/
│   │   ├── character.pipeline.json
│   │   └── prop.pipeline.json
│   ├── pipeline-executor.ts
│   └── pipeline.schema.json
│
├── tasks/                     # Individual generation tasks
│   ├── definitions/          # Task configuration files
│   │   ├── text-to-3d-preview.json
│   │   ├── text-to-3d-refine.json
│   │   ├── text-to-image.json
│   │   ├── rigging.json
│   │   └── animation.json
│   ├── executor.ts           # Task execution engine
│   ├── registry.ts           # Task registry
│   └── types.ts              # Task type definitions
│
├── types/
│   └── manifest.ts           # Asset manifest types
│
├── utils/
│   └── migration.ts          # Asset migration utilities
│
├── AssetGen.ts               # Main asset generation class
├── MusicSynth.ts             # Music generation
├── cli.ts                    # CLI entry point
└── index.ts                  # Package exports
```

## E2E Testing Package (`packages/e2e/`)

```
packages/e2e/
├── tests/
│   └── gameplay.spec.ts      # Gameplay E2E tests
├── playwright.config.ts      # Playwright configuration
└── test-results/             # Test output and screenshots
```

## Asset Organization

### Character Assets
Each character follows this structure:
```
characters/{category}/{faction}/{role}/
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
backgrounds/{location}/{layer}/
├── concept.png              # Concept art
└── manifest.json           # Layer metadata
```

### Tile Assets
```
tiles/{tileset}/{variant}/
├── concept.png             # Concept art
├── model.glb              # 3D model (if applicable)
└── manifest.json          # Tile metadata
```

## Configuration Files

### Root Level
- **`package.json`** - Root workspace configuration
- **`pnpm-workspace.yaml`** - PNPM workspace definition
- **`biome.json`** - Linter/formatter configuration
- **`vitest.config.ts`** - Root test configuration
- **`.nvmrc`** - Node version specification (22.22.0)
- **`.npmrc`** - NPM configuration

### Game Package
- **`vite.config.ts`** - Vite build configuration with path aliases
- **`tsconfig.json`** - TypeScript configuration (strict mode)
- **`capacitor.config.ts`** - Capacitor mobile configuration

### Content Gen Package
- **`tsconfig.json`** - TypeScript configuration
- **`package.json`** - CLI scripts and dependencies

## Key Conventions

### File Naming
- **Components**: PascalCase with `.tsx` extension (`GameWorld.tsx`)
- **Systems**: PascalCase with `.ts` or `.tsx` (`CombatSystem.tsx`)
- **Utilities**: camelCase with `.ts` extension (`gameConfig.ts`)
- **Types**: camelCase with `.ts` extension (`game.ts`)
- **Tests**: Same name as source with `.test.ts` suffix (`CombatSystem.test.ts`)

### Import Patterns
- **Path aliases**: Use `@/`, `@components/`, `@systems/`, `@state/`, `@utils/`
- **Type imports**: Use `import type` for type-only imports
- **Workspace packages**: Use `@neo-tokyo/package-name`

### Component Organization
- **3D Objects**: `components/react/objects/` - render individual game entities
- **Scenes**: `components/react/scenes/` - compose objects into playable scenes
- **Game Managers**: `components/react/game/` - orchestrate game loop and systems
- **UI**: `components/react/ui/` - HUD, menus, overlays

### System Organization
- **Logic only**: Systems contain pure game logic, no rendering
- **ECS-driven**: Systems read/write to Miniplex ECS world
- **Testable**: All systems have corresponding test files
- **Single responsibility**: Each system handles one aspect of gameplay

## Development Workflow

1. **Check documentation**: Read relevant docs in `docs/` before starting
2. **Understand ECS state**: Review `src/state/ecs.ts` for entity structure
3. **Follow architecture**: Game logic in systems, rendering in components
4. **Write tests first**: Create test file before implementing system logic
5. **Use path aliases**: Import with `@/` instead of relative paths
6. **Run quality checks**: `pnpm check` before committing
7. **Verify tests**: `pnpm test` to ensure nothing breaks

## Current Development Focus

**Active Migration**: Three.js → Babylon.js (see `docs/BABYLON_MIGRATION_PLAN.md`)
- Reactylon integration for React + Babylon.js
- Maintaining cel-shaded visual style
- Preserving ECS architecture

**Priority Systems**:
1. Combat system refinement (damage calculations, break system)
2. Progression system (XP, leveling, stat allocation)
3. Dialogue system (visual novel overlays)
4. Save/load system (persistent game state)

## Performance Targets

| Metric | Target |
|--------|--------|
| Bundle Size | <2MB gzipped |
| Initial Load | <3s on 3G |
| Frame Rate | 60 FPS (mobile) |
| Memory Usage | <200MB (mobile) |
| Asset Load Time | <500ms per character |
