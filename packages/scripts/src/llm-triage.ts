import { modeTriage } from './commands/triage.js';
import { modeHealthCheck } from './commands/health-check.js';
import { modePrepareBatch } from './commands/prepare-batch.js';
import { modeAnalyzeFailure } from './commands/analyze-failure.js';
import { modeAutomerge } from './commands/automerge.js';

async function main() {
    const mode = process.argv[2];
    switch (mode) {
        case 'TRIAGE': await modeTriage(); break;
        case 'HEALTH_CHECK': await modeHealthCheck(); break;
        case 'PREPARE_BATCH': await modePrepareBatch(); break;
        case 'ANALYZE_FAILURE': await modeAnalyzeFailure(); break;
        case 'AUTOMERGE': await modeAutomerge(); break;
        default:
            console.log("Usage: tsx src/llm-triage.ts [TRIAGE|HEALTH_CHECK|PREPARE_BATCH|ANALYZE_FAILURE|AUTOMERGE]");
    }
}

main().catch(console.error);
