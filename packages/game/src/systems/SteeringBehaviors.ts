/**
 * Steering Behaviors
 *
 * Implements common AI steering behaviors for agent movement.
 */

import { Vector3 } from "@babylonjs/core";

export interface SteeringAgent {
	position: Vector3;
	velocity: Vector3;
	maxSpeed: number;
	maxForce: number;
}

/**
 * Seek behavior - move toward target
 */
export function seek(agent: SteeringAgent, target: Vector3): Vector3 {
	const desired = target.subtract(agent.position);
	desired.normalize();
	desired.scaleInPlace(agent.maxSpeed);

	const steering = desired.subtract(agent.velocity);
	return limitForce(steering, agent.maxForce);
}

/**
 * Flee behavior - move away from target
 */
export function flee(agent: SteeringAgent, target: Vector3): Vector3 {
	const desired = agent.position.subtract(target);
	desired.normalize();
	desired.scaleInPlace(agent.maxSpeed);

	const steering = desired.subtract(agent.velocity);
	return limitForce(steering, agent.maxForce);
}

/**
 * Pursue behavior - intercept moving target
 */
export function pursue(
	agent: SteeringAgent,
	target: Vector3,
	targetVelocity: Vector3,
): Vector3 {
	const distance = Vector3.Distance(agent.position, target);
	const lookAhead = distance / agent.maxSpeed;

	const predictedPosition = target.add(targetVelocity.scale(lookAhead));
	return seek(agent, predictedPosition);
}

/**
 * Evade behavior - avoid moving target
 */
export function evade(
	agent: SteeringAgent,
	target: Vector3,
	targetVelocity: Vector3,
): Vector3 {
	const distance = Vector3.Distance(agent.position, target);
	const lookAhead = distance / agent.maxSpeed;

	const predictedPosition = target.add(targetVelocity.scale(lookAhead));
	return flee(agent, predictedPosition);
}

/**
 * Obstacle avoidance - steer away from obstacles
 */
export function avoidObstacles(
	agent: SteeringAgent,
	obstacles: Vector3[],
	detectionRadius: number,
): Vector3 {
	const avoidance = new Vector3(0, 0, 0);

	for (const obstacle of obstacles) {
		const distance = Vector3.Distance(agent.position, obstacle);

		if (distance < detectionRadius) {
			const away = agent.position.subtract(obstacle);
			away.normalize();
			away.scaleInPlace(1.0 / distance); // Stronger force when closer
			avoidance.addInPlace(away);
		}
	}

	return limitForce(avoidance, agent.maxForce);
}

/**
 * Separation - maintain distance from other agents
 */
export function separate(
	agent: SteeringAgent,
	neighbors: SteeringAgent[],
	separationRadius: number,
): Vector3 {
	const separation = new Vector3(0, 0, 0);
	let count = 0;

	for (const neighbor of neighbors) {
		const distance = Vector3.Distance(agent.position, neighbor.position);

		if (distance > 0 && distance < separationRadius) {
			const away = agent.position.subtract(neighbor.position);
			away.normalize();
			away.scaleInPlace(1.0 / distance);
			separation.addInPlace(away);
			count++;
		}
	}

	if (count > 0) {
		separation.scaleInPlace(1.0 / count);
	}

	return limitForce(separation, agent.maxForce);
}

/**
 * Arrival - slow down when approaching target
 */
export function arrive(
	agent: SteeringAgent,
	target: Vector3,
	slowingRadius: number,
): Vector3 {
	const desired = target.subtract(agent.position);
	const distance = desired.length();

	if (distance === 0) {
		return new Vector3(0, 0, 0);
	}

	desired.normalize();

	// Slow down within slowing radius
	if (distance < slowingRadius) {
		desired.scaleInPlace(agent.maxSpeed * (distance / slowingRadius));
	} else {
		desired.scaleInPlace(agent.maxSpeed);
	}

	const steering = desired.subtract(agent.velocity);
	return limitForce(steering, agent.maxForce);
}

/**
 * Wander - random exploration
 */
export function wander(
	agent: SteeringAgent,
	wanderAngle: number,
	wanderDistance: number,
	wanderRadius: number,
	deltaAngle: number,
): { steering: Vector3; newAngle: number } {
	// Calculate circle center in front of agent
	const circleCenter = agent.velocity.clone();
	circleCenter.normalize();
	circleCenter.scaleInPlace(wanderDistance);

	// Calculate displacement on circle
	const displacement = new Vector3(0, 0, -1);
	displacement.scaleInPlace(wanderRadius);

	// Rotate displacement by wander angle
	const cos = Math.cos(wanderAngle);
	const sin = Math.sin(wanderAngle);
	const rotated = new Vector3(
		displacement.x * cos - displacement.z * sin,
		0,
		displacement.x * sin + displacement.z * cos,
	);

	// Update wander angle randomly
	const newAngle = wanderAngle + (Math.random() - 0.5) * deltaAngle;

	const wanderForce = circleCenter.add(rotated);
	return {
		steering: limitForce(wanderForce, agent.maxForce),
		newAngle,
	};
}

/**
 * Limit force magnitude
 */
function limitForce(force: Vector3, maxForce: number): Vector3 {
	if (force.length() > maxForce) {
		force.normalize();
		force.scaleInPlace(maxForce);
	}
	return force;
}
