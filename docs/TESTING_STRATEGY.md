# Testing Strategy

## Overview

We employ a rigorous testing strategy using Unity Test Framework to ensure stability and correctness of the Unity 6 DOTS codebase.

## Test Categories

### 1. EditMode Tests (Unit Tests)

**Scope**: Pure logic, components, utilities, and systems that can run without Play mode.

**Location**: `Assets/Tests/EditMode/`

**Characteristics**:
- Fast execution (no scene loading)
- No MonoBehaviour lifecycle
- Ideal for testing ECS components and pure C# logic

**Examples**:
- Component data validation
- Math utilities
- Damage calculation formulas
- Quest grammar parsing
- Serialization/deserialization

```csharp
// Tests/EditMode/CombatCalculationTests.cs
using NUnit.Framework;
using NeoTokyo.Core.Components;
using Unity.Mathematics;

[TestFixture]
public class CombatCalculationTests
{
    [Test]
    public void DamageFormula_WithValidStats_ReturnsExpectedDamage()
    {
        // Arrange
        int attackerIgnition = 20;
        int defenderStructure = 10;

        // Act
        // Damage = max(1, floor(Ignition * 2 - Structure * 0.5))
        int damage = math.max(1, (int)math.floor(
            attackerIgnition * 2f - defenderStructure * 0.5f));

        // Assert
        Assert.AreEqual(35, damage); // 20*2 - 10*0.5 = 40 - 5 = 35
    }

    [Test]
    public void DamageFormula_WithLowStats_ReturnsMinimumDamage()
    {
        // Arrange
        int attackerIgnition = 1;
        int defenderStructure = 100;

        // Act
        int damage = math.max(1, (int)math.floor(
            attackerIgnition * 2f - defenderStructure * 0.5f));

        // Assert
        Assert.AreEqual(1, damage); // min damage is 1
    }

    [Test]
    public void CriticalChance_WithIgnition50_Returns50Percent()
    {
        // Arrange
        int ignition = 50;

        // Act
        // Critical = min(0.5, Ignition * 0.01)
        float critChance = math.min(0.5f, ignition * 0.01f);

        // Assert
        Assert.AreEqual(0.5f, critChance);
    }
}
```

### 2. PlayMode Tests (Integration Tests)

**Scope**: Full system integration, scene loading, ECS world simulation.

**Location**: `Assets/Tests/PlayMode/`

**Characteristics**:
- Requires Unity runtime
- Can test full ECS systems
- Tests entity queries and system updates
- Supports async/await for scene loading

**Examples**:
- System update behavior
- Entity spawning
- Component interactions
- Scene transitions
- Save/load functionality

```csharp
// Tests/PlayMode/MovementSystemTests.cs
using System.Collections;
using NUnit.Framework;
using Unity.Entities;
using Unity.Mathematics;
using Unity.Transforms;
using UnityEngine.TestTools;
using NeoTokyo.Core.Components;

[TestFixture]
public class MovementSystemTests
{
    private World _testWorld;
    private EntityManager _entityManager;

    [SetUp]
    public void SetUp()
    {
        _testWorld = new World("TestWorld");
        _entityManager = _testWorld.EntityManager;
    }

    [TearDown]
    public void TearDown()
    {
        _testWorld?.Dispose();
    }

    [UnityTest]
    public IEnumerator MovementSystem_WithVelocity_UpdatesPosition()
    {
        // Arrange
        var entity = _entityManager.CreateEntity();
        _entityManager.AddComponentData(entity, LocalTransform.FromPosition(float3.zero));
        _entityManager.AddComponentData(entity, new VelocityComponent { Value = new float3(1, 0, 0) });

        // Act - Simulate one frame
        _testWorld.Update();
        yield return null;

        // Assert
        var transform = _entityManager.GetComponentData<LocalTransform>(entity);
        Assert.Greater(transform.Position.x, 0f);
    }

    [UnityTest]
    public IEnumerator CombatSystem_WhenDamageTaken_ReducesHP()
    {
        // Arrange
        var entity = _entityManager.CreateEntity();
        _entityManager.AddComponentData(entity, new CombatStatsComponent
        {
            CurrentHP = 100,
            MaxHP = 100,
            Structure = 10
        });
        _entityManager.AddComponentData(entity, new DamageEventComponent
        {
            Amount = 25
        });

        // Act
        _testWorld.Update();
        yield return null;

        // Assert
        var stats = _entityManager.GetComponentData<CombatStatsComponent>(entity);
        Assert.AreEqual(75, stats.CurrentHP);
    }
}
```

### 3. Performance Tests

**Scope**: System performance benchmarks, memory allocation tracking.

**Location**: `Assets/Tests/Performance/`

**Characteristics**:
- Uses Unity.PerformanceTesting package
- Measures frame time, allocations, entity counts
- Establishes performance baselines

```csharp
// Tests/Performance/SystemPerformanceTests.cs
using NUnit.Framework;
using Unity.PerformanceTesting;
using Unity.Entities;
using NeoTokyo.Core.Components;

[TestFixture]
public class SystemPerformanceTests
{
    [Test, Performance]
    public void MovementSystem_With1000Entities_MeetsPerformanceTarget()
    {
        var world = World.DefaultGameObjectInjectionWorld;
        var entityManager = world.EntityManager;

        // Create 1000 entities with movement components
        var archetype = entityManager.CreateArchetype(
            typeof(LocalTransform),
            typeof(VelocityComponent)
        );

        using var entities = entityManager.CreateEntity(archetype, 1000, Allocator.Temp);

        Measure.Method(() =>
        {
            world.Update();
        })
        .WarmupCount(5)
        .MeasurementCount(20)
        .Run();
    }
}
```

## Test File Organization

```
Assets/
└── Tests/
    ├── EditMode/
    │   ├── NeoTokyo.Tests.EditMode.asmdef
    │   ├── Components/
    │   │   ├── CombatStatsComponentTests.cs
    │   │   ├── AlignmentComponentTests.cs
    │   │   └── QuestComponentTests.cs
    │   ├── Utilities/
    │   │   ├── DamageCalculatorTests.cs
    │   │   ├── SeededRandomTests.cs
    │   │   └── QuestGrammarTests.cs
    │   └── Data/
    │       ├── JsonParsingTests.cs
    │       └── SaveDataValidationTests.cs
    │
    ├── PlayMode/
    │   ├── NeoTokyo.Tests.PlayMode.asmdef
    │   ├── Systems/
    │   │   ├── MovementSystemTests.cs
    │   │   ├── CombatSystemTests.cs
    │   │   ├── QuestSystemTests.cs
    │   │   └── AISystemTests.cs
    │   ├── Integration/
    │   │   ├── GameFlowTests.cs
    │   │   ├── SaveLoadTests.cs
    │   │   └── SceneTransitionTests.cs
    │   └── Scenes/
    │       └── TestScene.unity
    │
    └── Performance/
        ├── NeoTokyo.Tests.Performance.asmdef
        ├── SystemPerformanceTests.cs
        └── EntityCountStressTests.cs
```

## Assembly Definition (EditMode)

```json
// Assets/Tests/EditMode/NeoTokyo.Tests.EditMode.asmdef
{
    "name": "NeoTokyo.Tests.EditMode",
    "rootNamespace": "NeoTokyo.Tests.EditMode",
    "references": [
        "NeoTokyo.Core",
        "NeoTokyo.Systems",
        "Unity.Entities",
        "Unity.Mathematics",
        "Unity.Burst",
        "Unity.Collections"
    ],
    "includePlatforms": [
        "Editor"
    ],
    "excludePlatforms": [],
    "allowUnsafeCode": true,
    "overrideReferences": true,
    "precompiledReferences": [
        "nunit.framework.dll"
    ],
    "defineConstraints": [
        "UNITY_INCLUDE_TESTS"
    ]
}
```

## Assembly Definition (PlayMode)

```json
// Assets/Tests/PlayMode/NeoTokyo.Tests.PlayMode.asmdef
{
    "name": "NeoTokyo.Tests.PlayMode",
    "rootNamespace": "NeoTokyo.Tests.PlayMode",
    "references": [
        "NeoTokyo.Core",
        "NeoTokyo.Systems",
        "NeoTokyo.Authoring",
        "Unity.Entities",
        "Unity.Mathematics",
        "Unity.Burst",
        "Unity.Collections",
        "Unity.Transforms"
    ],
    "includePlatforms": [],
    "excludePlatforms": [],
    "allowUnsafeCode": true,
    "overrideReferences": true,
    "precompiledReferences": [
        "nunit.framework.dll"
    ],
    "defineConstraints": [
        "UNITY_INCLUDE_TESTS"
    ]
}
```

## Running Tests Locally

### Unity Editor

1. Open Window > General > Test Runner
2. Select EditMode or PlayMode tab
3. Click "Run All" or select specific tests

### Command Line

```bash
# Run EditMode tests
Unity -batchmode -projectPath . -runTests -testPlatform EditMode -testResults ./TestResults/editmode-results.xml

# Run PlayMode tests
Unity -batchmode -projectPath . -runTests -testPlatform PlayMode -testResults ./TestResults/playmode-results.xml

# Run all tests
Unity -batchmode -projectPath . -runTests -testResults ./TestResults/all-results.xml
```

## CI/CD with GameCI

### GitHub Actions Workflow

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  test:
    name: Run Tests
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          lfs: true

      - name: Cache Library
        uses: actions/cache@v4
        with:
          path: Library
          key: Library-${{ hashFiles('Assets/**', 'Packages/**', 'ProjectSettings/**') }}
          restore-keys: |
            Library-

      - name: Run EditMode Tests
        uses: game-ci/unity-test-runner@v4
        env:
          UNITY_LICENSE: ${{ secrets.UNITY_LICENSE }}
        with:
          testMode: EditMode
          artifactsPath: TestResults/EditMode
          checkName: EditMode Test Results

      - name: Run PlayMode Tests
        uses: game-ci/unity-test-runner@v4
        env:
          UNITY_LICENSE: ${{ secrets.UNITY_LICENSE }}
        with:
          testMode: PlayMode
          artifactsPath: TestResults/PlayMode
          checkName: PlayMode Test Results

      - name: Upload Test Results
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: Test Results
          path: TestResults
```

### Build Workflow

```yaml
# .github/workflows/build.yml
name: Build

on:
  push:
    tags:
      - 'v*'

jobs:
  build-android:
    name: Build Android
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          lfs: true

      - name: Build
        uses: game-ci/unity-builder@v4
        env:
          UNITY_LICENSE: ${{ secrets.UNITY_LICENSE }}
        with:
          targetPlatform: Android
          androidAppBundle: true
          androidKeystoreName: keystore.jks
          androidKeystoreBase64: ${{ secrets.ANDROID_KEYSTORE_BASE64 }}
          androidKeystorePass: ${{ secrets.ANDROID_KEYSTORE_PASS }}
          androidKeyaliasName: ${{ secrets.ANDROID_KEYALIAS_NAME }}
          androidKeyaliasPass: ${{ secrets.ANDROID_KEYALIAS_PASS }}

      - name: Upload Build
        uses: actions/upload-artifact@v4
        with:
          name: Android Build
          path: build/Android

  build-ios:
    name: Build iOS
    runs-on: macos-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
        with:
          lfs: true

      - name: Build
        uses: game-ci/unity-builder@v4
        env:
          UNITY_LICENSE: ${{ secrets.UNITY_LICENSE }}
        with:
          targetPlatform: iOS

      - name: Upload Build
        uses: actions/upload-artifact@v4
        with:
          name: iOS Build
          path: build/iOS
```

## Coverage Targets

| Category | Target | Measurement |
|----------|--------|-------------|
| Core Components | 90%+ | Line coverage |
| Systems | 80%+ | Line coverage |
| Utilities | 95%+ | Line coverage |
| Integration | Key flows | Scenario coverage |
| Performance | Baselines | Frame time, allocations |

## Test Requirements

### Before Merge

1. All EditMode tests pass
2. All PlayMode tests pass
3. No new compiler warnings
4. Code coverage meets targets for changed files

### Before Release

1. Full test suite passes
2. Performance benchmarks meet targets
3. Manual QA verification on target devices
4. Save/load compatibility verified

## Manual Verification Checklist

For major features, supplement automated tests with manual verification:

- [ ] Game launches without errors
- [ ] Menu navigation works
- [ ] Player movement is smooth
- [ ] Combat system functions correctly
- [ ] Quest tracking updates properly
- [ ] Save/load preserves all state
- [ ] Performance is acceptable on target devices (60 FPS)
- [ ] Touch controls respond correctly (mobile)

---

## Deprecated Testing (Pre-Unity 6)

The following testing tools from the TypeScript/Babylon.js version are no longer used:

| Old Tool | Replacement |
|----------|-------------|
| Vitest | Unity Test Framework (EditMode) |
| React Testing Library | UI Toolkit testing |
| Playwright | Unity Test Framework (PlayMode) |
| pnpm test | Unity Test Runner |

---

*Comprehensive testing with Unity Test Framework and GameCI for reliable releases.*
