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

- **Narrative**: Story beats are authored; GenAI is optional for draft text and lore flavoring.
- **Assets**: UI icons and graphical elements can be generated as SVGs.
- **Integration**: The `content-gen` package outputs JSON and assets into `/src/assets`.
- **Reference**: See `/docs/pipeline/GENAI_PIPELINE.md` for full usage details.

## Implementation Guidelines

- **Zero Stubs**: All systems must be fully functional.
- **Modularity**: Use ECS (Miniplex) for all game logic.
- **State**: Use Zustand stores for game state and Angular services for UI wiring.

---

## Implementation Status

> **Updated**: January 27, 2026

Core mechanics are implemented in TypeScript packages and the Angular runtime:

| Mechanic | Implementation |
|----------|----------------|
| Stats System | `packages/core/src/types/entity.ts` |
| Progression | `packages/core/src/systems/ProgressionSystem.ts` |
| Combat | `packages/core/src/systems/CombatSystem.ts` |
| Dialogue | `src/app/state/dialogue.service.ts` |
| GenAI Pipeline | `packages/content-gen/` → JSON → `/src/assets` |
