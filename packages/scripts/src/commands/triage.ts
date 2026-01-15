import * as fs from 'node:fs';
import { callLLM } from '../lib/llm';
import { githubRequest } from '../lib/github';

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

        let response = await callLLM(prompt);
        if (response) {
             response = response.replace(/```json/g, '').replace(/```/g, '').trim();
             const start = response.indexOf('{');
             const end = response.lastIndexOf('}');
             if (start !== -1 && end !== -1) {
                response = response.substring(start, end + 1);
                const data = JSON.parse(response);
                if (data.labels && data.labels.length > 0) {
                    console.log(`Applying labels: ${data.labels}`);
                    await githubRequest(`issues/${issue.number}/labels`, 'POST', { labels: data.labels });
                }
             }
        }
    } catch (e) {
        console.error("Triage Failed:", e);
        throw e;
    }
}
