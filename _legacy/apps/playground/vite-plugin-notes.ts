/**
 * Vite Plugin: Playground Notes Filesystem
 *
 * Provides a dev-only API endpoint to persist playground notes
 * directly to JSON files on the local filesystem.
 */

import type { Plugin } from "vite";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const NOTES_DIR = "playground-notes";

export function playgroundNotesPlugin(): Plugin {
	let notesDir: string;

	return {
		name: "playground-notes",
		configResolved(config) {
			notesDir = join(config.root, NOTES_DIR);
			// Ensure notes directory exists
			if (!existsSync(notesDir)) {
				mkdirSync(notesDir, { recursive: true });
			}
		},
		configureServer(server) {
			// GET /api/notes/:testId - Load notes
			server.middlewares.use("/api/notes", (req, res, next) => {
				if (req.method === "GET" && req.url) {
					const testId = req.url.slice(1); // Remove leading /
					if (!testId || testId.includes("..")) {
						res.statusCode = 400;
						res.end(JSON.stringify({ error: "Invalid testId" }));
						return;
					}

					const filePath = join(notesDir, `${testId}.json`);
					try {
						const data = existsSync(filePath)
							? readFileSync(filePath, "utf-8")
							: "[]";
						res.setHeader("Content-Type", "application/json");
						res.end(data);
					} catch (e) {
						res.statusCode = 500;
						res.end(JSON.stringify({ error: String(e) }));
					}
					return;
				}

				// POST /api/notes/:testId - Save notes
				if (req.method === "POST" && req.url) {
					const testId = req.url.slice(1);
					if (!testId || testId.includes("..")) {
						res.statusCode = 400;
						res.end(JSON.stringify({ error: "Invalid testId" }));
						return;
					}

					let body = "";
					req.on("data", (chunk) => {
						body += chunk.toString();
					});
					req.on("end", () => {
						try {
							const notes = JSON.parse(body);
							const filePath = join(notesDir, `${testId}.json`);
							writeFileSync(filePath, JSON.stringify(notes, null, 2));
							res.setHeader("Content-Type", "application/json");
							res.end(JSON.stringify({ success: true, path: filePath }));
							console.log(`[notes] Saved ${notes.length} notes to ${filePath}`);
						} catch (e) {
							res.statusCode = 500;
							res.end(JSON.stringify({ error: String(e) }));
						}
					});
					return;
				}

				next();
			});
		},
	};
}

export default playgroundNotesPlugin;
