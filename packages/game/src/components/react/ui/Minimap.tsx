/**
 * Minimap Component
 *
 * Displays a top-down view of the current stage with entities
 */

import { type FC, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { world } from '../../../state/ecs';
import styles from './Minimap.module.css';

interface MinimapProps {
  visible?: boolean;
  width?: number;
  height?: number;
  scale?: number;
}

export const Minimap: FC<MinimapProps> = ({
  visible = true,
  width = 200,
  height = 150,
  scale = 0.1,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastUpdateRef = useRef<number>(0);

  // Update at 10 FPS for performance
  const UPDATE_INTERVAL = 100; // ms

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const updateMinimap = () => {
      const now = Date.now();
      if (now - lastUpdateRef.current < UPDATE_INTERVAL) {
        requestAnimationFrame(updateMinimap);
        return;
      }
      lastUpdateRef.current = now;

      // Clear canvas
      ctx.fillStyle = 'rgba(10, 10, 30, 0.9)';
      ctx.fillRect(0, 0, width, height);

      // Draw grid
      ctx.strokeStyle = 'rgba(74, 144, 226, 0.2)';
      ctx.lineWidth = 1;
      for (let i = 0; i < width; i += 20) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, height);
        ctx.stroke();
      }
      for (let i = 0; i < height; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(width, i);
        ctx.stroke();
      }

      // Get player position for centering
      const player = world.with('isPlayer', 'position').first;
      const centerX = player?.position?.x || 0;
      const centerY = player?.position?.z || 0;

      // Draw platforms
      for (const platform of world.with('isPlatform', 'position')) {
        if (!platform.position) continue;
        const x = (platform.position.x - centerX) * scale + width / 2;
        const y = height / 2 - (platform.position.z - centerY) * scale;

        const length = platform.platformData?.length || 10;
        const platformWidth = platform.platformData?.width || 5;

        ctx.fillStyle = 'rgba(150, 150, 150, 0.5)';
        ctx.fillRect(
          x - (length * scale) / 2,
          y - (platformWidth * scale) / 2,
          length * scale,
          platformWidth * scale
        );
      }

      // Draw enemies
      for (const enemy of world.with('isEnemy', 'position')) {
        if (!enemy.position) continue;
        const x = (enemy.position.x - centerX) * scale + width / 2;
        const y = height / 2 - (enemy.position.z - centerY) * scale;

        ctx.fillStyle = enemy.isBoss ? '#ff0066' : '#ff4444';
        ctx.beginPath();
        ctx.arc(x, y, enemy.isBoss ? 6 : 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw allies
      for (const ally of world.with('isAlly', 'position')) {
        if (!ally.position) continue;
        const x = (ally.position.x - centerX) * scale + width / 2;
        const y = height / 2 - (ally.position.z - centerY) * scale;

        ctx.fillStyle = '#44ff44';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
      }

      // Draw collectibles
      for (const collectible of world.with('isCollectible', 'position')) {
        if (!collectible.position) continue;
        const x = (collectible.position.x - centerX) * scale + width / 2;
        const y = height / 2 - (collectible.position.z - centerY) * scale;

        ctx.fillStyle = '#ffdd44';
        ctx.fillRect(x - 2, y - 2, 4, 4);
      }

      // Draw player (always centered)
      ctx.fillStyle = '#4a90e2';
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      requestAnimationFrame(updateMinimap);
    };

    updateMinimap();
  }, [width, height, scale]);

  if (!visible) return null;

  return (
    <div className={styles.minimap}>
      <div className={styles.header}>Minimap</div>
      <canvas ref={canvasRef} width={width} height={height} className={styles.canvas} />
      <div className={styles.legend}>
        <div className={styles.legendItem}>
          <span className={styles.dot} style={{ background: '#4a90e2' }}></span> You
        </div>
        <div className={styles.legendItem}>
          <span className={styles.dot} style={{ background: '#44ff44' }}></span> Ally
        </div>
        <div className={styles.legendItem}>
          <span className={styles.dot} style={{ background: '#ff4444' }}></span> Enemy
        </div>
        <div className={styles.legendItem}>
          <span className={styles.dot} style={{ background: '#ffdd44' }}></span> Item
        </div>
      </div>
    </div>
  );
};
