/**
 * AlleyTest - Test narrow passage compound assembly
 *
 * Testing:
 * - Different mood presets
 * - Variable dimensions
 * - Neon density
 * - Dead end vs through passage
 * - Overhead pipes
 */

import { Color3, Vector3 } from "@babylonjs/core";
import { useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { TestHarness } from "../TestHarness";
import { Alley, ALLEY_PRESETS, type AlleyMood } from "../compounds/Alley";
import { Water } from "../components/Water";
import { Floor } from "../components/Floor";

function AlleyTestScene() {
	const [seed, setSeed] = useState("alley-001");
	const [mood, setMood] = useState<AlleyMood>("neon");
	const [length, setLength] = useState(15);
	const [width, setWidth] = useState(3);
	const [wallHeight, setWallHeight] = useState(8);
	const [deadEnd, setDeadEnd] = useState(false);
	const [neonDensity, setNeonDensity] = useState(0.6);

	const handleSeedChange = useCallback((newSeed: string) => {
		setSeed(newSeed);
	}, []);

	const seedNumber = Array.from(seed).reduce(
		(acc, char) => acc + char.charCodeAt(0),
		0,
	);

	const moodOptions: AlleyMood[] = ["dark", "neon", "industrial", "residential"];

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
					MOOD:
				</label>
				<select
					value={mood}
					onChange={(e) => setMood(e.target.value as AlleyMood)}
					style={{
						width: "100%",
						padding: "0.25rem",
						background: "#1a1a2e",
						border: "1px solid #00ff88",
						color: "#00ff88",
						fontSize: "0.7rem",
					}}
				>
					{moodOptions.map((m) => (
						<option key={m} value={m}>
							{m}
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
					min="8"
					max="30"
					step="1"
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
					WIDTH: {width}m
				</label>
				<input
					type="range"
					min="2"
					max="6"
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
					WALL HEIGHT: {wallHeight}m
				</label>
				<input
					type="range"
					min="4"
					max="15"
					step="1"
					value={wallHeight}
					onChange={(e) => setWallHeight(Number(e.target.value))}
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
					NEON DENSITY: {Math.round(neonDensity * 100)}%
				</label>
				<input
					type="range"
					min="0"
					max="1"
					step="0.1"
					value={neonDensity}
					onChange={(e) => setNeonDensity(Number(e.target.value))}
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
						checked={deadEnd}
						onChange={(e) => setDeadEnd(e.target.checked)}
					/>
					DEAD END
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
					<li>TexturedWall (2-3x)</li>
					<li>Floor (ground)</li>
					<li>NeonSign (lights)</li>
					<li>Floor (overhead pipes)</li>
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
					<li>☐ Walls form corridor</li>
					<li>☐ Mood changes ambiance</li>
					<li>☐ Dead end closes alley</li>
					<li>☐ Neons illuminate walls</li>
				</ul>
			</div>
		</div>
	);

	return (
		<TestHarness
			title="// ALLEY"
			description="Compound component: narrow passage with walls, atmospheric lighting, and overhead pipes."
			onSeedChange={handleSeedChange}
			initialSeed={seed}
			cameraDistance={20}
			cameraTarget={new Vector3(0, wallHeight / 2, length / 2)}
			controls={controls}
		>
			{/* Water below */}
			<Water
				id="water"
				position={new Vector3(0, -3, 0)}
				size={{ width: 60, depth: 60 }}
				color={new Color3(0.02, 0.05, 0.1)}
				opacity={0.9}
				reflectivity={0.6}
				depth={15}
			/>

			{/* Main adjustable alley */}
			<Alley
				id="main"
				position={new Vector3(0, 0, 0)}
				dimensions={{ length, width, wallHeight }}
				mood={mood}
				deadEnd={deadEnd}
				seed={seedNumber}
				neonDensity={neonDensity}
			/>

			{/* Ground platform around alley entrance */}
			<Floor
				id="entrance_ground"
				position={new Vector3(0, 0, -3)}
				size={{ width: 15, depth: 6 }}
				surface="concrete"
			/>

			{/* Exit area (if not dead end) */}
			{!deadEnd && (
				<Floor
					id="exit_ground"
					position={new Vector3(0, 0, length + 3)}
					size={{ width: 15, depth: 6 }}
					surface="concrete"
				/>
			)}

			{/* Preset alleys for comparison */}
			<Alley
				id="narrow"
				position={new Vector3(-15, 0, 0)}
				{...ALLEY_PRESETS.narrow_passage}
				seed={seedNumber + 100}
			/>

			<Alley
				id="industrial"
				position={new Vector3(15, 0, 0)}
				{...ALLEY_PRESETS.service_alley}
				seed={seedNumber + 200}
			/>

			<Alley
				id="dead"
				position={new Vector3(0, 0, -20)}
				{...ALLEY_PRESETS.dead_end}
				seed={seedNumber + 300}
				accentColor={new Color3(1, 0, 0)}
			/>
		</TestHarness>
	);
}

// Mount the app
const root = createRoot(document.getElementById("root")!);
root.render(<AlleyTestScene />);
