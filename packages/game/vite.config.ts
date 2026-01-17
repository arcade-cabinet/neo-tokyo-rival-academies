import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react()],
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "./src"),
			"@components": path.resolve(__dirname, "./src/components"),
			"@utils": path.resolve(__dirname, "./src/utils"),
			"@systems": path.resolve(__dirname, "./src/systems"),
			"@state": path.resolve(__dirname, "./src/state"),
		},
	},
	base: "./", // Relative base for Capacitor
	build: {
		outDir: "dist",
		emptyOutDir: true,
	},
	server: {
		host: true,
		port: 4321,
	},
});
