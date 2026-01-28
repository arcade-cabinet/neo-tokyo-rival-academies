import { Injectable, type OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface ViewportState {
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
  ratio: number;
}

@Injectable({ providedIn: 'root' })
export class ViewportService implements OnDestroy {
  private enabled = false;
  private readonly state$ = new BehaviorSubject<ViewportState>({
    width: 0,
    height: 0,
    orientation: 'landscape',
    ratio: 1,
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
    const orientation: ViewportState['orientation'] = width >= height ? 'landscape' : 'portrait';

    this.state$.next({ width, height, orientation, ratio });

    const root = document.documentElement;
    root.style.setProperty('--vw', `${width / 100}px`);
    root.style.setProperty('--vh', `${height / 100}px`);
    root.style.setProperty('--viewport-width', `${width}px`);
    root.style.setProperty('--viewport-height', `${height}px`);
    root.style.setProperty('--viewport-short', `${Math.min(width, height)}px`);
    root.style.setProperty('--viewport-long', `${Math.max(width, height)}px`);
    root.style.setProperty('--hud-scale', `${this.computeHudScale(width, height).toFixed(3)}`);
    // biome-ignore lint/complexity/useLiteralKeys: DOMStringMap index signature requires bracket access.
    root.dataset['orientation'] = orientation;
  }

  private computeHudScale(width: number, height: number): number {
    const shortSide = Math.min(width, height);
    const baseline = 360;
    const scale = shortSide / baseline;
    return Math.max(0.78, Math.min(1.2, scale));
  }
}
