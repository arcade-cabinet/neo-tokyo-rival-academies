import type { FC } from 'react';
import { useEffect, useState } from 'react';

interface DialogueLine {
  speaker: string;
  text: string;
  image?: string; // Add image support
}

interface NarrativeOverlayProps {
  script: DialogueLine[];
  onComplete: () => void;
}

export const NarrativeOverlay: FC<NarrativeOverlayProps> = ({ script, onComplete }) => {
  const [index, setIndex] = useState(0);
  const [displayText, setDisplayText] = useState('');
  const [charIndex, setCharIndex] = useState(0);

  const currentLine =
    script && script.length > 0 ? script[index] : { speaker: 'ERROR', text: 'Script missing.' };

  // Handle empty script or completion
  useEffect(() => {
    if (!script || script.length === 0) {
      onComplete();
    }
  }, [script, onComplete]);

  // Typewriter effect
  useEffect(() => {
    if (!script || script.length === 0) return;

    if (charIndex < currentLine.text.length) {
      const timeout = setTimeout(() => {
        setDisplayText((prev) => prev + currentLine.text[charIndex]);
        setCharIndex((prev) => prev + 1);
      }, 30); // Typing speed
      return () => clearTimeout(timeout);
    }
  }, [charIndex, currentLine.text, script]);

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

  if (!script || script.length === 0) return null;

  return (
    <button
      type="button"
      onClick={handleNext}
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
      {/* Background Image (Anime Panel) */}
      {currentLine.image && (
        <div
          style={{
            position: 'absolute',
            top: '10%',
            left: 0,
            width: '100%',
            height: '80%',
            backgroundImage: `url(${currentLine.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: -1,
            animation: 'pan-zoom 20s linear infinite alternate',
          }}
        />
      )}

      {/* Letterbox Bars */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '10%',
          background: 'black',
          zIndex: 1,
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
          zIndex: 1,
        }}
      />

      {/* Dialogue Box */}
      <div
        data-testid="dialogue-box"
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
           @keyframes pan-zoom {
             0% { transform: scale(1) translate(0, 0); }
             100% { transform: scale(1.1) translate(-2%, -2%); }
           }
       `}</style>
    </button>
  );
};
