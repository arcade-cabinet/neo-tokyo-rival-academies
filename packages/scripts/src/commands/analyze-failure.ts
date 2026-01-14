import { callLLM } from '../lib/llm';

export async function modeAnalyzeFailure() {
    console.log("Analyzing Failure...");
    const runId = process.env.GITHUB_RUN_ID;
    const prompt = `The CI run ${runId} failed. Please analyze (simulated).`;
    const analysis = await callLLM(prompt);
    console.log("Analysis:", analysis);
}
