/**
 * BabylonDioramaScene Component
 *
 * Complete isometric diorama scene with camera, lighting, and ground plane.
 */

import { Color3, HemisphericLight, MeshBuilder, Vector3 } from '@babylonjs/core';
import type { ReactNode } from 'react';
import { useScene } from 'reactylon';
import { BabylonCanvas } from './BabylonCanvas';
import { IsometricCamera } from './IsometricCamera';

export interface BabylonDioramaSceneProps {
  children?: ReactNode;
}

function SceneContent({ children }: { children?: ReactNode }) {
  const scene = useScene();

  // Setup lighting
  if (scene) {
    // Hemispheric light for flat, even lighting (anime aesthetic)
    const light = new HemisphericLight('hemisphericLight', new Vector3(0, 1, 0), scene);
    light.intensity = 1.2;
    light.diffuse = new Color3(1, 1, 1);
    light.specular = new Color3(0, 0, 0); // No specular for flat look

    // Ground plane for reference with toon material
    const ground = MeshBuilder.CreateGround('ground', { width: 50, height: 50 }, scene);
    const groundMaterial = createEnvironmentMaterial(
      'groundMaterial',
      scene,
      new Color3(0.2, 0.2, 0.25)
    );
    ground.material = groundMaterial;
  }

  return (
    <>
      <IsometricCamera target={new Vector3(0, 0, 0)} radius={30} orthoSize={21} />
      {children}
    </>
  );
}

export function BabylonDioramaScene({ children }: BabylonDioramaSceneProps) {
  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      <BabylonCanvas>
        <SceneContent>{children}</SceneContent>
      </BabylonCanvas>
    </div>
  );
}
