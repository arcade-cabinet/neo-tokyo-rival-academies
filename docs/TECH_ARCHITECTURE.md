# Technical Architecture

> **Purpose**: Define the Unity 6 DOTS technology stack, patterns, and system architecture.

## Technology Stack

### Core Packages

| Package | Version | Purpose |
|---------|---------|---------|
| **com.unity.entities** | 1.3.5 | ECS framework - Entity, Component, System |
| **com.unity.burst** | 1.8.18 | High-performance native code compilation |
| **com.unity.jobs** | 0.70.2 | Multi-threaded job system |
| **com.unity.collections** | 2.5.1 | Native containers (NativeArray, NativeList, etc.) |
| **com.unity.mathematics** | 1.3.2 | SIMD-optimized math library |
| **com.unity.entities.graphics** | 1.3.2 | ECS rendering integration |
| **com.unity.physics** | 1.3.5 | DOTS physics (optional) |

### Supporting Packages

| Package | Version | Purpose |
|---------|---------|---------|
| **com.unity.inputsystem** | 1.11.2 | New input system for mobile/desktop |
| **com.unity.addressables** | 2.3.1 | Asset loading and streaming |
| **com.unity.localization** | 1.5.2 | Multi-language support |
| **com.unity.test-framework** | 1.4.5 | Unit and integration testing |

### Package Manifest

```json
// Packages/manifest.json
{
  "dependencies": {
    "com.unity.entities": "1.3.5",
    "com.unity.burst": "1.8.18",
    "com.unity.jobs": "0.70.2",
    "com.unity.collections": "2.5.1",
    "com.unity.mathematics": "1.3.2",
    "com.unity.entities.graphics": "1.3.2",
    "com.unity.physics": "1.3.5",
    "com.unity.inputsystem": "1.11.2",
    "com.unity.addressables": "2.3.1",
    "com.unity.localization": "1.5.2",
    "com.unity.test-framework": "1.4.5"
  }
}
```

## Architecture Overview

```text
┌─────────────────────────────────────────────────────────────────┐
│                        Unity 6 Runtime                           │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    World (EntityManager)                   │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │                   Archetypes                         │  │  │
│  │  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐   │  │  │
│  │  │  │ Player  │ │ Enemy   │ │   NPC   │ │  World  │   │  │  │
│  │  │  │Archetype│ │Archetype│ │Archetype│ │Archetype│   │  │  │
│  │  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘   │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                    System Groups                           │  │
│  │  Initialization → Simulation → Presentation                │  │
│  │       ↓               ↓              ↓                     │  │
│  │   [Loading]     [Game Logic]    [Rendering]                │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │                   Presentation Layer                       │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │ Entities Graphics (GPU Instancing, LOD, Culling)    │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │ UI Toolkit (HUD, Menus, Dialogs)                    │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Assembly Definitions

Assembly definitions improve compile times and enforce dependency boundaries.

```
Assets/
├── Scripts/
│   ├── NeoTokyo.Core.asmdef
│   │   └── Components/, Aspects/, Utilities/
│   │
│   ├── NeoTokyo.Systems.asmdef
│   │   └── Systems/, Jobs/
│   │   └── References: NeoTokyo.Core
│   │
│   ├── NeoTokyo.Authoring.asmdef
│   │   └── Authoring/
│   │   └── References: NeoTokyo.Core
│   │
│   └── NeoTokyo.UI.asmdef
│       └── UI/
│       └── References: NeoTokyo.Core
│
└── Tests/
    ├── NeoTokyo.Tests.EditMode.asmdef
    │   └── References: NeoTokyo.Core, NeoTokyo.Systems
    │
    └── NeoTokyo.Tests.PlayMode.asmdef
        └── References: NeoTokyo.Core, NeoTokyo.Systems
```

### Assembly Definition Example

```json
// Assets/Scripts/NeoTokyo.Core.asmdef
{
    "name": "NeoTokyo.Core",
    "rootNamespace": "NeoTokyo.Core",
    "references": [
        "Unity.Entities",
        "Unity.Burst",
        "Unity.Mathematics",
        "Unity.Collections",
        "Unity.Transforms"
    ],
    "includePlatforms": [],
    "excludePlatforms": [],
    "allowUnsafeCode": true,
    "autoReferenced": true
}
```

## Component Architecture

### Component Categories

```
Components/
├── Tags/                       # Zero-size marker components
│   ├── PlayerTag.cs
│   ├── EnemyTag.cs
│   ├── NPCTag.cs
│   └── DeadTag.cs
│
├── Data/                       # Data-carrying components
│   ├── CombatStatsComponent.cs
│   ├── AlignmentComponent.cs
│   ├── QuestComponent.cs
│   └── InventoryComponent.cs
│
├── Buffers/                    # Dynamic buffer components
│   ├── InventoryBufferElement.cs
│   └── QuestLogBufferElement.cs
│
├── Shared/                     # ISharedComponentData
│   └── FactionComponent.cs
│
└── Singletons/                 # Single-instance components
    ├── GameStateComponent.cs
    └── WorldSeedComponent.cs
```

### Component Examples

```csharp
// Components/Tags/PlayerTag.cs
public struct PlayerTag : IComponentData { }

// Components/Data/CombatStatsComponent.cs
public struct CombatStatsComponent : IComponentData
{
    public int Level;
    public int CurrentHP;
    public int MaxHP;
    public int Ignition;
    public int Structure;
    public int Flow;
    public int Logic;
    public int CurrentXP;
    public int XPToNextLevel;
}

// Components/Buffers/InventoryBufferElement.cs
[InternalBufferCapacity(16)]
public struct InventoryBufferElement : IBufferElementData
{
    public int ItemId;
    public int Quantity;
    public bool IsEquipped;
}

// Components/Singletons/GameStateComponent.cs
public struct GameStateComponent : IComponentData
{
    public GamePhase CurrentPhase;
    public float PlayTime;
    public int CurrentDistrictId;
}
```

## System Architecture

### System Categories

```
Systems/
├── Input/
│   ├── PlayerInputSystem.cs      # Desktop keyboard/mouse
│   └── TouchInputSystem.cs       # Mobile touch controls
│
├── Movement/
│   ├── MovementSystem.cs         # Position updates
│   ├── RotationSystem.cs         # Rotation updates
│   └── NavigationSystem.cs       # Pathfinding
│
├── Combat/
│   ├── CombatSystem.cs           # Damage calculation
│   ├── AttackSystem.cs           # Attack execution
│   └── DeathSystem.cs            # Death handling
│
├── AI/
│   ├── AIDecisionSystem.cs       # State machine updates
│   ├── AIMovementSystem.cs       # AI navigation
│   └── AITargetingSystem.cs      # Target selection
│
├── Quest/
│   ├── QuestActivationSystem.cs  # Quest triggers
│   ├── QuestProgressSystem.cs    # Objective tracking
│   └── QuestCompletionSystem.cs  # Reward distribution
│
├── Progression/
│   ├── XPSystem.cs               # Experience gain
│   ├── LevelUpSystem.cs          # Level advancement
│   └── AlignmentSystem.cs        # Faction reputation
│
└── World/
    ├── DistrictStreamingSystem.cs # Subscene loading
    └── SpawnSystem.cs             # Entity spawning
```

### System Example with Jobs

```csharp
// Systems/Movement/MovementSystem.cs
[BurstCompile]
[UpdateInGroup(typeof(SimulationSystemGroup))]
public partial struct MovementSystem : ISystem
{
    [BurstCompile]
    public void OnCreate(ref SystemState state)
    {
        state.RequireForUpdate<PlayerTag>();
    }

    [BurstCompile]
    public void OnUpdate(ref SystemState state)
    {
        float deltaTime = SystemAPI.Time.DeltaTime;

        new MovementJob
        {
            DeltaTime = deltaTime
        }.ScheduleParallel();
    }
}

[BurstCompile]
public partial struct MovementJob : IJobEntity
{
    public float DeltaTime;

    void Execute(ref LocalTransform transform, in VelocityComponent velocity)
    {
        transform.Position += velocity.Value * DeltaTime;
    }
}
```

## Aspect Architecture

Aspects provide a convenient way to group related components.

```csharp
// Aspects/CombatAspect.cs
public readonly partial struct CombatAspect : IAspect
{
    public readonly Entity Entity;

    private readonly RefRW<CombatStatsComponent> _stats;
    private readonly RefRO<LocalTransform> _transform;

    public int CurrentHP
    {
        get => _stats.ValueRO.CurrentHP;
        set => _stats.ValueRW.CurrentHP = value;
    }

    public float3 Position => _transform.ValueRO.Position;

    public int CalculateDamage(int attackerIgnition)
    {
        // max(1, floor(Ignition * 2 - Structure * 0.5))
        return math.max(1, (int)math.floor(
            attackerIgnition * 2f - _stats.ValueRO.Structure * 0.5f));
    }

    public bool IsDead => _stats.ValueRO.CurrentHP <= 0;
}
```

## Performance Architecture

### Burst Compilation

All performance-critical systems use Burst compilation.

```csharp
[BurstCompile(CompileSynchronously = true)]
public partial struct CriticalPathSystem : ISystem
{
    [BurstCompile]
    public void OnUpdate(ref SystemState state)
    {
        // Burst-compiled code path
    }
}
```

### Job System Patterns

```csharp
// Parallel job for independent entity processing
[BurstCompile]
public partial struct ParallelProcessJob : IJobEntity
{
    void Execute(ref SomeComponent component)
    {
        // Processed in parallel across worker threads
    }
}

// Single-threaded job for sequential operations
[BurstCompile]
public struct SequentialJob : IJob
{
    public NativeArray<float> Data;

    public void Execute()
    {
        for (int i = 0; i < Data.Length; i++)
        {
            Data[i] = ProcessSequentially(Data[i]);
        }
    }
}
```

### Memory Layout Optimization

```csharp
// Good: Components sized for cache efficiency
public struct OptimizedComponent : IComponentData
{
    public float3 Position;      // 12 bytes
    public float Speed;          // 4 bytes
    // Total: 16 bytes (cache-line friendly)
}

// Avoid: Large components with sparse access
public struct SuboptimalComponent : IComponentData
{
    public float3 Position;
    public float3 Velocity;
    public float3 Acceleration;
    public FixedString128Bytes Name;  // Rarely accessed
    public int DebugFlags;             // Only used in editor
}
```

### Chunk Utilization

```csharp
// Query with chunk-level filtering for efficiency
public void OnUpdate(ref SystemState state)
{
    foreach (var (stats, entity) in
        SystemAPI.Query<RefRW<CombatStatsComponent>>()
                 .WithAll<EnemyTag>()
                 .WithNone<DeadTag>()
                 .WithEntityAccess())
    {
        // Only processes relevant chunks
    }
}
```

## Mobile Optimization

### Platform-Specific Settings

```csharp
// Conditional compilation for mobile
#if UNITY_ANDROID || UNITY_IOS
    const int MaxActiveEnemies = 20;
    const float LODDistance = 30f;
#else
    const int MaxActiveEnemies = 50;
    const float LODDistance = 100f;
#endif
```

### Touch Input Integration

```csharp
// Systems/Input/TouchInputSystem.cs
[UpdateInGroup(typeof(InitializationSystemGroup))]
public partial class TouchInputSystem : SystemBase
{
    protected override void OnUpdate()
    {
        var touchscreen = Touchscreen.current;
        if (touchscreen == null) return;

        foreach (var touch in touchscreen.touches)
        {
            if (touch.phase.ReadValue() == UnityEngine.InputSystem.TouchPhase.Began)
            {
                var position = touch.position.ReadValue();
                // Process touch input
            }
        }
    }
}
```

## Data Loading Pipeline

### StreamingAssets Integration

```csharp
// Loaders/ContentLoader.cs
public class ContentLoader : MonoBehaviour
{
    async void Start()
    {
        string basePath = Application.streamingAssetsPath;

        // Load generated content
        var questsJson = await LoadJsonAsync(Path.Combine(basePath, "quests.json"));
        var districtsJson = await LoadJsonAsync(Path.Combine(basePath, "districts.json"));

        // Parse and create entities
        CreateQuestEntities(questsJson);
        PrepareDistrictSubscenes(districtsJson);
    }

    async Task<string> LoadJsonAsync(string path)
    {
        #if UNITY_ANDROID && !UNITY_EDITOR
        using var request = UnityWebRequest.Get(path);
        await request.SendWebRequest();
        return request.downloadHandler.text;
        #else
        return await File.ReadAllTextAsync(path);
        #endif
    }
}
```

## Build Configuration

### Player Settings (Mobile)

```
// ProjectSettings/ProjectSettings.asset (key settings)
Android:
  - Minimum API Level: 26 (Android 8.0)
  - Target API Level: 34 (Android 14)
  - Scripting Backend: IL2CPP
  - ARM64 only (no ARMv7)

iOS:
  - Minimum iOS Version: 14.0
  - Scripting Backend: IL2CPP
  - Architecture: ARM64

Common:
  - Color Space: Linear
  - Graphics APIs: Vulkan (Android), Metal (iOS)
  - Managed Stripping Level: High
```

### Build Profiles

```csharp
// Editor/BuildProfiles.cs
public static class BuildProfiles
{
    [MenuItem("Build/Android Development")]
    static void BuildAndroidDev()
    {
        var options = new BuildPlayerOptions
        {
            scenes = GetBuildScenes(),
            locationPathName = "Builds/Android/NeoTokyo-Dev.apk",
            target = BuildTarget.Android,
            options = BuildOptions.Development | BuildOptions.ConnectWithProfiler
        };
        BuildPipeline.BuildPlayer(options);
    }

    [MenuItem("Build/Android Release")]
    static void BuildAndroidRelease()
    {
        var options = new BuildPlayerOptions
        {
            scenes = GetBuildScenes(),
            locationPathName = "Builds/Android/NeoTokyo.aab",
            target = BuildTarget.Android,
            options = BuildOptions.None
        };
        EditorUserBuildSettings.buildAppBundle = true;
        BuildPipeline.BuildPlayer(options);
    }
}
```

---

## Deprecated Stack (Pre-Unity 6)

The following technologies from the TypeScript/Babylon.js version are no longer used:

| Old Technology | Replacement |
|----------------|-------------|
| Vite | Unity Build Pipeline |
| React 19 | UI Toolkit |
| Babylon.js | Unity Rendering |
| Reactylon | Entities Graphics |
| Zustand | ECS Singletons |
| Miniplex | Unity Entities |
| Capacitor | Unity Mobile Build |
| PNPM/Node.js | Unity Package Manager |
| Vitest | Unity Test Framework |
| Playwright | Unity Test Framework (PlayMode) |

---

*Unity 6 DOTS architecture for high-performance mobile gaming.*
