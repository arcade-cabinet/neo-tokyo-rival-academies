# Persistence & Save System v1.0

**Philosophy**: Browser-First (localStorage), Seeded Repro, NG+ Cycles.

## Save Data Structure (JSON)
```json
{
  "version": "1.0",
  "seed": "master-seed-string", // For full world repro
  "act": 3, // Current act/progress
  "alignment": 0.75, // -1.0 to +1.0
  "reputation": { "kurenai": 82, "azure": 45 },
  "level": 18,
  "stats": { "Structure": 45, "Ignition": 62, "Logic": 38, "Flow": 55 },
  "inventory": ["Redline Piston Hammer", "Glowing Datavault Chip"],
  "completedQuests": ["act1-main", "neon-spire-secret"],
  "unlocks": ["upper-stratum", "vera-ally-flag"],
  "playtimeMinutes": 178,
  "endingFlag": "azure-victory" // If completed
}
```

## Mechanics
- **Auto-Save**: On quest completion, stratum transition, or boss defeat.
- **Manual Slots**: 3 slots + auto.
- **Load Flow**: Restore state → regenerate world from seed → apply progress overrides.
- **Zustand Store**:
  ```ts
  const useSaveStore = create((set) => ({
    saveSlot: (slot = 'auto') => {
      const state = { ...usePlayerStore.getState(), ...useQuestStore.getState() };
      localStorage.setItem(`neoTokyo-save-${slot}`, JSON.stringify(state));
    },
    loadSlot: (slot = 'auto') => { /* ... */ },
    hasSave: () => !!localStorage.getItem('neoTokyo-save-auto'),
  }));
  ```

## New Game+ Hooks
- **Trigger**: On ending credits → "Continue?" prompt.
- **Carry-Over**:
  - Alignment/reputation (scaled down 50% for balance).
  - Key items (1–2 signature gear).
  - Stats (+20% base, capped growth).
  - Unlocks (cosmetic or mystery path early access).
- **Changes**: Enemy scaling +20–30%, new dialogue, alternate sides.
- **Max Cycles**: 3.