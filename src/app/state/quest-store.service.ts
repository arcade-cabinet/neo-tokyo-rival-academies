import { Injectable } from '@angular/core';
import type { Quest, QuestCluster } from '@neo-tokyo/core';
import { useQuestStore } from '@neo-tokyo/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class QuestStoreService {
  private readonly store = useQuestStore;
  private readonly activeQuests$ = new BehaviorSubject<Quest[]>(
    this.store.getState().getActiveQuests()
  );
  private readonly completedQuests$ = new BehaviorSubject<string[]>(
    this.store.getState().getCompletedQuests()
  );

  constructor() {
    this.store.subscribe(() => {
      const state = this.store.getState();
      this.activeQuests$.next(state.getActiveQuests());
      this.completedQuests$.next(state.getCompletedQuests());
    });
  }

  watchActiveQuests() {
    return this.activeQuests$.asObservable();
  }

  watchCompletedQuests() {
    return this.completedQuests$.asObservable();
  }

  addCluster(cluster: QuestCluster) {
    this.store.getState().addCluster(cluster);
  }

  activateQuest(questId: string) {
    this.store.getState().activateQuest(questId);
  }

  completeQuest(questId: string) {
    return this.store.getState().completeQuest(questId);
  }
}
