import type { FC } from 'react';
import { useEffect, useState } from 'react';

interface DialogueLine {
  speaker: string;
  text: string;
}

interface NarrativeOverlayProps {
  script: DialogueLine[];
  onComplete: () => void;
}

export const NarrativeOverlay: FC<NarrativeOverlayProps> = ({ script, onComplete }) => {
  const [index, setIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [charIndex, setCharIndex] = useState(0);

  const currentLine = script[index];

  // Typewriter effect
  useEffect(() => {
    if (charIndex < currentLine.text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + currentLine.text[charIndex]);
        setCharIndex((prev) => prev + 1);
      }, 30); // Typing speed
      return () => clearTimeout(timeout);
    }
  }, [charIndex, currentLine.text]);

  const handleNext = () => {
    if (charIndex < currentLine.text.length) {
      // Instant finish
      setDisplayText(currentLine.text);
      setCharIndex(currentLine.text.length);
    } else {
      if (index < script.length - 1) {
        setIndex(index + 1);
        setDisplayText('');
        setCharIndex(0);
      } else {
        onComplete();
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleNext}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleNext()}
      style={{
        position: 'absolute',
        background: 'transparent',
        border: 'none',
        padding: 0,
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 50,
        cursor: 'pointer',
      }}
    >
      {/* Letterbox Bars */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '10%',
          background: 'black',
        }}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          height: '10%',
          background: 'black',
        }}
      />

      {/* Dialogue Box */}
      <div
        style={{
          position: 'absolute',
          bottom: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '80%',
          height: '25%',
          background: 'rgba(0,0,0,0.8)',
          border: '2px solid #fff',
          display: 'flex',
          flexDirection: 'column',
          padding: '20px',
          boxSizing: 'border-box',
        }}
      >
        <h3
          style={{
            color: currentLine.speaker === 'Kai' ? '#f00' : '#0ff',
            margin: '0 0 10px 0',
            fontSize: '1.5rem',
            fontFamily: 'sans-serif',
          }}
        >
          {currentLine.speaker}
        </h3>
        <p
          style={{
            color: '#fff',
            fontSize: '1.2rem',
            margin: 0,
            fontFamily: 'monospace',
            lineHeight: 1.5,
          }}
        >
          {displayText}
          {charIndex === currentLine.text.length && <span className="blink">_</span>}
        </p>

        <div
          style={{
            position: 'absolute',
            bottom: '10px',
            right: '20px',
            color: '#aaa',
            fontSize: '0.8rem',
          }}
        >
          CLICK TO CONTINUE
        </div>
      </div>

      <style>{`
           .blink { animation: blink 1s infinite; }
           @keyframes blink { 0% { opacity: 0; } 50% { opacity: 1; } 100% { opacity: 0; } }
       `}</style>
    </button>
  );
};
