import { Component, type OnDestroy, type OnInit } from '@angular/core';
import type { Quest, QuestRewards } from '@neo-tokyo/core';
import { Subscription } from 'rxjs';
import { MusicSynth } from '../audio/music-synth';
import { INTRO_SCRIPT } from '../content/intro-script';
import type { BabylonSceneService } from '../engine/babylon-scene.service';
import type { DeviceMotionService, GyroTilt } from '../state/device-motion.service';
import type { GameFlowService } from '../state/game-flow.service';
import type { InputStateService } from '../state/input-state.service';
import { SaveSystem } from '../systems/save-system';
import type { InputState } from '../types/game';
import type { MenuStartPayload } from '../ui/main-menu.component';

type ViewState = 'splash' | 'menu' | 'intro' | 'game' | 'gameover';

@Component({
  selector: 'app-game-shell',
  templateUrl: './game-shell.component.html',
  styleUrls: ['./game-shell.component.scss'],
})
export class GameShellComponent implements OnInit, OnDestroy {
  viewState: ViewState = 'menu';
  introScript = INTRO_SCRIPT;
  questLogOpen = false;
  combatText: { message: string; color: string } | null = null;
  pendingQuest: Quest | null = null;
  questRewards: QuestRewards | null = null;
  showQuestAccept = false;
  showQuestCompletion = false;

  private readonly music = new MusicSynth();
  private worldInitialized = false;
  private pendingSeed: string | null = null;
  private readonly subs = new Subscription();
  private lastGyro: GyroTilt | null = null;

  constructor(
    private readonly inputState: InputStateService,
    private readonly sceneService: BabylonSceneService,
    private readonly gameFlow: GameFlowService,
    private readonly deviceMotion: DeviceMotionService
  ) {}

  ngOnInit(): void {
    if (this.viewState === 'splash') return;
    this.subs.add(
      this.sceneService.watchMarkerInteractions().subscribe((marker) => {
        void this.gameFlow.handleMarker(marker.id);
      })
    );
    this.subs.add(
      this.sceneService.watchShardCollects().subscribe(() => {
        this.gameFlow.handleShard();
      })
    );
    this.subs.add(
      this.gameFlow.watchPendingQuest().subscribe((quest) => {
        this.pendingQuest = quest;
        this.showQuestAccept = Boolean(quest);
      })
    );
    this.subs.add(
      this.gameFlow.watchQuestRewards().subscribe((rewards) => {
        this.questRewards = rewards;
        this.showQuestCompletion = Boolean(rewards);
      })
    );
    this.subs.add(
      this.deviceMotion.watchTilt().subscribe((tilt) => {
        if (this.lastGyro === tilt) return;
        this.lastGyro = tilt;
        this.sceneService.setGyroTilt(tilt);
      })
    );
  }

  ngOnDestroy(): void {
    this.music.stop();
    this.subs.unsubscribe();
  }

  async handleStartStory(payload: MenuStartPayload): Promise<void> {
    if (payload.loadSave) {
      SaveSystem.load(0);
    }
    this.pendingSeed = payload.seed;

    this.viewState = 'intro';
    await this.sceneService.enableDynamicOrientation();
  }

  async handleIntroComplete(): Promise<void> {
    this.viewState = 'game';
    this.music.start();
    void this.deviceMotion.enable();

    if (!this.worldInitialized) {
      const masterSeed = this.pendingSeed ?? `neotokyo-${Date.now()}`;
      await this.gameFlow.initialize(masterSeed);
      this.sceneService.loadFloodedWorld(masterSeed);

      this.worldInitialized = true;
      this.pendingSeed = null;
    }
  }

  handleInput(key: keyof InputState, value: boolean): void {
    this.inputState.setKey(key, value);
  }

  toggleQuestLog(): void {
    this.questLogOpen = !this.questLogOpen;
  }

  closeQuestLog(): void {
    this.questLogOpen = false;
  }

  showCombatText(message: string, color: string): void {
    this.combatText = { message, color };
  }

  handleQuestAccept(): void {
    this.gameFlow.acceptPendingQuest();
  }

  handleQuestDecline(): void {
    this.showQuestAccept = false;
  }

  handleQuestCompletionClose(): void {
    this.gameFlow.clearQuestRewards();
  }
}
