import React from 'react';
import type { Quest } from '@neo-tokyo/core';

interface QuestAcceptDialogProps {
  isOpen: boolean;
  quest: Quest | null;
  onAccept: () => void;
  onDecline: () => void;
}

export function QuestAcceptDialog({
  isOpen,
  quest,
  onAccept,
  onDecline,
}: QuestAcceptDialogProps) {
  if (!isOpen || !quest) return null;

  const getQuestTypeColor = (type: Quest['type']) => {
    switch (type) {
      case 'main':
        return '#f59e0b';
      case 'secret':
        return '#8b5cf6';
      default:
        return '#0ea5e9';
    }
  };

  const getAlignmentColor = (bias: Quest['alignmentBias']) => {
    switch (bias) {
      case 'kurenai':
        return '#ef4444';
      case 'azure':
        return '#3b82f6';
      default:
        return '#94a3b8';
    }
  };

  const getAlignmentLabel = (bias: Quest['alignmentBias']) => {
    switch (bias) {
      case 'kurenai':
        return '🔥 Kurenai Path';
      case 'azure':
        return '⚡ Azure Path';
      default:
        return '⚖️ Neutral';
    }
  };

  return (
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
      }}
    >
      <div
        style={{
          backgroundColor: 'rgba(4, 4, 6, 0.98)',
          border: '2px solid',
          borderColor: getQuestTypeColor(quest.type),
          borderRadius: '12px',
          padding: '30px',
          maxWidth: '600px',
          width: '90%',
          boxShadow: `0 0 30px ${getQuestTypeColor(quest.type)}40`,
        }}
      >
        {/* Header */}
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <div
            style={{
              fontSize: '12px',
              color: getQuestTypeColor(quest.type),
              textTransform: 'uppercase',
              fontWeight: 'bold',
              letterSpacing: '0.1em',
              marginBottom: '10px',
            }}
          >
            {quest.type === 'main' ? '⭐ MAIN QUEST' : quest.type === 'secret' ? '✨ SECRET QUEST' : '📋 SIDE QUEST'}
          </div>
          <h2
            style={{
              margin: 0,
              fontSize: '28px',
              color: '#0ea5e9',
              lineHeight: 1.3,
            }}
          >
            {quest.title}
          </h2>
        </div>

        {/* Description */}
        <div
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid #334155',
            borderRadius: '8px',
            padding: '16px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              fontSize: '10px',
              color: '#64748b',
              textTransform: 'uppercase',
              marginBottom: '8px',
            }}
          >
            Quest Brief:
          </div>
          <p
            style={{
              margin: 0,
              fontSize: '15px',
              color: '#cbd5e1',
              lineHeight: 1.6,
            }}
          >
            {quest.description}
          </p>
        </div>

        {/* Objective */}
        <div
          style={{
            padding: '12px',
            backgroundColor: 'rgba(6, 78, 59, 0.3)',
            borderLeft: '4px solid #10b981',
            borderRadius: '6px',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              fontSize: '10px',
              color: '#94a3b8',
              textTransform: 'uppercase',
              marginBottom: '6px',
            }}
          >
            Objective:
          </div>
          <div style={{ fontSize: '14px', color: '#e2e8f0', lineHeight: 1.4 }}>
            {quest.objective}
          </div>
        </div>

        {/* Location & Alignment */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '20px',
            padding: '12px',
            backgroundColor: 'rgba(30, 41, 59, 0.4)',
            borderRadius: '6px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '14px' }}>📍</span>
            <span style={{ fontSize: '13px', color: '#94a3b8' }}>
              {quest.location}
            </span>
          </div>
          <div
            style={{
              fontSize: '12px',
              color: getAlignmentColor(quest.alignmentBias),
              fontWeight: 'bold',
            }}
          >
            {getAlignmentLabel(quest.alignmentBias)}
          </div>
        </div>

        {/* Rewards */}
        <div
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            border: '1px solid #334155',
            borderRadius: '8px',
            padding: '14px',
            marginBottom: '24px',
          }}
        >
          <div
            style={{
              fontSize: '11px',
              color: '#64748b',
              textTransform: 'uppercase',
              marginBottom: '10px',
            }}
          >
            Rewards:
          </div>
          <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '16px' }}>⭐</span>
              <span style={{ fontSize: '14px', color: '#fbbf24' }}>
                {quest.rewards.xp} XP
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '16px' }}>💰</span>
              <span style={{ fontSize: '14px', color: '#10b981' }}>
                {quest.rewards.credits} Credits
              </span>
            </div>
            {quest.rewards.alignmentShift && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '16px' }}>
                  {quest.rewards.alignmentShift.faction === 'kurenai' ? '🔥' : '⚡'}
                </span>
                <span
                  style={{
                    fontSize: '14px',
                    color: getAlignmentColor(quest.rewards.alignmentShift.faction),
                  }}
                >
                  {quest.rewards.alignmentShift.faction === 'kurenai' ? 'Kurenai' : 'Azure'} +
                  {quest.rewards.alignmentShift.amount}
                </span>
              </div>
            )}
            {quest.rewards.items && quest.rewards.items.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '16px' }}>🎁</span>
                <span style={{ fontSize: '14px', color: '#a855f7' }}>
                  {quest.rewards.items.length} Item{quest.rewards.items.length > 1 ? 's' : ''}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            type="button"
            onClick={onAccept}
            style={{
              flex: 1,
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
            Accept Quest
          </button>
          <button
            type="button"
            onClick={onDecline}
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              border: '2px solid #64748b',
              borderRadius: '8px',
              color: '#94a3b8',
              padding: '14px',
              cursor: 'pointer',
              fontSize: '16px',
              fontWeight: 'bold',
              fontFamily: 'inherit',
              transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#cbd5e1';
              e.currentTarget.style.color = '#cbd5e1';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#64748b';
              e.currentTarget.style.color = '#94a3b8';
            }}
          >
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
