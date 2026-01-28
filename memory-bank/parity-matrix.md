# Parity Matrix (Legacy + Branch + Unity)

## Purpose
Single source mapping for port targets: legacy TSX/TS + Unity C# + current TS/Babylon/Angular state.

## Legacy TSX Inventory
### Diorama Components
- Total: 110
- src/lib/diorama/src/components/BackgroundPanels.tsx
- src/lib/diorama/src/components/Character.tsx
- src/lib/diorama/src/components/ForegroundProps.tsx
- src/lib/diorama/src/components/HexTileFloor.tsx
- src/lib/diorama/src/components/Lighting.tsx
- src/lib/diorama/src/components/MidgroundFacades.tsx
- src/lib/diorama/src/components/PlayerController.tsx
- src/lib/diorama/src/components/ProceduralBackground.tsx
- src/lib/diorama/src/components/QuestMarkers.tsx
- src/lib/diorama/src/components/environment/Farground.tsx
- src/lib/diorama/src/components/environment/Fog.tsx
- src/lib/diorama/src/components/environment/Hero.tsx
- src/lib/diorama/src/components/environment/NavMesh.tsx
- src/lib/diorama/src/components/environment/Platform.tsx
- src/lib/diorama/src/components/environment/RailPath.tsx
- src/lib/diorama/src/components/environment/SteamVent.tsx
- src/lib/diorama/src/components/furniture/Bench.tsx
- src/lib/diorama/src/components/furniture/BollardPost.tsx
- src/lib/diorama/src/components/furniture/DrainGrate.tsx
- src/lib/diorama/src/components/furniture/FireHydrant.tsx
- src/lib/diorama/src/components/furniture/Mailbox.tsx
- src/lib/diorama/src/components/furniture/Manhole.tsx
- src/lib/diorama/src/components/furniture/Newspaper.tsx
- src/lib/diorama/src/components/furniture/ParkingMeter.tsx
- src/lib/diorama/src/components/furniture/PhoneBooth.tsx
- src/lib/diorama/src/components/furniture/Planter.tsx
- src/lib/diorama/src/components/furniture/ShoppingCart.tsx
- src/lib/diorama/src/components/furniture/TrashCan.tsx
- src/lib/diorama/src/components/furniture/Umbrella.tsx
- src/lib/diorama/src/components/furniture/VendingMachine.tsx
- src/lib/diorama/src/components/infrastructure/ACUnit.tsx
- src/lib/diorama/src/components/infrastructure/AirConditioner.tsx
- src/lib/diorama/src/components/infrastructure/Antenna.tsx
- src/lib/diorama/src/components/infrastructure/CoolingTower.tsx
- src/lib/diorama/src/components/infrastructure/Dumpster.tsx
- src/lib/diorama/src/components/infrastructure/Elevator.tsx
- src/lib/diorama/src/components/infrastructure/Generator.tsx
- src/lib/diorama/src/components/infrastructure/HeliPad.tsx
- src/lib/diorama/src/components/infrastructure/Pipe.tsx
- src/lib/diorama/src/components/infrastructure/PowerLine.tsx
- src/lib/diorama/src/components/infrastructure/Rope.tsx
- src/lib/diorama/src/components/infrastructure/SatelliteDish.tsx
- src/lib/diorama/src/components/infrastructure/SolarPanel.tsx
- src/lib/diorama/src/components/infrastructure/StorageTank.tsx
- src/lib/diorama/src/components/infrastructure/Vent.tsx
- src/lib/diorama/src/components/infrastructure/WaterTank.tsx
- src/lib/diorama/src/components/maritime/Anchor.tsx
- src/lib/diorama/src/components/maritime/Boat.tsx
- src/lib/diorama/src/components/maritime/Bridge.tsx
- src/lib/diorama/src/components/maritime/Buoy.tsx
- src/lib/diorama/src/components/maritime/Canal.tsx
- src/lib/diorama/src/components/maritime/DockingStation.tsx
- src/lib/diorama/src/components/maritime/FishingNet.tsx
- src/lib/diorama/src/components/maritime/FloatingPlatform.tsx
- src/lib/diorama/src/components/maritime/Houseboat.tsx
- src/lib/diorama/src/components/maritime/Pier.tsx
- src/lib/diorama/src/components/maritime/Pontoon.tsx
- src/lib/diorama/src/components/maritime/Puddle.tsx
- src/lib/diorama/src/components/maritime/RainCollector.tsx
- src/lib/diorama/src/components/maritime/Water.tsx
- Maritime port target: `src/app/engine/maritime/maritime-kit.ts`
- Vegetation port target: `src/app/engine/vegetation/vegetation-kit.ts`
- Environment port target: `src/app/engine/environment/environment-kit.ts`
...

### Playground Compounds
- Total: 5
- _legacy/apps/playground/src/compounds/Alley.tsx → `src/app/engine/compounds/alley-compound.ts`
- _legacy/apps/playground/src/compounds/Bridge.tsx → `src/app/engine/compounds/bridge-compound.ts`
- _legacy/apps/playground/src/compounds/Building.tsx → `src/app/engine/compounds/building-compound.ts`
- _legacy/apps/playground/src/compounds/Room.tsx → `src/app/engine/compounds/room-compound.ts`
- _legacy/apps/playground/src/compounds/Street.tsx → `src/app/engine/compounds/street-compound.ts` (integrated)

### Playground Tests (reference scenes)
- Total: 27
- _legacy/apps/playground/src/tests/AlleyTest.tsx
- _legacy/apps/playground/src/tests/BlockTest.tsx
- _legacy/apps/playground/src/tests/BridgeTest.tsx
- _legacy/apps/playground/src/tests/BuildingTest.tsx
- _legacy/apps/playground/src/tests/CellTest.tsx
- _legacy/apps/playground/src/tests/ColorPaletteTest.tsx
- _legacy/apps/playground/src/tests/ComponentShowcaseTest.tsx
- _legacy/apps/playground/src/tests/CornerWallTest.tsx
- _legacy/apps/playground/src/tests/DesignSystemTest.tsx
- _legacy/apps/playground/src/tests/FargroundTest.tsx
- _legacy/apps/playground/src/tests/FerryTest.tsx
- _legacy/apps/playground/src/tests/FloorTest.tsx
- _legacy/apps/playground/src/tests/HeroTest.tsx
- _legacy/apps/playground/src/tests/ModernMaterialsTest.tsx
- _legacy/apps/playground/src/tests/NavMeshTest.tsx
- _legacy/apps/playground/src/tests/NeonTest.tsx
- _legacy/apps/playground/src/tests/PlatformTest.tsx
- _legacy/apps/playground/src/tests/RailPathTest.tsx
- _legacy/apps/playground/src/tests/RoofTest.tsx
- _legacy/apps/playground/src/tests/RooftopProcgenTest.tsx
- _legacy/apps/playground/src/tests/RooftopSceneTest.tsx
- _legacy/apps/playground/src/tests/RoomTest.tsx
- _legacy/apps/playground/src/tests/StreamingTest.tsx
- _legacy/apps/playground/src/tests/StreetTest.tsx
- _legacy/apps/playground/src/tests/TexturedWallTest.tsx
- _legacy/apps/playground/src/tests/WallTest.tsx
- _legacy/apps/playground/src/tests/WaterTest.tsx
...

## Unity C# Inventory (feat/unity-6-migration)
- Systems: 40
- Components: 28
- Data: 9
- UI (MonoBehaviours/UI): 15
- Tests: 27

### Unity Systems (port targets)
- Assets/Scripts/Systems/AI/AIStateMachineSystem.cs
- Assets/Scripts/Systems/AI/AISystem.cs
- Assets/Scripts/Systems/AI/CrowdSystem.cs
- Assets/Scripts/Systems/AI/EnemyAISystem.cs
- Assets/Scripts/Systems/AI/PerceptionSystem.cs
- Assets/Scripts/Systems/AI/SteeringSystem.cs
- Assets/Scripts/Systems/AI/SwarmCoordinationSystem.cs
- Assets/Scripts/Systems/AI/TentacleSwarmSystem.cs
- Assets/Scripts/Systems/AI/ThreatSystem.cs
- Assets/Scripts/Systems/Abilities/AbilitySystem.cs
- Assets/Scripts/Systems/AssemblyInfo.cs
- Assets/Scripts/Systems/Audio/AudioSystem.cs
- Assets/Scripts/Systems/Combat/ArenaSystem.cs
- Assets/Scripts/Systems/Combat/BreakSystem.cs
- Assets/Scripts/Systems/Combat/CombatLogicSystem.cs
- Assets/Scripts/Systems/Combat/CombatSystem.cs
- Assets/Scripts/Systems/Combat/HazardSystem.cs
- Assets/Scripts/Systems/Combat/HitDetectionSystem.cs
- Assets/Scripts/Systems/Combat/WaterCombatSystem.cs
- Assets/Scripts/Systems/Core/GameInitializationSystem.cs
- Assets/Scripts/Systems/Dialogue/DialogueSystem.cs
- Assets/Scripts/Systems/Equipment/EquipmentSystem.cs
- Assets/Scripts/Systems/Inventory/InventorySystem.cs
- Assets/Scripts/Systems/Navigation/NavigationSystem.cs
- Assets/Scripts/Systems/Progression/AlignmentBonusSystem.cs
- Assets/Scripts/Systems/Progression/AlignmentGateSystem.cs
- Assets/Scripts/Systems/Progression/ProgressionSystem.cs
- Assets/Scripts/Systems/Progression/ReputationSystem.cs
- Assets/Scripts/Systems/Progression/StatAllocationSystem.cs
- Assets/Scripts/Systems/Quest/QuestGeneratorSystem.cs
- Assets/Scripts/Systems/Quest/QuestSystem.cs
- Assets/Scripts/Systems/Quest/QuestUIBridgeSystem.cs
- Assets/Scripts/Systems/World/BoatSystem.cs
- Assets/Scripts/Systems/World/HexGridSystem.cs
- Assets/Scripts/Systems/World/ManifestSpawnerSystem.cs
- Assets/Scripts/Systems/World/ProceduralGenerationSystem.cs
- Assets/Scripts/Systems/World/StageSystem.cs
- Assets/Scripts/Systems/World/TerritorySystem.cs
- Assets/Scripts/Systems/World/WaterSystem.cs
- Assets/Scripts/Systems/World/WeatherSystem.cs
...

### Unity Data (port targets)
- Assets/Scripts/Data/ArenaTemplates.cs
- Assets/Scripts/Data/EquipmentDatabase.cs
- Assets/Scripts/Data/FactionRelationships.cs
- Assets/Scripts/Data/ItemDatabase.cs
- Assets/Scripts/Data/ManifestSchemas.cs
- Assets/Scripts/Data/QuestTemplates.cs
- Assets/Scripts/Data/SaveDataSchema.cs
- Assets/Scripts/Data/TerritoryDefinitions.cs
- Assets/Scripts/Data/WaterVFXConfig.cs

### Unity UI (port targets)
- Assets/Scripts/MonoBehaviours/UI/DialogueUI.cs
- Assets/Scripts/MonoBehaviours/UI/EquipmentPanel.cs
- Assets/Scripts/MonoBehaviours/UI/HUDController.cs
- Assets/Scripts/MonoBehaviours/UI/InventoryScreen.cs
- Assets/Scripts/MonoBehaviours/UI/InventorySlotUI.cs
- Assets/Scripts/MonoBehaviours/UI/ItemTooltip.cs
- Assets/Scripts/MonoBehaviours/UI/MainMenuScreen.cs
- Assets/Scripts/MonoBehaviours/UI/PauseMenuScreen.cs
- Assets/Scripts/MonoBehaviours/UI/QuestHUDWidget.cs
- Assets/Scripts/MonoBehaviours/UI/QuestLogScreen.cs
- Assets/Scripts/MonoBehaviours/UI/QuestNotification.cs
- Assets/Scripts/MonoBehaviours/UI/SaveLoadScreen.cs
- Assets/Scripts/MonoBehaviours/UI/SettingsScreen.cs
- Assets/Scripts/MonoBehaviours/UI/UIManager.cs
- Assets/Scripts/MonoBehaviours/UI/UIScreen.cs

## Current TS Systems Inventory
- src/lib/core/src/systems: 10
- src/app/systems: 2
- src/app/state: 8

## Current Engine Ports (Babylon)
- Diorama layers: ProceduralBackground, MidgroundFacades, ForegroundProps
- Materials: AmbientCG PBR loader, DecalSystem, HDRI environment
- Structural: TexturedWall, Floor, Roof, StructuralKit (stairs/railing/fence/ladder/door/window/pillar/ramp/balcony/catwalk/awning/scaffold)
- Infrastructure: InfrastructureKit (AC unit, antenna, dumpster, generator, heli pad, pipe, power line, satellite dish, solar panel, storage tank, vent, water tank)

## UI Parity Map (React → Angular)

### Core HUD / Menu
- `_legacy/packages/game/src/components/react/ui/MainMenu.tsx` → `src/app/ui/main-menu.component.*` (seed + start/continue)
- `_legacy/packages/game/src/components/react/ui/FloodedWorldMenu.tsx` → `src/app/ui/main-menu.component.*` (seed preview + suggestions + enter world)
- `_legacy/packages/game/src/components/react/ui/SplashScreen.tsx` → `src/app/ui/splash-screen.component.*`
- `_legacy/packages/game/src/components/react/ui/NarrativeOverlay.tsx` → `src/app/ui/narrative-overlay.component.*`
- `_legacy/packages/game/src/components/react/ui/GameHUD.tsx` → `src/app/ui/game-hud.component.*`
- `_legacy/packages/game/src/components/react/ui/JRPGHUD.tsx` → `src/app/ui/jrpg-hud.component.*`

### Quest + Alignment
- `_legacy/packages/game/src/components/react/ui/QuestObjective.tsx` → `src/app/ui/quest-objective.component.*`
- `_legacy/packages/game/src/components/react/ui/QuestLog.tsx` → `src/app/ui/quest-log.component.*`
- `_legacy/packages/game/src/components/react/ui/QuestAcceptDialog.tsx` → `src/app/ui/quest-accept-dialog.component.*`
- `_legacy/packages/game/src/components/react/ui/QuestCompletionDialog.tsx` → `src/app/ui/quest-completion-dialog.component.*`
- `_legacy/packages/game/src/components/react/ui/AlignmentBar.tsx` → `src/app/ui/alignment-bar.component.*`

### Combat + Inventory
- `_legacy/packages/game/src/components/react/ui/CombatArena.tsx` → `src/app/ui/combat-arena.component.*`
- `_legacy/packages/game/src/components/react/ui/CombatText.tsx` → `src/app/ui/combat-text.component.*`
- `_legacy/packages/game/src/components/react/ui/InventoryScreen.tsx` → `src/app/ui/inventory-screen.component.*`
- `_legacy/packages/game/src/components/react/ui/SaveSlotSelect.tsx` → `src/app/ui/save-slot-select.component.*`
- `_legacy/packages/game/src/components/react/ui/StatAllocationModal.tsx` → `src/app/ui/stat-allocation-modal.component.*`

### Known UI Gaps (to close for 1:1 parity)
- Quest dialogs/log styling and reward detail parity (type badges, alignment labels, reward rows) — **partially closed**.
- Quest completion card (level-up banner + animated styling) — **closed**.
- Inventory detail panel parity (equipped state, item detail layout) — **closed** (equip emit added).
- Combat text variants (floating damage numbers) — **wired to combat store events** (positions are UI-staged).
- Main menu messaging still divergent in places (legacy cyberpunk vs flooded world) — need to preserve system behavior while aligning visuals.
- FloodedWorldMenu layout parity — **closed** (Angular menu now matches structure and style).
- Maritime: MaritimeKit (pier, dock, pontoon, boat, buoy, floating platform, houseboat, rain collector, fishing net, anchor)
- Vegetation: VegetationKit (tree, palm, shrub, grass, vine, mushroom, flower bed)
- Environment: EnvironmentKit (steam vent, fog panel)
- Furniture: FurnitureKit (bench, trash can, vending machine, mailbox, planter, phone booth, hydrant, parking meter, bollard, manhole, drain grate, shopping cart, umbrella, newspaper)
- Props: PropKit (crate, barrel, debris, pallet stack, tarp, tarpaulin, clothesline, tent, bicycle, bicycle rack, carcass)
- Signage: SignageKit (street light, lamppost, billboard, poster, traffic sign, signpost, lantern, graffiti, flagpole)

### Unity System → TS Candidate Matches
This is a heuristic name match to prioritize manual mapping.
- AIStateMachineSystem: (no match)
- AISystem: (no match)
- AbilitySystem: (no match)
- AlignmentBonusSystem: (no match)
- AlignmentGateSystem: (no match)
- ArenaSystem: (no match)
- AssemblyInfo: (no match)
- AudioSystem: (no match)
- BoatSystem: (no match)
- BreakSystem: BreakSystem
- CombatLogicSystem: CombatLogic
- CombatSystem: CombatLogic, CombatSystem
- CrowdSystem: (no match)
- DialogueSystem: dialogue.service
- EnemyAISystem: (no match)
- EquipmentSystem: (no match)
- GameInitializationSystem: (no match)
- HazardSystem: (no match)
- HexGridSystem: (no match)
- HitDetectionSystem: HitDetection
- InventorySystem: (no match)
- ManifestSpawnerSystem: (no match)
- NavigationSystem: (no match)
- PerceptionSystem: (no match)
- ProceduralGenerationSystem: (no match)
- ProgressionSystem: (no match)
- QuestGeneratorSystem: QuestGenerator
- QuestSystem: QuestGenerator, quest-store.service
- QuestUIBridgeSystem: (no match)
- ReputationSystem: ReputationSystem
- StageSystem: (no match)
- StatAllocationSystem: StatAllocation
- SteeringSystem: (no match)
- SwarmCoordinationSystem: (no match)
- TentacleSwarmSystem: (no match)
- TerritorySystem: (no match)
- ThreatSystem: (no match)
- WaterCombatSystem: (no match)
- WaterSystem: (no match)
- WeatherSystem: (no match)

## Required Parity Work (Prioritized)
1. Complete port of remaining diorama categories (structural, props, signage, infrastructure, environment, vegetation, maritime).
2. Validate compound assemblies (Building, Street, Bridge, Alley, Room) via legacy test scenes; integrate StreetCompound into a visible scene.
3. Port Unity gameplay systems (Combat, AI, Quest, Progression, Inventory) into TS equivalents aligned with Golden Record.
4. Port Unity UI flows (HUD, QuestLog, Inventory, Dialogue, Save/Load) and align Angular UI 1:1 before enhancements.
5. Integrate AmbientCG + Decal + HDRI systems into runtime rendering with asset paths validated.
