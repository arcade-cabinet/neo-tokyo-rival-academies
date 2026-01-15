import React, { type FC } from 'react';
import { useGameStore } from '@/state/gameStore';
import styles from './Inventory.module.css';

interface InventoryProps {
  onClose: () => void;
}

export const Inventory: FC<InventoryProps> = ({ onClose }) => {
  const { inventory } = useGameStore();

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>INVENTORY</h2>
          <button
            type="button"
            onClick={onClose}
            className={styles.closeBtn}
            style={{ minWidth: '48px', minHeight: '48px' }}
          >
            ✕
          </button>
        </div>

        {/* Item Grid */}
        <div className={styles.itemGrid}>
          {inventory.length === 0 ? (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>📦</div>
              <p>Your inventory is empty.</p>
              <p className={styles.emptyHint}>Collect items by defeating enemies and exploring!</p>
            </div>
          ) : (
            inventory.map((item) => (
              <div key={item.id} className={styles.itemCard}>
                <div className={styles.itemIcon}>
                  {item.id === 'data_shard' ? '💾' : '🔧'}
                </div>
                <div className={styles.itemInfo}>
                  <div className={styles.itemName}>{item.name}</div>
                  <div className={styles.itemCount}>×{item.count}</div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Stats Summary */}
        {inventory.length > 0 && (
          <div className={styles.footer}>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Total Items:</span>
              <span className={styles.statValue}>{inventory.length}</span>
            </div>
            <div className={styles.statItem}>
              <span className={styles.statLabel}>Total Count:</span>
              <span className={styles.statValue}>
                {inventory.reduce((sum, item) => sum + item.count, 0)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
