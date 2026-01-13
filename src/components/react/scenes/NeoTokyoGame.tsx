import { GameWorld } from '@components/react/game/GameWorld';
import { CityBackground } from '@components/react/objects/CityBackground';
import { CombatText } from '@components/react/ui/CombatText';
import { GameHUD } from '@components/react/ui/GameHUD';
import { StartScreen } from '@components/react/ui/StartScreen';
import {
  CameraShake,
  ContactShadows,
  Environment,
  PerspectiveCamera,
  Sparkles,
} from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Bloom, ChromaticAberration, EffectComposer } from '@react-three/postprocessing';
import { musicSynth } from '@utils/audio/MusicSynth';
import { initialGameState, initialInputState } from '@utils/gameConfig';
import type { FC } from 'react';
import { Suspense, useState } from 'react';
import * as THREE from 'three';
import type { GameState, InputState } from '@/types/game';

export const NeoTokyoGame: FC = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [inputState, setInputState] = useState<InputState>(initialInputState);
  const [showStart, setShowStart] = useState(true);
  const [combatText, setCombatText] = useState<{ message: string; color: string } | null>(null);
  const [shakeIntensity, setShakeIntensity] = useState(0);

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

  const handleCombatText = (message: string, color: string) => {
    setCombatText({ message, color });
  };

  const triggerCameraShake = () => {
    setShakeIntensity(1);
    setTimeout(() => setShakeIntensity(0), 500);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* 3D Canvas */}
      <Canvas shadows style={{ background: 'linear-gradient(135deg, #020205 0%, #0a0510 100%)' }}>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[-8, 6, 15]} fov={50} />

          {/* Lighting Setup - Enhanced Cyberpunk Style */}
          <ambientLight intensity={0.2} color={0x4040ff} />
          <directionalLight
            position={[20, 50, 20]}
            intensity={2}
            color="#00ffff"
            castShadow
            shadow-mapSize-width={2048}
            shadow-mapSize-height={2048}
            shadow-camera-far={150}
            shadow-camera-left={-50}
            shadow-camera-right={50}
            shadow-camera-top={50}
            shadow-camera-bottom={-50}
          />

          {/* Multiple colored point lights for atmosphere */}
          <pointLight position={[-20, 10, -20]} intensity={2} color="#ff00ff" distance={50} />
          <pointLight position={[20, 10, -20]} intensity={2} color="#00ffff" distance={50} />
          <pointLight position={[0, 5, 20]} intensity={1.5} color="#ffff00" distance={40} />

          {/* Fog for depth - darker */}
          <fog attach="fog" args={['#020208', 15, 120]} />

          {/* City Background with parallax */}
          <CityBackground />

          {/* Game World */}
          <GameWorld
            gameState={gameState}
            inputState={inputState}
            onGameOver={handleGameOver}
            onScoreUpdate={(score) => setGameState((prev) => ({ ...prev, score }))}
            onCombatText={handleCombatText}
            onCameraShake={triggerCameraShake}
          />

          <CameraShake
            maxYaw={0.05}
            maxPitch={0.05}
            maxRoll={0.05}
            yawFrequency={10 * shakeIntensity}
            pitchFrequency={10 * shakeIntensity}
            rollFrequency={10 * shakeIntensity}
            intensity={shakeIntensity}
            decayRate={0.65}
          />

          {/* Post Processing */}
          <EffectComposer>
            <Bloom luminanceThreshold={1} mipmapBlur intensity={1.5} />
            <ChromaticAberration
              offset={new THREE.Vector2(0.002, 0.002)}
              radialModulation={false}
              modulationOffset={0}
            />
          </EffectComposer>

          {/* Enhanced Environment Effects */}
          <Environment preset="night" />
          <ContactShadows
            position={[0, -0.5, 0]}
            opacity={0.6}
            scale={20}
            blur={2.5}
            far={10}
            color="#00ffff"
          />

          {/* Enhanced atmospheric particles */}
          <Sparkles count={200} scale={80} size={2.5} speed={0.2} opacity={0.4} color="#00ffff" />
          <Sparkles
            count={150}
            scale={60}
            size={1.5}
            speed={0.15}
            opacity={0.3}
            color="#ff00ff"
            position={[0, 10, -20]}
          />

          {/* Debug controls (remove in production) */}
          {/* <OrbitControls makeDefault /> */}
        </Suspense>
      </Canvas>

      {/* UI Overlay */}
      {gameState.active && (
        <>
          <GameHUD
            score={gameState.score}
            biome={gameState.biome}
            inputState={inputState}
            onInput={handleInput}
          />
          {combatText && (
            <CombatText
              message={combatText.message}
              color={combatText.color}
              onComplete={() => setCombatText(null)}
            />
          )}
        </>
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
