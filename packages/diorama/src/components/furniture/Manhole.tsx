/**
 * Manhole - Manhole cover component
 *
 * Various manhole cover styles for the flooded neo-tokyo city streets.
 */

import {
	type AbstractMesh,
	Color3,
	MeshBuilder,
	PBRMaterial,
	Vector3,
} from "@babylonjs/core";
import { useEffect, useRef } from "react";
import { useScene } from "reactylon";
import { createSeededRandom } from "../../world/blocks/Block";

export type ManholeType = "round" | "square" | "utility" | "decorative";
export type ManholeState = "closed" | "open" | "missing" | "flooded";
export type ManholeCondition = "new" | "weathered" | "rusted" | "damaged";

export interface ManholeProps {
	id: string;
	position: Vector3;
	/** Manhole type/style */
	type?: ManholeType;
	/** State of the manhole */
	state?: ManholeState;
	/** Visual condition */
	condition?: ManholeCondition;
	/** Rotation (radians) */
	rotation?: number;
	/** Seed for procedural variation */
	seed?: number;
}

export function Manhole({
	id,
	position,
	type = "round",
	state = "closed",
	condition = "weathered",
	rotation = 0,
	seed,
}: ManholeProps) {
	const scene = useScene();
	const meshRef = useRef<AbstractMesh[]>([]);

	const posX = position.x;
	const posY = position.y;
	const posZ = position.z;

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
		const rng = seed !== undefined ? createSeededRandom(seed) : null;

		// Condition factors for weathering
		const conditionFactor =
			condition === "new"
				? 1
				: condition === "weathered"
					? 0.8
					: condition === "rusted"
						? 0.6
						: 0.45;

		// Materials
		const coverMat = new PBRMaterial(`manhole_cover_${id}`, scene);
		coverMat.albedoColor = new Color3(0.3, 0.3, 0.32).scale(conditionFactor);
		coverMat.metallic = condition === "rusted" ? 0.6 : 0.85;
		coverMat.roughness = condition === "rusted" ? 0.75 : 0.55;

		const frameMat = new PBRMaterial(`manhole_frame_${id}`, scene);
		frameMat.albedoColor = new Color3(0.25, 0.25, 0.27).scale(conditionFactor);
		frameMat.metallic = 0.8;
		frameMat.roughness = 0.5;

		const holeMat = new PBRMaterial(`manhole_hole_${id}`, scene);
		holeMat.albedoColor = new Color3(0.02, 0.02, 0.03);
		holeMat.metallic = 0;
		holeMat.roughness = 1;

		const coverDiameter = 0.65;
		const coverThickness = 0.03;
		const frameThickness = 0.05;

		if (type === "round") {
			// Standard round manhole cover
			// Frame/ring
			const frame = MeshBuilder.CreateTorus(
				`${id}_frame`,
				{ diameter: coverDiameter + frameThickness, thickness: frameThickness },
				scene,
			);
			frame.position = new Vector3(posX, posY + frameThickness / 2, posZ);
			frame.rotation.x = Math.PI / 2;
			frame.material = frameMat;
			meshes.push(frame);

			if (state === "closed") {
				// Cover
				const cover = MeshBuilder.CreateCylinder(
					`${id}_cover`,
					{ height: coverThickness, diameter: coverDiameter },
					scene,
				);
				cover.position = new Vector3(posX, posY + coverThickness / 2, posZ);
				cover.material = coverMat;
				meshes.push(cover);

				// Surface pattern (concentric rings)
				for (let i = 1; i <= 3; i++) {
					const ring = MeshBuilder.CreateTorus(
						`${id}_ring_${i}`,
						{ diameter: coverDiameter * (0.25 + i * 0.2), thickness: 0.015 },
						scene,
					);
					ring.position = new Vector3(
						posX,
						posY + coverThickness + 0.002,
						posZ,
					);
					ring.rotation.x = Math.PI / 2;
					ring.material = coverMat;
					meshes.push(ring);
				}

				// Pick holes
				for (const angle of [0, Math.PI]) {
					const hole = MeshBuilder.CreateCylinder(
						`${id}_pickHole_${angle}`,
						{ height: coverThickness + 0.01, diameter: 0.025 },
						scene,
					);
					hole.position = new Vector3(
						posX + Math.cos(angle + rotation) * (coverDiameter * 0.35),
						posY + coverThickness / 2,
						posZ + Math.sin(angle + rotation) * (coverDiameter * 0.35),
					);
					hole.material = holeMat;
					meshes.push(hole);
				}
			} else if (state === "open") {
				// Hole visible
				const holeDisc = MeshBuilder.CreateDisc(
					`${id}_holeDisc`,
					{ radius: coverDiameter / 2 - 0.02 },
					scene,
				);
				holeDisc.position = new Vector3(posX, posY + 0.001, posZ);
				holeDisc.rotation.x = Math.PI / 2;
				holeDisc.material = holeMat;
				meshes.push(holeDisc);

				// Cover pushed aside
				const cover = MeshBuilder.CreateCylinder(
					`${id}_cover`,
					{ height: coverThickness, diameter: coverDiameter },
					scene,
				);
				cover.position = new Vector3(
					posX + Math.cos(rotation) * (coverDiameter * 0.6),
					posY + coverThickness / 2,
					posZ + Math.sin(rotation) * (coverDiameter * 0.6),
				);
				cover.rotation.z = 0.1;
				cover.material = coverMat;
				meshes.push(cover);
			} else if (state === "missing") {
				// Just the hole
				const holeDisc = MeshBuilder.CreateDisc(
					`${id}_holeDisc`,
					{ radius: coverDiameter / 2 - 0.02 },
					scene,
				);
				holeDisc.position = new Vector3(posX, posY + 0.001, posZ);
				holeDisc.rotation.x = Math.PI / 2;
				holeDisc.material = holeMat;
				meshes.push(holeDisc);
			} else if (state === "flooded") {
				// Water-filled hole
				const waterMat = new PBRMaterial(`manhole_water_${id}`, scene);
				waterMat.albedoColor = new Color3(0.15, 0.25, 0.35);
				waterMat.metallic = 0.3;
				waterMat.roughness = 0.1;
				waterMat.alpha = 0.85;

				const water = MeshBuilder.CreateDisc(
					`${id}_water`,
					{ radius: coverDiameter / 2 - 0.02 },
					scene,
				);
				water.position = new Vector3(posX, posY + 0.02, posZ);
				water.rotation.x = Math.PI / 2;
				water.material = waterMat;
				meshes.push(water);

				// Debris in water
				if (rng) {
					const debrisCount = 2 + Math.floor(rng.next() * 3);
					for (let d = 0; d < debrisCount; d++) {
						const debrisMat = new PBRMaterial(
							`manhole_debris_${id}_${d}`,
							scene,
						);
						debrisMat.albedoColor = new Color3(0.3, 0.25, 0.2);
						debrisMat.metallic = 0;
						debrisMat.roughness = 0.9;

						const debris = MeshBuilder.CreateBox(
							`${id}_debris_${d}`,
							{
								width: 0.02 + rng.next() * 0.04,
								height: 0.01,
								depth: 0.02 + rng.next() * 0.04,
							},
							scene,
						);
						const angle = rng.next() * Math.PI * 2;
						const dist = rng.next() * (coverDiameter / 2 - 0.08);
						debris.position = new Vector3(
							posX + Math.cos(angle) * dist,
							posY + 0.025,
							posZ + Math.sin(angle) * dist,
						);
						debris.rotation.y = rng.next() * Math.PI;
						debris.material = debrisMat;
						meshes.push(debris);
					}
				}
			}
		} else if (type === "square") {
			// Square manhole cover
			const coverSize = 0.6;

			// Frame
			const frameOuterSize = coverSize + frameThickness * 2;
			for (const [dx, dz, w, d] of [
				[-frameOuterSize / 2, 0, frameThickness, coverSize + frameThickness],
				[frameOuterSize / 2, 0, frameThickness, coverSize + frameThickness],
				[0, -frameOuterSize / 2, coverSize + frameThickness, frameThickness],
				[0, frameOuterSize / 2, coverSize + frameThickness, frameThickness],
			] as const) {
				const framePiece = MeshBuilder.CreateBox(
					`${id}_frame_${dx}_${dz}`,
					{ width: w, height: frameThickness, depth: d },
					scene,
				);
				framePiece.position = new Vector3(
					posX + Math.cos(rotation) * dx - Math.sin(rotation) * dz,
					posY + frameThickness / 2,
					posZ + Math.sin(rotation) * dx + Math.cos(rotation) * dz,
				);
				framePiece.rotation.y = rotation;
				framePiece.material = frameMat;
				meshes.push(framePiece);
			}

			if (state === "closed") {
				// Cover
				const cover = MeshBuilder.CreateBox(
					`${id}_cover`,
					{ width: coverSize, height: coverThickness, depth: coverSize },
					scene,
				);
				cover.position = new Vector3(posX, posY + coverThickness / 2, posZ);
				cover.rotation.y = rotation;
				cover.material = coverMat;
				meshes.push(cover);

				// Cross pattern
				for (const isVertical of [true, false]) {
					const bar = MeshBuilder.CreateBox(
						`${id}_bar_${isVertical}`,
						{
							width: isVertical ? 0.02 : coverSize * 0.8,
							height: 0.01,
							depth: isVertical ? coverSize * 0.8 : 0.02,
						},
						scene,
					);
					bar.position = new Vector3(posX, posY + coverThickness + 0.003, posZ);
					bar.rotation.y = rotation;
					bar.material = coverMat;
					meshes.push(bar);
				}

				// Corner pick holes
				for (const corner of [
					[1, 1],
					[1, -1],
					[-1, 1],
					[-1, -1],
				]) {
					const hole = MeshBuilder.CreateCylinder(
						`${id}_pickHole_${corner[0]}_${corner[1]}`,
						{ height: coverThickness + 0.01, diameter: 0.02 },
						scene,
					);
					const localX = corner[0] * (coverSize * 0.4);
					const localZ = corner[1] * (coverSize * 0.4);
					hole.position = new Vector3(
						posX + Math.cos(rotation) * localX - Math.sin(rotation) * localZ,
						posY + coverThickness / 2,
						posZ + Math.sin(rotation) * localX + Math.cos(rotation) * localZ,
					);
					hole.material = holeMat;
					meshes.push(hole);
				}
			} else if (
				state === "open" ||
				state === "missing" ||
				state === "flooded"
			) {
				// Hole
				const holeBox = MeshBuilder.CreateBox(
					`${id}_hole`,
					{ width: coverSize - 0.02, height: 0.01, depth: coverSize - 0.02 },
					scene,
				);
				holeBox.position = new Vector3(posX, posY + 0.002, posZ);
				holeBox.rotation.y = rotation;
				holeBox.material =
					state === "flooded"
						? (() => {
								const waterMat = new PBRMaterial(`manhole_water_${id}`, scene);
								waterMat.albedoColor = new Color3(0.15, 0.25, 0.35);
								waterMat.metallic = 0.3;
								waterMat.roughness = 0.1;
								waterMat.alpha = 0.85;
								return waterMat;
							})()
						: holeMat;
				meshes.push(holeBox);

				if (state === "open") {
					// Cover pushed aside
					const cover = MeshBuilder.CreateBox(
						`${id}_cover`,
						{ width: coverSize, height: coverThickness, depth: coverSize },
						scene,
					);
					cover.position = new Vector3(
						posX + Math.cos(rotation) * (coverSize * 0.7),
						posY + coverThickness / 2,
						posZ + Math.sin(rotation) * (coverSize * 0.7),
					);
					cover.rotation.y = rotation + 0.1;
					cover.material = coverMat;
					meshes.push(cover);
				}
			}
		} else if (type === "utility") {
			// Small utility access cover
			const coverWidth = 0.4;
			const coverDepth = 0.25;

			// Frame
			const frame = MeshBuilder.CreateBox(
				`${id}_frame`,
				{
					width: coverWidth + 0.04,
					height: frameThickness,
					depth: coverDepth + 0.04,
				},
				scene,
			);
			frame.position = new Vector3(posX, posY + frameThickness / 2, posZ);
			frame.rotation.y = rotation;
			frame.material = frameMat;
			meshes.push(frame);

			if (state === "closed" || state === "flooded") {
				// Cover
				const cover = MeshBuilder.CreateBox(
					`${id}_cover`,
					{ width: coverWidth, height: coverThickness, depth: coverDepth },
					scene,
				);
				cover.position = new Vector3(
					posX,
					posY + frameThickness + coverThickness / 2,
					posZ,
				);
				cover.rotation.y = rotation;
				cover.material = coverMat;
				meshes.push(cover);

				// Label indent (for utility type marking)
				const label = MeshBuilder.CreateBox(
					`${id}_label`,
					{ width: coverWidth * 0.6, height: 0.005, depth: coverDepth * 0.4 },
					scene,
				);
				label.position = new Vector3(
					posX,
					posY + frameThickness + coverThickness + 0.001,
					posZ,
				);
				label.rotation.y = rotation;
				const labelMat = new PBRMaterial(`manhole_label_${id}`, scene);
				labelMat.albedoColor = new Color3(0.25, 0.25, 0.27);
				labelMat.metallic = 0.7;
				labelMat.roughness = 0.6;
				label.material = labelMat;
				meshes.push(label);

				// Hinge side
				const hinge = MeshBuilder.CreateCylinder(
					`${id}_hinge`,
					{ height: coverWidth * 0.8, diameter: 0.02 },
					scene,
				);
				hinge.position = new Vector3(
					posX - Math.sin(rotation) * (coverDepth / 2 + 0.01),
					posY + frameThickness + coverThickness / 2,
					posZ - Math.cos(rotation) * (coverDepth / 2 + 0.01),
				);
				hinge.rotation.z = Math.PI / 2;
				hinge.rotation.y = rotation;
				hinge.material = frameMat;
				meshes.push(hinge);
			} else {
				// Hole
				const hole = MeshBuilder.CreateBox(
					`${id}_hole`,
					{ width: coverWidth - 0.02, height: 0.01, depth: coverDepth - 0.02 },
					scene,
				);
				hole.position = new Vector3(posX, posY + frameThickness + 0.002, posZ);
				hole.rotation.y = rotation;
				hole.material = holeMat;
				meshes.push(hole);

				if (state === "open") {
					// Cover hinged open
					const cover = MeshBuilder.CreateBox(
						`${id}_cover`,
						{ width: coverWidth, height: coverThickness, depth: coverDepth },
						scene,
					);
					cover.position = new Vector3(
						posX - Math.sin(rotation) * (coverDepth + 0.02),
						posY + frameThickness + coverDepth / 2,
						posZ - Math.cos(rotation) * (coverDepth + 0.02),
					);
					cover.rotation.y = rotation;
					cover.rotation.x = -Math.PI / 2 + 0.2;
					cover.material = coverMat;
					meshes.push(cover);
				}
			}
		} else if (type === "decorative") {
			// Japanese-style decorative manhole cover
			const coverDiameterDeco = 0.6;

			// Frame
			const frame = MeshBuilder.CreateTorus(
				`${id}_frame`,
				{
					diameter: coverDiameterDeco + frameThickness,
					thickness: frameThickness,
				},
				scene,
			);
			frame.position = new Vector3(posX, posY + frameThickness / 2, posZ);
			frame.rotation.x = Math.PI / 2;
			frame.material = frameMat;
			meshes.push(frame);

			if (state === "closed") {
				// Cover with decorative pattern
				const cover = MeshBuilder.CreateCylinder(
					`${id}_cover`,
					{ height: coverThickness, diameter: coverDiameterDeco },
					scene,
				);
				cover.position = new Vector3(posX, posY + coverThickness / 2, posZ);
				cover.material = coverMat;
				meshes.push(cover);

				// Decorative colored inlay (Japanese manhole art)
				const inlayMat = new PBRMaterial(`manhole_inlay_${id}`, scene);
				const inlayHue = rng ? rng.next() : 0.6;
				inlayMat.albedoColor = new Color3(
					0.3 + inlayHue * 0.4,
					0.4 + (1 - inlayHue) * 0.3,
					0.5,
				).scale(conditionFactor);
				inlayMat.metallic = 0.4;
				inlayMat.roughness = 0.5;

				// Central design (simplified as disc)
				const centralDesign = MeshBuilder.CreateCylinder(
					`${id}_centralDesign`,
					{ height: 0.005, diameter: coverDiameterDeco * 0.7 },
					scene,
				);
				centralDesign.position = new Vector3(
					posX,
					posY + coverThickness + 0.002,
					posZ,
				);
				centralDesign.material = inlayMat;
				meshes.push(centralDesign);

				// Outer decorative ring
				const outerRing = MeshBuilder.CreateTorus(
					`${id}_outerRing`,
					{ diameter: coverDiameterDeco * 0.85, thickness: 0.02 },
					scene,
				);
				outerRing.position = new Vector3(
					posX,
					posY + coverThickness + 0.003,
					posZ,
				);
				outerRing.rotation.x = Math.PI / 2;
				outerRing.material = inlayMat;
				meshes.push(outerRing);

				// Radial pattern elements
				const patternCount = rng ? 6 + Math.floor(rng.next() * 6) : 8;
				for (let p = 0; p < patternCount; p++) {
					const angle = (p / patternCount) * Math.PI * 2 + rotation;
					const pattern = MeshBuilder.CreateBox(
						`${id}_pattern_${p}`,
						{ width: 0.015, height: 0.003, depth: coverDiameterDeco * 0.25 },
						scene,
					);
					pattern.position = new Vector3(
						posX + Math.cos(angle) * (coverDiameterDeco * 0.25),
						posY + coverThickness + 0.004,
						posZ + Math.sin(angle) * (coverDiameterDeco * 0.25),
					);
					pattern.rotation.y = angle + Math.PI / 2;
					pattern.material = inlayMat;
					meshes.push(pattern);
				}

				// City/ward name ring (text placeholder)
				const textRing = MeshBuilder.CreateTorus(
					`${id}_textRing`,
					{ diameter: coverDiameterDeco * 0.55, thickness: 0.025 },
					scene,
				);
				textRing.position = new Vector3(
					posX,
					posY + coverThickness + 0.003,
					posZ,
				);
				textRing.rotation.x = Math.PI / 2;
				const textMat = new PBRMaterial(`manhole_text_${id}`, scene);
				textMat.albedoColor = coverMat.albedoColor.scale(0.9);
				textMat.metallic = 0.7;
				textMat.roughness = 0.5;
				textRing.material = textMat;
				meshes.push(textRing);
			} else {
				// Similar to round type for other states
				const holeDisc = MeshBuilder.CreateDisc(
					`${id}_holeDisc`,
					{ radius: coverDiameterDeco / 2 - 0.02 },
					scene,
				);
				holeDisc.position = new Vector3(posX, posY + 0.001, posZ);
				holeDisc.rotation.x = Math.PI / 2;
				holeDisc.material =
					state === "flooded"
						? (() => {
								const waterMat = new PBRMaterial(`manhole_water_${id}`, scene);
								waterMat.albedoColor = new Color3(0.15, 0.25, 0.35);
								waterMat.metallic = 0.3;
								waterMat.roughness = 0.1;
								waterMat.alpha = 0.85;
								return waterMat;
							})()
						: holeMat;
				meshes.push(holeDisc);

				if (state === "open") {
					// Decorative cover pushed aside
					const cover = MeshBuilder.CreateCylinder(
						`${id}_cover`,
						{ height: coverThickness, diameter: coverDiameterDeco },
						scene,
					);
					cover.position = new Vector3(
						posX + Math.cos(rotation) * (coverDiameterDeco * 0.6),
						posY + coverThickness / 2,
						posZ + Math.sin(rotation) * (coverDiameterDeco * 0.6),
					);
					cover.material = coverMat;
					meshes.push(cover);
				}
			}
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			coverMat.dispose();
			frameMat.dispose();
			holeMat.dispose();
		};
	}, [scene, id, posX, posY, posZ, type, state, condition, rotation, seed]);

	return null;
}
