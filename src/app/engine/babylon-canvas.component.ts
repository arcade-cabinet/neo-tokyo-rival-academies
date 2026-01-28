import {
  type AfterViewInit,
  Component,
  type ElementRef,
  inject,
  type OnDestroy,
  ViewChild,
} from '@angular/core';
import type { Subscription } from 'rxjs';
import { InputStateService } from '../state/input-state.service';
import { BabylonSceneService } from './babylon-scene.service';

@Component({
  selector: 'app-babylon-canvas',
  standalone: false,
  template: '<canvas #canvas class="game-canvas"></canvas>',
  styleUrls: ['./babylon-canvas.component.scss'],
})
export class BabylonCanvasComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  private inputSub: Subscription | null = null;

  private readonly sceneService = inject(BabylonSceneService);
  private readonly inputStateService = inject(InputStateService);

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
