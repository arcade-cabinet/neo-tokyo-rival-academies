/**
 * Alley - Compound component assembling a narrow passage between buildings
 *
 * A claustrophobic corridor with atmospheric lighting:
 * - Walls on both sides (optional back wall)
 * - Ground surface (puddles, grating, etc.)
 * - Overhead pipes and cables
 * - Neon accents and ambient lighting
 * - Optional obstacles (crates, dumpsters)
 *
 * Uses primitives: TexturedWall, Floor, NeonSign
 */

import { Color3, Vector3 } from "@babylonjs/core";
import { useMemo } from "react";
import { TexturedWall, type WallTextureType } from "../components";
import { Floor, type FloorSurface } from "../components";
import { NeonSign } from "../components";

export type AlleyMood = "dark" | "neon" | "industrial" | "residential";

export interface AlleyProps {
	/** Unique identifier */
	id: string;
	/** Start position (entrance) */
	position: Vector3;
	/** Alley dimensions */
	dimensions: {
		length: number;    // How far the alley extends
		width: number;     // Space between walls
		wallHeight: number;
	};
	/** Mood affects lighting and textures */
	mood?: AlleyMood;
	/** Override wall texture */
	wallTexture?: WallTextureType;
	/** Override floor surface */
	floorSurface?: FloorSurface;
	/** Add back wall to create dead end */
	deadEnd?: boolean;
	/** Random seed for procedural details */
	seed?: number;
	/** Enable overhead pipes/cables */
	overheadPipes?: boolean;
	/** Neon light density (0-1) */
	neonDensity?: number;
	/** Primary accent color */
	accentColor?: Color3;
}

// Mood presets
const MOOD_PRESETS: Record<AlleyMood, {
	wallTexture: WallTextureType;
	floorSurface: FloorSurface;
	accentColor: Color3;
	neonDensity: number;
	hasOverhead: boolean;
}> = {
	dark: {
		wallTexture: "concrete_dirty",
		floorSurface: "concrete",
		accentColor: new Color3(0.3, 0.3, 0.4),
		neonDensity: 0.1,
		hasOverhead: true,
	},
	neon: {
		wallTexture: "concrete_dirty",
		floorSurface: "concrete",
		accentColor: new Color3(1, 0, 0.5),
		neonDensity: 0.7,
		hasOverhead: true,
	},
	industrial: {
		wallTexture: "metal_rusted",
		floorSurface: "metal_grating",
		accentColor: new Color3(1, 0.5, 0),
		neonDensity: 0.3,
		hasOverhead: true,
	},
	residential: {
		wallTexture: "brick_grey",
		floorSurface: "concrete",
		accentColor: new Color3(1, 0.9, 0.7),
		neonDensity: 0.2,
		hasOverhead: false,
	},
};

// Seeded random helper
function seededRandom(seed: number) {
	const x = Math.sin(seed) * 10000;
	return x - Math.floor(x);
}

/**
 * Alley compound component
 */
export function Alley({
	id,
	position,
	dimensions,
	mood = "neon",
	wallTexture,
	floorSurface,
	deadEnd = false,
	seed = 42,
	overheadPipes,
	neonDensity,
	accentColor,
}: AlleyProps) {
	const preset = MOOD_PRESETS[mood];

	const finalWallTexture = wallTexture ?? preset.wallTexture;
	const finalFloorSurface = floorSurface ?? preset.floorSurface;
	const finalAccentColor = accentColor ?? preset.accentColor;
	const finalNeonDensity = neonDensity ?? preset.neonDensity;
	const finalHasOverhead = overheadPipes ?? preset.hasOverhead;

	const { length, width, wallHeight } = dimensions;

	// Generate procedural neon lights along alley
	const neonLights = useMemo(() => {
		const lights: Array<{
			id: string;
			position: Vector3;
			color: Color3;
			rotation: number;
			wall: "left" | "right";
		}> = [];

		let seedCounter = seed;
		const nextRandom = () => {
			seedCounter++;
			return seededRandom(seedCounter);
		};

		// Neon colors palette
		const neonColors = [
			new Color3(1, 0, 0.5),    // Pink
			new Color3(0, 1, 0.8),    // Cyan
			new Color3(1, 0.5, 0),    // Orange
			new Color3(0.5, 0, 1),    // Purple
			finalAccentColor,
		];

		// Place neons along the alley length
		const spacing = 4;
		const count = Math.floor(length / spacing);

		for (let i = 0; i < count; i++) {
			if (nextRandom() > (1 - finalNeonDensity)) {
				const wall = nextRandom() > 0.5 ? "left" : "right";
				const z = position.z + (i + 0.5) * spacing;
				const x = wall === "left"
					? position.x - width / 2 + 0.1
					: position.x + width / 2 - 0.1;
				const y = position.y + wallHeight * (0.4 + nextRandom() * 0.4);

				lights.push({
					id: `${id}_neon_${i}`,
					position: new Vector3(x, y, z),
					color: neonColors[Math.floor(nextRandom() * neonColors.length)],
					rotation: wall === "left" ? Math.PI / 2 : -Math.PI / 2,
					wall,
				});
			}
		}

		return lights;
	}, [id, seed, length, width, wallHeight, position, finalNeonDensity, finalAccentColor]);

	// Generate overhead pipe positions
	const overheadElements = useMemo(() => {
		if (!finalHasOverhead) return [];

		const elements: Array<{
			id: string;
			position: Vector3;
			width: number;
		}> = [];

		let seedCounter = seed + 1000;
		const nextRandom = () => {
			seedCounter++;
			return seededRandom(seedCounter);
		};

		// Cross-pipes at irregular intervals
		const pipeCount = Math.floor(length / 6);
		for (let i = 0; i < pipeCount; i++) {
			if (nextRandom() > 0.3) {
				const z = position.z + (i + 0.5) * (length / pipeCount);
				const y = position.y + wallHeight - 0.5 - nextRandom() * 1;

				elements.push({
					id: `${id}_pipe_${i}`,
					position: new Vector3(position.x, y, z),
					width: width * (0.8 + nextRandom() * 0.2),
				});
			}
		}

		return elements;
	}, [id, seed, length, width, wallHeight, position, finalHasOverhead]);

	return (
		<>
			{/* Left wall */}
			<TexturedWall
				id={`${id}_left_wall`}
				position={new Vector3(
					position.x - width / 2,
					position.y + wallHeight / 2,
					position.z + length / 2
				)}
				size={{ width: 0.3, height: wallHeight, depth: length }}
				textureType={finalWallTexture}
			/>

			{/* Right wall */}
			<TexturedWall
				id={`${id}_right_wall`}
				position={new Vector3(
					position.x + width / 2,
					position.y + wallHeight / 2,
					position.z + length / 2
				)}
				size={{ width: 0.3, height: wallHeight, depth: length }}
				textureType={finalWallTexture}
			/>

			{/* Back wall (dead end) */}
			{deadEnd && (
				<TexturedWall
					id={`${id}_back_wall`}
					position={new Vector3(
						position.x,
						position.y + wallHeight / 2,
						position.z + length
					)}
					size={{ width: width + 0.6, height: wallHeight, depth: 0.3 }}
					textureType={finalWallTexture}
				/>
			)}

			{/* Floor */}
			<Floor
				id={`${id}_floor`}
				position={new Vector3(position.x, position.y, position.z + length / 2)}
				size={{ width: width, depth: length }}
				surface={finalFloorSurface}
			/>

			{/* Neon lights on walls */}
			{neonLights.map((neon) => (
				<NeonSign
					key={neon.id}
					id={neon.id}
					position={neon.position}
					color={neon.color}
					shape="bar"
					size={{ width: 0.8, height: 0.1 }}
					mount="wall"
					rotation={neon.rotation}
					intensity={1.2}
				/>
			))}

			{/* Overhead pipes (using thin floor sections as pipes) */}
			{overheadElements.map((pipe) => (
				<Floor
					key={pipe.id}
					id={pipe.id}
					position={pipe.position}
					size={{ width: pipe.width, depth: 0.15 }}
					surface="metal_grating"
				/>
			))}

			{/* Ambient glow at entrance */}
			<NeonSign
				id={`${id}_entrance_glow`}
				position={new Vector3(
					position.x,
					position.y + 0.1,
					position.z + 0.5
				)}
				color={finalAccentColor}
				shape="rectangle"
				size={{ width: width * 0.8, height: 0.3 }}
				mount="ground"
				intensity={0.5}
			/>

			{/* Back glow for dead ends */}
			{deadEnd && (
				<NeonSign
					id={`${id}_deadend_glow`}
					position={new Vector3(
						position.x,
						position.y + wallHeight * 0.6,
						position.z + length - 0.1
					)}
					color={new Color3(1, 0, 0.3)}
					shape="rectangle"
					size={{ width: width * 0.5, height: 0.3 }}
					mount="wall"
					intensity={0.8}
				/>
			)}
		</>
	);
}

/**
 * Alley presets for common configurations
 */
export const ALLEY_PRESETS = {
	narrow_passage: {
		dimensions: { length: 15, width: 3, wallHeight: 8 },
		mood: "neon" as AlleyMood,
	},
	service_alley: {
		dimensions: { length: 20, width: 4, wallHeight: 6 },
		mood: "industrial" as AlleyMood,
	},
	residential_alley: {
		dimensions: { length: 12, width: 3.5, wallHeight: 10 },
		mood: "residential" as AlleyMood,
	},
	dead_end: {
		dimensions: { length: 10, width: 3, wallHeight: 8 },
		mood: "dark" as AlleyMood,
		deadEnd: true,
	},
};

export default Alley;
