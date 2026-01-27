import { Component, Input } from '@angular/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import type { InputState } from '../types/game';
import { InputStateService } from '../state/input-state.service';

@Component({
  selector: 'app-game-hud',
  templateUrl: './game-hud.component.html',
  styleUrls: ['./game-hud.component.scss'],
})
export class GameHudComponent {
  @Input() score = 0;
  @Input() biome = 0;
  @Input() dialogue: { speaker: string; text: string } | null = null;

  readonly biomeNames = ['SHIBUYA', 'ROPPONGI', 'AKIHABARA', 'SHINJUKU'];

  constructor(private readonly inputState: InputStateService) {}

  async handleTouchStart(key: keyof InputState): Promise<void> {
    this.inputState.setKey(key, true);
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {
      // ignore
    }
  }

  handleTouchEnd(key: keyof InputState): void {
    this.inputState.setKey(key, false);
  }
}
