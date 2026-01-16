# Persistence System

> **Purpose**: Define save/load mechanisms and New Game+ hooks.

## Storage Strategy

### Primary: localStorage
- **Format**: JSON
- **Key**: `neotokyo-save-{slotId}`
- **Size Limit**: ~5MB (browser limit)
- **Backup**: Export to file option

### Secondary: IndexedDB (Future)
- For larger save files
- Asset caching
- Offline mode data

## Save Data Structure

```typescript
interface SaveData {
  version: string;          // Schema version for migrations
  timestamp: number;        // Unix timestamp
  seed: string;             // Master world seed

  // Player State
  player: {
    name: string;
    level: number;
    xp: number;
    stats: {
      structure: number;
      ignition: number;
      logic: number;
      flow: number;
    };
    alignment: number;      // -1.0 to +1.0
    position: [number, number, number];
    currentDistrict: string;
  };

  // Progression
  progress: {
    currentAct: number;
    completedQuests: string[];
    discoveredSecrets: string[];
    unlockedStrata: ('lower' | 'mid' | 'upper')[];
    veraRelationship: 'unknown' | 'rival' | 'ally' | 'enemy';
  };

  // Inventory
  inventory: {
    credits: number;
    items: { id: string; quantity: number }[];
    equipment: {
      weapon?: string;
      armor?: string;
      accessory?: string;
    };
  };

  // Reputation
  reputation: {
    kurenai: number;
    azure: number;
    underground: number;
  };

  // Flags
  flags: {
    tutorialComplete: boolean;
    ngPlusActive: boolean;
    ngPlusCount: number;
  };

  // Settings (preserved across loads)
  settings: {
    audioVolume: number;
    hapticEnabled: boolean;
    touchLayout: 'default' | 'custom';
  };
}
```

## Save Slot System

### Slot Management

```typescript
const SAVE_SLOTS = 3;
const AUTOSAVE_SLOT = 'autosave';

interface SaveSlot {
  id: string;
  label: string;
  timestamp: number;
  preview: {
    level: number;
    act: number;
    alignment: number;
    playtime: number;
  };
}

const getSaveSlots = (): SaveSlot[] => {
  const slots: SaveSlot[] = [];
  for (let i = 1; i <= SAVE_SLOTS; i++) {
    const data = localStorage.getItem(`neotokyo-save-${i}`);
    if (data) {
      const parsed = JSON.parse(data);
      slots.push({
        id: String(i),
        label: `Slot ${i}`,
        timestamp: parsed.timestamp,
        preview: extractPreview(parsed),
      });
    }
  }
  return slots;
};
```

### Autosave Triggers

```typescript
const AUTOSAVE_EVENTS = [
  'quest_complete',
  'district_enter',
  'boss_defeat',
  'act_transition',
  'alignment_shift_major', // > ±0.3
];

const triggerAutosave = (event: string) => {
  if (AUTOSAVE_EVENTS.includes(event)) {
    saveToSlot(AUTOSAVE_SLOT);
    showAutosaveIndicator();
  }
};
```

## Save/Load Operations

### Save Function

```typescript
const saveToSlot = (slotId: string): boolean => {
  try {
    const saveData: SaveData = {
      version: '1.0.0',
      timestamp: Date.now(),
      seed: useWorldStore.getState().masterSeed,
      player: usePlayerStore.getState(),
      progress: useProgressStore.getState(),
      inventory: useInventoryStore.getState(),
      reputation: useReputationStore.getState(),
      flags: useFlagsStore.getState(),
      settings: useSettingsStore.getState(),
    };

    const json = JSON.stringify(saveData);
    localStorage.setItem(`neotokyo-save-${slotId}`, json);
    return true;
  } catch (error) {
    console.error('Save failed:', error);
    return false;
  }
};
```

### Load Function

```typescript
const loadFromSlot = (slotId: string): boolean => {
  try {
    const json = localStorage.getItem(`neotokyo-save-${slotId}`);
    if (!json) return false;

    const saveData: SaveData = JSON.parse(json);

    // Version migration if needed
    const migrated = migrateSaveData(saveData);

    // Restore state to all stores
    useWorldStore.getState().setSeed(migrated.seed);
    usePlayerStore.getState().restore(migrated.player);
    useProgressStore.getState().restore(migrated.progress);
    useInventoryStore.getState().restore(migrated.inventory);
    useReputationStore.getState().restore(migrated.reputation);
    useFlagsStore.getState().restore(migrated.flags);
    useSettingsStore.getState().restore(migrated.settings);

    return true;
  } catch (error) {
    console.error('Load failed:', error);
    return false;
  }
};
```

### Delete Function

```typescript
const deleteSlot = (slotId: string): void => {
  localStorage.removeItem(`neotokyo-save-${slotId}`);
};
```

## Version Migration

```typescript
const migrateSaveData = (data: any): SaveData => {
  const version = data.version || '0.0.0';

  // v0.x to v1.0
  if (version.startsWith('0.')) {
    data.flags = data.flags || { tutorialComplete: true, ngPlusActive: false, ngPlusCount: 0 };
    data.version = '1.0.0';
  }

  // Future migrations here

  return data as SaveData;
};
```

## New Game+ System

### NG+ Unlock Conditions
- Complete any ending
- See credits

### NG+ Carry-Over

| Category | Carries Over | Reset |
|----------|--------------|-------|
| Level | Yes (capped at 10) | - |
| Stats | +5 bonus points | Base returns to 10 |
| Items | Faction gear only | Common/uncommon |
| Credits | 10% of total | Rest |
| Alignment | ±0.1 bias from ending | Scale resets |
| Quests | - | All reset |
| Secrets | Discovery markers | Rewards re-available |

### NG+ Implementation

```typescript
interface NGPlusData {
  previousEnding: 'kurenai' | 'neutral' | 'azure';
  carryStats: number;        // Bonus stat points
  carryItems: string[];      // Item IDs
  carryCredits: number;
  alignmentBias: number;     // Starting alignment
  ngPlusCount: number;
}

const startNewGamePlus = (previousSave: SaveData): void => {
  const ngPlusData: NGPlusData = {
    previousEnding: determineEnding(previousSave.player.alignment),
    carryStats: Math.min(previousSave.player.level, 10),
    carryItems: previousSave.inventory.items
      .filter(i => isFactionGear(i.id))
      .map(i => i.id),
    carryCredits: Math.floor(previousSave.inventory.credits * 0.1),
    alignmentBias: previousSave.player.alignment > 0.3 ? 0.1 :
                   previousSave.player.alignment < -0.3 ? -0.1 : 0,
    ngPlusCount: (previousSave.flags.ngPlusCount || 0) + 1,
  };

  // Initialize new game with NG+ bonuses
  initializeNewGame(ngPlusData);
};
```

### NG+ Difficulty Scaling

| NG+ Count | Enemy Level Boost | Reward Boost |
|-----------|-------------------|--------------|
| 1 | +10% | +15% |
| 2 | +20% | +25% |
| 3+ | +30% | +30% |

## Export/Import (Backup)

### Export to File

```typescript
const exportSave = (slotId: string): void => {
  const json = localStorage.getItem(`neotokyo-save-${slotId}`);
  if (!json) return;

  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `neotokyo-save-${slotId}-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
};
```

### Import from File

```typescript
const importSave = async (file: File, slotId: string): Promise<boolean> => {
  try {
    const text = await file.text();
    const data = JSON.parse(text);

    // Validate structure
    if (!data.version || !data.player || !data.progress) {
      throw new Error('Invalid save file');
    }

    localStorage.setItem(`neotokyo-save-${slotId}`, text);
    return true;
  } catch (error) {
    console.error('Import failed:', error);
    return false;
  }
};
```

## UI Integration

### Save Menu

```tsx
const SaveMenu: FC = () => {
  const slots = getSaveSlots();

  return (
    <div className="save-menu">
      {slots.map(slot => (
        <SaveSlotCard
          key={slot.id}
          slot={slot}
          onSave={() => saveToSlot(slot.id)}
          onLoad={() => loadFromSlot(slot.id)}
          onDelete={() => deleteSlot(slot.id)}
        />
      ))}
      <button onClick={() => exportSave('1')}>Export</button>
    </div>
  );
};
```

### Autosave Indicator

```tsx
const AutosaveIndicator: FC = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => {
      setVisible(true);
      setTimeout(() => setVisible(false), 2000);
    };
    window.addEventListener('autosave', handler);
    return () => window.removeEventListener('autosave', handler);
  }, []);

  if (!visible) return null;

  return <div className="autosave-indicator">Saving...</div>;
};
```

---

*Your journey persists. Your choices echo across playthroughs.*
