# Scene Architecture - Technical Design

**Date**: January 2026
**Status**: In Development

## Core Design Decisions

### 1. Procedural Backgrounds (NOT AI-Generated Images)

**Problem**: AI-generated background images don't have collision data. Players would walk "through" buildings visible in the image.

**Solution**: Generate background layers as **actual 3D geometry** so collision matches visuals.

```
ProceduralBackground component generates:
├── Ground plane (y=0) - where characters walk
├── Building collision boxes - invisible, define walkable bounds
├── Visual buildings - visible geometry at various Z depths
└── Decorative elements (neon signs, windows)
```

### 2. Layer Structure (FF7 Diorama Style)

| Layer | Z Depth | Purpose |
|-------|---------|---------|
| Foreground | z = 0 | Player, NPCs, props on ground plane |
| Side buildings | z = -5 to -15 | Frame left/right edges, have collision |
| Midground | z = -15 to -25 | Close background buildings |
| Far background | z = -35 to -60 | Distant cityscape (no collision) |

### 3. Scene Manager Pattern

Each stage is defined in `SceneManager.ts`:
- Type-safe stage configs
- Asset dependency lists
- Transition triggers
- Build-time validation

### 4. Collision System

PlayerController now supports:
- Outer bounds (scene edges)
- Mesh-based collision (AABB)
- Collision meshes passed from ProceduralBackground

## Remaining Gaps (Action Items)

### Missing Assets

| Asset | Location | Status |
|-------|----------|--------|
| Alien ship backgrounds | packages/game/public/assets/backgrounds/alien_ship/ | NOT CREATED |
| Mall interior backgrounds | packages/game/public/assets/backgrounds/mall/ | NOT CREATED |
| Sunset rooftop backgrounds | packages/game/public/assets/backgrounds/sunset/ | NOT CREATED |
| Summit/elevator backgrounds | packages/game/public/assets/backgrounds/summit/ | NOT CREATED |

### Missing Systems

1. **Dialogue System** - Visual novel style overlays with character portraits
2. **Quest/Objective Tracking** - HUD element showing current objective
3. **Combat System** - Boss fight mechanics
4. **Scene Transitions** - Fade/wipe effects between stages
5. **NPC AI** - Yakuza patrols, Vera rival behavior

### Scene Implementation Status

| Scene | File | Status |
|-------|------|--------|
| Intro Cutscene | scenes/IntroScene.tsx | NOT CREATED |
| Sector 7 Streets | scenes/Sector7Scene.tsx | SKELETON |
| Alien Ship | scenes/AlienShipScene.tsx | NOT CREATED |
| Mall Drop | scenes/MallDropScene.tsx | NOT CREATED |
| Boss Ambush | scenes/BossAmbushScene.tsx | NOT CREATED |
| Rooftop Chase | scenes/RooftopChaseScene.tsx | NOT CREATED |
| Summit Climb | scenes/SummitClimbScene.tsx | NOT CREATED |
| Final Battle | scenes/FinalBattleScene.tsx | NOT CREATED |
| Epilogue | scenes/EpilogueScene.tsx | NOT CREATED |

## Component Inventory

### @neo-tokyo/diorama package

| Component | Purpose | Status |
|-----------|---------|--------|
| ProceduralBackground | Seeded 3D background generation | ✅ Created |
| Character | GLB model loading + animation | ✅ Working |
| PlayerController | Movement + collision | ✅ Updated |
| IsometricCamera | Fixed angle camera | ✅ Working |
| DirectionalLightWithShadows | Scene lighting | ✅ Working |
| CyberpunkNeonLights | Accent lights | ✅ Working |
| QuestMarkers | Interactive objectives | ✅ Created |
| DataShards | Collectibles | ✅ Created |

### Deprecated Components

| Component | Reason | Replacement |
|-----------|--------|-------------|
| HexTileFloor | Hex tiles don't suit linear JRPG | Ground plane in ProceduralBackground |
| BackgroundPanels (image-based) | No collision data | ProceduralBackground |
| ForegroundProps (procedural) | Should use Meshy GLBs | Scene-specific prop loading |
| MidgroundFacades | Merged into ProceduralBackground | ProceduralBackground |

## Next Steps (Priority Order)

1. Create IntroScene with cutscene system
2. Implement dialogue overlay component
3. Complete Sector7Scene with NPCs and objectives
4. Create AlienShipScene (first C-story disruptor)
5. Add scene transition effects
6. Test end-to-end playthrough of first 2 stages
