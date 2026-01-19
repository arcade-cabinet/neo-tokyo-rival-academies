/**
 * Component Index
 *
 * Exports all playground components for procedural world generation.
 * See COMPONENT_TAXONOMY.md for the full breakdown.
 */

// =============================================================================
// STRUCTURAL PRIMITIVES
// =============================================================================

export { Wall, type WallProps } from "./Wall";
export { TexturedWall, type TexturedWallProps } from "./TexturedWall";
export { Floor, type FloorProps } from "./Floor";
export { Roof, type RoofProps } from "./Roof";
export { Platform, type PlatformProps } from "./Platform";
export { Stairs, type StairsProps, type StairType, type StairMaterial } from "./Stairs";
export { Ramp, type RampProps, type RampMaterial, type RampStyle } from "./Ramp";
export { Door, type DoorProps, type DoorType, type DoorMaterial, type DoorState } from "./Door";
export { Window, type WindowProps, type WindowType, type WindowState } from "./Window";
export { Balcony, type BalconyProps, type BalconyType, type BalconyMaterial } from "./Balcony";
export { Pillar, type PillarProps, type PillarShape, type PillarMaterial } from "./Pillar";
export { Railing, type RailingProps, type RailingStyle, type RailingMaterial } from "./Railing";
export { Awning, type AwningProps, type AwningStyle, type AwningFabric } from "./Awning";
export { Fence, type FenceProps, type FenceStyle, type FenceCondition } from "./Fence";
export { Ladder, type LadderProps, type LadderType, type LadderMaterial } from "./Ladder";
export { FireEscape, type FireEscapeProps, type FireEscapeStyle } from "./FireEscape";
export { Catwalk, type CatwalkProps, type CatwalkStyle, type CatwalkRailing } from "./Catwalk";
export { Scaffolding, type ScaffoldingProps, type ScaffoldingType } from "./Scaffolding";
export { Gutter, type GutterProps, type GutterType, type GutterMaterial } from "./Gutter";
export { Shutter, type ShutterProps, type ShutterType, type ShutterState } from "./Shutter";
export { Chimney, type ChimneyProps, type ChimneyType, type ChimneyMaterial } from "./Chimney";
export { Skylight, type SkylightProps, type SkylightType, type SkylightState } from "./Skylight";

// =============================================================================
// WATER & FLOODED ELEMENTS
// =============================================================================

export { Water, type WaterProps } from "./Water";
export { DockingStation, type DockingStationProps } from "./DockingStation";
export { Pier, type PierProps, type PierStyle } from "./Pier";
export { Pontoon, type PontoonProps, type PontoonType } from "./Pontoon";
export { FloatingPlatform, type FloatingPlatformProps, type FloatingPlatformType } from "./FloatingPlatform";
export { Houseboat, type HouseboatProps, type HouseboatType, type HouseboatCondition } from "./Houseboat";
export { Bridge, type BridgeProps, type BridgeType, type BridgeMaterial } from "./Bridge";
export { Canal, type CanalProps, type CanalType } from "./Canal";
export { Boat, type BoatProps, type BoatType, type BoatState } from "./Boat";
export { Buoy, type BuoyProps, type BuoyType, type BuoyState } from "./Buoy";
export { Puddle, type PuddleProps, type PuddleType, type PuddleLiquid } from "./Puddle";
export { RainCollector, type RainCollectorProps, type RainCollectorType } from "./RainCollector";
export { FishingNet, type FishingNetProps, type FishingNetType, type FishingNetState } from "./FishingNet";
export { Anchor, type AnchorProps, type AnchorType, type AnchorState } from "./Anchor";

// =============================================================================
// TRANSPORT SYSTEMS
// =============================================================================

export { RailPath, type RailPathProps } from "./RailPath";
export { Bicycle, type BicycleProps, type BicycleType, type BicycleState } from "./Bicycle";
export { BicycleRack, type BicycleRackProps, type BicycleRackType } from "./BicycleRack";
export { Carcass, type CarcassProps, type CarcassType, type CarcassState } from "./Carcass";

// =============================================================================
// SIGNAGE & LIGHTING
// =============================================================================

export { NeonSign, type NeonSignProps } from "./NeonSign";
export { StreetLight, type StreetLightProps, type LightStyle, type LightState } from "./StreetLight";
export { Billboard, type BillboardProps, type BillboardType, type BillboardSize } from "./Billboard";
export { Poster, type PosterProps, type PosterType, type PosterCondition } from "./Poster";
export { TrafficSign, type TrafficSignProps, type TrafficSignType, type SignCondition } from "./TrafficSign";
export { Signpost, type SignpostProps, type SignpostType } from "./Signpost";
export { Lamppost, type LamppostProps, type LamppostStyle } from "./Lamppost";
export { Graffiti, type GraffitiProps, type GraffitiStyle, type GraffitiSize } from "./Graffiti";
export { Lantern, type LanternProps, type LanternType } from "./Lantern";
export { Flagpole, type FlagpoleProps, type FlagpoleType } from "./Flagpole";

// =============================================================================
// URBAN FURNITURE
// =============================================================================

export { VendingMachine, type VendingMachineProps, type VendingMachineType } from "./VendingMachine";
export { Bench, type BenchProps, type BenchStyle, type BenchCondition } from "./Bench";
export { TrashCan, type TrashCanProps, type TrashCanStyle, type TrashCanCondition } from "./TrashCan";
export { Mailbox, type MailboxProps, type MailboxType } from "./Mailbox";
export { Planter, type PlanterProps, type PlanterStyle, type PlanterMaterial } from "./Planter";
export { PhoneBooth, type PhoneBoothProps, type PhoneBoothType, type PhoneBoothCondition } from "./PhoneBooth";
export { FireHydrant, type FireHydrantProps, type FireHydrantType } from "./FireHydrant";
export { ParkingMeter, type ParkingMeterProps, type ParkingMeterType, type ParkingMeterState } from "./ParkingMeter";
export { BollardPost, type BollardPostProps, type BollardPostType } from "./BollardPost";
export { Manhole, type ManholeProps, type ManholeType, type ManholeState } from "./Manhole";
export { DrainGrate, type DrainGrateProps, type DrainGrateType, type DrainGrateState } from "./DrainGrate";
export { ShoppingCart, type ShoppingCartProps, type ShoppingCartState } from "./ShoppingCart";
export { Umbrella, type UmbrellaProps, type UmbrellaType, type UmbrellaState } from "./Umbrella";
export { Newspaper, type NewspaperProps, type NewspaperType, type NewspaperState } from "./Newspaper";

// =============================================================================
// UTILITIES & INFRASTRUCTURE
// =============================================================================

export { Pipe, type PipeProps, type PipeMaterial, type PipeSize } from "./Pipe";
export { ACUnit, type ACUnitProps, type ACSize } from "./ACUnit";
export { AirConditioner, type AirConditionerProps, type AirConditionerType } from "./AirConditioner";
export { PowerLine, type PowerLineProps, type PowerLineType } from "./PowerLine";
export { Antenna, type AntennaProps, type AntennaType } from "./Antenna";
export { SatelliteDish, type SatelliteDishProps, type SatelliteDishType, type SatelliteDishState } from "./SatelliteDish";
export { WaterTank, type WaterTankProps, type WaterTankType } from "./WaterTank";
export { StorageTank, type StorageTankProps, type StorageTankType, type StorageTankContent } from "./StorageTank";
export { Generator, type GeneratorProps, type GeneratorType } from "./Generator";
export { Dumpster, type DumpsterProps, type DumpsterType, type DumpsterCondition } from "./Dumpster";
export { Elevator, type ElevatorProps, type ElevatorType, type ElevatorState } from "./Elevator";
export { Vent, type VentProps, type VentType, type VentState } from "./Vent";
export { SolarPanel, type SolarPanelProps, type SolarPanelType, type SolarPanelState } from "./SolarPanel";
export { CoolingTower, type CoolingTowerProps, type CoolingTowerType, type CoolingTowerState } from "./CoolingTower";
export { HeliPad, type HeliPadProps, type HeliPadType } from "./HeliPad";
export { Rope, type RopeProps, type RopeType, type RopeState } from "./Rope";

// =============================================================================
// VEGETATION
// =============================================================================

export { Tree, type TreeProps, type TreeType, type TreeSize } from "./Tree";
export { Shrub, type ShrubProps, type ShrubType, type ShrubSize } from "./Shrub";
export { GrassClump, type GrassClumpProps, type GrassType, type GrassSize } from "./GrassClump";
export { Vine, type VineProps, type VineType, type VineGrowth } from "./Vine";
export { Mushroom, type MushroomProps, type MushroomType, type MushroomState } from "./Mushroom";
export { FlowerBed, type FlowerBedProps, type FlowerBedType, type FlowerBedCondition } from "./FlowerBed";

// =============================================================================
// PROPS & CLUTTER
// =============================================================================

export { Crate, type CrateProps, type CrateType, type CrateSize } from "./Crate";
export { CrateStack, type CrateStackProps, type CrateStackType } from "./CrateStack";
export { Barrel, type BarrelProps, type BarrelType, type BarrelContent } from "./Barrel";
export { Debris, type DebrisProps, type DebrisType, type DebrisSize } from "./Debris";
export { PalletStack, type PalletStackProps, type PalletType } from "./PalletStack";
export { Tarp, type TarpProps, type TarpType, type TarpState } from "./Tarp";
export { Tarpaulin, type TarpaulinProps, type TarpaulinColor, type TarpaulinState } from "./Tarpaulin";
export { Clothesline, type ClotheslineProps, type ClotheslineType } from "./Clothesline";
export { TentStructure, type TentStructureProps, type TentType, type TentState } from "./TentStructure";

// =============================================================================
// ATMOSPHERIC EFFECTS
// =============================================================================

export { SteamVent, type SteamVentProps, type VentType as SteamVentType, type VentContent } from "./SteamVent";
export { Fog, type FogProps, type FogType, type FogDensity } from "./Fog";

// =============================================================================
// ENVIRONMENT
// =============================================================================

export { Farground, type FargroundProps } from "./Farground";

// =============================================================================
// CHARACTER & NAVIGATION
// =============================================================================

export { Hero, type HeroProps } from "./Hero";
export { NavMesh, type NavMeshProps } from "./NavMesh";
