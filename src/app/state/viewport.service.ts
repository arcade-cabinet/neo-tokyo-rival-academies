import { Injectable, type OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ViewportState {
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  ratio: number;
  hudScale: number;
}

@Injectable({ providedIn: 'root' })
export class ViewportService implements OnDestroy {
  private enabled = false;
  private readonly state$ = new BehaviorSubject<ViewportState>({
    width: 0,
    height: 0,
    orientation: 'landscape',
    ratio: 1,
    hudScale: 1,
  });
  private readonly handleResize = () => this.updateViewportVars();

  enable(): void {
    if (this.enabled) return;
    this.enabled = true;

    this.updateViewportVars();

    window.addEventListener('resize', this.handleResize, { passive: true });
    window.addEventListener('orientationchange', this.handleResize, { passive: true });
    window.visualViewport?.addEventListener('resize', this.handleResize, { passive: true });
    window.visualViewport?.addEventListener('scroll', this.handleResize, { passive: true });
    window.screen?.orientation?.addEventListener('change', this.handleResize);
  }

  watch() {
    return this.state$.asObservable();
  }

  ngOnDestroy(): void {
    if (!this.enabled) return;
    window.removeEventListener('resize', this.handleResize);
    window.removeEventListener('orientationchange', this.handleResize);
    window.visualViewport?.removeEventListener('resize', this.handleResize);
    window.visualViewport?.removeEventListener('scroll', this.handleResize);
    window.screen?.orientation?.removeEventListener('change', this.handleResize);
  }

  private updateViewportVars(): void {
    const viewport = window.visualViewport;
    const width = viewport?.width ?? window.innerWidth;
    const height = viewport?.height ?? window.innerHeight;
    const ratio = width / Math.max(1, height);
    const shortSide = Math.min(width, height);
    const orientation: ViewportState['orientation'] = width >= height ? 'landscape' : 'portrait';
    const hudScale = this.computeHudScale(width, height);

    this.state$.next({ width, height, orientation, ratio, hudScale });

    const root = document.documentElement;
    root.style.setProperty('--vw', `${width / 100}px`);
    root.style.setProperty('--vh', `${height / 100}px`);
    root.style.setProperty('--viewport-width', `${width}px`);
    root.style.setProperty('--viewport-height', `${height}px`);
    root.style.setProperty('--viewport-short', `${Math.min(width, height)}px`);
    root.style.setProperty('--viewport-long', `${Math.max(width, height)}px`);
    root.style.setProperty('--hud-scale', `${hudScale.toFixed(3)}`);
    // biome-ignore lint/complexity/useLiteralKeys: DOMStringMap index signature requires bracket access.
    root.dataset['orientation'] = orientation;
    // biome-ignore lint/complexity/useLiteralKeys: DOMStringMap index signature requires bracket access.
    root.dataset['hud'] = this.computeHudDensity(shortSide, ratio);
  }

  private computeHudScale(width: number, height: number): number {
    const shortSide = Math.min(width, height);
    const ratio = width / Math.max(1, height);
    let baseline = 360;

    if (shortSide >= 900) {
      baseline = 420;
    } else if (shortSide >= 600) {
      baseline = 390;
    }

    let scale = shortSide / baseline;

    if (ratio > 1.8) {
      scale *= 0.95;
    }

    return Math.max(0.78, Math.min(1.25, scale));
  }

  private computeHudDensity(shortSide: number, ratio: number): 'compact' | 'roomy' {
    if (shortSide < 420) return 'compact';
    if (ratio > 1.9 && shortSide < 520) return 'compact';
    return 'roomy';
  }
}
