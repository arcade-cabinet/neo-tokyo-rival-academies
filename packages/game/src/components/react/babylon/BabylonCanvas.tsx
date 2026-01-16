/**
 * BabylonCanvas Component
 *
 * Wraps Reactylon Engine and Scene components for Babylon.js rendering.
 */

import type { Engine as BabylonEngine, Scene as BabylonScene } from '@babylonjs/core';
import type { ReactNode } from 'react';
import { Scene } from 'reactylon';
import { Engine } from 'reactylon/web';

export interface BabylonCanvasProps {
  children: ReactNode;
  antialias?: boolean;
  adaptToDeviceRatio?: boolean;
  onSceneReady?: (scene: BabylonScene) => void;
  onEngineReady?: (engine: BabylonEngine) => void;
}

export function BabylonCanvas({
  children,
  antialias = true,
  adaptToDeviceRatio = true,
  onSceneReady,
  onEngineReady,
}: BabylonCanvasProps) {
  return (
    <Engine
      antialias={antialias}
      adaptToDeviceRatio={adaptToDeviceRatio}
      canvasStyle={{
        width: '100%',
        height: '100%',
        display: 'block',
        touchAction: 'none',
      }}
    >
      <Scene onSceneReady={onSceneReady}>{children}</Scene>
    </Engine>
  );
}
