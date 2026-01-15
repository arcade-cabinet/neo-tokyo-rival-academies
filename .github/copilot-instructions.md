# GitHub Copilot Instructions

This file provides context for GitHub Copilot when suggesting code for the Neo-Tokyo: Rival Academies project.

## Project Overview

**Neo-Tokyo: Rival Academies** is a **3D Action JRPG** (NOT a platformer) built as a **Capacitor-first mobile game** with GenAI content generation:
- **Genre**: Action JRPG with 3-hour narrative experience
- **Platform**: Capacitor-first (Android/iOS native + PWA)
- **Perspective**: FF7-style isometric diorama (cel-shaded 3D)
- **Architecture**: PNPM workspace monorepo (game/content-gen/e2e)
- **Stack**: Vite 6, React 19, Three.js 0.182, React Three Fiber 9, Miniplex ECS, Capacitor 8
- **Tools**: PNPM 10, Biome 2.3, Vitest, Playwright

## Monorepo Structure

```
packages/
├── game/              # Main game (Vite + React + Three.js + Capacitor)
│   ├── src/
│   │   ├── components/react/  # Objects, UI, GameWorld
│   │   ├── systems/           # CombatSystem, ProgressionSystem, DialogueSystem, AISystem
│   │   ├── state/             # ECS (Miniplex) and Zustand
│   │   ├── data/              # story.json (dialogue, quests, lore)
│   │   └── utils/             # Helpers, formulas
│   ├── public/                # Models, textures, audio, portraits
│   └── capacitor.config.ts    # Mobile config
├── content-gen/       # GenAI content generation (Gemini + Imagen)
│   ├── src/
│   │   ├── api/               # Gemini + Imagen API clients
│   │   ├── generators/        # Story, dialogue, background generators
│   │   ├── prompts/           # A/B/C story prompt templates
│   │   └── validators/        # Content structure validation
│   └── output/                # Generated content
└── e2e/               # E2E tests (Playwright)
    └── tests/                 # Gameplay test suites
```

## Core Technologies

### Vite 6 (Build Tool)
- **NOT Astro**: Project migrated from Astro to Vite for better mobile integration
- Fast HMR, ESM-based, optimized builds

### React 19
- ALL UI and game components use React (not just 3D)
- Functional components with TypeScript
- Hooks: useState, useEffect, useMemo, useCallback

### Three.js 0.182 + React Three Fiber 9
- Cel-shaded 3D graphics (meshToonMaterial)
- Declarative 3D via R3F
- Isometric camera perspective (FF7-style)

### Miniplex ECS
- Game architecture: Entities (players, enemies) + Components (stats, position) + Systems (Combat, Progression, Dialogue)
- State lives in `packages/game/src/state/ecs.ts`
- Systems process entities with specific components

### Capacitor 8 (PRIMARY Platform)
- Native Android/iOS apps + PWA
- **Touch-First UX**: ALL interactive elements MUST be 48×48 dp minimum
- No hover-only interactions (use touch events)
- Plugins: Haptics, Storage, StatusBar

### PNPM 10 (Workspaces)
- **ALWAYS use `pnpm`**, NEVER `npm` or `yarn`
- Commands: `pnpm --filter game <command>`

### Biome 2.3 (Linter/Formatter)
- **NOT ESLint or Prettier**
- Commands: `pnpm check`, `pnpm check:fix`

## Code Style & Conventions

### TypeScript (Strict Mode)
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

### Imports (Organized)
```typescript
// Order: type imports → external libraries → local imports
import type { FC } from 'react';
import { useEffect, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box } from '@react-three/drei';

import { useEntities } from '@/state/ecs';
import { calculateDamage } from '@/utils/combat';
import type { Stats } from '@/types';
```

### React Components
```typescript
// ✅ Good - functional component with proper types
import type { FC } from 'react';

interface PlayerProps {
  position: [number, number, number];
  stats: Stats;
}

export const Player: FC<PlayerProps> = ({ position, stats }) => {
  return (
    <mesh position={position}>
      <boxGeometry args={[1, 2, 1]} />
      <meshToonMaterial color="cyan" />
    </mesh>
  );
};

// ❌ Bad - no types
export function Player({ position, stats }) {
  return <mesh position={position} />;
}
```

### ECS System Pattern
```typescript
// Systems process entities and don't render
import { useEffect } from 'react';
import { useEntities } from '../state/ecs';

export function CombatSystem() {
  const players = useEntities('player', 'stats', 'position');
  const enemies = useEntities('enemy', 'stats', 'position');

  useEffect(() => {
    // Process combat logic
    players.forEach((player) => {
      enemies.forEach((enemy) => {
        // Collision detection, damage calculation
      });
    });
  });

  return null; // Systems don't render
}
```

### Touch-First UX
```typescript
// ❌ Bad - hover only
<button className="hover:bg-blue-500">Click</button>

// ✅ Good - touch-friendly
<button
  onTouchStart={handleTouchStart}
  onTouchEnd={handleTouchEnd}
  style={{ minWidth: '48px', minHeight: '48px' }} // 48×48 dp minimum
>
  Click
</button>
```

## JRPG Game Context

### Story Structure (A/B/C Arcs)
- **A-Story**: Main rivalry (Kai vs Vera for Data Core) - linear, action-driven
- **B-Story**: Character development & mystery - revealed through collectibles
- **C-Story**: Event disruptors (Alien Abduction, Mall Drop) - forces team-ups

### RPG Stats (Structure/Ignition/Logic/Flow)
```typescript
interface Stats {
  structure: number; // Health, defense
  ignition: number;  // Melee damage, crit chance
  logic: number;     // Tech damage, hacking
  flow: number;      // Speed, evasion
}
```

### Combat System
```typescript
// Damage formula
function calculateDamage(attacker: Stats, defender: Stats, isCritical: boolean): number {
  const baseDamage = attacker.ignition * 1.5;
  const defense = defender.structure / 2;
  let damage = Math.max(0, baseDamage - defense);

  if (isCritical) {
    damage *= 2; // Critical hit multiplier (max 50% chance)
  }

  return Math.floor(damage);
}
```

### Progression System
```typescript
// Level-up with XP overflow
function levelUp(player: PlayerEntity): void {
  const xpRequired = 100 * Math.pow(player.level, 1.5);

  if (player.xp >= xpRequired) {
    player.level += 1;
    player.xp -= xpRequired; // Carry over excess XP
    player.health = player.stats.structure * 10; // Restore health
    player.statPoints += 3; // Allocate points
  }
}
```

### Dialogue System
```typescript
// Dialogue nodes in packages/game/src/data/story.json
interface DialogueNode {
  id: string;
  speaker: 'Kai' | 'Vera' | string;
  portrait: string; // "kai_neutral", "vera_smirk"
  text: string;
  choices: { text: string; nextNodeId: string }[];
  nextNodeId?: string; // If no choices
}
```

## Common Patterns

### 3D Object with Cel-Shading
```typescript
<mesh position={[0, 0, 0]}>
  <boxGeometry args={[1, 1, 1]} />
  <meshToonMaterial color="cyan" /> {/* Cel-shaded aesthetic */}
</mesh>
```

### Loading 3D Models
```typescript
import { useGLTF } from '@react-three/drei';

export function CharacterModel() {
  const { scene } = useGLTF('/models/character.glb');
  return <primitive object={scene} scale={0.5} />;
}

useGLTF.preload('/models/character.glb');
```

### Animated Object
```typescript
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';

export function RotatingCube() {
  const meshRef = useRef<Mesh>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta;
    }
  });

  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[1, 1, 1]} />
      <meshToonMaterial color="magenta" />
    </mesh>
  );
}
```

### Disposing Three.js Resources
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

## Important Rules

### DO
- ✅ Use PNPM commands (`pnpm --filter game dev`)
- ✅ Use Biome for linting/formatting (`pnpm check`)
- ✅ Use TypeScript with strict mode (no `any`, no `@ts-ignore`)
- ✅ Use Miniplex ECS for game logic
- ✅ Use meshToonMaterial for cel-shaded aesthetic
- ✅ Ensure touch targets are 48×48 dp minimum
- ✅ Dispose Three.js resources in cleanup
- ✅ Use structured prompts for GenAI content generation
- ✅ Validate generated content before exporting

### DON'T
- ❌ Don't use npm or yarn
- ❌ Don't use ESLint or Prettier configs
- ❌ Don't use `any` type or `@ts-ignore`
- ❌ Don't create hover-only interactions (use touch events)
- ❌ Don't forget to dispose Three.js objects (memory leaks)
- ❌ Don't export generated content without validation
- ❌ Don't mutate ECS state directly (use Miniplex update methods)
- ❌ Don't use Astro (project uses Vite)

## Performance Considerations

- Target 60 FPS on mid-range mobile devices
- Use `useMemo` for expensive calculations
- Use instanced meshes for repeated objects
- Implement LOD (Level of Detail) for distant objects
- Compress textures (WebP or compressed formats)
- Profile on real mobile devices (not just desktop)

## Testing

```bash
# Unit tests (Vitest in packages/game)
pnpm --filter game test

# E2E tests (Playwright in packages/e2e)
pnpm --filter e2e test:e2e

# Lint all packages
pnpm check

# Type check
pnpm type-check
```

## GenAI Content Generation (packages/content-gen)

### Gemini Flash 3 (Dialogue, Quests, Lore)
```bash
cd packages/content-gen
pnpm generate:dialogue --arc A --stage neon-district
pnpm validate:all
pnpm export:all
```

### Imagen 4 (Backgrounds, Portraits)
```bash
cd packages/content-gen
pnpm generate:background --stage neon-district --style isometric-cyberpunk
```

## Capacitor Mobile Commands

```bash
cd packages/game

# Sync web assets to native projects
npx cap sync

# Open in IDEs
npx cap open android  # Android Studio
npx cap open ios      # Xcode

# Build and run
npx cap run android
npx cap run ios
```

## Commands Reference

```bash
# Development
pnpm --filter game dev            # Start game dev server
pnpm --filter content-gen dev     # Start content-gen CLI
pnpm --filter e2e test:e2e        # Run E2E tests

# Code Quality
pnpm check                        # Lint all packages
pnpm check:fix                    # Auto-fix issues
pnpm type-check                   # TypeScript check

# Testing
pnpm --filter game test           # Unit tests
pnpm --filter e2e test:e2e        # E2E tests

# Package Management
pnpm add <pkg>                    # Add to root
pnpm --filter game add <pkg>      # Add to game package
pnpm install                      # Install all dependencies
```

## Additional Resources

- **Project Docs**: `AGENTS.md`, `CLAUDE.md`, `GEMINI.md`, `docs/JRPG_TRANSFORMATION.md`
- **Vite**: https://vitejs.dev/
- **R3F**: https://docs.pmnd.rs/react-three-fiber/
- **Three.js**: https://threejs.org/docs/
- **Miniplex**: https://github.com/hmans/miniplex
- **Capacitor**: https://capacitorjs.com/docs
- **Biome**: https://biomejs.dev/
- **Gemini API**: https://ai.google.dev/docs

---

When suggesting code, follow these patterns and conventions to maintain consistency across the codebase. This is a **3D Action JRPG** with **Capacitor-first mobile architecture**, **ECS game logic**, and **GenAI content generation**. Always prioritize **touch-first UX**, **type safety**, and **mobile performance**.
