# Unity 6 DOTS Architecture Guide

**Version**: 2.0
**Last Updated**: January 25, 2026
**Status**: Active (Post-Migration)

---

## Overview

Neo-Tokyo: Rival Academies uses Unity 6 with a DOTS-first architecture for game logic, combined with traditional MonoBehaviours for UI and camera systems. This document details the complete technical architecture.

### Architecture Philosophy

```
+-----------------------------------------------------------+
|                    HYBRID ARCHITECTURE                      |
+-----------------------------------------------------------+
|                                                             |
|  +---------------------------+   +----------------------+   |
|  |   TYPESCRIPT DEV LAYER    |   |   UNITY 6 RUNTIME    |   |
|  |      (Build-Time)         |   |    (Game Engine)     |   |
|  +---------------------------+   +----------------------+   |
|  | - content-gen (Meshy)     |   | - Game loop          |   |
|  | - e2e tests (Playwright)  |-->| - DOTS ECS systems   |   |
|  | - Asset manifest gen      |   | - Physics (Havok)    |   |
|  | - Type definitions        |   | - Navigation         |   |
|  +---------------------------+   +----------------------+   |
|            |                              ^                 |
|            |     JSON MANIFESTS           |                 |
|            +------------------------------+                 |
|                                                             |
+-----------------------------------------------------------+
```

**Key Principle**: TypeScript generates content at build time; Unity consumes and runs it.

---

## DOTS Overview

### What is DOTS?

DOTS (Data-Oriented Technology Stack) is Unity's high-performance framework consisting of:

| Package | Purpose | Version |
|---------|---------|---------|
| **Entities** | ECS (Entity Component System) | 1.3.x |
| **Burst** | LLVM-based compiler for C# | 1.8.x |
| **Collections** | Native containers | 2.4.x |
| **Mathematics** | SIMD math library | 1.3.x |
| **Jobs** | Multi-threaded job system | Built-in |

### DOTS vs MonoBehaviour

| Aspect | DOTS (ISystem) | MonoBehaviour |
|--------|----------------|---------------|
| **Use For** | Game logic, simulation, AI | UI, camera, input |
| **Performance** | Burst-compiled, cache-friendly | Standard C# |
| **Data Layout** | Struct of Arrays (SoA) | Array of Structs (AoS) |
| **Threading** | Job-based parallelism | Main thread |
| **Memory** | Chunk-based, contiguous | Scattered heap |

**Our Rule**: All game systems use DOTS. MonoBehaviours only for Unity services (UI, Input, Camera).

---

## Component Hierarchy

Components are pure data structs implementing `IComponentData`. Located in `Assets/Scripts/Components/`.

### Directory Structure

```
Assets/Scripts/Components/
+-- Core/
|   +-- PlayerTag.cs           # Tag for player entity
|   +-- Transform.cs           # Position, rotation, scale
|   +-- WorldObjectTags.cs     # NPCTag, EnemyTag, etc.
|
+-- Combat/
|   +-- CombatComponents.cs    # Health, DamageEvent, Hitbox
|   +-- CombatLogicComponents.cs # CombatStats, AttackData
|   +-- ArenaComponents.cs     # Arena bounds, hazards
|
+-- Stats/
|   +-- RPGStats.cs            # Structure, Ignition, Logic, Flow
|
+-- Faction/
|   +-- Reputation.cs          # Kurenai/Azure reputation values
|
+-- AI/
|   +-- ThreatComponents.cs    # Threat table, aggro
|   +-- SwarmComponents.cs     # Group behavior
|   +-- PerceptionComponents.cs # Vision, hearing
|
+-- Abilities/
|   +-- AbilityComponents.cs   # Cooldowns, effects
|
+-- Navigation/
|   +-- NavigationComponents.cs # Pathfinding, waypoints
|
+-- Equipment/
|   +-- EquipmentComponents.cs # Equipped items, slots
|
+-- Dialogue/
|   +-- DialogueComponents.cs  # Conversation state
|   +-- AlignmentGateComponents.cs # Content gates
|
+-- World/
|   +-- WeatherComponents.cs   # Rain, wind, temperature
|   +-- SeedComponents.cs      # RNG seeds for procedural gen
|   +-- WaterComponents.cs     # Flood levels, currents
|   +-- TerritoryComponents.cs # Zone ownership
|
+-- Quest/
|   +-- QuestComponents.cs     # Objectives, progress
|
+-- Save/
    +-- SaveComponents.cs      # Serialization markers
```

### Component Pattern

```csharp
using Unity.Entities;
using Unity.Mathematics;

namespace NeoTokyo.Components.Combat
{
    /// <summary>
    /// Health pool for damageable entities.
    /// </summary>
    public struct Health : IComponentData
    {
        public int Current;
        public int Max;

        public bool IsDead => Current <= 0;
        public float Ratio => Max > 0 ? (float)Current / Max : 0f;
    }

    /// <summary>
    /// Damage event buffer element - consumed by CombatSystem.
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

### Tag Components

Tag components are empty structs used for filtering:

```csharp
public struct PlayerTag : IComponentData { }
public struct EnemyTag : IComponentData { }
public struct NPCTag : IComponentData { }
public struct DeadTag : IComponentData { }
```

---

## System Architecture

Systems implement `ISystem` and process entities with specific component queries. Located in `Assets/Scripts/Systems/`.

### System Groups and Update Order

```
SimulationSystemGroup (default)
|
+-- [Combat Systems]
|   +-- HitDetectionSystem      # Detect hitbox overlaps
|   +-- CombatSystem            # Apply damage, death
|   +-- BreakSystem             # Stability/break mechanics
|   +-- HazardSystem            # Environmental damage
|   +-- ArenaSystem             # Combat zone management
|
+-- [AI Systems]
|   +-- AIStateMachineSystem    # State transitions
|   +-- ThreatSystem            # Aggro/threat tables
|   +-- SteeringSystem          # Movement behaviors
|   +-- CrowdSystem             # Group behaviors
|   +-- EnemyAISystem           # Enemy decision-making
|   +-- SwarmCoordinationSystem # Swarm tactics
|   +-- TentacleSwarmSystem     # Boss mechanics
|
+-- [Progression Systems]
|   +-- ReputationSystem        # Faction reputation
|   +-- ProgressionSystem       # XP/leveling
|   +-- StatAllocationSystem    # Stat point spending
|   +-- AlignmentGateSystem     # Content unlocks
|   +-- AlignmentBonusSystem    # Alignment effects
|
+-- [World Systems]
|   +-- HexGridSystem           # Terrain grid
|   +-- StageSystem             # Scene management
|   +-- ManifestSpawnerSystem   # Entity instantiation
|   +-- WeatherSystem           # Dynamic weather
|   +-- WaterSystem             # Flood mechanics
|   +-- TerritorySystem         # Zone control
|   +-- ProceduralGenerationSystem # Runtime generation
|   +-- BoatSystem              # Water navigation
|
+-- [Other Systems]
    +-- AbilitySystem           # Cooldowns, activation
    +-- NavigationSystem        # Pathfinding
    +-- EquipmentSystem         # Gear management
    +-- DialogueSystem          # Conversations
    +-- QuestSystem             # Quest tracking
    +-- SaveSystem              # Persistence
```

### System Pattern

```csharp
using Unity.Burst;
using Unity.Entities;
using Unity.Mathematics;
using NeoTokyo.Components.Combat;

namespace NeoTokyo.Systems.Combat
{
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]
    [UpdateAfter(typeof(HitDetectionSystem))]
    public partial struct CombatSystem : ISystem
    {
        [BurstCompile]
        public void OnCreate(ref SystemState state)
        {
            // Require components to exist before running
            state.RequireForUpdate<Health>();
            state.RequireForUpdate<EndSimulationEntityCommandBufferSystem.Singleton>();
        }

        [BurstCompile]
        public void OnUpdate(ref SystemState state)
        {
            var ecb = SystemAPI.GetSingleton<EndSimulationEntityCommandBufferSystem.Singleton>()
                .CreateCommandBuffer(state.WorldUnmanaged);

            foreach (var (health, damageBuffer, entity) in
                SystemAPI.Query<RefRW<Health>, DynamicBuffer<DamageEvent>>()
                    .WithEntityAccess())
            {
                foreach (var damage in damageBuffer)
                {
                    health.ValueRW.Current = math.max(0, health.ValueRO.Current - damage.Amount);

                    if (health.ValueRO.IsDead)
                    {
                        ecb.AddComponent<DeadTag>(entity);
                        break;
                    }
                }
                damageBuffer.Clear();
            }
        }
    }
}
```

### EntityCommandBuffer Usage

For structural changes (add/remove components, create/destroy entities):

```csharp
// Get ECB from singleton
var ecb = SystemAPI.GetSingleton<EndSimulationEntityCommandBufferSystem.Singleton>()
    .CreateCommandBuffer(state.WorldUnmanaged);

// Use ECB for structural changes
ecb.AddComponent<DeadTag>(entity);
ecb.RemoveComponent<ActiveTag>(entity);
ecb.DestroyEntity(entity);
```

---

## Authoring Pattern

Authoring components convert GameObject data to ECS entities during baking.

### Location

`Assets/Scripts/Authoring/`

### Example

```csharp
using Unity.Entities;
using UnityEngine;
using NeoTokyo.Components.Core;
using NeoTokyo.Components.Combat;
using NeoTokyo.Components.Stats;

namespace NeoTokyo.Authoring
{
    public class PlayerAuthoring : MonoBehaviour
    {
        [Header("Stats")]
        public int structure = 10;
        public int ignition = 10;
        public int logic = 10;
        public int flow = 10;

        [Header("Combat")]
        public int maxHealth = 100;

        class Baker : Baker<PlayerAuthoring>
        {
            public override void Bake(PlayerAuthoring authoring)
            {
                var entity = GetEntity(TransformUsageFlags.Dynamic);

                AddComponent(entity, new PlayerTag());

                AddComponent(entity, new Health
                {
                    Current = authoring.maxHealth,
                    Max = authoring.maxHealth
                });

                AddComponent(entity, new RPGStats
                {
                    Structure = authoring.structure,
                    Ignition = authoring.ignition,
                    Logic = authoring.logic,
                    Flow = authoring.flow
                });

                AddBuffer<DamageEvent>(entity);
            }
        }
    }
}
```

### Authoring Files

| File | Purpose |
|------|---------|
| `PlayerAuthoring.cs` | Player entity setup |
| `EnemyAuthoring.cs` | Enemy entity with AI |
| `NPCAuthoring.cs` | Non-combat NPCs |
| `HexTileAuthoring.cs` | Terrain tiles |
| `AbilityAuthoring.cs` | Ability definitions |
| `CrowdMemberAuthoring.cs` | Crowd NPCs |

---

## Manifest Bridge

TypeScript generates JSON manifests at build time. Unity consumes them via `ManifestLoader`.

### Flow

```
TypeScript (dev-tools/)          Unity (Assets/)
       |                              |
       v                              |
  content-gen CLI                     |
       |                              |
       v                              v
  shared-assets/             StreamingAssets/
   manifests/                  manifests/
       |                              |
       +--------> Copy at Build ----->+
                                      |
                                      v
                              ManifestLoader.Load<T>()
                                      |
                                      v
                              ManifestSpawnerSystem
```

### Manifest Schema Example

```json
{
  "version": "2.0",
  "seed": "flooded-tokyo-2026",
  "territories": [
    {
      "id": "kurenai-academy",
      "type": "academy",
      "faction": "Kurenai",
      "bounds": { "min": [0, 0], "max": [100, 100] },
      "tiles": [
        { "hex": { "q": 0, "r": 0 }, "type": "platform", "elevation": 4 }
      ],
      "entities": [
        { "type": "npc", "id": "sensei-honda", "position": [10, 4, 20] }
      ]
    }
  ]
}
```

### ManifestLoader

```csharp
// Assets/Scripts/Utilities/ManifestLoader.cs
public static class ManifestLoader
{
    public static T Load<T>(string fileName) where T : class
    {
        string path = Path.Combine(Application.streamingAssetsPath, "manifests", fileName);
        string json = File.ReadAllText(path);
        return JsonUtility.FromJson<T>(json);
    }
}
```

### Schema Definitions

Located in `Assets/Scripts/Data/ManifestSchemas.cs`:

```csharp
[Serializable]
public class WorldManifest
{
    public string version;
    public string seed;
    public TerritoryDefinition[] territories;
}

[Serializable]
public class TerritoryDefinition
{
    public string id;
    public string type;
    public string faction;
    public BoundsDefinition bounds;
    public TileDefinition[] tiles;
    public EntityDefinition[] entities;
}
```

---

## Mobile Performance Guidelines

**Target**: Pixel 8a at 60 FPS

### Memory Budget

| Category | Budget |
|----------|--------|
| Total Application | < 200 MB |
| Entity Count | < 10,000 active |
| Draw Calls | < 100 per frame |
| Texture Memory | < 64 MB |

### Optimization Techniques

1. **Burst Compile Everything**
   ```csharp
   [BurstCompile]
   public partial struct MySystem : ISystem
   ```

2. **Use Native Containers**
   ```csharp
   NativeArray<float3> positions = new NativeArray<float3>(count, Allocator.TempJob);
   ```

3. **Chunk Iteration**
   ```csharp
   foreach (var (health, position) in SystemAPI.Query<RefRW<Health>, RefRO<LocalTransform>>())
   ```

4. **Job System for Heavy Work**
   ```csharp
   [BurstCompile]
   struct ProcessJob : IJobChunk { }
   ```

5. **LOD and Culling**
   - Use Unity LOD Groups on prefabs
   - Enable occlusion culling in URP

### Performance Profiling

```bash
# Build with deep profiling
Unity -batchmode -projectPath . -buildTarget Android -executeMethod BuildScript.ProfileBuild

# Run profiler
Unity -batchmode -projectPath . -profiler-enable
```

---

## Testing Strategy

### Test Types

| Type | Location | Purpose | Speed |
|------|----------|---------|-------|
| EditMode | `Tests/EditMode/` | Unit tests, component logic | Fast |
| PlayMode | `Tests/PlayMode/` | Integration, system interactions | Medium |
| Graphics | `Tests/Graphics/` | Visual regression | Slow |

### Running Tests

```bash
# EditMode tests (fast, no scene)
./scripts/run-tests.sh editmode

# PlayMode tests (requires scene loading)
./scripts/run-tests.sh playmode

# Graphics tests (visual regression)
./scripts/run-tests.sh graphics

# All tests
./scripts/run-tests.sh all
```

### Test Pattern

```csharp
using NUnit.Framework;
using Unity.Entities;
using Unity.Mathematics;
using NeoTokyo.Components.Combat;

namespace NeoTokyo.Tests.EditMode
{
    [TestFixture]
    public class CombatSystemTests
    {
        [Test]
        public void Health_IsDead_ReturnsTrueWhenZero()
        {
            var health = new Health { Current = 0, Max = 100 };
            Assert.IsTrue(health.IsDead);
        }

        [Test]
        public void CombatStats_FromRPGStats_CalculatesCorrectly()
        {
            var stats = CombatStats.FromRPGStats(10, 30, 10);
            Assert.AreEqual(25f, stats.MeleeAttackPower);
        }
    }
}
```

### Test Files

| File | Tests |
|------|-------|
| `CombatSystemTests.cs` | Health, damage, hitbox math |
| `ReputationSystemTests.cs` | Faction reputation changes |
| `AbilitySystemTests.cs` | Cooldowns, activation |
| `NavigationSystemTests.cs` | Pathfinding logic |
| `ProgressionSystemTests.cs` | XP, leveling |
| `AISystemTests.cs` | State machines, threat |
| `StageSystemTests.cs` | Scene transitions |
| `SaveSystemTests.cs` | Serialization |

### PlayMode Tests

| File | Tests |
|------|-------|
| `PlayerSpawnTests.cs` | Entity creation |
| `CombatIntegrationTests.cs` | Full combat flow |
| `MovementTests.cs` | Character movement |
| `ReputationIntegrationTests.cs` | Reputation flow |
| `SaveLoadTests.cs` | Persistence round-trip |

---

## CI/CD Integration

### GitHub Actions Workflow

Located at `.github/workflows/unity-tests.yml`:

```yaml
jobs:
  test-editmode:
    runs-on: ubuntu-latest
    steps:
      - uses: game-ci/unity-test-runner@v4
        with:
          unityVersion: 6000.3.5f1
          testMode: EditMode
          coverageOptions: 'generateHtmlReport;assemblyFilters:+NeoTokyo.*'

  test-playmode:
    runs-on: ubuntu-latest
    steps:
      - uses: game-ci/unity-test-runner@v4
        with:
          unityVersion: 6000.3.5f1
          testMode: PlayMode
```

### Required Secrets

| Secret | Purpose |
|--------|---------|
| `UNITY_LICENSE` | Unity license file (base64) |
| `GITHUB_TOKEN` | Automatic, for PR checks |

---

## Common Patterns

### Creating a New System

1. Create component(s) in `Assets/Scripts/Components/<Domain>/`
2. Create system in `Assets/Scripts/Systems/<Domain>/`
3. Add `[BurstCompile]` attribute
4. Specify update group with `[UpdateInGroup]`
5. Create tests in `Tests/EditMode/`

### Adding Entity Spawning

1. Create authoring component in `Assets/Scripts/Authoring/`
2. Create prefab with authoring MonoBehaviour
3. Use subscene or ManifestSpawnerSystem

### Modifying Manifests

1. Update TypeScript types in `dev-tools/types/`
2. Update C# schema in `Assets/Scripts/Data/ManifestSchemas.cs`
3. Regenerate with `pnpm --filter content-gen generate`

---

## Quick Reference

### Key Namespaces

```csharp
using Unity.Entities;
using Unity.Burst;
using Unity.Mathematics;
using Unity.Collections;
using NeoTokyo.Components.*;
using NeoTokyo.Systems.*;
```

### Common Queries

```csharp
// All players
SystemAPI.Query<RefRO<Health>>().WithAll<PlayerTag>()

// All enemies with health > 0
SystemAPI.Query<RefRW<Health>>().WithAll<EnemyTag>().WithNone<DeadTag>()

// With entity access
SystemAPI.Query<RefRW<Health>>().WithEntityAccess()
```

### Command Buffer Singletons

```csharp
// End of frame (most common)
EndSimulationEntityCommandBufferSystem.Singleton

// Start of frame
BeginSimulationEntityCommandBufferSystem.Singleton
```

---

Last Updated: 2026-01-25
