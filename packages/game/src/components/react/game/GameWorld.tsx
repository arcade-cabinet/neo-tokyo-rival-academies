import { Character } from "@components/react/objects/Character";
import { Connector } from "@components/react/objects/Connector";
import { DataShard } from "@components/react/objects/DataShard";
import { Enemy } from "@components/react/objects/Enemy";
import { Obstacle } from "@components/react/objects/Obstacle";
import { Platform } from "@components/react/objects/Platform";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { ECS, type ECSEntity, world } from "@/state/ecs";
import { useGameStore } from "@/state/gameStore";
import { aiSystem } from "@/systems/AISystem";
import { type CombatEventType, CombatSystem } from "@/systems/CombatSystem";
import { startDialogue } from "@/systems/DialogueSystem";
import { InputSystem } from "@/systems/InputSystem";
import { PhysicsSystem } from "@/systems/PhysicsSystem";
import { updateProgression } from "@/systems/ProgressionSystem";
import { stageSystem } from "@/systems/StageSystem";
import type { GameState, InputState } from "@/types/game";
import { MallBackground } from "./MallBackground";
import { ParallaxBackground } from "./ParallaxBackground";
import { SpaceshipBackground } from "./SpaceshipBackground";

interface GameWorldProps {
	gameState: GameState;
	inputState: InputState;
	onGameOver: () => void;
	onScoreUpdate: (score: number) => void;
	onCombatText?: (message: string, color: string) => void;
	onCameraShake?: () => void;
	onDialogue?: (speaker: string, text: string) => void;
}

const pickEnemyColor = () => {
	// Randomize Yakuza (Black) vs Rival (Cyan) vs Biker (Red)
	const enemyTypeRand = Math.random();
	let color = 0x00ffff; // Rival
	if (enemyTypeRand > 0.7)
		color = 0x111111; // Yakuza
	else if (enemyTypeRand > 0.4) color = 0x880000; // Biker
	return color;
};

// --- Combat Events ---
// Defined in CombatSystem, but reused here locally for type safety if needed
interface CombatEvent {
	type: CombatEventType;
	value?: number;
	message?: string;
	color?: string;
	item?: string;
}

const SHAKE_INTERVAL = 2000; // ms

export function GameWorld({
	gameState,
	inputState,
	onGameOver,
	onScoreUpdate,
	onCameraShake,
	onCombatText,
	onDialogue,
}: GameWorldProps) {
	const { camera } = useThree();
	const { addItem, addXp } = useGameStore();
	const exitSequenceActive = useRef(false);
	const initialized = useRef(false);
	const [bossSpawned, setBossSpawned] = useState(false);
	// Use a ref to track spawn state synchronously during frames to avoid race conditions
	const bossSpawnedRef = useRef(false);
	const hasAlienQueenSpawned = useRef(false);

	const lastShakeTime = useRef(0);

	// Generation state
	const genStateRef = useRef({
		nextX: -10,
		nextY: 0,
		minX: -10,
	});

	// Init World
	useEffect(() => {
		if (initialized.current) return;
		initialized.current = true;

		// Load initial stage
		stageSystem.loadStage("sector7_streets");

		// Spawn Player
		world.add({
			id: "player",
			isPlayer: true,
			position: new THREE.Vector3(0, 5, 0),
			velocity: new THREE.Vector3(0, 0, 0),
			characterState: "run",
			faction: "Kurenai",
			modelColor: 0xff0000,
			// RPG Stats
			health: 100,
			stats: { structure: 100, ignition: 20, logic: 10, flow: 15 },
			level: { current: 1, xp: 0, nextLevelXp: 1000, statPoints: 0 },
			equipment: { weapon: "weapon_1", armor: "armor_1", accessory: "none" },
			dialogueState: {
				isInteracting: false,
				currentDialogueId: "",
				nodeId: "",
			},
		});

		// Spawn Rival (Ally)
		world.add({
			id: "rival-ally",
			isAlly: true,
			position: new THREE.Vector3(-3, 5, 0),
			velocity: new THREE.Vector3(0, 0, 0),
			characterState: "run",
			faction: "Azure",
			modelColor: 0x00ffff,
			health: 100,
		});

		// Spawn Start Platform
		world.add({
			id: "start-platform",
			isPlatform: true,
			position: new THREE.Vector3(-10, 0, 0),
			platformData: { length: 40, slope: 0, width: 8 },
			modelColor: 0x0a0a0a,
		});
		genStateRef.current.nextX = 30;

		// Start Quest
		useGameStore.getState().startQuest({
			id: "sector7_patrol",
			title: "Sector 7 Patrol",
			description: "Patrol the streets and clear out 5 Yakuza members.",
			completed: false,
		});

		return () => {
			world.clear();
			initialized.current = false;
		};
	}, []);

	// Handle Combat Events (Now Typed via Prop)
	const handleCombatEvent = (event: CombatEvent) => {
		if (event.type === "item" && event.item) {
			addItem(event.item, event.message || "Item");
		} else if (event.type === "xp" && event.value) {
			addXp(event.value);
		}

		// Always forward visual text
		if (event.message && event.color) {
			onCombatText?.(event.message, event.color);
		}
	};

	// Main Loop
	useFrame((_state, delta) => {
		if (!gameState.active) return;

		aiSystem.update();
		updateProgression();

		const player = world.with(
			"isPlayer",
			"position",
			"velocity",
			"characterState",
		).first;
		if (player) {
			const targetX = player.position.x;
			const targetY = player.position.y + 8;
			const targetZ = 30;
			const lookAtY = player.position.y + 2;

			// Exit Sequence Override
			if (exitSequenceActive.current) {
				player.velocity.x = 0;
				player.velocity.y = 0;
				player.position.z -= 5 * delta;
				player.characterState = "run";

				if (player.position.z < -20) {
					exitSequenceActive.current = false;
					stageSystem.completeStage();
					player.position.z = 0;
				}
			} else {
				camera.position.x = THREE.MathUtils.lerp(
					camera.position.x,
					targetX,
					3 * delta,
				);
				camera.position.y = THREE.MathUtils.lerp(
					camera.position.y,
					targetY,
					3 * delta,
				);
				camera.position.z = THREE.MathUtils.lerp(
					camera.position.z,
					targetZ,
					3 * delta,
				);
				camera.lookAt(camera.position.x, lookAtY, 0);
			}

			const score = Math.floor(player.position.x);
			onScoreUpdate(score);
			stageSystem.update(player.position.x);

			// Trigger Abduction Event
			if (
				stageSystem.currentStageId === "sector7_streets" &&
				player.position.x > 50 &&
				!bossSpawnedRef.current &&
				stageSystem.activeEvent !== "ABDUCTION"
			) {
				stageSystem.triggerEvent("ABDUCTION");
				if (onDialogue) {
					// Trigger UI
					onDialogue("Vera", "You are lagging. Expected.");
				} else {
					startDialogue("player", "rival_encounter_1");
				}
			}

			// Handle Abduction Physics
			if (stageSystem.activeEvent === "ABDUCTION") {
				player.velocity.y = 10;
				player.velocity.x = 0;

				// Correctly handle ally query to avoid shadowing
				const ally = world.with("isAlly", "position", "velocity").first;
				if (ally) {
					ally.velocity.y = 10;
					ally.velocity.x = 0;
				}

				camera.position.y += 10 * delta;
				camera.lookAt(player.position.x, player.position.y + 10, 0);

				// Transition to Space Stage
				if (player.position.y > 50) {
					console.log("Welcome to Space!");
					stageSystem.loadStage("alien_ship");

					player.position.set(0, 5, 0);
					player.velocity.set(0, 0, 0);

					if (ally) {
						ally.position.set(-3, 5, 0);
						ally.velocity.set(0, 0, 0);
					}

					world.add({
						isPlatform: true,
						position: new THREE.Vector3(0, 0, 0),
						platformData: { length: 100, slope: 0, width: 20 },
						modelColor: 0x333333,
					});

					hasAlienQueenSpawned.current = true;
					world.add({
						id: "alien-queen",
						isEnemy: true,
						isBoss: true,
						position: new THREE.Vector3(20, 10, -5),
						velocity: new THREE.Vector3(0, 0, 0),
						characterState: "stand",
						faction: "Azure",
						modelColor: 0x00ff00,
						health: 500,
					});

					// Spawn Tentacles with HEALTH
					for (let i = 0; i < 4; i++) {
						world.add({
							id: `tentacle-${i}`,
							isEnemy: true,
							position: new THREE.Vector3(10 + i * 5, 0, 5),
							velocity: new THREE.Vector3(0, 0, 0),
							characterState: "attack",
							faction: "Azure",
							modelColor: 0x00aa00,
							health: 50, // Added Health
						});
					}

					genStateRef.current.nextX = 100;
				}
				return;
			}

			// Check for Alien Queen Death -> Mall Drop
			if (
				stageSystem.currentStageId === "alien_ship" &&
				hasAlienQueenSpawned.current
			) {
				// Optimized boss count using Array.from().length as requested, though .entities.length is standard miniplex
				const bossCount = world.with("isBoss").entities.length;

				if (bossCount === 0) {
					console.log("Alien Queen Defeated! Dropping to Mall...");
					startDialogue("player", "victory");
					stageSystem.loadStage("mall_drop");

					player.position.set(0, 20, 0);
					player.velocity.set(0, -5, 0);

					const ally = world.with("isAlly", "position", "velocity").first;
					if (ally) {
						ally.position.set(-3, 20, 0);
						ally.velocity.set(0, -5, 0);
					}

					// Clear old entities
					const toRemove: ECSEntity[] = []; // Typed
					for (const e of world.with("isPlatform")) toRemove.push(e);
					for (const e of world.with("isEnemy")) toRemove.push(e);
					for (const e of toRemove) world.remove(e);

					// Spawn Mall Platforms
					world.add({
						isPlatform: true,
						position: new THREE.Vector3(0, 0, 0),
						platformData: { length: 50, slope: 0, width: 10 },
						modelColor: 0xff00ff,
					});

					world.add({
						isPlatform: true,
						position: new THREE.Vector3(60, 10, 0),
						platformData: { length: 40, slope: 0, width: 10 },
						modelColor: 0x00ffff,
					});

					// Spawn Mall Cops with HEALTH
					for (let i = 0; i < 3; i++) {
						world.add({
							id: `mall-cop-${i}`,
							isEnemy: true,
							position: new THREE.Vector3(20 + i * 10, 0, 0),
							velocity: new THREE.Vector3(0, 0, 0),
							characterState: "stand",
							faction: "Azure",
							modelColor: 0x0000ff,
							health: 100, // Added Health
						});
					}

					genStateRef.current.nextX = 120;
				}
			}

			// Check stage END REACHED
			if (
				stageSystem.state === "playing" &&
				player.position.x > stageSystem.currentStage.length &&
				!exitSequenceActive.current
			) {
				// Mark stage as complete to trigger end sequence/connector spawn logic
				stageSystem.completeStage();
			}

			// Check stage completion
			if (stageSystem.state === "complete") {
				if (!bossSpawnedRef.current) {
					console.log("Spawning End/Boss Arena...");
					setBossSpawned(true);
					bossSpawnedRef.current = true;

					const endX = genStateRef.current.nextX + 10;
					const endY = genStateRef.current.nextY;

					if (stageSystem.currentStageId === "sector7_streets") {
						startDialogue("player", "intro");

						world.add({
							isPlatform: true,
							position: new THREE.Vector3(endX, endY, 0),
							platformData: { length: 20, slope: 0, width: 10 },
							modelColor: 0x222222,
						});
					} else {
						world.add({
							isPlatform: true,
							position: new THREE.Vector3(endX, endY, 0),
							platformData: { length: 60, slope: 0, width: 12 },
						});

						world.add({
							id: "boss-vera",
							isEnemy: true,
							position: new THREE.Vector3(endX + 30, endY + 5, 0),
							velocity: new THREE.Vector3(0, 0, 0),
							characterState: "stand",
							faction: "Azure",
							modelColor: 0xffffff,
							health: 1000,
						});
					}
				}

				// Handle Exit Sequence Logic
				if (
					stageSystem.currentStageId === "sector7_streets" &&
					bossSpawnedRef.current
				) {
					const endX = genStateRef.current.nextX + 20;
					if (
						Math.abs(player.position.x - endX) < 5 &&
						!exitSequenceActive.current
					) {
						console.log("Entering Connector...");
						exitSequenceActive.current = true;
					}
				}
			}

			if (player.position.y < -20) {
				onGameOver();
			}

			if (onCameraShake) {
				const now = performance.now();
				if (now - lastShakeTime.current > SHAKE_INTERVAL) {
					onCameraShake();
					lastShakeTime.current = now;
				}
			}

			if (
				stageSystem.currentStage.platforms === "procedural" &&
				stageSystem.state !== "complete"
			) {
				if (genStateRef.current.nextX < player.position.x + 80) {
					generatePlatform();
				}
			}
		}
	});

	const generatePlatform = () => {
		const type = Math.random();
		let length = 15 + Math.random() * 15;
		let slope = 0;

		if (type < 0.2) {
			const gap = 5 + Math.random() * 8;
			genStateRef.current.nextX += gap;
			const yChange = (Math.random() - 0.6) * 5;
			genStateRef.current.nextY += yChange > 2 ? 2 : yChange;
		} else if (type < 0.6) {
			slope = 0;
		} else if (type < 0.8) {
			slope = 1;
			length = 15 + Math.random() * 10;
		} else {
			slope = -1;
			length = 15 + Math.random() * 10;
		}

		const angle = slope * 0.26;
		const x = genStateRef.current.nextX;
		const y = genStateRef.current.nextY;

		world.add({
			isPlatform: true,
			position: new THREE.Vector3(x, y, 0),
			platformData: { length, slope, width: 8 },
		});

		if (length > 15 && Math.abs(slope) < 0.1) {
			const rand = Math.random();
			if (rand > 0.7) {
				const ex = x + 5 + Math.random() * (length - 10);
				world.add({
					id: `enemy-${Math.random().toString(36).substr(2, 9)}`,
					isEnemy: true,
					position: new THREE.Vector3(ex, y, 0),
					velocity: new THREE.Vector3(0, 0, 0),
					characterState: Math.random() > 0.5 ? "stand" : "block",
					faction: "Azure",
					modelColor: pickEnemyColor(),
					health: 100, // Added Health
				});
			} else if (rand > 0.4) {
				const ox = x + 5 + Math.random() * (length - 10);
				world.add({
					isObstacle: true,
					position: new THREE.Vector3(ox, y, 0),
					obstacleType: Math.random() > 0.5 ? "low" : "high",
				});
			} else if (rand > 0.35) {
				const sx = x + 5 + Math.random() * (length - 10);
				world.add({
					isCollectible: true,
					position: new THREE.Vector3(sx, y + 2, 0),
					modelColor: 0x00ff00,
				});
			}
		}

		genStateRef.current.nextX += length * Math.cos(angle);
		genStateRef.current.nextY += length * Math.sin(angle);
	};

	return (
		<>
			<PhysicsSystem />
			<InputSystem inputState={inputState} />
			<CombatSystem
				onGameOver={onGameOver}
				onScoreUpdate={onScoreUpdate}
				onCameraShake={onCameraShake}
				onCombatEvent={handleCombatEvent} // Pass typed event handler
			/>

			<ECS.Entities in={world.with("isPlayer", "position", "characterState")}>
				{(entity) => (
					<Character
						position={[entity.position.x, entity.position.y, entity.position.z]}
						state={entity.characterState}
						color={entity.modelColor || 0xff0000}
						isPlayer
					/>
				)}
			</ECS.Entities>

			<ECS.Entities in={world.with("isCollectible", "position")}>
				{(entity) => (
					<DataShard
						position={[entity.position.x, entity.position.y, entity.position.z]}
					/>
				)}
			</ECS.Entities>

			{bossSpawned && stageSystem.currentStageId === "sector7_streets" && (
				<Connector
					position={[
						genStateRef.current.nextX + 20,
						genStateRef.current.nextY,
						0,
					]}
					type="bridge"
				/>
			)}

			<ECS.Entities in={world.with("isAlly", "position", "characterState")}>
				{(entity) => (
					<Character
						position={[entity.position.x, entity.position.y, entity.position.z]}
						state={entity.characterState}
						color={entity.modelColor || 0x00ffff}
					/>
				)}
			</ECS.Entities>

			<ECS.Entities in={world.with("isEnemy", "position", "characterState")}>
				{(entity) => (
					<Enemy
						position={[entity.position.x, entity.position.y, entity.position.z]}
						enemyType={entity.characterState === "block" ? "block" : "stand"}
						color={entity.modelColor}
					/>
				)}
			</ECS.Entities>

			<ECS.Entities in={world.with("isObstacle", "position", "obstacleType")}>
				{(entity) => (
					<Obstacle
						position={[entity.position.x, entity.position.y, entity.position.z]}
						type={entity.obstacleType || "low"}
					/>
				)}
			</ECS.Entities>

			<ECS.Entities in={world.with("isPlatform", "position", "platformData")}>
				{(entity) => (
					<Platform
						x={entity.position.x}
						y={entity.position.y}
						length={entity.platformData.length}
						slope={entity.platformData.slope}
					/>
				)}
			</ECS.Entities>

			<mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -5, 0]} receiveShadow>
				<planeGeometry args={[1000, 1000]} />
				<shadowMaterial opacity={0.3} />
			</mesh>

			{stageSystem.currentStageId === "alien_ship" ? (
				<SpaceshipBackground />
			) : stageSystem.currentStageId === "mall_drop" ? (
				<MallBackground />
			) : (
				<ParallaxBackground />
			)}
		</>
	);
}
