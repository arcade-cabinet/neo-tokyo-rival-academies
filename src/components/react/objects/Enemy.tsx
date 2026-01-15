import type { FC } from 'react';
import * as THREE from 'three';
import type { CharacterState } from '@/types/game';
import { Character } from './Character';

interface EnemyProps {
  position: THREE.Vector3 | [number, number, number];
  enemyType: 'stand' | 'block';
  color?: number;
}

export const Enemy: FC<EnemyProps> = ({ position, enemyType, color = 0x00ffff }) => {
  // Enemy uses Character component
  const state: CharacterState = enemyType;
  const isBoss = color === 0xffffff; // Vera

  return (
    <group position={position} rotation={[0, -Math.PI / 2, 0]} scale={isBoss ? 2 : 1}>
      <Character color={color} position={[0, 0, 0]} state={state} speed={0} />
      {isBoss && <pointLight position={[0, 2, 0]} color="#00ffff" intensity={2} distance={10} />}
    </group>
  );
};
