import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',

  // Increase timeout for WebGL initialization
  timeout: 60000,
  expect: {
    timeout: 10000,
    // Configure visual comparison
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.1,
    },
  },

  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    // Game tests (existing)
    {
      name: 'game-chromium',
      testMatch: /gameplay\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:4321',
      },
    },
    // Playground component tests
    {
      name: 'playground-chromium',
      testMatch: /playground\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3001',
        // Consistent viewport for visual regression
        viewport: { width: 1280, height: 720 },
      },
    },
    // Diorama package visual regression
    {
      name: 'diorama-chromium',
      testMatch: /diorama\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: 'http://localhost:3001',
        viewport: { width: 1280, height: 720 },
      },
    },
  ],

  webServer: [
    // Game server for gameplay tests
    {
      command: 'pnpm --filter @neo-tokyo/game dev',
      url: 'http://localhost:4321',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
    // Playground server for component tests
    {
      command: 'pnpm --filter @neo-tokyo/playground dev',
      url: 'http://localhost:3001',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
  ],
});
