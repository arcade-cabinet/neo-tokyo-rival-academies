# JRPG Transformation Plan

## Vision

Transform the "Neo-Tokyo: Rival Academies" runner into a depth-filled Action JRPG. The core running mechanic remains for traversal, but is enriched with RPG progression, stat-based combat, and a narrative-heavy structure.

## Core Mechanics

### 1. Stats System

Entities will possess the following stats:
- **Structure (STR)**: Max Health and resistance to stagger.
- **Ignition (IGN)**: Melee damage and critical hit chance.
- **Logic (LOG)**: Tech/Ranged damage and hacking speed.
- **Flow (FLW)**: Movement speed, evasion, and boost duration.

### 2. Progression

- **Experience (XP)**: Gained by defeating enemies (Yakuza, Drones) and collecting Data Shards.
- **Leveling**: Reaching an XP threshold increments Level, restoring Health and granting Stat Points.
- **Reputation (REP)**: A secondary currency for unlocking Academy tiers.

### 3. Combat

- **Formula**: `Damage = (Attacker.AttackPower * StatMultiplier) - (Defender.Defense / 2)`
- **Floating Numbers**: Damage numbers must appear on hit.
- **Break System**: Enemies have a "Stability" gauge. Depleting it stuns them for a critical strike.

### 4. Narrative System

- **Dialogue**: A visual-novel-style overlay for conversations between Kai and Vera (or allies).
- **Triggers**: Dialogue triggers on specific distance markers or boss encounters.
- **Data Shards**: Collectibles that unlock lore entries in the "Database".

### 5. GenAI Content Pipeline

- **Narrative**: Dialogues and Lore are procedurally generated via Google Gemini.
- **Assets**: UI Icons and specific graphical elements are generated as SVGs.
- **Integration**: The `content-gen` package orchestrates this, outputting JSON and React Components directly into the Game package.
- **Reference**: See `docs/GENAI_PIPELINE.md` for full usage details.

## Implementation Guidelines

- **Zero Stubs**: All systems must be fully functional.
- **Modularity**: Use Unity DOTS ECS for all game logic.
- **State**: Use ECS components for game state, ScriptableObjects for UI configuration.

---

## Unity 6 Implementation Status

> **Updated**: January 26, 2026 | **Status**: IMPLEMENTED

All core mechanics are now implemented in Unity 6 DOTS:

| Mechanic | Unity Implementation |
|----------|---------------------|
| Stats System | `RPGStats.cs` - Structure, Ignition, Logic, Flow |
| Progression | `ProgressionSystem.cs`, `StatAllocationSystem.cs` |
| Combat | `CombatSystem.cs`, `BreakSystem.cs`, `HitDetectionSystem.cs` |
| Break System | `StabilityState`, `BreakState` components |
| Dialogue | `DialogueSystem.cs`, `DialogueComponents.cs` |
| GenAI Pipeline | `dev-tools/content-gen/` → JSON → `ManifestLoader.cs` |

### Key Files

```
Assets/Scripts/Components/Stats/RPGStats.cs       # Four-stat system
Assets/Scripts/Systems/Combat/CombatSystem.cs     # Damage formula
Assets/Scripts/Systems/Combat/BreakSystem.cs      # Stability/stagger
Assets/Scripts/Systems/Dialogue/DialogueSystem.cs # Visual novel overlay
```
