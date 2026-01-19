/**
 * NavMeshTest - Test navigation mesh and AI pathfinding
 *
 * Testing:
 * - NavMesh area definition
 * - Waypoint generation
 * - A* pathfinding
 * - AI agent following paths
 * - Debug visualization
 */

import { Color3, Vector3 } from "@babylonjs/core";
import { useState, useCallback, useRef } from "react";
import { createRoot } from "react-dom/client";
import { TestHarness } from "../TestHarness";
import {
	NavMesh,
	type NavMeshController,
	createNavAreasFromFloors,
} from "../components/NavMesh";
import { Floor } from "../components/Floor";
import { TexturedWall } from "../components/TexturedWall";
import { Water } from "../components/Water";
import { NeonSign } from "../components/NeonSign";

// Simple AI Agent component
import {
	MeshBuilder,
	PBRMaterial,
	type AbstractMesh,
} from "@babylonjs/core";
import { useEffect } from "react";
import { useScene } from "reactylon";

interface AIAgentProps {
	id: string;
	position: Vector3;
	color: Color3;
	navMesh: NavMeshController | null;
	target: Vector3 | null;
	speed?: number;
	onArrived?: () => void;
}

function AIAgent({
	id,
	position,
	color,
	navMesh,
	target,
	speed = 3,
	onArrived,
}: AIAgentProps) {
	const scene = useScene();
	const meshRef = useRef<AbstractMesh | null>(null);
	const pathRef = useRef<Vector3[]>([]);
	const pathIndexRef = useRef(0);
	const currentPosRef = useRef(position.clone());

	useEffect(() => {
		if (!scene) return;

		// Create agent mesh
		const body = MeshBuilder.CreateCapsule(
			`aiAgent_${id}`,
			{
				radius: 0.3,
				height: 1.5,
			},
			scene,
		);
		body.position = position.clone();
		body.position.y += 0.75;

		const mat = new PBRMaterial(`aiMat_${id}`, scene);
		mat.albedoColor = color;
		mat.emissiveColor = color.scale(0.5);
		mat.emissiveIntensity = 1;
		mat.roughness = 0.5;
		body.material = mat;

		meshRef.current = body;
		currentPosRef.current = position.clone();

		// Movement update
		const onBeforeRender = scene.onBeforeRenderObservable.add(() => {
			const mesh = meshRef.current;
			if (!mesh || pathRef.current.length === 0) return;

			const dt = scene.getEngine().getDeltaTime() / 1000;
			const targetPos = pathRef.current[pathIndexRef.current];

			if (!targetPos) return;

			// Move towards target
			const direction = targetPos.subtract(currentPosRef.current);
			direction.y = 0; // Keep on same Y level
			const dist = direction.length();

			if (dist < 0.3) {
				// Reached waypoint
				pathIndexRef.current++;

				if (pathIndexRef.current >= pathRef.current.length) {
					// Reached end
					pathRef.current = [];
					pathIndexRef.current = 0;
					onArrived?.();
				}
			} else {
				// Move
				direction.normalize();
				const moveAmount = Math.min(speed * dt, dist);
				currentPosRef.current.addInPlace(direction.scale(moveAmount));
				mesh.position.x = currentPosRef.current.x;
				mesh.position.z = currentPosRef.current.z;

				// Rotate to face movement direction
				const angle = Math.atan2(direction.x, direction.z);
				mesh.rotation.y = angle;
			}
		});

		return () => {
			scene.onBeforeRenderObservable.remove(onBeforeRender);
			body.dispose();
			meshRef.current = null;
		};
	}, [scene, id, position, color, speed, onArrived]);

	// Update path when target changes
	useEffect(() => {
		if (navMesh && target) {
			const path = navMesh.findPath(currentPosRef.current, target);
			pathRef.current = path;
			pathIndexRef.current = 0;
		}
	}, [navMesh, target]);

	return null;
}

// Path visualization component
interface PathVisualizerProps {
	path: Vector3[];
	color: Color3;
}

function PathVisualizer({ path, color }: PathVisualizerProps) {
	const scene = useScene();
	const linesRef = useRef<AbstractMesh | null>(null);

	useEffect(() => {
		if (!scene || path.length < 2) {
			if (linesRef.current) {
				linesRef.current.dispose();
				linesRef.current = null;
			}
			return;
		}

		// Create path line
		const points = path.map((p) => p.add(new Vector3(0, 0.2, 0)));
		const lines = MeshBuilder.CreateLines(
			"pathViz",
			{ points, updatable: true },
			scene,
		);
		lines.color = color;

		linesRef.current = lines as unknown as AbstractMesh;

		return () => {
			if (linesRef.current) {
				linesRef.current.dispose();
				linesRef.current = null;
			}
		};
	}, [scene, path, color]);

	return null;
}

function NavMeshTestScene() {
	const [seed, setSeed] = useState("navmesh-001");
	const [showDebug, setShowDebug] = useState(true);
	const [cellSize, setCellSize] = useState(1);
	const navMeshRef = useRef<NavMeshController | null>(null);
	const [aiTarget, setAiTarget] = useState<Vector3 | null>(null);
	const [currentPath, setCurrentPath] = useState<Vector3[]>([]);
	const [agentStatus, setAgentStatus] = useState("IDLE");

	const handleSeedChange = useCallback((newSeed: string) => {
		setSeed(newSeed);
	}, []);

	const handleNavMeshReady = useCallback((navMesh: NavMeshController) => {
		navMeshRef.current = navMesh;
		console.log(
			"NavMesh ready with",
			navMesh.getWaypoints().length,
			"waypoints",
		);
	}, []);

	// Define floor layout
	const floors = [
		{
			id: "main",
			position: new Vector3(0, 0, 0),
			size: { width: 10, depth: 10 },
		},
		{
			id: "bridge",
			position: new Vector3(7, 0, 0),
			size: { width: 4, depth: 3 },
		},
		{
			id: "platform_1",
			position: new Vector3(12, 0, 0),
			size: { width: 6, depth: 6 },
		},
		{
			id: "walkway",
			position: new Vector3(0, 0, 8),
			size: { width: 10, depth: 3 },
		},
		{
			id: "platform_2",
			position: new Vector3(-8, 0, 8),
			size: { width: 5, depth: 5 },
		},
	];

	const navAreas = createNavAreasFromFloors(floors, true, 3);

	const sendAgentTo = (target: Vector3) => {
		if (navMeshRef.current) {
			const path = navMeshRef.current.findPath(
				new Vector3(-3, 0, -3),
				target,
			);
			setCurrentPath(path);
			setAiTarget(target);
			setAgentStatus("MOVING");
		}
	};

	const handleAgentArrived = () => {
		setAgentStatus("ARRIVED");
		setTimeout(() => setAgentStatus("IDLE"), 1000);
	};

	const controls = (
		<div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
			<label
				style={{
					display: "flex",
					alignItems: "center",
					gap: "0.25rem",
					fontSize: "0.7rem",
				}}
			>
				<input
					type="checkbox"
					checked={showDebug}
					onChange={(e) => setShowDebug(e.target.checked)}
				/>
				Show NavMesh Debug
			</label>

			<div>
				<label
					style={{
						fontSize: "0.7rem",
						display: "block",
						marginBottom: "0.25rem",
					}}
				>
					CELL SIZE: {cellSize}
				</label>
				<input
					type="range"
					min="0.5"
					max="2"
					step="0.25"
					value={cellSize}
					onChange={(e) => setCellSize(Number(e.target.value))}
					style={{ width: "100%" }}
				/>
			</div>

			<div
				style={{
					padding: "0.5rem",
					background: "#1a1a2e",
					border: "1px solid #00ff88",
					fontSize: "0.65rem",
				}}
			>
				<div style={{ color: "#00ff88", marginBottom: "0.25rem" }}>
					AI STATUS:
				</div>
				<div
					style={{
						color:
							agentStatus === "MOVING"
								? "#ff0088"
								: agentStatus === "ARRIVED"
									? "#00ff88"
									: "#aaa",
					}}
				>
					{agentStatus}
				</div>
				<div style={{ marginTop: "0.25rem" }}>
					Path points: {currentPath.length}
				</div>
			</div>

			<div style={{ fontSize: "0.7rem", marginTop: "0.5rem" }}>
				SEND AI TO:
			</div>

			<button
				onClick={() => sendAgentTo(new Vector3(12, 0, 0))}
				style={{
					padding: "0.5rem",
					background: "#ff0088",
					color: "#fff",
					border: "none",
					cursor: "pointer",
					fontSize: "0.7rem",
				}}
			>
				PLATFORM 1
			</button>

			<button
				onClick={() => sendAgentTo(new Vector3(-8, 0, 8))}
				style={{
					padding: "0.5rem",
					background: "#00aaff",
					color: "#fff",
					border: "none",
					cursor: "pointer",
					fontSize: "0.7rem",
				}}
			>
				PLATFORM 2
			</button>

			<button
				onClick={() => sendAgentTo(new Vector3(0, 0, 8))}
				style={{
					padding: "0.5rem",
					background: "#00ff88",
					color: "#000",
					border: "none",
					cursor: "pointer",
					fontSize: "0.7rem",
				}}
			>
				WALKWAY
			</button>

			<div
				style={{
					fontSize: "0.65rem",
					marginTop: "1rem",
					color: "#ff0088",
				}}
			>
				<p>TESTS:</p>
				<ul style={{ paddingLeft: "1rem", marginTop: "0.25rem" }}>
					<li>☐ NavMesh visualizes correctly</li>
					<li>☐ Waypoints connect across areas</li>
					<li>☐ AI finds path between areas</li>
					<li>☐ AI follows path smoothly</li>
				</ul>
			</div>
		</div>
	);

	return (
		<TestHarness
			title="// NAV MESH"
			description="Navigation mesh for AI pathfinding. Click buttons to send AI agent to locations."
			onSeedChange={handleSeedChange}
			initialSeed={seed}
			cameraDistance={25}
			cameraTarget={new Vector3(2, 0, 2)}
			controls={controls}
		>
			{/* Navigation Mesh */}
			<NavMesh
				id="navmesh"
				areas={navAreas}
				cellSize={cellSize}
				debug={showDebug}
				debugColor={new Color3(0, 0.6, 0.3)}
				waypointColor={new Color3(1, 1, 0)}
				connectionColor={new Color3(0, 0.5, 1)}
				onReady={handleNavMeshReady}
			/>

			{/* AI Agent */}
			<AIAgent
				id="ai_1"
				position={new Vector3(-3, 0, -3)}
				color={new Color3(1, 0.3, 0)}
				navMesh={navMeshRef.current}
				target={aiTarget}
				speed={4}
				onArrived={handleAgentArrived}
			/>

			{/* Path visualization */}
			<PathVisualizer path={currentPath} color={new Color3(1, 0.5, 0)} />

			{/* Water below */}
			<Water
				id="water"
				position={new Vector3(0, -2, 0)}
				size={{ width: 60, depth: 60 }}
				color={new Color3(0.02, 0.05, 0.1)}
				opacity={0.9}
				reflectivity={0.5}
				depth={10}
			/>

			{/* Floors */}
			{floors.map((floor) => (
				<Floor
					key={floor.id}
					id={floor.id}
					position={floor.position}
					size={floor.size}
					surface="concrete"
					edgeTrim={true}
				/>
			))}

			{/* Buildings for context */}
			<TexturedWall
				id="building_1"
				position={new Vector3(0, -3, -7)}
				size={{ width: 10, height: 6, depth: 1 }}
				textureType="concrete_dirty"
				neonAccent={new Color3(1, 0, 0.5)}
			/>

			<TexturedWall
				id="building_2"
				position={new Vector3(12, -3, -5)}
				size={{ width: 6, height: 6, depth: 1 }}
				textureType="brick_grey"
				neonAccent={new Color3(0, 1, 0.5)}
			/>

			<TexturedWall
				id="building_3"
				position={new Vector3(-8, -3, 12)}
				size={{ width: 5, height: 6, depth: 1 }}
				textureType="metal_rusted"
				neonAccent={new Color3(0, 0.5, 1)}
			/>

			{/* Destination markers */}
			<NeonSign
				id="marker_1"
				position={new Vector3(12, 1, 0)}
				color={new Color3(1, 0, 0.5)}
				shape="circle"
				size={{ width: 1, height: 1 }}
				mount="pole"
			/>

			<NeonSign
				id="marker_2"
				position={new Vector3(-8, 1, 8)}
				color={new Color3(0, 0.5, 1)}
				shape="circle"
				size={{ width: 1, height: 1 }}
				mount="pole"
			/>

			<NeonSign
				id="marker_3"
				position={new Vector3(0, 1, 8)}
				color={new Color3(0, 1, 0.5)}
				shape="circle"
				size={{ width: 1, height: 1 }}
				mount="pole"
			/>
		</TestHarness>
	);
}

// Mount the app
const root = createRoot(document.getElementById("root")!);
root.render(<NavMeshTestScene />);
