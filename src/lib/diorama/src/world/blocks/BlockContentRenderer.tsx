/**
 * BlockContentRenderer - Renders block content from rules
 *
 * Takes a BlockDefinition + seed and renders all the components
 * defined by the BlockContent rules system.
 *
 * This is where the 100+ primitives become actual block assemblages.
 */

import { Vector3 } from '@babylonjs/core';
import type { ReactNode } from 'react';
// Import ALL components that can be spawned from the barrel export
import {
  // Infrastructure
  ACUnit,
  Anchor,
  Antenna,
  Barrel,
  Bench,
  Billboard,
  BollardPost,
  // Water & Maritime
  Buoy,
  // Props & Clutter
  Crate,
  Debris,
  FireHydrant,
  FishingNet,
  Flagpole,
  // Structure
  Floor,
  Generator,
  Graffiti,
  GrassClump,
  Lamppost,
  Lantern,
  // Signage & Lighting
  NeonSign,
  PalletStack,
  PhoneBooth,
  Pipe,
  Planter,
  Poster,
  Roof,
  Rope,
  SatelliteDish,
  Shrub,
  SolarPanel,
  StreetLight,
  Tarp,
  TexturedWall,
  TrafficSign,
  TrashCan,
  Tree,
  Umbrella,
  // Urban Furniture
  VendingMachine,
  Vent,
  // Vegetation
  Vine,
  WaterTank,
} from '../../components';
import type { BlockDefinition, BlockInstance, FactionAffinity } from './Block';
import { type ComponentSpawn, generateBlockContent, getBlockContent } from './BlockContent';

// ============================================================================
// COMPONENT REGISTRY
// ============================================================================

/**
 * Maps component names to actual React components
 */
const COMPONENT_REGISTRY: Record<string, React.ComponentType<Record<string, unknown>>> = {
  // Structure
  Floor,
  TexturedWall,
  Roof,

  // Props
  Crate,
  Barrel,
  Tarp,
  Debris,
  PalletStack,

  // Urban Furniture
  VendingMachine,
  Bench,
  TrashCan,
  Planter,
  Umbrella,
  PhoneBooth,
  FireHydrant,
  BollardPost,
  Bollard: BollardPost, // Alias

  // Infrastructure
  ACUnit,
  WaterTank,
  Generator,
  Pipe,
  Vent,
  SolarPanel,
  Antenna,
  SatelliteDish,

  // Signage & Lighting
  NeonSign,
  StreetLight,
  Billboard,
  Poster,
  TrafficSign,
  Lamppost,
  Graffiti,
  Lantern,
  Flagpole,

  // Vegetation
  Vine,
  Shrub,
  Tree,
  GrassClump,

  // Water & Maritime
  Buoy,
  Anchor,
  FishingNet,
  Rope,
};

// ============================================================================
// SPAWN RENDERER
// ============================================================================

interface SpawnRendererProps {
  spawn: ComponentSpawn;
  index: number;
  blockId: string;
}

/**
 * Renders a single spawned component
 */
function SpawnRenderer({ spawn, index, blockId }: SpawnRendererProps) {
  const Component = COMPONENT_REGISTRY[spawn.component];

  if (!Component) {
    console.warn(`[BlockContent] Unknown component: ${spawn.component}`);
    return null;
  }

  const id = `${blockId}_${spawn.component}_${index}`;

  return (
    <Component
      id={id}
      position={spawn.position}
      rotation={spawn.rotation}
      seed={spawn.seed}
      {...spawn.props}
    />
  );
}

// ============================================================================
// STRUCTURE RENDERER
// ============================================================================

interface StructureRendererProps {
  blockId: string;
  definition: BlockDefinition;
  position: Vector3;
  rotation: number;
}

/**
 * Renders the base structure (floor, walls, roof) of a block
 */
function StructureRenderer({ blockId, definition, position, rotation }: StructureRendererProps) {
  const content = getBlockContent(definition);
  if (!content?.structure) return null;

  const { width, height, depth } = definition.dimensions;
  const elements: ReactNode[] = [];

  // Floor
  if (content.structure.floor) {
    const FloorComponent = COMPONENT_REGISTRY[content.structure.floor.component];
    if (FloorComponent) {
      elements.push(
        <FloorComponent
          key={`${blockId}_floor`}
          id={`${blockId}_floor`}
          position={position}
          size={{ width, depth }}
          {...content.structure.floor.props}
        />
      );
    }
  }

  // Walls
  if (content.structure.walls) {
    for (const wall of content.structure.walls) {
      const WallComponent = COMPONENT_REGISTRY[wall.component];
      if (!WallComponent) continue;

      let wallPos: Vector3;
      let wallRot = rotation;
      const wallSize = { width: 0, height, depth: 0.2 };

      switch (wall.side) {
        case 'north':
          wallPos = new Vector3(position.x, position.y + height / 2, position.z - depth / 2);
          wallSize.width = width;
          break;
        case 'south':
          wallPos = new Vector3(position.x, position.y + height / 2, position.z + depth / 2);
          wallSize.width = width;
          wallRot = rotation + Math.PI;
          break;
        case 'east':
          wallPos = new Vector3(position.x + width / 2, position.y + height / 2, position.z);
          wallSize.width = depth;
          wallRot = rotation + Math.PI / 2;
          break;
        case 'west':
          wallPos = new Vector3(position.x - width / 2, position.y + height / 2, position.z);
          wallSize.width = depth;
          wallRot = rotation - Math.PI / 2;
          break;
        default:
          continue;
      }

      elements.push(
        <WallComponent
          key={`${blockId}_wall_${wall.side}`}
          id={`${blockId}_wall_${wall.side}`}
          position={wallPos}
          size={wallSize}
          rotation={wallRot}
          {...wall.props}
        />
      );
    }
  }

  // Roof
  if (content.structure.roof) {
    const RoofComponent = COMPONENT_REGISTRY[content.structure.roof.component];
    if (RoofComponent) {
      elements.push(
        <RoofComponent
          key={`${blockId}_roof`}
          id={`${blockId}_roof`}
          position={new Vector3(position.x, position.y + height, position.z)}
          size={{ width, depth, thickness: 0.15 }}
          {...content.structure.roof.props}
        />
      );
    }
  }

  return <>{elements}</>;
}

// ============================================================================
// MAIN BLOCK CONTENT RENDERER
// ============================================================================

export interface BlockContentRendererProps {
  /** Block instance to render */
  instance?: BlockInstance;
  /** Or provide definition directly */
  definition?: BlockDefinition;
  /** Block position (required if using definition) */
  position?: Vector3;
  /** Block rotation in radians */
  rotation?: number;
  /** Seed for procedural content */
  seed?: number;
  /** Override faction for content generation */
  factionOverride?: FactionAffinity;
  /** Show debug info */
  debug?: boolean;
  /** Render structure (floor/walls/roof) */
  renderStructure?: boolean;
  /** Render props (furniture/equipment) */
  renderProps?: boolean;
}

/**
 * Renders all content for a block based on rules
 */
export function BlockContentRenderer({
  instance,
  definition: defProp,
  position: posProp,
  rotation: rotProp = 0,
  seed: seedProp,
  factionOverride,
  debug = false,
  renderStructure = true,
  renderProps = true,
}: BlockContentRendererProps) {
  // Resolve params from instance or props
  const definition = instance?.definition ?? defProp;
  const position = instance
    ? new Vector3(instance.position.x, instance.position.y, instance.position.z)
    : (posProp ?? Vector3.Zero());
  const rotation = instance ? (instance.rotation * Math.PI) / 180 : rotProp;
  const seed = instance?.seed ?? seedProp ?? 12345;
  const faction = factionOverride ?? instance?.factionOverride ?? definition?.faction;

  if (!definition) {
    console.warn('[BlockContentRenderer] No definition provided');
    return null;
  }

  const blockId = instance?.instanceId ?? `block_${definition.typeId}_${seed}`;

  // Generate content spawns
  const spawns = renderProps
    ? generateBlockContent(definition, position, rotation, seed, faction)
    : [];

  if (debug) {
    console.log(`[BlockContent] ${blockId}: Generated ${spawns.length} spawns`);
    spawns.forEach((s, i) => {
      console.log(
        `  [${i}] ${s.component} at (${s.position.x.toFixed(1)}, ${s.position.y.toFixed(1)}, ${s.position.z.toFixed(1)})`
      );
    });
  }

  return (
    <>
      {/* Render base structure */}
      {renderStructure && (
        <StructureRenderer
          blockId={blockId}
          definition={definition}
          position={position}
          rotation={rotation}
        />
      )}

      {/* Render all spawned content */}
      {spawns.map((spawn, index) => {
        // Create unique key from spawn properties (component + position + seed)
        const spawnKey = `${blockId}_${spawn.component}_${spawn.position.x.toFixed(2)}_${spawn.position.y.toFixed(2)}_${spawn.position.z.toFixed(2)}_${spawn.seed}`;
        return <SpawnRenderer key={spawnKey} spawn={spawn} index={index} blockId={blockId} />;
      })}
    </>
  );
}

export default BlockContentRenderer;
