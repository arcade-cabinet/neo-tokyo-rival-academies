# Mobile Web Guide (Ionic Angular + Babylon.js + Capacitor)

**Date**: January 27, 2026
**Purpose**: Golden Record for the single unified mobile-first app targeting web, Android, iOS (and optional Electron desktop).

## Core Principle
We ship **one** Ionic Angular web app and wrap it with Capacitor for Android/iOS. This maximizes Babylon.js interoperability and avoids split-codebase overhead. Desktop is optional via an Electron target.

## Technology Stack (Current Truth)
- **Ionic + Angular (zoneless)** for routing and UI
- **Babylon.js** for 3D rendering
- **Anime.js** for UI motion
- **Rapier** for physics
- **Capacitor 8** for native wrapping (Android/iOS)

## Repository Layout (Single App)
```
root/
├── src/                 # Ionic Angular application (single unified app)
├── packages/            # Shared core logic (ECS, data, systems)
├── e2e/                 # Playwright tests
├── docs/                 # Golden Record
└── ...
```

## Performance Targets (Pixel 8a Baseline)
- **FPS**: 60 sustained
- **Boot**: <3.5s to interactive
- **Memory**: <200MB heap
- **Input latency**: <16ms

## Capacitor Setup (Web -> Native)
1. Build the web app: `pnpm build`
2. Sync native platforms: `pnpm cap:sync`
3. Open platforms:
   - Android: `pnpm cap:open:android`
   - iOS: `pnpm cap:open:ios`

## Babylon.js Mobile Notes
- Prefer **toon materials** for the cel-shaded look.
- Use instancing for tiles and repeated props.
- Keep textures compressed and avoid large runtime allocations.

## Ionic UI Rules
- Ionic components handle layout and accessibility.
- HUD overlays use `position: absolute` and pointer lock only where necessary.

## Electron Target (Optional)
Desktop is built from the same web bundle. Electron is optional and should never diverge from mobile/web behavior.

## Testing Checklist
- Manual: Pixel 8a and OnePlus Open
- Commands:
  - `pnpm test`
  - `pnpm test:e2e`
  - `pnpm check`
  - `pnpm build`

## References
- Capacitor Environment Setup and Getting Started (Capacitor 8)
- Ionic + Capacitor integration guide
