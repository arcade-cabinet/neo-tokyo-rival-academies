import fs from "node:fs/promises";
import path from "node:path";
import { GoogleGenAI } from "@google/genai";

// Config
const API_KEY = process.env.GOOGLE_GENAI_API_KEY;
const MODEL_NAME = "imagen-4.0-generate-001";

// Defined scenes from STORY.md - Expanded for Full Narrative
const SCENES = [
	// --- ACT 1: SECTOR 7 ---
	{
		id: "intro_01",
		title: "The Start Line",
		context:
			"A rain-slicked rooftop in Neo-Tokyo Sector 0. Thunder roars. Neon signs reflect in puddles.",
		characters: [
			"Kai (Red/Gold, holding massive piston hammer, energetic)",
			"Vera (Blue/Silver, floating geometric lance, cold)",
		],
		action:
			"Kai slams his weapon down, cracking the concrete with sparks flying. Vera hovers calmly, looking at a holographic display.",
	},
	{
		id: "intro_02",
		title: "The Rivalry",
		context: "Cinematic close-up, split screen effect.",
		characters: ["Kai", "Vera"],
		action:
			"Kai shouts excitedly with a fiery aura. Vera adjusts her glasses with a disdainful icy glare.",
	},

	// --- ACT 2: THE AMBUSH ---
	{
		id: "boss_intro",
		title: "The Ambush",
		context: "Mid-air above a shattered bridge. Debris falling.",
		characters: ["Vera"],
		action:
			"Vera drops from the sky, her weapon glowing with azure energy, surrounded by drone swarms.",
	},
	{
		id: "boss_mid",
		title: "Calculated Destruction",
		context: "The bridge is collapsing. Digital grids overlay the vision.",
		characters: ["Vera"],
		action:
			"Vera unleashes a barrage of geometric lasers. Kai dodges narrowly.",
	},

	// --- ACT 3: THE ROOFTOPS ---
	{
		id: "rooftop_chase",
		title: "High Velocity",
		context: "Running vertically up a skyscraper side. Motion blur.",
		characters: ["Kai"],
		action:
			"Kai sprints up the side of a building, smashing a window to enter a shortcut.",
	},

	// --- ACT 4: THE SUMMIT ---
	{
		id: "summit_view",
		title: "The Orbital Elevator",
		context:
			"Above the clouds. The massive space elevator structure pierces the sky.",
		characters: ["Kai", "Vera"],
		action:
			'Both racers are side-by-side, exhausted but pushing limits. The "Data Core" glows at the top.',
	},
	{
		id: "final_clash",
		title: "Ignition vs Calculation",
		context: "The peak of the tower. Storm clouds swirling below.",
		characters: ["Kai", "Vera"],
		action:
			"Kai swings his hammer with maximum force. Vera parries with a focused energy shield. Shockwave ripples.",
	},

	// --- ACT 5: VICTORY ---
	{
		id: "victory_kai",
		title: "Ignition Victory",
		context: "Kai holding the glowing Data Core triumphantly.",
		characters: ["Kai"],
		action:
			"Kai grins, thumbs up. Vera floats in the background, analyzing data on a screen, looking annoyed but impressed.",
	},
];

async function generateManifests() {
	console.log("Generating Story Manifests...");

	const manifest: Record<
		string,
		{ prompt: string; description: string; imagePath: string }
	> = {};
	const outDir = path.join(process.cwd(), "public/assets/story");
	await fs.mkdir(outDir, { recursive: true });

	if (!API_KEY) {
		console.warn(
			"GOOGLE_GENAI_API_KEY not found. Generating placeholder manifests.",
		);
		for (const scene of SCENES) {
			manifest[scene.id] = {
				description: `Placeholder for ${scene.title}`,
				prompt: `Placeholder`,
				imagePath: `/assets/story/${scene.id}_placeholder.png`,
			};
		}
	} else {
		console.log("API Key detected. Initializing GoogleGenAI...");
		const client = new GoogleGenAI({ apiKey: API_KEY });

		for (const scene of SCENES) {
			const fileName = `${scene.id}.png`;
			const filePath = path.join(outDir, fileName);
			const publicPath = `/assets/story/${fileName}`;
			const prompt = `Anime style, cel shaded, 8k masterpiece, detailed, neo-tokyo cyberpunk. ${scene.context} ${scene.action} --style raw`;

			// Check if file exists (Idempotency)
			try {
				await fs.access(filePath);
				console.log(`[SKIP] Image exists: ${fileName}`);
				manifest[scene.id] = {
					description: scene.context,
					prompt: prompt,
					imagePath: publicPath,
				};
				continue;
			} catch {
				// File does not exist, generate
			}

			console.log(`[GEN] Generating image for: ${scene.title}...`);

			try {
				const response = await client.models.generateImages({
					model: MODEL_NAME,
					prompt: prompt,
					config: {
						numberOfImages: 1,
						aspectRatio: "16:9",
						safetyFilterLevel: "block_low_and_above",
						personGeneration: "allow_adult",
					},
				});

				// Response structure for generateImages usually has generatedImages[]
				const imgData = response.generatedImages?.[0]?.image?.imageBytes;

				if (imgData) {
					const buffer = Buffer.from(imgData, "base64");
					await fs.writeFile(filePath, buffer);
					console.log(`[OK] Saved: ${fileName}`);

					manifest[scene.id] = {
						description: scene.context,
						prompt: prompt,
						imagePath: publicPath,
					};
				} else {
					console.error(`[ERR] No image data returned for ${scene.id}`);
				}
			} catch (err) {
				console.error(`[ERR] Failed to generate ${scene.id}:`, err);
				// Fallback to placeholder in manifest so app doesn't crash
				manifest[scene.id] = {
					description: `Failed to generate: ${scene.context}`,
					prompt: prompt,
					imagePath: `/assets/story/${scene.id}_placeholder.png`,
				};
			}
		}
	}

	// Write Manifest
	const manifestDir = path.join(process.cwd(), "src/content/story");
	await fs.mkdir(manifestDir, { recursive: true });
	await fs.writeFile(
		path.join(manifestDir, "manifest.json"),
		JSON.stringify(manifest, null, 2),
	);

	console.log(`Manifest written to ${path.join(manifestDir, "manifest.json")}`);
}

generateManifests().catch(console.error);
