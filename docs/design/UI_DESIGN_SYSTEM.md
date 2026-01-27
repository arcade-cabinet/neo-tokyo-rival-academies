# Neo-Tokyo: Rival Academies - UI Design System

**Version**: 2.0
**Status**: Active Development
**Last Updated**: 2026-01-26
**Platform**: Ionic Angular + Babylon.js (HUD overlays)

---

## Design Philosophy

### JRPG Aesthetic, Not Cyberpunk UI

The current UI uses harsh cyberpunk styling (cyan glows, red accents) that **jars against** the JRPG experience. We need to transition to a cohesive visual language that:

- **Complements** the cel-shaded 3D aesthetic
- **Integrates** with faction identity (Kurenai vs Azure)
- **Respects** classic JRPG UI conventions (Persona, Fire Emblem, Final Fantasy)
- **Maintains** readability and accessibility

### Design Pillars

1. **Elegance Over Edge**: Clean lines, not jagged cyberpunk
2. **Faction Identity**: UI elements reflect player's academy
3. **Visual Novel Roots**: Dialogue boxes, character portraits, transitions
4. **Touch-First**: 48dp minimum touch targets, clear feedback

---

## Color Palette

### Faction Colors

| Faction | Primary | Secondary | Accent | Use Case |
|---------|---------|-----------|--------|----------|
| **Kurenai** | `#B22222` (Firebrick) | `#1A1A1A` (Charcoal) | `#FFD700` (Gold) | Player UI, Kai elements |
| **Azure** | `#1E90FF` (DodgerBlue) | `#0A0A14` (Deep Navy) | `#C0C0C0` (Silver) | Rival UI, Vera elements |

### Neutral Palette

| Name | Hex | Use |
|------|-----|-----|
| **Background Dark** | `#0D0D12` | Panel backgrounds |
| **Background Mid** | `#1A1A24` | Secondary panels |
| **Text Primary** | `#F5F5F5` | Main text |
| **Text Secondary** | `#A0A0A0` | Labels, hints |
| **Text Accent** | `#FFD700` | Highlights, numbers |
| **Border Default** | `#333340` | Panel borders |
| **Border Active** | `#FFFFFF` | Focus states |

### Semantic Colors

| Name | Hex | Use |
|------|-----|-----|
| **Health** | `#E53935` | HP bars, damage |
| **Experience** | `#FFD54F` | XP bars, level-ups |
| **Mana/Logic** | `#42A5F5` | Skill resources |
| **Success** | `#66BB6A` | Healing, buffs |
| **Warning** | `#FFA726` | Low resource alerts |
| **Critical** | `#FF1744` | Critical hits, danger |

---

## Typography

### Font Stack

```css
/* Primary UI Font */
--font-ui: 'M PLUS 1', 'Noto Sans JP', system-ui, sans-serif;

/* Display/Title Font */
--font-display: 'Zen Kaku Gothic New', 'M PLUS 1', sans-serif;

/* Monospace (Stats, Numbers) */
--font-mono: 'JetBrains Mono', 'Fira Code', monospace;
```

### Type Scale

| Level | Size | Weight | Use |
|-------|------|--------|-----|
| **Display 1** | 48px | 900 | Title screens |
| **Display 2** | 32px | 700 | Section headers |
| **Heading 1** | 24px | 600 | Panel titles |
| **Heading 2** | 18px | 600 | Subsection titles |
| **Body Large** | 16px | 400 | Dialogue text |
| **Body** | 14px | 400 | General UI text |
| **Caption** | 12px | 400 | Labels, hints |
| **Overline** | 10px | 700 | Category labels |

### Implementation

```css
:root {
  --text-display-1: 900 48px/1.1 var(--font-display);
  --text-display-2: 700 32px/1.2 var(--font-display);
  --text-h1: 600 24px/1.3 var(--font-ui);
  --text-h2: 600 18px/1.3 var(--font-ui);
  --text-body-lg: 400 16px/1.5 var(--font-ui);
  --text-body: 400 14px/1.5 var(--font-ui);
  --text-caption: 400 12px/1.4 var(--font-ui);
  --text-overline: 700 10px/1.2 var(--font-ui);
}
```

---

## Spacing System

### Base Unit

**8px** base unit for all spacing

| Token | Value | Use |
|-------|-------|-----|
| `--space-1` | 4px | Icon padding |
| `--space-2` | 8px | Element gaps |
| `--space-3` | 12px | Small padding |
| `--space-4` | 16px | Default padding |
| `--space-5` | 24px | Section gaps |
| `--space-6` | 32px | Panel gaps |
| `--space-8` | 48px | Major sections |

### Touch Targets

- **Minimum**: 48×48dp for all interactive elements
- **Recommended**: 56×56dp for primary actions
- **D-Pad buttons**: 56×56dp minimum

---

## Component Library

### Panel

Base container for UI elements.

```css
.panel {
  background: linear-gradient(135deg, var(--bg-dark) 0%, var(--bg-mid) 100%);
  border: 1px solid var(--border-default);
  border-radius: 8px;
  padding: var(--space-4);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}

.panel--kurenai {
  border-left: 4px solid var(--kurenai-primary);
}

.panel--azure {
  border-left: 4px solid var(--azure-primary);
}
```

### Status Bar

HP, XP, and resource bars.

```css
.status-bar {
  height: 12px;
  background: var(--bg-dark);
  border: 1px solid var(--border-default);
  border-radius: 2px;
  overflow: hidden;
}

.status-bar__fill {
  height: 100%;
  transition: width 0.3s ease-out;
}

.status-bar__fill--hp { background: linear-gradient(90deg, #E53935, #FF5252); }
.status-bar__fill--xp { background: linear-gradient(90deg, #FFD54F, #FFEE58); }
.status-bar__fill--mp { background: linear-gradient(90deg, #42A5F5, #64B5F6); }
```

### Button

Action buttons with faction theming.

```css
.button {
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 48px;
  min-height: 48px;
  padding: var(--space-3) var(--space-4);
  font: var(--text-body);
  font-weight: 600;
  border-radius: 8px;
  border: 2px solid transparent;
  transition: all 0.15s ease;
}

.button--primary {
  background: var(--kurenai-primary);
  color: white;
}

.button--primary:active {
  transform: scale(0.95);
  background: #8B0000;
}

.button--ghost {
  background: transparent;
  border-color: var(--border-default);
  color: var(--text-primary);
}
```

### Dialogue Box

Visual novel-style dialogue container.

```css
.dialogue-box {
  position: fixed;
  bottom: var(--space-5);
  left: 50%;
  transform: translateX(-50%);
  width: min(90%, 800px);
  min-height: 140px;
  background: linear-gradient(to bottom, rgba(13, 13, 18, 0.95), rgba(13, 13, 18, 0.98));
  border: 2px solid var(--border-default);
  border-radius: 12px;
  padding: var(--space-4);
}

.dialogue-box__speaker {
  font: var(--text-h2);
  color: var(--kurenai-accent); /* or azure-accent for Vera */
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--space-2);
}

.dialogue-box__text {
  font: var(--text-body-lg);
  color: var(--text-primary);
  line-height: 1.6;
}
```

### Portrait Frame

Character portrait with faction border.

```css
.portrait {
  width: 80px;
  height: 80px;
  border: 3px solid var(--kurenai-primary);
  border-radius: 4px;
  overflow: hidden;
  background: var(--bg-dark);
}

.portrait--azure {
  border-color: var(--azure-primary);
}
```

---

## Layout Patterns

### HUD Layout

```
┌─────────────────────────────────────────────────────────┐
│ [Portrait][HP/XP Bars]              [Minimap 200×150]   │
│                                                         │
│                                     [Quest Tracker]     │
│                                                         │
│                    (Game Scene)                         │
│                                                         │
│                                                         │
│ [D-Pad Controls]              [Action Buttons (A)(B)]   │
└─────────────────────────────────────────────────────────┘
```

### Dialogue Layout

```
┌─────────────────────────────────────────────────────────┐
│                                                         │
│              (Game Scene - dimmed)                      │
│                                                         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [Portrait]  SPEAKER NAME                            │ │
│ │             Dialogue text flows here with proper    │ │
│ │             line height and readable typography.    │ │
│ │                                           [▼ Next]  │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## Animation Principles

### Timing

| Type | Duration | Easing |
|------|----------|--------|
| **Micro** | 100-150ms | ease-out |
| **Standard** | 200-300ms | ease-in-out |
| **Emphasis** | 400-500ms | cubic-bezier(0.34, 1.56, 0.64, 1) |

### Transitions

- **Button Press**: Scale 0.95, 100ms
- **Panel Open**: Fade + slide up, 200ms
- **Dialogue Appear**: Fade + scale 0.95→1, 300ms
- **HP Bar Change**: Width transition, 300ms ease-out

### Combat Feedback

- **Damage Number**: Float up + fade, 800ms
- **Critical Hit**: Scale pulse + color flash
- **Level Up**: Particle burst + UI glow

---

## Accessibility

### Contrast Requirements

- **Text on dark**: Minimum 4.5:1 ratio
- **Interactive elements**: Minimum 3:1 against background
- **Focus indicators**: 3px outline, high contrast color

### Motion Sensitivity

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Touch Accessibility

- All interactive elements ≥48dp
- Clear visual feedback on touch
- No hover-only interactions

---

## Implementation Status

### Current (Needs Update)
- `JRPG_HUD.module.css` - Uses old cyberpunk styling
- `GameHUD.tsx` - Missing faction theming
- Controls - Jarring against game aesthetic

### Target
- [ ] Implement CSS custom properties
- [ ] Add faction-aware theming
- [ ] Update dialogue box styling
- [ ] Redesign touch controls
- [ ] Add proper typography

---

## File Structure

```
packages/game/src/
├── styles/
│   ├── design-tokens.css    # CSS custom properties
│   ├── typography.css       # Type scale, fonts
│   ├── components/          # Component CSS modules
│   │   ├── panel.module.css
│   │   ├── button.module.css
│   │   ├── dialogue.module.css
│   │   └── status-bar.module.css
│   └── themes/
│       ├── kurenai.css      # Crimson academy theme
│       └── azure.css        # Blue academy theme
└── components/react/ui/
    ├── Panel.tsx
    ├── Button.tsx
    ├── StatusBar.tsx
    ├── DialogueBox.tsx
    └── Portrait.tsx
```

---

Last Updated: 2026-01-16
