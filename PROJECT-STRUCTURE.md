# Project Structure

This project uses a PNPM Workspace (Monorepo) structure to organize the game application and supporting tools.

## Directory Layout

```
.
├── apps/
│   └── web/                # The main Neo-Tokyo: Rival Academies game (Astro + React + Three.js)
├── packages/
│   └── scripts/            # Automation scripts (Triage, Verification, LLM integration)
├── pnpm-workspace.yaml     # Workspace definition
├── package.json            # Root package.json (manages workspace scripts)
└── PROJECT-STRUCTURE.md    # This file
```

## Packages

### `apps/web`
The core game application.
- **Tech Stack**: Astro, React, Three.js (R3F), Miniplex (ECS).
- **Commands**:
  - `pnpm dev`: Start local dev server.
  - `pnpm build`: Build for production.

### `packages/scripts`
TypeScript-based automation tools replacing legacy Python scripts.
- **Purpose**: CI/CD tasks, LLM-based triage, automated verification (Playwright).
- **Tech Stack**: TypeScript, Playwright, @anthropic-ai/sdk, @google/genai.
- **Commands**:
  - `pnpm triage`: Run the LLM triage agent.
  - `pnpm verify`: Run game verification tests.

## Development Workflow

1. **Install Dependencies**:
   ```bash
   pnpm install
   ```

2. **Run Game**:
   ```bash
   pnpm --filter apps/web dev
   ```
   or simply `pnpm dev` from the `apps/web` directory.

3. **Run Automation**:
   ```bash
   pnpm --filter @repo/scripts run triage TRIAGE
   ```

## Design Principles
- **No Python**: All scripting and automation must be in TypeScript/Node.js.
- **Strict Typing**: No `any`, strict null checks enabled.
- **Modular**: Logic should be separated into packages.
