import { test, expect } from '@playwright/test';

test.describe('JRPG Gameplay Verification', () => {
  test('should verify full gameplay loop: Menu -> Dialogue -> HUD', async ({ page }) => {
    // 1. Navigate to Game
    console.log('Navigating to game...');
    await page.goto('/neo-tokyo-rival-academies/');

    // 2. Verify Menu
    console.log('Waiting for Menu...');
    await page.waitForSelector('canvas', { state: 'visible' });

    // Wait for the splash screen to disappear (assuming it has a class/id, or wait for start button)
    // Assuming splash screen might be present initially.
    // Better to wait for the Start Button which confirms Menu state.
    const startBtn = page.getByText('INITIATE STORY MODE');
    await expect(startBtn).toBeVisible({ timeout: 15000 });

    await page.screenshot({ path: 'verification/1_menu.png' });

    // 3. Start Game
    console.log('Clicking Start...');
    await startBtn.click();

    // 4. Verify Intro Dialogue
    console.log('Waiting for Intro Dialogue...');
    // Look for unique dialogue text from INTRO_SCRIPT (NeoTokyoGame.tsx) or story.json
    // "Hey Vector! Try not to overheat..."
    const dialogueBox = page.locator('div[class*="dialogueBox"]'); // Assuming css module hash in class name
    await expect(dialogueBox).toBeVisible();
    await expect(page.getByText('Hey Vector!')).toBeVisible();

    await page.screenshot({ path: 'verification/2_dialogue_intro.png' });

    // 5. Advance Dialogue
    console.log('Advancing dialogue...');
    // We know there are 5 lines in INTRO_SCRIPT.
    const introLines = [
        'Hey Vector!',
        'Your noise pollution',
        'optimal path',
        'Calculated? Hah!',
        'MIDNIGHT EXAM'
    ];

    const viewport = page.viewportSize();
    if (!viewport) throw new Error("Viewport not available");

    for (const lineFragment of introLines) {
        // Verify current line is visible (except maybe the first one which we checked above, but harmless to recheck)
        // Note: rapid clicks might skip if animation is slow, but we wait for text.
        // Actually, "NarrativeOverlay" might just tap to advance.
        // Wait for the specific text to be stable/visible
        await expect(page.getByText(lineFragment)).toBeVisible();

        // Click to advance
        await page.mouse.click(viewport.width / 2, viewport.height / 2);

        // Wait for next text or completion
        // Since we loop, the next expect() acts as the wait.
    }

    // Final click to close overlay
    await page.mouse.click(viewport.width / 2, viewport.height / 2);

    // 6. Verify Gameplay HUD
    console.log('Waiting for Gameplay...');
    // Wait for HUD specific element
    await expect(page.getByText('LVL 1 KAI')).toBeVisible();
    await expect(page.getByText('100/100')).toBeVisible();

    await page.screenshot({ path: 'verification/3_gameplay_hud.png' });
    console.log('Gameplay Verified.');
  });
});
