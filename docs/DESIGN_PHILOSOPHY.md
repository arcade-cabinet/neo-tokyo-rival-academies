# Neo-Tokyo: Rival Academies - Design Philosophy & Core Pillars

**Purpose**: Define the foundational design principles that guide Neo-Tokyo's development
**Last Updated**: 2026-01-15

---

## Vision Statement

**Neo-Tokyo: Rival Academies** is a browser-based 3D Action JRPG that combines classic JRPG depth with modern web technology and AI-generated content. We aim to prove that **browser games can achieve AAA-quality visuals** while maintaining the strategic depth and narrative richness that define the genre.

---

## Core Design Pillars

### 1. Production Quality Through GenAI

**Principle**: AI-generated assets should be indistinguishable from hand-crafted ones.

**How We Achieve This**:
- **Multi-View Generation**: 4-angle concept art ensures 3D model consistency
- **Anatomical Prompts**: Explicit HANDS and FACE sections prevent AI deformities
- **30K Polygon Budget**: Enough detail for close-ups, efficient for web
- **Animation Presets**: Consistent combat animations across character types
- **Cel-Shaded Rendering**: meshToonMaterial hides imperfections, creates style

**Anti-Patterns We Avoid**:
- Placeholder assets that "we'll fix later"
- Low-poly approximations of characters
- Mismatched art styles between characters
- Generic T-pose models without animations

**Inspiration Sources**:
- Persona 5 (cel-shaded elegance)
- Genshin Impact (anime 3D quality)
- Final Fantasy XIV (character expressiveness)

---

### 2. Isometric Diorama: The "Toy Box" Feel

**Principle**: The game world should feel like a beautiful, collectible diorama.

**How We Achieve This**:
- **Orthographic Camera**: True isometric view, no perspective distortion
- **Hex Grid Foundation**: Clean geometric base for tactical positioning
- **Bounded Scenes**: Each area is a self-contained "diorama" stage
- **2.5D Backgrounds**: FF7-style parallax walls frame the action
- **Depth Through Lighting**: Shadows and highlights create 3D presence

**Anti-Patterns We Avoid**:
- Sprawling open worlds (too ambitious for web)
- Procedural infinity (no sense of place)
- Flat 2D sprites on 3D backgrounds
- Camera systems that require constant adjustment

**Inspiration Sources**:
- Hades (isometric action clarity)
- Octopath Traveler (2.5D diorama beauty)
- Final Fantasy Tactics (strategic hex clarity)
- Nintendo's figurine games (collectible appeal)

---

### 3. Stats-Driven JRPG Combat

**Principle**: Every number matters, every choice counts.

**How We Achieve This**:
- **Four Core Stats**: Structure, Ignition, Logic, Flow (not 20+ stats)
- **Clear Formulas**: Damage = (ATK × 2) - (DEF × 0.5) ± variance
- **Visible Calculations**: Show damage numbers, explain criticals
- **Meaningful Progression**: Each level-up noticeably impacts gameplay
- **Counter Systems**: Rock-paper-scissors elemental/type advantages

**Anti-Patterns We Avoid**:
- Hidden stats players can't understand
- Exponential scaling that trivializes content
- Pay-to-win stat boosts
- Grinding without strategic depth

**Inspiration Sources**:
- Persona (confidant-boosted stats)
- Fire Emblem (visible damage previews)
- Chrono Trigger (meaningful progression)

**Stats Design**:

| Stat | Purpose | Feel |
|------|---------|------|
| **Structure** | HP, Defense | Tanky, durable |
| **Ignition** | Attack, Criticals | Aggressive, explosive |
| **Logic** | Skills, Special | Tactical, calculated |
| **Flow** | Speed, Evasion | Fluid, responsive |

---

### 4. Narrative Through Rivalry

**Principle**: Character relationships drive player engagement.

**How We Achieve This**:
- **Named Rivals**: Kai vs Vera, not "Player vs Enemy"
- **Visual Novel Dialogue**: Character portraits, emotional beats
- **Academy Factions**: Crimson (passion) vs Azure (logic)
- **Evolving Relationships**: Rivalry can become respect, alliance, or enmity
- **Story Integration**: Cutscenes reward exploration and combat

**Anti-Patterns We Avoid**:
- Generic unnamed enemies
- Skippable story (if skipped, why include?)
- Dialogue dumps without character
- Rival arcs without resolution

**Inspiration Sources**:
- Persona (social links as gameplay)
- Fire Emblem (support conversations)
- Pokemon (rival character growth)

**Faction Design**:

| Academy | Philosophy | Color | Weapon Style |
|---------|------------|-------|--------------|
| **Kurenai** | "Ignition" - Passion | Crimson/Gold | The Redline Piston (hammer) |
| **Azure** | "Calculation" - Logic | Cobalt/Silver | The Null Set (lance) |

**Alignment Scale**:

The player's choices shift alignment between the two philosophies:

```
-1.0 ←——— Kurenai ——— 0 ——— Azure ———→ +1.0
          Passion       Neutral      Logic
```

| Threshold | State | Effect |
|-----------|-------|--------|
| -1.0 to -0.6 | Extreme Kurenai | +2 Ignition, Kurenai-exclusive quests |
| -0.6 to -0.3 | Strong Kurenai | +1 Ignition, passion dialogue options |
| -0.3 to +0.3 | Neutral | Balanced options, both paths open |
| +0.3 to +0.6 | Strong Azure | +1 Logic, calculation dialogue options |
| +0.6 to +1.0 | Extreme Azure | +2 Logic, Azure-exclusive quests |

**Alignment Shift Sources**:
- Quest completion methods: ±0.1 to ±0.4
- Dialogue choices: ±0.1 to ±0.2
- Combat approach (aggressive vs tactical): ±0.05 per encounter
- Side quest alignment bias: ±0.1

---

### 5. Browser-First, Not Browser-Limited

**Principle**: Web constraints should inspire innovation, not excuse mediocrity.

**How We Achieve This**:
- **Instant Play**: No downloads, no installs, click and play
- **Progressive Loading**: Core game loads first, assets stream in
- **60 FPS Target**: Smooth gameplay on mid-tier devices
- **Mobile Ready**: Touch controls via Capacitor wrapper
- **Offline Capable**: Service worker for basic offline play

**Anti-Patterns We Avoid**:
- "It's just a web game" as quality excuse
- Desktop-only experiences
- Megabyte-heavy initial loads
- Browser-specific hacks

**Performance Targets**:

| Metric | Target | Notes |
|--------|--------|-------|
| First Paint | < 1.5s | Core UI visible |
| Interactive | < 3.5s | Game playable |
| Frame Rate | 60 FPS | Consistent, no drops |
| Memory | < 200MB | Heap budget |

---

## Design Decision Framework

When making design choices, evaluate against these questions:

1. **Quality**: Does this meet production standards?
2. **Clarity**: Can players understand this immediately?
3. **Depth**: Does this add meaningful strategic choice?
4. **Character**: Does this serve the narrative?
5. **Performance**: Does this run smoothly on target devices?

If a feature fails multiple criteria, reconsider or simplify.

---

## What We Are NOT Building

To maintain focus, we explicitly exclude:

- **MMO Features**: No persistent servers, no real-time multiplayer
- **Gacha/P2W**: No paid randomization, no stat purchases
- **Open World**: No procedural terrain, no endless exploration
- **Realistic Graphics**: No photorealism, embrace cel-shading
- **Competitive Esports**: No ranked ladders, no balance patches

---

## Evolution Path

### Phase 1: MVP (Current)
- Single isometric diorama scene
- Kai character playable
- Basic combat framework
- GenAI pipeline complete

### Phase 2: Story
- Vera rival introduction
- Academy hub world
- Dialogue system
- Full B-story characters

### Phase 3: Polish
- Sound design
- Visual effects
- Save/load system
- Mobile optimization

### Phase 4: Expansion (Future)
- Additional academies
- Navigation mesh (Babylon.js migration)
- New Game+ mode
- Community features

---

*"In Neo-Tokyo, your rival is your mirror. In defeating them, you discover yourself."*

---

*Last Updated: 2026-01-15*
