/**
 * Crowd System
 *
 * Manages multi-agent pathfinding with local avoidance.
 * Supports 8+ simultaneous agents for Alien Ship tentacles.
 */

import { Vector3 } from "@babylonjs/core";

export interface CrowdAgent {
	id: string;
	position: Vector3;
	velocity: Vector3;
	radius: number;
	maxSpeed: number;
	target: Vector3 | null;
}

export class CrowdSystem {
	private agents: Map<string, CrowdAgent> = new Map();
	private separationDistance = 2.0; // Minimum distance between agents

	/**
	 * Register a new agent in the crowd
	 */
	addAgent(agent: CrowdAgent): void {
		this.agents.set(agent.id, agent);
	}

	/**
	 * Remove agent from crowd
	 */
	removeAgent(agentId: string): void {
		this.agents.delete(agentId);
	}

	/**
	 * Get agent by ID
	 */
	getAgent(agentId: string): CrowdAgent | undefined {
		return this.agents.get(agentId);
	}

	/**
	 * Update all agents with local avoidance
	 */
	update(deltaTime: number): void {
		for (const agent of this.agents.values()) {
			this.updateAgent(agent, deltaTime);
		}
	}

	/**
	 * Update single agent with steering behaviors
	 */
	private updateAgent(agent: CrowdAgent, deltaTime: number): void {
		if (!agent.target) return;

		// Calculate desired velocity toward target
		const desiredVelocity = agent.target.subtract(agent.position).normalize();
		desiredVelocity.scaleInPlace(agent.maxSpeed);

		// Apply separation from other agents
		const separationForce = this.calculateSeparation(agent);
		desiredVelocity.addInPlace(separationForce);

		// Limit to max speed
		if (desiredVelocity.length() > agent.maxSpeed) {
			desiredVelocity.normalize().scaleInPlace(agent.maxSpeed);
		}

		// Update velocity and position
		agent.velocity = desiredVelocity;
		agent.position.addInPlace(agent.velocity.scale(deltaTime));
	}

	/**
	 * Calculate separation force to avoid other agents
	 */
	private calculateSeparation(agent: CrowdAgent): Vector3 {
		const separationForce = new Vector3(0, 0, 0);
		let neighborCount = 0;

		for (const other of this.agents.values()) {
			if (other.id === agent.id) continue;

			const distance = Vector3.Distance(agent.position, other.position);
			if (distance < this.separationDistance) {
				// Push away from nearby agent
				const away = agent.position.subtract(other.position);
				if (away.length() > 0) {
					away.normalize();
					away.scaleInPlace(1.0 / distance); // Stronger force when closer
					separationForce.addInPlace(away);
					neighborCount++;
				}
			}
		}

		if (neighborCount > 0) {
			separationForce.scaleInPlace(1.0 / neighborCount);
		}

		return separationForce;
	}

	/**
	 * Check if any two agents are colliding
	 */
	hasCollisions(): boolean {
		const agentArray = Array.from(this.agents.values());

		for (let i = 0; i < agentArray.length; i++) {
			for (let j = i + 1; j < agentArray.length; j++) {
				const distance = Vector3.Distance(
					agentArray[i].position,
					agentArray[j].position,
				);
				const minDistance = agentArray[i].radius + agentArray[j].radius;

				if (distance < minDistance) {
					return true;
				}
			}
		}

		return false;
	}

	/**
	 * Get all agents
	 */
	getAllAgents(): CrowdAgent[] {
		return Array.from(this.agents.values());
	}

	/**
	 * Clear all agents
	 */
	clear(): void {
		this.agents.clear();
	}
}

// Singleton instance
export const crowdSystem = new CrowdSystem();
