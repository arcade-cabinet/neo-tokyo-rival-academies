import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ObjectiveProgress {
  id: string;
  title: string;
  progressText: string;
  completed: boolean;
}

@Injectable({ providedIn: 'root' })
export class ObjectiveTrackerService {
  private readonly current$ = new BehaviorSubject<ObjectiveProgress | null>(null);

  watch() {
    return this.current$.asObservable();
  }

  setObjective(next: ObjectiveProgress): void {
    this.current$.next(next);
  }

  clear(): void {
    this.current$.next(null);
  }
}
