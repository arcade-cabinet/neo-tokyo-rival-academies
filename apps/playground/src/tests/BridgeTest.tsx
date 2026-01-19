/**
 * BridgeTest - Test elevated walkway compound assembly
 *
 * Testing:
 * - Different bridge styles
 * - Variable widths and lengths
 * - Height differences (sloped bridges)
 * - Railings and lighting
 * - Support pylons
 */

import { Color3, Vector3 } from "@babylonjs/core";
import { useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { TestHarness } from "../TestHarness";
import { Bridge, BRIDGE_PRESETS, type BridgeStyle } from "../compounds/Bridge";
import { Building, BUILDING_PRESETS } from "../compounds/Building";
import { Water } from "../components";

function BridgeTestScene() {
	const [seed, setSeed] = useState("bridge-001");
	const [style, setStyle] = useState<BridgeStyle>("industrial");
	const [width, setWidth] = useState(2);
	const [railings, setRailings] = useState(true);
	const [edgeLighting, setEdgeLighting] = useState(true);
	const [supportCount, setSupportCount] = useState(0);
	const [heightDiff, setHeightDiff] = useState(0);

	const handleSeedChange = useCallback((newSeed: string) => {
		setSeed(newSeed);
	}, []);

	const seedNumber = Array.from(seed).reduce(
		(acc, char) => acc + char.charCodeAt(0),
		0,
	);

	const styleOptions: BridgeStyle[] = ["industrial", "modern", "makeshift", "glass"];

	// Bridge endpoints
	const startPos = new Vector3(-10, 8, 0);
	const endPos = new Vector3(10, 8 + heightDiff, 0);

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
					onChange={(e) => setStyle(e.target.value as BridgeStyle)}
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
					min="1"
					max="4"
					step="0.5"
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
					HEIGHT DIFF: {heightDiff}m
				</label>
				<input
					type="range"
					min="-5"
					max="5"
					step="1"
					value={heightDiff}
					onChange={(e) => setHeightDiff(Number(e.target.value))}
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
					SUPPORTS: {supportCount}
				</label>
				<input
					type="range"
					min="0"
					max="4"
					step="1"
					value={supportCount}
					onChange={(e) => setSupportCount(Number(e.target.value))}
					style={{ width: "100%" }}
				/>
			</div>

			<div>
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
						checked={railings}
						onChange={(e) => setRailings(e.target.checked)}
					/>
					RAILINGS
				</label>
			</div>

			<div>
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
						checked={edgeLighting}
						onChange={(e) => setEdgeLighting(e.target.checked)}
					/>
					EDGE LIGHTING
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
					<li>Floor (deck surface)</li>
					<li>TexturedWall (railings)</li>
					<li>TexturedWall (supports)</li>
					<li>NeonSign (edge lights)</li>
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
					<li>☐ Connects two points</li>
					<li>☐ Handles height diff</li>
					<li>☐ Railings follow deck</li>
					<li>☐ Supports reach ground</li>
				</ul>
			</div>
		</div>
	);

	return (
		<TestHarness
			title="// BRIDGE"
			description="Compound component: elevated walkway with deck, railings, supports, and lighting."
			onSeedChange={handleSeedChange}
			initialSeed={seed}
			cameraDistance={40}
			cameraTarget={new Vector3(0, 8, 0)}
			controls={controls}
		>
			{/* Water below */}
			<Water
				id="water"
				position={new Vector3(0, -5, 0)}
				size={{ width: 100, depth: 100 }}
				color={new Color3(0.02, 0.05, 0.1)}
				opacity={0.9}
				reflectivity={0.6}
				depth={20}
			/>

			{/* Main adjustable bridge */}
			<Bridge
				id="main"
				startPosition={startPos}
				endPosition={endPos}
				width={width}
				style={style}
				railings={railings}
				edgeLighting={edgeLighting}
				supportCount={supportCount}
				seed={seedNumber}
			/>

			{/* Left building (start platform) */}
			<Building
				id="left_building"
				position={new Vector3(-15, 0, 0)}
				footprint={{ width: 8, depth: 10 }}
				floors={3}
				style="commercial"
				seed={seedNumber + 100}
			/>

			{/* Right building (end platform) */}
			<Building
				id="right_building"
				position={new Vector3(15, 0, 0)}
				footprint={{ width: 8, depth: 10 }}
				floors={3 + Math.floor(heightDiff / 3)}
				style="commercial"
				seed={seedNumber + 200}
			/>

			{/* Preset bridges for comparison */}
			<Bridge
				id="catwalk"
				startPosition={new Vector3(-8, 6, -20)}
				endPosition={new Vector3(8, 6, -20)}
				{...BRIDGE_PRESETS.catwalk}
				seed={seedNumber + 300}
			/>

			<Bridge
				id="skybridge"
				startPosition={new Vector3(-12, 12, 20)}
				endPosition={new Vector3(12, 12, 20)}
				{...BRIDGE_PRESETS.skybridge}
				seed={seedNumber + 400}
			/>

			{/* Diagonal bridge */}
			<Bridge
				id="diagonal"
				startPosition={new Vector3(-25, 5, -15)}
				endPosition={new Vector3(-15, 10, 15)}
				{...BRIDGE_PRESETS.glass_walkway}
				seed={seedNumber + 500}
			/>

			{/* Supporting buildings for context */}
			<Building
				id="back_left"
				position={new Vector3(-20, 0, -20)}
				{...BUILDING_PRESETS.shop}
				seed={seedNumber + 600}
			/>

			<Building
				id="back_right"
				position={new Vector3(20, 0, -20)}
				{...BUILDING_PRESETS.shop}
				seed={seedNumber + 700}
			/>
		</TestHarness>
	);
}

// Mount the app
const root = createRoot(document.getElementById("root")!);
root.render(<BridgeTestScene />);
