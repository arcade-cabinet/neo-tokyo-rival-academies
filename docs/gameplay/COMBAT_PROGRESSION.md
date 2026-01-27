# Combat & Progression System v1.1

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
- **Arena**: Dedicated combat stage, clean UI.
  - **Party**: Player + Rival (if allied) vs Enemy Group.
  - **Turn Order**: Determined by Flow.
  - **Victory**: XP/Loot summary → return to scene.

---

## Combat Formulas

- **Damage**: `base = max(1, floor(attacker.Ignition * 2 - defender.Structure * 0.5)); total = base ± variance(10%)`
- **Crit Chance**: `min(0.5, attacker.Ignition * 0.01 + alignmentBonus)`
- **Hit/Evade**: `hitChance = 0.8 + (attacker.Flow - defender.Flow) * 0.05`
- **Skill Cost**: Logic-based specials deduct “Mana” pool
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

- **XP Curve**: `xpToNext = level * 500 + 500` (linear-ish, ~15–20 levels)
- **Level-Up**: +4 points (choice) + 1 alignment bonus
- **Inventory**: 12 slots, equip 1 weapon + 2 accessories

---

## Item System (Alignment-Biased Drops)

| Type       | Example Item                  | Stat Boost                  | Special Effect                          | Alignment Lean |
|------------|-------------------------------|-----------------------------|-----------------------------------------|----------------|
| Weapon     | Redline Piston Hammer         | +Ignition / +Flow           | Crit chance +10%, high variance damage  | Kurenai       |
| Weapon     | Null Set Lance                | +Logic / +Structure         | Hit chance +15%, counter on evade       | Azure         |
| Armor      | Synth-Sapphire Implant        | +Structure                  | Damage reduction +20%                   | Neutral/Azure |
| Accessory  | Glowing Datavault Chip        | +Logic                      | Skill mana regen +30%                   | Azure         |
| Accessory  | Cursed Overgrowth Vine        | +Flow                       | Evasion +15%, risk of status debuff     | Kurenai       |
| Consumable | Neon Adrenaline Shot          | Temp +Ignition              | Burst damage turn                       | Kurenai       |
| Key Item   | Encrypted Passcode            | None                        | Progression unlock (elevator/door)      | Quest-specific|

---

Last Updated: 2026-01-27
