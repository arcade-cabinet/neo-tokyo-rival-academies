# Architecture & Data Flow

## System Overview

```mermaid
graph TD
    User[User / Player] -->|Input| InputSystem
    InputSystem -->|Update State| ECS[ECS World (Miniplex)]

    subgraph "Game Loop"
        PhysicsSystem -->|Read/Write| ECS
        AISystem -->|Read/Write| ECS
        CombatSystem -->|Read/Write| ECS
        ProgressionSystem -->|Read/Write| ECS
        StageSystem -->|Manage| ECS
    end

    ECS -->|Render| Babylon[Babylon.js Scene]
    Babylon -->|Draw| Canvas

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

1. **PhysicsSystem**: Updates `position` based on `velocity` and `platformData`. Handles collisions.
2. **CombatSystem**: Handles interactions between `isPlayer`, `isEnemy`, and `isProjectile`. Calculates damage using `CombatLogic`.
3. **AISystem**: Navigation + behavior.
4. **DialogueSystem**: Manages narrative state overlays.

## Mobile Architecture (Capacitor)

- **Web App**: Built via Ionic Angular to `app/www`.
- **Native Wrapper**: Capacitor serves `www` in a WebView.
- **Plugins**: Haptics, Motion, ScreenOrientation.

---

*This architecture uses a single unified Ionic Angular app (no multi-app shells).*
