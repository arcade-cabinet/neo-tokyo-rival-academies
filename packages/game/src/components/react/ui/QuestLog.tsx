import React, { type FC } from 'react';
import { useGameStore } from '@/state/gameStore';
import styles from './QuestLog.module.css';

interface QuestLogProps {
  onClose: () => void;
}

export const QuestLog: FC<QuestLogProps> = ({ onClose }) => {
  const { activeQuest, questLog } = useGameStore();

  return (
    <div className={styles.overlay}>
      <div className={styles.container}>
        {/* Header */}
        <div className={styles.header}>
          <h2 className={styles.title}>QUEST LOG</h2>
          <button
            type="button"
            onClick={onClose}
            className={styles.closeBtn}
            style={{ minWidth: '48px', minHeight: '48px' }}
          >
            ✕
          </button>
        </div>

        {/* Active Quest */}
        {activeQuest && (
          <div className={styles.activeQuest}>
            <div className={styles.questBadge}>ACTIVE</div>
            <h3 className={styles.questTitle}>{activeQuest.title}</h3>
            <p className={styles.questDescription}>{activeQuest.description}</p>
            <div className={styles.questStatus}>
              {activeQuest.completed ? '✓ COMPLETED' : '⋯ IN PROGRESS'}
            </div>
          </div>
        )}

        {/* Quest List */}
        <div className={styles.questList}>
          <h3 className={styles.sectionTitle}>All Quests</h3>
          {questLog.length === 0 ? (
            <p className={styles.emptyState}>No quests yet. Explore Neo-Tokyo to find missions!</p>
          ) : (
            questLog.map((quest) => (
              <div
                key={quest.id}
                className={`${styles.questItem} ${quest.completed ? styles.completed : ''}`}
              >
                <div className={styles.questItemHeader}>
                  <span className={styles.questItemTitle}>{quest.title}</span>
                  <span className={styles.questItemStatus}>
                    {quest.completed ? '✓' : '⋯'}
                  </span>
                </div>
                <p className={styles.questItemDescription}>{quest.description}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
