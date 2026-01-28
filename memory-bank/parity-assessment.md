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
- **Missing categories**: environment, furniture, infrastructure, maritime, props, signage, structural, vegetation.
- **Missing compound assemblies**: rooftop/street/building systems present in playground compounds and tests.
- **Material systems**: AmbientCGMaterial, DecalSystem, HDRIEnvironment (playground materials) not yet ported.

### Procedural/World Systems
- **Playground compound logic**: `Building`, `Bridge`, `Street`, `Room`, `Alley` and related tests not ported.
- **Procedural background and facades**: `ProceduralBackground`, `MidgroundFacades`, `ForegroundProps` not ported.

### UI/UX Parity
- **Legacy game UI** is thin in `_legacy/apps/mobile` (webview wrapper only). 
- **Reactylon-era HUD/UI** parity must be checked against the original game app (non-mobile). Need full inventory of historical web UI where it lived (if outside `_legacy`).

## Current Parity Coverage (Partial)
- Babylon scene service + lighting + hex grid + character + quest markers exist in `src/app/engine`.
- Angular HUD/menus/dialogue/quests exist in `src/app/ui` but need parity verification against legacy web UI sources once located.

## Immediate Remediation Plan
1. **Inventory all diorama components** and map to Babylon equivalents (component-by-component port list).
2. **Port missing diorama categories** in prioritized order: structural → props → signage → infrastructure → environment → vegetation → maritime.
3. **Port compound assemblies** (Building/Street/Bridge/Alley) and align procedural rooftop generation with legacy test scenes.
4. **Port material systems** (AmbientCGMaterial + DecalSystem + HDRIEnvironment) to preserve visual identity.
5. **UI parity audit** against legacy React game UI (outside `_legacy` if applicable), then adjust Angular HUD layouts for 1:1 alignment.

## Notes
- This report is the baseline; it must be updated after each ported batch with a verified parity checklist.
