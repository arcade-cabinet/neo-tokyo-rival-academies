/**
 * FargroundTest - Test distant skyline component
 *
 * Testing:
 * - Skyline generation
 * - Atmospheric haze/fog
 * - Distant neon glows
 * - Different density presets
 * - Seed-based determinism
 */

import { Color3, Vector3 } from "@babylonjs/core";
import { useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { TestHarness } from "../TestHarness";
import { Farground, FARGROUND_PRESETS } from "../components/Farground";
import { Water } from "../components/Water";
import { Floor } from "../components/Floor";
import { TexturedWall } from "../components/TexturedWall";
import { NeonSign } from "../components/NeonSign";

type PresetKey = keyof typeof FARGROUND_PRESETS;

function FargroundTestScene() {
	const [seed, setSeed] = useState("farground-001");
	const [preset, setPreset] = useState<PresetKey>("downtown");
	const [distance, setDistance] = useState(100);
	const [density, setDensity] = useState(8);
	const [showNeon, setShowNeon] = useState(true);

	const handleSeedChange = useCallback((newSeed: string) => {
		setSeed(newSeed);
	}, []);

	// Convert seed string to number
	const seedNumber = Array.from(seed).reduce((acc, char) => acc + char.charCodeAt(0), 0);

	const presetConfig = FARGROUND_PRESETS[preset];

	const controls = (
		<div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
			<div>
				<label style={{ fontSize: "0.7rem", display: "block", marginBottom: "0.25rem" }}>
					PRESET:
				</label>
				<select
					value={preset}
					onChange={(e) => setPreset(e.target.value as PresetKey)}
					style={{
						width: "100%",
						padding: "0.25rem",
						background: "#1a1a2e",
						border: "1px solid #00ff88",
						color: "#00ff88",
						fontSize: "0.7rem",
					}}
				>
					<option value="downtown">Downtown (Dense)</option>
					<option value="industrial">Industrial</option>
					<option value="outskirts">Outskirts (Sparse)</option>
				</select>
			</div>

			<div>
				<label style={{ fontSize: "0.7rem", display: "block", marginBottom: "0.25rem" }}>
					DISTANCE: {distance}m
				</label>
				<input
					type="range"
					min="50"
					max="200"
					step="10"
					value={distance}
					onChange={(e) => setDistance(Number(e.target.value))}
					style={{ width: "100%" }}
				/>
			</div>

			<div>
				<label style={{ fontSize: "0.7rem", display: "block", marginBottom: "0.25rem" }}>
					DENSITY: {density}
				</label>
				<input
					type="range"
					min="2"
					max="15"
					step="1"
					value={density}
					onChange={(e) => setDensity(Number(e.target.value))}
					style={{ width: "100%" }}
				/>
			</div>

			<label style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.7rem" }}>
				<input
					type="checkbox"
					checked={showNeon}
					onChange={(e) => setShowNeon(e.target.checked)}
				/>
				Distant Neon Lights
			</label>

			<div style={{ fontSize: "0.65rem", marginTop: "1rem", color: "#00aaff" }}>
				<p>FARGROUND USES:</p>
				<ul style={{ paddingLeft: "1rem", marginTop: "0.25rem" }}>
					<li>Visual depth without complexity</li>
					<li>Atmospheric haze layers</li>
					<li>Silhouette buildings</li>
					<li>Distant neon hints</li>
				</ul>
			</div>

			<div style={{ fontSize: "0.65rem", marginTop: "1rem", color: "#ff0088" }}>
				<p>TESTS:</p>
				<ul style={{ paddingLeft: "1rem", marginTop: "0.25rem" }}>
					<li>☐ Skyline visible in distance</li>
					<li>☐ Haze creates depth</li>
					<li>☐ Neon glows bloom</li>
					<li>☐ Seed changes layout</li>
				</ul>
			</div>
		</div>
	);

	return (
		<TestHarness
			title="// FARGROUND"
			description="Distant city skyline for depth and atmosphere. Not interactive, purely visual."
			onSeedChange={handleSeedChange}
			initialSeed={seed}
			cameraDistance={30}
			cameraTarget={new Vector3(0, 8, 0)}
			controls={controls}
		>
			{/* Water - flooded city */}
			<Water
				id="water"
				position={new Vector3(0, -1, 0)}
				size={{ width: 300, depth: 300 }}
				color={new Color3(0.02, 0.05, 0.1)}
				opacity={0.95}
				reflectivity={0.5}
				depth={15}
			/>

			{/* Foreground rooftop - viewing platform */}
			<Floor
				id="viewpoint"
				position={new Vector3(0, 2, 0)}
				size={{ width: 15, depth: 10 }}
				surface="concrete"
				edgeTrim={true}
			/>

			{/* Parapet with neon */}
			<TexturedWall
				id="parapet"
				position={new Vector3(0, 2.2, 5)}
				size={{ width: 15, height: 1.2, depth: 0.2 }}
				textureType="concrete_dirty"
				neonAccent={new Color3(0, 1, 0.5)}
			/>

			{/* Nearby buildings (middleground) */}
			<TexturedWall
				id="mid_building_1"
				position={new Vector3(-20, -1, 30)}
				size={{ width: 8, height: 20, depth: 6 }}
				textureType="concrete_dirty"
				neonAccent={new Color3(1, 0, 0.5)}
			/>

			<TexturedWall
				id="mid_building_2"
				position={new Vector3(25, -1, 40)}
				size={{ width: 10, height: 25, depth: 8 }}
				textureType="brick_grey"
				neonAccent={new Color3(0, 0.5, 1)}
			/>

			<TexturedWall
				id="mid_building_3"
				position={new Vector3(5, -1, 25)}
				size={{ width: 6, height: 15, depth: 5 }}
				textureType="metal_rusted"
				neonAccent={new Color3(1, 0.5, 0)}
			/>

			{/* Neon signs on middleground */}
			<NeonSign
				id="sign_1"
				position={new Vector3(-20, 12, 27)}
				color={new Color3(1, 0, 0.5)}
				shape="rectangle"
				size={{ width: 3, height: 2 }}
				mount="wall"
			/>

			<NeonSign
				id="sign_2"
				position={new Vector3(25, 15, 36)}
				color={new Color3(0, 1, 0.8)}
				shape="circle"
				size={{ width: 2, height: 2 }}
				mount="wall"
			/>

			{/* THE FARGROUND - distant skyline */}
			<Farground
				id="skyline"
				position={new Vector3(0, 0, 0)}
				width={250}
				distance={distance}
				density={density}
				atmosphereColor={presetConfig.atmosphereColor}
				buildingColor={presetConfig.buildingColor}
				distantNeon={showNeon}
				seed={seedNumber}
			/>
		</TestHarness>
	);
}

// Mount the app
const root = createRoot(document.getElementById("root")!);
root.render(<FargroundTestScene />);
