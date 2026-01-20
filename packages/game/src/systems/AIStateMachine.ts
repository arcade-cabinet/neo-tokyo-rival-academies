/**
 * AI State Machine
 *
 * Base state machine for enemy AI using Yuka FSM.
 */

import type { Vector3 } from '@babylonjs/core';
import { State, StateMachine } from 'yuka';

export enum AIState {
  IDLE = 'idle',
  PATROL = 'patrol',
  CHASE = 'chase',
  ATTACK = 'attack',
  FLEE = 'flee',
  DEAD = 'dead',
}

export interface AIContext {
  entityId: string;
  position: Vector3;
  targetPosition: Vector3 | null;
  health: number;
  maxHealth: number;
  detectionRange: number;
  attackRange: number;
  fleeThreshold: number;
}

/**
 * Idle State - enemy is stationary
 */
export class IdleState extends State {
  enter(context: AIContext): void {
    console.log(`[AI] ${context.entityId} entering IDLE state`);
  }

  execute(context: AIContext): void {
    // Check for nearby targets
    if (context.targetPosition) {
      const distance = this.getDistance(context.position, context.targetPosition);
      if (distance < context.detectionRange) {
        this.stateMachine?.changeTo(AIState.CHASE);
      }
    }
  }

  exit(context: AIContext): void {
    console.log(`[AI] ${context.entityId} exiting IDLE state`);
  }

  private getDistance(a: Vector3, b: Vector3): number {
    const dx = a.x - b.x;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dz * dz);
  }
}

/**
 * Patrol State - enemy moves along patrol route
 */
export class PatrolState extends State {
  private patrolIndex = 0;
  private patrolPoints: Vector3[] = [];

  enter(context: AIContext): void {
    console.log(`[AI] ${context.entityId} entering PATROL state`);
  }

  execute(context: AIContext): void {
    // Check for nearby targets
    if (context.targetPosition) {
      const distance = this.getDistance(context.position, context.targetPosition);
      if (distance < context.detectionRange) {
        this.stateMachine?.changeTo(AIState.CHASE);
        return;
      }
    }

    // Move to next patrol point
    if (this.patrolPoints.length > 0) {
      const target = this.patrolPoints[this.patrolIndex];
      const distance = this.getDistance(context.position, target);

      if (distance < 1.0) {
        // Reached patrol point, move to next
        this.patrolIndex = (this.patrolIndex + 1) % this.patrolPoints.length;
      }
    }
  }

  exit(context: AIContext): void {
    console.log(`[AI] ${context.entityId} exiting PATROL state`);
  }

  setPatrolPoints(points: Vector3[]): void {
    this.patrolPoints = points;
  }

  private getDistance(a: Vector3, b: Vector3): number {
    const dx = a.x - b.x;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dz * dz);
  }
}

/**
 * Chase State - enemy pursues target
 */
export class ChaseState extends State {
  enter(context: AIContext): void {
    console.log(`[AI] ${context.entityId} entering CHASE state`);
  }

  execute(context: AIContext): void {
    if (!context.targetPosition) {
      this.stateMachine?.changeTo(AIState.IDLE);
      return;
    }

    const distance = this.getDistance(context.position, context.targetPosition);

    // Check if should flee
    const healthPercent = context.health / context.maxHealth;
    if (healthPercent < context.fleeThreshold) {
      this.stateMachine?.changeTo(AIState.FLEE);
      return;
    }

    // Check if in attack range
    if (distance < context.attackRange) {
      this.stateMachine?.changeTo(AIState.ATTACK);
      return;
    }

    // Check if lost target
    if (distance > context.detectionRange * 1.5) {
      this.stateMachine?.changeTo(AIState.IDLE);
    }
  }

  exit(context: AIContext): void {
    console.log(`[AI] ${context.entityId} exiting CHASE state`);
  }

  private getDistance(a: Vector3, b: Vector3): number {
    const dx = a.x - b.x;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dz * dz);
  }
}

/**
 * Attack State - enemy attacks target
 */
export class AttackState extends State {
  private attackCooldown = 0;
  private attackInterval = 1.0; // seconds

  enter(context: AIContext): void {
    console.log(`[AI] ${context.entityId} entering ATTACK state`);
    this.attackCooldown = 0;
  }

  execute(context: AIContext): void {
    if (!context.targetPosition) {
      this.stateMachine?.changeTo(AIState.IDLE);
      return;
    }

    const distance = this.getDistance(context.position, context.targetPosition);

    // Check if target moved out of range
    if (distance > context.attackRange * 1.2) {
      this.stateMachine?.changeTo(AIState.CHASE);
      return;
    }

    // Check if should flee
    const healthPercent = context.health / context.maxHealth;
    if (healthPercent < context.fleeThreshold) {
      this.stateMachine?.changeTo(AIState.FLEE);
      return;
    }

    // Attack on cooldown
    this.attackCooldown -= 0.016; // Assume ~60 FPS
    if (this.attackCooldown <= 0) {
      this.performAttack(context);
      this.attackCooldown = this.attackInterval;
    }
  }

  exit(context: AIContext): void {
    console.log(`[AI] ${context.entityId} exiting ATTACK state`);
  }

  private performAttack(context: AIContext): void {
    console.log(`[AI] ${context.entityId} performs attack`);
    // Attack logic handled by CombatSystem
  }

  private getDistance(a: Vector3, b: Vector3): number {
    const dx = a.x - b.x;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dz * dz);
  }
}

/**
 * Flee State - enemy retreats from target
 */
export class FleeState extends State {
  enter(context: AIContext): void {
    console.log(`[AI] ${context.entityId} entering FLEE state`);
  }

  execute(context: AIContext): void {
    const healthPercent = context.health / context.maxHealth;

    // Stop fleeing if health recovered
    if (healthPercent > context.fleeThreshold + 0.2) {
      this.stateMachine?.changeTo(AIState.IDLE);
    }
  }

  exit(context: AIContext): void {
    console.log(`[AI] ${context.entityId} exiting FLEE state`);
  }
}

/**
 * Dead State - enemy is defeated
 */
export class DeadState extends State {
  enter(context: AIContext): void {
    console.log(`[AI] ${context.entityId} entering DEAD state`);
  }

  execute(_context: AIContext): void {
    // Do nothing, entity is dead
  }

  exit(_context: AIContext): void {
    // Cannot exit dead state
  }
}

/**
 * Create AI state machine with all states
 */
export function createAIStateMachine(context: AIContext): StateMachine<AIContext> {
  const fsm = new StateMachine(context);

  // Add states
  fsm.add(AIState.IDLE, new IdleState());
  fsm.add(AIState.PATROL, new PatrolState());
  fsm.add(AIState.CHASE, new ChaseState());
  fsm.add(AIState.ATTACK, new AttackState());
  fsm.add(AIState.FLEE, new FleeState());
  fsm.add(AIState.DEAD, new DeadState());

  // Set initial state
  fsm.changeTo(AIState.IDLE);

  return fsm;
}
