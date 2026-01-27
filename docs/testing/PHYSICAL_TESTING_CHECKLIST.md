# Physical Testing Checklist

> **Updated**: January 27, 2026 | **Platform**: Ionic Angular + Babylon.js (Capacitor)

## Target Devices

- **Baseline**: Pixel 8a
- **Secondary**: OnePlus Open

## Build & Install

1. `pnpm build`
2. `pnpm cap:sync`
3. Open native projects:
   - Android: `pnpm cap:open:android`
   - iOS: `pnpm cap:open:ios`

## Runtime Checks

- **FPS**: 60 sustained in core scenes
- **Boot**: <3.5s to interactive
- **Memory**: <200MB heap
- **Thermals**: stable after 10 minutes

## Input & UX

- Touch targets ≥ 48px
- Dialogue advance and menus responsive
- Landscape lock verified

## Visual Fidelity

- Toon shading consistent
- No neon or high-tech chrome
- Weathered materials present

