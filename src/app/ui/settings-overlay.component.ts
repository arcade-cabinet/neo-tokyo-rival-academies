import { Component, EventEmitter, Input, inject, Output } from '@angular/core';
import { type GameSettings, SettingsService } from '../state/settings.service';

@Component({
  selector: 'app-settings-overlay',
  standalone: false,
  templateUrl: './settings-overlay.component.html',
  styleUrls: ['./settings-overlay.component.scss'],
})
export class SettingsOverlayComponent {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();

  private readonly settingsService = inject(SettingsService);

  get settings(): GameSettings {
    return this.settingsService.getSnapshot();
  }

  toggle(key: keyof GameSettings): void {
    const current = this.settingsService.getSnapshot();
    if (typeof current[key] !== 'boolean') return;
    this.settingsService.update({ [key]: !current[key] } as Partial<GameSettings>);
  }

  updateHudScale(value: string): void {
    const parsed = Number.parseFloat(value);
    if (Number.isNaN(parsed)) return;
    this.settingsService.update({ hudScale: Math.min(1.25, Math.max(0.8, parsed)) });
  }

  reset(): void {
    this.settingsService.reset();
  }

  handleClose(): void {
    this.close.emit();
  }
}
