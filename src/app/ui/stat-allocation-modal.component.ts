import {
  Component,
  EventEmitter,
  HostListener,
  Input,
  type OnChanges,
  Output,
  type SimpleChange,
  type SimpleChanges,
} from '@angular/core';
import {
  getRecommendedAllocation,
  type StatAllocation,
  validateAllocation,
} from '../systems/stat-allocation';

@Component({
  selector: 'app-stat-allocation-modal',
  templateUrl: './stat-allocation-modal.component.html',
  styleUrls: ['./stat-allocation-modal.component.scss'],
})
export class StatAllocationModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() currentStats: StatAllocation = { structure: 0, ignition: 0, logic: 0, flow: 0 };
  @Input() availablePoints = 0;
  @Output() confirm = new EventEmitter<StatAllocation>();
  @Output() cancel = new EventEmitter<void>();

  allocation: StatAllocation = { structure: 0, ignition: 0, logic: 0, flow: 0 };
  error: string | undefined;

  ngOnChanges(changes: SimpleChanges): void {
    const { isOpen } = changes as Record<string, SimpleChange>;
    if (isOpen && this.isOpen) {
      this.allocation = { structure: 0, ignition: 0, logic: 0, flow: 0 };
      this.error = undefined;
    }
  }

  get remainingPoints(): number {
    const total =
      this.allocation.structure +
      this.allocation.ignition +
      this.allocation.logic +
      this.allocation.flow;
    return this.availablePoints - total;
  }

  increment(stat: keyof StatAllocation): void {
    if (this.remainingPoints <= 0) return;
    this.allocation = { ...this.allocation, [stat]: this.allocation[stat] + 1 };
    this.error = undefined;
  }

  decrement(stat: keyof StatAllocation): void {
    if (this.allocation[stat] <= 0) return;
    this.allocation = { ...this.allocation, [stat]: this.allocation[stat] - 1 };
    this.error = undefined;
  }

  applyRecommended(role: 'tank' | 'melee_dps' | 'ranged_dps' | 'balanced'): void {
    this.allocation = getRecommendedAllocation(role, this.availablePoints);
    this.error = undefined;
  }

  handleConfirm(): void {
    const validation = validateAllocation(this.allocation, this.availablePoints);
    if (!validation.valid) {
      this.error = validation.error;
      return;
    }

    const totalAllocated =
      this.allocation.structure +
      this.allocation.ignition +
      this.allocation.logic +
      this.allocation.flow;

    if (totalAllocated === 0) {
      this.error = 'You must allocate at least one stat point';
      return;
    }

    this.confirm.emit(this.allocation);
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyDown(event: KeyboardEvent): void {
    if (this.isOpen && event.key === 'Escape') {
      this.cancel.emit();
    }
  }
}
