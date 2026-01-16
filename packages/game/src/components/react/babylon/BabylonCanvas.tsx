/**
 * BabylonCanvas Component
 *
 * Wraps Reactylon Engine and Scene components with error boundaries.
 */

import { type ReactNode, useEffect, useRef } from 'react';
import { Scene } from 'reactylon';
import { BabylonEngine } from '@/engine/BabylonEngine';

export interface BabylonCanvasProps {
  children: ReactNode;
  antialias?: boolean;
  adaptToDeviceRatio?: boolean;
  onSceneReady?: (scene: BABYLON.Scene) => void;
  onEngineReady?: (engine: BABYLON.Engine) => void;
}

export function BabylonCanvas({
  children,
  antialias = true,
  adaptToDeviceRatio = true,
  onSceneReady,
  onEngineReady,
}: BabylonCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const engineWrapperRef = useRef<BabylonEngine | null>(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    // Initialize engine wrapper
    const wrapper = new BabylonEngine({
      canvas: canvasRef.current,
      antialias,
      adaptToDeviceRatio,
    });

    const engine = wrapper.initialize();
    engineWrapperRef.current = wrapper;

    if (onEngineReady) {
      onEngineReady(engine);
    }

    // Cleanup on unmount
    return () => {
      wrapper.dispose();
      engineWrapperRef.current = null;
    };
  }, [antialias, adaptToDeviceRatio, onEngineReady]);

  return (
    <canvas
      ref={canvasRef}
      style={{
        width: '100%',
        height: '100%',
        display: 'block',
        touchAction: 'none',
      }}
    >
      {canvasRef.current && (
        <Engine canvas={canvasRef.current} antialias={antialias}>
          <Scene onSceneReady={onSceneReady}>{children}</Scene>
        </Engine>
      )}
    </canvas>
  );
}
