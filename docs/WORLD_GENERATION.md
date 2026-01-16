# World Generation System

> **Purpose**: Define the deterministic procedural generation pipeline for Neo-Tokyo's diorama districts.

## Overview

The world is generated using a **seeded hierarchy**:
1. Master seed → global parameters
2. District seeds → neighborhood content
3. Quest cluster seeds → individual encounters

This ensures **idempotent generation**: same seed = same world, every time.

## Seed Hierarchy

```text
Master Seed: "Jon-NeoTokyo-2026-v1"
    │
    ├── District Seeds (derived)
    │   ├── "master-district-0"
    │   ├── "master-district-1"
    │   └── ... (6-9 districts)
    │
    ├── Quest Cluster Seeds (per district/act)
    │   └── "district-3-act1-cluster"
    │
    └── Encounter Seeds (per moment)
        └── "cluster-encounter-boss"
```

## Implementation

```typescript
import seedrandom from 'seedrandom';

// Master seed from URL param or default
const masterSeed = new URLSearchParams(window.location.search).get('seed')
  || 'NeoTokyo-Production-v1';

// District count (6-9)
const rng = seedrandom(masterSeed + '-district-count');
const districtCount = Math.floor(rng() * 4) + 6;

// Per-district seed
const getDistrictSeed = (index: number) => `${masterSeed}-district-${index}`;
```

## Vertical Strata

The world has three vertical layers:

| Stratum | Y Range | Theme | Access |
|---------|---------|-------|--------|
| Upper | 60-100 | Corporate, elite | Act 3+ |
| Mid | 0-40 | Main playable | Default |
| Lower | -30 to 0 | Slums, secrets | Quest unlocks |

### Strata Generation Rules

```typescript
const strataConfig = {
  upper: { yMin: 60, yMax: 100, densityMod: 0.9, theme: 'corporate' },
  mid: { yMin: 0, yMax: 40, densityMod: 1.0, theme: 'mixed' },
  lower: { yMin: -30, yMax: 0, densityMod: 0.5, theme: 'slum' }
};
```

## District Profile System

### Profile Table (10 Canonical Districts)

| # | Name | Theme Key | Density | Vertical Bias | Quest Affinity | Faction Tie |
|---|------|-----------|---------|---------------|----------------|-------------|
| 1 | Academy Gate Slums | slum | 0.45 | Lower | Resistance/Mystery | Neutral (starter) |
| 2 | Neon Spire Entertainment | neon | 0.78 | Mid | Black-market/Sides | Mixed |
| 3 | Corporate Pinnacle | corporate | 0.90 | Upper | Loyalty/Negotiate | Azure |
| 4 | Industrial Forge District | industrial | 0.65 | Mid/Lower | Sabotage/Fetch | Kurenai |
| 5 | Underground Sewer Network | slum | 0.40 | Lower | Exploration/Secrets | Resistance |
| 6 | Rooftop Skybridge Cluster | transition | 0.70 | Upper/Mid | Escort/Challenge | Balanced |
| 7 | Abandoned Overgrowth Zone | slum | 0.35 | Lower | Mystery/Uncover | Third-path |
| 8 | Club Eclipse Nightlife | neon | 0.82 | Mid | Eavesdrop/Expose | Black-market |
| 9 | Central Pillar Hub | corporate | 0.85 | All strata | Report/Decipher | Main nexus |
| 10 | Fringe Resistance Alley | transition | 0.55 | Lower/Mid | Steal/Hack | Kurenai |

### Profile Type Definition

```typescript
interface DistrictProfile {
  id: string;
  name: string;
  themeKey: 'slum' | 'neon' | 'corporate' | 'industrial' | 'transition';
  density: number;           // 0-1, affects building/NPC count
  verticalBias: 'lower' | 'mid' | 'upper' | 'balanced';
  questAffinity: string[];   // Quest verb preferences
  factionTie: 'kurenai' | 'azure' | 'neutral' | 'resistance';
  visualRules: {
    buildingHeight: [number, number];  // [min, max]
    neonIntensity: number;             // 0-1
    overgrowth: boolean;
    hasRoads: boolean;
  };
  signatureLandmark: string;  // GenAI prompt for key asset
}
```

## Procedural Generation Pipeline

### Step 1: District Placement

```typescript
const generateDistrictLayout = (seed: string, count: number) => {
  const rng = seedrandom(seed);
  const districts: DistrictPlacement[] = [];

  // Voronoi-based placement with noise perturbation
  for (let i = 0; i < count; i++) {
    const profile = selectProfile(rng);
    const position = {
      x: (rng() - 0.5) * WORLD_SIZE,
      z: (rng() - 0.5) * WORLD_SIZE
    };
    districts.push({ profile, position, seed: `${seed}-district-${i}` });
  }

  return districts;
};
```

### Step 2: Building Generation

```typescript
const generateBuildings = (districtSeed: string, profile: DistrictProfile) => {
  const rng = seedrandom(districtSeed + '-buildings');
  const buildings: BuildingInstance[] = [];

  const gridSize = Math.floor(profile.density * 20);

  for (let x = 0; x < gridSize; x++) {
    for (let z = 0; z < gridSize; z++) {
      if (rng() > profile.density) continue;

      const height = profile.visualRules.buildingHeight[0] +
        rng() * (profile.visualRules.buildingHeight[1] - profile.visualRules.buildingHeight[0]);

      buildings.push({
        position: [x * BLOCK_SIZE, 0, z * BLOCK_SIZE],
        height,
        theme: profile.themeKey
      });
    }
  }

  return buildings;
};
```

### Step 3: Road Network

```typescript
const generateRoads = (districtSeed: string, buildings: BuildingInstance[]) => {
  const rng = seedrandom(districtSeed + '-roads');

  // Delaunay triangulation of building centers
  // Connect with noise-perturbed paths
  // Avoid building footprints

  return roadSegments;
};
```

### Step 4: Bridge Placement

```typescript
const generateBridges = (districtSeed: string, roads: RoadSegment[]) => {
  // Identify vertical gaps
  // Place suspension bridges at major crossings
  // Simple ramps for minor connections

  return bridges;
};
```

## Integration with Quest System

Districts auto-trigger quest cluster generation:

```typescript
// On district enter
useEffect(() => {
  const clusterSeed = `${districtSeed}-${currentAct}-cluster`;
  generateQuestCluster(clusterSeed, districtProfile);
}, [districtSeed, currentAct]);
```

## GenAI Asset Triggers

Each district profile includes a `signatureLandmark` prompt:

```typescript
// On first visit to district
if (!hasAsset(districtProfile.signatureLandmark)) {
  // Generate manifest for build-time Meshy call
  createManifest({
    id: `landmark-${districtProfile.id}`,
    type: 'prop',
    prompt: districtProfile.signatureLandmark,
    polyBudget: 25000
  });
}
```

## Streaming & Memory

Only 2-3 districts are loaded at once:

```typescript
const useDistrictStreaming = () => {
  const activeDistricts = useRef<Set<string>>(new Set());

  useBeforeRender(() => {
    const playerPos = getPlayerPosition();
    const current = getDistrictFromPos(playerPos);
    const adjacent = getAdjacentDistricts(current);

    // Load adjacent
    adjacent.forEach(id => {
      if (!activeDistricts.current.has(id)) loadDistrict(id);
    });

    // Unload far
    activeDistricts.current.forEach(id => {
      if (distanceToDistrict(id, playerPos) > UNLOAD_THRESHOLD) {
        unloadDistrict(id);
        activeDistricts.current.delete(id);
      }
    });
  });
};
```

## Reproducibility Testing

```bash
# Generate world with specific seed
pnpm dev --seed="test-seed-123"

# Should produce identical district layout every time
```

---

*Every procedural element traces back to the master seed. No randomness escapes the chain.*
