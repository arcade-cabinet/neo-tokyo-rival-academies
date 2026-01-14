from playwright.sync_api import Page, expect, sync_playwright
import time

def verify_rpg_gameplay(page: Page):
    # Debug Console
    page.on("console", lambda msg: print(f"Console: {msg.text}"))
    page.on("pageerror", lambda err: print(f"Page Error: {err}"))

    # 1. Go to the game
    print("Navigating to game...")
    page.goto("http://localhost:4321/neo-tokyo-rival-academies/")

    # 2. Wait for Menu
    print("Waiting for Menu...")
    page.wait_for_selector("canvas")
    time.sleep(5) # Wait for 3D load

    # 3. Click Start
    print("Clicking Start...")
    try:
        start_btn = page.get_by_text("INITIATE STORY MODE")
        start_btn.click()
    except:
        print("Could not find start button, checking screenshot")
        page.screenshot(path="/home/jules/verification/debug_menu.png")
        return


    # 4. Wait for Intro (Narrative Overlay)
    print("Waiting for Intro...")
    time.sleep(2)

    # 5. Skip Intro (Click through)
    print("Skipping intro...")
    for i in range(20):
        page.mouse.click(640, 360) # Center of 1280x720
        time.sleep(0.3)

    # 6. Gameplay with HUD
    print("Waiting for Gameplay...")
    time.sleep(3)
    page.screenshot(path="/home/jules/verification/3_gameplay_hud.png")
    print("Gameplay screenshot taken.")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.set_viewport_size({"width": 1280, "height": 720})
        try:
            verify_rpg_gameplay(page)
        except Exception as e:
            print(f"Error: {e}")
            page.screenshot(path="/home/jules/verification/error.png")
        finally:
            browser.close()
