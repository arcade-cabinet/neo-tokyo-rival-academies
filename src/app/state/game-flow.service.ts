import { Injectable, inject } from '@angular/core';
import type { Quest, QuestRewards } from '@neo-tokyo/core';
import { DistrictManager, QuestGenerator } from '@neo-tokyo/core';
import { BehaviorSubject } from 'rxjs';
import { SaveSystem } from '../systems/save-system';
import { DialogueService } from './dialogue.service';
import { QuestStoreService } from './quest-store.service';

@Injectable({ providedIn: 'root' })
export class GameFlowService {
  private districtManager: DistrictManager | null = null;
  private activeQuestId: string | null = null;
  private initialized = false;

  private readonly pendingQuest$ = new BehaviorSubject<Quest | null>(null);
  private readonly questRewards$ = new BehaviorSubject<QuestRewards | null>(null);
  private readonly questCompletionTitle$ = new BehaviorSubject<string>('');

  private readonly questStore = inject(QuestStoreService);
  private readonly dialogueService = inject(DialogueService);

  watchPendingQuest() {
    return this.pendingQuest$.asObservable();
  }

  watchQuestRewards() {
    return this.questRewards$.asObservable();
  }

  watchQuestCompletionTitle() {
    return this.questCompletionTitle$.asObservable();
  }

  async initialize(seed: string): Promise<void> {
    if (this.initialized) return;
    this.initialized = true;

    this.districtManager = new DistrictManager(seed);
    await this.districtManager.initialize(true);

    const currentDistrict = this.districtManager.getCurrentDistrict();
    if (!currentDistrict) return;

    const questGenerator = new QuestGenerator(currentDistrict.seed);
    const cluster = questGenerator.generateCluster(
      currentDistrict.profile,
      currentDistrict.id,
      currentDistrict.name
    );

    this.questStore.addCluster(cluster);
    this.pendingQuest$.next(cluster.main);
    this.activeQuestId = cluster.main.id;
  }

  acceptPendingQuest(): void {
    const quest = this.pendingQuest$.getValue();
    if (!quest || !this.activeQuestId) return;

    this.questStore.activateQuest(this.activeQuestId);
    this.pendingQuest$.next(null);
  }

  completeActiveQuest(): void {
    if (!this.activeQuestId) return;
    const quest = this.questStore.getQuest(this.activeQuestId);
    const rewards = this.questStore.completeQuest(this.activeQuestId);
    if (rewards) {
      this.questCompletionTitle$.next(quest?.title ?? '');
      this.questRewards$.next(rewards);
    }
  }

  clearQuestRewards(): void {
    this.questRewards$.next(null);
    this.questCompletionTitle$.next('');
  }

  async handleMarker(markerId: string): Promise<void> {
    if (markerId === 'tutorial_start') {
      await this.dialogueService.startDialogue('rival_encounter_1');
      return;
    }

    if (markerId === 'exit_north') {
      this.completeActiveQuest();
      await this.dialogueService.startDialogue('victory');
    }
  }

  handleShard(): void {
    SaveSystem.autoSave();
  }
}
