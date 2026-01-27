# Neo-Tokyo: Rival Academies

<div align="center">

**A futuristic 3D Action JRPG set in the neon-lit streets of Neo-Tokyo**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB)](https://react.dev/)
[![Babylon.js](https://img.shields.io/badge/Babylon.js-8.46-E0684B)](https://www.babylonjs.com/)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[Play Demo](https://neo-tokyo.vercel.app) • [Documentation](./docs/) • [Roadmap](./docs/00-golden/PHASE_ROADMAP.md) • [Changelog](./CHANGELOG.md)

</div>

---

## 🎮 About

**Neo-Tokyo: Rival Academies** is a web-based 3D Action JRPG where rival academies compete in the Midnight Exam. Navigate the Academy Gate Slums, complete procedurally generated quests, and choose your allegiance between the passion-driven Kurenai faction or the logic-based Azure faction.

### Key Features

- **🗺️ Procedural World Generation** - Seeded RNG creates deterministic districts and quests
- **⚔️ Strategic Combat** - Real-time combat with stat-based formulas (Damage, Critical, Hit/Evade)
- **⚖️ Dual Faction System** - Kurenai vs Azure alignment affects stats, quests, and story
- **📈 Deep Progression** - Level-based growth, equipment system, and quest rewards
- **💾 Complete Persistence** - 4-slot save system with localStorage
- **🎨 Cyberpunk Aesthetic** - Cel-shaded 3D graphics with scanline effects

---

## 🚀 Tech Stack

### Core Technologies
- **Frontend**: [Vite](https://vitejs.dev/) 7.3 + [React](https://react.dev/) 19.0
- **3D Engine**: [Babylon.js](https://www.babylonjs.com/) 8.46.2 + [Reactylon](https://github.com/brianzinn/react-babylonjs) 3.5.2
- **State Management**: [Zustand](https://github.com/pmndrs/zustand) 5.0
- **Language**: [TypeScript](https://www.typescriptlang.org/) 5.9 (strict mode)
- **Build Tool**: Angular CLI (Vite-based)
- **Package Manager**: [PNPM](https://pnpm.io/) 10.28

### Architecture
- **Monorepo**: PNPM Workspaces
- **UI**: Ionic + Angular (zoneless)
- **Game Logic**: Platform-agnostic `@neo-tokyo/core` package
- **Rendering**: Babylon.js with imperative setup
- **State**: Multiple Zustand stores (world, quest, alignment, player, combat)

### Development Tools
- **Linter/Formatter**: [Biome](https://biomejs.dev/) 2.3
- **Testing**: [Vitest](https://vitest.dev/) 4.0 (unit) + [Playwright](https://playwright.dev/) (e2e)
- **Type Checking**: TypeScript strict mode
- **CI/CD**: GitHub Actions (future)

---

## 🏗️ Project Structure

```
neo-tokyo-rival-academies/
├── src/                    # Ionic Angular app (UI + Babylon)
│   ├── app/                # Components, services, engine
│   ├── assets/             # Runtime assets + story JSON
│   └── ...
├── packages/
│   ├── core/                # @neo-tokyo/core - Platform-agnostic game logic
│   │   ├── src/
│   │   │   ├── systems/     # WorldGenerator, QuestGenerator, CombatSystem
│   │   │   ├── state/       # Zustand stores (world, quest, alignment, player, combat)
│   │   │   ├── types/       # TypeScript interfaces
│   │   │   └── data/        # Quest grammar, district profiles
│   │   └── package.json
│   │
│   ├── content-gen/         # Procedural content generation CLI
│   ├── shared-assets/       # Shared asset helpers/manifests
│   └── world-gen/           # World helpers (if used)
│
├── e2e/                     # Playwright tests
├── docs/                    # Documentation
│   ├── 00-golden/
│   ├── story/
│   ├── world/
│   ├── gameplay/
│   ├── design/
│   ├── tech/
│   ├── procedural/
│   ├── pipeline/
│   ├── testing/
│   ├── process/
│   └── legacy/
│
├── .github/                 # GitHub configuration
├── TEST_PLAN.md             # Comprehensive test plan
├── CHANGELOG.md             # Version history
├── CLAUDE.md                # AI assistant context
├── package.json             # Root workspace config
├── pnpm-workspace.yaml      # Workspace definition
└── README.md                # This file
```

---

## 🛠️ Getting Started

### Prerequisites

- **Node.js** 20+ (LTS recommended)
- **PNPM** 10+ (`npm install -g pnpm`)
- **Git** 2.40+

### Installation

```bash
# Clone repository
git clone https://github.com/arcade-cabinet/neo-tokyo-rival-academies.git
cd neo-tokyo-rival-academies

# Install dependencies
pnpm install

# Start development server
pnpm dev

# Open browser to http://localhost:4322/
```

### Build Commands

```bash
# Development
pnpm dev              # Start dev server (packages/game)
pnpm build            # Build all packages
pnpm test             # Run unit tests
pnpm check            # Lint and format check
pnpm check:fix        # Auto-fix linting/formatting

# Package-specific
pnpm --filter @neo-tokyo/core build
pnpm --filter @neo-tokyo/game dev
pnpm --filter @neo-tokyo/content-gen build
```

---

## 🎯 Game Systems

### World Generation
- **DistrictManager** - Manages district loading/unloading
- **WorldGenerator** - Creates deterministic districts from master seed
- **10 District Profiles** - Academy Gate Slums, Neon Spire, Chrome Gardens, etc.
- **Seeded RNG** - Reproducible world generation with `seedrandom`

### Quest System
- **QuestGenerator** - Grammar-based procedural quest generation
- **100+ Grammar Entries** - Nouns, verbs, adjectives, landmarks
- **Quest Clusters** - 1 main + 2 sides + 1 secret per district
- **Alignment-Biased** - Quests shift toward Kurenai or Azure
- **Rewards** - XP, credits, alignment shifts, items

### Alignment & Reputation
- **Dual Reputation Meters** - Kurenai (0-100) and Azure (0-100)
- **Derived Alignment Scale** - (-1.0 to +1.0) = (Azure - Kurenai) / 100
- **Stat Bonuses** - At ±0.6 threshold:
  - Kurenai >60: +10% Ignition, +10% Flow
  - Azure >60: +10% Structure, +10% Logic
- **7 Alignment Labels** - Devotee, Leaning, Slightly, Neutral

### Combat System
- **Real-Time Combat** - Strategic turn-based with stat formulas
- **Damage Formula**: `max(1, floor(Ignition * 2 - Structure * 0.5))`
- **Critical Chance**: `min(0.5, Ignition * 0.01)`
- **Hit Chance**: `0.8 + (Flow - Flow) * 0.05`
- **5 Enemy Types** - Street Thug, Scavenger, Elite Guard, Rogue AI, Boss
- **5 Encounter Templates** - Street Patrol, Mixed Gang, Elite Patrol, AI Swarm, Boss Fight

### Progression
- **XP Curve** - 100 * level (e.g., Level 2 requires 200 XP)
- **Auto-Leveling** - Stats increase by +2 per level automatically
- **Credits Economy** - Earned from quests and combat
- **Inventory System** - Weapons, accessories, consumables, key items
- **Equipment Bonuses** - Stat modifiers from equipped items

### Save/Load
- **4 Save Slots** - 1 auto-save (slot 0) + 3 manual (slots 1-3)
- **Complete State** - Player, alignment, quests, world, inventory
- **LocalStorage Persistence** - Client-side only, no backend required
- **Export/Import** - Backup saves as JSON
- **Validation** - Type-safe save data with `validateSaveData()`

---

## 🎨 UI Components

### Main Menu
- Title screen with mission briefing
- "INITIATE STORY MODE" button
- "ARCHIVES [LOCKED]" (deferred to v2.0)

### Intro Narrative
- 5-dialogue character introduction
- Kai (Kurenai) vs Vera (Azure)
- Character portraits
- "MIDNIGHT EXAM INITIATED. GO!" trigger

### Game HUD
- **Quest Objective Panel** (top-right) - Current main quest
- **Alignment Bar** (top-left) - Gradient visualization with dual meters
- **Touch Controls** (bottom) - D-pad + action button
- **Quest Log Button** (bottom-left) - "📋 Quests (Q)"

### Quest Log
- **Active Tab** - Shows all active quests with full details
- **Completed Tab** - Historical quest list
- **Quest Details** - Title, description, objective, location, rewards
- **Quest Type Badges** - ⭐ Main, 📋 Side, ✨ Secret

### Combat Arena
- **HP Bars** - Player and enemy health visualization
- **Target Selection** - Click to select enemy
- **Action Buttons** - ⚔️ Attack, 🛡️ Defend
- **Combat Log** - Real-time action feed
- **Victory/Defeat** - Animated overlays with rewards

### Inventory
- **Grid Layout** - Visual item display
- **Type Filter** - Weapon, Accessory, Consumable, Key Item
- **Item Details** - Stats, description, quantity
- **Actions** - Equip, Use, Drop

### Save Slots
- **Slot Metadata** - Level, Act, District, Playtime, Alignment, Timestamp
- **Auto-Save** - Slot 0, updated automatically
- **Manual Saves** - Slots 1-3, user-triggered
- **Load/Save Modes** - Toggle between operations

---

## 📝 Development Workflow

### 1. Feature Development
```bash
# Create feature branch
git checkout -b feat/your-feature

# Make changes in packages/core or packages/game
# Follow TypeScript strict mode (no 'any')
# Use Biome for formatting

# Test your changes
pnpm --filter @neo-tokyo/core test
pnpm --filter @neo-tokyo/game build

# Commit with conventional commits
git commit -m "feat(core): add new combat ability system"
```

### 2. Code Quality
```bash
# Lint and format
pnpm check:fix

# Type check
pnpm --filter @neo-tokyo/core build
pnpm --filter @neo-tokyo/game build

# Run tests
pnpm test
```

### 3. Pull Request
- Create PR to `release/1.0` or `main`
- Fill out PR template
- Wait for CI checks (if configured)
- Request review

---

## 🚢 Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy from packages/game
cd packages/game
vercel --prod

# Or use Vercel GitHub integration
# Connect repository at https://vercel.com/new
```

### Netlify

```bash
# Build command: pnpm --filter @neo-tokyo/game build
# Publish directory: packages/game/dist
# Node version: 20

# Deploy
npx netlify-cli deploy --prod
```

### Manual/Custom Server

```bash
# Build production bundle
pnpm build

# Serve packages/game/dist with any static host
# Ensure fallback to index.html for SPA routing
```

---

## 🧪 Testing

### Unit Tests (Vitest)
```bash
# Run all tests
pnpm test

# Watch mode
pnpm --filter @neo-tokyo/core test:watch

# Coverage
pnpm test --coverage
```

### E2E Tests (Playwright - Future)
```bash
# Install Playwright
pnpm --filter @neo-tokyo/e2e playwright install

# Run E2E tests
pnpm --filter @neo-tokyo/e2e test
```

### Manual Testing
- See [TEST_PLAN.md](./TEST_PLAN.md) for comprehensive test cases
- 33 test scenarios covering all game systems
- Critical path defined for v1.0 release

---

## 📚 Documentation

- **[GOLDEN_RECORD_MASTER.md](./docs/00-golden/GOLDEN_RECORD_MASTER.md)** - Master design document
- **[PHASE_ROADMAP.md](./docs/00-golden/PHASE_ROADMAP.md)** - Delivery milestones
- **[MOBILE_WEB_GUIDE.md](./docs/00-golden/MOBILE_WEB_GUIDE.md)** - Mobile-first constraints
- **[DOCS INDEX](./docs/README.md)** - Organized doc map
- **[CLAUDE.md](./CLAUDE.md)** - AI assistant context and guidelines
- **[TEST_PLAN.md](./TEST_PLAN.md)** - Comprehensive testing strategy

---

## 🤝 Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Development Principles
1. **Mobile First** - All features must run at 30+ FPS on Pixel 8a
2. **Zero Stubs** - Fully implement logic, no placeholders
3. **Strict Types** - No `any` types, comprehensive interfaces
4. **Platform Agnostic** - Core logic has no rendering dependencies
5. **Monorepo Awareness** - Use `pnpm --filter` for package-specific commands

---

## 📄 License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) for details.

---

## 🙏 Acknowledgments

- **Babylon.js** - Powerful 3D engine
- **React** - UI framework
- **Zustand** - Elegant state management
- **Vite** - Lightning-fast build tool
- **PNPM** - Efficient package manager
- **Claude Code** - AI pair programmer

---

## 📬 Contact

- **GitHub**: [@arcade-cabinet](https://github.com/arcade-cabinet)
- **Issues**: [GitHub Issues](https://github.com/arcade-cabinet/neo-tokyo-rival-academies/issues)
- **Discussions**: [GitHub Discussions](https://github.com/arcade-cabinet/neo-tokyo-rival-academies/discussions)

---

<div align="center">

**Built with ❤️ by the Arcade Cabinet team**

⭐ Star this repo if you find it useful!

</div>
