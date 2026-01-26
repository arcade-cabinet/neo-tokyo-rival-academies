# Neo-Tokyo: Rival Academies - Golden Record v2.1

**Date**: January 26, 2026
**Author**: Creative Realignment (Flooded World Pivot)
**Purpose**: Complete, canonical spec for the Flooded Neo-Tokyo Action-JRPG

---

## UNITY 6 IMPLEMENTATION COMPLETE (January 2026)

The game runtime has been **fully migrated to Unity 6 DOTS**. All core systems are now implemented in C# using the Entity Component System architecture.

**Technical Documentation**: [UNITY_6_ARCHITECTURE.md](UNITY_6_ARCHITECTURE.md)

### Implemented Systems (25+)

| Category | Systems | Status |
|----------|---------|--------|
| **Combat** | CombatSystem, HitDetectionSystem, BreakSystem, HazardSystem, ArenaSystem, WaterCombatSystem | COMPLETE |
| **AI** | AIStateMachineSystem, ThreatSystem, SteeringSystem, CrowdSystem, EnemyAISystem, SwarmCoordinationSystem, PerceptionSystem, TentacleSwarmSystem | COMPLETE |
| **Progression** | ReputationSystem, ProgressionSystem, AlignmentBonusSystem, AlignmentGateSystem, StatAllocationSystem | COMPLETE |
| **World** | HexGridSystem, TerritorySystem, WaterSystem, WeatherSystem, BoatSystem, StageSystem, ManifestSpawnerSystem, ProceduralGenerationSystem | COMPLETE |
| **Other** | AbilitySystem, NavigationSystem, EquipmentSystem, DialogueSystem, QuestSystem, QuestGeneratorSystem, SaveSystem | COMPLETE |

### TypeScript Dev Tools (Preserved)

| Package | Purpose | Status |
|---------|---------|--------|
| `dev-tools/content-gen` | Meshy/Gemini asset generation | ACTIVE |
| `dev-tools/e2e` | Playwright E2E tests | ACTIVE |
| `dev-tools/types` | Shared type definitions | ACTIVE |

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
- **Target**: Unity native builds (iOS/Android)
- **Performance**: < 200MB memory, < 3.5s interactive

### Unity 6 DOTS Architecture
- **ECS**: Unity Entities 1.3.x with Burst compilation
- **Rendering**: URP with custom shaders
- **Physics**: Unity Physics
- **Navigation**: AI Navigation package
- **Input**: New Input System with touch support

### Rendering Approach (ADAPTED)
- **NO NEON**: Power is scarce, displays wasteful
- **Weathered Aesthetic**: Rust, water stains, patched materials (URP shaders)
- **Natural Lighting**: Sunlight, overcast, lanterns, bonfires
- **Water Shaders**: Murky, reflective, dynamic (WaterSystem integration)

### Asset Pipeline (PRESERVED)
- Build-time GenAI via Meshy (TypeScript CLI)
- Seeded deterministic generation
- Manifest-driven asset loading (ManifestLoader -> ManifestSpawnerSystem)

---

## Phase Roadmap (UPDATED - Post Unity 6 Migration)

### Phase 1: Foundation - COMPLETE (Jan 15-25, 2026)
- [x] Unity 6 DOTS architecture implementation
- [x] 25+ core systems (Combat, AI, Progression, World)
- [x] Component hierarchy (see UNITY_6_ARCHITECTURE.md)
- [x] CI/CD integration (GitHub Actions)
- [x] TypeScript dev tools preserved (content-gen, e2e)
- [x] ManifestLoader bridge (TypeScript -> Unity)

### Phase 2: Content & Gameplay (Feb - Mar 2026)
- [ ] Kurenai Academy territory complete
- [ ] Azure Academy territory complete
- [ ] Quest system integration
- [ ] Combat polish and balancing
- [ ] Save/load system integration
- [ ] Physical device testing (Pixel 8a)

### Phase 3: Story & Expansion (Apr - Jun 2026)
- [ ] All 10 territories
- [ ] Full 3-act story
- [ ] Vera rivalry arc
- [ ] Multiple endings
- [ ] Faction reputation consequences

### Phase 4: Polish (Jul - Sep 2026)
- [ ] Sound design (water ambience, etc.)
- [ ] Weather system visuals
- [ ] Particle effects
- [ ] Performance optimization
- [ ] Extended playtesting

### Phase 5: Launch (Oct - Dec 2026)
- [ ] App store submissions
- [ ] Desktop release
- [ ] Beta testing
- [ ] Public release
- [ ] Seed sharing features

---

## Agent Instructions

When implementing features:

1. **Read** [UNITY_6_ARCHITECTURE.md](UNITY_6_ARCHITECTURE.md) for technical patterns
2. **Read** [FLOODED_WORLD.md](FLOODED_WORLD.md) for thematic guidance
3. **Use** [PROCEDURAL_ARCHITECTURE.md](PROCEDURAL_ARCHITECTURE.md) for generation patterns
4. **Preserve** narrative anchors (hero, rival, academies, factions)
5. **Avoid** neon, clean tech, abundance - this is survival
6. **Test** on physical devices (Pixel 8a baseline)
7. **Follow** DOTS patterns: Components are data, Systems are logic

### Key Files (Unity 6)
- `Assets/Scripts/Components/` - ECS component definitions
- `Assets/Scripts/Systems/` - DOTS systems (ISystem structs)
- `Assets/Scripts/Authoring/` - GameObject -> Entity bakers
- `Assets/Scripts/MonoBehaviours/` - UI, Input, Camera only
- `Assets/Scripts/Data/` - Static data, manifest schemas
- `dev-tools/content-gen/` - TypeScript asset generation CLI

### Key Documentation
- `docs/UNITY_6_ARCHITECTURE.md` - Technical architecture
- `docs/FLOODED_WORLD.md` - World design bible
- `docs/PROCEDURAL_ARCHITECTURE.md` - Generation patterns
- `docs/DEPRECATIONS.md` - What NOT to use

---

> "The city drowned, but the rivalry survived. In the reflection of dark waters, two academies still clash."

---

Last Updated: 2026-01-26
