/**
 * Diorama Component Showcase Tests
 *
 * Comprehensive testing of all 100+ playground components organized
 * in the Component Showcase. Tests each category page for:
 * - All components render (no missing meshes)
 * - Materials load correctly (no pink/missing textures)
 * - No console errors
 * - Visual regression across all categories
 * - Component alignment and spacing
 */

import { test, expect, type Page, type ConsoleMessage } from '@playwright/test';

// Component categories as defined in ComponentShowcaseTest
const SHOWCASE_CATEGORIES = [
  {
    index: 0,
    name: 'Structural',
    components: [
      'Stairs (straight)',
      'Stairs (spiral)',
      'Ramp',
      'Door (single)',
      'Door (sliding)',
      'Window (single)',
      'Window (broken)',
      'Balcony',
      'Pillar (round)',
      'Pillar (square)',
      'Railing',
      'Awning',
      'Fence',
      'Ladder',
      'FireEscape',
      'Catwalk',
      'Scaffolding',
      'Gutter',
      'Shutter',
      'Chimney',
      'Skylight',
    ],
    expectedCount: 21,
  },
  {
    index: 1,
    name: 'Water & Maritime',
    components: [
      'FloatingPlatform (wooden)',
      'FloatingPlatform (plastic)',
      'Houseboat (traditional)',
      'Houseboat (modern)',
      'Bridge',
      'Canal',
      'Boat (rowboat)',
      'Boat (kayak)',
      'Boat (sampan)',
      'Buoy (marker)',
      'Buoy (channel)',
      'Puddle',
      'RainCollector (barrel)',
      'RainCollector (tarp)',
      'FishingNet (cast)',
      'FishingNet (trap)',
      'Anchor (traditional)',
      'Anchor (mushroom)',
    ],
    expectedCount: 18,
  },
  {
    index: 2,
    name: 'Urban Furniture',
    components: [
      'VendingMachine (drink)',
      'VendingMachine (snack)',
      'Bench (park)',
      'Bench (modern)',
      'TrashCan (municipal)',
      'TrashCan (bin)',
      'Mailbox (post)',
      'Mailbox (wall)',
      'Planter',
      'PhoneBooth (classic)',
      'PhoneBooth (modern)',
      'FireHydrant (standard)',
      'FireHydrant (flush)',
      'ParkingMeter (single)',
      'ParkingMeter (digital)',
      'BollardPost (steel)',
      'BollardPost (concrete)',
      'Manhole (round)',
      'Manhole (square)',
      'DrainGrate',
      'ShoppingCart',
      'Umbrella',
      'Newspaper',
    ],
    expectedCount: 23,
  },
  {
    index: 3,
    name: 'Infrastructure',
    components: [
      'Pipe (metal)',
      'Pipe (pvc)',
      'ACUnit',
      'AirConditioner (window)',
      'AirConditioner (split)',
      'PowerLine',
      'Antenna (tv)',
      'Antenna (satellite)',
      'SatelliteDish (residential)',
      'SatelliteDish (commercial)',
      'WaterTank',
      'StorageTank',
      'Generator (diesel)',
      'Generator (portable)',
      'Dumpster',
      'Elevator',
      'Vent (exhaust)',
      'Vent (intake)',
      'SolarPanel (residential)',
      'SolarPanel (commercial)',
      'CoolingTower',
      'HeliPad',
      'Rope',
    ],
    expectedCount: 23,
  },
  {
    index: 4,
    name: 'Vegetation & Props',
    components: [
      'Tree (deciduous)',
      'Tree (palm)',
      'Shrub (boxwood)',
      'Shrub (flowering)',
      'GrassClump (wild)',
      'GrassClump (ornamental)',
      'Vine',
      'Mushroom (cluster)',
      'Mushroom (giant)',
      'FlowerBed',
      'Crate (wooden)',
      'Crate (plastic)',
      'CrateStack',
      'Barrel (metal)',
      'Barrel (plastic)',
      'Debris (rubble)',
      'Debris (trash)',
      'PalletStack',
      'Tarp',
      'Tarpaulin',
      'Clothesline',
      'TentStructure (camping)',
      'TentStructure (refugee)',
    ],
    expectedCount: 23,
  },
  {
    index: 5,
    name: 'Signage & Lighting',
    components: [
      'NeonSign (rectangle)',
      'NeonSign (circle)',
      'StreetLight (modern)',
      'StreetLight (vintage)',
      'Billboard (rooftop)',
      'Billboard (street)',
      'Poster (movie)',
      'Poster (advertisement)',
      'TrafficSign (stop)',
      'TrafficSign (warning)',
      'Signpost (directional)',
      'Signpost (street)',
      'Lamppost (classic)',
      'Lamppost (industrial)',
      'Graffiti (tag)',
      'Graffiti (mural)',
      'Lantern (paper)',
      'Lantern (stone)',
      'Lantern (festival)',
      'Flagpole (national)',
      'Flagpole (banner)',
      'SteamVent',
      'Fog',
    ],
    expectedCount: 23,
  },
];

interface TestContext {
  errors: string[];
  warnings: string[];
  meshErrors: string[];
  materialErrors: string[];
  textureErrors: string[];
}

function createContext(): TestContext {
  return {
    errors: [],
    warnings: [],
    meshErrors: [],
    materialErrors: [],
    textureErrors: [],
  };
}

function setupConsoleListener(page: Page, ctx: TestContext) {
  page.on('console', (msg: ConsoleMessage) => {
    const text = msg.text();
    const type = msg.type();

    if (type === 'error') {
      ctx.errors.push(text);

      // Categorize errors
      if (text.includes('mesh') || text.includes('Mesh') || text.includes('geometry')) {
        ctx.meshErrors.push(text);
      }
      if (text.includes('material') || text.includes('Material') || text.includes('shader')) {
        ctx.materialErrors.push(text);
      }
      if (text.includes('texture') || text.includes('Texture') || text.includes('404')) {
        ctx.textureErrors.push(text);
      }
    } else if (type === 'warning') {
      ctx.warnings.push(text);
    }
  });

  page.on('pageerror', (error) => {
    ctx.errors.push(`PageError: ${error.message}`);
  });
}

async function waitForShowcaseReady(page: Page): Promise<void> {
  // Wait for canvas
  await page.waitForSelector('canvas', { state: 'visible', timeout: 15000 });

  // Wait for category buttons to appear (UI ready)
  await page.waitForSelector('button', { state: 'visible', timeout: 5000 });

  // Wait for scene to stabilize
  await page.waitForTimeout(2000);

  // Wait for network idle (textures)
  await page.waitForLoadState('networkidle', { timeout: 30000 });
}

async function selectCategory(page: Page, index: number, name: string): Promise<void> {
  // Find and click the category button
  const button = page.locator(`button:has-text("${name}")`);
  await button.click();

  // Wait for scene to update
  await page.waitForTimeout(1500);

  // Wait for any new textures to load
  await page.waitForLoadState('networkidle', { timeout: 15000 });
}

test.describe('Component Showcase', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/tests/component-showcase.html');
    await waitForShowcaseReady(page);
  });

  // Test each category
  for (const category of SHOWCASE_CATEGORIES) {
    test.describe(`Category: ${category.name}`, () => {
      test('renders without errors', async ({ page }) => {
        const ctx = createContext();
        setupConsoleListener(page, ctx);

        // Select this category
        await selectCategory(page, category.index, category.name);

        // Check for errors
        const significantErrors = ctx.errors.filter(
          (e) =>
            !e.includes('[HMR]') &&
            !e.includes('DevTools') &&
            !e.includes('favicon')
        );

        // Log errors for debugging
        if (significantErrors.length > 0) {
          console.log(`Errors in ${category.name}:`, significantErrors);
        }

        expect(significantErrors, `${category.name} should have no errors`).toHaveLength(0);
      });

      test('loads all textures', async ({ page }) => {
        const textureRequests: { url: string; status: number }[] = [];

        page.on('response', (response) => {
          const url = response.url();
          if (
            url.includes('/textures/') ||
            url.includes('/assets/') ||
            url.endsWith('.jpg') ||
            url.endsWith('.png')
          ) {
            textureRequests.push({ url, status: response.status() });
          }
        });

        await selectCategory(page, category.index, category.name);

        // Check for failed texture requests
        const failedTextures = textureRequests.filter((t) => t.status >= 400);

        if (failedTextures.length > 0) {
          console.log(`Failed textures in ${category.name}:`, failedTextures);
        }

        expect(failedTextures, `${category.name} textures should all load`).toHaveLength(0);
      });

      test('has no mesh errors', async ({ page }) => {
        const ctx = createContext();
        setupConsoleListener(page, ctx);

        await selectCategory(page, category.index, category.name);

        expect(ctx.meshErrors, `${category.name} should have no mesh errors`).toHaveLength(0);
      });

      test('has no material errors', async ({ page }) => {
        const ctx = createContext();
        setupConsoleListener(page, ctx);

        await selectCategory(page, category.index, category.name);

        expect(ctx.materialErrors, `${category.name} should have no material errors`).toHaveLength(0);
      });

      test('visual regression', async ({ page }) => {
        await selectCategory(page, category.index, category.name);

        // Additional wait for visual stability
        await page.waitForTimeout(500);

        await expect(page).toHaveScreenshot(`showcase-${category.index}-${category.name.toLowerCase().replace(/\s+/g, '-')}.png`, {
          maxDiffPixels: 300,
          threshold: 0.15,
          animations: 'disabled',
        });
      });
    });
  }
});

// Full showcase integration tests
test.describe('Showcase Integration', () => {
  test('all categories are accessible', async ({ page }) => {
    await page.goto('/tests/component-showcase.html');
    await waitForShowcaseReady(page);

    // Verify all category buttons exist
    for (const category of SHOWCASE_CATEGORIES) {
      const button = page.locator(`button:has-text("${category.name}")`);
      await expect(button, `${category.name} button should exist`).toBeVisible();
    }
  });

  test('category switching works correctly', async ({ page }) => {
    await page.goto('/tests/component-showcase.html');
    await waitForShowcaseReady(page);

    // Cycle through all categories
    for (const category of SHOWCASE_CATEGORIES) {
      await selectCategory(page, category.index, category.name);

      // Verify current category is highlighted
      const activeButton = page.locator(`button:has-text("${category.name}")`);
      await expect(activeButton).toHaveCSS('background-color', 'rgb(0, 255, 136)');
    }
  });

  test('no memory leaks across category switches', async ({ page }) => {
    const ctx = createContext();
    setupConsoleListener(page, ctx);

    await page.goto('/tests/component-showcase.html');
    await waitForShowcaseReady(page);

    // Rapidly switch between categories
    for (let i = 0; i < 3; i++) {
      for (const category of SHOWCASE_CATEGORIES) {
        await selectCategory(page, category.index, category.name);
        await page.waitForTimeout(300);
      }
    }

    // Check for errors after rapid switching
    const memoryErrors = ctx.errors.filter(
      (e) => e.includes('memory') || e.includes('Memory') || e.includes('out of')
    );

    expect(memoryErrors, 'No memory errors after category switching').toHaveLength(0);
  });

  test('total error count across all categories', async ({ page }) => {
    const allErrors: { category: string; error: string }[] = [];

    await page.goto('/tests/component-showcase.html');
    await waitForShowcaseReady(page);

    for (const category of SHOWCASE_CATEGORIES) {
      const ctx = createContext();

      page.removeAllListeners('console');
      page.removeAllListeners('pageerror');
      setupConsoleListener(page, ctx);

      await selectCategory(page, category.index, category.name);

      for (const error of ctx.errors) {
        if (
          !error.includes('[HMR]') &&
          !error.includes('DevTools') &&
          !error.includes('favicon')
        ) {
          allErrors.push({ category: category.name, error });
        }
      }
    }

    // Report all errors found
    if (allErrors.length > 0) {
      console.log('\n=== ERRORS FOUND ACROSS CATEGORIES ===');
      for (const { category, error } of allErrors) {
        console.log(`[${category}] ${error}`);
      }
      console.log('======================================\n');
    }

    expect(allErrors, 'Total errors across all categories should be 0').toHaveLength(0);
  });
});

// Component-specific behavior tests
test.describe('Component Behaviors', () => {
  test('NeonSign emits light (Signage & Lighting)', async ({ page }) => {
    await page.goto('/tests/component-showcase.html');
    await waitForShowcaseReady(page);
    await selectCategory(page, 5, 'Signage & Lighting');

    // Visual check for neon glow
    await expect(page).toHaveScreenshot('neon-signs-glow.png');
  });

  test('Water components have transparency (Water & Maritime)', async ({ page }) => {
    await page.goto('/tests/component-showcase.html');
    await waitForShowcaseReady(page);
    await selectCategory(page, 1, 'Water & Maritime');

    // Visual check for water rendering
    await expect(page).toHaveScreenshot('water-components.png');
  });

  test('Structural components have correct alignment', async ({ page }) => {
    await page.goto('/tests/component-showcase.html');
    await waitForShowcaseReady(page);
    await selectCategory(page, 0, 'Structural');

    // Visual check for alignment
    await expect(page).toHaveScreenshot('structural-alignment.png');
  });

  test('Infrastructure components render at correct scale', async ({ page }) => {
    await page.goto('/tests/component-showcase.html');
    await waitForShowcaseReady(page);
    await selectCategory(page, 3, 'Infrastructure');

    // Visual check for scale
    await expect(page).toHaveScreenshot('infrastructure-scale.png');
  });

  test('Vegetation renders with proper transparency', async ({ page }) => {
    await page.goto('/tests/component-showcase.html');
    await waitForShowcaseReady(page);
    await selectCategory(page, 4, 'Vegetation & Props');

    // Visual check for vegetation
    await expect(page).toHaveScreenshot('vegetation-transparency.png');
  });
});
