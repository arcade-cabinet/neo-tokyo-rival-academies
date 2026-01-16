# GitHub Copilot Instructions

This file provides context for GitHub Copilot when suggesting code for the Neo-Tokyo: Rival Academies project.

## Project Overview

Neo-Tokyo: Rival Academies is a 3D Action JRPG built with:
- **Vite 6.x**: Fast build tooling with HMR
- **React 19**: UI library for 3D components
- **Three.js 0.182**: 3D graphics engine (current stack)
- **Babylon.js**: 3D engine (migration target via Reactylon)
- **React Three Fiber 9.x**: Declarative 3D with React
- **React Three Drei 9.x**: R3F helper components
- **Miniplex**: Entity Component System (ECS)
- **Zustand**: State management
- **PNPM 10**: Package manager (NOT npm or yarn)
- **Biome 2.3**: Linter and formatter (NOT ESLint or Prettier)
- **TypeScript 5.9**: Strict mode enabled

## Code Style & Conventions

### Language & Types
- Use TypeScript for all new files
- Enable strict mode checks
- Avoid `any` type - use `unknown` or proper types
- Use `type` for object shapes, `interface` for extensible contracts
- Always define prop types for React components

### Imports
- Use ES6 imports
- Use path aliases: `@/`, `@components/`, `@layouts/`, `@utils/`, `@assets/`
- Organize imports: types first, then external libraries, then local imports
- Use type-only imports: `import type { FC } from 'react';`

### React Components
- Use functional components with TypeScript
- Prefer named exports over default exports
- Use hooks (useState, useEffect, useRef, useMemo, useCallback)
- For 3D: Use R3F hooks (useFrame, useThree, useLoader)

### Formatting
- Single quotes for strings
- Semicolons required
- 2 space indentation
- Line width: 100 characters
- Use Biome's formatting rules (see biome.json)

### File Structure (Monorepo)
```
packages/
├── game/                 # Main game (Vite + React)
│   └── src/
│       ├── components/react/
│       │   ├── scenes/   # 3D scenes with <Canvas>
│       │   ├── objects/  # Individual 3D objects
│       │   ├── ui/       # UI overlays
│       │   └── game/     # Game logic components
│       ├── systems/      # ECS systems (Physics, Combat, AI)
│       ├── state/        # Global state (ECS, Zustand)
│       └── utils/        # Utility functions
├── content-gen/          # GenAI content pipeline
└── e2e/                  # Playwright E2E tests
```

## Common Patterns

### Creating a 3D Scene Component
```typescript
import type { FC } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Environment } from '@react-three/drei';

export const GameScene: FC = () => {
  return (
    <Canvas camera={{ position: [0, 5, 10], fov: 75 }}>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      {/* 3D content here */}

      <OrbitControls />
      <Environment preset="city" />
    </Canvas>
  );
};
```

### Using Scene in Main App
```typescript
// packages/game/src/App.tsx
import NeoTokyoGame from '@components/react/scenes/NeoTokyoGame';

function App() {
  return <NeoTokyoGame />;
}

export default App;
```

### Animated 3D Object
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
      <meshStandardMaterial color="cyan" />
    </mesh>
  );
}
```

### Loading 3D Models
```typescript
import { useGLTF } from '@react-three/drei';

export function Model() {
  const { scene } = useGLTF('/models/character.glb');
  return <primitive object={scene} />;
}

useGLTF.preload('/models/character.glb');
```

### Utility Function
```typescript
/**
 * Calculate velocity based on acceleration and time
 */
export function calculateVelocity(
  initialVelocity: number,
  acceleration: number,
  deltaTime: number
): number {
  return initialVelocity + acceleration * deltaTime;
}
```

## Important Rules

### DO
- ✅ Use PNPM commands (`pnpm add`, `pnpm install`)
- ✅ Use Biome for linting/formatting (`pnpm check`)
- ✅ Use TypeScript with proper types
- ✅ Use path aliases (@/, @components/, etc.)
- ✅ Use React Three Fiber for 3D content
- ✅ Use Astro for static content
- ✅ Dispose Three.js resources (geometries, materials, textures)
- ✅ Use `client:load` directive for React components in Astro
- ✅ Memoize expensive calculations
- ✅ Add JSDoc comments for complex functions

### DON'T
- ❌ Don't use npm or yarn commands
- ❌ Don't use ESLint or Prettier configs
- ❌ Don't use `any` type
- ❌ Don't create memory leaks (dispose Three.js objects)
- ❌ Don't use default exports (prefer named exports)
- ❌ Don't use React for static content (use Astro)
- ❌ Don't forget `client:` directives on React components
- ❌ Don't do heavy computations in useFrame without memoization

## Performance Considerations

- Minimize JavaScript bundle size
- Use Astro for static content, React only for interactivity
- Implement Level of Detail (LOD) for 3D objects
- Use instanced meshes for repeated objects
- Compress textures appropriately
- Lazy load heavy assets
- Profile with Chrome DevTools
- Target 60 FPS for gameplay

## Dependencies

### Adding Dependencies
```bash
# Production dependency
pnpm add <package-name>

# Development dependency
pnpm add -D <package-name>
```

### Core Dependencies (already installed)
- @astrojs/react
- @react-three/fiber
- @react-three/drei
- three
- react
- react-dom
- astro

### Dev Dependencies
- @biomejs/biome
- typescript
- @astrojs/check

## Game-Specific Context

### Visual Style
- Neon cyberpunk aesthetic (cyan, magenta, yellow)
- Neo-Tokyo setting with skyscrapers and platforms
- Holographic UI elements
- Particle effects and dynamic lighting

### Core Gameplay
- 3D platformer mechanics
- Character movement and jumping
- Multiple rival academies
- Collectibles and power-ups
- Competitive gameplay modes

## Commands Reference

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm preview          # Preview production build

# Code Quality
pnpm check            # Run Biome checks
pnpm check:fix        # Auto-fix issues
pnpm lint             # Lint only
pnpm format           # Format only
pnpm type-check       # TypeScript check
```

## Additional Resources

- **Astro**: https://docs.astro.build/
- **R3F**: https://docs.pmnd.rs/react-three-fiber/
- **Drei**: https://github.com/pmndrs/drei
- **Three.js**: https://threejs.org/docs/
- **Biome**: https://biomejs.dev/

---

When suggesting code, follow these patterns and conventions to maintain consistency across the codebase.
