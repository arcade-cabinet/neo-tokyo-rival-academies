import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { Quest } from '@neo-tokyo/core';

@Component({
  selector: 'app-quest-accept-dialog',
  templateUrl: './quest-accept-dialog.component.html',
  styleUrls: ['./quest-accept-dialog.component.scss'],
})
export class QuestAcceptDialogComponent {
  @Input() quest: Quest | null = null;
  @Input() isOpen = false;
  @Output() accept = new EventEmitter<void>();
  @Output() decline = new EventEmitter<void>();
}
