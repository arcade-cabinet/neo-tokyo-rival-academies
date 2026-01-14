import asyncio
from playwright.async_api import async_playwright
import os

async def verify_game():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        page = await browser.new_page()

        # Start server (assuming it's running on 4321)
        try:
            await page.goto("http://localhost:4321/neo-tokyo-rival-academies", timeout=20000)
            print("Successfully loaded http://localhost:4321")

            # Wait for canvas
            await page.wait_for_selector("canvas", timeout=20000)
            print("Canvas element found")

            # Check for Main Menu text (after Splash)
            # Wait for main menu text to appear after splash
            try:
                await page.wait_for_selector("text=NEO-TOKYO", timeout=10000)
                print("Main Menu text found")
            except Exception:
                print("WARNING: Main Menu text NOT found within timeout")

            # Take screenshot
            os.makedirs("screenshots", exist_ok=True)
            await page.screenshot(path="screenshots/game_screen.png")
            print("Screenshot saved to screenshots/game_screen.png")

        os.makedirs("screenshots", exist_ok=True)
        try:
            await page.goto("http://localhost:4321/neo-tokyo-rival-academies", timeout=20000)
            print("Successfully loaded http://localhost:4321/neo-tokyo-rival-academies")

            # Wait for canvas
            await page.wait_for_selector("canvas", timeout=20000)
            print("Canvas element found")

            # Check for Main Menu text (after Splash)
            # Splash takes ~3s.
            await asyncio.sleep(4)
            content = await page.content()
            if "NEO-TOKYO" in content:
                print("Main Menu text found")
            else:
                print("WARNING: Main Menu text NOT found")

            # Take screenshot
            await page.screenshot(path="screenshots/game_screen.png")
            print("Screenshot saved to screenshots/game_screen.png")

        except (TimeoutError, Exception) as e:
            print(f"Error: {e}")
            # Take screenshot of error
            await page.screenshot(path="screenshots/error_screen.png")

        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(verify_game())
