import { Component, EventEmitter, Input, type OnDestroy, type OnInit, Output } from '@angular/core';
import type { Quest } from '@neo-tokyo/core';
import { Subscription } from 'rxjs';
import type { QuestStoreService } from '../state/quest-store.service';

@Component({
  selector: 'app-quest-log',
  templateUrl: './quest-log.component.html',
  styleUrls: ['./quest-log.component.scss'],
})
export class QuestLogComponent implements OnInit, OnDestroy {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  activeQuests: Quest[] = [];
  completedQuests: string[] = [];
  tab: 'active' | 'completed' = 'active';

  private sub = new Subscription();

  constructor(private readonly questStore: QuestStoreService) {}

  ngOnInit(): void {
    this.sub.add(
      this.questStore.watchActiveQuests().subscribe((quests) => {
        this.activeQuests = quests;
      })
    );
    this.sub.add(
      this.questStore.watchCompletedQuests().subscribe((quests) => {
        this.completedQuests = quests;
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  setTab(tab: 'active' | 'completed') {
    this.tab = tab;
  }
}
