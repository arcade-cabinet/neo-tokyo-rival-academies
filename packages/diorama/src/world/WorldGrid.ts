/**
 * WorldGrid - Open world cell management
 *
 * Daggerfall-style procedural city generation.
 * Manages a grid of cells, each containing buildings/streets/props.
 * Streams cells in/out based on player position.
 */

// Cell size in world units (meters)
export const CELL_SIZE = 20;

// World size in cells
export const WORLD_WIDTH = 50; // 1000 meters
export const WORLD_DEPTH = 50; // 1000 meters

// Loading radius in cells
export const LOAD_RADIUS = 2; // Load 5x5 grid around player
export const UNLOAD_RADIUS = 4; // Unload beyond 9x9

// Vertical strata elevation ranges
export const STRATA = {
	upper: { minY: 60, maxY: 100 },
	mid: { minY: 0, maxY: 40 },
	lower: { minY: -30, maxY: 0 },
} as const;

export type StratumId = keyof typeof STRATA;

export type CellType =
	| "building"
	| "street"
	| "plaza"
	| "bridge"
	| "elevator"
	| "park"
	| "alley";

export interface WorldCell {
	/** Grid x coordinate */
	x: number;
	/** Grid z coordinate */
	z: number;
	/** Assigned district ID */
	districtId: string;
	/** Vertical stratum */
	stratum: StratumId;
	/** Cell content type */
	cellType: CellType;
	/** Deterministic seed for this cell */
	seed: string;
	/** Is cell content loaded? */
	loaded: boolean;
	/** Cell world position (center) */
	worldPosition: { x: number; y: number; z: number };
}

export interface DistrictCenter {
	x: number;
	z: number;
	districtIndex: number;
}

/**
 * World Grid manager
 */
export class WorldGrid {
	private readonly masterSeed: string;
	private readonly cells: Map<string, WorldCell> = new Map();
	private readonly districtCenters: DistrictCenter[];

	constructor(masterSeed: string) {
		this.masterSeed = masterSeed;
		this.districtCenters = this.generateDistrictCenters();
		this.initializeCells();
	}

	/**
	 * Get cell key from grid coordinates
	 */
	private getCellKey(x: number, z: number): string {
		return `${x},${z}`;
	}

	/**
	 * Get cell at grid coordinates
	 */
	getCell(x: number, z: number): WorldCell | undefined {
		return this.cells.get(this.getCellKey(x, z));
	}

	/**
	 * Convert world position to grid coordinates
	 */
	worldToGrid(worldX: number, worldZ: number): { x: number; z: number } {
		return {
			x: Math.floor(worldX / CELL_SIZE) + Math.floor(WORLD_WIDTH / 2),
			z: Math.floor(worldZ / CELL_SIZE) + Math.floor(WORLD_DEPTH / 2),
		};
	}

	/**
	 * Convert grid coordinates to world position (cell center)
	 */
	gridToWorld(gridX: number, gridZ: number): { x: number; z: number } {
		return {
			x: (gridX - Math.floor(WORLD_WIDTH / 2)) * CELL_SIZE + CELL_SIZE / 2,
			z: (gridZ - Math.floor(WORLD_DEPTH / 2)) * CELL_SIZE + CELL_SIZE / 2,
		};
	}

	/**
	 * Get cells that should be loaded for given player position
	 */
	getCellsToLoad(playerX: number, playerZ: number): WorldCell[] {
		const grid = this.worldToGrid(playerX, playerZ);
		const cells: WorldCell[] = [];

		for (let dx = -LOAD_RADIUS; dx <= LOAD_RADIUS; dx++) {
			for (let dz = -LOAD_RADIUS; dz <= LOAD_RADIUS; dz++) {
				const cell = this.getCell(grid.x + dx, grid.z + dz);
				if (cell && !cell.loaded) {
					cells.push(cell);
				}
			}
		}

		return cells;
	}

	/**
	 * Get cells that should be unloaded for given player position
	 */
	getCellsToUnload(playerX: number, playerZ: number): WorldCell[] {
		const grid = this.worldToGrid(playerX, playerZ);
		const cells: WorldCell[] = [];

		for (const cell of this.cells.values()) {
			if (!cell.loaded) continue;

			const dx = Math.abs(cell.x - grid.x);
			const dz = Math.abs(cell.z - grid.z);

			if (dx > UNLOAD_RADIUS || dz > UNLOAD_RADIUS) {
				cells.push(cell);
			}
		}

		return cells;
	}

	/**
	 * Mark cell as loaded
	 */
	markLoaded(x: number, z: number): void {
		const cell = this.getCell(x, z);
		if (cell) {
			cell.loaded = true;
		}
	}

	/**
	 * Mark cell as unloaded
	 */
	markUnloaded(x: number, z: number): void {
		const cell = this.getCell(x, z);
		if (cell) {
			cell.loaded = false;
		}
	}

	/**
	 * Generate Voronoi district centers from seed
	 */
	private generateDistrictCenters(): DistrictCenter[] {
		const rng = this.createRNG(`${this.masterSeed}-districts`);
		const centers: DistrictCenter[] = [];

		// 10 districts spread across the world
		for (let i = 0; i < 10; i++) {
			centers.push({
				x: Math.floor(rng() * WORLD_WIDTH),
				z: Math.floor(rng() * WORLD_DEPTH),
				districtIndex: i,
			});
		}

		return centers;
	}

	/**
	 * Initialize all cells in the grid
	 */
	private initializeCells(): void {
		for (let x = 0; x < WORLD_WIDTH; x++) {
			for (let z = 0; z < WORLD_DEPTH; z++) {
				const cell = this.createCell(x, z);
				this.cells.set(this.getCellKey(x, z), cell);
			}
		}
	}

	/**
	 * Create a cell at given grid coordinates
	 */
	private createCell(gridX: number, gridZ: number): WorldCell {
		// Assign district based on nearest Voronoi center
		const districtIndex = this.findNearestDistrict(gridX, gridZ);
		const districtId = DISTRICT_IDS[districtIndex];

		// Determine stratum based on position (center is upper, edges are lower)
		const stratum = this.determineStratum(gridX, gridZ);

		// Cell-specific seed
		const seed = `${this.masterSeed}-cell-${gridX}-${gridZ}`;
		const rng = this.createRNG(seed);

		// Determine cell type based on position and random
		const cellType = this.determineCellType(gridX, gridZ, rng);

		// Calculate world position
		const worldPos = this.gridToWorld(gridX, gridZ);
		const stratumConfig = STRATA[stratum];
		const y = stratumConfig.minY + (stratumConfig.maxY - stratumConfig.minY) / 2;

		return {
			x: gridX,
			z: gridZ,
			districtId,
			stratum,
			cellType,
			seed,
			loaded: false,
			worldPosition: { x: worldPos.x, y, z: worldPos.z },
		};
	}

	/**
	 * Find nearest district center to a cell
	 */
	private findNearestDistrict(gridX: number, gridZ: number): number {
		let nearest = 0;
		let minDist = Infinity;

		for (let i = 0; i < this.districtCenters.length; i++) {
			const center = this.districtCenters[i];
			const dx = gridX - center.x;
			const dz = gridZ - center.z;
			const dist = dx * dx + dz * dz;

			if (dist < minDist) {
				minDist = dist;
				nearest = i;
			}
		}

		return nearest;
	}

	/**
	 * Determine stratum based on grid position
	 */
	private determineStratum(gridX: number, gridZ: number): StratumId {
		const centerX = WORLD_WIDTH / 2;
		const centerZ = WORLD_DEPTH / 2;

		const distFromCenter = Math.sqrt(
			Math.pow(gridX - centerX, 2) + Math.pow(gridZ - centerZ, 2)
		);

		const maxDist = Math.sqrt(centerX * centerX + centerZ * centerZ);
		const ratio = distFromCenter / maxDist;

		// Center = upper, edges = lower
		if (ratio < 0.3) return "upper";
		if (ratio < 0.7) return "mid";
		return "lower";
	}

	/**
	 * Determine cell type based on position and randomness
	 */
	private determineCellType(
		gridX: number,
		gridZ: number,
		rng: () => number
	): CellType {
		// Streets form a grid pattern (every 4th cell)
		const isStreetX = gridX % 4 === 0;
		const isStreetZ = gridZ % 4 === 0;

		if (isStreetX && isStreetZ) {
			// Intersection - could be plaza or elevator
			const r = rng();
			if (r < 0.1) return "elevator";
			if (r < 0.3) return "plaza";
			return "street";
		}

		if (isStreetX || isStreetZ) {
			// Regular street
			const r = rng();
			if (r < 0.05) return "bridge";
			return "street";
		}

		// Building cell
		const r = rng();
		if (r < 0.1) return "park";
		if (r < 0.2) return "alley";
		return "building";
	}

	/**
	 * Create seeded RNG
	 */
	private createRNG(seed: string): () => number {
		let hash = 0;
		for (let i = 0; i < seed.length; i++) {
			const char = seed.charCodeAt(i);
			hash = (hash << 5) - hash + char;
			hash = hash & hash;
		}

		return () => {
			hash = Math.imul(hash ^ (hash >>> 16), 0x85ebca6b);
			hash = Math.imul(hash ^ (hash >>> 13), 0xc2b2ae35);
			hash ^= hash >>> 16;
			return (hash >>> 0) / 0xffffffff;
		};
	}
}

// District IDs matching WORLD_GENERATION.md
export const DISTRICT_IDS = [
	"academy_gate_slums",
	"neon_spire_entertainment",
	"corporate_pinnacle",
	"industrial_forge",
	"underground_sewer",
	"rooftop_skybridge",
	"abandoned_overgrowth",
	"club_eclipse",
	"central_pillar_hub",
	"fringe_resistance",
] as const;

export type DistrictId = (typeof DISTRICT_IDS)[number];
