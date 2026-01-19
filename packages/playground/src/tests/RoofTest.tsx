/**
 * RoofTest - Test overhead structures component
 *
 * Testing:
 * - Different roof styles (flat, sloped, canopy, industrial, glass)
 * - Support beams
 * - Edge trim and glow
 * - Industrial equipment
 * - Integration with buildings
 */

import { Color3, Vector3 } from "@babylonjs/core";
import { useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { TestHarness } from "../TestHarness";
import { Roof, ROOF_PRESETS, type RoofStyle } from "../components/Roof";
import { TexturedWall } from "../components/TexturedWall";
import { Floor } from "../components/Floor";
import { Water } from "../components/Water";
import { NeonSign } from "../components/NeonSign";

function RoofTestScene() {
	const [seed, setSeed] = useState("roof-001");
	const [style, setStyle] = useState<RoofStyle>("flat");
	const [showBeams, setShowBeams] = useState(true);
	const [showTrim, setShowTrim] = useState(true);
	const [showGlow, setShowGlow] = useState(true);
	const [showEquipment, setShowEquipment] = useState(false);
	const [equipmentDensity, setEquipmentDensity] = useState(2);

	const handleSeedChange = useCallback((newSeed: string) => {
		setSeed(newSeed);
	}, []);

	const seedNumber = Array.from(seed).reduce(
		(acc, char) => acc + char.charCodeAt(0),
		0,
	);

	const styleOptions: RoofStyle[] = [
		"flat",
		"sloped",
		"canopy",
		"industrial",
		"glass",
	];

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
					onChange={(e) => setStyle(e.target.value as RoofStyle)}
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

			<label
				style={{
					display: "flex",
					alignItems: "center",
					gap: "0.25rem",
					fontSize: "0.7rem",
				}}
			>
				<input
					type="checkbox"
					checked={showBeams}
					onChange={(e) => setShowBeams(e.target.checked)}
				/>
				Support Beams
			</label>

			<label
				style={{
					display: "flex",
					alignItems: "center",
					gap: "0.25rem",
					fontSize: "0.7rem",
				}}
			>
				<input
					type="checkbox"
					checked={showTrim}
					onChange={(e) => setShowTrim(e.target.checked)}
				/>
				Edge Trim
			</label>

			<label
				style={{
					display: "flex",
					alignItems: "center",
					gap: "0.25rem",
					fontSize: "0.7rem",
				}}
			>
				<input
					type="checkbox"
					checked={showGlow}
					onChange={(e) => setShowGlow(e.target.checked)}
				/>
				Edge Glow
			</label>

			<label
				style={{
					display: "flex",
					alignItems: "center",
					gap: "0.25rem",
					fontSize: "0.7rem",
				}}
			>
				<input
					type="checkbox"
					checked={showEquipment}
					onChange={(e) => setShowEquipment(e.target.checked)}
				/>
				Rooftop Equipment
			</label>

			{showEquipment && (
				<div>
					<label
						style={{
							fontSize: "0.7rem",
							display: "block",
							marginBottom: "0.25rem",
						}}
					>
						EQUIPMENT DENSITY: {equipmentDensity}
					</label>
					<input
						type="range"
						min="1"
						max="5"
						step="1"
						value={equipmentDensity}
						onChange={(e) =>
							setEquipmentDensity(Number(e.target.value))
						}
						style={{ width: "100%" }}
					/>
				</div>
			)}

			<div
				style={{
					fontSize: "0.65rem",
					marginTop: "1rem",
					color: "#00aaff",
				}}
			>
				<p>ROOF USES:</p>
				<ul style={{ paddingLeft: "1rem", marginTop: "0.25rem" }}>
					<li>Building overhangs</li>
					<li>Shop awnings</li>
					<li>Covered walkways</li>
					<li>Glass skylights</li>
					<li>Industrial sheds</li>
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
					<li>☐ Roof renders correctly</li>
					<li>☐ Support beams attach</li>
					<li>☐ Edge glow blooms</li>
					<li>☐ Equipment placement</li>
				</ul>
			</div>
		</div>
	);

	return (
		<TestHarness
			title="// ROOF STRUCTURES"
			description="Overhead structures - canopies, overhangs, glass roofs. Different from Floor (ground surfaces)."
			onSeedChange={handleSeedChange}
			initialSeed={seed}
			cameraDistance={18}
			cameraTarget={new Vector3(0, 3, 0)}
			controls={controls}
		>
			{/* Water for reflections */}
			<Water
				id="water"
				position={new Vector3(0, -1, 0)}
				size={{ width: 60, depth: 60 }}
				color={new Color3(0.02, 0.05, 0.1)}
				opacity={0.9}
				reflectivity={0.6}
				depth={10}
			/>

			{/* Main adjustable roof */}
			<Roof
				id="main"
				position={new Vector3(0, 5, 0)}
				size={{ width: 6, depth: 4, thickness: 0.15 }}
				style={style}
				supportBeams={showBeams}
				edgeTrim={showTrim}
				edgeGlow={showGlow ? new Color3(0, 1, 0.8) : null}
				equipment={showEquipment}
				equipmentDensity={equipmentDensity}
				seed={seedNumber}
			/>

			{/* Building underneath the main roof */}
			<TexturedWall
				id="building_back"
				position={new Vector3(0, 2.5, 2)}
				size={{ width: 6, height: 5, depth: 0.3 }}
				textureType="concrete_dirty"
			/>

			<TexturedWall
				id="building_left"
				position={new Vector3(-3, 2.5, 0)}
				size={{ width: 0.3, height: 5, depth: 4 }}
				textureType="brick_grey"
			/>

			<TexturedWall
				id="building_right"
				position={new Vector3(3, 2.5, 0)}
				size={{ width: 0.3, height: 5, depth: 4 }}
				textureType="brick_grey"
			/>

			{/* Floor of the covered area */}
			<Floor
				id="floor"
				position={new Vector3(0, 0, 0)}
				size={{ width: 6, depth: 4 }}
				surface="concrete"
			/>

			{/* Preset showcases - different roof types around the scene */}

			{/* Shop awning - red canopy */}
			<Roof
				id="awning"
				position={new Vector3(-10, 4, -5)}
				{...ROOF_PRESETS.awning}
			/>
			<TexturedWall
				id="shop_wall"
				position={new Vector3(-10, 2, -6)}
				size={{ width: 4, height: 4, depth: 0.3 }}
				textureType="concrete_dirty"
			/>

			{/* Industrial shed */}
			<Roof
				id="shed"
				position={new Vector3(10, 4, -3)}
				{...ROOF_PRESETS.industrial_shed}
				seed={seedNumber + 100}
			/>
			<TexturedWall
				id="shed_back"
				position={new Vector3(10, 2, 0)}
				size={{ width: 8, height: 4, depth: 0.3 }}
				textureType="metal_rusted"
			/>

			{/* Glass skylight */}
			<Roof
				id="skylight"
				position={new Vector3(0, 6, -12)}
				{...ROOF_PRESETS.skylight}
			/>
			<TexturedWall
				id="skylight_base"
				position={new Vector3(0, 3, -12)}
				size={{ width: 5, height: 6, depth: 5 }}
				textureType="concrete_dirty"
			/>

			{/* Covered walkway */}
			<Roof
				id="walkway"
				position={new Vector3(-8, 3.5, 5)}
				{...ROOF_PRESETS.walkway}
			/>

			{/* Neon canopy */}
			<Roof
				id="neon_roof"
				position={new Vector3(8, 4, 8)}
				{...ROOF_PRESETS.neon_canopy}
			/>

			{/* Some neon signs to test bloom interaction */}
			<NeonSign
				id="sign_1"
				position={new Vector3(-10, 5.5, -5.5)}
				color={new Color3(1, 0.3, 0)}
				shape="rectangle"
				size={{ width: 1.5, height: 1 }}
				mount="wall"
			/>

			<NeonSign
				id="sign_2"
				position={new Vector3(0, 3, 1.8)}
				color={new Color3(0, 1, 0.8)}
				shape="bar"
				size={{ width: 4, height: 0.1 }}
				mount="wall"
			/>
		</TestHarness>
	);
}

// Mount the app
const root = createRoot(document.getElementById("root")!);
root.render(<RoofTestScene />);
