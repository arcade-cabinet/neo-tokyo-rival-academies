import type { FC } from 'react';
import { useEffect, useRef, useState } from 'react';
import type { StatAllocation } from '../../../systems/StatAllocation';
import { getRecommendedAllocation, validateAllocation } from '../../../systems/StatAllocation';

interface StatAllocationModalProps {
  currentStats: {
    structure: number;
    ignition: number;
    logic: number;
    flow: number;
  };
  availablePoints: number;
  onConfirm: (allocation: StatAllocation) => void;
  onCancel: () => void;
}

const styles = {
  overlay: {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
  },
  modal: {
    backgroundColor: '#1a1a2e',
    border: '3px solid #00ffff',
    borderRadius: '10px',
    padding: '30px',
    maxWidth: '600px',
    width: '90%',
    color: '#fff',
    fontFamily: 'monospace',
  },
  buttonBase: {
    cursor: 'pointer',
    border: 'none',
    borderRadius: '5px',
  },
};

/**
 * Modal dialog for allocating stat points on level up.
 */
export const StatAllocationModal: FC<StatAllocationModalProps> = ({
  currentStats,
  availablePoints,
  onConfirm,
  onCancel,
}) => {
  const [allocation, setAllocation] = useState<StatAllocation>({
    structure: 0,
    ignition: 0,
    logic: 0,
    flow: 0,
  });

  const [error, setError] = useState<string | undefined>();
  const modalRef = useRef<HTMLDivElement>(null);

  const totalAllocated =
    allocation.structure + allocation.ignition + allocation.logic + allocation.flow;
  const remainingPoints = availablePoints - totalAllocated;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // Focus first focusable element
    if (modalRef.current) {
      const focusable = modalRef.current.querySelector('button');
      focusable?.focus();
    }

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onCancel]);

  const handleIncrement = (stat: keyof StatAllocation) => {
    if (remainingPoints > 0) {
      setAllocation((prev) => ({
        ...prev,
        [stat]: prev[stat] + 1,
      }));
      setError(undefined);
    }
  };

  const handleDecrement = (stat: keyof StatAllocation) => {
    if (allocation[stat] > 0) {
      setAllocation((prev) => ({
        ...prev,
        [stat]: prev[stat] - 1,
      }));
      setError(undefined);
    }
  };

  const handleRecommended = (role: 'tank' | 'melee_dps' | 'ranged_dps' | 'balanced') => {
    const recommended = getRecommendedAllocation(role, availablePoints);
    setAllocation(recommended);
    setError(undefined);
  };

  const handleConfirm = () => {
    const validation = validateAllocation(allocation, availablePoints);
    if (!validation.valid) {
      setError(validation.error);
      return;
    }

    if (totalAllocated === 0) {
      setError('You must allocate at least one stat point');
      return;
    }

    onConfirm(allocation);
  };

  return (
    <div
      style={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="stat-allocation-title"
    >
      <div ref={modalRef} style={styles.modal}>
        <h2
          id="stat-allocation-title"
          style={{
            textAlign: 'center',
            color: '#00ffff',
            marginBottom: '20px',
            fontSize: '2rem',
          }}
        >
          LEVEL UP!
        </h2>

        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <p style={{ fontSize: '1.2rem' }}>
            Available Points: <span style={{ color: '#00ffff' }}>{remainingPoints}</span>
          </p>
        </div>

        {error && (
          <div
            style={{
              backgroundColor: '#ff4444',
              padding: '10px',
              borderRadius: '5px',
              marginBottom: '20px',
              textAlign: 'center',
            }}
          >
            {error}
          </div>
        )}

        <div style={{ marginBottom: '20px' }}>
          {(['structure', 'ignition', 'logic', 'flow'] as const).map((stat) => (
            <div
              key={stat}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '15px',
                padding: '10px',
                backgroundColor: '#16213e',
                borderRadius: '5px',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1.2rem', textTransform: 'capitalize' }}>{stat}</div>
                <div style={{ fontSize: '0.9rem', color: '#888' }}>
                  Current: {currentStats[stat]} → New: {currentStats[stat] + allocation[stat]}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => handleDecrement(stat)}
                  disabled={allocation[stat] === 0}
                  aria-label={`Decrease ${stat}`}
                  style={{
                    ...styles.buttonBase,
                    width: '40px',
                    height: '40px',
                    fontSize: '1.5rem',
                    backgroundColor: allocation[stat] === 0 ? '#333' : '#ff4444',
                    color: '#fff',
                    cursor: allocation[stat] === 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  -
                </button>

                <span style={{ fontSize: '1.5rem', minWidth: '30px', textAlign: 'center' }}>
                  {allocation[stat]}
                </span>

                <button
                  type="button"
                  onClick={() => handleIncrement(stat)}
                  disabled={remainingPoints === 0}
                  aria-label={`Increase ${stat}`}
                  style={{
                    ...styles.buttonBase,
                    width: '40px',
                    height: '40px',
                    fontSize: '1.5rem',
                    backgroundColor: remainingPoints === 0 ? '#333' : '#00ff00',
                    color: '#fff',
                    cursor: remainingPoints === 0 ? 'not-allowed' : 'pointer',
                  }}
                >
                  +
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ marginBottom: '20px' }}>
          <p style={{ marginBottom: '10px', fontSize: '0.9rem', color: '#888' }}>
            Quick Allocations:
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            {(['tank', 'melee_dps', 'ranged_dps', 'balanced'] as const).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => handleRecommended(role)}
                style={{
                  ...styles.buttonBase,
                  padding: '8px 15px',
                  backgroundColor: '#0f3460',
                  color: '#00ffff',
                  border: '1px solid #00ffff',
                  fontSize: '0.9rem',
                  textTransform: 'capitalize',
                }}
              >
                {role.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={handleConfirm}
            style={{
              ...styles.buttonBase,
              padding: '15px 40px',
              backgroundColor: '#00ff00',
              color: '#000',
              fontSize: '1.2rem',
              fontWeight: 'bold',
            }}
          >
            Confirm
          </button>

          <button
            type="button"
            onClick={onCancel}
            style={{
              ...styles.buttonBase,
              padding: '15px 40px',
              backgroundColor: '#ff4444',
              color: '#fff',
              fontSize: '1.2rem',
              fontWeight: 'bold',
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
