import { Injectable, inject } from '@angular/core';
import { Haptics, type ImpactStyle } from '@capacitor/haptics';
import { SettingsService } from './settings.service';

@Injectable({ providedIn: 'root' })
export class HapticsService {
  private readonly settings = inject(SettingsService);

  async impact(style: ImpactStyle): Promise<void> {
    const { hapticsEnabled } = this.settings.getSnapshot();
    if (!hapticsEnabled) return;
    try {
      await Haptics.impact({ style });
    } catch {
      // ignore
    }
  }
}
