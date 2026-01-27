import type { District } from "../state/worldStore";
import { useWorldStore } from "../state/worldStore";
import { WorldGenerator } from "./WorldGenerator";

/**
 * DistrictManager coordinates district generation and loading/unloading
 * Implements streaming logic for active district management
 */
export class DistrictManager {
	private generator: WorldGenerator;
	private allDistricts: District[];

	constructor(masterSeed: string) {
		this.generator = new WorldGenerator(masterSeed);
		this.allDistricts = [];

		// Initialize world store
		useWorldStore.getState().initialize(masterSeed);
	}

	/**
	 * Initialize the world with districts
	 * For MVP: generates single district (Academy Gate Slums)
	 * For full game: generates 6-9 districts
	 */
	async initialize(singleDistrictMode = true): Promise<void> {
		if (singleDistrictMode) {
			// MVP mode: single hardcoded district
			const district = this.generator.generateSingleDistrict();
			this.allDistricts = [district];
			await this.loadDistrict(district.id);
			this.setCurrentDistrict(district.id);
		} else {
			// Full mode: procedurally generate 6-9 districts
			this.allDistricts = this.generator.generateDistricts(6);
			// Load starting district (Academy Gate Slums - index 0)
			if (this.allDistricts.length > 0) {
				await this.loadDistrict(this.allDistricts[0].id);
				this.setCurrentDistrict(this.allDistricts[0].id);
			}
		}
	}

	/**
	 * Load a district's data and add to active districts
	 */
	async loadDistrict(districtId: string): Promise<void> {
		const district = this.allDistricts.find((d) => d.id === districtId);
		if (!district) {
			console.warn(`District ${districtId} not found`);
			return;
		}

		const store = useWorldStore.getState();

		// Check if already loaded
		if (store.getDistrict(districtId)) {
			console.log(`District ${districtId} already loaded`);
			return;
		}

		// District metadata is registered here. Scene generation happens in the runtime layer.

		store.loadDistrict(district);
		console.log(`Loaded district: ${district.name} (${districtId})`);
	}

	/**
	 * Unload a district to free memory
	 */
	unloadDistrict(districtId: string): void {
		const store = useWorldStore.getState();
		store.unloadDistrict(districtId);
		console.log(`Unloaded district: ${districtId}`);
	}

	/**
	 * Set the current active district
	 */
	setCurrentDistrict(districtId: string): void {
		const store = useWorldStore.getState();
		store.setCurrentDistrict(districtId);
		console.log(`Current district set to: ${districtId}`);
	}

	/**
	 * Get current district data
	 */
	getCurrentDistrict(): District | null {
		const store = useWorldStore.getState();
		const { currentDistrictId } = store;
		if (!currentDistrictId) return null;
		return store.getDistrict(currentDistrictId) || null;
	}

	/**
	 * Get all generated districts (for debugging/testing)
	 */
	getAllDistricts(): District[] {
		return this.allDistricts;
	}

	/**
	 * Stream districts based on player position
	 * Loads adjacent districts, unloads distant ones
	 * @param currentDistrictId The district the player is currently in
	 */
	async streamDistricts(currentDistrictId: string): Promise<void> {
		// Current implementation is a no-op; streaming is handled at the scene layer.
		console.log(`Streaming districts around ${currentDistrictId}`);
	}

	/**
	 * Reset the manager and regenerate world
	 */
	reset(): void {
		const store = useWorldStore.getState();
		store.reset();
		this.allDistricts = [];
		this.generator.reset();
	}
}
