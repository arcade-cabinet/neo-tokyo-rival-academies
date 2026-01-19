/**
 * RoomTest - Test interior room compound assembly
 *
 * Testing:
 * - Different room styles
 * - Variable dimensions
 * - Wall configurations (missing walls for doorways)
 * - Ceiling lighting
 * - Interior ambiance
 */

import { Color3, Vector3 } from "@babylonjs/core";
import { useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { TestHarness } from "../TestHarness";
import { Room, ROOM_PRESETS, type RoomStyle } from "../compounds/Room";
import { Water } from "../components/Water";

function RoomTestScene() {
	const [seed, setSeed] = useState("room-001");
	const [style, setStyle] = useState<RoomStyle>("residential");
	const [width, setWidth] = useState(8);
	const [depth, setDepth] = useState(6);
	const [height, setHeight] = useState(3);
	const [hasCeiling, setHasCeiling] = useState(true);
	const [wallNorth, setWallNorth] = useState(true);
	const [wallSouth, setWallSouth] = useState(true);
	const [wallEast, setWallEast] = useState(true);
	const [wallWest, setWallWest] = useState(true);
	const [ceilingLights, setCeilingLights] = useState(true);

	const handleSeedChange = useCallback((newSeed: string) => {
		setSeed(newSeed);
	}, []);

	const seedNumber = Array.from(seed).reduce(
		(acc, char) => acc + char.charCodeAt(0),
		0,
	);

	const styleOptions: RoomStyle[] = ["residential", "office", "industrial", "shop", "club"];

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
					onChange={(e) => setStyle(e.target.value as RoomStyle)}
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
					WIDTH: {width}m
				</label>
				<input
					type="range"
					min="4"
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
					min="4"
					max="20"
					step="1"
					value={depth}
					onChange={(e) => setDepth(Number(e.target.value))}
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
					HEIGHT: {height}m
				</label>
				<input
					type="range"
					min="2.5"
					max="8"
					step="0.5"
					value={height}
					onChange={(e) => setHeight(Number(e.target.value))}
					style={{ width: "100%" }}
				/>
			</div>

			<div style={{ fontSize: "0.7rem", marginTop: "0.5rem" }}>
				<p style={{ marginBottom: "0.25rem" }}>WALLS:</p>
				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.25rem" }}>
					<label style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
						<input
							type="checkbox"
							checked={wallNorth}
							onChange={(e) => setWallNorth(e.target.checked)}
						/>
						North
					</label>
					<label style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
						<input
							type="checkbox"
							checked={wallSouth}
							onChange={(e) => setWallSouth(e.target.checked)}
						/>
						South
					</label>
					<label style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
						<input
							type="checkbox"
							checked={wallEast}
							onChange={(e) => setWallEast(e.target.checked)}
						/>
						East
					</label>
					<label style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
						<input
							type="checkbox"
							checked={wallWest}
							onChange={(e) => setWallWest(e.target.checked)}
						/>
						West
					</label>
				</div>
			</div>

			<div style={{ display: "flex", gap: "1rem", marginTop: "0.5rem" }}>
				<label
					style={{
						fontSize: "0.7rem",
						display: "flex",
						alignItems: "center",
						gap: "0.5rem",
					}}
				>
					<input
						type="checkbox"
						checked={hasCeiling}
						onChange={(e) => setHasCeiling(e.target.checked)}
					/>
					CEILING
				</label>
				<label
					style={{
						fontSize: "0.7rem",
						display: "flex",
						alignItems: "center",
						gap: "0.5rem",
					}}
				>
					<input
						type="checkbox"
						checked={ceilingLights}
						onChange={(e) => setCeilingLights(e.target.checked)}
					/>
					LIGHTS
				</label>
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
					<li>Floor (floor + ceiling)</li>
					<li>TexturedWall (4x walls)</li>
					<li>NeonSign (lighting)</li>
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
					<li>☐ Missing walls = doorways</li>
					<li>☐ Ceiling lights work</li>
					<li>☐ Style changes textures</li>
				</ul>
			</div>
		</div>
	);

	return (
		<TestHarness
			title="// ROOM"
			description="Compound component: interior space with walls, floor, ceiling, and lighting."
			onSeedChange={handleSeedChange}
			initialSeed={seed}
			cameraDistance={25}
			cameraTarget={new Vector3(0, height / 2, 0)}
			controls={controls}
		>
			{/* Water below for context */}
			<Water
				id="water"
				position={new Vector3(0, -5, 0)}
				size={{ width: 100, depth: 100 }}
				color={new Color3(0.02, 0.05, 0.1)}
				opacity={0.9}
				reflectivity={0.6}
				depth={20}
			/>

			{/* Main adjustable room */}
			<Room
				id="main"
				position={new Vector3(0, 0, 0)}
				dimensions={{ width, depth, height }}
				style={style}
				hasCeiling={hasCeiling}
				walls={{
					north: wallNorth,
					south: wallSouth,
					east: wallEast,
					west: wallWest,
				}}
				ceilingLights={ceilingLights}
				seed={seedNumber}
			/>

			{/* Preset rooms for comparison */}
			<Room
				id="apartment"
				position={new Vector3(-15, 0, 0)}
				{...ROOM_PRESETS.small_apartment}
				seed={seedNumber + 100}
			/>

			<Room
				id="office"
				position={new Vector3(15, 0, 0)}
				{...ROOM_PRESETS.large_office}
				seed={seedNumber + 200}
			/>

			<Room
				id="warehouse"
				position={new Vector3(0, 0, -25)}
				{...ROOM_PRESETS.warehouse_section}
				seed={seedNumber + 300}
			/>

			<Room
				id="shop"
				position={new Vector3(-20, 0, -20)}
				{...ROOM_PRESETS.corner_shop}
				seed={seedNumber + 400}
			/>

			<Room
				id="club"
				position={new Vector3(20, 0, -20)}
				{...ROOM_PRESETS.nightclub}
				accentColor={new Color3(1, 0, 0.5)}
				seed={seedNumber + 500}
			/>
		</TestHarness>
	);
}

// Mount the app
const root = createRoot(document.getElementById("root")!);
root.render(<RoomTestScene />);
