import {
  BackgroundMaterial,
  CubeTexture,
  MeshBuilder,
  type Nullable,
  type Scene,
  Texture,
} from '@babylonjs/core';

export type HDRICategory = 'day' | 'evening' | 'morning' | 'night' | 'element';

export const AMBIENTCG_HDRIS = {
  day: {
    DaySkyHDRI001B: 'DaySkyHDRI001B',
    DaySkyHDRI007A: 'DaySkyHDRI007A',
    DaySkyHDRI021A: 'DaySkyHDRI021A',
    DaySkyHDRI041B: 'DaySkyHDRI041B',
    DayEnvironmentHDRI049: 'DayEnvironmentHDRI049',
    DayEnvironmentHDRI071: 'DayEnvironmentHDRI071',
  },
  evening: {
    EveningSkyHDRI010A: 'EveningSkyHDRI010A',
    EveningSkyHDRI013A: 'EveningSkyHDRI013A',
    EveningSkyHDRI024A: 'EveningSkyHDRI024A',
    EveningSkyHDRI033B: 'EveningSkyHDRI033B',
    EveningSkyHDRI035A: 'EveningSkyHDRI035A',
    EveningSkyHDRI039B: 'EveningSkyHDRI039B',
  },
  morning: {
    MorningSkyHDRI003A: 'MorningSkyHDRI003A',
    MorningSkyHDRI005B: 'MorningSkyHDRI005B',
    MorningSkyHDRI006B: 'MorningSkyHDRI006B',
    MorningSkyHDRI009A: 'MorningSkyHDRI009A',
  },
  night: {
    NightSkyHDRI001: 'NightSkyHDRI001',
    NightSkyHDRI006: 'NightSkyHDRI006',
    NightSkyHDRI007: 'NightSkyHDRI007',
    NightSkyHDRI008: 'NightSkyHDRI008',
    NightSkyHDRI009: 'NightSkyHDRI009',
    NightEnvironmentHDRI002: 'NightEnvironmentHDRI002',
    NightEnvironmentHDRI003: 'NightEnvironmentHDRI003',
    NightEnvironmentHDRI004: 'NightEnvironmentHDRI004',
    NightEnvironmentHDRI005: 'NightEnvironmentHDRI005',
  },
  element: {
    HDRIElement001: 'HDRIElement001',
  },
} as const;

export const HDRI_BASE_PATH = '/assets/hdri';

export interface HDRIEnvironmentOptions {
  hdriId: string;
  showSkybox?: boolean;
  rotation?: number;
  intensity?: number;
  reflectionBlur?: number;
}

export function setupHDRIEnvironment(scene: Scene, options: HDRIEnvironmentOptions): () => void {
  const { hdriId, showSkybox = true, rotation = 0, intensity = 1, reflectionBlur = 0.3 } = options;

  const disposables: { dispose: () => void }[] = [];
  const basePath = `${HDRI_BASE_PATH}/${hdriId}`;
  const envPath = `${basePath}/${hdriId}_1K.env`;
  const jpgPath = `${basePath}/${hdriId}_1K_TONEMAPPED.jpg`;

  let envTexture: Nullable<CubeTexture> = null;

  try {
    envTexture = CubeTexture.CreateFromPrefilteredData(envPath, scene);
    envTexture.rotationY = rotation;
    envTexture.level = intensity;
    envTexture.blur = reflectionBlur;
    scene.environmentTexture = envTexture;
    scene.environmentIntensity = intensity;
    disposables.push(envTexture);
  } catch {
    // fallback to skybox only
  }

  if (showSkybox) {
    const skybox = MeshBuilder.CreateBox('skybox', { size: 1000 }, scene);
    skybox.infiniteDistance = true;

    const skyMat = new BackgroundMaterial('skyMat', scene);
    if (envTexture) {
      skyMat.reflectionTexture = envTexture;
      skyMat.reflectionTexture.coordinatesMode = Texture.SKYBOX_MODE;
    } else {
      const skyTex = new Texture(jpgPath, scene);
      skyMat.diffuseTexture = skyTex;
      disposables.push(skyTex);
    }

    skyMat.backFaceCulling = false;
    skybox.material = skyMat;

    disposables.push(skybox);
    disposables.push(skyMat);
  }

  return () => {
    for (const disposable of disposables) {
      disposable.dispose();
    }
  };
}
