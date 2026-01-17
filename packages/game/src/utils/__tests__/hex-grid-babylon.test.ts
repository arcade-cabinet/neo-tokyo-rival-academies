/**
 * Hex Grid Babylon Tests
 *
 * Property-based tests for hex coordinate conversion.
 * Validates Design Property 2: Hex Coordinate Round Trip
 */

import { Vector3 } from "@babylonjs/core";
import { describe, expect, it } from "vitest";
import {
	axialRound,
	axialToCube,
	cubeToAxial,
	HEX_SIZE,
	hexDistance,
	hexToWorld,
	snapToHex,
	worldToHex,
} from "../hex-grid-babylon";

describe("HexGridBabylon", () => {
	describe("Coordinate Conversion", () => {
		it("should convert axial to world coordinates", () => {
			const pos = hexToWorld(0, 0);
			expect(pos.x).toBe(0);
			expect(pos.y).toBe(0);
			expect(pos.z).toBe(0);
		});

		it("should convert world to axial coordinates", () => {
			const hex = worldToHex(new Vector3(0, 0, 0));
			expect(hex.q).toBe(0);
			expect(hex.r).toBe(0);
		});

		it("should round fractional axial coordinates", () => {
			const rounded = axialRound({ q: 0.4, r: 0.6 });
			expect(Number.isInteger(rounded.q)).toBe(true);
			expect(Number.isInteger(rounded.r)).toBe(true);
		});
	});

	describe("Cube Coordinate Conversion", () => {
		it("should convert axial to cube coordinates", () => {
			const cube = axialToCube({ q: 1, r: 2 });
			expect(cube.x).toBe(1);
			expect(cube.z).toBe(2);
			expect(cube.y).toBe(-3); // x + y + z = 0
		});

		it("should convert cube to axial coordinates", () => {
			const axial = cubeToAxial({ x: 1, y: -3, z: 2 });
			expect(axial.q).toBe(1);
			expect(axial.r).toBe(2);
		});

		it("should maintain cube coordinate constraint", () => {
			const cube = axialToCube({ q: 5, r: -3 });
			expect(cube.x + cube.y + cube.z).toBe(0);
		});
	});

	describe("Property 2: Hex Coordinate Round Trip", () => {
		it("should snap to nearest hex center within radius", () => {
			// Test multiple positions
			const testPositions = [
				new Vector3(0, 0, 0),
				new Vector3(1.5, 0, 2.0),
				new Vector3(-3.2, 0, 4.1),
				new Vector3(10.5, 0, -8.3),
			];

			for (const pos of testPositions) {
				const snapped = snapToHex(pos);
				const distance = Vector3.Distance(pos, snapped);

				// Distance should be within hex radius
				expect(distance).toBeLessThanOrEqual(HEX_SIZE);

				// Snapped position should be at a hex center
				const hex = worldToHex(snapped);
				const reconstructed = hexToWorld(hex.q, hex.r);
				expect(reconstructed.x).toBeCloseTo(snapped.x, 5);
				expect(reconstructed.z).toBeCloseTo(snapped.z, 5);
			}
		});

		it("should produce consistent results for round trip conversion", () => {
			// For any world position, converting to hex and back should snap to nearest center
			const positions = [
				new Vector3(0, 0, 0),
				new Vector3(5.5, 0, 3.2),
				new Vector3(-2.1, 0, -4.8),
				new Vector3(12.3, 0, 7.6),
			];

			for (const pos of positions) {
				const hex1 = worldToHex(pos);
				const world1 = hexToWorld(hex1.q, hex1.r);
				const hex2 = worldToHex(world1);
				const world2 = hexToWorld(hex2.q, hex2.r);

				// Second conversion should be identical to first
				expect(hex2.q).toBe(hex1.q);
				expect(hex2.r).toBe(hex1.r);
				expect(world2.x).toBeCloseTo(world1.x, 5);
				expect(world2.z).toBeCloseTo(world1.z, 5);
			}
		});
	});

	describe("Hex Distance", () => {
		it("should calculate distance between adjacent hexes", () => {
			const dist = hexDistance({ q: 0, r: 0 }, { q: 1, r: 0 });
			expect(dist).toBe(1);
		});

		it("should calculate distance between distant hexes", () => {
			const dist = hexDistance({ q: 0, r: 0 }, { q: 3, r: 4 });
			expect(dist).toBeGreaterThan(0);
		});

		it("should return zero for same hex", () => {
			const dist = hexDistance({ q: 5, r: -3 }, { q: 5, r: -3 });
			expect(dist).toBe(0);
		});
	});
});
