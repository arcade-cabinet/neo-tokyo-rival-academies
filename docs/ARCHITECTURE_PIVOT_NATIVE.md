# Architecture Pivot: Native Monorepo

**Date**: January 16, 2026
**Status**: Pivot from Capacitor to Babylon Native (React Native).

## 1. The Problem with Capacitor
Capacitor wraps a WebGL canvas in a WebView.
- **Performance**: WebGL in WebView < Native Metal/Vulkan.
- **Flexibility**: Mobile gestures/layouts are limited by browser events.
- **Future**: High-fidelity JRPG visuals (cel-shading, particles) need native power.

## 2. The Solution: Babylon Native (React Native)
We adopt a true **Native** approach using ` @babylonjs/react-native`.
- **Engine**: Babylon Native (C++ engine binding).
- **UI**: React Native (Native components, no HTML overlay).
- **Logic**: Shared TypeScript/ECS.

## 3. New Monorepo Structure (Reference: `wheres-ball-though`)
We separate concerns into `apps` (platforms) and `packages` (logic).

```
root/
├── apps/
│   ├── mobile/         # React Native (iOS/Android) - The "Real" Game
│   └── web/            # Vite + Babylon Web - For rapid dev tools & web access
├── packages/
│   ├── core/           # Shared Game Logic (ECS, Systems, State)
│   ├── config/         # Centralized Configs (Biome, TS, Constants)
│   ├── types/          # Shared Types (Schemas, Contracts)
│   ├── ui/             # Shared UI Components (if compatible) or Design Tokens
│   └── content-gen/    # GenAI Pipeline (Build-time)
```

## 4. Migration Steps
1.  **Scaffold**: Create `packages/config` and `packages/types`.
2.  **Extract**: Move `src/systems`, `src/state`, `src/data` from `game` to `packages/core`.
3.  **Setup Mobile**: Initialize Expo/RN project in `apps/mobile`.
4.  **Setup Web**: Move remaining `game` view layer to `apps/web`.
5.  **Wire Up**: dependencies via `pnpm workspace`.

## 5. Compatibility Analysis
| Feature | Web (Vite) | Native (RN) | Solution |
|---------|------------|-------------|----------|
| **Rendering** | Canvas + WebGL | BabylonNativeView | Abstract `GameView` component. |
| **Input** | Mouse/Touch events | PanResponder / Gestures | Abstract `InputSystem` in Core. |
| **UI** | HTML/CSS | RN View/Text | Separate UI implementations or React Native Web? (Likely separate for best feel). |
| **ECS** | Miniplex (JS) | Miniplex (JS) | Shared in `packages/core`. |
| **Assets** | URL fetch | Bundled/FS | `AssetManager` abstraction (URL vs require/fs). |