import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
	plugins: [react()],
	server: {
		port: 3001,
		host: "0.0.0.0",
	},
	resolve: {
		alias: {
			"@": resolve(__dirname, "./src"),
		},
	},
	build: {
		rollupOptions: {
			input: {
				main: resolve(__dirname, "index.html"),
				// Structural primitives
				wall: resolve(__dirname, "tests/wall.html"),
				texturedWall: resolve(__dirname, "tests/textured-wall.html"),
				cornerWall: resolve(__dirname, "tests/corner-wall.html"),
				roof: resolve(__dirname, "tests/roof.html"),
				floor: resolve(__dirname, "tests/floor.html"),
				// Transport
				water: resolve(__dirname, "tests/water.html"),
				railPath: resolve(__dirname, "tests/rail-path.html"),
				platform: resolve(__dirname, "tests/platform.html"),
				ferry: resolve(__dirname, "tests/ferry.html"),
				// Environment
				farground: resolve(__dirname, "tests/farground.html"),
				neon: resolve(__dirname, "tests/neon.html"),
				// Character & Navigation
				hero: resolve(__dirname, "tests/hero.html"),
				navmesh: resolve(__dirname, "tests/navmesh.html"),
				// Assembled structures
				building: resolve(__dirname, "tests/building.html"),
				alley: resolve(__dirname, "tests/alley.html"),
				bridge: resolve(__dirname, "tests/bridge.html"),
				room: resolve(__dirname, "tests/room.html"),
				// Integration demos
				rooftopScene: resolve(__dirname, "tests/rooftop-scene.html"),
				// World generation (TODO)
				cell: resolve(__dirname, "tests/cell.html"),
				streaming: resolve(__dirname, "tests/streaming.html"),
				street: resolve(__dirname, "tests/street.html"),
			},
		},
	},
});
