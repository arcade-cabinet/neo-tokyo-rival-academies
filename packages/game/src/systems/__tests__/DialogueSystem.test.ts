import { beforeEach, describe, expect, it } from 'vitest';
import { world } from '../../state/ecs';
import { advanceDialogue, getCurrentDialogueNode, startDialogue } from '../DialogueSystem';

describe('DialogueSystem', () => {
  beforeEach(() => {
    world.clear();
  });

  it('should start and advance dialogue', () => {
    const player = world.add({
      id: 'player',
      dialogueState: { isInteracting: false, currentDialogueId: '', nodeId: '' },
    });

    startDialogue('player', 'intro');

    expect(player.dialogueState?.isInteracting).toBe(true);
    expect(player.dialogueState?.currentDialogueId).toBe('intro');
    expect(player.dialogueState?.nodeId).toBe('intro_1');

    const node = getCurrentDialogueNode('player');
    expect(node).toBeDefined();
    expect(node?.text).toContain("Engine's hot");

    advanceDialogue('player');
    expect(player.dialogueState?.nodeId).toBe('intro_2');

    advanceDialogue('player');
    expect(player.dialogueState?.nodeId).toBe('intro_3');

    advanceDialogue('player');
    expect(player.dialogueState?.isInteracting).toBe(false); // Ended
  });

  it('should handle non-existent dialogue gracefully', () => {
    const player = world.add({
      id: 'player',
      dialogueState: { isInteracting: false, currentDialogueId: '', nodeId: '' },
    });

    startDialogue('player', 'MISSING_ID');
    expect(player.dialogueState?.isInteracting).toBe(false);
  });

  it('should handle missing entities gracefully', () => {
    // Should not throw
    startDialogue('missing_entity', 'intro');
    advanceDialogue('missing_entity');
  });
});
