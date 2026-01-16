# Asset Status Report

**Generated**: 2026-01-15
**Branch**: jrpg-transformation-107803072628449215

---

## Summary

| Category | Total | Complete | Partial | Missing |
|----------|-------|----------|---------|---------|
| **Main Characters** | 2 | 0 | 2 | 0 |
| **B-Story Characters** | 4 | 0 | 0 | 4 |
| **C-Story Characters** | 3 | 0 | 0 | 3 |
| **Tiles** | 6 | 5 | 1 | 0 |
| **Backgrounds** | 6 | 6 | 0 | 0 |

**Overall Status**: 🟡 Partial - Main characters have animations but missing rigged models

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

### Status: ❌ **MISSING ENTIRELY**

**Expected Characters** (from NARRATIVE_DESIGN.md):
1. **Yakuza Grunt** (Enemy - 5 animations)
2. **Yakuza Boss** (Boss - 7 animations)
3. **Biker Grunt** (Enemy - 5 animations)
4. **Biker Boss** (Boss - 7 animations)

**Current State**:
- Directory structure exists: `characters/b-story/yakuza/`, `characters/b-story/bikers/`
- **No manifests, no models, no animations**

**Notes**:
- B-Story characters are **optional** for core gameplay
- Can be generated later if time permits
- Priority: **LOW** (focus on main characters and C-story first)

**Action Required** (if time permits):
```bash
# Create manifests first, then generate
pnpm --filter @neo-tokyo/content-gen generate characters/bstory/yakuza-grunt
pnpm --filter @neo-tokyo/content-gen generate characters/bstory/yakuza-boss
pnpm --filter @neo-tokyo/content-gen generate characters/bstory/biker-grunt
pnpm --filter @neo-tokyo/content-gen generate characters/bstory/biker-boss
```

---

## C-Story Characters (Disruptor Events)

### Status: ❌ **MISSING ENTIRELY**

**Expected Characters** (from NARRATIVE_DESIGN.md):
1. **Mall Security Guard** (Enemy - 5 animations) - For Mall Drop stage
2. **Alien Humanoid** (Enemy - 5 animations) - For Alien Ship stage
3. **Tentacle Single** (Prop) - For Alien Queen boss (4-8 Yuka-driven tentacles)

**Current State**:
- Directory structure exists: `characters/c-story/mall-security/`, `characters/c-story/aliens/`, `characters/c-story/tentacles/`
- **No manifests, no models, no animations**

**Priority**: **HIGH** - C-Story stages are core to 3-hour JRPG design

**Notes**:
- **Alien Ship stage** requires 4-8 tentacle instances with nav mesh
- **Mall Drop stage** requires Mall Security enemies
- These are **critical** for A/B/C story architecture

**Action Required** (HIGH PRIORITY):
```bash
# Create manifests first, then generate
pnpm --filter @neo-tokyo/content-gen generate characters/cstory/mall-security-guard
pnpm --filter @neo-tokyo/content-gen generate characters/cstory/alien-humanoid
pnpm --filter @neo-tokyo/content-gen generate characters/cstory/tentacle-single
```

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

*Last Updated: 2026-01-15*
*Branch: jrpg-transformation-107803072628449215*
