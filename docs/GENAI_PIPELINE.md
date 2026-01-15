# GenAI Asset Pipeline Documentation

## Overview
The **GenAI Pipeline** is a specialized subsystem responsible for autonomously creating production-ready game assets. It is designed to be **idempotent**, **resumable**, and **manifest-driven**.

## Core Components

### 1. The Manifest (`packages/game/src/content/manifest.json`)
The single source of truth. It defines the "desired state" of the game's content.
*   **Characters**: Names, descriptions, visual prompts.
*   **Backgrounds**: Scene descriptions.
*   **State Tracking**: Each entry tracks its generation status (`conceptArt`, `model3d`, `rigging`, `animations`) to allow resumption.

### 2. ModelerAgent (`packages/content-gen/src/agents/ModelerAgent.ts`)
The primary worker class that interfaces with the **Meshy AI API**.

**Capabilities:**
*   **Concept Art Generation**:
    *   Uses `POST /v1/text-to-image`.
    *   Enforces `t-pose` and `white background` to ensure downstream compatibility.
*   **3D Model Generation**:
    *   Uses `POST /v1/image-to-3d`.
    *   Converts local concept art images to Data URIs.
    *   Parameters: `ai_model: "latest"`, `pose_mode: "t-pose"`, `topology: "quad"`, `target_polycount: 50000`.
*   **Auto-Rigging**:
    *   Uses `POST /v1/rigging`.
*   **Animation**:
    *   Uses `POST /v1/animations`.
    *   Maps semantic keys (e.g., `IDLE_COMBAT`) to Meshy Action IDs via `ANIMATION_IDS` constant.

### 3. CLI (`packages/content-gen/src/cli.ts`)
The interface for developers.

**Commands:**
*   `pnpm generate`: Process the entire manifest.
*   `pnpm generate --target <id>`: Process a specific entity (e.g., `hero_kai`).

## Workflow Details

### The "White Animation" Fix
To prevent animations from losing texture data or structure:
1.  We explicitly generate a **Textured Concept Art** first.
2.  We feed this into `Image-to-3D` with `enable_pbr: true` and `should_texture: true`.
3.  We use `pose_mode: "t-pose"` to ensure the model is rig-ready.
4.  We pass the *Rigged Model ID* (`rig_task_id`) to the Animation endpoint, ensuring animations apply to the skinned mesh.

## Configuration
Requires `.env` file in root:
```env
MESHY_API_KEY=your_key_here
```

## Adding New Content
1.  Open `packages/game/src/content/manifest.json`.
2.  Add a new entry to `characters` array.
3.  Run `pnpm generate --target <new_id>`.