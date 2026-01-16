/**
 * Swarm Coordination System
 *
 * Coordinates attack patterns and behaviors for tentacle swarm.
 */

import { Vector3 } from '@babylonjs/core';
import type { TentacleAgent } from './TentacleSwarm';

export enum SwarmFormation {
  SURROUND = 'surround',
  PINCER = 'pincer',
  WAVE = 'wave',
}

export class SwarmCoordination {
  private currentFormation: SwarmFormation = SwarmFormation.SURROUND;
  private attackSequence: number[] = [];
  private sequenceIndex = 0;

  /**
   * Initialize attack sequence (staggered timing)
   */
  initializeAttackSequence(tentacleCount: number): void {
    this.attackSequence = [];
    for (let i = 0; i < tentacleCount; i++) {
      this.attackSequence.push(i);
    }
    this.sequenceIndex = 0;
  }

  /**
   * Get next tentacle to attack
   */
  getNextAttacker(tentacles: TentacleAgent[]): TentacleAgent | null {
    if (tentacles.length === 0) return null;

    // Find next alive tentacle in sequence
    const _startIndex = this.sequenceIndex;
    let attempts = 0;

    while (attempts < tentacles.length) {
      const index = this.sequenceIndex % tentacles.length;
      const tentacle = tentacles[index];

      this.sequenceIndex = (this.sequenceIndex + 1) % tentacles.length;

      if (tentacle.isAlive && tentacle.attackCooldown <= 0) {
        return tentacle;
      }

      attempts++;
    }

    return null;
  }

  /**
   * Calculate formation positions for tentacles
   */
  getFormationPositions(center: Vector3, tentacleCount: number, radius: number): Vector3[] {
    const positions: Vector3[] = [];

    switch (this.currentFormation) {
      case SwarmFormation.SURROUND:
        // Evenly distributed circle
        for (let i = 0; i < tentacleCount; i++) {
          const angle = (i / tentacleCount) * Math.PI * 2;
          positions.push(
            new Vector3(center.x + Math.cos(angle) * radius, 0, center.z + Math.sin(angle) * radius)
          );
        }
        break;

      case SwarmFormation.PINCER: {
        // Two groups on opposite sides
        const halfCount = Math.floor(tentacleCount / 2);
        for (let i = 0; i < halfCount; i++) {
          const offset = (i - halfCount / 2) * 2;
          positions.push(new Vector3(center.x - radius, 0, center.z + offset));
        }
        for (let i = 0; i < tentacleCount - halfCount; i++) {
          const offset = (i - (tentacleCount - halfCount) / 2) * 2;
          positions.push(new Vector3(center.x + radius, 0, center.z + offset));
        }
        break;
      }

      case SwarmFormation.WAVE:
        // Line formation
        for (let i = 0; i < tentacleCount; i++) {
          const offset = (i - tentacleCount / 2) * 2;
          positions.push(new Vector3(center.x + offset, 0, center.z - radius));
        }
        break;
    }

    return positions;
  }

  /**
   * Change formation
   */
  setFormation(formation: SwarmFormation): void {
    this.currentFormation = formation;
    console.log(`Swarm formation changed to: ${formation}`);
  }

  /**
   * Get current formation
   */
  getFormation(): SwarmFormation {
    return this.currentFormation;
  }

  /**
   * Check if tentacles should retreat
   */
  shouldRetreat(tentacles: TentacleAgent[]): boolean {
    const aliveCount = tentacles.filter((t) => t.isAlive).length;
    const totalCount = tentacles.length;

    // Retreat if more than 50% defeated
    return aliveCount < totalCount * 0.5;
  }

  /**
   * Calculate retreat positions
   */
  getRetreatPositions(center: Vector3, tentacleCount: number, retreatRadius: number): Vector3[] {
    const positions: Vector3[] = [];

    for (let i = 0; i < tentacleCount; i++) {
      const angle = (i / tentacleCount) * Math.PI * 2;
      positions.push(
        new Vector3(
          center.x + Math.cos(angle) * retreatRadius,
          0,
          center.z + Math.sin(angle) * retreatRadius
        )
      );
    }

    return positions;
  }
}
