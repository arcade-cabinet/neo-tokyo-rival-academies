import { modeTriage } from './commands/triage';
import { modeHealthCheck } from './commands/health-check';
import { modePrepareBatch } from './commands/prepare-batch';
import { modeAnalyzeFailure } from './commands/analyze-failure';

async function main() {
    const mode = process.argv[2];
    switch (mode) {
        case 'TRIAGE': await modeTriage(); break;
        case 'HEALTH_CHECK': await modeHealthCheck(); break;
        case 'PREPARE_BATCH': await modePrepareBatch(); break;
        case 'ANALYZE_FAILURE': await modeAnalyzeFailure(); break;
        default:
            console.log("Usage: tsx src/llm-triage.ts [TRIAGE|HEALTH_CHECK|PREPARE_BATCH|ANALYZE_FAILURE]");
    }
}

main().catch(console.error);
