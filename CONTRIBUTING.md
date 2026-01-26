# Contributing to Neo-Tokyo: Rival Academies

Welcome! We appreciate your interest in contributing. Please follow these guidelines to keep the codebase clean and the game fun.

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Development Workflow](#development-workflow)
3. [Code Style Guidelines](#code-style-guidelines)
4. [Pull Request Process](#pull-request-process)
5. [Testing Requirements](#testing-requirements)
6. [Documentation](#documentation)
7. [AI Policy](#ai-policy)

---

## Getting Started

### Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Unity Hub | Latest | Project management |
| Unity Editor | 6000.3.5f1 | Game engine |
| Node.js | >= 20.x | TypeScript dev tools |
| PNPM | 10.x | Package management |
| Git | >= 2.x | Version control |

### Setup

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd neo-tokyo-rival-academies
   ```

2. **Install Node dependencies:**
   ```bash
   npm install -g pnpm@10
   pnpm install
   ```

3. **Open in Unity:**
   - Open Unity Hub
   - Add project from disk (repository root)
   - Open with Unity 6000.3.5f1

4. **Verify setup:**
   ```bash
   ./scripts/run-tests.sh editmode
   ```

For detailed setup instructions, see [docs/UNITY_DEVELOPER_GUIDE.md](docs/UNITY_DEVELOPER_GUIDE.md).

---

## Development Workflow

### Branching Strategy

Use prefixes for branch names:

| Prefix | Purpose | Example |
|--------|---------|---------|
| `feat/` | New features | `feat/water-combat` |
| `fix/` | Bug fixes | `fix/damage-calc` |
| `chore/` | Maintenance | `chore/update-packages` |
| `docs/` | Documentation | `docs/api-reference` |
| `refactor/` | Code restructuring | `refactor/ecs-cleanup` |

### Commit Messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:** `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

**Examples:**
```
feat(combat): add break mechanic for stagger system
fix(reputation): clamp values to 0-100 range
docs(api): document CombatSystem query patterns
test(progression): add level-up integration tests
chore(deps): update Unity Entities to 1.3.5
```

### Development Commands

```bash
# TypeScript dev tools
pnpm check          # Lint (Biome)
pnpm test           # Unit tests (Vitest)
pnpm test:e2e       # E2E tests (requires dev server)

# Unity tests
./scripts/run-tests.sh editmode   # Fast unit tests
./scripts/run-tests.sh playmode   # Integration tests
./scripts/run-tests.sh all        # All tests
./scripts/run-tests.sh graphics   # Visual regression

# Package management
./scripts/resolve-packages.sh     # Resolve Unity packages
```

---

## Code Style Guidelines

### C# / Unity Code

#### Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Namespace | PascalCase | `NeoTokyo.Components.Combat` |
| Class/Struct | PascalCase | `CombatSystem`, `Health` |
| Interface | I + PascalCase | `IBufferElementData` |
| Method | PascalCase | `OnUpdate`, `GetHealth` |
| Property | PascalCase | `Current`, `IsDead` |
| Field (public) | PascalCase | `Current`, `Max` |
| Field (private) | _camelCase | `_cachedValue` |
| Local variable | camelCase | `enemyHealth` |
| Constant | SCREAMING_CASE | `MAX_HEALTH` |
| Enum | PascalCase | `CharacterState.Idle` |

#### File Organization

```csharp
// 1. Using statements (sorted)
using System;
using Unity.Entities;
using Unity.Mathematics;
using NeoTokyo.Components.Combat;

// 2. Namespace
namespace NeoTokyo.Systems.Combat
{
    // 3. XML documentation
    /// <summary>
    /// Brief description of the class/struct.
    /// </summary>

    // 4. Attributes
    [BurstCompile]
    [UpdateInGroup(typeof(SimulationSystemGroup))]

    // 5. Type declaration
    public partial struct CombatSystem : ISystem
    {
        // 6. Constants
        private const float INVINCIBILITY_DURATION = 0.5f;

        // 7. Fields

        // 8. Properties

        // 9. Lifecycle methods (OnCreate, OnUpdate, OnDestroy)

        // 10. Public methods

        // 11. Private methods
    }
}
```

#### DOTS-Specific Guidelines

**Components:**
```csharp
// DO: Keep components focused and small
public struct Health : IComponentData
{
    public int Current;
    public int Max;

    // Computed properties are OK
    public bool IsDead => Current <= 0;
}

// DON'T: Put unrelated data in same component
public struct BadComponent : IComponentData  // Bad!
{
    public int Health;
    public float3 Position;
    public string Name;  // Reference type - won't work!
}
```

**Systems:**
```csharp
// DO: Use BurstCompile on ISystem
[BurstCompile]
public partial struct MySystem : ISystem
{
    [BurstCompile]
    public void OnUpdate(ref SystemState state) { }
}

// DO: Specify update order when needed
[UpdateInGroup(typeof(SimulationSystemGroup))]
[UpdateAfter(typeof(DependencySystem))]

// DO: Use ECB for structural changes
var ecb = SystemAPI.GetSingleton<EndSimulationEntityCommandBufferSystem.Singleton>()
    .CreateCommandBuffer(state.WorldUnmanaged);
ecb.AddComponent<DeadTag>(entity);

// DON'T: Modify structure during iteration
foreach (var entity in query)
{
    state.EntityManager.DestroyEntity(entity);  // Bad!
}
```

**Queries:**
```csharp
// DO: Use SystemAPI.Query with proper access
foreach (var (health, stats) in
    SystemAPI.Query<RefRW<Health>, RefRO<RPGStats>>()
        .WithAll<PlayerTag>()
        .WithNone<DeadTag>())
{
    // RefRW for write, RefRO for read
}

// DON'T: Use EntityManager queries in hot paths
var entities = state.EntityManager.GetAllEntities();  // Allocates!
```

#### General C# Guidelines

```csharp
// DO: Use var when type is obvious
var health = new Health { Current = 100, Max = 100 };
var ecb = SystemAPI.GetSingleton<EndSimulationEntityCommandBufferSystem.Singleton>();

// DO: Use expression-bodied members for simple properties
public bool IsDead => Current <= 0;
public float Ratio => Max > 0 ? (float)Current / Max : 0f;

// DO: Use static factory methods
public static StabilityState Default => new StabilityState
{
    Current = 100,
    Max = 100
};

// DON'T: Use magic numbers
health.ValueRW.Current = math.max(0, health.ValueRO.Current - damage);  // Good
health.ValueRW.Current -= 25;  // Bad - what is 25?

// DO: Add XML documentation to public members
/// <summary>
/// Processes damage events and applies to entity health.
/// </summary>
/// <param name="state">System state reference.</param>
[BurstCompile]
public void OnUpdate(ref SystemState state)
```

### TypeScript Code

TypeScript code (in `dev-tools/`) follows Biome formatting:

```bash
pnpm check      # Check formatting and linting
pnpm check:fix  # Auto-fix issues
```

Key rules:
- No `any` types (use interfaces or generics)
- Strict null checks enabled
- Prefer `const` over `let`
- Use arrow functions for callbacks

---

## Pull Request Process

### Before Submitting

1. **Create feature branch:**
   ```bash
   git checkout -b feat/my-feature
   ```

2. **Make changes following style guidelines**

3. **Run tests:**
   ```bash
   ./scripts/run-tests.sh all
   pnpm check
   ```

4. **Commit with conventional commits**

5. **Push and create PR:**
   ```bash
   git push origin feat/my-feature
   ```

### PR Requirements

- [ ] Descriptive title using conventional commit format
- [ ] Description explaining what and why
- [ ] All tests pass
- [ ] No linting errors
- [ ] Documentation updated (if applicable)
- [ ] No `// TODO` stubs left behind
- [ ] No `any` types in TypeScript

### PR Template

```markdown
## Summary

Brief description of changes.

## Changes

- Added X system
- Fixed Y bug
- Updated Z documentation

## Testing

- [ ] EditMode tests pass
- [ ] PlayMode tests pass
- [ ] Manual testing completed

## Screenshots (if applicable)

[Add screenshots for UI/visual changes]
```

### Review Process

1. Create PR against `main`
2. Automated CI runs tests
3. Reviewer(s) assigned
4. Address feedback
5. Squash and merge when approved

---

## Testing Requirements

### Test Coverage Expectations

| Area | Coverage Target | Test Type |
|------|-----------------|-----------|
| Component logic | High | EditMode |
| System behavior | High | EditMode + PlayMode |
| Integration flows | Medium | PlayMode |
| UI interactions | Medium | PlayMode |
| Visual appearance | Baseline | Graphics |

### Required Tests for PRs

**New Component:**
```csharp
// Tests/EditMode/MyComponentTests.cs
[Test]
public void MyComponent_DefaultValues_AreCorrect() { }

[Test]
public void MyComponent_ComputedProperty_CalculatesCorrectly() { }
```

**New System:**
```csharp
// Tests/EditMode/MySystemTests.cs
[Test]
public void MySystem_ProcessesEntities_Correctly() { }

// Tests/PlayMode/MySystemIntegrationTests.cs
[UnityTest]
public IEnumerator MySystem_IntegratesWithOtherSystems() { }
```

### Running Tests

```bash
# Quick verification
./scripts/run-tests.sh editmode

# Full test suite (before PR)
./scripts/run-tests.sh all

# Visual regression (for rendering changes)
./scripts/run-tests.sh graphics
```

---

## Documentation

### When to Update Docs

- New component or system added
- API changes
- New patterns introduced
- Configuration changes
- Common issues discovered

### Documentation Files

| File | Purpose |
|------|---------|
| `docs/UNITY_DEVELOPER_GUIDE.md` | Setup and development guide |
| `docs/UNITY_API_REFERENCE.md` | Component and system reference |
| `docs/UNITY_6_ARCHITECTURE.md` | Architecture overview |
| `docs/TROUBLESHOOTING.md` | Common issues and solutions |
| `README.md` | Project overview |

### Documentation Style

- Use headers for structure
- Include code examples
- Add tables for reference data
- Keep sentences concise
- Update "Last Updated" dates

---

## AI Policy

When using AI tools (Claude, Cursor, GitHub Copilot):

### Requirements

1. **Follow `AGENTS.md`** for AI-specific guidelines

2. **No Stubs:**
   ```csharp
   // Bad - don't leave this
   public void ProcessDamage()
   {
       // TODO: implement later
   }

   // Good - implement fully
   public void ProcessDamage()
   {
       foreach (var damage in damageBuffer)
       {
           health.ValueRW.Current = math.max(0, health.ValueRO.Current - damage.Amount);
       }
   }
   ```

3. **Strict Types:**
   ```typescript
   // Bad
   const data: any = loadManifest();

   // Good
   const data: WorldManifest = loadManifest();
   ```

4. **Verify AI Output:**
   - Run tests after AI-generated code
   - Review for correctness
   - Ensure style compliance

---

## Getting Help

- **Issues:** Create GitHub issue for bugs/features
- **Discussions:** Use GitHub Discussions for questions
- **Documentation:** See `docs/` folder

---

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

**Last Updated**: January 26, 2026
