# 3. Navigation & AI Systems

**Parent:** [tasks.md](../tasks.md)
**Validates:** Requirements 4, 5, 6

## Overview
Implements RecastJS navigation mesh for pathfinding and AI behavior systems using Yuka FSM for enemy intelligence.

## Prerequisites
- BabylonJS migration complete (Section 1)
- Hex grid system functional (Section 2)
- Character models loaded

## Tasks

### 3.1. RecastJS Navigation Mesh Integration

**Validates:** Requirement 4.1, 4.2

- [ ] 3.1.1. Install and configure RecastJS for BabylonJS
  - Install `recast-detour` and BabylonJS navigation plugin
  - Configure build settings for WASM module
  - _File: `packages/game/package.json`_

- [ ] 3.1.2. Create NavigationMesh system
  - Implement mesh generation from hex grid geometry
  - Support dynamic obstacle updates
  - Cache navigation meshes per stage
  - _File: `packages/game/src/systems/NavigationSystem.ts`_
  - _Validates: Requirements 4.1_

- [ ]* 3.1.3. Write property test for navigation mesh generation
  - **Property 15: Navigation mesh coverage**
  - **Validates: Requirements 4.1**
  - For any valid hex grid, navigation mesh should cover all walkable tiles
  - Test with 100+ random grid configurations

- [ ] 3.1.4. Implement pathfinding query API
  - `findPath(start, end)` returns waypoint array
  - `isReachable(start, end)` validates connectivity
  - `getClosestPoint(position)` snaps to navmesh
  - _File: `packages/game/src/systems/NavigationSystem.ts`_

- [ ]* 3.1.5. Write property test for pathfinding
  - **Property 16: Path validity**
  - **Validates: Requirements 4.2**
  - For any reachable start/end pair, returned path should be walkable
  - All waypoints should lie on navigation mesh

### 3.2. Multi-Agent Pathfinding

**Validates:** Requirement 4.3

- [ ] 3.2.1. Implement crowd simulation system
  - Support 8+ simultaneous agents (Alien Ship tentacles)
  - Local avoidance using velocity obstacles
  - Dynamic replanning on collision
  - _File: `packages/game/src/systems/CrowdSystem.ts`_
  - _Validates: Requirements 4.3_

- [ ] 3.2.2. Create agent steering behaviors
  - Seek, flee, pursue, evade
  - Obstacle avoidance
  - Separation from other agents
  - _File: `packages/game/src/systems/SteeringBehaviors.ts`_

- [ ]* 3.2.3. Write property test for crowd collision avoidance
  - **Property 17: Agent separation**
  - **Validates: Requirements 4.3**
  - For any crowd of agents, no two agents should occupy same position
  - Minimum separation distance maintained

### 3.3. Yuka FSM Integration

**Validates:** Requirement 5.1, 5.2

- [ ] 3.3.1. Install and configure Yuka library
  - Install `yuka` package
  - Create BabylonJS integration adapter
  - _File: `packages/game/package.json`_

- [ ] 3.3.2. Create base AI state machine
  - Define states: Idle, Patrol, Chase, Attack, Flee, Dead
  - Implement state transitions with conditions
  - Support state entry/exit callbacks
  - _File: `packages/game/src/systems/AIStateMachine.ts`_
  - _Validates: Requirements 5.1_

- [ ] 3.3.3. Implement enemy AI behaviors
  - Grunt AI: simple patrol and chase
  - Boss AI: complex attack patterns and phases
  - Tentacle AI: coordinated swarm behavior
  - _File: `packages/game/src/systems/EnemyAI.ts`_
  - _Validates: Requirements 5.2_

- [ ]* 3.3.4. Write property test for AI state transitions
  - **Property 18: State machine validity**
  - **Validates: Requirements 5.1**
  - For any sequence of inputs, AI should always be in valid state
  - No invalid state transitions should occur

### 3.4. Perception & Sensing

**Validates:** Requirement 5.3

- [ ] 3.4.1. Implement vision cone system
  - Raycast-based line of sight checks
  - Configurable FOV and range per enemy type
  - Occlusion by obstacles
  - _File: `packages/game/src/systems/PerceptionSystem.ts`_

- [ ] 3.4.2. Create threat assessment system
  - Prioritize targets by distance and threat level
  - Switch targets when higher priority appears
  - Remember last known position when LOS lost
  - _File: `packages/game/src/systems/ThreatSystem.ts`_
  - _Validates: Requirements 5.3_

- [ ]* 3.4.3. Write property test for vision detection
  - **Property 19: Vision cone accuracy**
  - **Validates: Requirements 5.3**
  - For any target position, detection should match geometric FOV calculation
  - Obstacles should block line of sight

### 3.5. Alien Ship Tentacle Swarm

**Validates:** Requirement 6.1, 6.2

- [ ] 3.5.1. Create tentacle agent controller
  - 8 independent tentacle entities
  - Coordinated attack patterns
  - Regeneration on defeat
  - _File: `packages/game/src/systems/TentacleSwarm.ts`_
  - _Validates: Requirements 6.1_

- [ ] 3.5.2. Implement swarm coordination behaviors
  - Surround player formation
  - Alternating attack timing
  - Retreat when damaged
  - _File: `packages/game/src/systems/SwarmCoordination.ts`_
  - _Validates: Requirements 6.2_

- [ ]* 3.5.3. Write property test for swarm behavior
  - **Property 20: Swarm coordination**
  - **Validates: Requirements 6.2**
  - For any player position, tentacles should maintain surrounding formation
  - Attack timing should be staggered, not simultaneous

## Verification

After completing this section:
- [ ] Navigation mesh generates for all stages
- [ ] Pathfinding returns valid paths
- [ ] 8+ agents navigate without collision
- [ ] AI state machines transition correctly
- [ ] Vision cones detect targets accurately
- [ ] Tentacle swarm coordinates attacks
- [ ] All property tests pass (100+ iterations each)
- [ ] TypeScript compiles without errors
- [ ] Linting passes (`pnpm check`)
- [ ] 60 FPS maintained on Pixel 8a

## Common Commands

```bash
# Development
pnpm --filter @neo-tokyo/game dev

# Test navigation system
pnpm --filter @neo-tokyo/game test NavigationSystem

# Test AI systems
pnpm --filter @neo-tokyo/game test AIStateMachine
pnpm --filter @neo-tokyo/game test EnemyAI

# Lint
pnpm --filter @neo-tokyo/game check
```
