import { useFrame } from '@react-three/fiber';
import { ECS, type ECSEntity } from '../state/ecs';
import { resolveCombat } from './CombatLogic';
export type CombatEventType = 'damage' | 'heal' | 'xp' | 'item';

// Use same world instance
const world = ECS.world;

// Queries
const playersQuery = world.with('isPlayer', 'position', 'velocity', 'health', 'characterState');
const alliesQuery = world.with('isAlly', 'position', 'velocity');
const enemiesQuery = world.with('isEnemy', 'position', 'velocity');
const obstaclesQuery = world.with('isObstacle', 'position');
const collectiblesQuery = world.with('isCollectible', 'position');

interface CombatEvent {
    type: CombatEventType;
    value?: number;
    message?: string;
    color?: string;
    item?: string;
}

interface CombatSystemProps {
  onGameOver: () => void;
  onScoreUpdate: (score: number) => void;
  onCameraShake?: () => void;
  onCombatText?: (message: string, color: string) => void;
  onCombatEvent?: (event: CombatEvent) => void;
}

export const CombatSystem = ({ onGameOver, onScoreUpdate, onCameraShake, onCombatText, onCombatEvent }: CombatSystemProps) => {
  useFrame((_state, _delta) => {
    // 1. Ally AI vs Enemy Combat
    for (const ally of alliesQuery) {
       const toRemove: ECSEntity[] = [];
       for (const enemy of enemiesQuery) {
           if (ally.position && enemy.position) {
               const dist = ally.position.distanceTo(enemy.position);
               if (dist < 2.0) {
                   const { damage, isCritical } = resolveCombat(ally, enemy);
                   
                   // Ensure enemy has health to be damageable
                   if (enemy.health === undefined) {
                       enemy.health = 1;
                   }
                   enemy.health -= damage;
                   
                   const color = isCritical ? '#ff0' : '#0ff';
                   const text = isCritical ? `CRIT ${damage}!` : `${damage}`;

                   // Emit typed event
                   onCombatEvent?.({
                       type: 'damage',
                       value: damage,
                       message: text,
                       color: color
                   });
                   // Legacy fallback
                   if (!onCombatEvent) onCombatText?.(text, color);

                   if (enemy.health <= 0) {
                       toRemove.push(enemy);
                       onCameraShake?.();
                   } else {
                       onCameraShake?.();
                   }
               }
           }
       }
       for (const enemy of toRemove) {
           world.remove(enemy);
       }
    }

    // 2. Player Logic
    for (const player of playersQuery) {
      if (!player.position) continue;

      // --- ENEMY COLLISION ---
      const enemiesToRemove: ECSEntity[] = [];

      for (const enemy of enemiesQuery) {
        if (!enemy.position) continue;

        const dx = Math.abs(player.position.x - enemy.position.x);
        const dy = Math.abs(player.position.y - enemy.position.y);
        const dz = Math.abs((player.position.z || 0) - (enemy.position.z || 0));

        if (dx < 1.5 && dy < 2.0 && dz < 1.0) {
          if (player.characterState === 'attack' || player.characterState === 'sprint') {
             // Player Attacks
             const { damage, isCritical } = resolveCombat(player, enemy);

             // Ensure enemy has health to be damageable
             if (enemy.health === undefined) {
                 enemy.health = 1;
             }
             enemy.health -= damage;

             const color = isCritical ? '#ff0' : '#f00';
             const text = isCritical ? `CRIT ${damage}!` : `${damage}`;

             onCombatEvent?.({
                 type: 'damage',
                 value: damage,
                 message: text,
                 color: color
             });
             if (!onCombatEvent) onCombatText?.(text, color);

             if (enemy.health <= 0) {
                 enemiesToRemove.push(enemy);
                 onScoreUpdate(100);
                 onCameraShake?.();

                 // Grant XP
                 if (player.level) {
                     player.level.xp += 20;
                     onCombatEvent?.({ type: 'xp', value: 20, message: '+20 XP', color: '#0f0' });
                     if (!onCombatEvent) onCombatText?.('+20 XP', '#0f0');
                 }
             } else {
                 onCameraShake?.();
             }
          } else {
            // Enemy Attacks Player
            if (player.health !== undefined && player.stats) {
                 // Take damage instead of instant death if we have health
                 const enemyDmg = resolveCombat(enemy, player).damage;
                 player.health -= enemyDmg;

                 onCombatEvent?.({ type: 'damage', value: enemyDmg, message: `-${enemyDmg}`, color: '#f00' });
                 if (!onCombatEvent) onCombatText?.(`-${enemyDmg}`, '#f00');

                 onCameraShake?.();

                 if (player.health <= 0) {
                     onGameOver();
                     return; // Break frame
                 } else {
                    // Knockback or stun visual
                    enemiesToRemove.push(enemy); // "We crashed into them, they break, we take damage"
                 }
            }
          }
        }
      }
      for (const e of enemiesToRemove) {
        world.remove(e);
      }

      // --- OBSTACLE COLLISION ---
      for (const obstacle of obstaclesQuery) {
        if (!obstacle.position) continue;

        const dx = Math.abs(player.position.x - obstacle.position.x);
        const dy = Math.abs(player.position.y - obstacle.position.y);
        const dz = Math.abs((player.position.z || 0) - (obstacle.position.z || 0));

        if (dx < 1.0 && dy < 1.0 && dz < 0.8) {
          const obsDmg = 10;
          player.health -= obsDmg;
          
          onCombatEvent?.({ type: 'damage', value: obsDmg, message: `HIT -${obsDmg}`, color: '#fa0' });
          if (!onCombatEvent) onCombatText?.(`HIT -${obsDmg}`, '#fa0');

          onCameraShake?.();

          if (player.health <= 0) {
            onGameOver();
            return;
          }
          // Remove obstacle so we don't hit it again
          world.remove(obstacle);
        }
      }

      // --- COLLECTIBLE COLLISION ---
      for (const item of collectiblesQuery) {
        if (!item.position) continue;

        const dist = player.position.distanceTo(item.position);
        if (dist < 1.5) {
          onCombatEvent?.({ type: 'item', item: 'data_shard', message: 'DATA ACQUIRED', color: '#0f0' });
          if (!onCombatEvent) onCombatText?.('DATA ACQUIRED', '#0f0');
          world.remove(item);
        }
      }
    }
  });

  return null;
};