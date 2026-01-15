import * as fs from 'node:fs';
import * as path from 'node:path';
import { githubRequest } from '../lib/github';
export async function modePrepareBatch() {
    console.log("Preparing Jules Batch...");
    const issues = await githubRequest("issues?state=open&labels=queue-for-jules");
    const promptPath = path.join(process.cwd(), "prompt.txt");
    if (!issues || issues.length === 0) {
        console.log("No issues found.");
        fs.writeFileSync(promptPath, "NO_WORK");
        return;
    }
    let consolidated = "You are working on a batch of tasks. Address the following issues:\n\n";
    for (const issue of issues) {
        consolidated += `--- Issue #${issue.number}: ${issue.title} ---\n${issue.body}\n\n`;
    }
    consolidated += "For each issue, perform the changes and verify.";
    fs.writeFileSync(promptPath, consolidated);
    console.log("prompt.txt created at " + promptPath);
}
//# sourceMappingURL=prepare-batch.js.map