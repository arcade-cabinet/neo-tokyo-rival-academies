import type { InputState } from '@/types/game';
import type { FC } from 'react';

interface GameHUDProps {
  score: number;
  biome: number;
  inputState: InputState;
  onInput: (key: keyof InputState, value: boolean) => void;
}

const BIOME_NAMES = ['SHIBUYA', 'ROPPONGI', 'AKIHABARA', 'SHINJUKU'];

export const GameHUD: FC<GameHUDProps> = ({ score, biome, inputState, onInput }) => {
  const handleButtonDown = (key: keyof InputState) => {
    onInput(key, true);
  };

  const handleButtonUp = (key: keyof InputState) => {
    onInput(key, false);
  };

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 10,
        pointerEvents: 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
      }}
    >
      {/* Top HUD */}
      <div
        style={{
          padding: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)',
        }}
      >
        <div className="hud-box">
          <div className="hud-label">NEO-TOKYO</div>
          <div className="hud-val">{BIOME_NAMES[biome] || 'SECTOR 0'}</div>
        </div>
        <div className="hud-box" style={{ textAlign: 'right' }}>
          <div className="hud-label">DISTANCE</div>
          <div className="hud-val">{score}m</div>
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
          fontSize: '4rem',
          fontWeight: 900,
          color: '#fff',
          textShadow: '4px 4px 0 #f00',
          fontStyle: 'italic',
          opacity: 0,
          transform: 'scale(0.5) skewX(-20deg)',
          transition: 'transform 0.1s',
          pointerEvents: 'none',
        }}
      >
        KNOCKOUT!
      </div>

      {/* Controls */}
      <div
        style={{
          height: '40%',
          width: '100%',
          display: 'flex',
          pointerEvents: 'auto',
        }}
      >
        {/* Left controls */}
        <div style={{ flex: 1, position: 'relative' }}>
          <button
            type="button"
            className={`btn ${inputState.run ? 'pressed' : ''}`}
            style={{
              position: 'absolute',
              top: '20px',
              left: '30px',
              borderLeft: '5px solid #f0f',
            }}
            onMouseDown={() => handleButtonDown('run')}
            onMouseUp={() => handleButtonUp('run')}
            onTouchStart={(e) => {
              e.preventDefault();
              handleButtonDown('run');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleButtonUp('run');
            }}
          >
            BASH
          </button>
          <button
            type="button"
            className={`btn ${inputState.slide ? 'pressed' : ''}`}
            style={{
              position: 'absolute',
              bottom: '30px',
              left: '30px',
              borderLeft: '5px solid #ff0',
            }}
            onMouseDown={() => handleButtonDown('slide')}
            onMouseUp={() => handleButtonUp('slide')}
            onTouchStart={(e) => {
              e.preventDefault();
              handleButtonDown('slide');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleButtonUp('slide');
            }}
          >
            TRIP
          </button>
        </div>

        {/* Right controls */}
        <div style={{ flex: 1, position: 'relative' }}>
          <button
            type="button"
            className={`btn ${inputState.grab ? 'pressed' : ''}`}
            style={{
              position: 'absolute',
              top: '20px',
              right: '30px',
              borderRight: '5px solid #0f0',
            }}
            onMouseDown={() => handleButtonDown('grab')}
            onMouseUp={() => handleButtonUp('grab')}
            onTouchStart={(e) => {
              e.preventDefault();
              handleButtonDown('grab');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleButtonUp('grab');
            }}
          >
            GRAB
          </button>
          <button
            type="button"
            className={`btn ${inputState.jump ? 'pressed' : ''}`}
            style={{
              position: 'absolute',
              bottom: '30px',
              right: '30px',
              borderRight: '5px solid #0ff',
            }}
            onMouseDown={() => handleButtonDown('jump')}
            onMouseUp={() => handleButtonUp('jump')}
            onTouchStart={(e) => {
              e.preventDefault();
              handleButtonDown('jump');
            }}
            onTouchEnd={(e) => {
              e.preventDefault();
              handleButtonUp('jump');
            }}
          >
            JUMP
          </button>
        </div>
      </div>

      <style>{`
        .hud-box {
          background: rgba(180, 0, 0, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 10px 20px;
          color: #fff;
          transform: skewX(-15deg);
          backdrop-filter: blur(5px);
          box-shadow: 0 0 15px rgba(255, 0, 0, 0.2);
        }
        .hud-label {
          font-size: 0.7rem;
          color: #ffba00;
          text-transform: uppercase;
          letter-spacing: 2px;
          margin-bottom: 2px;
        }
        .hud-val {
          font-size: 2rem;
          font-weight: 900;
          color: #fff;
          text-shadow: 2px 2px #000;
          font-style: italic;
        }
        .btn {
          width: 100px;
          height: 80px;
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.8);
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.9rem;
          font-weight: 800;
          letter-spacing: 1px;
          transform: skewX(-10deg);
          transition: all 0.05s;
          cursor: pointer;
        }
        .btn:active,
        .btn.pressed {
          background: rgba(255, 0, 0, 0.3);
          border-color: #f00;
          color: #fff;
          transform: skewX(-10deg) scale(0.95);
          box-shadow: 0 0 20px #f00;
        }
      `}</style>
    </div>
  );
};
