/**
 * FloodedWorldMenu - Main menu for Flooded World ALPHA
 *
 * Features:
 * - Generate or enter 3-word seed phrases
 * - Visual preview of seed (shows word components)
 * - Start game with deterministic world
 */

import {
  generateSeedPhrase,
  isValidSeedPhrase,
  type SeedPhrase,
  suggestCompletions,
} from '@neo-tokyo/diorama';
import { useCallback, useEffect, useState } from 'react';

interface FloodedWorldMenuProps {
  onStartGame: (seedPhrase: SeedPhrase) => void;
}

export function FloodedWorldMenu({ onStartGame }: FloodedWorldMenuProps) {
  const [seedInput, setSeedInput] = useState('');
  const [_generatedSeed, setGeneratedSeed] = useState<SeedPhrase | null>(null);
  const [isValid, setIsValid] = useState(false);
  const [suggestions, setSuggestions] = useState<{
    adjectives: string[];
    nouns: string[];
    locations: string[];
  }>({ adjectives: [], nouns: [], locations: [] });

  // Generate initial seed on mount
  useEffect(() => {
    const seed = generateSeedPhrase();
    setGeneratedSeed(seed);
    setSeedInput(seed);
    setIsValid(true);
  }, []);

  // Validate and suggest as user types
  useEffect(() => {
    const valid = isValidSeedPhrase(seedInput);
    setIsValid(valid);

    if (!valid && seedInput.length > 0) {
      setSuggestions(suggestCompletions(seedInput));
    } else {
      setSuggestions({ adjectives: [], nouns: [], locations: [] });
    }
  }, [seedInput]);

  const handleGenerateNew = useCallback(() => {
    const seed = generateSeedPhrase();
    setGeneratedSeed(seed);
    setSeedInput(seed);
    setIsValid(true);
  }, []);

  const handleStart = useCallback(() => {
    if (isValid) {
      onStartGame(seedInput as SeedPhrase);
    }
  }, [isValid, seedInput, onStartGame]);

  const handleSuggestionClick = useCallback(
    (word: string) => {
      const parts = seedInput.split('-');
      parts[parts.length - 1] = word;
      const newInput = parts.join('-');
      setSeedInput(newInput);
    },
    [seedInput]
  );

  // Parse seed for visual display
  const seedParts = seedInput.split('-');
  const [adjective, noun, location] = seedParts;

  return (
    <div className="flooded-world-menu">
      <style>{`
        .flooded-world-menu {
          position: fixed;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 50%, #0f3460 100%);
          font-family: 'Courier New', monospace;
          color: #e0e0e0;
          overflow: hidden;
        }

        .flooded-world-menu::before {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 40%;
          background: linear-gradient(0deg, rgba(0, 100, 150, 0.3) 0%, transparent 100%);
          pointer-events: none;
        }

        .menu-title {
          font-size: 3rem;
          font-weight: bold;
          text-transform: uppercase;
          letter-spacing: 0.5em;
          margin-bottom: 0.5rem;
          text-shadow: 0 0 20px rgba(0, 200, 255, 0.5);
          color: #00d4ff;
        }

        .menu-subtitle {
          font-size: 1rem;
          color: #888;
          margin-bottom: 3rem;
          letter-spacing: 0.3em;
        }

        .seed-display {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .seed-part {
          padding: 1rem 1.5rem;
          background: rgba(0, 0, 0, 0.5);
          border: 1px solid rgba(0, 200, 255, 0.3);
          border-radius: 4px;
          min-width: 120px;
          text-align: center;
        }

        .seed-part-label {
          font-size: 0.7rem;
          color: #666;
          text-transform: uppercase;
          margin-bottom: 0.5rem;
        }

        .seed-part-value {
          font-size: 1.2rem;
          color: #00d4ff;
          text-transform: lowercase;
        }

        .seed-part-value.empty {
          color: #444;
        }

        .seed-input-container {
          margin-bottom: 1.5rem;
        }

        .seed-input {
          width: 400px;
          padding: 1rem;
          font-size: 1.2rem;
          font-family: inherit;
          background: rgba(0, 0, 0, 0.6);
          border: 2px solid ${isValid ? 'rgba(0, 255, 100, 0.5)' : 'rgba(255, 100, 0, 0.5)'};
          border-radius: 4px;
          color: #fff;
          text-align: center;
          letter-spacing: 0.1em;
        }

        .seed-input:focus {
          outline: none;
          border-color: ${isValid ? 'rgba(0, 255, 100, 0.8)' : 'rgba(255, 100, 0, 0.8)'};
        }

        .suggestions {
          display: flex;
          gap: 0.5rem;
          margin-top: 0.5rem;
          flex-wrap: wrap;
          justify-content: center;
          max-width: 400px;
        }

        .suggestion {
          padding: 0.3rem 0.8rem;
          background: rgba(0, 200, 255, 0.2);
          border: 1px solid rgba(0, 200, 255, 0.4);
          border-radius: 3px;
          cursor: pointer;
          font-size: 0.9rem;
          transition: all 0.2s;
        }

        .suggestion:hover {
          background: rgba(0, 200, 255, 0.4);
        }

        .button-row {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        .menu-button {
          padding: 1rem 2rem;
          font-size: 1rem;
          font-family: inherit;
          text-transform: uppercase;
          letter-spacing: 0.2em;
          cursor: pointer;
          border: none;
          border-radius: 4px;
          transition: all 0.2s;
        }

        .menu-button.primary {
          background: linear-gradient(180deg, #00d4ff 0%, #0088aa 100%);
          color: #000;
        }

        .menu-button.primary:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0, 200, 255, 0.4);
        }

        .menu-button.primary:disabled {
          background: #333;
          color: #666;
          cursor: not-allowed;
        }

        .menu-button.secondary {
          background: transparent;
          color: #888;
          border: 1px solid #444;
        }

        .menu-button.secondary:hover {
          border-color: #666;
          color: #aaa;
        }

        .alpha-badge {
          position: absolute;
          top: 2rem;
          right: 2rem;
          padding: 0.5rem 1rem;
          background: rgba(255, 100, 0, 0.8);
          color: #fff;
          font-size: 0.8rem;
          font-weight: bold;
          letter-spacing: 0.2em;
          border-radius: 3px;
        }

        .water-effect {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 100px;
          background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 10px,
            rgba(0, 150, 200, 0.1) 10px,
            rgba(0, 150, 200, 0.1) 20px
          );
          animation: wave 3s ease-in-out infinite;
          pointer-events: none;
        }

        @keyframes wave {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      <div className="alpha-badge">ALPHA</div>

      <h1 className="menu-title">Flooded World</h1>
      <p className="menu-subtitle">Neo-Tokyo Rival Academies</p>

      <div className="seed-display">
        <div className="seed-part">
          <div className="seed-part-label">Adjective</div>
          <div className={`seed-part-value ${!adjective ? 'empty' : ''}`}>{adjective || '---'}</div>
        </div>
        <div className="seed-part">
          <div className="seed-part-label">Noun</div>
          <div className={`seed-part-value ${!noun ? 'empty' : ''}`}>{noun || '---'}</div>
        </div>
        <div className="seed-part">
          <div className="seed-part-label">Location</div>
          <div className={`seed-part-value ${!location ? 'empty' : ''}`}>{location || '---'}</div>
        </div>
      </div>

      <div className="seed-input-container">
        <input
          type="text"
          className="seed-input"
          value={seedInput}
          onChange={(e) => setSeedInput(e.target.value.toLowerCase())}
          placeholder="crimson-phoenix-academy"
          spellCheck={false}
        />

        {(suggestions.adjectives.length > 0 ||
          suggestions.nouns.length > 0 ||
          suggestions.locations.length > 0) && (
          <div className="suggestions">
            {[...suggestions.adjectives, ...suggestions.nouns, ...suggestions.locations].map(
              (word) => (
                <button
                  key={word}
                  className="suggestion"
                  onClick={() => handleSuggestionClick(word)}
                  type="button"
                >
                  {word}
                </button>
              )
            )}
          </div>
        )}
      </div>

      <div className="button-row">
        <button className="menu-button secondary" onClick={handleGenerateNew} type="button">
          Generate New
        </button>
        <button
          className="menu-button primary"
          onClick={handleStart}
          disabled={!isValid}
          type="button"
        >
          Enter World
        </button>
      </div>

      <div className="water-effect" />
    </div>
  );
}

export default FloodedWorldMenu;
