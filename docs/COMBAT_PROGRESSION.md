# Combat & Progression System

> **Purpose**: Define combat mechanics, damage formulas, and character progression.

## Core Combat Philosophy

- **Stats-Driven**: Every combat decision ties to the four stats
- **Visible Previews**: Show damage calculations before commitment
- **Alignment Expression**: Combat style reflects philosophical lean
- **Anime Style**: DBZ/Kill La Kill dramatic clash aesthetic

## The Four Stats

| Stat | Combat Role | Base Value | Per-Level | Cap |
|------|-------------|------------|-----------|-----|
| **Structure** | HP, Defense | 10 | +2 | 50 |
| **Ignition** | Attack, Crit | 10 | +2 | 50 |
| **Logic** | Skills, Resource | 10 | +2 | 50 |
| **Flow** | Speed, Evasion | 10 | +2 | 50 |

## Damage Formulas

### Base Physical Damage

```typescript
const calculatePhysicalDamage = (attacker: Stats, defender: Stats): number => {
  const base = Math.max(1, Math.floor(attacker.ignition * 2 - defender.structure * 0.5));
  const variance = base * 0.1; // ±10%
  return base + Math.floor((Math.random() - 0.5) * 2 * variance);
};
```

### Critical Hits

```typescript
const calculateCrit = (attacker: Stats, alignment: number): { isCrit: boolean; multiplier: number } => {
  const baseCritChance = attacker.ignition * 0.01;
  const alignmentBonus = alignment < -0.6 ? 0.1 : 0; // Kurenai bonus
  const critChance = Math.min(0.5, baseCritChance + alignmentBonus);

  const baseCritDamage = 1.5;
  const alignmentDamageBonus = alignment < -0.6 ? 0.2 : 0;

  return {
    isCrit: Math.random() < critChance,
    multiplier: baseCritDamage + alignmentDamageBonus,
  };
};
```

### Hit/Evasion

```typescript
const calculateHitChance = (attacker: Stats, defender: Stats, alignment: number): number => {
  const base = 0.8;
  const flowDiff = (attacker.flow - defender.flow) * 0.05;
  const alignmentBonus = alignment > 0.6 ? 0.1 : 0; // Azure evasion bonus for defender
  return Math.max(0.3, Math.min(0.95, base + flowDiff - alignmentBonus));
};
```

### Skill Costs

```typescript
const calculateSkillCost = (baseSkill: Skill, user: Stats, alignment: number): number => {
  const logicReduction = user.logic * 0.02; // 2% per logic point
  const alignmentReduction = alignment > 0.6 ? 0.2 : 0; // Azure 20% reduction
  return Math.floor(baseSkill.cost * (1 - logicReduction - alignmentReduction));
};
```

## Combat Flow

### Turn Order (Speed-Based)

```typescript
const determineTurnOrder = (participants: Combatant[]): Combatant[] => {
  return [...participants].sort((a, b) => {
    const aSpeed = a.stats.flow + Math.random() * 5;
    const bSpeed = b.stats.flow + Math.random() * 5;
    return bSpeed - aSpeed;
  });
};
```

### Action Types

| Action | Stat Used | Description |
|--------|-----------|-------------|
| Attack | Ignition | Basic physical damage |
| Skill | Logic | Special ability, costs resource |
| Guard | Structure | Reduce incoming damage 50% |
| Evade | Flow | Attempt to dodge next attack |

## Encounter Templates

### Street Patrol (Common)

```typescript
const streetPatrolTemplate: EncounterTemplate = {
  waves: [
    { enemies: ['grunt', 'grunt', 'grunt'] },
    { enemies: ['grunt', 'grunt', 'elite'] },
  ],
  rewards: { xp: 50, credits: 100 },
  alignmentHook: {
    stealth: { shift: 0.1, label: 'Azure: Avoid unnecessary violence' },
    aggressive: { shift: -0.1, label: 'Kurenai: Show them your strength' },
  },
};
```

### Boss Fight (Climax)

```typescript
const bossTemplate: EncounterTemplate = {
  phases: [
    {
      name: 'Opening',
      hpThreshold: 1.0,
      behavior: 'summon_grunts',
      attacks: ['ignition_burst'],
    },
    {
      name: 'Desperation',
      hpThreshold: 0.5,
      behavior: 'area_attacks',
      attacks: ['logic_counter_required'],
    },
    {
      name: 'Final Stand',
      hpThreshold: 0.25,
      behavior: 'all_out',
      attacks: ['flow_evasion_test'],
    },
  ],
  rewards: { xp: 500, item: 'boss_trophy', unlock: 'next_stratum' },
};
```

## Enemy Types by District

| District | Common | Elite | Boss |
|----------|--------|-------|------|
| Neon | Jittery Runner | Holo-Drone | Overbright Enforcer |
| Corporate | Elite Guard | Security Bot | Corporate Fixer |
| Slum | Lurking Shadow | Overgrown Mutant | Cursed Beast |
| Industrial | Sparking Mech | Heavy Laborer | Forge Overseer |

## XP & Leveling

### XP Formula

```typescript
const calculateXP = (enemyLevel: number, alignment: number, bonuses: XPBonuses): number => {
  const base = enemyLevel * 50;
  const alignmentMatch = bonuses.matchedAlignment ? 1.2 : 1.0;
  const firstKill = bonuses.firstEncounter ? 1.5 : 1.0;
  return Math.floor(base * alignmentMatch * firstKill);
};
```

### Level Requirements

```typescript
const xpForLevel = (level: number): number => {
  // Quadratic curve: 100, 400, 900, 1600...
  return level * level * 100;
};

const checkLevelUp = (currentXP: number, currentLevel: number): boolean => {
  return currentXP >= xpForLevel(currentLevel + 1);
};
```

### Level-Up Rewards

| Level | Stat Points | Unlock |
|-------|-------------|--------|
| 1-5 | +2 per level | Basic skills |
| 6-10 | +2 per level | Faction skills |
| 11-15 | +2 per level | Advanced combos |
| 16-20 | +2 per level | Ultimate abilities |

## Item System

### Equipment Slots

| Slot | Stat Modifiers | Example Items |
|------|----------------|---------------|
| Weapon | +Ignition, +Logic | Redline Piston (+5 Ignition) |
| Armor | +Structure, +Flow | Kurenai Jacket (+3 Structure, +2 Flow) |
| Accessory | Any | Azure Implant (+2 Logic) |

### Item Rarity

| Rarity | Stat Range | Drop Rate |
|--------|------------|-----------|
| Common | +1-2 | 60% |
| Uncommon | +2-3 | 25% |
| Rare | +3-4 | 12% |
| Epic | +4-5 | 3% |

### Faction Gear

| Item | Faction | Bonus | Alignment Requirement |
|------|---------|-------|-----------------------|
| Redline Piston | Kurenai | +5 Ignition, +10% Crit | < -0.3 |
| Null Set | Azure | +5 Logic, -20% Skill Cost | > +0.3 |
| Shadow Cloak | Neutral | +5 Flow, +15% Evasion | None |

## Reputation System

### Faction Reputation

```typescript
interface ReputationStore {
  kurenai: number;  // 0-100
  azure: number;    // 0-100
  underground: number; // 0-100

  gainRep: (faction: string, amount: number) => void;
  unlockCheck: (faction: string, threshold: number) => boolean;
}
```

### Reputation Rewards

| Threshold | Kurenai Reward | Azure Reward |
|-----------|----------------|--------------|
| 25 | Discount at faction shops | Access to intel broker |
| 50 | Faction skill unlock | Advanced equipment |
| 75 | Special side quests | VIP area access |
| 100 | Ultimate weapon | Ultimate skill |

## Progression Pacing

### Target Levels by Act

| Act | Player Level | Enemy Level | Boss Level |
|-----|--------------|-------------|------------|
| 1 | 1-5 | 1-4 | 5 |
| 2 | 6-12 | 5-10 | 12 |
| 3 | 13-20 | 11-18 | 20 |

### Estimated Runtime

| Content | Time | XP Gained |
|---------|------|-----------|
| Main Quest | 1.5-2h | ~5000 |
| Side Quests | 1h | ~3000 |
| Exploration | 30min | ~1000 |
| **Total** | **3h** | **~9000** |

---

*Every stat matters. Every fight expresses your philosophy.*
