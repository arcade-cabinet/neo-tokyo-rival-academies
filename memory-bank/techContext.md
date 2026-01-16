# Tech Context

## Frontend Stack

- **React 19**: Latest React features for modern UI
- **TypeScript 5.7**: Strict typing for reliability
- **Three.js 0.182**: Core 3D graphics library
- **React Three Fiber 9.x**: Declarative Three.js in React
- **Drei**: Essential R3F helpers (useGLTF, OrbitControls, etc.)
- **Miniplex**: Entity Component System (ECS) for game logic
- **Zustand**: Lightweight state management
- **Astro 5.x**: Static site generation with island architecture
- **Capacitor 8**: Native mobile wrapper (iOS/Android)

## Specialized Libraries

- **@react-three/rapier**: Physics engine for collision and world logic
- **YukaJS**: AI/pathfinding (note: unmaintained, migration planned)
- **Leva**: Debug controls for camera/scene tweaking

## GenAI Stack

- **Meshy AI**: Primary asset generation
  - `POST /v1/text-to-image` - Multi-view concept art
  - `POST /v1/multi-image-to-3d` - 3D model generation
  - `POST /v1/rigging` - Automatic character rigging
  - `POST /v1/animations` - Animation application
- **Google Imagen**: Background/storyboard generation (planned)

## Development Setup

- **Package Manager**: PNPM 10 (Required - never use npm/yarn)
- **Environment**: Node.js v20+
- **Linting/Formatting**: Biome (`pnpm check`)
- **Commands**:
  ```bash
  pnpm install           # Install dependencies
  pnpm dev               # Start dev server
  pnpm build             # Production build
  pnpm test              # Unit tests (Vitest)
  pnpm test:e2e          # E2E tests (Playwright)
  pnpm check             # Lint + format
  ```

## Constraints

- **WebGL Support**: Required; must show error if unavailable
- **Performance**: 60 FPS target, instanced meshes for hex tiles
- **Memory**: Dispose Three.js resources on unmount
- **Asset Paths**: Use `/assets/...` (public folder root)
- **Client Directives**: Always `client:load` for 3D components

## Monorepo Structure

```
packages/
├── game/           # Main game client (React + R3F)
├── content-gen/    # GenAI asset pipeline (Node.js CLI)
└── e2e/            # Playwright E2E tests
```

## Migration Considerations

Babylon.js + Reactylon is under evaluation for:
- Built-in RecastJS navigation mesh (replaces YukaJS)
- Havok physics engine
- Scene inspector for debugging

---

*Last Updated: 2026-01-15*
