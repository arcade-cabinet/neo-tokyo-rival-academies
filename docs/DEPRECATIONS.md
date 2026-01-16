# Deprecations & Ignore Guide

> **Purpose**: Prevent agents and developers from using deprecated patterns, dead libraries, or anti-patterns that would harm the project.

## Deprecated Technologies

### YukaJS (DEAD - DO NOT USE)
- **Status**: Unmaintained, replaced
- **Replacement**: BabylonJS Navigation Plugin V2 (`@babylonjs/addons`)
- **Why**: Native RecastJS integration, crowd simulation, better performance

```typescript
// WRONG - Don't do this
import { SteeringBehavior } from 'yuka';

// CORRECT - Use Navigation Plugin V2
import * as ADDONS from '@babylonjs/addons';
const navigationPlugin = await ADDONS.CreateNavigationPluginAsync();
```

### Vanilla Babylon.js (AVOID)
- **Status**: Use Reactylon wrapper instead
- **Replacement**: `reactylon` package
- **Why**: Declarative React composition, auto-disposal, better DX

```typescript
// WRONG - Imperative Babylon
const mesh = new BABYLON.MeshBuilder.CreateBox('box', {}, scene);

// CORRECT - Reactylon declarative
<box name="box" options={{ size: 1 }} />
```

### react-babylonjs (WRONG PACKAGE)
- **Status**: Different package, wrong imports
- **Replacement**: `reactylon` (correct package)
- **Why**: Reactylon is the maintained custom renderer

```typescript
// WRONG - Different package
import { Engine, Scene } from 'react-babylonjs';

// CORRECT - Reactylon
import { Engine } from 'reactylon/web';
import { Scene, useScene } from 'reactylon';
```

## Deprecated Patterns

### Runtime GenAI Calls
- **Status**: NEVER do this
- **Why**: Battery drain, latency, non-deterministic results
- **Correct Pattern**: Build-time generation via `pnpm generate` CLI

```typescript
// WRONG - Runtime API call
const model = await meshyApi.generateModel(prompt);

// CORRECT - Pre-generated asset
const { scene } = useGLTF('/assets/characters/main/kai/rigged.glb');
```

### Math.random() for Procedural Content
- **Status**: Deprecated for world/quest generation
- **Replacement**: `seedrandom` for deterministic RNG
- **Why**: Reproducible playthroughs for testing and debugging

```typescript
// WRONG - Non-deterministic
const height = Math.random() * 100;

// CORRECT - Seeded
import seedrandom from 'seedrandom';
const rng = seedrandom('district-3-seed');
const height = rng() * 100;
```

### ESLint / Prettier
- **Status**: Not used in this project
- **Replacement**: Biome
- **Why**: Single tool, faster, consistent

```bash
# WRONG
npm run lint
npx eslint .
npx prettier --write .

# CORRECT
pnpm check
```

### npm / yarn
- **Status**: Not used
- **Replacement**: pnpm
- **Why**: Workspace support, faster installs, monorepo-native

```bash
# WRONG
npm install
yarn add

# CORRECT
pnpm install
pnpm add
```

## Deprecated File Patterns

### Direct /public/assets/ References
- **Status**: Use /assets/ path prefix
- **Why**: Astro/Vite serves from public root

```typescript
// WRONG
useGLTF('/public/assets/characters/main/kai/rigged.glb');

// CORRECT
useGLTF('/assets/characters/main/kai/rigged.glb');
```

### Inline Styles for Complex Layouts
- **Status**: Avoid for HUD/responsive elements
- **Replacement**: CSS modules or canvas-based rendering
- **Why**: DOM overhead on mobile

## Deprecated Architecture Patterns

### Three.js for New Development
- **Status**: Existing prototype only, do not extend
- **Why**: Migrating to Babylon.js via Reactylon for NavMesh and physics
- **Note**: SideScrollScene.tsx and IsometricScene.tsx are legacy prototypes

### Component-Level State for Game Data
- **Status**: Use Zustand stores
- **Why**: Cross-component access, persistence hooks

```typescript
// WRONG - Local state for global data
const [alignment, setAlignment] = useState(0);

// CORRECT - Zustand store
const { alignment, shiftAlignment } = useQuestStore();
```

## Files to Ignore (Reference Only)

| File | Status | Purpose |
|------|--------|---------|
| `SideScrollScene.tsx` | Prototype | Evaluation only, not production |
| `IsometricScene.tsx` (Three.js) | Prototype | Evaluation, migrating to Reactylon |
| `docs/Grok-*.md` | Source | Conversation archives, not executable |

## Migration Checklist

When encountering deprecated patterns:

1. Check this document first
2. Find the correct replacement
3. Update the code to use modern pattern
4. Test on Pixel 8a baseline

---

*When in doubt, ask: "Is this the Reactylon + seedrandom + Zustand way?"*
