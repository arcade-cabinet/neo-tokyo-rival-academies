# Claude AI Assistant Guidelines

Welcome, Claude! This document provides specific context and guidelines for working on the **Neo-Tokyo: Rival Academies** project.

## Project Context

**Neo-Tokyo: Rival Academies** is a **3D Action JRPG** built with a **Hybrid Architecture**:

- **Unity 6 Runtime**: The game runtime lives at the repository ROOT as a Unity 6 DOTS project
- **TypeScript Dev Tools**: Build-time content generation and testing tools in `dev-tools/`

The repository root IS the Unity project. There is no nested Unity folder.

## Project Structure

```
neo-tokyo-rival-academies/           # Repository ROOT = Unity Project
├── Assets/
│   └── Scripts/
│       ├── Components/              # DOTS IComponentData structs
│       │   ├── Core/                # PlayerTag, Transform
│       │   ├── Combat/              # CombatComponents
│       │   ├── Stats/               # RPGStats
│       │   ├── Faction/             # Reputation
│       │   ├── Abilities/           # AbilityComponents
│       │   ├── Navigation/          # NavigationComponents
│       │   ├── AI/                  # ThreatComponents
│       │   ├── Save/                # SaveComponents
│       │   └── Dialogue/            # DialogueComponents
│       ├── Systems/                 # DOTS ISystem implementations
│       │   ├── Combat/              # CombatSystem, BreakSystem, HitDetectionSystem
│       │   ├── AI/                  # AIStateMachineSystem, ThreatSystem, CrowdSystem, SteeringSystem, EnemyAISystem
│       │   ├── Progression/         # ReputationSystem, ProgressionSystem, StatAllocationSystem
│       │   ├── World/               # HexGridSystem, StageSystem
│       │   ├── Abilities/           # AbilitySystem
│       │   ├── Navigation/          # NavigationSystem
│       │   ├── Save/                # SaveSystem
│       │   └── Dialogue/            # DialogueSystem
│       ├── MonoBehaviours/          # Traditional Unity scripts (authoring, UI)
│       └── Utilities/               # ManifestLoader (TypeScript bridge)
├── Packages/                        # Unity Package Manager
├── ProjectSettings/                 # Unity settings
├── Tests/                           # Unity Test Framework
│   ├── EditMode/                    # Unit tests (no scene required)
│   ├── PlayMode/                    # Integration tests (requires scene)
│   └── Graphics/                    # Visual regression tests
├── dev-tools/                       # TypeScript DEV layer
│   ├── content-gen/                 # Meshy/Gemini content generation CLI
│   ├── e2e/                         # Playwright E2E tests
│   ├── shared-assets/               # Asset manifests (JSON bridge)
│   ├── types/                       # Shared TypeScript types
│   └── config/                      # Build configuration
├── _reference/                      # Old TypeScript runtime (migration reference only)
├── docs/                            # Documentation
├── scripts/                         # Build and test scripts
│   ├── run-tests.sh                 # Headless test runner
│   └── resolve-packages.sh          # Package resolution script
└── TestResults/                     # Test output (generated)
```

## Technology Stack

### Unity 6 (Runtime Layer)

- **Engine**: Unity 6 (6000.3.x LTS)
- **Architecture**: DOTS (Entities, Burst, Collections)
- **Rendering**: URP with custom cel-shading
- **Physics**: Unity Physics / Havok
- **Navigation**: Unity AI Navigation
- **Testing**: Unity Test Framework (EditMode + PlayMode + Graphics)

### TypeScript (Dev Tools Layer)

- **Build Tools**: PNPM, Vite, Biome, Vitest
- **GenAI**: Google Gemini, Meshy AI
- **Testing**: Playwright E2E, Vitest unit tests

## Common Commands

### Unity Tests

```bash
# Run EditMode tests (unit tests, no editor GUI)
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

## Development Patterns

### DOTS ECS Architecture

Components are pure data structs implementing `IComponentData`:

```csharp
[BurstCompile]
public struct Health : IComponentData
{
    public float Current;
    public float Max;
}
```

Systems implement `ISystem` with Burst compilation:

```csharp
[BurstCompile]
public partial struct DamageSystem : ISystem
{
    [BurstCompile]
    public void OnUpdate(ref SystemState state)
    {
        // Process entities with Health and DamageEvent components
    }
}
```

### ManifestLoader Bridge

TypeScript generates JSON manifests at build time. Unity consumes them via `ManifestLoader`:

```csharp
// Assets/Scripts/Utilities/ManifestLoader.cs
var manifest = ManifestLoader.Load<WeaponManifest>("weapons.json");
```

Manifests are stored in `dev-tools/shared-assets/` and copied to `Assets/StreamingAssets/` during build.

### Test-First Development

Write EditMode tests before implementing systems:

```csharp
[Test]
public void CombatSystem_AppliesDamage_WhenHitDetected()
{
    // Arrange: Create test world with entities
    // Act: Run system update
    // Assert: Verify component state changes
}
```

## Key File Locations

| Purpose | Location |
|---------|----------|
| Game Systems | `Assets/Scripts/Systems/` |
| ECS Components | `Assets/Scripts/Components/` |
| Unity Tests | `Tests/EditMode/`, `Tests/PlayMode/` |
| ManifestLoader | `Assets/Scripts/Utilities/ManifestLoader.cs` |
| Content Generation | `dev-tools/content-gen/` |
| Asset Manifests | `dev-tools/shared-assets/` |
| E2E Tests | `dev-tools/e2e/` |
| Test Scripts | `scripts/run-tests.sh` |

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
8. **Strict Types**: Use explicit C# types; avoid object or dynamic

## Documentation Reference

- `AGENTS.md` - Broader agent rules
- `docs/GOLDEN_RECORD_MASTER.md` - Full design and architecture
- `docs/PHASE_ROADMAP.md` - Execution milestones
- `docs/DEPRECATIONS.md` - What to ignore (old Babylon/Reactylon patterns)
