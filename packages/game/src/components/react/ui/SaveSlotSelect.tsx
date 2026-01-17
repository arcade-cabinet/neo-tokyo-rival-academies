import React from 'react';
import type { SaveSlot } from '@neo-tokyo/core';

interface SaveSlotSelectProps {
  isOpen: boolean;
  onClose: () => void;
  slots: SaveSlot[];
  mode: 'save' | 'load';
  onSelectSlot: (slotNumber: number) => void;
}

export function SaveSlotSelect({
  isOpen,
  onClose,
  slots,
  mode,
  onSelectSlot,
}: SaveSlotSelectProps) {
  if (!isOpen) return null;

  const formatPlaytime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  };

  const formatTimestamp = (timestamp: number): string => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'rgba(4, 4, 6, 0.98)',
        border: '2px solid #0ea5e9',
        borderRadius: '8px',
        padding: '30px',
        maxWidth: '700px',
        width: '90%',
        zIndex: 1000,
        fontFamily: '"M PLUS 1", sans-serif',
      }}
    >
      {/* Header */}
      <div style={{ marginBottom: '30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ margin: 0, fontSize: '28px', color: '#0ea5e9' }}>
          {mode === 'save' ? 'Save Game' : 'Load Game'}
        </h2>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            fontSize: '32px',
            cursor: 'pointer',
            padding: '0',
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>

      {/* Save Slots */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Auto-save slot */}
        {mode === 'load' && slots[0] && (
          <button
            type="button"
            onClick={() => onSelectSlot(0)}
            style={{
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              border: '2px solid #3b82f6',
              borderRadius: '8px',
              padding: '20px',
              cursor: slots[0].data ? 'pointer' : 'not-allowed',
              textAlign: 'left',
              opacity: slots[0].data ? 1 : 0.4,
              fontFamily: 'inherit',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#3b82f6', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                  💾 Auto-Save
                </div>
                {slots[0].data ? (
                  <>
                    <div style={{ fontSize: '16px', color: '#e2e8f0', marginBottom: '6px' }}>
                      Level {slots[0].data.level} • Act {slots[0].data.act}
                    </div>
                    <div style={{ fontSize: '14px', color: '#94a3b8' }}>
                      {slots[0].data.currentDistrictId.replace('district_', 'District ')} • {formatPlaytime(slots[0].data.playtimeMinutes)}
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: '14px', color: '#64748b' }}>Empty</div>
                )}
              </div>
              {slots[0].lastSaved && (
                <div style={{ fontSize: '12px', color: '#64748b', textAlign: 'right' }}>
                  {formatTimestamp(slots[0].lastSaved)}
                </div>
              )}
            </div>
          </button>
        )}

        {/* Manual save slots 1-3 */}
        {slots.slice(1, 4).map((slot) => (
          <button
            type="button"
            key={slot.slotNumber}
            onClick={() => onSelectSlot(slot.slotNumber)}
            style={{
              backgroundColor: slot.data ? 'rgba(15, 23, 42, 0.8)' : 'rgba(30, 41, 59, 0.4)',
              border: '2px solid',
              borderColor: slot.data ? '#0ea5e9' : '#334155',
              borderRadius: '8px',
              padding: '20px',
              cursor: 'pointer',
              textAlign: 'left',
              transition: 'all 0.2s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = slot.data
                ? 'rgba(14, 165, 233, 0.2)'
                : 'rgba(30, 41, 59, 0.6)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = slot.data
                ? 'rgba(15, 23, 42, 0.8)'
                : 'rgba(30, 41, 59, 0.4)';
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <div style={{ fontSize: '12px', color: '#0ea5e9', marginBottom: '8px', textTransform: 'uppercase', fontWeight: 'bold' }}>
                  Slot {slot.slotNumber}
                </div>
                {slot.data ? (
                  <>
                    <div style={{ fontSize: '16px', color: '#e2e8f0', marginBottom: '6px' }}>
                      Level {slot.data.level} • Act {slot.data.act}
                    </div>
                    <div style={{ fontSize: '14px', color: '#94a3b8', marginBottom: '6px' }}>
                      {slot.data.currentDistrictId.replace('district_', 'District ')}
                    </div>
                    <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', gap: '12px' }}>
                      <span>⏱️ {formatPlaytime(slot.data.playtimeMinutes)}</span>
                      <span style={{ color: slot.data.alignment > 0.2 ? '#3b82f6' : slot.data.alignment < -0.2 ? '#ef4444' : '#94a3b8' }}>
                        {slot.data.alignment > 0.2 ? '⚡ Azure' : slot.data.alignment < -0.2 ? '🔥 Kurenai' : '⚖️ Neutral'}
                      </span>
                    </div>
                  </>
                ) : (
                  <div style={{ fontSize: '14px', color: '#64748b' }}>
                    {mode === 'save' ? 'Empty Slot - Click to Save' : 'Empty Slot'}
                  </div>
                )}
              </div>
              {slot.lastSaved && (
                <div style={{ fontSize: '12px', color: '#64748b', textAlign: 'right' }}>
                  {formatTimestamp(slot.lastSaved)}
                </div>
              )}
            </div>
          </button>
        ))}
      </div>

      {/* Warning for save mode */}
      {mode === 'save' && (
        <div
          style={{
            marginTop: '20px',
            padding: '12px',
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid #f59e0b',
            borderRadius: '6px',
            fontSize: '13px',
            color: '#fbbf24',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span>⚠️</span>
          <span>Saving to an existing slot will overwrite previous data.</span>
        </div>
      )}
    </div>
  );
}
