import type { FC } from 'react';
import { useEffect, useState } from 'react';

interface CombatTextProps {
  message: string;
  color: string;
  onComplete?: () => void;
}

interface FloatingDamageProps {
  damage: number;
  isCritical: boolean;
  position: { x: number; y: number };
  onComplete?: () => void;
}

/**
 * Generic combat text component for displaying messages.
 */
export const CombatText: FC<CombatTextProps> = ({ message, color, onComplete }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      if (onComplete) onComplete();
    }, 600);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div
      style={{
        position: 'absolute',
        top: '30%',
        width: '100%',
        textAlign: 'center',
        fontSize: '4rem',
        fontWeight: 900,
        color: '#fff',
        textShadow: `4px 4px 0 ${color}`,
        fontStyle: 'italic',
        opacity: visible ? 1 : 0,
        transform: visible ? 'scale(1.2) skewX(-20deg)' : 'scale(0.5) skewX(-20deg)',
        transition: 'all 0.1s',
        pointerEvents: 'none',
        zIndex: 100,
      }}
    >
      {message}
    </div>
  );
};

/**
 * Floating damage numbers component.
 * Spawns damage text at hit location with color coding and animation.
 *
 * Color coding:
 * - White: Normal damage
 * - Yellow: Critical hit
 * - Red: Player damage
 */
export const FloatingDamage: FC<FloatingDamageProps> = ({
  damage,
  isCritical,
  position,
  onComplete,
}) => {
  const [offset, setOffset] = useState(0);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    // Animate upward with fade
    const startTime = Date.now();
    const duration = 1000; // 1 second animation

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Move upward (0 to -50px)
      setOffset(-50 * progress);

      // Fade out (1 to 0)
      setOpacity(1 - progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        if (onComplete) onComplete();
      }
    };

    requestAnimationFrame(animate);
  }, [onComplete]);

  // Determine color based on damage type
  const color = isCritical ? '#FFD700' : '#FFFFFF'; // Yellow for critical, white for normal

  return (
    <div
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y + offset}px`,
        fontSize: isCritical ? '2.5rem' : '2rem',
        fontWeight: 900,
        color: color,
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
        opacity: opacity,
        pointerEvents: 'none',
        zIndex: 1000,
        transform: isCritical ? 'scale(1.2)' : 'scale(1)',
        transition: 'transform 0.1s',
      }}
    >
      {damage}
    </div>
  );
};

/**
 * Player damage variant (red color).
 */
export const PlayerDamage: FC<Omit<FloatingDamageProps, 'isCritical'>> = ({
  damage,
  position,
  onComplete,
}) => {
  const [offset, setOffset] = useState(0);
  const [opacity, setOpacity] = useState(1);

  useEffect(() => {
    const startTime = Date.now();
    const duration = 1000;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      setOffset(-50 * progress);
      setOpacity(1 - progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        if (onComplete) onComplete();
      }
    };

    requestAnimationFrame(animate);
  }, [onComplete]);

  return (
    <div
      style={{
        position: 'absolute',
        left: `${position.x}px`,
        top: `${position.y + offset}px`,
        fontSize: '2rem',
        fontWeight: 900,
        color: '#FF4444', // Red for player damage
        textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
        opacity: opacity,
        pointerEvents: 'none',
        zIndex: 1000,
      }}
    >
      {damage}
    </div>
  );
};
