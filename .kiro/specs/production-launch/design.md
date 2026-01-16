# Design Document: Neo-Tokyo Rival Academies - Production Launch

## Overview

This design document specifies the complete architecture for the production-ready implementation of Neo-Tokyo: Rival Academies. The system migrates from Three.js to BabylonJS with Reactylon, implements comprehensive JRPG mechanics, and delivers a polished 3-hour gameplay experience across 9 stages with full A/B/C story integration.

### Key Design Decisions

1. **BabylonJS Migration**: Chosen for RecastJS navigation mesh support, enabling complex AI behaviors (8 independent tentacle agents)
2. **Reactylon Integration**: Maintains React component model while leveraging BabylonJS performance
3. **Procedural Character Generation**: Eliminates dependency on external modeling, enables rapid iteration
4. **Property-Based Testing**: Ensures correctness across all input spaces, not just examples
5. **Mobile-First**: Targets Pixel 8a as baseline, optimizes for 60 FPS on mid-range devices

## Architecture

### System Layers

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  (React Components, BabylonJS GUI, Reactylon Scene Graph)   │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      Game Logic Layer                        │
│     (ECS Systems, Combat, Progression, Quest Generation)    │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      Engine Layer                            │
│  (BabylonJS Engine, RecastJS Navigation, Physics, Audio)    │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                      Platform Layer                          │
│        (Capacitor, Device APIs, Storage, Analytics)         │
└─────────────────────────────────────────────────────────────┘
```

### Data Flow

```
User Input → Input System → ECS World → Game Systems → Render System → BabylonJS → Display
                                ↓
                          State Updates
                                ↓
                          React Components
                                ↓
                          GUI Overlay
```

## Components and Interfaces

### Core Engine Components

#### BabylonEngine
```typescript
interface BabylonEngine {
  scene: BABYLON.Scene;
  engine: BABYLON.Engine;
  camera: BABYLON.ArcRotateCamera;
  
  initialize(canvas: HTMLCanvasElement): Promise<void>;
  dispose(): void;
  resize(): void;
  render(): void;
}
```

#### NavigationSystem
```typescript
interface NavigationSystem {
  plugin: NavigationPlugin;
  crowd: Crowd;
  navMesh: NavMesh;
  
  bakeNavMesh(meshes: AbstractMesh[], params: NavMeshParams): Promise<void>;
  addAgent(position: Vector3, config: AgentConfig): number;
  removeAgent(agentIndex: number): void;
  setAgentTarget(agentIndex: number, target: Vector3): void;
  update(deltaTime: number): void;
}
```

#### HexGridSystem
```typescript
interface HexGridSystem {
  tileSize: number;
  gridSize: { cols: number; rows: number };
  bounds: { minX: number; maxX: number; minZ: number; maxZ: number };
  
  generateGrid(seed: string): HexTile[];
  hexToWorld(col: number, row: number): Vector3;
  worldToHex(position: Vector3): { col: number; row: number };
  snapToHex(position: Vector3): Vector3;
}
```

#### ProceduralCharacterSystem
```typescript
interface ProceduralCharacterSystem {
  createCharacter(params: CharacterParams): AnimeHero;
  updateCharacter(hero: AnimeHero, params: Partial<CharacterParams>): void;
  attachEquipment(hero: AnimeHero, slot: string, mesh: AbstractMesh): void;
  playAnimation(hero: AnimeHero, animName: string, loop: boolean): void;
}

interface CharacterParams {
  gender: 'male' | 'female';
  height: number;
  muscle: number;
  colors: {
    skin: Color3;
    hair: Color3;
    clothes: Color3;
  };
}
```

### Game Logic Components

#### CombatSystem
```typescript
interface CombatSystem {
  calculateDamage(attacker: Stats, defender: Stats): number;
  calculateCritical(attacker: Stats, alignment: number): { isCrit: boolean; multiplier: number };
  calculateHitChance(attacker: Stats, defender: Stats, alignment: number): number;
  triggerClash(combatant1: Entity, combatant2: Entity): Promise<void>;
  applyDamage(target: Entity, amount: number): void;
}

interface Stats {
  structure: number;  // HP/Defense
  ignition: number;   // Attack/Crit
  logic: number;      // Skills/Resource
  flow: number;       // Speed/Evasion
}
```

#### ProgressionSystem
```typescript
interface ProgressionSystem {
  gainXP(entity: Entity, amount: number): void;
  checkLevelUp(entity: Entity): boolean;
  applyLevelUp(entity: Entity): void;
  allocateStatPoint(entity: Entity, stat: keyof Stats): void;
  equipItem(entity: Entity, item: Equipment, slot: EquipmentSlot): void;
}

interface Equipment {
  id: string;
  name: string;
  slot: EquipmentSlot;
  statModifiers: Partial<Stats>;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic';
}
```

#### QuestSystem
```typescript
interface QuestSystem {
  generateCluster(seed: string, profile: DistrictProfile, alignment: number): QuestCluster;
  completeQuest(questId: string): void;
  trackProgress(questId: string, progress: number): void;
  getActiveQuests(): Quest[];
}

interface Quest {
  id: string;
  title: string;
  description: string;
  type: 'main' | 'side' | 'secret';
  alignmentShift: number;
  reward: QuestReward;
  completed: boolean;
}
```

## Data Models

### Entity Component System

```typescript
// Core entity structure
interface Entity {
  id: string;
  position: Vector3;
  rotation: Vector3;
  mesh?: AbstractMesh;
  
  // Components
  stats?: Stats;
  combat?: CombatComponent;
  navigation?: NavigationComponent;
  animation?: AnimationComponent;
  inventory?: InventoryComponent;
}

interface CombatComponent {
  health: number;
  maxHealth: number;
  resource: number;
  maxResource: number;
  inCombat: boolean;
  target?: Entity;
}

interface NavigationComponent {
  agentIndex: number;
  speed: number;
  target?: Vector3;
  path?: Vector3[];
}

interface AnimationComponent {
  currentAnimation: string;
  animationGroups: AnimationGroup[];
  isPlaying: boolean;
}
```

### Stage System

```typescript
interface Stage {
  id: string;
  name: string;
  type: 'cutscene' | 'platformer' | 'boss' | 'runner';
  theme: 'neon' | 'dark' | 'sunset';
  length: number;
  enemies: EnemySpawn[];
  triggers: StageTrigger[];
  nextStage?: string;
}

interface EnemySpawn {
  type: string;
  position: Vector3;
  level: number;
  behavior: 'patrol' | 'chase' | 'stationary';
}

interface StageTrigger {
  type: 'distance' | 'combat' | 'dialogue' | 'c-story';
  condition: TriggerCondition;
  action: TriggerAction;
}
```

### Save System

```typescript
interface SaveData {
  version: string;
  timestamp: number;
  player: {
    stats: Stats;
    level: number;
    xp: number;
    position: Vector3;
    inventory: Equipment[];
    alignment: number;
  };
  progress: {
    currentStage: string;
    completedStages: string[];
    completedQuests: string[];
    unlockedAreas: string[];
  };
  settings: GameSettings;
}
```

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Hex Grid Determinism
*For any* seed value, generating the hex grid twice should produce identical tile positions and types.

**Validates: Requirements 2.2**

### Property 2: Hex Coordinate Round Trip
*For any* world position, converting to hex coordinates then back to world coordinates should snap to the nearest hex center.

**Validates: Requirements 2.5**

### Property 3: Tile Bounds Constraint
*For any* rectangular bounds, all generated hex tiles should have positions within those bounds.

**Validates: Requirements 2.6**

### Property 4: Navigation Agent Collision Avoidance
*For any* two agents on collision course, their steering should result in separation maintaining minimum radius.

**Validates: Requirements 3.3**

### Property 5: Agent Target Update
*For any* player position change, all chase-behavior agents should have their targets updated to the new position.

**Validates: Requirements 3.5**

### Property 6: Character Gender Morphing
*For any* character with gender parameter changed, shoulder width and proportions should adjust according to gender-specific ratios.

**Validates: Requirements 4.2**

### Property 7: Bone Hierarchy Integrity
*For any* procedurally generated character, all bones should form a valid hierarchy with root bone as ancestor of all limb bones.

**Validates: Requirements 4.5**

### Property 8: Equipment Slot Parenting
*For any* bone name and equipment mesh, parenting the mesh to the bone should result in the mesh following bone transformations.

**Validates: Requirements 4.7**

### Property 9: Stage Progression Determinism
*For any* completed stage, the next stage should be determined by the stage's nextStage property or progression rules.

**Validates: Requirements 5.2**

### Property 10: Stage Completion Idempotence
*For any* completed stage, marking it complete multiple times should not change the completion state or trigger multiple rewards.

**Validates: Requirements 5.5**

### Property 11: Asset Loading Isolation
*For any* stage, loading that stage's assets should not load assets from other stages.

**Validates: Requirements 5.6**

### Property 12: Damage Calculation Bounds
*For any* attacker and defender stats, calculated damage should be within the range: `max(1, floor(attacker.ignition * 2 - defender.structure * 0.5)) ± 10%`.

**Validates: Requirements 6.2**

### Property 13: Damage Number Screen Projection
*For any* 3D world position and damage amount, a GUI element should be created at the correct 2D screen position.

**Validates: Requirements 6.3**

### Property 14: Level-Up Threshold
*For any* XP amount and current level, level-up should trigger if and only if `XP >= (level + 1)² * 100`.

**Validates: Requirements 6.4**

### Property 15: Stat Point Allocation
*For any* level-up event, available stat points should increase by exactly 2.

**Validates: Requirements 6.5**

### Property 16: Critical Hit Probability
*For any* Ignition stat and alignment value, critical hit chance should be calculated as `min(0.5, ignition * 0.01 + alignmentBonus)`.

**Validates: Requirements 6.6**

### Property 17: Hit Chance Calculation
*For any* attacker and defender Flow stats, hit chance should be `max(0.3, min(0.95, 0.8 + (attackerFlow - defenderFlow) * 0.05))`.

**Validates: Requirements 6.7**

### Property 18: Equipment Stat Modification
*For any* equipment with stat modifiers, equipping it should increase stats by the modifier amounts, and unequipping should decrease by the same amounts.

**Validates: Requirements 6.8**

### Property 19: Clash Proximity Trigger
*For any* two combatants, if their distance is less than 2.5 units, a clash sequence should trigger.

**Validates: Requirements 7.1**

### Property 20: Clash Particle Position
*For any* clash between two combatants, the particle system should spawn at the midpoint between their positions.

**Validates: Requirements 7.2**

### Property 21: Camera Shake Parameters
*For any* shake intensity and duration, camera position should deviate by at most intensity units for duration frames.

**Validates: Requirements 7.3**

### Property 22: Clash Animation Synchronization
*For any* clash event, both combatants should have their "powerup" animation playing simultaneously.

**Validates: Requirements 7.5**

### Property 23: Knockback Distance
*For any* clash event, combatants should be separated by a minimum distance after knockback completes.

**Validates: Requirements 7.6**

### Property 24: Quest Log Visibility
*For any* active quest, it should appear in the quest log GUI panel.

**Validates: Requirements 8.5**

### Property 25: Dialogue Portrait Matching
*For any* dialogue event, the displayed portrait should match the speaker's character ID.

**Validates: Requirements 8.6**

### Property 26: Minimap Position Accuracy
*For any* player position, the minimap marker should be at the corresponding scaled position on the minimap.

**Validates: Requirements 8.7**

### Property 27: Quest Grammar Structure
*For any* generated quest, the title and description should match one of the defined grammar templates.

**Validates: Requirements 9.1**

### Property 28: Quest Cluster Composition
*For any* quest cluster generation, the result should contain exactly 1 main quest, between 3-6 side quests, and 0-1 secret quest.

**Validates: Requirements 9.2**

### Property 29: Alignment-Based Verb Bias
*For any* alignment value, verb selection probability should favor Azure verbs when alignment > 0.3 and Kurenai verbs when alignment < -0.3.

**Validates: Requirements 9.3**

### Property 30: Quest Generation Determinism
*For any* seed value, generating quests twice should produce identical quest text and properties.

**Validates: Requirements 9.4**

### Property 31: Quest Completion Alignment Shift
*For any* quest with alignmentShift value, completing it should change player alignment by exactly that amount (clamped to [-1, 1]).

**Validates: Requirements 9.5**

### Property 32: Quest Deduplication
*For any* completed quest ID, it should not appear in subsequent quest cluster generations.

**Validates: Requirements 9.6**

### Property 33: Quest Reward Granting
*For any* quest with defined rewards, completing it should grant all specified rewards (XP, items, unlocks).

**Validates: Requirements 9.7**

### Property 34: Dialogue Portrait Display
*For any* dialogue with speaker and listener, both character portraits should be displayed in correct positions.

**Validates: Requirements 10.2**

### Property 35: Dialogue Branch Navigation
*For any* dialogue choice node, selecting an option should navigate to the branch specified by that choice.

**Validates: Requirements 10.3**

### Property 36: Dialogue History Tracking
*For any* seen dialogue ID, it should be marked as seen and not replay unless explicitly reset.

**Validates: Requirements 10.4**

### Property 37: Distance-Based Dialogue Triggers
*For any* dialogue trigger with distance threshold, dialogue should activate when player distance exceeds that threshold.

**Validates: Requirements 10.5**

### Property 38: Dialogue Content Loading
*For any* dialogue ID, content should be loaded from the corresponding entry in dialogue JSON data.

**Validates: Requirements 10.7**

### Property 39: Character Generation Style Consistency
*For any* character generation request, the prompt should include all defined style keywords for visual cohesion.

**Validates: Requirements 11.2**

### Property 40: Animation Count by Character Type
*For any* character generation, hero characters should receive 7 animations and enemy characters should receive 5 animations.

**Validates: Requirements 11.4**

### Property 41: Asset Export Format
*For any* generated asset, the exported file should be in GLB format with embedded textures.

**Validates: Requirements 11.5**

### Property 42: Manifest Schema Validation
*For any* asset manifest, it should conform to the defined JSON schema.

**Validates: Requirements 11.6**

### Property 43: Asset Generation Retry
*For any* failed asset generation, the system should retry up to the configured maximum retry count.

**Validates: Requirements 11.7**

### Property 44: Device Capability Quality Adjustment
*For any* detected device capability set, quality settings should be adjusted to match device performance tier.

**Validates: Requirements 12.2**

### Property 45: Orientation Change Layout Adjustment
*For any* device orientation change, GUI layout should recalculate positions and sizes to fit new dimensions.

**Validates: Requirements 12.4**

### Property 46: Lifecycle Event Handling
*For any* app lifecycle event (pause, resume, background), the corresponding handler should execute and update app state.

**Validates: Requirements 12.7**

### Property 47: Save State Round Trip
*For any* game state, saving then loading should restore the state with all properties preserved.

**Validates: Requirements 13.1**

### Property 48: Save State Loading
*For any* valid save data, loading should restore player stats, progress, and settings to saved values.

**Validates: Requirements 13.4**

### Property 49: Save Slot Independence
*For any* two different save slots, modifying one should not affect the other.

**Validates: Requirements 13.5**

### Property 50: Corrupted Save Handling
*For any* corrupted or invalid save data, the system should detect the corruption and not crash.

**Validates: Requirements 13.6**

### Property 51: Save Data Export/Import Round Trip
*For any* save data, exporting then importing should preserve all save state.

**Validates: Requirements 13.7**

## Error Handling

### Error Categories

1. **Asset Loading Errors**: Missing GLB files, invalid manifests, texture loading failures
2. **Navigation Errors**: NavMesh baking failures, agent addition failures, pathfinding errors
3. **Combat Errors**: Invalid stat values, division by zero in calculations, animation not found
4. **Save/Load Errors**: Corrupted save data, localStorage quota exceeded, schema validation failures
5. **Network Errors**: GenAI API failures, timeout errors, rate limiting

### Error Handling Strategy

```typescript
interface ErrorHandler {
  handleAssetError(error: AssetError): void;
  handleNavigationError(error: NavigationError): void;
  handleCombatError(error: CombatError): void;
  handleSaveError(error: SaveError): void;
  handleNetworkError(error: NetworkError): void;
}

// Graceful degradation
class AssetErrorHandler {
  handle(error: AssetError): void {
    if (error.type === 'missing-glb') {
      // Use fallback primitive mesh
      this.useFallbackMesh(error.assetId);
    } else if (error.type === 'invalid-manifest') {
      // Log error and skip asset
      console.error('Invalid manifest:', error.manifestPath);
    }
  }
}
```

## Testing Strategy

### Dual Testing Approach

The system employs both unit testing and property-based testing as complementary strategies:

- **Unit Tests**: Verify specific examples, edge cases, and error conditions
- **Property Tests**: Verify universal properties across all inputs

Both are necessary for comprehensive coverage. Unit tests catch concrete bugs in specific scenarios, while property tests verify general correctness across the input space.

### Property-Based Testing Configuration

**Library**: fast-check (TypeScript property-based testing library)

**Configuration**:
- Minimum 100 iterations per property test
- Each property test references its design document property
- Tag format: `// Feature: production-launch, Property N: [property text]`

**Example Property Test**:
```typescript
import fc from 'fast-check';

// Feature: production-launch, Property 2: Hex Coordinate Round Trip
test('hex coordinate round trip preserves nearest center', () => {
  fc.assert(
    fc.property(
      fc.float({ min: -100, max: 100 }),
      fc.float({ min: -100, max: 100 }),
      (x, z) => {
        const worldPos = new Vector3(x, 0, z);
        const hexCoords = hexGrid.worldToHex(worldPos);
        const snappedPos = hexGrid.hexToWorld(hexCoords.col, hexCoords.row);
        
        // Snapped position should be within one hex radius
        const distance = Vector3.Distance(worldPos, snappedPos);
        expect(distance).toBeLessThanOrEqual(hexGrid.tileSize);
      }
    ),
    { numRuns: 100 }
  );
});
```

### Unit Testing Strategy

Unit tests focus on:
- Specific examples demonstrating correct behavior
- Edge cases (empty inputs, boundary values, maximum values)
- Error conditions (invalid inputs, null values, out-of-range)
- Integration points between components

**Example Unit Test**:
```typescript
// Feature: production-launch, Unit Test: Damage calculation with zero defense
test('damage calculation with zero defense', () => {
  const attacker = { ignition: 10, structure: 10, logic: 10, flow: 10 };
  const defender = { ignition: 10, structure: 0, logic: 10, flow: 10 };
  
  const damage = combatSystem.calculateDamage(attacker, defender);
  
  // Should be attacker.ignition * 2 = 20
  expect(damage).toBeGreaterThanOrEqual(18); // 20 - 10% variance
  expect(damage).toBeLessThanOrEqual(22);    // 20 + 10% variance
});
```

### Test Coverage Goals

- Core game logic: >90% coverage
- UI components: >70% coverage
- Integration tests: All critical user flows
- E2E tests: Complete playthrough of all 9 stages

### Testing Tools

- **Vitest**: Unit and property-based tests
- **fast-check**: Property-based testing library
- **Playwright**: E2E testing
- **BabylonJS Inspector**: Visual debugging and performance profiling

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Frame Rate | 60 FPS | Pixel 8a, normal gameplay |
| Initial Load | <3s | Time to interactive |
| Stage Transition | <500ms | Asset loading time |
| Memory Usage | <200MB | Peak heap size |
| Bundle Size | <2MB | Gzipped production build |
| Asset Load | <500ms | Per character GLB |

## Deployment Architecture

### Build Pipeline

```
Source Code → TypeScript Compilation → Vite Build → Bundle Optimization
                                                            ↓
                                                    Capacitor Sync
                                                            ↓
                                              ┌─────────────┴─────────────┐
                                              ↓                           ↓
                                         iOS Build                  Android Build
                                              ↓                           ↓
                                         App Store              Google Play Store
```

### Asset Pipeline

```
Meshy AI Generation → GLB Export → Validation → Git LFS → Build Integration
```

### Continuous Integration

- **Linting**: Biome on every commit
- **Type Checking**: TypeScript strict mode
- **Unit Tests**: Vitest on every PR
- **E2E Tests**: Playwright on main branch
- **Performance Tests**: Lighthouse CI on release candidates

## Security Considerations

1. **Save Data Integrity**: Validate save data schema before loading
2. **API Key Protection**: Store Meshy API keys in environment variables, never in code
3. **Input Validation**: Sanitize all user inputs before processing
4. **XSS Prevention**: Use React's built-in XSS protection for all user-generated content
5. **Analytics Privacy**: Anonymize all analytics data, provide opt-out

## Accessibility Considerations

1. **Touch Targets**: Minimum 48dp for all interactive elements
2. **Color Contrast**: WCAG AA compliance for all text
3. **Text Scaling**: Support system text size preferences
4. **Subtitles**: Provide subtitles for all dialogue
5. **Colorblind Modes**: Alternative color schemes for common colorblindness types

## Localization Strategy

1. **Text Extraction**: All user-facing text in JSON files
2. **Placeholder System**: Support for variable substitution in translated text
3. **RTL Support**: Layout adjustments for right-to-left languages
4. **Date/Number Formatting**: Locale-aware formatting
5. **Asset Variants**: Support for locale-specific assets (e.g., UI graphics with text)

---

*This design provides the complete technical specification for production launch. All systems are designed for correctness, performance, and maintainability.*
