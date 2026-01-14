import { chromium, type Page } from 'playwright';
import * as path from 'node:path';

async function testGameLoad(page: Page) {
    console.log("Navigating to game...");
    // Assuming local dev server port, should be configurable
    await page.goto("http://localhost:4323/neo-tokyo-rival-academies");

    // Wait for the canvas element which confirms 3D scene load
    await page.waitForSelector("canvas", { timeout: 30000 });

    console.log("Canvas found. Waiting for splash screen (5s)...");
    await page.waitForTimeout(5000);

    await page.screenshot({ path: path.join(process.cwd(), "verification/game_menu.png") });
    console.log("Menu screenshot taken.");

    // Look for START STORY button
    try {
        const startBtn = page.getByText("INITIATE STORY MODE");
        if (await startBtn.isVisible()) {
            await startBtn.click();
            console.log("Clicked INITIATE STORY MODE");

            // Wait for Intro Overlay
            await page.waitForTimeout(2000);
            await page.screenshot({ path: path.join(process.cwd(), "verification/game_intro.png") });

            // Click to advance intro
            console.log("Advancing intro...");
            for (let i = 0; i < 10; i++) {
                await page.mouse.click(640, 360);
                await page.waitForTimeout(300);
            }

            console.log("Intro should be done. Waiting for gameplay...");
            await page.waitForTimeout(3000);
            await page.screenshot({ path: path.join(process.cwd(), "verification/game_gameplay.png") });
            console.log("Gameplay screenshot taken.");
        } else {
            console.log("Start button not visible.");
        }
    } catch (e) {
        console.error(`Error: ${e}`);
    }
}

async function main() {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
    const page = await context.newPage();

    try {
        // Ensure verification dir exists
        // fs.mkdirSync ... (omitted for brevity, running in env likely has it or we can add)
        await testGameLoad(page);
    } finally {
        await browser.close();
    }
}

main().catch(console.error);
