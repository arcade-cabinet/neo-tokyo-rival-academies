/**
 * WaterTest - Test water surface component
 *
 * Testing:
 * - Different water presets (flooded, puddle, pool, polluted)
 * - Reflectivity levels
 * - Transparency/opacity
 * - Color variations
 * - Interaction with lighting (neon reflections)
 */

import { Color3, Vector3 } from "@babylonjs/core";
import { useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { TestHarness } from "../TestHarness";
import { Water, WATER_PRESETS, type WaterPreset } from "../components/Water";
import { TexturedWall } from "../components/TexturedWall";

function WaterTestScene() {
	const [seed, setSeed] = useState("water-001");
	const [selectedPreset, setSelectedPreset] = useState<WaterPreset>("flooded_street");
	const [waterSize, setWaterSize] = useState(30);
	const [opacity, setOpacity] = useState(0.85);

	const handleSeedChange = useCallback((newSeed: string) => {
		setSeed(newSeed);
	}, []);

	const presetOptions = Object.keys(WATER_PRESETS) as WaterPreset[];
	const preset = WATER_PRESETS[selectedPreset];

	const controls = (
		<div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
			<div>
				<label style={{ fontSize: "0.7rem", display: "block", marginBottom: "0.25rem" }}>
					WATER TYPE:
				</label>
				<select
					value={selectedPreset}
					onChange={(e) => setSelectedPreset(e.target.value as WaterPreset)}
					style={{
						width: "100%",
						padding: "0.25rem",
						background: "#1a1a2e",
						border: "1px solid #00ff88",
						color: "#00ff88",
						fontSize: "0.7rem",
					}}
				>
					{presetOptions.map((p) => (
						<option key={p} value={p}>
							{p.replace(/_/g, " ")}
						</option>
					))}
				</select>
			</div>

			<div>
				<label style={{ fontSize: "0.7rem", display: "block", marginBottom: "0.25rem" }}>
					SIZE: {waterSize}m
				</label>
				<input
					type="range"
					min="10"
					max="100"
					step="5"
					value={waterSize}
					onChange={(e) => setWaterSize(Number(e.target.value))}
					style={{ width: "100%" }}
				/>
			</div>

			<div>
				<label style={{ fontSize: "0.7rem", display: "block", marginBottom: "0.25rem" }}>
					OPACITY: {opacity.toFixed(2)}
				</label>
				<input
					type="range"
					min="0.3"
					max="1"
					step="0.05"
					value={opacity}
					onChange={(e) => setOpacity(Number(e.target.value))}
					style={{ width: "100%" }}
				/>
			</div>

			<div style={{ fontSize: "0.65rem", marginTop: "1rem", color: "#00aaff" }}>
				<p>WATER PRESETS:</p>
				<ul style={{ paddingLeft: "1rem", marginTop: "0.25rem" }}>
					<li>flooded_street - deep, murky</li>
					<li>puddle - shallow, reflective</li>
					<li>pool - clean rooftop</li>
					<li>polluted - industrial waste</li>
					<li>neon_night - dark, reflective</li>
				</ul>
			</div>

			<div style={{ fontSize: "0.65rem", marginTop: "1rem", color: "#ff0088" }}>
				<p>TESTS:</p>
				<ul style={{ paddingLeft: "1rem", marginTop: "0.25rem" }}>
					<li>☐ Neon reflects on surface</li>
					<li>☐ Depth affects color</li>
					<li>☐ Transparency visible</li>
					<li>☐ Looks "wet" not solid</li>
				</ul>
			</div>
		</div>
	);

	return (
		<TestHarness
			title="// WATER SURFACE"
			description="Reflective water plane for flooded Neo-Tokyo. Tests presets, reflections, transparency."
			onSeedChange={handleSeedChange}
			initialSeed={seed}
			cameraDistance={25}
			cameraTarget={new Vector3(0, 2, 0)}
			controls={controls}
		>
			{/* Main water surface */}
			<Water
				id="main"
				position={new Vector3(0, -0.5, 0)}
				size={{ width: waterSize, depth: waterSize }}
				color={preset.color}
				opacity={opacity}
				reflectivity={preset.reflectivity}
				depth={preset.depth}
			/>

			{/* Buildings rising from the water - to test reflections */}
			<TexturedWall
				id="building_1"
				position={new Vector3(-8, -0.5, -5)}
				size={{ width: 5, height: 12, depth: 4 }}
				textureType="concrete_dirty"
				uvScale={{ u: 2, v: 4 }}
				neonAccent={new Color3(1, 0, 0.5)}
			/>

			<TexturedWall
				id="building_2"
				position={new Vector3(6, -0.5, -8)}
				size={{ width: 4, height: 8, depth: 3 }}
				textureType="metal_rusted"
				uvScale={{ u: 1.5, v: 3 }}
				neonAccent={new Color3(0, 1, 0.5)}
			/>

			<TexturedWall
				id="building_3"
				position={new Vector3(0, -0.5, 8)}
				size={{ width: 6, height: 10, depth: 5 }}
				textureType="brick_grey"
				uvScale={{ u: 2, v: 3 }}
				neonAccent={new Color3(0, 0.5, 1)}
			/>

			{/* Small platform/rooftop above water - player standing area */}
			<TexturedWall
				id="platform"
				position={new Vector3(0, 1, 0)}
				size={{ width: 4, height: 0.3, depth: 4 }}
				textureType="metal_clean"
			/>
		</TestHarness>
	);
}

// Mount the app
const root = createRoot(document.getElementById("root")!);
root.render(<WaterTestScene />);
