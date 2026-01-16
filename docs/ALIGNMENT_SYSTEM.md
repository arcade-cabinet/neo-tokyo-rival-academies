# Alignment System

> **Purpose**: Define the Kurenai/Azure alignment scale and its effects on gameplay.

## The Alignment Scale

```
-1.0 ←——————— Kurenai ———————— 0 ———————— Azure ——————→ +1.0
              Passion          Neutral        Logic
```

Alignment represents the player's philosophical lean between:
- **Kurenai (Crimson)**: Passion, instinct, emotion, fire
- **Azure (Cobalt)**: Logic, calculation, control, ice

## Alignment Thresholds

| Range | State | Visual | Gameplay Effects |
|-------|-------|--------|------------------|
| -1.0 to -0.6 | Extreme Kurenai | Red glow, fire particles | +2 Ignition, exclusive quests, aggressive Vera dialogue |
| -0.6 to -0.3 | Strong Kurenai | Light red tint | +1 Ignition, passion options available |
| -0.3 to +0.3 | Neutral | No tint | All options available, balanced gameplay |
| +0.3 to +0.6 | Strong Azure | Light blue tint | +1 Logic, calculation options available |
| +0.6 to +1.0 | Extreme Azure | Blue glow, ice particles | +2 Logic, exclusive quests, tactical Vera dialogue |

## Alignment Shift Sources

### Quest Completion

| Method | Shift Amount | Example |
|--------|--------------|---------|
| Aggressive completion | -0.3 to -0.4 | "Destroy the datavault" |
| Tactical completion | +0.3 to +0.4 | "Hack the datavault" |
| Neutral completion | ±0.1 | "Retrieve the datavault" |

### Dialogue Choices

| Choice Type | Shift Amount | Example |
|-------------|--------------|---------|
| Passionate response | -0.1 to -0.2 | "I'll crush anyone who stands in my way!" |
| Logical response | +0.1 to +0.2 | "Let's analyze the situation first." |
| Neutral response | 0 | "What do you suggest?" |

### Combat Approach

| Playstyle | Shift Amount |
|-----------|--------------|
| High aggression (3+ kills no damage) | -0.05 per encounter |
| Perfect evasion (0 hits taken) | +0.05 per encounter |
| Balanced | No shift |

### Side Quest Bias

| Quest Affinity | Shift on Complete |
|----------------|-------------------|
| Sabotage/Destroy quests | -0.1 |
| Negotiate/Secure quests | +0.1 |
| Exploration/Mystery | ±0.05 (random) |

## Gameplay Effects

### Stat Bonuses

```typescript
const getAlignmentBonus = (alignment: number, stat: StatType) => {
  if (stat === 'ignition' && alignment < -0.6) return 2;
  if (stat === 'ignition' && alignment < -0.3) return 1;
  if (stat === 'logic' && alignment > 0.6) return 2;
  if (stat === 'logic' && alignment > 0.3) return 1;
  return 0;
};
```

### Combat Bonuses

| Stat | Kurenai Bonus | Azure Bonus |
|------|---------------|-------------|
| Crit Chance | +10% at extreme | - |
| Crit Damage | +20% at extreme | - |
| Skill Cost | - | -20% at extreme |
| Evasion | - | +10% at extreme |

### Quest Availability

```typescript
const canAcceptQuest = (quest: Quest, alignment: number) => {
  if (quest.requires?.alignment === 'kurenai' && alignment > -0.3) return false;
  if (quest.requires?.alignment === 'azure' && alignment < 0.3) return false;
  return true;
};
```

## Rivalry Integration

Vera's dialogue and behavior adapt to player alignment:

### Extreme Kurenai (-0.6 to -1.0)
- Vera: "Your passion blinds you. I'll show you the weakness of instinct."
- Combat: Vera uses defensive tactics, waits for openings
- Relationship: Intense rivalry, potential explosive confrontation

### Neutral (-0.3 to +0.3)
- Vera: "You're unpredictable. I can't read your pattern."
- Combat: Vera adapts, mirrors player style
- Relationship: Curious respect, potential alliance

### Extreme Azure (+0.6 to +1.0)
- Vera: "We think alike, yet you lack my precision."
- Combat: Vera tests with complex patterns, rewards calculation
- Relationship: Professional rivalry, potential cold war

## Visual Feedback

### UI Elements

```typescript
// Alignment meter in HUD
const AlignmentMeter: FC<{ value: number }> = ({ value }) => {
  const kurenaiWidth = Math.max(0, -value) * 50; // %
  const azureWidth = Math.max(0, value) * 50;    // %

  return (
    <div className="alignment-meter">
      <div className="kurenai-bar" style={{ width: `${kurenaiWidth}%` }} />
      <div className="center-marker" />
      <div className="azure-bar" style={{ width: `${azureWidth}%` }} />
    </div>
  );
};
```

### Character Effects

| Range | Player Visual | Environment |
|-------|---------------|-------------|
| Extreme Kurenai | Red aura, fire trail | Warmer lighting in scenes |
| Extreme Azure | Blue aura, frost trail | Cooler lighting in scenes |
| Neutral | No effect | Default lighting |

### Sound Cues

- Shift toward Kurenai: Fire crackle SFX
- Shift toward Azure: Ice crack SFX
- Major shift (±0.3+): Faction chime

## Ending Branch Determination

Final story branch is determined by cumulative alignment at Act 3:

| Final Alignment | Ending Path | Vera Resolution |
|-----------------|-------------|-----------------|
| < -0.6 | Kurenai Ending | Passionate final duel |
| -0.6 to -0.2 | Kurenai-Leaning | Reluctant alliance |
| -0.2 to +0.2 | True Neutral | Mystery third path |
| +0.2 to +0.6 | Azure-Leaning | Strategic alliance |
| > +0.6 | Azure Ending | Calculated final test |

## Implementation

### Zustand Store

```typescript
interface AlignmentStore {
  alignment: number;
  shiftHistory: { amount: number; source: string; timestamp: number }[];

  shift: (amount: number, source: string) => void;
  getThreshold: () => 'extreme_kurenai' | 'strong_kurenai' | 'neutral' | 'strong_azure' | 'extreme_azure';
  getStatBonus: (stat: StatType) => number;
}

const useAlignmentStore = create<AlignmentStore>((set, get) => ({
  alignment: 0,
  shiftHistory: [],

  shift: (amount, source) => set((state) => ({
    alignment: Math.max(-1, Math.min(1, state.alignment + amount)),
    shiftHistory: [...state.shiftHistory, { amount, source, timestamp: Date.now() }],
  })),

  getThreshold: () => {
    const { alignment } = get();
    if (alignment < -0.6) return 'extreme_kurenai';
    if (alignment < -0.3) return 'strong_kurenai';
    if (alignment > 0.6) return 'extreme_azure';
    if (alignment > 0.3) return 'strong_azure';
    return 'neutral';
  },

  getStatBonus: (stat) => {
    const { alignment } = get();
    if (stat === 'ignition') {
      if (alignment < -0.6) return 2;
      if (alignment < -0.3) return 1;
    }
    if (stat === 'logic') {
      if (alignment > 0.6) return 2;
      if (alignment > 0.3) return 1;
    }
    return 0;
  },
}));
```

## Balance Guidelines

- **Total Shift Opportunities**: ~20 meaningful choices per playthrough
- **Average Shift Per Choice**: ±0.15
- **Path Lock Point**: Act 3 start (alignment becomes fixed for ending determination)
- **Respec Option**: None (choices matter)
- **NG+ Modifier**: Start with ±0.1 based on previous ending

---

*Your rival is your mirror. Your alignment reveals who you truly are.*
