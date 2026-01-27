export type StatType = 'structure' | 'ignition' | 'logic' | 'flow';

export interface StatAllocation {
  structure: number;
  ignition: number;
  logic: number;
  flow: number;
}

export interface AllocationResult<TStats> {
  success: boolean;
  error?: string;
  newStats?: TStats;
  remainingPoints?: number;
}

export function validateAllocation(
  allocation: StatAllocation,
  availablePoints: number
): { valid: boolean; error?: string } {
  const totalPoints =
    allocation.structure + allocation.ignition + allocation.logic + allocation.flow;

  if (totalPoints > availablePoints) {
    return {
      valid: false,
      error: `Allocation exceeds available points (${totalPoints} > ${availablePoints})`,
    };
  }

  if (
    allocation.structure < 0 ||
    allocation.ignition < 0 ||
    allocation.logic < 0 ||
    allocation.flow < 0
  ) {
    return { valid: false, error: 'Cannot allocate negative stat points' };
  }

  return { valid: true };
}

export function getRecommendedAllocation(
  role: 'tank' | 'melee_dps' | 'ranged_dps' | 'balanced',
  points: number
): StatAllocation {
  const weights: Record<typeof role, [number, number, number, number]> = {
    tank: [0.5, 0.2, 0.1, 0.2],
    melee_dps: [0.2, 0.5, 0.1, 0.2],
    ranged_dps: [0.2, 0.1, 0.5, 0.2],
    balanced: [0.25, 0.25, 0.25, 0.25],
  };

  const [sW, iW, lW, fW] = weights[role];
  const allocation: StatAllocation = {
    structure: Math.floor(points * sW),
    ignition: Math.floor(points * iW),
    logic: Math.floor(points * lW),
    flow: Math.floor(points * fW),
  };

  const total = allocation.structure + allocation.ignition + allocation.logic + allocation.flow;
  const remainder = points - total;
  if (remainder > 0) {
    const primaryStat: keyof StatAllocation =
      role === 'tank'
        ? 'structure'
        : role === 'melee_dps'
          ? 'ignition'
          : role === 'ranged_dps'
            ? 'logic'
            : 'structure';
    allocation[primaryStat] += remainder;
  }

  return allocation;
}

export function applyAllocation<TStats extends StatAllocation>(
  stats: TStats,
  allocation: StatAllocation,
  availablePoints: number
): AllocationResult<TStats> {
  const validation = validateAllocation(allocation, availablePoints);
  if (!validation.valid) {
    return { success: false, error: validation.error };
  }

  const totalPoints =
    allocation.structure + allocation.ignition + allocation.logic + allocation.flow;

  const newStats = {
    ...stats,
    structure: stats.structure + allocation.structure,
    ignition: stats.ignition + allocation.ignition,
    logic: stats.logic + allocation.logic,
    flow: stats.flow + allocation.flow,
  } as TStats;

  return {
    success: true,
    newStats,
    remainingPoints: availablePoints - totalPoints,
  };
}
