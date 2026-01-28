import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-combat-text',
  templateUrl: './combat-text.component.html',
  styleUrls: ['./combat-text.component.scss'],
})
export class CombatTextComponent {
  @Input() message: string | null = null;
  @Input() color = '#ef4444';
  @Input() floatingDamages: Array<{
    id: string;
    damage: number;
    x: number;
    y: number;
    isCritical?: boolean;
    color?: string;
  }> = [];
}
