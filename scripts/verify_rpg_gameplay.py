from playwright.sync_api import Page, sync_playwright
import time
import os

# Ensure verification directory exists
os.makedirs("/home/jules/verification", exist_ok=True)

def verify_rpg_gameplay(page: Page):
    # Debug Console
    page.on("console", lambda msg: print(f"Console: {msg.text}"))
    page.on("pageerror", lambda err: print(f"Page Error: {err}"))

    # 1. Go to the game
    print("Navigating to game...")
    page.goto("http://localhost:4321/neo-tokyo-rival-academies/")

    # 2. Wait for Menu & Capture
    print("Waiting for Menu...")
    page.wait_for_selector("canvas")
    time.sleep(5) # Wait for 3D load
    page.screenshot(path="/home/jules/verification/1_menu.png")
    print("Captured: 1_menu.png")

    # 3. Click Start
    print("Clicking Start...")
    try:
        start_btn = page.get_by_text("INITIATE STORY MODE")
        start_btn.click()
    except:
        print("Could not find start button")
        return


    # 4. Wait for Intro (Narrative Overlay) & Capture
    print("Waiting for Intro Dialogue...")
    time.sleep(2)
    page.screenshot(path="/home/jules/verification/2_dialogue_intro.png")
    print("Captured: 2_dialogue_intro.png")

    # 5. Advance Dialogue (Click through)
    print("Advancing dialogue...")
    # Click center to advance dialogue nodes
    for i in range(5):
        page.mouse.click(640, 360) # Center of 1280x720
        time.sleep(1.0) # Wait for potential transition

    # 6. Gameplay with HUD & Capture
    print("Waiting for Gameplay...")
    time.sleep(3)
    page.screenshot(path="/home/jules/verification/3_gameplay_hud.png")
    print("Captured: 3_gameplay_hud.png")

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
