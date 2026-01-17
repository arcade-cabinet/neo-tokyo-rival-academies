/**
 * Threat System
 *
 * Manages threat assessment and target prioritization for AI.
 */

import { Vector3 } from "@babylonjs/core";

export interface ThreatTarget {
	id: string;
	position: Vector3;
	threatLevel: number; // 0-1, higher = more threatening
	lastSeenTime: number;
	lastKnownPosition: Vector3;
}

export class ThreatSystem {
	private threats: Map<string, ThreatTarget> = new Map();
	private memoryDuration = 5000; // Remember targets for 5 seconds

	/**
	 * Add or update threat target
	 */
	updateThreat(
		id: string,
		position: Vector3,
		threatLevel: number,
		currentTime: number,
	): void {
		const existing = this.threats.get(id);

		if (existing) {
			existing.position = position;
			existing.threatLevel = threatLevel;
			existing.lastSeenTime = currentTime;
			existing.lastKnownPosition = position.clone();
		} else {
			this.threats.set(id, {
				id,
				position: position.clone(),
				threatLevel,
				lastSeenTime: currentTime,
				lastKnownPosition: position.clone(),
			});
		}
	}

	/**
	 * Get highest priority target
	 */
	getPriorityTarget(
		fromPosition: Vector3,
		currentTime: number,
	): ThreatTarget | null {
		let bestTarget: ThreatTarget | null = null;
		let bestScore = -1;

		for (const threat of this.threats.values()) {
			// Skip if memory expired
			if (currentTime - threat.lastSeenTime > this.memoryDuration) {
				continue;
			}

			// Calculate priority score (closer + higher threat = higher priority)
			const distance = Vector3.Distance(fromPosition, threat.position);
			const distanceScore = 1.0 / (1.0 + distance * 0.1); // Closer = higher score
			const score = distanceScore * 0.5 + threat.threatLevel * 0.5;

			if (score > bestScore) {
				bestScore = score;
				bestTarget = threat;
			}
		}

		return bestTarget;
	}

	/**
	 * Mark target as lost (no longer visible)
	 */
	loseTarget(id: string, currentTime: number): void {
		const threat = this.threats.get(id);
		if (threat) {
			// Keep last known position but update time
			threat.lastSeenTime = currentTime;
		}
	}

	/**
	 * Remove threat from tracking
	 */
	removeThreat(id: string): void {
		this.threats.delete(id);
	}

	/**
	 * Get last known position of target
	 */
	getLastKnownPosition(id: string): Vector3 | null {
		const threat = this.threats.get(id);
		return threat ? threat.lastKnownPosition.clone() : null;
	}

	/**
	 * Clear all threats
	 */
	clear(): void {
		this.threats.clear();
	}

	/**
	 * Clean up expired threats
	 */
	cleanupExpired(currentTime: number): void {
		for (const [id, threat] of this.threats.entries()) {
			if (currentTime - threat.lastSeenTime > this.memoryDuration) {
				this.threats.delete(id);
			}
		}
	}
}
