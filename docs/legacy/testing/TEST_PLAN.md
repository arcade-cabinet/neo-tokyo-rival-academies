# Neo-Tokyo: Rival Academies - Test Plan v1.0

## Test Environment
- **Browser**: Chrome 120+, Firefox 120+, Safari 17+
- **Device**: Desktop (1920x1080), Tablet (1024x768), Mobile (640x960)
- **URL**: http://localhost:4322/ (dev) | https://neo-tokyo.vercel.app (production)

---

## 1. Main Menu Flow

### Test Case 1.1: Initial Load
**Steps**:
1. Navigate to application URL
2. Verify main menu displays

**Expected**:
- Title "NEO-TOKYO RIVAL ACADEMIES" visible
- Mission briefing text displayed
- "INITIATE STORY MODE" button enabled
- "ARCHIVES [LOCKED]" button disabled
- Background graphics loaded
- No console errors

**Status**: ✅ PASS

---

### Test Case 1.2: Start New Game
**Steps**:
1. Click "INITIATE STORY MODE"
2. Wait for intro sequence

**Expected**:
- Transition to intro narrative screen
- Dialogue between Kai and Vera displays
- Background image loads
- Proceed button appears

**Status**: ⏳ PENDING

---

## 2. Intro Narrative Sequence

### Test Case 2.1: Dialogue Progression
**Steps**:
1. Read first dialogue (Kai)
2. Click to advance
3. Read next dialogue (Vera)
4. Continue through all 5 dialogues
5. Reach "SYSTEM: MIDNIGHT EXAM INITIATED. GO!"

**Expected**:
- Each dialogue displays correct speaker name
- Character images change appropriately
- Text is readable and properly formatted
- "Next" button is functional
- Sequence completes without errors

**Status**: ⏳ PENDING

---

### Test Case 2.2: Intro Completion
**Steps**:
1. Complete intro dialogue sequence
2. Wait for transition to game view

**Expected**:
- World initialization occurs (console log: "World initialized: Academy Gate Slums")
- Quest activation occurs (console log: "Main quest activated")
- Game view loads with:
  - 3D Babylon scene rendering
  - HUD elements visible
  - Quest objective panel (top-right)
  - Alignment bar (top-left)
  - Touch controls (bottom)
  - Quest log button (bottom-left)

**Status**: ⏳ PENDING

---

## 3. Game View & World

### Test Case 3.1: Initial Game State
**Steps**:
1. Enter game view after intro
2. Inspect HUD elements

**Expected**:
- **Quest Objective Panel**:
  - Shows main quest title
  - Displays objective text
  - Shows location "Academy Gate Slums"
  - Quest type badge "⭐ Main Quest"

- **Alignment Bar**:
  - Shows Kurenai 50 / Azure 50
  - Alignment indicator at center (Neutral)
  - Label: "Neutral"

- **Touch Controls**:
  - D-pad visible (left side)
  - Action button visible (right side)

- **Quest Log Button**:
  - Visible at bottom-left
  - Shows "📋 Quests (Q)"

**Status**: ⏳ PENDING

---

### Test Case 3.2: 3D Scene Rendering
**Steps**:
1. Observe 3D scene
2. Check for visual elements

**Expected**:
- Babylon.js canvas renders
- Hex grid visible
- Character model loaded
- Lighting and shadows present
- Scanlines effect overlay
- No rendering errors in console

**Status**: ⏳ PENDING

---

## 4. Quest System

### Test Case 4.1: Quest Log - Active Quests
**Steps**:
1. Click "📋 Quests (Q)" button
2. View Active Quests tab

**Expected**:
- Quest log modal opens
- "Active" tab selected by default
- Main quest listed with:
  - Quest title
  - Description
  - Objective
  - Location
  - Rewards (XP, Credits, Alignment)
  - Quest type badge

**Status**: ⏳ PENDING

---

### Test Case 4.2: Quest Log - Completed Quests
**Steps**:
1. Open quest log
2. Click "Completed" tab

**Expected**:
- Tab switches to Completed
- Empty state message: "No completed quests yet"

**Status**: ⏳ PENDING

---

### Test Case 4.3: Quest Log - Close
**Steps**:
1. Open quest log
2. Click X button or outside modal

**Expected**:
- Modal closes smoothly
- Game view visible again

**Status**: ⏳ PENDING

---

## 5. Alignment System

### Test Case 5.1: Alignment Bar Display
**Steps**:
1. Observe alignment bar in top-left

**Expected**:
- Gradient bar (red to blue)
- Position indicator showing current alignment
- Dual reputation meters: "Kurenai: 50 | Azure: 50"
- Alignment label: "Neutral"

**Status**: ⏳ PENDING

---

### Test Case 5.2: Alignment Shift (Simulated)
**Steps**:
1. Complete a quest with Kurenai alignment shift
2. Observe alignment bar changes

**Expected**:
- Kurenai reputation increases
- Indicator moves left (toward red)
- Label updates (e.g., "Slightly Kurenai")
- Stat bonus notification if threshold met

**Status**: ⏳ PENDING

---

## 6. Combat System

### Test Case 6.1: Combat Initiation
**Steps**:
1. Trigger combat encounter (via quest or exploration)
2. Wait for combat screen

**Expected**:
- Combat arena overlay appears
- Player stats displayed (HP bar, name)
- Enemy stats displayed (HP bar, name, quantity)
- Turn indicator shows "Your Turn"
- Action buttons enabled (Attack, Defend)

**Status**: ⏳ PENDING

---

### Test Case 6.2: Combat - Player Attack
**Steps**:
1. Select enemy target
2. Click "Attack" button
3. Observe combat log

**Expected**:
- Attack animation/feedback
- Damage calculated correctly
- Enemy HP decreases
- Combat log shows: "[Player] attacks [Enemy] for X damage"
- Critical hits show "CRITICAL!" message
- Turn switches to enemy

**Status**: ⏳ PENDING

---

### Test Case 6.3: Combat - Enemy Turn
**Steps**:
1. Wait for enemy turn (auto-executes)
2. Observe enemy actions

**Expected**:
- Enemy attacks player
- Player HP decreases
- Combat log shows enemy action
- Turn switches back to player
- Action buttons re-enabled

**Status**: ⏳ PENDING

---

### Test Case 6.4: Combat - Victory
**Steps**:
1. Defeat all enemies (reduce HP to 0)
2. Wait for victory screen

**Expected**:
- Victory overlay appears
- "VICTORY!" message with trophy icon
- "Continue" button visible
- XP/credits added to player stats
- Combat ends, returns to game view

**Status**: ⏳ PENDING

---

### Test Case 6.5: Combat - Defeat
**Steps**:
1. Allow player HP to reach 0
2. Wait for defeat screen

**Expected**:
- Defeat overlay appears
- "DEFEATED" message
- "Reload Save" button visible
- Clicking button loads last save

**Status**: ⏳ PENDING

---

## 7. Progression System

### Test Case 7.1: Quest Completion
**Steps**:
1. Complete quest objective
2. Trigger quest completion

**Expected**:
- Quest completion dialog appears
- Shows quest title
- Displays rewards earned:
  - XP amount
  - Credits amount
  - Alignment shift (if any)
  - Items (if any)
- "Continue" button closes dialog
- Rewards applied to player state
- Quest moves from Active to Completed

**Status**: ⏳ PENDING

---

### Test Case 7.2: Level Up
**Steps**:
1. Gain enough XP to level up (100 * current level)
2. Observe level up notification

**Expected**:
- "LEVEL UP!" banner in completion dialog
- Shows new level number
- Stats automatically increase (+2 per level to all stats)
- XP bar resets for next level

**Status**: ⏳ PENDING

---

### Test Case 7.3: Credits & Inventory
**Steps**:
1. Gain credits from quest/combat
2. Receive items from quest rewards
3. Open inventory (when implemented)

**Expected**:
- Credits total updates in HUD
- Items added to inventory
- Inventory screen shows all items
- Items can be equipped/used

**Status**: ⏳ PENDING

---

## 8. Save/Load System

### Test Case 8.1: Auto-Save
**Steps**:
1. Complete a quest or significant progress
2. Check localStorage for auto-save

**Expected**:
- Auto-save slot (0) populated
- Save data includes:
  - Player stats (level, XP, credits)
  - Inventory
  - Alignment (Kurenai/Azure rep)
  - Active quests
  - Completed quests
  - World state (seed, district)

**Status**: ⏳ PENDING

---

### Test Case 8.2: Manual Save
**Steps**:
1. Open save menu (when implemented)
2. Select slot 1, 2, or 3
3. Save game

**Expected**:
- Save confirmation
- Slot shows save metadata:
  - Level
  - Act
  - District name
  - Playtime
  - Alignment
  - Timestamp

**Status**: ⏳ PENDING

---

### Test Case 8.3: Load Game
**Steps**:
1. Open save menu
2. Select populated save slot
3. Load game

**Expected**:
- Game state restores:
  - Player stats match saved data
  - Inventory restored
  - Alignment restored
  - Quests restored (active & completed)
  - World seed restored
- Game view loads at saved location

**Status**: ⏳ PENDING

---

## 9. Responsive Design

### Test Case 9.1: Desktop (1920x1080)
**Expected**:
- All UI elements visible
- No overlapping elements
- Touch controls optional
- Keyboard controls functional

**Status**: ⏳ PENDING

---

### Test Case 9.2: Tablet (1024x768)
**Expected**:
- UI scales appropriately
- Touch controls enabled
- HUD elements readable
- No horizontal scrolling

**Status**: ⏳ PENDING

---

### Test Case 9.3: Mobile (640x960 Portrait)
**Expected**:
- Landscape mode forced (per requirements)
- UI elements fit screen
- Touch controls prominent
- Text remains readable
- Performance maintains 30+ FPS

**Status**: ⏳ PENDING

---

## 10. Performance

### Test Case 10.1: Frame Rate
**Steps**:
1. Monitor FPS during gameplay
2. Test with multiple enemies
3. Test with complex 3D scene

**Expected**:
- Maintain 30+ FPS on mobile
- Maintain 60 FPS on desktop
- No significant frame drops

**Status**: ⏳ PENDING

---

### Test Case 10.2: Load Times
**Steps**:
1. Measure initial page load
2. Measure scene transitions
3. Measure modal open/close

**Expected**:
- Initial load: < 5 seconds
- Scene transitions: < 1 second
- Modal animations: smooth (60fps)

**Status**: ⏳ PENDING

---

### Test Case 10.3: Memory Usage
**Steps**:
1. Monitor memory during extended play
2. Check for memory leaks
3. Test save/load memory impact

**Expected**:
- No memory leaks
- Memory stays under 500MB
- Save/load doesn't spike memory

**Status**: ⏳ PENDING

---

## 11. Error Handling

### Test Case 11.1: Invalid Save Data
**Steps**:
1. Corrupt save data in localStorage
2. Attempt to load game

**Expected**:
- Error caught gracefully
- User notified of corrupt save
- Game doesn't crash
- Can start new game

**Status**: ⏳ PENDING

---

### Test Case 11.2: Network Errors
**Steps**:
1. Disconnect from internet
2. Continue playing

**Expected**:
- Game continues functioning (fully client-side)
- No critical errors
- Save/load still works (localStorage)

**Status**: ⏳ PENDING

---

### Test Case 11.3: Console Error Monitoring
**Steps**:
1. Play through entire game flow
2. Monitor console for errors

**Expected**:
- No unhandled errors
- No React warnings
- No Babylon.js errors

**Status**: ⏳ PENDING

---

## Test Summary

**Total Test Cases**: 33
**Passed**: 1
**Failed**: 0
**Pending**: 32
**Blocked**: 0

**Coverage**:
- Main Menu: 2/2 defined
- Intro Sequence: 0/2 tested
- Game View: 0/2 tested
- Quest System: 0/3 tested
- Alignment: 0/2 tested
- Combat: 0/5 tested
- Progression: 0/3 tested
- Save/Load: 0/3 tested
- Responsive: 0/3 tested
- Performance: 0/3 tested
- Error Handling: 0/3 tested

---

## Critical Path for v1.0 Release

### Must Pass (P0):
- [x] Main Menu Load
- [ ] Intro Sequence Complete
- [ ] Game View Renders
- [ ] Quest Log Opens/Closes
- [ ] Combat Victory Flow
- [ ] Save/Load Works
- [ ] No Console Errors

### Should Pass (P1):
- [ ] Combat Defeat Flow
- [ ] Quest Completion
- [ ] Level Up
- [ ] Alignment Shifts
- [ ] Mobile Responsive
- [ ] Performance (30+ FPS)

### Nice to Have (P2):
- [ ] Inventory Management
- [ ] Multiple Encounters
- [ ] Export/Import Saves
- [ ] Tablet Optimization

---

## Deployment Checklist

- [ ] All P0 tests passing
- [ ] Build optimization complete
- [ ] Vercel/Netlify configuration
- [ ] Environment variables set
- [ ] HTTPS enabled
- [ ] Analytics configured (optional)
- [ ] Error tracking (Sentry optional)
- [ ] README.md updated
- [ ] CHANGELOG.md created
- [ ] GitHub release tagged (v1.0.0)

---

**Last Updated**: 2026-01-17
**Test Lead**: Claude Code AI
**Status**: READY FOR MANUAL TESTING
