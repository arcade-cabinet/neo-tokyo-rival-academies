import { Component, inject, type OnDestroy, type OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { ViewportService, type ViewportState } from '../state/viewport.service';

interface SafeAreaState {
  top: string;
  right: string;
  bottom: string;
  left: string;
}

@Component({
  selector: 'app-hud-debug-overlay',
  standalone: false,
  templateUrl: './hud-debug-overlay.component.html',
  styleUrls: ['./hud-debug-overlay.component.scss'],
})
export class HudDebugOverlayComponent implements OnInit, OnDestroy {
  viewport: ViewportState | null = null;
  safeArea: SafeAreaState = { top: '0px', right: '0px', bottom: '0px', left: '0px' };

  private readonly sub = new Subscription();

  private readonly viewportService = inject(ViewportService);

  ngOnInit(): void {
    this.sub.add(
      this.viewportService.watch().subscribe((state) => {
        this.viewport = state;
        this.safeArea = this.readSafeArea();
      })
    );
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  private readSafeArea(): SafeAreaState {
    const styles = getComputedStyle(document.documentElement);
    return {
      top: styles.getPropertyValue('--safe-top').trim() || '0px',
      right: styles.getPropertyValue('--safe-right').trim() || '0px',
      bottom: styles.getPropertyValue('--safe-bottom').trim() || '0px',
      left: styles.getPropertyValue('--safe-left').trim() || '0px',
    };
  }
}
