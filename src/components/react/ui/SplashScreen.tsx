import { useEffect, useState } from 'react';

interface SplashScreenProps {
  onComplete: () => void;
}

export const SplashScreen = ({ onComplete }: SplashScreenProps) => {
  const [text, setText] = useState('');
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    // Phase 0: Boot sequence text
    const bootSequence = [
      'SYSTEM BOOT...',
      'LOADING NEURO-LINK...',
      'SYNCING TO KURENAI SERVER...',
      'ACCESS GRANTED.',
    ];
    let currentLine = 0;

    const interval = setInterval(() => {
      if (currentLine < bootSequence.length) {
        setText((prev) => `${prev + bootSequence[currentLine]}\n`);
        currentLine++;
      } else {
        clearInterval(interval);
        setTimeout(() => setPhase(1), 500);
      }
    }, 400);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (phase === 1) {
      // Phase 1: Logo flash
      setTimeout(() => {
        onComplete();
      }, 2500);
    }
  }, [phase, onComplete]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        background: '#000',
        zIndex: 100,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'monospace',
        color: '#0f0',
      }}
    >
      {phase === 0 && (
        <pre
          style={{
            textAlign: 'left',
            whiteSpace: 'pre-wrap',
            textShadow: '0 0 5px #0f0',
          }}
        >
          {text}
        </pre>
      )}

      {phase === 1 && (
        <div style={{ position: 'relative' }}>
          <h1
            style={{
              color: '#fff',
              fontSize: '4rem',
              margin: 0,
              transform: 'skewX(-10deg)',
              textShadow: '5px 5px 0px #f00',
              animation: 'glitch-anim 0.3s infinite',
            }}
          >
            NEO TOKYO
          </h1>
          <style>{`
            @keyframes glitch-anim {
              0% { transform: skewX(-10deg) translate(0); }
              20% { transform: skewX(-10deg) translate(-2px, 2px); }
              40% { transform: skewX(-10deg) translate(2px, -2px); }
              60% { transform: skewX(-10deg) translate(-2px, -2px); }
              80% { transform: skewX(-10deg) translate(2px, 2px); }
              100% { transform: skewX(-10deg) translate(0); }
            }
          `}</style>
        </div>
      )}
    </div>
  );
};
