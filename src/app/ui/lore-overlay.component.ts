import { Component, inject, type OnDestroy, type OnInit } from '@angular/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Subscription } from 'rxjs';
import { DialogueService, type LoreEntry } from '../state/dialogue.service';
import { InputStateService } from '../state/input-state.service';

@Component({
  selector: 'app-lore-overlay',
  standalone: false,
  templateUrl: './lore-overlay.component.html',
  styleUrls: ['./lore-overlay.component.scss'],
})
export class LoreOverlayComponent implements OnInit, OnDestroy {
  entry: LoreEntry | null = null;

  private readonly dialogue = inject(DialogueService);
  private readonly inputState = inject(InputStateService);
  private readonly subs = new Subscription();

  ngOnInit(): void {
    this.subs.add(
      this.dialogue.watchLore().subscribe((entry) => {
        this.entry = entry;
        if (entry) {
          this.inputState.reset();
        }
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
  }

  async close(): Promise<void> {
    this.dialogue.clearLore();
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {
      // ignore
    }
  }
}
