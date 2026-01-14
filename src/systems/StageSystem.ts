import { STAGES, type StageConfig } from '@/content/stages';

type StageState = 'loading' | 'playing' | 'cutscene' | 'complete';

export class StageSystem {
  currentStageId: string;
  currentStage: StageConfig;
  state: StageState = 'loading';
  progress = 0;

  constructor(initialStageId = 'intro_cutscene') {
    this.currentStageId = initialStageId;
    this.currentStage = STAGES[initialStageId];
  }

  loadStage(stageId: string) {
    console.log(`Loading Stage: ${stageId}`);
    const stage = STAGES[stageId];
    if (!stage) {
      console.error(`Stage ${stageId} not found!`);
      return;
    }

    this.currentStageId = stageId;
    this.currentStage = stage;
    this.progress = 0;
    this.state = stage.cutsceneId ? 'cutscene' : 'playing';

    // Clear world entities except player?
    // In a real ECS we might recycle, but for now we rely on GameWorld useEffect cleanup or manual clear
    // We will let GameWorld handle the heavy lifting of entity spawning based on this system's state
  }

  completeStage() {
    this.state = 'complete';
    if (this.currentStage.nextStageId) {
      this.loadStage(this.currentStage.nextStageId);
    } else {
      console.log('Game Complete!');
    }
  }

  update(playerX: number) {
    if (this.state !== 'playing') return;

    this.progress = playerX;

    // Check end condition
    if (this.currentStage.length > 0 && this.progress >= this.currentStage.length) {
      this.completeStage();
    }
  }
}

export const stageSystem = new StageSystem();
