# Branch + Legacy Parity Assessment

## Goal
Combine legacy TSX/TS parity with 1.0 branch audit and Unity C# migration sources to build a single port target list that preserves core vision and avoids branch creep.

## Branch Snapshot (Local)
- Branches present: `feat/33-golden-record-docs`, `feat/flooded-world-integration`, `feat/playground-component-primitives`, `feat/unified-integration`, `feat/unity-6-migration`, `fix/infinite-render-loop`, `fix/reputation-system-golden-record`, `jrpg-transformation-107803072628449215`, `pr-9-fix-limb`, `pr-10-perf-physics`, `pr-11-perf-render`, `pr-12-perf-platform`, `pr-13-perf-neon`, `release/1.0`, `release/kiro-v1.0-restored`, `main`.

## High-Value Source Branches

### 1) `feat/playground-component-primitives`
- **Why**: Largest TSX component set; flooded-world design system; PBR pipeline.
- **Targets**: component primitives, design tokens, tests, PBR texture pipeline.
- **Port value**: Direct Babylon/Angular port targets for world visuals.

### 2) `feat/flooded-world-integration`
- **Why**: Compound assemblies (Building/Street/Bridge/Alley), integration of diorama components.
- **Targets**: compound assembly logic and procedural layout patterns.
- **Port value**: Fill scene composition gaps and align world layout with legacy.

### 3) `fix/infinite-render-loop`
- **Why**: Fixes for quest UI and background panels; Daggerfall-style world architecture.
- **Targets**: quest UI fixes and any render stability improvements.
- **Port value**: Behavioral parity for UI + rendering stability.

### 4) `release/1.0` + `release/kiro-v1.0-restored`
- **Why**: Consolidated release state; restored file deletions.
- **Targets**: stable reference for feature completeness; regression comparison.
- **Port value**: baseline acceptance criteria for 1.0 parity.

### 5) `feat/unity-6-migration`
- **Why**: C# systems that embody intended gameplay logic + UI flow.
- **Targets** (C# → TS ports):
  - ECS systems: Combat, Quest, AI (Perception/Threat/Swarm), Progression, Alignment, Reputation, Inventory, Equipment.
  - Authoring data: Quest templates, item/equipment databases, faction relationships, save schema.
  - UI flows: Quest log, inventory, HUD, dialogue, settings, save/load.
- **Port value**: authoritative gameplay logic and system interfaces.

## Branches With Primarily Docs or Build Fixes
- `feat/33-golden-record-docs`: governance + doc alignment, but includes gameplay-related commits. Use as reference only.
- `feat/unified-integration`: mixed migration/build hacks; avoid merging, extract only what is relevant.
- `fix/reputation-system-golden-record`: reputation adjustments + docs; verify logic against current vision before port.

## Unity C# Port Targets (feat/unity-6-migration)

### Systems (must replicate in TS)
- AI: `AIStateMachineSystem`, `PerceptionSystem`, `ThreatSystem`, `TentacleSwarmSystem`, `SteeringSystem`, `EnemyAISystem`.
- Combat: `CombatSystem`, `CombatLogicSystem`, `HitDetectionSystem`, `BreakSystem`, `ArenaSystem`, `WaterCombatSystem`.
- Progression: `ProgressionSystem`, `AlignmentBonusSystem`, `AlignmentGateSystem`, `StatAllocationSystem`, `ReputationSystem`.
- Quest: `QuestSystem`, `QuestGeneratorSystem`, `QuestUIBridgeSystem`.
- Inventory/Equipment: `InventorySystem`, `EquipmentSystem`.
- World: `ProceduralGenerationSystem`, `StageSystem`, `TerritorySystem`, `WaterSystem`, `WeatherSystem`.

### Data / Schema (must port)
- `QuestTemplates`, `ItemDatabase`, `EquipmentDatabase`, `FactionRelationships`, `TerritoryDefinitions`, `SaveDataSchema`, `WaterVFXConfig`.

### UI / Bridge
- `HUDController`, `QuestLogScreen`, `QuestHUDWidget`, `DialogueUI`, `InventoryScreen`, `SaveLoadScreen`, `SettingsScreen`.
- Bridge systems: `InventoryUIBridgeSystem`, `CombatVFXBridgeSystem`, `PlayerMovementBridgeSystem`, `SaveSystem`.

## TSX/TS Port Targets (Legacy)
- Diorama components by category: structural, props, signage, infrastructure, environment, vegetation, maritime.
- Compound assemblies: Building, Street, Bridge, Alley, Room.
- Materials: AmbientCG PBR, Decals, HDRI (now ported, needs integration).

## Action Plan (Best-of-All-Worlds)
1. **Create a single parity matrix** combining legacy TSX/TS and Unity C# systems.
2. **Port compound assemblies** from TSX and align with Unity gameplay logic.
3. **Integrate material + decal + HDRI systems** into runtime rendering path.
4. **UI parity audit** vs release/1.0 and Unity UI screens; adjust Angular UI to match flows and layouts.
5. **Cross-check with Golden Record** to ensure flood-world + JRPG alignment remains consistent.

## Notes
- Branch diffs are massive; do not merge wholesale. Extract only aligned features into main.
- Treat Unity C# as authoritative system design spec for gameplay parity.
