# Parity Assessment (Legacy TSX/TS)

## Scope
- Legacy sources reviewed: `_legacy/apps/mobile`, `_legacy/apps/playground`, `packages/diorama`, `packages/core`, `packages/world-gen`, `packages/content-gen`.
- Current target: Angular + Babylon runtime in `src/app`.

## Summary
- Legacy diorama components: 110 TSX components (environment, furniture, infrastructure, maritime, props, signage, structural, vegetation).
- Current Babylon engine equivalents: partial (background panels, lighting, character, hex tiles, quest markers, player controller).
- Current UI/HUD: Angular ports exist, but parity with legacy component library is incomplete.

## Major Gaps (Must Port for 1:1 Parity)

### World/Visual Components (Diorama)
- **Missing categories**: environment, furniture, infrastructure, maritime, props, vegetation (signage + structural partially ported).
- **Missing compound assemblies**: rooftop/street/building systems present in playground compounds and tests.
- **Material systems**: now ported, still need integration into runtime visuals.
- **Infrastructure/structural**: infrastructure kit + structural kit ports added; remaining per-component parity still needed.

### Procedural/World Systems
- **Playground compound logic**: `Building`, `Bridge`, `Street`, `Room`, `Alley` and related tests not ported.
- **Procedural background and facades**: ported into Babylon runtime, pending integration of compound logic.

### UI/UX Parity
- **Legacy game UI** is thin in `_legacy/apps/mobile` (webview wrapper only). 
- **Reactylon-era HUD/UI** parity must be checked against the original game app (non-mobile). Need full inventory of historical web UI where it lived (if outside `_legacy`).

## Current Parity Coverage (Partial)
- Babylon scene service + lighting + hex grid + character + quest markers exist in `src/app/engine`.
- **Diorama layers ported**: `ProceduralBackground`, `MidgroundFacades`, `ForegroundProps`.
- **Material systems ported**: AmbientCG PBR loader, DecalSystem, HDRI environment setup.
- **Structural/signage ports (initial)**: `TexturedWall`, `Floor`, `Roof`, `NeonSign`.
- **Infrastructure kit**: AC units, antennas, dumpsters, generators, heli pads, pipes, power lines, satellite dishes, solar panels, storage tanks, vents, water tanks.
- **Structural kit**: stairs, railings, fences, ladders, doors, windows.
- Angular HUD/menus/dialogue/quests exist in `src/app/ui` but need parity verification against legacy web UI sources once located.

## Immediate Remediation Plan
1. **Inventory remaining diorama components** and map to Babylon equivalents (component-by-component port list).
2. **Port missing diorama categories** in prioritized order: props → signage → infrastructure → structural (remaining) → environment → vegetation → maritime.
3. **Port compound assemblies** (Building/Street/Bridge/Alley) and align procedural rooftop generation with legacy test scenes.
4. **Integrate material systems** (AmbientCGMaterial + DecalSystem + HDRIEnvironment) into runtime visuals.
5. **UI parity audit** against legacy React game UI (outside `_legacy` if applicable), then adjust Angular HUD layouts for 1:1 alignment.

## Notes
- This report is the baseline; it must be updated after each ported batch with a verified parity checklist.
