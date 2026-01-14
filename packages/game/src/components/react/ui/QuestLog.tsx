/**
 * Quest Log Component
 *
 * Displays active quests and completion objectives
 */

import { type FC, useState } from 'react';
import { useGameStore } from '../../../state/gameStore';
import styles from './QuestLog.module.css';

interface QuestLogProps {
  visible?: boolean;
  onToggle?: () => void;
}

export const QuestLog: FC<QuestLogProps> = ({ visible = false, onToggle }) => {
  const { activeQuest, questLog } = useGameStore();

  if (!visible) return null;

  return (
    <div className={styles.questLog}>
      <div className={styles.header}>
        <h2>Quest Log</h2>
        <button onClick={onToggle} className={styles.closeButton}>
          ×
        </button>
      </div>

      <div className={styles.content}>
        {/* Active Quest Section */}
        {activeQuest && (
          <div className={styles.activeQuest}>
            <h3>{activeQuest.name}</h3>
            <p className={styles.description}>{activeQuest.description}</p>

            <div className={styles.objectives}>
              <h4>Objectives:</h4>
              <ul>
                {activeQuest.objectives.map((obj, i) => (
                  <li key={i} className={obj.complete ? styles.complete : styles.incomplete}>
                    {obj.complete ? '✓' : '○'} {obj.description}
                  </li>
                ))}
              </ul>
            </div>

            {activeQuest.rewards && activeQuest.rewards.length > 0 && (
              <div className={styles.rewards}>
                <h4>Rewards:</h4>
                <ul>
                  {activeQuest.rewards.map((reward, i) => (
                    <li key={i}>
                      {reward.xp && `${reward.xp} XP`}
                      {reward.item && ` • ${reward.item.name}`}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Completed Quests Section */}
        <div className={styles.completed}>
          <h3>Completed Quests ({questLog.filter(q => q.complete).length})</h3>
          <ul className={styles.questList}>
            {questLog
              .filter(q => q.complete)
              .map((quest, i) => (
                <li key={i} className={styles.completedQuest}>
                  ✓ {quest.name}
                </li>
              ))}
          </ul>
        </div>

        {/* Available Quests Section */}
        <div className={styles.available}>
          <h3>Available Quests</h3>
          <ul className={styles.questList}>
            {questLog
              .filter(q => !q.complete && q !== activeQuest)
              .map((quest, i) => (
                <li key={i} className={styles.availableQuest}>
                  {quest.name}
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
};
