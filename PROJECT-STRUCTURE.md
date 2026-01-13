# Project Structure Documentation

This document outlines the structure of the Neo-Tokyo: Rival Academies project.

## Directory Structure

```
neo-tokyo-rival-academies/
├── .github/                           # GitHub specific files
│   ├── workflows/                     # GitHub Actions workflows
│   │   ├── ci.yml                    # Continuous Integration pipeline
│   │   └── deploy.yml                # Deployment to GitHub Pages
│   └── copilot-instructions.md       # GitHub Copilot context
│
├── .vscode/                          # VS Code configuration
│   ├── extensions.json               # Recommended extensions
│   └── settings.json                 # Editor settings
│
├── public/                           # Static assets (served as-is)
│   ├── models/                       # 3D models (.glb, .gltf files)
│   ├── textures/                     # Texture images
│   ├── audio/                        # Sound effects and music
│   └── favicon.svg                   # Site favicon
│
├── src/                              # Source code
│   ├── components/                   # React components
│   │   └── react/                    # React-specific components
│   │       ├── scenes/               # Complete 3D scenes with Canvas
│   │       │   └── WelcomeScene.tsx  # Example 3D scene
│   │       ├── objects/              # Individual 3D objects
│   │       ├── ui/                   # UI overlay components
│   │       └── game/                 # Game logic components
│   ├── layouts/                      # Astro layouts
│   │   └── Layout.astro              # Base layout component
│   ├── pages/                        # Astro pages (routes)
│   │   └── index.astro               # Home page
│   ├── assets/                       # Assets processed by Astro
│   └── utils/                        # Utility functions
│
├── .env.example                      # Example environment variables
├── .gitignore                        # Git ignore rules
├── .npmrc                            # PNPM configuration
├── astro.config.mjs                  # Astro configuration
├── biome.json                        # Biome linter/formatter config
├── package.json                      # Project dependencies and scripts
├── pnpm-workspace.yaml               # PNPM workspace configuration
├── tsconfig.json                     # TypeScript configuration
│
├── AGENTS.md                         # AI agent guidelines
├── CLAUDE.md                         # Claude-specific instructions
├── CONTRIBUTING.md                   # Contribution guidelines
├── GEMINI.md                         # Gemini-specific instructions
├── LICENSE                           # MIT License
└── README.md                         # Project documentation
```

## Key Directories

### `.github/workflows/`
Contains GitHub Actions workflow definitions for CI/CD:
- **ci.yml**: Runs on PRs and pushes - lints, type-checks, and builds
- **deploy.yml**: Deploys to GitHub Pages on pushes to main

### `src/components/react/`
All React components for 3D content and UI:
- **scenes/**: Full 3D scenes with `<Canvas>` component
- **objects/**: Individual 3D objects (meshes, groups)
- **ui/**: UI overlay components (HUD, menus, modals)
- **game/**: Game logic components (controllers, managers)

### `src/layouts/`
Astro layout components that wrap pages:
- Used for consistent page structure
- Handle common HTML head elements
- Provide base styling

### `src/pages/`
Astro pages that define routes:
- `index.astro` → `/`
- File-based routing
- Each file becomes a route

### `public/`
Static assets served directly:
- No processing or bundling
- Accessible at root URL
- Best for large binary files (models, audio)

### `src/assets/`
Assets processed by Astro:
- Optimized and bundled
- Good for images that need optimization

## Configuration Files

### `package.json`
- Project metadata
- Dependencies
- NPM scripts
- Engine requirements (Node >= 20, PNPM >= 10)

### `astro.config.mjs`
- Astro framework configuration
- React integration setup
- Build settings
- Site and base path for GitHub Pages

### `biome.json`
- Linter rules
- Formatter settings
- Organizes imports
- Replaces ESLint and Prettier

### `tsconfig.json`
- TypeScript compiler options
- Strict mode enabled
- Path aliases (@/, @components/, etc.)

### `.npmrc`
- PNPM-specific settings
- Peer dependency handling
- Performance optimizations

### `pnpm-workspace.yaml`
- Workspace configuration
- Currently single package
- Ready for monorepo expansion

## File Naming Conventions

### Components
- PascalCase: `PlayerController.tsx`, `GameScene.tsx`
- Type definitions in same file or adjacent `.types.ts` file

### Utilities
- camelCase: `gameUtils.ts`, `physics.ts`
- Pure functions, no side effects

### Pages (Astro)
- lowercase with hyphens: `index.astro`, `about.astro`
- File name determines route

### Assets
- lowercase with hyphens: `player-model.glb`, `neon-texture.png`
- Descriptive names

## Import Paths

Use path aliases defined in `tsconfig.json`:

```typescript
// Instead of: import { foo } from '../../../utils/gameUtils';
import { foo } from '@utils/gameUtils';

// Available aliases:
// @/           → src/
// @components/ → src/components/
// @layouts/    → src/layouts/
// @utils/      → src/utils/
// @assets/     → src/assets/
```

## Adding New Files

### New 3D Scene
1. Create `src/components/react/scenes/YourScene.tsx`
2. Export named component: `export const YourScene: FC = () => { ... }`
3. Use in Astro page with `client:load` directive

### New Page
1. Create `src/pages/your-page.astro`
2. Import layout
3. Add content
4. Accessible at `/your-page`

### New Utility
1. Create `src/utils/yourUtil.ts`
2. Export functions
3. Add JSDoc comments
4. Write TypeScript types

### New Asset
- **Models**: Place in `public/models/`
- **Textures**: Place in `public/textures/`
- **Audio**: Place in `public/audio/`
- **Images** (optimized): Place in `src/assets/`

## Build Output

When you run `pnpm build`:
- Output goes to `dist/` directory
- Static HTML, CSS, JS generated
- Assets copied and optimized
- Ready for deployment

## Environment-Specific Files

### Development
- `.env.development` (if needed)
- Use `pnpm dev` to start dev server

### Production
- `.env.production` (if needed)
- Use `pnpm build` then `pnpm preview`

### Environment Variables
- Create `.env` file (gitignored)
- Use `.env.example` as template
- Prefix public vars with `PUBLIC_`

## Ignored Files

See `.gitignore` for complete list:
- `node_modules/`
- `dist/`
- `.astro/`
- `.env` (but not `.env.example`)
- Build artifacts
- Cache directories
- IDE-specific files

## Future Expansion

This structure is designed to scale:
- Add more components in `src/components/react/`
- Create sub-routes in `src/pages/`
- Add packages to workspace if needed
- Organize game logic in `src/game/`
- Add tests in `src/__tests__/` (when implemented)

---

For more details on specific technologies:
- Astro: See `README.md` and official docs
- React Three Fiber: See `AGENTS.md`
- CI/CD: See workflow files in `.github/workflows/`
- Development: See `CONTRIBUTING.md`
