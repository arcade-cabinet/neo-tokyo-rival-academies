/**
 * Building - Compound component assembling walls, floors, roof, and signage
 *
 * A complete building structure that can be procedurally configured:
 * - Variable floor count
 * - Rooftop with optional structures
 * - Multiple texture presets
 * - Neon signage placement
 * - Window grid pattern
 *
 * Uses primitives: TexturedWall, Floor, Roof, NeonSign
 */

import { Color3, Vector3 } from "@babylonjs/core";
import { useMemo } from "react";
import { TexturedWall, type WallTextureType } from "../components/TexturedWall";
import { Floor, type FloorSurface } from "../components/Floor";
import { Roof, type RoofStyle } from "../components/Roof";
import { NeonSign, type NeonShape } from "../components/NeonSign";

export type BuildingStyle = "residential" | "commercial" | "industrial" | "office";

export interface BuildingProps {
	/** Unique identifier */
	id: string;
	/** Base position (bottom center of building) */
	position: Vector3;
	/** Building footprint */
	footprint: { width: number; depth: number };
	/** Number of floors (determines height) */
	floors?: number;
	/** Floor height */
	floorHeight?: number;
	/** Building style preset */
	style?: BuildingStyle;
	/** Override wall texture */
	wallTexture?: WallTextureType;
	/** Override rooftop surface */
	rooftopSurface?: FloorSurface;
	/** Roof structure style */
	roofStyle?: RoofStyle | "none";
	/** Neon sign configurations */
	signs?: Array<{
		position: "front" | "side" | "top";
		shape: NeonShape;
		color: Color3;
		floor?: number; // Which floor (0 = ground, -1 = top)
	}>;
	/** Random seed for procedural details */
	seed?: number;
	/** Add rooftop equipment */
	rooftopEquipment?: boolean;
	/** Primary accent color */
	accentColor?: Color3;
}

// Style presets
const STYLE_PRESETS: Record<BuildingStyle, {
	wallTexture: WallTextureType;
	rooftopSurface: FloorSurface;
	roofStyle: RoofStyle | "none";
	accentColor: Color3;
	hasEquipment: boolean;
}> = {
	residential: {
		wallTexture: "brick_grey",
		rooftopSurface: "concrete",
		roofStyle: "none",
		accentColor: new Color3(1, 0.8, 0.3),
		hasEquipment: false,
	},
	commercial: {
		wallTexture: "concrete_dirty",
		rooftopSurface: "concrete",
		roofStyle: "flat",
		accentColor: new Color3(1, 0, 0.5),
		hasEquipment: true,
	},
	industrial: {
		wallTexture: "metal_rusted",
		rooftopSurface: "metal_grating",
		roofStyle: "industrial",
		accentColor: new Color3(1, 0.5, 0),
		hasEquipment: true,
	},
	office: {
		wallTexture: "concrete_clean",
		rooftopSurface: "tile",
		roofStyle: "glass",
		accentColor: new Color3(0, 0.8, 1),
		hasEquipment: true,
	},
};

// Seeded random
function seededRandom(seed: number) {
	const x = Math.sin(seed) * 10000;
	return x - Math.floor(x);
}

/**
 * Building compound component
 */
export function Building({
	id,
	position,
	footprint,
	floors = 3,
	floorHeight = 3,
	style = "commercial",
	wallTexture,
	rooftopSurface,
	roofStyle,
	signs = [],
	seed = 12345,
	rooftopEquipment,
	accentColor,
}: BuildingProps) {
	const preset = STYLE_PRESETS[style];

	const finalWallTexture = wallTexture ?? preset.wallTexture;
	const finalRooftopSurface = rooftopSurface ?? preset.rooftopSurface;
	const finalRoofStyle = roofStyle ?? preset.roofStyle;
	const finalAccentColor = accentColor ?? preset.accentColor;
	const finalHasEquipment = rooftopEquipment ?? preset.hasEquipment;

	const buildingHeight = floors * floorHeight;
	const rooftopY = position.y + buildingHeight;

	// Generate procedural window neon hints
	const windowNeons = useMemo(() => {
		const neons: Array<{ x: number; y: number; z: number; color: Color3 }> = [];
		let seedCounter = seed;

		const nextRandom = () => {
			seedCounter++;
			return seededRandom(seedCounter);
		};

		// Random lit windows on front and sides
		const windowColors = [
			new Color3(1, 0.9, 0.7), // Warm white
			new Color3(0.7, 0.9, 1), // Cool white
			new Color3(1, 0.5, 0.3), // Orange
			finalAccentColor,
		];

		// Front windows
		for (let floor = 0; floor < floors; floor++) {
			const windowCount = Math.floor(footprint.width / 2);
			for (let w = 0; w < windowCount; w++) {
				if (nextRandom() > 0.4) {
					neons.push({
						x: position.x - footprint.width / 2 + 1 + w * 2,
						y: position.y + floor * floorHeight + floorHeight / 2,
						z: position.z - footprint.depth / 2 - 0.01,
						color: windowColors[Math.floor(nextRandom() * windowColors.length)],
					});
				}
			}
		}

		return neons;
	}, [seed, floors, floorHeight, footprint, position, finalAccentColor]);

	// Process sign configurations
	const signElements = useMemo(() => {
		return signs.map((sign, i) => {
			const floorLevel = sign.floor === -1 ? floors - 1 : (sign.floor ?? 0);
			const signY = position.y + floorLevel * floorHeight + floorHeight * 0.7;

			let signPos: Vector3;
			let rotation = 0;

			switch (sign.position) {
				case "front":
					signPos = new Vector3(
						position.x,
						signY,
						position.z - footprint.depth / 2 - 0.1
					);
					break;
				case "side":
					signPos = new Vector3(
						position.x - footprint.width / 2 - 0.1,
						signY,
						position.z
					);
					rotation = Math.PI / 2;
					break;
				case "top":
					signPos = new Vector3(
						position.x,
						rooftopY + 1,
						position.z
					);
					break;
				default:
					signPos = new Vector3(position.x, signY, position.z - footprint.depth / 2 - 0.1);
			}

			return {
				id: `${id}_sign_${i}`,
				position: signPos,
				rotation,
				color: sign.color,
				shape: sign.shape,
			};
		});
	}, [id, signs, floors, floorHeight, footprint, position, rooftopY]);

	return (
		<>
			{/* Front wall */}
			<TexturedWall
				id={`${id}_front`}
				position={new Vector3(
					position.x,
					position.y + buildingHeight / 2,
					position.z - footprint.depth / 2
				)}
				size={{ width: footprint.width, height: buildingHeight, depth: 0.3 }}
				textureType={finalWallTexture}
			/>

			{/* Back wall */}
			<TexturedWall
				id={`${id}_back`}
				position={new Vector3(
					position.x,
					position.y + buildingHeight / 2,
					position.z + footprint.depth / 2
				)}
				size={{ width: footprint.width, height: buildingHeight, depth: 0.3 }}
				textureType={finalWallTexture}
			/>

			{/* Left wall */}
			<TexturedWall
				id={`${id}_left`}
				position={new Vector3(
					position.x - footprint.width / 2,
					position.y + buildingHeight / 2,
					position.z
				)}
				size={{ width: 0.3, height: buildingHeight, depth: footprint.depth }}
				textureType={finalWallTexture}
			/>

			{/* Right wall */}
			<TexturedWall
				id={`${id}_right`}
				position={new Vector3(
					position.x + footprint.width / 2,
					position.y + buildingHeight / 2,
					position.z
				)}
				size={{ width: 0.3, height: buildingHeight, depth: footprint.depth }}
				textureType={finalWallTexture}
			/>

			{/* Rooftop floor */}
			<Floor
				id={`${id}_rooftop`}
				position={new Vector3(position.x, rooftopY, position.z)}
				size={{ width: footprint.width, depth: footprint.depth }}
				surface={finalRooftopSurface}
				edgeTrim={true}
			/>

			{/* Roof structure (if any) */}
			{finalRoofStyle !== "none" && (
				<Roof
					id={`${id}_roof`}
					position={new Vector3(position.x, rooftopY + 2, position.z)}
					size={{ width: footprint.width * 0.6, depth: footprint.depth * 0.4, thickness: 0.1 }}
					style={finalRoofStyle}
					equipment={finalHasEquipment}
					equipmentDensity={2}
					edgeGlow={finalAccentColor}
					seed={seed}
				/>
			)}

			{/* Window neon hints */}
			{windowNeons.slice(0, 15).map((wn, i) => (
				<NeonSign
					key={`${id}_window_${i}`}
					id={`${id}_window_${i}`}
					position={new Vector3(wn.x, wn.y, wn.z)}
					color={wn.color}
					shape="rectangle"
					size={{ width: 0.6, height: 0.4 }}
					mount="wall"
					intensity={0.8}
				/>
			))}

			{/* Configured signs */}
			{signElements.map((sign) => (
				<NeonSign
					key={sign.id}
					id={sign.id}
					position={sign.position}
					color={sign.color}
					shape={sign.shape}
					size={{ width: 2, height: 1.2 }}
					mount="wall"
					rotation={sign.rotation}
				/>
			))}
		</>
	);
}

/**
 * Building presets for common configurations
 */
export const BUILDING_PRESETS = {
	apartment_small: {
		footprint: { width: 8, depth: 8 },
		floors: 4,
		style: "residential" as BuildingStyle,
	},
	apartment_tall: {
		footprint: { width: 10, depth: 10 },
		floors: 8,
		style: "residential" as BuildingStyle,
	},
	shop: {
		footprint: { width: 6, depth: 8 },
		floors: 2,
		style: "commercial" as BuildingStyle,
		signs: [
			{ position: "front" as const, shape: "rectangle" as NeonShape, color: new Color3(1, 0, 0.5) },
		],
	},
	warehouse: {
		footprint: { width: 15, depth: 20 },
		floors: 2,
		style: "industrial" as BuildingStyle,
	},
	office_tower: {
		footprint: { width: 12, depth: 12 },
		floors: 10,
		style: "office" as BuildingStyle,
		signs: [
			{ position: "top" as const, shape: "bar" as NeonShape, color: new Color3(0, 1, 0.8) },
		],
	},
};

export default Building;
