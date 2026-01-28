import { resolve } from 'node:path';
import { defineConfig, devices } from '@playwright/test';

const workspaceRoot = resolve(__dirname, '..');

const projects = [
  // Game tests (existing)
  {
    name: 'game-chromium',
    testMatch: /(gameplay|canal)\.spec\.ts/,
    use: {
      ...devices['Desktop Chrome'],
      baseURL: 'http://localhost:4200',
    },
  },
];

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

  projects,

  webServer: [
    {
      command: 'pnpm ng serve --port 4200',
      url: 'http://localhost:4200',
      cwd: workspaceRoot,
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
  ],
});
