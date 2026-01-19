/**
 * NeonTest - Test neon sign components
 *
 * FACTION CONTEXT (v2.0 Flooded World):
 * Neon signs are salvaged pre-flood luxury items. Running them requires
 * hoarded power (solar panels, generators, fuel) - a display of wealth
 * that in this world means CRIME. Syndicate territory markers.
 *
 * This test validates the neon component works correctly for placement
 * in Syndicate-controlled areas, gambling barges, and black markets.
 *
 * Testing:
 * - Different shapes (rectangle, circle, arrow, bar)
 * - Mount types (wall, pole, hanging)
 * - Color combinations (Syndicate = magenta/cyan)
 * - Bloom/glow effect
 * - Water reflections (key for flooded aesthetic)
 *
 * See: docs/MODULAR_ASSEMBLY_SYSTEM.md
 * GitHub Issue: #64
 */

import { Color3, Vector3 } from "@babylonjs/core";
import { useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { TestHarness } from "../TestHarness";
import { NeonSign, type NeonShape, type NeonMountType, NEON_PRESETS } from "../components";
import { TexturedWall } from "../components";
import { Water } from "../components";

function NeonTestScene() {
	const [seed, setSeed] = useState("neon-001");
	const [shape, setShape] = useState<NeonShape>("rectangle");
	const [mount, setMount] = useState<NeonMountType>("wall");
	const [primaryColor, setPrimaryColor] = useState("#ff0066");
	const [intensity, setIntensity] = useState(3);

	const handleSeedChange = useCallback((newSeed: string) => {
		setSeed(newSeed);
	}, []);

	const hexToColor3 = (hex: string): Color3 => {
		const r = parseInt(hex.slice(1, 3), 16) / 255;
		const g = parseInt(hex.slice(3, 5), 16) / 255;
		const b = parseInt(hex.slice(5, 7), 16) / 255;
		return new Color3(r, g, b);
	};

	const shapeOptions: NeonShape[] = ["rectangle", "circle", "arrow", "bar"];
	const mountOptions: NeonMountType[] = ["wall", "pole", "hanging", "ground"];

	const controls = (
		<div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
			<div>
				<label style={{ fontSize: "0.7rem", display: "block", marginBottom: "0.25rem" }}>
					SHAPE:
				</label>
				<select
					value={shape}
					onChange={(e) => setShape(e.target.value as NeonShape)}
					style={{
						width: "100%",
						padding: "0.25rem",
						background: "#1a1a2e",
						border: "1px solid #00ff88",
						color: "#00ff88",
						fontSize: "0.7rem",
					}}
				>
					{shapeOptions.map((s) => (
						<option key={s} value={s}>{s}</option>
					))}
				</select>
			</div>

			<div>
				<label style={{ fontSize: "0.7rem", display: "block", marginBottom: "0.25rem" }}>
					MOUNT:
				</label>
				<select
					value={mount}
					onChange={(e) => setMount(e.target.value as NeonMountType)}
					style={{
						width: "100%",
						padding: "0.25rem",
						background: "#1a1a2e",
						border: "1px solid #00ff88",
						color: "#00ff88",
						fontSize: "0.7rem",
					}}
				>
					{mountOptions.map((m) => (
						<option key={m} value={m}>{m}</option>
					))}
				</select>
			</div>

			<div>
				<label style={{ fontSize: "0.7rem", display: "block", marginBottom: "0.25rem" }}>
					COLOR:
				</label>
				<input
					type="color"
					value={primaryColor}
					onChange={(e) => setPrimaryColor(e.target.value)}
					style={{ width: "100%", height: "2rem" }}
				/>
			</div>

			<div>
				<label style={{ fontSize: "0.7rem", display: "block", marginBottom: "0.25rem" }}>
					INTENSITY: {intensity}
				</label>
				<input
					type="range"
					min="1"
					max="5"
					step="0.5"
					value={intensity}
					onChange={(e) => setIntensity(Number(e.target.value))}
					style={{ width: "100%" }}
				/>
			</div>

			<div style={{ fontSize: "0.65rem", marginTop: "1rem", color: "#ff0088" }}>
				<p>TESTS:</p>
				<ul style={{ paddingLeft: "1rem", marginTop: "0.25rem" }}>
					<li>☐ Neon glows with bloom</li>
					<li>☐ Shape renders correctly</li>
					<li>☐ Mount structure visible</li>
					<li>☐ Reflects on water</li>
				</ul>
			</div>
		</div>
	);

	return (
		<TestHarness
			title="// NEON SIGNS"
			description="Glowing signage for cyberpunk aesthetic. Tests shapes, mounts, colors, bloom."
			onSeedChange={handleSeedChange}
			initialSeed={seed}
			cameraDistance={20}
			cameraTarget={new Vector3(0, 3, 0)}
			controls={controls}
		>
			{/* Water for reflections */}
			<Water
				id="water"
				position={new Vector3(0, -1, 0)}
				size={{ width: 40, depth: 40 }}
				color={new Color3(0.02, 0.06, 0.1)}
				opacity={0.9}
				reflectivity={0.8}
				depth={8}
			/>

			{/* Main adjustable sign */}
			<NeonSign
				id="main"
				position={new Vector3(0, 4, -5)}
				color={hexToColor3(primaryColor)}
				shape={shape}
				size={{ width: 3, height: 2 }}
				mount={mount}
				intensity={intensity}
				secondaryColor={new Color3(0, 1, 0.8)}
			/>

			{/* Background building with wall-mounted signs */}
			<TexturedWall
				id="building_back"
				position={new Vector3(0, 0, -6)}
				size={{ width: 20, height: 12, depth: 0.5 }}
				textureType="concrete_dirty"
			/>

			{/* Preset signs showcase */}
			<NeonSign
				id="kanji"
				position={new Vector3(-6, 5, -5.5)}
				{...NEON_PRESETS.kanji_frame}
			/>

			<NeonSign
				id="direction"
				position={new Vector3(6, 3, -4)}
				{...NEON_PRESETS.direction}
			/>

			<NeonSign
				id="circle"
				position={new Vector3(-4, 7, -5.5)}
				{...NEON_PRESETS.open_circle}
			/>

			<NeonSign
				id="bar1"
				position={new Vector3(0, 8, -5.5)}
				{...NEON_PRESETS.accent_bar}
				color={new Color3(1, 0, 0.5)}
			/>

			<NeonSign
				id="bar2"
				position={new Vector3(0, 1, -5.5)}
				{...NEON_PRESETS.accent_bar}
				color={new Color3(0, 0.5, 1)}
			/>

			{/* Side buildings */}
			<TexturedWall
				id="building_left"
				position={new Vector3(-12, 0, 0)}
				size={{ width: 0.5, height: 10, depth: 8 }}
				textureType="brick_grey"
			/>

			<TexturedWall
				id="building_right"
				position={new Vector3(12, 0, 0)}
				size={{ width: 0.5, height: 8, depth: 6 }}
				textureType="metal_rusted"
			/>

			{/* More neon variety */}
			<NeonSign
				id="arrow_left"
				position={new Vector3(-11.5, 6, 0)}
				color={new Color3(1, 0.5, 0)}
				shape="arrow"
				size={{ width: 1.5, height: 0.8 }}
				rotation={Math.PI}
				mount="wall"
			/>

			<NeonSign
				id="circle_right"
				position={new Vector3(11.5, 5, 0)}
				color={new Color3(0, 1, 0.5)}
				shape="circle"
				size={{ width: 1.2, height: 1.2 }}
				mount="wall"
			/>
		</TestHarness>
	);
}

// Mount the app
const root = createRoot(document.getElementById("root")!);
root.render(<NeonTestScene />);
