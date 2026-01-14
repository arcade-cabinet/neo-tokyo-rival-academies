import { ScreenOrientation } from '@capacitor/screen-orientation';
import { GameWorld } from '@components/react/game/GameWorld';
import { CityBackground } from '@components/react/objects/CityBackground';
import { CombatText } from '@components/react/ui/CombatText';
import { JRPGHUD } from '@components/react/ui/JRPGHUD';
import { MainMenu } from '@components/react/ui/MainMenu';
import { NarrativeOverlay } from '@components/react/ui/NarrativeOverlay';
import { SplashScreen } from '@components/react/ui/SplashScreen';
import {
  CameraShake,
  ContactShadows,
  Environment,
  PerspectiveCamera,
  Sparkles,
} from '@react-three/drei';
import { Canvas } from '@react-three/fiber';
import { Bloom, ChromaticAberration, EffectComposer } from '@react-three/postprocessing';
import { musicSynth } from '@neo-tokyo/content-gen';
import { initialGameState, initialInputState } from '@utils/gameConfig';
import type { FC } from 'react';
import { Suspense, useCallback, useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { SaveSystem } from '@/systems/SaveSystem';
import type { GameState, InputState } from '@/types/game';

type ViewState = 'splash' | 'menu' | 'intro' | 'game' | 'gameover';

import introManifest from '@/content/story/manifest.json';

const INTRO_SCRIPT = [
  {
    speaker: 'Kai',
    text: 'Hey Vector! Try not to overheat keeping up with me!',
    image: introManifest.intro_01.imagePath,
  },
  {
    speaker: 'Vera',
    text: 'Your noise pollution is inefficient, Takeda.',
    image: introManifest.intro_02.imagePath,
  },
  {
    speaker: 'Vera',
    text: 'I have already calculated the optimal path.',
    image: introManifest.intro_02.imagePath,
  },
  {
    speaker: 'Kai',
    text: 'Calculated? Hah! Watch this!',
    image: introManifest.intro_02.imagePath,
  },
  {
    speaker: 'SYSTEM',
    text: 'MIDNIGHT EXAM INITIATED. GO!',
    image: introManifest.intro_01.imagePath,
  },
];

export default function NeoTokyoGame() {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [inputState, setInputState] = useState<InputState>(initialInputState);
  const [viewState, setViewState] = useState<ViewState>('menu');
  const [combatText, setCombatText] = useState<{ message: string; color: string } | null>(null);
  const [, setDialogue] = useState<{ speaker: string; text: string } | null>(null);
  const [shakeIntensity, setShakeIntensity] = useState(0);

  const handleStartStory = () => {
    // Attempt load
    const save = SaveSystem.load();
    if (save?.stageId) {
      // If we have a save, we could jump there.
      // But for narrative flow, we might want to ask.
      // For this MVP "Production" loop, let's just log it and start fresh or intro.
      // Ideally: setViewState('game'); stageSystem.loadStage(save.stageId);
      console.log('Save found:', save);
    }

    setViewState('intro');
    // Lock orientation to landscape for gameplay
    ScreenOrientation.lock({ orientation: 'landscape' }).catch(() => {
      // Fallback for browsers/platforms where lock is not supported
      console.warn('Orientation lock not supported');
    });
  };

  const handleIntroComplete = () => {
    setViewState('game');
    setGameState({ ...initialGameState, active: true });
    musicSynth.start();
  };

  const handleGameOver = () => {
    setViewState('gameover');
    setGameState({ ...initialGameState, active: false });
    musicSynth.stop();
  };

  // Keep for future use when "Pause" is implemented
  // const _handleReturnToMenu = () => {
  //   setViewState('menu');
  // };

  const handleInput = useCallback((key: keyof InputState, value: boolean) => {
    setInputState((prev) => ({ ...prev, [key]: value }));
  }, []);

  // useEffect for keyboard listeners removed (Touch Only)

  const handleCombatText = (message: string, color: string) => {
    setCombatText({ message, color });
  };

  const dialogueTimeoutRef = useRef<number>(0);
  const handleDialogue = useCallback((speaker: string, text: string) => {
    setDialogue({ speaker, text });
    if (dialogueTimeoutRef.current) clearTimeout(dialogueTimeoutRef.current);
    dialogueTimeoutRef.current = window.setTimeout(() => setDialogue(null), 4000);
  }, []);

  const shakeTimeoutRef = useRef<number>(0);

  const triggerCameraShake = useCallback(() => {
    setShakeIntensity(1);
    if (shakeTimeoutRef.current) {
      clearTimeout(shakeTimeoutRef.current);
    }
    // window.setTimeout returns a number in browser environment
    shakeTimeoutRef.current = window.setTimeout(() => setShakeIntensity(0), 500);
  }, []);

  useEffect(() => {
    return () => {
      if (shakeTimeoutRef.current) {
        clearTimeout(shakeTimeoutRef.current);
      }
    };
  }, []);

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

          {/* Game World - Only active if in game state */}
          <GameWorld
            gameState={gameState}
            inputState={inputState}
            onGameOver={handleGameOver}
            onScoreUpdate={(score) => setGameState((prev) => ({ ...prev, score }))}
            onCombatText={handleCombatText}
            onCameraShake={triggerCameraShake}
            onDialogue={handleDialogue}
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
        </Suspense>
      </Canvas>

      {/* UI Overlays based on State */}

      {viewState === 'splash' && <SplashScreen onComplete={() => setViewState('menu')} />}

      {(viewState === 'menu' || viewState === 'gameover') && (
        <MainMenu onStart={handleStartStory} />
      )}

      {viewState === 'intro' && (
        <NarrativeOverlay script={INTRO_SCRIPT} onComplete={handleIntroComplete} />
      )}

      {viewState === 'game' && (
        <>
          <JRPGHUD
            onInput={handleInput}
            // Pass simple 2D representation or null for now,
            // ideally we'd query ECS for actual player pos in HUD or pass from GameWorld callback
            // For MVP HUD, we just need to satisfy the prop interface.
            playerPos={{ x: 0, y: 0 }}
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

      {/* Scanlines Effect - Always On */}
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
