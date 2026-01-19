# World Generation System v2.0 (Flooded Neo-Tokyo)

**Date**: January 19, 2026
**Purpose**: Deterministic procedural generation for flooded rooftop territories

---

## Philosophy

Build-time generation with runtime assembly. Seeds produce reproducible worlds.

**Core References:**
- [FLOODED_WORLD.md](FLOODED_WORLD.md) - World design bible
- [PROCEDURAL_ARCHITECTURE.md](PROCEDURAL_ARCHITECTURE.md) - Factory patterns

---

## Generation Pipeline

```
masterSeed
    │
    ├─→ Territory Seeds (10 canonical territories)
    │       │
    │       ├─→ Shelter placement
    │       ├─→ Equipment placement
    │       └─→ Surface generation
    │
    ├─→ Connection Seeds
    │       │
    │       ├─→ Bridge generation
    │       └─→ Boat route generation
    │
    ├─→ Population Seeds
    │       │
    │       ├─→ NPC placement
    │       ├─→ Quest distribution
    │       └─→ Faction assignment
    │
    └─→ Event Seeds
            │
            ├─→ Weather patterns
            ├─→ Random encounters
            └─→ Salvage spawns
```

---

## Water Level System

The waterline is the vertical anchor for all generation:

```
CANOPY ZONE    (+15m to +25m)  │  Antennas, solar farms, lookouts
─────────────────────────────────┤
ROOFTOP ZONE   (+5m to +15m)   │  Main living space, all territories
─────────────────────────────────┤
WATERLINE      (0m)            │  Sea level, docks, boats
─────────────────────────────────┤
SHALLOWS       (-1m to -5m)    │  Flooded upper floors, wadeable
─────────────────────────────────┤
DEEP           (-5m and below) │  Old city, dangerous diving
```

**Generation Rule**: All territory surfaces must be above waterline (0m).
Typical range: +5m to +15m above water.

---

## Territory Profiles (10 Canonical)

| # | ID | Name | Type | Faction | Elevation | Size |
|---|-----|------|------|---------|-----------|------|
| 1 | `kurenai_academy` | Kurenai Academy | academy | Kurenai | +12m | large |
| 2 | `azure_academy` | Azure Academy | academy | Azure | +10m | large |
| 3 | `market_collective` | The Collective | market | Neutral | +6m | large |
| 4 | `eastern_refuge` | Eastern Refuge | refuge | Kurenai-lean | +8m | medium |
| 5 | `western_refuge` | Western Refuge | refuge | Azure-lean | +9m | medium |
| 6 | `syndicate_docks` | Syndicate Docks | factory | Syndicate | +5m | large |
| 7 | `runners_canal` | Runner's Canal | transition | Runners | +7m | medium |
| 8 | `shrine_heights` | Shrine Heights | shrine | Neutral | +15m | small |
| 9 | `deep_reach` | The Deep Reach | ruin | Contested | +6m | medium |
| 10 | `drowned_archives` | Drowned Archives | ruin | The Drowned | +5m | small |

---

## Territory Generation

### Factory Call

```typescript
const territory = territoryFactory(
  `${masterSeed}-territory-${territoryId}`,
  territoryProfile
);
```

### Output Structure

```typescript
interface TerritoryOutput {
  // Metadata
  id: string;
  type: TerritoryType;
  faction: Faction;

  // Geometry
  bounds: { width: number; depth: number };
  elevation: number;

  // Contents
  shelters: PlacedShelter[];
  equipment: PlacedEquipment[];
  surfaces: SurfaceDefinition[];

  // Navigation
  dockPoints: Vector3[];  // Where boats can land
  bridgeAnchors: Vector3[]; // Where bridges can attach
}
```

### Type-Specific Generation Rules

| Type | Shelter Density | Equipment Types | Special Features |
|------|-----------------|-----------------|------------------|
| academy | High | Training, solar, water | Training platforms |
| market | Variable | Stalls, storage | Dock access required |
| refuge | High | Living, water, garden | Protected layout |
| factory | Low | Workshop, generator | Industrial equipment |
| ruin | None/damaged | Random salvage | Collapse hazards |
| shrine | Low | None | Sacred boundary markers |

---

## Connection Generation

### Bridge Types

| Type | Max Span | Width | Stability | Capacity |
|------|----------|-------|-----------|----------|
| plank_bridge | 15m | 1m | Low | 2 |
| scaffold_bridge | 25m | 2m | High | 10 |
| cable_bridge | 40m | 1.5m | Medium | 5 |
| pontoon_bridge | 50m | 2m | Low | 8 |

### Generation Rules

```typescript
// Pseudocode for connection generation
for each territory pair (A, B):
  distance = calculateDistance(A, B)

  if distance <= 40m:
    // Can use bridge
    bridgeType = selectBridge(distance, A.faction, B.faction)
    bridge = createBridge(A.bridgeAnchor, B.bridgeAnchor, bridgeType)
  else:
    // Need boat route
    route = createBoatRoute(A.dockPoint, B.dockPoint)

// Ensure connectivity
isolated = findIsolatedTerritories()
for each isolated:
  createBoatRoute(isolated.dockPoint, nearestConnected.dockPoint)
```

### Required Connections

Certain territories must be connected for story progression:

| From | To | Type | Story Relevance |
|------|----|------|-----------------|
| Kurenai Academy | Eastern Refuge | Bridge | Tutorial expansion |
| Kurenai Academy | Market Collective | Both | Trade access |
| Azure Academy | Western Refuge | Bridge | Rival territory |
| Market Collective | Syndicate Docks | Boat | Black market |
| Shrine Heights | All academies | Bridge | Council access |

---

## Population Generation

### NPC Distribution

```typescript
interface NPCPlacement {
  territoryId: string;
  npcType: NPCType;
  position: Vector3;
  schedule: DailySchedule;
  faction: Faction;
  questGiver: boolean;
}
```

### NPCs by Territory Type

| Type | NPC Types | Density |
|------|-----------|---------|
| academy | Students, instructors, staff | High |
| market | Merchants, customers, guards | Very High |
| refuge | Residents, children, elders | High |
| factory | Workers, foremen, guards | Medium |
| ruin | Scavengers, explorers, cultists | Low |
| shrine | Priests, pilgrims, council | Low |

---

## Salvage Generation

### Spawn Points

```typescript
interface SalvageSpawn {
  position: Vector3;
  zone: "rooftop" | "shallows" | "deep";
  difficulty: number; // 0-1
  lootTable: LootTableId;
  respawnTime: number; // game hours
}
```

### Zone-Based Loot Tables

| Zone | Common | Uncommon | Rare |
|------|--------|----------|------|
| Rooftop | Scrap metal, rope | Tools, containers | Solar panels |
| Shallows | Waterlogged goods | Preserved items | Tech components |
| Deep | Artifacts | Pre-flood tech | Historical items |

---

## Weather System

### Weather States

```typescript
type WeatherState =
  | "clear"      // Sunny, good visibility
  | "overcast"   // Cloudy, normal
  | "rain"       // Light rain
  | "storm"      // Heavy rain, wind
  | "fog"        // Reduced visibility
  | "typhoon";   // Severe, restricted travel
```

### Weather Generation

```typescript
function generateWeather(seed: string, day: number): WeatherState {
  const rng = new SeededRNG(`${seed}-weather-${day}`);

  // Base probabilities
  const weights = {
    clear: 0.3,
    overcast: 0.35,
    rain: 0.2,
    storm: 0.08,
    fog: 0.05,
    typhoon: 0.02,
  };

  return rng.weightedChoice(weights);
}
```

### Weather Effects

| State | Movement | Combat | Salvage | Events |
|-------|----------|--------|---------|--------|
| clear | Normal | Normal | Normal | Normal spawns |
| overcast | Normal | Normal | Normal | Normal spawns |
| rain | -10% boat | Wet surfaces | +20% shallow | Pirates less active |
| storm | -30% boat | -20% accuracy | Dangerous | Emergency quests |
| fog | -50% visibility | Ambush bonus | Hidden spawns | Smuggler activity |
| typhoon | No boats | No outdoor | None | Shelter-in-place |

---

## Quest Distribution

### Territory Affinity

Each territory type has quest affinity (likelihood of quest type):

| Territory | Combat | Explore | Social | Stealth |
|-----------|--------|---------|--------|---------|
| academy | High | Low | Medium | Low |
| market | Low | Low | High | Medium |
| refuge | Medium | Low | High | Low |
| factory | Medium | Medium | Low | High |
| ruin | Low | High | Low | High |
| shrine | Low | Low | High | Low |

### Quest Generation

```typescript
function generateQuests(seed: string, territory: Territory): Quest[] {
  const rng = new SeededRNG(`${seed}-quests-${territory.id}`);
  const affinities = TERRITORY_QUEST_AFFINITIES[territory.type];

  const quests: Quest[] = [];
  const questCount = rng.range(2, 5);

  for (let i = 0; i < questCount; i++) {
    const questType = rng.weightedChoice(affinities);
    const quest = questFactory(
      `${seed}-quest-${territory.id}-${i}`,
      questType,
      territory
    );
    quests.push(quest);
  }

  return quests;
}
```

---

## Seed Structure

### Master Seed Format

```
masterSeed = "neo-tokyo-flooded-{version}-{variant}"

Example: "neo-tokyo-flooded-v2-alpha"
```

### Derived Seeds

```typescript
function deriveMasterSeeds(masterSeed: string): MasterSeeds {
  return {
    territorySeed: `${masterSeed}-territories`,
    connectionSeed: `${masterSeed}-connections`,
    populationSeed: `${masterSeed}-population`,
    questSeed: `${masterSeed}-quests`,
    weatherSeed: `${masterSeed}-weather`,
    eventSeed: `${masterSeed}-events`,
  };
}
```

---

## Runtime Assembly

### Territory Loading

```typescript
// Load active territory + adjacent territories
async function loadTerritoryCluster(
  currentTerritoryId: string,
  masterSeed: string
): Promise<LoadedTerritories> {
  const current = await loadTerritory(currentTerritoryId, masterSeed);
  const connections = getConnections(currentTerritoryId);

  const adjacent = await Promise.all(
    connections.map(c => loadTerritory(c.targetId, masterSeed))
  );

  return { current, adjacent };
}
```

### Memory Management

- Keep current + adjacent territories loaded
- Unload territories 2+ connections away
- Cache recently visited for quick return
- Regenerate from seed if cache miss (safe due to determinism)

---

## Playground Integration

### Territory Test

```typescript
// packages/playground/src/tests/TerritoryTest.tsx
function TerritoryTestScene() {
  const [seed, setSeed] = useState("test-territory-001");
  const [type, setType] = useState<TerritoryType>("academy");

  const territory = useMemo(
    () => territoryFactory(seed, TERRITORY_PROFILES[type]),
    [seed, type]
  );

  const primitives = useMemo(
    () => territoryToPrimitives(territory),
    [territory]
  );

  return (
    <TestHarness title="// TERRITORY TEST">
      {primitives}
      <Water id="surrounding_water" preset="polluted" />
    </TestHarness>
  );
}
```

---

## Migration from v1

| v1 Concept | v2 Replacement |
|------------|----------------|
| Districts | Territories |
| Strata (Upper/Mid/Lower) | Water-relative zones |
| Neon Entertainment | Market Collective |
| Corporate Pinnacle | Azure Academy (adapted) |
| Underground Sewers | Flooded depths (diving) |
| Street network | Bridge + boat routes |

---

*"The same seed always grows the same city. Share your seed, share your world."*

---

Last Updated: 2026-01-19
