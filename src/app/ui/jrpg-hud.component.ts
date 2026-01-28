import { Component, Input, inject, type OnDestroy, type OnInit } from '@angular/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Subscription } from 'rxjs';
import { InputStateService } from '../state/input-state.service';
import { PlayerStoreService } from '../state/player-store.service';

type DpadState = { left: boolean; right: boolean; up: boolean; down: boolean };

@Component({
  selector: 'app-jrpg-hud',
  standalone: false,
  templateUrl: './jrpg-hud.component.html',
  styleUrls: ['./jrpg-hud.component.scss'],
})
export class JrpgHudComponent implements OnInit, OnDestroy {
  @Input() playerPos: { x: number; y: number } | null = null;

  level = 1;
  hp = 100;
  maxHp = 100;
  xp = 0;
  nextXp = 100;

  private sub = new Subscription();
  private dpadPointerId: number | null = null;
  private dpadRect: DOMRect | null = null;
  private dpadState: DpadState = { left: false, right: false, up: false, down: false };

  private readonly inputState = inject(InputStateService);
  private readonly playerStore = inject(PlayerStoreService);

  ngOnInit(): void {
    this.sub.add(
      this.playerStore.watch().subscribe((player) => {
        this.level = player.level;
        this.xp = player.xp;
        this.nextXp = player.xpToNextLevel;
        this.maxHp = player.stats.structure;
        this.hp = player.stats.structure;
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  get hpPercent(): number {
    if (this.maxHp <= 0) return 0;
    return Math.max(0, (this.hp / this.maxHp) * 100);
  }

  get xpPercent(): number {
    if (this.nextXp <= 0) return 0;
    return Math.min(100, (this.xp / this.nextXp) * 100);
  }

  async handlePress(key: 'left' | 'right' | 'jump' | 'slide' | 'attack' | 'run', pressed: boolean) {
    this.inputState.setKey(key, pressed);
    if (pressed) {
      try {
        await Haptics.impact({ style: ImpactStyle.Light });
      } catch {
        // ignore
      }
    }
  }

  handleDpadPointerDown(event: PointerEvent): void {
    if (this.dpadPointerId !== null) return;
    const target = event.currentTarget as HTMLElement | null;
    if (!target) return;

    this.dpadPointerId = event.pointerId;
    this.dpadRect = target.getBoundingClientRect();
    target.setPointerCapture(event.pointerId);
    this.updateDpadState(event);
  }

  handleDpadPointerMove(event: PointerEvent): void {
    if (event.pointerId !== this.dpadPointerId) return;
    this.updateDpadState(event);
  }

  handleDpadPointerUp(event: PointerEvent): void {
    if (event.pointerId !== this.dpadPointerId) return;
    const target = event.currentTarget as HTMLElement | null;
    target?.releasePointerCapture(event.pointerId);
    this.resetDpadState();
  }

  handleDpadPointerLeave(event: PointerEvent): void {
    if (event.pointerId !== this.dpadPointerId) return;
    this.resetDpadState();
  }

  private updateDpadState(event: PointerEvent): void {
    const rect = this.dpadRect;
    if (!rect) return;

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const dx = event.clientX - centerX;
    const dy = event.clientY - centerY;

    const deadzone = rect.width * 0.18;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    let next: DpadState = { left: false, right: false, up: false, down: false };

    if (absX < deadzone && absY < deadzone) {
      next = { left: false, right: false, up: false, down: false };
    } else if (absX >= absY) {
      if (dx < 0) {
        next = { left: true, right: false, up: false, down: false };
      } else {
        next = { left: false, right: true, up: false, down: false };
      }
    } else if (dy < 0) {
      next = { left: false, right: false, up: true, down: false };
    } else {
      next = { left: false, right: false, up: false, down: true };
    }

    if (this.isSameDpadState(next)) return;
    this.applyDpadState(next);
  }

  private applyDpadState(next: DpadState): void {
    this.setKeyIfChanged('left', next.left);
    this.setKeyIfChanged('right', next.right);
    this.setKeyIfChanged('jump', next.up);
    this.setKeyIfChanged('slide', next.down);

    this.dpadState = next;
    void this.hapticPulse(ImpactStyle.Light);
  }

  private resetDpadState(): void {
    this.setKeyIfChanged('left', false);
    this.setKeyIfChanged('right', false);
    this.setKeyIfChanged('jump', false);
    this.setKeyIfChanged('slide', false);
    this.dpadState = { left: false, right: false, up: false, down: false };
    this.dpadPointerId = null;
    this.dpadRect = null;
  }

  private setKeyIfChanged(key: 'left' | 'right' | 'jump' | 'slide', pressed: boolean): void {
    const current =
      key === 'left'
        ? this.dpadState.left
        : key === 'right'
          ? this.dpadState.right
          : key === 'jump'
            ? this.dpadState.up
            : this.dpadState.down;
    if (current === pressed) return;
    this.inputState.setKey(key, pressed);
  }

  private isSameDpadState(next: DpadState): boolean {
    return (
      next.left === this.dpadState.left &&
      next.right === this.dpadState.right &&
      next.up === this.dpadState.up &&
      next.down === this.dpadState.down
    );
  }

  private async hapticPulse(style: ImpactStyle): Promise<void> {
    try {
      await Haptics.impact({ style });
    } catch {
      // ignore
    }
  }
}
