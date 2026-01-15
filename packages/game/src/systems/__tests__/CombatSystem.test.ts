import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveCombat } from '../CombatLogic';
import type { ECSEntity } from '../../state/ecs';

// Define typed fixture
type Combatant = Pick<ECSEntity, 'stats'>;

describe('CombatLogic', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should calculate base damage correctly', () => {
    // Inject RNG to return 0.9 (no crit)
    const rng = () => 0.9;

    const attacker: Combatant = { stats: { ignition: 20, structure: 100, logic: 10, flow: 10 } };
    const defender: Combatant = { stats: { ignition: 10, structure: 50, logic: 10, flow: 10 } };
    // Damage = 20 - (10 / 2) = 15

    const { damage, isCritical } = resolveCombat(attacker as ECSEntity, defender as ECSEntity, rng);

    expect(damage).toBe(15);
    expect(isCritical).toBe(false);
  });

  it('should calculate critical damage correctly', () => {
    // Inject RNG to return 0 (guaranteed crit)
    const rng = () => 0;

    const attacker: Combatant = { stats: { ignition: 20, structure: 100, logic: 10, flow: 10 } };
    const defender: Combatant = { stats: { ignition: 10, structure: 50, logic: 10, flow: 10 } };
    // Base = 15
    // Crit = 15 * 1.5 = 22.5 -> floor(22)

    const { damage, isCritical } = resolveCombat(attacker as ECSEntity, defender as ECSEntity, rng);

    expect(damage).toBe(22);
    expect(isCritical).toBe(true);
  });

  it('should return minimum damage of 1', () => {
    const rng = () => 0.9;
    const attacker: Combatant = { stats: { ignition: 1, structure: 10, logic: 10, flow: 10 } };
    const defender: Combatant = { stats: { ignition: 10, structure: 1000, logic: 10, flow: 10 } };

    const { damage } = resolveCombat(attacker as ECSEntity, defender as ECSEntity, rng);
    expect(damage).toBe(1);
  });
});