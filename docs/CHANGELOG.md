# Changelog

## [Unreleased] - JRPG Transformation

### Added
- **Monorepo Structure**: Split into `game`, `content-gen`, and `e2e` packages.
- **ECS Architecture**: Migrated core logic to Miniplex systems (`CombatSystem`, `ProgressionSystem`).
- **GenAI Pipeline**: Added `content-gen` package for procedural narrative and assets using Google Gemini.
- **Mobile Support**: integrated Capacitor for Android/iOS builds.
- **E2E Testing**: Added Playwright test suite with visual verification.

### Changed
- **Framework**: Migrated from Astro (MPA) to Vite + React (SPA) for better game loop control and mobile compatibility.
- **Genre**: Shifted from "3D Platformer" to "Action JRPG" (added Stats, Leveling, Inventory).
- **Physics**: Refactored collision logic to support RPG combat stats.

### Removed
- **Legacy Scripts**: Removed Python verification scripts (`verify_game.py`) in favor of TypeScript/Playwright.
- **Astro Components**: Removed `.astro` files; game is now purely React-driven.
