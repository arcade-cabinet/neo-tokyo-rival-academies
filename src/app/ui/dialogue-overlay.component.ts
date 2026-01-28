import { Component, inject, type OnDestroy, type OnInit } from '@angular/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Subscription } from 'rxjs';
import { DialogueService } from '../state/dialogue.service';
import { InputStateService } from '../state/input-state.service';

interface DialogueNode {
  id: string;
  speaker: string;
  text: string;
  next: string | null;
}

@Component({
  selector: 'app-dialogue-overlay',
  standalone: false,
  templateUrl: './dialogue-overlay.component.html',
  styleUrls: ['./dialogue-overlay.component.scss'],
})
export class DialogueOverlayComponent implements OnInit, OnDestroy {
  node: DialogueNode | null = null;

  private readonly dialogue = inject(DialogueService);
  private readonly inputState = inject(InputStateService);
  private readonly subs = new Subscription();

  ngOnInit(): void {
    this.subs.add(
      this.dialogue.watchCurrentNode().subscribe((node) => {
        this.node = node;
        if (node) {
          this.inputState.reset();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  async handleAdvance(): Promise<void> {
    if (!this.node) return;
    this.dialogue.advanceDialogue();
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {
      // ignore
    }
  }
}
