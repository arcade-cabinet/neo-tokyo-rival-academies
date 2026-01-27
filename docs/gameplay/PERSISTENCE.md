# Persistence & Save System v2.1

**Updated**: January 27, 2026

**Philosophy**: Deterministic scene repro + player progression snapshots. Story progression is authored and stored explicitly.

## Save Data Structure (JSON)

See `packages/core/src/types/SaveData.ts` for the canonical schema.

```json
{
  "version": "1.0.0",
  "seed": "scene-seed-string",
  "act": 2,
  "currentDistrictId": "district_0",
  "alignment": 0.25,
  "kurenaiRep": 62,
  "azureRep": 41,
  "level": 9,
  "stats": { "structure": 20, "ignition": 22, "logic": 18, "flow": 21 },
  "inventory": ["Encrypted Passcode", "Water Filter"],
  "completedQuests": ["act1-main"],
  "activeQuests": ["act2-main"],
  "unlocks": ["market-access"],
  "playtimeMinutes": 94,
  "endingFlag": null
}
```

## Storage Strategy

- **Web**: `localStorage` (slot-based, JSON).
- **Capacitor**: FileSystem for native platforms when available.
- **Manual Slots**: 3 slots + auto-save.

## Save Triggers

- Quest completion
- Scene transition
- Boss defeat
- Manual save (menu)

## Load Flow

1. Validate JSON against `SaveData` schema.
2. Restore stores (player, quest, alignment, world).
3. Rebuild the current scene from the stored seed.
4. Resume story beat and UI state.

## New Game+ Hooks

- **Trigger**: Ending credits → “Continue?” prompt.
- **Carry-over**: alignment/reputation, 1–2 signature items, partial stats.
- **Changes**: enemy scaling +20–30%, alternate dialogue.
- **Max cycles**: 3.

