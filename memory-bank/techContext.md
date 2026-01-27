# Tech Context

## Frontend Stack

- **Ionic + Angular (zoneless)**: UI, routing, and app shell
- **TypeScript 5.9**: Strict typing
- **Babylon.js 8.x**: Core 3D rendering
- **Miniplex**: ECS for game logic
- **Zustand**: State containers (used via getState/subscribe, not React)
- **Anime.js**: UI animation
- **Rapier**: Physics engine
- **Capacitor 8**: Native Android/iOS wrapper

## GenAI Stack

- **Meshy AI**: Character and prop generation

## Development Setup

- **Package Manager**: PNPM 10 (required)
- **Environment**: Node.js 22+
- **Linting/Formatting**: Biome (`pnpm check`)
- **Commands**:
  ```bash
  pnpm install
  pnpm -C app start
  pnpm -C app build
  pnpm -C app test
  pnpm check
  ```

## Constraints

- **Mobile First**: 60 FPS on Pixel 8a baseline
- **Asset Paths**: Use `/assets/...` from the app build
- **Scene Hygiene**: Dispose Babylon meshes/materials on teardown

## Repository Structure (Current)

```text
root/
├── app/              # Ionic Angular unified app
├── packages/         # Shared core (ECS, data, systems)
└── docs/             # Golden Record
```

## Migration Notes

- React/Reactylon/Expo are deprecated and removed from the active stack.
- Electron target is optional and should reuse the web bundle.

---

Last Updated: 2026-01-27
