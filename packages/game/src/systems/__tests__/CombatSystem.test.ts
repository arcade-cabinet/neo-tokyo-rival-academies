import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveCombat } from '../CombatLogic';
import type { ECSEntity } from '../../state/ecs';

// Helper to create test fixtures with proper typing
const createCombatant = (stats: { ignition: number; structure: number; logic: number; flow: number }): Partial<ECSEntity> => ({
  stats,
});

describe('CombatLogic', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should calculate base damage correctly', () => {
    // Mock random to return 0.9 (no crit)
    vi.spyOn(Math, 'random').mockReturnValue(0.9);

    const attacker = createCombatant({ ignition: 20, structure: 100, logic: 10, flow: 10 });
    const defender = createCombatant({ ignition: 10, structure: 10, logic: 10, flow: 10 });
    // Formula: damage = max(1, floor(atk - def / 2))
    // atk = 20, def = 10, damage = 20 - 10/2 = 20 - 5 = 15

    const { damage, isCritical } = resolveCombat(attacker as ECSEntity, defender as ECSEntity);

    expect(damage).toBe(15);
    expect(isCritical).toBe(false);
  });

  it('should calculate critical damage correctly', () => {
    // Mock random to return 0 (guaranteed crit)
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const attacker = createCombatant({ ignition: 20, structure: 100, logic: 10, flow: 10 });
    const defender = createCombatant({ ignition: 10, structure: 10, logic: 10, flow: 10 });
    // Base = 15, Crit = floor(15 * 1.5) = floor(22.5) = 22

    const { damage, isCritical } = resolveCombat(attacker as ECSEntity, defender as ECSEntity);

    expect(damage).toBe(22);
    expect(isCritical).toBe(true);
  });

  it('should return minimum damage of 1', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9);
    const attacker = createCombatant({ ignition: 1, structure: 10, logic: 10, flow: 10 });
    const defender = createCombatant({ ignition: 10, structure: 1000, logic: 10, flow: 10 });

    const { damage } = resolveCombat(attacker as ECSEntity, defender as ECSEntity);
    expect(damage).toBe(1);
  });
});
