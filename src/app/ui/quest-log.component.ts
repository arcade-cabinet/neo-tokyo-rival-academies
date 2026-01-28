import {
  Component,
  EventEmitter,
  Input,
  inject,
  type OnDestroy,
  type OnInit,
  Output,
} from '@angular/core';
import type { Quest } from '@neo-tokyo/core';
import { Subscription } from 'rxjs';
import { QuestStoreService } from '../state/quest-store.service';

@Component({
  selector: 'app-quest-log',
  standalone: false,
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

  private readonly questStore = inject(QuestStoreService);

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
