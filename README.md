# Neo-Tokyo: Rival Academies

A high-fidelity 3D Action-JRPG set in a cyberpunk Neo-Tokyo, featuring a sophisticated GenAI asset pipeline.

## 🚀 Quick Start

### 1. Setup
```bash
# Install dependencies
pnpm install

# Configure Environment
cp .env.example .env
# Add your MESHY_API_KEY to .env
```

### 2. Generate Content
Populate the game with AI-generated assets (Characters, Models, Animations).
```bash
# Generate everything defined in packages/game/src/content/manifest.json
pnpm generate

# Or generate a specific character
pnpm generate --target hero_kai
```

### 3. Run the Game
```bash
pnpm dev
```
Open `http://localhost:5173`.
*   **Toggle Prototypes**: Use the UI buttons to switch between **Isometric Diorama** and **Side-Scroll** modes.

## 🏗️ Architecture

### Monorepo Structure
*   `packages/game`: The React Three Fiber game client.
*   `packages/content-gen`: The Node.js toolchain for GenAI asset creation.

### The GenAI Pipeline
We use a **Manifest-Driven** approach. You define characters in `manifest.json`, and the `ModelerAgent` automates the rest:
1.  **Text-to-Image** (Concept Art)
2.  **Image-to-3D** (High-poly Model)
3.  **Auto-Rigging**
4.  **Animation** (Combat/Movement loops)

See [docs/GENAI_PIPELINE.md](docs/GENAI_PIPELINE.md) for details.

## 📚 Documentation
*   [Master Design Plan](docs/DESIGN_MASTER_PLAN.md)
*   [Agents Architecture](AGENTS.md)
*   [Prototype Strategy](docs/PROTOTYPE_STRATEGY.md)

## 🤝 Contributing
Please use `pnpm` for package management. Run `pnpm check` before committing to ensure Biome linting compliance.