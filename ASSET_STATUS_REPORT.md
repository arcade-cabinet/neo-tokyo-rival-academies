# Asset Status Report

**Generated**: 2026-01-16
**Branch**: fix/restore-deleted-assets-1768547201

---

## Summary

| Category | Total | Complete | Partial | Missing |
|----------|-------|----------|---------|---------|
| **Main Characters** | 2 | 0 | 2 | 0 |
| **B-Story Characters** | 4 | 4 | 0 | 0 |
| **C-Story Characters** | 3 | 2 | 1 | 0 |
| **Tiles** | 6 | 5 | 1 | 0 |
| **Backgrounds** | 6 | 6 | 0 | 0 |

**Overall Status**: 🟢 Good - All characters have animations, main chars need rigged.glb regeneration

---

## Main Characters (Hero Preset - 7 Animations)

### Kai (Kurenai Academy Protagonist)

**Location**: `packages/game/public/assets/characters/main/kai/`

**Status**: ⚠️ **PARTIAL**

**Assets Present**:
- ✅ `manifest.json` (8.3K)
- ✅ `animations/` directory with 7 GLB files:
  - `attack_melee_1.glb`
  - `block.glb`
  - `death.glb`
  - `hit_reaction.glb`
  - `idle_combat.glb`
  - `jump_idle.glb`
  - `run_in_place.glb`

**Assets Missing**:
- ❌ `rigged.glb` - **CRITICAL** for Babylon.js migration
- ❌ `model.glb` - Base 3D model
- ❌ `concept.png` - Concept art

**Notes**:
- Git status shows these were **intentionally deleted** in this branch
- Animations are complete (7/7)
- Need to regenerate rigged model for Babylon.js migration

**Action Required**:
```bash
pnpm --filter @neo-tokyo/content-gen generate characters/main/kai
```

---

### Vera (Azure Academy Rival)

**Location**: `packages/game/public/assets/characters/main/vera/`

**Status**: ⚠️ **PARTIAL**

**Assets Present**:
- ✅ `manifest.json` (8.2K)
- ✅ `animations/` directory with 7 GLB files:
  - `attack_melee_1.glb`
  - `block.glb`
  - `death.glb`
  - `hit_reaction.glb`
  - `idle_combat.glb`
  - `jump_idle.glb`
  - `run_in_place.glb`

**Assets Missing**:
- ❌ `rigged.glb` - **CRITICAL** for Babylon.js migration
- ❌ `model.glb` - Base 3D model
- ❌ `concept.png` - Concept art

**Additional Files Found**:
- `concept_0.png`, `concept_1.png`, `concept_2.png` - Test concepts
- `preview.glb` - Preview model
- `textures/` directory - Texture files
- `test_renders/` directory - Test renders

**Notes**:
- More complete than Kai (has test assets)
- May need full regeneration for consistency

**Action Required**:
```bash
pnpm --filter @neo-tokyo/content-gen generate characters/main/vera
```

---

## B-Story Characters (Enemy/Boss Presets)

### Status: ✅ **COMPLETE**

**Characters** (from NARRATIVE_DESIGN.md):
1. **Yakuza Grunt** (Enemy - 5 animations) ✅
2. **Yakuza Boss** (Boss - 7 animations) ✅
3. **Biker Grunt** (Enemy - 5 animations) ✅
4. **Biker Boss** (Boss - 7 animations) ✅

**Current State**:
- ✅ All directories have manifests and animation GLBs
- ✅ Yakuza Boss: 7 animations (behit_flyup, block1, combat_stance, dead, double_combo_attack, kung_fu_punch, runfast)
- ✅ Yakuza Grunt: 5 animations
- ✅ Biker Boss: 7 animations
- ✅ Biker Grunt: 5 animations

**Notes**:
- All B-Story character animations are present and tracked in Git LFS
- rigged.glb models may need regeneration via content-gen pipeline

---

## C-Story Characters (Disruptor Events)

### Status: ✅ **MOSTLY COMPLETE**

**Characters** (from NARRATIVE_DESIGN.md):
1. **Mall Security Guard** (Enemy - 5 animations) ✅ - For Mall Drop stage
2. **Alien Humanoid** (Enemy - 5 animations) ✅ - For Alien Ship stage
3. **Tentacle Single** (Prop) ⚠️ - For Alien Queen boss (manifest only)

**Current State**:
- ✅ Mall Security Guard: manifest + 5 animations (behit_flyup, combat_stance, dead, double_combo_attack, runfast)
- ✅ Alien Humanoid: manifest + 5 animations
- ⚠️ Tentacle Single: manifest only (needs model generation)

**Notes**:
- **Alien Ship stage** requires 4-8 tentacle instances with nav mesh
- Tentacle model needs to be generated via content-gen pipeline
- All humanoid characters have complete animation sets

---

## Tiles (Hex Grid Assets)

### Rooftop Tiles (6 Types)

**Location**: `packages/game/public/assets/tiles/rooftop/`

**Status**: 🟢 **MOSTLY COMPLETE**

| Tile Type | Manifest | Concept | Model | Status |
|-----------|----------|---------|-------|--------|
| **base** | ✅ | ✅ | ✅ | 🟢 Complete |
| **airvent** | ✅ | ✅ | ✅ | 🟢 Complete |
| **pipes** | ✅ | ✅ | ✅ | 🟢 Complete |
| **tarpaper** | ✅ | ✅ | ✅ | 🟢 Complete |
| **glass** | ✅ | ✅ | ✅ | 🟢 Complete |
| **grate** | ✅ | ✅ | ❌ | ⚠️ Missing model.glb |

**Notes**:
- 5 out of 6 tiles are complete
- `grate` tile has manifest and concept but missing `model.glb`
- Used in `IsometricScene.tsx` for hex grid floor

**Action Required**:
```bash
# Regenerate grate tile to get model.glb
pnpm --filter @neo-tokyo/content-gen generate tiles/rooftop/grate
```

---

## Backgrounds (2D Scene Assets)

### Sector 0 Backgrounds (6 Types)

**Location**: `packages/game/public/assets/backgrounds/sector0/`

**Status**: 🟢 **COMPLETE**

| Background | Manifest | Concept | Status |
|------------|----------|---------|--------|
| **parallax_far** | ✅ | ✅ | 🟢 Complete |
| **parallax_mid** | ✅ | ✅ | 🟢 Complete |
| **rooftop** | ✅ | ✅ | 🟢 Complete |
| **rooftop_floor** | ✅ | ✅ | 🟢 Complete |
| **wall_left** | ✅ | ✅ | 🟢 Complete |
| **wall_right** | ✅ | ✅ | 🟢 Complete |

**Notes**:
- All sector0 backgrounds are complete
- Used for FF7-style diorama parallax walls
- 2D PNG images (not 3D models)

**Additional Backgrounds Needed**:
- ❌ `backgrounds/alien_ship/` - For C-Story Alien Ship stage
- ❌ `backgrounds/mall/` - For C-Story Mall Drop stage
- ❌ `backgrounds/summit/` - For Summit Climb stage

**Action Required** (if time permits):
```bash
pnpm --filter @neo-tokyo/content-gen generate backgrounds/alien_ship
pnpm --filter @neo-tokyo/content-gen generate backgrounds/mall
pnpm --filter @neo-tokyo/content-gen generate backgrounds/summit
```

---

## Priority Action Plan

### Immediate (Critical for Babylon.js Migration)

1. **Regenerate Kai rigged model**:
   ```bash
   pnpm --filter @neo-tokyo/content-gen generate characters/main/kai
   ```

2. **Regenerate Vera rigged model**:
   ```bash
   pnpm --filter @neo-tokyo/content-gen generate characters/main/vera
   ```

3. **Regenerate grate tile model**:
   ```bash
   pnpm --filter @neo-tokyo/content-gen generate tiles/rooftop/grate
   ```

### High Priority (C-Story Stages)

4. **Generate Mall Security Guard**:
   ```bash
   pnpm --filter @neo-tokyo/content-gen generate characters/cstory/mall-security-guard
   ```

5. **Generate Alien Humanoid**:
   ```bash
   pnpm --filter @neo-tokyo/content-gen generate characters/cstory/alien-humanoid
   ```

6. **Generate Tentacle Single** (CRITICAL for nav mesh testing):
   ```bash
   pnpm --filter @neo-tokyo/content-gen generate characters/cstory/tentacle-single
   ```

### Medium Priority (Stage Backgrounds)

7. **Generate Alien Ship background**:
   ```bash
   pnpm --filter @neo-tokyo/content-gen generate backgrounds/alien_ship
   ```

8. **Generate Mall background**:
   ```bash
   pnpm --filter @neo-tokyo/content-gen generate backgrounds/mall
   ```

### Low Priority (B-Story Characters)

9-12. Generate B-Story characters (Yakuza Grunt/Boss, Biker Grunt/Boss)

---

## Git LFS Verification

**All binary assets should be tracked in Git LFS.**

**Check with**:
```bash
git lfs ls-files | grep -E '\.(glb|png)$' | wc -l
```

**Expected**:
- All `.glb` files in LFS
- All `.png` files in LFS
- No binary files committed directly to Git

---

## Manifest Schema Compliance

**All manifests should follow** `packages/content-gen/src/types/manifest.ts`:

**Required Fields**:
- `name` - Asset display name
- `type` - `character`, `tile`, or `background`
- `visualPrompt` - GenAI text prompt
- `imageConfig` - `aspectRatio` (1:1 for tiles/characters, 16:9 for backgrounds)
- `modelConfig` - `targetPolycount` (10K for tiles/enemies, 30K for heroes)

**Verify with**:
```bash
pnpm --filter @neo-tokyo/content-gen validate-manifests
```

---

## Estimated Asset Generation Time

| Asset Type | Count | Time per Asset | Total Time |
|------------|-------|----------------|------------|
| **Main Characters** | 2 | 15-20 min | 30-40 min |
| **C-Story Characters** | 3 | 10-15 min | 30-45 min |
| **Tile (grate)** | 1 | 5-10 min | 5-10 min |
| **Backgrounds** | 2 | 5-10 min | 10-20 min |
| **B-Story Characters** | 4 | 10-15 min | 40-60 min |

**Total Critical Path**: ~1-1.5 hours (Kai + Vera + C-Story + grate)
**Total Full Generation**: ~2-3 hours (including B-Story)

---

## Recommended Workflow

1. **Verify Meshy AI API key** is set in `.env`
2. **Run critical assets** (Kai, Vera, grate, C-story)
3. **Test Babylon.js migration** with Kai character
4. **Generate remaining C-story** characters
5. **Generate stage backgrounds** (alien ship, mall)
6. **Defer B-story characters** until after Babylon.js migration complete

---

Last Updated: 2026-01-16

Branch: jrpg-transformation-107803072628449215
