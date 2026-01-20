/**
 * Performance Monitor
 *
 * Tracks FPS and frame time for performance analysis.
 */

import type { Engine } from '@babylonjs/core';

export interface PerformanceMetrics {
  fps: number;
  frameTime: number;
  timestamp: number;
}

export class PerformanceMonitor {
  private engine: Engine;
  private metrics: PerformanceMetrics[] = [];
  private maxSamples = 60;
  private warningThreshold = 50; // FPS below this triggers warning

  constructor(engine: Engine) {
    this.engine = engine;
  }

  /**
   * Record current performance metrics
   */
  record(): PerformanceMetrics {
    const fps = this.engine.getFps();
    const frameTime = 1000 / fps;
    const timestamp = Date.now();

    const metric: PerformanceMetrics = { fps, frameTime, timestamp };

    this.metrics.push(metric);
    if (this.metrics.length > this.maxSamples) {
      this.metrics.shift();
    }

    // Log warning if FPS drops below threshold
    if (fps < this.warningThreshold) {
      console.warn(`Performance warning: FPS dropped to ${fps.toFixed(1)}`);
    }

    return metric;
  }

  /**
   * Get average FPS over recent samples
   */
  getAverageFPS(): number {
    if (this.metrics.length === 0) return 0;
    const sum = this.metrics.reduce((acc, m) => acc + m.fps, 0);
    return sum / this.metrics.length;
  }

  /**
   * Get average frame time over recent samples
   */
  getAverageFrameTime(): number {
    if (this.metrics.length === 0) return 0;
    const sum = this.metrics.reduce((acc, m) => acc + m.frameTime, 0);
    return sum / this.metrics.length;
  }

  /**
   * Get minimum FPS over recent samples
   */
  getMinFPS(): number {
    if (this.metrics.length === 0) return 0;
    return Math.min(...this.metrics.map((m) => m.fps));
  }

  /**
   * Get maximum FPS over recent samples
   */
  getMaxFPS(): number {
    if (this.metrics.length === 0) return 0;
    return Math.max(...this.metrics.map((m) => m.fps));
  }

  /**
   * Get all recorded metrics
   */
  getMetrics(): PerformanceMetrics[] {
    return [...this.metrics];
  }

  /**
   * Clear all recorded metrics
   */
  clear(): void {
    this.metrics = [];
  }

  /**
   * Log performance summary to console
   */
  logSummary(): void {
    console.log('=== Performance Summary ===');
    console.log(`Average FPS: ${this.getAverageFPS().toFixed(1)}`);
    console.log(`Min FPS: ${this.getMinFPS().toFixed(1)}`);
    console.log(`Max FPS: ${this.getMaxFPS().toFixed(1)}`);
    console.log(`Average Frame Time: ${this.getAverageFrameTime().toFixed(2)}ms`);
    console.log(`Samples: ${this.metrics.length}`);
  }
}
