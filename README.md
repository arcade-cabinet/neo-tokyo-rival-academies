# Neo-Tokyo: Rival Academies

A futuristic **3D Action JRPG** set in the neon-lit streets of Neo-Tokyo, where rival academies compete for the Data Core. Built with modern web technologies and procedurally generated content.

## 🎮 About

Neo-Tokyo: Rival Academies combines high-speed runner mechanics with deep RPG progression.
- **Action JRPG Combat**: Real-time combat driven by character stats (Structure, Ignition, Logic, Flow).
- **Narrative Depth**: Visual-novel-style storytelling with rival factions, powered by GenAI.
- **Immersive 3D**: Powered by Three.js and React Three Fiber.
- **Cross-Platform**: Built for Web and Mobile (Capacitor).

## 🚀 Tech Stack

- **Architecture**: Monorepo (PNPM Workspaces)
- **Frontend**: [Vite](https://vitejs.dev/) v5.x + [React](https://react.dev/) v19
- **3D Engine**: [Three.js](https://threejs.org/) v0.182 + [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/)
- **Game Logic**: [Miniplex](https://github.com/hmans/miniplex) (ECS) + [Yuka](https://mugen87.github.io/yuka/) (AI)
- **Content Gen**: Google Gemini + Node.js (Procedural Narrative/Assets)
- **Mobile**: [Capacitor](https://capacitorjs.com/) v8
- **Testing**: Vitest (Unit) + Playwright (E2E)

## 🏗️ Project Structure

```text
neo-tokyo-rival-academies/
├── packages/
│   ├── game/           # Main Game Application (Vite/React)
│   │   ├── src/systems/    # ECS Logic (Combat, Physics)
│   │   ├── src/components/ # React 3D/UI Components
│   │   └── src/state/      # Game State
│   ├── content-gen/    # GenAI Tools & CLI
│   └── e2e/            # Playwright End-to-End Tests
├── docs/               # Project Documentation
└── .github/            # CI/CD Workflows
```

## 🛠️ Installation

```bash
# Install PNPM globally
npm install -g pnpm@10

# Clone and Install
git clone https://github.com/arcade-cabinet/neo-tokyo-rival-academies.git
cd neo-tokyo-rival-academies
pnpm install
```

## 🎯 Development

### Start Game
```bash
pnpm dev
# Opens http://localhost:4323
```

### Generate Content (GenAI)
```bash
# Requires GEMINI_API_KEY env var
pnpm --filter @neo-tokyo/content-gen generate
```

### Run Tests
```bash
# Unit Tests
pnpm test

# E2E Tests (Headless)
pnpm test:e2e

# E2E Tests (UI Mode)
pnpm --filter @neo-tokyo/e2e test:ui
```

## 📚 Documentation

- [Transformation Plan](docs/JRPG_TRANSFORMATION.md)
- [GenAI Pipeline](docs/GENAI_PIPELINE.md)
- [Testing Strategy](docs/TESTING_STRATEGY.md)
- [Agent Guidelines](AGENTS.md)
- [Audit Report](docs/AUDIT_REPORT.md)

## 📄 License

MIT License.
