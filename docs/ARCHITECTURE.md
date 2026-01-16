# Architecture & Data Flow

## System Overview

```mermaid
graph TD
    User[User / Player] -->|Input| InputSystem
    InputSystem -->|Update State| ECS[ECS World (Miniplex)]

    subgraph "Game Loop (GameWorld.tsx)"
        PhysicsSystem -->|Read/Write| ECS
        AISystem -->|Read/Write| ECS
        CombatSystem -->|Read/Write| ECS
        ProgressionSystem -->|Read/Write| ECS
        StageSystem -->|Manage| ECS
    end

    ECS -->|Render| ReactThreeFiber[R3F Components]
    ReactThreeFiber -->|Draw| Canvas

    subgraph "Content Generation (Offline)"
        GenAI[Google Gemini] -->|Prompt| ContentCLI[content-gen CLI]
        ContentCLI -->|JSON/SVG| Assets[Static Assets]
        Assets -->|Load| GameData[src/data/story_gen.json]
        GameData -->|Hydrate| ECS
    end
```

## Entity Component System (ECS)

The game uses **Miniplex**. Entities are plain JS objects with optional components.

- **Entity**: A game object (Player, Enemy, Platform).
- **Component**: Data (Position, Velocity, Stats).
- **System**: Logic that iterates over entities with specific components.

### Core Systems

1.  **PhysicsSystem**: Updates `position` based on `velocity` and `platformData`. Handles collisions.
2.  **CombatSystem**: Handles interactions between `isPlayer`, `isEnemy`, and `isProjectile`. Calculates damage using `CombatLogic`.
3.  **AISystem**: Uses **Yuka** FSM to drive enemy behavior (Chase, Attack, Flee).
4.  **DialogueSystem**: Manages narrative state overlays.

## GenAI Pipeline

Located in `packages/content-gen`.

1.  **Prompts**: `src/game/prompts/index.ts` defines schemas.
2.  **Generation**: `src/cli.ts` invokes Gemini API.
3.  **Output**:
    -   Narrative -> `packages/game/src/data/story_gen.json`
    -   Icons -> `packages/game/src/components/react/generated/*.tsx`

## Mobile Architecture (Capacitor)

-   **Web App**: Built via Vite to `packages/game/dist`.
-   **Native Wrapper**: Capacitor serves `dist` in a WebView.
-   **Plugins**: Haptics, Motion, ScreenOrientation.
