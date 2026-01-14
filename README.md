# Neo-Tokyo: Rival Academies

A futuristic 3D Action JRPG set in the neon-lit streets of Neo-Tokyo, where rival academies compete for the Data Core.

## 🎮 About

Neo-Tokyo: Rival Academies combines high-speed runner mechanics with deep RPG progression.
- **Action JRPG Combat**: Real-time combat driven by character stats (Structure, Ignition, Logic, Flow).
- **Narrative Depth**: Visual-novel-style storytelling with rival factions.
- **Immersive 3D**: Powered by Three.js and React Three Fiber.
- **Modern Tech**: Astro, Miniplex ECS, and TypeScript.

## 🚀 Tech Stack

- **Framework**: [Astro](https://astro.build/) v4.x
- **3D Engine**: [Three.js](https://threejs.org/) v0.170
- **React Integration**: [@astrojs/react](https://docs.astro.build/en/guides/integrations-guide/react/)
- **3D React Components**: [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/) & [Drei](https://github.com/pmndrs/drei)
- **ECS**: [Miniplex](https://github.com/hmans/miniplex)
- **Package Manager**: [PNPM](https://pnpm.io/) v10
- **Linter/Formatter**: [Biome](https://biomejs.dev/) v1.9.4
- **Language**: TypeScript v5.7
- **Testing**: Vitest

## 📋 Prerequisites

- Node.js >= 20.0.0
- PNPM >= 10.0.0

## 🛠️ Installation

```bash
# Install PNPM globally if you haven't already
npm install -g pnpm@10

# Clone the repository
git clone https://github.com/arcade-cabinet/neo-tokyo-rival-academies.git
cd neo-tokyo-rival-academies

# Install dependencies
pnpm install
```

## 🎯 Development

```bash
# Start development server
pnpm dev

# Run tests
pnpm test

# Build for production
pnpm build
```

## 🏗️ Project Structure

```
neo-tokyo-rival-academies/
├── src/
│   ├── components/
│   │   ├── react/ui/      # HUD, Dialogue Interfaces
│   │   └── react/game/    # 3D Game Objects
│   ├── systems/           # ECS Logic (Combat, Progression)
│   ├── state/             # Global State (ECS)
│   ├── data/              # Static Assets (Story, Items)
│   └── pages/             # Astro Routes
```

## 🤖 AI Development

See `AGENTS.md` for strict development guidelines.
- **Zero Stubs Policy**: All code must be functional.
- **Documentation**: See `docs/JRPG_TRANSFORMATION.md`.

## 📄 License

MIT License.
