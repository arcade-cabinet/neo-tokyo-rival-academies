# Neo-Tokyo: Rival Academies - Golden Record v2.0

**Date**: January 19, 2026
**Author**: Creative Realignment (Flooded World Pivot)
**Purpose**: Complete, canonical spec for the Flooded Neo-Tokyo Action-JRPG

---

## The World

Forty years ago, Neo-Tokyo flooded. The city drowned floor by floor until the waterline stabilized at the fourth story. Now life happens on rooftops - territories connected by makeshift bridges, reached by boat, defended by youth trained in rival academies.

**Core Reference**: [FLOODED_WORLD.md](FLOODED_WORLD.md)

---

## Narrative Anchors (PRESERVED)

These elements are the SOUL of the game. The setting changes, the core remains:

### The Hero
- **Name**: Kai (player-named option)
- **Origin**: Orphan raised by Kurenai Academy
- **Age**: 17
- **Starting Location**: Kurenai Academy rooftop territory
- **Drive**: Prove themselves, discover their past

### The Rival
- **Name**: Vera
- **Origin**: Rising star of Azure Academy
- **Philosophy**: Cold logic, calculated precision
- **Relationship**: Starts as antagonist, evolves based on player choices
- **Weapon**: The Null Set (collapsible lance)

### The Academies
| Academy | Philosophy | Territory | Specialty |
|---------|------------|-----------|-----------|
| **Kurenai** | "Passion burns brighter" | Eastern rooftops | Combat, athletics |
| **Azure** | "Adapt or drown" | Western rooftops | Navigation, engineering |

### The Factions

| Faction | Role | Leader | Territory |
|---------|------|--------|-----------|
| **The Syndicate** | Yakuza successors | Boss Tanaka | Floating gambling barges, dock control |
| **The Runners** | Former bikers, now boaters | Road Queen Mika | Speedboat crews, canal networks |
| **The Collective** | Merchant alliance | Elder Merchants | Central market platforms |
| **The Drowned** | Cult of the deep | The Prophet | Submerged ruins, diving expeditions |

### The Authority
- **The Council of Seven**: Representatives from major territories
- **Function**: Mediates disputes, sanctions tournaments
- **Power**: Limited - territories largely self-governing
- **Location**: Neutral shrine district

---

## Story Structure (PRESERVED, ADAPTED)

### Act 1: Awakening
**Setting**: Kurenai Academy and surrounding territories

| Beat | Original | Flooded Version |
|------|----------|-----------------|
| Tutorial | Academy training ground | Rooftop training platforms |
| First Mission | Street patrol | Bridge patrol, pirate encounter |
| Rival Intro | School encounter | Inter-academy boat race |
| First Boss | Street gang leader | Canal pirate captain |
| Act End | Neon Slums revelation | Discover flooded archives |

### Act 2: The Tournament
**Setting**: Expanding to contested territories

| Beat | Original | Flooded Version |
|------|----------|-----------------|
| Tournament Announcement | Academy assembly | Council declaration |
| Qualification | Street battles | Territory challenges |
| Preliminary Rounds | Arena fights | Multi-territory gauntlet |
| Vera Showdown | Championship match | Bridge duel, dramatic setting |
| Fallout | Academy politics | Territory consequences |

### Act 3: Mirror Climax
**Setting**: Deep territories and final confrontation

| Beat | Original | Flooded Version |
|------|----------|-----------------|
| Conspiracy Reveal | Corporate plot | Why the flooding happened |
| Extremes | Faction warfare | Territory wars, alliance choices |
| Final Vera | Ultimate rivalry battle | Flooded arena, sinking terrain |
| Final Boss | Conspiracy leader | The architect of the flood |
| Endings | Alignment-based | 3+ endings based on choices |

---

## Alignment System (PRESERVED)

The philosophical core remains identical:

```
-1.0 ←——— Kurenai ——— 0 ——— Azure ———→ +1.0
          Passion       Neutral      Logic
```

**How Alignment Manifests in Flooded World:**

| Alignment | Gameplay Effect | Story Access |
|-----------|-----------------|--------------|
| **Extreme Kurenai** | +2 Ignition, reckless options | Kurenai coup questline |
| **Strong Kurenai** | +1 Ignition, passion dialogue | Hot-headed ally quests |
| **Neutral** | Balanced stats | Both faction access |
| **Strong Azure** | +1 Logic, calculated dialogue | Strategic ally quests |
| **Extreme Azure** | +2 Logic, cold options | Azure takeover questline |

---

## Combat System (PRESERVED)

### The Four Stats
| Stat | Meaning | Flooded Context |
|------|---------|-----------------|
| **Structure** | HP, Defense | Survival in harsh conditions |
| **Ignition** | Attack, Crits | Aggressive, passionate fighting |
| **Logic** | Skills, Special | Tactical, environmental use |
| **Flow** | Speed, Evasion | Water movement, agility |

### Spin-Out Combat (PRESERVED)
Combat transitions to dedicated arena view:
- **Rooftop arenas**: Standard combat platforms
- **Bridge battles**: Narrow, fall hazards
- **Boat duels**: Rocking, water hazards
- **Flooded interiors**: Waist-deep water, movement penalties

### Combat Arenas by Territory Type

| Territory | Arena Characteristics |
|-----------|----------------------|
| Academy | Training platforms, fair ground |
| Market | Cluttered, environmental objects |
| Refuge | Tight spaces, civilian concerns |
| Factory | Industrial hazards, machines |
| Ruin | Unstable, collapsing sections |
| Water | Floating platforms, submersion risk |

---

## Quest System (ADAPTED)

### Quest Grammar (PRESERVED structure, new vocabulary)

**Nouns** (targets):
- Salvage crates, water filters, boat parts
- Academy tokens, trade certificates
- Stolen goods, pirate loot
- Historical artifacts (from flooded depths)
- People: students, merchants, refugees

**Verbs** (actions):
- Retrieve, escort, defend, infiltrate
- Dive (underwater missions)
- Navigate (boat chase/race)
- Negotiate, investigate, sabotage

**Adjectives** (modifiers):
- Contested (faction conflict)
- Submerged (underwater component)
- Urgent (time-limited)
- Covert (stealth approach)

### Quest Types by Faction Affinity

| Quest Type | Kurenai Lean | Azure Lean | Neutral |
|------------|--------------|------------|---------|
| Combat | Raid missions | Defense strategy | Bounty hunting |
| Exploration | Reckless diving | Mapped expeditions | Salvage runs |
| Social | Passionate appeals | Logical arguments | Trade negotiations |

---

## World Generation (ADAPTED)

**Core Reference**: [PROCEDURAL_ARCHITECTURE.md](PROCEDURAL_ARCHITECTURE.md)

### Territory System (replaces Districts)

```
masterSeed → territorySeeds[] → connectionSeeds[] → populationSeeds[]
```

### Territory Profiles (10 Canonical)

| # | Name | Type | Faction | Signature |
|---|------|------|---------|-----------|
| 1 | Kurenai Academy | academy | Kurenai | Training platforms, red tarps |
| 2 | Azure Academy | academy | Azure | Workshop towers, blue canopies |
| 3 | The Collective Market | market | Neutral | Floating stalls, crowded docks |
| 4 | Eastern Refuge | refuge | Kurenai-leaning | Dense housing, gardens |
| 5 | Western Refuge | refuge | Azure-leaning | Organized shelters, cisterns |
| 6 | Syndicate Docks | factory | Syndicate | Gambling barges, warehouses |
| 7 | Runner's Canal | transition | Runners | Speedboat docks, racing course |
| 8 | Shrine Heights | shrine | Neutral | Sacred peace, council meetings |
| 9 | The Deep Reach | ruin | Contested | Salvage site, dangerous diving |
| 10 | Drowned Archives | ruin | The Drowned | Submerged library, cult territory |

---

## Technology Constraints

### Mobile-First (PRESERVED)
- **Baseline**: Pixel 8a at 60 FPS
- **Target**: PWA + Capacitor native wrapper
- **Performance**: < 200MB memory, < 3.5s interactive

### Rendering Approach (ADAPTED)
- **NO NEON**: Power is scarce, displays wasteful
- **Weathered Aesthetic**: Rust, water stains, patched materials
- **Natural Lighting**: Sunlight, overcast, lanterns, bonfires
- **Water Shaders**: Murky, reflective, dynamic

### Asset Pipeline (PRESERVED)
- Build-time GenAI via Meshy
- Seeded deterministic generation
- Manifest-driven asset loading

---

## Phase Roadmap (UPDATED)

### Phase 1: Foundation (Current - Mar 31)
- [x] Playground primitives (walls, floors, water, etc.)
- [x] Neon removal (thematic alignment)
- [ ] Territory factory implementation
- [ ] Connection factory (bridges, boats)
- [ ] Academy territory prototype
- [ ] Hero spawn and movement
- [ ] Basic combat arena

### Phase 2: Story (Apr - Jun)
- [ ] Kurenai Academy full territory
- [ ] Azure Academy territory
- [ ] Market Collective territory
- [ ] Act 1 quest implementation
- [ ] Vera introduction
- [ ] Syndicate faction quests

### Phase 3: Polish (Jul - Sep)
- [ ] All 10 territories
- [ ] Full 3-act story
- [ ] Sound design (water ambience, etc.)
- [ ] Weather systems
- [ ] Save/load system

### Phase 4: Launch (Oct - Dec)
- [ ] Performance optimization
- [ ] Mobile testing validation
- [ ] Beta testing
- [ ] Public release
- [ ] Seed sharing features

---

## Agent Instructions

When implementing features:

1. **Read** [FLOODED_WORLD.md](FLOODED_WORLD.md) for thematic guidance
2. **Use** [PROCEDURAL_ARCHITECTURE.md](PROCEDURAL_ARCHITECTURE.md) for factory patterns
3. **Preserve** narrative anchors (hero, rival, academies, factions)
4. **Avoid** neon, clean tech, abundance - this is survival
5. **Test** on physical devices (Pixel 8a baseline)

### Key Files
- `packages/playground/` - Primitive components for world building
- `packages/game/` - Main game implementation
- `docs/FLOODED_WORLD.md` - World design bible
- `docs/PROCEDURAL_ARCHITECTURE.md` - Generation patterns

---

> "The city drowned, but the rivalry survived. In the reflection of dark waters, two academies still clash."

---

Last Updated: 2026-01-19
