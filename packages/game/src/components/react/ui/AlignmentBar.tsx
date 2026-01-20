import { useAlignmentStore } from '@neo-tokyo/core';

export function AlignmentBar() {
  const alignment = useAlignmentStore((state) => state.alignment);
  const alignmentLabel = useAlignmentStore((state) => state.getAlignmentLabel());
  const kurenaiRep = useAlignmentStore((state) => state.kurenaiRep);
  const azureRep = useAlignmentStore((state) => state.azureRep);

  // Map alignment (-1.0 to +1.0) to bar position (0% to 100%)
  const barPosition = ((alignment + 1.0) / 2.0) * 100;

  // Color gradient based on alignment
  const getColor = () => {
    if (alignment < -0.6) return '#dc2626'; // Deep Kurenai (crimson)
    if (alignment < -0.2) return '#ef4444'; // Kurenai leaning
    if (alignment < 0.2) return '#94a3b8'; // Neutral (slate)
    if (alignment < 0.6) return '#3b82f6'; // Azure leaning
    return '#1d4ed8'; // Deep Azure (cobalt)
  };

  return (
    <div
      style={{
        padding: '12px 16px',
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        border: '1px solid #334155',
        borderRadius: '8px',
        fontFamily: '"M PLUS 1", sans-serif',
        minWidth: '280px',
      }}
    >
      {/* Label */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '8px',
        }}
      >
        <span style={{ fontSize: '12px', color: '#94a3b8', textTransform: 'uppercase' }}>
          Alignment
        </span>
        <span
          style={{
            fontSize: '14px',
            color: getColor(),
            fontWeight: 'bold',
          }}
        >
          {alignmentLabel}
        </span>
      </div>

      {/* Bar Container */}
      <div
        style={{
          position: 'relative',
          height: '24px',
          backgroundColor: '#1e293b',
          borderRadius: '4px',
          overflow: 'hidden',
          border: '1px solid #334155',
        }}
      >
        {/* Gradient Background (Kurenai to Azure) */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'linear-gradient(to right, #dc2626 0%, #64748b 50%, #1d4ed8 100%)',
            opacity: 0.3,
          }}
        />

        {/* Center Line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: '50%',
            width: '2px',
            height: '100%',
            backgroundColor: '#475569',
            transform: 'translateX(-50%)',
          }}
        />

        {/* Alignment Indicator */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: `${barPosition}%`,
            transform: 'translate(-50%, -50%)',
            width: '12px',
            height: '12px',
            backgroundColor: getColor(),
            border: '2px solid #f1f5f9',
            borderRadius: '50%',
            boxShadow: `0 0 8px ${getColor()}`,
            transition: 'left 0.3s ease-in-out',
          }}
        />
      </div>

      {/* Reputation Meters */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '8px',
          fontSize: '11px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ color: '#dc2626' }}>🔥</span>
          <span style={{ color: '#94a3b8' }}>Kurenai:</span>
          <span style={{ color: '#ef4444', fontWeight: 'bold' }}>{kurenaiRep}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <span style={{ color: '#1d4ed8' }}>⚡</span>
          <span style={{ color: '#94a3b8' }}>Azure:</span>
          <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>{azureRep}</span>
        </div>
      </div>

      {/* Stat Bonuses (if any) */}
      {(alignment > 0.6 || alignment < -0.6) && (
        <div
          style={{
            marginTop: '8px',
            padding: '6px',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            borderRadius: '4px',
            fontSize: '11px',
            color: '#10b981',
            borderLeft: '2px solid #10b981',
          }}
        >
          {alignment > 0.6 && '⚡ Azure Focus: +10% Structure & Logic'}
          {alignment < -0.6 && '🔥 Kurenai Focus: +10% Ignition & Flow'}
        </div>
      )}
    </div>
  );
}
