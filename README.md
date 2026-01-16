# Neo-Tokyo: Rival Academies

A high-fidelity 3D Action-JRPG set in a cyberpunk Neo-Tokyo, featuring GenAI-powered asset generation and isometric diorama gameplay.

## Overview

**Neo-Tokyo: Rival Academies** combines classic JRPG mechanics with modern web technology:

- **Isometric Diorama View**: Tactical hex-grid combat in beautiful 3D scenes
- **GenAI Asset Pipeline**: Production-quality characters generated via Meshy AI
- **Stats-Driven Combat**: Structure, Ignition, Logic, Flow
- **Rival Narrative**: Academy factions (Crimson vs Azure) with deep storytelling

## Quick Start

### Prerequisites

- Node.js 20+
- PNPM 10+ (`npm install -g pnpm`)
- Meshy AI API key (for asset generation)

### Installation

```bash
# Clone the repository
git clone https://github.com/arcade-cabinet/neo-tokyo-rival-academies.git
cd neo-tokyo-rival-academies

# Install dependencies
pnpm install

# Configure environment
cp .env.example .env
# Add MESHY_API_KEY to .env
```

### Development

```bash
# Start development server
pnpm dev
# Open http://localhost:4321

# Generate GenAI assets
pnpm --filter @neo-tokyo/content-gen generate characters/main/kai

# Run tests
pnpm test

# Lint and format
pnpm check
```

## Architecture

### Monorepo Structure

```text
packages/
├── game/           # React Three Fiber game client
├── content-gen/    # GenAI asset pipeline (Meshy AI)
└── e2e/            # Playwright E2E tests
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 19, Three.js 0.182, React Three Fiber 9.x |
| **Build** | Vite 6.x |
| **State** | Miniplex (ECS), Zustand |
| **Physics** | Rapier (@react-three/rapier) |
| **GenAI** | Meshy AI |
| **Quality** | Biome, Vitest, Playwright |

### GenAI Pipeline

Characters are generated through a 4-step pipeline:

1. **Concept Art** - Multi-view images from text prompt
2. **3D Model** - 30K polygon mesh from concept images
3. **Rigging** - Automatic humanoid skeleton
4. **Animations** - Combat/movement animations from presets

See [GENAI_PIPELINE.md](docs/GENAI_PIPELINE.md) for details.

## Documentation

### Core Documents

| Document | Description |
|----------|-------------|
| [CLAUDE.md](CLAUDE.md) | AI agent quick reference |
| [AGENTS.md](AGENTS.md) | Agent guidelines and rules |
| [CONTRIBUTING.md](CONTRIBUTING.md) | Contribution guidelines |

### Design & Architecture

| Document | Description |
|----------|-------------|
| [DESIGN_MASTER_PLAN.md](docs/DESIGN_MASTER_PLAN.md) | Vision and roadmap |
| [DESIGN_PHILOSOPHY.md](docs/DESIGN_PHILOSOPHY.md) | Core design pillars |
| [ARCHITECTURE.md](docs/ARCHITECTURE.md) | Technical architecture |
| [JRPG_TRANSFORMATION.md](docs/JRPG_TRANSFORMATION.md) | Stats and combat design |
| [NARRATIVE_DESIGN.md](docs/NARRATIVE_DESIGN.md) | A/B/C story architecture, 3-hour JRPG structure |

### Pipeline & Process

| Document | Description |
|----------|-------------|
| [GENAI_PIPELINE.md](docs/GENAI_PIPELINE.md) | Asset generation workflow |
| [TESTING_STRATEGY.md](docs/TESTING_STRATEGY.md) | Testing approach |
| [CHANGELOG.md](docs/CHANGELOG.md) | Project changelog |
| [PROJECT_EVOLUTION.md](docs/PROJECT_EVOLUTION.md) | Development history |

### AI Context (memory-bank/)

| Document | Description |
|----------|-------------|
| [projectbrief.md](memory-bank/projectbrief.md) | Core project summary |
| [techContext.md](memory-bank/techContext.md) | Technical stack details |
| [activeContext.md](memory-bank/activeContext.md) | Current work focus |
| [systemPatterns.md](memory-bank/systemPatterns.md) | Architecture patterns |

## Generated Characters

### Main (Hero Preset - 7 Animations)
- **Kai** - Crimson Academy protagonist
- **Vera** - Azure Academy rival

### B-Story (Enemy/Boss Presets)
- Yakuza Grunt, Yakuza Boss
- Biker Grunt, Biker Boss

### C-Story (Enemy/Prop)
- Mall Security Guard
- Alien Humanoid
- Tentacle Single (prop)

## Commands Reference

```bash
# Development
pnpm dev                    # Start dev server
pnpm build                  # Production build
pnpm preview                # Preview build

# Quality
pnpm check                  # Lint + format (Biome)
pnpm test                   # Unit tests (Vitest)
pnpm test:e2e              # E2E tests (Playwright)

# GenAI
pnpm --filter @neo-tokyo/content-gen generate <path>
```

## Contributing

1. Use **PNPM** exclusively (never npm/yarn)
2. Run `pnpm check` before committing
3. Follow [CONTRIBUTING.md](CONTRIBUTING.md) guidelines
4. See [AGENTS.md](AGENTS.md) for AI agent rules

## AI Development

This project is optimized for AI-assisted development:

- **Claude Code**: See [CLAUDE.md](CLAUDE.md)
- **GitHub Copilot**: See [.github/copilot-instructions.md](.github/copilot-instructions.md)
- **Gemini**: See [GEMINI.md](GEMINI.md)

## License

MIT

---

*Built with React Three Fiber, powered by Meshy AI*
