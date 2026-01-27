import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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

@Injectable({ providedIn: 'root' })
export class DialogueService {
  private storyData: StoryData | null = null;
  private readonly currentNode$ = new BehaviorSubject<DialogueNode | null>(null);
  private activeDialogueId: string | null = null;

  async load(): Promise<void> {
    if (this.storyData) return;
    const response = await fetch('/assets/data/story.json');
    if (!response.ok) {
      throw new Error('Failed to load story data');
    }
    this.storyData = (await response.json()) as StoryData;
  }

  watchCurrentNode() {
    return this.currentNode$.asObservable();
  }

  async startDialogue(dialogueId: string): Promise<void> {
    await this.load();
    if (!this.storyData) return;

    const sequence = this.storyData.dialogues[dialogueId];
    if (!sequence || sequence.length === 0) {
      this.currentNode$.next(null);
      return;
    }

    this.activeDialogueId = dialogueId;
    this.currentNode$.next(sequence[0]);
  }

  advanceDialogue(): void {
    if (!this.storyData || !this.activeDialogueId) {
      this.currentNode$.next(null);
      return;
    }

    const sequence = this.storyData.dialogues[this.activeDialogueId];
    if (!sequence || sequence.length === 0) {
      this.currentNode$.next(null);
      return;
    }

    const current = this.currentNode$.getValue();
    if (!current?.next) {
      this.currentNode$.next(null);
      this.activeDialogueId = null;
      return;
    }

    const next = sequence.find((node) => node.id === current.next) || null;
    this.currentNode$.next(next);
  }
}
