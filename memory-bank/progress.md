# Progress Tracker

## Milestone Overview

| Milestone | Status | Target | Notes |
|-----------|--------|--------|-------|
| Stack Pivot (Ionic Angular) | In Progress | Jan 27 | Issue #68 opened |
| Unified App Scaffold | In Progress | Jan 27 | `app/` created with Capacitor |
| Babylon Scene Port | In Progress | Jan 27 | Scene service + core components |
| UI/HUD Port | In Progress | Jan 27 | Main menu + HUD + quest UI |
| Mobile MVP | Planned | Mar 31 | 60 FPS Pixel 8a |

---

## Completed Work

### January 27, 2026

**Governance + Scaffold**
- [x] Created Issue #68 for Ionic Angular + Capacitor pivot
- [x] Created `docs/00-golden/MOBILE_WEB_GUIDE.md`
- [x] Scaffolded Ionic Angular app at repo root with Capacitor integration
- [x] Enabled zoneless Angular bootstrap

**Documentation Reorg**
- [x] Reorganized docs into domain subdirectories
- [x] Updated Golden Record and Deprecations to current stack
- [x] Added `/docs/README.md` index
- [x] Rewrote design/gameplay/world docs to flooded-world scope
- [x] Moved obsolete handoffs and process docs into `/docs/legacy/process`
- [x] Moved legacy story transformation doc into `/docs/legacy/story`
- [x] Consolidated tech architecture docs and combat gap analysis into canonical docs
- [x] Added `/docs/legacy/README.md` usage guidance
- [x] Archived deprecated multi-app shells into `_legacy/apps`
- [x] Removed legacy Electron scripts from root `package.json`

**Babylon Scene Port**
- [x] Imperative Babylon scene service (camera, lighting, grid, background)
- [x] Character loading + animation controller
- [x] Quest marker + data shard managers
- [x] Player controller with touch input support
- [x] Flooded rooftop scene generation integrated into Babylon runtime

**UI/HUD Port**
- [x] Main menu, narrative overlay, splash screen
- [x] JRPG HUD, alignment bar, quest log, quest objective
- [x] Inventory screen, quest dialogs, save slot select, stat allocation modal
- [x] Seed phrase menu and Continue flow integrated into main menu
- [x] Combat arena UI ported to Angular
- [x] Local seed phrase utilities added to drop diorama dependency

### January 28, 2026

**Quest Flow Wiring**
- [x] Added GameFlowService for district initialization, quest cluster generation, and quest rewards
- [x] Wired Babylon marker + shard interactions to trigger dialogue and autosave
- [x] Added quest accept/completion dialogs to the game shell
- [x] `pnpm check`
- [x] `pnpm test --watch=false --browsers=ChromeHeadless`

**Mobile-First UX**
- [x] Added ViewportService to manage safe-area sizing and HUD scale variables
- [x] Added DeviceMotionService and gyro-driven camera sway
- [x] Enabled haptic feedback on touch controls
- [x] Responsive HUD and quest UI updates for portrait/landscape and foldable transitions
- [x] Added virtual d-pad gesture input and compact HUD density breakpoints
- [x] Added HUD debug overlay for device QA
- [x] `pnpm check`
- [x] `pnpm test --watch=false --browsers=ChromeHeadless`

**Parity Audit + Diorama Porting**
- [x] Added parity report at `memory-bank/parity-assessment.md`
- [x] Ported MidgroundFacades, ForegroundProps, ProceduralBackground into Babylon runtime
- [x] Wired diorama layers into Flooded World load flow
- [x] `pnpm check`
- [x] `pnpm test --watch=false --browsers=ChromeHeadless`

**Material + Structural Ports**
- [x] Ported AmbientCG material loader, DecalSystem, and HDRI environment setup
- [x] Ported TexturedWall, Floor, Roof, and NeonSign components into engine modules
- [x] Updated parity assessment for new ports
- [x] `pnpm check`
- [x] `pnpm test --watch=false --browsers=ChromeHeadless`

**Branch + Unity Audit**
- [x] Added `memory-bank/branch-parity-assessment.md` combining legacy TSX/TS and Unity C# targets
- [x] Identified high-value 1.0 branches and Unity systems for parity extraction

**Parity Matrix**
- [x] Added `memory-bank/parity-matrix.md` with full legacy TSX/TS + Unity C# inventory
- [x] Added heuristic Unity → TS mapping to guide port priorities

**Infrastructure + Structural Ports**
- [x] Added InfrastructureKit and StructuralKit ports
- [x] Wired infrastructure props into FloodedWorldBuilder and added bridge railings
- [x] Updated parity docs to reflect new ports
- [x] `pnpm check`
- [x] `pnpm test --watch=false --browsers=ChromeHeadless`

**Structural Expansion**
- [x] Expanded StructuralKit with balconies, catwalks, ramps, awnings, scaffolding, pillars
- [x] Wired new structural props into FloodedWorldBuilder
- [x] Updated parity docs
- [x] `pnpm check`
- [x] `pnpm test --watch=false --browsers=ChromeHeadless`

**Documentation Consolidation**
- [x] Moved legacy root markdown into `/docs/legacy/` (changelog, test plan, release roadmap, release notes, asset status, grok doc)
- [x] Added new legacy domains: testing, assets, tech
- [x] Updated `/docs/README.md` and `/docs/00-golden/DEPRECATIONS.md`

**Governance Override**
- [x] Updated `/docs/process/AGENT_GOVERNANCE.md` to track work in memory-bank per owner directive
- [x] Opened Issue #71 for maritime + vegetation + environment port scope

**Compound Assemblies (Ported)**
- [x] Ported playground compounds into `src/app/engine/compounds` (Building, Bridge, Alley, Room, Street)
- [x] Integrated BridgeCompound, StreetCompound, and rooftop compound placement into FloodedWorldBuilder
- [x] `pnpm check`
- [x] `pnpm test --watch=false --browsers=ChromeHeadless`

**Maritime + Vegetation + Environment Ports**
- [x] Added MaritimeKit (pier, dock, pontoon, boat, buoy, floating platform, houseboat, rain collector, fishing net, anchor)
- [x] Added VegetationKit (tree, palm, shrub, grass, vine, mushroom, flower bed)
- [x] Added EnvironmentKit (steam vent, fog panel)
- [x] Integrated maritime props + fog into canal scene; added vegetation + steam vents to rooftop prop placement
- [x] `pnpm check`
- [x] `pnpm test --watch=false --browsers=ChromeHeadless`

---

## In Progress

### Unified App Implementation
- [ ] Integrate remaining legacy UI (game HUD)
- [ ] Wire dialogue system + ECS data to Angular services
- [ ] Configure Electron target (optional)
- [ ] Remove/archive legacy React/Expo apps
- [ ] Replace remaining React/Reactylon codepaths in packages

---

Last Updated: 2026-01-28
