# Neo-Tokyo: Rival Academies

A futuristic 3D platformer game set in the neon-lit streets of Neo-Tokyo, where rival academies compete for supremacy.

## 🎮 About

Neo-Tokyo: Rival Academies is an immersive 3D platformer built with modern web technologies, featuring:
- **Stunning 3D Graphics**: Powered by Three.js and React Three Fiber
- **Smooth Performance**: Built on Astro with React integration
- **Modern Tooling**: PNPM 10, Biome linter/formatter, TypeScript

## 🚀 Tech Stack

- **Framework**: [Astro](https://astro.build/) v4.x
- **3D Engine**: [Three.js](https://threejs.org/) v0.170
- **React Integration**: [@astrojs/react](https://docs.astro.build/en/guides/integrations-guide/react/)
- **3D React Components**: [React Three Fiber](https://docs.pmnd.rs/react-three-fiber/) & [Drei](https://github.com/pmndrs/drei)
- **Package Manager**: [PNPM](https://pnpm.io/) v10
- **Linter/Formatter**: [Biome](https://biomejs.dev/) v1.9.4
- **Language**: TypeScript v5.7

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

# Build for production
pnpm build

# Preview production build
pnpm preview

# Run linting
pnpm lint

# Run formatting
pnpm format

# Fix linting and formatting issues
pnpm check:fix
```

## 🏗️ Project Structure

```
neo-tokyo-rival-academies/
├── .github/
│   ├── workflows/          # GitHub Actions CI/CD
│   └── copilot-instructions.md
├── public/                 # Static assets
├── src/
│   ├── components/
│   │   └── react/         # React components (3D scenes)
│   ├── layouts/           # Astro layouts
│   ├── pages/             # Astro pages
│   ├── assets/            # Images, models, textures
│   └── utils/             # Utility functions
├── astro.config.mjs       # Astro configuration
├── biome.json             # Biome configuration
├── tsconfig.json          # TypeScript configuration
├── package.json           # Project dependencies
├── pnpm-workspace.yaml    # PNPM workspace config
└── .npmrc                 # PNPM settings
```

## 🤖 AI Development

This project is designed to work seamlessly with AI coding assistants:

- **GitHub Copilot**: See `.github/copilot-instructions.md`
- **Claude**: See `CLAUDE.md`
- **Gemini**: See `GEMINI.md`
- **General Agents**: See `AGENTS.md`

## 🚢 Deployment

The project automatically deploys to GitHub Pages on push to the `main` branch.

### Manual Deployment

```bash
pnpm build
# The dist/ folder can be deployed to any static hosting service
```

### GitHub Pages Setup

1. Go to repository Settings > Pages
2. Set Source to "GitHub Actions"
3. Push to main branch to trigger deployment

## 📝 Code Quality

This project uses Biome for fast, modern linting and formatting:

```bash
# Check code quality
pnpm check

# Auto-fix issues
pnpm check:fix

# Type checking
pnpm type-check
```

## 🤝 Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and the process for submitting pull requests.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎨 Features Coming Soon

- [ ] Character selection system
- [ ] Multiple academy environments
- [ ] Competitive multiplayer modes
- [ ] Leaderboards
- [ ] Achievement system
- [ ] Custom character skins
- [ ] Story mode campaign

## 🐛 Known Issues

None currently. Please report issues on the [GitHub Issues](https://github.com/arcade-cabinet/neo-tokyo-rival-academies/issues) page.

## 📞 Support

For support, please open an issue or reach out to the development team.

---

Built with ❤️ using Astro, React Three Fiber, and Three.js