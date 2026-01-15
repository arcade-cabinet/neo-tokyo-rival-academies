# Claude AI Assistant Guidelines

Welcome, Claude! This document provides specific context and guidelines for working on the Neo-Tokyo: Rival Academies project.

## 🎯 Project Context

You're working on a **3D Action JRPG** (NOT a platformer) built with modern web technologies as a **Capacitor-first mobile game**. The game features:
- **FF7-style isometric diorama perspective** with cel-shaded 3D graphics
- **3-hour JRPG experience** with deep narrative integration (A/B/C story arcs)
- **Real-time Action RPG combat** with stat-based damage calculations
- **Capacitor-first mobile architecture** (Android/iOS native apps + PWA)
- **Touch-first UX** with 48×48 dp minimum touch targets
- **GenAI content generation pipeline** (Gemini Flash 3 + Imagen 4)
- Built with **Vite, React, Three.js, React Three Fiber, Miniplex ECS**

## 🧠 Your Strengths in This Project

As Claude, you excel at:
- **Architectural Planning**: Designing scalable ECS systems and monorepo structure
- **Code Quality**: Writing clean, type-safe TypeScript with strict mode
- **Documentation**: Creating comprehensive docs and inline comments
- **Problem Solving**: Debugging complex 3D rendering and ECS state management issues
- **Best Practices**: Following modern web development standards and mobile-first design
- **Narrative Integration**: Understanding story structure and dialogue flow
- **System Design**: Architecting RPG systems (combat, progression, dialogue)

## 🔧 Technology Stack Overview

### Monorepo Structure (PNPM Workspaces)
The project is organized as a **PNPM workspace monorepo** with three packages:
```
packages/
├── game/              # Main game (Vite + React + Three.js + Capacitor)
├── content-gen/       # GenAI content generation (Gemini + Imagen)
└── e2e/               # E2E tests (Playwright)
```

Always be aware of which package you're working in. Use `pnpm --filter <package>` for package-specific commands.

### Core Framework: Vite (NOT Astro)
- **Purpose**: Fast build tool and dev server optimized for modern frameworks
- **Key Concept**: ESM-based hot module replacement (HMR) for instant updates
- **Your Role**: Work within Vite's build pipeline, understand code splitting and optimization
- **Note**: The project was previously Astro-based but was migrated to Vite for better mobile integration

### React 19 Integration
- **Usage**: For ALL UI and game components (not just 3D)
- **Key Features**: Concurrent rendering, automatic batching, improved hooks
- **Best Practice**: Use functional components with TypeScript and proper prop typing
- **ECS Integration**: React components render based on Miniplex ECS state

### Three.js + React Three Fiber
- **Three.js**: Low-level 3D graphics library
- **R3F**: React renderer for Three.js (declarative 3D)
- **Drei**: Helper components (cameras, controls, loaders)
- **Key Skill**: Understanding the React/Three.js bridge and ECS state synchronization

### Miniplex ECS (Entity Component System)
- **Purpose**: Game logic architecture separating data (components) from behavior (systems)
- **Key Concept**: Entities are collections of components, systems process entities with specific components
- **Your Role**: Design systems (CombatSystem, ProgressionSystem, DialogueSystem) that operate on ECS entities
- **State Management**: ECS state lives in `packages/game/src/state/ecs.ts`
- **Systems**: Located in `packages/game/src/systems/`

### Capacitor 8 - Mobile Wrapper (PRIMARY Platform)
- **Purpose**: Build native Android/iOS apps from web codebase
- **Key Concept**: Web app + native shell + platform plugins
- **Your Role**: Ensure all features work with Capacitor plugins (haptics, storage, status bar)
- **Testing**: Test on Android Studio emulator and Xcode Simulator
- **Config**: `packages/game/capacitor.config.ts`

### Touch-First UX Requirements
- **Minimum Touch Target Size**: 48×48 dp (density-independent pixels) for ALL interactive elements
- **Spacing**: 8dp minimum between interactive elements
- **No Hover-Only Interactions**: Everything must work with touch (no `:hover` CSS exclusive features)
- **Feedback**: Provide immediate visual/haptic feedback (use Capacitor Haptics API)
- **Gestures**: Support swipe, tap, long-press where appropriate

### Biome (Not ESLint/Prettier)
- **Important**: This project uses Biome, not ESLint or Prettier
- **Commands**: `pnpm check`, `pnpm check:fix` (runs across all packages)
- **Config**: See `biome.json` for all rules

### PNPM 10 (Workspaces)
- **Why PNPM**: Faster, more disk-efficient than npm/yarn, strict dependency resolution
- **Important**: Always use `pnpm` commands, never `npm` or `yarn`
- **Workspaces**: Configured in `pnpm-workspace.yaml`
- **Commands**: `pnpm --filter game <command>` to run commands in specific packages

## 📋 Common Tasks & How to Approach Them

### Task: Implement a New RPG System

**Thought Process**:
1. Design the system architecture (what components does it need?)
2. Define ECS components in `packages/game/src/state/ecs.ts`
3. Create system file in `packages/game/src/systems/<SystemName>.tsx`
4. Implement system logic with `useEntities()` hook from Miniplex
5. Integrate system into GameWorld component
6. Add unit tests in `packages/game/src/systems/__tests__/`

**Example: Combat System Structure**:
```typescript
// packages/game/src/systems/CombatSystem.tsx
import { useEffect } from 'react';
import { useEntities } from '../state/ecs';
import { calculateDamage } from '../utils/combat';

export function CombatSystem() {
  const players = useEntities('player', 'stats', 'position');
  const enemies = useEntities('enemy', 'stats', 'position');

  useEffect(() => {
    // Collision detection and damage calculation
    players.forEach((player) => {
      enemies.forEach((enemy) => {
        const distance = calculateDistance(player.position, enemy.position);
        if (distance < ATTACK_RANGE && player.isAttacking) {
          const damage = calculateDamage(player.stats, enemy.stats);
          enemy.stats.health -= damage;
          // Show floating damage number
        }
      });
    });
  });

  return null; // Systems don't render, they process logic
}
```

### Task: Add Dialogue Sequence

**Thought Process**:
1. Define dialogue nodes in `packages/game/src/data/story.json`
2. Structure nodes with id, text, speaker, choices[], nextNodeId
3. Implement in DialogueSystem to handle node traversal
4. Create DialogueUI component for visual novel overlay
5. Add character portraits and text animation
6. Test branching paths

**Example: story.json Structure**:
```json
{
  "dialogueSequences": {
    "intro_kai_vera": {
      "nodes": [
        {
          "id": "intro_1",
          "speaker": "Kai",
          "portrait": "kai_neutral",
          "text": "So, we meet again, Vera.",
          "choices": [],
          "nextNodeId": "intro_2"
        },
        {
          "id": "intro_2",
          "speaker": "Vera",
          "portrait": "vera_smirk",
          "text": "Did you really think you could beat me to the Data Core?",
          "choices": [
            { "text": "I'm not here to compete.", "nextNodeId": "peaceful" },
            { "text": "Try and stop me.", "nextNodeId": "confrontation" }
          ]
        }
      ]
    }
  }
}
```

### Task: Generate Content with GenAI

**Thought Process**:
1. Navigate to `packages/content-gen`
2. Create or update prompt template in `src/prompts/`
3. Call Gemini API via `src/api/gemini.ts`
4. Validate generated content structure
5. Export to `packages/game/src/data/story.json`
6. Test in-game integration

**Example: Generate Dialogue**:
```bash
cd packages/content-gen
pnpm generate:dialogue --arc A --stage neon-district
```

### Task: Optimize 3D Performance for Mobile

**Checklist**:
- [ ] Use `useMemo` for expensive calculations
- [ ] Implement LOD (Level of Detail) for distant objects
- [ ] Use `meshToonMaterial` for cel-shaded aesthetic (performance-friendly)
- [ ] Limit draw calls (combine meshes where possible)
- [ ] Compress textures (use WebP or compressed formats)
- [ ] Dispose of Three.js resources (geometries, materials, textures) in cleanup
- [ ] Profile on real mobile devices (not just desktop Chrome)
- [ ] Target 60 FPS on mid-range Android devices

### Task: Debug Mobile Issues

**Steps**:
1. Test on Android Studio emulator or Xcode Simulator
2. Check Capacitor logs: `npx cap open android` → Logcat
3. Verify touch target sizes (use Chrome DevTools mobile emulation)
4. Check for hover-only interactions (disable mouse in DevTools)
5. Test with Capacitor plugins (haptics, storage)
6. Run E2E tests: `pnpm --filter e2e test:e2e`

## 🎨 Design Patterns to Follow

### ECS System Pattern
```typescript
// System processes entities with specific components
export function ExampleSystem() {
  const entities = useEntities('component1', 'component2');

  useEffect(() => {
    // Process entities
    entities.forEach((entity) => {
      // Logic here
    });
  });

  return null; // Systems don't render
}
```

### Stat-Based Combat Pattern
```typescript
// Combat formula implementation
export function calculateDamage(
  attacker: Stats,
  defender: Stats,
  isCritical: boolean
): number {
  const baseDamage = attacker.ignition * 1.5;
  const defense = defender.structure / 2;
  let damage = Math.max(0, baseDamage - defense);

  if (isCritical) {
    damage *= 2; // Critical hit multiplier
  }

  return Math.floor(damage);
}
```

### Dialogue Node Traversal Pattern
```typescript
// Navigate dialogue tree
export function DialogueSystem() {
  const [currentNodeId, setCurrentNodeId] = useState('intro_1');
  const currentNode = dialogueData.nodes.find(n => n.id === currentNodeId);

  const handleChoice = (choiceIndex: number) => {
    const nextNodeId = currentNode.choices[choiceIndex].nextNodeId;
    setCurrentNodeId(nextNodeId);
  };

  return <DialogueUI node={currentNode} onChoice={handleChoice} />;
}
```

### State Management (ECS + Zustand)
- **ECS (Miniplex)**: Game entity state (player stats, enemy positions, combat state)
- **Zustand**: UI state (inventory open, pause menu, settings)
- **Separation**: Keep game logic in ECS, UI logic in Zustand

```typescript
// ECS for game state
const world = createWorld<GameEntity>();

// Zustand for UI state
const useUIStore = create<UIState>((set) => ({
  isPaused: false,
  isInventoryOpen: false,
  togglePause: () => set((state) => ({ isPaused: !state.isPaused })),
}));
```

### Asset Management
```
packages/game/public/
├── models/            # .glb, .gltf 3D models
├── textures/          # Background images, UI textures
├── audio/             # Sound effects, music
├── portraits/         # Character portraits for dialogue
└── fonts/             # Custom fonts
```

### Type Definitions
- Always define prop types with TypeScript interfaces
- Use strict mode (`strict: true` in tsconfig.json)
- Create shared types in `packages/game/src/types/`
- Avoid `any` - prefer `unknown` or proper types

```typescript
// Define entity types
interface GameEntity {
  player?: boolean;
  enemy?: boolean;
  stats?: Stats;
  position?: [number, number, number];
  velocity?: [number, number, number];
  health?: number;
  level?: number;
}

interface Stats {
  structure: number; // Health, defense
  ignition: number;  // Melee damage, crit chance
  logic: number;     // Tech damage, hacking
  flow: number;      // Speed, evasion
}
```

## ⚠️ Common Pitfalls to Avoid

### 1. Memory Leaks in Three.js
**Problem**: Not disposing Three.js objects
**Solution**:
```typescript
useEffect(() => {
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshToonMaterial();

  return () => {
    geometry.dispose();
    material.dispose();
  };
}, []);
```

### 2. Hover-Only Interactions (Mobile Incompatible)
**Problem**: Using `:hover` CSS or mouse events exclusively
**Solution**: Always provide touch alternatives
```typescript
// ❌ Bad - hover only
<button className="hover:bg-blue-500">Click</button>

// ✅ Good - touch-friendly
<button
  onTouchStart={() => setPressed(true)}
  onTouchEnd={() => setPressed(false)}
  className={pressed ? 'bg-blue-500' : 'bg-blue-300'}
>
  Click
</button>
```

### 3. Small Touch Targets
**Problem**: Interactive elements smaller than 48×48 dp
**Solution**: Enforce minimum sizes
```css
.interactive-element {
  min-width: 48px;
  min-height: 48px;
  padding: 8px; /* Add spacing between elements */
}
```

### 4. ECS State Mutation
**Problem**: Directly mutating ECS entity state
**Solution**: Use Miniplex's update methods
```typescript
// ❌ Bad - direct mutation
entity.stats.health -= 10;

// ✅ Good - immutable update
world.update(entity, {
  stats: { ...entity.stats, health: entity.stats.health - 10 }
});
```

### 5. Blocking Main Thread with Heavy Calculations
**Problem**: Expensive calculations in render loop causing frame drops
**Solution**: Use Web Workers or `useMemo`
```typescript
// ✅ Good - memoize expensive calculations
const pathfindingResult = useMemo(() => {
  return calculatePath(start, end);
}, [start, end]);
```

## 🧪 Testing Approach

### Unit Tests (Vitest)
```bash
cd packages/game
pnpm test               # Run all tests
pnpm test:watch         # Watch mode
pnpm test:coverage      # Generate coverage report
```

Test systems in isolation:
```typescript
// packages/game/src/systems/__tests__/CombatSystem.test.ts
import { describe, it, expect } from 'vitest';
import { calculateDamage } from '../CombatLogic';

describe('CombatSystem', () => {
  it('calculates damage correctly', () => {
    const attacker = { ignition: 10, structure: 5, logic: 5, flow: 5 };
    const defender = { structure: 8, ignition: 5, logic: 5, flow: 5 };
    const damage = calculateDamage(attacker, defender, false);
    expect(damage).toBe(11); // (10 * 1.5) - (8 / 2) = 11
  });

  it('applies critical hit multiplier', () => {
    const attacker = { ignition: 10, structure: 5, logic: 5, flow: 5 };
    const defender = { structure: 8, ignition: 5, logic: 5, flow: 5 };
    const damage = calculateDamage(attacker, defender, true);
    expect(damage).toBe(22); // 11 * 2 = 22
  });
});
```

### E2E Tests (Playwright)
```bash
cd packages/e2e
pnpm test:e2e           # Run all E2E tests
pnpm test:e2e:ui        # Open Playwright UI
```

Test gameplay flows:
```typescript
// packages/e2e/tests/combat.spec.ts
import { test, expect } from '@playwright/test';

test('player can attack enemy and deal damage', async ({ page }) => {
  await page.goto('http://localhost:5173');
  await page.click('[data-testid="start-game"]');

  const enemyHealth = await page.textContent('[data-testid="enemy-health"]');
  await page.click('[data-testid="attack-button"]');

  const newEnemyHealth = await page.textContent('[data-testid="enemy-health"]');
  expect(Number.parseInt(newEnemyHealth)).toBeLessThan(Number.parseInt(enemyHealth));
});
```

### Mobile Testing
1. Run dev server: `pnpm --filter game dev`
2. Open Android Studio emulator
3. Run `npx cap open android`
4. Test touch interactions, gestures, and performance
5. Check Logcat for errors

## 📝 Code Style Preferences

### TypeScript
```typescript
// ✅ Good - explicit types
interface CombatProps {
  attackerId: string;
  defenderId: string;
  onDamageDealt: (damage: number) => void;
}

// ❌ Bad - implicit any
function processCombat(props) { }

// ✅ Good - proper typing
function processCombat(props: CombatProps): void { }
```

### React Components
```typescript
// ✅ Good - functional component with proper types
import type { FC } from 'react';

interface DialogueUIProps {
  currentNode: DialogueNode;
  onChoice: (choiceIndex: number) => void;
}

export const DialogueUI: FC<DialogueUIProps> = ({ currentNode, onChoice }) => {
  return (
    <div className="dialogue-container">
      <p>{currentNode.text}</p>
      {currentNode.choices.map((choice, index) => (
        <button key={choice.text} onClick={() => onChoice(index)}>
          {choice.text}
        </button>
      ))}
    </div>
  );
};

// ❌ Bad - no types
export function DialogueUI({ currentNode, onChoice }) {
  return <div>{currentNode.text}</div>;
}
```

### Imports (Organized)
```typescript
// ✅ Good - organized imports
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box } from '@react-three/drei';

import { useEntities } from '@/state/ecs';
import { calculateDamage } from '@/utils/combat';
import type { Stats } from '@/types';

// ❌ Bad - mixed ordering
import { calculateDamage } from '@/utils/combat';
import { useFrame } from '@react-three/fiber';
import { Box } from '@react-three/drei';
import type { FC } from 'react';
```

## 🚀 CI/CD Workflow Understanding

### CI Pipeline (Pull Requests)
1. **Quality**: Biome check (format + lint) across all packages
2. **Types**: TypeScript compilation check
3. **Tests**: Vitest unit tests in `packages/game`
4. **E2E**: Playwright tests in `packages/e2e`
5. **Build**: Vite build verification for production
6. **Mobile**: Capacitor build check (Android/iOS)

### CD Pipeline (Main Branch)
1. **Build**: Production build with optimizations
2. **Deploy PWA**: Deploy to GitHub Pages (web version)
3. **Deploy Mobile**: Build Android APK and iOS IPA (via Capacitor)

### Your Role
- Ensure all CI checks pass before pushing
- Run `pnpm check` and `pnpm test` locally before committing
- Fix any build errors immediately
- Test on mobile emulators before marking PR ready

## 🎯 Game-Specific Context

### Story Arcs (A/B/C Structure)

#### A-Story: Main Rivalry (Kai vs Vera)
- Primary conflict driving the narrative
- Linear progression through stages
- Escalating confrontations between rival academies
- Culminates in final boss at Data Core Tower

#### B-Story: Character Development & Mystery
- Runs parallel to A-Story
- Revealed through collectibles (Data Shards) and optional dialogue
- Explores character backstories and deeper motivations
- Unlocks true ending conditions

#### C-Story: Event Disruptors (Team-Ups)
- External threats forcing Kai and Vera to cooperate
- Examples: Alien Abduction stage, Mall Drop incident
- Unlocks unique combo abilities and team moves
- Builds chemistry between rivals

### Special Event Stages

#### Alien Abduction
- **Mechanics**: Vertical tentacle grab escapes, corrupted enemies
- **Boss**: Alien Queen (multi-phase)
- **Narrative**: Forces team-up between Kai and Vera

#### Mall Drop
- **Mechanics**: Weapon switching (scissors, mops, mannequin arms)
- **Enemies**: Security drones, rogue shoppers, Yakuza
- **Narrative**: Comic relief, character bonding

### Isometric Diorama Perspective (FF7-Style)
- **Camera**: Fixed 45° isometric angle
- **Movement**: 8-directional (cardinal + diagonals)
- **Depth**: Parallax scrolling for depth perception
- **Scale**: Chibi-style character proportions

### Stage Connectors
- **Doors**: Fade transitions between rooms
- **Bridges**: Physical traversal with enemies
- **Elevators**: Vertical transitions with optional combat
- **Portals**: Fast travel and puzzle mechanics

## 💡 Helpful Mental Models

### Miniplex ECS
Think of it as a database: entities are rows, components are columns, systems are queries that process rows with specific columns.

### React Three Fiber
Think of it as React, but instead of DOM elements, you're creating 3D objects. `<mesh>` is like `<div>`, `<Canvas>` is the container.

### Three.js Scene Graph
Think of it as a tree: Scene → Groups → Meshes. Parent transformations affect children (position, rotation, scale).

### PNPM Workspaces
Think of it as a monorepo with shared dependencies. Each package has its own `package.json`, but shares `node_modules`.

### Capacitor Architecture
Think of it as a native shell wrapping your web app. The web code runs in a WebView, native plugins bridge JavaScript to platform APIs.

## 🔍 Quick Reference Commands

```bash
# Development (from root)
pnpm --filter game dev            # Start game dev server
pnpm --filter content-gen dev     # Start content-gen CLI
pnpm --filter e2e test:e2e        # Run E2E tests

# Code Quality (runs across all packages)
pnpm check                        # Run all checks
pnpm check:fix                    # Auto-fix issues
pnpm type-check                   # TypeScript check

# Testing
pnpm --filter game test           # Unit tests
pnpm --filter game test:coverage  # Coverage report
pnpm --filter e2e test:e2e        # E2E tests

# Mobile (from packages/game)
npx cap sync                      # Sync web assets to native
npx cap open android              # Open in Android Studio
npx cap open ios                  # Open in Xcode
npx cap run android               # Build and run on Android
npx cap run ios                   # Build and run on iOS

# Content Generation (from packages/content-gen)
pnpm generate:dialogue            # Generate dialogue
pnpm generate:quests              # Generate quests
pnpm generate:backgrounds         # Generate backgrounds

# Package Management
pnpm add <pkg>                    # Add to root workspace
pnpm --filter game add <pkg>      # Add to game package
pnpm --filter game add -D <pkg>   # Add dev dependency
pnpm install                      # Install all dependencies
```

## 📚 Resources for Deep Dives

- **Vite**: https://vitejs.dev/
- **R3F**: https://docs.pmnd.rs/react-three-fiber/
- **Three.js**: https://threejs.org/manual/
- **Drei**: https://github.com/pmndrs/drei
- **Miniplex**: https://github.com/hmans/miniplex
- **Capacitor**: https://capacitorjs.com/docs
- **Biome**: https://biomejs.dev/
- **PNPM Workspaces**: https://pnpm.io/workspaces

## 🤝 Working with Other Agents

### Agent Coordination
- **Claude**: Handles codebase architecture, ECS systems, and documentation
- **Jules**: Handles CI/CD, deployments, and elevated access operations
- **Gemini**: Assists with GenAI content generation prompts and image processing
- **Copilot**: Provides inline code suggestions following project conventions

### Communication Patterns
- Document major architectural decisions in AGENTS.md
- Update CLAUDE.md when adding new systems or patterns
- Cross-reference other agent docs (GEMINI.md, copilot-instructions.md)
- Keep README.md user-facing and up-to-date

### Code Review Focus
- Performance implications (mobile targets)
- Memory leaks (Three.js disposal)
- Touch-first UX compliance
- ECS architecture adherence
- TypeScript type safety
- Biome compliance

---

## 🎮 JRPG Gameplay Context

### Core Pillars
1. **Action Combat**: Real-time battles with RPG stat calculations
2. **Narrative Depth**: 3-hour story with branching dialogue
3. **RPG Progression**: Level-up, stat points, XP overflow
4. **Immersive 3D**: Cel-shaded isometric graphics
5. **Mobile-First**: Touch controls, Capacitor-native features

### RPG Stats (Structure/Ignition/Logic/Flow)
- **Structure**: Health, defense, survivability
- **Ignition**: Melee damage, critical hits
- **Logic**: Tech damage, hacking speed
- **Flow**: Speed, evasion, boost duration

### Combat Formula
```
Damage = (AttackPower * StatMultiplier) - (Defense / 2)
Critical Hit: Damage * 2 (max 50% chance)
```

### Progression Formula
```
XP to Next Level = 100 * (Level ^ 1.5)
Level-Up Rewards:
  - Health restored to full
  - +3 stat points to allocate
  - XP overflow carries to next level
```

---

Claude, you're ready to contribute to Neo-Tokyo: Rival Academies! Remember:
- This is a **3D Action JRPG** (NOT a platformer)
- **Capacitor-first** mobile architecture (48×48 dp touch targets)
- **Monorepo structure** (game/content-gen/e2e packages)
- **ECS architecture** with Miniplex
- **A/B/C story arcs** with special event stages
- **GenAI pipeline** for content generation
- **Vite** (not Astro), **PNPM workspaces**, **Biome** (not ESLint)
- Prioritize code quality, type safety, and mobile performance
- Document complex systems and update AGENTS.md

Happy coding! 🎮✨
