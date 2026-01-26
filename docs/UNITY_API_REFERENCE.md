# Unity API Reference

**Version**: 1.0.0
**Last Updated**: January 26, 2026

Quick reference for all components, systems, and helper classes in the Neo-Tokyo Unity codebase.

---

## Table of Contents

1. [Component Namespaces](#component-namespaces)
2. [System Namespaces](#system-namespaces)
3. [Helper Classes](#helper-classes)
4. [Common Operations](#common-operations)
5. [Enumerations](#enumerations)

---

## Component Namespaces

### NeoTokyo.Components.Core

Core entity identification and tags.

| Component | Type | Fields | Description |
|-----------|------|--------|-------------|
| `PlayerTag` | Tag | - | Identifies player entity |
| `EnemyTag` | Tag | - | Identifies enemy entities |
| `NPCTag` | Tag | - | Identifies non-combat NPCs |
| `DeadTag` | Tag | - | Marks dead entities for cleanup |

### NeoTokyo.Components.Stats

Character statistics and progression.

| Component | Type | Fields | Description |
|-----------|------|--------|-------------|
| `RPGStats` | IComponentData | `Structure`, `Ignition`, `Logic`, `Flow` | Core JRPG stat block |
| `Health` | IComponentData | `Current`, `Max` | Health pool with `IsDead`, `Ratio` computed |
| `Mana` | IComponentData | `Current`, `Max` | Resource pool for abilities |
| `LevelProgress` | IComponentData | `Level`, `XP`, `XPToNextLevel` | Experience and leveling |

```csharp
// RPGStats usage
var stats = RPGStats.Default;  // All stats = 10
var scaled = RPGStats.ForLevel(5);  // Level-scaled stats

// Health usage
var health = new Health { Current = 100, Max = 100 };
bool dead = health.IsDead;     // false
float ratio = health.Ratio;    // 1.0f

// LevelProgress usage
int xpNeeded = LevelProgress.GetXPForLevel(5);  // 500
```

### NeoTokyo.Components.Combat

Combat mechanics and damage.

| Component | Type | Fields | Description |
|-----------|------|--------|-------------|
| `InvincibilityState` | IComponentData | `IsActive`, `RemainingTime`, `Duration` | I-frames state |
| `StabilityState` | IComponentData | `Current`, `Max`, `RecoveryRate` | Stagger resistance |
| `BreakState` | IComponentData | `IsBroken`, `BreakDuration`, `RemainingBreakTime`, `BreakCount` | Break/stagger state |
| `CharacterStateComponent` | IComponentData | `Current`, `Previous`, `StateTime` | Character state machine |
| `DamageEvent` | IBufferElementData | `Source`, `Amount`, `IsCritical`, `StabilityDamage` | Damage event buffer |
| `Hitbox` | IComponentData | `Offset`, `Size`, `Duration`, `RemainingTime`, `IsActive` | Attack hitbox |
| `Invincibility` | IComponentData | `IsInvincible`, `EndsAt` | Time-based invincibility |
| `HitEvent` | IComponentData | `Attacker`, `Target`, `Damage`, `HitPoint` | Hit registration |
| `DamageSource` | IComponentData | `BaseDamage`, `StabilityDamage`, `OwnerEntity` | Damage output config |

```csharp
// InvincibilityState usage
var invincibility = InvincibilityState.Create(0.5f);

// StabilityState usage
var stability = StabilityState.Default;
bool broken = stability.IsBroken;

// Invincibility (time-based) usage
var inv = Invincibility.Apply(1.0f, currentTime);
bool active = inv.CheckInvincible(currentTime + 0.5f);
```

### NeoTokyo.Components.Combat (CombatLogicComponents.cs)

Combat calculation components.

| Component | Type | Fields | Description |
|-----------|------|--------|-------------|
| `CombatStats` | IComponentData | `MeleeAttackPower`, `RangedAttackPower`, `Defense`, `CriticalChance`, `CriticalMultiplier` | Derived combat stats |
| `AttackData` | IComponentData | `Type`, `BaseDamage`, `StabilityDamage`, `HitboxSize`, `HitboxOffset`, `Duration` | Attack configuration |

```csharp
// CombatStats from RPGStats
var combatStats = CombatStats.FromRPGStats(
    structure: 10,
    ignition: 30,
    logic: 10
);
// MeleeAttackPower = 10 + 30 * 0.5 = 25
```

### NeoTokyo.Components.Faction

Faction system and reputation.

| Component | Type | Fields | Description |
|-----------|------|--------|-------------|
| `FactionMembership` | IComponentData | `Value` (FactionType) | Entity's faction |
| `Reputation` | IComponentData | `Kurenai`, `Azure` | Legacy dual-faction reputation (0-100) |
| `ExtendedReputation` | IComponentData | 8 faction fields | Full 8-faction reputation |
| `ReputationChangeElement` | IBufferElementData | `Faction`, `Amount`, `Reason` | Pending reputation change |
| `ExtendedReputationChangeElement` | IBufferElementData | `Faction`, `Amount`, `Reason`, `ApplySpillover` | Extended rep change |

```csharp
// Reputation usage
var rep = Reputation.Default;  // Both = 50
ReputationLevel level = rep.GetKurenaiLevel();  // Neutral
float aggro = rep.GetAggressionMultiplier(FactionType.Kurenai);

// Common changes
int change = ReputationChanges.COMPLETE_QUEST;  // +10
```

### NeoTokyo.Components.AI

AI behavior and perception.

| Component | Type | Fields | Description |
|-----------|------|--------|-------------|
| `ThreatEntry` | IBufferElementData | `Entity`, `ThreatLevel`, `LastSeen` | Threat table entry |
| `ThreatTable` | IComponentData | - | Marker for entities with threat tracking |
| `SwarmMember` | IComponentData | `GroupId`, `Role` | Swarm group membership |
| `PerceptionData` | IComponentData | `VisionRange`, `VisionAngle`, `HearingRange` | Sensory config |

### NeoTokyo.Components.Abilities

Ability and cooldown system.

| Component | Type | Fields | Description |
|-----------|------|--------|-------------|
| `AbilitySlots` | IComponentData | `Ability0`-`Ability3` | Equipped ability references |
| `AbilityCooldown` | IComponentData | `RemainingTime`, `TotalTime` | Cooldown state |
| `ResourcePool` | IComponentData | `Current`, `Maximum`, `RegenRate` | Energy/mana pool |

### NeoTokyo.Components.Navigation

Pathfinding and movement.

| Component | Type | Fields | Description |
|-----------|------|--------|-------------|
| `NavigationTarget` | IComponentData | `Position`, `StoppingDistance` | Movement destination |
| `PathBuffer` | IBufferElementData | `Waypoint` | Path waypoints |
| `NavigationState` | IComponentData | `IsMoving`, `CurrentWaypointIndex` | Nav state |

### NeoTokyo.Components.World

World state and environment.

| Component | Type | Fields | Description |
|-----------|------|--------|-------------|
| `WeatherState` | IComponentData | `Type`, `Intensity`, `Duration` | Current weather |
| `WaterLevel` | IComponentData | `Height`, `FlowDirection`, `FlowSpeed` | Flood state |
| `TerritoryData` | IComponentData | `Id`, `Faction`, `ControlLevel` | Zone control |
| `WorldSeed` | IComponentData | `Value` | Procedural seed |
| `HexCoord` | IComponentData | `Q`, `R` | Hex grid position |

### NeoTokyo.Components.Quest

Quest tracking.

| Component | Type | Fields | Description |
|-----------|------|--------|-------------|
| `QuestState` | IComponentData | `Id`, `Status`, `Progress` | Quest progress |
| `QuestObjective` | IBufferElementData | `Type`, `Target`, `Current`, `Required` | Objective tracking |

### NeoTokyo.Components.Equipment

Gear system.

| Component | Type | Fields | Description |
|-----------|------|--------|-------------|
| `EquippedGear` | IComponentData | `Weapon`, `Armor`, `Accessory1`, `Accessory2` | Equipped items |
| `ItemData` | IComponentData | `Type`, `Rarity`, `StatBonuses` | Item properties |

### NeoTokyo.Components.Dialogue

Conversation system.

| Component | Type | Fields | Description |
|-----------|------|--------|-------------|
| `DialogueState` | IComponentData | `CurrentNodeId`, `SpeakerId` | Conversation state |
| `DialogueHistory` | IBufferElementData | `NodeId`, `ChoiceIndex` | Past choices |
| `AlignmentGate` | IComponentData | `RequiredFaction`, `MinReputation` | Content gate |

### NeoTokyo.Components.Save

Persistence markers.

| Component | Type | Fields | Description |
|-----------|------|--------|-------------|
| `Persistent` | Tag | - | Entity should be saved |
| `SaveData` | IComponentData | `UniqueId` | Save identification |

---

## System Namespaces

### System Update Order

```
SimulationSystemGroup
|
+-- [Combat Systems] (in order)
|   +-- HitboxTimingSystem
|   +-- InvincibilitySystem
|   +-- HitDetectionSystem
|   +-- CombatSystem
|   +-- InvincibilityStateSystem
|   +-- BreakSystem
|   +-- HazardSystem
|   +-- ArenaSystem
|   +-- WaterCombatSystem
|
+-- [AI Systems]
|   +-- PerceptionSystem
|   +-- ThreatSystem
|   +-- AIStateMachineSystem
|   +-- SteeringSystem
|   +-- EnemyAISystem
|   +-- CrowdSystem
|   +-- SwarmCoordinationSystem
|   +-- TentacleSwarmSystem
|
+-- [Progression Systems]
|   +-- ProgressionSystem
|   +-- ReputationSystem
|   +-- StatAllocationSystem
|   +-- AlignmentBonusSystem
|   +-- AlignmentGateSystem
|
+-- [World Systems]
|   +-- WeatherSystem
|   +-- WaterSystem
|   +-- HexGridSystem
|   +-- TerritorySystem
|   +-- ProceduralGenerationSystem
|   +-- ManifestSpawnerSystem
|   +-- StageSystem
|   +-- BoatSystem
|
+-- [Other Systems]
    +-- AbilitySystem
    +-- NavigationSystem
    +-- EquipmentSystem
    +-- DialogueSystem
    +-- QuestSystem
    +-- QuestGeneratorSystem
    +-- SaveSystem

LateSimulationSystemGroup
|
+-- HitEventCleanupSystem
```

### NeoTokyo.Systems.Combat

| System | Base | Purpose |
|--------|------|---------|
| `CombatSystem` | ISystem | Process damage events, apply to health |
| `HitDetectionSystem` | SystemBase | AABB hitbox overlap detection |
| `HitboxTimingSystem` | ISystem | Update hitbox activation timers |
| `InvincibilitySystem` | ISystem | Update Invincibility timers |
| `InvincibilityStateSystem` | ISystem | Update InvincibilityState timers |
| `BreakSystem` | ISystem | Stability and break mechanics |
| `HazardSystem` | ISystem | Environmental damage |
| `ArenaSystem` | ISystem | Combat zone management |
| `WaterCombatSystem` | ISystem | Water-based combat rules |
| `HitEventCleanupSystem` | SystemBase | Remove processed hit events |
| `CombatLogicSystem` | ISystem | Combat stat calculations |

### NeoTokyo.Systems.AI

| System | Base | Purpose |
|--------|------|---------|
| `AISystem` | ISystem | Base AI processing |
| `AIStateMachineSystem` | ISystem | State transitions |
| `ThreatSystem` | ISystem | Aggro/threat management |
| `SteeringSystem` | ISystem | Movement behaviors |
| `CrowdSystem` | ISystem | Group behaviors |
| `EnemyAISystem` | ISystem | Enemy decision-making |
| `SwarmCoordinationSystem` | ISystem | Swarm tactics |
| `TentacleSwarmSystem` | ISystem | Boss mechanics |
| `PerceptionSystem` | ISystem | Vision/hearing detection |

### NeoTokyo.Systems.Progression

| System | Base | Purpose |
|--------|------|---------|
| `ReputationSystem` | ISystem | Process reputation changes |
| `ProgressionSystem` | ISystem | XP gain, level up |
| `StatAllocationSystem` | ISystem | Stat point spending |
| `AlignmentBonusSystem` | ISystem | Alignment stat effects |
| `AlignmentGateSystem` | ISystem | Content unlock checks |

### NeoTokyo.Systems.World

| System | Base | Purpose |
|--------|------|---------|
| `HexGridSystem` | ISystem | Hex terrain grid |
| `StageSystem` | ISystem | Scene management |
| `ManifestSpawnerSystem` | ISystem | Spawn from JSON manifests |
| `WeatherSystem` | ISystem | Dynamic weather |
| `WaterSystem` | ISystem | Flood mechanics |
| `TerritorySystem` | ISystem | Zone control |
| `ProceduralGenerationSystem` | ISystem | Runtime generation |
| `BoatSystem` | ISystem | Water navigation |

### NeoTokyo.Systems.Abilities

| System | Base | Purpose |
|--------|------|---------|
| `AbilitySystem` | ISystem | Cooldowns, activation |

### NeoTokyo.Systems.Navigation

| System | Base | Purpose |
|--------|------|---------|
| `NavigationSystem` | ISystem | Pathfinding |

### NeoTokyo.Systems.Equipment

| System | Base | Purpose |
|--------|------|---------|
| `EquipmentSystem` | ISystem | Gear management |

### NeoTokyo.Systems.Dialogue

| System | Base | Purpose |
|--------|------|---------|
| `DialogueSystem` | ISystem | Conversations |

### NeoTokyo.Systems.Quest

| System | Base | Purpose |
|--------|------|---------|
| `QuestSystem` | ISystem | Quest tracking |
| `QuestGeneratorSystem` | ISystem | Procedural quests |

### NeoTokyo.Systems.Save

| System | Base | Purpose |
|--------|------|---------|
| `SaveSystem` | ISystem | Persistence |

---

## Helper Classes

### NeoTokyo.Utilities.ManifestLoader

Loads JSON manifests from TypeScript tools.

```csharp
// Synchronous load
var result = ManifestLoader.LoadWorld("seed-name");
if (result.Success)
{
    WorldManifest manifest = result.Data;
}

// Async load
var result = await ManifestLoader.LoadWorldAsync("seed-name");

// Territory load
var result = ManifestLoader.LoadTerritory("seed-name", "territory-id");

// Batch async
var result = await ManifestLoader.LoadTerritoriesBatchAsync(
    "seed-name",
    new[] { "territory-1", "territory-2" }
);

// Configuration
ManifestLoader.ActiveStrategy = LoadStrategy.StreamingAssets;
ManifestLoader.EnableCaching = true;
ManifestLoader.VerboseLogging = false;

// Cache management
ManifestLoader.ClearCache();
var (worlds, territories) = ManifestLoader.GetCacheStats();

// Validation
List<string> errors = ManifestLoader.ValidateWorldManifest(manifest);
```

### NeoTokyo.Utilities.SeedHelpers

Procedural generation utilities.

```csharp
// Hash seed string
uint hash = SeedHelpers.HashSeed("world-seed");

// Seeded random
var random = SeedHelpers.CreateRandom("world-seed");
float value = random.NextFloat();
```

### NeoTokyo.Data.ManifestSchemas

JSON schema classes for manifest parsing.

| Class | Purpose |
|-------|---------|
| `WorldManifest` | Root world definition |
| `TerritoryManifest` | Territory/zone data |
| `TerritoryReference` | World's territory list entry |
| `TileDefinition` | Hex tile data |
| `EntityDefinition` | Entity spawn data |
| `ConnectionDefinition` | Territory connections |
| `BoundsDefinition` | 2D bounds |
| `HexCoordDefinition` | Hex coordinates |

### NeoTokyo.Data.ManifestLoadResult<T>

Result wrapper for manifest loading.

```csharp
var result = ManifestLoader.LoadWorld("seed");
if (result.Success)
{
    var data = result.Data;
    float loadTime = result.LoadTimeMs;
}
else
{
    string error = result.Error;
}
```

---

## Common Operations

### Spawn Player Entity

```csharp
// In a system
var ecb = SystemAPI.GetSingleton<EndSimulationEntityCommandBufferSystem.Singleton>()
    .CreateCommandBuffer(state.WorldUnmanaged);

var entity = ecb.CreateEntity();
ecb.AddComponent<PlayerTag>(entity);
ecb.AddComponent(entity, LocalTransform.FromPosition(float3.zero));
ecb.AddComponent(entity, RPGStats.Default);
ecb.AddComponent(entity, new Health { Current = 100, Max = 100 });
ecb.AddComponent(entity, Reputation.Default);
ecb.AddBuffer<DamageEvent>(entity);
ecb.AddBuffer<ReputationChangeElement>(entity);
```

### Spawn Enemy Entity

```csharp
var entity = ecb.CreateEntity();
ecb.AddComponent<EnemyTag>(entity);
ecb.AddComponent(entity, LocalTransform.FromPosition(spawnPosition));
ecb.AddComponent(entity, new Health { Current = 50, Max = 50 });
ecb.AddComponent(entity, RPGStats.ForLevel(3));
ecb.AddComponent(entity, new FactionMembership { Value = FactionType.Syndicate });
ecb.AddComponent(entity, new Invincibility());
ecb.AddComponent(entity, new Hitbox());
ecb.AddComponent(entity, new DamageSource { BaseDamage = 10 });
```

### Damage an Entity

```csharp
// Via damage buffer (recommended)
var buffer = SystemAPI.GetBuffer<DamageEvent>(targetEntity);
buffer.Add(new DamageEvent
{
    Source = attackerEntity,
    Amount = 25,
    IsCritical = false,
    StabilityDamage = 10f
});

// Direct health modification
var health = SystemAPI.GetComponentRW<Health>(targetEntity);
health.ValueRW.Current = math.max(0, health.ValueRO.Current - damage);
if (health.ValueRO.IsDead)
{
    ecb.AddComponent<DeadTag>(targetEntity);
}
```

### Heal an Entity

```csharp
var health = SystemAPI.GetComponentRW<Health>(targetEntity);
health.ValueRW.Current = math.min(
    health.ValueRO.Max,
    health.ValueRO.Current + healAmount
);
```

### Change Reputation

```csharp
var buffer = SystemAPI.GetBuffer<ReputationChangeElement>(playerEntity);
buffer.Add(new ReputationChangeElement
{
    Faction = FactionType.Kurenai,
    Amount = ReputationChanges.COMPLETE_QUEST,  // +10
    Reason = "Completed delivery quest"
});
```

### Grant XP

```csharp
var progress = SystemAPI.GetComponentRW<LevelProgress>(playerEntity);
progress.ValueRW.XP += xpAmount;

// Check for level up
while (progress.ValueRO.XP >= progress.ValueRO.XPToNextLevel)
{
    progress.ValueRW.XP -= progress.ValueRO.XPToNextLevel;
    progress.ValueRW.Level++;
    progress.ValueRW.XPToNextLevel = LevelProgress.GetXPForLevel(progress.ValueRO.Level);
}
```

### Apply Invincibility

```csharp
// Using InvincibilityState
var invState = SystemAPI.GetComponentRW<InvincibilityState>(entity);
invState.ValueRW = InvincibilityState.Create(0.5f);

// Using Invincibility (time-based)
var inv = SystemAPI.GetComponentRW<Invincibility>(entity);
inv.ValueRW = Invincibility.Apply(1.0f, (float)SystemAPI.Time.ElapsedTime);
```

### Activate Hitbox

```csharp
var hitbox = SystemAPI.GetComponentRW<Hitbox>(entity);
hitbox.ValueRW = new Hitbox
{
    Offset = new float3(0, 1, 2),
    Size = new float3(2, 2, 2),
    Duration = 0.3f,
    RemainingTime = 0.3f,
    IsActive = true
};
```

### Query All Enemies in Range

```csharp
float detectionRadius = 10f;
float3 playerPos = playerTransform.ValueRO.Position;

foreach (var (transform, health, entity) in
    SystemAPI.Query<RefRO<LocalTransform>, RefRO<Health>>()
        .WithAll<EnemyTag>()
        .WithNone<DeadTag>()
        .WithEntityAccess())
{
    float dist = math.distance(playerPos, transform.ValueRO.Position);
    if (dist < detectionRadius)
    {
        // Enemy in range
    }
}
```

### Find Nearest Entity

```csharp
Entity nearest = Entity.Null;
float nearestDist = float.MaxValue;

foreach (var (transform, entity) in
    SystemAPI.Query<RefRO<LocalTransform>>()
        .WithAll<NPCTag>()
        .WithEntityAccess())
{
    float dist = math.distance(origin, transform.ValueRO.Position);
    if (dist < nearestDist)
    {
        nearestDist = dist;
        nearest = entity;
    }
}
```

---

## Enumerations

### FactionType (NeoTokyo.Components.Faction)

```csharp
public enum FactionType : byte
{
    Neutral = 0,
    Kurenai = 1,    // Red academy (passion)
    Azure = 2,      // Blue academy (logic)
    Syndicate = 3,  // Criminal organization
    Runners = 4,    // Speedboat racers
    Collective = 5, // Market traders
    Drowned = 6,    // Mysterious cult
    Council = 7     // Council of Seven
}
```

### ReputationLevel (NeoTokyo.Components.Faction)

```csharp
public enum ReputationLevel : byte
{
    Hated = 0,      // 0-10
    Hostile = 1,    // 11-25
    Unfriendly = 2, // 26-40
    Neutral = 3,    // 41-60
    Friendly = 4,   // 61-75
    Honored = 5,    // 76-90
    Revered = 6     // 91-100
}
```

### CharacterState (NeoTokyo.Components.Combat)

```csharp
public enum CharacterState : byte
{
    Idle = 0,
    Walking = 1,
    Running = 2,
    Jumping = 3,
    Falling = 4,
    Attacking = 5,
    Blocking = 6,
    Staggered = 7,
    Stunned = 8,
    Dead = 9,
    Interacting = 10
}
```

### AttackType (NeoTokyo.Components.Combat)

```csharp
public enum AttackType : byte
{
    Melee = 0,   // Uses Ignition stat
    Ranged = 1,  // Uses Logic stat
    Tech = 2     // Uses Logic stat
}
```

---

## Required Usings

Common using statements for Unity DOTS development:

```csharp
// Core Unity
using UnityEngine;

// DOTS Entities
using Unity.Entities;
using Unity.Transforms;

// Burst & Jobs
using Unity.Burst;
using Unity.Jobs;

// Math & Collections
using Unity.Mathematics;
using Unity.Collections;

// Physics (if needed)
using Unity.Physics;

// Project namespaces
using NeoTokyo.Components.Core;
using NeoTokyo.Components.Combat;
using NeoTokyo.Components.Stats;
using NeoTokyo.Components.Faction;
using NeoTokyo.Components.AI;
using NeoTokyo.Systems.Combat;
using NeoTokyo.Utilities;
using NeoTokyo.Data;
```

---

**Last Updated**: January 26, 2026
