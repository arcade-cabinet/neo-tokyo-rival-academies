import { Injectable, NgZone } from '@angular/core';
import { ArcRotateCamera, Color4, Engine, PointerEventTypes, Scene, Vector3 } from '@babylonjs/core';
import { ScreenOrientation } from '@capacitor/screen-orientation';
import { CAMERA, PHYSICS } from '@neo-tokyo/config';
import { BackgroundPanels } from './background-panels';
import { CharacterAnimationController, CharacterLoader } from './character';
import { HexTileFloor } from './hex-tile-floor';
import { AmbientLighting, DirectionalLightWithShadows } from './lighting';
import { QuestMarkerManager, DataShardManager, type QuestMarker, type DataShard } from './quest-markers';
import { PlayerController } from './player-controller';
import type { InputState } from '../types/game';

@Injectable({ providedIn: 'root' })
export class BabylonSceneService {
  private engine: Engine | null = null;
  private scene: Scene | null = null;
  private canvas: HTMLCanvasElement | null = null;

  private ambientLighting: AmbientLighting | null = null;
  private directionalLight: DirectionalLightWithShadows | null = null;
  private hexFloor: HexTileFloor | null = null;
  private backgroundPanels: BackgroundPanels | null = null;
  private characterLoader: CharacterLoader | null = null;
  private animationController: CharacterAnimationController | null = null;
  private playerController: PlayerController | null = null;
  private questMarkerManager: QuestMarkerManager | null = null;
  private dataShardManager: DataShardManager | null = null;


  constructor(private readonly zone: NgZone) {}

  async init(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.engine = new Engine(canvas, true, {
      preserveDrawingBuffer: true,
      stencil: true,
      adaptToDeviceRatio: true,
    });

    this.scene = new Scene(this.engine);
    this.scene.clearColor = new Color4(0.03, 0.05, 0.07, 1);

    this.ambientLighting = new AmbientLighting(this.scene);
    this.ambientLighting.create();

    this.hexFloor = new HexTileFloor(this.scene);
    this.hexFloor.build({
      seed: 'neo-tokyo-default',
      cols: 10,
      rows: 10,
      bounds: { minX: -20, maxX: 20, minZ: -20, maxZ: 20 },
      debug: false,
    });

    this.backgroundPanels = new BackgroundPanels(this.scene);
    this.backgroundPanels.build({
      minX: -20,
      maxX: 20,
      height: 30,
      theme: 'flooded',
      sector: 'sector0',
    });

    this.characterLoader = new CharacterLoader(this.scene);

    const { meshes, animations } = await this.characterLoader.load({
      modelPath: '/assets/characters/main/kai/animations/combat_stance.glb',
      animationPaths: ['/assets/characters/main/kai/animations/runfast.glb'],
      position: new Vector3(0, 0, 0),
      scale: 1,
      initialAnimation: 'combat',
      castShadow: true,
    });

    this.animationController = new CharacterAnimationController(animations);

    this.directionalLight = new DirectionalLightWithShadows(this.scene);
    this.directionalLight.create({
      position: new Vector3(15, 25, 10),
      intensity: 1.1,
      shadowMapSize: 2048,
      shadowCasters: meshes,
    });

    this.playerController = new PlayerController(this.scene, meshes[0], this.animationController, {
      speed: PHYSICS.baseSpeed / 3,
      bounds: { minX: -20, maxX: 20, minZ: -20, maxZ: 20 },
    });

    this.questMarkerManager = new QuestMarkerManager(this.scene);
    this.dataShardManager = new DataShardManager(this.scene);

    this.seedInitialMarkers();

    this.setupCamera();
    this.setupPointerInteractions();

    this.zone.runOutsideAngular(() => {
      this.engine?.runRenderLoop(() => {
        if (this.scene) this.scene.render();
      });
    });

    window.addEventListener('resize', this.handleResize);
  }

  updateInputState(state: InputState) {
    this.playerController?.setInputState(state);
  }

  async lockOrientationLandscape() {
    try {
      await ScreenOrientation.lock({ orientation: 'landscape' });
    } catch {
      // Ignore if not supported
    }
  }

  dispose() {
    window.removeEventListener('resize', this.handleResize);
    this.dataShardManager?.dispose();
    this.questMarkerManager?.dispose();
    this.playerController?.dispose();
    this.animationController?.stop();
    this.characterLoader?.dispose();
    this.backgroundPanels?.dispose();
    this.hexFloor?.dispose();
    this.directionalLight?.dispose();
    this.ambientLighting?.dispose();
    this.scene?.dispose();
    this.engine?.dispose();
    this.scene = null;
    this.engine = null;
    this.canvas = null;
  }

  private handleResize = () => {
    this.engine?.resize();
  };

  private setupCamera() {
    if (!this.scene) return;
    const arcCamera = new ArcRotateCamera(
      'isometricCamera',
      Math.PI / 4,
      Math.PI / 3,
      CAMERA.defaultRadius,
      new Vector3(0, 0, 0),
      this.scene,
    );
    arcCamera.mode = ArcRotateCamera.ORTHOGRAPHIC_CAMERA;

    const aspectRatio = this.scene.getEngine().getRenderWidth() / this.scene.getEngine().getRenderHeight();
    arcCamera.orthoLeft = -CAMERA.orthoSize * aspectRatio;
    arcCamera.orthoRight = CAMERA.orthoSize * aspectRatio;
    arcCamera.orthoTop = CAMERA.orthoSize;
    arcCamera.orthoBottom = -CAMERA.orthoSize;
    arcCamera.lowerRadiusLimit = CAMERA.defaultRadius * 0.5;
    arcCamera.upperRadiusLimit = CAMERA.defaultRadius * 2;
    arcCamera.inputs.clear();
    arcCamera.attachControl(this.canvas, true);

    this.scene.activeCamera = arcCamera;

    this.scene.getEngine().onResizeObservable.add(() => {
      const newAspect = this.scene!.getEngine().getRenderWidth() / this.scene!.getEngine().getRenderHeight();
      arcCamera.orthoLeft = -CAMERA.orthoSize * newAspect;
      arcCamera.orthoRight = CAMERA.orthoSize * newAspect;
    });
  }

  private setupPointerInteractions() {
    if (!this.scene) return;
    this.scene.onPointerObservable.add((pointerInfo) => {
      if (pointerInfo.type !== PointerEventTypes.POINTERPICK) return;
      const pick = pointerInfo.pickInfo;
      if (!pick?.hit || !pick.pickedMesh) return;

      const metadata = pick.pickedMesh.metadata as { questMarkerId?: string; onInteract?: (id: string) => void; shardId?: string; onCollect?: (id: string) => void } | undefined;
      if (!metadata) return;

      if (metadata.questMarkerId && metadata.onInteract) {
        metadata.onInteract(metadata.questMarkerId);
      }

      if (metadata.shardId && metadata.onCollect) {
        metadata.onCollect(metadata.shardId);
      }
    });
  }

  private seedInitialMarkers() {
    if (!this.questMarkerManager || !this.dataShardManager) return;

    const questMarkers: QuestMarker[] = [
      {
        id: 'tutorial_start',
        position: new Vector3(0, 0, 5),
        type: 'objective',
        label: 'Talk to Vera',
        active: true,
      },
      {
        id: 'exit_north',
        position: new Vector3(0, 0, -18),
        type: 'exit',
        label: 'Exit to Sector 7',
        active: true,
      },
    ];

    this.questMarkerManager.setMarkers(questMarkers, (markerId) => {
      console.log('Quest marker interaction:', markerId);
    });

    const dataShards: DataShard[] = [
      { id: 'shard_1', position: new Vector3(-8, 0, -5), collected: false },
      { id: 'shard_2', position: new Vector3(12, 0, 3), collected: false },
      { id: 'shard_3', position: new Vector3(-3, 0, -12), collected: false },
      { id: 'shard_4', position: new Vector3(7, 0, -8), collected: false },
    ];

    this.dataShardManager.setShards(dataShards, (shardId) => {
      console.log('Collected shard:', shardId);
      this.dataShardManager?.markCollected(shardId);
    });
  }
}
