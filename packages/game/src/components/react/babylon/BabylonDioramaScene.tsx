/**
 * BabylonDioramaScene Component
 *
 * Complete isometric diorama scene with camera, lighting, hex floor, and background panels.
 */

import { Color3, HemisphericLight, Vector3 } from '@babylonjs/core';
import type { ReactNode } from 'react';
import { useScene } from 'reactylon';
import { BabylonCanvas } from './BabylonCanvas';
import { BackgroundPanels } from './BackgroundPanels';
import { HexTileFloor } from './HexTileFloor';
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
  }

  return (
    <>
      <IsometricCamera target={new Vector3(0, 0, 0)} radius={30} orthoSize={21} />
      <HexTileFloor
        seed="neo-tokyo-default"
        cols={10}
        rows={10}
        bounds={{ minX: -20, maxX: 20, minZ: -20, maxZ: 20 }}
        debug={false}
      />
      <BackgroundPanels minX={-20} maxX={20} height={30} theme="neon" />
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
