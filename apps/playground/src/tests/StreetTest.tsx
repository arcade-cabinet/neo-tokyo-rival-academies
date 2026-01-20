/**
 * StreetTest - Test flooded canal street compound assembly
 *
 * Testing:
 * - Different street styles
 * - Variable canal widths
 * - One-sided vs two-sided walkways
 * - Ferry stop placement
 * - Neon reflections on water
 */

import { Vector3 } from "@babylonjs/core";
import { useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { TestHarness } from "../TestHarness";
import { Street, STREET_PRESETS, type StreetStyle } from "../compounds/Street";
import { Building, BUILDING_PRESETS } from "../compounds/Building";
import { Farground } from "../components";

function StreetTestScene() {
	const [seed, setSeed] = useState("street-001");
	const [style, setStyle] = useState<StreetStyle>("commercial");
	const [length, setLength] = useState(40);
	const [canalWidth, setCanalWidth] = useState(8);
	const [walkwayWidth, setWalkwayWidth] = useState(4);
	const [leftWalkway, setLeftWalkway] = useState(true);
	const [rightWalkway, setRightWalkway] = useState(true);
	const [ferryStops, setFerryStops] = useState(2);

	const handleSeedChange = useCallback((newSeed: string) => {
		setSeed(newSeed);
	}, []);

	const seedNumber = Array.from(seed).reduce(
		(acc, char) => acc + char.charCodeAt(0),
		0,
	);

	const styleOptions: StreetStyle[] = ["commercial", "industrial", "residential", "market"];

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
					onChange={(e) => setStyle(e.target.value as StreetStyle)}
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
					LENGTH: {length}m
				</label>
				<input
					type="range"
					min="20"
					max="80"
					step="5"
					value={length}
					onChange={(e) => setLength(Number(e.target.value))}
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
					CANAL WIDTH: {canalWidth}m
				</label>
				<input
					type="range"
					min="4"
					max="15"
					step="1"
					value={canalWidth}
					onChange={(e) => setCanalWidth(Number(e.target.value))}
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
					WALKWAY WIDTH: {walkwayWidth}m
				</label>
				<input
					type="range"
					min="2"
					max="8"
					step="0.5"
					value={walkwayWidth}
					onChange={(e) => setWalkwayWidth(Number(e.target.value))}
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
					FERRY STOPS: {ferryStops}
				</label>
				<input
					type="range"
					min="0"
					max="5"
					step="1"
					value={ferryStops}
					onChange={(e) => setFerryStops(Number(e.target.value))}
					style={{ width: "100%" }}
				/>
			</div>

			<div style={{ display: "flex", gap: "1rem" }}>
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
						checked={leftWalkway}
						onChange={(e) => setLeftWalkway(e.target.checked)}
					/>
					LEFT
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
						checked={rightWalkway}
						onChange={(e) => setRightWalkway(e.target.checked)}
					/>
					RIGHT
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
					<li>Water (canal)</li>
					<li>Floor (walkways)</li>
					<li>TexturedWall (canal walls)</li>
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
				<p>FLOODED CITY CONCEPT:</p>
				<ul style={{ paddingLeft: "1rem", marginTop: "0.25rem" }}>
					<li>☐ Water reflects neon</li>
					<li>☐ Walkways elevated</li>
					<li>☐ Ferry stops marked</li>
					<li>☐ Buildings flank canal</li>
				</ul>
			</div>
		</div>
	);

	return (
		<TestHarness
			title="// STREET (CANAL)"
			description="Compound component: flooded canal street with elevated walkways and ferry stops."
			onSeedChange={handleSeedChange}
			initialSeed={seed}
			cameraDistance={50}
			cameraTarget={new Vector3(0, 3, length / 2)}
			controls={controls}
		>
			{/* Distant city skyline */}
			<Farground
				id="skyline"
				position={new Vector3(0, 0, length + 30)}
				width={200}
				distance={50}
				seed={seedNumber}
			/>

			{/* Main adjustable street */}
			<Street
				id="main"
				position={new Vector3(0, 0, 0)}
				dimensions={{ length, canalWidth, walkwayWidth }}
				style={style}
				seed={seedNumber}
				leftWalkway={leftWalkway}
				rightWalkway={rightWalkway}
				ferryStops={ferryStops}
			/>

			{/* Buildings along left side */}
			{leftWalkway && (
				<>
					<Building
						id="left_1"
						position={new Vector3(
							-canalWidth / 2 - walkwayWidth - 5,
							0,
							10
						)}
						{...BUILDING_PRESETS.shop}
						seed={seedNumber + 100}
					/>
					<Building
						id="left_2"
						position={new Vector3(
							-canalWidth / 2 - walkwayWidth - 6,
							0,
							25
						)}
						{...BUILDING_PRESETS.apartment_small}
						seed={seedNumber + 101}
					/>
					<Building
						id="left_3"
						position={new Vector3(
							-canalWidth / 2 - walkwayWidth - 5,
							0,
							40
						)}
						{...BUILDING_PRESETS.shop}
						seed={seedNumber + 102}
					/>
				</>
			)}

			{/* Buildings along right side */}
			{rightWalkway && (
				<>
					<Building
						id="right_1"
						position={new Vector3(
							canalWidth / 2 + walkwayWidth + 5,
							0,
							8
						)}
						{...BUILDING_PRESETS.apartment_small}
						seed={seedNumber + 200}
					/>
					<Building
						id="right_2"
						position={new Vector3(
							canalWidth / 2 + walkwayWidth + 6,
							0,
							22
						)}
						{...BUILDING_PRESETS.office_tower}
						seed={seedNumber + 201}
					/>
					<Building
						id="right_3"
						position={new Vector3(
							canalWidth / 2 + walkwayWidth + 5,
							0,
							38
						)}
						{...BUILDING_PRESETS.warehouse}
						seed={seedNumber + 202}
					/>
				</>
			)}

			{/* Preset streets for comparison (offset) */}
			<Street
				id="industrial"
				position={new Vector3(-40, 0, 0)}
				{...STREET_PRESETS.industrial_canal}
				seed={seedNumber + 300}
			/>

			<Street
				id="back_canal"
				position={new Vector3(40, 0, 0)}
				{...STREET_PRESETS.back_canal}
				seed={seedNumber + 400}
			/>
		</TestHarness>
	);
}

// Mount the app
const root = createRoot(document.getElementById("root")!);
root.render(<StreetTestScene />);
