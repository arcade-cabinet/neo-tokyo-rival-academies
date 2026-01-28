import { beforeEach, describe, expect, it } from 'vitest';
import { type CombatDamageEvent, useCombatStore } from './combatStore';

const makeEvent = (): CombatDamageEvent => ({
  id: 'evt-1',
  damage: 12,
  isCritical: true,
  wasPlayerHit: false,
});

describe('combatStore', () => {
  beforeEach(() => {
    useCombatStore.getState().reset();
  });

  it('pops damage events and clears queue', () => {
    useCombatStore.setState({ combatDamageEvents: [makeEvent()] });

    const events = useCombatStore.getState().popDamageEvents();
    expect(events.length).toBe(1);
    expect(useCombatStore.getState().combatDamageEvents.length).toBe(0);

    const second = useCombatStore.getState().popDamageEvents();
    expect(second.length).toBe(0);
  });
});
