# Active Context

## Current Focus

**Phase**: Mobile MVP (single unified Ionic Angular app)
**Target**: Babylon.js + Capacitor delivery for web, Android, iOS; optional Electron desktop.

## Active Work

1. **Stack Pivot**
   - Unified Ionic Angular app scaffolded at repo root
   - Capacitor integration enabled (Capacitor 8)
   - Zoneless Angular bootstrap enabled

2. **Babylon Scene Port**
   - Imperative Babylon scene service built
   - Hex grid, background panels, lighting, character loading, markers, and data shards ported

3. **UI/HUD Port**
   - Main menu, narrative overlay, JRPG HUD, alignment bar, quest UI, splash screen ported
   - Additional UI components ported: inventory, quest dialogs, save slots, stat allocation

4. **Governance**
   - Issue created: #68 (stack pivot + unified app)
   - Issue created: #69 (root port + parity + e2e)
5. **Documentation Cleanup**
   - Rewrote core design/gameplay/world docs to align with flooded-world scope
   - Moved obsolete process/story handoffs into `/docs/legacy/process` and `/docs/legacy/story`
   - Replaced multi-city geography with single-city rooftop district scope
6. **Legacy App Archival**
   - Moved deprecated multi-app shells from `apps/` into `_legacy/apps/`

## Known Constraints

- Must preserve all existing gameplay systems and assets.
- No PRs; work directly on `main` per owner request.

## Next Steps

- Integrate remaining legacy UI (combat arena, flooded world menu, game HUD) into Angular
- Wire dialogue system and ECS data sources to Angular services
- Move legacy apps into `_legacy/` and validate build
- Add Electron target via Capacitor community plugin
- Validate legacy references and update any remaining stale links

---

Last Updated: 2026-01-27
