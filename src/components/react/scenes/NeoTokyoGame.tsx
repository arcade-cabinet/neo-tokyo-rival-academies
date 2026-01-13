import type { GameState, InputState } from '@/types/game';
import { GameWorld } from '@components/react/game/GameWorld';
import { GameHUD } from '@components/react/ui/GameHUD';
import { StartScreen } from '@components/react/ui/StartScreen';
import {
  ContactShadows,
  Environment,
  PerspectiveCamera,
  Sparkles,
} from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { musicSynth } from '@utils/audio/MusicSynth';
import { initialGameState, initialInputState } from '@utils/gameConfig';
import type { FC } from 'react';
import { Suspense, useState } from 'react';

export const NeoTokyoGame: FC = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [inputState, setInputState] = useState<InputState>(initialInputState);
  const [showStart, setShowStart] = useState(true);

  const handleStart = () => {
    setShowStart(false);
    setGameState({ ...initialGameState, active: true });
    musicSynth.start();
  };

  const handleGameOver = () => {
    setShowStart(true);
    setGameState({ ...initialGameState, active: false });
    musicSynth.stop();
  };

  const handleInput = (key: keyof InputState, value: boolean) => {
    setInputState((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* 3D Canvas */}
      <Canvas shadows style={{ background: 'linear-gradient(135deg, #020205 0%, #0a0510 100%)' }}>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[-8, 6, 15]} fov={50} />

          {/* Lighting Setup - Cyberpunk Style */}
          <ambientLight intensity={0.3} />
          <directionalLight
            position={[20, 50, 20]}
            intensity={1.5}
            color="#00ffff"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
          />
          <pointLight position={[-10, 5, -10]} intensity={0.8} color="#ff00ff" distance={30} />
          <pointLight position={[10, 5, -10]} intensity={0.8} color="#00ffff" distance={30} />

          {/* Fog for depth */}
          <fog attach="fog" args={['#050510', 10, 100]} />

          {/* Game World */}
          <GameWorld
            gameState={gameState}
            inputState={inputState}
            onGameOver={handleGameOver}
            onScoreUpdate={(score) => setGameState((prev) => ({ ...prev, score }))}
          />

          {/* Environment Effects */}
          <Environment preset="night" />
          <ContactShadows position={[0, -0.99, 0]} opacity={0.5} scale={10} blur={2} far={4} />

          {/* Atmospheric particles */}
          <Sparkles count={100} scale={50} size={2} speed={0.3} opacity={0.3} color="#00ffff" />

          {/* Debug controls (remove in production) */}
          {/* <OrbitControls makeDefault /> */}
        </Suspense>
      </Canvas>

      {/* UI Overlay */}
      {gameState.active && (
        <GameHUD
          score={gameState.score}
          biome={gameState.biome}
          inputState={inputState}
          onInput={handleInput}
        />
      )}

      {/* Start Screen */}
      {showStart && <StartScreen onStart={handleStart} />}

      {/* Scanlines Effect */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
          zIndex: 15,
          background: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.1) 50%)',
          backgroundSize: '100% 4px',
          opacity: 0.3,
        }}
      />
    </div>
  );
};
