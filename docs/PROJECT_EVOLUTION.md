# Project Evolution: Platformer to JRPG to Unity 6

This document captures the **chronological evolution** of Neo-Tokyo: Rival Academies from its origins as a 3D platformer through its transformation to a 3D Action JRPG, and finally to its current Unity 6 DOTS implementation.

---

## Timeline Overview

```text
Jan 13, 2026    POC.html → 3D Platformer scaffold
    │
    ├── Android/Capacitor mobile wrapper
    ├── Original storyboard (The Midnight Exam)
    ├── Character designs: Kai & Vera
    │
Jan 14, 2026    JRPG TRANSFORMATION
    │
    ├── ECS Architecture (Miniplex)
    ├── Stats System (Structure, Ignition, Logic, Flow)
    ├── Combat System with RPG damage
    ├── Visual Novel dialogue system
    │
Jan 15, 2026    SYSTEMS REFINEMENT
    │
    ├── CollectibleSystem extracted
    ├── Limb component optimization
    ├── Performance improvements
    ├── GenAI pipeline (Meshy AI)
    ├── 9 characters generated
    │
Jan 17-25, 2026 UNITY 6 MIGRATION ★
    │
    ├── Full migration to Unity 6 DOTS
    ├── 25+ systems implemented in C#
    ├── TypeScript runtime archived
    ├── Dev tools preserved (content-gen, e2e)
    │
    ↓
CURRENT STATE (Unity 6 DOTS Action JRPG)
```

---

## Phase 1: The Original Vision (poc.html)

**Jules Session**: `12852271386532315666`
**Date**: January 13, 2026
**Status**: Paused

### Original Concept: "The Midnight Exam"

The game started as a **high-speed parkour race** across Neo-Tokyo's skyline.

```markdown
# From STORY.md (original version)

## The Conflict: The Midnight Exam

Every year, the two top academies compete in an illegal, high-speed
parkour race across the skyline to claim the "Data Core" from the
summit of the Orbital Elevator.
```

### Initial Factions

| Academy | Philosophy | Color Scheme | Prodigy |
|---------|------------|--------------|---------|
| **Kurenai Technical High** | "Ignition" - Passion, brute force | Crimson, Black, Gold | Kai "Spark" Takeda |
| **Azure Logic Institute** | "Calculation" - Precision, speed | Cobalt, White, Silver | Vera "Vector" Kusanagi |

### Original Weapons

**Kai's Weapon: The Redline Piston**
- A massive pile-bunker/hammer powered by a V12 engine block
- "It smokes and vibrates constantly"

**Vera's Weapon: The Null Set**
- A floating geometric railgun lance
- "Disassembles and reassembles itself"

### Technical Foundation

- **Android/Capacitor** mobile wrapper configured
- **Three.js + React Three Fiber** for 3D rendering
- **Astro** for static site generation
- Basic player movement and platforming

---

## Phase 2: The JRPG Transformation

**Jules Session**: `107803072628449215`
**Date**: January 14, 2026
**Status**: Planning (ongoing evolution)

### Major Architecture Changes

#### Before (Platformer)
```
src/
├── components/react/
│   ├── scenes/     # 3D scenes
│   └── ui/         # HUD
├── layouts/        # Astro layouts
└── utils/          # Shared utilities
```

#### After (JRPG)
```
src/
├── components/react/
│   ├── objects/    # Character, Enemy
│   ├── ui/         # HUD, Menus, Dialogue
│   └── game/       # GameWorld, Managers
├── systems/        # ECS Systems (Combat, AI, Physics)
├── state/          # ECS + Zustand
├── data/           # Static data (story.json)
└── utils/          # Helpers
```

### New Core Technologies

| Addition | Purpose |
|----------|---------|
| **Miniplex** | Entity Component System for game logic |
| **Zustand** | React state management |
| **Vitest** | Unit testing framework |
| **Capacitor 8** | Native mobile wrapper (upgraded) |

### JRPG Stats System

The platformer's simple physics-based gameplay transformed into a stats-driven RPG:

| Stat | Acronym | Description |
|------|---------|-------------|
| **Structure** | STR | Health, defense, physical resilience |
| **Ignition** | IGN | Attack power, critical hits |
| **Logic** | LOG | Skill damage, special abilities |
| **Flow** | FLW | Speed, evasion, action economy |

### Combat System Evolution

**Platformer Combat**: Collision-based, instant damage
```typescript
// Old approach
if (playerHitsEnemy) {
  enemy.destroy();
  score += 100;
}
```

**JRPG Combat**: Stats-based damage calculation
```typescript
// New approach
const damage = calculateDamage({
  attackerIgnition: player.stats.ignition,
  defenderStructure: enemy.stats.structure,
  attackType: 'physical',
  criticalMultiplier: 1.5
});
enemy.stats.health -= damage;
```

### Visual Novel Integration

Added dialogue overlay system for narrative progression:
```json
// src/data/story.json structure
{
  "scenes": [
    {
      "id": "intro_kai_vera",
      "dialogue": [
        { "speaker": "KAI", "text": "Hey Vector! Try not to overheat!" },
        { "speaker": "VERA", "text": "Your noise is inefficient, Takeda." }
      ]
    }
  ]
}
```

### AGENTS.md Transformation

Key changes to development guidelines:

```diff
- **Neo-Tokyo: Rival Academies** is a 3D platformer game...
+ **Neo-Tokyo: Rival Academies** is a **3D Action JRPG**...

+ ## CRITICAL RULES FOR AGENTS
+ 1. **ZERO STUBS POLICY**: No TODO comments or empty functions
+ 2. **PRODUCTION QUALITY**: Strict TypeScript, no `any`
+ 3. **VERIFY EVERYTHING**: Read files back after changes
+ 4. **TEST DRIVEN**: Write tests during implementation
+ 5. **VISUAL STYLE**: Use meshToonMaterial for cel-shaded look
```

---

## Phase 3: Systems Refinement

### CollectibleSystem Extraction

**Jules Session**: `7166703209184058505`
**Date**: January 15, 2026

**Problem**: Collectible pickup logic was embedded in CombatSystem, making it hard to trigger story events.

**Solution**: Created dedicated `CollectibleSystem.tsx`:
```typescript
export function CollectibleSystem({ onCollectiblePickup }) {
  const collectibles = world.with('isCollectible', 'position');
  const player = world.with('isPlayer', 'position').first;

  for (const collectible of collectibles) {
    const distance = player.position.distanceTo(collectible.position);
    if (distance < 1.5) {
      onCollectiblePickup(collectible);
      world.remove(collectible);
    }
  }
  return null;
}
```

### Limb Component Optimization

**Jules Session**: `9325261586465291625`
**Date**: January 15, 2026

**Problem**: `Limb` component was defined inside `Character`, causing recreation on every render.

**Solution**: Extracted to module scope with proper props:
```typescript
// Before: Inside Character function
const Limb = ({ x, y, w, h, limbRef, hasWeapon }) => (...)

// After: Outside, with isPlayer prop
const Limb = ({ x, y, w, h, limbRef, hasWeapon, isPlayer }) => (...)
```

### Performance Optimizations

**Jules Sessions**: `15231540528192839108`, `6650948937526831592`, `2580391778710306181`, `4817043573452165920`
**Date**: January 15, 2026

- **Position passing**: Changed from array spread to direct Vector3
- **Interface flexibility**: Accept both `Vector3` and `[number, number, number]`
- **Memory efficiency**: Reduced object allocations in render loop

```diff
- position={[entity.position.x, entity.position.y, entity.position.z]}
+ position={entity.position}
```

---

## Phase 4: GenAI Pipeline Integration

**Date**: January 15, 2026 (Post-Jules, Claude Code session)

### Asset Generation Pipeline

Transitioned from placeholder assets to production-ready GenAI-generated content:

| Stage | Technology | Output |
|-------|------------|--------|
| **Concept** | Meshy text-to-image | Multi-view character art |
| **Model** | Meshy multi-image-to-3d | 30K poly GLB |
| **Rigging** | Meshy rigging API | Humanoid skeleton |
| **Animation** | Meshy animation API | Combat, movement GLBs |

### Generated Characters (9 Total)

**Main Characters** (Hero preset - 7 animations)
- Kai - Crimson Academy protagonist
- Vera - Azure Academy rival

**B-Story Characters** (Enemy/Boss presets)
- Yakuza Grunt, Yakuza Boss
- Biker Grunt, Biker Boss

**C-Story Characters** (Enemy preset + Prop)
- Mall Security Guard
- Alien Humanoid
- Tentacle Single (prop, no rigging)

### Prompt Engineering Evolution

Added explicit anatomical sections to prevent AI deformities:
```
HANDS: two hands with five distinct fingers each, proper finger
proportions with defined knuckles, natural finger spacing.

FACE: small well-shaped ears with defined curves, straight nose
with defined bridge, distinct naturally shaped lips.
```

---

## Phase 5: Unity 6 Migration (January 17-25, 2026)

**The Pivotal Decision**

After evaluating the TypeScript/Babylon.js stack's limitations (particularly navigation mesh support and mobile performance), the decision was made to migrate to Unity 6 with DOTS.

### Migration Timeline

| Date | Milestone |
|------|-----------|
| Jan 17, 2026 | Unity 6 project scaffold created |
| Jan 18-19, 2026 | Component hierarchy designed and implemented |
| Jan 20-22, 2026 | Core systems ported (Combat, AI, Progression) |
| Jan 23-24, 2026 | World systems implemented (Hex, Territory, Water) |
| Jan 25, 2026 | CI/CD integration; TypeScript runtime archived |

### What Was Migrated

**From TypeScript to Unity C#:**

| TypeScript Pattern | Unity Pattern |
|-------------------|---------------|
| `ECSEntity` type | `Entity` struct |
| `world.add(entity, component)` | `ecb.AddComponent<T>(entity)` |
| `useQuery<T>()` | `SystemAPI.Query<T>()` |
| `createSystem()` | `partial struct : ISystem` |
| `Zustand store` | `ScriptableObject` or DOTS singleton |
| `useFrame()` | `OnUpdate(ref SystemState)` |
| `<mesh>` JSX | Unity Prefab |

### What Was Preserved

TypeScript development tools remain active for build-time content generation:

| Tool | Purpose | Status |
|------|---------|--------|
| `dev-tools/content-gen` | Meshy/Gemini asset generation | ACTIVE |
| `dev-tools/e2e` | Playwright E2E tests | ACTIVE |
| `dev-tools/types` | Shared type definitions | ACTIVE |

### Why Unity 6?

1. **DOTS Performance**: Burst-compiled systems for mobile 60 FPS
2. **Navigation**: Built-in AI Navigation package
3. **Native Builds**: Direct iOS/Android builds without Capacitor wrapper
4. **Mature Tooling**: Profiler, debugging, asset management
5. **Physics**: Unity Physics with Havok backend option

---

## Current Architecture (January 2026)

### Unity 6 DOTS Structure

```csharp
// System example (CombatSystem.cs)
[BurstCompile]
[UpdateInGroup(typeof(SimulationSystemGroup))]
public partial struct CombatSystem : ISystem
{
    [BurstCompile]
    public void OnUpdate(ref SystemState state)
    {
        foreach (var (health, damageBuffer, entity) in
            SystemAPI.Query<RefRW<Health>, DynamicBuffer<DamageEvent>>()
                .WithEntityAccess())
        {
            // Process damage events
        }
    }
}
```

### Implemented Systems (25+)

| Category | Systems |
|----------|---------|
| **Combat** | CombatSystem, HitDetectionSystem, BreakSystem, HazardSystem, ArenaSystem, WaterCombatSystem, CombatLogicSystem |
| **AI** | AIStateMachineSystem, ThreatSystem, SteeringSystem, CrowdSystem, EnemyAISystem, SwarmCoordinationSystem, PerceptionSystem, TentacleSwarmSystem |
| **Progression** | ReputationSystem, ProgressionSystem, AlignmentBonusSystem, AlignmentGateSystem, StatAllocationSystem |
| **World** | HexGridSystem, TerritorySystem, WaterSystem, WeatherSystem, BoatSystem, StageSystem, ManifestSpawnerSystem, ProceduralGenerationSystem |
| **Other** | AbilitySystem, NavigationSystem, EquipmentSystem, DialogueSystem, QuestSystem, QuestGeneratorSystem, SaveSystem |

### Technology Stack (Current)

| Layer | Technology | Status |
|-------|------------|--------|
| **Engine** | Unity 6000.3.5f1 | Active |
| **ECS** | Unity Entities 1.3.x | Active |
| **Compiler** | Burst 1.8.x | Active |
| **Rendering** | URP | Active |
| **Physics** | Unity Physics | Active |
| **Navigation** | AI Navigation | Active |
| **Input** | Input System | Active |
| **Build Tools** | TypeScript (content-gen) | Active |
| **Testing** | NUnit + Playwright | Active |

---

## Lessons Learned

### What Worked Well
1. **ECS Architecture**: Both Miniplex (TypeScript) and DOTS (Unity) enabled clean separation
2. **Declarative Pipelines**: JSON-based GenAI definitions survived the migration unchanged
3. **Hybrid Approach**: TypeScript for content generation + Unity for runtime
4. **Documentation**: Comprehensive docs made migration smoother

### What Could Be Improved
1. **Earlier Unity Evaluation**: Navigation needs should have been identified sooner
2. **Testing During Migration**: Some tests needed rewriting
3. **Asset Format**: Some Babylon.js-specific assets needed conversion

### Future Considerations
1. **Multiplayer**: Original competitive modes still in roadmap
2. **Voice Acting**: LLM-generated dialogue could be voiced
3. **Procedural Generation**: Full 10-territory generation system

---

## Development Sessions Reference

### Jules AI Sessions (TypeScript Era)

| Session ID | Description | Date | Status |
|------------|-------------|------|--------|
| `12852271386532315666` | POC.html - Initial build | Jan 13 | Archived |
| `107803072628449215` | JRPG transformation | Jan 14 | Archived |
| `7166703209184058505` | CollectibleSystem | Jan 15 | Archived |
| `9325261586465291625` | Limb refactor | Jan 15 | Archived |
| `15231540528192839108` | Performance opt 1 | Jan 15 | Archived |
| `6650948937526831592` | Performance opt 2 | Jan 15 | Archived |
| `2580391778710306181` | Performance opt 3 | Jan 15 | Archived |
| `4817043573452165920` | Performance opt 4 | Jan 15 | Archived |
| `12152494961931594197` | Gemini CLI clone | Jan 15 | Archived |

### Unity 6 Migration (January 2026)

| Milestone | Description | Date | Status |
|-----------|-------------|------|--------|
| Project Setup | Unity 6 + DOTS packages | Jan 17 | Complete |
| Architecture | Component/System hierarchy | Jan 18-19 | Complete |
| Combat Systems | CombatSystem, HitDetection, Break | Jan 20 | Complete |
| AI Systems | AIStateMachine, Threat, Steering | Jan 21 | Complete |
| Progression | Reputation, Alignment, Stats | Jan 22 | Complete |
| World Systems | Hex, Territory, Water, Weather | Jan 23-24 | Complete |
| CI/CD | GitHub Actions integration | Jan 25 | Complete |
| Archive | TypeScript runtime archived | Jan 25 | Complete |

---

## Archived Code Location

The TypeScript runtime has been preserved for reference:

```
_reference/typescript-runtime/
├── packages/
│   ├── game/          # Original Babylon.js game
│   ├── playground/    # Prototype components
│   └── core/          # Shared logic
├── src/               # Original source
└── README.md          # Archive notes
```

---

This document was generated from development session history.

Last Updated: 2026-01-26
