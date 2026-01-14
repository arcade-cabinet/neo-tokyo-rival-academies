import { afterEach, describe, expect, it, vi } from 'vitest';
import { resolveCombat } from '../CombatLogic';

describe('CombatLogic', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should calculate base damage correctly', () => {
    // Mock random to return 0.9 (no crit, assuming < 0.2 is crit for 20 ignition)
    vi.spyOn(Math, 'random').mockReturnValue(0.9);

    const attacker = { stats: { ignition: 20, structure: 100, logic: 10, flow: 10 } };
    const defender = { stats: { ignition: 10, structure: 50, logic: 10, flow: 10 } };
    // Defense = 50 * 0.1 = 5
    // Damage = 20 - 5 = 15

    const { damage, isCritical } = resolveCombat(attacker as any, defender as any);

    expect(damage).toBe(15);
    expect(isCritical).toBe(false);
  });

  it('should calculate critical damage correctly', () => {
    // Mock random to return 0 (guaranteed crit)
    vi.spyOn(Math, 'random').mockReturnValue(0);

    const attacker = { stats: { ignition: 20, structure: 100, logic: 10, flow: 10 } };
    const defender = { stats: { ignition: 10, structure: 50, logic: 10, flow: 10 } };
    // Base = 15
    // Crit = 15 * 1.5 = 22.5 -> floor(22) or 22.5? Logic used damage *= 1.5.
    // Math.floor(22.5) = 22.

    const { damage, isCritical } = resolveCombat(attacker as any, defender as any);

    expect(damage).toBe(22);
    expect(isCritical).toBe(true);
  });

  it('should return minimum damage of 1', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.9);
    const attacker = { stats: { ignition: 1, structure: 10, logic: 10, flow: 10 } };
    const defender = { stats: { ignition: 10, structure: 1000, logic: 10, flow: 10 } };
    // Def = 100. Atk = 1. Result = -99. Max(1, -99) = 1.

    const { damage } = resolveCombat(attacker as any, defender as any);
    expect(damage).toBe(1);
  });
});
