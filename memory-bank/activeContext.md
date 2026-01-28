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
   - Consolidated tech and combat docs to remove duplicates; added legacy README
6. **Legacy App Archival**
   - Moved deprecated multi-app shells from `apps/` into `_legacy/apps/`
7. **Electron Cleanup**
   - Removed legacy Electron Capacitor scripts; desktop target will be reintroduced explicitly later
8. **Menu Seed Port**
   - Ported Flooded World seed menu into Angular main menu with diorama seed generation
9. **Flooded World + Combat Arena Port**
   - Added procedural rooftop scene builder and combat arena UI in Angular runtime
10. **Dependency Fix**
   - Switched root Biome dependency to @biomejs/biome to restore installs
11. **Test/Build Stabilization**
    - Added zone.js for Angular tests and updated test harness
    - Added seed phrase utilities to app and removed diorama dependency
    - Added GameModule and fixed test wiring
    - Updated core quest rewards, district themes, and removed TODOs
12. **Quest Flow Wiring**
    - Added GameFlowService to initialize districts, generate quest clusters, and orchestrate quest rewards
    - Wired Babylon marker/shard events into Angular flow (dialogue triggers + autosave)
    - Added quest accept/completion dialogs to the game shell
13. **Mobile-First UX Pass**
    - Added viewport service to drive safe-area and dynamic scaling variables
    - Implemented gyro tilt support with optional camera sway
    - Added haptics feedback on touch controls
    - Updated HUD, quest UI, and shell layout for responsive portrait/landscape + foldable transitions
14. **Mobile Playability Overhaul**
    - Added virtual d-pad gesture input for smoother touch control
    - Added HUD density breakpoints for compact vs roomy layouts
    - Added HUD debug overlay for device QA (safe-area + scaling)
    - Expanded haptics to quest flow and dialogue
15. **Parity Audit + Diorama Porting**
    - Added `memory-bank/parity-assessment.md` to document TSX/TS parity gaps
    - Ported MidgroundFacades, ForegroundProps, ProceduralBackground into Babylon runtime
    - Wired new diorama layers into Flooded World load flow
16. **Material + Structural Ports**
    - Ported AmbientCG material loader, DecalSystem, HDRI environment setup
    - Ported TexturedWall, Floor, Roof, and NeonSign components into engine modules
17. **Branch + Unity Audit**
    - Added `memory-bank/branch-parity-assessment.md` combining legacy + branch + Unity port targets
    - Identified high-value branches and Unity C# systems for parity extraction
18. **Parity Matrix**
    - Added `memory-bank/parity-matrix.md` with full legacy TSX/TS + Unity C# inventory
    - Added heuristic mapping of Unity systems to current TS modules

## Known Constraints

- Must preserve all existing gameplay systems and assets.
- No PRs; work directly on `main` per owner request.

## Next Steps

- Integrate remaining legacy UI (combat arena, flooded world menu, game HUD) into Angular
- Expand dialogue system coverage and ECS data sources to Angular services
- Move legacy apps into `_legacy/` and validate build
- Add Electron target via Capacitor community plugin
- Validate legacy references and update any remaining stale links

---

Last Updated: 2026-01-28
