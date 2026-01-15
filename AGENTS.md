# AI Agent Documentation

This document provides guidelines and context for AI coding agents working on the Neo-Tokyo: Rival Academies project.

## 🎯 Project Overview

**Neo-Tokyo: Rival Academies** is a **3D Action JRPG** (NOT a platformer) built with modern web technologies as a **Capacitor-first mobile game**. The game features immersive 3D cel-shaded graphics with an **FF7-style isometric diorama perspective**, targeting a **3-hour JRPG experience** with deep narrative integration.

### Core Technologies

- **Vite 6.x**: Build tool and dev server (Astro was replaced with Vite)
- **React 19**: For all UI and game components
- **Three.js 0.182**: Core 3D graphics library
- **React Three Fiber 9.x**: React renderer for Three.js
- **Miniplex**: Entity Component System (ECS) for game logic
- **Capacitor 8**: Native mobile wrapper (PRIMARY platform - Capacitor-first architecture)
- **PNPM 10**: Package manager (Strictly use `pnpm`)
- **Biome 2.3**: Linter and formatter (Strictly use `pnpm check`)
- **Vitest**: Unit testing framework
- **Playwright**: E2E testing framework
- **Gemini Flash 3 + Imagen 4**: GenAI content generation pipeline

## 🚨 CRITICAL RULES FOR AGENTS

1.  **ZERO STUBS POLICY**: Do not write `// TODO` or empty functions. If a feature is in the plan, implement it fully. If it is too complex, break it down, but do not leave broken code.
2.  **PRODUCTION QUALITY**: Code must be modular, strictly typed (TypeScript, no `any`, no `@ts-ignore`), and commented.
3.  **VERIFY EVERYTHING**: After every file change, read the file back to ensure correctness. After every feature, run tests.
4.  **TEST DRIVEN**: Write tests for logic systems *before* or *during* implementation.
5.  **VISUAL STYLE**: Use `meshToonMaterial` for characters and assets to maintain the cel-shaded anime aesthetic.

## 🏗️ Architecture Principles

### 1. Monorepo Structure
The project is organized as a **PNPM workspace monorepo**:
```
packages/
├── game/              # Main game package (Vite + React + Three.js)
│   ├── src/
│   │   ├── components/react/
│   │   │   ├── objects/       # 3D Objects (Character, Enemy)
│   │   │   ├── ui/            # HUD, Menus, Dialogue Overlay
│   │   │   └── game/          # GameWorld, Managers
│   │   ├── systems/           # ECS Systems (Combat, Progression, Dialogue, AI)
│   │   ├── state/             # Global State (ECS, Zustand)
│   │   ├── data/              # Static Data (story.json, quests, items)
│   │   └── utils/             # Helpers
│   ├── public/                # Static assets
│   └── capacitor.config.ts    # Capacitor mobile config
├── content-gen/       # GenAI content generation (Gemini + Imagen)
│   ├── src/
│   │   ├── generators/        # Story, dialogue, background generators
│   │   ├── prompts/           # A/B/C story prompt templates
│   │   └── api/               # Gemini API integration
│   └── output/                # Generated content
└── e2e/               # E2E tests (Playwright)
    └── tests/                 # Test suites
```

### 2. ECS Architecture (Miniplex)
- Game logic lives in `packages/game/src/systems/`.
- State lives in `packages/game/src/state/ecs.ts`.
- React components render based on ECS state.
- Core systems: **CombatSystem**, **ProgressionSystem**, **DialogueSystem**, **AISystem**, **PhysicsSystem**.

### 3. Capacitor-First Mobile Architecture
This game is built **Capacitor-first**, meaning mobile (Android/iOS) is the PRIMARY platform:
- **Touch-First UX**: ALL interactive elements MUST be 48×48 dp minimum (industry standard for accessibility).
- **No Hover-Only Interactions**: Avoid `:hover` CSS or hover-triggered UI. Everything must work with touch.
- **PWA + Native**: Deploy as PWA AND native apps (Android/iOS) via Capacitor.
- **Plugins**: Use Capacitor plugins for native features (haptics, storage, status bar).
- **Testing**: Test on real devices and emulators, not just desktop browsers.

### 4. Touch-First UX Requirements
- **Minimum Touch Target Size**: 48×48 dp (density-independent pixels).
- **Spacing**: 8dp minimum spacing between interactive elements.
- **Feedback**: Provide immediate visual/haptic feedback for all interactions.
- **Gestures**: Support swipe, tap, long-press, pinch-zoom where appropriate.
- **Orientation**: Support both portrait and landscape modes.

## 🧪 Testing Strategy

- **Unit Tests**: `pnpm test` (Vitest in `packages/game`)
- **E2E Tests**: `pnpm test:e2e` (Playwright in `packages/e2e`)
- **Lint Code**: `pnpm check` (Biome for all packages)
- **Type Check**: `pnpm type-check` (TypeScript across monorepo)
- **Mobile Testing**: Use Android Studio emulator or Xcode Simulator
- **Verification Script**: `python3 scripts/verify_rpg_gameplay.py` (automated gameplay validation)

## 🎮 Game Context (JRPG Transformation)

**Neo-Tokyo: Rival Academies** is a **3-hour Action JRPG experience** set in a neon-lit cyberpunk Tokyo. The game combines fast-paced runner traversal with deep RPG systems, narrative branching, and strategic combat.

### Core Pillars
1. **Action JRPG Combat**: Real-time combat with RPG stat calculations, critical hits, and strategic positioning.
2. **Narrative Depth**: Visual novel style storytelling with A/B/C story arcs and branching dialogue.
3. **RPG Progression**: Level-up system with XP overflow, stat point allocation (Structure/Ignition/Logic/Flow).
4. **Immersive 3D**: FF7-style isometric diorama perspective with cel-shaded characters.
5. **Capacitor-First Mobile**: Touch-optimized controls and native mobile features.

### RPG Stats System
Each character has **4 core stats**:
- **Structure (STR)**: Max Health, defense, resistance to stagger. Determines survivability.
- **Ignition (IGN)**: Melee attack power and critical hit chance. Determines physical damage output.
- **Logic (LOG)**: Tech/ranged damage and hacking speed. Determines technical combat effectiveness.
- **Flow (FLW)**: Movement speed, evasion chance, and boost duration. Determines agility and mobility.

### Combat System
- **Damage Formula**: `Damage = (AttackPower * StatMultiplier) - (Defense / 2)` with critical hit multiplier (2x, capped at 50% chance).
- **Real-Time Action**: Players attack enemies in real-time while moving through stages.
- **Enemy Collision**: Enemies have collision detection and health bars.
- **Floating Damage Numbers**: Display damage values on hit for feedback.
- **Critical Hits**: Visual feedback (different color, larger text) for critical strikes.

### Progression System
- **Experience (XP)**: Gained from defeating enemies and collecting Data Shards.
- **Level-Up**: Reaching XP threshold increments level, restores health, grants stat points.
- **XP Overflow**: Excess XP carries over to next level (multi-level advancement possible).
- **Stat Points**: Players allocate points to Structure/Ignition/Logic/Flow on level-up.

### Dialogue System
- **Visual Novel Overlay**: Full-screen dialogue interface with character portraits.
- **Node-Based Traversal**: Dialogue flows through connected nodes (story.json).
- **Branching Paths**: Player choices affect dialogue outcomes and relationships.
- **Trigger Points**: Dialogue triggered by stage progression, boss encounters, or collectibles.

### Story Structure (A/B/C Arcs)
The narrative is organized into **three interweaving story arcs**:

#### **A-Story: Main Rivalry (Kai vs Vera)**
- **Primary conflict**: Kai (Neon Academy) vs Vera (Shadow Syndicate) competing for the Data Core.
- **Stakes**: Control of Neo-Tokyo's information network.
- **Structure**: Linear progression through stages with escalating confrontations.
- **Culmination**: Final showdown at Data Core Tower.

#### **B-Story: Character Development & Mystery**
- **Focus**: Character backstories, relationships, and personal growth.
- **Mystery Elements**: Who really controls the Data Core? What are the academies hiding?
- **Parallel Development**: Runs alongside A-Story, revealed through collectibles and optional dialogue.
- **Payoff**: Reveals deeper motivations and unlocks true ending conditions.

#### **C-Story: Event Disruptors (Forcing Team-Ups)**
- **Purpose**: Introduces external threats that force Kai and Vera to temporarily cooperate.
- **Examples**: Alien Abduction stage, Mall Drop incident, rogue AI outbreak.
- **Gameplay Impact**: Changes team composition, unlocks unique combo abilities.
- **Narrative Function**: Builds chemistry between rivals, sets up future alliances.

### Special Event Stages

#### **Alien Abduction Stage**
- **Setting**: Vertical stage with tentacle grab mechanics.
- **Enemies**: Yuka-driven enemies (controlled/corrupted by alien influence).
- **Mechanics**:
  - Vertical tentacle grabs requiring rapid directional input to escape.
  - Environmental hazards (alien pods, energy beams).
  - Corrupted academy students as mini-bosses.
- **Boss**: Alien Queen with multi-phase combat (tentacle phase → core phase).
- **Story Impact**: Forces Kai and Vera to work together (C-Story beat).

#### **Mall Drop Stage**
- **Setting**: Shopping mall environment with destructible props.
- **Mechanics**:
  - **Weapon Switching**: Pick up and use makeshift weapons (scissors, mops, mannequin arms).
  - Each weapon has unique stats and attack animations.
  - Weapons break after limited uses, requiring constant adaptation.
- **Enemies**: Security drones, rogue shoppers, Yakuza gang members.
- **Story Impact**: Comic relief stage with character bonding moments.

### Stage Design Principles

#### **Isometric Diorama Perspective (FF7-Style)**
- **Camera**: Fixed isometric angle (45° from horizontal).
- **View**: Top-down perspective with depth perception via parallax.
- **Movement**: 8-directional movement (cardinal + diagonals).
- **Scale**: Characters proportionally sized to environment (chibi-style optional).

#### **Horizontal & Vertical Exploration**
- **Horizontal Stages**: Side-scrolling with depth (3D space, not 2D plane).
- **Vertical Stages**: Climbing, falling, and vertical traversal challenges.
- **Mixed Stages**: Combine horizontal and vertical elements (e.g., tower with side rooms).

#### **Stage Connectors**
- **Doors**: Transition between rooms/areas (fade-out/fade-in).
- **Bridges**: Physical connections with traversal gameplay (balance, enemies).
- **Elevators**: Vertical transitions with optional combat encounters.
- **Portals**: Instant teleportation for fast travel or puzzle mechanics.

### HUD & UI Systems
- **Quest Log**: Tracks main quests (A-Story), side quests (B-Story), and events (C-Story).
- **Minimap**: Shows current stage layout, player position, objectives, and discovered areas.
- **Health/XP Bars**: Real-time display of HP, XP progress, and level.
- **Stat Display**: Quick access to Structure/Ignition/Logic/Flow values.
- **Inventory**: Accessible via touch (no hover menus).

### GenAI Content Generation Pipeline
The project includes a **dedicated content generation package** (`packages/content-gen`) for AI-assisted narrative and asset creation:

#### **Gemini Flash 3 for Narrative**
- **Purpose**: Generate dialogue, quest descriptions, lore entries, and character backstories.
- **Workflow**:
  1. Define prompt templates in `packages/content-gen/src/prompts/`.
  2. Call Gemini API via `packages/content-gen/src/api/gemini.ts`.
  3. Generate content and validate structure.
  4. Export to `packages/game/src/data/story.json`.
- **A/B/C Story Integration**: Separate prompts for each story arc to maintain narrative cohesion.

#### **Imagen 4 for Background Assets**
- **Purpose**: Generate stage backgrounds, environmental textures, and concept art.
- **Workflow**:
  1. Define visual style prompts (cyberpunk, neon-lit, isometric).
  2. Call Imagen API via `packages/content-gen/src/api/imagen.ts`.
  3. Post-process images (resize, optimize, format conversion).
  4. Place in `packages/game/public/textures/`.
- **Style Consistency**: Use consistent seed values and style parameters.

#### **Content Generation Commands**
```bash
cd packages/content-gen
pnpm generate:dialogue  # Generate A/B/C story dialogue
pnpm generate:quests    # Generate side quests and objectives
pnpm generate:lore      # Generate Data Shard lore entries
pnpm generate:backgrounds # Generate stage backgrounds
```

Always refer to `docs/JRPG_TRANSFORMATION.md` for detailed design specifications.
