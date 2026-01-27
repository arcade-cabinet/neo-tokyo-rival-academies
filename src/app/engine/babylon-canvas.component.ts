import {
  type AfterViewInit,
  Component,
  type ElementRef,
  type OnDestroy,
  ViewChild,
} from '@angular/core';
import type { Subscription } from 'rxjs';
import type { InputStateService } from '../state/input-state.service';
import type { BabylonSceneService } from './babylon-scene.service';

@Component({
  selector: 'app-babylon-canvas',
  template: '<canvas #canvas class="game-canvas"></canvas>',
  styleUrls: ['./babylon-canvas.component.scss'],
})
export class BabylonCanvasComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private inputSub: Subscription | null = null;

  constructor(
    private readonly sceneService: BabylonSceneService,
    private readonly inputStateService: InputStateService
  ) {}

  async ngAfterViewInit(): Promise<void> {
    await this.sceneService.init(this.canvasRef.nativeElement);
    this.inputSub = this.inputStateService.watch().subscribe((state) => {
      this.sceneService.updateInputState(state);
    });
  }

  ngOnDestroy(): void {
    this.inputSub?.unsubscribe();
    this.sceneService.dispose();
  }
}
