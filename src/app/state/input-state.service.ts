import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import type { InputState } from '../types/game';
import { initialInputState } from '../utils/game-config';

@Injectable({ providedIn: 'root' })
export class InputStateService {
  private readonly inputState$ = new BehaviorSubject<InputState>({ ...initialInputState });

  watch() {
    return this.inputState$.asObservable();
  }

  getSnapshot() {
    return this.inputState$.getValue();
  }

  setKey(key: keyof InputState, value: boolean) {
    const current = this.inputState$.getValue();
    if (current[key] === value) return;
    this.inputState$.next({ ...current, [key]: value });
  }

  reset() {
    this.inputState$.next({ ...initialInputState });
  }
}
