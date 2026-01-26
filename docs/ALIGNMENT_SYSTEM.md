# Alignment & Rivalry System v1.0

**Updated**: January 26, 2026
**Status**: IMPLEMENTED in Unity 6 DOTS

**Alignment Scale**: -1.0 (full Kurenai / Passion) to +1.0 (full Azure / Logic), with 0.0 neutral/mystery.

---

## Unity 6 Implementation

### Key Files

```
Assets/Scripts/Systems/Alignment/
├── AlignmentBonusSystem.cs     # Stat bonuses based on alignment
├── AlignmentGateSystem.cs      # Content unlocks at alignment thresholds
└── Components/
    └── AlignmentGateComponents.cs  # AlignmentGate, AlignmentBonus ECS components
```

### ECS Component Structure

```csharp
// AlignmentGateComponents.cs
public struct PlayerAlignment : IComponentData {
    public float Value;              // -1.0 (Kurenai) to +1.0 (Azure)
    public int KurenaiReputation;    // 0-100
    public int AzureReputation;      // 0-100
}

public struct AlignmentGate : IComponentData {
    public float ThresholdMin;       // e.g., -0.6 for Kurenai content
    public float ThresholdMax;       // e.g., +0.6 for Azure content
    public Entity UnlockedContent;   // Quest, dialogue, or area to unlock
}

public struct AlignmentBonus : IComponentData {
    public StatType BonusStat;       // Which stat gets the bonus
    public int BonusAmount;          // How much bonus
    public float AlignmentThreshold; // When bonus activates
}
```

## UI Representation (HUD)

- **Horizontal Bar**: Top-right (crimson left ←→ cobalt right).
- **Icon**: Flaming piston (Kurenai) vs Null Set lance (Azure).
- **Tooltip**: "Rivalry Lean: Passionate (Kurenai) / Calculated (Azure)".

## Shift Mechanics (Per Quest/Event)

| Trigger Type          | Shift Amount | Example |
|-----------------------|--------------|---------|
| Main quest choice     | ±0.2–0.4    | Deliver datavault (Azure +0.3) vs Sabotage it (Kurenai -0.3) |
| Side quest completion | ±0.1–0.2    | Escort broker (neutral) vs Expose fixer (Kurenai -0.2) |
| Dialogue response     | ±0.05–0.15  | Aggressive reply → Kurenai shift |
| Combat style          | ±0.05       | Ignition-heavy attacks → Kurenai shift |
| Secret discovery      | ±0.1        | Uncover corporate secret → Azure shift if reported |

## Threshold Effects (Branching & Progression)

| Threshold          | Effect |
|--------------------|--------|
| > +0.6 Azure       | Unlock Azure faction quests, Vera rivalry arc emphasizes "intellectual superiority" |
| < -0.6 Kurenai     | Unlock Kurenai faction quests, Vera arc emphasizes "passionate clash" |
| \|alignment\| > 0.8| Final boss variant + unique ending |
| Near 0.0 neutral   | Mystery third-path unlocks (hidden C-branch secrets) |

## Stat Ties (Direct Pillar Integration)

- **Kurenai lean**: Bonuses to Ignition/Flow.
- **Azure lean**: Bonuses to Logic/Structure.
- **Level-up**: Choices influenced by alignment (e.g., high Kurenai -> more Ignition points).

### Unity Implementation

```csharp
// AlignmentBonusSystem.cs - Apply stat bonuses based on alignment
public partial class AlignmentBonusSystem : SystemBase {
    protected override void OnUpdate() {
        Entities.ForEach((ref Stats stats, in PlayerAlignment alignment) => {
            // Kurenai bonuses (alignment < -0.3)
            if (alignment.Value < -0.3f) {
                stats.Ignition += (int)(math.abs(alignment.Value) * 5);
                stats.Flow += (int)(math.abs(alignment.Value) * 3);
            }
            // Azure bonuses (alignment > 0.3)
            else if (alignment.Value > 0.3f) {
                stats.Logic += (int)(alignment.Value * 5);
                stats.Structure += (int)(alignment.Value * 3);
            }
        }).Schedule();
    }
}
```

## Reputation / Faction Progression

- Dual meters: Kurenai Reputation (0–100), Azure Reputation (0–100)
- Shifts: Quest choices + alignment (±5–20 per completion)
- Thresholds:
  - 50+: Faction-specific sides unlock
  - 80+: Exclusive gear/NPC ally
  - Conflicting high (both >70): Neutral mystery path bonus
- **Vera Tie-In**: Reputation mirrors Vera's (she gains opposite to player) -> rivalry dialogue evolves.

---

## Unity 6 Gate System

The `AlignmentGateSystem` handles content unlocks based on alignment thresholds:

```csharp
// AlignmentGateSystem.cs - Content gating by alignment
public partial class AlignmentGateSystem : SystemBase {
    protected override void OnUpdate() {
        var playerAlignment = SystemAPI.GetSingleton<PlayerAlignment>();

        Entities
            .WithAll<AlignmentGate>()
            .ForEach((Entity entity, in AlignmentGate gate) => {
                bool unlocked = playerAlignment.Value >= gate.ThresholdMin
                             && playerAlignment.Value <= gate.ThresholdMax;

                if (unlocked) {
                    // Enable gated content (quests, dialogue, areas)
                    EntityManager.SetEnabled(gate.UnlockedContent, true);
                }
            }).Schedule();
    }
}
```

### Threshold Configuration

| Threshold | Gate Type | Content |
|-----------|-----------|---------|
| < -0.6 | Kurenai Faction | Exclusive Kurenai quests, "passionate clash" Vera arc |
| > +0.6 | Azure Faction | Exclusive Azure quests, "intellectual superiority" Vera arc |
| > +0.8 or < -0.8 | Ending Variant | Final boss variant + unique ending |
| -0.2 to +0.2 | Mystery Path | Hidden C-branch secrets, neutral third-path |

---

Last Updated: 2026-01-26