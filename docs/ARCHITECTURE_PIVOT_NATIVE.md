# Architecture Pivot: Unified Ionic Angular App

**Date**: January 27, 2026
**Status**: Pivot to a single Ionic Angular + Babylon.js app wrapped by Capacitor.

## 1. The Problem with Multi-App Splits
Multiple app shells (web, Expo/RN, desktop) increase maintenance cost and break feature parity.

## 2. The Solution: One Web App + Capacitor
We adopt a **single** Ionic Angular app and wrap it with Capacitor for Android/iOS, with optional Electron for desktop.

- **UI**: Ionic + Angular
- **3D**: Babylon.js (WebGL)
- **Logic**: Shared ECS packages

## 3. Current Repo Layout

```
root/
├── app/              # Ionic Angular unified app
├── packages/         # Shared game logic/data
└── docs/             # Golden Record
```

## 4. Migration Steps
1. **Scaffold** Ionic Angular app in `app/`.
2. **Port** React/Reactylon UI and Babylon scene to Angular + Babylon imperative.
3. **Wire** ECS packages into the app.
4. **Remove/Archive** legacy React/Expo apps.
5. **Add** optional Electron target using same web bundle.

## 5. Compatibility Analysis

| Feature | Unified App (Ionic + Babylon) | Notes |
|---------|-------------------------------|-------|
| Rendering | Babylon.js WebGL | Single pipeline |
| Input | Ionic + Capacitor | Native-friendly touch |
| UI | Ionic components | Accessible and mobile-ready |
| ECS | Miniplex | Shared in packages |
| Assets | Web bundle | Serves from `/assets` |

---

*This doc supersedes the previous React Native/Babylon Native pivot.*
