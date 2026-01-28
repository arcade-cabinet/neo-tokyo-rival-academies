import { Component, inject, type OnDestroy, type OnInit } from '@angular/core';
import type { Quest } from '@neo-tokyo/core';
import { Subscription } from 'rxjs';
import {
  type ObjectiveProgress,
  ObjectiveTrackerService,
} from '../state/objective-tracker.service';
import { QuestStoreService } from '../state/quest-store.service';

@Component({
  selector: 'app-quest-objective',
  standalone: false,
  templateUrl: './quest-objective.component.html',
  styleUrls: ['./quest-objective.component.scss'],
})
export class QuestObjectiveComponent implements OnInit, OnDestroy {
  currentQuest: Quest | null = null;
  objective: ObjectiveProgress | null = null;
  private sub = new Subscription();

  private readonly questStore = inject(QuestStoreService);
  private readonly objectiveTracker = inject(ObjectiveTrackerService);

  ngOnInit(): void {
    this.sub.add(
      this.questStore.watchActiveQuests().subscribe((quests) => {
        const mainQuest = quests.find((quest) => quest.type === 'main');
        this.currentQuest = mainQuest || quests[0] || null;
      })
    );
    this.sub.add(
      this.objectiveTracker.watch().subscribe((objective) => {
        this.objective = objective;
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }
}
