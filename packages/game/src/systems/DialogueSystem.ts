import storyDataRaw from '../data/story.json';
import { world } from '../state/ecs';

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

/**
 * Starts a dialogue sequence for an entity.
 */
export const startDialogue = (entityId: string, dialogueId: string) => {
  const entity = world.with('dialogueState').where((e) => e.id === entityId).first;

  const dialogueSequence = storyData.dialogues[dialogueId];

  if (entity && entity.dialogueState && dialogueSequence) {
    entity.dialogueState.isInteracting = true;
    entity.dialogueState.currentDialogueId = dialogueId;
    entity.dialogueState.nodeId = dialogueSequence[0].id;
    console.log(`Dialogue started: ${dialogueId}`);
  } else {
    console.warn(`Could not start dialogue: ${dialogueId} for entity ${entityId}`);
  }
};

/**
 * Advances the dialogue to the next node.
 */
export const advanceDialogue = (entityId: string) => {
  const entity = world.with('dialogueState').where((e) => e.id === entityId).first;

  if (entity && entity.dialogueState && entity.dialogueState.isInteracting) {
    const dialogueSequence = storyData.dialogues[entity.dialogueState.currentDialogueId];
    if (!dialogueSequence) return;

    const currentNode = dialogueSequence.find((n) => n.id === entity.dialogueState!.nodeId);

    if (currentNode && currentNode.next) {
      entity.dialogueState.nodeId = currentNode.next;
      console.log(`Dialogue advanced to: ${currentNode.next}`);
    } else {
      // End dialogue
      entity.dialogueState.isInteracting = false;
      entity.dialogueState.currentDialogueId = '';
      entity.dialogueState.nodeId = '';
      console.log('Dialogue ended');
    }
  }
};

/**
 * Gets the current dialogue node data.
 */
export const getCurrentDialogueNode = (entityId: string) => {
  const entity = world.with('dialogueState').where((e) => e.id === entityId).first;
  if (entity && entity.dialogueState && entity.dialogueState.isInteracting) {
    const dialogueSequence = storyData.dialogues[entity.dialogueState.currentDialogueId];
    if (!dialogueSequence) return null;

    return dialogueSequence.find((n) => n.id === entity.dialogueState!.nodeId) || null;
  }
  return null;
};
