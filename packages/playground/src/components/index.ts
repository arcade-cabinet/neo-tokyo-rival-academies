/**
 * Component Index
 *
 * Exports all playground components for procedural world generation.
 * See COMPONENT_TAXONOMY.md for the full breakdown.
 */

// =============================================================================
// STRUCTURAL PRIMITIVES
// =============================================================================

export { Wall, type WallProps, type WallMaterial, type WallCondition } from "./Wall";
export { TexturedWall, type TexturedWallProps, type WallTextureType } from "./TexturedWall";
export { Floor, type FloorProps, type FloorSurface } from "./Floor";
export { Roof, type RoofProps, type RoofStyle } from "./Roof";
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
export { Gutter, type GutterProps, type GutterType } from "./Gutter";
export { Shutter, type ShutterProps, type ShutterType, type ShutterState } from "./Shutter";
export { Chimney, type ChimneyProps, type ChimneyType } from "./Chimney";
export { Skylight, type SkylightProps, type SkylightType } from "./Skylight";

// =============================================================================
// WATER & FLOODED ELEMENTS
// =============================================================================

export { Water, type WaterProps, type WaterPreset } from "./Water";
export { DockingStation, type DockingStationProps, type DockType } from "./DockingStation";
export { Pier, type PierProps, type PierStyle } from "./Pier";
export { Pontoon, type PontoonProps, type PontoonType } from "./Pontoon";
export { FloatingPlatform, type FloatingPlatformProps, type FloatingPlatformType } from "./FloatingPlatform";
export { Houseboat, type HouseboatProps, type HouseboatType } from "./Houseboat";
export { Bridge, type BridgeProps, type BridgeType } from "./Bridge";
export { Canal, type CanalProps, type CanalType } from "./Canal";
export { Boat, type BoatProps, type BoatType, type BoatState } from "./Boat";
export { Buoy, type BuoyProps, type BuoyType, type BuoyColor } from "./Buoy";
export { Puddle, type PuddleProps, type PuddleType, type PuddleCondition } from "./Puddle";
export { RainCollector, type RainCollectorProps, type RainCollectorType, type RainCollectorCondition } from "./RainCollector";
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

export { NeonSign, type NeonSignProps, type NeonShape, type NeonMountType } from "./NeonSign";
export { StreetLight, type StreetLightProps, type LightStyle, type LightState } from "./StreetLight";
export { Billboard, type BillboardProps, type BillboardType, type BillboardSize } from "./Billboard";
export { Poster, type PosterProps, type PosterType, type PosterSize } from "./Poster";
export { TrafficSign, type TrafficSignProps, type TrafficSignType, type TrafficSignCondition } from "./TrafficSign";
export { Signpost, type SignpostProps, type SignpostType } from "./Signpost";
export { Lamppost, type LamppostProps, type LamppostType } from "./Lamppost";
export { Graffiti, type GraffitiProps, type GraffitiType, type GraffitiSize } from "./Graffiti";
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
export { PhoneBooth, type PhoneBoothProps, type PhoneBoothType } from "./PhoneBooth";
export { FireHydrant, type FireHydrantProps, type HydrantType, type HydrantCondition } from "./FireHydrant";
export { ParkingMeter, type ParkingMeterProps, type MeterType, type MeterCondition } from "./ParkingMeter";
export { BollardPost, type BollardPostProps, type BollardType, type BollardCondition } from "./BollardPost";
export { Manhole, type ManholeProps, type ManholeType, type ManholeState, type ManholeCondition } from "./Manhole";
export { DrainGrate, type DrainGrateProps, type DrainType, type DrainCondition } from "./DrainGrate";
export { ShoppingCart, type ShoppingCartProps, type ShoppingCartType, type ShoppingCartState } from "./ShoppingCart";
export { Umbrella, type UmbrellaProps, type UmbrellaType, type UmbrellaState } from "./Umbrella";
export { Newspaper, type NewspaperProps, type NewspaperType } from "./Newspaper";

// =============================================================================
// UTILITIES & INFRASTRUCTURE
// =============================================================================

export { Pipe, type PipeProps, type PipeMaterial, type PipeSize } from "./Pipe";
export { ACUnit, type ACUnitProps, type ACSize } from "./ACUnit";
export { AirConditioner, type AirConditionerProps, type AirConditionerType } from "./AirConditioner";
export { PowerLine, type PowerLineProps, type PowerLineType } from "./PowerLine";
export { Antenna, type AntennaProps, type AntennaType } from "./Antenna";
export { SatelliteDish, type SatelliteDishProps, type SatelliteDishType } from "./SatelliteDish";
export { WaterTank, type WaterTankProps, type WaterTankType } from "./WaterTank";
export { StorageTank, type StorageTankProps, type StorageTankType, type StorageTankContent } from "./StorageTank";
export { Generator, type GeneratorProps, type GeneratorType } from "./Generator";
export { Dumpster, type DumpsterProps, type DumpsterType, type DumpsterCondition } from "./Dumpster";
export { Elevator, type ElevatorProps, type ElevatorType, type ElevatorCondition } from "./Elevator";
export { Vent, type VentProps, type VentType, type VentCondition } from "./Vent";
export { SolarPanel, type SolarPanelProps, type SolarPanelType, type SolarPanelCondition } from "./SolarPanel";
export { CoolingTower, type CoolingTowerProps, type CoolingTowerType, type CoolingTowerCondition } from "./CoolingTower";
export { HeliPad, type HeliPadProps, type HeliPadType } from "./HeliPad";
export { Rope, type RopeProps, type RopeType, type RopeStyle } from "./Rope";

// =============================================================================
// VEGETATION
// =============================================================================

export { Tree, type TreeProps, type TreeType, type TreeSize } from "./Tree";
export { Shrub, type ShrubProps, type ShrubType } from "./Shrub";
export { GrassClump, type GrassClumpProps, type GrassType } from "./GrassClump";
export { Vine, type VineProps, type VineType, type VineCondition } from "./Vine";
export { Mushroom, type MushroomProps, type MushroomType, type MushroomCondition } from "./Mushroom";
export { FlowerBed, type FlowerBedProps, type FlowerBedType, type FlowerBedCondition, type FlowerType } from "./FlowerBed";

// =============================================================================
// PROPS & CLUTTER
// =============================================================================

export { Crate, type CrateProps, type CrateType, type CrateSize } from "./Crate";
export { CrateStack, type CrateStackProps, type CrateStackType, type CrateStackArrangement } from "./CrateStack";
export { Barrel, type BarrelProps, type BarrelType, type BarrelContent } from "./Barrel";
export { Debris, type DebrisProps, type DebrisType, type DebrisSize } from "./Debris";
export { PalletStack, type PalletStackProps, type PalletType, type PalletState } from "./PalletStack";
export { Tarp, type TarpProps, type TarpType } from "./Tarp";
export { Tarpaulin, type TarpaulinProps, type TarpaulinType, type TarpaulinColor } from "./Tarpaulin";
export { Clothesline, type ClotheslineProps, type ClotheslineType } from "./Clothesline";
export { TentStructure, type TentStructureProps, type TentType, type TentState } from "./TentStructure";

// =============================================================================
// ATMOSPHERIC EFFECTS
// =============================================================================

export { SteamVent, type SteamVentProps, type VentType as SteamVentType, type VentContent } from "./SteamVent";
export { Fog, type FogProps, type FogType } from "./Fog";

// =============================================================================
// ENVIRONMENT
// =============================================================================

export { Farground, type FargroundProps } from "./Farground";

// =============================================================================
// CHARACTER & NAVIGATION
// =============================================================================

export { Hero, type HeroProps } from "./Hero";
export { NavMesh, type NavMeshProps } from "./NavMesh";
