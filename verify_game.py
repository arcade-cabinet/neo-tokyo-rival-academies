from playwright.sync_api import Page, expect, sync_playwright
import time

def test_game_load(page: Page):
    print("Navigating to game...")
    page.goto("http://localhost:4323/neo-tokyo-rival-academies")

    # Wait for the canvas element which confirms 3D scene load
    page.wait_for_selector("canvas", timeout=30000)

    print("Canvas found. Waiting for splash screen (5s)...")
    time.sleep(5)

    page.screenshot(path="/home/jules/verification/game_menu.png")
    print("Menu screenshot taken.")

    # Look for START STORY button
    try:
        # Use get_by_text since the button text is specific
        start_btn = page.get_by_text("INITIATE STORY MODE")
        if start_btn.is_visible():
            start_btn.click()
            print("Clicked INITIATE STORY MODE")

            # Wait for Intro Overlay
            time.sleep(2)
            page.screenshot(path="/home/jules/verification/game_intro.png")

            # Click to advance intro
            print("Advancing intro...")
            # Intro likely takes full screen clicks
            for i in range(10):
                page.mouse.click(640, 360) # Center
                time.sleep(0.3)

            print("Intro should be done. Waiting for gameplay...")
            time.sleep(3)
            page.screenshot(path="/home/jules/verification/game_gameplay.png")
            print("Gameplay screenshot taken.")
        else:
            print("Start button not visible.")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        # Set viewport to landscape mobile-ish or desktop
        page = browser.new_page(viewport={"width": 1280, "height": 720})
        try:
            test_game_load(page)
        finally:
            browser.close()
