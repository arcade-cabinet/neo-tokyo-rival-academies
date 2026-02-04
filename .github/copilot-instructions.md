# GitHub Copilot Instructions

This file provides context for GitHub Copilot when suggesting code for the Neo-Tokyo: Rival Academies project.

## ⚠️ CRITICAL: Current Architecture (Feb 2026)

The project uses **Ionic Angular + Babylon.js + Capacitor**. Do NOT suggest React, Three.js, or Reactylon code.

## Project Overview

Neo-Tokyo: Rival Academies is a 3D Action JRPG built with:
- **Ionic + Angular (zoneless)**: UI framework
- **Babylon.js**: 3D graphics engine (imperative, NOT React-based)
- **Miniplex**: Entity Component System (ECS)
- **Zustand**: State management
- **Capacitor 8**: Native mobile wrapper
- **PNPM 10**: Package manager (NOT npm or yarn)
- **Biome 2.3**: Linter and formatter (NOT ESLint or Prettier)
- **TypeScript 5.9**: Strict mode enabled

### DEPRECATED (Do NOT Suggest)
- ❌ React / React Three Fiber / Reactylon
- ❌ Three.js
- ❌ Vite (for game package)
- ❌ `packages/game/` directory (deleted)

## Code Style & Conventions

### Language & Types
- Use TypeScript for all new files
- Enable strict mode checks
- Avoid `any` type - use `unknown` or proper types
- Use `type` for object shapes, `interface` for extensible contracts
- Always define types for Angular components

### Imports
- Use ES6 imports
- Use relative imports within `src/`
- Organize imports: types first, then external libraries, then local imports
- Use type-only imports: `import type { Component } from '@angular/core';`

### Angular Components
- Use standalone components where possible
- Use signals for reactive state
- Use OnPush change detection
- Follow Angular style guide

### Formatting
- Single quotes for strings
- Semicolons required
- 2 space indentation
- Line width: 100 characters
- Use Biome's formatting rules (see biome.json)

### File Structure (Current)
```
src/
├── app/
│   ├── engine/           # Babylon.js scene services
│   ├── game-shell/       # Game container
│   ├── state/            # Angular state services
│   ├── systems/          # Game logic systems
│   ├── ui/               # Angular UI components
│   └── utils/            # Utility functions
├── lib/
│   ├── core/             # Shared ECS logic
│   ├── diorama/          # Legacy components (reference only)
│   └── world-gen/        # World generation
├── assets/               # Game assets
└── environments/         # Angular environments
```

## Common Patterns

### Creating an Angular Component
```typescript
import { Component, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-game-hud',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="hud-container">
      <!-- HUD content -->
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GameHudComponent {}
```

### Babylon.js Scene Service
```typescript
import { Injectable } from '@angular/core';
import { Scene, Engine, ArcRotateCamera } from '@babylonjs/core';

@Injectable({ providedIn: 'root' })
export class BabylonSceneService {
  private scene: Scene | null = null;
  private engine: Engine | null = null;

  initialize(canvas: HTMLCanvasElement): void {
    this.engine = new Engine(canvas, true);
    this.scene = new Scene(this.engine);
    // Setup camera, lights, etc.
  }

  dispose(): void {
    this.scene?.dispose();
    this.engine?.dispose();
  }
}
```

### ECS System Pattern
```typescript
import { world } from '../state/ecs';

export function updateCombatSystem(deltaTime: number): void {
  const entities = world.with('health', 'position', 'isEnemy');
  
  for (const entity of entities) {
    // Process entity
  }
}
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
- ✅ Use Angular standalone components
- ✅ Use Babylon.js for 3D content
- ✅ Dispose Babylon.js resources properly
- ✅ Use OnPush change detection
- ✅ Memoize expensive calculations
- ✅ Add JSDoc comments for complex functions
- ✅ Track work in memory-bank

### DON'T
- ❌ Don't use npm or yarn commands
- ❌ Don't use ESLint or Prettier configs
- ❌ Don't use `any` type
- ❌ Don't use React or Three.js
- ❌ Don't reference `packages/game/` (deleted)
- ❌ Don't create memory leaks (dispose Babylon objects)
- ❌ Don't use GitHub Issues for planning (use memory-bank)

## Performance Considerations

- Target 60 FPS on Pixel 8a
- Minimize JavaScript bundle size
- Use Angular lazy loading
- Implement Level of Detail (LOD) for 3D objects
- Use instanced meshes for repeated objects
- Compress textures appropriately
- Lazy load heavy assets
- Profile with Chrome DevTools
- Memory budget: <200MB heap

## Commands Reference

```bash
# Development
pnpm start             # Start dev server
pnpm build             # Build for production

# Code Quality
pnpm check             # Run Biome checks
pnpm check:fix         # Auto-fix issues

# Testing
pnpm test              # Run unit tests
pnpm test:e2e          # Run E2E tests
```

## Additional Resources

- **Angular**: https://angular.dev/
- **Ionic**: https://ionicframework.com/docs/
- **Babylon.js**: https://doc.babylonjs.com/
- **Biome**: https://biomejs.dev/
- **Capacitor**: https://capacitorjs.com/docs/

---

When suggesting code, follow these patterns and conventions to maintain consistency across the codebase. Remember: this is an **Angular + Babylon.js** project, NOT React.
