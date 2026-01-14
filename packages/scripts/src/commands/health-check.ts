import * as fs from 'node:fs';
import * as path from 'node:path';
import { execSync } from 'node:child_process';
import { callLLM } from '../lib/llm';
import { githubRequest } from '../lib/github';
import { fileURLToPath } from 'node:url';

// Assuming we run this from packages/scripts
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '../../../..');

export async function modeHealthCheck() {
    console.log("Running Health Check...");

    let lintOutput = "";
    try {
        // Run check from root
        lintOutput = execSync("pnpm -r check", { cwd: ROOT_DIR, encoding: 'utf8', stdio: 'pipe' });
    } catch (e: any) {
        lintOutput = e.stdout + e.stderr;
    }

    let agentsMd = "";
    const agentsPath = path.join(ROOT_DIR, "AGENTS.md");
    if (fs.existsSync(agentsPath)) {
        agentsMd = fs.readFileSync(agentsPath, 'utf8');
    }

    const prompt = `
    Review the project health.

    LINTING STATUS:
    ${lintOutput.slice(-2000)}

    AGENTS.md Rules (excerpt):
    ${agentsMd.slice(0, 2000)}...

    Tasks:
    1. Summarize linting errors.
    2. Check compliance with AGENTS.md.
    3. Suggest fixes.

    Return a markdown summary.
    `;

    const report = await callLLM(prompt);
    if (report) {
        console.log("Health Report Generated.");
        await githubRequest("issues", "POST", {
            title: "Weekly Health Report",
            body: report,
            labels: ["health-check"]
        });
    }
}
