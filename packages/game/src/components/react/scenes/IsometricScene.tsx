import {
  OrbitControls,
  OrthographicCamera,
  useAnimations,
  useGLTF,
  useTexture,
} from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Physics, type RapierRigidBody, RigidBody } from '@react-three/rapier';
import { Leva, useControls } from 'leva';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import type { Group } from 'three';
import * as THREE from 'three';

// Hex grid constants
const HEX_SIZE = 1.0; // Scale factor for tile models
const GRID_WIDTH = 10; // Number of hexes wide
const GRID_DEPTH = 8; // Number of hexes deep

// Convert hex grid coordinates to world position (pointy-top layout)
function hexToWorld(col: number, row: number, size: number): [number, number, number] {
  const width = size * 2;
  const height = Math.sqrt(3) * size;
  const x = col * width * 0.75;
  const z = row * height + (col % 2 === 1 ? height / 2 : 0);
  return [x, 0, z];
}

function useKeyboard() {
  const [keys, setKeys] = useState({ w: false, a: false, s: false, d: false, space: false });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') setKeys((k) => ({ ...k, w: true }));
      if (key === 'a' || key === 'arrowleft') setKeys((k) => ({ ...k, a: true }));
      if (key === 's' || key === 'arrowdown') setKeys((k) => ({ ...k, s: true }));
      if (key === 'd' || key === 'arrowright') setKeys((k) => ({ ...k, d: true }));
      if (key === ' ') setKeys((k) => ({ ...k, space: true }));
    };
    const up = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') setKeys((k) => ({ ...k, w: false }));
      if (key === 'a' || key === 'arrowleft') setKeys((k) => ({ ...k, a: false }));
      if (key === 's' || key === 'arrowdown') setKeys((k) => ({ ...k, s: false }));
      if (key === 'd' || key === 'arrowright') setKeys((k) => ({ ...k, d: false }));
      if (key === ' ') setKeys((k) => ({ ...k, space: false }));
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  return keys;
}

// Tile texture paths
const TILE_TEXTURES = [
  '/assets/tiles/rooftop/base/concept.png',
  '/assets/tiles/rooftop/airvent/concept.png',
  '/assets/tiles/rooftop/pipes/concept.png',
  '/assets/tiles/rooftop/glass/concept.png',
  '/assets/tiles/rooftop/tarpaper/concept.png',
  '/assets/tiles/rooftop/grate/concept.png',
];

// Hex tile floor using instanced meshes per tile type
function HexTileFloor() {
  // Load all tile textures
  const textures = useTexture(TILE_TEXTURES);

  // Configure textures
  useEffect(() => {
    textures.forEach((tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.wrapS = THREE.ClampToEdgeWrapping;
      tex.wrapT = THREE.ClampToEdgeWrapping;
    });
  }, [textures]);

  // Create materials for each tile type
  const materials = useMemo(
    () =>
      textures.map(
        (tex) =>
          new THREE.MeshStandardMaterial({
            map: tex,
            roughness: 0.7,
            metalness: 0.2,
          })
      ),
    [textures]
  );

  // Generate hex grid with seeded random tile types
  const tilesByType = useMemo(() => {
    const byType: [number, number, number][][] = [[], [], [], [], [], []];

    // Center the grid
    const offsetX = (-(GRID_WIDTH - 1) * HEX_SIZE * 1.5) / 2;
    const offsetZ = (-(GRID_DEPTH - 1) * Math.sqrt(3) * HEX_SIZE) / 2;

    // Seeded random for consistent tile placement
    let seed = 12345;
    const seededRandom = () => {
      seed = (seed * 1103515245 + 12345) & 0x7fffffff;
      return seed / 0x7fffffff;
    };

    for (let col = 0; col < GRID_WIDTH; col++) {
      for (let row = 0; row < GRID_DEPTH; row++) {
        const [x, , z] = hexToWorld(col, row, HEX_SIZE);
        const position: [number, number, number] = [x + offsetX, 0.05, z + offsetZ];

        // Weighted random tile assignment
        const rand = seededRandom();
        let tileType: number;
        if (rand < 0.5)
          tileType = 0; // 50% base
        else if (rand < 0.65)
          tileType = 1; // 15% airvent
        else if (rand < 0.75)
          tileType = 2; // 10% pipes
        else if (rand < 0.85)
          tileType = 3; // 10% glass
        else if (rand < 0.93)
          tileType = 4; // 8% tarpaper
        else tileType = 5; // 7% grate

        byType[tileType].push(position);
      }
    }
    return byType;
  }, []);

  return (
    <group>
      {tilesByType.map((positions, typeIdx) => (
        <TileInstanceGroup key={typeIdx} positions={positions} material={materials[typeIdx]} />
      ))}
    </group>
  );
}

// Instanced mesh for a single tile type
function TileInstanceGroup({
  positions,
  material,
}: {
  positions: [number, number, number][];
  material: THREE.Material;
}) {
  const meshRef = useRef<THREE.InstancedMesh>(null);

  // Create geometry inside component to ensure Three.js is initialized
  const hexGeometry = useMemo(() => {
    const geo = new THREE.CylinderGeometry(HEX_SIZE * 0.95, HEX_SIZE * 0.95, 0.1, 6, 1);
    geo.rotateY(Math.PI / 6); // Pointy-top orientation
    return geo;
  }, []);

  useEffect(() => {
    if (!meshRef.current || positions.length === 0) return;

    const dummy = new THREE.Object3D();
    positions.forEach((pos, i) => {
      dummy.position.set(pos[0], pos[1], pos[2]);
      dummy.updateMatrix();
      meshRef.current?.setMatrixAt(i, dummy.matrix);
    });
    meshRef.current.instanceMatrix.needsUpdate = true;
  }, [positions]);

  if (positions.length === 0) return null;

  return (
    <instancedMesh
      ref={meshRef}
      args={[hexGeometry, material, positions.length]}
      receiveShadow
      castShadow
    />
  );
}

// Physics floor (invisible collider matching hex grid bounds)
function FloorCollider() {
  const width = GRID_WIDTH * HEX_SIZE * 1.5;
  const depth = GRID_DEPTH * Math.sqrt(3) * HEX_SIZE;

  return (
    <RigidBody type="fixed" position={[0, 0, 0]}>
      <mesh rotation={[-Math.PI / 2, 0, 0]} visible={false}>
        <planeGeometry args={[width, depth]} />
        <meshBasicMaterial transparent opacity={0} />
      </mesh>
    </RigidBody>
  );
}

// Left and Right wall backgrounds
function WallBackdrops() {
  const leftTex = useTexture('/assets/backgrounds/sector0/wall_left/concept.png');
  const rightTex = useTexture('/assets/backgrounds/sector0/wall_right/concept.png');
  const farTex = useTexture('/assets/backgrounds/sector0/parallax_far/concept.png');

  // Configure textures
  [leftTex, rightTex, farTex].forEach((tex) => {
    tex.colorSpace = THREE.SRGBColorSpace;
  });

  // Calculate wall positions based on hex grid size
  const gridWidth = GRID_WIDTH * HEX_SIZE * 1.5;
  const wallOffset = gridWidth / 2 + 2;
  const wallHeight = 15;
  const wallWidth = 10;

  return (
    <group>
      {/* Far background - behind everything */}
      <mesh position={[0, wallHeight / 2 - 2, -10]}>
        <planeGeometry args={[gridWidth + 20, wallHeight]} />
        <meshBasicMaterial map={farTex} transparent />
      </mesh>

      {/* Left wall */}
      <mesh position={[-wallOffset, wallHeight / 2 - 2, 0]} rotation={[0, Math.PI / 4, 0]}>
        <planeGeometry args={[wallWidth, wallHeight]} />
        <meshBasicMaterial map={leftTex} transparent />
      </mesh>

      {/* Right wall */}
      <mesh position={[wallOffset, wallHeight / 2 - 2, 0]} rotation={[0, -Math.PI / 4, 0]}>
        <planeGeometry args={[wallWidth, wallHeight]} />
        <meshBasicMaterial map={rightTex} transparent />
      </mesh>
    </group>
  );
}

// Helper to find animation by name pattern
function findActionByPattern(
  actions: Record<string, THREE.AnimationAction | null>,
  pattern: string
): THREE.AnimationAction | null {
  const actionNames = Object.keys(actions);
  const match = actionNames.find((name) => name.toLowerCase().includes(pattern.toLowerCase()));
  return match ? actions[match] : null;
}

function KaiCharacter() {
  const group = useRef<Group>(null);
  const rigidBody = useRef<RapierRigidBody>(null);
  // Each animation GLB contains the full rigged mesh
  const { scene } = useGLTF('/assets/characters/main/kai/animations/combat_stance.glb');
  const idleAnim = useGLTF('/assets/characters/main/kai/animations/combat_stance.glb');
  const runAnim = useGLTF('/assets/characters/main/kai/animations/runfast.glb');
  const { actions } = useAnimations([...idleAnim.animations, ...runAnim.animations], group);
  const keys = useKeyboard();
  const [isMoving, setIsMoving] = useState(false);

  const speed = 5;

  // Calculate bounds based on hex grid
  const maxX = (GRID_WIDTH * HEX_SIZE * 1.5) / 2 - HEX_SIZE;
  const maxZ = (GRID_DEPTH * Math.sqrt(3) * HEX_SIZE) / 2 - HEX_SIZE;

  useEffect(() => {
    // Use name-based lookup instead of index
    const idle = findActionByPattern(actions, 'combat') || findActionByPattern(actions, 'stance');
    if (idle) idle.reset().fadeIn(0.5).play();
  }, [actions]);

  useEffect(() => {
    const moving = keys.w || keys.a || keys.s || keys.d;
    if (moving !== isMoving) {
      setIsMoving(moving);
      // Use name-based lookup instead of index
      const idleAction =
        findActionByPattern(actions, 'combat') || findActionByPattern(actions, 'stance');
      const runAction = findActionByPattern(actions, 'run');
      if (moving && runAction) {
        idleAction?.fadeOut(0.2);
        runAction.reset().fadeIn(0.2).play();
      } else if (idleAction) {
        runAction?.fadeOut(0.2);
        idleAction.reset().fadeIn(0.2).play();
      }
    }
  }, [keys, isMoving, actions]);

  useFrame(() => {
    if (!rigidBody.current) return;

    // Get current position for bounds checking
    const pos = rigidBody.current.translation();

    let velX = 0;
    let velZ = 0;

    if (keys.w) velZ -= speed;
    if (keys.s) velZ += speed;
    if (keys.a) velX -= speed;
    if (keys.d) velX += speed;

    // Apply boundary constraints
    if (pos.x <= -maxX && velX < 0) velX = 0;
    if (pos.x >= maxX && velX > 0) velX = 0;
    if (pos.z <= -maxZ && velZ < 0) velZ = 0;
    if (pos.z >= maxZ && velZ > 0) velZ = 0;

    rigidBody.current.setLinvel({ x: velX, y: rigidBody.current.linvel().y, z: velZ }, true);

    if (group.current && (velX !== 0 || velZ !== 0)) {
      group.current.rotation.y = Math.atan2(velX, velZ);
    }
  });

  return (
    <RigidBody
      ref={rigidBody}
      position={[0, 1, 0]}
      enabledRotations={[false, false, false]}
      lockRotations
    >
      <group ref={group}>
        <primitive object={scene} scale={1} castShadow />
      </group>
    </RigidBody>
  );
}

function SceneContent() {
  const { zoom, camX, camY, camZ } = useControls('Camera', {
    zoom: { value: 40, min: 10, max: 100 },
    camX: { value: 10, min: -30, max: 30 },
    camY: { value: 10, min: 0, max: 30 },
    camZ: { value: 10, min: -30, max: 30 },
  });

  return (
    <>
      <OrthographicCamera
        makeDefault
        position={[camX, camY, camZ]}
        zoom={zoom}
        near={-100}
        far={200}
      />

      {/* Lighting */}
      <ambientLight intensity={0.5} />
      <directionalLight
        position={[15, 25, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      {/* Neon accent lights */}
      <pointLight position={[-6, 4, -6]} color="#ff00ff" intensity={3} distance={20} />
      <pointLight position={[6, 4, 6]} color="#00ffff" intensity={3} distance={20} />
      <pointLight position={[0, 2, -8]} color="#ff6600" intensity={2} distance={15} />

      {/* Wall backdrops */}
      <WallBackdrops />

      {/* Hex tile floor */}
      <HexTileFloor />

      {/* Physics world */}
      <Physics>
        <FloorCollider />
        <KaiCharacter />
      </Physics>

      <OrbitControls
        enableRotate={false}
        enableZoom={true}
        enablePan={false}
        minZoom={20}
        maxZoom={80}
      />
    </>
  );
}

export default function IsometricScene() {
  return (
    <>
      <Leva collapsed />
      <Canvas shadows>
        <color attach="background" args={['#0a0a0f']} />
        <fog attach="fog" args={['#0a0a0f', 30, 60]} />

        <Suspense fallback={null}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </>
  );
}

// Preload assets - each animation GLB contains the full rigged mesh
useGLTF.preload('/assets/characters/main/kai/animations/combat_stance.glb');
useGLTF.preload('/assets/characters/main/kai/animations/runfast.glb');
// Tile textures (applied to standardized hex geometry)
for (const t of TILE_TEXTURES) useTexture.preload(t);
// Background textures
useTexture.preload('/assets/backgrounds/sector0/wall_left/concept.png');
useTexture.preload('/assets/backgrounds/sector0/wall_right/concept.png');
useTexture.preload('/assets/backgrounds/sector0/parallax_far/concept.png');
