import { Injectable } from '@angular/core';
import type { InventoryItem, RPGStats } from '@neo-tokyo/core';
import { usePlayerStore } from '@neo-tokyo/core';
import { BehaviorSubject } from 'rxjs';

interface PlayerSnapshot {
  level: number;
  xp: number;
  xpToNextLevel: number;
  stats: RPGStats;
  credits: number;
  inventory: InventoryItem[];
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

  equipItem(itemId: string) {
    this.store.getState().equipItem(itemId);
  }

  useConsumable(itemId: string) {
    return this.store.getState().useConsumable(itemId);
  }

  removeItem(itemId: string, quantity = 1) {
    return this.store.getState().removeItem(itemId, quantity);
  }

  private getSnapshot(): PlayerSnapshot {
    const state = this.store.getState();
    return {
      level: state.level,
      xp: state.xp,
      xpToNextLevel: state.xpToNextLevel,
      stats: state.stats,
      credits: state.credits,
      inventory: state.inventory,
    };
  }
}
