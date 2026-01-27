/**
 * RailPathTest - Test rail/spline path component
 *
 * Testing:
 * - Different path types (linear, catmull-rom, bezier)
 * - Debug visualization
 * - Path presets (straight, arc, vertical, loop)
 * - Position queries along path
 */

import { Color3, Vector3 } from "@babylonjs/core";
import { useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { TestHarness } from "../TestHarness";
import { RailPath, RailPathPresets } from "../components";
import { Water } from "../components";
import { TexturedWall } from "../components";

type PathPreset = "straight" | "arc" | "vertical" | "lshape" | "loop";

function RailPathTestScene() {
	const [seed, setSeed] = useState("rail-001");
	const [pathPreset, setPathPreset] = useState<PathPreset>("arc");
	const [pathType, setPathType] = useState<"linear" | "catmullrom" | "bezier">("catmullrom");
	const [showDebug, setShowDebug] = useState(true);

	const handleSeedChange = useCallback((newSeed: string) => {
		setSeed(newSeed);
	}, []);

	// Generate path points based on preset
	const getPathPoints = (): Vector3[] => {
		switch (pathPreset) {
			case "straight":
				return RailPathPresets.straight(
					new Vector3(-10, 0.5, 0),
					new Vector3(10, 0.5, 0)
				);
			case "arc":
				return RailPathPresets.arc(
					new Vector3(-10, 0.5, 0),
					new Vector3(10, 0.5, 0),
					3 // height of arc
				);
			case "vertical":
				return RailPathPresets.vertical(
					new Vector3(0, 0, 0),
					8 // height
				);
			case "lshape":
				return RailPathPresets.lShape(
					new Vector3(-8, 0.5, -8),
					new Vector3(-8, 0.5, 0),
					new Vector3(8, 0.5, 0)
				);
			case "loop":
				return RailPathPresets.loop(
					new Vector3(0, 0.5, 0),
					8, // radius
					12 // segments
				);
			default:
				return [new Vector3(-5, 0.5, 0), new Vector3(5, 0.5, 0)];
		}
	};

	const controls = (
		<div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
			<div>
				<label style={{ fontSize: "0.7rem", display: "block", marginBottom: "0.25rem" }}>
					PATH SHAPE:
				</label>
				<select
					value={pathPreset}
					onChange={(e) => setPathPreset(e.target.value as PathPreset)}
					style={{
						width: "100%",
						padding: "0.25rem",
						background: "#1a1a2e",
						border: "1px solid #00ff88",
						color: "#00ff88",
						fontSize: "0.7rem",
					}}
				>
					<option value="straight">Straight (Ferry)</option>
					<option value="arc">Arc (Bridge)</option>
					<option value="vertical">Vertical (Elevator)</option>
					<option value="lshape">L-Shape (Corner)</option>
					<option value="loop">Loop (Circuit)</option>
				</select>
			</div>

			<div>
				<label style={{ fontSize: "0.7rem", display: "block", marginBottom: "0.25rem" }}>
					INTERPOLATION:
				</label>
				<select
					value={pathType}
					onChange={(e) => setPathType(e.target.value as typeof pathType)}
					style={{
						width: "100%",
						padding: "0.25rem",
						background: "#1a1a2e",
						border: "1px solid #00ff88",
						color: "#00ff88",
						fontSize: "0.7rem",
					}}
				>
					<option value="linear">Linear (Sharp)</option>
					<option value="catmullrom">Catmull-Rom (Smooth)</option>
					<option value="bezier">Bezier (Curved)</option>
				</select>
			</div>

			<label style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.7rem", marginTop: "0.5rem" }}>
				<input
					type="checkbox"
					checked={showDebug}
					onChange={(e) => setShowDebug(e.target.checked)}
				/>
				Show Debug Path
			</label>

			<div style={{ fontSize: "0.65rem", marginTop: "1rem", color: "#ffff00" }}>
				<p>PATH USES:</p>
				<ul style={{ paddingLeft: "1rem", marginTop: "0.25rem" }}>
					<li>straight → ferry routes</li>
					<li>arc → cable cars</li>
					<li>vertical → elevators</li>
					<li>lshape → corner transit</li>
					<li>loop → patrol routes</li>
				</ul>
			</div>

			<div style={{ fontSize: "0.65rem", marginTop: "1rem", color: "#ff0088" }}>
				<p>TESTS:</p>
				<ul style={{ paddingLeft: "1rem", marginTop: "0.25rem" }}>
					<li>☐ Path visible in debug</li>
					<li>☐ Control points marked</li>
					<li>☐ Smooth interpolation</li>
					<li>☐ Path connects endpoints</li>
				</ul>
			</div>
		</div>
	);

	return (
		<TestHarness
			title="// RAIL PATH"
			description="Spline paths for ferries, elevators, gondolas. Debug shows path + control points."
			onSeedChange={handleSeedChange}
			initialSeed={seed}
			cameraDistance={25}
			cameraTarget={new Vector3(0, 3, 0)}
			controls={controls}
		>
			{/* Water surface below */}
			<Water
				id="water"
				position={new Vector3(0, -1, 0)}
				size={{ width: 40, depth: 40 }}
				color={new Color3(0.02, 0.08, 0.15)}
				opacity={0.85}
				reflectivity={0.7}
				depth={8}
			/>

			{/* The rail path */}
			<RailPath
				id="main"
				points={getPathPoints()}
				pathType={pathType}
				debug={showDebug}
				debugColor={new Color3(1, 1, 0)}
				onPathReady={(_path, curve) => {
					console.log(`Path created with ${curve.getPoints().length} points`);
					console.log(`Path length: ${curve.length().toFixed(2)} units`);
				}}
			/>

			{/* Dock buildings at endpoints (for context) */}
			{pathPreset !== "vertical" && pathPreset !== "loop" && (
				<>
					<TexturedWall
						id="dock_a"
						position={new Vector3(-12, -1, 0)}
						size={{ width: 4, height: 5, depth: 4 }}
						textureType="concrete_dirty"
					/>
					<TexturedWall
						id="dock_b"
						position={new Vector3(12, -1, 0)}
						size={{ width: 4, height: 5, depth: 4 }}
						textureType="concrete_dirty"
					/>
				</>
			)}

			{/* Vertical: building with elevator shaft */}
			{pathPreset === "vertical" && (
				<TexturedWall
					id="elevator_shaft"
					position={new Vector3(2, -1, 0)}
					size={{ width: 3, height: 10, depth: 3 }}
					textureType="metal_clean"
				/>
			)}
		</TestHarness>
	);
}

// Mount the app
const root = createRoot(document.getElementById("root")!);
root.render(<RailPathTestScene />);
