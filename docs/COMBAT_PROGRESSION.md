# Combat & Progression System v1.0

## Stats Design
| Stat | Purpose | Feel |
|------|---------|------|
| **Structure** | HP, Defense | Tanky, durable |
| **Ignition** | Attack, Criticals | Aggressive, explosive |
| **Logic** | Skills, Special | Tactical, calculated |
| **Flow** | Speed, Evasion | Fluid, responsive |

## Combat Formulas
- **Damage**: `base = max(1, floor(attacker.Ignition * 2 - defender.Structure * 0.5)); total = base ± variance(10%)`
- **Crit Chance**: `min(0.5, attacker.Ignition * 0.01 + alignmentBonus)` (Kurenai lean +0.1 crit)
- **Hit/Evade**: `hitChance = 0.8 + (attacker.Flow - defender.Flow) * 0.05`
- **Skill Cost**: Logic-based specials deduct "Mana" pool
- **XP Gain**: `xp = enemyLevel * 50 + bonus(alignment match)`

## Encounter Templates (Seeded)
1. **Street Patrol (Common, Mid Density)**
   - Waves: 2 (3 grunts wave 1, 2 + elite wave 2)
   - Micro Flow: Ambush on boulevard → player positions on hex → turn-based or real-time hybrid
   - Alignment Hook: Stealth evade (Azure +XP) vs aggressive rush (Kurenai crit bonus)

2. **Boss Fight (Cluster Climax, e.g., Cyber-Yakuza Boss)**
   - Phases: 3 (Grunt summon → Area attacks → Desperation)
   - Rivalry Tie: Vera commentary post-fight varies by alignment
   - Reward: Major XP + item (e.g., "Redline Piston Fragment" for Kurenai)

3. **Secret Ambush (Low Density, Mystery)**
   - Waves: 1 surprise + chase
   - Hook: Alignment extreme → unique enemy (cursed for Kurenai, encrypted for Azure)

## Progression System (Zustand Store)
- **XP Curve**: `xpToNext = level * 500 + 500` (linear-ish, ~15–20 levels)
- **Level-Up**: +4 points (choice) + 1 fixed (alignment bias)
- **Inventory**: 12 slots, equip 1 weapon + 2 accessories.

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