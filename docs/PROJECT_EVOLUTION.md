# Project Evolution: Platformer to JRPG

This document captures the **chronological evolution** of Neo-Tokyo: Rival Academies from its origins as a 3D platformer to its current state as a 3D Action JRPG. This history was extracted from Jules AI development sessions.

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
    ↓
CURRENT STATE (Isometric Diorama JRPG)
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

## Current Architecture (January 2026)

### Isometric Diorama View

The final prototype direction chose the **Isometric Diorama** approach over the alternative "Cinematic Side-Scroll":

```tsx
// IsometricScene.tsx structure
<ReactylonProvider>
  <Canvas>
    <Scene>
      <HemisphericLight />
      <IsometricCamera />
      <HexTileGrid radius={10} tileSize={1.0} />
      <BackgroundPanels />
      <KaiCharacter />
    </Scene>
  </Canvas>
</ReactylonProvider>
```

### Hex Grid System

Implemented comprehensive hex utilities from Red Blob Games research:
- **Coordinate Systems**: Axial (q,r), Cube (q,r,s), Offset (col,row)
- **Algorithms**: Distance, neighbors, rings, pathfinding
- **Rendering**: Instanced meshes with texture variety

### Technology Stack (Final)

| Layer | Technology | Status |
|-------|------------|--------|
| **Build** | Vite 6.x | Working |
| **3D Engine** | Three.js 0.182 | Working |
| **React Binding** | React Three Fiber 9.x | Working |
| **Physics** | Rapier (react-three-rapier) | Working |
| **ECS** | Miniplex | Working |
| **State** | Zustand | Working |
| **GenAI** | Meshy AI | Fully integrated |
| **Mobile** | Capacitor 8 | Configured |

---

## Lessons Learned

### What Worked Well
1. **ECS Architecture**: Miniplex enabled clean separation of rendering and logic
2. **Declarative Pipelines**: JSON-based GenAI definitions are resumable and idempotent
3. **Dual Prototype Strategy**: Testing both perspectives before committing

### What Could Be Improved
1. **Documentation**: Development history was scattered across AI sessions
2. **Testing**: Test coverage lagged behind feature development
3. **Asset Organization**: Initial manifest structure needed iteration

### Future Considerations
1. **Babylon.js Migration**: Under evaluation for navigation mesh support
2. **Multiplayer**: Original competitive modes still in roadmap
3. **Voice Acting**: LLM-generated dialogue could be voiced

---

## Jules Sessions Reference

| Session ID | Description | Date | Status |
|------------|-------------|------|--------|
| `12852271386532315666` | POC.html → Initial build | Jan 13 | Paused |
| `107803072628449215` | JRPG transformation | Jan 14 | Planning |
| `7166703209184058505` | CollectibleSystem | Jan 15 | Completed |
| `9325261586465291625` | Limb refactor | Jan 15 | Completed |
| `15231540528192839108` | Performance opt 1 | Jan 15 | Completed |
| `6650948937526831592` | Performance opt 2 | Jan 15 | Completed |
| `2580391778710306181` | Performance opt 3 | Jan 15 | Completed |
| `4817043573452165920` | Performance opt 4 | Jan 15 | Completed |
| `12152494961931594197` | Gemini CLI clone | Jan 15 | Completed |

---

This document was generated from Jules AI session history on 2026-01-15.

Last Updated: 2026-01-16
