# Neo-Tokyo: Rival Academies - Project Changelog

## [Unreleased] - 2026-01-15

### Character Generation Complete

All 9 game characters have been generated through the Meshy AI pipeline:

**Main Characters (2)**
- Kai - Protagonist from Crimson Academy (hero preset, 7 animations)
- Vera - Rival from Azure Academy (hero preset, 7 animations)

**B-Story Characters (4)**
- Yakuza Grunt - Street-level enforcer (enemy preset, 5 animations)
- Yakuza Boss - High-ranking lieutenant (boss preset, 7 animations)
- Biker Grunt - Bosozoku gang member (enemy preset, 5 animations)
- Biker Boss - Gang leader (boss preset, 7 animations)

**C-Story Characters (3)**
- Mall Security Guard - Comedy relief enemy (enemy preset, 5 animations)
- Alien Humanoid - Sci-fi horror enemy (enemy preset, 5 animations)
- Tentacle Single - Environmental hazard prop (prop type, model only)

### GenAI Pipeline Improvements

#### Declarative JSON Pipelines
- Converted from imperative ModelerAgent to declarative JSON pipeline definitions
- Pipelines defined in `packages/content-gen/src/pipelines/definitions/`
- New prop pipeline for non-humanoid assets that skip rigging

#### Animation Preset System
- Created `animation-presets.json` with hero/enemy/boss/prop presets
- Manifests now use `"preset": "hero"` instead of explicit animation lists
- Reduces manifest complexity and ensures consistency

#### Prompt Engineering for Anatomical Accuracy
- Added explicit HANDS and FACE sections to all character prompts
- Specifies: five distinct fingers, proper proportions, defined knuckles
- Specifies: ear shape, nose bridge, lips, eyes
- Ends prompts with "anatomically correct extremities"
- Addresses AI deformity issues in generated hands/faces

### Technical Changes

#### New Files
- `packages/content-gen/src/pipelines/definitions/prop.pipeline.json`
- `packages/content-gen/src/tasks/definitions/animation-presets.json`

#### Modified Files
- `packages/content-gen/src/types/manifest.ts` - Added preset field to AnimationTaskSchema
- `packages/content-gen/src/pipelines/pipeline-executor.ts` - Added preset resolution
- All 9 character `manifest.json` files - Updated prompts and task configs

#### API Endpoint Usage
- `POST /v1/text-to-image` - Multi-view concept art generation
- `POST /v1/multi-image-to-3d` - 3D model from multi-view images
- `POST /v1/rigging` - Automatic character rigging
- `POST /v1/animations` - Animation application to rigged models

---

## [0.2.0] - 2026-01-14

### Hex Grid System Implementation

#### Core Utilities
- `packages/game/src/utils/hex-grid.ts` - Comprehensive hex grid utilities
  - Axial, Cube, and Offset coordinate systems
  - Conversions between coordinate systems
  - Grid generation algorithms
  - Pathfinding primitives

- `packages/game/src/utils/hex-normalizer.ts` - GLTF model normalization
  - Force-fit any model to hex tile dimensions
  - Standard hex geometry generation
  - Instanced mesh setup

#### Scene Components
- `IsometricScene.tsx` - Main isometric game scene
  - `HexTileFloor` - Instanced hex tile rendering
  - `TileInstanceGroup` - Per-texture-type instanced meshes
  - `WallBackdrops` - FF7-style 2.5D parallax backgrounds
  - `KaiCharacter` - Animated player with WASD controls

### JRPG Transformation Foundation
- Documented stats system (HP, Attack, Defense, Speed, Special)
- Combat flow design (turn order, action phases)
- Progression systems (XP, levels, skills)

---

## [0.1.0] - 2026-01-13

### Initial Project Setup

#### Monorepo Structure
- `packages/game/` - React Three Fiber game client
- `packages/content-gen/` - GenAI asset generation toolchain

#### Core Technologies
- Astro for static site generation
- React Three Fiber for 3D rendering
- Rapier physics via react-three-rapier
- Biome for linting/formatting
- PNPM for package management

#### GenAI Integration
- Meshy AI API client
- Initial character manifest structure
- Task tracking and resumability

---

## Roadmap

### Near-term
- [ ] Reactylon/Babylon.js migration evaluation
- [ ] Combat system prototype
- [ ] Dialogue system integration
- [ ] Sound design foundation

### Mid-term
- [ ] Full academy hub world
- [ ] Rival encounter sequences
- [ ] Boss battle mechanics
- [ ] Save/load system

### Long-term
- [ ] Multiple academy storylines
- [ ] New Game+ mode
- [ ] Achievement system
- [ ] Accessibility features

---

*This changelog follows [Keep a Changelog](https://keepachangelog.com/) format.*
