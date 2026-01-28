import { Component, Input, type OnDestroy, type OnInit } from '@angular/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import { Subscription } from 'rxjs';
import type { DialogueService } from '../state/dialogue.service';
import type { InputStateService } from '../state/input-state.service';
import type { PlayerStoreService } from '../state/player-store.service';

@Component({
  selector: 'app-jrpg-hud',
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

  dialogueNode: { speaker: string; text: string } | null = null;

  private sub = new Subscription();

  constructor(
    private readonly inputState: InputStateService,
    private readonly playerStore: PlayerStoreService,
    private readonly dialogueService: DialogueService
  ) {}

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

    this.sub.add(
      this.dialogueService.watchCurrentNode().subscribe((node) => {
        this.dialogueNode = node ? { speaker: node.speaker, text: node.text } : null;
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

  async advanceDialogue() {
    this.dialogueService.advanceDialogue();
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
    } catch {
      // ignore
    }
  }
}
