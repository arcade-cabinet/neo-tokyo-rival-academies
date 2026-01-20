/**
 * BabylonJS Engine Wrapper
 *
 * Manages BabylonJS engine lifecycle, canvas, and render loop.
 */

import { Engine, type Nullable, type Scene } from '@babylonjs/core';

export interface BabylonEngineConfig {
  canvas: HTMLCanvasElement;
  antialias?: boolean;
  adaptToDeviceRatio?: boolean;
}

export class BabylonEngine {
  private engine: Nullable<Engine> = null;
  private scene: Nullable<Scene> = null;
  private isRunning = false;

  constructor(private config: BabylonEngineConfig) {}

  /**
   * Initialize the BabylonJS engine
   */
  initialize(): Engine {
    if (this.engine) {
      return this.engine;
    }

    this.engine = new Engine(this.config.canvas, this.config.antialias ?? true, {
      preserveDrawingBuffer: true,
      stencil: true,
      adaptToDeviceRatio: this.config.adaptToDeviceRatio ?? true,
    });

    // Handle window resize
    window.addEventListener('resize', this.handleResize);

    return this.engine;
  }

  /**
   * Set the active scene
   */
  setScene(scene: Scene): void {
    this.scene = scene;
  }

  /**
   * Start the render loop
   */
  startRenderLoop(): void {
    if (!this.engine || !this.scene || this.isRunning) {
      return;
    }

    this.isRunning = true;
    this.engine.runRenderLoop(() => {
      if (this.scene) {
        this.scene.render();
      }
    });
  }

  /**
   * Stop the render loop
   */
  stopRenderLoop(): void {
    if (!this.engine || !this.isRunning) {
      return;
    }

    this.isRunning = false;
    this.engine.stopRenderLoop();
  }

  /**
   * Handle window resize
   */
  private handleResize = (): void => {
    if (this.engine) {
      this.engine.resize();
    }
  };

  /**
   * Get current FPS
   */
  getFps(): number {
    return this.engine?.getFps() ?? 0;
  }

  /**
   * Get frame time in milliseconds
   */
  getFrameTime(): number {
    if (!this.engine) return 0;
    const fps = this.engine.getFps();
    return fps > 0 ? 1000 / fps : 0;
  }

  /**
   * Dispose engine and cleanup resources
   */
  dispose(): void {
    this.stopRenderLoop();
    window.removeEventListener('resize', this.handleResize);

    if (this.scene) {
      this.scene.dispose();
      this.scene = null;
    }

    if (this.engine) {
      this.engine.dispose();
      this.engine = null;
    }

    this.isRunning = false;
  }

  /**
   * Get the underlying BabylonJS engine
   */
  getEngine(): Nullable<Engine> {
    return this.engine;
  }

  /**
   * Get the active scene
   */
  getScene(): Nullable<Scene> {
    return this.scene;
  }
}
