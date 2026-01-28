import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface GameSettings {
  hapticsEnabled: boolean;
  gyroEnabled: boolean;
  musicEnabled: boolean;
  sfxEnabled: boolean;
  hudScale: number;
}

const SETTINGS_KEY = 'neo-tokyo-settings';

const DEFAULT_SETTINGS: GameSettings = {
  hapticsEnabled: true,
  gyroEnabled: true,
  musicEnabled: true,
  sfxEnabled: true,
  hudScale: 1,
};

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private readonly settings$ = new BehaviorSubject<GameSettings>(this.load());

  watch() {
    return this.settings$.asObservable();
  }

  getSnapshot(): GameSettings {
    return this.settings$.getValue();
  }

  update(partial: Partial<GameSettings>): void {
    const next = { ...this.settings$.getValue(), ...partial };
    this.settings$.next(next);
    this.persist(next);
  }

  reset(): void {
    this.settings$.next(DEFAULT_SETTINGS);
    this.persist(DEFAULT_SETTINGS);
  }

  private load(): GameSettings {
    if (typeof window === 'undefined') return DEFAULT_SETTINGS;
    const raw = window.localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    try {
      const parsed = JSON.parse(raw) as Partial<GameSettings>;
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch {
      return DEFAULT_SETTINGS;
    }
  }

  private persist(settings: GameSettings): void {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }
}
