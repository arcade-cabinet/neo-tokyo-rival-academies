/**
 * BaseGameScene - Foundation for all game stages
 *
 * Provides common functionality:
 * - Parallax background layers (FF7 style)
 * - Ground plane with collision
 * - Isometric camera setup
 * - Character positioning
 * - Stage transition triggers
 */

import type { AbstractMesh, AnimationGroup, Scene } from '@babylonjs/core';
import {
  Color3,
  HemisphericLight,
  MeshBuilder,
  StandardMaterial,
  Texture,
  Vector3,
} from '@babylonjs/core';
import {
  Character,
  CharacterAnimationController,
  DirectionalLightWithShadows,
  IsometricCamera,
} from '@neo-tokyo/diorama';
import type { ReactNode } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useScene } from 'reactylon';
import type { StageConfig } from './SceneManager';

export interface BaseGameSceneProps {
  config: StageConfig;
  /** Callback when stage is complete */
  onStageComplete?: () => void;
  /** Input state from UI */
  inputState?: {
    up: boolean;
    down: boolean;
    left: boolean;
    right: boolean;
  };
  children?: ReactNode;
}

/**
 * Layer depths for parallax (z-position)
 * Closer to 0 = foreground, more negative = background
 */
const LAYER_DEPTHS = {
  /** Where characters walk */
  ground: 0,
  /** Side walls/buildings framing the scene */
  midground: -15,
  /** Mid-distance cityscape */
  parallaxMid: -35,
  /** Far skyline */
  parallaxFar: -60,
};

export function BaseGameScene({
  config,
  _onStageComplete,
  _inputState,
  children,
}: BaseGameSceneProps) {
  const scene = useScene();
  const [isReady, setIsReady] = useState(false);
  const [characterMeshes, setCharacterMeshes] = useState<AbstractMesh[]>([]);
  const [_animController, setAnimController] = useState<CharacterAnimationController | null>(null);
  const cleanupRef = useRef<(() => void)[]>([]);

  // Scene setup
  useEffect(() => {
    if (!scene) return;

    // Ambient lighting
    const ambientLight = new HemisphericLight('ambient', new Vector3(0, 1, 0), scene);
    ambientLight.intensity = 0.4;
    ambientLight.diffuse = new Color3(0.9, 0.9, 1);

    // Clear color based on theme
    const clearColors: Record<string, Color3> = {
      dark: new Color3(0.02, 0.02, 0.08),
      neon: new Color3(0.03, 0.02, 0.1),
      sunset: new Color3(0.15, 0.05, 0.1),
    };
    scene.clearColor = (clearColors[config.theme] || clearColors.dark).toColor4(1);

    // Create ground plane (invisible but provides reference)
    const ground = createGroundPlane(scene, config);
    cleanupRef.current.push(() => ground.dispose());

    // Create parallax background layers
    const bgCleanup = createParallaxBackgrounds(scene, config);
    cleanupRef.current.push(bgCleanup);

    setIsReady(true);

    return () => {
      for (const cleanup of cleanupRef.current) {
        cleanup();
      }
      cleanupRef.current = [];
      ambientLight.dispose();
    };
  }, [scene, config]);

  // Character loaded callback
  const handleCharacterLoaded = (meshes: AbstractMesh[], animations: AnimationGroup[]) => {
    setCharacterMeshes(meshes);
    const controller = new CharacterAnimationController(animations);
    setAnimController(controller);
    controller.play('combat', true);
  };

  if (!scene || !isReady) return null;

  // Determine stage bounds based on config
  const _stageBounds = {
    minX: -30,
    maxX: config.length ? config.length / 10 : 30,
    minZ: -10,
    maxZ: 10,
  };

  return (
    <>
      {/* Camera */}
      <IsometricCamera target={new Vector3(0, 0, 0)} radius={30} orthoSize={18} />

      {/* Directional light with shadows */}
      <DirectionalLightWithShadows
        position={new Vector3(15, 25, 10)}
        intensity={1.0}
        shadowMapSize={2048}
        shadowCasters={characterMeshes}
      />

      {/* Main character (Kai) */}
      {config.assets.characters.length > 0 && (
        <Character
          modelPath={config.assets.characters[0]}
          position={new Vector3(0, 0, 0)}
          scale={1}
          initialAnimation="combat"
          onLoaded={handleCharacterLoaded}
        />
      )}

      {children}
    </>
  );
}

/**
 * Create the ground plane mesh
 * This is subtle/invisible but defines where characters can walk
 */
function createGroundPlane(scene: Scene, config: StageConfig): AbstractMesh {
  const width = config.length ? config.length / 5 : 100;
  const depth = 30;

  const ground = MeshBuilder.CreateGround('ground', { width, height: depth }, scene);
  ground.position.y = 0;
  ground.position.x = width / 2 - 30; // Offset so player starts at origin

  // Subtle ground material - dark with slight texture
  const groundMat = new StandardMaterial('groundMat', scene);
  groundMat.diffuseColor = new Color3(0.1, 0.1, 0.12);
  groundMat.specularColor = new Color3(0, 0, 0);
  groundMat.alpha = 0.3; // Semi-transparent
  ground.material = groundMat;
  ground.receiveShadows = true;

  return ground;
}

/**
 * Create parallax background layers from config
 */
function createParallaxBackgrounds(scene: Scene, config: StageConfig): () => void {
  const meshes: AbstractMesh[] = [];
  const materials: StandardMaterial[] = [];

  // Layer configuration: [path pattern, z-depth, height, width]
  const layerConfigs: Array<{
    pattern: string;
    depth: number;
    height: number;
    width: number;
  }> = [
    { pattern: 'parallax_far', depth: LAYER_DEPTHS.parallaxFar, height: 50, width: 120 },
    { pattern: 'parallax_mid', depth: LAYER_DEPTHS.parallaxMid, height: 40, width: 100 },
    { pattern: 'wall_left', depth: LAYER_DEPTHS.midground, height: 35, width: 20 },
    { pattern: 'wall_right', depth: LAYER_DEPTHS.midground, height: 35, width: 20 },
  ];

  for (const layerConfig of layerConfigs) {
    // Find matching background asset
    const assetPath = config.assets.backgrounds.find((bg) => bg.includes(layerConfig.pattern));

    if (!assetPath) continue;

    // Create plane for this layer
    const plane = MeshBuilder.CreatePlane(
      `bg_${layerConfig.pattern}`,
      { width: layerConfig.width, height: layerConfig.height },
      scene
    );

    // Position based on layer type
    if (layerConfig.pattern.includes('wall_left')) {
      plane.position = new Vector3(-35, layerConfig.height / 2, layerConfig.depth);
      plane.rotation.y = Math.PI / 6; // Angle slightly toward camera
    } else if (layerConfig.pattern.includes('wall_right')) {
      plane.position = new Vector3(35, layerConfig.height / 2, layerConfig.depth);
      plane.rotation.y = -Math.PI / 6;
    } else {
      plane.position = new Vector3(0, layerConfig.height / 2 - 5, layerConfig.depth);
    }

    // Material with texture
    const mat = new StandardMaterial(`mat_${layerConfig.pattern}`, scene);
    const texture = new Texture(assetPath, scene);
    mat.diffuseTexture = texture;
    mat.emissiveTexture = texture; // Self-illuminating backgrounds
    mat.emissiveColor = new Color3(0.8, 0.8, 0.8);
    mat.specularColor = new Color3(0, 0, 0);
    mat.backFaceCulling = false;
    plane.material = mat;

    meshes.push(plane);
    materials.push(mat);
  }

  // Cleanup function
  return () => {
    for (const mesh of meshes) mesh.dispose();
    for (const mat of materials) mat.dispose();
  };
}
