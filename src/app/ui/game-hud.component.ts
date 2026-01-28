import { Component, Input, inject, type OnDestroy, type OnInit } from '@angular/core';
import { ImpactStyle } from '@capacitor/haptics';
import { Subscription } from 'rxjs';
import { HapticsService } from '../state/haptics.service';
import { InputStateService } from '../state/input-state.service';
import type { InputState } from '../types/game';
import { initialInputState } from '../utils/game-config';

@Component({
  selector: 'app-game-hud',
  standalone: false,
  templateUrl: './game-hud.component.html',
  styleUrls: ['./game-hud.component.scss'],
})
export class GameHudComponent implements OnInit, OnDestroy {
  @Input() score = 0;
  @Input() biome = 0;
  @Input() dialogue: { speaker: string; text: string } | null = null;

  readonly biomeNames = ['SHIBUYA', 'ROPPONGI', 'AKIHABARA', 'SHINJUKU'];
  inputSnapshot: InputState = { ...initialInputState };
  private sub = new Subscription();

  private readonly inputState = inject(InputStateService);
  private readonly haptics = inject(HapticsService);

  ngOnInit(): void {
    this.sub.add(
      this.inputState.watch().subscribe((state) => {
        this.inputSnapshot = state;
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  async handleTouchStart(key: keyof InputState): Promise<void> {
    this.inputState.setKey(key, true);
    await this.haptics.impact(ImpactStyle.Light);
  }

  handleTouchEnd(key: keyof InputState): void {
    this.inputState.setKey(key, false);
  }
}
