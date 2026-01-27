import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { usePlayerStore } from '@neo-tokyo/core';
import type { RPGStats } from '@neo-tokyo/core';

interface PlayerSnapshot {
  level: number;
  xp: number;
  xpToNextLevel: number;
  stats: RPGStats;
  credits: number;
}

@Injectable({ providedIn: 'root' })
export class PlayerStoreService {
  private readonly store = usePlayerStore;
  private readonly snapshot$ = new BehaviorSubject<PlayerSnapshot>(this.getSnapshot());

  constructor() {
    this.store.subscribe(() => {
      this.snapshot$.next(this.getSnapshot());
    });
  }

  watch() {
    return this.snapshot$.asObservable();
  }

  private getSnapshot(): PlayerSnapshot {
    const state = this.store.getState();
    return {
      level: state.level,
      xp: state.xp,
      xpToNextLevel: state.xpToNextLevel,
      stats: state.stats,
      credits: state.credits,
    };
  }
}
