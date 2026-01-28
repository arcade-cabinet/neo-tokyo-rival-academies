# Asset Status Report

**Generated**: 2026-01-16
**Branch**: fix/restore-deleted-assets-1768547201

---

## Summary

| Category | Total | Complete | Partial | Missing |
|----------|-------|----------|---------|---------|
| **Main Characters** | 2 | 2 | 0 | 0 |
| **B-Story Characters** | 4 | 4 | 0 | 0 |
| **C-Story Characters** | 3 | 2 | 1 | 0 |
| **Tiles** | 6 | 5 | 1 | 0 |
| **Backgrounds** | 6 | 6 | 0 | 0 |

**Overall Status**: 🟢 Good - All characters have animation GLBs (each contains rigged mesh + animation). Main chars have complete animation sets.

---

## Main Characters (Hero Preset - 7 Animations)

### Kai (Kurenai Academy Protagonist)

**Location**: `packages/game/public/assets/characters/main/kai/`

**Status**: ✅ **COMPLETE**

**Assets Present**:
- ✅ `animations/` directory with 7 GLB files (each contains rigged mesh + animation):
  - `basic_jump.glb`
  - `behit_flyup.glb`
  - `combat_stance.glb` (used as base model)
  - `dead.glb`
  - `dodge_and_counter.glb`
  - `kung_fu_punch.glb`
  - `runfast.glb`

**Notes**:
- Animations are complete (7/7)
- Each animation GLB contains the full rigged character mesh
- `combat_stance.glb` used as base model in scene components

---

### Vera (Azure Academy Rival)

**Location**: `packages/game/public/assets/characters/main/vera/`

**Status**: ✅ **COMPLETE**

**Assets Present**:
- ✅ `animations/` directory with 7 GLB files (each contains rigged mesh + animation):
  - `basic_jump.glb`
  - `behit_flyup.glb`
  - `combat_stance.glb` (used as base model)
  - `dead.glb`
  - `dodge_and_counter.glb`
  - `kung_fu_punch.glb`
  - `runfast.glb`

**Notes**:
- Animations are complete (7/7)
- Each animation GLB contains the full rigged character mesh
- Same animation set as Kai for consistency

---

## B-Story Characters (Enemy/Boss Presets)

### Status: ✅ **COMPLETE**

**Location**: `packages/game/public/assets/characters/b-story/`

**Characters** (from NARRATIVE_DESIGN.md):
1. **Yakuza Grunt** (Enemy - 5 animations) ✅
2. **Yakuza Boss** (Boss - 6 animations) ✅
3. **Biker Grunt** (Enemy - 5 animations) ✅
4. **Biker Boss** (Boss - 6 animations) ✅

**Current State**:
- ✅ All directories have animation GLBs (each contains rigged mesh + animation)
- ✅ Yakuza Boss: 6 animations (behit_flyup, block1, combat_stance, dead, double_combo_attack, kung_fu_punch, runfast)
- ✅ Yakuza Grunt: 5 animations
- ✅ Biker Boss: 6 animations
- ✅ Biker Grunt: 5 animations

**Notes**:
- All B-Story character animations are present and tracked in Git LFS
- Each animation GLB contains the full rigged character mesh

---

## C-Story Characters (Disruptor Events)

### Status: ⚠️ **PARTIAL** (Animations complete, rigged.glb missing)

**Location**: `packages/game/public/assets/characters/c-story/`

**Characters** (from NARRATIVE_DESIGN.md):
1. **Mall Security Guard** (Enemy - 5 animations) ✅ animations present - For Mall Drop stage
2. **Alien Humanoid** (Enemy - 5 animations) ✅ animations present - For Alien Ship stage
3. **Tentacle Single** (Prop) ⚠️ - For Alien Queen boss (directory exists, no animations)

**Current State**:
- ✅ Mall Security Guard: 5 animations at `c-story/mall-security/guard/animations/`
- ✅ Alien Humanoid: 5 animations at `c-story/aliens/humanoid/animations/`
- ⚠️ Tentacle Single: directory exists at `c-story/tentacles/` (needs model generation)
- ❌ No rigged.glb files present (same as other character types)

**Notes**:
- **Alien Ship stage** requires 4-8 tentacle instances with nav mesh
- Tentacle model needs to be generated via content-gen pipeline
- All humanoid characters have complete animation sets
- rigged.glb models need generation before Babylon.js migration

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

### High Priority (Rigged Models for Existing Characters)

4. **Generate rigged.glb for Mall Security Guard** (animations already exist):
   ```bash
   pnpm --filter @neo-tokyo/content-gen generate characters/c-story/mall-security/guard --rigged-only
   ```

5. **Generate rigged.glb for Alien Humanoid** (animations already exist):
   ```bash
   pnpm --filter @neo-tokyo/content-gen generate characters/c-story/aliens/humanoid --rigged-only
   ```

6. **Generate Tentacle Single** (CRITICAL for nav mesh testing):
   ```bash
   pnpm --filter @neo-tokyo/content-gen generate characters/c-story/tentacles/single
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

Branch: fix/restore-deleted-assets-1768547201
