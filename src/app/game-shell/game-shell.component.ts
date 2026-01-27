import { Component, OnDestroy, OnInit } from '@angular/core';
import { MusicSynth } from '@neo-tokyo/content-gen';
import { DistrictManager, QuestGenerator, useQuestStore } from '@neo-tokyo/core';
import { InputStateService } from '../state/input-state.service';
import { INTRO_SCRIPT } from '../content/intro-script';
import { SaveSystem } from '../systems/save-system';
import { BabylonSceneService } from '../engine/babylon-scene.service';
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

  private readonly music = new MusicSynth();
  private worldInitialized = false;
  private districtManager: DistrictManager | null = null;
  private pendingSeed: string | null = null;

  constructor(
    private readonly inputState: InputStateService,
    private readonly sceneService: BabylonSceneService,
  ) {}

  ngOnInit(): void {
    if (this.viewState === 'splash') return;
  }

  ngOnDestroy(): void {
    this.music.stop();
  }

  async handleStartStory(payload: MenuStartPayload): Promise<void> {
    if (payload.loadSave) {
      SaveSystem.load(0);
    }

    this.pendingSeed = payload.seed;

    this.viewState = 'intro';
    await this.sceneService.lockOrientationLandscape();
  }

  async handleIntroComplete(): Promise<void> {
    this.viewState = 'game';
    this.music.start();

    if (!this.worldInitialized) {
      const masterSeed = this.pendingSeed ?? `neotokyo-${Date.now()}`;
      const districtManager = new DistrictManager(masterSeed);
      await districtManager.initialize(true);

      const currentDistrict = districtManager.getCurrentDistrict();
      if (currentDistrict) {
        const questGenerator = new QuestGenerator(currentDistrict.seed);
        const cluster = questGenerator.generateCluster(
          currentDistrict.profile,
          currentDistrict.id,
          currentDistrict.name,
        );

        useQuestStore.getState().addCluster(cluster);
        useQuestStore.getState().activateQuest(cluster.main.id);
      }

      this.districtManager = districtManager;
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
}
