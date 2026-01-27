# Polish Rules

**Purpose**: Define audio, visual, and UI polish standards for production quality.

---

## Audio System

### Philosophy
- Production quality audio enhances immersion.
- Mobile-conscious (battery, concurrent sounds).
- Haptic-synced for tactile feedback.
- District-themed for world building.

### Ambient Loops (District-Tied)

| District Theme | Audio Description | Volume |
|----------------|-------------------|--------|
| Academy | Wind over tarps, distant training calls | 0.35 |
| Market | Crowds, barter chatter, dock creaks | 0.4 |
| Shrine | Soft bells, water lapping, quiet prayer | 0.3 |
| Salvage Yards | Metal clanks, cranes, chain rattles | 0.4 |
| Dockline | Water slap, rope strain, boat engines | 0.35 |
| Deep | Muffled water, distant rumbles, bubbles | 0.25 |

**Behavior**
- Load on district enter
- Fade in over 1s
- Fade out on leave
- Only one ambient active at a time

### SFX Library

| Category | Sound | Haptic Pairing |
|----------|-------|----------------|
| **Combat** | | |
| Hit | Metal/wood impact | Medium |
| Crit | Sharp burst + bass | Heavy |
| Block | Shield clang | Medium |
| Evade | Wind rush | Light |
| **Traversal** | | |
| Jump | Light whoosh | Light |
| Land | Thud (Flow-softened) | Medium |
| Bridge step | Rope creak | Light |
| **Quest** | | |
| Accept | Faction chime | Light |
| Complete | Fanfare | Medium |
| Secret | Mystery tone | Medium |
| **Alignment** | | |
| Kurenai shift | Fire crackle | Medium |
| Azure shift | Water chime | Medium |
| Major shift | Faction anthem swell | Heavy |
| **UI** | | |
| Button tap | Soft click | Light |
| Menu open | Panel sweep | None |

### Music Tracks

| Track | Trigger | Loop |
|-------|---------|------|
| Exploration | Default in districts | Yes |
| Combat Normal | Enemy encounter | Yes |
| Combat Boss | Boss fight start | Yes |
| Rivalry Kurenai | Vera scene (passion) | No |
| Rivalry Azure | Vera scene (logic) | No |
| Victory | Combat win | No |
| Ending | Credits/epilogue | No |

---

## Haptics System

| Level | Duration | Use Cases |
|-------|----------|-----------|
| Light | 20ms | Movement, UI tap, quest accept |
| Medium | 50ms | Hit, land, minor alignment shift |
| Heavy | 100ms | Crit, boss phase, level-up |

---

## Visual Polish

### Particle Systems

| Effect | Trigger | Count | Notes |
|--------|---------|-------|-------|
| Combat impact | On hit | 20-50 | GPU |
| Crit burst | On crit | 50-100 | GPU |
| Alignment aura | Extreme alignment | 60-100 | GPU |
| Weather (rain) | Storm beats | 1000-3000 | Reduce on mobile |

### Post-Processing (Mobile-Safe)

| Effect | Usage | Mobile |
|--------|-------|--------|
| Bloom | Lanterns/bonfires | Low intensity |
| Fog | Depth/atmosphere | Yes |
| Vignette | Combat focus | Optional |
| SSAO | Depth | Disabled |
| Motion blur | Speed | Disabled |

---

## UI Polish

### Responsive Layouts

#### Phone Mode (< 768px)

```text
+-----------------+
|   Alignment     |
+-----------------+
|                 |
|     Scene       |
|                 |
+--------+--------+
|Joystick|Actions |
+--------+--------+
```

#### Tablet Mode (>= 768px)

```text
+-------------------------------+
|  Stats  | Alignment | Quests  |
+---------+-----------+---------+
|         |           |         |
|         |   Scene   | Quest   |
|         |           | Log     |
+---------+-----------+---------+
|Joystick |  Actions  | MiniMap |
+---------+-----------+---------+
```

### Touch Targets

| Element | Minimum Size | Spacing |
|---------|--------------|---------|
| Buttons | 48x48px | 8px |
| Icons | 44x44px | 8px |
| List items | 48px height | 4px |
| Joystick | 120px diameter | N/A |

---

## Quality Checklist

### Before Ship
- All SFX play without delay
- Haptics trigger on all combat events
- Ambient loops transition cleanly
- UI animations are smooth (60 FPS)
- Touch targets meet minimum size
- Colors meet contrast requirements
- Particles stay within mobile budget

---

*Polish is the difference between good and great. Every detail matters.*
