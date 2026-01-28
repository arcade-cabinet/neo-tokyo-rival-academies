import { Component, inject, type OnDestroy, type OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { NotificationService, type UiNotification } from '../state/notification.service';

@Component({
  selector: 'app-quest-toast',
  standalone: false,
  templateUrl: './quest-toast.component.html',
  styleUrls: ['./quest-toast.component.scss'],
})
export class QuestToastComponent implements OnInit, OnDestroy {
  notifications: UiNotification[] = [];

  private readonly notificationsService = inject(NotificationService);
  private readonly subs = new Subscription();
  private readonly timeouts = new Map<string, number>();

  ngOnInit(): void {
    this.subs.add(
      this.notificationsService.watch().subscribe((entries) => {
        this.notifications = entries;
        this.scheduleAutoClear(entries);
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.unsubscribe();
    for (const timeout of this.timeouts.values()) {
      window.clearTimeout(timeout);
    }
    this.timeouts.clear();
  }

  dismiss(id: string): void {
    this.notificationsService.clear(id);
  }

  private scheduleAutoClear(entries: UiNotification[]): void {
    for (const entry of entries) {
      if (this.timeouts.has(entry.id)) continue;
      const timeout = window.setTimeout(() => {
        this.notificationsService.clear(entry.id);
        this.timeouts.delete(entry.id);
      }, 4200);
      this.timeouts.set(entry.id, timeout);
    }
  }
}
