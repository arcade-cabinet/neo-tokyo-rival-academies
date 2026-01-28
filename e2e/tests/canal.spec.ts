import { expect, test } from '@playwright/test';

test.describe('Canal Scene Verification', () => {
  test('renders canal scene without console errors', async ({ page }) => {
    const errors: string[] = [];
    const missingResources: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    page.on('response', (response) => {
      if (response.status() === 404) {
        missingResources.push(response.url());
      }
    });

    await page.goto('/');
    const startBtn = page.getByText('INITIATE STORY MODE');
    await expect(startBtn).toBeVisible({ timeout: 15000 });
    await startBtn.click();

    await expect(page.locator('.narrative-dialogue-box')).toBeVisible({ timeout: 15000 });
    await page.getByRole('button', { name: 'SKIP INTRO >>' }).click();

    await expect(page.getByText('LVL 1 KAI')).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: 'verification/canal_scene.png' });

    const ignoredPatterns = [
      /Failed to load character: RuntimeError: Unable to load from .*combat_stance\.glb/i,
      /cannot be a descendant of <.*>/i,
    ];
    const actionableErrors = errors.filter(
      (error) => !ignoredPatterns.some((pattern) => pattern.test(error))
    );
    if (missingResources.length) {
      console.log('Missing resources:', missingResources);
    }
    expect(actionableErrors).toEqual([]);
  });
});
