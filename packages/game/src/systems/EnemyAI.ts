/**
 * Enemy AI System
 *
 * Implements specific AI behaviors for different enemy types.
 */

import { Vector3 } from "@babylonjs/core";
import type { StateMachine } from "yuka";
import {
	type AIContext,
	AIState,
	createAIStateMachine,
	type PatrolState,
} from "./AIStateMachine";

export enum EnemyType {
	GRUNT = "grunt",
	BOSS = "boss",
	TENTACLE = "tentacle",
}

export interface EnemyAIConfig {
	type: EnemyType;
	detectionRange: number;
	attackRange: number;
	fleeThreshold: number;
	patrolPoints?: Vector3[];
}

/**
 * Create AI for grunt enemy (simple patrol and chase)
 */
export function createGruntAI(
	entityId: string,
	position: Vector3,
): StateMachine<AIContext> {
	const context: AIContext = {
		entityId,
		position,
		targetPosition: null,
		health: 100,
		maxHealth: 100,
		detectionRange: 10,
		attackRange: 2,
		fleeThreshold: 0.2,
	};

	const fsm = createAIStateMachine(context);

	// Set patrol points for grunt
	const patrolState = fsm.states.get(AIState.PATROL) as PatrolState;
	if (patrolState) {
		patrolState.setPatrolPoints([
			position.clone(),
			position.add(new Vector3(5, 0, 0)),
			position.add(new Vector3(5, 0, 5)),
			position.add(new Vector3(0, 0, 5)),
		]);
	}

	// Start in patrol state
	fsm.changeTo(AIState.PATROL);

	return fsm;
}

/**
 * Create AI for boss enemy (complex attack patterns and phases)
 */
export function createBossAI(
	entityId: string,
	position: Vector3,
): StateMachine<AIContext> {
	const context: AIContext = {
		entityId,
		position,
		targetPosition: null,
		health: 500,
		maxHealth: 500,
		detectionRange: 15,
		attackRange: 3,
		fleeThreshold: 0, // Boss never flees
	};

	const fsm = createAIStateMachine(context);

	// Boss starts in idle, waiting for player
	fsm.changeTo(AIState.IDLE);

	return fsm;
}

/**
 * Create AI for tentacle enemy (coordinated swarm behavior)
 */
export function createTentacleAI(
	entityId: string,
	position: Vector3,
	_swarmCenter: Vector3,
): StateMachine<AIContext> {
	const context: AIContext = {
		entityId,
		position,
		targetPosition: null,
		health: 50,
		maxHealth: 50,
		detectionRange: 12,
		attackRange: 2.5,
		fleeThreshold: 0.3,
	};

	const fsm = createAIStateMachine(context);

	// Tentacles start in chase mode (aggressive)
	fsm.changeTo(AIState.CHASE);

	return fsm;
}

/**
 * Update AI state machine
 */
export function updateEnemyAI(
	fsm: StateMachine<AIContext>,
	position: Vector3,
	targetPosition: Vector3 | null,
	health: number,
): void {
	const context = fsm.owner as AIContext;

	// Update context
	context.position = position;
	context.targetPosition = targetPosition;
	context.health = health;

	// Check if dead
	if (health <= 0 && fsm.currentState?.name !== AIState.DEAD) {
		fsm.changeTo(AIState.DEAD);
		return;
	}

	// Update state machine
	fsm.update();
}

/**
 * Get current AI state
 */
export function getAIState(fsm: StateMachine<AIContext>): AIState {
	return (fsm.currentState?.name as AIState) || AIState.IDLE;
}
