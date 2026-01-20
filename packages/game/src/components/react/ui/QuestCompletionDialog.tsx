import type { QuestRewards } from '@neo-tokyo/core';

interface QuestCompletionDialogProps {
  isOpen: boolean;
  questTitle: string;
  rewards: QuestRewards | null;
  onClose: () => void;
}

export function QuestCompletionDialog({
  isOpen,
  questTitle,
  rewards,
  onClose,
}: QuestCompletionDialogProps) {
  if (!isOpen || !rewards) return null;

  const getAlignmentColor = (faction: 'kurenai' | 'azure') => {
    return faction === 'kurenai' ? '#ef4444' : '#3b82f6';
  };

  return (
    // biome-ignore lint/a11y/useSemanticElements: Full-screen backdrop overlay is not semantically a button
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        fontFamily: '"M PLUS 1", sans-serif',
        animation: 'fadeIn 0.3s ease-out',
      }}
      role="button"
      tabIndex={0}
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Enter' && onClose()}
    >
      <div
        style={{
          backgroundColor: 'rgba(4, 4, 6, 0.98)',
          border: '2px solid #10b981',
          borderRadius: '12px',
          padding: '30px',
          maxWidth: '500px',
          width: '90%',
          boxShadow: '0 0 40px #10b98160',
          animation: 'slideUp 0.4s ease-out',
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="quest-complete-title"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={(e) => e.stopPropagation()}
      >
        {/* Success Icon */}
        <div
          style={{
            textAlign: 'center',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              fontSize: '64px',
              animation: 'pulse 1s ease-in-out infinite',
            }}
          >
            ✓
          </div>
        </div>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              fontSize: '12px',
              color: '#10b981',
              textTransform: 'uppercase',
              fontWeight: 'bold',
              letterSpacing: '0.1em',
              marginBottom: '10px',
            }}
          >
            QUEST COMPLETE
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: '24px',
              color: '#0ea5e9',
              lineHeight: 1.3,
            }}
          >
            {questTitle}
          </h2>
        </div>

        {/* Level Up Banner */}
        {rewards.leveledUp && (
          <div
            style={{
              backgroundColor: 'rgba(245, 158, 11, 0.2)',
              border: '2px solid #f59e0b',
              borderRadius: '8px',
              padding: '16px',
              marginBottom: '20px',
              textAlign: 'center',
              animation: 'glow 1.5s ease-in-out infinite',
            }}
          >
            <div style={{ fontSize: '20px', marginBottom: '8px' }}>🎉</div>
            <div
              style={{
                fontSize: '18px',
                color: '#fbbf24',
                fontWeight: 'bold',
              }}
            >
              LEVEL UP!
            </div>
            <div style={{ fontSize: '14px', color: '#cbd5e1', marginTop: '4px' }}>
              You reached Level {rewards.newLevel}
            </div>
          </div>
        )}

        {/* Rewards */}
        <div
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid #334155',
            borderRadius: '8px',
            padding: '20px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              color: '#64748b',
              textTransform: 'uppercase',
              marginBottom: '14px',
              textAlign: 'center',
            }}
          >
            Rewards Earned:
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {/* XP */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px',
                backgroundColor: 'rgba(251, 191, 36, 0.1)',
                borderRadius: '6px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>⭐</span>
                <span style={{ fontSize: '14px', color: '#cbd5e1' }}>Experience</span>
              </div>
              <span
                style={{
                  fontSize: '16px',
                  color: '#fbbf24',
                  fontWeight: 'bold',
                }}
              >
                +{rewards.xp} XP
              </span>
            </div>

            {/* Credits */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '10px',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderRadius: '6px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '20px' }}>💰</span>
                <span style={{ fontSize: '14px', color: '#cbd5e1' }}>Credits</span>
              </div>
              <span
                style={{
                  fontSize: '16px',
                  color: '#10b981',
                  fontWeight: 'bold',
                }}
              >
                +{rewards.credits}
              </span>
            </div>

            {/* Alignment Shift */}
            {rewards.alignmentShift && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px',
                  backgroundColor: `${getAlignmentColor(rewards.alignmentShift.faction)}20`,
                  borderRadius: '6px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>
                    {rewards.alignmentShift.faction === 'kurenai' ? '🔥' : '⚡'}
                  </span>
                  <span style={{ fontSize: '14px', color: '#cbd5e1' }}>
                    {rewards.alignmentShift.faction === 'kurenai' ? 'Kurenai' : 'Azure'} Reputation
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '16px',
                    color: getAlignmentColor(rewards.alignmentShift.faction),
                    fontWeight: 'bold',
                  }}
                >
                  +{rewards.alignmentShift.amount}
                </span>
              </div>
            )}

            {/* Items */}
            {rewards.items && rewards.items.length > 0 && (
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '10px',
                  backgroundColor: 'rgba(168, 85, 247, 0.1)',
                  borderRadius: '6px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '20px' }}>🎁</span>
                  <span style={{ fontSize: '14px', color: '#cbd5e1' }}>Items</span>
                </div>
                <span
                  style={{
                    fontSize: '16px',
                    color: '#a855f7',
                    fontWeight: 'bold',
                  }}
                >
                  {rewards.items.length} Item{rewards.items.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Continue Button */}
        <button
          type="button"
          onClick={onClose}
          style={{
            width: '100%',
            backgroundColor: '#10b981',
            border: 'none',
            borderRadius: '8px',
            color: '#ffffff',
            padding: '14px',
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: 'bold',
            fontFamily: 'inherit',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#059669';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#10b981';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          Continue
        </button>
      </div>

      {/* Animations */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 10px #f59e0b40; }
          50% { box-shadow: 0 0 20px #f59e0b80; }
        }
      `}</style>
    </div>
  );
}
