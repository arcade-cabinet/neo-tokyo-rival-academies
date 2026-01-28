import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export type NotificationTone = 'info' | 'quest' | 'reward' | 'shard';

export interface UiNotification {
  id: string;
  tone: NotificationTone;
  title: string;
  message: string;
  timestamp: number;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly notifications$ = new BehaviorSubject<UiNotification[]>([]);

  watch() {
    return this.notifications$.asObservable();
  }

  push(notification: Omit<UiNotification, 'id' | 'timestamp'>): void {
    const entry: UiNotification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: Date.now(),
    };
    const current = this.notifications$.getValue();
    this.notifications$.next([entry, ...current].slice(0, 5));
  }

  clear(id: string): void {
    const current = this.notifications$.getValue();
    this.notifications$.next(current.filter((entry) => entry.id !== id));
  }

  clearAll(): void {
    this.notifications$.next([]);
  }
}
