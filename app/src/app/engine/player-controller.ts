import { Vector3, type AbstractMesh, type Scene } from '@babylonjs/core';
import type { InputState } from '../types/game';
import type { CharacterAnimationController } from './character';

interface Bounds {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

interface PlayerControllerOptions {
  speed?: number;
  bounds?: Bounds;
  collisionMeshes?: AbstractMesh[];
}

export class PlayerController {
  private isMoving = false;
  private position = new Vector3(0, 0, 0);
  private inputState: InputState | null = null;
  private readonly bounds: Bounds;
  private readonly speed: number;
  private readonly collisionMeshes: AbstractMesh[];
  private readonly updateHandle: number;

  constructor(
    private readonly scene: Scene,
    private readonly rootMesh: AbstractMesh,
    private readonly animationController: CharacterAnimationController | null,
    options: PlayerControllerOptions = {},
  ) {
    this.speed = options.speed ?? 5;
    this.bounds = options.bounds ?? { minX: -10, maxX: 10, minZ: -10, maxZ: 10 };
    this.collisionMeshes = options.collisionMeshes ?? [];
    this.position = rootMesh.position.clone();

    this.updateHandle = scene.onBeforeRenderObservable.add(() => this.update());
  }

  setInputState(state: InputState) {
    this.inputState = state;
  }

  dispose() {
    this.scene.onBeforeRenderObservable.remove(this.updateHandle);
  }

  private update() {
    const deltaTime = this.scene.getEngine().getDeltaTime() / 1000;
    const input = this.inputState;
    if (!input) return;

    const moveUp = input.jump;
    const moveDown = input.slide;
    const moveLeft = input.left;
    const moveRight = input.right;

    let velX = 0;
    let velZ = 0;

    if (moveUp) velZ -= this.speed;
    if (moveDown) velZ += this.speed;
    if (moveLeft) velX -= this.speed;
    if (moveRight) velX += this.speed;

    if (velX !== 0 && velZ !== 0) {
      const magnitude = Math.sqrt(velX * velX + velZ * velZ);
      velX = (velX / magnitude) * this.speed;
      velZ = (velZ / magnitude) * this.speed;
    }

    const moving = velX !== 0 || velZ !== 0;
    if (moving !== this.isMoving) {
      this.isMoving = moving;
      if (this.animationController) {
        if (moving) {
          this.animationController.play('run', true);
        } else {
          this.animationController.play('combat', true);
        }
      }
    }

    let newX = this.position.x + velX * deltaTime;
    let newZ = this.position.z + velZ * deltaTime;

    for (const collisionMesh of this.collisionMeshes) {
      const bb = collisionMesh.getBoundingInfo().boundingBox;
      const minBound = bb.minimumWorld;
      const maxBound = bb.maximumWorld;
      const radius = 0.5;

      const expandedMinX = minBound.x - radius;
      const expandedMaxX = maxBound.x + radius;
      const expandedMinZ = minBound.z - radius;
      const expandedMaxZ = maxBound.z + radius;

      if (newX >= expandedMinX && newX <= expandedMaxX && newZ >= expandedMinZ && newZ <= expandedMaxZ) {
        const distToMinX = Math.abs(newX - expandedMinX);
        const distToMaxX = Math.abs(newX - expandedMaxX);
        const distToMinZ = Math.abs(newZ - expandedMinZ);
        const distToMaxZ = Math.abs(newZ - expandedMaxZ);

        const minDist = Math.min(distToMinX, distToMaxX, distToMinZ, distToMaxZ);

        if (minDist === distToMinX) newX = expandedMinX - 0.01;
        else if (minDist === distToMaxX) newX = expandedMaxX + 0.01;
        else if (minDist === distToMinZ) newZ = expandedMinZ - 0.01;
        else newZ = expandedMaxZ + 0.01;
      }
    }

    const clampedX = Math.max(this.bounds.minX + 1, Math.min(this.bounds.maxX - 1, newX));
    const clampedZ = Math.max(this.bounds.minZ + 1, Math.min(this.bounds.maxZ - 1, newZ));

    this.position.x = clampedX;
    this.position.z = clampedZ;
    this.rootMesh.position.x = clampedX;
    this.rootMesh.position.z = clampedZ;

    if (velX !== 0 || velZ !== 0) {
      this.rootMesh.rotation.y = Math.atan2(velX, velZ);
    }
  }
}
