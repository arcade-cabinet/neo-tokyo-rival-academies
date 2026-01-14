import { Haptics, ImpactStyle } from '@capacitor/haptics';
import type { FC } from 'react';
import type { InputState } from '@/types/game';
import styles from './GameHUD.module.css';

interface GameHUDProps {
  score: number;
  biome: number;
  inputState: InputState;
  onInput: (key: keyof InputState, value: boolean) => void;
}

const BIOME_NAMES = ['SHIBUYA', 'ROPPONGI', 'AKIHABARA', 'SHINJUKU'];

export const GameHUD: FC<GameHUDProps> = ({ score, biome, inputState, onInput }) => {
  const handleTouchStart = (key: keyof InputState) => {
    onInput(key, true);
    Haptics.impact({ style: ImpactStyle.Light }).catch(() => {});
  };

  const handleTouchEnd = (key: keyof InputState) => {
    onInput(key, false);
  };

  return (
    <div className={styles.hudContainer}>
      {/* Top HUD */}
      <div className={styles.topBar}>
        <div className={styles.hudBox}>
          <div className={styles.hudLabel}>NEO-TOKYO</div>
          <div className={styles.hudVal}>{BIOME_NAMES[biome] || 'SECTOR 0'}</div>
        </div>
        <div style={{ display: 'flex', gap: '2vmin' }}>
          <div className={styles.hudBox} style={{ textAlign: 'right' }}>
            <div className={styles.hudLabel}>REP</div>
            <div className={styles.hudVal} style={{ color: '#0ff' }}>
              {score}
            </div>
          </div>
        </div>
      </div>

      {/* Combat Text */}
      <div
        id="combat-text"
        style={{
          position: 'absolute',
          top: '30%',
          width: '100%',
          textAlign: 'center',
          fontSize: '8vmin',
          fontWeight: 900,
          color: '#fff',
          textShadow: '0.5vmin 0.5vmin 0 #f00',
          fontStyle: 'italic',
          opacity: 0,
          transform: 'scale(0.5) skewX(-20deg)',
          transition: 'transform 0.1s',
          pointerEvents: 'none',
        }}
      >
        KNOCKOUT!
      </div>

      {/* Touch Controls */}
      <div className={styles.touchControls}>
        {/* Left Control Zone */}
        <div
          className={styles.controlZone}
          style={{ alignItems: 'flex-end', paddingLeft: '4vmin' }}
        >
          <button
            type="button"
            className={`${styles.touchBtn} ${styles.btnSlide} ${
              inputState.slide ? styles.touchBtnPressed : ''
            }`}
            onTouchStart={(e) => {
              e.preventDefault();
              handleTouchStart('slide');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleTouchEnd('slide');
            }}
          >
            SLIDE
          </button>
          <button
            type="button"
            className={`${styles.touchBtn} ${styles.btnRun} ${
              inputState.run ? styles.touchBtnPressed : ''
            }`}
            style={{ marginBottom: '8vmin' }}
            onTouchStart={(e) => {
              e.preventDefault();
              handleTouchStart('run');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleTouchEnd('run');
            }}
          >
            DASH
          </button>
        </div>

        {/* Right Control Zone */}
        <div
          className={styles.controlZone}
          style={{ alignItems: 'flex-end', paddingRight: '4vmin' }}
        >
          <button
            type="button"
            className={`${styles.touchBtn} ${styles.btnAttack} ${
              inputState.attack ? styles.touchBtnPressed : ''
            }`}
            style={{ marginBottom: '8vmin' }}
            onTouchStart={(e) => {
              e.preventDefault();
              handleTouchStart('attack');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleTouchEnd('attack');
            }}
          >
            ATK
          </button>
          <button
            type="button"
            className={`${styles.touchBtn} ${styles.btnJump} ${
              inputState.jump ? styles.touchBtnPressed : ''
            }`}
            onTouchStart={(e) => {
              e.preventDefault();
              handleTouchStart('jump');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleTouchEnd('jump');
            }}
          >
            JUMP
          </button>
        </div>
      </div>
    </div>
  );
};
