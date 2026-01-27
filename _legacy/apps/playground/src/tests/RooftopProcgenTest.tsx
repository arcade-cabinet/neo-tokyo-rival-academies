/**
 * RooftopProcgenTest - Visual validation of rooftop procedural generation
 *
 * Tests the seed → world pipeline with the 3-word phrase system.
 * Renders connected rooftops with props to validate procgen coherence.
 */

import { Vector3 } from "@babylonjs/core";
import { useMemo, useState, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { TestHarness } from "../TestHarness";
import {
	createWorldRNG,
	createSubRNG,
	generateSeedPhrase,
	isValidSeedPhrase,
	type SeedPhrase,
	type WorldRNG,
	// Components
	Floor,
	TexturedWall,
	ACUnit,
	WaterTank,
	Antenna,
	SatelliteDish,
	SolarPanel,
	Vent,
	Crate,
	Barrel,
	Tarp,
	Debris,
	NeonSign,
	Planter,
	Bench,
	Lantern,
} from "../components";

interface RooftopBlock {
	id: string;
	position: Vector3;
	width: number;
	depth: number;
	height: number;
	type: "academy" | "residential" | "commercial" | "industrial";
	connections: string[];
}

interface BridgeConnection {
	id: string;
	from: string;
	to: string;
	startPos: Vector3;
	endPos: Vector3;
	width: number;
}

const ROOFTOP_CONFIG = {
	academy: {
		width: { min: 12, max: 16 },
		depth: { min: 10, max: 14 },
		height: { min: 8, max: 12 },
	},
	residential: {
		width: { min: 6, max: 10 },
		depth: { min: 6, max: 10 },
		height: { min: 5, max: 10 },
	},
	commercial: {
		width: { min: 8, max: 14 },
		depth: { min: 8, max: 12 },
		height: { min: 6, max: 15 },
	},
	industrial: {
		width: { min: 10, max: 18 },
		depth: { min: 8, max: 14 },
		height: { min: 4, max: 8 },
	},
};

function generateRooftopLayout(
	rng: WorldRNG,
	count: number,
): { rooftops: RooftopBlock[]; bridges: BridgeConnection[] } {
	const rooftops: RooftopBlock[] = [];
	const bridges: BridgeConnection[] = [];

	// Academy start
	const academyConfig = ROOFTOP_CONFIG.academy;
	const academy: RooftopBlock = {
		id: "academy_main",
		position: Vector3.Zero(),
		width: rng.int(academyConfig.width.min, academyConfig.width.max),
		depth: rng.int(academyConfig.depth.min, academyConfig.depth.max),
		height: rng.int(academyConfig.height.min, academyConfig.height.max),
		type: "academy",
		connections: [],
	};
	rooftops.push(academy);

	const types: Array<"residential" | "commercial" | "industrial"> = [
		"residential",
		"commercial",
		"industrial",
	];

	for (let i = 1; i < count; i++) {
		const type = rng.pick(types);
		const config = ROOFTOP_CONFIG[type];
		const sourceIdx = rng.int(0, rooftops.length);
		const source = rooftops[sourceIdx];
		const direction = rng.pick(["north", "south", "east", "west"]);
		const gap = rng.int(3, 8);
		const offset = (rng.next() - 0.5) * 10;

		const width = rng.int(config.width.min, config.width.max);
		const depth = rng.int(config.depth.min, config.depth.max);
		const height = rng.int(config.height.min, config.height.max);

		let position: Vector3;
		switch (direction) {
			case "north":
				position = new Vector3(
					source.position.x + offset,
					0,
					source.position.z - source.depth / 2 - gap - depth / 2,
				);
				break;
			case "south":
				position = new Vector3(
					source.position.x + offset,
					0,
					source.position.z + source.depth / 2 + gap + depth / 2,
				);
				break;
			case "east":
				position = new Vector3(
					source.position.x + source.width / 2 + gap + width / 2,
					0,
					source.position.z + offset,
				);
				break;
			case "west":
			default:
				position = new Vector3(
					source.position.x - source.width / 2 - gap - width / 2,
					0,
					source.position.z + offset,
				);
				break;
		}

		const rooftop: RooftopBlock = {
			id: `rooftop_${i}_${type}`,
			position,
			width,
			depth,
			height,
			type,
			connections: [source.id],
		};

		rooftops.push(rooftop);
		source.connections.push(rooftop.id);

		// Bridge
		let startPos: Vector3;
		let endPos: Vector3;

		switch (direction) {
			case "north":
				startPos = new Vector3(
					source.position.x,
					source.height,
					source.position.z - source.depth / 2,
				);
				endPos = new Vector3(position.x, height, position.z + depth / 2);
				break;
			case "south":
				startPos = new Vector3(
					source.position.x,
					source.height,
					source.position.z + source.depth / 2,
				);
				endPos = new Vector3(position.x, height, position.z - depth / 2);
				break;
			case "east":
				startPos = new Vector3(
					source.position.x + source.width / 2,
					source.height,
					source.position.z,
				);
				endPos = new Vector3(position.x - width / 2, height, position.z);
				break;
			case "west":
			default:
				startPos = new Vector3(
					source.position.x - source.width / 2,
					source.height,
					source.position.z,
				);
				endPos = new Vector3(position.x + width / 2, height, position.z);
				break;
		}

		bridges.push({
			id: `bridge_${source.id}_${rooftop.id}`,
			from: source.id,
			to: rooftop.id,
			startPos,
			endPos,
			width: rng.int(2, 4),
		});
	}

	return { rooftops, bridges };
}

function RooftopRenderer({
	rooftop,
	rng,
}: { rooftop: RooftopBlock; rng: WorldRNG }) {
	const propRng = createSubRNG(rng, `props_${rooftop.id}`);

	const props = useMemo(() => {
		const items: Array<{
			type: string;
			position: Vector3;
			rotation: number;
			seed: number;
		}> = [];

		const { width, depth, height, position, type } = rooftop;
		const area = width * depth;
		const propCount = Math.floor(area / 15) + propRng.int(2, 5);

		const propTypes: Record<string, string[]> = {
			academy: ["bench", "planter", "lantern", "antenna", "vent", "solar_panel"],
			residential: ["ac_unit", "water_tank", "antenna", "vent", "crate", "tarp", "planter"],
			commercial: ["ac_unit", "satellite_dish", "vent", "solar_panel", "neon_sign", "barrel"],
			industrial: ["water_tank", "vent", "crate", "barrel", "debris", "tarp", "antenna"],
		};

		const availableProps = propTypes[type] || propTypes.residential;

		for (let i = 0; i < propCount; i++) {
			const propType = propRng.pick(availableProps);
			const margin = 1.5;
			const x = position.x + (propRng.next() - 0.5) * (width - margin * 2);
			const z = position.z + (propRng.next() - 0.5) * (depth - margin * 2);

			items.push({
				type: propType,
				position: new Vector3(x, height, z),
				rotation: propRng.next() * Math.PI * 2,
				seed: propRng.int(0, 100000),
			});
		}

		return items;
	}, [rooftop, propRng]);

	return (
		<>
			<Floor
				id={`${rooftop.id}_floor`}
				position={new Vector3(rooftop.position.x, rooftop.height - 0.1, rooftop.position.z)}
				size={{ width: rooftop.width, depth: rooftop.depth }}
				material="concrete"
				seed={rng.numericSeed}
			/>

			<TexturedWall
				id={`${rooftop.id}_wall_n`}
				position={new Vector3(rooftop.position.x, rooftop.height + 0.5, rooftop.position.z - rooftop.depth / 2)}
				size={{ width: rooftop.width, height: 1, depth: 0.2 }}
				texture="concrete"
				seed={rng.numericSeed + 1}
			/>
			<TexturedWall
				id={`${rooftop.id}_wall_s`}
				position={new Vector3(rooftop.position.x, rooftop.height + 0.5, rooftop.position.z + rooftop.depth / 2)}
				size={{ width: rooftop.width, height: 1, depth: 0.2 }}
				texture="concrete"
				seed={rng.numericSeed + 2}
			/>
			<TexturedWall
				id={`${rooftop.id}_wall_e`}
				position={new Vector3(rooftop.position.x + rooftop.width / 2, rooftop.height + 0.5, rooftop.position.z)}
				size={{ width: 0.2, height: 1, depth: rooftop.depth }}
				texture="concrete"
				seed={rng.numericSeed + 3}
			/>
			<TexturedWall
				id={`${rooftop.id}_wall_w`}
				position={new Vector3(rooftop.position.x - rooftop.width / 2, rooftop.height + 0.5, rooftop.position.z)}
				size={{ width: 0.2, height: 1, depth: rooftop.depth }}
				texture="concrete"
				seed={rng.numericSeed + 4}
			/>

			{props.map((prop, i) => {
				const key = `${rooftop.id}_prop_${i}`;
				switch (prop.type) {
					case "ac_unit":
						return <ACUnit key={key} id={key} position={prop.position} size="medium" seed={prop.seed} />;
					case "water_tank":
						return <WaterTank key={key} id={key} position={prop.position} type="rooftop" seed={prop.seed} />;
					case "antenna":
						return <Antenna key={key} id={key} position={prop.position} type="tv" seed={prop.seed} />;
					case "satellite_dish":
						return <SatelliteDish key={key} id={key} position={prop.position} type="small" seed={prop.seed} />;
					case "solar_panel":
						return <SolarPanel key={key} id={key} position={prop.position} type="residential" seed={prop.seed} />;
					case "vent":
						return <Vent key={key} id={key} position={prop.position} type="exhaust" seed={prop.seed} />;
					case "crate":
						return <Crate key={key} id={key} position={prop.position} size="medium" seed={prop.seed} />;
					case "barrel":
						return <Barrel key={key} id={key} position={prop.position} seed={prop.seed} />;
					case "tarp":
						return <Tarp key={key} id={key} position={prop.position} seed={prop.seed} />;
					case "debris":
						return <Debris key={key} id={key} position={prop.position} seed={prop.seed} />;
					case "neon_sign":
						return <NeonSign key={key} id={key} position={prop.position} text="OPEN" color="red" seed={prop.seed} />;
					case "planter":
						return <Planter key={key} id={key} position={prop.position} seed={prop.seed} />;
					case "bench":
						return <Bench key={key} id={key} position={prop.position} rotation={prop.rotation} seed={prop.seed} />;
					case "lantern":
						return <Lantern key={key} id={key} position={prop.position} seed={prop.seed} />;
					default:
						return null;
				}
			})}
		</>
	);
}

function BridgeRenderer({ bridge }: { bridge: BridgeConnection }) {
	const length = Vector3.Distance(bridge.startPos, bridge.endPos);
	const midpoint = bridge.startPos.add(bridge.endPos).scale(0.5);

	return (
		<Floor
			id={bridge.id}
			position={midpoint}
			size={{ width: bridge.width, depth: length }}
			material="metal"
			seed={bridge.id.length * 1000}
		/>
	);
}

function RooftopProcgenTestScene() {
	const [seedPhrase, setSeedPhrase] = useState<SeedPhrase>(() => generateSeedPhrase());
	const [inputValue, setInputValue] = useState(seedPhrase);

	const handleRegenerate = useCallback(() => {
		const newSeed = generateSeedPhrase();
		setSeedPhrase(newSeed);
		setInputValue(newSeed);
	}, []);

	const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value.toLowerCase();
		setInputValue(value);
		if (isValidSeedPhrase(value)) {
			setSeedPhrase(value as SeedPhrase);
		}
	}, []);

	const worldRng = useMemo(() => createWorldRNG(seedPhrase), [seedPhrase]);
	const { rooftops, bridges } = useMemo(() => {
		const layoutRng = createSubRNG(worldRng, "layout");
		return generateRooftopLayout(layoutRng, 8);
	}, [worldRng]);

	const controls = (
		<div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
			<div
				style={{
					padding: "0.5rem",
					background: "#1a1a2e",
					border: "1px solid #00d4ff",
					fontSize: "0.75rem",
				}}
			>
				<div style={{ color: "#00d4ff", marginBottom: "0.25rem", fontWeight: "bold" }}>
					3-WORD SEED SYSTEM
				</div>
				<div style={{ color: "#aaa", fontSize: "0.65rem" }}>
					Same seed = same world. Always.
				</div>
			</div>

			<div style={{ marginTop: "0.5rem" }}>
				<label style={{ fontSize: "0.7rem", color: "#888", display: "block", marginBottom: "0.25rem" }}>
					SEED PHRASE:
				</label>
				<input
					type="text"
					value={inputValue}
					onChange={handleInputChange}
					style={{
						width: "100%",
						padding: "0.5rem",
						background: "rgba(0, 100, 150, 0.3)",
						border: `1px solid ${isValidSeedPhrase(inputValue) ? "#0f0" : "#f00"}`,
						color: "#fff",
						fontFamily: "monospace",
						fontSize: "0.8rem",
						borderRadius: 3,
					}}
				/>
			</div>

			<button
				type="button"
				onClick={handleRegenerate}
				style={{
					padding: "0.5rem",
					background: "#00d4ff",
					color: "#000",
					border: "none",
					borderRadius: 3,
					cursor: "pointer",
					fontWeight: "bold",
					fontSize: "0.75rem",
				}}
			>
				GENERATE NEW SEED
			</button>

			<div
				style={{
					marginTop: "0.75rem",
					padding: "0.5rem",
					background: "#1a2a1a",
					border: "1px solid #0f0",
					fontSize: "0.65rem",
				}}
			>
				<div style={{ color: "#0f0" }}>STATS:</div>
				<div style={{ color: "#aaa", marginTop: "0.25rem" }}>
					Rooftops: {rooftops.length}<br />
					Bridges: {bridges.length}<br />
					Props: ~{rooftops.reduce((acc, r) => acc + Math.floor(r.width * r.depth / 15) + 3, 0)}
				</div>
			</div>

			<div style={{ fontSize: "0.6rem", color: "#666", marginTop: "0.5rem" }}>
				<div>Building Types:</div>
				<ul style={{ paddingLeft: "1rem", marginTop: "0.25rem" }}>
					<li style={{ color: "#ff0088" }}>Academy (Start)</li>
					<li style={{ color: "#00aaff" }}>Residential</li>
					<li style={{ color: "#ffaa00" }}>Commercial</li>
					<li style={{ color: "#888" }}>Industrial</li>
				</ul>
			</div>
		</div>
	);

	return (
		<TestHarness
			title="// ROOFTOP PROCGEN"
			description="3-word seed phrase system. Test procedural rooftop layout generation."
			initialSeed={seedPhrase}
			cameraDistance={50}
			cameraTarget={new Vector3(0, 10, 0)}
			controls={controls}
		>
			{/* Rooftops */}
			{rooftops.map((rooftop) => (
				<RooftopRenderer
					key={rooftop.id}
					rooftop={rooftop}
					rng={createSubRNG(worldRng, rooftop.id)}
				/>
			))}

			{/* Bridges */}
			{bridges.map((bridge) => (
				<BridgeRenderer key={bridge.id} bridge={bridge} />
			))}
		</TestHarness>
	);
}

// Mount the app
const root = createRoot(document.getElementById("root")!);
root.render(<RooftopProcgenTestScene />);
