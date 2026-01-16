# Mobile Native Integration Guide v1.0

**Core Principle**: Design for **Native Performance** first using React Native + Babylon Native. Target Pixel 8a baseline (60 FPS, Vulkan/OpenGL ES).

## Native vs Web Factor-In

- **Mobile (Primary Delivery)**: React Native (`apps/mobile`).
  - **Engine**: Babylon Native (C++ binding) for 3D.
  - **UI**: React Native Views (Text, TouchableOpacity) for HUD.
  - **Benefits**: Direct GPU access, native gestures, OS integration (haptics, FS).
- **Web (Dev/Tools)**: Vite (`apps/web`).
  - **Engine**: Babylon.js (WebGL).
  - **Use Case**: Rapid iteration, debug inspectors, desktop play.
  - **Shared Core**: All game logic resides in `packages/core` and MUST be platform-agnostic.

## Performance Targets (Pixel 8a Baseline)

| Metric | Target | Enforcement |
|--------|--------|-------------|
| FPS | 60 consistent | Native engine, compressed textures (KTX2), LOD. |
| Boot Time | <2s interactive | Bundled assets (no network fetch), pre-warmed engine. |
| Memory | <200MB heap | Strict disposal of meshes/textures in Native. |
| Input | <16ms latency | Native PanResponder for gestures. |

## Control Schemes

- **Touch**: Virtual joystick (RN-based or Babylon GUI), Tap-to-move.
- **Gestures**: Swipe for camera/parkour (Native responders).
- **Foldable**: `Dimensions.addEventListener('change')` re-renders RN layout.

## Architecture

```
apps/mobile (RN) --> packages/core (Logic) <-- apps/web (Vite)
       |                     |                      |
  BabylonReactNative      Miniplex             BabylonJS (Web)
```

## Testing Plan

- **Device**: Pixel 8a (Physical) via `adb logcat`.
- **Profile**: Xcode Instruments / Android Profiler.
- **Shared Logic**: Unit tests in `packages/core` (Vitest).