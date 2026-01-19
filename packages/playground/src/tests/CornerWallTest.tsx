/**
 * CornerWallTest - Test two walls arranged at 90° angle
 *
 * Testing:
 * - Wall-to-wall alignment (no gaps)
 * - Corner joint visibility
 * - UV continuity at corners
 * - Player perspective view (entering a room)
 * - Proper rotation handling
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

function CornerWallTestScene() {
	const [seed, setSeed] = useState("corner-001");
	const [selectedTexture, setSelectedTexture] = useState<WallTextureType>("concrete_dirty");
	const [wallHeight, setWallHeight] = useState(4);
	const [wallWidth, setWallWidth] = useState(6);
	const [wallDepth, setWallDepth] = useState(0.25);

	const handleSeedChange = useCallback((newSeed: string) => {
		setSeed(newSeed);
	}, []);

	const textureOptions = Object.keys(WALL_TEXTURES) as WallTextureType[];

	const controls = (
		<div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
			<div>
				<label style={{ fontSize: "0.7rem", display: "block", marginBottom: "0.25rem" }}>
					TEXTURE:
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

			<div>
				<label style={{ fontSize: "0.7rem", display: "block", marginBottom: "0.25rem" }}>
					HEIGHT: {wallHeight}m
				</label>
				<input
					type="range"
					min="2"
					max="10"
					step="0.5"
					value={wallHeight}
					onChange={(e) => setWallHeight(Number(e.target.value))}
					style={{ width: "100%" }}
				/>
			</div>

			<div>
				<label style={{ fontSize: "0.7rem", display: "block", marginBottom: "0.25rem" }}>
					WIDTH: {wallWidth}m
				</label>
				<input
					type="range"
					min="3"
					max="12"
					step="0.5"
					value={wallWidth}
					onChange={(e) => setWallWidth(Number(e.target.value))}
					style={{ width: "100%" }}
				/>
			</div>

			<div>
				<label style={{ fontSize: "0.7rem", display: "block", marginBottom: "0.25rem" }}>
					THICKNESS: {wallDepth}m
				</label>
				<input
					type="range"
					min="0.1"
					max="0.5"
					step="0.05"
					value={wallDepth}
					onChange={(e) => setWallDepth(Number(e.target.value))}
					style={{ width: "100%" }}
				/>
			</div>

			<div style={{ fontSize: "0.65rem", marginTop: "1rem", color: "#ff0088" }}>
				<p>TESTS:</p>
				<ul style={{ paddingLeft: "1rem", marginTop: "0.25rem" }}>
					<li>☐ No gap at corner joint</li>
					<li>☐ Textures align properly</li>
					<li>☐ Neon strips continuous</li>
					<li>☐ Player POV correct</li>
				</ul>
			</div>
		</div>
	);

	// Calculate corner joint - walls meet at 90 degrees
	// Wall A runs along X axis (East-West)
	// Wall B runs along Z axis (North-South)
	// They meet at the corner point

	const cornerX = 0;
	const cornerZ = 0;

	// Wall A: runs along X, positioned so its end meets the corner
	// Positioned at (cornerX + wallWidth/2, 0, cornerZ - wallDepth/2)
	const wallAPosition = new Vector3(
		cornerX + wallWidth / 2,
		0,
		cornerZ - wallDepth / 2
	);

	// Wall B: runs along Z, rotated 90 degrees
	// Positioned at (cornerX - wallDepth/2, 0, cornerZ - wallWidth/2)
	const wallBPosition = new Vector3(
		cornerX - wallDepth / 2,
		0,
		cornerZ - wallWidth / 2
	);

	return (
		<TestHarness
			title="// CORNER WALL TEST"
			description="Two walls at 90° angle - testing alignment, joints, and player perspective."
			onSeedChange={handleSeedChange}
			initialSeed={seed}
			cameraDistance={15}
			cameraTarget={new Vector3(wallWidth / 3, wallHeight / 2, -wallWidth / 3)}
			controls={controls}
		>
			{/* Wall A - along X axis (East-West) */}
			<TexturedWall
				id="corner_wall_a"
				position={wallAPosition}
				size={{ width: wallWidth, height: wallHeight, depth: wallDepth }}
				textureType={selectedTexture}
				uvScale={{ u: wallWidth / 2, v: wallHeight / 2 }}
				neonAccent={new Color3(0, 1, 0.5)}
			/>

			{/* Wall B - along Z axis (North-South), rotated 90° */}
			<TexturedWall
				id="corner_wall_b"
				position={wallBPosition}
				size={{ width: wallWidth, height: wallHeight, depth: wallDepth }}
				textureType={selectedTexture}
				rotation={Math.PI / 2}
				uvScale={{ u: wallWidth / 2, v: wallHeight / 2 }}
				neonAccent={new Color3(1, 0, 0.6)}
			/>

			{/* Additional corner accent - could be a pillar or trim piece */}
			<TexturedWall
				id="corner_pillar"
				position={new Vector3(cornerX - wallDepth / 2, 0, cornerZ - wallDepth / 2)}
				size={{ width: wallDepth * 2, height: wallHeight, depth: wallDepth * 2 }}
				textureType="metal_clean"
				neonAccent={new Color3(0, 0.5, 1)}
			/>
		</TestHarness>
	);
}

// Mount the app
const root = createRoot(document.getElementById("root")!);
root.render(<CornerWallTestScene />);
