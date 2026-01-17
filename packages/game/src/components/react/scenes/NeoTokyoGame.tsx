import { ScreenOrientation } from '@capacitor/screen-orientation';
// Using BabylonDioramaScene with imperative Babylon.js setup
import { BabylonDioramaScene } from '@components/react/babylon/BabylonDioramaScene';
import { CombatText } from '@components/react/ui/CombatText';
import { JRPGHUD } from '@components/react/ui/JRPGHUD';
import { MainMenu } from '@components/react/ui/MainMenu';
import { NarrativeOverlay } from '@components/react/ui/NarrativeOverlay';
import { SplashScreen } from '@components/react/ui/SplashScreen';
import { musicSynth } from '@neo-tokyo/content-gen';
import { initialGameState, initialInputState } from '@utils/gameConfig';
import { useCallback, useEffect, useRef, useState } from 'react';
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
      {/* Babylon.js 3D Scene */}
      <BabylonDioramaScene />

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
            // TODO: Connect to live ECS player position in next Phase
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
}
