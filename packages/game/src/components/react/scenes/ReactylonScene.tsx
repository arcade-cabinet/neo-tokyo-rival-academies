/**
 * ReactylonScene.tsx
 *
 * Isometric diorama scene using Reactylon (React renderer for Babylon.js).
 * Mirrors IsometricScene.tsx functionality with Babylon.js benefits:
 * - RecastJS navigation mesh support (coming)
 * - Havok physics integration (coming)
 * - Auto-disposal of resources
 *
 * @see docs/BABYLON_MIGRATION_PLAN.md for migration guide
 * @see https://reactylon.com/docs for API reference
 */
import { Engine } from 'reactylon/web';
import { Scene, useScene, useModel } from 'reactylon';
import { Suspense, useRef, useEffect, useMemo } from 'react';
import type { FC } from 'react';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import { Color3, Color4 } from '@babylonjs/core/Maths/math.color';
import { Matrix } from '@babylonjs/core/Maths/math.vector';
import { Camera } from '@babylonjs/core/Cameras/camera';
import type { Scene as BabylonScene } from '@babylonjs/core/scene';
import type { Mesh } from '@babylonjs/core/Meshes/mesh';
import type { ArcRotateCamera } from '@babylonjs/core/Cameras/arcRotateCamera';
import '@babylonjs/loaders/glTF';

// Hex grid constants
const HEX_SIZE = 1.0;
const GRID_WIDTH = 10;
const GRID_DEPTH = 8;

// Convert hex grid coordinates to world position (pointy-top layout)
function hexToWorld(col: number, row: number, size: number): Vector3 {
  const width = size * 2;
  const height = Math.sqrt(3) * size;
  const x = col * width * 0.75;
  const z = row * height + (col % 2 === 1 ? height / 2 : 0);
  return new Vector3(x, 0, z);
}

// Keyboard input hook - uses ref to avoid re-renders
function useKeyboard() {
  const keysRef = useRef({ w: false, a: false, s: false, d: false, space: false });

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') keysRef.current.w = true;
      if (key === 'a' || key === 'arrowleft') keysRef.current.a = true;
      if (key === 's' || key === 'arrowdown') keysRef.current.s = true;
      if (key === 'd' || key === 'arrowright') keysRef.current.d = true;
      if (key === ' ') keysRef.current.space = true;
    };
    const up = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      if (key === 'w' || key === 'arrowup') keysRef.current.w = false;
      if (key === 'a' || key === 'arrowleft') keysRef.current.a = false;
      if (key === 's' || key === 'arrowdown') keysRef.current.s = false;
      if (key === 'd' || key === 'arrowright') keysRef.current.d = false;
      if (key === ' ') keysRef.current.space = false;
    };
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
    };
  }, []);

  return keysRef;
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

// Generate tile positions by type
function generateTilePositions(): Vector3[][] {
  const byType: Vector3[][] = [[], [], [], [], [], []];
  const offsetX = -(GRID_WIDTH - 1) * HEX_SIZE * 1.5 / 2;
  const offsetZ = -(GRID_DEPTH - 1) * Math.sqrt(3) * HEX_SIZE / 2;

  let seed = 12345;
  const seededRandom = () => {
    seed = (seed * 1103515245 + 12345) & 0x7fffffff;
    return seed / 0x7fffffff;
  };

  for (let col = 0; col < GRID_WIDTH; col++) {
    for (let row = 0; row < GRID_DEPTH; row++) {
      const worldPos = hexToWorld(col, row, HEX_SIZE);
      const position = new Vector3(
        worldPos.x + offsetX,
        0.05,
        worldPos.z + offsetZ
      );

      const rand = seededRandom();
      let tileType: number;
      if (rand < 0.5) tileType = 0;
      else if (rand < 0.65) tileType = 1;
      else if (rand < 0.75) tileType = 2;
      else if (rand < 0.85) tileType = 3;
      else if (rand < 0.93) tileType = 4;
      else tileType = 5;

      byType[tileType].push(position);
    }
  }
  return byType;
}

// Hex tile instance group with thin instances
const HexTileGroup: FC<{ positions: Vector3[]; texturePath: string; index: number }> = ({
  positions,
  texturePath,
  index,
}) => {
  const scene = useScene();
  const meshRef = useRef<Mesh>(null);

  // Setup thin instances
  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh || !scene || positions.length === 0) return;

    // Copy first position (avoid reference sharing)
    mesh.position.copyFrom(positions[0]);

    // Add remaining as thin instances
    for (let i = 1; i < positions.length; i++) {
      const matrix = Matrix.Translation(positions[i].x, positions[i].y, positions[i].z);
      mesh.thinInstanceAdd(matrix);
    }
    mesh.thinInstanceRefreshBoundingInfo();
  }, [scene, positions]);

  if (positions.length === 0) return null;

  return (
    <cylinder
      ref={meshRef}
      name={`hex-tile-${index}`}
      options={{ height: 0.1, tessellation: 6, diameter: HEX_SIZE * 2 * 0.95 }}
      rotation={new Vector3(0, Math.PI / 6, 0)}
    >
      <standardMaterial
        name={`tile-mat-${index}`}
        roughness={0.7}
        specularColor={new Color3(0.2, 0.2, 0.2)}
        diffuseTexture-url={texturePath}
      />
    </cylinder>
  );
};

// Hex tile floor
const HexTileFloor: FC = () => {
  const tilesByType = useMemo(() => generateTilePositions(), []);

  return (
    <>
      {TILE_TEXTURES.map((texturePath, idx) => (
        <HexTileGroup
          key={idx}
          index={idx}
          positions={tilesByType[idx]}
          texturePath={texturePath}
        />
      ))}
    </>
  );
};

// Wall backdrop panels - using imperative creation to avoid type conflicts
const WallBackdrops: FC = () => {
  const scene = useScene();
  const gridWidth = GRID_WIDTH * HEX_SIZE * 1.5;
  const wallOffset = gridWidth / 2 + 2;
  const wallHeight = 15;
  const wallWidth = 10;

  useEffect(() => {
    if (!scene) return;

    // Store references for cleanup
    type Disposable = { dispose: () => void };
    let farBackdrop: Disposable | null = null;
    let farMat: Disposable | null = null;
    let leftWall: Disposable | null = null;
    let leftMat: Disposable | null = null;
    let rightWall: Disposable | null = null;
    let rightMat: Disposable | null = null;

    // Import required classes dynamically to avoid type conflicts
    import('@babylonjs/core/Meshes/Builders/planeBuilder').then(({ CreatePlane }) => {
      import('@babylonjs/core/Materials/standardMaterial').then(({ StandardMaterial }) => {
        import('@babylonjs/core/Materials/Textures/texture').then(({ Texture }) => {
          // Far background
          farBackdrop = CreatePlane('far-backdrop', { width: gridWidth + 20, height: wallHeight }, scene);
          farBackdrop.position = new Vector3(0, wallHeight / 2 - 2, -10);
          farMat = new StandardMaterial('far-mat', scene);
          farMat.disableLighting = true;
          farMat.emissiveColor = new Color3(0.3, 0.3, 0.3);
          farMat.diffuseTexture = new Texture('/assets/backgrounds/sector0/parallax_far/concept.png', scene);
          farBackdrop.material = farMat;

          // Left wall
          leftWall = CreatePlane('left-wall', { width: wallWidth, height: wallHeight }, scene);
          leftWall.position = new Vector3(-wallOffset, wallHeight / 2 - 2, 0);
          leftWall.rotation = new Vector3(0, Math.PI / 4, 0);
          leftMat = new StandardMaterial('left-mat', scene);
          leftMat.disableLighting = true;
          leftMat.emissiveColor = new Color3(0.3, 0.3, 0.3);
          leftMat.diffuseTexture = new Texture('/assets/backgrounds/sector0/wall_left/concept.png', scene);
          leftWall.material = leftMat;

          // Right wall
          rightWall = CreatePlane('right-wall', { width: wallWidth, height: wallHeight }, scene);
          rightWall.position = new Vector3(wallOffset, wallHeight / 2 - 2, 0);
          rightWall.rotation = new Vector3(0, -Math.PI / 4, 0);
          rightMat = new StandardMaterial('right-mat', scene);
          rightMat.disableLighting = true;
          rightMat.emissiveColor = new Color3(0.3, 0.3, 0.3);
          rightMat.diffuseTexture = new Texture('/assets/backgrounds/sector0/wall_right/concept.png', scene);
          rightWall.material = rightMat;
        });
      });
    });

    // Cleanup meshes and materials on unmount
    return () => {
      farMat?.dispose();
      leftMat?.dispose();
      rightMat?.dispose();
      farBackdrop?.dispose();
      leftWall?.dispose();
      rightWall?.dispose();
    };
  }, [scene, gridWidth, wallOffset, wallHeight, wallWidth]);

  return null;
};

// Kai character model component
const KaiModel: FC = () => {
  const model = useModel(
    '/assets/characters/main/kai/rigged.glb',
    {},
    (result) => {
      // Play idle animation if available - search by name first, fallback to first
      if (result.animationGroups && result.animationGroups.length > 0) {
        const idleAnim = result.animationGroups.find(
          (anim) => anim.name.toLowerCase().includes('idle')
        );
        const animToPlay = idleAnim ?? result.animationGroups[0];
        animToPlay.start(true);
      }
    }
  );

  return null; // Model is added to scene by useModel
};

// Kai character with movement
const KaiCharacter: FC = () => {
  const scene = useScene();
  const keysRef = useKeyboard();
  const positionRef = useRef(new Vector3(0, 1, 0));
  const rotationRef = useRef(0);
  const meshRef = useRef<Mesh>(null);

  const speed = 0.1;
  const maxX = (GRID_WIDTH * HEX_SIZE * 1.5) / 2 - HEX_SIZE;
  const maxZ = (GRID_DEPTH * Math.sqrt(3) * HEX_SIZE) / 2 - HEX_SIZE;

  // Movement update using scene.registerBeforeRender
  // Only depends on scene - reads from keysRef.current for stable callback
  useEffect(() => {
    if (!scene) return;

    const update = () => {
      const mesh = meshRef.current;
      if (!mesh) return;

      const keys = keysRef.current;
      let velX = 0;
      let velZ = 0;

      if (keys.w) velZ -= speed;
      if (keys.s) velZ += speed;
      if (keys.a) velX -= speed;
      if (keys.d) velX += speed;

      const newX = positionRef.current.x + velX;
      const newZ = positionRef.current.z + velZ;

      if (newX >= -maxX && newX <= maxX) positionRef.current.x = newX;
      if (newZ >= -maxZ && newZ <= maxZ) positionRef.current.z = newZ;

      mesh.position.copyFrom(positionRef.current);

      if (velX !== 0 || velZ !== 0) {
        rotationRef.current = Math.atan2(velX, velZ);
        mesh.rotation.y = rotationRef.current;
      }
    };

    scene.registerBeforeRender(update);
    return () => scene.unregisterBeforeRender(update);
  }, [scene, maxX, maxZ]);

  return (
    <Suspense fallback={
      <box
        ref={meshRef}
        name="loading-placeholder"
        options={{ size: 1 }}
        position={new Vector3(0, 1, 0)}
      >
        <standardMaterial name="loading-mat" diffuseColor={new Color3(0.5, 0.5, 0.5)} />
      </box>
    }>
      <transformNode ref={meshRef} name="kai-root" position={positionRef.current}>
        <KaiModel />
      </transformNode>
    </Suspense>
  );
};

// Scene fog controller
const SceneFog: FC = () => {
  const scene = useScene();

  useEffect(() => {
    if (scene) {
      scene.fogMode = 2; // FOGMODE_LINEAR
      scene.fogColor = new Color3(0.04, 0.04, 0.06);
      scene.fogStart = 30;
      scene.fogEnd = 60;
    }
  }, [scene]);

  return null;
};

// Scene lighting setup - using imperative creation to avoid type conflicts
const SceneLighting: FC = () => {
  const scene = useScene();

  useEffect(() => {
    if (!scene) return;

    // Store light references for cleanup
    type Light = { dispose: () => void };
    let ambient: Light | null = null;
    let sun: Light | null = null;
    let neonMagenta: Light | null = null;
    let neonCyan: Light | null = null;
    let neonOrange: Light | null = null;

    // Import light classes
    Promise.all([
      import('@babylonjs/core/Lights/hemisphericLight'),
      import('@babylonjs/core/Lights/directionalLight'),
      import('@babylonjs/core/Lights/pointLight'),
    ]).then(([{ HemisphericLight }, { DirectionalLight }, { PointLight }]) => {
      // Ambient light
      ambient = new HemisphericLight('ambient', new Vector3(0, 1, 0), scene);
      ambient.intensity = 0.5;

      // Sun/directional light
      sun = new DirectionalLight('sun', new Vector3(-0.5, -1, -0.3), scene);
      sun.position = new Vector3(15, 25, 10);
      sun.intensity = 1.2;

      // Neon accent lights
      neonMagenta = new PointLight('neon-magenta', new Vector3(-6, 4, -6), scene);
      neonMagenta.diffuse = new Color3(1, 0, 1);
      neonMagenta.intensity = 3;

      neonCyan = new PointLight('neon-cyan', new Vector3(6, 4, 6), scene);
      neonCyan.diffuse = new Color3(0, 1, 1);
      neonCyan.intensity = 3;

      neonOrange = new PointLight('neon-orange', new Vector3(0, 2, -8), scene);
      neonOrange.diffuse = new Color3(1, 0.4, 0);
      neonOrange.intensity = 2;
    });

    // Cleanup lights on unmount
    return () => {
      ambient?.dispose();
      sun?.dispose();
      neonMagenta?.dispose();
      neonCyan?.dispose();
      neonOrange?.dispose();
    };
  }, [scene]);

  return null;
};

// Main scene content
const SceneContent: FC = () => {
  const scene = useScene();

  // Setup isometric camera on scene ready
  useEffect(() => {
    if (!scene) return;

    // Configure orthographic camera
    const camera = scene.activeCamera as ArcRotateCamera;
    if (camera) {
      camera.mode = Camera.ORTHOGRAPHIC_CAMERA;
      camera.orthoTop = 12;
      camera.orthoBottom = -12;
      camera.orthoLeft = -16;
      camera.orthoRight = 16;
      camera.minZ = -100;
      camera.maxZ = 200;
    }
  }, [scene]);

  return (
    <>
      {/* Fog controller */}
      <SceneFog />

      {/* Lighting */}
      <SceneLighting />

      {/* Isometric orthographic camera */}
      <arcRotateCamera
        name="isometric-camera"
        alpha={Math.PI / 4}
        beta={Math.PI / 3}
        radius={50}
        target={Vector3.Zero()}
        setActiveOnSceneIfNoneActive
      />

      {/* Scene elements */}
      <WallBackdrops />
      <HexTileFloor />
      <KaiCharacter />
    </>
  );
};

// Scene initialization callback
const onSceneReady = (scene: BabylonScene) => {
  scene.clearColor = new Color4(0.04, 0.04, 0.06, 1);
};

// Main scene component
const ReactylonScene: FC = () => {
  return (
    <div style={{ width: '100%', height: '100%' }}>
      <Engine
        engineOptions={{ antialias: true, adaptToDeviceRatio: true }}
        canvasId="reactylon-canvas"
      >
        <Scene onSceneReady={onSceneReady}>
          <SceneContent />
        </Scene>
      </Engine>
    </div>
  );
};

export default ReactylonScene;
