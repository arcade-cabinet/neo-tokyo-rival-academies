# Combat Design Gap Analysis & Pivot

**Date**: January 16, 2026
**Status**: Pivot from Real-Time Hybrid to JRPG Spin-Out.

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
| Gap | Solution |
|-----|----------|
| **Scene Management** | Need `CombatScene` component in Reactylon. State machine: `Exploration` ↔ `Combat`. |
| **Transition VFX** | Shader-based screen capture + distortion. |
| **State Persistence** | Save player pos/health before spin-out; restore after. |
| **Backgrounds** | Reuse diorama skybox/lighting but blur the hex grid or swap to "Arena" variant. |

## 5. Technical Architecture for Spin-Out
To achieve seamless transitions on mobile (Pixel 8a target), we avoid full page reloads.

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