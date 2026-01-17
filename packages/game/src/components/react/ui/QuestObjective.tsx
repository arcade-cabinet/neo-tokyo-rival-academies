import React, { useMemo } from 'react';
import { useQuestStore } from '@neo-tokyo/core';

export function QuestObjective() {
  // Use stable selector - get the Map directly, then derive currentQuest in useMemo
  const activeQuestsMap = useQuestStore((state) => state.activeQuests);
  const currentQuest = useMemo(() => {
    const quests = Array.from(activeQuestsMap.values());
    // Show the first active quest (typically main quest)
    return quests.find((q) => q.type === 'main') || quests[0];
  }, [activeQuestsMap]);

  if (!currentQuest) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        backgroundColor: 'rgba(15, 23, 42, 0.95)',
        border: '1px solid #334155',
        borderRadius: '8px',
        padding: '12px 16px',
        maxWidth: '320px',
        fontFamily: '"M PLUS 1", sans-serif',
        zIndex: 100,
      }}
    >
      {/* Quest Type Badge */}
      <div style={{ marginBottom: '6px' }}>
        <span
          style={{
            fontSize: '10px',
            color: currentQuest.type === 'main' ? '#f59e0b' : currentQuest.type === 'secret' ? '#8b5cf6' : '#64748b',
            textTransform: 'uppercase',
            fontWeight: 'bold',
            letterSpacing: '0.05em',
          }}
        >
          {currentQuest.type === 'main' ? '⭐ Main Quest' : currentQuest.type === 'secret' ? '✨ Secret' : '📋 Side Quest'}
        </span>
      </div>

      {/* Quest Title */}
      <h3 style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#0ea5e9', lineHeight: 1.3 }}>
        {currentQuest.title}
      </h3>

      {/* Objective */}
      <div
        style={{
          padding: '8px',
          backgroundColor: 'rgba(6, 78, 59, 0.3)',
          borderLeft: '3px solid #10b981',
          borderRadius: '4px',
        }}
      >
        <div style={{ fontSize: '10px', color: '#94a3b8', marginBottom: '4px', textTransform: 'uppercase' }}>
          Objective:
        </div>
        <div style={{ fontSize: '12px', color: '#e2e8f0', lineHeight: 1.4 }}>
          {currentQuest.objective}
        </div>
      </div>

      {/* Location */}
      <div style={{ marginTop: '8px', fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <span>📍</span>
        <span>{currentQuest.location}</span>
      </div>
    </div>
  );
}
