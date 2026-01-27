import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-combat-text',
  templateUrl: './combat-text.component.html',
  styleUrls: ['./combat-text.component.scss'],
})
export class CombatTextComponent {
  @Input() message: string | null = null;
  @Input() color = '#ef4444';
}
