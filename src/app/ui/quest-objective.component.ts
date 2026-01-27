import { Component, type OnDestroy, type OnInit } from '@angular/core';
import type { Quest } from '@neo-tokyo/core';
import { Subscription } from 'rxjs';
import type { QuestStoreService } from '../state/quest-store.service';

@Component({
  selector: 'app-quest-objective',
  templateUrl: './quest-objective.component.html',
  styleUrls: ['./quest-objective.component.scss'],
})
export class QuestObjectiveComponent implements OnInit, OnDestroy {
  currentQuest: Quest | null = null;
  private sub = new Subscription();

  constructor(private readonly questStore: QuestStoreService) {}

  ngOnInit(): void {
    this.sub.add(
      this.questStore.watchActiveQuests().subscribe((quests) => {
        const mainQuest = quests.find((quest) => quest.type === 'main');
        this.currentQuest = mainQuest || quests[0] || null;
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
