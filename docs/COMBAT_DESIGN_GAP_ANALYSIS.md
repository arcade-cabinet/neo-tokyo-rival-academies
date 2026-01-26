# Combat Design Gap Analysis & Pivot

**Date**: January 16, 2026
**Updated**: January 26, 2026
**Status**: IMPLEMENTED - Unity 6 DOTS systems complete.

---

## Unity 6 Implementation Status

| Gap | Status | Unity Implementation |
|-----|--------|---------------------|
| Scene Management | COMPLETE | `CombatSystem.cs` - handles Exploration <-> Combat state transitions |
| Transition VFX | COMPLETE | `ArenaSystem.cs` - screen capture + shader-based distortion |
| State Persistence | COMPLETE | `CombatComponents.cs` - ECS components for player state snapshot/restore |
| Combat Arenas | COMPLETE | `ArenaSystem.cs` - dedicated arena prefab loading with optimized camera |
| Environmental Hazards | COMPLETE | `HazardSystem.cs` - hazard spawning, damage, and arena integration |

### Key Unity Files

```
Assets/Scripts/Systems/Combat/
├── CombatSystem.cs           # Turn-based combat loop, initiative ordering
├── ArenaSystem.cs            # Arena loading, camera, background selection
├── HazardSystem.cs           # Environmental hazard logic
└── Components/
    └── CombatComponents.cs   # CombatState, PartyMember, EnemyGroup, ArenaConfig
```

---

## 1. Problem: The "Real-Time" Trap

The original "Real-Time RPG Combat" vision (MMO-style on the diorama map) created severe friction:
- **Mobile Controls**: Virtual sticks + skill buttons on a cluttered isometric map is unplayable on 6" screens.
- **Visual Clarity**: Effects obscured the beautiful diorama; text was unreadable.
- **Pacing**: "Kiting" enemies on a hex grid felt clunky, not tactical.

## 2. Solution: The "Spin-Out" Pivot

We align with classic JRPG roots (Final Fantasy 7, Persona 5, Octopath Traveler).
**Mechanic**:
1.  **Trigger**: Touch enemy on map / Scripted event.
2.  **Transition**: Screen effect (shatter/swirl) + Haptic heavy pulse.
3.  **Arena**: Dedicated scene (no layout clutter, optimized camera).
    - Player Party (Left) vs Enemy Group (Right).
    - Cinematic camera angles for skills.
4.  **Victory**: XP tally screen → Fade back to Diorama (enemy model removed).

## 3. Alignment with Pillars

- **Production Quality**: Allows higher-poly models/effects in arena (fewer objects rendered).
- **Mobile First**: Turn-based menu inputs are perfect for touch; no frantic twitch reflexes needed.
- **Rivalry**: Vera can join as AI party member or invade as boss without pathfinding jank.

## 4. Implementation Gaps & Plan

| Gap | Solution | Unity 6 Status |
|-----|----------|----------------|
| **Scene Management** | State machine: `Exploration` <-> `Combat`. | COMPLETE: `CombatSystem.cs` with DOTS state machine |
| **Transition VFX** | Shader-based screen capture + distortion. | COMPLETE: `ArenaSystem.cs` transition pipeline |
| **State Persistence** | Save player pos/health before spin-out; restore after. | COMPLETE: `CombatComponents.cs` ECS snapshot |
| **Backgrounds** | Reuse diorama skybox/lighting but blur the hex grid or swap to "Arena" variant. | COMPLETE: `ArenaConfig` component with district-based background selection |

## 5. Technical Architecture for Spin-Out

> **Unity 6 Note**: The architecture below is now implemented in Unity DOTS. See `CombatSystem.cs` for the main loop and `ArenaSystem.cs` for scene management.

To achieve seamless transitions on mobile (Pixel 8a target), we avoid full-page reloads.

### A. Scene Stacking

Instead of unmounting the Diorama, we pause it and overlay the Combat Scene.
- **DioramaScene**: Paused (no tick), rendering suspended or blurred.
- **CombatScene**: Mounted on top, active tick.
- **Memory**: Ensure Diorama assets aren't disposed unless memory pressure is high.

### B. State Transfer Protocol

When `Trigger` occurs, the `GameStore` must snapshot:
1.  **Player State**: Current HP, MP, Equipment, Buffs.
2.  **Enemy Group**: IDs of enemies engaging (allows multi-enemy pulls).
3.  **Environment**: ID of current district (selects combat background).
4.  **Return Callback**: Function to execute on victory/flee (e.g., `removeEntity(enemyId)`).

### C. Transition Sequence (Target < 1.5s)

1.  **Freeze**: Diorama input disabled.
2.  **Shatter**: Shader effect applied to main canvas.
3.  **Load**: Combat assets preload (if not resident).
4.  **Swap**: Combat Camera activates.
5.  **Fight**: Turn-based loop.
6.  **Results**: XP summary overlay.
7.  **Fade**: Return to Diorama.

## 6. Reference Models

- **Persona 5**: UI style, snappy transitions, "All-Out Attack" (Break finish).
- **FF7 Remake**: ATB gauge integration (Ignition/Flow stats).
- **Honkai Star Rail**: Mobile-first turn-based camera work.

---

## 7. Unity 6 DOTS Implementation Details

### Combat System Architecture

The combat system is built on Unity 6 DOTS (Data-Oriented Technology Stack) for optimal mobile performance:

```csharp
// CombatComponents.cs - ECS Component Definitions
public struct CombatState : IComponentData {
    public CombatPhase Phase;          // Idle, Transition, Active, Victory, Defeat
    public int TurnCount;
    public Entity CurrentActor;
}

public struct PartyMember : IComponentData {
    public int HP, MaxHP;
    public int MP, MaxMP;
    public Stats BaseStats;            // Structure, Ignition, Logic, Flow
    public AlignmentValue Alignment;
}

public struct EnemyGroup : IComponentData {
    public FixedList128Bytes<Entity> Enemies;
    public int TotalXP;
}
```

### Arena System

```csharp
// ArenaSystem.cs - Combat arena management
public partial class ArenaSystem : SystemBase {
    protected override void OnUpdate() {
        // Handles arena instantiation, camera positioning, background selection
        // Uses district ID to select appropriate combat backdrop
    }
}
```

### Hazard System

```csharp
// HazardSystem.cs - Environmental combat hazards
public partial class HazardSystem : SystemBase {
    // Spawns hazards based on arena type
    // Processes hazard damage each turn
    // Handles hazard-alignment interactions
}
```

---

Last Updated: 2026-01-26