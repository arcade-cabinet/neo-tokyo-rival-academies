import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { SaveSlot } from '@neo-tokyo/core';

@Component({
  selector: 'app-save-slot-select',
  templateUrl: './save-slot-select.component.html',
  styleUrls: ['./save-slot-select.component.scss'],
})
export class SaveSlotSelectComponent {
  @Input() isOpen = false;
  @Input() slots: SaveSlot[] = [];
  @Input() mode: 'save' | 'load' = 'save';
  @Output() close = new EventEmitter<void>();
  @Output() selectSlot = new EventEmitter<number>();

  formatPlaytime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (hours === 0) return `${mins}m`;
    return `${hours}h ${mins}m`;
  }

  formatTimestamp(timestamp: number): string {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }
}
