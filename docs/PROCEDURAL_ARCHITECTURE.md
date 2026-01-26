# Procedural Generation Architecture

**Date**: January 19, 2026 | **Updated**: January 26, 2026
**Purpose**: Define Dagster-inspired factory patterns for deterministic world generation
**Status**: IMPLEMENTED in Unity 6 DOTS

## Unity 6 Implementation

The procedural generation system is now implemented in Unity:

| Concept | Unity Implementation |
|---------|---------------------|
| Factory Patterns | `ProceduralGenerationSystem.cs` |
| Seed Hierarchy | `SeedComponents.cs`, `SeedHelpers.cs` |
| Territory DDL | `TerritoryComponents.cs`, `TerritoryDefinitions.cs` |
| Asset Spawning | `ManifestSpawnerSystem.cs` |

---

---

## Philosophy

Our procedural generation follows three principles:

1. **Declarative Definitions (DDL)** - Define WHAT to generate, not HOW
2. **Factory Functions** - Pure functions that transform seeds into content
3. **Dependency Graphs** - Explicit ordering of generation steps

This mirrors Dagster's approach: define assets, let the system figure out execution order.

---

## Core Concepts

### Asset Definitions (DDL-Style)

Assets are declarative descriptions of what can exist in the world:

```typescript
// packages/playground/src/definitions/territories.ddl.ts

import { z } from "zod";

/**
 * Territory Definition Language
 * Describes what a territory IS, not how to render it
 */
export const TerritoryDDL = z.object({
  id: z.string(),
  type: z.enum(["academy", "market", "refuge", "factory", "ruin", "shrine"]),
  size: z.enum(["small", "medium", "large"]),
  elevation: z.number().min(0).max(30), // meters above waterline
  features: z.array(z.string()), // feature IDs to include
  connections: z.array(z.object({
    targetId: z.string(),
    type: z.enum(["bridge", "boat", "cable"]),
  })),
  faction: z.enum(["kurenai", "azure", "neutral", "contested"]).optional(),
});

export type TerritoryDefinition = z.infer<typeof TerritoryDDL>;
```

### Factory Functions

Factories are pure functions that take a seed and return definitions:

```typescript
// packages/playground/src/factories/territory.factory.ts

import { SeededRNG } from "../utils/rng";
import type { TerritoryDefinition } from "../definitions/territories.ddl";

/**
 * Territory Factory
 *
 * Pure function: same seed always produces same territory
 */
export function createTerritory(
  seed: string,
  constraints: TerritoryConstraints
): TerritoryDefinition {
  const rng = new SeededRNG(seed);

  return {
    id: `territory_${seed}`,
    type: selectType(rng, constraints),
    size: selectSize(rng, constraints),
    elevation: calculateElevation(rng, constraints),
    features: selectFeatures(rng, constraints),
    connections: [], // populated by connection factory
    faction: constraints.faction,
  };
}

interface TerritoryConstraints {
  allowedTypes?: TerritoryType[];
  minElevation?: number;
  maxElevation?: number;
  faction?: Faction;
}
```

### Dependency Graphs

Generation follows explicit dependencies:

```typescript
// packages/playground/src/generation/world.graph.ts

/**
 * World Generation Graph
 *
 * Defines the order in which assets are generated.
 * Inspired by Dagster's @asset decorator dependency system.
 */
export const WorldGenerationGraph = {
  // Level 1: No dependencies
  masterSeed: {
    deps: [],
    factory: (input: { seed: string }) => deriveMasterSeeds(input.seed),
  },

  // Level 2: Depends on masterSeed
  territories: {
    deps: ["masterSeed"],
    factory: (input: { masterSeed: MasterSeeds }) =>
      generateTerritories(input.masterSeed.territorySeed),
  },

  factions: {
    deps: ["masterSeed"],
    factory: (input: { masterSeed: MasterSeeds }) =>
      generateFactions(input.masterSeed.factionSeed),
  },

  // Level 3: Depends on territories
  connections: {
    deps: ["territories"],
    factory: (input: { territories: TerritoryDefinition[] }) =>
      generateConnections(input.territories),
  },

  features: {
    deps: ["territories"],
    factory: (input: { territories: TerritoryDefinition[] }) =>
      generateFeatures(input.territories),
  },

  // Level 4: Depends on territories + factions
  population: {
    deps: ["territories", "factions"],
    factory: (input: {
      territories: TerritoryDefinition[],
      factions: FactionDefinition[]
    }) => populateTerritories(input.territories, input.factions),
  },

  // Level 5: Final world assembly
  world: {
    deps: ["territories", "connections", "features", "population"],
    factory: (input: WorldInputs) => assembleWorld(input),
  },
};
```

---

## DDL Catalogs

### Shelter Definitions

```typescript
// packages/playground/src/definitions/shelters.ddl.ts

export const ShelterCatalog = {
  // Small shelters (1-2 person)
  tarp_lean_to: {
    materials: ["tarp", "rope", "pole"],
    footprint: { width: 2, depth: 2 },
    height: 2,
    capacity: 1,
    weatherResistance: "low",
  },

  hammock_platform: {
    materials: ["wood_planks", "rope", "tarp"],
    footprint: { width: 2, depth: 3 },
    height: 1.5,
    capacity: 1,
    weatherResistance: "low",
  },

  // Medium shelters (3-6 person)
  container_home: {
    materials: ["shipping_container", "tarp_patches"],
    footprint: { width: 6, depth: 2.5 },
    height: 2.5,
    capacity: 4,
    weatherResistance: "high",
  },

  platform_dwelling: {
    materials: ["wood_frame", "corrugated_metal", "tarp"],
    footprint: { width: 4, depth: 4 },
    height: 3,
    capacity: 6,
    weatherResistance: "medium",
  },

  // Large shelters (community)
  communal_hall: {
    materials: ["scaffold_frame", "multiple_tarps", "salvage_panels"],
    footprint: { width: 10, depth: 8 },
    height: 4,
    capacity: 30,
    weatherResistance: "medium",
  },
} as const;

export type ShelterId = keyof typeof ShelterCatalog;
```

### Bridge Definitions

```typescript
// packages/playground/src/definitions/bridges.ddl.ts

export const BridgeCatalog = {
  plank_bridge: {
    width: 1,
    maxSpan: 15,
    supports: "rope",
    surface: "wood_planks",
    stability: "low",
    capacity: 2, // people at once
  },

  scaffold_bridge: {
    width: 2,
    maxSpan: 25,
    supports: "metal_frame",
    surface: "metal_grating",
    stability: "high",
    capacity: 10,
  },

  cable_bridge: {
    width: 1.5,
    maxSpan: 40,
    supports: "cable_suspension",
    surface: "wood_planks",
    stability: "medium",
    capacity: 5,
  },

  pontoon_bridge: {
    width: 2,
    maxSpan: 50, // floats on water
    supports: "floating_barrels",
    surface: "wood_planks",
    stability: "low",
    capacity: 8,
  },
} as const;

export type BridgeId = keyof typeof BridgeCatalog;
```

### Equipment Definitions

```typescript
// packages/playground/src/definitions/equipment.ddl.ts

export const EquipmentCatalog = {
  // Power
  solar_panel_small: {
    type: "power",
    output: 100, // watts
    footprint: { width: 1, depth: 1 },
    maintenance: "low",
  },

  solar_panel_array: {
    type: "power",
    output: 500,
    footprint: { width: 3, depth: 2 },
    maintenance: "medium",
  },

  salvaged_generator: {
    type: "power",
    output: 1000,
    footprint: { width: 1, depth: 1 },
    maintenance: "high",
    fuel: "required",
  },

  // Water
  rain_collector: {
    type: "water",
    capacity: 200, // liters
    footprint: { width: 2, depth: 2 },
    maintenance: "low",
  },

  water_filter: {
    type: "water",
    throughput: 50, // liters/day
    footprint: { width: 1, depth: 1 },
    maintenance: "medium",
  },

  // Communication
  radio_antenna: {
    type: "communication",
    range: 5000, // meters
    footprint: { width: 0.5, depth: 0.5 },
    height: 10,
    maintenance: "low",
  },
} as const;

export type EquipmentId = keyof typeof EquipmentCatalog;
```

---

## Factory Implementations

### Territory Factory

```typescript
// packages/playground/src/factories/territory.factory.ts

import { SeededRNG } from "../utils/rng";
import { ShelterCatalog, ShelterId } from "../definitions/shelters.ddl";
import { EquipmentCatalog, EquipmentId } from "../definitions/equipment.ddl";

export interface TerritoryOutput {
  definition: TerritoryDefinition;
  shelters: PlacedShelter[];
  equipment: PlacedEquipment[];
  surfaces: SurfaceDefinition[];
}

export function territoryFactory(
  seed: string,
  type: TerritoryType,
  size: TerritorySize
): TerritoryOutput {
  const rng = new SeededRNG(seed);

  // Determine territory bounds based on size
  const bounds = TERRITORY_SIZES[size];

  // Select and place shelters based on type
  const shelters = placeShelters(rng, type, bounds);

  // Select and place equipment based on type
  const equipment = placeEquipment(rng, type, bounds);

  // Generate walkable surfaces
  const surfaces = generateSurfaces(rng, bounds, shelters, equipment);

  return {
    definition: {
      id: `territory_${seed}`,
      type,
      size,
      elevation: rng.range(5, 15),
      features: [...shelters.map(s => s.id), ...equipment.map(e => e.id)],
      connections: [],
    },
    shelters,
    equipment,
    surfaces,
  };
}

// Type-specific shelter selection
const TERRITORY_SHELTER_WEIGHTS: Record<TerritoryType, Record<ShelterId, number>> = {
  academy: {
    communal_hall: 1.0,
    platform_dwelling: 0.8,
    container_home: 0.3,
    tarp_lean_to: 0.1,
    hammock_platform: 0.2,
  },
  market: {
    tarp_lean_to: 1.0, // stalls
    platform_dwelling: 0.4,
    container_home: 0.6, // storage
    communal_hall: 0.2,
    hammock_platform: 0.1,
  },
  refuge: {
    container_home: 0.8,
    platform_dwelling: 1.0,
    tarp_lean_to: 0.6,
    hammock_platform: 0.4,
    communal_hall: 0.3,
  },
  // ... etc
};
```

### Connection Factory

```typescript
// packages/playground/src/factories/connection.factory.ts

import { SeededRNG } from "../utils/rng";
import { BridgeCatalog, BridgeId } from "../definitions/bridges.ddl";

export interface ConnectionOutput {
  bridges: PlacedBridge[];
  boatRoutes: BoatRoute[];
  cableLines: CableLine[];
}

export function connectionFactory(
  seed: string,
  territories: TerritoryDefinition[]
): ConnectionOutput {
  const rng = new SeededRNG(seed);
  const bridges: PlacedBridge[] = [];
  const boatRoutes: BoatRoute[] = [];

  // Find territory pairs within bridge range
  const pairs = findConnectablePairs(territories);

  for (const [a, b] of pairs) {
    const distance = calculateDistance(a, b);

    if (distance <= 40) {
      // Can bridge
      const bridgeType = selectBridgeType(rng, distance, a, b);
      bridges.push(createBridge(rng, a, b, bridgeType));
    } else {
      // Need boat route
      boatRoutes.push(createBoatRoute(a, b));
    }
  }

  // Ensure connectivity - add bridges if isolated territories exist
  const isolated = findIsolatedTerritories(territories, bridges, boatRoutes);
  for (const territory of isolated) {
    const nearest = findNearestConnected(territory, territories, bridges);
    boatRoutes.push(createBoatRoute(territory, nearest));
  }

  return { bridges, boatRoutes, cableLines: [] };
}

function selectBridgeType(
  rng: SeededRNG,
  distance: number,
  a: TerritoryDefinition,
  b: TerritoryDefinition
): BridgeId {
  // Filter bridges that can span the distance
  const viable = Object.entries(BridgeCatalog)
    .filter(([_, spec]) => spec.maxSpan >= distance);

  if (viable.length === 0) return "cable_bridge"; // fallback

  // Weight by territory types (academies prefer sturdy bridges)
  const weights = viable.map(([id, spec]) => {
    let weight = 1.0;
    if (a.type === "academy" || b.type === "academy") {
      weight *= spec.stability === "high" ? 2.0 : 0.5;
    }
    return { id: id as BridgeId, weight };
  });

  return rng.weightedChoice(weights);
}
```

---

## World Assembly

### Master Generation Function

```typescript
// packages/playground/src/generation/world.generator.ts

import { WorldGenerationGraph } from "./world.graph";

export interface WorldOutput {
  territories: TerritoryOutput[];
  connections: ConnectionOutput;
  factions: FactionOutput[];
  quests: QuestOutput[];
}

export async function generateWorld(masterSeed: string): Promise<WorldOutput> {
  // Execute generation graph in dependency order
  const executor = new GraphExecutor(WorldGenerationGraph);

  const results = await executor.execute({ seed: masterSeed });

  return {
    territories: results.territories,
    connections: results.connections,
    factions: results.factions,
    quests: results.quests,
  };
}

/**
 * Graph Executor
 *
 * Topologically sorts the graph and executes factories in order.
 * Caches results for dependent factories.
 */
class GraphExecutor<T extends GenerationGraph> {
  private cache = new Map<string, unknown>();

  constructor(private graph: T) {}

  async execute(input: GraphInput): Promise<GraphOutput<T>> {
    const order = this.topologicalSort();

    for (const node of order) {
      const deps = this.graph[node].deps;
      const depValues = deps.reduce((acc, dep) => ({
        ...acc,
        [dep]: this.cache.get(dep),
      }), {});

      const result = await this.graph[node].factory({
        ...input,
        ...depValues,
      });

      this.cache.set(node, result);
    }

    return Object.fromEntries(this.cache) as GraphOutput<T>;
  }

  private topologicalSort(): string[] {
    // Kahn's algorithm implementation
    // ...
  }
}
```

---

## Playground Integration

### Territory Primitive Factory

```typescript
// packages/playground/src/factories/primitives.factory.ts

import { TerritoryOutput } from "./territory.factory";
import { Floor, FloorSurface } from "../components/Floor";
import { TexturedWall, WallTextureType } from "../components/TexturedWall";
import { Water } from "../components/Water";

/**
 * Convert abstract TerritoryOutput to concrete playground primitives
 */
export function territoryToPrimitives(
  territory: TerritoryOutput
): JSX.Element[] {
  const primitives: JSX.Element[] = [];

  // Main rooftop floor
  primitives.push(
    <Floor
      key={`${territory.definition.id}_floor`}
      id={`${territory.definition.id}_floor`}
      position={new Vector3(0, territory.definition.elevation, 0)}
      size={{ width: territory.bounds.width, depth: territory.bounds.depth }}
      surface={selectFloorSurface(territory.definition.type)}
    />
  );

  // Water below
  primitives.push(
    <Water
      key={`${territory.definition.id}_water`}
      id={`${territory.definition.id}_water`}
      position={new Vector3(0, 0, 0)}
      size={{ width: 100, depth: 100 }}
      preset="polluted"
    />
  );

  // Shelter walls
  for (const shelter of territory.shelters) {
    primitives.push(...shelterToPrimitives(shelter));
  }

  return primitives;
}

function selectFloorSurface(type: TerritoryType): FloorSurface {
  const mapping: Record<TerritoryType, FloorSurface> = {
    academy: "concrete",
    market: "wood",
    refuge: "concrete",
    factory: "metal_grating",
    ruin: "concrete",
    shrine: "tile",
  };
  return mapping[type];
}
```

---

## Testing Factories

### Determinism Tests

```typescript
// packages/playground/src/factories/__tests__/determinism.test.ts

import { describe, it, expect } from "vitest";
import { territoryFactory } from "../territory.factory";
import { connectionFactory } from "../connection.factory";

describe("Factory Determinism", () => {
  it("same seed produces identical territory", () => {
    const seed = "test-territory-001";

    const result1 = territoryFactory(seed, "academy", "medium");
    const result2 = territoryFactory(seed, "academy", "medium");

    expect(result1).toEqual(result2);
  });

  it("different seeds produce different territories", () => {
    const result1 = territoryFactory("seed-a", "academy", "medium");
    const result2 = territoryFactory("seed-b", "academy", "medium");

    expect(result1.definition.id).not.toEqual(result2.definition.id);
  });

  it("world generation is reproducible", async () => {
    const masterSeed = "flooded-neo-tokyo-test-001";

    const world1 = await generateWorld(masterSeed);
    const world2 = await generateWorld(masterSeed);

    expect(world1).toEqual(world2);
  });
});
```

---

## Migration Path

### From Old World Generation

1. **Phase 1**: Create DDL catalogs for existing primitives
2. **Phase 2**: Implement territory factory using existing components
3. **Phase 3**: Implement connection factory for bridges/boats
4. **Phase 4**: Implement world graph executor
5. **Phase 5**: Replace old district system with territory system

### Backward Compatibility

Existing test pages continue to work - factories are additive.
New compound components (Shelter, Bridge, etc.) wrap primitives.

---

*"Define what the world contains. Let the factories build it."*

---

Last Updated: 2026-01-19
