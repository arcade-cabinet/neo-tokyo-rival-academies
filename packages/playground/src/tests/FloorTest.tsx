/**
 * FloorTest - Test floor/rooftop surface component
 *
 * Testing:
 * - Different surface types (concrete, metal, tile, etc)
 * - Edge trim variations
 * - Texture tiling
 * - Arrangement with walls (rooftop scene)
 */

import { Color3, Vector3 } from "@babylonjs/core";
import { useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { TestHarness } from "../TestHarness";
import { Floor, type FloorSurface, FLOOR_PRESETS } from "../components/Floor";
import { TexturedWall } from "../components/TexturedWall";
import { Water } from "../components/Water";

function FloorTestScene() {
	const [seed, setSeed] = useState("floor-001");
	const [surface, setSurface] = useState<FloorSurface>("concrete");
	const [showEdge, setShowEdge] = useState(true);
	const [floorSize, setFloorSize] = useState(12);

	const handleSeedChange = useCallback((newSeed: string) => {
		setSeed(newSeed);
	}, []);

	const surfaceOptions: FloorSurface[] = [
		"concrete",
		"gravel",
		"metal_grating",
		"tile",
		"wood",
		"membrane",
		"solar",
	];

	const controls = (
		<div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
			<div>
				<label style={{ fontSize: "0.7rem", display: "block", marginBottom: "0.25rem" }}>
					SURFACE TYPE:
				</label>
				<select
					value={surface}
					onChange={(e) => setSurface(e.target.value as FloorSurface)}
					style={{
						width: "100%",
						padding: "0.25rem",
						background: "#1a1a2e",
						border: "1px solid #00ff88",
						color: "#00ff88",
						fontSize: "0.7rem",
					}}
				>
					{surfaceOptions.map((s) => (
						<option key={s} value={s}>
							{s.replace(/_/g, " ")}
						</option>
					))}
				</select>
			</div>

			<div>
				<label style={{ fontSize: "0.7rem", display: "block", marginBottom: "0.25rem" }}>
					SIZE: {floorSize}m x {floorSize}m
				</label>
				<input
					type="range"
					min="6"
					max="24"
					step="2"
					value={floorSize}
					onChange={(e) => setFloorSize(Number(e.target.value))}
					style={{ width: "100%" }}
				/>
			</div>

			<label style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.7rem", marginTop: "0.5rem" }}>
				<input
					type="checkbox"
					checked={showEdge}
					onChange={(e) => setShowEdge(e.target.checked)}
				/>
				Show Edge Trim
			</label>

			<div style={{ fontSize: "0.65rem", marginTop: "1rem", color: "#00aaff" }}>
				<p>FLOOR TYPES:</p>
				<ul style={{ paddingLeft: "1rem", marginTop: "0.25rem" }}>
					<li>concrete - standard rooftop</li>
					<li>metal_grating - industrial</li>
					<li>membrane - modern waterproof</li>
					<li>solar - panel arrays</li>
				</ul>
			</div>

			<div style={{ fontSize: "0.65rem", marginTop: "1rem", color: "#ff0088" }}>
				<p>TESTS:</p>
				<ul style={{ paddingLeft: "1rem", marginTop: "0.25rem" }}>
					<li>☐ Surface material correct</li>
					<li>☐ Edge trim visible</li>
					<li>☐ Proper height alignment</li>
					<li>☐ Sits above water level</li>
				</ul>
			</div>
		</div>
	);

	return (
		<TestHarness
			title="// FLOOR / ROOFTOP"
			description="Rooftop and floor surfaces. In flooded city, rooftops are the new ground level."
			onSeedChange={handleSeedChange}
			initialSeed={seed}
			cameraDistance={25}
			cameraTarget={new Vector3(0, 3, 0)}
			controls={controls}
		>
			{/* Water below - the flooded streets */}
			<Water
				id="flooded_street"
				position={new Vector3(0, -2, 0)}
				size={{ width: 50, depth: 50 }}
				color={new Color3(0.02, 0.08, 0.15)}
				opacity={0.9}
				reflectivity={0.6}
				depth={10}
			/>

			{/* Main rooftop (adjustable) */}
			<Floor
				id="main_rooftop"
				position={new Vector3(0, 2, 0)}
				size={{ width: floorSize, depth: floorSize }}
				surface={surface}
				edgeTrim={showEdge}
				edgeColor={new Color3(0.1, 0.1, 0.12)}
				uvScale={{ u: 0.5, v: 0.5 }}
			/>

			{/* Building walls rising from water */}
			<TexturedWall
				id="building_wall_1"
				position={new Vector3(-floorSize / 2 - 0.15, -2, 0)}
				size={{ width: 0.3, height: 6, depth: floorSize }}
				textureType="concrete_dirty"
				rotation={0}
			/>
			<TexturedWall
				id="building_wall_2"
				position={new Vector3(floorSize / 2 + 0.15, -2, 0)}
				size={{ width: 0.3, height: 6, depth: floorSize }}
				textureType="concrete_dirty"
				rotation={0}
			/>
			<TexturedWall
				id="building_wall_3"
				position={new Vector3(0, -2, -floorSize / 2 - 0.15)}
				size={{ width: floorSize, height: 6, depth: 0.3 }}
				textureType="concrete_dirty"
			/>

			{/* Adjacent smaller rooftop - shows connection opportunities */}
			<Floor
				id="adjacent_rooftop"
				position={new Vector3(floorSize / 2 + 6, 1, 0)}
				size={{ width: 6, depth: 8 }}
				surface="metal_grating"
				edgeTrim={false}
			/>

			{/* Lower rooftop - shows verticality */}
			<Floor
				id="lower_rooftop"
				position={new Vector3(-floorSize / 2 - 5, 0, -4)}
				size={{ width: 5, depth: 6 }}
				surface="membrane"
				edgeTrim={true}
				edgeColor={new Color3(0.05, 0.05, 0.08)}
			/>

			{/* Rooftop structures - AC unit placeholder */}
			<TexturedWall
				id="ac_unit"
				position={new Vector3(floorSize / 4, 2.2, floorSize / 4)}
				size={{ width: 2, height: 1.5, depth: 1.5 }}
				textureType="metal_clean"
			/>

			{/* Neon on parapet */}
			<TexturedWall
				id="parapet"
				position={new Vector3(0, 2.2, floorSize / 2 + 0.4)}
				size={{ width: floorSize * 0.8, height: 1.2, depth: 0.2 }}
				textureType="concrete_clean"
				neonAccent={new Color3(0, 1, 0.5)}
			/>
		</TestHarness>
	);
}

// Mount the app
const root = createRoot(document.getElementById("root")!);
root.render(<FloorTestScene />);
