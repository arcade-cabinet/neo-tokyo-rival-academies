# 9. Mobile Optimization & Deployment

**Parent:** [tasks.md](../tasks.md)
**Validates:** Requirements 19, 20

## Overview
Optimizes game for mobile devices and deploys to iOS/Android via Capacitor with touch controls and performance tuning.

## Prerequisites
- All game systems complete
- Save system functional
- BabylonJS rendering optimized

## Tasks

### 9.1. Touch Control System

**Validates:** Requirement 19.1

- [ ] 9.1.1. Implement virtual joystick
  - On-screen joystick for movement
  - Configurable position and size
  - Visual feedback on touch
  - _File: `packages/game/src/components/react/ui/VirtualJoystick.tsx`_
  - _Validates: Requirements 19.1_

- [ ] 9.1.2. Create touch action buttons
  - Attack, jump, dodge buttons
  - Ability buttons with cooldown indicators
  - Responsive touch areas (44x44pt minimum)
  - _File: `packages/game/src/components/react/ui/TouchControls.tsx`_

- [ ] 9.1.3. Implement gesture controls
  - Swipe for dodge
  - Tap for attack
  - Long-press for abilities
  - _File: `packages/game/src/systems/GestureInput.ts`_

- [ ]* 9.1.4. Write property test for touch input
  - **Property 44: Touch responsiveness**
  - **Validates: Requirements 19.1**
  - For any touch event, input should register within 16ms (1 frame at 60fps)
  - No missed inputs during rapid tapping

### 9.2. Mobile UI Adaptation

**Validates:** Requirement 19.2

- [ ] 9.2.1. Create responsive HUD layout
  - Scale UI elements for different screen sizes
  - Support portrait and landscape orientations
  - Safe area insets for notched devices
  - _File: `packages/game/src/components/react/ui/ResponsiveHUD.tsx`_
  - _Validates: Requirements 19.2_

- [ ] 9.2.2. Implement mobile menu system
  - Full-screen menus for better touch targets
  - Simplified navigation
  - Swipe gestures for menu transitions
  - _File: `packages/game/src/components/react/ui/MobileMenu.tsx`_

- [ ] 9.2.3. Optimize dialogue UI for mobile
  - Larger text for readability
  - Touch-friendly choice buttons
  - Auto-advance option
  - _File: `packages/game/src/components/react/ui/MobileDialogue.tsx`_

### 9.3. Performance Optimization

**Validates:** Requirement 19.3

- [ ] 9.3.1. Implement LOD (Level of Detail) system
  - Multiple model quality levels
  - Switch based on distance and device capability
  - Reduce poly count for distant objects
  - _File: `packages/game/src/systems/LODSystem.ts`_
  - _Validates: Requirements 19.3_

- [ ] 9.3.2. Create texture compression pipeline
  - Use ASTC for mobile (iOS/Android)
  - Fallback to ETC2 for older devices
  - Compress textures during build
  - _File: `packages/game/scripts/compress-textures.ts`_

- [ ] 9.3.3. Implement object pooling
  - Pool frequently spawned objects (enemies, projectiles)
  - Reuse instead of create/destroy
  - Reduce garbage collection pressure
  - _File: `packages/game/src/systems/ObjectPool.ts`_

- [ ]* 9.3.4. Write property test for performance
  - **Property 45: Frame rate stability**
  - **Validates: Requirements 19.3**
  - For any gameplay scenario, frame rate should stay >= 60 FPS on Pixel 8a
  - No frame drops during combat

### 9.4. Memory Management

**Validates:** Requirement 19.4

- [ ] 9.4.1. Implement asset streaming
  - Load assets on-demand per stage
  - Unload previous stage assets
  - Preload next stage in background
  - _File: `packages/game/src/systems/AssetStreaming.ts`_
  - _Validates: Requirements 19.4_

- [ ] 9.4.2. Create memory monitoring system
  - Track memory usage in real-time
  - Trigger cleanup at thresholds
  - Log memory warnings
  - _File: `packages/game/src/systems/MemoryMonitor.ts`_

- [ ]* 9.4.3. Write property test for memory usage
  - **Property 46: Memory bounds**
  - **Validates: Requirements 19.4**
  - For any stage, memory usage should stay < 200MB on mobile
  - No memory leaks over extended play sessions

### 9.5. Capacitor Integration

**Validates:** Requirement 20.1

- [ ] 9.5.1. Configure Capacitor for iOS
  - Update `capacitor.config.ts` with iOS settings
  - Configure app icons and splash screens
  - Set up permissions (storage, network)
  - _File: `packages/game/capacitor.config.ts`_
  - _Validates: Requirements 20.1_

- [ ] 9.5.2. Configure Capacitor for Android
  - Update `capacitor.config.ts` with Android settings
  - Configure app icons and splash screens
  - Set up permissions in AndroidManifest.xml
  - _File: `android/app/src/main/AndroidManifest.xml`_

- [ ] 9.5.3. Implement native plugins
  - Haptics for combat feedback
  - Motion sensors for tilt controls (optional)
  - Screen orientation lock
  - _File: `packages/game/src/systems/NativePlugins.ts`_

### 9.6. Build & Deployment Pipeline

**Validates:** Requirement 20.2

- [ ] 9.6.1. Create production build script
  - Optimize bundle size (tree-shaking, minification)
  - Generate source maps for debugging
  - Compress assets
  - _File: `packages/game/scripts/build-production.ts`_
  - _Validates: Requirements 20.2_

- [ ] 9.6.2. Set up iOS deployment
  - Configure Xcode project
  - Set up code signing
  - Create App Store Connect listing
  - _File: `docs/IOS_DEPLOYMENT.md`_

- [ ] 9.6.3. Set up Android deployment
  - Configure Gradle build
  - Generate signed APK/AAB
  - Create Google Play Console listing
  - _File: `docs/ANDROID_DEPLOYMENT.md`_

- [ ] 9.6.4. Implement CI/CD pipeline
  - Automated builds on commit
  - Run tests before deployment
  - Deploy to TestFlight/Internal Testing
  - _File: `.github/workflows/mobile-deploy.yml`_

### 9.7. Device Testing

**Validates:** Requirement 20.3

- [ ] 9.7.1. Test on Pixel 8a (mid-range Android)
  - Verify 60 FPS performance
  - Test touch controls
  - Check memory usage
  - _Manual testing required_
  - _Validates: Requirements 20.3_

- [ ] 9.7.2. Test on OnePlus Open (foldable)
  - Test both folded and unfolded modes
  - Verify UI adapts to aspect ratio changes
  - Test app continuity on fold/unfold
  - _Manual testing required_

- [ ] 9.7.3. Test on iOS devices
  - Test on iPhone 12+ (minimum target)
  - Verify safe area insets
  - Test haptics and native features
  - _Manual testing required_

- [ ] 9.7.4. Create device testing checklist
  - Performance benchmarks per device
  - Control responsiveness tests
  - Battery usage tests
  - _File: `docs/PHYSICAL_TESTING_CHECKLIST.md`_

### 9.8. App Store Preparation

**Validates:** Requirement 20.4

- [ ] 9.8.1. Create app store assets
  - Screenshots for all required sizes
  - App icon (1024x1024)
  - Feature graphic
  - _Directory: `packages/game/public/store-assets/`_
  - _Validates: Requirements 20.4_

- [ ] 9.8.2. Write app store descriptions
  - Short description (80 chars)
  - Full description (4000 chars)
  - Keywords for ASO
  - _File: `docs/APP_STORE_COPY.md`_

- [ ] 9.8.3. Prepare privacy policy
  - Data collection disclosure
  - Third-party services (Gemini, Meshy)
  - User rights and contact info
  - _File: `docs/PRIVACY_POLICY.md`_

## Verification

After completing this section:
- [ ] Touch controls work smoothly
- [ ] UI adapts to all screen sizes
- [ ] 60 FPS maintained on Pixel 8a
- [ ] Memory usage < 200MB on mobile
- [ ] Capacitor builds for iOS/Android
- [ ] App runs on physical devices
- [ ] All property tests pass
- [ ] TypeScript compiles without errors
- [ ] Linting passes (`pnpm check`)
- [ ] Bundle size < 2MB gzipped

## Common Commands

```bash
# Build for production
pnpm --filter @neo-tokyo/game build

# Sync with Capacitor
npx cap sync

# Run on Android
npx cap run android

# Run on iOS
npx cap run ios

# Open in Android Studio
npx cap open android

# Open in Xcode
npx cap open ios

# Test performance
pnpm --filter @neo-tokyo/game test:performance

# Lint
pnpm check
```
