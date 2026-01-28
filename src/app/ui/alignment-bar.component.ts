import { Component, inject, type OnDestroy, type OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { AlignmentStoreService } from '../state/alignment-store.service';

@Component({
  selector: 'app-alignment-bar',
  standalone: false,
  templateUrl: './alignment-bar.component.html',
  styleUrls: ['./alignment-bar.component.scss'],
})
export class AlignmentBarComponent implements OnInit, OnDestroy {
  alignment = 0;
  alignmentLabel = 'Neutral';
  kurenaiRep = 0;
  azureRep = 0;

  private sub = new Subscription();

  private readonly alignmentStore = inject(AlignmentStoreService);

  ngOnInit(): void {
    this.sub.add(
      this.alignmentStore.watchAlignment().subscribe((value) => {
        this.alignment = value;
      })
    );
    this.sub.add(
      this.alignmentStore.watchLabel().subscribe((value) => {
        this.alignmentLabel = value;
      })
    );
    this.sub.add(
      this.alignmentStore.watchKurenaiRep().subscribe((value) => {
        this.kurenaiRep = value;
      })
    );
    this.sub.add(
      this.alignmentStore.watchAzureRep().subscribe((value) => {
        this.azureRep = value;
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  get barPosition(): number {
    return ((this.alignment + 1.0) / 2.0) * 100;
  }

  getColor(): string {
    if (this.alignment < -0.6) return '#b91c1c';
    if (this.alignment < -0.2) return '#dc2626';
    if (this.alignment < 0.2) return '#94a3b8';
    if (this.alignment < 0.6) return '#2563eb';
    return '#1d4ed8';
  }
}
