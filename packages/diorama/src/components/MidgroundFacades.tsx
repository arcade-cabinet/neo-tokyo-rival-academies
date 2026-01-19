/**
 * MidgroundFacades Component
 *
 * Creates 3D building facades that frame the playable area.
 * Part of the isometric diorama's Layer 2 (z: -5 to -20).
 */

import {
	Color3,
	MeshBuilder,
	StandardMaterial,
	Vector3,
	type AbstractMesh,
	type Scene,
} from "@babylonjs/core";
import { useEffect, useRef } from "react";
import { useScene } from "reactylon";

export interface MidgroundFacadesProps {
	/** Left boundary X position */
	minX: number;
	/** Right boundary X position */
	maxX: number;
	/** Facade height */
	height?: number;
	/** Z depth for facades (negative = further back) */
	depth?: number;
}

interface WindowConfig {
	rows: number;
	cols: number;
	startY: number;
	spacing: number;
}

export function MidgroundFacades({
	minX,
	maxX,
	height = 25,
	depth = -8,
}: MidgroundFacadesProps) {
	const scene = useScene();
	const meshesRef = useRef<AbstractMesh[]>([]);

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];

		// Create materials
		const { buildingMat, windowMat, neonMat, roofMat } =
			createFacadeMaterials(scene);

		// Left building facade
		const leftFacade = createBuildingFacade(
			scene,
			"leftFacade",
			{
				width: 12,
				height: height,
				depth: 6,
				position: new Vector3(minX - 6, height / 2, depth),
			},
			buildingMat,
		);
		meshes.push(leftFacade);

		// Left building windows
		const leftWindows = createWindowGrid(
			scene,
			"leftWindows",
			{
				parentPos: new Vector3(minX - 0.5, 0, depth),
				width: 10,
				windowConfig: { rows: 5, cols: 3, startY: 3, spacing: 4 },
			},
			windowMat,
		);
		meshes.push(...leftWindows);

		// Left neon sign - "ARCADE"
		const arcadeSign = createNeonSign(
			scene,
			"arcadeSign",
			new Vector3(minX - 3, height - 5, depth + 3),
			{ width: 6, height: 2 },
			new Color3(1, 0, 0.6), // Pink neon
		);
		meshes.push(arcadeSign);

		// Right building facade
		const rightFacade = createBuildingFacade(
			scene,
			"rightFacade",
			{
				width: 12,
				height: height,
				depth: 6,
				position: new Vector3(maxX + 6, height / 2, depth),
			},
			buildingMat,
		);
		meshes.push(rightFacade);

		// Right building windows
		const rightWindows = createWindowGrid(
			scene,
			"rightWindows",
			{
				parentPos: new Vector3(maxX + 0.5, 0, depth),
				width: 10,
				windowConfig: { rows: 5, cols: 3, startY: 3, spacing: 4 },
			},
			windowMat,
		);
		meshes.push(...rightWindows);

		// Right neon sign - "CYBER"
		const cyberSign = createNeonSign(
			scene,
			"cyberSign",
			new Vector3(maxX + 3, height - 8, depth + 3),
			{ width: 5, height: 1.5 },
			new Color3(0, 1, 0.8), // Cyan neon
		);
		meshes.push(cyberSign);

		// Fire escape on right building
		const fireEscape = createFireEscape(
			scene,
			"fireEscape",
			new Vector3(maxX + 1, 0, depth + 2.5),
			height - 5,
		);
		meshes.push(...fireEscape);

		// Water tank on right rooftop
		const waterTank = createWaterTank(
			scene,
			"waterTank",
			new Vector3(maxX + 8, height + 2, depth - 2),
		);
		meshes.push(waterTank);

		// Back rooftop (lower platform behind play area)
		const backRoof = MeshBuilder.CreateBox(
			"backRoof",
			{
				width: maxX - minX + 24,
				height: 1,
				depth: 15,
			},
			scene,
		);
		backRoof.position = new Vector3(0, 2, depth - 10);
		backRoof.material = roofMat;
		meshes.push(backRoof);

		// Back rooftop AC units
		const acPositions = [
			new Vector3(-10, 3.5, depth - 8),
			new Vector3(5, 3.5, depth - 12),
			new Vector3(12, 3.5, depth - 9),
		];
		for (let i = 0; i < acPositions.length; i++) {
			const ac = createACUnit(scene, `backAC_${i}`, acPositions[i]);
			meshes.push(ac);
		}

		meshesRef.current = meshes;

		return () => {
			for (const mesh of meshesRef.current) {
				mesh.dispose();
			}
			buildingMat.dispose();
			windowMat.dispose();
			neonMat.dispose();
			roofMat.dispose();
			meshesRef.current = [];
		};
	}, [scene, minX, maxX, height, depth]);

	return null;
}

/**
 * Create materials for building facades
 */
function createFacadeMaterials(scene: Scene) {
	// Dark concrete building material
	const buildingMat = new StandardMaterial("buildingMat", scene);
	buildingMat.diffuseColor = new Color3(0.15, 0.15, 0.18);
	buildingMat.specularColor = new Color3(0.05, 0.05, 0.05);

	// Glowing window material
	const windowMat = new StandardMaterial("windowMat", scene);
	windowMat.diffuseColor = new Color3(0.1, 0.1, 0.15);
	windowMat.emissiveColor = new Color3(0.3, 0.35, 0.5);
	windowMat.specularColor = new Color3(0, 0, 0);

	// Neon sign material (base - will be overridden per sign)
	const neonMat = new StandardMaterial("neonMat", scene);
	neonMat.emissiveColor = new Color3(1, 0, 1);
	neonMat.specularColor = new Color3(0, 0, 0);

	// Rooftop material
	const roofMat = new StandardMaterial("roofMat", scene);
	roofMat.diffuseColor = new Color3(0.12, 0.12, 0.14);
	roofMat.specularColor = new Color3(0, 0, 0);

	return { buildingMat, windowMat, neonMat, roofMat };
}

/**
 * Create a building facade box
 */
function createBuildingFacade(
	scene: Scene,
	name: string,
	config: { width: number; height: number; depth: number; position: Vector3 },
	material: StandardMaterial,
): AbstractMesh {
	const facade = MeshBuilder.CreateBox(
		name,
		{
			width: config.width,
			height: config.height,
			depth: config.depth,
		},
		scene,
	);
	facade.position = config.position;
	facade.material = material;
	return facade;
}

/**
 * Create a grid of glowing windows
 */
function createWindowGrid(
	scene: Scene,
	name: string,
	config: {
		parentPos: Vector3;
		width: number;
		windowConfig: WindowConfig;
	},
	material: StandardMaterial,
): AbstractMesh[] {
	const windows: AbstractMesh[] = [];
	const { rows, cols, startY, spacing } = config.windowConfig;
	const windowWidth = 1.2;
	const windowHeight = 1.8;

	for (let row = 0; row < rows; row++) {
		for (let col = 0; col < cols; col++) {
			// Randomly skip some windows for variety
			if (Math.random() < 0.15) continue;

			const win = MeshBuilder.CreateBox(
				`${name}_${row}_${col}`,
				{
					width: windowWidth,
					height: windowHeight,
					depth: 0.3,
				},
				scene,
			);

			const xOffset = (col - (cols - 1) / 2) * spacing;
			const yOffset = startY + row * spacing;

			win.position = new Vector3(
				config.parentPos.x + xOffset,
				config.parentPos.y + yOffset,
				config.parentPos.z,
			);

			// Vary window brightness
			const windowMat = material.clone(`${name}_mat_${row}_${col}`);
			const brightness = 0.2 + Math.random() * 0.4;
			windowMat.emissiveColor = new Color3(
				brightness * 0.6,
				brightness * 0.7,
				brightness,
			);
			win.material = windowMat;

			windows.push(win);
		}
	}

	return windows;
}

/**
 * Create a glowing neon sign
 */
function createNeonSign(
	scene: Scene,
	name: string,
	position: Vector3,
	size: { width: number; height: number },
	color: Color3,
): AbstractMesh {
	const sign = MeshBuilder.CreateBox(
		name,
		{
			width: size.width,
			height: size.height,
			depth: 0.3,
		},
		scene,
	);
	sign.position = position;

	const signMat = new StandardMaterial(`${name}_mat`, scene);
	signMat.diffuseColor = color.scale(0.3);
	signMat.emissiveColor = color;
	signMat.specularColor = new Color3(0, 0, 0);
	sign.material = signMat;

	return sign;
}

/**
 * Create a simple fire escape structure
 */
function createFireEscape(
	scene: Scene,
	name: string,
	position: Vector3,
	height: number,
): AbstractMesh[] {
	const parts: AbstractMesh[] = [];
	const platformCount = Math.floor(height / 5);

	// Metal material
	const metalMat = new StandardMaterial(`${name}_metal`, scene);
	metalMat.diffuseColor = new Color3(0.2, 0.2, 0.22);
	metalMat.specularColor = new Color3(0.3, 0.3, 0.3);

	// Vertical rails
	for (let side = 0; side < 2; side++) {
		const rail = MeshBuilder.CreateBox(
			`${name}_rail_${side}`,
			{ width: 0.1, height: height, depth: 0.1 },
			scene,
		);
		rail.position = new Vector3(
			position.x + (side === 0 ? -1.5 : 1.5),
			position.y + height / 2,
			position.z,
		);
		rail.material = metalMat;
		parts.push(rail);
	}

	// Platforms
	for (let i = 0; i < platformCount; i++) {
		const platform = MeshBuilder.CreateBox(
			`${name}_platform_${i}`,
			{ width: 3.5, height: 0.15, depth: 2 },
			scene,
		);
		platform.position = new Vector3(
			position.x,
			position.y + 3 + i * 5,
			position.z,
		);
		platform.material = metalMat;
		parts.push(platform);
	}

	return parts;
}

/**
 * Create a rooftop water tank
 */
function createWaterTank(
	scene: Scene,
	name: string,
	position: Vector3,
): AbstractMesh {
	const tank = MeshBuilder.CreateCylinder(
		name,
		{
			height: 4,
			diameter: 3,
			tessellation: 12,
		},
		scene,
	);
	tank.position = position;

	const tankMat = new StandardMaterial(`${name}_mat`, scene);
	tankMat.diffuseColor = new Color3(0.3, 0.25, 0.2);
	tankMat.specularColor = new Color3(0.1, 0.1, 0.1);
	tank.material = tankMat;

	return tank;
}

/**
 * Create a simple AC unit box
 */
function createACUnit(
	scene: Scene,
	name: string,
	position: Vector3,
): AbstractMesh {
	const ac = MeshBuilder.CreateBox(
		name,
		{ width: 2, height: 1.5, depth: 1.5 },
		scene,
	);
	ac.position = position;

	const acMat = new StandardMaterial(`${name}_mat`, scene);
	acMat.diffuseColor = new Color3(0.4, 0.42, 0.45);
	acMat.specularColor = new Color3(0.1, 0.1, 0.1);
	ac.material = acMat;

	return ac;
}
