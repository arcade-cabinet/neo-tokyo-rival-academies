import { Injectable, type OnDestroy } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface GyroTilt {
  beta: number;
  gamma: number;
}

@Injectable({ providedIn: 'root' })
export class DeviceMotionService implements OnDestroy {
  private enabled = false;
  private listening = false;
  private readonly tilt$ = new BehaviorSubject<GyroTilt | null>(null);

  watchTilt() {
    return this.tilt$.asObservable();
  }

  async enable(): Promise<void> {
    if (this.enabled) return;
    this.enabled = true;

    if (typeof window === 'undefined') return;
    if (!('DeviceOrientationEvent' in window)) return;

    const permissionFn = (
      DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }
    ).requestPermission;

    if (typeof permissionFn === 'function') {
      try {
        const result = await permissionFn();
        if (result !== 'granted') return;
      } catch {
        return;
      }
    }

    this.startListening();
  }

  disable(): void {
    this.enabled = false;
    this.stopListening();
  }

  ngOnDestroy(): void {
    this.stopListening();
  }

  private startListening(): void {
    if (this.listening) return;
    window.addEventListener('deviceorientation', this.handleOrientation, { passive: true });
    this.listening = true;
  }

  private stopListening(): void {
    if (!this.listening) return;
    window.removeEventListener('deviceorientation', this.handleOrientation);
    this.listening = false;
  }

  private handleOrientation = (event: DeviceOrientationEvent) => {
    const beta = this.clamp(event.beta ?? 0, -30, 30);
    const gamma = this.clamp(event.gamma ?? 0, -30, 30);
    this.tilt$.next({ beta, gamma });
  };

  private clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }
}
