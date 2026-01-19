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

// =============================================================================
// WATER & FLOODED ELEMENTS
// =============================================================================

export { Water, type WaterProps } from "./Water";
export { DockingStation, type DockingStationProps } from "./DockingStation";
export { Pier, type PierProps, type PierStyle } from "./Pier";
export { Pontoon, type PontoonProps, type PontoonType } from "./Pontoon";

// =============================================================================
// TRANSPORT SYSTEMS
// =============================================================================

export { RailPath, type RailPathProps } from "./RailPath";

// =============================================================================
// SIGNAGE & LIGHTING
// =============================================================================

export { NeonSign, type NeonSignProps } from "./NeonSign";
export { StreetLight, type StreetLightProps, type LightStyle, type LightState } from "./StreetLight";
export { Billboard, type BillboardProps, type BillboardType, type BillboardSize } from "./Billboard";

// =============================================================================
// URBAN FURNITURE
// =============================================================================

export { VendingMachine, type VendingMachineProps, type VendingMachineType } from "./VendingMachine";

// =============================================================================
// UTILITIES & INFRASTRUCTURE
// =============================================================================

export { Pipe, type PipeProps, type PipeMaterial, type PipeSize } from "./Pipe";
export { ACUnit, type ACUnitProps, type ACSize } from "./ACUnit";

// =============================================================================
// VEGETATION
// =============================================================================

export { Tree, type TreeProps, type TreeType, type TreeSize } from "./Tree";

// =============================================================================
// PROPS & CLUTTER
// =============================================================================

export { Crate, type CrateProps, type CrateType, type CrateSize } from "./Crate";
export { Barrel, type BarrelProps, type BarrelType, type BarrelContent } from "./Barrel";
export { Debris, type DebrisProps, type DebrisType, type DebrisSize } from "./Debris";

// =============================================================================
// ATMOSPHERIC EFFECTS
// =============================================================================

export { SteamVent, type SteamVentProps, type VentType, type VentContent } from "./SteamVent";

// =============================================================================
// ENVIRONMENT
// =============================================================================

export { Farground, type FargroundProps } from "./Farground";

// =============================================================================
// CHARACTER & NAVIGATION
// =============================================================================

export { Hero, type HeroProps } from "./Hero";
export { NavMesh, type NavMeshProps } from "./NavMesh";
