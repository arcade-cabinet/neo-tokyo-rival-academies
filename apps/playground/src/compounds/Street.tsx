/**
 * Street - Compound component for flooded canal streets
 *
 * In flooded Neo-Tokyo, streets have become canals:
 * - Water channel running down the center
 * - Elevated walkways on one or both sides
 * - Buildings flanking the street
 * - Ferry stops/docking points
 * - Neon reflections on water
 *
 * Uses primitives: Water, Floor, TexturedWall, NeonSign, Building
 */

import { Color3, Vector3 } from "@babylonjs/core";
import { useMemo } from "react";
import { Water } from "../components/Water";
import { Floor } from "../components/Floor";
import { TexturedWall } from "../components/TexturedWall";
import { NeonSign } from "../components/NeonSign";

export type StreetStyle = "commercial" | "industrial" | "residential" | "market";

export interface StreetProps {
	/** Unique identifier */
	id: string;
	/** Start position (one end of street) */
	position: Vector3;
	/** Street dimensions */
	dimensions: {
		length: number;     // How far the street extends
		canalWidth: number; // Width of water channel
		walkwayWidth: number; // Width of side walkways
	};
	/** Street style affects textures and density */
	style?: StreetStyle;
	/** Random seed for procedural details */
	seed?: number;
	/** Include walkway on left side */
	leftWalkway?: boolean;
	/** Include walkway on right side */
	rightWalkway?: boolean;
	/** Water level (relative to walkway) */
	waterLevel?: number;
	/** Canal depth */
	canalDepth?: number;
	/** Primary accent color */
	accentColor?: Color3;
	/** Number of ferry stops along the street */
	ferryStops?: number;
	/** Building density on sides (0-1) */
	buildingDensity?: number;
}

// Style presets
const STYLE_PRESETS: Record<StreetStyle, {
	accentColor: Color3;
	waterColor: Color3;
	walkwaySurface: "concrete" | "metal_grating" | "tile";
	neonDensity: number;
}> = {
	commercial: {
		accentColor: new Color3(1, 0, 0.5),
		waterColor: new Color3(0.02, 0.05, 0.1),
		walkwaySurface: "concrete",
		neonDensity: 0.7,
	},
	industrial: {
		accentColor: new Color3(1, 0.5, 0),
		waterColor: new Color3(0.05, 0.05, 0.05),
		walkwaySurface: "metal_grating",
		neonDensity: 0.3,
	},
	residential: {
		accentColor: new Color3(1, 0.9, 0.7),
		waterColor: new Color3(0.02, 0.05, 0.08),
		walkwaySurface: "concrete",
		neonDensity: 0.4,
	},
	market: {
		accentColor: new Color3(1, 0.8, 0.2),
		waterColor: new Color3(0.02, 0.04, 0.08),
		walkwaySurface: "tile",
		neonDensity: 0.8,
	},
};

// Seeded random helper
function seededRandom(seed: number) {
	const x = Math.sin(seed) * 10000;
	return x - Math.floor(x);
}

/**
 * Street compound component (flooded canal)
 */
export function Street({
	id,
	position,
	dimensions,
	style = "commercial",
	seed = 42,
	leftWalkway = true,
	rightWalkway = true,
	waterLevel = -0.5,
	canalDepth = 3,
	accentColor,
	ferryStops = 0,
}: StreetProps) {
	const preset = STYLE_PRESETS[style];

	const finalAccentColor = accentColor ?? preset.accentColor;
	const { length, canalWidth, walkwayWidth } = dimensions;

	// Generate canal wall segments
	const canalWalls = useMemo(() => {
		const walls: Array<{
			id: string;
			position: Vector3;
			size: { width: number; height: number; depth: number };
		}> = [];

		// Left canal wall (if there's a left walkway)
		if (leftWalkway) {
			walls.push({
				id: `${id}_canal_wall_left`,
				position: new Vector3(
					position.x - canalWidth / 2,
					position.y + waterLevel - canalDepth / 2,
					position.z + length / 2
				),
				size: { width: 0.2, height: canalDepth, depth: length },
			});
		}

		// Right canal wall (if there's a right walkway)
		if (rightWalkway) {
			walls.push({
				id: `${id}_canal_wall_right`,
				position: new Vector3(
					position.x + canalWidth / 2,
					position.y + waterLevel - canalDepth / 2,
					position.z + length / 2
				),
				size: { width: 0.2, height: canalDepth, depth: length },
			});
		}

		return walls;
	}, [id, position, length, canalWidth, waterLevel, canalDepth, leftWalkway, rightWalkway]);

	// Generate neon accent lights along canal
	const neonLights = useMemo(() => {
		const lights: Array<{
			id: string;
			position: Vector3;
			color: Color3;
		}> = [];

		let seedCounter = seed;
		const nextRandom = () => {
			seedCounter++;
			return seededRandom(seedCounter);
		};

		const neonColors = [
			finalAccentColor,
			new Color3(0, 1, 0.8),
			new Color3(1, 0, 0.5),
			new Color3(0.5, 0, 1),
		];

		// Lights along canal edges
		const spacing = 5;
		const count = Math.floor(length / spacing);

		for (let i = 0; i < count; i++) {
			if (nextRandom() > (1 - preset.neonDensity)) {
				const z = position.z + (i + 0.5) * spacing;
				const side = nextRandom() > 0.5 ? -1 : 1;
				const x = position.x + side * (canalWidth / 2 + 0.3);

				lights.push({
					id: `${id}_neon_${i}`,
					position: new Vector3(x, position.y + waterLevel + 0.1, z),
					color: neonColors[Math.floor(nextRandom() * neonColors.length)],
				});
			}
		}

		return lights;
	}, [id, seed, position, length, canalWidth, waterLevel, finalAccentColor, preset.neonDensity]);

	// Generate ferry stop positions
	const ferryStopPositions = useMemo(() => {
		if (ferryStops <= 0) return [];

		const stops: Array<{
			id: string;
			position: Vector3;
			side: "left" | "right";
		}> = [];

		for (let i = 0; i < ferryStops; i++) {
			const t = (i + 0.5) / ferryStops;
			const z = position.z + t * length;
			const side = i % 2 === 0 ? "left" : "right";
			const x = side === "left"
				? position.x - canalWidth / 2 - walkwayWidth / 2
				: position.x + canalWidth / 2 + walkwayWidth / 2;

			stops.push({
				id: `${id}_ferry_${i}`,
				position: new Vector3(x, position.y, z),
				side,
			});
		}

		return stops;
	}, [id, position, length, canalWidth, walkwayWidth, ferryStops]);

	return (
		<>
			{/* Central water channel */}
			<Water
				id={`${id}_canal`}
				position={new Vector3(position.x, position.y + waterLevel, position.z + length / 2)}
				size={{ width: canalWidth, depth: length }}
				color={preset.waterColor}
				opacity={0.85}
				reflectivity={0.7}
				depth={canalDepth}
			/>

			{/* Canal walls */}
			{canalWalls.map((wall) => (
				<TexturedWall
					key={wall.id}
					id={wall.id}
					position={wall.position}
					size={wall.size}
					textureType="concrete_dirty"
				/>
			))}

			{/* Left walkway */}
			{leftWalkway && (
				<Floor
					id={`${id}_walkway_left`}
					position={new Vector3(
						position.x - canalWidth / 2 - walkwayWidth / 2,
						position.y,
						position.z + length / 2
					)}
					size={{ width: walkwayWidth, depth: length }}
					surface={preset.walkwaySurface}
					edgeTrim={true}
				/>
			)}

			{/* Right walkway */}
			{rightWalkway && (
				<Floor
					id={`${id}_walkway_right`}
					position={new Vector3(
						position.x + canalWidth / 2 + walkwayWidth / 2,
						position.y,
						position.z + length / 2
					)}
					size={{ width: walkwayWidth, depth: length }}
					surface={preset.walkwaySurface}
					edgeTrim={true}
				/>
			)}

			{/* Neon edge lights along canal */}
			{neonLights.map((neon) => (
				<NeonSign
					key={neon.id}
					id={neon.id}
					position={neon.position}
					color={neon.color}
					shape="bar"
					size={{ width: 1.5, height: 0.1 }}
					mount="ground"
					intensity={1.0}
				/>
			))}

			{/* Ferry stop markers */}
			{ferryStopPositions.map((stop) => (
				<NeonSign
					key={stop.id}
					id={stop.id}
					position={new Vector3(stop.position.x, stop.position.y + 0.1, stop.position.z)}
					color={new Color3(0, 1, 0.5)}
					shape="rectangle"
					size={{ width: walkwayWidth * 0.8, height: 2 }}
					mount="ground"
					intensity={0.6}
				/>
			))}

			{/* Street entrance glow */}
			<NeonSign
				id={`${id}_entrance_glow`}
				position={new Vector3(position.x, position.y + waterLevel + 0.1, position.z + 1)}
				color={finalAccentColor}
				shape="bar"
				size={{ width: canalWidth * 0.8, height: 0.3 }}
				mount="ground"
				intensity={0.7}
			/>

			{/* Street exit glow */}
			<NeonSign
				id={`${id}_exit_glow`}
				position={new Vector3(position.x, position.y + waterLevel + 0.1, position.z + length - 1)}
				color={finalAccentColor}
				shape="bar"
				size={{ width: canalWidth * 0.8, height: 0.3 }}
				mount="ground"
				intensity={0.7}
			/>
		</>
	);
}

/**
 * Street presets for common configurations
 */
export const STREET_PRESETS = {
	main_canal: {
		dimensions: { length: 50, canalWidth: 8, walkwayWidth: 4 },
		style: "commercial" as StreetStyle,
		ferryStops: 2,
	},
	back_canal: {
		dimensions: { length: 30, canalWidth: 5, walkwayWidth: 2.5 },
		style: "residential" as StreetStyle,
		ferryStops: 1,
	},
	industrial_canal: {
		dimensions: { length: 40, canalWidth: 10, walkwayWidth: 3 },
		style: "industrial" as StreetStyle,
		ferryStops: 1,
	},
	market_canal: {
		dimensions: { length: 35, canalWidth: 6, walkwayWidth: 5 },
		style: "market" as StreetStyle,
		ferryStops: 3,
	},
	one_sided: {
		dimensions: { length: 25, canalWidth: 6, walkwayWidth: 3 },
		style: "industrial" as StreetStyle,
		leftWalkway: true,
		rightWalkway: false,
	},
};

export default Street;
