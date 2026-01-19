/**
 * Bridge - Compound component for elevated walkways connecting rooftops
 *
 * A traversable connection between two points:
 * - Walking surface (grating, planks, glass)
 * - Support structure (pylons, cables)
 * - Optional railings
 * - Lighting elements
 * - Can curve or be straight
 *
 * Uses primitives: Floor, TexturedWall, NeonSign
 */

import { Color3, Vector3 } from "@babylonjs/core";
import { useMemo } from "react";
import { Floor, type FloorSurface } from "../components";
import { TexturedWall } from "../components";
import { NeonSign } from "../components";

export type BridgeStyle = "industrial" | "modern" | "makeshift" | "glass";

export interface BridgeProps {
	/** Unique identifier */
	id: string;
	/** Start position */
	startPosition: Vector3;
	/** End position */
	endPosition: Vector3;
	/** Bridge width */
	width?: number;
	/** Bridge style */
	style?: BridgeStyle;
	/** Override walking surface */
	surfaceType?: FloorSurface;
	/** Add railings */
	railings?: boolean;
	/** Railing height */
	railingHeight?: number;
	/** Number of support pylons */
	supportCount?: number;
	/** Add edge lighting */
	edgeLighting?: boolean;
	/** Accent color */
	accentColor?: Color3;
	/** Random seed */
	seed?: number;
}

// Style presets
const STYLE_PRESETS: Record<BridgeStyle, {
	surface: FloorSurface;
	accentColor: Color3;
	hasRailings: boolean;
	railingHeight: number;
}> = {
	industrial: {
		surface: "metal_grating",
		accentColor: new Color3(1, 0.5, 0),
		hasRailings: true,
		railingHeight: 1.0,
	},
	modern: {
		surface: "tile",
		accentColor: new Color3(0, 0.8, 1),
		hasRailings: true,
		railingHeight: 1.2,
	},
	makeshift: {
		surface: "concrete",
		accentColor: new Color3(1, 0.9, 0.5),
		hasRailings: false,
		railingHeight: 0.8,
	},
	glass: {
		surface: "tile",
		accentColor: new Color3(0, 1, 0.8),
		hasRailings: true,
		railingHeight: 1.0,
	},
};

/**
 * Bridge compound component
 */
export function Bridge({
	id,
	startPosition,
	endPosition,
	width = 2,
	style = "industrial",
	surfaceType,
	railings,
	railingHeight,
	supportCount = 0,
	edgeLighting = true,
	accentColor,
}: BridgeProps) {
	const preset = STYLE_PRESETS[style];

	const finalSurface = surfaceType ?? preset.surface;
	const finalAccentColor = accentColor ?? preset.accentColor;
	const finalHasRailings = railings ?? preset.hasRailings;
	const finalRailingHeight = railingHeight ?? preset.railingHeight;

	// Calculate bridge geometry
	const direction = endPosition.subtract(startPosition);
	const length = direction.length();
	const midPoint = startPosition.add(direction.scale(0.5));
	const angle = Math.atan2(direction.x, direction.z);

	// Generate support pylon positions
	const supportPositions = useMemo(() => {
		if (supportCount <= 0) return [];

		const positions: Vector3[] = [];
		for (let i = 1; i <= supportCount; i++) {
			const t = i / (supportCount + 1);
			const pos = startPosition.add(direction.scale(t));
			positions.push(pos);
		}
		return positions;
	}, [startPosition, direction, supportCount]);

	// Generate edge light positions
	const edgeLights = useMemo(() => {
		if (!edgeLighting) return [];

		const lights: Array<{ id: string; position: Vector3; side: "left" | "right" }> = [];
		const spacing = 3;
		const count = Math.floor(length / spacing);

		for (let i = 0; i <= count; i++) {
			const t = count > 0 ? i / count : 0.5;
			const basePos = startPosition.add(direction.scale(t));

			// Calculate perpendicular offset
			const perpX = Math.cos(angle);
			const perpZ = -Math.sin(angle);

			// Left side
			lights.push({
				id: `${id}_light_left_${i}`,
				position: new Vector3(
					basePos.x - perpX * (width / 2 + 0.1),
					basePos.y + 0.05,
					basePos.z - perpZ * (width / 2 + 0.1)
				),
				side: "left",
			});

			// Right side
			lights.push({
				id: `${id}_light_right_${i}`,
				position: new Vector3(
					basePos.x + perpX * (width / 2 + 0.1),
					basePos.y + 0.05,
					basePos.z + perpZ * (width / 2 + 0.1)
				),
				side: "right",
			});
		}

		return lights;
	}, [id, startPosition, direction, length, width, angle, edgeLighting]);

	// Average height for the walking surface
	const avgHeight = (startPosition.y + endPosition.y) / 2;

	return (
		<>
			{/* Main walking surface */}
			<Floor
				id={`${id}_deck`}
				position={new Vector3(midPoint.x, avgHeight, midPoint.z)}
				size={{ width: length, depth: width }}
				surface={finalSurface}
				rotation={angle}
			/>

			{/* Left railing */}
			{finalHasRailings && (
				<>
					<TexturedWall
						id={`${id}_railing_left`}
						position={new Vector3(
							midPoint.x - Math.cos(angle) * (width / 2),
							avgHeight + finalRailingHeight / 2,
							midPoint.z + Math.sin(angle) * (width / 2)
						)}
						size={{ width: length, height: finalRailingHeight, depth: 0.05 }}
						textureType="metal_rusted"
						rotation={angle}
					/>

					{/* Right railing */}
					<TexturedWall
						id={`${id}_railing_right`}
						position={new Vector3(
							midPoint.x + Math.cos(angle) * (width / 2),
							avgHeight + finalRailingHeight / 2,
							midPoint.z - Math.sin(angle) * (width / 2)
						)}
						size={{ width: length, height: finalRailingHeight, depth: 0.05 }}
						textureType="metal_rusted"
						rotation={angle}
					/>
				</>
			)}

			{/* Support pylons */}
			{supportPositions.map((pos, i) => (
				<TexturedWall
					key={`${id}_support_${i}`}
					id={`${id}_support_${i}`}
					position={new Vector3(pos.x, pos.y / 2, pos.z)}
					size={{ width: 0.4, height: pos.y, depth: 0.4 }}
					textureType="metal_rusted"
				/>
			))}

			{/* Edge lighting */}
			{edgeLights.map((light) => (
				<NeonSign
					key={light.id}
					id={light.id}
					position={light.position}
					color={finalAccentColor}
					shape="circle"
					size={{ width: 0.15, height: 0.15 }}
					mount="ground"
					intensity={0.8}
				/>
			))}

			{/* Start marker */}
			<NeonSign
				id={`${id}_start_marker`}
				position={new Vector3(startPosition.x, startPosition.y + 0.05, startPosition.z)}
				color={new Color3(0, 1, 0.5)}
				shape="bar"
				size={{ width: width, height: 0.1 }}
				mount="ground"
				rotation={angle}
				intensity={1.0}
			/>

			{/* End marker */}
			<NeonSign
				id={`${id}_end_marker`}
				position={new Vector3(endPosition.x, endPosition.y + 0.05, endPosition.z)}
				color={new Color3(1, 0, 0.5)}
				shape="bar"
				size={{ width: width, height: 0.1 }}
				mount="ground"
				rotation={angle}
				intensity={1.0}
			/>
		</>
	);
}

/**
 * Bridge presets for common configurations
 */
export const BRIDGE_PRESETS = {
	rooftop_connector: {
		width: 2,
		style: "industrial" as BridgeStyle,
		railings: true,
		edgeLighting: true,
	},
	catwalk: {
		width: 1.5,
		style: "makeshift" as BridgeStyle,
		railings: false,
		edgeLighting: false,
	},
	skybridge: {
		width: 3,
		style: "modern" as BridgeStyle,
		railings: true,
		edgeLighting: true,
		supportCount: 2,
	},
	glass_walkway: {
		width: 2.5,
		style: "glass" as BridgeStyle,
		railings: true,
		edgeLighting: true,
	},
};

export default Bridge;
