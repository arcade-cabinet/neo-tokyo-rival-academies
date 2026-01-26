# Combat & Progression System v1.0

**Updated**: January 26, 2026
**Status**: IMPLEMENTED in Unity 6 DOTS

---

## Unity 6 Implementation

### Key Files

```
Assets/Scripts/Systems/Progression/
├── ProgressionSystem.cs      # XP calculation, level-up processing
├── StatAllocationSystem.cs   # Stat point distribution, alignment bonuses
└── Components/
    └── ProgressionComponents.cs  # Stats, Experience, LevelUp ECS components
```

### ECS Component Structure

```csharp
// Stats as ECS components for cache-friendly access
public struct Stats : IComponentData {
    public int Structure;   // HP, Defense
    public int Ignition;    // Attack, Criticals
    public int Logic;       // Skills, Special
    public int Flow;        // Speed, Evasion
}

public struct Experience : IComponentData {
    public int CurrentXP;
    public int Level;
    public int UnallocatedPoints;
}
```

---

## Stats Design

| Stat | Purpose | Feel |
|------|---------|------|
| **Structure** | HP, Defense | Tanky, durable |
| **Ignition** | Attack, Criticals | Aggressive, explosive |
| **Logic** | Skills, Special | Tactical, calculated |
| **Flow** | Speed, Evasion | Fluid, responsive |

## Combat Mechanics (JRPG Spin-Out)

- **Trigger**: Enemy contact or event on Isometric Diorama.
- **Transition**: Screen shatter/spin effect (classic JRPG style).
- **Combat Scene**: Separate dedicated stage (no map traversal).
  - **Party**: Player + Rival (if allied) vs Enemy Group.
  - **Turn-Based**: Order determined by Flow stat.
  - **Victory**: XP/Loot screen → Fade back to Diorama (enemies cleared).

## Combat Formulas

- **Damage**: `base = max(1, floor(attacker.Ignition * 2 - defender.Structure * 0.5)); total = base ± variance(10%)`
- **Crit Chance**: `min(0.5, attacker.Ignition * 0.01 + alignmentBonus)` (Kurenai lean +0.1 crit)
- **Hit/Evade**: `hitChance = 0.8 + (attacker.Flow - defender.Flow) * 0.05`
- **Skill Cost**: Logic-based specials deduct "Mana" pool
- **XP Gain**: `xp = enemyLevel * 50 + bonus(alignment match)`

## Encounter Templates (Seeded)

1. **Street Patrol (Common, Mid Density)**
   - **Trigger**: Random encounter or visible drone patrol.
   - **Combat Screen**: City street background (blurred/depth).
   - **Waves**: 1-2.
   - **Alignment Hook**: Stealth evade (Azure +XP) vs aggressive rush (Kurenai crit bonus) BEFORE combat spin-out.

2. **Boss Fight (Cluster Climax, e.g., Cyber-Yakuza Boss)**
   - **Trigger**: Cutscene interaction.
   - **Combat Screen**: Unique arena (HoloPlaza Center).
   - **Phases**: 3 (Grunt summon → Area attacks → Desperation).
   - **Rivalry Tie**: Vera joins party or interferes.

3. **Secret Ambush (Low Density, Mystery)**
   - **Trigger**: Inspecting "suspicious" prop.
   - **Combat Screen**: Dark alley/sewer.
   - **Hook**: Unique enemy variants.

## Progression System (Unity 6 DOTS)

> **Note**: Original Zustand store design has been migrated to Unity ECS. See `ProgressionSystem.cs` and `StatAllocationSystem.cs`.

- **XP Curve**: `xpToNext = level * 500 + 500` (linear-ish, ~15-20 levels)
- **Level-Up**: +4 points (choice) + 1 fixed (alignment bias)
- **Inventory**: 12 slots, equip 1 weapon + 2 accessories.

### Unity Implementation

```csharp
// ProgressionSystem.cs - XP and level processing
public partial class ProgressionSystem : SystemBase {
    protected override void OnUpdate() {
        Entities.ForEach((ref Experience exp, in Stats stats) => {
            int xpToNext = exp.Level * 500 + 500;
            if (exp.CurrentXP >= xpToNext) {
                exp.Level++;
                exp.CurrentXP -= xpToNext;
                exp.UnallocatedPoints += 4;
            }
        }).Schedule();
    }
}

// StatAllocationSystem.cs - Point distribution with alignment bonus
public partial class StatAllocationSystem : SystemBase {
    // Applies alignment-based bonus point (+1 to Ignition/Flow for Kurenai, Logic/Structure for Azure)
}
```

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

Last Updated: 2026-01-26