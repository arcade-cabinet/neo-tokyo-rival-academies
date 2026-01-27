import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { useAlignmentStore } from '@neo-tokyo/core';

@Injectable({ providedIn: 'root' })
export class AlignmentStoreService {
  private readonly store = useAlignmentStore;
  private readonly alignment$ = new BehaviorSubject(this.store.getState().alignment);
  private readonly label$ = new BehaviorSubject(this.store.getState().getAlignmentLabel());
  private readonly kurenaiRep$ = new BehaviorSubject(this.store.getState().kurenaiRep);
  private readonly azureRep$ = new BehaviorSubject(this.store.getState().azureRep);

  constructor() {
    this.store.subscribe(() => {
      const state = this.store.getState();
      this.alignment$.next(state.alignment);
      this.label$.next(state.getAlignmentLabel());
      this.kurenaiRep$.next(state.kurenaiRep);
      this.azureRep$.next(state.azureRep);
    });
  }

  watchAlignment() {
    return this.alignment$.asObservable();
  }

  watchLabel() {
    return this.label$.asObservable();
  }

  watchKurenaiRep() {
    return this.kurenaiRep$.asObservable();
  }

  watchAzureRep() {
    return this.azureRep$.asObservable();
  }
}
