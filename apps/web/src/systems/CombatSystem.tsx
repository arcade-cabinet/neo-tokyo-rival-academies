import { useFrame } from '@react-three/fiber';
import type { ECSEntity } from '../state/ecs';
import { ECS, world } from '../state/ecs';

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

export const CombatSystem = ({
  onGameOver,
  onScoreUpdate,
  onCameraShake,
  onCombatText,
}: CombatSystemProps) => {
  useFrame(() => {
    // 1. Allies vs Enemies (Independent of Player)
    for (const ally of alliesQuery) {
      if (!ally.position) continue;
      const toRemove: ECSEntity[] = [];

      for (const enemy of enemiesQuery) {
        if (!enemy.position) continue;
        const dx = Math.abs(ally.position.x - enemy.position.x);
        const dy = Math.abs(ally.position.y - enemy.position.y);

        if (dx < 1.5 && dy < 2.0) {
          // If ally is attacking, kill enemy
          // If not, maybe nothing happens or enemy pushes ally?
          // For fun, let's say Ally is always lethal in this mode or auto-attacks
          if (ally.characterState === 'attack') {
            if (enemy.health && enemy.health > 0) {
              enemy.health -= 10; // Ally chips away
              onCameraShake?.();
              onCombatText?.('HIT!', '#0ff');
            } else {
              toRemove.push(enemy);
              onCameraShake?.(); // Feel the ally's impact too!
              onCombatText?.('KO!', '#0ff');
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

        // Simple box collision
        if (dx < 1.5 && dy < 2.0 && dz < 1.0) {
          if (player.characterState === 'attack' || player.characterState === 'sprint') {
            if (enemy.health && enemy.health > 0) {
              enemy.health -= 50; // Player deals heavy damage
              onCameraShake?.();
              onCombatText?.('CRITICAL!', '#f00');
            } else {
              // Player destroys enemy
              toRemove.push(enemy);
              onScoreUpdate(100); // More points for Yakuza
              onCameraShake?.();
              onCombatText?.('DESTROYED!', '#f00');
            }
          } else {
            // Enemy kills player
            onGameOver();
            isGameOver = true;
            break;
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
          // We rely on GameWorld or NeoTokyoGame to listen for this via a callback ideally,
          // but for now we just show combat text.
          // We need a way to trigger the Log Dialogue.
          // Let's use a "hack": set a special property on player or world temporarily?
          // Or better, trigger an event?
          // Actually, CombatSystem doesn't have access to onDialogue directly.
          // Let's assume we can trigger a global event or reuse onScoreUpdate for special values?
          // No, let's just use onCombatText for now, and handle logic in GameWorld loop if we want proper dialogue.
        }
      }
      for (const c of collectiblesToRemove) {
        world.remove(c);
      }

      // --- OBSTACLE COLLISION ---
      for (const obstacle of obstaclesQuery) {
        if (!obstacle.position) continue;

        const dx = Math.abs(player.position.x - obstacle.position.x);

        // Obstacle.tsx: boxGeometry args={[1, height, 4]}
        // x-width=1, z-depth=4. Check X overlap.
        if (dx < 1.0) {
          const obsHeight = obstacle.obstacleType === 'high' ? 3 : 1;
          // Obstacle visual is offset up, but entity position is at base
          // Visual bottom is at position.y
          // Visual top is at position.y + obsHeight

          // Player (approx) bottom at player.position.y
          // Player height approx 2

          const playerBottom = player.position.y;
          const playerTop = player.position.y + 2; // Standing height

          // Apply sliding hitbox reduction
          const effectivePlayerTop =
            player.characterState === 'slide' ? player.position.y + 1 : playerTop;

          const obsBottom = obstacle.position.y;
          const obsTop = obstacle.position.y + obsHeight;

          // Check Y overlap
          if (effectivePlayerTop > obsBottom && playerBottom < obsTop) {
            onGameOver();
            isGameOver = true;
            break;
          }
        }
      }

      if (isGameOver) break;
    }
  });

  return null;
};
