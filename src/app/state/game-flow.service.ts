import { Injectable, inject } from '@angular/core';
import type { Quest, QuestRewards } from '@neo-tokyo/core';
import { DistrictManager, QuestGenerator } from '@neo-tokyo/core';
import { BehaviorSubject } from 'rxjs';
import { SaveSystem } from '../systems/save-system';
import { DialogueService } from './dialogue.service';
import { NotificationService } from './notification.service';
import { ObjectiveTrackerService } from './objective-tracker.service';
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
  private readonly notifications = inject(NotificationService);
  private readonly objectives = inject(ObjectiveTrackerService);

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
    this.notifications.push({
      tone: 'quest',
      title: 'Quest Accepted',
      message: quest.title,
    });
    this.objectives.setObjective({
      id: quest.id,
      title: quest.title,
      progressText: 'Objective: 0 / 1',
      completed: false,
    });
  }

  completeActiveQuest(): void {
    if (!this.activeQuestId) return;
    const quest = this.questStore.getQuest(this.activeQuestId);
    const rewards = this.questStore.completeQuest(this.activeQuestId);
    if (rewards) {
      this.questCompletionTitle$.next(quest?.title ?? '');
      this.questRewards$.next(rewards);
      this.notifications.push({
        tone: 'reward',
        title: 'Quest Complete',
        message: quest?.title ?? 'Quest Completed',
      });
      this.objectives.setObjective({
        id: quest?.id ?? 'quest_complete',
        title: quest?.title ?? 'Quest Complete',
        progressText: 'Objective: 1 / 1',
        completed: true,
      });
    }
  }

  clearQuestRewards(): void {
    this.questRewards$.next(null);
    this.questCompletionTitle$.next('');
    this.objectives.clear();
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
    this.notifications.push({
      tone: 'shard',
      title: 'Data Shard Acquired',
      message: 'Lore fragment added to archive.',
    });
  }

  async handleShardLore(shardId: string): Promise<void> {
    await this.dialogueService.showLore(shardId);
  }
}
