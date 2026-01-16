# Mobile/Web Integration Guide v1.0

**Core Principle**: Design for Pixel 8a constraints first—target 60 FPS consistent, <3.5s interactive load, <150MB heap, touch-primary controls. Scale up to foldables (dynamic viewport + layout reflow).

## Web vs Mobile Factor-In
- **Web (Primary Delivery)**: Pure browser (Chrome/Edge/Safari) — instant play via URL. Use PWA manifest for "add to home screen" (offline cache via service worker).
- **Mobile (Native Wrapper)**: Capacitor from Phase 1 — wraps web build into APK/IPA. Enables:
  - Haptics on combat hits
  - Orientation lock + foldable detection
  - Offline play (cached assets + seeded world)
  - App store distribution later
- **Transition Handling** (Foldable Critical):
  - Use CSS media queries + `window.visualViewport` for dynamic resize.
  - Reactylon canvas auto-resizes on `engine.resize()`.
  - HUD/UI: Responsive layout (flex/grid) — phone: compact vertical stack; tablet/unfolded: wide horizontal (extra quest log space).
  - No reloads: State persists via Zustand + save store.

## Performance Targets (Pixel 8a Baseline)
| Metric          | Target          | Enforcement |
|-----------------|-----------------|-------------|
| FPS             | 60 consistent   | Instancing everywhere, LOD on distant buildings, GPU particles capped |
| Load Time       | <3.5s interactive | Progressive: Core scene + hero first, districts stream |
| Memory          | <150MB heap     | Thin instances, dispose unused clusters, asset compression |
| Touch Latency   | <50ms           | Direct canvas events, no heavy DOM overlays |
| Battery         | >4 hours play   | Limit draw calls, throttle non-visible updates |

## Control Schemes
- **Phone/Folded**: Virtual sticks + tap-to-move/interact (hex snap), gesture parkour (swipe up wall-run).
- **Tablet/Unfolded**: Hybrid — virtual controls + pointer (mouse-like on inner screen).
- **Auto-Detect**: `navigator.userAgent` + media queries → switch layouts.

## How Existing Layers Factor In
- **Procedural Gen/Seeds**: Huge win—low runtime cost, stream districts on-demand.
- **Reactylon/Babylon**: Canvas-based → native touch events, `engine.resize()` on fold/orientation change.
- **Quest/Combat UI**: Babylon.GUI for in-world markers (touch-friendly), React DOM overlays for menus (responsive flex).
- **GenAI Assets**: 20–30k poly budget → mobile-safe; cel-shading hides LOD switches.
- **Save/Load**: localStorage syncs across web/mobile wrapper.

## Testing Plan
- **Baseline**: Pixel 8a physical device (emulators lie on GPU).
- **Complex**: OnePlus Open (fold/unfold cycles).
- **Weekly**: Babylon profiler + Chrome devtools remote debugging.