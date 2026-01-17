# Changelog

All notable changes to Neo-Tokyo: Rival Academies will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-01-17

### Added - v1.0 Initial Release 🎉

#### Core Systems
- **World Generation** - Deterministic district generation with seeded RNG
  - 10 canonical district profiles (Academy Gate Slums, Neon Spire, etc.)
  - Single district mode for MVP
  - DistrictManager for load/unload coordination

- **Quest System** - Grammar-based procedural quest generation
  - 100+ grammar entries (nouns, verbs, adjectives, landmarks)
  - Alignment-biased quest generation (Kurenai vs Azure)
  - Quest clusters: 1 main + 2 sides + 1 secret per district
  - Quest types: Main, Side, Secret
  - Quest completion with reward distribution

- **Alignment System** - Dual reputation meters with derived alignment scale
  - Kurenai reputation (0-100)
  - Azure reputation (0-100)
  - Alignment scale (-1.0 to +1.0)
  - Stat bonuses at thresholds (±0.6)
    - Kurenai >60: +10% Ignition, +10% Flow
    - Azure >60: +10% Structure, +10% Logic

- **Combat System** - Real-time combat with strategic depth
  - Combat formulas:
    - Damage: `max(1, floor(Ignition * 2 - Structure * 0.5))`
    - Critical Chance: `min(0.5, Ignition * 0.01)`
    - Hit Chance: `0.8 + (Flow - Flow) * 0.05`
  - 5 enemy templates (Street Thug, Scavenger, Elite Guard, Rogue AI, Boss)
  - 5 encounter templates (Street Patrol, Mixed Gang, Elite Patrol, AI Swarm, Boss Fight)
  - Turn-based combat flow with attack/defend actions
  - Victory/defeat screens with rewards

- **Progression System** - Level-based character growth
  - XP curve: 100 * level
  - Automatic stat scaling (+2 per level to all stats)
  - Credits economy
  - Inventory system (weapons, accessories, consumables, key items)
  - Equipment system with stat bonuses

- **Save/Load System** - Complete persistence with localStorage
  - 4 save slots (1 auto-save + 3 manual)
  - Save metadata display (level, act, district, playtime, alignment)
  - Export/import functionality for backup/transfer
  - Full game state preservation:
    - Player stats (level, XP, credits)
    - Inventory and equipment
    - Alignment and reputation
    - Active and completed quests
    - World state (seed, district)

#### UI Components
- **Main Menu** - Cyberpunk-themed title screen
  - Mission briefing
  - Story mode initiation
  - Archives (locked for v1.0)

- **Intro Narrative** - Character introduction sequence
  - 5-dialogue intro between Kai and Vera
  - Character portraits
  - Midnight Exam setup

- **Game HUD** - Complete heads-up display
  - Quest objective panel (top-right)
  - Alignment bar with gradient visualization (top-left)
  - Touch controls (D-pad + action button)
  - Quest log toggle button

- **Quest Log** - Tabbed quest management interface
  - Active quests tab with full quest details
  - Completed quests tab
  - Quest rewards display (XP, credits, alignment, items)
  - Quest type badges (main/side/secret)

- **Quest Dialogs** - Quest flow management
  - Quest Accept Dialog with full quest preview
  - Quest Completion Dialog with animated reward summary
  - Level-up notifications

- **Alignment Bar** - Visual reputation tracker
  - Gradient bar (Kurenai red → Azure blue)
  - Animated position indicator
  - Dual reputation meters display
  - Alignment label (Devotee, Leaning, Neutral)

- **Combat Arena** - Turn-based combat interface
  - HP bars for player and enemies
  - Target selection
  - Action buttons (Attack, Defend)
  - Combat log with damage numbers
  - Critical hit indicators
  - Victory/defeat overlays

- **Inventory Screen** - Item management interface
  - Grid-based item display
  - Filter by type (weapon/accessory/consumable/key_item)
  - Item details panel
  - Equip/use actions
  - Credits display

- **Save Slot Select** - Save/load interface
  - 4 slots with metadata
  - Timestamp formatting
  - Empty slot indicators
  - Mode toggle (save/load)

#### Technical Implementation
- **Monorepo Architecture** - PNPM workspaces
  - `@neo-tokyo/core` - Platform-agnostic game logic
  - `@neo-tokyo/content-gen` - Procedural content generation (deferred)
  - `packages/game` - Vite + React + Babylon.js frontend

- **3D Rendering** - Babylon.js 8.46.2 + Reactylon 3.5.2
  - Hex grid terrain
  - Character models with animations
  - Isometric camera
  - Lighting and shadows
  - Scanlines post-processing effect

- **State Management** - Zustand stores
  - worldStore - District management
  - questStore - Quest tracking
  - alignmentStore - Reputation and alignment
  - playerStore - XP, leveling, inventory, credits
  - combatStore - Combat state

- **Type Safety** - Full TypeScript strict mode
  - Comprehensive type definitions
  - No `any` types
  - Interface-driven architecture

#### Assets & Content
- Story intro script (5 dialogues)
- Mission briefing text
- Quest grammar tables (100+ entries)
- District profiles (10 canonical districts)
- Enemy templates (5 types)
- Encounter templates (5 variations)

### Technical Specifications

#### Performance Targets
- Desktop: 60 FPS
- Mobile: 30+ FPS (Pixel 8a baseline)
- Initial load: < 5 seconds
- Bundle size: ~1.68MB gzipped

#### Browser Support
- Chrome 120+
- Firefox 120+
- Safari 17+
- Mobile web (iOS 17+, Android 12+)

#### Dependencies (Major)
- React 19.0.0
- Babylon.js 8.46.2
- Reactylon 3.5.2
- Zustand 5.0.10
- Vite 7.3.1
- TypeScript 5.9.3
- Biome 2.3.11

### Known Limitations (v1.0)

#### Deferred to Future Versions
- ❌ Babylon Native / React Native mobile app
- ❌ Physical device testing (Pixel 8a, OnePlus Open)
- ❌ Procedural district generation (currently single district)
- ❌ Full quest grammar generator (using static tables)
- ❌ Turn-based combat (using real-time formulas)
- ❌ Vera rivalry character
- ❌ Audio/music/sound effects
- ❌ Multiple story endings
- ❌ GenAI landmark triggers
- ❌ Cutscenes/cinematics
- ❌ NG+ mode

#### TODO for v1.0 Polish
- [ ] Responsive mobile UI (640x960 portrait)
- [ ] Performance optimization for mobile
- [ ] Comprehensive browser testing
- [ ] Bug fixes from playtesting
- [ ] Analytics integration (optional)
- [ ] Error tracking (Sentry optional)

### Breaking Changes
None - initial release

### Deprecated
None - initial release

### Removed
- Three.js dependency (migrated to Babylon.js)
- R3F (React Three Fiber) dependency
- YukaJS navigation library

### Fixed
None - initial release

### Security
- Content Security Policy headers
- XSS protection headers
- Frame options (DENY)
- No inline scripts
- LocalStorage-only persistence (no backend)

---

## [Unreleased]

### Planned for v1.1
- Mobile responsive UI (portrait mode)
- Additional enemy types
- More quest variations
- Audio system integration
- Performance optimizations

### Planned for v2.0
- Babylon Native mobile app
- Multiple districts with travel system
- Full procedural generation
- Vera rivalry storyline
- Multiple endings
- NG+ mode

---

[1.0.0]: https://github.com/arcade-cabinet/neo-tokyo-rival-academies/releases/tag/v1.0.0
