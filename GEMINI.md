# Gemini AI Assistant Guidelines

Welcome, Gemini! This document provides specific context and guidelines for working on the Neo-Tokyo: Rival Academies project.

## 🎯 Project Context

You're contributing to **Neo-Tokyo: Rival Academies**, a browser-based 3D platformer game featuring:
- Cyberpunk aesthetic with neon-lit Neo-Tokyo setting
- Real-time 3D graphics using Three.js and React Three Fiber
- Fast-paced competitive platforming gameplay
- Built with modern web technologies: Astro, React, TypeScript, PNPM 10, Biome

## 🧠 Your Strengths in This Project

As Gemini, you bring unique capabilities:
- **Multi-modal Understanding**: Processing code, documentation, and visual concepts
- **Pattern Recognition**: Identifying code patterns and best practices quickly
- **Integration Skills**: Connecting different technologies seamlessly
- **Rapid Learning**: Quickly adapting to new frameworks and libraries
- **Creative Problem-Solving**: Finding innovative solutions to complex challenges

## 🏗️ Technology Stack

### Astro 4.x - Static Site Generator
**What it is**: Modern static site builder with "Islands Architecture"
**Key concept**: Ship minimal JavaScript, hydrate only interactive parts
**Your focus**: Structure pages efficiently, minimize JavaScript payload

**Example**:
```astro
---
// Frontmatter (runs at build time)
import Layout from '@layouts/Layout.astro';
import { GameScene } from '@components/react/GameScene';
---

<Layout title="Neo-Tokyo">
  <!-- This React component only hydrates on client -->
  <GameScene client:load />
</Layout>
```

### React 18.3 - UI Library
**What it is**: JavaScript library for building user interfaces
**Usage**: ONLY for interactive 3D components, not for static content
**Your focus**: Create efficient React components for 3D scenes and game UI

### Three.js 0.170 - 3D Graphics
**What it is**: Low-level 3D graphics library for the web
**Core concepts**: Scene, Camera, Renderer, Geometries, Materials, Lights
**Your focus**: Understanding the 3D rendering pipeline

### React Three Fiber (R3F) 8.x - React Renderer for Three.js
**What it is**: Bridges React and Three.js, making 3D declarative
**Key feature**: Use React components instead of imperative Three.js code
**Your focus**: Writing declarative 3D code

**Example**:
```tsx
// Instead of imperative Three.js:
const geometry = new THREE.BoxGeometry(1, 1, 1);
const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Use declarative R3F:
<mesh>
  <boxGeometry args={[1, 1, 1]} />
  <meshStandardMaterial color="green" />
</mesh>
```

### React Three Drei 9.x - R3F Helpers
**What it is**: Collection of useful helpers and abstractions for R3F
**Provides**: Camera controls, loaders, environments, effects, and more
**Your focus**: Leveraging these helpers to avoid reinventing the wheel

### Biome 1.9.4 - Linter & Formatter
**Important**: NOT using ESLint or Prettier
**Why Biome**: Faster, simpler, all-in-one tool
**Commands**: `pnpm lint`, `pnpm format`, `pnpm check`

### PNPM 10 - Package Manager
**Important**: Always use `pnpm`, never `npm` or `yarn`
**Why PNPM**: Fast, disk-efficient, strict dependency resolution
**Key file**: `pnpm-lock.yaml` (always commit this)

### TypeScript 5.7
**Usage**: Strict mode enabled for maximum type safety
**Your focus**: Proper typing, avoiding `any`, using utility types

## 📁 Project Structure

```
neo-tokyo-rival-academies/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml           # CI pipeline (lint, build, test)
│   │   └── deploy.yml       # CD pipeline (GitHub Pages)
│   └── copilot-instructions.md
├── public/                   # Static assets (served as-is)
│   ├── models/              # 3D models (.glb, .gltf)
│   ├── textures/            # Texture images
│   └── audio/               # Sound files
├── src/
│   ├── components/
│   │   └── react/           # React components
│   │       ├── scenes/      # Full 3D scenes (with Canvas)
│   │       ├── objects/     # 3D objects (meshes, groups)
│   │       ├── ui/          # UI overlays (HUD, menus)
│   │       └── game/        # Game logic components
│   ├── layouts/             # Astro layouts (wrappers)
│   ├── pages/               # Astro pages (routes)
│   │   └── index.astro      # Home page
│   ├── assets/              # Assets processed by Astro
│   └── utils/               # Utility functions
├── astro.config.mjs         # Astro configuration
├── biome.json               # Biome configuration
├── tsconfig.json            # TypeScript configuration
├── package.json             # Dependencies and scripts
├── pnpm-workspace.yaml      # PNPM workspace config
└── .npmrc                   # PNPM settings
```

## 🛠️ Development Workflow

### Starting Development
```bash
# Install dependencies (first time only)
pnpm install

# Start dev server (with hot reload)
pnpm dev
# Opens at http://localhost:4321
```

### Making Changes
1. Edit files in `src/`
2. Browser auto-reloads (Astro HMR)
3. Check console for errors
4. Save often, test frequently

### Before Committing
```bash
# Run all checks
pnpm check

# Or individually:
pnpm format        # Format code
pnpm lint          # Check for errors
pnpm type-check    # TypeScript validation
pnpm build         # Test production build
```

### Building for Production
```bash
pnpm build         # Creates dist/ folder
pnpm preview       # Preview production build locally
```

## 🎨 Coding Patterns & Best Practices

### Pattern 1: Creating a 3D Scene Component

```typescript
// src/components/react/scenes/MainGameScene.tsx
import type { FC } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sky, Environment } from '@react-three/drei';

export const MainGameScene: FC = () => {
  return (
    <Canvas
      camera={{ position: [0, 5, 10], fov: 75 }}
      shadows
    >
      {/* Lighting */}
      <ambientLight intensity={0.3} />
      <directionalLight 
        position={[10, 10, 5]} 
        intensity={1} 
        castShadow 
      />
      
      {/* Environment */}
      <Sky sunPosition={[100, 10, 100]} />
      <Environment preset="city" />
      
      {/* Game Objects */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="cyan" />
      </mesh>
      
      {/* Controls */}
      <OrbitControls />
    </Canvas>
  );
};
```

### Pattern 2: Using the Scene in an Astro Page

```astro
---
// src/pages/game.astro
import Layout from '@layouts/Layout.astro';
import { MainGameScene } from '@components/react/scenes/MainGameScene';

const pageTitle = "Play Neo-Tokyo";
---

<Layout title={pageTitle}>
  <div class="game-container">
    <MainGameScene client:load />
  </div>
</Layout>

<style>
  .game-container {
    width: 100vw;
    height: 100vh;
    margin: 0;
    padding: 0;
  }
</style>
```

### Pattern 3: Animated 3D Object

```typescript
// src/components/react/objects/RotatingCube.tsx
import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import type { Mesh } from 'three';

export function RotatingCube() {
  const meshRef = useRef<Mesh>(null);
  
  // Animation loop (60 FPS)
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta;
    }
  });
  
  return (
    <mesh ref={meshRef}>
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial color="magenta" />
    </mesh>
  );
}
```

### Pattern 4: Loading 3D Models

```typescript
// src/components/react/objects/CharacterModel.tsx
import { useGLTF } from '@react-three/drei';

export function CharacterModel() {
  const { scene } = useGLTF('/models/character.glb');
  
  return <primitive object={scene} scale={0.5} />;
}

// Preload for better performance
useGLTF.preload('/models/character.glb');
```

### Pattern 5: Utility Function with Proper Types

```typescript
// src/utils/physics.ts

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

/**
 * Check if two spheres are colliding
 */
export function checkSphereCollision(
  pos1: [number, number, number],
  radius1: number,
  pos2: [number, number, number],
  radius2: number
): boolean {
  const dx = pos1[0] - pos2[0];
  const dy = pos1[1] - pos2[1];
  const dz = pos1[2] - pos2[2];
  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
  return distance < radius1 + radius2;
}
```

## ⚠️ Common Issues & Solutions

### Issue 1: "window is not defined" Error
**Cause**: Three.js code running during Server-Side Rendering (SSR)
**Solution**: Use `client:load` directive on React component in Astro

```astro
<!-- ✅ Correct -->
<GameScene client:load />

<!-- ❌ Wrong -->
<GameScene />
```

### Issue 2: Poor Performance / Low FPS
**Causes**: Too many objects, unoptimized meshes, heavy computations in useFrame
**Solutions**:
- Use instanced meshes for repeated objects
- Implement Level of Detail (LOD)
- Memoize expensive calculations
- Use `useMemo` and `useCallback` appropriately
- Profile with Chrome DevTools

### Issue 3: Memory Leaks
**Cause**: Not disposing Three.js objects
**Solution**: Clean up in useEffect

```typescript
useEffect(() => {
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshBasicMaterial();
  
  return () => {
    // Cleanup
    geometry.dispose();
    material.dispose();
  };
}, []);
```

### Issue 4: Biome Errors
**Cause**: Code doesn't match Biome rules
**Solution**: Run auto-fix

```bash
pnpm check:fix
```

### Issue 5: Build Fails
**Common causes**:
1. TypeScript errors → `pnpm type-check`
2. Missing dependencies → `pnpm install`
3. Cache issues → `rm -rf .astro node_modules/.cache && pnpm install`

## 🎯 Game Development Context

### Visual Style: Neo-Tokyo Cyberpunk
- **Colors**: Neon cyan, magenta, yellow, purple
- **Lighting**: High contrast, colorful point lights
- **Architecture**: Vertical platforms, skyscrapers, holographic elements
- **Weather**: Optional rain, fog effects
- **UI**: Futuristic HUD, glowing elements

### Gameplay Mechanics to Implement
1. **Character Movement**: WASD controls, jumping, dashing
2. **Camera System**: Third-person follow camera
3. **Platforming**: Precise jumping, wall-running
4. **Collectibles**: Points, power-ups
5. **Obstacles**: Moving platforms, hazards
6. **Academy System**: Choose academy, unlock abilities

### Performance Targets
- **FPS**: Maintain 60 FPS on mid-range hardware
- **Load Time**: < 3 seconds initial load
- **Bundle Size**: < 500 KB JavaScript (excluding 3D assets)

## 🧪 Testing Strategy

### Manual Testing Checklist
- [ ] Dev server starts without errors
- [ ] Page loads in browser
- [ ] 3D scene renders correctly
- [ ] No console errors or warnings
- [ ] Frame rate is smooth (check FPS)
- [ ] Controls work as expected
- [ ] Build completes successfully
- [ ] Production preview works

### Browser Testing
- Chrome (primary)
- Firefox
- Safari (WebGL compatibility)
- Edge

### Performance Testing
```typescript
// Add to scene for debugging
import { Stats } from '@react-three/drei';

<Canvas>
  <Stats />
  {/* rest of scene */}
</Canvas>
```

## 🚀 CI/CD Pipeline

### Continuous Integration (.github/workflows/ci.yml)
Runs on: Pull requests, pushes to main/develop

**Steps**:
1. Install PNPM 10
2. Install dependencies
3. Run Biome checks (format, lint)
4. Run TypeScript type check
5. Build project
6. Upload build artifacts

### Continuous Deployment (.github/workflows/deploy.yml)
Runs on: Pushes to main branch

**Steps**:
1. Build project with correct base path
2. Deploy to GitHub Pages
3. Site available at: `https://arcade-cabinet.github.io/neo-tokyo-rival-academies`

### Your Responsibility
- Ensure all CI checks pass before merging
- Fix any build errors immediately
- Test locally before pushing

## 📚 Learning Resources

### Essential Documentation
- **Astro**: https://docs.astro.build/
- **React Three Fiber**: https://docs.pmnd.rs/react-three-fiber/
- **Drei**: https://github.com/pmndrs/drei
- **Three.js**: https://threejs.org/docs/
- **Biome**: https://biomejs.dev/

### Tutorials & Guides
- **Three.js Fundamentals**: https://threejs.org/manual/
- **R3F Journey**: https://docs.pmnd.rs/react-three-fiber/getting-started/examples
- **Astro Tutorial**: https://docs.astro.build/en/tutorial/0-introduction/

### Community Resources
- **Poimandres Discord**: R3F community
- **Astro Discord**: Astro community
- **Three.js Discourse**: Three.js community

## 🤝 Collaboration Guidelines

### Code Review Focus
- Performance implications of changes
- Memory leak prevention
- TypeScript type safety
- Biome compliance
- Documentation clarity

### Documentation Standards
- Document complex 3D logic
- Add JSDoc comments for utility functions
- Update AGENTS.md for new patterns
- Keep README.md current

### Commit Message Format
```
type(scope): description

[optional body]

[optional footer]
```

**Types**: feat, fix, docs, style, refactor, perf, test, chore

**Example**:
```
feat(player): add double jump mechanic

Implemented double jump ability for player character.
Includes animation and particle effects.

Closes #42
```

## 🎮 Quick Command Reference

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm preview          # Preview production build

# Code Quality
pnpm check            # Run all checks
pnpm check:fix        # Auto-fix issues
pnpm lint             # Lint only
pnpm format           # Format only
pnpm type-check       # TypeScript only

# Dependencies
pnpm add <package>    # Add dependency
pnpm add -D <package> # Add dev dependency
pnpm remove <package> # Remove dependency
pnpm install          # Install all deps
```

## 💡 Pro Tips for Gemini

1. **Visual Understanding**: Use your multi-modal capabilities to understand 3D concepts better
2. **Pattern Matching**: Look for similar patterns in Drei examples when building features
3. **Integration**: Think about how Astro, React, and Three.js work together
4. **Performance**: Always consider the rendering pipeline impact
5. **Types**: Leverage TypeScript's type system for safer code
6. **Documentation**: Your natural language skills make you great at documentation

## 🎯 Current Project Phase

**Phase 1: Foundation** (Current)
- [x] Repository scaffolding ✅
- [ ] Basic 3D scene setup
- [ ] Character controller
- [ ] Camera system
- [ ] First level design

Your immediate tasks might involve:
- Setting up the basic game scene
- Creating the character controller
- Implementing camera controls
- Designing the first platform level

## 🔐 Security & Best Practices

- Never commit sensitive data (API keys, tokens)
- Use environment variables for config
- Validate user input in game mechanics
- Keep dependencies updated
- Follow OWASP guidelines

---

## Ready to Contribute!

Gemini, you're now equipped to contribute effectively to Neo-Tokyo: Rival Academies! 

**Remember**:
- Use PNPM, not npm/yarn
- Use Biome, not ESLint/Prettier
- Think about 3D performance
- Write type-safe TypeScript
- Keep React usage minimal (Astro for static content)
- Document complex logic
- Test thoroughly before committing

Let's build an amazing 3D platformer! 🎮✨
