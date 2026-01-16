# Polish Rules

> **Purpose**: Define audio, visual, and UI polish standards for production quality.

## Audio System

### Philosophy
- Production quality sound enhances immersion
- Mobile-conscious (battery, concurrent sounds)
- Haptic-synced for tactile feedback
- District-themed for world building

### Audio Layers

#### Ambient Loops (District-Tied)

| District Theme | Audio Description | Volume |
|----------------|-------------------|--------|
| Neon | Buzzing crowds, billboard hum, synth pulses | 0.4 |
| Corporate | Low machinery hum, distant announcements | 0.3 |
| Slum | Muffled rain, vine rustle, echoes | 0.35 |
| Industrial | Heavy clanging, sparking electricity | 0.4 |
| Transition | Wind, distant city sounds | 0.3 |

**Behavior**:
- Load on district enter
- Fade in over 1s
- Fade out on leave
- Only one ambient active at a time

#### SFX Library

| Category | Sound | Haptic Pairing |
|----------|-------|----------------|
| **Combat** | | |
| Hit | Ignition burst crackle | Medium |
| Crit | Explosive whoosh | Heavy |
| Block | Structure shield clang | Medium |
| Evade | Flow wind rush | Light |
| **Parkour** | | |
| Jump | Light whoosh | Light |
| Wall-run | Scraping slide | Light |
| Land | Thud (Flow-softened) | Medium |
| **Quest** | | |
| Accept | Faction chime | Light |
| Complete | XP fanfare | Medium |
| Secret | Mystery reveal tone | Medium |
| **Alignment** | | |
| Kurenai shift | Fire roar/crackle | Medium |
| Azure shift | Ice crack | Medium |
| Major shift | Faction anthem swell | Heavy |
| **UI** | | |
| Button tap | Soft click | Light |
| Menu open | Neon hum | None |

#### Music Tracks

| Track | Trigger | Loop |
|-------|---------|------|
| Exploration | Default in districts | Yes |
| Combat Normal | Enemy encounter | Yes |
| Combat Boss | Boss fight start | Yes |
| Rivalry Kurenai | Vera scene (passion) | No |
| Rivalry Azure | Vera scene (logic) | No |
| Victory | Combat win | No |
| Ending | Credits/epilogue | No |

### Audio Implementation

```typescript
import { Howl } from 'howler';

class AudioManager {
  private ambients: Map<string, Howl> = new Map();
  private sfx: Map<string, Howl> = new Map();
  private currentAmbient?: Howl;
  private masterVolume = 0.8;

  preloadAmbient(id: string, url: string) {
    this.ambients.set(id, new Howl({ src: [url], loop: true, volume: 0 }));
  }

  preloadSFX(id: string, url: string) {
    this.sfx.set(id, new Howl({ src: [url], volume: this.masterVolume }));
  }

  playAmbient(id: string, targetVolume = 0.4) {
    if (this.currentAmbient) {
      this.currentAmbient.fade(this.currentAmbient.volume(), 0, 1000);
    }
    const ambient = this.ambients.get(id);
    if (ambient) {
      ambient.play();
      ambient.fade(0, targetVolume, 1000);
      this.currentAmbient = ambient;
    }
  }

  playSFX(id: string, haptic?: 'light' | 'medium' | 'heavy') {
    const sound = this.sfx.get(id);
    if (sound) sound.play();
    if (haptic) triggerHaptic(haptic);
  }
}
```

### Mobile Audio Rules

- **Max Concurrent**: 4-6 sounds
- **Volume Cap**: 0.6 on mobile (battery)
- **Spatial**: Near-player only
- **Background**: Auto-pause on app background

---

## Haptics System

### Intensity Levels

| Level | Duration | Use Cases |
|-------|----------|-----------|
| Light | 20ms | Movement, UI tap, quest accept |
| Medium | 50ms | Hit, parkour land, minor alignment shift |
| Heavy | 100ms | Crit, boss phase, level-up, major alignment shift |

### Implementation

```typescript
import { Haptics, ImpactStyle } from '@capacitor/haptics';

const hapticMap = {
  light: ImpactStyle.Light,
  medium: ImpactStyle.Medium,
  heavy: ImpactStyle.Heavy,
};

const triggerHaptic = async (intensity: keyof typeof hapticMap) => {
  if (Capacitor.isNativePlatform()) {
    await Haptics.impact({ style: hapticMap[intensity] });
  }
};
```

### Haptic Events

| Event | Intensity | Notes |
|-------|-----------|-------|
| Player move (per step) | Light | Subtle |
| Enemy hit landed | Medium | Satisfying |
| Critical hit | Heavy | Impactful |
| Quest accepted | Light | Confirming |
| Quest completed | Medium | Rewarding |
| Level up | Heavy | Celebratory |
| Alignment shift (minor) | Medium | Noticeable |
| Alignment shift (major) | Heavy | Significant |
| Boss phase transition | Heavy | Dramatic |

---

## Visual Polish

### Particle Systems

| Effect | Trigger | Count | Performance |
|--------|---------|-------|-------------|
| Combat impact | On hit | 20-50 | GPU |
| Crit explosion | On crit | 50-100 | GPU |
| Alignment aura | Extreme alignment | 100 | GPU, continuous |
| District ambiance | Background | 50-200 | GPU |
| Weather (rain) | District-specific | 2000-5000 | GPU, mobile-reduced |

### Post-Processing (Mobile-Safe)

| Effect | Usage | Mobile |
|--------|-------|--------|
| Bloom | Neon glow | Reduced intensity |
| Fog | District depth | Yes |
| Vignette | Combat focus | Optional |
| SSAO | Depth | Disabled on mobile |
| Motion blur | Speed | Disabled |

### Animation Polish

| Animation | Easing | Duration |
|-----------|--------|----------|
| Menu open | Ease-out | 0.2s |
| Menu close | Ease-in | 0.15s |
| Quest notification | Bounce | 0.3s |
| Damage number | Float up + fade | 1s |
| Level up text | Scale + glow | 1.5s |

---

## UI Polish

### Responsive Layouts

#### Phone Mode (< 768px)

```text
┌─────────────────┐
│   Alignment     │ ← Top center
├─────────────────┤
│                 │
│     Scene       │
│                 │
├────────┬────────┤
│Joystick│Actions │ ← Bottom split
└────────┴────────┘
```

#### Tablet Mode (>= 768px)

```text
┌───────────────────────────────┐
│  Stats  │ Alignment │ Quests │ ← Top bar
├─────────┼───────────┼────────┤
│         │           │        │
│         │   Scene   │ Quest  │
│         │           │ Log    │
├─────────┼───────────┼────────┤
│Joystick │  Actions  │ Mini   │ ← Bottom bar
│         │           │ Map    │
└─────────┴───────────┴────────┘
```

### Touch Targets

| Element | Minimum Size | Spacing |
|---------|--------------|---------|
| Buttons | 48x48px | 8px |
| Icons | 44x44px | 8px |
| List items | 48px height | 4px |
| Joystick | 120px diameter | N/A |

### Animation Standards

```css
/* UI transitions */
.ui-element {
  transition: opacity 0.2s ease-out,
              transform 0.2s ease-out;
}

/* Quest notification */
@keyframes quest-pop {
  0% { transform: scale(0.8); opacity: 0; }
  50% { transform: scale(1.1); }
  100% { transform: scale(1); opacity: 1; }
}

/* Damage numbers */
@keyframes damage-float {
  0% { transform: translateY(0); opacity: 1; }
  100% { transform: translateY(-50px); opacity: 0; }
}
```

### Color System

| Purpose | Color | Hex |
|---------|-------|-----|
| Kurenai accent | Crimson | #ff0044 |
| Azure accent | Cobalt | #0066ff |
| Neon magenta | Magenta | #ff00ff |
| Neon cyan | Cyan | #00ffff |
| Background dark | Deep blue | #0a0a1a |
| Text primary | White | #ffffff |
| Text secondary | Gray | #888888 |
| Success | Green | #00ff66 |
| Warning | Orange | #ff9900 |
| Error | Red | #ff3333 |

---

## Quality Checklist

### Before Ship

- [ ] All SFX play without delay
- [ ] Haptics trigger on all combat events
- [ ] Ambient loops seamlessly transition
- [ ] UI animations are smooth (60 FPS)
- [ ] Touch targets meet minimum size
- [ ] Colors meet contrast requirements
- [ ] Particles don't tank performance
- [ ] Music crossfades properly

### Per Build

- [ ] No audio clipping
- [ ] No visual glitches
- [ ] No UI elements off-screen on mobile
- [ ] Foldable transitions work
- [ ] Haptics work on test device

---

*Polish is the difference between good and great. Every detail matters.*
