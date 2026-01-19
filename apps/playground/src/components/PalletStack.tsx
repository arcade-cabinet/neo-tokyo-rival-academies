/**
 * PalletStack - Shipping pallets
 *
 * Wooden and plastic shipping pallets.
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

export type PalletType = "wooden" | "plastic" | "metal" | "euro";
export type PalletState = "empty" | "stacked" | "broken" | "loaded";

export interface PalletStackProps {
	id: string;
	position: Vector3;
	/** Pallet type */
	type?: PalletType;
	/** Pallet state */
	state?: PalletState;
	/** Stack count */
	stackCount?: number;
	/** Has cargo */
	hasCargo?: boolean;
	/** Condition 0-1 */
	condition?: number;
	/** Rotation (radians) */
	rotation?: number;
	/** Seed for procedural variation */
	seed?: number;
}

export function PalletStack({
	id,
	position,
	type = "wooden",
	state = "empty",
	stackCount = 1,
	hasCargo = false,
	condition = 0.8,
	rotation = 0,
	seed,
}: PalletStackProps) {
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

		// Pallet dimensions (standard euro pallet proportions)
		const palletWidth = type === "euro" ? 0.8 : 1.0;
		const palletDepth = type === "euro" ? 1.2 : 1.2;
		const palletHeight = 0.15;

		// Material
		const palletMat = new PBRMaterial(`pallet_${id}`, scene);

		if (type === "wooden" || type === "euro") {
			palletMat.albedoColor = new Color3(0.5, 0.4, 0.25).scale(conditionFactor);
			palletMat.metallic = 0;
			palletMat.roughness = 0.9;
		} else if (type === "plastic") {
			palletMat.albedoColor = new Color3(0.15, 0.35, 0.55).scale(conditionFactor);
			palletMat.metallic = 0.1;
			palletMat.roughness = 0.6;
		} else {
			palletMat.albedoColor = new Color3(0.5, 0.52, 0.55).scale(conditionFactor);
			palletMat.metallic = 0.8;
			palletMat.roughness = 0.4;
		}

		const actualStackCount = state === "stacked" ? Math.max(stackCount, 2) : stackCount;

		for (let s = 0; s < actualStackCount; s++) {
			const stackY = posY + s * palletHeight;
			const stackOffset = (rng ? (rng.next() - 0.5) * 0.02 : 0);

			if (type === "wooden" || type === "euro") {
				// Wooden pallet construction
				// Top boards
				const topBoardCount = 5;
				for (let b = 0; b < topBoardCount; b++) {
					const boardZ = (b / (topBoardCount - 1) - 0.5) * (palletDepth - 0.1);
					const boardWidth = palletWidth;
					const isMissing = state === "broken" && rng && rng.next() > 0.7;

					if (!isMissing) {
						const board = MeshBuilder.CreateBox(
							`${id}_topboard_${s}_${b}`,
							{ width: boardWidth, height: 0.02, depth: 0.1 },
							scene
						);
						board.position = new Vector3(
							posX + stackOffset + Math.cos(rotation) * 0 - Math.sin(rotation) * boardZ,
							stackY + palletHeight - 0.01,
							posZ + stackOffset - Math.sin(rotation) * 0 - Math.cos(rotation) * boardZ
						);
						board.rotation.y = rotation;
						board.material = palletMat;
						meshes.push(board);
					}
				}

				// Bottom boards (3)
				for (let b = 0; b < 3; b++) {
					const boardZ = (b - 1) * (palletDepth / 2 - 0.1);

					const board = MeshBuilder.CreateBox(
						`${id}_bottomboard_${s}_${b}`,
						{ width: palletWidth, height: 0.02, depth: 0.1 },
						scene
					);
					board.position = new Vector3(
						posX + stackOffset + Math.cos(rotation) * 0 - Math.sin(rotation) * boardZ,
						stackY + 0.01,
						posZ + stackOffset - Math.sin(rotation) * 0 - Math.cos(rotation) * boardZ
					);
					board.rotation.y = rotation;
					board.material = palletMat;
					meshes.push(board);
				}

				// Stringers (3 lengthwise)
				for (let st = 0; st < 3; st++) {
					const stringerX = (st - 1) * (palletWidth / 2 - 0.05);

					const stringer = MeshBuilder.CreateBox(
						`${id}_stringer_${s}_${st}`,
						{ width: 0.1, height: palletHeight - 0.04, depth: palletDepth },
						scene
					);
					stringer.position = new Vector3(
						posX + stackOffset + Math.cos(rotation) * stringerX,
						stackY + palletHeight / 2,
						posZ + stackOffset - Math.sin(rotation) * stringerX
					);
					stringer.rotation.y = rotation;
					stringer.material = palletMat;
					meshes.push(stringer);
				}

			} else {
				// Plastic/metal pallet (simplified solid with feet)
				const deck = MeshBuilder.CreateBox(
					`${id}_deck_${s}`,
					{ width: palletWidth, height: 0.03, depth: palletDepth },
					scene
				);
				deck.position = new Vector3(
					posX + stackOffset,
					stackY + palletHeight - 0.015,
					posZ + stackOffset
				);
				deck.rotation.y = rotation;
				deck.material = palletMat;
				meshes.push(deck);

				// Feet (9 blocks)
				for (let fx = -1; fx <= 1; fx++) {
					for (let fz = -1; fz <= 1; fz++) {
						const footX = fx * (palletWidth / 2 - 0.1);
						const footZ = fz * (palletDepth / 2 - 0.1);

						const foot = MeshBuilder.CreateBox(
							`${id}_foot_${s}_${fx}_${fz}`,
							{ width: 0.1, height: palletHeight - 0.03, depth: 0.1 },
							scene
						);
						foot.position = new Vector3(
							posX + stackOffset + Math.cos(rotation) * footX - Math.sin(rotation) * footZ,
							stackY + (palletHeight - 0.03) / 2,
							posZ + stackOffset - Math.sin(rotation) * footX - Math.cos(rotation) * footZ
						);
						foot.rotation.y = rotation;
						foot.material = palletMat;
						meshes.push(foot);
					}
				}
			}
		}

		// Cargo on top
		if (hasCargo || state === "loaded") {
			const cargoY = posY + actualStackCount * palletHeight;

			const cargoMat = new PBRMaterial(`pallet_cargo_${id}`, scene);
			cargoMat.albedoColor = new Color3(0.6, 0.55, 0.45);
			cargoMat.metallic = 0;
			cargoMat.roughness = 0.8;

			// Wrapped cargo (shrink wrap effect)
			const wrapMat = new PBRMaterial(`pallet_wrap_${id}`, scene);
			wrapMat.albedoColor = new Color3(0.9, 0.9, 0.92);
			wrapMat.metallic = 0.1;
			wrapMat.roughness = 0.3;
			wrapMat.alpha = 0.7;

			const cargoHeight = 0.6 + (rng ? rng.next() * 0.4 : 0.2);
			const cargoWidth = palletWidth * 0.9;
			const cargoDepth = palletDepth * 0.9;

			// Boxes
			const cargo = MeshBuilder.CreateBox(
				`${id}_cargo`,
				{ width: cargoWidth, height: cargoHeight, depth: cargoDepth },
				scene
			);
			cargo.position = new Vector3(posX, cargoY + cargoHeight / 2, posZ);
			cargo.rotation.y = rotation;
			cargo.material = cargoMat;
			meshes.push(cargo);

			// Shrink wrap
			const wrap = MeshBuilder.CreateBox(
				`${id}_wrap`,
				{ width: cargoWidth + 0.02, height: cargoHeight + 0.02, depth: cargoDepth + 0.02 },
				scene
			);
			wrap.position = new Vector3(posX, cargoY + cargoHeight / 2, posZ);
			wrap.rotation.y = rotation;
			wrap.material = wrapMat;
			meshes.push(wrap);
		}

		// Broken pieces
		if (state === "broken") {
			const debrisMat = new PBRMaterial(`pallet_debris_${id}`, scene);
			debrisMat.albedoColor = palletMat.albedoColor.scale(0.8);
			debrisMat.metallic = palletMat.metallic;
			debrisMat.roughness = palletMat.roughness;

			const debrisCount = 3 + (rng ? Math.floor(rng.next() * 3) : 2);
			for (let d = 0; d < debrisCount; d++) {
				const dx = (rng ? (rng.next() - 0.5) : 0) * palletWidth;
				const dz = (rng ? (rng.next() - 0.5) : 0) * palletDepth;

				const debris = MeshBuilder.CreateBox(
					`${id}_debris_${d}`,
					{
						width: 0.1 + (rng ? rng.next() * 0.1 : 0.05),
						height: 0.02,
						depth: 0.2 + (rng ? rng.next() * 0.2 : 0.1)
					},
					scene
				);
				debris.position = new Vector3(
					posX + Math.cos(rotation) * dx - Math.sin(rotation) * dz,
					posY + 0.01,
					posZ - Math.sin(rotation) * dx - Math.cos(rotation) * dz
				);
				debris.rotation.y = rotation + (rng ? rng.next() * Math.PI : 0);
				debris.rotation.x = (rng ? (rng.next() - 0.5) * 0.2 : 0);
				debris.material = debrisMat;
				meshes.push(debris);
			}
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			palletMat.dispose();
		};
	}, [scene, id, posX, posY, posZ, type, state, stackCount, hasCargo, condition, rotation, seed]);

	return null;
}
