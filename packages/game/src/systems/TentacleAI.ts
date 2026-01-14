/**
 * Tentacle AI System
 *
 * Handles advanced behavior for tentacle enemies in the alien ship stage
 */

import type { ECSEntity } from '../state/ecs';
import * as THREE from 'three';

export interface TentacleConfig {
  id: string;
  anchorPoint: THREE.Vector3;
  patrolRadius: number;
  attackRange: number;
  attackSpeed: number;
  health: number;
}

export type TentacleState = 'patrol' | 'tracking' | 'attacking' | 'retracting';

export interface TentacleBehavior {
  state: TentacleState;
  target: THREE.Vector3 | null;
  attackCooldown: number;
  patrolAngle: number;
}

/**
 * Create a tentacle entity with AI behavior
 */
export function createTentacleEntity(config: TentacleConfig): ECSEntity {
  return {
    id: config.id,
    isEnemy: true,
    position: config.anchorPoint.clone(),
    velocity: new THREE.Vector3(0, 0, 0),
    characterState: 'stand',
    faction: 'Azure',
    modelColor: 0x00aa00,
    health: config.health,
    // Store custom data for AI
    tentacleData: {
      anchorPoint: config.anchorPoint.clone(),
      patrolRadius: config.patrolRadius,
      attackRange: config.attackRange,
      attackSpeed: config.attackSpeed,
      state: 'patrol' as TentacleState,
      patrolAngle: Math.random() * Math.PI * 2,
      attackCooldown: 0,
      target: null,
    },
  };
}

/**
 * Update tentacle AI behavior
 */
export function updateTentacleAI(tentacle: ECSEntity, playerPos: THREE.Vector3, deltaTime: number): void {
  if (!tentacle.tentacleData || !tentacle.position || !tentacle.velocity) return;

  const data = tentacle.tentacleData;
  const pos = tentacle.position;
  const vel = tentacle.velocity;

  // Update cooldown
  if (data.attackCooldown > 0) {
    data.attackCooldown -= deltaTime;
  }

  // Calculate distance to player
  const distToPlayer = pos.distanceTo(playerPos);

  // State machine
  switch (data.state) {
    case 'patrol':
      // Patrol in a circle around anchor point
      data.patrolAngle += deltaTime * 0.5;
      const patrolX = data.anchorPoint.x + Math.cos(data.patrolAngle) * data.patrolRadius;
      const patrolZ = data.anchorPoint.z + Math.sin(data.patrolAngle) * data.patrolRadius;

      // Move toward patrol position
      vel.x = (patrolX - pos.x) * 2;
      vel.z = (patrolZ - pos.z) * 2;

      // Transition to tracking if player is in range
      if (distToPlayer < data.attackRange * 1.5) {
        data.state = 'tracking';
      }
      break;

    case 'tracking':
      // Move toward player
      const dirToPlayer = new THREE.Vector3()
        .subVectors(playerPos, pos)
        .normalize()
        .multiplyScalar(3);

      vel.x = dirToPlayer.x;
      vel.z = dirToPlayer.z;

      tentacle.characterState = 'attack';

      // Transition to attacking if close enough and cooldown ready
      if (distToPlayer < data.attackRange && data.attackCooldown <= 0) {
        data.state = 'attacking';
        data.attackCooldown = 2.0; // 2 second cooldown
      }

      // Transition back to patrol if player is too far
      if (distToPlayer > data.attackRange * 2) {
        data.state = 'retracting';
      }
      break;

    case 'attacking':
      // Lunge at player
      const lungeDir = new THREE.Vector3()
        .subVectors(playerPos, pos)
        .normalize()
        .multiplyScalar(data.attackSpeed);

      vel.x = lungeDir.x;
      vel.z = lungeDir.z;

      tentacle.characterState = 'attack';

      // After brief attack, retract
      if (data.attackCooldown < 1.5) {
        data.state = 'retracting';
      }
      break;

    case 'retracting':
      // Return to anchor point
      const dirToAnchor = new THREE.Vector3()
        .subVectors(data.anchorPoint, pos)
        .normalize()
        .multiplyScalar(4);

      vel.x = dirToAnchor.x;
      vel.z = dirToAnchor.z;

      tentacle.characterState = 'stand';

      // Return to patrol when near anchor
      const distToAnchor = pos.distanceTo(data.anchorPoint);
      if (distToAnchor < data.patrolRadius * 0.5) {
        data.state = 'patrol';
      }
      break;
  }
}

/**
 * Create multiple tentacles for the Alien Queen boss fight
 */
export function spawnTentacleWave(
  centerPos: THREE.Vector3,
  count: number,
  radius: number
): TentacleConfig[] {
  const tentacles: TentacleConfig[] = [];

  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2;
    const anchorPoint = new THREE.Vector3(
      centerPos.x + Math.cos(angle) * radius,
      centerPos.y,
      centerPos.z + Math.sin(angle) * radius
    );

    tentacles.push({
      id: `tentacle-${i}`,
      anchorPoint,
      patrolRadius: 5,
      attackRange: 10,
      attackSpeed: 8,
      health: 50 + i * 10, // Vary health slightly
    });
  }

  return tentacles;
}
