/**
 * FerryTest - Full ferry system integration test
 *
 * Combines:
 * - Water (flooded street surface)
 * - RailPath (underwater hidden rail)
 * - Platform (ferry deck that rides the rail)
 * - DockingStation (embark/disembark points)
 * - Buildings (context for the crossing)
 *
 * This tests the complete transport primitive working together.
 */

import { Color3, Vector3, Path3D } from "@babylonjs/core";
import { useState, useCallback, useRef } from "react";
import { createRoot } from "react-dom/client";
import { TestHarness } from "../TestHarness";
import { Water } from "../components";
import { RailPath } from "../components";
import { Platform, type PlatformAnimationControls } from "../components";
import { DockingStation } from "../components";
import { TexturedWall } from "../components";
import { Floor } from "../components";

function FerryTestScene() {
	const [seed, setSeed] = useState("ferry-001");
	const [isRunning, setIsRunning] = useState(false);
	const [showDebugPath, setShowDebugPath] = useState(true);
	const [travelTime, setTravelTime] = useState(10);

	const animControlsRef = useRef<PlatformAnimationControls | null>(null);
	const [pathData, setPathData] = useState<Path3D | null>(null);

	const handleSeedChange = useCallback((newSeed: string) => {
		setSeed(newSeed);
	}, []);

	// Ferry route - slight arc across the water
	const dockAPos = new Vector3(-18, 1, 0);
	const dockBPos = new Vector3(18, 1, 0);

	const ferryPathPoints = [
		new Vector3(dockAPos.x + 3, 0.5, 0),
		new Vector3(0, 0.8, 0), // slight rise in middle
		new Vector3(dockBPos.x - 3, 0.5, 0),
	];

	const handlePathReady = useCallback((path: Path3D) => {
		setPathData(path);
	}, []);

	const handleAnimationReady = useCallback((controls: PlatformAnimationControls) => {
		animControlsRef.current = controls;
	}, []);

	const toggleFerry = () => {
		if (!animControlsRef.current) return;
		if (isRunning) {
			animControlsRef.current.pause();
		} else {
			animControlsRef.current.start();
		}
		setIsRunning(!isRunning);
	};

	const resetFerry = () => {
		if (!animControlsRef.current) return;
		animControlsRef.current.stop();
		setIsRunning(false);
	};

	const controls = (
		<div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
			<div style={{ fontSize: "0.8rem", color: "#00ff88", marginBottom: "0.5rem" }}>
				FERRY SYSTEM TEST
			</div>

			<div style={{ display: "flex", gap: "0.5rem" }}>
				<button
					onClick={toggleFerry}
					style={{
						flex: 1,
						padding: "0.75rem",
						background: isRunning ? "#ff4444" : "#00ff88",
						border: "none",
						color: "#000",
						fontFamily: "inherit",
						fontSize: "0.8rem",
						fontWeight: "bold",
						cursor: "pointer",
					}}
				>
					{isRunning ? "⏸ STOP" : "▶ DEPART"}
				</button>
				<button
					onClick={resetFerry}
					style={{
						flex: 1,
						padding: "0.75rem",
						background: "#444",
						border: "none",
						color: "#fff",
						fontFamily: "inherit",
						fontSize: "0.8rem",
						cursor: "pointer",
					}}
				>
					⟲ RESET
				</button>
			</div>

			<div>
				<label style={{ fontSize: "0.7rem", display: "block", marginBottom: "0.25rem" }}>
					TRAVEL TIME: {travelTime}s
				</label>
				<input
					type="range"
					min="5"
					max="20"
					step="1"
					value={travelTime}
					onChange={(e) => setTravelTime(Number(e.target.value))}
					style={{ width: "100%" }}
				/>
			</div>

			<label style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.7rem" }}>
				<input
					type="checkbox"
					checked={showDebugPath}
					onChange={(e) => setShowDebugPath(e.target.checked)}
				/>
				Show Rail Path
			</label>

			<div style={{ fontSize: "0.65rem", marginTop: "1rem", color: "#ffff00" }}>
				<p>COMPONENTS:</p>
				<ul style={{ paddingLeft: "1rem", marginTop: "0.25rem" }}>
					<li>Water - flooded street</li>
					<li>RailPath - hidden underwater</li>
					<li>Platform - ferry deck</li>
					<li>DockingStation x2</li>
					<li>Buildings - context</li>
				</ul>
			</div>

			<div style={{ fontSize: "0.65rem", marginTop: "1rem", color: "#ff0088" }}>
				<p>ACCEPTANCE:</p>
				<ul style={{ paddingLeft: "1rem", marginTop: "0.25rem" }}>
					<li>☐ Ferry follows rail smoothly</li>
					<li>☐ Stops at both docks</li>
					<li>☐ No water clipping</li>
					<li>☐ Neon reflects on water</li>
					<li>☐ Docks align with ferry</li>
				</ul>
			</div>
		</div>
	);

	return (
		<TestHarness
			title="// FERRY CROSSING"
			description="Complete ferry system: Water + Rail + Platform + Docks. Tests transport primitive integration."
			onSeedChange={handleSeedChange}
			initialSeed={seed}
			cameraDistance={40}
			cameraTarget={new Vector3(0, 3, 0)}
			controls={controls}
		>
			{/* ===== WATER ===== */}
			<Water
				id="flooded_canal"
				position={new Vector3(0, -1, 0)}
				size={{ width: 60, depth: 30 }}
				color={new Color3(0.02, 0.06, 0.12)}
				opacity={0.9}
				reflectivity={0.7}
				depth={12}
			/>

			{/* ===== RAIL PATH ===== */}
			<RailPath
				id="ferry_route"
				points={ferryPathPoints}
				pathType="catmullrom"
				subdivisions={100}
				debug={showDebugPath}
				debugColor={new Color3(1, 1, 0)}
				onPathReady={handlePathReady}
			/>

			{/* ===== FERRY PLATFORM ===== */}
			{pathData && (
				<Platform
					id="ferry_1"
					position={ferryPathPoints[0]}
					size={{ width: 5, length: 8, height: 0.2 }}
					style="metal"
					railings={true}
					neonEdge={new Color3(0, 1, 0.5)}
					path={pathData}
					travelTime={travelTime}
					autoStart={false}
					pingPong={true}
					onAnimationReady={handleAnimationReady}
				/>
			)}

			{/* ===== DOCK A (Left/West) ===== */}
			<DockingStation
				id="dock_west"
				position={new Vector3(dockAPos.x + 2, 1, 0)}
				size={{ width: 6, depth: 4 }}
				dockType="ferry"
				approachAngle={90}
				neonColor={new Color3(0, 1, 0.5)}
			/>

			{/* Building A - West side */}
			<Floor
				id="rooftop_west"
				position={new Vector3(-22, 1, 0)}
				size={{ width: 10, depth: 14 }}
				surface="concrete"
				edgeTrim={true}
			/>
			<TexturedWall
				id="building_west_1"
				position={new Vector3(-22, -1, -7)}
				size={{ width: 10, height: 4, depth: 0.3 }}
				textureType="concrete_dirty"
			/>
			<TexturedWall
				id="building_west_2"
				position={new Vector3(-27, -1, 0)}
				size={{ width: 0.3, height: 4, depth: 14 }}
				textureType="brick_grey"
			/>

			{/* ===== DOCK B (Right/East) ===== */}
			<DockingStation
				id="dock_east"
				position={new Vector3(dockBPos.x - 2, 1, 0)}
				size={{ width: 6, depth: 4 }}
				dockType="ferry"
				approachAngle={-90}
				neonColor={new Color3(1, 0.3, 0)}
			/>

			{/* Building B - East side */}
			<Floor
				id="rooftop_east"
				position={new Vector3(22, 0.5, 0)}
				size={{ width: 10, depth: 12 }}
				surface="membrane"
				edgeTrim={true}
			/>
			<TexturedWall
				id="building_east_1"
				position={new Vector3(22, -1.5, 6)}
				size={{ width: 10, height: 4, depth: 0.3 }}
				textureType="metal_rusted"
			/>
			<TexturedWall
				id="building_east_2"
				position={new Vector3(27, -1.5, 0)}
				size={{ width: 0.3, height: 4, depth: 12 }}
				textureType="concrete_clean"
			/>

			{/* Background buildings for depth */}
			<TexturedWall
				id="bg_building_1"
				position={new Vector3(-10, -1, -20)}
				size={{ width: 8, height: 12, depth: 6 }}
				textureType="brick_red"
			/>
			<TexturedWall
				id="bg_building_2"
				position={new Vector3(8, -1, -18)}
				size={{ width: 6, height: 10, depth: 5 }}
				textureType="metal_clean"
			/>
			<TexturedWall
				id="bg_building_3"
				position={new Vector3(0, -1, -25)}
				size={{ width: 12, height: 15, depth: 4 }}
				textureType="concrete_dirty"
			/>
		</TestHarness>
	);
}

// Mount the app
const root = createRoot(document.getElementById("root")!);
root.render(<FerryTestScene />);
