/**
 * Signpost - Directional signposts
 *
 * Multi-directional signposts with multiple destination signs.
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

export type SignpostType = "wooden" | "metal" | "tourist" | "hiking" | "urban";

export interface SignpostProps {
	id: string;
	position: Vector3;
	/** Signpost type */
	type?: SignpostType;
	/** Number of direction signs */
	signCount?: number;
	/** Post height */
	postHeight?: number;
	/** Condition 0-1 */
	condition?: number;
	/** Base rotation (radians) */
	rotation?: number;
	/** Seed for procedural variation */
	seed?: number;
}

export function Signpost({
	id,
	position,
	type = "wooden",
	signCount = 3,
	postHeight = 2.5,
	condition = 0.8,
	rotation = 0,
	seed,
}: SignpostProps) {
	const scene = useScene();
	const meshRef = useRef<AbstractMesh[]>([]);

	const posX = position.x;
	const posY = position.y;
	const posZ = position.z;

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
		const rng = seed !== undefined ? createSeededRandom(seed) : null;

		const conditionFactor = condition;

		// Materials
		const postMat = new PBRMaterial(`signpost_post_${id}`, scene);
		const signMat = new PBRMaterial(`signpost_sign_${id}`, scene);

		if (type === "wooden") {
			postMat.albedoColor = new Color3(0.35, 0.25, 0.15).scale(conditionFactor);
			postMat.metallic = 0;
			postMat.roughness = 0.9;
			signMat.albedoColor = new Color3(0.4, 0.3, 0.2).scale(conditionFactor);
			signMat.metallic = 0;
			signMat.roughness = 0.85;
		} else if (type === "metal") {
			postMat.albedoColor = new Color3(0.5, 0.52, 0.55).scale(conditionFactor);
			postMat.metallic = 0.8;
			postMat.roughness = 0.4;
			signMat.albedoColor = new Color3(0.2, 0.4, 0.2).scale(conditionFactor);
			signMat.metallic = 0.3;
			signMat.roughness = 0.5;
		} else if (type === "tourist") {
			postMat.albedoColor = new Color3(0.4, 0.3, 0.2).scale(conditionFactor);
			postMat.metallic = 0;
			postMat.roughness = 0.85;
			signMat.albedoColor = new Color3(0.9, 0.85, 0.7).scale(conditionFactor);
			signMat.metallic = 0;
			signMat.roughness = 0.7;
		} else if (type === "hiking") {
			postMat.albedoColor = new Color3(0.3, 0.25, 0.18).scale(conditionFactor);
			postMat.metallic = 0;
			postMat.roughness = 0.95;
			signMat.albedoColor = new Color3(0.85, 0.75, 0.2).scale(conditionFactor);
			signMat.metallic = 0;
			signMat.roughness = 0.6;
		} else {
			// Urban
			postMat.albedoColor = new Color3(0.15, 0.15, 0.18).scale(conditionFactor);
			postMat.metallic = 0.7;
			postMat.roughness = 0.35;
			signMat.albedoColor = new Color3(0.15, 0.3, 0.55).scale(conditionFactor);
			signMat.metallic = 0.4;
			signMat.roughness = 0.4;
		}

		// Post
		const postWidth = type === "wooden" ? 0.12 : 0.08;
		const post = type === "wooden"
			? MeshBuilder.CreateBox(
				`${id}_post`,
				{ width: postWidth, height: postHeight, depth: postWidth },
				scene
			)
			: MeshBuilder.CreateCylinder(
				`${id}_post`,
				{ height: postHeight, diameter: postWidth },
				scene
			);
		post.position = new Vector3(posX, posY + postHeight / 2, posZ);
		post.material = postMat;
		meshes.push(post);

		// Direction signs
		const actualSignCount = Math.min(Math.max(signCount, 1), 6);
		const signSpacing = Math.min(0.4, (postHeight - 0.5) / actualSignCount);

		for (let s = 0; s < actualSignCount; s++) {
			const signY = posY + postHeight - 0.3 - s * signSpacing;
			const signRotation = rotation + (rng ? rng.next() * Math.PI * 2 : (s / actualSignCount) * Math.PI * 2);
			const signLength = 0.5 + (rng ? rng.next() * 0.3 : 0.15);

			// Arrow-shaped sign
			const signWidth = 0.12;
			const signDepth = 0.02;

			// Main body
			const signBody = MeshBuilder.CreateBox(
				`${id}_sign_${s}_body`,
				{ width: signLength, height: signWidth, depth: signDepth },
				scene
			);
			signBody.position = new Vector3(
				posX + Math.cos(signRotation) * (signLength / 2 + postWidth / 2),
				signY,
				posZ - Math.sin(signRotation) * (signLength / 2 + postWidth / 2)
			);
			signBody.rotation.y = signRotation;
			signBody.material = signMat;
			meshes.push(signBody);

			// Arrow point
			const arrowSize = 0.08;
			const arrow = MeshBuilder.CreateBox(
				`${id}_sign_${s}_arrow`,
				{ width: arrowSize, height: arrowSize, depth: signDepth },
				scene
			);
			arrow.position = new Vector3(
				posX + Math.cos(signRotation) * (signLength + postWidth / 2 + arrowSize / 2),
				signY,
				posZ - Math.sin(signRotation) * (signLength + postWidth / 2 + arrowSize / 2)
			);
			arrow.rotation.y = signRotation + Math.PI / 4;
			arrow.rotation.z = Math.PI / 4;
			arrow.scaling = new Vector3(1, 1, 1);
			arrow.material = signMat;
			meshes.push(arrow);

			// Text placeholder
			const textMat = new PBRMaterial(`signpost_text_${id}_${s}`, scene);
			textMat.albedoColor = type === "tourist" || type === "hiking"
				? new Color3(0.15, 0.15, 0.18)
				: new Color3(0.95, 0.95, 0.95);
			textMat.metallic = 0;
			textMat.roughness = 0.8;

			const textWidth = signLength * 0.6;
			const text = MeshBuilder.CreatePlane(
				`${id}_sign_${s}_text`,
				{ width: textWidth, height: signWidth * 0.4 },
				scene
			);
			text.position = new Vector3(
				posX + Math.cos(signRotation) * (signLength / 2 + postWidth / 2) - Math.sin(signRotation) * 0.012,
				signY,
				posZ - Math.sin(signRotation) * (signLength / 2 + postWidth / 2) - Math.cos(signRotation) * 0.012
			);
			text.rotation.y = signRotation;
			text.material = textMat;
			meshes.push(text);
		}

		// Decorative cap (for some types)
		if (type === "wooden" || type === "tourist") {
			const capMat = new PBRMaterial(`signpost_cap_${id}`, scene);
			capMat.albedoColor = postMat.albedoColor.scale(0.9);
			capMat.metallic = postMat.metallic;
			capMat.roughness = postMat.roughness;

			const cap = MeshBuilder.CreateBox(
				`${id}_cap`,
				{ width: postWidth * 1.5, height: 0.05, depth: postWidth * 1.5 },
				scene
			);
			cap.position = new Vector3(posX, posY + postHeight + 0.025, posZ);
			cap.material = capMat;
			meshes.push(cap);

			// Finial for tourist type
			if (type === "tourist") {
				const finial = MeshBuilder.CreateSphere(
					`${id}_finial`,
					{ diameter: postWidth * 1.2, segments: 8 },
					scene
				);
				finial.position = new Vector3(posX, posY + postHeight + 0.1, posZ);
				finial.material = capMat;
				meshes.push(finial);
			}
		}

		// Base
		const baseMat = new PBRMaterial(`signpost_base_${id}`, scene);
		baseMat.albedoColor = new Color3(0.4, 0.38, 0.35).scale(conditionFactor);
		baseMat.metallic = 0.3;
		baseMat.roughness = 0.7;

		if (type === "urban" || type === "metal") {
			const base = MeshBuilder.CreateCylinder(
				`${id}_base`,
				{ height: 0.05, diameter: 0.3 },
				scene
			);
			base.position = new Vector3(posX, posY + 0.025, posZ);
			base.material = baseMat;
			meshes.push(base);
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			postMat.dispose();
			signMat.dispose();
		};
	}, [scene, id, posX, posY, posZ, type, signCount, postHeight, condition, rotation, seed]);

	return null;
}
