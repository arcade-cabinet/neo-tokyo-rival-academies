# 4. Combat & Progression Systems

**Parent:** [tasks.md](../tasks.md)
**Validates:** Requirements 7, 8, 9

## Overview
Implements complete combat mechanics with stat-based damage calculations, break system, XP/leveling, and reputation tracking.

## Prerequisites
- ECS systems functional
- Character models loaded
- AI systems operational (Section 3)

## Tasks

### 4.1. Combat Damage System

**Validates:** Requirement 7.1, 7.2

- [ ] 4.1.1. Implement damage calculation formulas
  - Base formula: `Damage = (Attacker.AttackPower * StatMultiplier) - (Defender.Defense / 2)`
  - Stat multipliers: Ignition (melee), Logic (ranged/tech)
  - Critical hit multiplier: 2.0x damage
  - _File: `packages/game/src/systems/CombatLogic.ts`_
  - _Validates: Requirements 7.1_

- [ ]* 4.1.2. Write property test for damage calculations
  - **Property 21: Damage non-negativity**
  - **Validates: Requirements 7.1**
  - For any attacker/defender stat combination, damage should be >= 0
  - Critical hits should always deal more damage than normal hits

- [ ] 4.1.3. Implement hit detection system
  - Collision-based hit registration
  - Attack hitbox timing windows
  - Invincibility frames after hit
  - _File: `packages/game/src/systems/HitDetection.ts`_
  - _Validates: Requirements 7.2_

- [ ] 4.1.4. Create floating damage numbers
  - Spawn damage text at hit location
  - Color-coded: white (normal), yellow (critical), red (player damage)
  - Animate upward with fade
  - _File: `packages/game/src/components/react/ui/CombatText.tsx`_

- [ ]* 4.1.5. Write property test for hit detection
  - **Property 22: Hit registration accuracy**
  - **Validates: Requirements 7.2**
  - For any attack hitbox overlapping target, hit should register
  - Invincibility frames should prevent multiple hits

### 4.2. Break System

**Validates:** Requirement 7.3

- [ ] 4.2.1. Implement stability gauge system
  - Each enemy has stability value (100-500 based on type)
  - Attacks reduce stability by damage amount
  - Stability regenerates over time when not hit
  - _File: `packages/game/src/systems/BreakSystem.ts`_
  - _Validates: Requirements 7.3_

- [ ] 4.2.2. Create break state mechanics
  - When stability reaches 0, enemy enters "broken" state
  - Broken state lasts 5 seconds
  - All attacks during break are critical hits
  - Visual indicator: enemy flashes/staggers
  - _File: `packages/game/src/systems/BreakSystem.ts`_

- [ ]* 4.2.3. Write property test for break system
  - **Property 23: Break state consistency**
  - **Validates: Requirements 7.3**
  - For any enemy, stability should never go below 0
  - Break state should always trigger when stability depleted
  - All hits during break should be critical

### 4.3. Combat Abilities

**Validates:** Requirement 7.4

- [ ] 4.3.1. Create ability system framework
  - Define ability interface: name, cost, cooldown, effect
  - Implement ability execution pipeline
  - Track cooldowns per character
  - _File: `packages/game/src/systems/AbilitySystem.ts`_

- [ ] 4.3.2. Implement core abilities
  - **Kai**: "Lightning Strike" (high damage, breaks stability)
  - **Vera**: "Tech Barrier" (temporary invincibility)
  - **Enemies**: Faction-specific abilities
  - _File: `packages/game/src/data/abilities.json`_
  - _Validates: Requirements 7.4_

- [ ]* 4.3.3. Write property test for ability cooldowns
  - **Property 24: Cooldown enforcement**
  - **Validates: Requirements 7.4**
  - For any ability, it should not be usable during cooldown
  - Cooldown should decrement correctly over time

### 4.4. XP & Leveling System

**Validates:** Requirement 8.1, 8.2

- [ ] 4.4.1. Implement XP gain mechanics
  - XP awarded on enemy defeat
  - XP scales with enemy level and type
  - Bonus XP for break finishes
  - _File: `packages/game/src/systems/ProgressionSystem.ts`_
  - _Validates: Requirements 8.1_

- [ ] 4.4.2. Create leveling system
  - XP curve: `XPRequired = 100 * (level ^ 1.5)`
  - Level cap: 30
  - Auto-level on XP threshold
  - _File: `packages/game/src/systems/ProgressionSystem.ts`_
  - _Validates: Requirements 8.2_

- [ ]* 4.4.3. Write property test for XP progression
  - **Property 25: XP monotonicity**
  - **Validates: Requirements 8.1, 8.2**
  - For any sequence of XP gains, total XP should never decrease
  - Level should never decrease
  - XP required should increase with level

### 4.5. Stat Allocation

**Validates:** Requirement 8.3

- [ ] 4.5.1. Implement stat point system
  - 3 stat points awarded per level
  - Four stats: Structure, Ignition, Logic, Flow
  - Each point increases stat by 1
  - _File: `packages/game/src/systems/StatAllocation.ts`_
  - _Validates: Requirements 8.3_

- [ ] 4.5.2. Create stat allocation UI
  - Modal dialog on level up
  - Display current stats and available points
  - Confirm allocation before applying
  - _File: `packages/game/src/components/react/ui/StatAllocationModal.tsx`_

- [ ]* 4.5.3. Write property test for stat allocation
  - **Property 26: Stat point conservation**
  - **Validates: Requirements 8.3**
  - For any allocation, total points spent should equal points available
  - Stats should never decrease from allocation

### 4.6. Reputation System

**Validates:** Requirement 9.1, 9.2

- [ ] 4.6.1. Implement faction reputation tracking
  - Three factions: Bikers, Yakuza, Aliens
  - Reputation range: -100 to +100
  - Actions affect reputation: combat, quests, dialogue choices
  - _File: `packages/game/src/systems/ReputationSystem.ts`_
  - _Validates: Requirements 9.1_

- [ ] 4.6.2. Create reputation-based content gating
  - Unlock quests at reputation thresholds
  - Alter dialogue options based on reputation
  - Affect enemy aggression levels
  - _File: `packages/game/src/systems/ReputationSystem.ts`_
  - _Validates: Requirements 9.2_

- [ ]* 4.6.3. Write property test for reputation bounds
  - **Property 27: Reputation clamping**
  - **Validates: Requirements 9.1**
  - For any sequence of reputation changes, value should stay in [-100, 100]
  - Reputation should change monotonically with actions

### 4.7. Combat HUD Integration

**Validates:** Requirement 7.5

- [ ] 4.7.1. Update JRPG HUD with combat info
  - Display player HP, stability gauge
  - Show ability cooldowns
  - Display combo counter
  - _File: `packages/game/src/components/react/ui/JRPGHUD.tsx`_

- [ ] 4.7.2. Create enemy health bars
  - Floating health bar above each enemy
  - Show stability gauge below health
  - Display enemy level and name
  - _File: `packages/game/src/components/react/ui/EnemyHealthBar.tsx`_
  - _Validates: Requirements 7.5_

## Verification

After completing this section:
- [ ] Damage calculations produce correct values
- [ ] Break system triggers at 0 stability
- [ ] Abilities execute with proper cooldowns
- [ ] XP awards and leveling work correctly
- [ ] Stat allocation applies points properly
- [ ] Reputation tracks faction standing
- [ ] Combat HUD displays all info
- [ ] All property tests pass (100+ iterations each)
- [ ] TypeScript compiles without errors
- [ ] Linting passes (`pnpm check`)
- [ ] Combat feels responsive at 60 FPS

## Common Commands

```bash
# Development
pnpm --filter @neo-tokyo/game dev

# Test combat systems
pnpm --filter @neo-tokyo/game test CombatLogic
pnpm --filter @neo-tokyo/game test BreakSystem
pnpm --filter @neo-tokyo/game test ProgressionSystem

# Test UI components
pnpm --filter @neo-tokyo/game test JRPGHUD

# Lint
pnpm --filter @neo-tokyo/game check
```
