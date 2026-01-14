import type { FC } from 'react';
import type { CharacterState } from '@/types/game';
import { Character } from './Character';

interface EnemyProps {
  position: [number, number, number];
  enemyType: 'stand' | 'block';
  color?: number;
}

export const Enemy: FC<EnemyProps> = ({ position, enemyType, color = 0x00ffff }) => {
  // Enemy uses Character component
  const state: CharacterState = enemyType;

  return (
    <group position={position} rotation={[0, -Math.PI / 2, 0]}>
      <Character color={color} position={[0, 0, 0]} state={state} speed={0} />
    </group>
  );
};
