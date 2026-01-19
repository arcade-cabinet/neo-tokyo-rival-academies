/**
 * Room - Compound component for interior spaces
 *
 * An enclosed interior room:
 * - Floor with variable surface
 * - Walls (configurable which are present)
 * - Ceiling (optional)
 * - Doorways and windows
 * - Interior lighting
 * - Optional props placement areas
 *
 * Uses primitives: Floor, TexturedWall, NeonSign
 */

import { Color3, Vector3 } from "@babylonjs/core";
import { useMemo } from "react";
import { Floor, type FloorSurface } from "../components/Floor";
import { TexturedWall, type WallTextureType } from "../components/TexturedWall";
import { NeonSign } from "../components/NeonSign";

export type RoomStyle = "residential" | "office" | "industrial" | "shop" | "club";

export interface DoorwayConfig {
	wall: "north" | "south" | "east" | "west";
	position: number; // 0-1 along wall
	width: number;
	height: number;
}

export interface RoomProps {
	/** Unique identifier */
	id: string;
	/** Room position (center of floor) */
	position: Vector3;
	/** Room dimensions */
	dimensions: {
		width: number;   // X dimension
		depth: number;   // Z dimension
		height: number;  // Y dimension
	};
	/** Room style affects textures and lighting */
	style?: RoomStyle;
	/** Override floor surface */
	floorSurface?: FloorSurface;
	/** Override wall texture */
	wallTexture?: WallTextureType;
	/** Include ceiling */
	hasCeiling?: boolean;
	/** Which walls to include (default: all) */
	walls?: {
		north?: boolean;
		south?: boolean;
		east?: boolean;
		west?: boolean;
	};
	/** Doorway configurations */
	doorways?: DoorwayConfig[];
	/** Primary accent color */
	accentColor?: Color3;
	/** Random seed for procedural details */
	seed?: number;
	/** Enable ceiling lights */
	ceilingLights?: boolean;
	/** Ambient light level (0-1) */
	ambientLevel?: number;
}

// Style presets
const STYLE_PRESETS: Record<RoomStyle, {
	floorSurface: FloorSurface;
	wallTexture: WallTextureType;
	accentColor: Color3;
	hasCeiling: boolean;
	ceilingLights: boolean;
}> = {
	residential: {
		floorSurface: "wood",
		wallTexture: "concrete_clean",
		accentColor: new Color3(1, 0.9, 0.7),
		hasCeiling: true,
		ceilingLights: true,
	},
	office: {
		floorSurface: "tile",
		wallTexture: "concrete_clean",
		accentColor: new Color3(0.8, 0.9, 1),
		hasCeiling: true,
		ceilingLights: true,
	},
	industrial: {
		floorSurface: "concrete",
		wallTexture: "metal_rusted",
		accentColor: new Color3(1, 0.5, 0),
		hasCeiling: false,
		ceilingLights: false,
	},
	shop: {
		floorSurface: "tile",
		wallTexture: "concrete_dirty",
		accentColor: new Color3(1, 0, 0.5),
		hasCeiling: true,
		ceilingLights: true,
	},
	club: {
		floorSurface: "tile",
		wallTexture: "concrete_dirty",
		accentColor: new Color3(0.5, 0, 1),
		hasCeiling: true,
		ceilingLights: true,
	},
};

// Seeded random helper
function seededRandom(seed: number) {
	const x = Math.sin(seed) * 10000;
	return x - Math.floor(x);
}

/**
 * Room compound component
 */
export function Room({
	id,
	position,
	dimensions,
	style = "residential",
	floorSurface,
	wallTexture,
	hasCeiling,
	walls = { north: true, south: true, east: true, west: true },
	accentColor,
	seed = 42,
	ceilingLights,
	ambientLevel = 0.3,
}: RoomProps) {
	const preset = STYLE_PRESETS[style];

	const finalFloorSurface = floorSurface ?? preset.floorSurface;
	const finalWallTexture = wallTexture ?? preset.wallTexture;
	const finalAccentColor = accentColor ?? preset.accentColor;
	const finalHasCeiling = hasCeiling ?? preset.hasCeiling;
	const finalCeilingLights = ceilingLights ?? preset.ceilingLights;

	const { width, depth, height } = dimensions;

	// Generate ceiling light positions
	const ceilingLightPositions = useMemo(() => {
		if (!finalCeilingLights || !finalHasCeiling) return [];

		const lights: Array<{ id: string; position: Vector3 }> = [];

		// Grid of ceiling lights
		const spacingX = 4;
		const spacingZ = 4;
		const countX = Math.max(1, Math.floor(width / spacingX));
		const countZ = Math.max(1, Math.floor(depth / spacingZ));

		for (let ix = 0; ix < countX; ix++) {
			for (let iz = 0; iz < countZ; iz++) {
				const x = position.x - width / 2 + (ix + 0.5) * (width / countX);
				const z = position.z - depth / 2 + (iz + 0.5) * (depth / countZ);
				lights.push({
					id: `${id}_ceiling_light_${ix}_${iz}`,
					position: new Vector3(x, position.y + height - 0.1, z),
				});
			}
		}

		return lights;
	}, [id, position, width, depth, height, finalCeilingLights, finalHasCeiling]);

	// Generate wall accent lights
	const wallLights = useMemo(() => {
		const lights: Array<{
			id: string;
			position: Vector3;
			rotation: number;
		}> = [];

		let seedCounter = seed;
		const nextRandom = () => {
			seedCounter++;
			return seededRandom(seedCounter);
		};

		// Accent lights on walls at varying heights
		const addWallLights = (
			wallName: string,
			wallX: number,
			wallZ: number,
			isXWall: boolean,
			wallLength: number
		) => {
			const count = Math.floor(wallLength / 5);
			for (let i = 0; i < count; i++) {
				if (nextRandom() > 0.5) {
					const offset = (i + 0.5) * (wallLength / count) - wallLength / 2;
					lights.push({
						id: `${id}_wall_light_${wallName}_${i}`,
						position: new Vector3(
							isXWall ? position.x + offset : wallX,
							position.y + height * (0.5 + nextRandom() * 0.3),
							isXWall ? wallZ : position.z + offset
						),
						rotation: isXWall ? 0 : Math.PI / 2,
					});
				}
			}
		};

		if (walls.north) addWallLights("north", 0, position.z - depth / 2, true, width);
		if (walls.south) addWallLights("south", 0, position.z + depth / 2, true, width);
		if (walls.east) addWallLights("east", position.x + width / 2, 0, false, depth);
		if (walls.west) addWallLights("west", position.x - width / 2, 0, false, depth);

		return lights;
	}, [id, seed, position, width, depth, height, walls]);

	return (
		<>
			{/* Floor */}
			<Floor
				id={`${id}_floor`}
				position={position}
				size={{ width, depth }}
				surface={finalFloorSurface}
			/>

			{/* Ceiling */}
			{finalHasCeiling && (
				<Floor
					id={`${id}_ceiling`}
					position={new Vector3(position.x, position.y + height, position.z)}
					size={{ width, depth }}
					surface="concrete"
				/>
			)}

			{/* North wall (front, -Z) */}
			{walls.north && (
				<TexturedWall
					id={`${id}_wall_north`}
					position={new Vector3(
						position.x,
						position.y + height / 2,
						position.z - depth / 2
					)}
					size={{ width, height, depth: 0.2 }}
					textureType={finalWallTexture}
					neonAccent={finalAccentColor}
				/>
			)}

			{/* South wall (back, +Z) */}
			{walls.south && (
				<TexturedWall
					id={`${id}_wall_south`}
					position={new Vector3(
						position.x,
						position.y + height / 2,
						position.z + depth / 2
					)}
					size={{ width, height, depth: 0.2 }}
					textureType={finalWallTexture}
				/>
			)}

			{/* East wall (right, +X) */}
			{walls.east && (
				<TexturedWall
					id={`${id}_wall_east`}
					position={new Vector3(
						position.x + width / 2,
						position.y + height / 2,
						position.z
					)}
					size={{ width: 0.2, height, depth }}
					textureType={finalWallTexture}
					neonAccent={finalAccentColor}
				/>
			)}

			{/* West wall (left, -X) */}
			{walls.west && (
				<TexturedWall
					id={`${id}_wall_west`}
					position={new Vector3(
						position.x - width / 2,
						position.y + height / 2,
						position.z
					)}
					size={{ width: 0.2, height, depth }}
					textureType={finalWallTexture}
				/>
			)}

			{/* Ceiling lights */}
			{ceilingLightPositions.map((light) => (
				<NeonSign
					key={light.id}
					id={light.id}
					position={light.position}
					color={new Color3(1, 1, 1)}
					shape="rectangle"
					size={{ width: 0.8, height: 0.4 }}
					mount="ground"
					intensity={1.5}
				/>
			))}

			{/* Wall accent lights */}
			{wallLights.map((light) => (
				<NeonSign
					key={light.id}
					id={light.id}
					position={light.position}
					color={finalAccentColor}
					shape="bar"
					size={{ width: 0.8, height: 0.1 }}
					mount="wall"
					rotation={light.rotation}
					intensity={0.8}
				/>
			))}

			{/* Ambient floor glow */}
			<NeonSign
				id={`${id}_ambient_glow`}
				position={new Vector3(position.x, position.y + 0.05, position.z)}
				color={finalAccentColor}
				shape="rectangle"
				size={{ width: width * 0.6, height: depth * 0.6 }}
				mount="ground"
				intensity={ambientLevel}
			/>
		</>
	);
}

/**
 * Room presets for common configurations
 */
export const ROOM_PRESETS = {
	small_apartment: {
		dimensions: { width: 6, depth: 5, height: 3 },
		style: "residential" as RoomStyle,
	},
	large_office: {
		dimensions: { width: 12, depth: 10, height: 3.5 },
		style: "office" as RoomStyle,
	},
	warehouse_section: {
		dimensions: { width: 15, depth: 15, height: 6 },
		style: "industrial" as RoomStyle,
		hasCeiling: false,
	},
	corner_shop: {
		dimensions: { width: 8, depth: 6, height: 3 },
		style: "shop" as RoomStyle,
		walls: { north: false, south: true, east: true, west: true },
	},
	nightclub: {
		dimensions: { width: 20, depth: 15, height: 4 },
		style: "club" as RoomStyle,
	},
	corridor: {
		dimensions: { width: 3, depth: 12, height: 3 },
		style: "office" as RoomStyle,
		walls: { north: true, south: true, east: false, west: false },
	},
};

export default Room;
