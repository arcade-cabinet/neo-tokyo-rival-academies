# Scene 1: Sector 7 Rooftop - Design Document

**Stage ID**: `sector7_streets`
**Theme**: Neon
**Purpose**: Tutorial level, introduce mechanics

## Layer Composition (Front to Back)

### Layer 1: Foreground (z: 0 to -5)
**Playable area where Kai moves**

- **Hex Grid Floor**: 20x20 tiles
  - Tile types: base, airvent, pipes, generator, antenna, edge
  - Tiles MUST tessellate without gaps (fix cylinder to proper hex prism)
  - Height variation: base=0, airvent=0.3, pipes=0.2

- **Foreground Props** (on specific tiles):
  - AC units (3-4 scattered)
  - Pipe clusters
  - Barrier fences at edges
  - Steam vents (animated particles)

- **Interactive Objects**:
  - Quest marker crystals (glowing)
  - Data shard pickups
  - Health items

### Layer 2: Midground (z: -5 to -20)
**3D building facades that frame the playable area**

- **Left Side**: Building facade with neon signs
  - 3D mesh, not just texture
  - Windows with interior glow
  - "ARCADE" sign visible

- **Right Side**: Matching building facade
  - Different signage
  - Fire escape structure
  - Rooftop water tank

- **Back Edge**: Lower rooftop behind playable area
  - Shows depth
  - Vera can be seen running ahead here

### Layer 3: Background (z: -20 to -60)
**2.5D parallax cityscape**

- **Near Buildings** (z: -25):
  - Mid-rise buildings with lit windows
  - Slight 3D depth

- **Far Skyline** (z: -45):
  - Neo-Tokyo skyscrapers
  - Orbital elevator visible
  - Holographic billboards

- **Sky** (z: -60):
  - Night sky with light pollution glow
  - Rain particles
  - Distant lightning flashes

## Camera Setup

```
Isometric Camera:
- Alpha: π/4 (45°)
- Beta: π/3 (60°)
- Ortho size: 21
- DOF:
  - Focus plane: z=0 (player)
  - Near blur: z < -10
  - Far blur: z > -30
```

## Interactions

### Quest Markers
- Floating crystal above specific hexes
- Pulse animation
- Click/tap to interact
- Triggers dialogue or objective

### Data Shards
- Collectible pickups
- Auto-collect on walk-over
- UI counter update

### NPCs
- Yakuza Grunt patrol routes
- Aggro radius: 3 hexes
- Combat triggers when entered

## Entry Animation
1. Fade in from black
2. Kai drops onto center hex from above
3. Landing impact particles
4. Camera settles
5. Quest objective appears

## Exit Trigger
- North edge of grid
- Transition zone (last 2 rows)
- Visual indicator: glowing arrows
- Walk into zone → stage transition

## Assets Required

### 3D Models (Meshy Generate)
1. `props/ac_unit.glb` - Rooftop AC unit
2. `props/barrier_fence.glb` - Metal barrier
3. `props/pipe_cluster.glb` - Industrial pipes
4. `props/water_tank.glb` - Rooftop water tank
5. `props/neon_sign.glb` - Generic neon sign
6. `buildings/facade_left.glb` - Building facade
7. `buildings/facade_right.glb` - Building facade

### Textures (Existing)
- parallax_far/concept.png ✓
- parallax_mid/concept.png ✓
- wall_left/concept.png ✓
- wall_right/concept.png ✓

### Particles
- Steam vent spray
- Rain drops
- Neon sign flicker

## Implementation Order

1. Fix hex geometry (prism not cylinder)
2. Add midground building facades
3. Place foreground props
4. Add interaction system
5. Add quest markers
6. Add entry/exit animations
7. Polish with particles/DOF
