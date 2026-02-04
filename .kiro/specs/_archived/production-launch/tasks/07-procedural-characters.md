# 7. Procedural Character Generation

**Parent:** [tasks.md](../tasks.md)
**Validates:** Requirements 15, 16

## Overview
Implements Meshy AI integration for procedural character generation with anime aesthetic and animation rigging.

## Prerequisites
- BabylonJS migration complete (Section 1)
- Character rendering system functional
- Asset pipeline operational

## Tasks

### 7.1. Meshy AI Integration

**Validates:** Requirement 15.1

- [ ] 7.1.1. Configure Meshy API client
  - Install Meshy SDK or create HTTP client
  - Configure API key from environment
  - Implement rate limiting (10 requests/minute)
  - _File: `packages/content-gen/src/api/meshy-client.ts`_
  - _Validates: Requirements 15.1_

- [ ] 7.1.2. Create character generation pipeline
  - Text-to-3D preview (fast, low-poly)
  - Text-to-3D refine (high-quality, production)
  - Auto-rigging for animations
  - _File: `packages/content-gen/src/pipelines/character-generation.ts`_

- [ ] 7.1.3. Implement asset caching system
  - Cache generated models locally
  - Avoid regenerating same character
  - Versioning for model updates
  - _File: `packages/content-gen/src/utils/asset-cache.ts`_

- [ ]* 7.1.4. Write property test for API integration
  - **Property 34: API response validity**
  - **Validates: Requirements 15.1**
  - For any valid prompt, API should return model URL or error
  - Rate limiting should prevent exceeding quota

### 7.2. Character Prompt Engineering

**Validates:** Requirement 15.2

- [ ] 7.2.1. Create character prompt templates
  - Base template: "anime character, {faction}, {role}, {style}"
  - Style keywords: DBZ, Kill La Kill, cel-shaded
  - Faction-specific traits (Biker: leather, Yakuza: suit, Alien: bio-tech)
  - _File: `packages/content-gen/src/prompts/character-prompts.ts`_
  - _Validates: Requirements 15.2_

- [ ] 7.2.2. Implement prompt variation system
  - Generate multiple variations per character type
  - Randomize accessories and colors
  - Maintain faction visual identity
  - _File: `packages/content-gen/src/systems/PromptVariation.ts`_

- [ ]* 7.2.3. Write property test for prompt generation
  - **Property 35: Prompt consistency**
  - **Validates: Requirements 15.2**
  - For any character type, prompt should include faction and style keywords
  - Prompts should be unique across variations

### 7.3. Character Rigging & Animation

**Validates:** Requirement 15.3

- [ ] 7.3.1. Implement auto-rigging pipeline
  - Use Meshy's rigging API
  - Validate bone structure (humanoid rig)
  - Export as GLB with skeleton
  - _File: `packages/content-gen/src/pipelines/rigging-pipeline.ts`_
  - _Validates: Requirements 15.3_

- [ ] 7.3.2. Create animation retargeting system
  - Load base animations (combat_stance, runfast, etc.)
  - Retarget to generated character skeleton
  - Validate animation compatibility
  - _File: `packages/content-gen/src/systems/AnimationRetargeting.ts`_

- [ ] 7.3.3. Implement animation library
  - Store reusable animations per character type
  - Support animation blending
  - Cache retargeted animations
  - _File: `packages/content-gen/src/data/animation-library.json`_

- [ ]* 7.3.4. Write property test for rigging
  - **Property 36: Skeleton validity**
  - **Validates: Requirements 15.3**
  - For any rigged character, skeleton should have required bones
  - Bone hierarchy should be valid (no cycles)

### 7.4. Material & Texture Generation

**Validates:** Requirement 16.1

- [ ] 7.4.1. Create cel-shaded material system
  - Define BabylonJS toon material
  - Configure outline rendering
  - Set up lighting for anime look
  - _File: `packages/game/src/systems/MaterialSystem.ts`_
  - _Validates: Requirements 16.1_

- [ ] 7.4.2. Implement texture processing pipeline
  - Convert Meshy textures to cel-shaded style
  - Apply color quantization (limited palette)
  - Add outline maps
  - _File: `packages/content-gen/src/pipelines/texture-processing.ts`_

- [ ] 7.4.3. Create faction color schemes
  - Bikers: red/black
  - Yakuza: white/gold
  - Aliens: purple/green
  - _File: `packages/game/src/data/faction-colors.json`_

### 7.5. Character Manifest System

**Validates:** Requirement 16.2

- [ ] 7.5.1. Define character manifest schema
  - Properties: id, name, faction, role, model_url, animations
  - Metadata: generation_date, prompt, version
  - Asset references
  - _File: `packages/game/src/types/character-manifest.ts`_
  - _Validates: Requirements 16.2_

- [ ] 7.5.2. Implement manifest generation
  - Auto-generate manifest on character creation
  - Include all asset paths
  - Validate manifest completeness
  - _File: `packages/content-gen/src/systems/ManifestGenerator.ts`_

- [ ]* 7.5.3. Write property test for manifests
  - **Property 37: Manifest completeness**
  - **Validates: Requirements 16.2**
  - For any character manifest, all referenced assets should exist
  - Required fields should be non-empty

### 7.6. Batch Character Generation

**Validates:** Requirement 15.4

- [ ] 7.6.1. Create batch generation CLI
  - Command: `pnpm generate:characters --faction bikers --count 5`
  - Progress tracking with status updates
  - Error handling and retry logic
  - _File: `packages/content-gen/src/cli/generate-characters.ts`_
  - _Validates: Requirements 15.4_

- [ ] 7.6.2. Implement generation queue
  - Queue requests to respect rate limits
  - Parallel processing where possible
  - Resume on failure
  - _File: `packages/content-gen/src/systems/GenerationQueue.ts`_

- [ ] 7.6.3. Add generation monitoring
  - Log generation progress
  - Track API usage and costs
  - Report failures
  - _File: `packages/content-gen/src/utils/generation-monitor.ts`_

### 7.7. Character Integration

**Validates:** Requirement 16.3

- [ ] 7.7.1. Update character loader for procedural models
  - Load from manifest instead of hardcoded paths
  - Support fallback to default models
  - Lazy load on demand
  - _File: `packages/game/src/systems/CharacterLoader.ts`_
  - _Validates: Requirements 16.3_

- [ ] 7.7.2. Create character preview system
  - Preview generated characters before integration
  - Rotate and inspect model
  - Test animations
  - _File: `packages/content-gen/src/ui/CharacterPreview.tsx`_

- [ ] 7.7.3. Implement character versioning
  - Track model versions
  - Support model updates without breaking saves
  - Migration system for old models
  - _File: `packages/game/src/systems/CharacterVersioning.ts`_

## Verification

After completing this section:
- [ ] Meshy API integration works
- [ ] Characters generate with anime aesthetic
- [ ] Rigging produces valid skeletons
- [ ] Animations retarget correctly
- [ ] Cel-shaded materials apply properly
- [ ] Manifests generate with all data
- [ ] Batch generation completes successfully
- [ ] Characters load in-game
- [ ] All property tests pass (100+ iterations each)
- [ ] TypeScript compiles without errors
- [ ] Linting passes (`pnpm check`)
- [ ] Generated characters maintain 60 FPS

## Common Commands

```bash
# Generate characters
pnpm --filter @neo-tokyo/content-gen generate:characters --faction bikers --count 5

# Preview character
pnpm --filter @neo-tokyo/content-gen preview --character bikers/grunt/001

# Test character loading
pnpm --filter @neo-tokyo/game test CharacterLoader

# Lint
pnpm check
```
