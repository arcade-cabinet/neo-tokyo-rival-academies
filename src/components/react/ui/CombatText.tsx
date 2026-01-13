import type { FC } from 'react';
import { useEffect, useState } from 'react';

interface CombatTextProps {
  message: string;
  color: string;
  onComplete?: () => void;
}

export const CombatText: FC<CombatTextProps> = ({ message, color, onComplete }) => {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    setVisible(true);
    const timer = setTimeout(() => {
      setVisible(false);
      if (onComplete) onComplete();
    }, 600);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [message]);

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
