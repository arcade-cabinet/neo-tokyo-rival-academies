/**
 * FloodedWorldScene - ALPHA Rooftop Procgen Validation
 *
 * Generates connected rooftops from a seed phrase.
 * Fixed academy start with procedural expansion.
 *
 * ALPHA Goals:
 * - Validate procgen creates coherent connected spaces
 * - Hero placement on geometry
 * - No quests/combat - just spatial validation
 */

import { Color3, Vector3 } from '@babylonjs/core';
import {
  ACUnit,
  Antenna,
  Barrel,
  Bench,
  Character,
  Crate,
  CyberpunkNeonLights,
  createSubRNG,
  createWorldRNG,
  Debris,
  DirectionalLightWithShadows,
  // Components
  Floor,
  IsometricCamera,
  Lantern,
  NeonSign,
  Planter,
  PlayerController,
  SatelliteDish,
  type SeedPhrase,
  SolarPanel,
  Tarp,
  TexturedWall,
  Vent,
  WaterTank,
  type WorldRNG,
} from '@neo-tokyo/diorama';
import { useCallback, useMemo, useState } from 'react';

interface RooftopBlock {
  id: string;
  position: Vector3;
  width: number;
  depth: number;
  height: number; // Base height (water level offset)
  type: 'academy' | 'residential' | 'commercial' | 'industrial';
  connections: string[]; // IDs of connected rooftops
}

interface BridgeConnection {
  id: string;
  from: string;
  to: string;
  startPos: Vector3;
  endPos: Vector3;
  width: number;
}

interface FloodedWorldSceneProps {
  seedPhrase: SeedPhrase;
  onExit?: () => void;
}

// Rooftop generation parameters
const ROOFTOP_CONFIG = {
  // Academy (fixed start)
  academy: {
    width: { min: 12, max: 16 },
    depth: { min: 10, max: 14 },
    height: { min: 8, max: 12 },
  },
  residential: {
    width: { min: 6, max: 10 },
    depth: { min: 6, max: 10 },
    height: { min: 5, max: 10 },
  },
  commercial: {
    width: { min: 8, max: 14 },
    depth: { min: 8, max: 12 },
    height: { min: 6, max: 15 },
  },
  industrial: {
    width: { min: 10, max: 18 },
    depth: { min: 8, max: 14 },
    height: { min: 4, max: 8 },
  },
};

function generateRooftopLayout(
  rng: WorldRNG,
  count: number
): { rooftops: RooftopBlock[]; bridges: BridgeConnection[] } {
  const rooftops: RooftopBlock[] = [];
  const bridges: BridgeConnection[] = [];

  // First rooftop is always the academy (spawn point)
  const academyConfig = ROOFTOP_CONFIG.academy;
  const academy: RooftopBlock = {
    id: 'academy_main',
    position: Vector3.Zero(),
    width: rng.int(academyConfig.width.min, academyConfig.width.max),
    depth: rng.int(academyConfig.depth.min, academyConfig.depth.max),
    height: rng.int(academyConfig.height.min, academyConfig.height.max),
    type: 'academy',
    connections: [],
  };
  rooftops.push(academy);

  // Generate additional rooftops in a rough grid with gaps
  const types: Array<'residential' | 'commercial' | 'industrial'> = [
    'residential',
    'commercial',
    'industrial',
  ];

  for (let i = 1; i < count; i++) {
    const type = rng.pick(types);
    const config = ROOFTOP_CONFIG[type];

    // Find a rooftop to connect from
    const sourceIdx = rng.int(0, rooftops.length);
    const source = rooftops[sourceIdx];

    // Position relative to source with gap
    const direction = rng.pick(['north', 'south', 'east', 'west']);
    const gap = rng.int(3, 8); // Bridge span
    const offset = (rng.next() - 0.5) * 10; // Lateral offset

    const width = rng.int(config.width.min, config.width.max);
    const depth = rng.int(config.depth.min, config.depth.max);
    const height = rng.int(config.height.min, config.height.max);

    let position: Vector3;
    switch (direction) {
      case 'north':
        position = new Vector3(
          source.position.x + offset,
          0,
          source.position.z - source.depth / 2 - gap - depth / 2
        );
        break;
      case 'south':
        position = new Vector3(
          source.position.x + offset,
          0,
          source.position.z + source.depth / 2 + gap + depth / 2
        );
        break;
      case 'east':
        position = new Vector3(
          source.position.x + source.width / 2 + gap + width / 2,
          0,
          source.position.z + offset
        );
        break;
      default:
        position = new Vector3(
          source.position.x - source.width / 2 - gap - width / 2,
          0,
          source.position.z + offset
        );
        break;
    }

    const rooftop: RooftopBlock = {
      id: `rooftop_${i}_${type}`,
      position,
      width,
      depth,
      height,
      type,
      connections: [source.id],
    };

    rooftops.push(rooftop);
    source.connections.push(rooftop.id);

    // Create bridge connection
    const bridgeWidth = rng.int(2, 4);
    const _heightDiff = Math.abs(source.height - height);
    const _avgHeight = (source.height + height) / 2;

    // Calculate bridge endpoints on roof edges
    let startPos: Vector3;
    let endPos: Vector3;

    switch (direction) {
      case 'north':
        startPos = new Vector3(
          source.position.x,
          source.height,
          source.position.z - source.depth / 2
        );
        endPos = new Vector3(position.x, height, position.z + depth / 2);
        break;
      case 'south':
        startPos = new Vector3(
          source.position.x,
          source.height,
          source.position.z + source.depth / 2
        );
        endPos = new Vector3(position.x, height, position.z - depth / 2);
        break;
      case 'east':
        startPos = new Vector3(
          source.position.x + source.width / 2,
          source.height,
          source.position.z
        );
        endPos = new Vector3(position.x - width / 2, height, position.z);
        break;
      default:
        startPos = new Vector3(
          source.position.x - source.width / 2,
          source.height,
          source.position.z
        );
        endPos = new Vector3(position.x + width / 2, height, position.z);
        break;
    }

    bridges.push({
      id: `bridge_${source.id}_${rooftop.id}`,
      from: source.id,
      to: rooftop.id,
      startPos,
      endPos,
      width: bridgeWidth,
    });
  }

  return { rooftops, bridges };
}

// Component to render a single rooftop with props
function RooftopRenderer({ rooftop, rng }: { rooftop: RooftopBlock; rng: WorldRNG }) {
  const propRng = createSubRNG(rng, `props_${rooftop.id}`);

  // Generate prop placements for this rooftop
  const props = useMemo(() => {
    const items: Array<{
      type: string;
      position: Vector3;
      rotation: number;
      seed: number;
    }> = [];

    const { width, depth, height, position, type } = rooftop;

    // Number of props based on rooftop size
    const area = width * depth;
    const propCount = Math.floor(area / 15) + propRng.int(2, 5);

    // Prop types by building type
    const propTypes: Record<string, string[]> = {
      academy: ['bench', 'planter', 'lantern', 'antenna', 'vent', 'solar_panel'],
      residential: ['ac_unit', 'water_tank', 'antenna', 'vent', 'crate', 'tarp', 'planter'],
      commercial: ['ac_unit', 'satellite_dish', 'vent', 'solar_panel', 'neon_sign', 'barrel'],
      industrial: ['water_tank', 'vent', 'crate', 'barrel', 'debris', 'tarp', 'antenna'],
    };

    const availableProps = propTypes[type] || propTypes.residential;

    for (let i = 0; i < propCount; i++) {
      const propType = propRng.pick(availableProps);

      // Random position on rooftop (avoiding edges)
      const margin = 1.5;
      const x = position.x + (propRng.next() - 0.5) * (width - margin * 2);
      const z = position.z + (propRng.next() - 0.5) * (depth - margin * 2);

      items.push({
        type: propType,
        position: new Vector3(x, height, z),
        rotation: propRng.next() * Math.PI * 2,
        seed: propRng.int(0, 100000),
      });
    }

    return items;
  }, [rooftop, propRng]);

  const _roofColor =
    rooftop.type === 'academy'
      ? new Color3(0.3, 0.25, 0.35)
      : rooftop.type === 'commercial'
        ? new Color3(0.35, 0.35, 0.38)
        : rooftop.type === 'industrial'
          ? new Color3(0.4, 0.35, 0.3)
          : new Color3(0.32, 0.32, 0.35);

  return (
    <>
      {/* Rooftop floor */}
      <Floor
        id={`${rooftop.id}_floor`}
        position={new Vector3(rooftop.position.x, rooftop.height - 0.1, rooftop.position.z)}
        size={{ width: rooftop.width, depth: rooftop.depth }}
        material="concrete"
        seed={rng.numericSeed}
      />

      {/* Parapet walls */}
      <TexturedWall
        id={`${rooftop.id}_wall_n`}
        position={
          new Vector3(
            rooftop.position.x,
            rooftop.height + 0.5,
            rooftop.position.z - rooftop.depth / 2
          )
        }
        size={{ width: rooftop.width, height: 1, depth: 0.2 }}
        texture="concrete"
        seed={rng.numericSeed + 1}
      />
      <TexturedWall
        id={`${rooftop.id}_wall_s`}
        position={
          new Vector3(
            rooftop.position.x,
            rooftop.height + 0.5,
            rooftop.position.z + rooftop.depth / 2
          )
        }
        size={{ width: rooftop.width, height: 1, depth: 0.2 }}
        texture="concrete"
        seed={rng.numericSeed + 2}
      />
      <TexturedWall
        id={`${rooftop.id}_wall_e`}
        position={
          new Vector3(
            rooftop.position.x + rooftop.width / 2,
            rooftop.height + 0.5,
            rooftop.position.z
          )
        }
        size={{ width: 0.2, height: 1, depth: rooftop.depth }}
        texture="concrete"
        seed={rng.numericSeed + 3}
      />
      <TexturedWall
        id={`${rooftop.id}_wall_w`}
        position={
          new Vector3(
            rooftop.position.x - rooftop.width / 2,
            rooftop.height + 0.5,
            rooftop.position.z
          )
        }
        size={{ width: 0.2, height: 1, depth: rooftop.depth }}
        texture="concrete"
        seed={rng.numericSeed + 4}
      />

      {/* Props */}
      {props.map((prop, i) => {
        const key = `${rooftop.id}_prop_${i}`;
        switch (prop.type) {
          case 'ac_unit':
            return (
              <ACUnit
                key={key}
                id={key}
                position={prop.position}
                rotation={prop.rotation}
                size="medium"
                seed={prop.seed}
              />
            );
          case 'water_tank':
            return (
              <WaterTank
                key={key}
                id={key}
                position={prop.position}
                type="rooftop"
                seed={prop.seed}
              />
            );
          case 'antenna':
            return (
              <Antenna key={key} id={key} position={prop.position} type="tv" seed={prop.seed} />
            );
          case 'satellite_dish':
            return (
              <SatelliteDish
                key={key}
                id={key}
                position={prop.position}
                type="small"
                seed={prop.seed}
              />
            );
          case 'solar_panel':
            return (
              <SolarPanel
                key={key}
                id={key}
                position={prop.position}
                type="residential"
                seed={prop.seed}
              />
            );
          case 'vent':
            return (
              <Vent key={key} id={key} position={prop.position} type="exhaust" seed={prop.seed} />
            );
          case 'crate':
            return (
              <Crate key={key} id={key} position={prop.position} size="medium" seed={prop.seed} />
            );
          case 'barrel':
            return <Barrel key={key} id={key} position={prop.position} seed={prop.seed} />;
          case 'tarp':
            return <Tarp key={key} id={key} position={prop.position} seed={prop.seed} />;
          case 'debris':
            return <Debris key={key} id={key} position={prop.position} seed={prop.seed} />;
          case 'neon_sign':
            return (
              <NeonSign
                key={key}
                id={key}
                position={prop.position}
                text={propRng.pick(['OPEN', 'BAR', '24H', 'CAFE'])}
                color={propRng.pick(['red', 'blue', 'pink', 'green'])}
                seed={prop.seed}
              />
            );
          case 'planter':
            return <Planter key={key} id={key} position={prop.position} seed={prop.seed} />;
          case 'bench':
            return (
              <Bench
                key={key}
                id={key}
                position={prop.position}
                rotation={prop.rotation}
                seed={prop.seed}
              />
            );
          case 'lantern':
            return <Lantern key={key} id={key} position={prop.position} seed={prop.seed} />;
          default:
            return null;
        }
      })}
    </>
  );
}

// Bridge/walkway between rooftops
function BridgeRenderer({ bridge }: { bridge: BridgeConnection }) {
  const length = Vector3.Distance(bridge.startPos, bridge.endPos);
  const midpoint = bridge.startPos.add(bridge.endPos).scale(0.5);
  const direction = bridge.endPos.subtract(bridge.startPos).normalize();
  const _angle = Math.atan2(direction.x, direction.z);

  return (
    <Floor
      id={bridge.id}
      position={midpoint}
      size={{ width: bridge.width, depth: length }}
      material="metal"
      seed={bridge.id.length * 1000}
    />
  );
}

export function FloodedWorldScene({ seedPhrase, _onExit }: FloodedWorldSceneProps) {
  const [playerPosition, setPlayerPosition] = useState<Vector3>(new Vector3(0, 10, 0));

  // Create deterministic RNG from seed
  const worldRng = useMemo(() => createWorldRNG(seedPhrase), [seedPhrase]);

  // Generate world layout
  const { rooftops, bridges } = useMemo(() => {
    const layoutRng = createSubRNG(worldRng, 'layout');
    const rooftopCount = 8; // ALPHA: Small world for validation
    return generateRooftopLayout(layoutRng, rooftopCount);
  }, [worldRng]);

  // Find academy spawn point
  const spawnPoint = useMemo(() => {
    const academy = rooftops.find((r) => r.type === 'academy');
    if (academy) {
      return new Vector3(academy.position.x, academy.height + 1, academy.position.z);
    }
    return new Vector3(0, 10, 0);
  }, [rooftops]);

  const handlePlayerMove = useCallback((newPos: Vector3) => {
    setPlayerPosition(newPos);
  }, []);

  return (
    <>
      {/* Lighting */}
      <DirectionalLightWithShadows
        id="sun"
        direction={new Vector3(-0.5, -1, -0.3)}
        intensity={0.8}
      />
      <CyberpunkNeonLights id="ambient" intensity={0.3} />

      {/* Camera */}
      <IsometricCamera id="main_camera" target={playerPosition} distance={25} angle={45} />

      {/* Rooftops */}
      {rooftops.map((rooftop) => (
        <RooftopRenderer
          key={rooftop.id}
          rooftop={rooftop}
          rng={createSubRNG(worldRng, rooftop.id)}
        />
      ))}

      {/* Bridges */}
      {bridges.map((bridge) => (
        <BridgeRenderer key={bridge.id} bridge={bridge} />
      ))}

      {/* Player Character */}
      <Character id="hero" position={spawnPoint} modelPath="/assets/characters/hero.glb" />

      {/* Player Controller */}
      <PlayerController characterId="hero" onMove={handlePlayerMove} speed={5} />

      {/* Debug: Show seed phrase */}
      <mesh position={new Vector3(0, 20, 0)}>
        {/* Seed display would go here - using HTML overlay instead */}
      </mesh>
    </>
  );
}

export default FloodedWorldScene;
