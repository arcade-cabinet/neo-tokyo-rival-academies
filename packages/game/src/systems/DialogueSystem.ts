import { world } from '../state/ecs';
import storyDataRaw from '../data/story.json';
import generatedDataRaw from '../data/generated_jrpg.json';

interface DialogueNode {
  id: string;
  speaker: string;
  text: string;
  next: string | null;
}

interface StoryData {
  dialogues: Record<string, DialogueNode[]>;
  items: Record<string, { name: string; description: string }>;
  lore: Record<string, { title: string; content: string }>;
}

const storyData = storyDataRaw as StoryData;

// Merge Generated Data
// Map "beatId" or specific IDs to dialogue sequences
// The generated data structure is: scripts: { chapterId, beatId, dialogues: [] }[]
// We will map 'chapterId_beatId' -> dialogues
const genData = generatedDataRaw as any;
if (genData.scripts) {
    for (const script of genData.scripts) {
        const key = `${script.chapterId}_${script.beatId}`; // e.g. ch_1_beat_1
        // Convert micro-dialogue format to DialogueNode format if needed
        // Micro: { id, speaker, text, next, options }
        // Node: { id, speaker, text, next }
        // They are compatible enough for now, assuming simple linear for next.
        storyData.dialogues[key] = script.dialogues.map((d: any) => ({
            id: d.id || 'unknown',
            speaker: d.speaker,
            text: d.line || d.text, // Handle both formats
            next: d.next
        }));
    }
}

/**
 * Starts a dialogue sequence for an entity.
 */
export const startDialogue = (entityId: string, dialogueId: string) => {
  const entity = world.with('dialogueState').where((e) => e.id === entityId).first;

  const dialogueSequence = storyData.dialogues[dialogueId];

  // Optional chaining fix: Check if entity exists and dialogueState is present
  if (entity?.dialogueState && dialogueSequence && dialogueSequence.length > 0) {
    entity.dialogueState.isInteracting = true;
    entity.dialogueState.currentDialogueId = dialogueId;
    entity.dialogueState.nodeId = dialogueSequence[0].id;
    // console.debug(`Dialogue started: ${dialogueId}`);
  } else {
    console.warn(`Could not start dialogue: ${dialogueId} for entity ${entityId}`);
  }
};

/**
 * Advances the dialogue to the next node.
 */
export const advanceDialogue = (entityId: string) => {
  const entity = world.with('dialogueState').where((e) => e.id === entityId).first;

  if (entity?.dialogueState?.isInteracting) {
    const dialogueSequence = storyData.dialogues[entity.dialogueState.currentDialogueId];
    if (!dialogueSequence) return;

    // Optional chaining fix
    const currentNode = dialogueSequence.find((n) => n.id === entity.dialogueState?.nodeId);

    if (currentNode?.next) {
      entity.dialogueState.nodeId = currentNode.next;
      // console.debug(`Dialogue advanced to: ${currentNode.next}`);
    } else {
      // End dialogue
      entity.dialogueState.isInteracting = false;
      entity.dialogueState.currentDialogueId = '';
      entity.dialogueState.nodeId = '';
      // console.debug('Dialogue ended');
    }
  }
};

/**
 * Gets the current dialogue node data.
 */
export const getCurrentDialogueNode = (entityId: string) => {
    const entity = world.with('dialogueState').where((e) => e.id === entityId).first;
    if (entity?.dialogueState?.isInteracting) {
        const dialogueSequence = storyData.dialogues[entity.dialogueState.currentDialogueId];
        if (!dialogueSequence) return null;

        // Optional chaining fix
        return dialogueSequence.find((n) => n.id === entity.dialogueState?.nodeId) || null;
    }
    return null;
}
