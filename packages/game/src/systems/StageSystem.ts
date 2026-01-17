import { STAGES, type StageConfig } from "@/content/stages";

type StageState = "loading" | "playing" | "cutscene" | "complete" | "event";

export class StageSystem {
	currentStageId: string;
	currentStage: StageConfig;
	state: StageState = "loading";
	progress = 0;
	activeEvent: string | null = null;

	constructor(initialStageId = "intro_cutscene") {
		this.currentStageId = initialStageId;
		this.currentStage = STAGES[initialStageId];
		this.loadStage(initialStageId);
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
		this.state = stage.cutsceneId ? "cutscene" : "playing";
		this.activeEvent = null;
	}

	triggerEvent(eventId: string) {
		console.log(`Triggering Event: ${eventId}`);
		this.state = "event";
		this.activeEvent = eventId;
	}

	completeStage() {
		this.state = "complete";
		if (this.currentStage.nextStageId) {
			this.loadStage(this.currentStage.nextStageId);
		} else {
			console.log("Game Complete!");
		}
	}

	update(playerX: number) {
		if (this.state !== "playing") return;

		this.progress = playerX;

		// Check end condition
		if (
			this.currentStage.length > 0 &&
			this.progress >= this.currentStage.length
		) {
			this.completeStage();
		}
	}
}

export const stageSystem = new StageSystem();
