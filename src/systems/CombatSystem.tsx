import { useFrame } from '@react-three/fiber';
import { ECS, world } from '../state/ecs';

interface CombatSystemProps {
  onGameOver: () => void;
  onScoreUpdate: (score: number) => void;
}

export const CombatSystem = ({ onGameOver, onScoreUpdate }: CombatSystemProps) => {
  useFrame(() => {
    const players = ECS.world.with('isPlayer', 'position', 'characterState');
    const enemies = ECS.world.with('isEnemy', 'position');
    const obstacles = ECS.world.with('isObstacle', 'position', 'obstacleType');

    for (const player of players) {
      if (!player.position) continue;

      // --- ENEMY COLLISION ---
      for (const enemy of enemies) {
        if (!enemy.position) continue;

        const dx = Math.abs(player.position.x - enemy.position.x);
        const dy = Math.abs(player.position.y - enemy.position.y);
        const dz = Math.abs((player.position.z || 0) - (enemy.position.z || 0));

        // Simple box collision
        if (dx < 1.5 && dy < 2.0 && dz < 1.0) {
          if (player.characterState === 'attack' || player.characterState === 'sprint') {
            // Player destroys enemy
            world.remove(enemy);
            onScoreUpdate(100); // More points for Yakuza
          } else {
            // Enemy kills player
            onGameOver();
          }
        }
      }

      // --- OBSTACLE COLLISION ---
      for (const obstacle of obstacles) {
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
          }
        }
      }
    }
  });

  return null;
};
