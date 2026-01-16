# Mobile & Web Integration Guide

> **CRITICAL CONSTRAINT**: Mobile-first development. All decisions must validate against Pixel 8a baseline fun.

## Baseline Device Requirements

### Primary Target: Google Pixel 8a
- **Performance**: 60 FPS locked, no frame drops during combat
- **Load Time**: <3.5 seconds to interactive state
- **Touch Latency**: <50ms input response
- **Battery**: >4 hours continuous gameplay
- **Memory**: <150MB heap usage

### Secondary Target: OnePlus Open (Foldable)
- **Fold Transitions**: Seamless fold/unfold without control loss
- **Mode Switching**: Phone (outer screen) → Tablet (inner screen)
- **Test Gate**: 100 fold/unfold cycles with no jank

## Viewport Detection & Adaptation

### Device Detection Logic

```typescript
// In App.tsx or BootstrapManager
const detectDevice = () => {
  const vw = window.visualViewport?.width || window.innerWidth;
  const isPortrait = window.innerHeight > window.innerWidth;

  // Mobile baseline
  const isMobile = /Mobi|Android|iPhone/i.test(navigator.userAgent);

  // Viewport modes
  let viewportMode: 'phone' | 'tablet' = 'phone';
  if (vw > 768 || (isMobile && vw > 600 && !isPortrait)) {
    viewportMode = 'tablet';
  }

  return { isMobile, viewportMode, isPortrait };
};

// Listen for foldable transitions
window.visualViewport?.addEventListener('resize', () => {
  engine.resize();
  detectDevice(); // Re-evaluate mode
});
```

### Responsive Breakpoints

| Mode | Width Range | HUD Layout | Control Style |
|------|-------------|------------|---------------|
| Phone/Folded | < 768px | Vertical stack | Joystick left, buttons right |
| Tablet/Unfolded | >= 768px | Horizontal panels | Expanded clusters, mini-map |

## Touch Control Mapping

### Universal Controls

- **Movement**: Virtual analog stick (bottom-left thumb zone)
- **Interact/Target**: Tap on hex/object
- **Parkour Gestures**:
  - Swipe up: Jump/climb (Flow stat modifier)
  - Swipe side: Wall-run/dodge (Ignition burst)
  - Hold + drag: Aim special (Logic precision)
- **Camera**: Pinch zoom, two-finger drag pan

### Mode-Specific Layouts

| Control | Phone Position | Tablet Position | Haptic |
|---------|----------------|-----------------|--------|
| Joystick | Bottom-left | Bottom-left corner | Light on move |
| Action Cluster | Bottom-right | Bottom-right spread | Medium on press |
| Target Lock | Tap/hold | Pointer-like drag | - |
| Quest Log | Swipe up from bottom | Persistent side panel | - |
| Alignment Meter | Top-center | Top-center expanded | Chime on shift |
| Pause/Menu | Top-right icon | Top-right expanded | Light |

## Performance Optimization Rules

### Memory Management

1. **District Streaming**: Only 2-3 districts resident at a time
2. **Asset Disposal**: Unload distant districts (>100 units from player)
3. **Texture Compression**: Use WebP/KTX2 for mobile
4. **LOD System**: Simpler meshes at distance

### Battery Conservation

1. **Audio**: Max 4-6 concurrent sounds, spatial only near player
2. **Particles**: Reduce density on mobile
3. **Frame Timing**: Adaptive quality if FPS drops below 50
4. **Background**: Auto-pause on app background (Capacitor lifecycle)

### Loading Strategy

```typescript
// Progressive load priority
const initCore = async () => {
  // Priority 1: Core (hero + camera + hex prototype)
  await preloadCoreAssets();

  // Priority 2: Starter district
  await loadDistrict('academy-gate-slums');

  // Priority 3: Adjacent on-demand
  // (loaded in movement system when approaching)
};
```

## Deployment Targets

### PWA (Primary)
- Service worker for offline capability
- Web App Manifest for "Add to Home Screen"
- Instant load from cache

### Capacitor Native Wrapper
- iOS App Store / Google Play deployment
- Native haptics via `@capacitor/haptics`
- Native audio via Capacitor plugins
- Lifecycle management (pause/resume)

## Physical Testing Gates

| Phase | Device | Test Criteria | Pass Condition |
|-------|--------|---------------|----------------|
| Phase 1 | Pixel 8a | Boot time | <3.5s interactive |
| Phase 1 | Pixel 8a | Combat FPS | 60 FPS locked |
| Phase 2 | OnePlus Open | Fold transitions | No control loss |
| Phase 3 | Pixel 8a | Battery drain | >4h continuous |
| Phase 3 | OnePlus Open | Extended session | 2h no jank |

## Foldable Transition Handling

```typescript
// On visualViewport resize
window.visualViewport?.addEventListener('resize', () => {
  // 1. Fade controls (0.2s)
  fadeControls(0.2);

  // 2. Resize engine
  engine.resize();

  // 3. Reflow HUD positions
  updateHUDLayout(detectDevice().viewportMode);

  // 4. Preserve gesture state
  // (mid-parkour completes normally)
});
```

## Anti-Patterns (Avoid These)

- Runtime GenAI calls (battery/latency killer)
- Heavy post-processing (bloom/SSAO on mobile)
- Uncompressed audio loops
- DOM-heavy overlays (use canvas-based HUD)
- Blocking main thread during load

---

*This guide is the critical constraint for all development decisions. When in doubt, test on Pixel 8a.*
