# Combat & Progression System v1.2

**Updated**: January 27, 2026

---

## Stats Design

| Stat | Purpose | Feel |
|------|---------|------|
| **Structure** | HP, Defense | Tanky, durable |
| **Ignition** | Attack, Criticals | Aggressive, explosive |
| **Logic** | Skills, Special | Tactical, calculated |
| **Flow** | Speed, Evasion | Fluid, responsive |

---

## Combat Mechanics (Spin-Out)

- **Trigger**: Enemy contact or scripted event on scene.
- **Transition**: Screen shatter/spin effect.
- **Arena**: Dedicated combat stage with clear UI.
  - **Party**: Player + Rival (if allied) vs Enemy Group.
  - **Turn Order**: Determined by Flow.
  - **Victory**: XP/Loot summary -> return to scene.

## Why Spin-Out Combat (Design Rationale)

- **Mobile clarity**: touch controls stay readable on small screens.
- **Presentation**: dedicated arena improves UI legibility and VFX staging.
- **Pacing**: clean rhythm for JRPG encounters and rivalry beats.

### Transition Protocol
1. Freeze exploration input and pause exploration tick.
2. Capture player state and encounter group.
3. Load arena background and combat UI.
4. Run turn loop until victory/defeat.
5. Apply rewards, restore exploration state.

### Required Systems
| Gap | Solution | Target Implementation |
|-----|----------|-----------------------|
| Scene management | Exploration ↔ Combat state machine | Angular view state + Babylon scene toggle |
| Transition VFX | Screen shatter/swirl + audio | Babylon post-process + UI overlay |
| State persistence | Snapshot player/enemy state | Zustand store snapshot + SaveSystem hooks |
| Backgrounds | Scene-specific combat backdrops | Story/scene metadata selects assets |
| Hazards | Arena hazards and buffs/debuffs | CombatSystem extensions |

---

## Combat Formulas

- **Damage**: `base = max(1, floor(attacker.Ignition * 2 - defender.Structure * 0.5)); total = base +/- variance(10%)`
- **Crit Chance**: `min(0.5, attacker.Ignition * 0.01 + alignmentBonus)`
- **Hit/Evade**: `hitChance = 0.8 + (attacker.Flow - defender.Flow) * 0.05`
- **Skill Cost**: Logic-based specials deduct a "Focus" pool
- **XP Gain**: `xp = enemyLevel * 50 + alignmentBonus`

---

## Encounter Templates (Flooded World)

1. **Rooftop Patrol (Common)**
   - **Trigger**: Guard contact or alarm.
   - **Arena**: Rooftop platform.
   - **Hook**: Kurenai rush vs Azure precision.

2. **Dock Raid (Boss)**
   - **Trigger**: Cutscene ambush.
   - **Arena**: Dock + barge deck.
   - **Hook**: Hazard zones + moving platform.

3. **Deep Ambush (Secret)**
   - **Trigger**: Suspicious salvage.
   - **Arena**: Flooded interior.
   - **Hook**: Visibility penalty + breath timer.

---

## Progression System

- **XP Curve**: `xpToNext = level * 500 + 500` (linear-ish, ~15-20 levels)
- **Level-Up**: +4 points (choice) + 1 alignment bonus
- **Inventory**: 12 slots, equip 1 weapon + 2 accessories

---

## Item System (Alignment-Biased Drops)

| Type       | Example Item               | Stat Boost | Special Effect | Alignment Lean |
|------------|----------------------------|------------|----------------|----------------|
| Weapon     | Redline Piston Hammer      | +Ignition / +Flow | Crit chance +10% | Kurenai |
| Weapon     | Null Set Lance             | +Logic / +Structure | Counter on evade | Azure |
| Armor      | Salvage-Plated Vest        | +Structure | Damage reduction +20% | Neutral |
| Accessory  | Water Filter Core          | +Logic | Focus regen +20% | Azure |
| Accessory  | Salvager's Rope Harness    | +Flow | Evasion +15% | Kurenai |
| Consumable | Storm Adrenaline Shot      | Temp +Ignition | Burst damage turn | Kurenai |
| Key Item   | Floodgate Keycard          | None | Unlocks story gate | Quest |

---

Last Updated: 2026-01-27
