/**
 * Playground Component Tests
 *
 * Comprehensive visual regression and functionality tests for all
 * Neo-Tokyo playground test pages. Verifies:
 * - WebGL initialization (no context errors)
 * - Texture loading (no 404s)
 * - Console errors (no shader/material errors)
 * - Visual regression (screenshot comparison)
 * - Performance (FPS within acceptable range)
 */

import { test, expect, type Page, type ConsoleMessage } from '@playwright/test';

// Test page definitions with expected behaviors
const TEST_PAGES = {
  // Structural primitives
  wall: {
    path: '/tests/wall.html',
    title: 'Wall Test',
    waitForSelector: 'canvas',
    expectations: ['mesh renders', 'no WebGL errors'],
  },
  texturedWall: {
    path: '/tests/textured-wall.html',
    title: 'Textured Wall',
    waitForSelector: 'canvas',
    expectations: ['PBR textures load', 'normal maps applied'],
  },
  cornerWall: {
    path: '/tests/corner-wall.html',
    title: 'Corner Wall',
    waitForSelector: 'canvas',
    expectations: ['corner geometry correct', 'UV mapping aligned'],
  },
  roof: {
    path: '/tests/roof.html',
    title: 'Roof',
    waitForSelector: 'canvas',
    expectations: ['roof mesh visible', 'correct slope'],
  },
  floor: {
    path: '/tests/floor.html',
    title: 'Floor',
    waitForSelector: 'canvas',
    expectations: ['floor plane visible', 'textures tile correctly'],
  },

  // Transport
  water: {
    path: '/tests/water.html',
    title: 'Water Surface',
    waitForSelector: 'canvas',
    expectations: ['water renders', 'reflections work', 'transparency correct'],
  },
  railPath: {
    path: '/tests/rail-path.html',
    title: 'Rail Path',
    waitForSelector: 'canvas',
    expectations: ['rails visible', 'path curves correctly'],
  },
  platform: {
    path: '/tests/platform.html',
    title: 'Platform',
    waitForSelector: 'canvas',
    expectations: ['platform geometry', 'edge handling'],
  },
  ferry: {
    path: '/tests/ferry.html',
    title: 'Ferry',
    waitForSelector: 'canvas',
    expectations: ['ferry model', 'water interaction'],
  },

  // Environment
  farground: {
    path: '/tests/farground.html',
    title: 'Farground',
    waitForSelector: 'canvas',
    expectations: ['parallax layers', 'depth correct'],
  },
  neon: {
    path: '/tests/neon.html',
    title: 'Neon Signs',
    waitForSelector: 'canvas',
    expectations: ['glow effect', 'emission working'],
  },

  // Character & Navigation
  hero: {
    path: '/tests/hero.html',
    title: 'Hero Character',
    waitForSelector: 'canvas',
    expectations: ['character visible', 'animations play'],
  },
  navmesh: {
    path: '/tests/navmesh.html',
    title: 'NavMesh',
    waitForSelector: 'canvas',
    expectations: ['navmesh renders', 'pathfinding works'],
  },

  // Assembled structures
  building: {
    path: '/tests/building.html',
    title: 'Building',
    waitForSelector: 'canvas',
    expectations: ['multi-floor structure', 'all textures load'],
  },
  alley: {
    path: '/tests/alley.html',
    title: 'Alley',
    waitForSelector: 'canvas',
    expectations: ['corridor geometry', 'lighting correct'],
  },
  bridge: {
    path: '/tests/bridge.html',
    title: 'Bridge',
    waitForSelector: 'canvas',
    expectations: ['bridge structure', 'supports render'],
  },
  room: {
    path: '/tests/room.html',
    title: 'Room',
    waitForSelector: 'canvas',
    expectations: ['interior walls', 'furniture placement'],
  },

  // Integration demos
  rooftopScene: {
    path: '/tests/rooftop-scene.html',
    title: 'Rooftop Scene',
    waitForSelector: 'canvas',
    expectations: ['full scene', 'all layers render'],
  },

  // Daggerfall Architecture
  block: {
    path: '/tests/block.html',
    title: 'Block',
    waitForSelector: 'canvas',
    expectations: ['block generation', 'procedural works'],
  },
  modernMaterials: {
    path: '/tests/modern-materials.html',
    title: 'Modern Materials',
    waitForSelector: 'canvas',
    expectations: ['PBR materials', 'correct metallic/roughness'],
  },

  // World generation
  cell: {
    path: '/tests/cell.html',
    title: 'Cell',
    waitForSelector: 'canvas',
    expectations: ['cell generation', 'neighbor connections'],
  },
  streaming: {
    path: '/tests/streaming.html',
    title: 'Streaming',
    waitForSelector: 'canvas',
    expectations: ['chunk loading', 'LOD transitions'],
  },
  street: {
    path: '/tests/street.html',
    title: 'Street',
    waitForSelector: 'canvas',
    expectations: ['street layout', 'building placement'],
  },

  // Design System
  colorPalette: {
    path: '/tests/color-palette.html',
    title: 'Color Palette',
    waitForSelector: 'canvas',
    expectations: ['colors display', 'contrast ratios'],
  },
  designSystem: {
    path: '/tests/design-system.html',
    title: 'Design System',
    waitForSelector: 'canvas',
    expectations: ['UI components', 'typography'],
  },
} as const;

type TestPageKey = keyof typeof TEST_PAGES;

// Collect console errors during test
interface TestContext {
  errors: string[];
  warnings: string[];
  textureFailures: string[];
  webglErrors: string[];
}

function createTestContext(): TestContext {
  return {
    errors: [],
    warnings: [],
    textureFailures: [],
    webglErrors: [],
  };
}

function setupConsoleListener(page: Page, ctx: TestContext) {
  page.on('console', (msg: ConsoleMessage) => {
    const text = msg.text();
    const type = msg.type();

    // Categorize errors
    if (type === 'error') {
      ctx.errors.push(text);

      // Check for specific error types
      if (text.includes('WebGL') || text.includes('WEBGL')) {
        ctx.webglErrors.push(text);
      }
      if (text.includes('404') || text.includes('Failed to load')) {
        ctx.textureFailures.push(text);
      }
    } else if (type === 'warning') {
      ctx.warnings.push(text);
    }
  });

  // Also catch page errors
  page.on('pageerror', (error) => {
    ctx.errors.push(`PageError: ${error.message}`);
  });
}

// Wait for WebGL canvas to be ready
async function waitForWebGLReady(page: Page, timeout = 10000): Promise<boolean> {
  try {
    await page.waitForFunction(
      () => {
        const canvas = document.querySelector('canvas');
        if (!canvas) return false;

        // Check WebGL context exists
        const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
        return gl !== null;
      },
      { timeout }
    );
    return true;
  } catch {
    return false;
  }
}

// Wait for Babylon.js scene to finish loading
async function waitForSceneReady(page: Page, timeout = 15000): Promise<void> {
  // Wait for canvas and initial render
  await page.waitForSelector('canvas', { state: 'visible', timeout });

  // Give Babylon.js time to initialize and render first frame
  // This is more reliable than trying to hook into Babylon's ready events
  await page.waitForTimeout(2000);

  // Wait for no pending network requests (textures loading)
  await page.waitForLoadState('networkidle', { timeout });
}

// Get FPS from page if available
async function getFPS(page: Page): Promise<number | null> {
  try {
    const fps = await page.evaluate(() => {
      // Look for FPS display element
      const fpsEl = document.querySelector('[data-fps]');
      if (fpsEl) {
        return parseFloat(fpsEl.textContent || '0');
      }

      // Try to get from Babylon engine if exposed
      // @ts-expect-error - accessing global
      if (window.BABYLON?.Engine?.LastCreatedEngine) {
        // @ts-expect-error - accessing global
        return window.BABYLON.Engine.LastCreatedEngine.getFps();
      }

      return null;
    });
    return fps;
  } catch {
    return null;
  }
}

test.describe('Playground Test Pages', () => {
  // Test each page
  for (const [key, config] of Object.entries(TEST_PAGES)) {
    test.describe(config.title, () => {
      test(`renders without WebGL errors`, async ({ page }) => {
        const ctx = createTestContext();
        setupConsoleListener(page, ctx);

        // Navigate
        await page.goto(config.path);

        // Wait for WebGL
        const webglReady = await waitForWebGLReady(page);
        expect(webglReady, 'WebGL context should initialize').toBeTruthy();

        // Wait for scene
        await waitForSceneReady(page);

        // Check for WebGL errors
        expect(ctx.webglErrors, 'No WebGL errors').toHaveLength(0);
      });

      test(`loads all textures successfully`, async ({ page }) => {
        const ctx = createTestContext();
        setupConsoleListener(page, ctx);

        // Track network requests for textures
        const textureRequests: { url: string; status: number }[] = [];
        page.on('response', (response) => {
          const url = response.url();
          if (url.includes('/textures/') || url.endsWith('.jpg') || url.endsWith('.png')) {
            textureRequests.push({ url, status: response.status() });
          }
        });

        await page.goto(config.path);
        await waitForSceneReady(page);

        // Check all texture requests succeeded
        const failedTextures = textureRequests.filter((t) => t.status >= 400);
        expect(failedTextures, 'All textures should load').toHaveLength(0);

        // Also check console for texture failures
        expect(ctx.textureFailures, 'No texture loading errors in console').toHaveLength(0);
      });

      test(`has no console errors`, async ({ page }) => {
        const ctx = createTestContext();
        setupConsoleListener(page, ctx);

        await page.goto(config.path);
        await waitForSceneReady(page);

        // Filter out known benign errors (if any)
        const significantErrors = ctx.errors.filter(
          (e) =>
            !e.includes('[HMR]') && // Vite HMR
            !e.includes('DevTools') // DevTools warnings
        );

        expect(significantErrors, 'No significant console errors').toHaveLength(0);
      });

      test(`visual regression`, async ({ page }) => {
        await page.goto(config.path);
        await waitForSceneReady(page);

        // Take screenshot for visual comparison
        // First run creates baseline, subsequent runs compare
        await expect(page).toHaveScreenshot(`${key}.png`, {
          maxDiffPixels: 200,
          threshold: 0.15,
          animations: 'disabled',
        });
      });

      test(`maintains acceptable performance`, async ({ page }) => {
        await page.goto(config.path);
        await waitForSceneReady(page);

        // Wait a bit for FPS to stabilize
        await page.waitForTimeout(1000);

        const fps = await getFPS(page);

        // Skip if FPS not available
        if (fps !== null) {
          // Expect at least 30 FPS on desktop
          expect(fps, 'FPS should be at least 30').toBeGreaterThanOrEqual(30);
        }
      });
    });
  }
});

// Specific component behavior tests
test.describe('Component Specific Tests', () => {
  test('Water reflects buildings correctly', async ({ page }) => {
    await page.goto('/tests/water.html');
    await waitForSceneReady(page);

    // Visual check - screenshot should show reflections
    await expect(page).toHaveScreenshot('water-reflections.png');
  });

  test('Neon signs emit light', async ({ page }) => {
    await page.goto('/tests/neon.html');
    await waitForSceneReady(page);

    // Neon should have glow - visual regression
    await expect(page).toHaveScreenshot('neon-glow.png');
  });

  test('PBR materials have correct normal maps', async ({ page }) => {
    await page.goto('/tests/textured-wall.html');
    await waitForSceneReady(page);

    // Visual check for normal mapping (depth/bumps visible)
    await expect(page).toHaveScreenshot('textured-wall-normals.png');
  });

  test('Modern materials show metallic/roughness variation', async ({ page }) => {
    await page.goto('/tests/modern-materials.html');
    await waitForSceneReady(page);

    await expect(page).toHaveScreenshot('modern-materials-pbr.png');
  });
});
