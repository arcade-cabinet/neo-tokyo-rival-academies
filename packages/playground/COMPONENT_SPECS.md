# Component Specifications & Acceptance Criteria

Every component in this playground MUST pass its acceptance checklist before being considered complete.
**NO EXCEPTIONS. NO "IT RUNS" BULLSHIT.**

---

## Wall Component

### Visual Requirements
1. Wall segment must be a clearly defined rectangular solid
2. Material variations must be VISUALLY DISTINCT:
   - **Concrete**: Grey, matte, minimal specular
   - **Metal**: Darker grey, subtle shine/specular
   - **Glass**: Translucent (alpha < 1.0), blue-ish tint
   - **Brick**: Reddish-brown, matte
3. Condition variations must show CLEAR degradation:
   - **Pristine**: Full color saturation
   - **Worn**: ~15% darker
   - **Damaged**: ~30% darker, visual distinction
   - **Ruined**: ~50% darker
4. Windows (if enabled):
   - Must form a GRID pattern
   - Must be RECESSED or PROUD from wall surface
   - Emissive windows must GLOW with warm interior light
   - Non-emissive windows must be dark/reflective
5. Neon accent (if enabled):
   - Must be positioned at TOP of wall
   - Must EMIT LIGHT (emissiveColor set)
   - Color must match specified Color3
6. Rotation must work correctly around Y-axis

### Acceptance Checklist

- [ ] **ACW-001**: Concrete wall renders with grey matte appearance
- [ ] **ACW-002**: Metal wall has visible specular highlight (shiny)
- [ ] **ACW-003**: Glass wall is TRANSLUCENT (can see grid through it)
- [ ] **ACW-004**: Brick wall has distinct reddish-brown color
- [ ] **ACW-005**: Pristine vs Ruined shows OBVIOUS color difference (side by side)
- [ ] **ACW-006**: Windows form a proper 3x4 grid on main wall
- [ ] **ACW-007**: Emissive windows GLOW (warm yellow/orange)
- [ ] **ACW-008**: Neon strip is positioned at TOP of wall
- [ ] **ACW-009**: Neon strip GLOWS (emissive visible in scene)
- [ ] **ACW-010**: Rotated wall (45°) is correctly angled
- [ ] **ACW-011**: Different seeds produce DIFFERENT color variations
- [ ] **ACW-012**: FPS remains > 55 with all test walls visible

### Screenshot Verification Points
1. Take screenshot with all materials visible (concrete, metal, glass, brick)
2. Take screenshot comparing pristine vs ruined condition
3. Take screenshot showing emissive windows at night exposure
4. Take screenshot showing neon glow
5. Take screenshot of rotated wall from multiple angles

---

## Floor / Ground Component

### Visual Requirements
1. Ground plane is FLAT at y=0
2. Material variations:
   - **Asphalt**: Dark grey/black, road texture feel
   - **Concrete**: Lighter grey, industrial
   - **Metal grating**: Visible holes/pattern, semi-transparent
   - **Tile**: Grid pattern visible
3. Wet surface option shows REFLECTION
4. Damage/cracks option shows visible surface breaks
5. Puddles (if enabled) are REFLECTIVE areas

### Acceptance Checklist
- [ ] **ACF-001**: Floor sits exactly at y=0
- [ ] **ACF-002**: Asphalt is darker than concrete
- [ ] **ACF-003**: Metal grating has visible holes/transparency
- [ ] **ACF-004**: Wet surface shows environment reflection
- [ ] **ACF-005**: Puddles are distinct reflective areas
- [ ] **ACF-006**: Floor receives shadows from objects above

---

## Roof Component

### Visual Requirements
1. Roof sits at TOP of building
2. Flat roof option is perfectly horizontal
3. AC units/vents are distinct 3D objects
4. Antenna/aerial elements visible if enabled
5. Access hatch visible if enabled
6. Edge lip/parapet visible

### Acceptance Checklist
- [ ] **ACR-001**: Roof plane is horizontal
- [ ] **ACR-002**: AC unit boxes are 3D, not flat
- [ ] **ACR-003**: Antenna/aerial has vertical element
- [ ] **ACR-004**: Edge parapet creates visible lip
- [ ] **ACR-005**: Roof material differs from wall material

---

## Building (Assembled)

### Visual Requirements
1. Building is composed of: walls + roof + base
2. All walls CONNECT at corners (no gaps)
3. Windows align across wall segments
4. Roof covers ENTIRE top (no gaps at edges)
5. Ground floor shows entry door/storefront
6. Building casts proper shadow

### Acceptance Checklist
- [ ] **ACB-001**: No visible gaps between wall segments
- [ ] **ACB-002**: Roof fully covers building top
- [ ] **ACB-003**: Ground floor has distinct entry area
- [ ] **ACB-004**: Shadow is correct shape (matches building silhouette)
- [ ] **ACB-005**: Different seeds produce different building configs
- [ ] **ACB-006**: Building height matches specified floors

---

## Neon Sign Component

### Visual Requirements
1. Sign geometry is clearly readable shape
2. Sign EMITS LIGHT (glow visible)
3. Sign illuminates nearby surfaces
4. Flicker option shows visible brightness variation
5. Multiple colors available and distinct

### Acceptance Checklist
- [ ] **ACN-001**: Sign shape is recognizable
- [ ] **ACN-002**: Emissive glow is visible
- [ ] **ACN-003**: Nearby wall shows color cast from sign
- [ ] **ACN-004**: Flicker produces visible brightness changes
- [ ] **ACN-005**: Color options are all visually distinct

---

## Street Segment Component

### Visual Requirements
1. Street is FLAT road surface
2. Lane markings are VISIBLE
3. Sidewalk is ELEVATED (higher than road)
4. Curb shows clear edge between road and sidewalk
5. Street lights positioned correctly

### Acceptance Checklist
- [ ] **ACS-001**: Road surface is dark asphalt color
- [ ] **ACS-002**: Lane markings are white/yellow, visible
- [ ] **ACS-003**: Sidewalk is lighter color than road
- [ ] **ACS-004**: Sidewalk is elevated ~0.15m above road
- [ ] **ACS-005**: Street lights emit visible light
- [ ] **ACS-006**: Storm drains/grates visible at curb

---

## Farground (Distant Layer)

### Visual Requirements
1. Silhouette buildings at z < -30
2. NO detail (just shapes/mass)
3. Fog/atmosphere makes distant objects hazier
4. Does NOT interfere with gameplay (no collision)
5. Variety of building heights

### Acceptance Checklist
- [ ] **ACFG-001**: Buildings are clearly BEHIND playable area
- [ ] **ACFG-002**: No fine detail visible (just shapes)
- [ ] **ACFG-003**: Atmospheric haze increases with distance
- [ ] **ACFG-004**: Height variation is visible in skyline
- [ ] **ACFG-005**: Performance impact is minimal (< 5% FPS drop)

---

## Hero Walk/Run Mechanics

### Visual Requirements
1. Character moves in WASD directions
2. Walk animation plays during movement
3. Idle animation plays when stopped
4. Movement is SMOOTH (no jitter)
5. Character faces movement direction

### Acceptance Checklist
- [ ] **ACH-001**: W key moves character forward (+Z or +Y depending on camera)
- [ ] **ACH-002**: S key moves character backward
- [ ] **ACH-003**: A key moves character left
- [ ] **ACH-004**: D key moves character right
- [ ] **ACH-005**: Walk animation loops smoothly
- [ ] **ACH-006**: Character rotates to face movement direction
- [ ] **ACH-007**: Diagonal movement is normalized (not faster)
- [ ] **ACH-008**: Idle animation plays when no input

---

## Platform / Jump Mechanics

### Visual Requirements
1. Platform is solid surface at elevated Y
2. Character can LAND on platform
3. Character falls off platform edge (gravity)
4. Jump has clear arc trajectory
5. Landing has visual feedback

### Acceptance Checklist
- [ ] **ACP-001**: Platform surface is solid (no fall-through)
- [ ] **ACP-002**: Character lands on platform when jumping to it
- [ ] **ACP-003**: Character falls when walking off edge
- [ ] **ACP-004**: Jump arc looks natural (parabolic)
- [ ] **ACP-005**: Jump height is consistent

---

## Water / Puddle Interaction

### Visual Requirements
1. Water surface is REFLECTIVE
2. Water surface shows ripple distortion
3. Character interaction creates splash
4. Shallow water (puddle) vs deep water visually different

### Acceptance Checklist
- [ ] **ACW-001**: Water reflects environment/sky
- [ ] **ACW-002**: Surface has subtle animation/movement
- [ ] **ACW-003**: Walking through water creates splash particles
- [ ] **ACW-004**: Puddle is shallow (character walks through)
- [ ] **ACW-005**: Deep water has different visual treatment

---

## Cell Generation (Single Cell)

### Visual Requirements
1. Cell is exactly CELL_SIZE (20m) square
2. Content matches cell type (building/street/plaza/etc)
3. District theme affects colors and style
4. Seed produces IDENTICAL cell every time

### Acceptance Checklist
- [ ] **ACC-001**: Cell dimensions are exactly 20x20 meters
- [ ] **ACC-002**: Building cell has building geometry
- [ ] **ACC-003**: Street cell has road surface
- [ ] **ACC-004**: Plaza cell has open area with features
- [ ] **ACC-005**: Same seed regenerates identical cell

---

## Cell Streaming System

### Visual Requirements
1. Cells load around player position
2. Cells unload beyond UNLOAD_RADIUS
3. No visible pop-in (smooth LOD)
4. No stuttering during load/unload

### Acceptance Checklist
- [ ] **ACST-001**: Only cells within LOAD_RADIUS are visible
- [ ] **ACST-002**: Moving player triggers cell loading
- [ ] **ACST-003**: Cells unload when player moves away
- [ ] **ACST-004**: No frame drops during streaming
- [ ] **ACST-005**: Memory stays stable (no leaks)

---

---

## PHYSICS & COLLISION BUG CHECKLIST

**EVERY component with collision or physics MUST pass these checks:**

### The "Half-Life 1" Tests
- [ ] **PHY-001**: Player cannot clip through walls at ANY speed
- [ ] **PHY-002**: Player cannot fall through floor at ANY position
- [ ] **PHY-003**: Player cannot get stuck ON ceiling
- [ ] **PHY-004**: Player cannot get stuck INSIDE geometry
- [ ] **PHY-005**: No "infinite velocity" glitches (flying at 800 MPH)
- [ ] **PHY-006**: Object pickup doesn't cause player to fly
- [ ] **PHY-007**: Collision shapes MATCH visual geometry (no invisible walls)
- [ ] **PHY-008**: Collision shapes don't EXTEND beyond visual geometry

### Gap Detection Tests
- [ ] **GAP-001**: No visible seams between adjacent walls
- [ ] **GAP-002**: No visible seams between floor tiles
- [ ] **GAP-003**: Roof meets walls with no visible gap
- [ ] **GAP-004**: Buildings meet ground with no floating/sinking
- [ ] **GAP-005**: Corner connections are seamless

### Edge Case Stress Tests
- [ ] **EDGE-001**: Running diagonally into corners doesn't break
- [ ] **EDGE-002**: Jumping into ceiling doesn't break
- [ ] **EDGE-003**: Walking along wall edges is smooth
- [ ] **EDGE-004**: Multiple collision shapes don't compound/stack weirdly
- [ ] **EDGE-005**: Moving through doorways/openings is smooth

### How to Test
1. **Walk test**: Walk at all walls from all angles
2. **Run test**: Sprint at all surfaces from all angles
3. **Jump test**: Jump at/near all surfaces
4. **Corner test**: Walk into every corner
5. **Edge test**: Walk along every edge
6. **Spam test**: Rapidly change direction while against surfaces
7. **Duration test**: Leave running for 5+ minutes, check for drift

### The "Flower Pot Test"
If your game has physics objects:
- [ ] Picking up objects doesn't accelerate player
- [ ] Throwing objects doesn't accelerate player
- [ ] Stacking objects doesn't create instability
- [ ] Objects don't phase through each other
- [ ] Objects don't suddenly explode velocity

---

## Verification Process

For EACH component:
1. Run the test page
2. Take screenshots for each verification point
3. Go through acceptance checklist item by item
4. **Run ALL applicable physics tests**
5. ANY failed item = component NOT COMPLETE
6. Fix and re-verify until ALL pass
7. Document which screenshot proves each criteria

**THIS IS NOT OPTIONAL. HALF-ASSED COMPONENTS WILL BREAK THE GAME.**

## Bug Severity Levels

- **CRITICAL**: Player clips through floor/walls, infinite velocity, game-breaking
- **HIGH**: Visible gaps, collision extends beyond geometry, stuck spots
- **MEDIUM**: Minor visual seams, edge case only issues
- **LOW**: Cosmetic only, doesn't affect gameplay

**CRITICAL and HIGH bugs must be fixed before component is marked complete.**
