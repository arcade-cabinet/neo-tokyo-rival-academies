import { Component, EventEmitter, Input, Output } from '@angular/core';
import type { Quest } from '@neo-tokyo/core';

@Component({
  selector: 'app-quest-accept-dialog',
  standalone: false,
  templateUrl: './quest-accept-dialog.component.html',
  styleUrls: ['./quest-accept-dialog.component.scss'],
})
export class QuestAcceptDialogComponent {
  @Input() quest: Quest | null = null;
  @Input() isOpen = false;
  @Output() accept = new EventEmitter<void>();
  @Output() decline = new EventEmitter<void>();

  getQuestTypeLabel(type: Quest['type']): string {
    if (type === 'main') return '⭐ MAIN QUEST';
    if (type === 'secret') return '✨ SECRET QUEST';
    return '📋 SIDE QUEST';
  }

  getQuestTypeColor(type: Quest['type']): string {
    if (type === 'main') return '#f59e0b';
    if (type === 'secret') return '#8b5cf6';
    return '#0ea5e9';
  }

  getAlignmentColor(bias: Quest['alignmentBias']): string {
    if (bias === 'kurenai') return '#ef4444';
    if (bias === 'azure') return '#3b82f6';
    return '#94a3b8';
  }

  getAlignmentLabel(bias: Quest['alignmentBias']): string {
    if (bias === 'kurenai') return '🔥 Kurenai Path';
    if (bias === 'azure') return '⚡ Azure Path';
    return '⚖️ Neutral';
  }

  getAlignmentShift(quest: Quest): { faction: 'kurenai' | 'azure'; amount: number } | null {
    const shift = quest.rewards.alignmentShift;
    if (!shift) return null;
    if (shift.kurenai) return { faction: 'kurenai', amount: shift.kurenai };
    if (shift.azure) return { faction: 'azure', amount: shift.azure };
    return null;
  }
}
