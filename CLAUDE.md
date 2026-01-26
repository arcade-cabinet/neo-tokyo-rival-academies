# Claude AI Assistant Guidelines

Welcome, Claude! This document provides specific context and guidelines for working on the **Neo-Tokyo: Rival Academies** project.

**MIGRATION STATUS (January 2026): Unity 6 Migration COMPLETE**
The game runtime has been fully migrated from TypeScript/Babylon.js to Unity 6 DOTS. The old TypeScript runtime is archived in `_reference/` for historical reference only.

## Project Context

**Neo-Tokyo: Rival Academies** is a **3D Action JRPG** built with a **Hybrid Architecture**:

- **Unity 6 Runtime**: The game runtime lives at the repository ROOT as a Unity 6 DOTS project
- **TypeScript Dev Tools**: Build-time content generation and testing tools in `dev-tools/`

The repository root IS the Unity project. There is no nested Unity folder.

## Project Structure

```
neo-tokyo-rival-academies/           # Repository ROOT = Unity Project
+-- Assets/
|   +-- Scripts/
|   |   +-- Components/              # DOTS IComponentData structs
|   |   |   +-- Core/                # PlayerTag, Transform, WorldObjectTags
|   |   |   +-- Combat/              # CombatComponents, CombatLogicComponents, ArenaComponents
|   |   |   +-- Stats/               # RPGStats
|   |   |   +-- Faction/             # Reputation
|   |   |   +-- Abilities/           # AbilityComponents
|   |   |   +-- Navigation/          # NavigationComponents
|   |   |   +-- AI/                  # ThreatComponents, SwarmComponents, PerceptionComponents
|   |   |   +-- Equipment/           # EquipmentComponents
|   |   |   +-- Save/                # SaveComponents
|   |   |   +-- Dialogue/            # DialogueComponents, AlignmentGateComponents
|   |   |   +-- Quest/               # QuestComponents
|   |   |   +-- World/               # WeatherComponents, SeedComponents, WaterComponents, TerritoryComponents
|   |   +-- Systems/                 # DOTS ISystem implementations
|   |   |   +-- Combat/              # CombatSystem, BreakSystem, HitDetectionSystem, HazardSystem, ArenaSystem
|   |   |   +-- AI/                  # AIStateMachineSystem, ThreatSystem, CrowdSystem, SteeringSystem, EnemyAISystem, SwarmCoordinationSystem, TentacleSwarmSystem
|   |   |   +-- Progression/         # ReputationSystem, ProgressionSystem, StatAllocationSystem, AlignmentGateSystem, AlignmentBonusSystem
|   |   |   +-- World/               # HexGridSystem, StageSystem, ManifestSpawnerSystem, WeatherSystem, WaterSystem, TerritorySystem, ProceduralGenerationSystem, BoatSystem
|   |   |   +-- Abilities/           # AbilitySystem
|   |   |   +-- Navigation/          # NavigationSystem
|   |   |   +-- Equipment/           # EquipmentSystem
|   |   |   +-- Save/                # SaveSystem
|   |   |   +-- Dialogue/            # DialogueSystem
|   |   |   +-- Quest/               # QuestSystem
|   |   +-- Authoring/               # Baker components for DOTS conversion
|   |   +-- MonoBehaviours/          # Traditional Unity scripts (UI, Camera, Input)
|   |   +-- Data/                    # ManifestSchemas, TerritoryDefinitions, FactionRelationships, EquipmentDatabase
|   |   +-- Utilities/               # ManifestLoader, SeedHelpers
+-- Packages/                        # Unity Package Manager
+-- ProjectSettings/                 # Unity settings
+-- Tests/                           # Unity Test Framework
|   +-- EditMode/                    # Unit tests (no scene required)
|   +-- PlayMode/                    # Integration tests (requires scene)
|   +-- Graphics/                    # Visual regression tests
+-- dev-tools/                       # TypeScript DEV layer
|   +-- content-gen/                 # Meshy/Gemini content generation CLI
|   +-- e2e/                         # Playwright E2E tests
|   +-- shared-assets/               # Asset manifests (JSON bridge)
|   +-- types/                       # Shared TypeScript types
|   +-- config/                      # Build configuration
+-- _reference/                      # ARCHIVED: Old TypeScript runtime (DO NOT USE)
+-- docs/                            # Documentation
+-- scripts/                         # Build and test scripts
|   +-- run-tests.sh                 # Headless test runner
|   +-- resolve-packages.sh          # Package resolution script
+-- .github/workflows/               # CI/CD workflows
|   +-- unity-tests.yml              # EditMode/PlayMode/Graphics tests
|   +-- unity-build.yml              # Android/iOS builds
+-- TestResults/                     # Test output (generated)
```

## Technology Stack

### Unity 6 (Runtime Layer)

- **Engine**: Unity 6 (6000.3.5f1 LTS)
- **Architecture**: DOTS (Entities 1.3.x, Burst 1.8.x, Collections 2.4.x)
- **Rendering**: URP with custom cel-shading
- **Physics**: Unity Physics / Havok
- **Navigation**: Unity AI Navigation
- **Testing**: Unity Test Framework (EditMode + PlayMode + Graphics)
- **CI/CD**: GameCI with GitHub Actions

### TypeScript (Dev Tools Layer - Build Time Only)

- **Package Manager**: PNPM
- **Build Tools**: Vite, Biome, Vitest
- **GenAI**: Google Gemini, Meshy AI
- **Testing**: Playwright E2E

## Common Commands

### Unity Tests

```bash
# Run EditMode tests (unit tests, fast, no editor GUI)
./scripts/run-tests.sh editmode

# Run PlayMode tests (integration tests)
./scripts/run-tests.sh playmode

# Run Graphics tests (visual regression)
./scripts/run-tests.sh graphics

# Run all tests
./scripts/run-tests.sh all

# Resolve Unity packages (headless)
./scripts/resolve-packages.sh
```

### TypeScript Dev Tools

```bash
# Install dependencies
pnpm install

# Run content generation
pnpm --filter content-gen generate

# Run E2E tests
pnpm --filter e2e test

# Run TypeScript type checks
pnpm --filter types check
```

### Unity CLI (Direct)

```bash
# Run EditMode tests directly
Unity -batchmode -projectPath . -runTests -testPlatform EditMode -testResults TestResults/editmode-results.xml

# Run PlayMode tests directly
Unity -batchmode -projectPath . -runTests -testPlatform PlayMode -testResults TestResults/playmode-results.xml

# Build Android
Unity -batchmode -projectPath . -buildTarget Android -executeMethod BuildScript.Build

# Resolve packages
Unity -batchmode -quit -projectPath . -logFile -
```

## ECS Architecture

### Components (Pure Data)

Components are pure data structs implementing `IComponentData`:

```csharp
public struct Health : IComponentData
{
    public int Current;
    public int Max;
    public bool IsDead => Current <= 0;
    public float Ratio => Max > 0 ? (float)Current / Max : 0f;
}
```

### Systems (Logic)

Systems implement `ISystem` with Burst compilation:

```csharp
[BurstCompile]
[UpdateInGroup(typeof(SimulationSystemGroup))]
[UpdateAfter(typeof(HitDetectionSystem))]
public partial struct CombatSystem : ISystem
{
    [BurstCompile]
    public void OnCreate(ref SystemState state)
    {
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
            // Process damage events
        }
    }
}
```

### Authoring (GameObject to Entity)

Authoring components convert GameObjects to ECS entities during baking:

```csharp
public class PlayerAuthoring : MonoBehaviour
{
    public int maxHealth = 100;

    class Baker : Baker<PlayerAuthoring>
    {
        public override void Bake(PlayerAuthoring authoring)
        {
            var entity = GetEntity(TransformUsageFlags.Dynamic);
            AddComponent(entity, new PlayerTag());
            AddComponent(entity, new Health { Current = authoring.maxHealth, Max = authoring.maxHealth });
            AddBuffer<DamageEvent>(entity);
        }
    }
}
```

### ManifestLoader Bridge

TypeScript generates JSON manifests at build time. Unity consumes them via `ManifestLoader`:

```csharp
// Assets/Scripts/Utilities/ManifestLoader.cs
var manifest = ManifestLoader.Load<WorldManifest>("world.json");
```

Manifests are stored in `dev-tools/shared-assets/` and copied to `Assets/StreamingAssets/` during build.

## Test-First Development

Write EditMode tests before implementing systems:

```csharp
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
```

## Key File Locations

| Purpose | Location |
|---------|----------|
| Game Systems | `Assets/Scripts/Systems/` |
| ECS Components | `Assets/Scripts/Components/` |
| Authoring Components | `Assets/Scripts/Authoring/` |
| Unity Tests | `Tests/EditMode/`, `Tests/PlayMode/` |
| ManifestLoader | `Assets/Scripts/Utilities/ManifestLoader.cs` |
| Manifest Schemas | `Assets/Scripts/Data/ManifestSchemas.cs` |
| Content Generation | `dev-tools/content-gen/` |
| Asset Manifests | `dev-tools/shared-assets/` |
| Test Scripts | `scripts/run-tests.sh` |
| CI Workflows | `.github/workflows/unity-tests.yml` |

## Your Role

- **ECS Architect**: Design Unity DOTS systems in `Assets/Scripts/Systems/`
- **Component Designer**: Create `IComponentData` structs in `Assets/Scripts/Components/`
- **GenAI Integrator**: Use `dev-tools/content-gen` to generate assets via Meshy/Gemini
- **TDD Practitioner**: Write EditMode tests in `Tests/EditMode/` before implementing systems
- **Bridge Maintainer**: Keep TypeScript manifests and Unity loaders in sync

## Critical Rules

1. **Repository Root = Unity Project**: Do not look for a nested Unity folder
2. **DOTS First**: Prefer ECS patterns over MonoBehaviours for game logic
3. **Burst Compile**: Mark systems and jobs with `[BurstCompile]` for performance
4. **Mobile First**: All features must run at 60 FPS on Pixel 8a baseline
5. **TDD for Unity**: Write EditMode tests first, run via `./scripts/run-tests.sh editmode`
6. **Bridge Contract**: TypeScript outputs JSON manifests, Unity consumes them via ManifestLoader
7. **No Stubs**: Fully implement logic; do not leave placeholder code
8. **Strict Types**: Use explicit C# types; avoid `object` or `dynamic`
9. **EntityCommandBuffer**: Use ECB singletons for structural changes, not direct entity manipulation
10. **Namespace Convention**: Use `NeoTokyo.Components.*` and `NeoTokyo.Systems.*`

## Deprecated (DO NOT USE)

The following are archived in `_reference/` and must NOT be used:

- **TypeScript Runtime**: Old Babylon.js/Reactylon game code
- **Miniplex ECS**: Replaced by Unity DOTS Entities
- **React/Three.js**: Replaced by Unity URP
- **Zustand Stores**: Replaced by Unity ScriptableObjects and DOTS singletons
- **YukaJS Navigation**: Replaced by Unity AI Navigation

See `docs/DEPRECATIONS.md` for the full list.

## Documentation Reference

| Document | Purpose |
|----------|---------|
| `docs/UNITY_6_ARCHITECTURE.md` | Complete DOTS architecture guide |
| `docs/UNITY_MIGRATION.md` | Migration plan and history |
| `docs/GOLDEN_RECORD_MASTER.md` | Game design and world lore |
| `docs/PHASE_ROADMAP.md` | Execution milestones |
| `docs/DEPRECATIONS.md` | What to ignore (old patterns) |
| `docs/FLOODED_WORLD.md` | World setting and theme |
| `AGENTS.md` | Broader agent rules |
