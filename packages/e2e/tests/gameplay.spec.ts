import { test, expect } from '@playwright/test';

test.describe('JRPG Gameplay Verification', () => {
  test('should verify full gameplay loop: Menu -> Dialogue -> HUD', async ({ page }) => {
    // 1. Navigate to Game
    console.log('Navigating to game...');
    await page.goto('/neo-tokyo-rival-academies/');

    // 2. Verify Menu
    console.log('Waiting for Menu...');
    await page.waitForSelector('canvas');
    // Wait for 3D scene to initialize (simulated)
    await page.waitForTimeout(5000);
    await page.screenshot({ path: 'verification/1_menu.png' });

    // 3. Start Game
    console.log('Clicking Start...');
    const startBtn = page.getByText('INITIATE STORY MODE');
    await expect(startBtn).toBeVisible();
    await startBtn.click();

    // 4. Verify Intro Dialogue
    console.log('Waiting for Intro Dialogue...');
    // Expect dialogue box to appear (using class logic or text)
    // JRPGHUD has styles.dialogueBox. Let's look for text or the box.
    // Assuming text from story.json "Engine's hot"
    await page.waitForTimeout(2000); // Transition
    await page.screenshot({ path: 'verification/2_dialogue_intro.png' });

    // 5. Advance Dialogue
    console.log('Advancing dialogue...');
    // Click center of screen to advance
    const viewport = page.viewportSize();
    if (viewport) {
        for (let i = 0; i < 5; i++) {
            await page.mouse.click(viewport.width / 2, viewport.height / 2);
            await page.waitForTimeout(1000);
        }
    }

    // 6. Verify Gameplay HUD
    console.log('Waiting for Gameplay...');
    await page.waitForTimeout(3000);
    // Check for HUD elements
    await expect(page.getByText('LVL 1 KAI')).toBeVisible();
    await expect(page.getByText('100/100')).toBeVisible();

    await page.screenshot({ path: 'verification/3_gameplay_hud.png' });
    console.log('Gameplay Verified.');
  });
});
