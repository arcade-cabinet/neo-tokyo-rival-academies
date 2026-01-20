import type { AbilityCooldownState } from '@/systems/AbilitySystem';

export function getRemainingCooldown(cooldown: AbilityCooldownState): number {
  return Math.max(0, cooldown.endsAt - Date.now());
}

export function updateCooldowns(cooldowns: AbilityCooldownState[]): AbilityCooldownState[] {
  const now = Date.now();
  return cooldowns.filter((cd) => cd.endsAt > now);
}
