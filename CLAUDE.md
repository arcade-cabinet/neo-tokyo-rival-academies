# Claude AI Assistant Guidelines

Welcome, Claude! This document provides specific context and guidelines for working on the Neo-Tokyo: Rival Academies project.

## 🎯 Project Context

You're working on a **3D platformer game** built with modern web technologies. The game runs in the browser and features:
- Neon cyberpunk aesthetic
- Fast-paced platforming action
- Multiple rival academies with unique characteristics
- Built with Astro, React, Three.js, and React Three Fiber

## 🧠 Your Strengths in This Project

As Claude, you excel at:
- **Architectural Planning**: Designing scalable component structures
- **Code Quality**: Writing clean, type-safe TypeScript
- **Documentation**: Creating comprehensive docs and comments
- **Problem Solving**: Debugging complex 3D rendering issues
- **Best Practices**: Following modern web development standards

## 🔧 Technology Stack Overview

### Core Framework: Astro
- **Purpose**: Static site generation with partial hydration
- **Key Concept**: Island architecture - only hydrate interactive parts
- **Your Role**: Help structure pages and layouts efficiently

### React Integration
- **Usage**: For interactive 3D components only
- **Directive**: Use `client:load` or `client:idle` for 3D Canvas components
- **Best Practice**: Keep React usage minimal, Astro handles the rest

### Three.js + React Three Fiber
- **Three.js**: Low-level 3D graphics library
- **R3F**: React renderer for Three.js (declarative 3D)
- **Drei**: Helper components (cameras, controls, loaders)
- **Key Skill**: Understanding the React/Three.js bridge

### Biome (Not ESLint/Prettier)
- **Important**: This project uses Biome, not ESLint or Prettier
- **Commands**: `pnpm lint`, `pnpm format`, `pnpm check`
- **Config**: See `biome.json` for all rules

### PNPM 10
- **Why PNPM**: Faster, more disk-efficient than npm/yarn
- **Important**: Always use `pnpm` commands, never `npm` or `yarn`
- **Workspaces**: Configured in `pnpm-workspace.yaml`

## 📋 Common Tasks & How to Approach Them

### Task: Create a New 3D Scene Component

**Thought Process**:
1. Create component in `src/components/react/scenes/`
2. Use React Three Fiber's Canvas as root
3. Add lighting, camera controls from Drei
4. Implement game objects as React components
5. Use hooks for animation (useFrame)
6. Memoize expensive calculations

**Example Structure**:
```typescript
import type { FC } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';

export const GameScene: FC = () => {
  return (
    <Canvas camera={{ position: [0, 5, 10], fov: 75 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      {/* Game objects here */}

      <OrbitControls />
      <Environment preset="city" />
    </Canvas>
  );
};
```

### Task: Add a New Astro Page

**Thought Process**:
1. Create `.astro` file in `src/pages/`
2. Import layout from `src/layouts/`
3. Add React 3D component with proper client directive
4. Keep metadata in frontmatter

**Example**:
```astro
---
import Layout from '@layouts/Layout.astro';
import { GameScene } from '@components/react/scenes/GameScene';

const title = "Neo-Tokyo Academy";
---

<Layout title={title}>
  <GameScene client:load />
</Layout>
```

### Task: Optimize 3D Performance

**Checklist**:
- [ ] Use `useMemo` for expensive calculations
- [ ] Implement LOD (Level of Detail) for distant objects
- [ ] Use instanced meshes for repeated objects
- [ ] Compress textures appropriately
- [ ] Dispose of Three.js resources (geometries, materials, textures)
- [ ] Use `useFrame` efficiently (avoid heavy logic)
- [ ] Consider using `<Suspense>` for loading states

### Task: Debug Build Issues

**Steps**:
1. Check Biome for linting errors: `pnpm check`
2. Verify TypeScript compilation: `pnpm type-check`
3. Clear cache: `rm -rf .astro node_modules/.cache`
4. Reinstall dependencies: `pnpm install`
5. Check Astro config for correct base path
6. Verify Three.js SSR settings in `astro.config.mjs`

## 🎨 Design Patterns to Follow

### Component Structure
```
src/components/react/
├── scenes/          # Full 3D scenes with Canvas
├── objects/         # Individual 3D objects (meshes, groups)
├── ui/              # UI overlays (HUD, menus)
└── game/            # Game logic (controllers, managers)
```

### State Management
- Use React hooks for local state
- Consider Zustand for global game state (if needed later)
- Keep 3D state separate from UI state

### Asset Management
```
public/
├── models/          # .glb, .gltf files
├── textures/        # Images for materials
├── audio/           # Sound effects, music
└── fonts/           # Custom fonts
```

### Type Definitions
- Always define prop types
- Use TypeScript strict mode
- Create shared types in `src/types/`
- Avoid `any` - prefer `unknown` or proper types

## ⚠️ Common Pitfalls to Avoid

### 1. Memory Leaks
**Problem**: Not disposing Three.js objects
**Solution**:
```typescript
useEffect(() => {
  return () => {
    geometry.dispose();
    material.dispose();
    texture.dispose();
  };
}, []);
```

### 2. SSR Issues
**Problem**: Three.js code running during SSR
**Solution**: Use `client:load` directive or check for `window`

### 3. Performance Issues
**Problem**: Too many draw calls, unoptimized meshes
**Solution**: Use instancing, LOD, and proper culling

### 4. Import Errors
**Problem**: Wrong import paths
**Solution**: Use path aliases: `@/`, `@components/`, etc.

## 🧪 Testing Approach

### Manual Testing
1. Run `pnpm dev` and open browser
2. Check console for errors
3. Monitor performance (Chrome DevTools)
4. Test on different devices/browsers
5. Verify 3D rendering is smooth (60 FPS target)

### Automated Testing (Future)
- Unit tests for utilities
- Component tests for React components
- E2E tests for game flows

## 📝 Code Style Preferences

### TypeScript
```typescript
// ✅ Good - explicit types
interface PlayerProps {
  position: [number, number, number];
  velocity: number;
}

// ❌ Bad - implicit any
function movePlayer(props) { }

// ✅ Good - proper typing
function movePlayer(props: PlayerProps): void { }
```

### React Components
```typescript
// ✅ Good - functional component with proper types
export const Player: FC<PlayerProps> = ({ position, velocity }) => {
  return <mesh position={position} />;
};

// ❌ Bad - no types
export function Player({ position, velocity }) {
  return <mesh position={position} />;
}
```

### Imports
```typescript
// ✅ Good - organized imports
import type { FC } from 'react';
import { useFrame } from '@react-three/fiber';
import { Box } from '@react-three/drei';

import { calculateVelocity } from '@utils/physics';

// ❌ Bad - mixed ordering
import { calculateVelocity } from '@utils/physics';
import { useFrame } from '@react-three/fiber';
import { Box } from '@react-three/drei';
import type { FC } from 'react';
```

## 🚀 CI/CD Workflow Understanding

### CI Pipeline (Pull Requests)
1. **Quality**: Biome check (format + lint)
2. **Types**: TypeScript compilation
3. **Build**: Astro build verification
4. **Artifacts**: Store build output

### CD Pipeline (Main Branch)
1. **Build**: Production build with correct base path
2. **Deploy**: Automatic to GitHub Pages
3. **URL**: `https://arcade-cabinet.github.io/neo-tokyo-rival-academies`

### Your Role
- Ensure code passes all CI checks before committing
- Run `pnpm check` locally before pushing
- Fix any build errors immediately

## 🎯 Project Goals & Priorities

### Phase 1: Foundation (Current)
- [x] Project scaffolding
- [ ] Basic 3D scene setup
- [ ] Character controller
- [ ] Camera system
- [ ] First level design

### Phase 2: Core Gameplay
- [ ] Movement mechanics
- [ ] Collision detection
- [ ] Academy selection system
- [ ] Power-ups and collectibles
- [ ] Score system

### Phase 3: Polish
- [ ] Visual effects (particles, shaders)
- [ ] Audio integration
- [ ] UI/UX improvements
- [ ] Performance optimization
- [ ] Mobile support

### Phase 4: Expansion
- [ ] Multiple levels
- [ ] Multiplayer support
- [ ] Leaderboards
- [ ] Achievements

## 💡 Helpful Mental Models

### Astro Islands
Think of the page as an ocean (static HTML) with islands (interactive React components). Only the islands hydrate JavaScript.

### React Three Fiber
Think of it as React, but instead of DOM elements, you're creating 3D objects. `<mesh>` is like `<div>`, `<Canvas>` is like `<body>`.

### Three.js Scene Graph
Think of it as a tree: Scene → Groups → Meshes. Parent transformations affect children.

### PNPM Workspaces
Think of it as a monorepo setup, even though we have one package. It's set up for future scalability.

## 🔍 Quick Reference Commands

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Production build
pnpm preview          # Preview production build

# Code Quality
pnpm check            # Run all checks
pnpm check:fix        # Fix issues automatically
pnpm lint             # Lint only
pnpm format           # Format only
pnpm type-check       # TypeScript check only

# Package Management
pnpm add <pkg>        # Add dependency
pnpm add -D <pkg>     # Add dev dependency
pnpm remove <pkg>     # Remove dependency
pnpm install          # Install all dependencies
```

## 📚 Resources for Deep Dives

- **Astro Docs**: https://docs.astro.build/
- **R3F Docs**: https://docs.pmnd.rs/react-three-fiber/
- **Three.js Fundamentals**: https://threejs.org/manual/
- **Drei Helpers**: https://github.com/pmndrs/drei#readme
- **Biome Rules**: https://biomejs.dev/linter/rules/
- **PNPM Workspace**: https://pnpm.io/workspaces

## 🤝 Working with the Team

### Communication
- Document major decisions
- Explain complex 3D logic with comments
- Update AGENTS.md when patterns change
- Keep README.md current

### Code Reviews
- Focus on performance implications
- Check for memory leaks
- Verify TypeScript types
- Ensure Biome passes

---

## 🎮 Game-Specific Context

### Setting: Neo-Tokyo
- Futuristic cyberpunk city
- Neon lights, holographic displays
- Vertical architecture (skyscrapers, platforms)
- Rain effects, reflective surfaces

### Rival Academies Theme
- Multiple competing schools
- Each with unique visual style
- Different abilities/characteristics
- Team-based competition

### Gameplay Feel
- Fast and fluid movement
- Precise platforming
- Competitive edge
- Skill-based progression

---

Claude, you're ready to contribute to Neo-Tokyo: Rival Academies! Remember:
- Prioritize code quality and performance
- Think about the 3D rendering pipeline
- Use Biome, not ESLint/Prettier
- Always use PNPM, not npm/yarn
- Keep components small and focused
- Document complex 3D logic

Happy coding! 🚀
