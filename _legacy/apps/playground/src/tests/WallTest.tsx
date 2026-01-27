/**
 * WallTest - Isolated test page for the Wall component
 *
 * Tests:
 * - Different materials (concrete, metal, glass, brick)
 * - Different conditions (pristine, worn, damaged, ruined)
 * - Windows with emissive interiors
 * - Neon accent strips
 * - Seed-based procedural variation
 */

import { Vector3 } from "@babylonjs/core";
import { useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { TestHarness } from "../TestHarness";
import { Wall, type WallMaterial, type WallCondition } from "../components";

function WallTestScene() {
	const [seed, setSeed] = useState("wall-test-001");
	const [material, setMaterial] = useState<WallMaterial>("concrete");
	const [condition, setCondition] = useState<WallCondition>("worn");
	const [showWindows, setShowWindows] = useState(true);
	const [windowEmissive, setWindowEmissive] = useState(true);

	const handleSeedChange = useCallback((newSeed: string) => {
		setSeed(newSeed);
	}, []);

	// Custom controls
	const controls = (
		<div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
			<div>
				<label style={{ fontSize: "0.7rem", display: "block", marginBottom: "0.25rem" }}>
					MATERIAL:
				</label>
				<select
					value={material}
					onChange={(e) => setMaterial(e.target.value as WallMaterial)}
					style={{
						width: "100%",
						padding: "0.25rem",
						background: "#1a1a2e",
						border: "1px solid #00ff88",
						color: "#00ff88",
					}}
				>
					<option value="concrete">Concrete</option>
					<option value="metal">Metal</option>
					<option value="glass">Glass</option>
					<option value="brick">Brick</option>
				</select>
			</div>

			<div>
				<label style={{ fontSize: "0.7rem", display: "block", marginBottom: "0.25rem" }}>
					CONDITION:
				</label>
				<select
					value={condition}
					onChange={(e) => setCondition(e.target.value as WallCondition)}
					style={{
						width: "100%",
						padding: "0.25rem",
						background: "#1a1a2e",
						border: "1px solid #00ff88",
						color: "#00ff88",
					}}
				>
					<option value="pristine">Pristine</option>
					<option value="worn">Worn</option>
					<option value="damaged">Damaged</option>
					<option value="ruined">Ruined</option>
				</select>
			</div>

			<div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
				<label style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.7rem" }}>
					<input
						type="checkbox"
						checked={showWindows}
						onChange={(e) => setShowWindows(e.target.checked)}
					/>
					Windows
				</label>
				<label style={{ display: "flex", alignItems: "center", gap: "0.25rem", fontSize: "0.7rem" }}>
					<input
						type="checkbox"
						checked={windowEmissive}
						onChange={(e) => setWindowEmissive(e.target.checked)}
						disabled={!showWindows}
					/>
					Lit
				</label>
			</div>
		</div>
	);

	return (
		<TestHarness
			title="// WALL COMPONENT"
			description="Procedural wall segment with material, condition, windows, and neon accent options."
			onSeedChange={handleSeedChange}
			initialSeed={seed}
			cameraDistance={15}
			controls={controls}
		>
			{/* Row of walls showing different configurations */}

			{/* Main test wall with current settings */}
			<Wall
				id="main"
				position={new Vector3(0, 0, 0)}
				size={{ width: 6, height: 8, depth: 0.3 }}
				material={material}
				condition={condition}
				windows={showWindows ? { columns: 3, rows: 4, emissive: windowEmissive } : undefined}
				seed={`${seed}-main`}
			/>

			{/* Comparison walls */}
			<Wall
				id="concrete"
				position={new Vector3(-8, 0, 0)}
				size={{ width: 4, height: 6, depth: 0.25 }}
				material="concrete"
				condition="worn"
				windows={{ columns: 2, rows: 3, emissive: true }}
				seed={`${seed}-concrete`}
			/>

			<Wall
				id="metal"
				position={new Vector3(8, 0, 0)}
				size={{ width: 4, height: 6, depth: 0.25 }}
				material="metal"
				condition="damaged"
				seed={`${seed}-metal`}
			/>

			<Wall
				id="glass"
				position={new Vector3(-8, 0, -5)}
				size={{ width: 4, height: 6, depth: 0.15 }}
				material="glass"
				condition="pristine"
				seed={`${seed}-glass`}
			/>

			<Wall
				id="brick"
				position={new Vector3(8, 0, -5)}
				size={{ width: 4, height: 6, depth: 0.3 }}
				material="brick"
				condition="ruined"
				seed={`${seed}-brick`}
			/>

			{/* Rotated wall */}
			<Wall
				id="rotated"
				position={new Vector3(0, 0, -8)}
				size={{ width: 5, height: 4, depth: 0.25 }}
				material="concrete"
				condition="worn"
				rotation={Math.PI / 4}
				windows={{ columns: 2, rows: 2, emissive: true }}
				seed={`${seed}-rotated`}
			/>
		</TestHarness>
	);
}

// Mount the app
const root = createRoot(document.getElementById("root")!);
root.render(<WallTestScene />);
