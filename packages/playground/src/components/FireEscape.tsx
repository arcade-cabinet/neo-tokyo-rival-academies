/**
 * FireEscape - Building fire escape system
 *
 * Multi-story fire escape structures with platforms and ladders.
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

export type FireEscapeStyle = "zigzag" | "straight" | "spiral";

export interface FireEscapeProps {
	id: string;
	position: Vector3;
	/** Style of fire escape */
	style?: FireEscapeStyle;
	/** Number of floors */
	floors?: number;
	/** Height per floor */
	floorHeight?: number;
	/** Platform width */
	platformWidth?: number;
	/** Platform depth */
	platformDepth?: number;
	/** Rust/age 0-1 */
	rust?: number;
	/** Has drop ladder at bottom */
	hasDropLadder?: boolean;
	/** Seed for procedural variation */
	seed?: number;
}

export function FireEscape({
	id,
	position,
	style = "zigzag",
	floors = 3,
	floorHeight = 3,
	platformWidth = 1.5,
	platformDepth = 1.2,
	rust = 0.3,
	hasDropLadder = true,
	seed,
}: FireEscapeProps) {
	const scene = useScene();
	const meshRef = useRef<AbstractMesh[]>([]);

	const posX = position.x;
	const posY = position.y;
	const posZ = position.z;

	useEffect(() => {
		if (!scene) return;

		const meshes: AbstractMesh[] = [];
		const rng = seed !== undefined ? createSeededRandom(seed) : null;

		const rustFactor = 1 - rust * 0.4;

		// Materials
		const frameMat = new PBRMaterial(`fireescape_frame_${id}`, scene);
		frameMat.albedoColor = new Color3(
			0.25 * rustFactor + rust * 0.3,
			0.25 * rustFactor + rust * 0.15,
			0.27 * rustFactor
		);
		frameMat.metallic = 0.8;
		frameMat.roughness = 0.4 + rust * 0.4;

		const grateMat = new PBRMaterial(`fireescape_grate_${id}`, scene);
		grateMat.albedoColor = new Color3(
			0.2 * rustFactor + rust * 0.25,
			0.2 * rustFactor + rust * 0.12,
			0.22 * rustFactor
		);
		grateMat.metallic = 0.75;
		grateMat.roughness = 0.5 + rust * 0.35;

		const railMat = new PBRMaterial(`fireescape_rail_${id}`, scene);
		railMat.albedoColor = new Color3(0.3, 0.3, 0.32).scale(rustFactor);
		railMat.metallic = 0.7;
		railMat.roughness = 0.45 + rust * 0.3;

		const barThickness = 0.025;
		const railHeight = 1;

		// Create each floor platform
		for (let floor = 0; floor < floors; floor++) {
			const platformY = posY + floor * floorHeight;
			const zigzagOffset = style === "zigzag" ? (floor % 2 === 0 ? 0 : platformWidth) : 0;

			// Platform grate
			const platform = MeshBuilder.CreateBox(
				`${id}_platform_${floor}`,
				{ width: platformWidth, height: 0.03, depth: platformDepth },
				scene
			);
			platform.position = new Vector3(
				posX + zigzagOffset,
				platformY,
				posZ
			);
			platform.material = grateMat;
			meshes.push(platform);

			// Platform support beams
			for (const beamZ of [-platformDepth / 2 + 0.1, platformDepth / 2 - 0.1]) {
				const beam = MeshBuilder.CreateBox(
					`${id}_beam_${floor}_${beamZ}`,
					{ width: platformWidth, height: 0.06, depth: 0.04 },
					scene
				);
				beam.position = new Vector3(
					posX + zigzagOffset,
					platformY - 0.045,
					posZ + beamZ
				);
				beam.material = frameMat;
				meshes.push(beam);
			}

			// Wall bracket supports
			for (const side of [-1, 1]) {
				const bracket = MeshBuilder.CreateBox(
					`${id}_bracket_${floor}_${side}`,
					{ width: 0.05, height: 0.05, depth: platformDepth * 0.6 },
					scene
				);
				bracket.position = new Vector3(
					posX + zigzagOffset + (side * platformWidth / 2) - side * 0.1,
					platformY - 0.1,
					posZ
				);
				bracket.material = frameMat;
				meshes.push(bracket);

				// Diagonal support
				const diagonal = MeshBuilder.CreateBox(
					`${id}_diagonal_${floor}_${side}`,
					{ width: 0.03, height: 0.8, depth: 0.03 },
					scene
				);
				diagonal.position = new Vector3(
					posX + zigzagOffset + (side * platformWidth / 2) - side * 0.15,
					platformY - 0.5,
					posZ
				);
				diagonal.rotation.z = side * 0.5;
				diagonal.material = frameMat;
				meshes.push(diagonal);
			}

			// Railings
			// Front railing
			const frontRailTop = MeshBuilder.CreateCylinder(
				`${id}_frontRailTop_${floor}`,
				{ height: platformWidth, diameter: barThickness * 2 },
				scene
			);
			frontRailTop.position = new Vector3(
				posX + zigzagOffset,
				platformY + railHeight,
				posZ + platformDepth / 2 - 0.05
			);
			frontRailTop.rotation.z = Math.PI / 2;
			frontRailTop.material = railMat;
			meshes.push(frontRailTop);

			// Railing posts
			for (const postX of [-platformWidth / 2 + 0.05, 0, platformWidth / 2 - 0.05]) {
				const post = MeshBuilder.CreateCylinder(
					`${id}_post_${floor}_${postX}`,
					{ height: railHeight, diameter: barThickness * 2 },
					scene
				);
				post.position = new Vector3(
					posX + zigzagOffset + postX,
					platformY + railHeight / 2,
					posZ + platformDepth / 2 - 0.05
				);
				post.material = railMat;
				meshes.push(post);
			}

			// Side railings (shorter near wall)
			for (const side of [-1, 1]) {
				// Only add outer railing for zigzag style at alternating floors
				const needsRailing = style !== "zigzag" || (floor % 2 === 0 ? side === 1 : side === -1);
				if (needsRailing || floor === floors - 1) {
					const sideRail = MeshBuilder.CreateCylinder(
						`${id}_sideRail_${floor}_${side}`,
						{ height: platformDepth - 0.2, diameter: barThickness * 2 },
						scene
					);
					sideRail.position = new Vector3(
						posX + zigzagOffset + (side * platformWidth / 2) - side * 0.05,
						platformY + railHeight,
						posZ
					);
					sideRail.rotation.x = Math.PI / 2;
					sideRail.material = railMat;
					meshes.push(sideRail);

					// Side posts
					const sidePost = MeshBuilder.CreateCylinder(
						`${id}_sidePost_${floor}_${side}`,
						{ height: railHeight, diameter: barThickness * 2 },
						scene
					);
					sidePost.position = new Vector3(
						posX + zigzagOffset + (side * platformWidth / 2) - side * 0.05,
						platformY + railHeight / 2,
						posZ - platformDepth / 2 + 0.1
					);
					sidePost.material = railMat;
					meshes.push(sidePost);
				}
			}

			// Stairs to next floor (except top floor)
			if (floor < floors - 1) {
				const stairCount = Math.floor(floorHeight / 0.25);
				const stairWidth = platformWidth * 0.8;
				const stairDepth = 0.25;

				// Stairs direction alternates for zigzag
				const stairDirection = style === "zigzag" ? (floor % 2 === 0 ? 1 : -1) : 1;
				const stairStartX = style === "zigzag"
					? (floor % 2 === 0 ? platformWidth / 2 : platformWidth / 2)
					: 0;

				// Stair stringers
				for (const side of [-1, 1]) {
					const stringerLength = Math.sqrt(floorHeight ** 2 + (platformWidth * 0.8) ** 2);
					const stringer = MeshBuilder.CreateBox(
						`${id}_stringer_${floor}_${side}`,
						{ width: 0.05, height: stringerLength, depth: 0.08 },
						scene
					);
					stringer.position = new Vector3(
						posX + zigzagOffset + stairDirection * platformWidth * 0.4 + side * stairWidth / 2,
						platformY + floorHeight / 2,
						posZ - platformDepth / 2 + 0.15
					);
					stringer.rotation.z = Math.atan2(floorHeight, platformWidth * 0.8) * stairDirection;
					stringer.material = frameMat;
					meshes.push(stringer);
				}

				// Individual steps
				for (let step = 0; step < stairCount; step++) {
					const stepY = platformY + step * (floorHeight / stairCount);
					const stepX = stairDirection * (step / stairCount) * platformWidth * 0.8;

					const stair = MeshBuilder.CreateBox(
						`${id}_stair_${floor}_${step}`,
						{ width: stairWidth, height: 0.03, depth: stairDepth },
						scene
					);
					stair.position = new Vector3(
						posX + zigzagOffset + stepX,
						stepY + 0.015,
						posZ - platformDepth / 2 + 0.15
					);
					stair.material = grateMat;
					meshes.push(stair);
				}

				// Stair handrails
				for (const side of [-1, 1]) {
					const handrailLength = Math.sqrt(floorHeight ** 2 + (platformWidth * 0.8) ** 2);
					const handrail = MeshBuilder.CreateCylinder(
						`${id}_handrail_${floor}_${side}`,
						{ height: handrailLength, diameter: barThickness * 2 },
						scene
					);
					handrail.position = new Vector3(
						posX + zigzagOffset + stairDirection * platformWidth * 0.4 + side * stairWidth / 2,
						platformY + floorHeight / 2 + railHeight / 2,
						posZ - platformDepth / 2 + 0.15
					);
					handrail.rotation.z = Math.atan2(floorHeight, platformWidth * 0.8) * stairDirection;
					handrail.material = railMat;
					meshes.push(handrail);
				}
			}
		}

		// Drop ladder at bottom
		if (hasDropLadder) {
			const ladderHeight = floorHeight * 0.8;
			const ladderWidth = 0.4;

			// Ladder rails
			for (const side of [-1, 1]) {
				const rail = MeshBuilder.CreateCylinder(
					`${id}_dropRail_${side}`,
					{ height: ladderHeight, diameter: barThickness * 2 },
					scene
				);
				rail.position = new Vector3(
					posX + side * ladderWidth / 2,
					posY - ladderHeight / 2,
					posZ + platformDepth / 2 - 0.2
				);
				rail.material = frameMat;
				meshes.push(rail);
			}

			// Ladder rungs
			const rungCount = Math.floor(ladderHeight / 0.3);
			for (let i = 0; i < rungCount; i++) {
				const rungY = posY - ladderHeight + (i + 0.5) * 0.3;
				const rung = MeshBuilder.CreateCylinder(
					`${id}_dropRung_${i}`,
					{ height: ladderWidth, diameter: barThickness * 1.5 },
					scene
				);
				rung.position = new Vector3(
					posX,
					rungY,
					posZ + platformDepth / 2 - 0.2
				);
				rung.rotation.z = Math.PI / 2;
				rung.material = grateMat;
				meshes.push(rung);
			}

			// Ladder slide bracket
			const bracket = MeshBuilder.CreateBox(
				`${id}_ladderBracket`,
				{ width: ladderWidth + 0.1, height: 0.2, depth: 0.05 },
				scene
			);
			bracket.position = new Vector3(
				posX,
				posY - 0.1,
				posZ + platformDepth / 2 - 0.15
			);
			bracket.material = frameMat;
			meshes.push(bracket);
		}

		meshRef.current = meshes;

		return () => {
			for (const mesh of meshes) {
				mesh.dispose();
			}
			frameMat.dispose();
			grateMat.dispose();
			railMat.dispose();
		};
	}, [scene, id, posX, posY, posZ, style, floors, floorHeight, platformWidth, platformDepth, rust, hasDropLadder, seed]);

	return null;
}
