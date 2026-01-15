# AI Agents Architecture

This document describes the specialized agents operating within the Neo-Tokyo project.

## 1. ModelerAgent
*   **Role**: 3D Asset Factory.
*   **Responsibility**: Converting text/image concepts into fully rigged and animated GLB files.
*   **Tools**: Meshy AI API (`Text-to-Image`, `Image-to-3D`, `Rigging`, `Animation`).
*   **Location**: `packages/content-gen/src/agents/ModelerAgent.ts`.

## 2. ArtDirectorAgent (Legacy/Support)
*   **Role**: 2D Concept & Background Artist.
*   **Responsibility**: Generating high-fidelity 2D assets.
*   **Tools**: Google Imagen (via `@google/genai`).
*   **Note**: Character concept art is now primarily handled by `ModelerAgent` via Meshy for tighter integration, but ArtDirector remains useful for Backgrounds and Storyboards.
*   **Location**: `packages/content-gen/src/agents/ArtDirectorAgent.ts`.

## 3. NarrativeAgent (Planned)
*   **Role**: Storyteller.
*   **Responsibility**: Generating quest text, dialogue, and flavor text.
*   **Tools**: LLM (Gemini/Claude).

## Agent Orchestration
Agents are invoked via the `content-gen` CLI. They do not run autonomously in the background but are triggered by build/generate commands to ensure human-in-the-loop verification.