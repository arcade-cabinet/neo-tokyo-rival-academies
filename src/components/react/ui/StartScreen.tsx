import type { FC } from 'react';

interface StartScreenProps {
  onStart: () => void;
}

export const StartScreen: FC<StartScreenProps> = ({ onStart }) => {
  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: 'rgba(5, 2, 2, 0.95)',
        zIndex: 20,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'auto',
      }}
    >
      <h1
        style={{
          fontSize: '2rem',
          color: '#aaa',
          margin: 0,
          textAlign: 'center',
          fontStyle: 'italic',
        }}
      >
        NEO-TOKYO
      </h1>
      <h1
        style={{
          color: '#fff',
          fontSize: '3.5rem',
          margin: 0,
          textAlign: 'center',
          fontStyle: 'italic',
          textShadow: '3px 3px 0px #f00, -3px -3px 0px #500',
          transform: 'skewX(-10deg)',
          lineHeight: 0.9,
        }}
      >
        RIVAL
        <br />
        ACADEMIES
      </h1>
      <p
        style={{
          color: '#aaa',
          textAlign: 'center',
          maxWidth: '350px',
          marginTop: '20px',
          fontFamily: 'monospace',
        }}
      >
        AUDIO: ENABLED (AKIRA STYLE)
        <br />
        <br />
        &gt; SPRINT (Bash) beats Standing Rivals
        <br />
        &gt; SLIDE (Trip) beats Blockers
        <br />
        &gt; Guaranteed Achievable Paths
        <br />
        &gt; Dynamic Slopes Active
      </p>
      <button
        type="button"
        onClick={onStart}
        style={{
          background: '#f00',
          border: 'none',
          padding: '20px 50px',
          marginTop: '30px',
          fontSize: '1.5rem',
          fontWeight: 900,
          color: '#fff',
          cursor: 'pointer',
          transform: 'skewX(-20deg)',
          boxShadow: '5px 5px 0px #fff',
          transition: 'transform 0.2s',
        }}
        onMouseOver={(e) => {
          e.currentTarget.style.transform = 'skewX(-20deg) scale(1.1)';
          e.currentTarget.style.boxShadow = '8px 8px 0px #f00';
        }}
        onMouseOut={(e) => {
          e.currentTarget.style.transform = 'skewX(-20deg) scale(1)';
          e.currentTarget.style.boxShadow = '5px 5px 0px #fff';
        }}
      >
        IGNITION
      </button>
    </div>
  );
};
