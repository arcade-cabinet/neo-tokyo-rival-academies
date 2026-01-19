/**
 * BuildingTest - Test compound building assembly
 *
 * Testing:
 * - Different building styles
 * - Variable floor counts
 * - Neon sign placement
 * - Rooftop structures
 * - Window patterns
 */

import { Color3, Vector3 } from "@babylonjs/core";
import { useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { TestHarness } from "../TestHarness";
import { Building, BUILDING_PRESETS, type BuildingStyle } from "../compounds/Building";
import { Water } from "../components/Water";
import { Floor } from "../components/Floor";

function BuildingTestScene() {
	const [seed, setSeed] = useState("building-001");
	const [style, setStyle] = useState<BuildingStyle>("commercial");
	const [floors, setFloors] = useState(4);
	const [width, setWidth] = useState(10);
	const [depth, setDepth] = useState(8);

	const handleSeedChange = useCallback((newSeed: string) => {
		setSeed(newSeed);
	}, []);

	const seedNumber = Array.from(seed).reduce(
		(acc, char) => acc + char.charCodeAt(0),
		0,
	);

	const styleOptions: BuildingStyle[] = ["residential", "commercial", "industrial", "office"];

	const controls = (
		<div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
			<div>
				<label
					style={{
						fontSize: "0.7rem",
						display: "block",
						marginBottom: "0.25rem",
					}}
				>
					STYLE:
				</label>
				<select
					value={style}
					onChange={(e) => setStyle(e.target.value as BuildingStyle)}
					style={{
						width: "100%",
						padding: "0.25rem",
						background: "#1a1a2e",
						border: "1px solid #00ff88",
						color: "#00ff88",
						fontSize: "0.7rem",
					}}
				>
					{styleOptions.map((s) => (
						<option key={s} value={s}>
							{s}
						</option>
					))}
				</select>
			</div>

			<div>
				<label
					style={{
						fontSize: "0.7rem",
						display: "block",
						marginBottom: "0.25rem",
					}}
				>
					FLOORS: {floors}
				</label>
				<input
					type="range"
					min="1"
					max="12"
					step="1"
					value={floors}
					onChange={(e) => setFloors(Number(e.target.value))}
					style={{ width: "100%" }}
				/>
			</div>

			<div>
				<label
					style={{
						fontSize: "0.7rem",
						display: "block",
						marginBottom: "0.25rem",
					}}
				>
					WIDTH: {width}m
				</label>
				<input
					type="range"
					min="5"
					max="20"
					step="1"
					value={width}
					onChange={(e) => setWidth(Number(e.target.value))}
					style={{ width: "100%" }}
				/>
			</div>

			<div>
				<label
					style={{
						fontSize: "0.7rem",
						display: "block",
						marginBottom: "0.25rem",
					}}
				>
					DEPTH: {depth}m
				</label>
				<input
					type="range"
					min="5"
					max="20"
					step="1"
					value={depth}
					onChange={(e) => setDepth(Number(e.target.value))}
					style={{ width: "100%" }}
				/>
			</div>

			<div
				style={{
					fontSize: "0.65rem",
					marginTop: "1rem",
					color: "#00aaff",
				}}
			>
				<p>COMPOUND USES:</p>
				<ul style={{ paddingLeft: "1rem", marginTop: "0.25rem" }}>
					<li>TexturedWall (4x)</li>
					<li>Floor (rooftop)</li>
					<li>Roof (structure)</li>
					<li>NeonSign (windows + signs)</li>
				</ul>
			</div>

			<div
				style={{
					fontSize: "0.65rem",
					marginTop: "1rem",
					color: "#ff0088",
				}}
			>
				<p>TESTS:</p>
				<ul style={{ paddingLeft: "1rem", marginTop: "0.25rem" }}>
					<li>☐ Walls form enclosure</li>
					<li>☐ Rooftop at correct height</li>
					<li>☐ Windows illuminate</li>
					<li>☐ Style changes texture</li>
				</ul>
			</div>
		</div>
	);

	return (
		<TestHarness
			title="// BUILDING"
			description="Compound component: walls + floor + roof + signage assembled into a complete building."
			onSeedChange={handleSeedChange}
			initialSeed={seed}
			cameraDistance={35}
			cameraTarget={new Vector3(0, floors * 1.5, 0)}
			controls={controls}
		>
			{/* Water below */}
			<Water
				id="water"
				position={new Vector3(0, -3, 0)}
				size={{ width: 80, depth: 80 }}
				color={new Color3(0.02, 0.05, 0.1)}
				opacity={0.9}
				reflectivity={0.6}
				depth={15}
			/>

			{/* Main adjustable building */}
			<Building
				id="main"
				position={new Vector3(0, 0, 0)}
				footprint={{ width, depth }}
				floors={floors}
				style={style}
				seed={seedNumber}
				signs={[
					{
						position: "front",
						shape: "rectangle",
						color: new Color3(1, 0, 0.5),
						floor: -1,
					},
				]}
			/>

			{/* Ground level platform */}
			<Floor
				id="ground"
				position={new Vector3(0, 0, 0)}
				size={{ width: 30, depth: 30 }}
				surface="concrete"
			/>

			{/* Preset buildings for comparison */}
			<Building
				id="shop"
				position={new Vector3(-20, 0, 0)}
				{...BUILDING_PRESETS.shop}
				seed={seedNumber + 100}
			/>

			<Building
				id="apartment"
				position={new Vector3(20, 0, -5)}
				{...BUILDING_PRESETS.apartment_tall}
				seed={seedNumber + 200}
			/>

			<Building
				id="warehouse"
				position={new Vector3(0, 0, -25)}
				{...BUILDING_PRESETS.warehouse}
				seed={seedNumber + 300}
			/>

			<Building
				id="office"
				position={new Vector3(-25, 0, -20)}
				{...BUILDING_PRESETS.office_tower}
				seed={seedNumber + 400}
			/>
		</TestHarness>
	);
}

// Mount the app
const root = createRoot(document.getElementById("root")!);
root.render(<BuildingTestScene />);
