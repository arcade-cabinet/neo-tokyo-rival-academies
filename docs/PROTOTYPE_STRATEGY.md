# Prototype Strategy: Iso vs. Side-Scroll

## Objective
We are evaluating two distinct camera and control schemes to determine the best fit for Neo-Tokyo's "Cyberpunk Action-JRPG" vision.

## Option A: Isometric Diorama
**Inspiration:** *Hades*, *Diablo*, *Bastion*.

*   **Visual Style:** Fixed camera angle (orthographic or high perspective). The world is presented as a series of connected "dioramas" or stages.
*   **Gameplay:** 360-degree movement on the ground plane. Tactical combat with clear telegraphing.
*   **Pros:**
    *   Showcases the detailed environment art.
    *   Classic RPG feel.
    *   Easier to handle depth perception in combat.
*   **Cons:**
    *   Can feel static/small scale.
    *   Verticality is harder to convey (no skyboxes).

## Option B: Cinematic Side-Scroll
**Inspiration:** *Prince of Persia: The Lost Crown*, *Metroid Dread*.

*   **Visual Style:** Perspective camera from the side, with significant depth (parallax layers). Dynamic zooms for finishers/cutscenes.
*   **Gameplay:** Left/Right movement with verticality (jumping, climbing, wall-running).
*   **Pros:**
    *   Highly kinetic and fast-paced.
    *   "Prince of Persia" parkour mechanics fit the urban setting.
    *   Cinematic presentation.
*   **Cons:**
    *   Less "exploration" in the traditional RPG sense.
    *   Combat is strictly 2D plane (fighting game style).

## The Test
We have implemented both scenes in the main codebase (`packages/game/src/components/react/scenes/`).
Launch `pnpm dev` and use the toggle buttons to switch instantly between them using the same generated assets.

**Evaluation Criteria:**
1.  **Combat Feel:** Which perspective makes the generated animations (Attack, Dodge) feel more impactful?
2.  **Visual Fidelity:** Which camera angle hides the imperfections of GenAI assets better?
3.  **Navigation:** Which mode feels more "Neo-Tokyo"?
