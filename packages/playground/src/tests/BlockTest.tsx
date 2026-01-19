/**
 * BlockTest - Daggerfall-style block system playground
 *
 * Tests the modular block architecture:
 * - Block definitions with snap points
 * - Visual snap point indicators
 * - Grid-based placement
 * - Seed-based block selection from pools
 *
 * KEY DAGGERFALL CONCEPTS DEMONSTRATED:
 * 1. Blocks are fixed-size units on a grid
 * 2. Snap points define where blocks can connect
 * 3. Seed → deterministic block selection
 */

import { Color3, Vector3 } from "@babylonjs/core";
import { useState, useCallback, useMemo } from "react";
import { createRoot } from "react-dom/client";
import { TestHarness } from "../TestHarness";
import { Water } from "../components/Water";
import { Floor } from "../components/Floor";
import {
	BlockDebugRenderer,
	GridVisualizer,
} from "../blocks/BlockRenderer";
import {
	type BlockDefinition,
	type BlockCategory,
	GRID_UNIT_SIZE,
	createSeededRandom,
	getBlockPool,
	selectBlockFromPool,
} from "../blocks/Block";
import { RTB_BLOCKS, registerAllRTBBlocks } from "../blocks/RTBBlocks";

// Ensure blocks are registered
registerAllRTBBlocks();

/**
 * Demo: Place blocks on a grid using seed-based selection
 */
function SeedBasedBlockPlacement({
	seed,
	showSnapPoints,
}: {
	seed: number;
	showSnapPoints: boolean;
}) {
	// Generate a small territory using the seed
	const blocks = useMemo(() => {
		const rng = createSeededRandom(seed);
		const placed: Array<{
			id: string;
			definition: BlockDefinition;
			gridX: number;
			gridZ: number;
			rotation: number;
		}> = [];

		// Define a simple layout pattern
		// Center: market square
		// Edges: shelters and equipment

		// Place center market square (2x2)
		placed.push({
			id: "center_market",
			definition: RTB_BLOCKS.market.square,
			gridX: 0,
			gridZ: 0,
			rotation: 0,
		});

		// Shelter pool for edges
		const shelterPool = [
			RTB_BLOCKS.shelter.leanTo,
			RTB_BLOCKS.shelter.shack,
			RTB_BLOCKS.shelter.booth,
		];

		// Equipment pool
		const equipmentPool = [
			RTB_BLOCKS.equipment.solar,
			RTB_BLOCKS.equipment.tanks,
		];

		// Place shelters around the market
		const edgePositions = [
			{ x: -2, z: 0 },   // West
			{ x: 2, z: 0 },    // East
			{ x: -2, z: -2 },  // Northwest
			{ x: 2, z: -2 },   // Northeast
			{ x: -2, z: 2 },   // Southwest
			{ x: 2, z: 2 },    // Southeast
			{ x: 0, z: -2 },   // North
			{ x: 0, z: 2 },    // South
		];

		edgePositions.forEach((pos, i) => {
			// Use seed + position to deterministically pick block
			const locationSeed = seed ^ (pos.x * 73856093) ^ (pos.z * 19349663);
			const localRng = createSeededRandom(locationSeed);

			// 70% shelter, 30% equipment
			const pool = localRng.next() < 0.7 ? shelterPool : equipmentPool;
			const block = localRng.pick(pool);

			// Random rotation (0, 90, 180, 270)
			const rotation = localRng.nextInt(0, 3) * 90;

			placed.push({
				id: `block_${i}`,
				definition: block,
				gridX: pos.x,
				gridZ: pos.z,
				rotation,
			});
		});

		// Add ramp on one side (deterministic based on seed)
		const rampSide = rng.nextInt(0, 3);
		const rampPositions = [
			{ x: -3, z: 0, rot: 90 },   // West
			{ x: 3, z: 0, rot: 270 },   // East
			{ x: 0, z: -3, rot: 0 },    // North
			{ x: 0, z: 3, rot: 180 },   // South
		];
		const rampPos = rampPositions[rampSide];

		placed.push({
			id: "access_ramp",
			definition: RTB_BLOCKS.transition.ramp,
			gridX: rampPos.x,
			gridZ: rampPos.z,
			rotation: rampPos.rot,
		});

		// Add dock extending from the territory
		const dockSide = (rampSide + 2) % 4; // Opposite side from ramp
		const dockPositions = [
			{ x: -3, z: 0, rot: 90 },
			{ x: 3, z: 0, rot: 270 },
			{ x: 0, z: -3, rot: 0 },
			{ x: 0, z: 3, rot: 180 },
		];
		const dockPos = dockPositions[dockSide];

		placed.push({
			id: "water_dock",
			definition: RTB_BLOCKS.landing.dock,
			gridX: dockPos.x,
			gridZ: dockPos.z,
			rotation: dockPos.rot,
		});

		return placed;
	}, [seed]);

	return (
		<>
			{blocks.map((block) => (
				<BlockDebugRenderer
					key={block.id}
					id={block.id}
					definition={block.definition}
					position={new Vector3(
						block.gridX * GRID_UNIT_SIZE,
						0,
						block.gridZ * GRID_UNIT_SIZE
					)}
					rotation={(block.rotation * Math.PI) / 180}
					showSnapPoints={showSnapPoints}
					opacity={0.4}
				/>
			))}
		</>
	);
}

/**
 * Main test scene
 */
function BlockTestScene() {
	const [seed, setSeed] = useState(42);
	const [showSnapPoints, setShowSnapPoints] = useState(true);
	const [showGrid, setShowGrid] = useState(true);
	const [selectedCategory, setSelectedCategory] = useState<BlockCategory>("rtb_shelter");

	const handleSeedChange = useCallback((newSeed: string) => {
		// Convert string seed to number
		let numSeed = 0;
		for (let i = 0; i < newSeed.length; i++) {
			numSeed = (numSeed * 31 + newSeed.charCodeAt(i)) & 0x7fffffff;
		}
		setSeed(numSeed || 42);
	}, []);

	const categories: BlockCategory[] = [
		"rtb_shelter",
		"rtb_market",
		"rtb_equipment",
		"rtb_transition",
		"rtb_landing",
	];

	const controls = (
		<div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
			<div>
				<label style={{ fontSize: "0.7rem", display: "block", marginBottom: "0.25rem" }}>
					SHOW SNAP POINTS:
				</label>
				<button
					onClick={() => setShowSnapPoints(!showSnapPoints)}
					style={{
						width: "100%",
						padding: "0.5rem",
						background: showSnapPoints ? "#00ff88" : "#1a1a2e",
						border: "1px solid #00ff88",
						color: showSnapPoints ? "#0a0a0f" : "#00ff88",
						cursor: "pointer",
						fontSize: "0.7rem",
					}}
				>
					{showSnapPoints ? "VISIBLE" : "HIDDEN"}
				</button>
			</div>

			<div>
				<label style={{ fontSize: "0.7rem", display: "block", marginBottom: "0.25rem" }}>
					SHOW GRID:
				</label>
				<button
					onClick={() => setShowGrid(!showGrid)}
					style={{
						width: "100%",
						padding: "0.5rem",
						background: showGrid ? "#00ff88" : "#1a1a2e",
						border: "1px solid #00ff88",
						color: showGrid ? "#0a0a0f" : "#00ff88",
						cursor: "pointer",
						fontSize: "0.7rem",
					}}
				>
					{showGrid ? "VISIBLE" : "HIDDEN"}
				</button>
			</div>

			<div>
				<label style={{ fontSize: "0.7rem", display: "block", marginBottom: "0.25rem" }}>
					PREVIEW CATEGORY:
				</label>
				<select
					value={selectedCategory}
					onChange={(e) => setSelectedCategory(e.target.value as BlockCategory)}
					style={{
						width: "100%",
						padding: "0.25rem",
						background: "#1a1a2e",
						border: "1px solid #00ff88",
						color: "#00ff88",
						fontSize: "0.65rem",
					}}
				>
					{categories.map((cat) => (
						<option key={cat} value={cat}>
							{cat.replace("rtb_", "").toUpperCase()}
						</option>
					))}
				</select>
			</div>

			<div style={{ fontSize: "0.6rem", marginTop: "1rem", color: "#ff0088" }}>
				<p style={{ marginBottom: "0.5rem" }}>DAGGERFALL CONCEPTS:</p>
				<ul style={{ paddingLeft: "0.8rem", lineHeight: "1.4" }}>
					<li>Grid unit: {GRID_UNIT_SIZE}m</li>
					<li>Snap points show connections</li>
					<li>Seed → deterministic layout</li>
					<li>Blocks from category pools</li>
				</ul>
			</div>

			<div style={{ fontSize: "0.6rem", marginTop: "0.5rem", color: "#00ffff" }}>
				<p style={{ marginBottom: "0.25rem" }}>SNAP POINT COLORS:</p>
				<ul style={{ paddingLeft: "0.8rem", lineHeight: "1.3" }}>
					<li style={{ color: "#00ff88" }}>● floor_edge</li>
					<li style={{ color: "#ff8800" }}>● wall_doorway</li>
					<li style={{ color: "#ffff00" }}>● ramp_top</li>
					<li style={{ color: "#88ff00" }}>● ramp_bottom</li>
					<li style={{ color: "#0088ff" }}>● water_edge</li>
				</ul>
			</div>
		</div>
	);

	return (
		<TestHarness
			title="// DAGGERFALL BLOCKS"
			description="Modular block system with snap points. Change seed to generate different layouts."
			onSeedChange={handleSeedChange}
			initialSeed="neo-tokyo-42"
			cameraDistance={50}
			cameraTarget={new Vector3(0, 5, 0)}
			controls={controls}
			showGrid={false}
		>
			{/* Water surface (below rooftops) */}
			<Water
				id="water"
				position={new Vector3(0, -2, 0)}
				size={{ width: 80, depth: 80 }}
				color={new Color3(0.02, 0.06, 0.12)}
				opacity={0.9}
				reflectivity={0.6}
				depth={10}
			/>

			{/* Base rooftop platform (the "ground" level) */}
			<Floor
				id="base_rooftop"
				position={new Vector3(0, -0.1, 0)}
				size={{ width: 48, depth: 48 }}
				surface="concrete"
				thickness={0.2}
				edgeTrim={true}
				edgeColor={new Color3(0.3, 0.3, 0.35)}
			/>

			{/* Grid visualization */}
			{showGrid && (
				<GridVisualizer
					id="main_grid"
					gridSize={GRID_UNIT_SIZE}
					cellCount={6}
					position={new Vector3(0, 0.05, 0)}
					color={new Color3(0, 1, 0.5)}
				/>
			)}

			{/* Seed-based block placement */}
			<SeedBasedBlockPlacement
				seed={seed}
				showSnapPoints={showSnapPoints}
			/>
		</TestHarness>
	);
}

// Mount the app
const root = createRoot(document.getElementById("root")!);
root.render(<BlockTestScene />);
