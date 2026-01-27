import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { BabylonSceneService } from './babylon-scene.service';
import { InputStateService } from '../state/input-state.service';

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
    private readonly inputStateService: InputStateService,
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
