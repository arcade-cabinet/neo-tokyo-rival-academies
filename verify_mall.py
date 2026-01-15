from playwright.sync_api import Page, expect, sync_playwright
import time

def test_game_load(page: Page):
    print("Navigating to game...")
    # Using port 4321 as seen in server.log
    page.goto("http://localhost:4321/neo-tokyo-rival-academies")

    print("Waiting for canvas...")
    page.wait_for_selector("canvas", timeout=30000)

    print("Waiting for scene to stabilize (2s)...")
    time.sleep(2)

    # Click Start
    print("Clicking Start...")
    try:
        start_btn = page.get_by_text("INITIATE STORY MODE")
        if start_btn.is_visible():
            start_btn.click()
            print("Clicked Start. Waiting for game...")
            time.sleep(3)

            # Skip intro if any
            print("Clicking through intro...")
            for i in range(5):
                page.mouse.click(640, 360)
                time.sleep(0.5)

            time.sleep(2)
            page.screenshot(path="/home/jules/verification/mall_background_gameplay.png")
            print("Gameplay screenshot taken.")
        else:
            print("Start button not visible.")
            page.screenshot(path="/home/jules/verification/menu_failed.png")
    except Exception as e:
        print(f"Error: {e}")
        page.screenshot(path="/home/jules/verification/error.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1280, "height": 720})
        try:
            test_game_load(page)
        finally:
            browser.close()
