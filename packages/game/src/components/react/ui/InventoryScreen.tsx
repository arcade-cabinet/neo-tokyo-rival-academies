import React from 'react';
import type { InventoryItem } from '@neo-tokyo/core';

interface InventoryScreenProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  credits: number;
  onUseItem?: (item: InventoryItem) => void;
}

export function InventoryScreen({
  isOpen,
  onClose,
  inventory,
  credits,
  onUseItem,
}: InventoryScreenProps) {
  const [selectedItem, setSelectedItem] = React.useState<InventoryItem | null>(null);
  const [filter, setFilter] = React.useState<'all' | 'weapon' | 'accessory' | 'consumable' | 'key_item'>('all');

  if (!isOpen) return null;

  const filteredInventory =
    filter === 'all'
      ? inventory
      : inventory.filter((item) => item.type === filter);

  const getItemTypeColor = (type: InventoryItem['type']) => {
    switch (type) {
      case 'weapon':
        return '#ef4444';
      case 'accessory':
        return '#a855f7';
      case 'consumable':
        return '#10b981';
      case 'key_item':
        return '#f59e0b';
      default:
        return '#64748b';
    }
  };

  const getItemTypeIcon = (type: InventoryItem['type']) => {
    switch (type) {
      case 'weapon':
        return '⚔️';
      case 'accessory':
        return '💎';
      case 'consumable':
        return '🧪';
      case 'key_item':
        return '🔑';
      default:
        return '📦';
    }
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
        width: '90%',
        maxWidth: '900px',
        maxHeight: '90vh',
        overflow: 'hidden',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        fontFamily: '"M PLUS 1", sans-serif',
      }}
    >
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px',
          borderBottom: '1px solid #334155',
        }}
      >
        <div>
          <h2 style={{ margin: '0 0 5px 0', fontSize: '24px', color: '#0ea5e9' }}>Inventory</h2>
          <div style={{ fontSize: '14px', color: '#fbbf24', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>💰</span>
            <span>{credits.toLocaleString()} Credits</span>
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          style={{
            background: 'none',
            border: 'none',
            color: '#94a3b8',
            fontSize: '28px',
            cursor: 'pointer',
            padding: '0',
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>

      {/* Filter Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '10px',
          padding: '15px 20px',
          borderBottom: '1px solid #334155',
          overflowX: 'auto',
        }}
      >
        {(['all', 'weapon', 'accessory', 'consumable', 'key_item'] as const).map((f) => (
          <button
            type="button"
            key={f}
            onClick={() => setFilter(f)}
            style={{
              background: filter === f ? 'rgba(14, 165, 233, 0.2)' : 'none',
              border: '1px solid',
              borderColor: filter === f ? '#0ea5e9' : '#334155',
              borderRadius: '6px',
              color: filter === f ? '#0ea5e9' : '#94a3b8',
              padding: '8px 16px',
              cursor: 'pointer',
              fontSize: '13px',
              textTransform: 'capitalize',
              fontFamily: 'inherit',
              whiteSpace: 'nowrap',
            }}
          >
            {f.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Item Grid */}
        <div
          style={{
            flex: 1,
            padding: '20px',
            overflowY: 'auto',
          }}
        >
          {filteredInventory.length === 0 && (
            <div style={{ textAlign: 'center', color: '#64748b', padding: '60px 20px' }}>
              No items in this category yet.
            </div>
          )}

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))',
              gap: '12px',
            }}
          >
            {filteredInventory.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => setSelectedItem(item)}
                style={{
                  backgroundColor: selectedItem?.id === item.id ? 'rgba(14, 165, 233, 0.2)' : 'rgba(15, 23, 42, 0.8)',
                  border: '2px solid',
                  borderColor: selectedItem?.id === item.id ? '#0ea5e9' : item.equipped ? '#10b981' : '#334155',
                  borderRadius: '8px',
                  padding: '12px',
                  cursor: 'pointer',
                  textAlign: 'center',
                  position: 'relative',
                  transition: 'all 0.2s',
                  fontFamily: 'inherit',
                }}
              >
                {/* Equipped Badge */}
                {item.equipped && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '4px',
                      right: '4px',
                      fontSize: '12px',
                    }}
                  >
                    ✓
                  </div>
                )}

                {/* Icon */}
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                  {getItemTypeIcon(item.type)}
                </div>

                {/* Name */}
                <div
                  style={{
                    fontSize: '12px',
                    color: '#e2e8f0',
                    marginBottom: '4px',
                    fontWeight: 500,
                    lineHeight: 1.2,
                  }}
                >
                  {item.name}
                </div>

                {/* Quantity */}
                {item.quantity > 1 && (
                  <div style={{ fontSize: '11px', color: '#94a3b8' }}>
                    ×{item.quantity}
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Item Details Panel */}
        {selectedItem && (
          <div
            style={{
              width: '300px',
              borderLeft: '1px solid #334155',
              padding: '20px',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              overflowY: 'auto',
            }}
          >
            {/* Item Header */}
            <div style={{ marginBottom: '16px' }}>
              <div
                style={{
                  fontSize: '48px',
                  textAlign: 'center',
                  marginBottom: '12px',
                }}
              >
                {getItemTypeIcon(selectedItem.type)}
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#0ea5e9', textAlign: 'center' }}>
                {selectedItem.name}
              </h3>
              <div style={{ textAlign: 'center' }}>
                <span
                  style={{
                    fontSize: '12px',
                    color: getItemTypeColor(selectedItem.type),
                    textTransform: 'uppercase',
                    fontWeight: 'bold',
                  }}
                >
                  {selectedItem.type.replace('_', ' ')}
                </span>
              </div>
            </div>

            {/* Quantity */}
            {selectedItem.quantity > 1 && (
              <div
                style={{
                  marginBottom: '16px',
                  padding: '8px',
                  backgroundColor: 'rgba(100, 116, 139, 0.2)',
                  borderRadius: '6px',
                  textAlign: 'center',
                  fontSize: '14px',
                  color: '#cbd5e1',
                }}
              >
                Quantity: {selectedItem.quantity}
              </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {selectedItem.type === 'consumable' && onUseItem && (
                <button
                  type="button"
                  onClick={() => onUseItem(selectedItem)}
                  style={{
                    backgroundColor: '#10b981',
                    border: 'none',
                    borderRadius: '6px',
                    color: '#ffffff',
                    padding: '12px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 'bold',
                    fontFamily: 'inherit',
                  }}
                >
                  Use Item
                </button>
              )}

              {selectedItem.equipped && (
                <div
                  style={{
                    backgroundColor: 'rgba(16, 185, 129, 0.2)',
                    border: '1px solid #10b981',
                    borderRadius: '6px',
                    color: '#10b981',
                    padding: '12px',
                    fontSize: '14px',
                    textAlign: 'center',
                  }}
                >
                  ✓ Equipped
                </div>
              )}

              {(selectedItem.type === 'weapon' || selectedItem.type === 'accessory') && !selectedItem.equipped && (
                <button
                  type="button"
                  style={{
                    backgroundColor: 'transparent',
                    border: '1px solid #0ea5e9',
                    borderRadius: '6px',
                    color: '#0ea5e9',
                    padding: '12px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontFamily: 'inherit',
                  }}
                >
                  Equip
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
