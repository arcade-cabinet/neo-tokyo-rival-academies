# Physical Testing Checklist

> **Updated**: January 26, 2026 | **Platform**: Unity 6 Native Builds
> **Purpose**: Define mandatory device testing gates for each development phase.

## Build Instructions

```bash
# Android APK (debug)
Unity -batchmode -buildTarget Android -executeMethod BuildScript.BuildAndroid

# Android APK (release)
Unity -batchmode -buildTarget Android -executeMethod BuildScript.BuildAndroidRelease

# Install to device
adb install -r Builds/Android/NeoTokyo.apk
```

## Target Devices

### Primary: Google Pixel 8a
- **Role**: Baseline for mobile performance
- **Why**: Mid-tier Android, representative of target audience
- **Specs**: Tensor G3, 8GB RAM, 60Hz display

### Secondary: OnePlus Open
- **Role**: Foldable validation
- **Why**: Tests fold/unfold transitions, tablet mode
- **Specs**: Snapdragon 8 Gen 2, 16GB RAM, Inner 120Hz / Outer 60Hz

---

## Phase 1 Testing (Jan-Mar 2026)

### Test 1.1: Initial Boot (Week 2)
**Device**: Pixel 8a

| Criteria | Target | Method |
|----------|--------|--------|
| Cold start to splash | < 2s | Stopwatch from tap |
| Splash to interactive | < 3.5s | First input accepted |
| No ANR dialogs | Pass/Fail | Visual check |
| Canvas renders | Pass/Fail | Visual check |

**Pass Condition**: All criteria met

### Test 1.2: Touch Controls (Week 4)
**Device**: Pixel 8a

| Criteria | Target | Method |
|----------|--------|--------|
| Joystick response | < 50ms | Feel test |
| Button tap response | < 50ms | Feel test |
| No input drop | 100 inputs | Rapid tap test |
| Multi-touch works | Pass/Fail | Two-finger gesture |

**Pass Condition**: All criteria met

### Test 1.3: Combat Performance (Week 6)
**Device**: Pixel 8a

| Criteria | Target | Method |
|----------|--------|--------|
| FPS during combat | ≥ 55 FPS | DevTools overlay |
| No frame drops | < 5 during encounter | Visual check |
| Memory stable | < 150MB | DevTools |
| No crashes | 10 encounters | Stress test |

**Pass Condition**: All criteria met

### Test 1.4: Foldable Transitions (Week 10)
**Device**: OnePlus Open

| Criteria | Target | Method |
|----------|--------|--------|
| Fold transition time | < 500ms | Stopwatch |
| No control loss | Pass/Fail | Input during fold |
| Layout correct | Pass/Fail | Visual check both modes |
| No crashes | 100 fold/unfold cycles | Stress test |

**Pass Condition**: All criteria met

---

## Phase 2 Testing (Apr-Jun 2026)

### Test 2.1: District Streaming (Month 1)
**Device**: Pixel 8a

| Criteria | Target | Method |
|----------|--------|--------|
| District load time | < 2s | Timer during transition |
| Memory with 3 districts | < 200MB | DevTools |
| No pop-in | Pass/Fail | Visual check |
| Seamless transition | Pass/Fail | Walk between districts |

### Test 2.2: Full Act Playthrough (Month 2)
**Device**: Pixel 8a

| Criteria | Target | Method |
|----------|--------|--------|
| Act 1-2 completion | ~90 min | Timer |
| No crashes | Pass/Fail | Complete playthrough |
| Quest flow works | Pass/Fail | All quests completable |
| Save/load works | Pass/Fail | Test mid-act |

### Test 2.3: Extended Battery (Month 3)
**Device**: Pixel 8a

| Criteria | Target | Method |
|----------|--------|--------|
| Battery drain rate | < 25%/hour | Battery monitor |
| 4-hour session | > 0% remaining | Continuous play |
| No thermal throttle | Pass/Fail | Feel device temp |
| No FPS degradation | Stable over 4h | Periodic check |

**Pass Condition**: Battery > 0% after 4 hours

---

## Phase 3 Testing (Jul-Sep 2026)

### Test 3.1: Audio/Haptics (Month 1)
**Device**: Pixel 8a

| Criteria | Target | Method |
|----------|--------|--------|
| Audio latency | < 100ms | Feel test |
| Haptic response | Immediate | Feel test |
| No audio clipping | Pass/Fail | Listen test |
| Volume levels balanced | Pass/Fail | Listen test |

### Test 3.2: Visual Polish (Month 2)
**Device**: Pixel 8a

| Criteria | Target | Method |
|----------|--------|--------|
| Particles don't lag | ≥ 55 FPS | DevTools during effects |
| Weather doesn't lag | ≥ 55 FPS | DevTools during rain |
| No visual glitches | Pass/Fail | Full visual sweep |
| UI readable | Pass/Fail | All text visible |

### Test 3.3: Extended Foldable (Month 3)
**Device**: OnePlus Open

| Criteria | Target | Method |
|----------|--------|--------|
| 2-hour unfolded session | No issues | Continuous play |
| Fold during combat | No crash | Test 10x |
| Fold during load | No crash | Test 10x |
| Audio continues | Pass/Fail | Check during fold |

---

## Phase 4 Testing (Oct-Dec 2026)

### Test 4.1: Release Build (Month 1)
**Device**: Both

| Criteria | Target | Method |
|----------|--------|--------|
| Install from store | Pass/Fail | Test flow |
| All Phase 1-3 criteria | Pass | Re-run key tests |
| Offline mode works | Pass/Fail | Airplane mode test |
| PWA install works | Pass/Fail | Desktop Chrome test |

### Test 4.2: External Tester Feedback
**Devices**: Various (tester-owned)

| Criteria | Target | Method |
|----------|--------|--------|
| 10+ testers complete | Pass/Fail | Survey |
| Critical bugs | 0 | Bug tracker |
| Major bugs | < 5 | Bug tracker |
| Average rating | ≥ 4/5 | Survey |

---

## Testing Protocol

### Before Each Test
1. Clear app data/cache
2. Restart device
3. Charge to 100% (for battery tests)
4. Close all other apps
5. Disable battery saver

### During Test
1. Record video for visual tests
2. Screenshot any issues
3. Note exact reproduction steps for bugs
4. Log timestamps for timing tests

### After Test
1. Document results in test log
2. File bugs in tracker
3. Update pass/fail status
4. Notify team of blockers

---

## Bug Severity Definitions

| Severity | Definition | Example |
|----------|------------|---------|
| Critical | Game unplayable | Crash on boot |
| Major | Feature broken | Combat doesn't work |
| Minor | Visual/audio issue | Wrong sound effect |
| Trivial | Polish issue | Animation timing off |

## Gate Requirements

| Phase | Must Pass | May Skip |
|-------|-----------|----------|
| 1 | All tests | None |
| 2 | 2.1, 2.2, 2.3 | Minor audio issues |
| 3 | All tests | Trivial polish |
| 4 | 4.1 | External tester feedback (inform only) |

---

## Test Device Setup

### Pixel 8a Configuration

```text
- Android 14+
- Developer options: ON
- USB debugging: ON
- Show touches: ON (for recording)
- Show FPS: ON
- Profile GPU rendering: Bars
```

### OnePlus Open Configuration

```text
- Same as Pixel 8a
- Fold animation speed: Default
- Inner/outer screen: Both tested
```

---

*No shortcuts. Real devices. Real testing.*
