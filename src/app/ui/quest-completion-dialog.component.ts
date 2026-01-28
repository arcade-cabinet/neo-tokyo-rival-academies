import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { QuestRewards } from '@neo-tokyo/core';

@Component({
  selector: 'app-quest-completion-dialog',
  templateUrl: './quest-completion-dialog.component.html',
  styleUrls: ['./quest-completion-dialog.component.scss'],
})
export class QuestCompletionDialogComponent {
  @Input() isOpen = false;
  @Input() questTitle = '';
  @Input() rewards: QuestRewards | null = null;
  @Output() close = new EventEmitter<void>();

  getAlignmentColor(faction: 'kurenai' | 'azure'): string {
    return faction === 'kurenai' ? '#ef4444' : '#3b82f6';
  }
}
