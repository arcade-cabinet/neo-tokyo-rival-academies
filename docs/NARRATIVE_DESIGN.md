# Neo-Tokyo: Rival Academies - Narrative Design

## Target Scope

**Playtime**: ~3 hours if playing through ALL required and optional storyline content
**Structure**: 3-Act, Multi-Chapter JRPG with A/B/C story tiers
**Inspiration**: Traditional Japanese JRPG anime structure (Persona, Kill La Kill, Final Fantasy)

---

## Story Tier Architecture

### A Story: Main Rivalry Arc (Kai vs Vera)

The primary narrative thread following protagonist **Kai Takeda** (Kurenai Academy) against rival **Vera Vector** (Azure Academy) through "The Midnight Exam" - an illegal underground race through Neo-Tokyo's rooftops.

**8-10 Major Beats:**
1. **Prologue**: Introduction to rival academies, rules of The Midnight Exam
2. **First Encounter**: Kai and Vera's initial confrontation at starting line
3. **Rising Action**: Street-level chase through Sector 7
4. **First Boss**: Academy enforcer ambush
5. **Rooftop Sequence**: Full parkour chase with environmental hazards
6. **Midpoint Twist**: C-Story disruptor forces temporary alliance
7. **Summit Climb**: Vertical ascent with increasing difficulty
8. **Final Confrontation**: One-on-one boss battle
9. **Resolution**: Victory cinematic, rivalry conclusion
10. **Epilogue**: Academy aftermath, sequel hooks

**Faction Design:**

| Academy | Philosophy | Color | Weapon | Character |
|---------|------------|-------|--------|-----------|
| **Kurenai** | "Ignition" - Passion, intuition | Crimson/Gold | Redline Piston (hammer) | Kai |
| **Azure** | "Calculation" - Logic, precision | Cobalt/Silver | Null Set (lance) | Vera |

---

### B Story: Parallel Narrative

Runs ALONGSIDE the A Story like a typical Japanese JRPG anime structure.

**Themes:**
- Character development and backstory
- Academy politics and power structures
- Personal growth arcs
- World-building and lore expansion

**B-Story Characters:**
- **Yakuza Grunt** - Street-level muscle, comic relief
- **Yakuza Boss** - Mid-boss, represents old Neo-Tokyo power
- **Biker Grunt** - Highway raiders
- **Biker Boss** - Territorial boss, respects strength

**B-Story Integration Points:**
- Optional side quests between main stages
- Character encounters that unlock lore
- Reputation system affecting academy standing
- Equipment/upgrade opportunities

---

### C Story: Disruptor Events

**Purpose**: Force team-up moments between Kai and Vera, breaking linear progression and creating memorable set-piece encounters.

**Design Philosophy:**
- Take players OUT of the rooftops into unique event spaces
- Create non-linear flow and surprise
- Double or more the difficulty
- Require cooperation between rivals

---

## Stage Progression

### Main Flow (A Story)

```
intro_cutscene
       │
       ▼
sector7_streets ──────────────┐
       │                      │
       ▼                      │ [C-Story Trigger]
 boss_ambush                  │
       │                      ▼
       ▼               alien_ship (C)
rooftop_chase                 │
       │                      ▼
       ▼               mall_drop (C)
summit_climb                  │
       │                      │
       ▼                      │
final_battle ◄────────────────┘
       │
       ▼
   epilogue
```

### Stage Definitions

| Stage ID | Name | Type | Theme | Length |
|----------|------|------|-------|--------|
| intro_cutscene | Prologue | - | dark | - |
| sector7_streets | Sector 7: Streets | platformer | neon | 500 |
| alien_ship | Alien Mothership | boss | dark | 100 |
| mall_drop | Neo-Tokyo Mall | platformer | neon | 300 |
| boss_ambush | The Ambush | boss | dark | 100 |
| rooftop_chase | Rooftops | platformer | sunset | 800 |
| summit_climb | The Summit | runner | neon | 1000 |
| final_battle | Final Clash | boss | dark | 100 |
| epilogue | Victory | - | sunset | - |

---

## C-Story Disruptor Stages (Detail)

### 1. Alien Abduction Stage (`alien_ship`)

**Trigger**: Player position exceeds threshold during `sector7_streets`

**Narrative**: Aliens reach down and VERTICALLY seize Kai and Vera with giant tentacles from the rooftop, pulling them both into a spaceship stage.

**Environment:**
- Futuristic parallax spaceship backdrop
- Alien interior with bio-mechanical aesthetics
- Vertical arena design

**Enemies:**
- **Tentacled Aliens** - Basic combat units
- **Yuka-Driven Tentacles** - 4-8 independent tentacles, each AI-controlled
- **Alien Queen** (Boss) - Center-positioned, extending tentacle attacks

**Combat Mechanics:**
- Each tentacle is Yuka-driven as its own entity
- Tentacles must be independently fought
- Kai makes player decisions
- Yuka AI controls Vera's decisions
- Dynamic focus shifting between player and rival
- **Double+ difficulty** compared to standard stages

**Resolution**: Both rivals work together to defeat the Queen, forcing mutual respect

---

### 2. Mall Drop Stage (`mall_drop`)

**Inspiration**: Kill La Kill

**Trigger**: Falls naturally after alien stage in the disrupted flow

**Narrative**: Kai and Vera fall through a rooftop into a Neo-Tokyo mall, leaving their signature weapons on the roof above.

**Environment:**
- Multi-level mall interior
- Neon-lit retail corridors
- Escalators, fountains, storefronts

**Combat Changes:**
- **No signature weapons** - Redline Piston and Null Set left on roof
- **Improvised weapons**: Giant scissors, mall implements
- Mall environmental hazards

**Enemies:**
- **Mall Security Guard** - Basic enemy
- **Mall Cop Variants** - Escalating difficulty

**Resolution**: Recover weapons, escape through mall skylight

---

## Character-to-Story Tier Mapping

### Main (A-Story Heroes)
| Character | Role | Animations | Preset |
|-----------|------|------------|--------|
| **Kai** | Protagonist | 7 | hero |
| **Vera** | Rival | 7 | hero |

### B-Story Characters
| Character | Role | Animations | Preset |
|-----------|------|------------|--------|
| **Yakuza Grunt** | Enemy | 5 | enemy |
| **Yakuza Boss** | Boss | 7 | boss |
| **Biker Grunt** | Enemy | 5 | enemy |
| **Biker Boss** | Boss | 7 | boss |

### C-Story Characters
| Character | Role | Animations | Preset |
|-----------|------|------------|--------|
| **Mall Security Guard** | Enemy | 5 | enemy |
| **Alien Humanoid** | Enemy | 5 | enemy |
| **Tentacle Single** | Prop/Hazard | - | prop |

---

## Exploration Design

### Horizontal Exploration
- **Stage-to-stage connectors**: Doors, bridges, platforms
- **Optional paths**: Side routes for B-story content
- **Backtracking**: Ability to revisit completed areas

### Vertical Exploration
- **Multi-level stages**: Rooftops, streets, interiors
- **Elevation mechanics**: Climbing, falling, jumping between levels
- **Vertical disruptors**: Alien abduction lifts vertically out of main path

### FF7-Style Diorama Perspective
- **Isometric hex-grid base**: Tactical positioning
- **2.5D backgrounds**: Parallax horizon line
- **3D connectors**: Platforms projecting outward for depth
- **Scene boundaries**: Each area is a self-contained diorama stage

---

## HUD & UX Requirements

**Current Gaps Identified:**
- No quest/dialogue interaction area
- No progress tracking
- No minimap
- No Zustand state for exploration
- Controls still jarring cyberpunk style vs JRPG aesthetic

**Required Additions:**
1. **Quest Log Panel**: Active quest, objectives
2. **Dialogue Box**: Visual novel-style overlay with portraits
3. **Progress Tracker**: Stage completion, collectibles
4. **Mini-map**: Current area layout
5. **Navigation Controls**: Forward/backward movement, exploration
6. **JRPG-Styled UI**: Complements aesthetic vs jarring contrast

---

## GenAI Integration Points

### Narrative Generation (Gemini Flash 3)
- Quest text and objectives
- Dialogue for cutscenes
- Lore entries and data shards
- B-story side content

### Visual Generation (Meshy AI)
- Character models and animations
- Parallax backgrounds per stage
- Environmental assets

### Prompt Engineering Requirements
- Each cutscene requires full prompt specification
- Anchoring for each stage (environmental context)
- Character voice consistency across dialogues

---

## Data Files

| File | Purpose |
|------|---------|
| `packages/game/src/data/story.json` | Dialogue trees, items, lore |
| `packages/game/src/data/story_gen.json` | Generated A/B/C story content |
| `packages/game/src/content/stages.ts` | Stage configuration |

---

## Comprehensive Storyboards

### Stage 1: Prologue (`intro_cutscene`)

**Type**: Cutscene
**Theme**: Dark
**Duration**: 2-3 minutes

**Setting**: Rain-slicked rooftop overlooking Neo-Tokyo. Thunder rolls. Neon lights from below cast upward glow.

**Camera**:
- Opening: Wide shot of Neo-Tokyo skyline, rain falling
- Pull back to reveal two silhouettes on opposite sides of rooftop
- Close-ups alternating between Kai and Vera
- Final shot: Both warriors at starting line

**Action**:
1. **Thunder crash** - Kai slams *The Redline Piston* onto concrete, cracking it
2. Vera hovers *The Null Set* lance behind her back, perfectly still
3. **Kai** (grinning): "Hey Vector! Try not to overheat your processor keeping up with me!"
4. **Vera** (cold): "Your noise pollution is inefficient, Takeda. I have already calculated the victory path."
5. Holographic **System Voice**: "MIDNIGHT EXAM INITIATED. OBJECTIVE: REACH THE CORE. GO!"
6. Lightning flash - both launch forward

**Transition**: Hard cut to gameplay

---

### Stage 2: Sector 7 Streets (`sector7_streets`)

**Type**: Platformer
**Theme**: Neon
**Length**: 500 units
**Difficulty**: Tutorial/Easy

**Environment**:
- Ground-level Neo-Tokyo streets
- Neon signs, puddles reflecting lights
- Abandoned cars as obstacles
- Side alleys with optional B-story encounters

**Key Encounters**:
- **Yakuza Grunt** patrols (optional B-story combat)
- Environmental hazards: steam vents, electric barriers
- Collectibles: Data shards with lore

**Narrative Beats**:
- Player learns WASD movement and basic combat
- Kai comments on the streets: "Just like the old days before the Academies..."
- Distance tracker shows Vera ahead (AI-controlled)

**Transition Trigger**: Player reaches 500 units → Alien Abduction C-Story event

---

### Stage 3: Alien Ship (`alien_ship`)

**Type**: Boss (C-Story Disruptor)
**Theme**: Dark
**Length**: 100 units (arena)
**Difficulty**: Double+ normal

**Cinematic Entry**:
1. **Camera** shakes violently
2. **Kai** looks up: "What the—?!"
3. **Massive tentacles** descend from purple vortex in sky
4. One grabs Kai, one grabs Vera (visible in distance)
5. **Vertical ascent** - both pulled into spaceship
6. **Hard cut** to alien interior arena

**Environment**:
- Bio-mechanical alien architecture
- Pulsing purple/green lighting
- Organic walls with tech implants
- Vertical arena design with platforms

**Combat**:
- **Kai** (player-controlled) and **Vera** (Yuka AI-controlled) forced to cooperate
- **4-8 Tentacles** - Each independently Yuka-driven, surround arena
- **Alien Humanoid** enemies spawn periodically
- **Alien Queen** (Boss) - Center platform, extends tentacles

**Mechanics**:
- Tentacles must be severed individually
- Vera AI targets nearest threat, may save Kai
- Dynamic camera shifts between both fighters
- Cooperative combo opportunities

**Victory Cinematic**:
- Queen explodes in purple ichor
- **Vera** (breathing hard): "Your... combat improvisation is... statistically improbable."
- **Kai** (grinning): "That's called heart, Vector."
- Ship destabilizes, floor gives way

**Transition**: Both fall through floor → Mall Drop

---

### Stage 4: Mall Drop (`mall_drop`)

**Type**: Platformer (C-Story Disruptor)
**Theme**: Neon
**Length**: 300 units
**Difficulty**: High (no signature weapons)

**Cinematic Entry**:
1. **Free fall** through alien ship floor
2. **Crash** through Neo-Tokyo Mall skylight
3. Glass shatters everywhere
4. **Kai**: "My Piston! It's still on the roof!"
5. **Vera**: "As is my Null Set. Unacceptable."
6. **Mall Security Guard** approaches: "Hey! You're under arrest!"

**Environment**:
- Multi-level shopping mall interior
- Escalators (moving platforms)
- Storefronts with breakable glass
- Fountains (water hazards)
- Neon advertising everywhere

**Combat Changes**:
- **No signature weapons** - Left on rooftop
- **Improvised weapons**: Giant scissors, mannequin arms, shopping carts
- Kill La Kill aesthetic - absurd but effective
- Mall Security Guards as enemies

**Key Areas**:
1. **Food Court** - Tray projectiles
2. **Fashion District** - Scissors weapon pickup
3. **Electronics** - Electric hazards
4. **Rooftop Access** - Escalator chase sequence

**Victory Cinematic**:
- Kai and Vera reach skylight
- Recover weapons from roof edge
- **Kai**: "Never thought I'd miss this hunk of metal."
- **Vera**: "Agreed. Improvisation is... inefficient."
- Both leap back to rooftop chase

**Transition**: Rejoin main A-Story path → Boss Ambush

---

### Stage 5: Boss Ambush (`boss_ambush`)

**Type**: Boss (A-Story)
**Theme**: Dark
**Length**: 100 units (arena)
**Difficulty**: Medium

**Cinematic Entry**:
1. Kai lands on rooftop, Vera ahead in distance
2. **Academy Enforcer** drops from above, blocks path
3. **Enforcer**: "Midnight Exam participants must be eliminated. Academy orders."
4. Vera visible in background, continues running (doesn't help)
5. **Kai**: "Great. Just me then."

**Environment**:
- Circular rooftop arena
- Neon signs provide dim lighting
- Scattered debris for cover
- Rain continues falling

**Boss Pattern**:
- **Yakuza Boss** archetype
- Heavy melee attacks
- Telegraphed slam attacks
- Occasional ranged shuriken
- Three-phase fight (33% HP thresholds)

**Victory Cinematic**:
- Enforcer defeated, falls off rooftop
- **Kai** catches breath, sees Vera's lead has grown
- **Kai**: "Can't let Vector win. Move!"
- Leaps to next rooftop

**Transition**: Smooth to Rooftop Chase

---

### Stage 6: Rooftop Chase (`rooftop_chase`)

**Type**: Platformer (A-Story Core)
**Theme**: Sunset
**Length**: 800 units
**Difficulty**: Medium-High

**Environment**:
- Classic Neo-Tokyo rooftop parkour
- Sunset lighting (orange/purple sky)
- Air conditioning units as platforms
- Neon signs as obstacles
- Vera visible ahead as rival marker

**Narrative Integration**:
- **Distance markers** show progress (600m, 700m, etc.)
- Vera occasionally taunts via comms
- Holographic checkpoints
- Optional B-story side areas (Biker Grunt encounters)

**Environmental Storytelling**:
- Data shards reveal Academy history
- Graffiti shows previous Exam winners
- Billboards advertise corporate sponsors

**Transition**: Distance > 800m → Summit Climb

---

### Stage 7: Summit Climb (`summit_climb`)

**Type**: Runner (A-Story Climax)
**Theme**: Neon
**Length**: 1000 units
**Difficulty**: High

**Cinematic Entry**:
1. **Orbital Elevator** comes into view
2. Massive structure piercing clouds
3. **Kai**: "There it is! The Core!"
4. **Vera** (comms): "It belongs to Azure Logic, Takeda!"
5. Camera pulls back - both racers visible, converging paths

**Environment**:
- Vertical ascent along Elevator's external structure
- High-speed platforming
- Increasing obstacle density
- Wind effects (particle systems)
- Clouds obscure vision periodically

**Mechanics**:
- **Auto-runner** - Forward movement constant
- Lane switching to avoid obstacles
- Boost pads for speed bursts
- Vera AI dynamically ahead/behind based on performance

**Climax Moment** (900m):
- **Biker Boss** appears on hoverbike
- Tries to knock both racers off
- **Vera**: "Takeda! Left flank!"
- **Kai**: "I see him!"
- Brief cooperative moment - both attack boss together

**Transition**: Reach summit → Final Battle

---

### Stage 8: Final Battle (`final_battle`)

**Type**: Boss (A-Story Resolution)
**Theme**: Dark
**Length**: 100 units (arena)
**Difficulty**: Very High

**Cinematic Entry**:
1. Both Kai and Vera land on summit platform simultaneously
2. **The Core** hovers in center - glowing data sphere
3. **Vera**: "After you defeat me, Takeda."
4. **Kai**: "Funny, I was about to say the same thing."
5. Weapons drawn - battle stance

**Environment**:
- Circular summit platform
- The Core provides central light source
- Neo-Tokyo sprawls below (skybox)
- Thunder and rain intensify
- Electric barriers at edges

**Boss Fight - Vera**:
- **Phase 1** (100-66% HP): Standard lance attacks, defensive
- **Phase 2** (66-33% HP): Adds data shield ability, faster attacks
- **Phase 3** (33-0% HP): Desperation mode, special Null Set techniques

**Unique Mechanics**:
- Vera uses **actual boss AI** (not just rival)
- Learns player patterns (adaptive difficulty)
- Occasional dialogue mid-fight:
  - **Vera**: "Calculation error. Recalibrating."
  - **Kai**: "Stop thinking so much!"

**Victory Cinematic**:
1. Vera's lance clatters to ground
2. **Vera** (on one knee): "Impossible. My calculations were perfect."
3. **Kai** extends hand: "Math doesn't beat heart, Vector."
4. **Vera** (takes hand, stands): "Perhaps... I need new variables."
5. Kai grabs The Core
6. **System**: "MIDNIGHT EXAM COMPLETE. KURENAI ACADEMY VICTORY."
7. Fireworks explode over Neo-Tokyo

**Transition**: Fade to black → Epilogue

---

### Stage 9: Epilogue (`epilogue`)

**Type**: Cutscene
**Theme**: Sunset
**Duration**: 2-3 minutes

**Setting**: Academy ceremony hall, next day. Sunset streaming through windows.

**Ceremony Sequence**:
1. **Wide shot**: Both academies assembled
2. **Headmaster**: "This year's Midnight Exam was... unprecedented."
3. **Kai** receives trophy, Kurenai students cheer
4. **Vera** stands with Azure students, arms crossed
5. **Kai** catches her eye across hall, nods
6. **Vera** (barely perceptible nod back)

**Sequel Hook**:
1. **Cut to**: Underground lab, shadowy figures
2. **Voice**: "Kurenai won this year. We cannot allow it again."
3. **Second voice**: "The disruptors were unexpected. Aliens? Convenient."
4. **First voice**: "Next year, we control the variables."
5. Monitor shows footage of Kai and Vera fighting together in alien ship

**Final Scene**:
1. **Rooftop** - Kai alone, holding trophy
2. **Vera** approaches from behind
3. **Vera**: "Takeda. Next year, I will not lose."
4. **Kai** (grinning): "Looking forward to it, Vector."
5. Both look out at Neo-Tokyo sunset
6. **Fade to title card**: "Neo-Tokyo: Rival Academies - Chapter 1 Complete"

**Post-Credits Tease**:
- Quick flash of new character silhouette
- Text: "The Midnight Exam returns... with new players."

---

---

## World-Building: Neo-Tokyo Sector 0

A sprawling, vertical metropolis built on the ruins of the old world. Neon lights clash with brutalist concrete. Rain is constant.

### The Conflict: The Midnight Exam

Every year, the two top academies compete in an illegal, high-speed race across the skyline to claim the "Data Core" from the summit of the Orbital Elevator.

### Lore Fragments (Data Shards)

| Shard | Title | Content |
|-------|-------|---------|
| shard_1 | The First Race | Legend says the first Midnight Exam wasn't a race, but a riot. |

---

*Last Updated: 2026-01-15*
