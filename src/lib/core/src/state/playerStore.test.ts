import { beforeEach, describe, expect, it } from 'vitest';
import { usePlayerStore } from './playerStore';

const makeItem = (id: string, type: 'weapon' | 'accessory' | 'consumable' | 'key_item') => ({
  id,
  name: id,
  type,
});

describe('playerStore', () => {
  beforeEach(() => {
    usePlayerStore.getState().reset();
  });

  it('applies equipment bonuses when equipping items', () => {
    const store = usePlayerStore.getState();
    store.addItem(makeItem('redline-piston', 'weapon'));
    store.equipItem('redline-piston');

    const stats = usePlayerStore.getState().stats;
    expect(stats.ignition).toBe(12);
  });

  it('uses consumables and grants rewards', () => {
    const store = usePlayerStore.getState();
    store.addItem(makeItem('storm-adrenaline', 'consumable'));

    const result = store.useConsumable('storm-adrenaline');
    expect(result.applied).toBe(true);
    expect(result.xpGained).toBe(25);
    expect(usePlayerStore.getState().xp).toBe(25);
    expect(usePlayerStore.getState().inventory.length).toBe(0);
  });
});
