import type { FC } from 'react';
import { useGameStore } from '@/state/gameStore';
import type { InputState } from '@/types/game';
import styles from './JRPG_HUD.module.css';

interface HUDProps {
  inputState: InputState;
  onInput: (key: keyof InputState, value: boolean) => void;
  playerPos?: { x: number; y: number };
}

export const JRPGHUD: FC<HUDProps> = ({ onInput, playerPos }) => {
  const { hp, maxHp, xp, level, currentDialogue, activeQuest } = useGameStore();

  const handleTouch = (key: keyof InputState, pressed: boolean) => (e: any) => {
    e.preventDefault();
    onInput(key, pressed);
  };

  return (
    <div className={styles.container}>
      {/* 1. Status Frame */}
      <div className={styles.statusFrame}>
        <div className={styles.portrait}>
          <img src="https://api.dicebear.com/9.x/avataaars/svg?seed=Kai" alt="Kai" />
        </div>
        <div className={styles.stats}>
          <div style={{ color: '#fff', fontWeight: 'bold' }}>LVL {level} KAI</div>
          <div className={styles.barContainer}>
            <div className={styles.hpBar} style={{ width: `${(hp / maxHp) * 100}%` }} />
          </div>
          <div className={styles.barContainer} style={{ height: '5px' }}>
            <div className={styles.xpBar} style={{ width: `${(xp % 1000) / 10}%` }} />
          </div>
        </div>
      </div>

      {/* 2. Minimap (Simple visual for now) */}
      <div className={styles.minimap}>
        <div
          style={{
            position: 'absolute',
            left: '50%',
            top: '50%',
            width: '10px',
            height: '10px',
            background: '#0f0',
            borderRadius: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
        {/* Grid lines */}
        <div
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            backgroundImage:
              'linear-gradient(rgba(0, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 255, 0.1) 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        {playerPos && (
          <div
            style={{ position: 'absolute', bottom: 5, right: 5, color: '#0ff', fontSize: '10px' }}
          >
            {Math.floor(playerPos.x)}, {Math.floor(playerPos.y)}
          </div>
        )}
      </div>

      {/* 3. Quest Tracker */}
      {activeQuest && (
        <div className={styles.questTracker}>
          <div style={{ color: '#ff0', fontWeight: 'bold' }}>! CURRENT OBJECTIVE</div>
          <div style={{ marginTop: '5px' }}>{activeQuest.title}</div>
          <div style={{ color: '#aaa' }}>{activeQuest.description}</div>
        </div>
      )}

      {/* 4. Dialogue Box */}
      {currentDialogue && (
        <div className={styles.dialogueBox}>
          <div className={styles.speaker}>{currentDialogue.speaker}</div>
          <div className={styles.text}>{currentDialogue.text}</div>
          <div
            style={{ alignSelf: 'flex-end', fontSize: '0.8rem', color: '#aaa', marginTop: '10px' }}
          >
            TAP TO CONTINUE
          </div>
        </div>
      )}

      {/* 5. Controls (D-Pad & Actions) */}
      <div className={styles.controls}>
        {/* D-Pad */}
        <div className={styles.dpad}>
          {/* Left */}
          <div
            className={styles.dpadBtn}
            style={{ top: '50px', left: '0' }}
            onTouchStart={handleTouch('left', true)}
            onTouchEnd={handleTouch('left', false)}
          >
            ←
          </div>
          {/* Right */}
          <div
            className={styles.dpadBtn}
            style={{ top: '50px', right: '0' }}
            onTouchStart={handleTouch('right', true)}
            onTouchEnd={handleTouch('right', false)}
          >
            →
          </div>
          {/* Down (Slide) */}
          <div
            className={styles.dpadBtn}
            style={{ bottom: '0', left: '50px' }}
            onTouchStart={handleTouch('slide', true)}
            onTouchEnd={handleTouch('slide', false)}
          >
            ↓
          </div>
          {/* Up (Not used much but maybe interact?) */}
          <div className={styles.dpadBtn} style={{ top: '0', left: '50px' }}>
            ↑
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <div
            className={styles.actionBtn}
            style={{ background: 'rgba(0, 255, 255, 0.2)', borderColor: '#0ff' }}
            onTouchStart={handleTouch('attack', true)}
            onTouchEnd={handleTouch('attack', false)}
          >
            ATK
          </div>
          <div
            className={styles.actionBtn}
            style={{
              background: 'rgba(0, 255, 0, 0.2)',
              borderColor: '#0f0',
              marginBottom: '40px',
            }}
            onTouchStart={handleTouch('jump', true)}
            onTouchEnd={handleTouch('jump', false)}
          >
            JUMP
          </div>
          <div
            className={styles.actionBtn}
            style={{ background: 'rgba(255, 255, 0, 0.2)', borderColor: '#ff0' }}
            onTouchStart={handleTouch('run', true)}
            onTouchEnd={handleTouch('run', false)}
          >
            RUN
          </div>
        </div>
      </div>
    </div>
  );
};
