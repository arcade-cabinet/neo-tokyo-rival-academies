import type { FC } from 'react';
import type { CharacterState } from '@/types/game';
import { Character } from './Character';

interface EnemyProps {
  position: [number, number, number];
  enemyType: 'stand' | 'block';
}

export const Enemy: FC<EnemyProps> = ({ position, enemyType }) => {
  // Enemy uses Character component with cyan color
  const state: CharacterState = enemyType === 'stand' ? 'stand' : 'block';

  return (
    <group position={position} rotation={[0, -Math.PI / 2, 0]}>
      <Character color={0x00ffff} position={[0, 0, 0]} state={state} speed={0} />
    </group>
  );
};
