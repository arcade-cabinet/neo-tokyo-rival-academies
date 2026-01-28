import { expect, test } from '@playwright/test';

test.describe('JRPG Gameplay Verification', () => {
  test('should verify full gameplay loop: Menu -> Dialogue -> HUD', async ({ page }) => {
    // 1. Navigate to Game
    console.log('Navigating to game...');
    await page.goto('/');

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
    const dialogueBox = page.locator('.narrative-dialogue-box');
    await expect(dialogueBox).toBeVisible({ timeout: 15000 });
    await expect(dialogueBox).toContainText(/Council|Shortcuts|waterline|Kurenai|DESCENT/);

    await page.screenshot({ path: 'verification/2_dialogue_intro.png' });

    // 5. Skip Dialogue to reach gameplay
    console.log('Skipping dialogue...');
    await page.getByRole('button', { name: 'SKIP INTRO >>' }).click();

    // 6. Verify Gameplay HUD
    console.log('Waiting for Gameplay...');
    // Wait for HUD specific element
    await expect(page.getByText('LVL 1 KAI')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('10/10')).toBeVisible({ timeout: 15000 });

    await page.screenshot({ path: 'verification/3_gameplay_hud.png' });
    console.log('Gameplay Verified.');
  });
});
