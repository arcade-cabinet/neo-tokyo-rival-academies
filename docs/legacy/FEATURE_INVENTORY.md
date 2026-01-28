# Legacy Feature Inventory (Reference Only)

**Updated**: January 28, 2026  
**Purpose**: Consolidated snapshot of legacy feature scope, UI components, and asset status from the pre-Flooded/cyberpunk-era runtime. This is **reference-only** for parity assessments.

---

## Core Systems (Legacy Snapshot)

- **World Generation**: deterministic, seeded district generation (single district in v1.0).
- **Quest System**: grammar-driven quest generation with main/side/secret clusters.
- **Alignment System**: dual reputation meters + derived alignment scale.
- **Combat System**: stats-driven damage, turn-based flow in UI.
- **Progression System**: XP, leveling, stat scaling, credits economy.
- **Save/Load System**: 4 slots with metadata, export/import.

---

## UI Components (Legacy Snapshot)

- **Main Menu**: mission briefing, start, archives (locked).
- **Intro Narrative**: 5-dialogue sequence between Kai and Vera.
- **Game HUD**: quest objective panel, alignment bar, touch controls.
- **Quest Log**: active/completed tabs with rewards.
- **Quest Dialogs**: accept/completion dialogs + reward animations.
- **Alignment Bar**: gradient meter + label.
- **Combat Arena**: HP bars, target selection, combat log.
- **Inventory Screen**: grid, filters, item details, equip/use.
- **Save Slot Select**: 4 slots with timestamps.

---

## Asset Status (Legacy Snapshot)

**Main Characters**: Kai, Vera (full animation sets).  
**B-Story Characters**: Yakuza/Biker (full animation sets).  
**C-Story Characters**: humanoid animations complete; tentacle prop missing.

**Tiles**: rooftop tiles mostly complete; `grate` model missing.  
**Backgrounds**: Sector 0 complete; other stage backgrounds missing.

> Note: These assets reflect the **pre-Flooded/cyberpunk-era** pipeline and may not align with current Flooded World art direction.

---

## Testing Snapshot (Legacy UI)

- Main menu → intro → game view flow.
- HUD presence checks (quest panel, alignment bar, touch controls).
- Quest log open/close + tabs.
- Combat UI visibility and combat flow.

---

## Usage Guidance

- Treat this as **parity reference only**.
- Do not reintroduce deprecated art direction (neon/cyberpunk).
- Use as a checklist when validating a 1:1 port of **systems** and **UI structure**, adapted to the Flooded World aesthetic.
