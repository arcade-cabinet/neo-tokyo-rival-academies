/**
 * TexturedWallTest - Test page for walls with real AmbientCG textures
 *
 * Shows walls with:
 * - Different concrete textures
 * - Different brick textures
 * - Different metal textures
 * - Rust variations
 */

import { Color3, Vector3 } from "@babylonjs/core";
import { useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { TestHarness } from "../TestHarness";
import {
	TexturedWall,
	WALL_TEXTURES,
	type WallTextureType,
} from "../components/TexturedWall";

function TexturedWallTestScene() {
	const [seed, setSeed] = useState("textured-wall-001");
	const [selectedTexture, setSelectedTexture] = useState<WallTextureType>("concrete_clean");

	const handleSeedChange = useCallback((newSeed: string) => {
		setSeed(newSeed);
	}, []);

	const textureOptions = Object.keys(WALL_TEXTURES) as WallTextureType[];

	const controls = (
		<div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
			<div>
				<label style={{ fontSize: "0.7rem", display: "block", marginBottom: "0.25rem" }}>
					MAIN TEXTURE:
				</label>
				<select
					value={selectedTexture}
					onChange={(e) => setSelectedTexture(e.target.value as WallTextureType)}
					style={{
						width: "100%",
						padding: "0.25rem",
						background: "#1a1a2e",
						border: "1px solid #00ff88",
						color: "#00ff88",
						fontSize: "0.7rem",
					}}
				>
					{textureOptions.map((tex) => (
						<option key={tex} value={tex}>
							{tex.replace(/_/g, " ")}
						</option>
					))}
				</select>
			</div>

			<div style={{ fontSize: "0.65rem", opacity: 0.7, marginTop: "1rem" }}>
				<p>PBR textures from AmbientCG:</p>
				<ul style={{ paddingLeft: "1rem", marginTop: "0.25rem" }}>
					<li>Color map</li>
					<li>Normal map</li>
					<li>Roughness map</li>
					<li>Displacement (TBD)</li>
				</ul>
			</div>

			<div style={{ fontSize: "0.65rem", marginTop: "1rem", color: "#ff0088" }}>
				<p>Post-processing:</p>
				<ul style={{ paddingLeft: "1rem", marginTop: "0.25rem" }}>
					<li>Bloom (neon glow)</li>
					<li>ACES tone mapping</li>
					<li>Chromatic aberration</li>
					<li>Vignette</li>
				</ul>
			</div>
		</div>
	);

	return (
		<TestHarness
			title="// TEXTURED WALL"
			description="Walls using real AmbientCG PBR textures with cyberpunk lighting and bloom."
			onSeedChange={handleSeedChange}
			initialSeed={seed}
			cameraDistance={20}
			controls={controls}
		>
			{/* Main wall with selected texture - center stage */}
			<TexturedWall
				id="main"
				position={new Vector3(0, 0, 0)}
				size={{ width: 6, height: 8, depth: 0.3 }}
				textureType={selectedTexture}
				uvScale={{ u: 2, v: 3 }}
				neonAccent={new Color3(0, 1, 0.5)}
			/>

			{/* Concrete row - left side */}
			<TexturedWall
				id="concrete_clean"
				position={new Vector3(-8, 0, 0)}
				size={{ width: 4, height: 6, depth: 0.25 }}
				textureType="concrete_clean"
				uvScale={{ u: 1.5, v: 2 }}
			/>
			<TexturedWall
				id="concrete_dirty"
				position={new Vector3(-8, 0, -5)}
				size={{ width: 4, height: 6, depth: 0.25 }}
				textureType="concrete_dirty"
				uvScale={{ u: 1.5, v: 2 }}
			/>

			{/* Brick row - right side */}
			<TexturedWall
				id="brick_red"
				position={new Vector3(8, 0, 0)}
				size={{ width: 4, height: 6, depth: 0.25 }}
				textureType="brick_red"
				uvScale={{ u: 2, v: 3 }}
				neonAccent={new Color3(1, 0.2, 0.1)}
			/>
			<TexturedWall
				id="brick_grey"
				position={new Vector3(8, 0, -5)}
				size={{ width: 4, height: 6, depth: 0.25 }}
				textureType="brick_grey"
				uvScale={{ u: 2, v: 3 }}
			/>

			{/* Metal row - back */}
			<TexturedWall
				id="metal_clean"
				position={new Vector3(0, 0, -10)}
				size={{ width: 4, height: 6, depth: 0.25 }}
				textureType="metal_clean"
				uvScale={{ u: 2, v: 2 }}
				neonAccent={new Color3(1, 0, 0.6)}
			/>
			<TexturedWall
				id="metal_rusted"
				position={new Vector3(-5, 0, -10)}
				size={{ width: 4, height: 6, depth: 0.25 }}
				textureType="metal_rusted"
				uvScale={{ u: 2, v: 2 }}
				neonAccent={new Color3(0, 0.5, 1)}
			/>
		</TestHarness>
	);
}

// Mount the app
const root = createRoot(document.getElementById("root")!);
root.render(<TexturedWallTestScene />);
