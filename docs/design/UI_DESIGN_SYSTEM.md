# Neo-Tokyo: Rival Academies - UI Design System

**Version**: 2.1
**Status**: Active
**Last Updated**: 2026-01-27
**Platform**: Ionic Angular + Babylon.js (HUD overlays)

---

## Design Philosophy

### JRPG Aesthetic, Not Cyberpunk UI

The UI must complement the cel-shaded, weathered world. Avoid neon glow and cyberpunk chrome.

**Pillars**
1. **Elegance Over Edge**: clean lines, minimal glow.
2. **Faction Identity**: Kurenai vs Azure themes are readable at a glance.
3. **Visual Novel Roots**: dialogue boxes and portraits feel authored.
4. **Touch-First**: 48dp minimum targets, clear feedback.

---

## Color Palette

### Faction Colors

| Faction | Primary | Secondary | Accent | Use Case |
|---------|---------|-----------|--------|----------|
| **Kurenai** | `#B22222` (Firebrick) | `#1A1A1A` | `#FFD700` | Player UI, Kai |
| **Azure** | `#1E90FF` (DodgerBlue) | `#0A0A14` | `#C0C0C0` | Rival UI, Vera |

### Neutral Palette

| Name | Hex | Use |
|------|-----|-----|
| **Background Dark** | `#0D0D12` | Panel backgrounds |
| **Background Mid** | `#1A1A24` | Secondary panels |
| **Text Primary** | `#F5F5F5` | Main text |
| **Text Secondary** | `#A0A0A0` | Labels, hints |
| **Border Default** | `#333340` | Panel borders |
| **Border Active** | `#FFFFFF` | Focus states |

### Semantic Colors

| Name | Hex | Use |
|------|-----|-----|
| **Health** | `#E53935` | HP bars, damage |
| **Experience** | `#FFD54F` | XP bars, level-ups |
| **Logic** | `#42A5F5` | Skill resources |
| **Success** | `#66BB6A` | Healing, buffs |
| **Warning** | `#FFA726` | Low resource alerts |
| **Critical** | `#FF1744` | Critical hits |

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

---

## Component Patterns

### Panel

```css
.panel {
  background: linear-gradient(135deg, var(--bg-dark) 0%, var(--bg-mid) 100%);
  border: 1px solid var(--border-default);
  border-radius: 8px;
  padding: var(--space-4);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
}
```

### Dialogue Box

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
```

---

## Layout Patterns

### HUD Layout (Phone)

```
+-------------------------------+
| [Portrait][HP/XP] [Minimap]   |
|                               |
|             Scene             |
|                               |
| [D-Pad]          [Actions]    |
+-------------------------------+
```

### Dialogue Layout

```
+-------------------------------+
|            Scene              |
|                               |
| +---------------------------+ |
| | [Portrait]  SPEAKER NAME  | |
| | Dialogue text flows here. | |
| |                       [v] | |
| +---------------------------+ |
+-------------------------------+
```

---

## Animation Principles

| Type | Duration | Easing |
|------|----------|--------|
| **Micro** | 100-150ms | ease-out |
| **Standard** | 200-300ms | ease-in-out |
| **Emphasis** | 400-500ms | cubic-bezier(0.34, 1.56, 0.64, 1) |

---

## Accessibility

- Minimum 4.5:1 text contrast
- 48dp minimum touch targets
- Reduced motion support via `prefers-reduced-motion`

---

## Implementation Targets (Angular)

**Tokens**
- `src/theme/variables.scss` (Ionic color primitives)
- `src/global.scss` (custom properties, typography, spacing)

**UI Components**
- `src/app/ui/` (HUD, dialogue, menus, stat modals)
- `src/app/game-shell/` (scene container + UI layering)

---

Last Updated: 2026-01-27
