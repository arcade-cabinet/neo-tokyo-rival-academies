# Unity 6 Migration Plan

> **Branch**: `feat/unity-6-migration`
> **Status**: IN PROGRESS
> **Created**: 2026-01-25
> **Last Updated**: 2026-01-25

## Executive Summary

This document outlines the migration strategy from Babylon.js/Reactylon to Unity 6 for the game runtime while preserving the TypeScript-based development tools layer.

### Architecture Vision

```
┌─────────────────────────────────────────────────────────────────────┐
│                    HYBRID ARCHITECTURE                               │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌───────────────────────────────┐  ┌───────────────────────────┐  │
│  │     TYPESCRIPT DEV LAYER      │  │      UNITY 6 RUNTIME       │  │
│  │         (Preserved)           │  │       (New Engine)          │  │
│  ├───────────────────────────────┤  ├───────────────────────────┤  │
│  │ • content-gen (Meshy/Gemini)  │  │ • Game loop & rendering   │  │
│  │ • world-gen (Proc-gen DDL)    │─▶│ • ECS (DOTS Entities)     │  │
│  │ • e2e tests (Playwright)      │  │ • Physics (Havok)         │  │
│  │ • Build scripts               │  │ • Navigation (NavMesh)    │  │
│  │ • Asset pipeline CLI          │  │ • Combat systems          │  │
│  └───────────────────────────────┘  └───────────────────────────┘  │
│                │                                ▲                    │
│                │     JSON MANIFESTS             │                    │
│                └────────────────────────────────┘                    │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

## Migration Scope

### KEEP in TypeScript (dev-tools/)

| Package | Purpose | Rationale |
|---------|---------|-----------|
| `dev-tools/content-gen` | GenAI CLI (Meshy, Gemini) | Node.js APIs, build-time only |
| `dev-tools/e2e` | Playwright visual testing | Browser automation |
| `dev-tools/types` | Shared TypeScript types | Generate C# equivalents |
| `dev-tools/shared-assets` | Textures, asset manifests | Unity import pipeline |
| `dev-tools/config` | Shared constants | Generate Unity ScriptableObjects |

### REFERENCE (Old TypeScript Runtime)

| Location | Purpose |
|----------|---------|
| `_reference/typescript-runtime/` | Original Babylon.js runtime for migration reference |

### MIGRATE to Unity 6 (Repository ROOT)

| TypeScript Source | Unity Equivalent |
|-------------------|------------------|
| `_reference/typescript-runtime/game/src/state/ecs.ts` | Unity DOTS `IComponentData` |
| `_reference/typescript-runtime/game/src/systems/*.ts` | Unity DOTS `ISystem` |
| `_reference/typescript-runtime/core/src/state/*Store.ts` | Unity ScriptableObject singletons |
| `_reference/typescript-runtime/diorama/src/components/*` | Unity Prefabs + Addressables |
| `_reference/typescript-runtime/game/src/scenes/*` | Unity Scenes |

## Headless Package Management

Unity packages are managed headlessly using `openupm-cli` (like pnpm for Unity):

```bash
# Install openupm-cli (requires Node.js 18+)
npm install -g openupm-cli

# Unity project is at repository ROOT
# Add packages from Unity Registry
openupm add com.unity.entities
openupm add com.unity.render-pipelines.universal
openupm add com.unity.test-framework
openupm add com.unity.ai.navigation

# Search for packages
openupm search <keyword>

# Remove a package
openupm remove <package-name>
```

### Resolving Packages (Headless)

After modifying `Packages/manifest.json`, resolve packages without opening the Editor:

```bash
# macOS (Unity project at ROOT)
/Applications/Unity/Hub/Editor/6000.3.5f1/Unity.app/Contents/MacOS/Unity \
  -batchmode -quit -projectPath . -logFile -

# Or use the helper script
./scripts/resolve-packages.sh

# Linux (CI)
xvfb-run unity-editor \
  -batchmode -quit -projectPath . -logFile -
```

### Unity 6.3 Signature Warnings

Unity 6.3+ validates package signatures. If you see "invalid signature" warnings:
1. Run batch mode resolution (above) - auto-resolves to signed versions
2. Or delete `Library/` folder and reopen project
3. Or manually update in Package Manager UI

## Unity 6 Project Structure

Unity project is at repository ROOT (not in a subdirectory):

```
neo-tokyo-rival-academies/  (REPOSITORY ROOT = Unity Project)
├── Assets/
│   ├── _Generated/           # Output from TypeScript tools
│   │   ├── Manifests/        # JSON world definitions
│   │   ├── Textures/         # Imported from shared-assets
│   │   └── Models/           # Meshy-generated GLBs
│   ├── Scripts/
│   │   ├── Components/       # DOTS IComponentData
│   │   │   ├── Core/         # Position, Velocity, Health, etc.
│   │   │   ├── Combat/       # BreakState, InvincibilityState
│   │   │   ├── Faction/      # Reputation, Alignment
│   │   │   └── AI/           # Navigation, Perception
│   │   ├── Systems/          # DOTS ISystem
│   │   │   ├── Combat/       # CombatSystem, HitDetectionSystem
│   │   │   ├── AI/           # AIStateMachineSystem, NavigationSystem
│   │   │   ├── Progression/  # ProgressionSystem, ReputationSystem
│   │   │   └── World/        # StageSystem, HexGridSystem
│   │   ├── MonoBehaviours/   # Traditional Unity scripts
│   │   │   ├── UI/           # HUD, Menus, Dialogue
│   │   │   └── Camera/       # Isometric camera controller
│   │   ├── Authoring/        # Baker components for DOTS
│   │   └── Utilities/        # Helpers, extensions
│   ├── Prefabs/
│   │   ├── Characters/
│   │   ├── World/            # Tiles, bridges, shelters
│   │   └── VFX/
│   ├── Scenes/
│   │   ├── Bootstrap.unity   # Entry point
│   │   ├── MainMenu.unity
│   │   └── GameWorld.unity   # Subscene-based territory loading
│   ├── Settings/
│   │   ├── Rendering/        # URP/HDRP profiles
│   │   └── Physics/          # Havok settings
│   └── Resources/
│       └── GameConfig.asset  # Runtime configuration
├── Packages/
│   └── manifest.json         # Unity Package Manager deps
├── ProjectSettings/
├── Tests/
│   ├── EditMode/             # Logic tests (no rendering)
│   ├── PlayMode/             # Integration tests
│   └── Graphics/             # Visual regression tests
└── .github/
    └── workflows/
        └── unity-ci.yml      # GameCI integration
```

## Interface Contract: TypeScript ↔ Unity

### Manifest Schema (JSON)

TypeScript `world-gen` outputs JSON manifests consumed by Unity:

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
        { "type": "shelter", "position": [10, 4, 20], "variant": "tarp_lean_to" }
      ]
    }
  ]
}
```

### Asset Pipeline

```
1. TypeScript: content-gen generates prompts
2. TypeScript: Meshy API creates GLB models
3. TypeScript: Download to packages/shared-assets/models/
4. Unity: Import via custom AssetPostprocessor
5. Unity: Auto-generate prefabs with LOD groups
6. Unity: Addressable asset addressing
```

## Unity 6 Test-Driven Development (Without Editor)

### CLI Testing Pipeline

Based on [Unity Test Framework documentation](https://docs.unity3d.com/6000.3/Documentation/Manual/test-framework/run-tests-from-command-line.html):

```bash
# EditMode tests (pure logic, no rendering)
Unity -batchmode -projectPath . -runTests \
  -testPlatform EditMode \
  -testResults ./TestResults/editmode.xml

# PlayMode tests (with mocked rendering)
Unity -batchmode -projectPath . -runTests \
  -testPlatform PlayMode \
  -testResults ./TestResults/playmode.xml

# Graphics tests (visual regression)
Unity -batchmode -projectPath . -runTests \
  -testPlatform PlayMode \
  -testCategory "Graphics" \
  -testResults ./TestResults/graphics.xml
```

### Graphics Test Framework Setup

Using [com.unity.testframework.graphics](https://github.com/Unity-Technologies/com.unity.testframework.graphics):

```csharp
[UnityTest]
[PrebuildSetup("SetupGraphicsTestCases")]
[UseGraphicsTestCases]
public IEnumerator GraphicsTest(GraphicsTestCase testCase)
{
    SceneManager.LoadScene(testCase.ScenePath);
    yield return null;

    ImageAssert.AreEqual(
        testCase.ReferenceImage,
        Camera.main,
        new ImageComparisonSettings {
            PerPixelThreshold = 0.01f,
            AverageErrorThreshold = 0.005f
        }
    );
}
```

### CI/CD with GameCI

Using [game-ci/unity-actions](https://github.com/game-ci/unity-actions):

```yaml
# .github/workflows/unity-ci.yml
name: Unity CI

on:
  push:
    paths:
      - 'packages/game-unity/**'
  pull_request:
    paths:
      - 'packages/game-unity/**'

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          lfs: true

      - uses: game-ci/unity-test-runner@v4
        with:
          projectPath: packages/game-unity
          testMode: all
          artifactsPath: TestResults
          githubToken: ${{ secrets.GITHUB_TOKEN }}
          unityVersion: 6000.3.0f1

      - uses: actions/upload-artifact@v4
        with:
          name: Test Results
          path: TestResults
```

## ECS Component Migration Guide

### TypeScript → Unity DOTS

**TypeScript (Miniplex):**
```typescript
// packages/game/src/state/ecs.ts
export type ECSEntity = {
  id?: string;
  isPlayer?: boolean;
  position?: Vector3;
  velocity?: Vector3;
  health?: number;
  faction?: Faction;
  stats?: RPGStats;
  reputation?: ReputationState;
};
```

**Unity (DOTS):**
```csharp
// Assets/Scripts/Components/Core/PlayerTag.cs
public struct PlayerTag : IComponentData { }

// Assets/Scripts/Components/Core/Position.cs
public struct Position : IComponentData
{
    public float3 Value;
}

// Assets/Scripts/Components/Core/Velocity.cs
public struct Velocity : IComponentData
{
    public float3 Value;
}

// Assets/Scripts/Components/Core/Health.cs
public struct Health : IComponentData
{
    public int Current;
    public int Max;
}

// Assets/Scripts/Components/Faction/FactionMembership.cs
public enum FactionType { Kurenai, Azure, Syndicate, Neutral }

public struct FactionMembership : IComponentData
{
    public FactionType Value;
}

// Assets/Scripts/Components/Stats/RPGStats.cs
public struct RPGStats : IComponentData
{
    public int Structure;  // HP, Defense
    public int Ignition;   // Attack, Crits
    public int Logic;      // Skills, Specials
    public int Flow;       // Speed, Evasion
}

// Assets/Scripts/Components/Faction/Reputation.cs
public struct Reputation : IComponentData
{
    public int Kurenai;  // 0-100
    public int Azure;    // 0-100
}
```

### System Migration Example

**TypeScript:**
```typescript
// packages/game/src/systems/ReputationSystem.ts
export function applyReputationChange(
  reputation: ReputationState,
  change: ReputationChange
): ReputationState {
  const newValue = reputation[change.faction] + change.amount;
  const clampedValue = Math.max(0, Math.min(100, newValue));
  return { ...reputation, [change.faction]: clampedValue };
}
```

**Unity (DOTS):**
```csharp
// Assets/Scripts/Systems/Progression/ReputationSystem.cs
[BurstCompile]
public partial struct ReputationSystem : ISystem
{
    [BurstCompile]
    public void OnUpdate(ref SystemState state)
    {
        foreach (var (reputation, changes) in
            SystemAPI.Query<RefRW<Reputation>, DynamicBuffer<ReputationChangeElement>>())
        {
            foreach (var change in changes)
            {
                switch (change.Faction)
                {
                    case FactionType.Kurenai:
                        reputation.ValueRW.Kurenai =
                            math.clamp(reputation.ValueRO.Kurenai + change.Amount, 0, 100);
                        break;
                    case FactionType.Azure:
                        reputation.ValueRW.Azure =
                            math.clamp(reputation.ValueRO.Azure + change.Amount, 0, 100);
                        break;
                }
            }
            changes.Clear();
        }
    }
}

public struct ReputationChangeElement : IBufferElementData
{
    public FactionType Faction;
    public int Amount;
    public FixedString64Bytes Reason;
}
```

## Phase Roadmap

### Phase 1: Foundation (Weeks 1-2)
- [ ] Create Unity 6 project with URP
- [ ] Setup Entities package (DOTS)
- [ ] Configure batch mode testing
- [ ] Integrate GameCI for GitHub Actions
- [ ] Port core components (Position, Velocity, Health, Stats)
- [ ] Create first EditMode test suite

### Phase 2: Systems (Weeks 3-4)
- [ ] Port ReputationSystem
- [ ] Port CombatSystem
- [ ] Port ProgressionSystem
- [ ] Port HitDetectionSystem
- [ ] Setup Graphics Test Framework
- [ ] Create reference images for visual tests

### Phase 3: World (Weeks 5-6)
- [ ] Implement hex grid system
- [ ] Create tile prefabs
- [ ] Build territory loader from JSON
- [ ] Setup Addressables for streaming
- [ ] Port Navigation (NavMesh)

### Phase 4: Integration (Weeks 7-8)
- [ ] Connect TypeScript manifest pipeline
- [ ] Import Meshy-generated assets
- [ ] Full PlayMode test coverage
- [ ] Mobile build validation (Android)
- [ ] Performance profiling

## Mobile Considerations

Target: Pixel 8a at 60 FPS (same as current Babylon.js target)

**Unity Advantages:**
- Native ARM compilation (no JavaScript overhead)
- Havok Physics (hardware-accelerated)
- Burst-compiled DOTS systems
- Better memory management

**Testing Without Device:**
```bash
# Android build with tests
Unity -batchmode -projectPath . \
  -buildTarget Android \
  -executeMethod BuildScript.BuildAndRunTests
```

## Sources

- [Unity 6 Test Framework CLI](https://docs.unity3d.com/6000.3/Documentation/Manual/test-framework/run-tests-from-command-line.html)
- [Graphics Test Framework](https://docs.unity3d.com/Packages/com.unity.testframework.graphics@8.6/manual/index.html)
- [GameCI Unity Actions](https://github.com/game-ci/unity-actions)
- [Unity 2026 Roadmap (CoreCLR)](https://digitalproduction.com/2025/11/26/unitys-2026-roadmap-coreclr-verified-packages-fewer-surprises/)
- [Unity DOTS Best Practices](https://unity.com/how-to/testing-and-quality-assurance-tips-unity-projects)
