# Requirements Document: Neo-Tokyo Rival Academies - Production Launch

## Introduction

This specification defines the complete production-ready implementation of Neo-Tokyo: Rival Academies, a 3-hour Action JRPG featuring isometric diorama gameplay, procedurally-enhanced narrative, and anime-style combat. The game delivers a complete A/B/C story structure with 9 fully playable stages, comprehensive progression systems, and mobile-first deployment.

## Glossary

- **System**: The complete Neo-Tokyo: Rival Academies game application
- **Player**: The end user playing the game
- **Kai**: The protagonist character (Kurenai Academy)
- **Vera**: The rival character (Azure Academy)
- **Stage**: A discrete playable level with specific objectives
- **Diorama**: The FF7-style isometric hex-grid playable area
- **A-Story**: Main rivalry narrative arc (Kai vs Vera)
- **B-Story**: Parallel character development content
- **C-Story**: Disruptor events forcing cooperation
- **Navigation_Mesh**: BabylonJS RecastJS pathfinding system
- **Crowd_Agent**: AI-controlled entity using navigation mesh
- **Hex_Grid**: Hexagonal tile-based floor system
- **Combat_System**: Turn-based stat-driven battle mechanics
- **Progression_System**: XP, leveling, and stat allocation
- **Dialogue_System**: Visual novel-style narrative overlay
- **GenAI_Pipeline**: Meshy AI asset generation workflow
- **Property_Test**: Property-based test validating universal correctness
- **Unit_Test**: Example-based test validating specific behavior

## Requirements

### Requirement 1: BabylonJS Migration Foundation

**User Story:** As a developer, I want to migrate from Three.js to BabylonJS with Reactylon, so that I can leverage RecastJS navigation mesh for complex AI behaviors.

#### Acceptance Criteria

1. THE System SHALL render scenes using BabylonJS engine with Reactylon React integration
2. WHEN the application initializes, THE System SHALL create an orthographic isometric camera matching the current Three.js view angles
3. THE System SHALL maintain 60 FPS performance on mid-range mobile devices (Pixel 8a target)
4. THE System SHALL dispose of all Three.js dependencies and remove unused packages
5. THE System SHALL preserve all existing ECS architecture using Miniplex
6. THE System SHALL maintain cel-shaded visual aesthetic using BabylonJS materials

### Requirement 2: Hex Grid Diorama System

**User Story:** As a player, I want to navigate a bounded isometric diorama with hex-tile floors, so that I experience FF7-style tactical positioning.

#### Acceptance Criteria

1. THE System SHALL generate a 10×10 hexagonal tile grid using thin instances for performance
2. WHEN tiles are generated, THE System SHALL apply 6 distinct tile types (base, airvent, pipes, generator, antenna, edge) with deterministic seeded randomization
3. THE System SHALL implement clipping planes to bound the diorama at left and right edges
4. THE System SHALL render parallax background panels at diorama boundaries
5. THE System SHALL snap character positions to hex centers using axial coordinate conversion
6. THE System SHALL trim excess tiles dynamically based on rectangular bounds
7. THE System SHALL cut edge tiles to halves using clipping planes for visual containment

### Requirement 3: Navigation Mesh and AI System

**User Story:** As a developer, I want RecastJS navigation mesh with crowd simulation, so that 4-8 independent tentacle agents can pathfind simultaneously in the Alien Ship stage.

#### Acceptance Criteria

1. THE System SHALL bake navigation meshes from hex grid geometry using RecastJS
2. WHEN a navigation mesh is baked, THE System SHALL support up to 16 simultaneous crowd agents
3. THE System SHALL provide agent steering with collision avoidance and separation
4. WHEN an enemy spawns, THE System SHALL add it to the crowd with configurable radius and speed
5. THE System SHALL update agent targets dynamically to chase the player position
6. THE System SHALL handle 8 independent tentacle agents navigating without collision in the Alien Ship stage
7. THE System SHALL provide debug visualization of navigation mesh for development

### Requirement 4: Procedural Anime Character System

**User Story:** As a developer, I want procedurally generated anime-style characters with controllable limbs, so that I can create reusable hero templates without primitive-looking models.

#### Acceptance Criteria

1. THE System SHALL generate character bodies using bezier-curve extrusion and subdivision for smooth organic shapes
2. WHEN a character is created, THE System SHALL support male/female gender morphs affecting shoulder width and proportions
3. THE System SHALL generate anime-style faces using DynamicTexture canvas with drawn eyes, mouth, and facial features
4. THE System SHALL create spiky anime hair using ribbon strands from spline points
5. THE System SHALL rig characters with hierarchical bone systems for controllable limb movement
6. THE System SHALL provide GUI sliders for real-time parameter adjustment (height, muscle, colors)
7. THE System SHALL support attachment slots for parenting equipment meshes to bones
8. THE System SHALL apply cel-shaded toon materials with rim lighting for anime aesthetic

### Requirement 5: Complete Stage Progression System

**User Story:** As a player, I want to play through 9 complete stages from prologue to epilogue, so that I experience the full 3-hour JRPG narrative.

#### Acceptance Criteria

1. THE System SHALL implement 9 stages: intro_cutscene, sector7_streets, alien_ship, mall_drop, boss_ambush, rooftop_chase, summit_climb, final_battle, epilogue
2. WHEN a stage completes, THE System SHALL transition to the next stage based on progression triggers
3. THE System SHALL support 3 stage types: cutscene, platformer, boss, runner
4. THE System SHALL implement C-Story disruptor triggers that interrupt main flow (alien abduction, mall drop)
5. THE System SHALL track stage completion state and prevent replaying completed stages without explicit reset
6. THE System SHALL load stage-specific assets (backgrounds, enemies, music) on demand
7. THE System SHALL display loading screens with progress indicators during stage transitions

### Requirement 6: Combat and Progression Systems

**User Story:** As a player, I want stat-based combat with visible damage calculations and character progression, so that I feel meaningful growth through the game.

#### Acceptance Criteria

1. THE System SHALL implement four stats: Structure (HP/Defense), Ignition (Attack/Crit), Logic (Skills/Resource), Flow (Speed/Evasion)
2. WHEN damage is calculated, THE System SHALL use formula: `Damage = (Attacker.Ignition * 2) - (Defender.Structure * 0.5)` with ±10% variance
3. THE System SHALL display floating damage numbers above targets using 3D-to-2D screen projection
4. WHEN a player gains XP, THE System SHALL check for level-up using quadratic formula: `XP_Required = Level² * 100`
5. THE System SHALL grant 2 stat points per level-up for player allocation
6. THE System SHALL implement critical hit system with chance based on Ignition stat and alignment
7. THE System SHALL calculate hit/evasion using Flow stat differential
8. THE System SHALL support equipment slots (weapon, armor, accessory) with stat modifiers

### Requirement 7: Anime-Style Combat Presentation

**User Story:** As a player, I want dramatic DBZ/Kill La Kill-style combat clashes, so that combat feels cinematic and hides technical limitations.

#### Acceptance Criteria

1. WHEN combatants enter proximity range (<2.5 units), THE System SHALL trigger clash sequence
2. THE System SHALL spawn massive GPU particle explosions (20,000 particles) at clash midpoint
3. THE System SHALL apply camera shake with configurable intensity and duration
4. THE System SHALL implement screen flash effects using post-processing or glow layers
5. THE System SHALL play "powerup" animations for both combatants during clash
6. THE System SHALL apply knockback tweens pushing combatants apart after clash
7. THE System SHALL obscure character models completely during explosion for 1-2 seconds

### Requirement 8: JRPG HUD and UI System

**User Story:** As a player, I want a comprehensive JRPG-style HUD with status bars, command menus, and quest tracking, so that I have clear feedback on game state.

#### Acceptance Criteria

1. THE System SHALL render fullscreen 2D GUI overlay using BabylonJS AdvancedDynamicTexture
2. WHEN in combat, THE System SHALL display top status panel with HP/MP bars for player and visible enemies
3. THE System SHALL display bottom command panel with Attack/Skill/Item/Defend buttons during turn-based combat
4. THE System SHALL show floating damage popups that animate upward and fade out
5. THE System SHALL display quest log panel with active main/side quests and objectives
6. THE System SHALL implement dialogue box overlay with character portraits for visual novel-style conversations
7. THE System SHALL provide minimap showing current area layout and player position
8. THE System SHALL use faction-themed colors (Kurenai crimson/gold, Azure cobalt/silver) for UI elements

### Requirement 9: Procedural Quest Generation System

**User Story:** As a player, I want varied quests generated from grammar tables, so that exploration feels fresh and aligned with my choices.

#### Acceptance Criteria

1. THE System SHALL generate quests using noun-verb-adjective grammar templates
2. WHEN generating a quest cluster, THE System SHALL create 1 main quest, 3-6 side quests, and 0-1 secret quest
3. THE System SHALL bias verb selection based on player alignment (Azure: negotiate/secure, Kurenai: sabotage/destroy)
4. THE System SHALL use deterministic seeded randomization for reproducible quest generation
5. WHEN a quest is completed, THE System SHALL apply alignment shift based on quest type
6. THE System SHALL track completed quests and prevent duplicate generation
7. THE System SHALL reward XP, items, and unlocks upon quest completion

### Requirement 10: Narrative and Dialogue System

**User Story:** As a player, I want visual novel-style dialogue with character portraits and branching choices, so that I feel immersed in the story.

#### Acceptance Criteria

1. THE System SHALL display dialogue overlay with semi-transparent background during conversations
2. WHEN dialogue triggers, THE System SHALL show character portraits for speaker and listener
3. THE System SHALL support branching dialogue trees with player choice nodes
4. THE System SHALL track dialogue history and prevent replaying seen conversations
5. THE System SHALL integrate dialogue triggers at specific stage distance markers
6. THE System SHALL support cutscene dialogue with camera control and character animations
7. THE System SHALL load dialogue content from JSON data files with GenAI-generated text

### Requirement 11: Asset Generation Pipeline

**User Story:** As a developer, I want automated GenAI asset generation using Meshy AI, so that I can produce production-quality 3D models without manual modeling.

#### Acceptance Criteria

1. THE System SHALL generate character models using Meshy AI text-to-3D pipeline
2. WHEN generating a character, THE System SHALL apply consistent style prompts for visual cohesion
3. THE System SHALL auto-rig generated characters using Meshy's rigging presets
4. THE System SHALL generate 7 animations for hero characters and 5 for enemy characters
5. THE System SHALL export all assets as GLB format with embedded textures
6. THE System SHALL validate generated assets against manifest.json schema
7. THE System SHALL track asset generation status and retry failed generations

### Requirement 12: Mobile Deployment with Capacitor

**User Story:** As a player, I want to play on iOS and Android devices, so that I can enjoy the game on mobile platforms.

#### Acceptance Criteria

1. THE System SHALL build as a Capacitor-wrapped native app for iOS and Android
2. WHEN the app launches on mobile, THE System SHALL detect device capabilities and adjust quality settings
3. THE System SHALL implement touch controls with virtual joystick and action buttons
4. THE System SHALL support device orientation changes and safe area insets
5. THE System SHALL integrate Capacitor haptics for combat feedback
6. THE System SHALL maintain 60 FPS on Pixel 8a and equivalent mid-range devices
7. THE System SHALL handle app lifecycle events (pause, resume, background)

### Requirement 13: Save System and Persistence

**User Story:** As a player, I want to save my progress and resume later, so that I don't lose my game state.

#### Acceptance Criteria

1. THE System SHALL save game state to localStorage including player stats, inventory, quest progress, and stage completion
2. WHEN the player quits, THE System SHALL auto-save current state
3. THE System SHALL provide manual save points at stage transitions
4. THE System SHALL load saved state on application startup
5. THE System SHALL support multiple save slots (minimum 3)
6. THE System SHALL validate save data integrity and handle corrupted saves gracefully
7. THE System SHALL export/import save data for backup and transfer

### Requirement 14: Performance and Optimization

**User Story:** As a player, I want smooth 60 FPS gameplay on mobile devices, so that the experience feels responsive.

#### Acceptance Criteria

1. THE System SHALL maintain 60 FPS on Pixel 8a during normal gameplay
2. WHEN rendering hex grid, THE System SHALL use thin instances to minimize draw calls
3. THE System SHALL implement LOD (Level of Detail) for distant objects
4. THE System SHALL lazy-load stage assets and unload unused assets
5. THE System SHALL limit active particle systems to prevent performance degradation
6. THE System SHALL profile frame time and log performance warnings when exceeding 16.67ms
7. THE System SHALL provide quality settings (low/medium/high) for player adjustment

### Requirement 15: Testing and Quality Assurance

**User Story:** As a developer, I want comprehensive test coverage with property-based tests, so that I ensure correctness across all inputs.

#### Acceptance Criteria

1. THE System SHALL implement property-based tests for all core game logic systems
2. WHEN running property tests, THE System SHALL execute minimum 100 iterations per property
3. THE System SHALL implement unit tests for specific examples and edge cases
4. THE System SHALL achieve >80% code coverage for game logic systems
5. THE System SHALL run E2E tests using Playwright for critical user flows
6. THE System SHALL validate all stages are completable without blocking bugs
7. THE System SHALL test on physical devices (Pixel 8a, OnePlus Open) before release

### Requirement 16: Accessibility and Localization

**User Story:** As a player, I want accessible controls and localized text, so that the game is inclusive.

#### Acceptance Criteria

1. THE System SHALL provide configurable control schemes (keyboard, gamepad, touch)
2. WHEN displaying text, THE System SHALL support minimum 48dp touch targets for mobile
3. THE System SHALL implement colorblind-friendly UI modes
4. THE System SHALL support text scaling for readability
5. THE System SHALL provide subtitle options for all dialogue
6. THE System SHALL prepare localization framework for future language support
7. THE System SHALL include accessibility settings menu

### Requirement 17: Audio and Music System

**User Story:** As a player, I want immersive audio with stage-specific music and combat sound effects, so that the experience feels polished.

#### Acceptance Criteria

1. THE System SHALL play background music tracks for each stage theme (neon, dark, sunset)
2. WHEN combat starts, THE System SHALL transition to combat music
3. THE System SHALL play sound effects for attacks, hits, and special abilities
4. THE System SHALL implement spatial audio for 3D positioned sounds
5. THE System SHALL provide volume controls for music, SFX, and voice separately
6. THE System SHALL support audio ducking during dialogue
7. THE System SHALL preload audio assets to prevent playback delays

### Requirement 18: Analytics and Telemetry

**User Story:** As a developer, I want gameplay analytics, so that I can understand player behavior and improve the game.

#### Acceptance Criteria

1. THE System SHALL track stage completion rates and average completion times
2. WHEN a player dies, THE System SHALL log death location and cause
3. THE System SHALL track quest completion rates and abandonment
4. THE System SHALL measure average session length and retention
5. THE System SHALL log performance metrics (FPS, load times, memory usage)
6. THE System SHALL respect player privacy and provide opt-out for analytics
7. THE System SHALL aggregate analytics data without collecting PII

### Requirement 19: Content Validation and Quality Gates

**User Story:** As a developer, I want automated quality gates, so that broken content doesn't reach production.

#### Acceptance Criteria

1. THE System SHALL validate all manifest.json files against schema before build
2. WHEN loading assets, THE System SHALL verify GLB file integrity and log errors
3. THE System SHALL check for missing animations and provide fallbacks
4. THE System SHALL validate dialogue JSON structure and required fields
5. THE System SHALL run linting (Biome) and type-checking (TypeScript strict) in CI/CD
6. THE System SHALL execute all tests in CI/CD and block merge on failures
7. THE System SHALL generate build reports with asset sizes and bundle analysis

### Requirement 20: Documentation and Developer Experience

**User Story:** As a developer, I want comprehensive documentation, so that I can understand and extend the codebase.

#### Acceptance Criteria

1. THE System SHALL provide README with setup instructions and architecture overview
2. WHEN adding new systems, THE System SHALL include inline JSDoc comments
3. THE System SHALL maintain up-to-date design documents in docs/ directory
4. THE System SHALL provide code examples for common tasks (adding stages, enemies, quests)
5. THE System SHALL document GenAI pipeline usage and asset generation workflow
6. THE System SHALL include troubleshooting guide for common issues
7. THE System SHALL maintain changelog with version history and breaking changes
