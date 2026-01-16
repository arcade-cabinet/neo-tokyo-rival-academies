# Contributing to Neo-Tokyo: Rival Academies

Welcome! We love contributions. Please follow these guidelines to keep the codebase clean and the game fun.

## 🛠️ Setup

1.  **Node.js**: Ensure version >= 20.
2.  **PNPM**: Install via `npm i -g pnpm@10`.
3.  **Install**: `pnpm install` in root.

##  workflow

1.  **Branching**: Use `feat/`, `fix/`, `chore/` prefixes.
2.  **Commits**: Use conventional commits (e.g., `feat: add wall jump`).
3.  **Testing**:
    -   Unit: `pnpm test`
    -   E2E: `pnpm test:e2e` (Requires local dev server running)
4.  **Linting**: `pnpm check` (Biome).

## 🧩 Architecture

-   **Game Logic**: ECS (Miniplex). Components in `src/state/ecs.ts`, Systems in `src/systems/`.
-   **Content**: GenAI scripts in `packages/content-gen`.
-   **UI**: React components in `src/components/react/ui`.

## 🤖 AI Policy

If you use AI tools (Claude, Cursor):
-   Follow `AGENTS.md`.
-   **No Stubs**: Do not leave `// TODO: implement later`.
-   **Strict Types**: No `any`.

## 📄 License

By contributing, you agree that your contributions will be licensed under the MIT License.
