/**
 * PowerLine - Electrical power line component
 *
 * Overhead power lines with poles and transformers.
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

export type PowerLineType = "utility" | "highVoltage" | "telephone" | "tram";

export interface PowerLineProps {
	id: string;
	position: Vector3;
	/** Type of power line */
	type?: PowerLineType;
	/** Height of pole */
	poleHeight?: number;
	/** Include second pole at distance */
	spanLength?: number;
	/** Has transformer */
	hasTransformer?: boolean;
	/** Wire sag amount */
	wireSag?: number;
	/** Number of wire sets */
	wireCount?: number;
	/** Rotation (radians) */
	rotation?: number;
	/** Seed for procedural variation */
	seed?: number;
}

export function PowerLine({
	id,
	position,
	type = "utility",
	poleHeight = 8,
	spanLength = 0,
	hasTransformer = false,
	wireSag = 0.5,
	wireCount = 3,
	rotation = 0,
	seed,
}: PowerLineProps) {
	const scene = useScene();
	const meshRef = useRef<AbstractMesh[]>([]);

	const posX = position.x;
	const posY = position.y;
	const posZ = position.z;

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
		const rng = seed !== undefined ? createSeededRandom(seed) : null;

		// Materials
		const poleMat = new PBRMaterial(`powerline_pole_${id}`, scene);
		const wireMat = new PBRMaterial(`powerline_wire_${id}`, scene);
		const insulatorMat = new PBRMaterial(`powerline_insulator_${id}`, scene);

		if (type === "utility" || type === "telephone") {
			// Wooden pole
			poleMat.albedoColor = new Color3(0.35, 0.28, 0.18);
			poleMat.metallic = 0;
			poleMat.roughness = 0.85;
		} else {
			// Metal pole
			poleMat.albedoColor = new Color3(0.5, 0.52, 0.55);
			poleMat.metallic = 0.7;
			poleMat.roughness = 0.5;
		}

		wireMat.albedoColor = new Color3(0.15, 0.15, 0.17);
		wireMat.metallic = 0.9;
		wireMat.roughness = 0.3;

		insulatorMat.albedoColor = new Color3(0.3, 0.5, 0.35);
		insulatorMat.metallic = 0.2;
		insulatorMat.roughness = 0.4;

		const createPole = (poleX: number, poleZ: number, suffix: string) => {
			const poleRadius = type === "highVoltage" ? 0.15 : 0.1;

			// Main pole
			const pole = MeshBuilder.CreateCylinder(
				`${id}_pole_${suffix}`,
				{
					height: poleHeight,
					diameterTop: poleRadius * 1.6,
					diameterBottom: poleRadius * 2,
				},
				scene,
			);
			pole.position = new Vector3(poleX, posY + poleHeight / 2, poleZ);
			pole.material = poleMat;
			meshes.push(pole);

			if (type === "utility" || type === "telephone") {
				// Wooden crossarm
				const crossarmWidth = type === "telephone" ? 1.2 : 1.5;
				const crossarm = MeshBuilder.CreateBox(
					`${id}_crossarm_${suffix}`,
					{ width: crossarmWidth, height: 0.1, depth: 0.1 },
					scene,
				);
				crossarm.position = new Vector3(poleX, posY + poleHeight - 0.5, poleZ);
				crossarm.rotation.y = rotation;
				crossarm.material = poleMat;
				meshes.push(crossarm);

				// Insulators
				const insulatorCount = wireCount;
				for (let i = 0; i < insulatorCount; i++) {
					const insulatorX =
						(i - (insulatorCount - 1) / 2) * (crossarmWidth / insulatorCount);
					const insulator = MeshBuilder.CreateCylinder(
						`${id}_insulator_${suffix}_${i}`,
						{ height: 0.12, diameterTop: 0.06, diameterBottom: 0.04 },
						scene,
					);
					insulator.position = new Vector3(
						poleX + Math.cos(rotation) * insulatorX,
						posY + poleHeight - 0.35,
						poleZ - Math.sin(rotation) * insulatorX,
					);
					insulator.material = insulatorMat;
					meshes.push(insulator);
				}

				// Secondary crossarm for utility
				if (type === "utility" && wireCount > 2) {
					const crossarm2 = MeshBuilder.CreateBox(
						`${id}_crossarm2_${suffix}`,
						{ width: crossarmWidth * 0.8, height: 0.08, depth: 0.08 },
						scene,
					);
					crossarm2.position = new Vector3(
						poleX,
						posY + poleHeight - 1.2,
						poleZ,
					);
					crossarm2.rotation.y = rotation;
					crossarm2.material = poleMat;
					meshes.push(crossarm2);
				}
			} else if (type === "highVoltage") {
				// Metal lattice structure (simplified)
				const armLength = 2;
				const armHeight = 1.5;

				// Main horizontal arms
				for (const side of [-1, 1]) {
					const arm = MeshBuilder.CreateBox(
						`${id}_arm_${suffix}_${side}`,
						{ width: armLength, height: 0.1, depth: 0.1 },
						scene,
					);
					arm.position = new Vector3(
						poleX + Math.cos(rotation) * ((side * armLength) / 2),
						posY + poleHeight - 0.3,
						poleZ - Math.sin(rotation) * ((side * armLength) / 2),
					);
					arm.rotation.y = rotation;
					arm.material = poleMat;
					meshes.push(arm);

					// Diagonal supports
					const diag = MeshBuilder.CreateBox(
						`${id}_diag_${suffix}_${side}`,
						{ width: 0.06, height: armHeight, depth: 0.06 },
						scene,
					);
					diag.position = new Vector3(
						poleX + Math.cos(rotation) * (side * armLength * 0.4),
						posY + poleHeight - armHeight / 2 - 0.3,
						poleZ - Math.sin(rotation) * (side * armLength * 0.4),
					);
					diag.rotation.z = side * 0.4;
					diag.rotation.y = rotation;
					diag.material = poleMat;
					meshes.push(diag);

					// Insulators (hanging type)
					for (let i = 0; i < 2; i++) {
						const insulatorPos = armLength * 0.3 + i * armLength * 0.35;
						const insulator = MeshBuilder.CreateCylinder(
							`${id}_hvInsulator_${suffix}_${side}_${i}`,
							{ height: 0.3, diameterTop: 0.08, diameterBottom: 0.12 },
							scene,
						);
						insulator.position = new Vector3(
							poleX + Math.cos(rotation) * (side * insulatorPos),
							posY + poleHeight - 0.6,
							poleZ - Math.sin(rotation) * (side * insulatorPos),
						);
						insulator.material = insulatorMat;
						meshes.push(insulator);
					}
				}
			} else if (type === "tram") {
				// Tram wire support
				const bracketLength = 1.5;
				const bracket = MeshBuilder.CreateCylinder(
					`${id}_bracket_${suffix}`,
					{ height: bracketLength, diameter: 0.06 },
					scene,
				);
				bracket.position = new Vector3(
					poleX + (Math.sin(rotation) * bracketLength) / 2,
					posY + poleHeight - 0.5,
					poleZ + (Math.cos(rotation) * bracketLength) / 2,
				);
				bracket.rotation.x = Math.PI / 2;
				bracket.rotation.y = rotation;
				bracket.material = poleMat;
				meshes.push(bracket);

				// Support wires
				const supportWire = MeshBuilder.CreateCylinder(
					`${id}_support_${suffix}`,
					{ height: 1.2, diameter: 0.02 },
					scene,
				);
				supportWire.position = new Vector3(
					poleX + Math.sin(rotation) * bracketLength * 0.7,
					posY + poleHeight - 0.2,
					poleZ + Math.cos(rotation) * bracketLength * 0.7,
				);
				supportWire.rotation.z = 0.5;
				supportWire.rotation.y = rotation;
				supportWire.material = wireMat;
				meshes.push(supportWire);
			}

			// Transformer
			if (hasTransformer && suffix === "main") {
				const transformerMat = new PBRMaterial(
					`powerline_transformer_${id}`,
					scene,
				);
				transformerMat.albedoColor = new Color3(0.4, 0.42, 0.45);
				transformerMat.metallic = 0.6;
				transformerMat.roughness = 0.5;

				const transformer = MeshBuilder.CreateCylinder(
					`${id}_transformer`,
					{ height: 0.6, diameter: 0.35 },
					scene,
				);
				transformer.position = new Vector3(
					poleX,
					posY + poleHeight * 0.6,
					poleZ + 0.2,
				);
				transformer.material = transformerMat;
				meshes.push(transformer);

				// Transformer bushings
				for (let b = 0; b < 3; b++) {
					const bushing = MeshBuilder.CreateCylinder(
						`${id}_bushing_${b}`,
						{ height: 0.15, diameter: 0.05 },
						scene,
					);
					const angle = (b / 3) * Math.PI * 2;
					bushing.position = new Vector3(
						poleX + Math.cos(angle) * 0.12,
						posY + poleHeight * 0.6 + 0.35,
						poleZ + 0.2 + Math.sin(angle) * 0.12,
					);
					bushing.material = insulatorMat;
					meshes.push(bushing);
				}
			}
		};

		// Create main pole
		createPole(posX, posZ, "main");

		// Create second pole and wires if span specified
		if (spanLength > 0) {
			const pole2X = posX + Math.cos(rotation) * spanLength;
			const pole2Z = posZ - Math.sin(rotation) * spanLength;
			createPole(pole2X, pole2Z, "end");

			// Wires between poles
			const wireSpacing =
				type === "highVoltage" ? 1.5 : type === "tram" ? 0 : 0.4;
			const wireHeight =
				posY + poleHeight - (type === "highVoltage" ? 0.9 : 0.4);

			const actualWireCount = type === "tram" ? 1 : wireCount;

			for (let w = 0; w < actualWireCount; w++) {
				const wireOffset = (w - (actualWireCount - 1) / 2) * wireSpacing;

				// Create sagging wire segments
				const segmentCount = 10;
				for (let s = 0; s < segmentCount; s++) {
					const t1 = s / segmentCount;
					const t2 = (s + 1) / segmentCount;

					// Catenary curve approximation
					const sag1 = Math.sin(t1 * Math.PI) * wireSag;
					const sag2 = Math.sin(t2 * Math.PI) * wireSag;

					const x1 =
						posX +
						Math.cos(rotation) * (t1 * spanLength) +
						Math.sin(rotation) * wireOffset;
					const z1 =
						posZ -
						Math.sin(rotation) * (t1 * spanLength) +
						Math.cos(rotation) * wireOffset;
					const y1 = wireHeight - sag1;

					const x2 =
						posX +
						Math.cos(rotation) * (t2 * spanLength) +
						Math.sin(rotation) * wireOffset;
					const z2 =
						posZ -
						Math.sin(rotation) * (t2 * spanLength) +
						Math.cos(rotation) * wireOffset;
					const y2 = wireHeight - sag2;

					const segLength = Math.sqrt(
						(x2 - x1) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2,
					);
					const midX = (x1 + x2) / 2;
					const midY = (y1 + y2) / 2;
					const midZ = (z1 + z2) / 2;

					const wire = MeshBuilder.CreateCylinder(
						`${id}_wire_${w}_${s}`,
						{ height: segLength, diameter: type === "tram" ? 0.02 : 0.015 },
						scene,
					);
					wire.position = new Vector3(midX, midY, midZ);

					// Orient wire segment
					const dx = x2 - x1;
					const dy = y2 - y1;
					const dz = z2 - z1;
					wire.rotation.x = Math.asin(dy / segLength);
					wire.rotation.z = Math.PI / 2;
					wire.rotation.y = Math.atan2(dz, dx);

					wire.material = wireMat;
					meshes.push(wire);
				}
			}
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			poleMat.dispose();
			wireMat.dispose();
			insulatorMat.dispose();
		};
	}, [
		scene,
		id,
		posX,
		posY,
		posZ,
		type,
		poleHeight,
		spanLength,
		hasTransformer,
		wireSag,
		wireCount,
		rotation,
		seed,
	]);

	return null;
}
