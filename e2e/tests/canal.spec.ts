import { expect, test } from '@playwright/test';

test.describe('Canal Scene Verification', () => {
  test('renders canal scene without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/neo-tokyo-rival-academies/');
    const startBtn = page.getByText('INITIATE STORY MODE');
    await expect(startBtn).toBeVisible({ timeout: 15000 });
    await startBtn.click();

    const viewport = page.viewportSize();
    if (!viewport) throw new Error('Viewport not available');

    // Advance intro quickly
    for (let i = 0; i < 6; i += 1) {
      await page.mouse.click(viewport.width / 2, viewport.height / 2);
    }

    await expect(page.getByText('LVL 1 KAI')).toBeVisible({ timeout: 15000 });
    await page.screenshot({ path: 'verification/canal_scene.png' });

    const ignoredPatterns = [
      /Failed to load character: RuntimeError: Unable to load from .*combat_stance\.glb/i,
      /cannot be a descendant of <.*>/i,
    ];
    const actionableErrors = errors.filter(
      (error) => !ignoredPatterns.some((pattern) => pattern.test(error))
    );
    expect(actionableErrors).toEqual([]);
  });
});
