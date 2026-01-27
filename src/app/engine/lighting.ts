import type { AbstractMesh, Scene } from '@babylonjs/core';
import {
  Color3,
  DirectionalLight,
  HemisphericLight,
  PointLight,
  ShadowGenerator,
  Vector3,
} from '@babylonjs/core';

export interface DirectionalLightOptions {
  position?: Vector3;
  direction?: Vector3;
  intensity?: number;
  shadowMapSize?: number;
  shadowCasters?: AbstractMesh[];
  name?: string;
}

export class DirectionalLightWithShadows {
  private light: DirectionalLight | null = null;
  private shadowGenerator: ShadowGenerator | null = null;

  constructor(private readonly scene: Scene) {}

  create(options: DirectionalLightOptions = {}) {
    const {
      position = new Vector3(18, 28, 12),
      direction,
      intensity = 1.1,
      shadowMapSize = 2048,
      shadowCasters = [],
      name = 'sunLight',
    } = options;

    const light = new DirectionalLight(
      name,
      direction || position.negate().normalize(),
      this.scene
    );
    light.position = position;
    light.intensity = intensity;
    light.diffuse = new Color3(1, 0.98, 0.95);

    const shadowGenerator = new ShadowGenerator(shadowMapSize, light);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurKernel = 32;

    for (const mesh of shadowCasters) {
      shadowGenerator.addShadowCaster(mesh);
    }

    this.light = light;
    this.shadowGenerator = shadowGenerator;
  }

  updateShadowCasters(shadowCasters: AbstractMesh[]) {
    if (!this.shadowGenerator) return;
    this.shadowGenerator.getShadowMap()?.renderList?.splice(0);
    for (const mesh of shadowCasters) {
      this.shadowGenerator.addShadowCaster(mesh);
    }
  }

  dispose() {
    this.shadowGenerator?.dispose();
    this.light?.dispose();
    this.shadowGenerator = null;
    this.light = null;
  }
}

export class AmbientLighting {
  private hemispheric: HemisphericLight | null = null;
  private accentLights: PointLight[] = [];

  constructor(private readonly scene: Scene) {}

  create() {
    const hemi = new HemisphericLight('ambientLight', new Vector3(0, 1, 0), this.scene);
    hemi.intensity = 0.45;
    hemi.diffuse = new Color3(0.9, 0.95, 1.0);
    hemi.specular = new Color3(0, 0, 0);
    this.hemispheric = hemi;

    const accentConfigs = [
      { name: 'amberLantern', position: new Vector3(-6, 3, -4), color: '#d97706', intensity: 1.6 },
      { name: 'coolFill', position: new Vector3(6, 2.5, 4), color: '#38bdf8', intensity: 1.1 },
    ];

    for (const config of accentConfigs) {
      const light = new PointLight(config.name, config.position, this.scene);
      light.intensity = config.intensity;
      light.range = 20;
      light.diffuse = Color3.FromHexString(config.color);
      light.specular = new Color3(0, 0, 0);
      this.accentLights.push(light);
    }
  }

  dispose() {
    this.hemispheric?.dispose();
    for (const light of this.accentLights) {
      light.dispose();
    }
    this.accentLights = [];
    this.hemispheric = null;
  }
}
