# Combat Design Gap Analysis & Spin-Out Pivot

**Updated**: January 27, 2026

---

## Problem: Real-Time Diorama Combat

- **Mobile controls** are too dense for a 6" screen.
- **Visual clarity** suffers with effects over isometric tiles.
- **Pacing** feels clunky for a JRPG.

---

## Solution: Spin-Out Combat (JRPG Arena)

**Flow**:
1. **Trigger**: Touch enemy on map or scripted event.
2. **Transition**: Screen effect + haptic pulse.
3. **Arena**: Dedicated combat scene with clean UI.
4. **Victory**: XP/loot summary → return to scene.

**Why it fits**:
- Touch-first inputs
- Higher fidelity combat presentation
- Clear rivalry beats with Vera

---

## Required Systems (Current Stack)

| Gap | Solution | Target Implementation |
|-----|----------|-----------------------|
| Scene management | Exploration ↔ Combat state machine | Angular view state + Babylon scene toggle |
| Transition VFX | Screen shatter/swirl + audio | Babylon post-process + UI overlay |
| State persistence | Snapshot player/enemy state | Zustand store snapshot + SaveSystem hooks |
| Backgrounds | Scene-specific combat backdrops | Story/scene metadata selects assets |
| Hazards | Arena hazards and buffs/debuffs | CombatSystem extensions |

---

## Transition Protocol

1. Freeze exploration input and pause exploration tick.
2. Capture player state and encounter group.
3. Load arena background and combat UI.
4. Run turn loop until victory/defeat.
5. Apply rewards, restore exploration state.

---

## References

- `/docs/gameplay/COMBAT_PROGRESSION.md`
- `/docs/story/STORY_FLOODED.md`
- `/docs/tech/ARCHITECTURE.md`

