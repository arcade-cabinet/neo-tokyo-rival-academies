# World Generation System v1.0

**Philosophy**: Build-time only (no runtime API calls for browser-first perf). Districts/quests trigger manifest.json generation → CLI `pnpm generate` builds GLBs.

## World Generation Pipeline (Deterministic Order)

1. Set master seed `masterSeed = "Jon-NeoLincoln-2026-v1"`
2. Create three global strata elevation anchors
   - Upper: y = 60–100
   - Mid:   y = 0–40
   - Lower: y = -30 – 0
3. Generate district seeds (6–9 districts)
   - `districtCount = Math.floor(rng(masterSeed + "-districtCount") * 4) + 6`
   - For i = 0 to districtCount-1: `districtSeed[i] = masterSeed + "-district-" + i`
4. Assign district profiles (theme, density, vertical bias, quest affinity)
   - Use a seeded weighted table (example below)
5. Generate major connecting infrastructure
   - Highways (low-curvature, high-traffic)
   - Inter-strata bridges/elevators (gated by story progress)
6. Generate global landmark seeds
   - Central reactor/pillar (fixed position, high vertical span)
   - Major corporate HQ (upper stratum)
   - Hidden resistance base (lower stratum)

## District Profiles (10 Canonical Entries)

| # | Name                     | Theme Key       | Density (0–1) | Vertical Bias      | Quest Affinity          | Visual Rules (Procedural + Meshy Triggers)                          | Faction Tie-In                  | Signature Landmark (GenAI Prompt Stub) |
|---|--------------------------|-----------------|---------------|--------------------|-------------------------|---------------------------------------------------------------------|---------------------------------|----------------------------------------|
| 1 | Academy Gate Slums       | slum            | 0.45          | Lower-heavy        | Resistance / Mystery    | Overgrowth vines, rusted neon, damp fog; low buildings with graffiti | Neutral starter (pre-choice)    | "Rusted academy gate with flickering holo-invite" |
| 2 | Neon Spire Entertainment | neon            | 0.78          | Mid-heavy          | Black-market / Side gigs| Tall glass towers, overbright billboards, looping boulevards        | Mixed (post-choice lean)        | "Central HoloPlaza with animated billboards" |
| 3 | Corporate Pinnacle       | corporate       | 0.90          | Upper-heavy        | Loyalty / Negotiation   | Pristine skyscrapers, elite guards, secure vaults                   | Azure-strong                    | "Elite rooftop helipad with corporate logo" |
| 4 | Industrial Forge District| industrial      | 0.65          | Mid/Lower          | Sabotage / Fetch        | Heavy machinery, sparking pipes, massive reactors                   | Kurenai-strong (passion factories)| "Leaking industrial reactor core" |
| 5 | Underground Sewer Network| slum            | 0.40          | Lower-exclusive    | Exploration / Secrets   | Damp tunnels, overgrown grates, hidden caches                       | Resistance hideouts             | "Sewer junction with resistance graffiti" |
| 6 | Rooftop Skybridge Cluster| transition      | 0.70          | Upper/Mid          | Escort / Challenge      | Elevated bridges, wind-swept platforms, drone traffic               | Balanced rivalry duels          | "Suspension skybridge with catenary cables" |
| 7 | Abandoned Overgrowth Zone| slum            | 0.35          | Lower-heavy        | Mystery / Uncover       | Vines reclaiming ruins, cursed relics, forgotten tech               | Third-path mystery unlocks      | "Overgrown abandoned reactor ruins" |
| 8 | Club Eclipse Nightlife   | neon            | 0.82          | Mid-heavy          | Eavesdrop / Expose      | VIP lounges, jittery crowds, flickering clubs                       | Black-market neutral            | "Club Eclipse entrance with elite bouncers" |
| 9 | Central Pillar Hub       | corporate       | 0.85          | Balanced (all strata)| Report / Decipher       | Massive central structure, elevators, faction banners               | Main story nexus                | "Central Pillar with stratum elevators" |
|10| Fringe Resistance Alley  | transition      | 0.55          | Lower/Mid          | Steal / Hack            | Hidden alleys, runner hideouts, damp archives                        | Kurenai-leaning rebellion       | "Hidden resistance cache behind graffiti" |

## Procedural Rules
- **Placement**: Voronoi + noise from master seed → assign profiles by weighted table (higher weight for core themes).
- **GenAI Triggers**: On district load, if signature landmark missing → auto-manifest.json (e.g., "cyberpunk [landmark] in cel-shaded style, 20k polys").
- **Quest Bias**: themeKey feeds generator adjectives; affinity shifts verb weights (±0.3 for matching alignment).
- **Visual/Encounter Density**: Higher density → more billboards/drones/NPCs; lower → secrets/overgrowth.

## District Streaming Prototype (Mobile Memory Optimization)
**Philosophy**:
- **On-Demand**: Load active + adjacent districts; unload far ones.
- **Progressive**: Core starter always resident; stream others via asset manager.
- **Seeded Safe**: Regen from seed on load (no state loss).

**Implementation**:
```ts
// DistrictManager.ts (Zustand or singleton)
const useDistrictStore = create((set) => ({
  activeDistricts: new Set<string>(), // IDs from seed
  loadDistrict: async (districtId: string) => {
    const manifest = await fetch(`/assets/districts/${districtId}.manifest.json`);
    // Babylon AssetManager load GLBs/textures
    // Generate procedural (roads/bridges/NPCs) from sub-seed
    set((state) => ({ activeDistricts: new Set([...state.activeDistricts, districtId]) }));
  },
  unloadDistrict: (districtId: string) => {
    // Dispose meshes/particles
    set((state) => {
      const newSet = new Set(state.activeDistricts);
      newSet.delete(districtId);
      return { activeDistricts: newSet };
    });
  },
}));
```