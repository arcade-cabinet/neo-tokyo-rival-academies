# GenAI Content Pipeline

## Overview
This project uses a dedicated `packages/content-gen` workspace to procedurally generate game assets and narrative content using LLMs (Google Gemini).

## Setup
1.  Ensure you have a `GEMINI_API_KEY` set in your environment variables.
2.  Install dependencies: `pnpm install`

## Usage

### CLI
The unified CLI is located in `packages/content-gen/src/cli.ts`.

```bash
# Generate everything (Story + Assets)
pnpm --filter @neo-tokyo/content-gen generate

# Generate Story Only
pnpm --filter @neo-tokyo/content-gen gen:story

# Generate Assets Only (Icons)
pnpm --filter @neo-tokyo/content-gen gen:assets
```

## Architecture

### 1. Narrative Generation (`src/game`)
-   **Prompts**: Located in `src/game/prompts/index.ts`. Defines strict JSON schemas for Dialogues and Lore.
-   **Generator**: `src/game/generators/story.ts` queries the LLM for A-Story (Rivalry), B-Story (Mystery), and C-Story (Events) arcs.
-   **Output**: Merges all arcs into `packages/game/src/data/story_gen.json`.

### 2. UI Asset Generation (`src/ui`)
-   **Prompts**: `src/ui/prompts/index.ts` asks for optimized SVG code with Cyberpunk/Cel-shaded styling.
-   **Generator**: `src/ui/generators/assets.ts` generates raw SVG XML, wraps it in a React Component (`export const IconName = ...`), and saves it to `packages/game/src/components/react/generated/`.
-   **Output**: Functional React components ready for import.

## Adding New Content
1.  Add a new entry to `ASSET_LIST` in `src/ui/prompts/index.ts`.
2.  Run `pnpm gen:assets`.
3.  Import the new icon in your game component.

## Future Integrations

- **Meshy AI**: Planned integration for 3D asset generation (currently unimplemented).
- **Audio**: MusicSynth is partially implemented for procedural soundtracks.
