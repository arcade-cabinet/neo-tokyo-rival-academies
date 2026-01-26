# Unity Developer Guide

**Version**: 1.0.0
**Last Updated**: January 26, 2026
**Target**: Unity 6000.3.5f1

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Setup](#project-setup)
3. [Directory Structure](#directory-structure)
4. [Adding Components](#adding-components)
5. [Adding Systems](#adding-systems)
6. [Authoring Components](#authoring-components)
7. [Writing Tests](#writing-tests)
8. [Common Patterns](#common-patterns)
9. [Performance Guidelines](#performance-guidelines)
10. [Debugging Tips](#debugging-tips)

---

## Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| Unity Hub | Latest | Project management |
| Unity Editor | 6000.3.5f1 | Game engine |
| Node.js | >= 20.x | Dev tools, content-gen |
| PNPM | 10.x | Package management |
| Git | >= 2.x | Version control |

### Installing Unity

1. Download and install [Unity Hub](https://unity.com/download)
2. Open Unity Hub and navigate to **Installs**
3. Click **Install Editor** and select version **6000.3.5f1**
4. Include these modules:
   - Android Build Support (for mobile testing)
   - iOS Build Support (optional)
   - WebGL Build Support (optional)
   - Documentation

### Installing Dev Tools

```bash
# Install Node.js (via nvm recommended)
nvm install 20
nvm use 20

# Install PNPM globally
npm install -g pnpm@10

# Install project dependencies
pnpm install
```

### Installing Unity Packages (Headless)

Packages are managed via `openupm-cli`:

```bash
# Install openupm-cli
npm install -g openupm-cli

# Add a package
openupm add com.unity.entities

# Search packages
openupm search <keyword>

# Remove a package
openupm remove <package-name>
```

---

## Project Setup

### Cloning the Repository

```bash
git clone <repository-url>
cd neo-tokyo-rival-academies
```

### Opening in Unity

1. Open Unity Hub
2. Click **Add** > **Add project from disk**
3. Select the `neo-tokyo-rival-academies` folder (repository root)
4. Open with Unity **6000.3.5f1**

### First-Time Setup

Unity will import packages on first open. This may take 5-10 minutes.

If you see package signature warnings:
1. Run `./scripts/resolve-packages.sh` (macOS/Linux)
2. Or delete the `Library/` folder and reopen

### Verifying Installation

```bash
# Run EditMode tests to verify setup
./scripts/run-tests.sh editmode

# Expected output: "SUCCESS: All EditMode tests passed"
```

---

## Directory Structure

The Unity project lives at the repository root:

```
neo-tokyo-rival-academies/          # Repository Root = Unity Project
|
+-- Assets/
|   +-- _Generated/                 # Output from TypeScript tools
|   |   +-- Manifests/              # JSON world definitions
|   |   +-- Textures/               # Imported from shared-assets
|   |   +-- Models/                 # Meshy-generated GLBs
|   |
|   +-- Scripts/
|   |   +-- Components/             # DOTS IComponentData structs
|   |   |   +-- Core/               # PlayerTag, Transform, WorldObjectTags
|   |   |   +-- Combat/             # Health, DamageEvent, Hitbox
|   |   |   +-- Stats/              # RPGStats, LevelProgress
|   |   |   +-- Faction/            # Reputation, FactionMembership
|   |   |   +-- AI/                 # Threat, Swarm, Perception
|   |   |   +-- Abilities/          # Cooldowns, effects
|   |   |   +-- Navigation/         # Pathfinding
|   |   |   +-- Equipment/          # Equipped items
|   |   |   +-- Dialogue/           # Conversation state
|   |   |   +-- World/              # Weather, Territory, Water
|   |   |   +-- Quest/              # Objectives, progress
|   |   |   +-- Save/               # Serialization markers
|   |   |
|   |   +-- Systems/                # DOTS ISystem implementations
|   |   |   +-- Combat/             # CombatSystem, HitDetection, Break
|   |   |   +-- AI/                 # StateMachine, Steering, Threat
|   |   |   +-- Progression/        # Reputation, XP, Alignment
|   |   |   +-- World/              # HexGrid, Stage, Weather
|   |   |   +-- Navigation/         # Pathfinding
|   |   |   +-- Abilities/          # Ability processing
|   |   |   +-- Equipment/          # Gear management
|   |   |   +-- Dialogue/           # Conversations
|   |   |   +-- Quest/              # Quest tracking
|   |   |   +-- Save/               # Persistence
|   |   |
|   |   +-- Authoring/              # Baker components
|   |   +-- MonoBehaviours/         # Traditional Unity scripts
|   |   |   +-- UI/                 # HUD, Menus
|   |   |   +-- Camera/             # Isometric controller
|   |   |   +-- Input/              # Touch, Actions
|   |   |
|   |   +-- Utilities/              # Helpers, extensions
|   |   +-- Data/                   # Schema definitions, templates
|   |
|   +-- Prefabs/                    # Character and world prefabs
|   +-- Scenes/                     # Unity scenes
|   +-- Settings/                   # Rendering, Physics
|   +-- Resources/                  # Runtime config
|
+-- Packages/
|   +-- manifest.json               # Unity Package Manager deps
|
+-- ProjectSettings/                # Unity project settings
|
+-- Tests/
|   +-- EditMode/                   # Unit tests (fast, no rendering)
|   +-- PlayMode/                   # Integration tests (full runtime)
|   +-- Graphics/                   # Visual regression tests
|
+-- dev-tools/                      # TypeScript development tools
|   +-- content-gen/                # GenAI CLI (Meshy, Gemini)
|   +-- e2e/                        # Playwright tests
|   +-- types/                      # Shared TypeScript types
|
+-- scripts/                        # Shell scripts
|   +-- run-tests.sh                # Test runner
|   +-- resolve-packages.sh         # Package resolution
|
+-- docs/                           # Documentation
```

### Assembly Definitions

The project uses assembly definitions (`.asmdef`) for code organization:

| Assembly | Location | Purpose |
|----------|----------|---------|
| `NeoTokyo` | `Assets/Scripts/NeoTokyo.asmdef` | Main game code |
| `NeoTokyo.Data` | `Assets/Scripts/Data/NeoTokyo.Data.asmdef` | Manifest schemas |
| `NeoTokyo.Tests.EditMode` | `Tests/EditMode/NeoTokyo.Tests.EditMode.asmdef` | EditMode tests |
| `NeoTokyo.Tests.PlayMode` | `Tests/PlayMode/NeoTokyo.Tests.PlayMode.asmdef` | PlayMode tests |

---

## Adding Components

Components are pure data structs implementing `IComponentData`. They contain NO logic.

### Component Location

Place components in `Assets/Scripts/Components/<Domain>/`:

```
Components/
+-- Combat/CombatComponents.cs
+-- Stats/RPGStats.cs
+-- Faction/Reputation.cs
```

### Basic Component Pattern

```csharp
using Unity.Entities;
using Unity.Mathematics;

namespace NeoTokyo.Components.Combat
{
    /// <summary>
    /// Brief description of the component's purpose.
    /// Reference TypeScript equivalent if migrating.
    /// </summary>
    public struct Health : IComponentData
    {
        public int Current;
        public int Max;

        // Computed properties are OK (no state mutation)
        public float Ratio => Max > 0 ? (float)Current / Max : 0f;
        public bool IsDead => Current <= 0;
    }
}
```

### Tag Components

Tag components are empty structs for entity filtering:

```csharp
namespace NeoTokyo.Components.Core
{
    /// <summary>
    /// Tag component to identify player entities.
    /// </summary>
    public struct PlayerTag : IComponentData { }

    /// <summary>
    /// Tag for entities that have died.
    /// </summary>
    public struct DeadTag : IComponentData { }
}
```

### Buffer Elements

For dynamic arrays (multiple values per entity):

```csharp
namespace NeoTokyo.Components.Combat
{
    /// <summary>
    /// Damage event buffer for hit processing.
    /// Multiple damage events can queue per frame.
    /// </summary>
    public struct DamageEvent : IBufferElementData
    {
        public Entity Source;
        public int Amount;
        public bool IsCritical;
        public float StabilityDamage;
    }
}
```

### Static Factory Methods

Use static methods for default values:

```csharp
public struct StabilityState : IComponentData
{
    public int Current;
    public int Max;
    public float RecoveryRate;

    public static StabilityState Default => new StabilityState
    {
        Current = 100,
        Max = 100,
        RecoveryRate = 10f
    };
}
```

### Component Guidelines

| DO | DON'T |
|----|-------|
| Use blittable types (int, float, bool, Entity) | Use reference types (string, class) |
| Keep components small and focused | Put unrelated data together |
| Use `float3` from Unity.Mathematics | Use `Vector3` in components |
| Add XML documentation | Skip documentation |
| Create static `Default` properties | Use constructors with logic |

---

## Adding Systems

Systems process entities with specific components. They implement `ISystem` or inherit from `SystemBase`.

### System Location

Place systems in `Assets/Scripts/Systems/<Domain>/`:

```
Systems/
+-- Combat/CombatSystem.cs
+-- AI/AIStateMachineSystem.cs
+-- Progression/ReputationSystem.cs
```

### Basic ISystem Pattern

```csharp
using Unity.Burst;
using Unity.Entities;
using Unity.Mathematics;
using NeoTokyo.Components.Combat;

namespace NeoTokyo.Systems.Combat
{
    /// <summary>
    /// Processes damage events and applies to entity health.
    /// </summary>
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateAfter(typeof(HitDetectionSystem))]  // Explicit ordering
    public partial struct CombatSystem : ISystem
    {
        [BurstCompile]
        public void OnCreate(ref SystemState state)
        {
            // Require components before system runs
            state.RequireForUpdate<Health>();
            state.RequireForUpdate<EndSimulationEntityCommandBufferSystem.Singleton>();
        }

        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            // Get command buffer for structural changes
            var ecb = SystemAPI.GetSingleton<EndSimulationEntityCommandBufferSystem.Singleton>()
                .CreateCommandBuffer(state.WorldUnmanaged);

            // Process all entities with Health and DamageEvent buffer
            foreach (var (health, damageBuffer, entity) in
                SystemAPI.Query<RefRW<Health>, DynamicBuffer<DamageEvent>>()
                    .WithEntityAccess())
            {
                foreach (var damage in damageBuffer)
                {
                    // Apply damage
                    health.ValueRW.Current = math.max(0, health.ValueRO.Current - damage.Amount);

                    // Check for death
                    if (health.ValueRO.IsDead)
                    {
                        ecb.AddComponent<DeadTag>(entity);
                        break;
                    }
                }

                // Clear processed events
                damageBuffer.Clear();
            }
        }
    }
}
```

### SystemBase for Complex Logic

Use `SystemBase` when Burst compilation isn't possible:

```csharp
[UpdateInGroup(typeof(SimulationSystemGroup))]
public partial class HitDetectionSystem : SystemBase
{
    protected override void OnCreate()
    {
        RequireForUpdate<EndSimulationEntityCommandBufferSystem.Singleton>();
    }

    protected override void OnUpdate()
    {
        // Non-Burst code here
        var attackerList = new NativeList<AttackerData>(Allocator.TempJob);

        foreach (var (hitbox, transform, entity) in
            SystemAPI.Query<RefRO<Hitbox>, RefRO<LocalTransform>>()
                .WithEntityAccess())
        {
            // Collect attacker data
        }

        attackerList.Dispose();
    }
}
```

### System Attributes

| Attribute | Purpose |
|-----------|---------|
| `[BurstCompile]` | Enable Burst compilation (required for performance) |
| `[UpdateInGroup]` | Specify system group |
| `[UpdateBefore]` | Run before another system |
| `[UpdateAfter]` | Run after another system |

### System Groups

```
SimulationSystemGroup (default)
|
+-- BeginSimulationEntityCommandBufferSystem
+-- [Your game systems]
+-- EndSimulationEntityCommandBufferSystem
|
LateSimulationSystemGroup
|
+-- [Cleanup systems]
```

### EntityCommandBuffer Usage

Use ECB for structural changes (add/remove components, create/destroy entities):

```csharp
// Get ECB singleton
var ecb = SystemAPI.GetSingleton<EndSimulationEntityCommandBufferSystem.Singleton>()
    .CreateCommandBuffer(state.WorldUnmanaged);

// Add component
ecb.AddComponent<DeadTag>(entity);

// Remove component
ecb.RemoveComponent<ActiveTag>(entity);

// Create entity
var newEntity = ecb.CreateEntity();
ecb.AddComponent(newEntity, new Health { Current = 100, Max = 100 });

// Destroy entity
ecb.DestroyEntity(entity);
```

### Query Patterns

```csharp
// Read-only access
SystemAPI.Query<RefRO<Health>>()

// Read-write access
SystemAPI.Query<RefRW<Health>>()

// Filter by tag
SystemAPI.Query<RefRO<Health>>().WithAll<PlayerTag>()

// Exclude tags
SystemAPI.Query<RefRW<Health>>().WithNone<DeadTag>()

// Multiple components
SystemAPI.Query<RefRW<Health>, RefRO<RPGStats>>()

// With entity access
SystemAPI.Query<RefRW<Health>>().WithEntityAccess()

// Dynamic buffer
SystemAPI.Query<RefRW<Health>, DynamicBuffer<DamageEvent>>()
```

---

## Authoring Components

Authoring components convert GameObject data to ECS entities during the baking process.

### Authoring Location

Place authoring components in `Assets/Scripts/Authoring/`:

```
Authoring/
+-- PlayerAuthoring.cs
+-- EnemyAuthoring.cs
+-- HexTileAuthoring.cs
```

### Basic Authoring Pattern

```csharp
using Unity.Entities;
using Unity.Mathematics;
using UnityEngine;
using NeoTokyo.Components.Core;
using NeoTokyo.Components.Stats;
using NeoTokyo.Components.Combat;

namespace NeoTokyo.Authoring
{
    /// <summary>
    /// Authoring component for player entities.
    /// Attach to a GameObject to create player entity at runtime.
    /// </summary>
    public class PlayerAuthoring : MonoBehaviour
    {
        [Header("RPG Stats")]
        [Tooltip("HP, Defense - determines survival capability")]
        public int structure = 10;

        [Tooltip("Attack, Crits - passionate fighting power")]
        public int ignition = 10;

        [Tooltip("Skills, Specials - tactical ability usage")]
        public int logic = 10;

        [Tooltip("Speed, Evasion - movement and dodge capability")]
        public int flow = 10;

        [Header("Health")]
        public int currentHealth = 100;
        public int maxHealth = 100;

        // Nested Baker class
        class Baker : Baker<PlayerAuthoring>
        {
            public override void Bake(PlayerAuthoring authoring)
            {
                // Get entity with dynamic transform
                var entity = GetEntity(TransformUsageFlags.Dynamic);

                // Add tag component
                AddComponent(entity, new PlayerTag());

                // Add stats
                AddComponent(entity, new RPGStats
                {
                    Structure = authoring.structure,
                    Ignition = authoring.ignition,
                    Logic = authoring.logic,
                    Flow = authoring.flow
                });

                // Add health
                AddComponent(entity, new Health
                {
                    Current = authoring.currentHealth,
                    Max = authoring.maxHealth
                });

                // Add buffer for damage events
                AddBuffer<DamageEvent>(entity);
            }
        }
    }
}
```

### TransformUsageFlags

| Flag | Use When |
|------|----------|
| `None` | Entity doesn't need transform |
| `Renderable` | Static rendered object |
| `Dynamic` | Moving object (adds LocalTransform) |
| `WorldSpace` | Needs LocalToWorld matrix |
| `NonUniformScale` | Has non-uniform scaling |

### Baker Methods

```csharp
// Get the entity being baked
var entity = GetEntity(TransformUsageFlags.Dynamic);

// Add a component
AddComponent(entity, new MyComponent { Value = 42 });

// Add a tag (empty struct)
AddComponent<PlayerTag>(entity);

// Add a buffer
AddBuffer<DamageEvent>(entity);

// Reference another entity
var targetEntity = GetEntity(authoring.targetGameObject, TransformUsageFlags.Dynamic);

// Add component from prefab reference
var prefabEntity = GetEntity(authoring.prefab, TransformUsageFlags.Dynamic);
AddComponent(entity, new PrefabRef { Value = prefabEntity });
```

### Creating Prefabs

1. Create a GameObject with authoring component
2. Configure Inspector fields
3. Drag to Prefabs folder
4. Create SubScene and reference prefab

---

## Writing Tests

### Test Types

| Type | Location | Purpose | Speed |
|------|----------|---------|-------|
| EditMode | `Tests/EditMode/` | Unit tests, component logic, math | Fast (ms) |
| PlayMode | `Tests/PlayMode/` | Integration, system interactions | Medium (s) |
| Graphics | `Tests/Graphics/` | Visual regression | Slow (s) |

### EditMode Test Pattern

```csharp
using NUnit.Framework;
using Unity.Entities;
using Unity.Mathematics;
using NeoTokyo.Components.Combat;
using NeoTokyo.Components.Stats;

namespace NeoTokyo.Tests.EditMode
{
    /// <summary>
    /// Unit tests for CombatSystem.
    /// Tests damage calculations, health logic, and combat math.
    /// </summary>
    [TestFixture]
    public class CombatSystemTests
    {
        #region Health Component Tests

        [Test]
        public void Health_IsDead_ReturnsTrueWhenZero()
        {
            // Arrange
            var health = new Health
            {
                Current = 0,
                Max = 100
            };

            // Act & Assert
            Assert.IsTrue(health.IsDead);
        }

        [Test]
        public void Health_Ratio_CalculatesCorrectly()
        {
            // Arrange
            var health = new Health
            {
                Current = 50,
                Max = 100
            };

            // Act
            float ratio = health.Ratio;

            // Assert
            Assert.AreEqual(0.5f, ratio);
        }

        #endregion

        #region Damage Calculation Tests

        [Test]
        public void DamageCalculation_BasicDamage_SubtractsFromHealth()
        {
            // Arrange
            int health = 100;
            int damage = 25;

            // Act
            int result = math.max(0, health - damage);

            // Assert
            Assert.AreEqual(75, result);
        }

        [Test]
        public void DamageCalculation_OverkillDamage_ClampsToZero()
        {
            // Arrange
            int health = 50;
            int damage = 100;

            // Act
            int result = math.max(0, health - damage);

            // Assert
            Assert.AreEqual(0, result);
        }

        #endregion
    }
}
```

### PlayMode Test Pattern

```csharp
using NUnit.Framework;
using Unity.Entities;
using Unity.Transforms;
using Unity.Mathematics;
using UnityEngine.TestTools;
using System.Collections;
using NeoTokyo.Components.Core;
using NeoTokyo.Components.Stats;

namespace NeoTokyo.Tests.PlayMode
{
    /// <summary>
    /// Integration tests for player entity spawning.
    /// </summary>
    [TestFixture]
    public class PlayerSpawnTests
    {
        private World _testWorld;
        private EntityManager _em;

        [SetUp]
        public void SetUp()
        {
            // Create isolated test world
            _testWorld = new World("PlayerSpawnTestWorld");
            _em = _testWorld.EntityManager;
        }

        [TearDown]
        public void TearDown()
        {
            // Clean up test world
            if (_testWorld != null && _testWorld.IsCreated)
            {
                _testWorld.Dispose();
            }
        }

        [UnityTest]
        public IEnumerator Player_Spawns_WithCorrectComponents()
        {
            // Arrange
            var playerEntity = CreatePlayerEntity();
            yield return null;  // Wait one frame

            // Assert
            Assert.IsTrue(_em.HasComponent<PlayerTag>(playerEntity),
                "Player should have PlayerTag");
            Assert.IsTrue(_em.HasComponent<RPGStats>(playerEntity),
                "Player should have RPGStats");
            Assert.IsTrue(_em.HasComponent<Health>(playerEntity),
                "Player should have Health");
        }

        [UnityTest]
        public IEnumerator Player_Spawns_WithFullHealth()
        {
            // Arrange
            var playerEntity = CreatePlayerEntity();
            yield return null;

            // Act
            var health = _em.GetComponentData<Health>(playerEntity);

            // Assert
            Assert.AreEqual(health.Max, health.Current,
                "Player should spawn with full health");
            Assert.IsFalse(health.IsDead,
                "Player should not be dead on spawn");
        }

        private Entity CreatePlayerEntity()
        {
            var entity = _em.CreateEntity();
            _em.AddComponent<PlayerTag>(entity);
            _em.AddComponentData(entity, LocalTransform.FromPosition(float3.zero));
            _em.AddComponentData(entity, RPGStats.Default);
            _em.AddComponentData(entity, new Health { Current = 100, Max = 100 });
            return entity;
        }
    }
}
```

### Running Tests

```bash
# EditMode tests (fast)
./scripts/run-tests.sh editmode

# PlayMode tests (requires scene loading)
./scripts/run-tests.sh playmode

# All tests
./scripts/run-tests.sh all

# Graphics tests
./scripts/run-tests.sh graphics
```

### Test Naming Convention

```
[Method/Class]_[Scenario]_[ExpectedResult]

Examples:
- Health_IsDead_ReturnsTrueWhenZero
- Player_Spawns_WithCorrectComponents
- DamageCalculation_OverkillDamage_ClampsToZero
```

---

## Common Patterns

### Spawning Entities at Runtime

```csharp
// In a system
var ecb = SystemAPI.GetSingleton<EndSimulationEntityCommandBufferSystem.Singleton>()
    .CreateCommandBuffer(state.WorldUnmanaged);

var entity = ecb.CreateEntity();
ecb.AddComponent(entity, new Health { Current = 100, Max = 100 });
ecb.AddComponent(entity, new EnemyTag());
ecb.AddComponent(entity, LocalTransform.FromPosition(new float3(10, 0, 5)));
```

### Damaging an Entity

```csharp
// Option 1: Add to damage buffer
var damageBuffer = SystemAPI.GetBuffer<DamageEvent>(targetEntity);
damageBuffer.Add(new DamageEvent
{
    Source = attackerEntity,
    Amount = 25,
    IsCritical = false,
    StabilityDamage = 10f
});

// Option 2: Direct health modification (bypasses damage system)
var health = SystemAPI.GetComponentRW<Health>(targetEntity);
health.ValueRW.Current = math.max(0, health.ValueRO.Current - 25);
```

### Querying Single Entity

```csharp
// Get player entity
foreach (var (health, entity) in
    SystemAPI.Query<RefRW<Health>>()
        .WithAll<PlayerTag>()
        .WithEntityAccess())
{
    // Single player entity
    health.ValueRW.Current = health.ValueRO.Max;  // Full heal
    break;
}
```

### Singleton Components

```csharp
// Create singleton
var entity = ecb.CreateEntity();
ecb.AddComponent(entity, new GameSettings { Difficulty = 2 });

// Query singleton
var settings = SystemAPI.GetSingleton<GameSettings>();
```

### Loading JSON Manifests

```csharp
using NeoTokyo.Utilities;
using NeoTokyo.Data;

// Synchronous load
var result = ManifestLoader.LoadWorld("flooded-tokyo-2026");
if (result.Success)
{
    WorldManifest manifest = result.Data;
    // Process manifest
}

// Async load
var result = await ManifestLoader.LoadWorldAsync("flooded-tokyo-2026");
```

---

## Performance Guidelines

### Target Performance

| Metric | Budget |
|--------|--------|
| Frame Rate | 60 FPS on Pixel 8a |
| Memory | < 200 MB total |
| Entity Count | < 10,000 active |
| Draw Calls | < 100 per frame |

### Burst Compilation

Always use `[BurstCompile]` on systems and jobs:

```csharp
[BurstCompile]
public partial struct MySystem : ISystem
{
    [BurstCompile]
    public void OnUpdate(ref SystemState state)
    {
        // Burst-compiled code
    }
}
```

### Job System for Heavy Work

```csharp
[BurstCompile]
partial struct ProcessJob : IJobEntity
{
    public float DeltaTime;

    void Execute(ref Health health, in RPGStats stats)
    {
        // Parallel processing per entity
    }
}

// Schedule in system
new ProcessJob { DeltaTime = dt }.ScheduleParallel();
```

### Native Containers

Use native containers for temporary data:

```csharp
var positions = new NativeArray<float3>(count, Allocator.TempJob);
var results = new NativeList<int>(Allocator.TempJob);

// Process data...

// Always dispose!
positions.Dispose();
results.Dispose();
```

### Chunk Iteration

SystemAPI.Query uses chunk iteration automatically. Avoid nested loops over all entities.

### Memory Guidelines

| DO | DON'T |
|----|-------|
| Use NativeArray/NativeList | Allocate managed arrays in systems |
| Dispose native containers | Leave containers undisposed |
| Pool frequently created entities | Create/destroy every frame |
| Use shared static data | Store data per-entity when shared |

---

## Debugging Tips

### Unity Profiler

1. Open Window > Analysis > Profiler
2. Enable "Deep Profile" for detailed call stacks
3. Look for:
   - Burst-compiled methods (should be green)
   - GC allocations (red markers)
   - Long-running systems

### Entity Debugger

1. Open Window > Entities > Systems
2. View active worlds and systems
3. Click a system to see query statistics

### Entity Inspector

1. Open Window > Entities > Components
2. Select entity in hierarchy
3. View and modify component values at runtime

### Common Issues

**System not running:**
```csharp
// Check RequireForUpdate
public void OnCreate(ref SystemState state)
{
    state.RequireForUpdate<MyComponent>();  // System won't run without this component
}
```

**Component not found:**
```csharp
// Use HasComponent before GetComponent
if (state.EntityManager.HasComponent<Health>(entity))
{
    var health = state.EntityManager.GetComponentData<Health>(entity);
}
```

**Burst compilation errors:**
- Avoid managed types in Burst code
- Use `FixedString` instead of `string`
- Use `float3` instead of `Vector3`
- Use `Entity` instead of GameObject references

### Logging in Systems

```csharp
// Use Unity's Debug.Log (not available in Burst)
[UpdateInGroup(typeof(SimulationSystemGroup))]
public partial class DebugSystem : SystemBase
{
    protected override void OnUpdate()
    {
        foreach (var (health, entity) in
            SystemAPI.Query<RefRO<Health>>()
                .WithEntityAccess())
        {
            Debug.Log($"Entity {entity.Index}: Health = {health.ValueRO.Current}");
        }
    }
}
```

### Test Debugging

Run tests from Unity Test Runner window for interactive debugging:
1. Open Window > General > Test Runner
2. Select test and click "Run Selected"
3. Set breakpoints in Visual Studio/Rider

---

## Next Steps

1. Read [UNITY_API_REFERENCE.md](./UNITY_API_REFERENCE.md) for quick component/system lookup
2. Review [UNITY_6_ARCHITECTURE.md](./UNITY_6_ARCHITECTURE.md) for architectural details
3. Check [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues
4. See [CONTRIBUTING.md](../CONTRIBUTING.md) for code contribution guidelines

---

**Last Updated**: January 26, 2026
