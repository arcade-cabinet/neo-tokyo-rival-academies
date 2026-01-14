import { useFrame } from '@react-three/fiber';
import type { ECSEntity } from '../state/ecs';
import { ECS, world } from '../state/ecs';
import { resolveCombat } from './CombatLogic';

interface CombatSystemProps {
  onGameOver: () => void;
  onScoreUpdate: (score: number) => void;
  onCameraShake?: () => void;
  onCombatText?: (message: string, color: string) => void;
}

const playersQuery = ECS.world.with('isPlayer', 'position', 'characterState');
const alliesQuery = ECS.world.with('isAlly', 'position', 'characterState');
const enemiesQuery = ECS.world.with('isEnemy', 'position');
const obstaclesQuery = ECS.world.with('isObstacle', 'position', 'obstacleType');
const collectiblesQuery = ECS.world.with('isCollectible', 'position');

export const CombatSystem = ({ onGameOver, onScoreUpdate, onCameraShake, onCombatText }: CombatSystemProps) => {
  useFrame(() => {
    // 1. Allies vs Enemies
    for (const ally of alliesQuery) {
       if (!ally.position) continue;
       const toRemove: ECSEntity[] = [];

       for (const enemy of enemiesQuery) {
           if (!enemy.position) continue;
           const dx = Math.abs(ally.position.x - enemy.position.x);
           const dy = Math.abs(ally.position.y - enemy.position.y);

           if (dx < 1.5 && dy < 2.0) {
               if (ally.characterState === 'attack') {
                   // Calculate RPG Damage
                   const { damage, isCritical } = resolveCombat(ally, enemy);

                   if (enemy.health !== undefined) {
                       enemy.health -= damage;
                       const color = isCritical ? '#ff0' : '#0ff';
                       const text = isCritical ? `CRIT ${damage}!` : `${damage}`;
                       onCombatText?.(text, color);

                       if (enemy.health <= 0) {
                           toRemove.push(enemy);
                           onCameraShake?.();
                       } else {
                           onCameraShake?.();
                       }
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
      let isGameOver = false;

      // --- ENEMY COLLISION ---
      const toRemove: ECSEntity[] = [];

      for (const enemy of enemiesQuery) {
        if (!enemy.position) continue;

        const dx = Math.abs(player.position.x - enemy.position.x);
        const dy = Math.abs(player.position.y - enemy.position.y);
        const dz = Math.abs((player.position.z || 0) - (enemy.position.z || 0));

        if (dx < 1.5 && dy < 2.0 && dz < 1.0) {
          if (player.characterState === 'attack' || player.characterState === 'sprint') {
             // Player Attacks
             const { damage, isCritical } = resolveCombat(player, enemy);

             if (enemy.health !== undefined) {
                 enemy.health -= damage;
                 const color = isCritical ? '#ff0' : '#f00';
                 const text = isCritical ? `CRIT ${damage}!` : `${damage}`;
                 onCombatText?.(text, color);

                 if (enemy.health <= 0) {
                     toRemove.push(enemy);
                     onScoreUpdate(100);
                     onCameraShake?.();

                     // Grant XP
                     if (player.level) {
                         player.level.xp += 20;
                         onCombatText?.('+20 XP', '#0f0');
                     }
                 } else {
                     onCameraShake?.();
                 }
             }
          } else {
            // Enemy Attacks Player (Game Over or Damage?)
            // For now, classic runner style: Contact = Death unless attacking
            // Ideally we'd calculate damage to player too, but let's keep the runner stakes high for now
            // or maybe deduct health?
            if (player.health !== undefined && player.stats) {
                 // Take damage instead of instant death if we have health
                 const enemyDmg = resolveCombat(enemy, player).damage;
                 player.health -= enemyDmg;
                 onCombatText?.(`-${enemyDmg}`, '#f00');
                 onCameraShake?.();

                 if (player.health <= 0) {
                     onGameOver();
                     isGameOver = true;
                     break;
                 } else {
                    // Knockback or I-frames?
                    // For now, just a push back to avoid multi-frame hits?
                    // Simplified: remove enemy so we don't die instantly next frame
                    // Or set a "stunned" state.
                    toRemove.push(enemy); // "We crashed into them, they break, we take damage"
                 }
            } else {
                onGameOver();
                isGameOver = true;
                break;
            }
          }
        }
      }

      if (isGameOver) break;

      // Process removals
      for (const enemy of toRemove) {
        world.remove(enemy);
      }

      // --- COLLECTIBLE COLLISION ---
      const collectiblesToRemove: ECSEntity[] = [];
      for (const collectible of collectiblesQuery) {
          if (!collectible.position) continue;
          const dx = Math.abs(player.position.x - collectible.position.x);
          const dy = Math.abs(player.position.y - collectible.position.y);

          if (dx < 1.0 && dy < 1.0) {
              collectiblesToRemove.push(collectible);
              onCombatText?.('DATA ACQUIRED', '#0f0');
              if (player.level) {
                  player.level.xp += 10;
              }
              onScoreUpdate(50);
          }
      }
      for (const c of collectiblesToRemove) {
          world.remove(c);
      }

      // --- OBSTACLE COLLISION ---
      for (const obstacle of obstaclesQuery) {
        if (!obstacle.position) continue;

        const dx = Math.abs(player.position.x - obstacle.position.x);
        // Box collision logic preserved from original
        if (dx < 1.0) {
          const obsHeight = obstacle.obstacleType === 'high' ? 3 : 1;
          const playerBottom = player.position.y;
          const playerTop = player.position.y + 2;
          const effectivePlayerTop = player.characterState === 'slide' ? player.position.y + 1 : playerTop;
          const obsBottom = obstacle.position.y;
          const obsTop = obstacle.position.y + obsHeight;

          if (effectivePlayerTop > obsBottom && playerBottom < obsTop) {
             // Obstacles deal damage now too
             if (player.health !== undefined) {
                 const obsDmg = 20;
                 player.health -= obsDmg;
                 onCombatText?.(`HIT -${obsDmg}`, '#fa0');
                 onCameraShake?.();
                 if (player.health <= 0) {
                     onGameOver();
                     isGameOver = true;
                     break;
                 }
                 // Remove obstacle to prevent multi-hit - Optional, but keeping safe for now
             } else {
                 // Fallback for entities without health
                 onGameOver();
                 isGameOver = true;
                 break;
             }
          }
        }
      }

      if (isGameOver) break;
    }
  });

  return null;
};
