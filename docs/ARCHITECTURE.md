# Architecture and Data Flow

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Unity 6 Runtime                                 │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                         World (EntityManager)                          │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  │  │
│  │  │   Entities  │  │  Entities   │  │  Entities   │  │  Entities   │  │  │
│  │  │   (Player)  │  │  (Enemies)  │  │   (NPCs)    │  │   (World)   │  │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                      │                                       │
│                                      ▼                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                      System Update Loop                                │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │  │
│  │  │  Input   │→│ Movement │→│  Combat  │→│   AI     │→│  Quest   │   │  │
│  │  │  System  │ │  System  │ │  System  │ │  System  │ │  System  │   │  │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘ └──────────┘   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                      │                                       │
│                                      ▼                                       │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                         Presentation Layer                             │  │
│  │  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐    │  │
│  │  │  Hybrid Renderer │  │    UI Toolkit    │  │   Audio System   │    │  │
│  │  └──────────────────┘  └──────────────────┘  └──────────────────┘    │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                     Content Generation (Build-Time)                          │
│  ┌──────────────┐     ┌──────────────┐     ┌──────────────┐                │
│  │  TypeScript  │ ──→ │   JSON Data  │ ──→ │ Unity Loads  │                │
│  │  content-gen │     │ StreamingAssets    │ at Runtime   │                │
│  └──────────────┘     └──────────────┘     └──────────────┘                │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Entity Component System (ECS)

Unity DOTS uses a data-oriented Entity Component System pattern. This separates data (Components) from logic (Systems) for cache-efficient processing.

### Core Concepts

- **Entity**: A unique identifier (int) representing a game object
- **Component**: Pure data structs implementing `IComponentData`
- **System**: Logic that processes entities with specific component combinations
- **Archetype**: A unique combination of component types
- **Chunk**: Memory block storing entities of the same archetype

### ECS Pattern Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        Authoring Phase                           │
│  ┌─────────────────┐     ┌─────────────────┐                    │
│  │  MonoBehaviour  │ ──→ │      Baker      │                    │
│  │   (Inspector)   │     │  (Conversion)   │                    │
│  └─────────────────┘     └─────────────────┘                    │
│                                  │                               │
│                                  ▼                               │
│                          ┌─────────────────┐                    │
│                          │     Entity      │                    │
│                          │  + Components   │                    │
│                          └─────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
                                   │
                                   ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Runtime Phase                             │
│  ┌─────────────────┐     ┌─────────────────┐                    │
│  │     System      │ ──→ │   Query Chunks  │                    │
│  │   (ISystem)     │     │   (Archetype)   │                    │
│  └─────────────────┘     └─────────────────┘                    │
│                                  │                               │
│                                  ▼                               │
│                          ┌─────────────────┐                    │
│                          │  Process Data   │                    │
│                          │  (Burst + Jobs) │                    │
│                          └─────────────────┘                    │
└─────────────────────────────────────────────────────────────────┘
```

## Component Examples

### Player Component

```csharp
// Components/PlayerComponent.cs
public struct PlayerComponent : IComponentData
{
    public int PlayerId;
    public float3 SpawnPosition;
}
```

### Combat Stats Component

```csharp
// Components/CombatStatsComponent.cs
public struct CombatStatsComponent : IComponentData
{
    public int Level;
    public int CurrentHP;
    public int MaxHP;
    public int Ignition;    // Attack power
    public int Structure;   // Defense
    public int Flow;        // Agility
    public int Logic;       // Critical/accuracy
}
```

### Transform Component (Built-in)

```csharp
// Unity.Transforms provides:
// - LocalTransform
// - LocalToWorld
// - Parent
// - Child
```

## System Examples

### Movement System

```csharp
// Systems/MovementSystem.cs
[BurstCompile]
public partial struct MovementSystem : ISystem
{
    [BurstCompile]
    public void OnUpdate(ref SystemState state)
    {
        float deltaTime = SystemAPI.Time.DeltaTime;

        foreach (var (transform, velocity) in
            SystemAPI.Query<RefRW<LocalTransform>, RefRO<VelocityComponent>>())
        {
            transform.ValueRW.Position += velocity.ValueRO.Value * deltaTime;
        }
    }
}
```

### Combat System

```csharp
// Systems/CombatSystem.cs
[BurstCompile]
public partial struct CombatSystem : ISystem
{
    [BurstCompile]
    public void OnUpdate(ref SystemState state)
    {
        var ecb = new EntityCommandBuffer(Allocator.Temp);

        foreach (var (attack, stats, entity) in
            SystemAPI.Query<RefRO<AttackComponent>, RefRW<CombatStatsComponent>>()
                     .WithEntityAccess())
        {
            // Calculate damage: max(1, floor(Ignition * 2 - Structure * 0.5))
            int damage = math.max(1, (int)math.floor(
                attack.ValueRO.AttackerIgnition * 2f -
                stats.ValueRO.Structure * 0.5f));

            stats.ValueRW.CurrentHP -= damage;

            if (stats.ValueRO.CurrentHP <= 0)
            {
                ecb.AddComponent<DeadTag>(entity);
            }
        }

        ecb.Playback(state.EntityManager);
        ecb.Dispose();
    }
}
```

## System Update Order

Systems are organized into system groups that execute in a defined order.

```
┌─────────────────────────────────────────────────────────────────┐
│                    InitializationSystemGroup                     │
│  - BeginInitializationEntityCommandBufferSystem                 │
│  - SceneSystemGroup (subscene loading)                          │
│  - EndInitializationEntityCommandBufferSystem                   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SimulationSystemGroup                        │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ BeginSimulationEntityCommandBufferSystem                  │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ InputSystemGroup (custom)                                  │  │
│  │   - PlayerInputSystem                                      │  │
│  │   - TouchInputSystem                                       │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ GameLogicSystemGroup (custom)                              │  │
│  │   - MovementSystem                                         │  │
│  │   - AISystem                                               │  │
│  │   - CombatSystem                                           │  │
│  │   - QuestSystem                                            │  │
│  │   - ProgressionSystem                                      │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ TransformSystemGroup                                       │  │
│  │   - LocalToWorldSystem                                     │  │
│  └───────────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ EndSimulationEntityCommandBufferSystem                    │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    PresentationSystemGroup                       │
│  - BeginPresentationEntityCommandBufferSystem                   │
│  - RenderingSystemGroup                                         │
│  - UIUpdateSystem                                               │
└─────────────────────────────────────────────────────────────────┘
```

### Custom System Group Definition

```csharp
// Systems/GameLogicSystemGroup.cs
[UpdateInGroup(typeof(SimulationSystemGroup))]
[UpdateAfter(typeof(InputSystemGroup))]
public partial class GameLogicSystemGroup : ComponentSystemGroup { }

// Systems/MovementSystem.cs
[UpdateInGroup(typeof(GameLogicSystemGroup), OrderFirst = true)]
public partial struct MovementSystem : ISystem { }

// Systems/CombatSystem.cs
[UpdateInGroup(typeof(GameLogicSystemGroup))]
[UpdateAfter(typeof(MovementSystem))]
public partial struct CombatSystem : ISystem { }
```

## Authoring and Baking

Authoring components bridge Unity Editor (GameObjects) to ECS (Entities).

### Authoring Component

```csharp
// Authoring/PlayerAuthoring.cs
public class PlayerAuthoring : MonoBehaviour
{
    public int StartingLevel = 1;
    public int BaseHP = 100;
    public int BaseIgnition = 10;
    public int BaseStructure = 10;
    public int BaseFlow = 10;
    public int BaseLogic = 10;

    class Baker : Baker<PlayerAuthoring>
    {
        public override void Bake(PlayerAuthoring authoring)
        {
            var entity = GetEntity(TransformUsageFlags.Dynamic);

            AddComponent(entity, new PlayerComponent
            {
                PlayerId = 0,
                SpawnPosition = authoring.transform.position
            });

            AddComponent(entity, new CombatStatsComponent
            {
                Level = authoring.StartingLevel,
                CurrentHP = authoring.BaseHP,
                MaxHP = authoring.BaseHP,
                Ignition = authoring.BaseIgnition,
                Structure = authoring.BaseStructure,
                Flow = authoring.BaseFlow,
                Logic = authoring.BaseLogic
            });
        }
    }
}
```

## Hybrid Architecture (TypeScript to Unity)

Content generation uses TypeScript dev tools that output JSON. Unity loads this JSON at runtime.

```
┌─────────────────────────────────────────────────────────────────┐
│                   Build-Time (TypeScript)                        │
│                                                                  │
│  packages/content-gen/                                          │
│  ├── src/generators/                                            │
│  │   ├── quest-generator.ts    → quests.json                   │
│  │   ├── district-generator.ts → districts.json                │
│  │   └── npc-generator.ts      → npcs.json                     │
│  └── output/ → copied to StreamingAssets/                       │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   Runtime (Unity C#)                             │
│                                                                  │
│  Assets/StreamingAssets/                                        │
│  ├── quests.json                                                │
│  ├── districts.json                                             │
│  └── npcs.json                                                  │
│                                                                  │
│  Assets/Scripts/Loaders/                                        │
│  ├── QuestLoader.cs        → Parse JSON → Create Entities      │
│  ├── DistrictLoader.cs     → Parse JSON → Load Subscenes       │
│  └── NPCLoader.cs          → Parse JSON → Spawn NPCs           │
└─────────────────────────────────────────────────────────────────┘
```

### JSON Data Loading

```csharp
// Loaders/QuestLoader.cs
public class QuestLoader : MonoBehaviour
{
    void Start()
    {
        string path = Path.Combine(Application.streamingAssetsPath, "quests.json");
        string json = File.ReadAllText(path);
        QuestData[] quests = JsonUtility.FromJson<QuestDataArray>(json).quests;

        // Create quest entities
        var entityManager = World.DefaultGameObjectInjectionWorld.EntityManager;
        foreach (var quest in quests)
        {
            var entity = entityManager.CreateEntity();
            entityManager.AddComponentData(entity, new QuestComponent
            {
                QuestId = quest.id,
                Type = quest.type,
                IsActive = false,
                IsCompleted = false
            });
        }
    }
}
```

## Subscene Architecture

Districts are loaded as subscenes for efficient streaming.

```
┌─────────────────────────────────────────────────────────────────┐
│                     Main Scene (GameWorld)                       │
│  - SceneManager                                                  │
│  - PlayerSpawner                                                 │
│  - UICanvas                                                      │
└─────────────────────────────────────────────────────────────────┘
         │
         ├── Subscene: AcademyGateSlums
         │   └── District geometry, NPCs, Enemies, Items
         │
         ├── Subscene: NeonSpire
         │   └── District geometry, NPCs, Enemies, Items
         │
         ├── Subscene: ChromeGardens
         │   └── District geometry, NPCs, Enemies, Items
         │
         └── ... (7 more districts)
```

### Subscene Loading

```csharp
// Systems/DistrictStreamingSystem.cs
public partial struct DistrictStreamingSystem : ISystem
{
    public void OnUpdate(ref SystemState state)
    {
        float3 playerPos = GetPlayerPosition(ref state);

        foreach (var (subscene, entity) in
            SystemAPI.Query<RefRW<SceneReference>>()
                     .WithEntityAccess())
        {
            float distance = math.distance(playerPos, GetSubsceneCenter(subscene));

            if (distance < LoadRadius && !IsLoaded(subscene))
            {
                SceneSystem.LoadSceneAsync(state.WorldUnmanaged, subscene.ValueRO);
            }
            else if (distance > UnloadRadius && IsLoaded(subscene))
            {
                SceneSystem.UnloadScene(state.WorldUnmanaged, subscene.ValueRO);
            }
        }
    }
}
```

---

## Deprecated Architecture (Pre-Unity 6)

The following technologies were used in the previous TypeScript/Babylon.js version and are no longer applicable:

- **Miniplex** - Replaced by Unity Entities
- **Reactylon/Babylon.js** - Replaced by Unity rendering
- **Zustand** - Replaced by ECS singleton components
- **Vite** - No longer needed (Unity handles builds)
- **Capacitor** - Replaced by Unity mobile builds
- **Yuka AI** - Replaced by custom ECS AI systems

See `docs/DEPRECATIONS.md` for migration notes.

---

*Data-oriented design with Unity 6 DOTS for high-performance gameplay.*
