# AI Agent Documentation

This document provides guidelines and context for AI coding agents working on the Neo-Tokyo: Rival Academies project.

## 🎯 Project Overview

**Neo-Tokyo: Rival Academies** is a 3D platformer game built with modern web technologies. The game features immersive 3D graphics powered by Three.js and React Three Fiber, delivered through a performant Astro-based architecture.

### Core Technologies

- **Astro 4.x**: Static site generator with partial hydration
- **React 18.3**: For interactive 3D components
- **Three.js 0.170**: Core 3D graphics library
- **React Three Fiber 8.x**: React renderer for Three.js
- **React Three Drei 9.x**: Useful helpers for R3F
- **PNPM 10**: Fast, disk space efficient package manager
- **Biome 1.9.4**: Fast linter and formatter (replaces ESLint + Prettier)
- **TypeScript 5.7**: Type safety and developer experience

## 🏗️ Architecture Principles

### 1. Astro Islands Architecture
- Use Astro for static content and layouts
- Hydrate React components only where interactivity is needed
- 3D scenes should be React components with `client:load` or `client:idle` directives
- Minimize JavaScript shipped to the client

### 2. Component Organization
```
src/
├── components/
│   └── react/          # All React components here
│       ├── scenes/     # 3D scene components
│       ├── ui/         # UI overlay components
│       └── game/       # Game logic components
├── layouts/            # Astro layouts
├── pages/              # Astro pages (routing)
└── utils/              # Shared utilities
```

### 3. 3D Scene Management
- Each 3D scene should be a separate React component
- Use React Three Fiber's `<Canvas>` as the root for 3D content
- Leverage Drei helpers for cameras, controls, and common 3D patterns
- Keep game logic separate from rendering logic

## 🔧 Development Guidelines

### Code Style
- Use Biome for all formatting and linting
- Follow TypeScript strict mode conventions
- Use functional components and hooks
- Prefer named exports over default exports
- Use path aliases: `@/`, `@components/`, `@layouts/`, `@utils/`, `@assets/`

### Performance Best Practices
- Lazy load heavy 3D assets
- Use texture compression
- Implement Level of Detail (LOD) for complex models
- Memoize expensive calculations with `useMemo`
- Use `useFrame` hook efficiently (avoid heavy computations)
- Dispose of Three.js resources properly to prevent memory leaks

### TypeScript Usage
- Define proper types for all props and state
- Use `type` for object shapes, `interface` for extensible contracts
- Avoid `any` - use `unknown` when type is truly unknown
- Leverage TypeScript's utility types

### Three.js Best Practices
- Always dispose of geometries, materials, and textures
- Use `useLoader` from R3F for asset loading
- Implement proper camera controls
- Use proper lighting (avoid too many dynamic lights)
- Consider using instanced meshes for repeated objects

## 🧪 Testing Strategy

### Current State
- No testing infrastructure yet implemented
- When adding tests, consider:
  - Unit tests for utility functions
  - Component tests for React components
  - Integration tests for game mechanics
  - Visual regression tests for 3D scenes

### Recommended Tools (for future)
- Vitest for unit/integration tests
- React Testing Library for component tests
- Playwright for E2E tests

## 📦 Package Management

### PNPM Specific
- Use `pnpm install` never `npm install`
- Respect the `pnpm-workspace.yaml` configuration
- Lock file must be committed: `pnpm-lock.yaml`
- Use `pnpm add <package>` to add dependencies
- Use `pnpm add -D <package>` for dev dependencies

### Dependency Management
- Keep dependencies up to date but test thoroughly
- Check Three.js compatibility when updating R3F/Drei
- Verify Astro integration compatibility

## 🚀 CI/CD Workflow

### CI Pipeline (.github/workflows/ci.yml)
1. **Quality Checks**: Biome format, lint, check
2. **Type Checking**: TypeScript compilation
3. **Build**: Astro build process
4. **Artifacts**: Upload build output

### CD Pipeline (.github/workflows/deploy.yml)
1. **Build**: Production build with base path
2. **Deploy**: Automatic deployment to GitHub Pages
3. **Environment**: Uses GitHub Pages environment

## 🎮 Game Development Context

### Game Design Goals
- Fast-paced 3D platforming action
- Neon cyberpunk aesthetic
- Rival academy theme with multiple factions
- Competitive and cooperative gameplay modes

### Visual Style
- Neon-lit Neo-Tokyo aesthetic
- Vibrant colors: cyan, magenta, yellow
- Cyberpunk architecture
- Holographic UI elements
- Particle effects and dynamic lighting

### Key Features to Implement
1. **Character Controller**: Player movement, jumping, abilities
2. **Camera System**: Follow camera, cinematic angles
3. **Level Design**: Platforms, obstacles, collectibles
4. **Academy System**: Multiple factions with unique traits
5. **Progression**: Unlockables, achievements
6. **Multiplayer**: Competitive modes, leaderboards

## 🛠️ Common Tasks

### Adding a New 3D Scene
```typescript
// src/components/react/scenes/MyScene.tsx
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';

export function MyScene() {
  return (
    <Canvas>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      {/* Your 3D content */}
      <OrbitControls />
    </Canvas>
  );
}
```

### Using in Astro Page
```astro
---
import Layout from '@layouts/Layout.astro';
import { MyScene } from '@components/react/scenes/MyScene';
---

<Layout>
  <MyScene client:load />
</Layout>
```

### Adding a New Utility
```typescript
// src/utils/gameUtils.ts
export function calculateScore(points: number, multiplier: number): number {
  return points * multiplier;
}
```

## 🔍 Debugging Tips

### 3D Scene Issues
- Use React DevTools to inspect component hierarchy
- Add `<Stats />` from Drei to monitor performance
- Use `<axesHelper />` and `<gridHelper />` for spatial debugging
- Check browser console for Three.js warnings

### Build Issues
- Clear `.astro` cache directory
- Delete `node_modules` and reinstall: `pnpm install`
- Check for conflicting dependencies
- Verify Node.js and PNPM versions

### Performance Issues
- Use Chrome DevTools Performance tab
- Check for memory leaks (undisposed Three.js objects)
- Profile with React DevTools Profiler
- Monitor bundle size with `pnpm build` output

## 📚 Resources

### Documentation
- [Astro Docs](https://docs.astro.build/)
- [React Three Fiber Docs](https://docs.pmnd.rs/react-three-fiber/)
- [Drei Docs](https://github.com/pmndrs/drei)
- [Three.js Docs](https://threejs.org/docs/)
- [Biome Docs](https://biomejs.dev/)
- [PNPM Docs](https://pnpm.io/)

### Learning Resources
- [Three.js Journey](https://threejs-journey.com/)
- [React Three Fiber Examples](https://docs.pmnd.rs/react-three-fiber/getting-started/examples)
- [Astro Tutorial](https://docs.astro.build/en/tutorial/0-introduction/)

## 🤝 Collaboration

### Code Review Checklist
- [ ] Code follows Biome style guidelines
- [ ] TypeScript types are properly defined
- [ ] No console.logs in production code
- [ ] Three.js resources are properly disposed
- [ ] Components are properly memoized
- [ ] Performance impact is acceptable
- [ ] Documentation is updated

### Commit Message Format
```
type(scope): subject

body

footer
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`

## 🔐 Security Considerations

- Never commit API keys or secrets
- Validate user input in game mechanics
- Be cautious with user-generated content
- Keep dependencies updated for security patches
- Use environment variables for sensitive config

## 📈 Performance Targets

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3.5s
- **Frame Rate**: Consistent 60 FPS
- **Bundle Size**: < 500KB initial (excluding 3D assets)

## 🎯 Current Priorities

1. Set up basic project structure
2. Implement core 3D rendering pipeline
3. Create character controller
4. Design first level/environment
5. Implement basic game mechanics
6. Add UI/HUD overlay
7. Optimize performance
8. Add multiplayer support

---

This document should be updated as the project evolves. All AI agents should read and understand this context before making significant changes to the codebase.
