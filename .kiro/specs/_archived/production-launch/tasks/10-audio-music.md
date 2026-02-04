# 10. Audio & Music Systems

**Parent:** [tasks.md](../tasks.md)
**Validates:** Requirements 21

## Overview
Implements comprehensive audio system with procedural music generation, sound effects, and spatial audio.

## Prerequisites
- BabylonJS audio system available
- Stage system operational
- Combat system functional

## Tasks

### 10.1. Audio Engine Setup

**Validates:** Requirement 21.1

- [ ] 10.1.1. Configure BabylonJS audio engine
  - Initialize audio context
  - Set up audio listener (camera)
  - Configure master volume controls
  - _File: `packages/game/src/systems/AudioEngine.ts`_
  - _Validates: Requirements 21.1_

- [ ] 10.1.2. Create audio asset loader
  - Load audio files asynchronously
  - Support multiple formats (MP3, OGG, WAV)
  - Cache loaded audio
  - _File: `packages/game/src/systems/AudioLoader.ts`_

- [ ]* 10.1.3. Write property test for audio loading
  - **Property 47: Audio asset validity**
  - **Validates: Requirements 21.1**
  - For any audio file path, loader should return valid audio or error
  - No silent failures

### 10.2. Sound Effect System

**Validates:** Requirement 21.2

- [ ] 10.2.1. Implement sound effect manager
  - Play one-shot sounds (hit, jump, UI click)
  - Support volume and pitch variation
  - Limit concurrent sounds (max 32)
  - _File: `packages/game/src/systems/SoundEffectManager.ts`_
  - _Validates: Requirements 21.2_

- [ ] 10.2.2. Create combat sound effects
  - Hit sounds (light, heavy, critical)
  - Block/parry sounds
  - Ability activation sounds
  - _Directory: `packages/game/public/audio/sfx/combat/`_

- [ ] 10.2.3. Create UI sound effects
  - Menu navigation sounds
  - Button clicks
  - Quest notifications
  - _Directory: `packages/game/public/audio/sfx/ui/`_

- [ ]* 10.2.4. Write property test for sound playback
  - **Property 48: Sound concurrency limits**
  - **Validates: Requirements 21.2**
  - For any number of sound requests, active sounds should never exceed limit
  - Oldest sounds should be culled when limit reached

### 10.3. Spatial Audio

**Validates:** Requirement 21.3

- [ ] 10.3.1. Implement 3D positional audio
  - Attach sounds to 3D positions
  - Calculate distance attenuation
  - Support stereo panning
  - _File: `packages/game/src/systems/SpatialAudio.ts`_
  - _Validates: Requirements 21.3_

- [ ] 10.3.2. Create ambient sound system
  - Loop ambient sounds per stage
  - Crossfade between ambiences
  - Support multiple layers
  - _File: `packages/game/src/systems/AmbientAudio.ts`_

- [ ]* 10.3.3. Write property test for spatial audio
  - **Property 49: Distance attenuation**
  - **Validates: Requirements 21.3**
  - For any sound source, volume should decrease with distance
  - Sounds beyond max distance should be inaudible

### 10.4. Music System

**Validates:** Requirement 21.4

- [ ] 10.4.1. Create music player
  - Play background music tracks
  - Support looping and crossfading
  - Separate volume control from SFX
  - _File: `packages/game/src/systems/MusicPlayer.ts`_
  - _Validates: Requirements 21.4_

- [ ] 10.4.2. Implement dynamic music system
  - Switch tracks based on game state (exploration, combat, boss)
  - Smooth transitions between tracks
  - Support intensity layers (add layers during combat)
  - _File: `packages/game/src/systems/DynamicMusic.ts`_

- [ ] 10.4.3. Create music track library
  - Exploration theme (calm, ambient)
  - Combat theme (intense, driving)
  - Boss theme (epic, dramatic)
  - Victory theme (triumphant)
  - _Directory: `packages/game/public/audio/music/`_

### 10.5. Procedural Music Generation

**Validates:** Requirement 21.5

- [ ] 10.5.1. Implement music synthesis system
  - Use Web Audio API for synthesis
  - Generate simple melodies and harmonies
  - Support multiple instruments (synth, bass, drums)
  - _File: `packages/content-gen/src/MusicSynth.ts`_
  - _Validates: Requirements 21.5_

- [ ] 10.5.2. Create music generation pipeline
  - Define music parameters (tempo, key, mood)
  - Generate chord progressions
  - Create melodic patterns
  - _File: `packages/content-gen/src/pipelines/music-generation.ts`_

- [ ] 10.5.3. Integrate Gemini for music composition
  - Generate MIDI-like sequences via API
  - Convert to Web Audio synthesis
  - Cache generated tracks
  - _File: `packages/content-gen/src/systems/AIComposer.ts`_

- [ ]* 10.5.4. Write property test for music generation
  - **Property 50: Music coherence**
  - **Validates: Requirements 21.5**
  - For any generated track, notes should be in specified key
  - Tempo should remain consistent

### 10.6. Audio Settings & Mixing

**Validates:** Requirement 21.6

- [ ] 10.6.1. Create audio settings UI
  - Master volume slider
  - Music volume slider
  - SFX volume slider
  - Mute toggle
  - _File: `packages/game/src/components/react/ui/AudioSettings.tsx`_
  - _Validates: Requirements 21.6_

- [ ] 10.6.2. Implement audio mixer
  - Mix multiple audio sources
  - Apply volume curves
  - Support ducking (lower music during dialogue)
  - _File: `packages/game/src/systems/AudioMixer.ts`_

- [ ]* 10.6.3. Write property test for volume controls
  - **Property 51: Volume clamping**
  - **Validates: Requirements 21.6**
  - For any volume setting, value should stay in [0, 1]
  - Mute should set effective volume to 0

### 10.7. Mobile Audio Optimization

**Validates:** Requirement 21.7

- [ ] 10.7.1. Implement audio compression
  - Use compressed formats (OGG, AAC)
  - Reduce bitrate for mobile (128kbps)
  - Lazy load audio assets
  - _File: `packages/game/scripts/compress-audio.ts`_
  - _Validates: Requirements 21.7_

- [ ] 10.7.2. Handle mobile audio restrictions
  - Unlock audio on first user interaction (iOS requirement)
  - Resume audio context on app foreground
  - Pause audio on app background
  - _File: `packages/game/src/systems/MobileAudio.ts`_

- [ ]* 10.7.3. Write property test for mobile audio
  - **Property 52: Audio unlock reliability**
  - **Validates: Requirements 21.7**
  - For any user interaction, audio context should unlock
  - Audio should resume after app backgrounding

## Verification

After completing this section:
- [ ] Audio engine initializes correctly
- [ ] Sound effects play on cue
- [ ] Spatial audio positions correctly
- [ ] Music tracks loop and crossfade
- [ ] Procedural music generates coherently
- [ ] Volume controls work properly
- [ ] Audio works on mobile devices
- [ ] All property tests pass (100+ iterations each)
- [ ] TypeScript compiles without errors
- [ ] Linting passes (`pnpm check`)
- [ ] Audio doesn't cause performance issues

## Common Commands

```bash
# Development
pnpm --filter @neo-tokyo/game dev

# Test audio systems
pnpm --filter @neo-tokyo/game test AudioEngine
pnpm --filter @neo-tokyo/game test SpatialAudio
pnpm --filter @neo-tokyo/game test MusicPlayer

# Generate music
pnpm --filter @neo-tokyo/content-gen generate:music --mood combat --duration 120

# Compress audio
pnpm --filter @neo-tokyo/game compress:audio

# Lint
pnpm check
```
