import { expect, test } from '@playwright/test';

test.describe('JRPG Gameplay Verification', () => {
  test('should verify full gameplay loop: Menu -> Dialogue -> HUD', async ({ page }) => {
    // 1. Navigate to Game
    console.log('Navigating to game...');
    await page.goto('/neo-tokyo-rival-academies/');

    // 2. Verify Menu
    console.log('Waiting for Menu...');
    await page.waitForSelector('[data-testid="scene-ready"]', { state: 'visible' });

    const startBtn = page.getByText('INITIATE STORY MODE');
    await expect(startBtn).toBeVisible({ timeout: 20000 });

    await page.screenshot({ path: 'verification/1_menu.png' });

    // 3. Start Game
    console.log('Clicking Start...');
    await startBtn.click();

    // 4. Verify Intro Dialogue
    console.log('Waiting for Intro Dialogue...');
    const dialogueBox = page.getByTestId('dialogue-box');
    await expect(dialogueBox).toBeVisible({ timeout: 10000 });

    // 5. Advance Dialogue
    console.log('Advancing dialogue...');
    const introLines = ['Hey Vector!', 'Your noise pollution', 'optimal path', 'Calculated? Hah!'];

    const viewport = page.viewportSize();
    if (!viewport) throw new Error('Viewport not available');

    for (const lineFragment of introLines) {
      // Double click strategy to skip typewriter and advance
      await page.waitForTimeout(600);
      await page.mouse.click(viewport.width / 2, viewport.height / 2); // Finish text
      await page.waitForTimeout(300);
      await expect(page.getByText(lineFragment)).toBeVisible({ timeout: 10000 });
      await page.mouse.click(viewport.width / 2, viewport.height / 2); // Advance node
    }

    // Final click to close overlay if still visible
    await page.waitForTimeout(1000);
    if (await dialogueBox.isVisible()) {
      await page.mouse.click(viewport.width / 2, viewport.height / 2);
    }

    // 6. Verify Gameplay HUD
    console.log('Waiting for Gameplay...');
    // Use regex to match LVL 1 KAI
    await expect(page.getByText(/LVL \d KAI/)).toBeVisible({ timeout: 20000 });
    await expect(page.getByText(/\d+\/\d+/)).toBeVisible({ timeout: 20000 });

    await page.screenshot({ path: 'verification/3_gameplay_hud.png' });
    console.log('Gameplay Verified.');
  });
});
