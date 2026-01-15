import * as fs from 'node:fs';
import { githubRequest } from '../lib/github';
export async function modeAutomerge() {
    console.log("Running Automerge Check...");
    const eventPath = process.env.GITHUB_EVENT_PATH;
    if (!eventPath)
        return;
    try {
        const event = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
        // Handle different event types
        let pr = event.pull_request;
        // If it's a check_run or status event, we might need to fetch the PR
        if (!pr && event.check_suite && event.check_suite.pull_requests.length > 0) {
            pr = event.check_suite.pull_requests[0];
        }
        if (!pr) {
            console.log("No PR found in event.");
            return;
        }
        // Fetch full PR details to get labels and mergeable status
        const prDetails = await githubRequest(`pulls/${pr.number}`);
        if (!prDetails)
            return;
        console.log(`Checking PR #${pr.number} for automerge...`);
        const labels = prDetails.labels.map((l) => l.name);
        if (!labels.includes('automerge')) {
            console.log("PR does not have 'automerge' label.");
            return;
        }
        if (prDetails.mergeable_state === 'dirty') {
            console.log("PR is dirty (conflicts). Cannot merge.");
            return;
        }
        // Check CI status
        // We can use the 'commits/{ref}/check-runs' endpoint
        const checks = await githubRequest(`commits/${prDetails.head.sha}/check-runs`);
        const allPassed = checks.check_runs.every((run) => run.conclusion === 'success' || run.conclusion === 'skipped');
        if (!allPassed) {
            console.log("Not all checks have passed yet.");
            return;
        }
        console.log("All checks passed and label present. Merging...");
        await githubRequest(`pulls/${pr.number}/merge`, 'PUT', {
            commit_title: `Automerge PR #${pr.number}`,
            merge_method: 'squash'
        });
        console.log("Merge request sent.");
    }
    catch (e) {
        console.error("Automerge Failed:", e);
    }
}
//# sourceMappingURL=automerge.js.map