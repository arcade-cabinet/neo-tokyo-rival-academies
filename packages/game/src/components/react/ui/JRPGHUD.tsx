import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { useEntities } from 'miniplex-react';
import React, { type FC } from 'react';
import { world } from '@/state/ecs';
import { advanceDialogue, getCurrentDialogueNode } from '@/systems/DialogueSystem';
import type { InputState } from '@/types/game';
import { Inventory } from './Inventory';
import { QuestLog } from './QuestLog';
import styles from './JRPG_HUD.module.css';

interface HUDProps {
  inputState: InputState;
  onInput: (key: keyof InputState, value: boolean) => void;
  playerPos?: { x: number; y: number };
}

export const JRPGHUD: FC<HUDProps> = ({ inputState, onInput, playerPos }) => {
  // Use useEntities from miniplex-react directly
  const { entities } = useEntities(world.with('isPlayer'));
  const player = entities[0];

  // Debug overlay toggle state
  const [showDebugOverlay, setShowDebugOverlay] = React.useState(false);

  // Quest log toggle state
  const [showQuestLog, setShowQuestLog] = React.useState(false);

  // Inventory toggle state
  const [showInventory, setShowInventory] = React.useState(false);

  // Derive Stats
  const level = player?.level?.current ?? 1;
  const hp = player?.health ?? 100;
  const maxHp = player?.stats?.structure ?? 100;
  const xp = player?.level?.xp ?? 0;
  const nextXp = player?.level?.nextLevelXp ?? 1000;

  // Dialogue State
  const dialogueNode = player?.id ? getCurrentDialogueNode(player.id) : null;

  const handleTouch = (key: keyof InputState, pressed: boolean) => (e: React.TouchEvent | React.MouseEvent) => {
    e.preventDefault();
    onInput(key, pressed);

    // Trigger haptic feedback on touch start
    if (pressed) {
      // Light haptic for D-Pad, medium for actions
      const style = ['attack', 'jump'].includes(key) ? ImpactStyle.Medium : ImpactStyle.Light;
      Haptics.impact({ style }).catch(() => {
        // Silently fail if haptics not available (e.g., web browser)
      });
    }
  };

  return (
    <div className={styles.container}>
      {/* Inventory Toggle Button */}
      <button
        type="button"
        onClick={() => setShowInventory(!showInventory)}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          padding: '8px 16px',
          background: 'rgba(255, 0, 255, 0.2)',
          border: '2px solid #f0f',
          color: '#f0f',
          fontSize: '12px',
          fontWeight: 'bold',
          cursor: 'pointer',
          borderRadius: '4px',
          zIndex: 1000,
          minWidth: '48px',
          minHeight: '48px',
        }}
      >
        BAG
      </button>

      {/* Quest Log Toggle Button */}
      <button
        type="button"
        onClick={() => setShowQuestLog(!showQuestLog)}
        style={{
          position: 'absolute',
          top: '10px',
          right: '90px',
          padding: '8px 16px',
          background: 'rgba(255, 255, 0, 0.2)',
          border: '2px solid #ff0',
          color: '#ff0',
          fontSize: '12px',
          fontWeight: 'bold',
          cursor: 'pointer',
          borderRadius: '4px',
          zIndex: 1000,
          minWidth: '48px',
          minHeight: '48px',
        }}
      >
        QUESTS
      </button>

      {/* Debug Overlay Toggle Button */}
      <button
        type="button"
        onClick={() => setShowDebugOverlay(!showDebugOverlay)}
        style={{
          position: 'absolute',
          top: '10px',
          right: '200px',
          padding: '8px 16px',
          background: 'rgba(0, 255, 255, 0.2)',
          border: '2px solid #0ff',
          color: '#0ff',
          fontSize: '12px',
          fontWeight: 'bold',
          cursor: 'pointer',
          borderRadius: '4px',
          zIndex: 1000,
          minWidth: '48px',
          minHeight: '48px',
        }}
      >
        DEBUG
      </button>

      {/* Inventory Modal */}
      {showInventory && <Inventory onClose={() => setShowInventory(false)} />}

      {/* Quest Log Modal */}
      {showQuestLog && <QuestLog onClose={() => setShowQuestLog(false)} />}

      {/* Debug Overlay Panel */}
      {showDebugOverlay && (
        <div
          style={{
            position: 'absolute',
            top: '70px',
            right: '10px',
            padding: '16px',
            background: 'rgba(0, 0, 0, 0.8)',
            border: '2px solid #0ff',
            borderRadius: '8px',
            color: '#0ff',
            fontSize: '12px',
            fontFamily: 'monospace',
            zIndex: 999,
            minWidth: '200px',
          }}
        >
          <div style={{ marginBottom: '8px', fontWeight: 'bold' }}>INPUT STATE:</div>
          <div>Left: {inputState.left ? '✓' : '✗'}</div>
          <div>Right: {inputState.right ? '✓' : '✗'}</div>
          <div>Jump: {inputState.jump ? '✓' : '✗'}</div>
          <div>Slide: {inputState.slide ? '✓' : '✗'}</div>
          <div>Attack: {inputState.attack ? '✓' : '✗'}</div>
          <div>Run: {inputState.run ? '✓' : '✗'}</div>
          <div style={{ marginTop: '12px', fontWeight: 'bold' }}>PLAYER STATS:</div>
          <div>Level: {level}</div>
          <div>HP: {Math.floor(hp)}/{maxHp}</div>
          <div>XP: {xp}/{nextXp}</div>
          {playerPos && (
            <>
              <div style={{ marginTop: '12px', fontWeight: 'bold' }}>POSITION:</div>
              <div>X: {Math.floor(playerPos.x)}</div>
              <div>Y: {Math.floor(playerPos.y)}</div>
            </>
          )}
        </div>
      )}

      {/* 1. Status Frame */}
      <div className={styles.statusFrame}>
        <div className={styles.portrait}>
          {/* Procedural Avatar: Stylized character icon */}
          <div style={{
             width: '100%', height: '100%',
             background: 'linear-gradient(135deg, #00ffff 0%, #000088 100%)',
             display: 'flex', alignItems: 'center', justifyContent: 'center',
             fontSize: '2rem', fontWeight: 'bold', color: '#fff'
          }}>K</div>
        </div>
        <div className={styles.stats}>
          <div style={{ color: '#fff', fontWeight: 'bold' }}>LVL {level} KAI</div>
          <div className={styles.barContainer}>
            <div
              className={styles.hpBar}
              style={{ width: `${Math.max(0, (hp / maxHp) * 100)}%` }}
            />
            <span style={{ position: 'absolute', top: 0, right: 2, fontSize: '10px' }}>
              {Math.floor(hp)}/{maxHp}
            </span>
          </div>
          <div className={styles.barContainer} style={{ height: '5px', marginTop: '2px' }}>
            <div
              className={styles.xpBar}
              style={{ width: `${Math.min(100, (xp / nextXp) * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 2. Minimap */}
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

      {/* 4. Dialogue Box */}
      {dialogueNode && (
        <div className={styles.dialogueBox} onClick={() => player?.id && advanceDialogue(player.id)}>
          <div className={styles.speaker}>{dialogueNode.speaker}</div>
          <div className={styles.text}>{dialogueNode.text}</div>
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
            style={{
              top: '50px',
              left: '0',
              opacity: inputState.left ? 1 : 0.6,
              transform: inputState.left ? 'scale(0.95)' : 'scale(1)',
            }}
            onTouchStart={handleTouch('left', true)}
            onTouchEnd={handleTouch('left', false)}
          >
            ←
          </div>
          {/* Right */}
          <div
            className={styles.dpadBtn}
            style={{
              top: '50px',
              right: '0',
              opacity: inputState.right ? 1 : 0.6,
              transform: inputState.right ? 'scale(0.95)' : 'scale(1)',
            }}
            onTouchStart={handleTouch('right', true)}
            onTouchEnd={handleTouch('right', false)}
          >
            →
          </div>
          {/* Down (Slide) */}
          <div
            className={styles.dpadBtn}
            style={{
              bottom: '0',
              left: '50px',
              opacity: inputState.slide ? 1 : 0.6,
              transform: inputState.slide ? 'scale(0.95)' : 'scale(1)',
            }}
            onTouchStart={handleTouch('slide', true)}
            onTouchEnd={handleTouch('slide', false)}
          >
            ↓
          </div>
          {/* Up (Jump/Interact) */}
          <div
            className={styles.dpadBtn}
            style={{
              top: '0',
              left: '50px',
              opacity: inputState.jump ? 1 : 0.6,
              transform: inputState.jump ? 'scale(0.95)' : 'scale(1)',
            }}
            onTouchStart={handleTouch('jump', true)}
            onTouchEnd={handleTouch('jump', false)}
          >
            ↑
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <div
            className={styles.actionBtn}
            style={{
              background: inputState.attack ? 'rgba(0, 255, 255, 0.5)' : 'rgba(0, 255, 255, 0.2)',
              borderColor: '#0ff',
              transform: inputState.attack ? 'scale(0.95)' : 'scale(1)',
            }}
            onTouchStart={handleTouch('attack', true)}
            onTouchEnd={handleTouch('attack', false)}
          >
            ATK
          </div>
          <div
            className={styles.actionBtn}
            style={{
              background: inputState.jump ? 'rgba(0, 255, 0, 0.5)' : 'rgba(0, 255, 0, 0.2)',
              borderColor: '#0f0',
              marginBottom: '40px',
              transform: inputState.jump ? 'scale(0.95)' : 'scale(1)',
            }}
            onTouchStart={handleTouch('jump', true)}
            onTouchEnd={handleTouch('jump', false)}
          >
            JUMP
          </div>
          <div
            className={styles.actionBtn}
            style={{
              background: inputState.run ? 'rgba(255, 255, 0, 0.5)' : 'rgba(255, 255, 0, 0.2)',
              borderColor: '#ff0',
              transform: inputState.run ? 'scale(0.95)' : 'scale(1)',
            }}
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
