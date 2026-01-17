import { GoogleGenAI } from "@google/genai";

const API_KEY = process.env.GOOGLE_GENAI_API_KEY;

async function list() {
	if (!API_KEY) {
		console.log("No API Key");
		return;
	}
	const client = new GoogleGenAI({ apiKey: API_KEY });
	try {
		const response = await client.models.list();
		// The response structure might be { models: [...] } or just array
		console.log(JSON.stringify(response, null, 2));
	} catch (e) {
		console.error(e);
	}
}

list();
