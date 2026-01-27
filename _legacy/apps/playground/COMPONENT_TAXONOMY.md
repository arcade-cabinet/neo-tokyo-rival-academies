# Component Taxonomy: 100+ Elements for Rich Procedural Generation

**Goal**: Create 100+ components and tests to fully exercise all elements needed for a non-empty procedural open world. Unlike Daggerfall's repetitive emptiness, Neo-Tokyo needs DENSITY and VARIETY.

**Status**: 🔴 In Progress (Current: ~35 items, Target: 100+)

---

## Category Breakdown

### 1. STRUCTURAL PRIMITIVES (20 components)

Basic building blocks that snap together via Daggerfall-style logic.

| # | Component | Status | Test | Description |
|---|-----------|--------|------|-------------|
| 1 | `Wall` | ✅ | ✅ | Basic wall segment |
| 2 | `TexturedWall` | ✅ | ✅ | PBR textured wall |
| 3 | `CornerWall` | ✅ | ✅ | 90° corner piece |
| 4 | `Floor` | ✅ | ✅ | Ground/floor panel |
| 5 | `Roof` | ✅ | ✅ | Roof panel (flat/angled) |
| 6 | `Platform` | ✅ | ✅ | Elevated platform |
| 7 | `Stairs` | 🔴 | 🔴 | Staircase (straight) |
| 8 | `Ramp` | 🔴 | 🔴 | Inclined ramp (accessibility) |
| 9 | `Ladder` | 🔴 | 🔴 | Vertical ladder |
| 10 | `Door` | 🔴 | 🔴 | Doorway with frame |
| 11 | `Window` | 🔴 | 🔴 | Window opening |
| 12 | `Balcony` | 🔴 | 🔴 | Protruding balcony |
| 13 | `FireEscape` | 🔴 | 🔴 | External fire escape |
| 14 | `Catwalk` | 🔴 | 🔴 | Narrow elevated walkway |
| 15 | `Scaffolding` | 🔴 | 🔴 | Construction scaffolding |
| 16 | `Awning` | 🔴 | 🔴 | Shop awning/canopy |
| 17 | `Pillar` | 🔴 | 🔴 | Structural column |
| 18 | `Beam` | 🔴 | 🔴 | Horizontal beam |
| 19 | `Railing` | 🔴 | 🔴 | Safety railing |
| 20 | `Fence` | 🔴 | 🔴 | Fence segment |

### 2. WATER & FLOODED ELEMENTS (15 components)

Unique to our flooded Neo-Tokyo setting.

| # | Component | Status | Test | Description |
|---|-----------|--------|------|-------------|
| 21 | `Water` | ✅ | ✅ | Water surface |
| 22 | `DockingStation` | ✅ | ✅ | Ferry dock |
| 23 | `Pier` | 🔴 | 🔴 | Extended pier/jetty |
| 24 | `Pontoon` | 🔴 | 🔴 | Floating pontoon |
| 25 | `Houseboat` | 🔴 | 🔴 | Floating residence |
| 26 | `FloatingPlatform` | 🔴 | 🔴 | Floating deck/platform |
| 27 | `SubmergedRuin` | 🔴 | 🔴 | Underwater structure |
| 28 | `PartiallySubmerged` | 🔴 | 🔴 | Half-flooded building |
| 29 | `Seawall` | 🔴 | 🔴 | Flood barrier |
| 30 | `DrainagePipe` | 🔴 | 🔴 | Large drainage outflow |
| 31 | `Flotsam` | 🔴 | 🔴 | Floating debris cluster |
| 32 | `WaterStain` | ✅ | ✅ | Decal overlay (in materials) |
| 33 | `AlgaeOverlay` | 🔴 | 🔴 | Green algae decal |
| 34 | `WetSurface` | 🔴 | 🔴 | Wet/reflective shader |
| 35 | `Puddle` | 🔴 | 🔴 | Ground puddle |

### 3. TRANSPORT SYSTEMS (15 components)

Movement infrastructure for the vertical flooded city.

| # | Component | Status | Test | Description |
|---|-----------|--------|------|-------------|
| 36 | `RailPath` | ✅ | ✅ | Monorail track path |
| 37 | `MonorailTrack` | 🔴 | 🔴 | Physical track model |
| 38 | `MonorailStation` | 🔴 | 🔴 | Station platform |
| 39 | `MonorailCar` | 🔴 | 🔴 | Train car |
| 40 | `GondolaCable` | 🔴 | 🔴 | Aerial cable |
| 41 | `GondolaStation` | 🔴 | 🔴 | Cable car station |
| 42 | `GondolaCar` | 🔴 | 🔴 | Cable car cabin |
| 43 | `Bridge` | 🔴 | ✅ | Pedestrian bridge |
| 44 | `ZipLine` | 🔴 | 🔴 | Zip line cable |
| 45 | `Elevator` | 🔴 | 🔴 | Vertical elevator |
| 46 | `Escalator` | 🔴 | 🔴 | Moving escalator |
| 47 | `Walkway` | 🔴 | 🔴 | Enclosed walkway |
| 48 | `Tunnel` | 🔴 | 🔴 | Underground passage |
| 49 | `FerryBoat` | 🔴 | ✅ | Water taxi/ferry |
| 50 | `BoatPath` | 🔴 | 🔴 | Water navigation path |

### 4. SIGNAGE & LIGHTING (15 components)

Cyberpunk atmosphere through neon and holograms.

| # | Component | Status | Test | Description |
|---|-----------|--------|------|-------------|
| 51 | `NeonSign` | ✅ | ✅ | Glowing neon sign |
| 52 | `Billboard` | 🔴 | 🔴 | Large advertisement |
| 53 | `HologramProjector` | 🔴 | 🔴 | 3D hologram display |
| 54 | `StreetLight` | 🔴 | 🔴 | Street lamp |
| 55 | `Spotlight` | 🔴 | 🔴 | Directional spotlight |
| 56 | `EmergencyLight` | 🔴 | 🔴 | Red emergency beacon |
| 57 | `LEDStrip` | 🔴 | 🔴 | Accent LED lighting |
| 58 | `TrafficSignal` | 🔴 | 🔴 | Traffic light |
| 59 | `DirectionalSign` | 🔴 | 🔴 | Wayfinding sign |
| 60 | `ShopSign` | 🔴 | 🔴 | Store front sign |
| 61 | `WarningSign` | 🔴 | 🔴 | Hazard/warning sign |
| 62 | `Graffiti` | 🔴 | 🔴 | Street art decal |
| 63 | `DigitalDisplay` | 🔴 | 🔴 | LCD/LED screen |
| 64 | `LanternString` | 🔴 | 🔴 | Hanging lanterns |
| 65 | `NeonTube` | 🔴 | 🔴 | Raw neon tube |

### 5. URBAN FURNITURE (15 components)

Street-level details that make cities feel alive.

| # | Component | Status | Test | Description |
|---|-----------|--------|------|-------------|
| 66 | `Bench` | 🔴 | 🔴 | Seating bench |
| 67 | `TrashCan` | 🔴 | 🔴 | Garbage bin |
| 68 | `VendingMachine` | 🔴 | 🔴 | Drink/snack machine |
| 69 | `PhoneBooth` | 🔴 | 🔴 | Public phone |
| 70 | `Mailbox` | 🔴 | 🔴 | Post box |
| 71 | `FireHydrant` | 🔴 | 🔴 | Fire hydrant |
| 72 | `Planter` | 🔴 | 🔴 | Street planter |
| 73 | `NewspaperStand` | 🔴 | 🔴 | News kiosk |
| 74 | `ATM` | 🔴 | 🔴 | Cash machine |
| 75 | `BusStop` | 🔴 | 🔴 | Transit shelter |
| 76 | `BikeRack` | 🔴 | 🔴 | Bicycle parking |
| 77 | `StreetArt` | 🔴 | 🔴 | Public sculpture |
| 78 | `Bollard` | 🔴 | 🔴 | Traffic bollard |
| 79 | `ParkingMeter` | 🔴 | 🔴 | Parking payment |
| 80 | `UtilityBox` | 🔴 | 🔴 | Electrical cabinet |

### 6. UTILITIES & INFRASTRUCTURE (15 components)

The gritty details that make cities believable.

| # | Component | Status | Test | Description |
|---|-----------|--------|------|-------------|
| 81 | `PowerLine` | 🔴 | 🔴 | Overhead cables |
| 82 | `UtilityPole` | 🔴 | 🔴 | Telephone/power pole |
| 83 | `Transformer` | 🔴 | 🔴 | Power transformer |
| 84 | `Generator` | 🔴 | 🔴 | Backup generator |
| 85 | `Manhole` | 🔴 | 🔴 | Sewer access |
| 86 | `Grate` | 🔴 | 🔴 | Drainage grate |
| 87 | `Pipe` | 🔴 | 🔴 | Exposed piping |
| 88 | `Vent` | 🔴 | 🔴 | Ventilation grille |
| 89 | `HVACUnit` | 🔴 | 🔴 | Rooftop AC unit |
| 90 | `SatelliteDish` | 🔴 | 🔴 | Satellite receiver |
| 91 | `Antenna` | 🔴 | 🔴 | Communication antenna |
| 92 | `SolarPanel` | 🔴 | 🔴 | Solar array |
| 93 | `WaterTank` | 🔴 | 🔴 | Rooftop water tank |
| 94 | `ACCondenser` | 🔴 | 🔴 | AC outdoor unit |
| 95 | `JunctionBox` | 🔴 | 🔴 | Electrical junction |

### 7. VEGETATION (10 components)

Nature reclaiming the flooded city.

| # | Component | Status | Test | Description |
|---|-----------|--------|------|-------------|
| 96 | `Tree` | 🔴 | 🔴 | Urban tree |
| 97 | `Shrub` | 🔴 | 🔴 | Bush/shrub |
| 98 | `GrassPatch` | 🔴 | 🔴 | Grass tuft |
| 99 | `HangingPlant` | 🔴 | 🔴 | Trailing vine |
| 100 | `PottedPlant` | 🔴 | 🔴 | Container plant |
| 101 | `OvergrownVine` | 🔴 | 🔴 | Building vine |
| 102 | `MossLichen` | 🔴 | 🔴 | Surface growth |
| 103 | `Seaweed` | 🔴 | 🔴 | Aquatic plant |
| 104 | `FloatingPlant` | 🔴 | 🔴 | Water lily etc. |
| 105 | `DeadTree` | 🔴 | 🔴 | Dead/dying tree |

### 8. PROPS & CLUTTER (15 components)

Small details that create visual density.

| # | Component | Status | Test | Description |
|---|-----------|--------|------|-------------|
| 106 | `Crate` | 🔴 | 🔴 | Wooden/plastic crate |
| 107 | `Barrel` | 🔴 | 🔴 | Storage barrel |
| 108 | `Pallet` | 🔴 | 🔴 | Shipping pallet |
| 109 | `Tarp` | 🔴 | 🔴 | Cover tarp |
| 110 | `Bag` | 🔴 | 🔴 | Trash/storage bag |
| 111 | `Tire` | 🔴 | 🔴 | Rubber tire |
| 112 | `ShoppingCart` | 🔴 | 🔴 | Abandoned cart |
| 113 | `Bicycle` | 🔴 | 🔴 | Parked/fallen bike |
| 114 | `Scooter` | 🔴 | 🔴 | Electric scooter |
| 115 | `WreckedCar` | 🔴 | 🔴 | Abandoned vehicle |
| 116 | `SmallBoat` | 🔴 | 🔴 | Rowboat/dinghy |
| 117 | `Chair` | 🔴 | 🔴 | Outdoor chair |
| 118 | `Table` | 🔴 | 🔴 | Outdoor table |
| 119 | `Umbrella` | 🔴 | 🔴 | Patio umbrella |
| 120 | `DebrisPile` | 🔴 | 🔴 | Random debris |

### 9. BUILDING ASSEMBLAGES (15 assemblages)

Pre-composed building types from primitives.

| # | Assemblage | Status | Test | Description |
|---|------------|--------|------|-------------|
| 121 | `Building` | ✅ | ✅ | Generic building |
| 122 | `ShopFront` | 🔴 | 🔴 | Street-level shop |
| 123 | `Apartment` | 🔴 | 🔴 | Residential unit |
| 124 | `Warehouse` | 🔴 | 🔴 | Industrial storage |
| 125 | `Temple` | 🔴 | 🔴 | Shinto shrine |
| 126 | `Arcade` | 🔴 | 🔴 | Game arcade |
| 127 | `Restaurant` | 🔴 | 🔴 | Dining establishment |
| 128 | `Bar` | 🔴 | 🔴 | Drinking establishment |
| 129 | `Hotel` | 🔴 | 🔴 | Capsule/love hotel |
| 130 | `Clinic` | 🔴 | 🔴 | Medical clinic |
| 131 | `ConvenienceStore` | 🔴 | 🔴 | 7-11/Lawson style |
| 132 | `Laundromat` | 🔴 | 🔴 | Coin laundry |
| 133 | `BathHouse` | 🔴 | 🔴 | Public bath/sento |
| 134 | `PachinkoHall` | 🔴 | 🔴 | Pachinko parlor |
| 135 | `InternetCafe` | 🔴 | 🔴 | Manga/net cafe |

### 10. AREA ASSEMBLAGES (10 assemblages)

Larger composed areas.

| # | Assemblage | Status | Test | Description |
|---|------------|--------|------|-------------|
| 136 | `Alley` | ✅ | ✅ | Narrow alleyway |
| 137 | `Street` | 🔴 | ✅ | Main street |
| 138 | `Room` | ✅ | ✅ | Interior room |
| 139 | `Rooftop` | ✅ | ✅ | Rooftop area |
| 140 | `Courtyard` | 🔴 | 🔴 | Open courtyard |
| 141 | `Plaza` | 🔴 | 🔴 | Public plaza |
| 142 | `Market` | 🔴 | 🔴 | Street market |
| 143 | `Harbor` | 🔴 | 🔴 | Boat harbor |
| 144 | `Park` | 🔴 | 🔴 | Urban park |
| 145 | `Parking` | 🔴 | 🔴 | Parking structure |

### 11. ATMOSPHERIC EFFECTS (10 components)

Weather and mood.

| # | Component | Status | Test | Description |
|---|-----------|--------|------|-------------|
| 146 | `Rain` | 🔴 | 🔴 | Rain particle system |
| 147 | `Fog` | 🔴 | 🔴 | Volumetric fog |
| 148 | `SteamVent` | 🔴 | 🔴 | Steam emission |
| 149 | `Smoke` | 🔴 | 🔴 | Smoke particles |
| 150 | `Firefly` | 🔴 | 🔴 | Ambient particles |
| 151 | `Lightning` | 🔴 | 🔴 | Lightning flash |
| 152 | `Reflection` | 🔴 | 🔴 | Water reflection |
| 153 | `Caustics` | 🔴 | 🔴 | Underwater light |
| 154 | `GodRays` | 🔴 | 🔴 | Volumetric light |
| 155 | `DayNightCycle` | 🔴 | 🔴 | Time-of-day system |

---

## Implementation Priority

### Phase 1: Core Structural (Critical Path)
- Stairs, Ramp, Ladder (vertical navigation)
- Door, Window, Balcony (building openings)
- Bridge, Walkway (horizontal connections)

### Phase 2: Water/Flooded (Unique Setting)
- Pier, Pontoon, FloatingPlatform
- Houseboat, SubmergedRuin
- Flotsam, WetSurface

### Phase 3: Transport (Player Movement)
- MonorailTrack, MonorailStation
- GondolaCable, GondolaStation
- Elevator, Escalator

### Phase 4: Atmosphere (Visual Density)
- All Signage & Lighting
- All Urban Furniture
- Rain, Fog, Steam

### Phase 5: Props & Vegetation (Polish)
- All clutter props
- All vegetation
- All decals

---

## Automation Testing Strategy

Each component should have:
1. **Isolation Test**: Component renders correctly alone
2. **Snap Test**: Component connects properly to neighbors
3. **Seed Test**: Different seeds produce different valid variations
4. **Performance Test**: Component renders under 1ms

Test harness API:
```javascript
window.playground.setControl("variant", "industrial")
window.playground.setSeed("test-123")
window.playground.getState()
```

---

## Success Metrics

- [ ] 100+ unique components/assemblages
- [ ] 100+ corresponding tests
- [ ] All components support seeded procedural variation
- [ ] All components snap correctly via Block system
- [ ] Full automation API coverage
- [ ] < 16ms frame time with 50 components visible
