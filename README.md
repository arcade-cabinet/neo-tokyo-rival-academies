# Neo-Tokyo: Rival Academies

<div align="center">

**A futuristic 3D Action JRPG set in the neon-lit streets of Neo-Tokyo**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Unity](https://img.shields.io/badge/Unity-6-000000?logo=unity)](https://unity.com/)
[![DOTS](https://img.shields.io/badge/DOTS-Entities%201.3-blue)](https://docs.unity3d.com/Packages/com.unity.entities@1.3/)
[![Build Status](https://img.shields.io/badge/Build-Passing-brightgreen)]()
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

[Documentation](./docs/) | [Roadmap](./docs/ROADMAP_1.0.md) | [Changelog](./CHANGELOG.md)

</div>

---

## About

**Neo-Tokyo: Rival Academies** is a 3D Action JRPG where rival academies compete in the Midnight Exam. Navigate the Academy Gate Slums, complete procedurally generated quests, and choose your allegiance between the passion-driven Kurenai faction or the logic-based Azure faction.

### Key Features

- **Procedural World Generation** - Seeded RNG creates deterministic districts and quests
- **Strategic Combat** - Real-time combat with stat-based formulas (Damage, Critical, Hit/Evade)
- **Dual Faction System** - Kurenai vs Azure alignment affects stats, quests, and story
- **Deep Progression** - Level-based growth, equipment system, and quest rewards
- **Complete Persistence** - Multi-slot save system
- **Cyberpunk Aesthetic** - Cel-shaded 3D graphics with scanline effects

---

## Tech Stack

### Core Technologies

| Technology | Version | Purpose |
|------------|---------|---------|
| **Unity** | 6.0 | Game Engine |
| **Entities** | 1.3.5 | ECS Framework |
| **Burst** | 1.8.18 | High-performance compilation |
| **Jobs** | 0.70.2 | Multi-threaded job system |
| **Collections** | 2.5.1 | Native containers |
| **Mathematics** | 1.3.2 | SIMD math library |

### Architecture

- **Data-Oriented Design** - Unity DOTS for high-performance gameplay
- **Hybrid Workflow** - TypeScript dev tools generate JSON consumed by Unity runtime
- **ECS Pattern** - Components (data) + Systems (logic) + Authoring (editor)
- **Mobile First** - Android/iOS via Unity's build pipeline

### Development Tools

- **IDE**: JetBrains Rider / Visual Studio 2022
- **Testing**: Unity Test Framework (EditMode + PlayMode)
- **CI/CD**: GitHub Actions + GameCI
- **Content Pipeline**: TypeScript CLI for procedural content generation

---

## Project Structure

```
neo-tokyo-rival-academies/
├── Assets/
│   ├── Scripts/
│   │   ├── Components/          # IComponentData structs
│   │   │   ├── PlayerComponent.cs
│   │   │   ├── EnemyComponent.cs
│   │   │   ├── CombatStatsComponent.cs
│   │   │   └── ...
│   │   ├── Systems/             # ISystem implementations
│   │   │   ├── MovementSystem.cs
│   │   │   ├── CombatSystem.cs
│   │   │   ├── QuestSystem.cs
│   │   │   └── ...
│   │   ├── Authoring/           # MonoBehaviour bakers
│   │   │   ├── PlayerAuthoring.cs
│   │   │   ├── EnemyAuthoring.cs
│   │   │   └── ...
│   │   ├── Aspects/             # Aspect definitions
│   │   ├── Jobs/                # IJobEntity implementations
│   │   └── Utilities/           # Helper classes
│   │
│   ├── Scenes/
│   │   ├── MainMenu.unity
│   │   ├── GameWorld.unity
│   │   └── SubScenes/           # Entity subscenes
│   │
│   ├── Resources/               # Runtime-loaded assets
│   ├── StreamingAssets/         # JSON data from content-gen
│   ├── Prefabs/                 # Entity prefabs
│   ├── Materials/               # Cel-shaded materials
│   ├── Shaders/                 # Custom shaders
│   └── Tests/
│       ├── EditMode/            # Editor tests
│       └── PlayMode/            # Runtime tests
│
├── Packages/
│   └── manifest.json            # Unity package dependencies
│
├── packages/                    # TypeScript dev tools
│   └── content-gen/             # Procedural content CLI
│
├── docs/                        # Documentation
│   ├── ARCHITECTURE.md
│   ├── TECH_ARCHITECTURE.md
│   ├── TESTING_STRATEGY.md
│   └── ...
│
├── ProjectSettings/             # Unity project settings
├── CHANGELOG.md
├── CLAUDE.md
└── README.md
```

---

## Getting Started

### Prerequisites

- **Unity Hub** with Unity 6.0 installed
- **Rider** or **Visual Studio 2022** with Unity support
- **Git** 2.40+
- **Node.js** 20+ (for content-gen tools)

### Installation

```bash
# Clone repository
git clone https://github.com/arcade-cabinet/neo-tokyo-rival-academies.git
cd neo-tokyo-rival-academies

# Open in Unity Hub
# 1. Open Unity Hub
# 2. Click "Add" -> "Add project from disk"
# 3. Select the neo-tokyo-rival-academies folder
# 4. Open with Unity 6.0

# Install content-gen dependencies (optional)
cd packages/content-gen
npm install
```

### Running in Unity Editor

1. Open the project in Unity 6
2. Navigate to `Assets/Scenes/MainMenu.unity`
3. Press Play in the Editor

### Build Commands

```bash
# Build for Android
# Unity Editor: File -> Build Settings -> Android -> Build

# Build for iOS
# Unity Editor: File -> Build Settings -> iOS -> Build

# Run content generation (TypeScript tools)
cd packages/content-gen
npm run generate
```

---

## Game Systems

### World Generation
- **DistrictManager** - Manages district loading/unloading via subscenes
- **WorldGenerator** - Creates deterministic districts from master seed
- **10 District Profiles** - Academy Gate Slums, Neon Spire, Chrome Gardens, etc.
- **Seeded RNG** - Reproducible world generation

### Quest System
- **QuestSystem** - Grammar-based procedural quest generation
- **100+ Grammar Entries** - Nouns, verbs, adjectives, landmarks
- **Quest Clusters** - 1 main + 2 sides + 1 secret per district
- **Alignment-Biased** - Quests shift toward Kurenai or Azure
- **Rewards** - XP, credits, alignment shifts, items

### Alignment and Reputation
- **Dual Reputation Meters** - Kurenai (0-100) and Azure (0-100)
- **Derived Alignment Scale** - (-1.0 to +1.0) = (Azure - Kurenai) / 100
- **Stat Bonuses** - At threshold values, faction bonuses apply
- **7 Alignment Labels** - Devotee, Leaning, Slightly, Neutral

### Combat System
- **Real-Time Combat** - ECS-driven with stat formulas
- **Damage Formula**: `max(1, floor(Ignition * 2 - Structure * 0.5))`
- **Critical Chance**: `min(0.5, Ignition * 0.01)`
- **5 Enemy Types** - Street Thug, Scavenger, Elite Guard, Rogue AI, Boss
- **5 Encounter Templates** - Street Patrol, Mixed Gang, Elite Patrol, AI Swarm, Boss Fight

### Progression
- **XP Curve** - 100 * level (e.g., Level 2 requires 200 XP)
- **Auto-Leveling** - Stats increase by +2 per level automatically
- **Credits Economy** - Earned from quests and combat
- **Inventory System** - Weapons, accessories, consumables, key items

---

## Development Workflow

### 1. Feature Development

```bash
# Create feature branch
git checkout -b feat/your-feature

# Make changes in Assets/Scripts/
# Follow C# coding conventions
# Use DOTS patterns (Components, Systems, Jobs)

# Test your changes
# Unity Editor: Window -> General -> Test Runner
# Run EditMode and PlayMode tests

# Commit with conventional commits
git commit -m "feat(combat): add new ability system"
```

### 2. Code Quality

- Use Rider/VS analyzers for code quality
- Follow Unity DOTS best practices
- Ensure Burst compatibility for performance-critical code
- Run tests before committing

### 3. Pull Request

- Create PR to `main`
- Fill out PR template
- Wait for CI checks (GameCI)
- Request review

---

## Building for Mobile

### Android

1. Open Unity Editor
2. File -> Build Settings
3. Select Android platform
4. Configure Player Settings (package name, version, etc.)
5. Click Build or Build and Run

Requirements:
- Android SDK installed via Unity Hub
- Minimum API Level: 26 (Android 8.0)
- Target API Level: 34 (Android 14)

### iOS

1. Open Unity Editor
2. File -> Build Settings
3. Select iOS platform
4. Configure Player Settings (bundle ID, version, etc.)
5. Click Build
6. Open generated Xcode project
7. Build and run from Xcode

Requirements:
- macOS with Xcode installed
- Apple Developer account for device deployment

---

## Testing

```bash
# Run all tests from Unity Editor
# Window -> General -> Test Runner

# EditMode tests (fast, no Play mode required)
# Tests/EditMode/

# PlayMode tests (requires Play mode)
# Tests/PlayMode/

# CI runs tests via GameCI
```

See [TESTING_STRATEGY.md](./docs/TESTING_STRATEGY.md) for comprehensive test documentation.

---

## Documentation

- **[ARCHITECTURE.md](./docs/ARCHITECTURE.md)** - System architecture and data flow
- **[TECH_ARCHITECTURE.md](./docs/TECH_ARCHITECTURE.md)** - Unity 6 DOTS stack details
- **[TESTING_STRATEGY.md](./docs/TESTING_STRATEGY.md)** - Testing framework and strategy
- **[ROADMAP_1.0.md](./docs/ROADMAP_1.0.md)** - Development roadmap
- **[CLAUDE.md](./CLAUDE.md)** - AI assistant context and guidelines
- **[CHANGELOG.md](./CHANGELOG.md)** - Version history

---

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Development Principles

1. **Mobile First** - All features must run at 60 FPS on mid-range devices
2. **DOTS Patterns** - Use ECS, Jobs, and Burst for performance
3. **Zero Stubs** - Fully implement logic, no placeholders
4. **Strict Types** - No `object` or `dynamic` types
5. **Burst Compatible** - Performance-critical code must be Burst-compiled

---

## License

This project is licensed under the MIT License - see [LICENSE](./LICENSE) for details.

---

## Acknowledgments

- **Unity Technologies** - Unity 6 and DOTS framework
- **GameCI** - CI/CD for Unity projects
- **Claude Code** - AI pair programmer

---

## Contact

- **GitHub**: [@arcade-cabinet](https://github.com/arcade-cabinet)
- **Issues**: [GitHub Issues](https://github.com/arcade-cabinet/neo-tokyo-rival-academies/issues)
- **Discussions**: [GitHub Discussions](https://github.com/arcade-cabinet/neo-tokyo-rival-academies/discussions)

---

<div align="center">

**Built by the Arcade Cabinet team**

Star this repo if you find it useful!

</div>
