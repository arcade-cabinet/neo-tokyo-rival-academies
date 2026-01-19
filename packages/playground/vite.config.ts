import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { resolve } from "node:path";

export default defineConfig({
	plugins: [react()],
	server: {
		port: 3001,
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
				wall: resolve(__dirname, "tests/wall.html"),
				roof: resolve(__dirname, "tests/roof.html"),
				floor: resolve(__dirname, "tests/floor.html"),
				building: resolve(__dirname, "tests/building.html"),
				farground: resolve(__dirname, "tests/farground.html"),
				neon: resolve(__dirname, "tests/neon.html"),
				street: resolve(__dirname, "tests/street.html"),
				hero: resolve(__dirname, "tests/hero.html"),
				platform: resolve(__dirname, "tests/platform.html"),
				water: resolve(__dirname, "tests/water.html"),
				cell: resolve(__dirname, "tests/cell.html"),
				streaming: resolve(__dirname, "tests/streaming.html"),
			},
		},
	},
});
