import type { AnimationGroup } from '@babylonjs/core/Animations/animationGroup';
import { SceneLoader } from '@babylonjs/core/Loading/sceneLoader';
import { Vector3 } from '@babylonjs/core/Maths/math.vector';
import type { AbstractMesh } from '@babylonjs/core/Meshes/abstractMesh';
import type { Scene } from '@babylonjs/core/scene';
import '@babylonjs/loaders/glTF';

export interface CharacterOptions {
  modelPath: string;
  animationPaths?: string[];
  position?: Vector3;
  scale?: number;
  initialAnimation?: string;
  castShadow?: boolean;
}

export class CharacterLoader {
  private meshes: AbstractMesh[] = [];
  private animations: AnimationGroup[] = [];

  constructor(private readonly scene: Scene) {}

  async load(
    options: CharacterOptions
  ): Promise<{ meshes: AbstractMesh[]; animations: AnimationGroup[] }> {
    const {
      modelPath,
      animationPaths = [],
      position = new Vector3(0, 0, 0),
      scale = 1,
      initialAnimation,
      castShadow = true,
    } = options;

    const result = await SceneLoader.ImportMeshAsync('', '', modelPath, this.scene);

    const rootMesh = result.meshes[0];
    rootMesh.position = position;
    rootMesh.scaling = new Vector3(scale, scale, scale);

    if (castShadow) {
      for (const mesh of result.meshes) {
        mesh.receiveShadows = true;
      }
    }

    const allAnimations: AnimationGroup[] = [...result.animationGroups];

    for (const animPath of animationPaths) {
      const animResult = await SceneLoader.ImportMeshAsync('', '', animPath, this.scene);
      const targetSkeleton = result.skeletons[0];
      if (targetSkeleton && animResult.skeletons[0]) {
        for (const animGroup of animResult.animationGroups) {
          const clonedGroup = animGroup.clone(animGroup.name, (oldTarget) => {
            if (oldTarget.name) {
              const bone = targetSkeleton.bones.find((b) => b.name === oldTarget.name);
              if (bone) return bone;
            }
            return oldTarget;
          });
          allAnimations.push(clonedGroup);
        }
      }

      for (const mesh of animResult.meshes) mesh.dispose();
    }

    if (initialAnimation) {
      const anim = findAnimationByPattern(allAnimations, initialAnimation);
      if (anim) anim.play(true);
    }

    this.meshes = result.meshes;
    this.animations = allAnimations;

    return { meshes: result.meshes, animations: allAnimations };
  }

  dispose() {
    for (const mesh of this.meshes) mesh.dispose();
    for (const anim of this.animations) anim.dispose();
    this.meshes = [];
    this.animations = [];
  }
}

export class CharacterAnimationController {
  private animations: Map<string, AnimationGroup> = new Map();
  private currentAnimation: AnimationGroup | null = null;

  constructor(animationGroups: AnimationGroup[]) {
    for (const anim of animationGroups) {
      this.animations.set(anim.name.toLowerCase(), anim);
    }
  }

  play(pattern: string, loop = true): boolean {
    const anim = this.findByPattern(pattern);
    if (!anim) return false;

    if (this.currentAnimation && this.currentAnimation !== anim) {
      this.currentAnimation.stop();
      anim.start(loop, 1.0, anim.from, anim.to, false);
    } else {
      anim.play(loop);
    }

    this.currentAnimation = anim;
    return true;
  }

  stop(): void {
    this.currentAnimation?.stop();
    this.currentAnimation = null;
  }

  private findByPattern(pattern: string): AnimationGroup | null {
    const lowerPattern = pattern.toLowerCase();
    for (const [name, anim] of this.animations) {
      if (name.includes(lowerPattern)) return anim;
    }
    return null;
  }
}

function findAnimationByPattern(
  animations: AnimationGroup[],
  pattern: string
): AnimationGroup | null {
  const lowerPattern = pattern.toLowerCase();
  return animations.find((anim) => anim.name.toLowerCase().includes(lowerPattern)) || null;
}
