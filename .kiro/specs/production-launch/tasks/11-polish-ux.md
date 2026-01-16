# 11. Polish & User Experience

**Parent:** [tasks.md](../tasks.md)
**Validates:** Requirements 22

## Overview
Implements final polish, animations, visual effects, tutorials, and accessibility features for production-ready UX.

## Prerequisites
- All core systems complete
- UI components functional
- Audio system operational

## Tasks

### 11.1. Visual Effects & Particles

**Validates:** Requirement 22.1

- [ ] 11.1.1. Create particle system
  - Hit sparks on combat impact
  - Dust clouds on landing
  - Energy trails for abilities
  - _File: `packages/game/src/systems/ParticleSystem.ts`_
  - _Validates: Requirements 22.1_

- [ ] 11.1.2. Implement screen shake effects
  - Camera shake on heavy hits
  - Configurable intensity and duration
  - Disable option in settings
  - _File: `packages/game/src/systems/ScreenShake.ts`_

- [ ] 11.1.3. Add post-processing effects
  - Bloom for neon lights
  - Chromatic aberration on damage
  - Vignette for dramatic moments
  - _File: `packages/game/src/systems/PostProcessing.ts`_

- [ ]* 11.1.4. Write property test for particle limits
  - **Property 53: Particle budget**
  - **Validates: Requirements 22.1**
  - For any scene, active particles should not exceed budget (1000)
  - Particle system should maintain 60 FPS

### 11.2. Animation Polish

**Validates:** Requirement 22.2

- [ ] 11.2.1. Implement animation blending
  - Smooth transitions between animations
  - Blend idle to run to jump
  - Support animation layers (upper/lower body)
  - _File: `packages/game/src/systems/AnimationBlending.ts`_
  - _Validates: Requirements 22.2_

- [ ] 11.2.2. Add procedural animation
  - Head look-at for characters
  - Foot IK for terrain adaptation
  - Breathing idle animation
  - _File: `packages/game/src/systems/ProceduralAnimation.ts`_

- [ ] 11.2.3. Create hit reactions
  - Stagger animation on hit
  - Knockback physics
  - Death animations with ragdoll
  - _File: `packages/game/src/systems/HitReactions.ts`_

### 11.3. UI Animations & Transitions

**Validates:** Requirement 22.3

- [ ] 11.3.1. Implement menu transitions
  - Slide animations for menu panels
  - Fade transitions for overlays
  - Bounce effects for buttons
  - _File: `packages/game/src/components/react/ui/MenuTransitions.tsx`_
  - _Validates: Requirements 22.3_

- [ ] 11.3.2. Add loading animations
  - Animated loading spinner
  - Progress bar for asset loading
  - Skeleton screens for content
  - _File: `packages/game/src/components/react/ui/LoadingAnimations.tsx`_

- [ ] 11.3.3. Create notification system
  - Toast notifications for events
  - Achievement popups
  - Quest update banners
  - _File: `packages/game/src/components/react/ui/NotificationSystem.tsx`_

### 11.4. Tutorial System

**Validates:** Requirement 22.4

- [ ] 11.4.1. Create tutorial overlay system
  - Highlight UI elements
  - Display instructional text
  - Wait for player action before continuing
  - _File: `packages/game/src/systems/TutorialSystem.ts`_
  - _Validates: Requirements 22.4_

- [ ] 11.4.2. Implement tutorial sequence
  - Movement tutorial (WASD/joystick)
  - Combat tutorial (attack, dodge, abilities)
  - UI tutorial (menus, quest log)
  - _File: `packages/game/src/data/tutorial-sequence.json`_

- [ ] 11.4.3. Add contextual hints
  - Show hints on first encounter with mechanic
  - Dismissible hint popups
  - Option to replay tutorials
  - _File: `packages/game/src/systems/ContextualHints.ts`_

- [ ]* 11.4.4. Write property test for tutorial progression
  - **Property 54: Tutorial completeness**
  - **Validates: Requirements 22.4**
  - For any tutorial sequence, all steps should be reachable
  - Tutorial should not block game progression

### 11.5. Accessibility Features

**Validates:** Requirement 22.5

- [ ] 11.5.1. Implement colorblind modes
  - Deuteranopia (red-green)
  - Protanopia (red-green)
  - Tritanopia (blue-yellow)
  - _File: `packages/game/src/systems/ColorblindMode.ts`_
  - _Validates: Requirements 22.5_

- [ ] 11.5.2. Add text scaling options
  - Small, medium, large, extra-large
  - Apply to all UI text
  - Maintain layout integrity
  - _File: `packages/game/src/systems/TextScaling.ts`_

- [ ] 11.5.3. Create high contrast mode
  - Increase UI contrast
  - Bold outlines on characters
  - Clear visual separation
  - _File: `packages/game/src/systems/HighContrastMode.ts`_

- [ ] 11.5.4. Implement screen reader support
  - ARIA labels on UI elements
  - Announce important events
  - Keyboard navigation for menus
  - _File: `packages/game/src/systems/ScreenReaderSupport.ts`_

### 11.6. Performance Profiling

**Validates:** Requirement 22.6

- [ ] 11.6.1. Create performance monitor
  - Display FPS counter
  - Show memory usage
  - Track frame time breakdown
  - _File: `packages/game/src/systems/PerformanceMonitor.ts`_
  - _Validates: Requirements 22.6_

- [ ] 11.6.2. Implement performance profiler
  - Profile system execution times
  - Identify bottlenecks
  - Log performance warnings
  - _File: `packages/game/src/systems/PerformanceProfiler.ts`_

- [ ] 11.6.3. Add quality presets
  - Low, medium, high, ultra settings
  - Auto-detect device capability
  - Allow manual override
  - _File: `packages/game/src/systems/QualityPresets.ts`_

- [ ]* 11.6.4. Write property test for performance targets
  - **Property 55: Frame rate consistency**
  - **Validates: Requirements 22.6**
  - For any quality preset, frame rate should meet target (60 FPS)
  - No sustained frame drops below target

### 11.7. Error Handling & Recovery

**Validates:** Requirement 22.7

- [ ] 11.7.1. Implement global error handler
  - Catch unhandled errors
  - Display user-friendly error messages
  - Log errors for debugging
  - _File: `packages/game/src/systems/ErrorHandler.ts`_
  - _Validates: Requirements 22.7_

- [ ] 11.7.2. Create error recovery system
  - Auto-save before crashes
  - Offer to reload last save
  - Report errors to analytics
  - _File: `packages/game/src/systems/ErrorRecovery.ts`_

- [ ] 11.7.3. Add network error handling
  - Retry failed API calls
  - Offline mode fallbacks
  - User notifications for network issues
  - _File: `packages/game/src/systems/NetworkErrorHandler.ts`_

### 11.8. Final Polish Pass

**Validates:** Requirement 22.8

- [ ] 11.8.1. Optimize asset loading
  - Preload critical assets
  - Lazy load non-critical assets
  - Show loading progress
  - _File: `packages/game/src/systems/AssetPreloader.ts`_
  - _Validates: Requirements 22.8_

- [ ] 11.8.2. Add juice to interactions
  - Button press animations
  - Satisfying sound feedback
  - Visual confirmation of actions
  - _File: `packages/game/src/systems/InteractionJuice.ts`_

- [ ] 11.8.3. Implement achievement system
  - Track player achievements
  - Display achievement notifications
  - Persist to save file
  - _File: `packages/game/src/systems/AchievementSystem.ts`_

- [ ] 11.8.4. Create credits sequence
  - Scrolling credits with music
  - Thank contributors
  - Display game stats
  - _File: `packages/game/src/components/react/ui/CreditsSequence.tsx`_

## Verification

After completing this section:
- [ ] Visual effects enhance combat feel
- [ ] Animations blend smoothly
- [ ] UI transitions are polished
- [ ] Tutorial guides new players
- [ ] Accessibility features work
- [ ] Performance meets targets
- [ ] Error handling prevents crashes
- [ ] All polish elements implemented
- [ ] All property tests pass (100+ iterations each)
- [ ] TypeScript compiles without errors
- [ ] Linting passes (`pnpm check`)
- [ ] Game feels production-ready

## Common Commands

```bash
# Development with performance monitor
pnpm --filter @neo-tokyo/game dev --profile

# Test polish systems
pnpm --filter @neo-tokyo/game test ParticleSystem
pnpm --filter @neo-tokyo/game test TutorialSystem
pnpm --filter @neo-tokyo/game test PerformanceMonitor

# Profile performance
pnpm --filter @neo-tokyo/game profile

# Lint
pnpm check
```
