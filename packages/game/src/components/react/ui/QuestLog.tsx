import { useQuestStore } from '@neo-tokyo/core';
import React, { useMemo } from 'react';

interface QuestLogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuestLog({ isOpen, onClose }: QuestLogProps) {
  // Use stable selectors - get Maps/Sets directly, then derive arrays in useMemo
  const activeQuestsMap = useQuestStore((state) => state.activeQuests);
  const completedQuestsSet = useQuestStore((state) => state.completedQuests);
  const activeQuests = useMemo(() => Array.from(activeQuestsMap.values()), [activeQuestsMap]);
  const completedQuests = useMemo(() => Array.from(completedQuestsSet), [completedQuestsSet]);
  const [tab, setTab] = React.useState<'active' | 'completed'>('active');

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'rgba(4, 4, 6, 0.95)',
        border: '2px solid #0ea5e9',
        borderRadius: '8px',
        padding: '20px',
        minWidth: '500px',
        maxWidth: '700px',
        maxHeight: '80vh',
        overflow: 'auto',
        zIndex: 1000,
        color: '#e2e8f0',
        fontFamily: '"M PLUS 1", sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          marginBottom: '20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <h2 style={{ margin: 0, fontSize: '24px', color: '#0ea5e9' }}>Quest Log</h2>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            fontSize: '24px',
            cursor: 'pointer',
            padding: '0',
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          marginBottom: '20px',
          borderBottom: '1px solid #334155',
        }}
      >
        <button
          type="button"
          onClick={() => setTab('active')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: tab === 'active' ? '2px solid #0ea5e9' : '2px solid transparent',
            color: tab === 'active' ? '#0ea5e9' : '#94a3b8',
            padding: '10px 20px',
            cursor: 'pointer',
            fontSize: '16px',
            fontFamily: 'inherit',
          }}
        >
          Active ({activeQuests.length})
        </button>
        <button
          type="button"
          onClick={() => setTab('completed')}
          style={{
            background: 'none',
            border: 'none',
            borderBottom: tab === 'completed' ? '2px solid #0ea5e9' : '2px solid transparent',
            color: tab === 'completed' ? '#0ea5e9' : '#94a3b8',
            padding: '10px 20px',
            cursor: 'pointer',
            fontSize: '16px',
            fontFamily: 'inherit',
          }}
        >
          Completed ({completedQuests.length})
        </button>
      </div>

      {/* Quest List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {tab === 'active' && activeQuests.length === 0 && (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '40px 20px' }}>
            No active quests. Explore the district to find new opportunities!
          </div>
        )}

        {tab === 'active' &&
          activeQuests.map((quest) => (
            <div
              key={quest.id}
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid #334155',
                borderRadius: '6px',
                padding: '15px',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'start',
                  marginBottom: '8px',
                }}
              >
                <h3 style={{ margin: 0, fontSize: '18px', color: '#0ea5e9' }}>{quest.title}</h3>
                <span
                  style={{
                    fontSize: '12px',
                    color:
                      quest.type === 'main'
                        ? '#f59e0b'
                        : quest.type === 'secret'
                          ? '#8b5cf6'
                          : '#64748b',
                    textTransform: 'uppercase',
                    fontWeight: 'bold',
                  }}
                >
                  {quest.type}
                </span>
              </div>

              <p style={{ margin: '8px 0', fontSize: '14px', color: '#cbd5e1', lineHeight: 1.6 }}>
                {quest.description}
              </p>

              <div
                style={{
                  marginTop: '12px',
                  padding: '10px',
                  backgroundColor: 'rgba(6, 78, 59, 0.3)',
                  borderLeft: '3px solid #10b981',
                  borderRadius: '4px',
                }}
              >
                <div style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '4px' }}>
                  Objective:
                </div>
                <div style={{ fontSize: '14px', color: '#e2e8f0' }}>{quest.objective}</div>
              </div>

              <div style={{ marginTop: '10px', fontSize: '12px', color: '#64748b' }}>
                📍 {quest.location}
              </div>

              {quest.rewards && (
                <div style={{ marginTop: '10px', display: 'flex', gap: '15px', fontSize: '12px' }}>
                  <span style={{ color: '#fbbf24' }}>💰 {quest.rewards.credits} credits</span>
                  <span style={{ color: '#60a5fa' }}>⭐ {quest.rewards.xp} XP</span>
                  {quest.rewards.alignmentShift && (
                    <span
                      style={{
                        color: quest.rewards.alignmentShift.kurenai ? '#ef4444' : '#3b82f6',
                      }}
                    >
                      {quest.rewards.alignmentShift.kurenai ? '🔥' : '⚡'} Reputation
                    </span>
                  )}
                </div>
              )}
            </div>
          ))}

        {tab === 'completed' && completedQuests.length === 0 && (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '40px 20px' }}>
            No completed quests yet. Complete your first quest to start your legend!
          </div>
        )}

        {tab === 'completed' &&
          completedQuests.map((questId) => (
            <div
              key={questId}
              style={{
                backgroundColor: 'rgba(15, 23, 42, 0.5)',
                border: '1px solid #1e293b',
                borderRadius: '6px',
                padding: '15px',
                opacity: 0.7,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '18px' }}>✓</span>
                <span style={{ color: '#94a3b8', fontSize: '16px' }}>{questId}</span>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
