/**
 * Billboard - Large advertisement display component
 *
 * Oversized advertisement structures for cyberpunk cityscapes.
 */

import {
	Color3,
	MeshBuilder,
	PBRMaterial,
	Vector3,
	type AbstractMesh,
} from "@babylonjs/core";
import { useEffect, useRef } from "react";
import { useScene } from "reactylon";
import { createSeededRandom } from "../blocks/Block";

export type BillboardType = "standard" | "digital" | "rooftop" | "wall";
export type BillboardSize = "small" | "medium" | "large" | "massive";

export interface BillboardProps {
	id: string;
	position: Vector3;
	/** Billboard type */
	type?: BillboardType;
	/** Billboard size */
	size?: BillboardSize;
	/** Is powered/lit */
	powered?: boolean;
	/** Display color (for lit billboards) */
	displayColor?: Color3;
	/** Direction billboard faces (radians) */
	rotation?: number;
	/** Damage/weathering 0-1 */
	damage?: number;
	/** Seed for procedural variation */
	seed?: number;
}

const SIZE_DIMENSIONS: Record<BillboardSize, { width: number; height: number }> = {
	small: { width: 2, height: 1.5 },
	medium: { width: 4, height: 3 },
	large: { width: 8, height: 4 },
	massive: { width: 16, height: 8 },
};

export function Billboard({
	id,
	position,
	type = "standard",
	size = "medium",
	powered = true,
	displayColor,
	rotation = 0,
	damage = 0,
	seed,
}: BillboardProps) {
	const scene = useScene();
	const meshRef = useRef<AbstractMesh[]>([]);

	const posX = position.x;
	const posY = position.y;
	const posZ = position.z;

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
		const rng = seed !== undefined ? createSeededRandom(seed) : null;

		const dims = SIZE_DIMENSIONS[size];
		const damageVariation = damage * (rng ? rng.next() * 0.1 : 0.05);

		// Frame material
		const frameMat = new PBRMaterial(`billboard_frame_${id}`, scene);
		frameMat.albedoColor = new Color3(
			0.35 - damageVariation,
			0.35 - damageVariation,
			0.38 - damageVariation
		);
		frameMat.metallic = 0.8;
		frameMat.roughness = 0.5 + damage * 0.2;

		// Display color
		const baseDisplayColor = displayColor ?? (rng
			? new Color3(rng.next() * 0.5 + 0.5, rng.next() * 0.5, rng.next() * 0.5)
			: new Color3(0.8, 0.3, 0.3));

		// Display material
		const displayMat = new PBRMaterial(`billboard_display_${id}`, scene);
		displayMat.albedoColor = powered
			? baseDisplayColor
			: new Color3(0.2, 0.2, 0.22);
		if (powered) {
			displayMat.emissiveColor = baseDisplayColor.scale(0.7);
		}
		displayMat.metallic = 0;
		displayMat.roughness = powered ? 0.3 : 0.6;

		const frameThickness = dims.width * 0.03;
		const displayThickness = 0.1;

		if (type === "standard" || type === "digital") {
			// Support posts
			const postHeight = dims.height * 1.5;
			const postSpacing = dims.width * 0.7;

			for (const side of [-1, 1]) {
				const post = MeshBuilder.CreateCylinder(
					`${id}_post_${side}`,
					{ height: postHeight, diameter: frameThickness * 2 },
					scene
				);
				post.position = new Vector3(
					posX + Math.cos(rotation) * (side * postSpacing / 2),
					posY + postHeight / 2,
					posZ - Math.sin(rotation) * (side * postSpacing / 2)
				);
				post.material = frameMat;
				meshes.push(post);
			}

			// Cross beam
			const beam = MeshBuilder.CreateBox(
				`${id}_beam`,
				{ width: postSpacing + frameThickness * 2, height: frameThickness, depth: frameThickness },
				scene
			);
			beam.position = new Vector3(posX, posY + postHeight - dims.height / 2 - frameThickness, posZ);
			beam.rotation.y = rotation;
			beam.material = frameMat;
			meshes.push(beam);

			// Display panel
			const display = MeshBuilder.CreateBox(
				`${id}_display`,
				{ width: dims.width, height: dims.height, depth: displayThickness },
				scene
			);
			display.position = new Vector3(
				posX + Math.sin(rotation) * (displayThickness / 2),
				posY + postHeight,
				posZ + Math.cos(rotation) * (displayThickness / 2)
			);
			display.rotation.y = rotation;
			display.material = displayMat;
			meshes.push(display);

			// Frame border
			for (const edge of ["top", "bottom", "left", "right"]) {
				let edgeW = dims.width;
				let edgeH = frameThickness;
				let edgeX = 0;
				let edgeY = 0;

				if (edge === "top") {
					edgeY = dims.height / 2 + frameThickness / 2;
				} else if (edge === "bottom") {
					edgeY = -dims.height / 2 - frameThickness / 2;
				} else if (edge === "left") {
					edgeW = frameThickness;
					edgeH = dims.height + frameThickness * 2;
					edgeX = -dims.width / 2 - frameThickness / 2;
				} else {
					edgeW = frameThickness;
					edgeH = dims.height + frameThickness * 2;
					edgeX = dims.width / 2 + frameThickness / 2;
				}

				const frame = MeshBuilder.CreateBox(
					`${id}_frame_${edge}`,
					{ width: edgeW, height: edgeH, depth: displayThickness + 0.05 },
					scene
				);
				frame.position = new Vector3(
					posX + Math.sin(rotation) * (displayThickness / 2) + Math.cos(rotation) * edgeX,
					posY + postHeight + edgeY,
					posZ + Math.cos(rotation) * (displayThickness / 2) - Math.sin(rotation) * edgeX
				);
				frame.rotation.y = rotation;
				frame.material = frameMat;
				meshes.push(frame);
			}

			// Digital screen effects
			if (type === "digital" && powered) {
				// Scan lines effect (simplified as horizontal bars)
				const lineCount = Math.floor(dims.height * 5);
				const lineMat = new PBRMaterial(`billboard_line_${id}`, scene);
				lineMat.albedoColor = new Color3(0, 0, 0);
				lineMat.metallic = 0;
				lineMat.roughness = 0.5;
				lineMat.alpha = 0.1;

				for (let i = 0; i < lineCount; i += 2) {
					const line = MeshBuilder.CreateBox(
						`${id}_line_${i}`,
						{ width: dims.width * 0.99, height: dims.height / lineCount, depth: 0.01 },
						scene
					);
					line.position = new Vector3(
						posX + Math.sin(rotation) * (displayThickness + 0.01),
						posY + postHeight - dims.height / 2 + (i + 0.5) * (dims.height / lineCount),
						posZ + Math.cos(rotation) * (displayThickness + 0.01)
					);
					line.rotation.y = rotation;
					line.material = lineMat;
					meshes.push(line);
				}
			}
		} else if (type === "rooftop") {
			// Flat rooftop billboard
			const display = MeshBuilder.CreateBox(
				`${id}_display`,
				{ width: dims.width, height: dims.height, depth: displayThickness },
				scene
			);
			display.position = new Vector3(
				posX + Math.sin(rotation) * (displayThickness / 2),
				posY + dims.height / 2,
				posZ + Math.cos(rotation) * (displayThickness / 2)
			);
			display.rotation.y = rotation;
			display.material = displayMat;
			meshes.push(display);

			// Support struts
			const strutCount = size === "massive" ? 4 : size === "large" ? 3 : 2;
			for (let i = 0; i < strutCount; i++) {
				const strutX = (i - (strutCount - 1) / 2) * (dims.width / (strutCount + 1));
				const strut = MeshBuilder.CreateBox(
					`${id}_strut_${i}`,
					{ width: frameThickness, height: dims.height * 0.8, depth: frameThickness * 3 },
					scene
				);
				strut.position = new Vector3(
					posX - Math.sin(rotation) * (dims.height * 0.3) + Math.cos(rotation) * strutX,
					posY + dims.height * 0.4,
					posZ - Math.cos(rotation) * (dims.height * 0.3) - Math.sin(rotation) * strutX
				);
				strut.rotation.y = rotation;
				strut.rotation.x = Math.PI / 8;
				strut.material = frameMat;
				meshes.push(strut);
			}
		} else if (type === "wall") {
			// Wall-mounted billboard
			const display = MeshBuilder.CreateBox(
				`${id}_display`,
				{ width: dims.width, height: dims.height, depth: displayThickness },
				scene
			);
			display.position = new Vector3(
				posX + Math.sin(rotation) * (displayThickness / 2),
				posY + dims.height / 2,
				posZ + Math.cos(rotation) * (displayThickness / 2)
			);
			display.rotation.y = rotation;
			display.material = displayMat;
			meshes.push(display);

			// Mounting brackets
			for (const corner of [[-1, -1], [-1, 1], [1, -1], [1, 1]]) {
				const bracket = MeshBuilder.CreateBox(
					`${id}_bracket_${corner.join("_")}`,
					{ width: 0.1, height: 0.1, depth: 0.2 },
					scene
				);
				bracket.position = new Vector3(
					posX - Math.sin(rotation) * 0.1 + Math.cos(rotation) * (corner[0] * dims.width * 0.4),
					posY + dims.height / 2 + corner[1] * dims.height * 0.4,
					posZ - Math.cos(rotation) * 0.1 - Math.sin(rotation) * (corner[0] * dims.width * 0.4)
				);
				bracket.rotation.y = rotation;
				bracket.material = frameMat;
				meshes.push(bracket);
			}
		}

		// Damage effects
		if (damage > 0.3 && rng) {
			// Broken/dark sections
			const brokenMat = new PBRMaterial(`billboard_broken_${id}`, scene);
			brokenMat.albedoColor = new Color3(0.1, 0.1, 0.12);
			brokenMat.metallic = 0;
			brokenMat.roughness = 0.8;

			const brokenCount = Math.floor(damage * 4);
			for (let i = 0; i < brokenCount; i++) {
				const broken = MeshBuilder.CreateBox(
					`${id}_broken_${i}`,
					{
						width: dims.width * (0.1 + rng.next() * 0.2),
						height: dims.height * (0.1 + rng.next() * 0.2),
						depth: 0.02,
					},
					scene
				);

				const offsetX = (rng.next() - 0.5) * dims.width * 0.7;
				const offsetY = (rng.next() - 0.5) * dims.height * 0.7;
				const displayY = type === "standard" || type === "digital"
					? posY + dims.height * 1.5
					: posY + dims.height / 2;

				broken.position = new Vector3(
					posX + Math.sin(rotation) * (displayThickness + 0.02) + Math.cos(rotation) * offsetX,
					displayY + offsetY,
					posZ + Math.cos(rotation) * (displayThickness + 0.02) - Math.sin(rotation) * offsetX
				);
				broken.rotation.y = rotation;
				broken.material = brokenMat;
				meshes.push(broken);
			}
		}

		// Lighting (if powered and standard/rooftop)
		if (powered && (type === "standard" || type === "rooftop")) {
			const lightMat = new PBRMaterial(`billboard_light_${id}`, scene);
			lightMat.albedoColor = new Color3(1, 0.95, 0.8);
			lightMat.emissiveColor = new Color3(1, 0.95, 0.8);
			lightMat.metallic = 0;
			lightMat.roughness = 0.3;

			const lightCount = size === "massive" ? 6 : size === "large" ? 4 : 2;
			for (let i = 0; i < lightCount; i++) {
				const lightX = (i - (lightCount - 1) / 2) * (dims.width / lightCount);
				const light = MeshBuilder.CreateBox(
					`${id}_light_${i}`,
					{ width: 0.2, height: 0.1, depth: 0.15 },
					scene
				);
				const displayY = type === "standard" ? posY + dims.height * 2 : posY + dims.height;
				light.position = new Vector3(
					posX + Math.sin(rotation) * (displayThickness + 0.2) + Math.cos(rotation) * lightX,
					displayY + dims.height / 2 + 0.1,
					posZ + Math.cos(rotation) * (displayThickness + 0.2) - Math.sin(rotation) * lightX
				);
				light.rotation.y = rotation;
				light.rotation.x = -Math.PI / 6;
				light.material = lightMat;
				meshes.push(light);
			}
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			frameMat.dispose();
			displayMat.dispose();
		};
	}, [scene, id, posX, posY, posZ, type, size, powered, displayColor, rotation, damage, seed]);

	return null;
}
