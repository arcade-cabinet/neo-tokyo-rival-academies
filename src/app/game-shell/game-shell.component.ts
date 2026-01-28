import { Component, type NgZone, type OnDestroy, type OnInit } from '@angular/core';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import type { CombatDamageEvent, InventoryItem, Quest, QuestRewards } from '@neo-tokyo/core';
import { useCombatStore } from '@neo-tokyo/core';
import { Subscription } from 'rxjs';
import { MusicSynth } from '../audio/music-synth';
import { INTRO_SCRIPT } from '../content/intro-script';
import type { BabylonSceneService } from '../engine/babylon-scene.service';
import type { DeviceMotionService, GyroTilt } from '../state/device-motion.service';
import type { GameFlowService } from '../state/game-flow.service';
import type { InputStateService } from '../state/input-state.service';
import type { PlayerStoreService } from '../state/player-store.service';
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
  inventoryOpen = false;
  combatText: { message: string; color: string } | null = null;
  floatingDamages: Array<{
    id: string;
    damage: number;
    x: number;
    y: number;
    isCritical?: boolean;
    color?: string;
  }> = [];
  pendingQuest: Quest | null = null;
  questRewards: QuestRewards | null = null;
  questCompletionTitle = '';
  showQuestAccept = false;
  showQuestCompletion = false;
  showHudDebug = false;
  inventory: InventoryItem[] = [];
  credits = 0;

  private readonly music = new MusicSynth();
  private worldInitialized = false;
  private pendingSeed: string | null = null;
  private readonly subs = new Subscription();
  private lastGyro: GyroTilt | null = null;
  private combatUnsub: (() => void) | null = null;
  private floatingTimeouts = new Map<string, number>();
  private combatTextTimeout: number | null = null;

  constructor(
    private readonly inputState: InputStateService,
    private readonly sceneService: BabylonSceneService,
    private readonly gameFlow: GameFlowService,
    private readonly deviceMotion: DeviceMotionService,
    private readonly playerStore: PlayerStoreService,
    private readonly zone: NgZone
  ) {}

  ngOnInit(): void {
    if (this.viewState === 'splash') return;
    this.showHudDebug = this.isHudDebugEnabled();
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
      this.gameFlow.watchQuestCompletionTitle().subscribe((title) => {
        this.questCompletionTitle = title;
      })
    );
    this.subs.add(
      this.deviceMotion.watchTilt().subscribe((tilt) => {
        if (this.lastGyro === tilt) return;
        this.lastGyro = tilt;
        this.sceneService.setGyroTilt(tilt);
      })
    );
    this.subs.add(
      this.playerStore.watch().subscribe((player) => {
        this.inventory = player.inventory;
        this.credits = player.credits;
      })
    );

    this.combatUnsub = useCombatStore.subscribe(() => {
      const events = useCombatStore.getState().popDamageEvents();
      if (events.length === 0) return;
      this.zone.run(() => {
        this.queueFloatingDamages(events);
      });
    });
  }

  ngOnDestroy(): void {
    this.music.stop();
    this.subs.unsubscribe();
    this.combatUnsub?.();
    this.clearFloatingTimeouts();
    if (this.combatTextTimeout) {
      window.clearTimeout(this.combatTextTimeout);
      this.combatTextTimeout = null;
    }
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
    void this.pulseHaptic(ImpactStyle.Light);
  }

  closeQuestLog(): void {
    this.questLogOpen = false;
  }

  toggleInventory(): void {
    this.inventoryOpen = !this.inventoryOpen;
    void this.pulseHaptic(ImpactStyle.Light);
  }

  closeInventory(): void {
    this.inventoryOpen = false;
  }

  handleUseItem(item: InventoryItem): void {
    if (item.type !== 'consumable') return;
    const result = this.playerStore.useConsumable(item.id);
    if (result.applied) {
      this.showCombatText(result.message, '#10b981');
      void this.pulseHaptic(ImpactStyle.Medium);
    } else {
      this.showCombatText(result.message, '#ef4444');
      void this.pulseHaptic(ImpactStyle.Light);
    }
  }

  handleEquipItem(item: InventoryItem): void {
    this.playerStore.equipItem(item.id);
    void this.pulseHaptic(ImpactStyle.Light);
  }

  showCombatText(message: string, color: string): void {
    this.combatText = { message, color };
    if (this.combatTextTimeout) {
      window.clearTimeout(this.combatTextTimeout);
    }
    this.combatTextTimeout = window.setTimeout(() => {
      this.combatText = null;
      this.combatTextTimeout = null;
    }, 900);
  }

  handleQuestAccept(): void {
    this.gameFlow.acceptPendingQuest();
    void this.pulseHaptic(ImpactStyle.Medium);
  }

  handleQuestDecline(): void {
    this.showQuestAccept = false;
    void this.pulseHaptic(ImpactStyle.Light);
  }

  handleQuestCompletionClose(): void {
    this.gameFlow.clearQuestRewards();
    void this.pulseHaptic(ImpactStyle.Light);
  }

  private queueFloatingDamages(events: CombatDamageEvent[]): void {
    const width = window.innerWidth || 0;
    const height = window.innerHeight || 0;

    const entries = events.map((event) => {
      const baseY = event.wasPlayerHit ? height * 0.58 : height * 0.35;
      const baseX = width * 0.5;
      const jitterX = (Math.random() - 0.5) * 120;
      const jitterY = (Math.random() - 0.5) * 60;
      return {
        id: event.id,
        damage: event.damage,
        x: baseX + jitterX,
        y: baseY + jitterY,
        isCritical: event.isCritical,
        color: event.wasPlayerHit ? '#FF4444' : undefined,
      };
    });

    this.floatingDamages = [...this.floatingDamages, ...entries];
    for (const entry of entries) {
      const timeoutId = window.setTimeout(() => {
        this.floatingDamages = this.floatingDamages.filter((dmg) => dmg.id !== entry.id);
        this.floatingTimeouts.delete(entry.id);
      }, 1000);
      this.floatingTimeouts.set(entry.id, timeoutId);
    }
  }

  private clearFloatingTimeouts(): void {
    for (const timeoutId of this.floatingTimeouts.values()) {
      window.clearTimeout(timeoutId);
    }
    this.floatingTimeouts.clear();
  }

  private isHudDebugEnabled(): boolean {
    const params = new URLSearchParams(window.location.search);
    if (params.get('hudDebug') === '1') return true;
    return window.localStorage.getItem('hudDebug') === '1';
  }

  private async pulseHaptic(style: ImpactStyle): Promise<void> {
    try {
      await Haptics.impact({ style });
    } catch {
      // ignore
    }
  }
}
