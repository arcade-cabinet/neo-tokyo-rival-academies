import * as fs from 'node:fs';
import { callLLM } from '../lib/llm.js';
import { githubRequest } from '../lib/github.js';

interface TriageResponse {
    labels?: string[];
    is_duplicate?: boolean;
}

function extractJsonFromResponse(response: string): TriageResponse | null {
    try {
        // Clean markdown code blocks
        let clean = response.trim();

        // Remove markdown code block markers
        if (clean.startsWith('```')) {
            const firstNewline = clean.indexOf('\n');
            if (firstNewline !== -1) {
                clean = clean.substring(firstNewline + 1);
            }
            if (clean.endsWith('```')) {
                clean = clean.substring(0, clean.length - 3);
            }
        }

        // Find start/end of JSON object
        const start = clean.indexOf('{');
        const end = clean.lastIndexOf('}');

        if (start !== -1 && end !== -1) {
            clean = clean.substring(start, end + 1);
            const data = JSON.parse(clean);
            if (typeof data === 'object' && data !== null) {
                return data as TriageResponse;
            }
        }
    } catch (e) {
        console.error("Failed to parse JSON response:", e);
    }
    return null;
}

export async function modeTriage() {
    console.log("Running Triage Mode...");
    const eventPath = process.env.GITHUB_EVENT_PATH;
    if (!eventPath) return;

    try {
        const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
        const issue = event.issue || event.pull_request;
        if (!issue) return;

        console.log(`Triaging #${issue.number}: ${issue.title}`);
        const prompt = `
        Analyze the following GitHub item (Issue or PR) and identify the most appropriate labels.
        Valid labels: bug, feature, question, documentation, enhancement, critical.
        Also, determine if it seems like a duplicate (hypothetically).

        Title: ${issue.title}
        Body: ${issue.body}

        Return ONLY a JSON object: {"labels": ["label1", "label2"], "is_duplicate": false}
        `;

        const response = await callLLM(prompt);
        if (response) {
             const data = extractJsonFromResponse(response);
             if (data && data.labels && data.labels.length > 0) {
                 console.log(`Applying labels: ${data.labels}`);
                 const result = await githubRequest(`issues/${issue.number}/labels`, 'POST', { labels: data.labels });
                 if (!result) {
                     console.error("Failed to apply labels via GitHub API.");
                 }
             }
        }
    } catch (e) {
        console.error("Triage Failed:", e);
    }
}
