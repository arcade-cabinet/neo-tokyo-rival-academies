# Neo-Tokyo: Rival Academies

A futuristic **3D Action JRPG** set in the neon-lit streets of Neo-Tokyo, where rival academies compete for control of the Data Core.

## 🎮 About

**Neo-Tokyo: Rival Academies** is a **Capacitor-first mobile game** combining fast-paced Action RPG combat with deep narrative storytelling. Experience a **3-hour JRPG adventure** through an isometric cyberpunk world rendered in cel-shaded 3D graphics.

### Key Features

- **Action JRPG Combat**: Real-time battles with RPG stat calculations (Structure, Ignition, Logic, Flow)
- **Narrative Depth**: Visual novel style storytelling with A/B/C story arcs and branching dialogue
- **RPG Progression**: Level-up system with XP overflow, stat point allocation, and multi-level advancement
- **FF7-Style Isometric Perspective**: Fixed isometric camera with chibi-style characters and depth perception
- **Mobile-First**: Touch-optimized controls with Capacitor-native Android/iOS apps + PWA
- **GenAI Content Pipeline**: Gemini Flash 3 for dialogue generation, Imagen 4 for background assets

### Story

**The Data Core holds the future of Neo-Tokyo's information network. Two rival academies clash to claim it.**

- **Kai (Neon Academy)**: Confident and determined to prove his academy's worth.
- **Vera (Shadow Syndicate)**: Competitive and strategic, dismissive of "weak" opponents.

Compete, cooperate, and uncover the mysteries hidden within Neo-Tokyo's digital underworld.

## 🚀 Tech Stack

### Core Technologies

- **Framework**: [Vite](https://vitejs.dev/) v6
- **3D Engine**: [Three.js](https://threejs.org/) v0.182
- **React Integration**: [React 19](https://react.dev/)
- **3D React Components**: [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/) v9 & [Drei](https://github.com/pmndrs/drei)
- **ECS**: [Miniplex](https://github.com/hmans/miniplex) for game logic
- **Mobile**: [Capacitor](https://capacitorjs.com/) v8 for native Android/iOS
- **Package Manager**: [PNPM](https://pnpm.io/) v10
- **Linter/Formatter**: [Biome](https://biomejs.dev/) v2.3
- **Language**: TypeScript v5.7 (strict mode)
- **Testing**: [Vitest](https://vitest.dev/) + [Playwright](https://playwright.dev/)

### GenAI Integration

- **Narrative Generation**: [Gemini Flash 3](https://ai.google.dev/) API for dialogue, quests, and lore
- **Asset Generation**: [Imagen 4](https://cloud.google.com/vertex-ai/docs/generative-ai/image/overview) API for backgrounds and portraits

## 📁 Monorepo Structure

The project is organized as a **PNPM workspace monorepo**:

```
packages/
├── game/              # Main game (Vite + React + Three.js + Capacitor)
├── content-gen/       # GenAI content generation (Gemini + Imagen)
└── e2e/               # E2E tests (Playwright)
```

## 📋 Prerequisites

- **Node.js** >= 20.0.0
- **PNPM** >= 10.0.0
- **Android Studio** (for Android development)
- **Xcode** (for iOS development, macOS only)

## 🛠️ Installation

```bash
# Install PNPM globally if you haven't already
npm install -g pnpm@10

# Clone the repository
git clone https://github.com/arcade-cabinet/neo-tokyo-rival-academies.git
cd neo-tokyo-rival-academies

# Install dependencies for all packages
pnpm install
```

## 🎯 Development

### Game Package (Main Game)

```bash
# Start development server (web)
pnpm --filter game dev

# Build for production
pnpm --filter game build

# Preview production build
pnpm --filter game preview

# Run unit tests
pnpm --filter game test

# Run tests in watch mode
pnpm --filter game test:watch
```

### Mobile Development (Capacitor)

```bash
cd packages/game

# Sync web assets to native projects
npx cap sync

# Open in Android Studio
npx cap open android

# Open in Xcode (macOS only)
npx cap open ios

# Build and run on Android device/emulator
npx cap run android

# Build and run on iOS simulator (macOS only)
npx cap run ios
```

### Content Generation Package (GenAI)

```bash
cd packages/content-gen

# Generate A-Story dialogue
pnpm generate:dialogue --arc A --stage neon-district

# Generate B-Story lore entries
pnpm generate:lore --arc B --topic kai-backstory

# Generate C-Story event dialogue
pnpm generate:dialogue --arc C --event alien-abduction

# Generate stage backgrounds
pnpm generate:background --stage neon-district

# Validate all generated content
pnpm validate:all

# Export validated content to game
pnpm export:all
```

### E2E Testing Package

```bash
# Run all E2E tests
pnpm --filter e2e test:e2e

# Run tests in UI mode
pnpm --filter e2e test:e2e:ui

# Run tests in debug mode
pnpm --filter e2e test:e2e:debug
```

## 🏗️ Project Architecture

### ECS (Entity Component System)

Game logic is built using **Miniplex ECS**:

- **Entities**: Game objects (player, enemies, collectibles)
- **Components**: Data (stats, position, velocity, health)
- **Systems**: Logic (CombatSystem, ProgressionSystem, DialogueSystem, AISystem)

#### RPG Stats System

Characters have **4 core stats**:

- **Structure**: Health, defense, resistance to stagger
- **Ignition**: Melee damage, critical hit chance
- **Logic**: Tech/ranged damage, hacking speed
- **Flow**: Movement speed, evasion, boost duration

#### Combat Formula

```typescript
Damage = (AttackPower * StatMultiplier) - (Defense / 2)
Critical Hit: Damage * 2 (max 50% chance)
```

#### Progression Formula

```typescript
XP to Next Level = 100 * (Level ^ 1.5)
Level-Up Rewards:
  - Health restored to full
  - +3 stat points to allocate
  - XP overflow carries to next level (multi-level advancement possible)
```

### Story Structure (A/B/C Arcs)

The narrative is organized into **three interweaving story arcs**:

#### **A-Story: Main Rivalry (Kai vs Vera)**
- Primary conflict driving the narrative
- Linear progression through stages
- Escalating confrontations between rival academies
- Culminates in final showdown at Data Core Tower

#### **B-Story: Character Development & Mystery**
- Runs parallel to A-Story
- Revealed through collectibles (Data Shards) and optional dialogue
- Explores character backstories and deeper motivations
- Unlocks true ending conditions

#### **C-Story: Event Disruptors (Forcing Team-Ups)**
- External threats forcing Kai and Vera to cooperate
- Examples: Alien Abduction stage, Mall Drop incident
- Unlocks unique combo abilities and team moves
- Builds chemistry between rivals

### Special Event Stages

#### **Alien Abduction**
- **Mechanics**: Vertical tentacle grab escapes, corrupted enemies
- **Boss**: Alien Queen (multi-phase combat)
- **Narrative**: Forces team-up between Kai and Vera (C-Story)

#### **Mall Drop**
- **Mechanics**: Weapon switching with makeshift weapons (scissors, mops, mannequin arms)
- **Enemies**: Security drones, rogue shoppers, Yakuza gang members
- **Narrative**: Comic relief stage with character bonding moments

## 🎨 Visual Style

- **Perspective**: FF7-style isometric diorama (45° fixed camera)
- **Graphics**: Cel-shaded 3D with meshToonMaterial
- **Aesthetic**: Neon cyberpunk (cyan, magenta, yellow neon lights)
- **Characters**: Chibi-style proportions with anime aesthetic
- **Environment**: Skyscrapers, holographic billboards, elevated train tracks

## 📱 Mobile-First Design

### Touch-First UX Requirements

- **Minimum Touch Target Size**: 48×48 dp (density-independent pixels)
- **Spacing**: 8dp minimum between interactive elements
- **No Hover-Only Interactions**: All features work with touch
- **Haptic Feedback**: Immediate feedback via Capacitor Haptics API
- **Gestures**: Swipe, tap, long-press, pinch-zoom support
- **Orientation**: Portrait and landscape modes

## 🤖 AI Development

This project includes comprehensive guidelines for AI coding agents:

- **AGENTS.md**: General guidelines for all AI agents
- **CLAUDE.md**: Specific instructions for Claude (codebase architecture, ECS systems)
- **GEMINI.md**: Specific instructions for Gemini (GenAI content generation)
- **.github/copilot-instructions.md**: Context for GitHub Copilot inline suggestions

### Critical Development Rules

1. **ZERO STUBS POLICY**: No `// TODO` or empty functions. Implement features fully or break them down.
2. **PRODUCTION QUALITY**: Code must be modular, strictly typed (no `any`, no `@ts-ignore`), and commented.
3. **VERIFY EVERYTHING**: Read files after changes, run tests after features.
4. **TEST DRIVEN**: Write tests for logic systems before or during implementation.
5. **CAPACITOR-FIRST**: Ensure all features work on mobile (48×48 dp touch targets, no hover-only).

## 🧪 Testing

### Run All Tests

```bash
# Lint all packages
pnpm check

# Fix linting issues
pnpm check:fix

# Type check all packages
pnpm type-check

# Run unit tests (packages/game)
pnpm --filter game test

# Run E2E tests (packages/e2e)
pnpm --filter e2e test:e2e

# Run all checks (lint + type-check + test)
pnpm ci
```

### Test Coverage

```bash
cd packages/game
pnpm test:coverage
```

## 📦 Building

### Web Build

```bash
# Build game package for web
pnpm --filter game build

# Preview production build
pnpm --filter game preview
```

### Mobile Build

```bash
cd packages/game

# Sync web build to native projects
npx cap sync

# Build Android APK
npx cap run android --target production

# Build iOS IPA (requires macOS + Xcode)
npx cap run ios --target production
```

## 🌐 Deployment

### Web (PWA)

The web version is automatically deployed to GitHub Pages on push to `main`:

**URL**: `https://arcade-cabinet.github.io/neo-tokyo-rival-academies`

### Mobile (Android/iOS)

1. Build APK/IPA using Capacitor CLI
2. Submit to Google Play Store (Android) and App Store (iOS)
3. Follow platform-specific guidelines for submission

## 📚 Documentation

- **[AGENTS.md](./AGENTS.md)**: Guidelines for AI coding agents
- **[CLAUDE.md](./CLAUDE.md)**: Claude-specific development instructions
- **[GEMINI.md](./GEMINI.md)**: Gemini-specific GenAI content generation guide
- **[docs/JRPG_TRANSFORMATION.md](./docs/JRPG_TRANSFORMATION.md)**: Detailed JRPG design specifications
- **[docs/TESTING_STRATEGY.md](./docs/TESTING_STRATEGY.md)**: Comprehensive testing guidelines

## 🛠️ Technology Resources

- **Vite**: https://vitejs.dev/
- **React Three Fiber**: https://docs.pmnd.rs/react-three-fiber/
- **Three.js**: https://threejs.org/manual/
- **Drei**: https://github.com/pmndrs/drei
- **Miniplex**: https://github.com/hmans/miniplex
- **Capacitor**: https://capacitorjs.com/docs
- **Biome**: https://biomejs.dev/
- **PNPM Workspaces**: https://pnpm.io/workspaces
- **Gemini API**: https://ai.google.dev/docs
- **Imagen 4**: https://cloud.google.com/vertex-ai/docs/generative-ai/image/overview

## 🤝 Contributing

This project follows strict development practices:

1. **Use PNPM** (never npm or yarn)
2. **Use Biome** for linting/formatting (never ESLint or Prettier)
3. **Run `pnpm check` before committing**
4. **Write tests for new features**
5. **Ensure mobile compatibility** (48×48 dp touch targets)
6. **Follow TypeScript strict mode** (no `any`, no `@ts-ignore`)
7. **Document complex systems** in AGENTS.md

### Code Review Checklist

- [ ] TypeScript types are explicit and correct
- [ ] Biome checks pass (`pnpm check`)
- [ ] Unit tests are written and passing
- [ ] E2E tests cover new gameplay features
- [ ] Touch targets meet 48×48 dp minimum
- [ ] No hover-only interactions
- [ ] Three.js resources are disposed properly
- [ ] ECS architecture is followed (no direct state mutation)

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details.

## 🙏 Acknowledgments

- **Three.js Community**: For the amazing 3D graphics library
- **Pmndrs**: For React Three Fiber and Drei
- **Miniplex**: For the lightweight ECS framework
- **Capacitor Team**: For seamless native mobile integration
- **Biome Team**: For the fast, unified toolchain
- **Google AI**: For Gemini Flash 3 and Imagen 4 APIs

---

Built with ❤️ using modern web technologies. Experience Neo-Tokyo's rival academies on **Android, iOS, and Web**.
