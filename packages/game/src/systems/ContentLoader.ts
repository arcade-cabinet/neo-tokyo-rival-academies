import storyData from '../data/generated_jrpg.json';
import { useGameStore } from '../state/gameStore';
import { stageSystem } from './StageSystem';

export class ContentLoader {
    static loadContent() {
        console.log("Hydrating Game Content from GenAI...");
        
        // 1. Load Quests into GameStore (as available)
        const quests = [];
        for (const chapter of storyData.chapters) {
            if (chapter.quests) {
                quests.push(...chapter.quests.map(q => ({
                    ...q,
                    completed: false,
                    active: false
                })));
            }
        }
        // Ideally we'd have a method to register all quests, for now we just log
        console.log(`Loaded ${quests.length} quests.`);

        // 2. Hydrate Stages
        // We can't easily replace the static STAGES constant at runtime without refactoring StageSystem to use a Map.
        // For now, we will map the GenAI chapters to valid stage IDs if possible, or log the disconnect.
        
        // 3. Hydrate Dialogue
        // The DialogueSystem currently reads from story.json. 
        // We need to merge generated scripts into that or redirect DialogueSystem.
    }
    
    static getChapter(chapterId: string) {
        return storyData.chapters.find(c => c.id === chapterId);
    }
}
