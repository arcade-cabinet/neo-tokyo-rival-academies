/**
 * Tentacle Swarm System
 *
 * Manages 8 independent tentacle agents for Alien Ship stage.
 */

import { Vector3 } from '@babylonjs/core';
import type { StateMachine } from 'yuka';
import { type AIContext, createTentacleAI, updateEnemyAI } from './EnemyAI';

export interface TentacleAgent {
  id: string;
  position: Vector3;
  health: number;
  maxHealth: number;
  fsm: StateMachine<AIContext>;
  attackCooldown: number;
  isAlive: boolean;
}

export class TentacleSwarm {
  private tentacles: TentacleAgent[] = [];
  private swarmCenter: Vector3;
  private surroundRadius = 8;
  private attackInterval = 2.0; // seconds between attacks

  constructor(swarmCenter: Vector3) {
    this.swarmCenter = swarmCenter;
  }

  /**
   * Initialize 8 tentacle agents
   */
  initialize(): void {
    this.tentacles = [];

    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const position = new Vector3(
        this.swarmCenter.x + Math.cos(angle) * this.surroundRadius,
        0,
        this.swarmCenter.z + Math.sin(angle) * this.surroundRadius
      );

      const tentacle: TentacleAgent = {
        id: `tentacle_${i}`,
        position,
        health: 50,
        maxHealth: 50,
        fsm: createTentacleAI(`tentacle_${i}`, position, this.swarmCenter),
        attackCooldown: i * 0.25, // Stagger initial attacks
        isAlive: true,
      };

      this.tentacles.push(tentacle);
    }

    console.log(`Initialized ${this.tentacles.length} tentacle agents`);
  }

  /**
   * Update all tentacles
   */
  update(deltaTime: number, playerPosition: Vector3): void {
    let aliveCount = 0;

    for (const tentacle of this.tentacles) {
      if (!tentacle.isAlive) continue;

      aliveCount++;

      // Update AI
      updateEnemyAI(tentacle.fsm, tentacle.position, playerPosition, tentacle.health);

      // Update attack cooldown
      tentacle.attackCooldown -= deltaTime;

      // Check if dead
      if (tentacle.health <= 0) {
        tentacle.isAlive = false;
        this.scheduleRegeneration(tentacle);
      }
    }

    // Update formation if needed
    if (aliveCount > 0) {
      this.updateFormation(playerPosition);
    }
  }

  /**
   * Update surrounding formation around player
   */
  private updateFormation(playerPosition: Vector3): void {
    const aliveTentacles = this.tentacles.filter((t) => t.isAlive);
    const count = aliveTentacles.length;

    if (count === 0) return;

    // Distribute tentacles evenly around player
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      const targetPosition = new Vector3(
        playerPosition.x + Math.cos(angle) * this.surroundRadius,
        0,
        playerPosition.z + Math.sin(angle) * this.surroundRadius
      );

      // Move tentacle toward formation position
      const tentacle = aliveTentacles[i];
      const direction = targetPosition.subtract(tentacle.position);
      const distance = direction.length();

      if (distance > 0.5) {
        direction.normalize();
        tentacle.position.addInPlace(direction.scale(0.1)); // Smooth movement
      }
    }
  }

  /**
   * Check if tentacle can attack
   */
  canAttack(tentacleId: string): boolean {
    const tentacle = this.tentacles.find((t) => t.id === tentacleId);
    return tentacle ? tentacle.isAlive && tentacle.attackCooldown <= 0 : false;
  }

  /**
   * Perform attack and reset cooldown
   */
  performAttack(tentacleId: string): void {
    const tentacle = this.tentacles.find((t) => t.id === tentacleId);
    if (tentacle?.isAlive) {
      tentacle.attackCooldown = this.attackInterval;
      console.log(`${tentacleId} attacks!`);
    }
  }

  /**
   * Damage tentacle
   */
  damageTentacle(tentacleId: string, damage: number): void {
    const tentacle = this.tentacles.find((t) => t.id === tentacleId);
    if (tentacle?.isAlive) {
      tentacle.health = Math.max(0, tentacle.health - damage);
    }
  }

  /**
   * Schedule tentacle regeneration after defeat
   */
  private scheduleRegeneration(tentacle: TentacleAgent): void {
    // Regenerate after 10 seconds
    setTimeout(() => {
      tentacle.health = tentacle.maxHealth;
      tentacle.isAlive = true;
      tentacle.attackCooldown = 0;
      console.log(`${tentacle.id} regenerated!`);
    }, 10000);
  }

  /**
   * Get all alive tentacles
   */
  getAliveTentacles(): TentacleAgent[] {
    return this.tentacles.filter((t) => t.isAlive);
  }

  /**
   * Get tentacle by ID
   */
  getTentacle(id: string): TentacleAgent | undefined {
    return this.tentacles.find((t) => t.id === id);
  }

  /**
   * Check if swarm is defeated (all tentacles dead)
   */
  isDefeated(): boolean {
    return this.tentacles.every((t) => !t.isAlive);
  }
}
