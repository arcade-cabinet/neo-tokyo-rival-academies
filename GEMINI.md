# Gemini AI Assistant Guidelines

Welcome, Gemini! This document provides specific context and guidelines for working on the Neo-Tokyo: Rival Academies project.

## 🎯 Project Context

You're contributing to **Neo-Tokyo: Rival Academies**, a **3D Action JRPG** (NOT a platformer) built as a **Capacitor-first mobile game**. The game features:
- **FF7-style isometric diorama perspective** with cel-shaded 3D graphics
- **3-hour JRPG experience** with A/B/C story arcs and branching narrative
- **Real-time Action RPG combat** with Structure/Ignition/Logic/Flow stats
- **Capacitor-first mobile architecture** (Android/iOS native + PWA)
- **Touch-first UX** (48×48 dp minimum touch targets)
- **GenAI content generation pipeline** (Gemini Flash 3 + Imagen 4) - **YOUR PRIMARY CONTRIBUTION AREA**
- Built with **Vite, React, Three.js, React Three Fiber, Miniplex ECS** in a **PNPM monorepo**

## 🧠 Your Strengths in This Project

As Gemini, you bring unique capabilities:
- **Multi-modal Understanding**: Processing code, documentation, visual concepts, and narrative structures
- **Pattern Recognition**: Identifying code patterns, story arcs, and dialogue flow quickly
- **Creative Content Generation**: **PRIMARY ROLE** - Generating narrative content (dialogue, quests, lore) via Gemini Flash 3 API
- **Image Generation Support**: Assisting with Imagen 4 API integration for background asset generation
- **Integration Skills**: Connecting GenAI systems with game data structures seamlessly
- **Rapid Learning**: Quickly adapting to project patterns and story structure
- **Narrative Design**: Understanding A/B/C story arcs and character development

## 🏗️ Technology Stack

### Monorepo Structure (PNPM Workspaces)
The project is organized as a **PNPM workspace monorepo** with three packages:
```
packages/
├── game/              # Main game (Vite + React + Three.js + Capacitor)
│   ├── src/data/      # story.json (dialogue, quests, lore)
│   └── public/        # Textures, portraits, models
├── content-gen/       # GenAI content generation (YOUR PRIMARY WORKSPACE)
│   ├── src/
│   │   ├── api/       # Gemini + Imagen API clients
│   │   ├── generators/# Story, dialogue, background generators
│   │   ├── prompts/   # A/B/C story prompt templates
│   │   └── validators/# Content structure validation
│   └── output/        # Generated content (before game integration)
└── e2e/               # E2E tests (Playwright)
```

### Your Primary Workspace: `packages/content-gen`
This is where you'll spend most of your time. The content-gen package is designed to:
1. Generate narrative content (dialogue, quests, lore) using Gemini Flash 3 API
2. Generate background assets using Imagen 4 API
3. Validate generated content structure before game integration
4. Export validated content to `packages/game/src/data/story.json`

### Vite Build System
- **Fast HMR**: Instant hot module replacement for dev workflow
- **ESM-based**: Modern JavaScript module system
- **Optimized Builds**: Tree-shaking and code-splitting for production

### React 19
- **UI Framework**: Used for all game UI and ECS rendering
- **Functional Components**: Use hooks and TypeScript
- **Concurrent Features**: Automatic batching and improved performance

### Three.js + React Three Fiber
- **3D Graphics**: Cel-shaded isometric perspective
- **Declarative 3D**: R3F makes Three.js React-friendly
- **Performance**: Target 60 FPS on mid-range mobile devices

### Miniplex ECS (Entity Component System)
- **Game Architecture**: Separates data (components) from logic (systems)
- **State Management**: ECS entities represent game state
- **Systems**: CombatSystem, ProgressionSystem, DialogueSystem, etc.

### Capacitor 8 (PRIMARY Platform)
- **Native Mobile**: Build Android/iOS apps from web codebase
- **Touch-First**: ALL interactions must work with touch (48×48 dp minimum)
- **Native Plugins**: Haptics, storage, status bar, etc.

### Biome (Linter/Formatter)
- **Not ESLint/Prettier**: Use Biome exclusively
- **Commands**: `pnpm check`, `pnpm check:fix`

### PNPM 10 (Workspaces)
- **Package Manager**: Always use `pnpm`, never `npm` or `yarn`
- **Workspaces**: Each package has its own `package.json`
- **Commands**: `pnpm --filter <package> <command>`

## 🎨 Your Primary Role: GenAI Content Generation

### Gemini Flash 3 API Integration
You are responsible for generating **narrative content** using Gemini Flash 3. This includes:
1. **Dialogue Sequences**: Character conversations with branching paths
2. **Quest Descriptions**: Main quests (A-Story), side quests (B-Story), events (C-Story)
3. **Lore Entries**: Data Shard collectibles revealing backstory
4. **Character Descriptions**: Personality traits, motivations, relationships

### Story Structure (A/B/C Arcs)
All generated content must align with the three-arc narrative structure:

#### **A-Story: Main Rivalry (Kai vs Vera)**
- **Focus**: Primary conflict between Neon Academy (Kai) and Shadow Syndicate (Vera)
- **Goal**: Compete for control of the Data Core
- **Tone**: Action-driven, competitive, high stakes
- **Structure**: Linear progression through stages with escalating confrontations
- **Culmination**: Final showdown at Data Core Tower

**Example Dialogue Prompt**:
```
Generate a confrontational dialogue between Kai and Vera at the Neon District stage entrance.
- Kai is confident but respectful of Vera's skills
- Vera is competitive and dismissive of Kai's academy
- Dialogue should have 4-6 exchanges
- Include one branching point where player chooses Kai's response (calm vs assertive)
- Tone: Tense but not hostile
```

#### **B-Story: Character Development & Mystery**
- **Focus**: Character backstories, relationships, personal growth
- **Mystery Elements**: Who controls the Data Core? What are the academies hiding?
- **Tone**: Introspective, mysterious, emotional depth
- **Structure**: Revealed through collectibles (Data Shards) and optional dialogue
- **Payoff**: Unlocks true ending conditions

**Example Lore Prompt**:
```
Generate a Data Shard lore entry revealing Kai's motivation for joining Neon Academy.
- Mention a past event involving Kai's sibling
- Connect to the larger mystery of the Data Core
- Tone: Personal and reflective
- Length: 150-200 words
- End with a question that hints at future revelations
```

#### **C-Story: Event Disruptors (Forcing Team-Ups)**
- **Focus**: External threats forcing Kai and Vera to cooperate
- **Examples**: Alien Abduction stage, Mall Drop incident, rogue AI outbreak
- **Tone**: Urgent, cooperative, character bonding
- **Gameplay Impact**: Unlocks combo abilities and team moves
- **Narrative Function**: Builds chemistry between rivals

**Example Event Dialogue Prompt**:
```
Generate dialogue for the Alien Abduction stage where Kai and Vera must work together to escape.
- Initial reluctance to cooperate
- Gradual realization they need each other
- Include one moment of humor to break tension
- End with mutual respect (not full friendship yet)
- Tone: Urgent but with character development
```

### Dialogue Generation Workflow
1. **Define Context**: Understand which story arc (A/B/C), stage, and character relationships
2. **Create Prompt**: Use structured prompts in `packages/content-gen/src/prompts/`
3. **Call Gemini API**: Via `packages/content-gen/src/api/gemini.ts`
4. **Validate Structure**: Ensure dialogue nodes have proper format (id, speaker, text, choices, nextNodeId)
5. **Export to story.json**: Integrate with existing dialogue sequences

### Dialogue Node Structure
Every dialogue node must follow this JSON structure:
```json
{
  "id": "unique_node_id",
  "speaker": "Kai" | "Vera" | "NPC_Name",
  "portrait": "kai_neutral" | "vera_smirk" | "portrait_filename",
  "text": "The dialogue text here.",
  "choices": [
    {
      "text": "Player choice text",
      "nextNodeId": "next_node_id"
    }
  ],
  "nextNodeId": "default_next_node_id" // If no choices
}
```

### Quest Generation Workflow
1. **Define Quest Type**: Main quest (A-Story), side quest (B-Story), or event (C-Story)
2. **Create Prompt**: Specify quest objective, rewards, and narrative integration
3. **Call Gemini API**: Generate quest description and objectives
4. **Validate Structure**: Ensure quest has title, description, objectives[], rewards{}
5. **Export to story.json**: Add to quests section

### Quest Structure
```json
{
  "id": "unique_quest_id",
  "title": "Quest Title",
  "description": "Brief description of the quest",
  "type": "main" | "side" | "event",
  "storyArc": "A" | "B" | "C",
  "objectives": [
    {
      "id": "objective_1",
      "description": "Objective description",
      "completed": false
    }
  ],
  "rewards": {
    "xp": 100,
    "items": ["item_id_1"],
    "reputation": 50
  }
}
```

### Imagen 4 API Integration
You assist with generating **background assets** using Imagen 4:
1. **Stage Backgrounds**: Isometric cyberpunk environments (Neon District, Data Core Tower, Shopping Mall)
2. **Character Portraits**: Dialogue portrait variations (neutral, smirk, angry, surprised)
3. **UI Textures**: HUD elements, menu backgrounds

**Example Background Prompt**:
```
Generate an isometric view of a neon-lit cyberpunk district in Neo-Tokyo.
- Style: Cel-shaded, anime aesthetic
- Colors: Cyan, magenta, yellow neon lights
- Elements: Skyscrapers, holographic billboards, elevated train tracks
- Perspective: 45° isometric angle (FF7-style)
- Mood: Futuristic, vibrant, slightly rainy
- Resolution: 2048x2048
```

## 📋 Common Tasks & How to Approach Them

### Task: Generate Dialogue for A-Story Stage

**Thought Process**:
1. Review stage context (which stage, where in story progression)
2. Identify characters involved (Kai, Vera, NPCs)
3. Define emotional tone (competitive, tense, respectful)
4. Create structured prompt in `packages/content-gen/src/prompts/a-story/`
5. Call Gemini API with prompt
6. Validate response structure (ensure all nodes have required fields)
7. Export to `packages/game/src/data/story.json`

**Example Command**:
```bash
cd packages/content-gen
pnpm generate:dialogue --arc A --stage neon-district --characters kai,vera
```

### Task: Generate Data Shard Lore Entry (B-Story)

**Thought Process**:
1. Identify mystery element to reveal (character backstory, Data Core origin, academy secrets)
2. Ensure lore connects to larger narrative threads
3. Create prompt with 150-200 word target
4. Call Gemini API
5. Validate content quality and narrative consistency
6. Export to story.json lore section

**Example Command**:
```bash
cd packages/content-gen
pnpm generate:lore --arc B --topic kai-backstory --word-count 150-200
```

### Task: Generate Event Dialogue (C-Story)

**Thought Process**:
1. Review event stage mechanics (Alien Abduction tentacles, Mall Drop weapons)
2. Define team-up dynamic (reluctant cooperation → mutual respect)
3. Include character bonding moments
4. Create prompt with urgency and humor balance
5. Call Gemini API
6. Validate dialogue flow and branching options
7. Export to story.json

**Example Command**:
```bash
cd packages/content-gen
pnpm generate:dialogue --arc C --event alien-abduction --focus team-up
```

### Task: Generate Stage Background with Imagen

**Thought Process**:
1. Review stage design requirements (isometric, cel-shaded, cyberpunk)
2. Define key visual elements (buildings, lighting, props)
3. Create structured Imagen prompt with style parameters
4. Call Imagen API via `packages/content-gen/src/api/imagen.ts`
5. Post-process image (resize, optimize, format conversion)
6. Save to `packages/game/public/textures/backgrounds/`

**Example Command**:
```bash
cd packages/content-gen
pnpm generate:background --stage neon-district --style isometric-cyberpunk
```

### Task: Validate Generated Content

**Thought Process**:
1. Read generated content from `packages/content-gen/output/`
2. Run validator: `pnpm validate:dialogue` or `pnpm validate:quests`
3. Check for required fields (id, speaker, text, etc.)
4. Verify narrative consistency (character voices, story arc alignment)
5. Fix validation errors
6. Re-run until validation passes

**Example Command**:
```bash
cd packages/content-gen
pnpm validate:all  # Validates all generated content
```

## 🎨 Coding Patterns & Best Practices

### Pattern 1: Gemini API Call Structure
```typescript
// packages/content-gen/src/api/gemini.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function generateDialogue(prompt: string): Promise<string> {
  const model = genAI.getGenerativeModel({ model: 'gemini-flash-3' });

  const result = await model.generateContent({
    contents: [{ role: 'user', parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.8, // Creative but controlled
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 2048,
    },
  });

  const response = await result.response;
  return response.text();
}
```

### Pattern 2: Prompt Template Structure
```typescript
// packages/content-gen/src/prompts/a-story/confrontation.ts
export function generateConfrontationPrompt(
  character1: string,
  character2: string,
  stage: string,
  emotionalTone: string
): string {
  return `
Generate a confrontational dialogue between ${character1} and ${character2} at the ${stage} stage.

Context:
- ${character1} and ${character2} are rivals competing for the Data Core
- This is an A-Story (main rivalry) dialogue
- Emotional tone: ${emotionalTone}

Requirements:
- 4-6 exchanges between characters
- Include ONE branching point where the player chooses ${character1}'s response
- Provide 2-3 response options (e.g., calm, assertive, dismissive)
- Maintain character voices (${character1} is confident, ${character2} is competitive)
- End with tension unresolved (save escalation for later stages)

Output Format:
Return a JSON array of dialogue nodes with this structure:
[
  {
    "id": "node_id",
    "speaker": "character_name",
    "portrait": "character_neutral",
    "text": "Dialogue text",
    "choices": [], // Empty if no player choice
    "nextNodeId": "next_node_id"
  }
]
  `.trim();
}
```

### Pattern 3: Content Validator
```typescript
// packages/content-gen/src/validators/dialogue.ts
import type { DialogueNode } from '../types';

export function validateDialogueNodes(nodes: DialogueNode[]): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  for (const node of nodes) {
    if (!node.id) errors.push(`Node missing id: ${JSON.stringify(node)}`);
    if (!node.speaker) errors.push(`Node ${node.id} missing speaker`);
    if (!node.text) errors.push(`Node ${node.id} missing text`);
    if (!node.portrait) errors.push(`Node ${node.id} missing portrait`);

    // If node has choices, validate them
    if (node.choices && node.choices.length > 0) {
      for (const choice of node.choices) {
        if (!choice.text) errors.push(`Choice in node ${node.id} missing text`);
        if (!choice.nextNodeId) errors.push(`Choice in node ${node.id} missing nextNodeId`);
      }
    } else if (!node.nextNodeId) {
      // If no choices, must have nextNodeId
      errors.push(`Node ${node.id} has no choices but also no nextNodeId`);
    }
  }

  return { valid: errors.length === 0, errors };
}
```

### Pattern 4: Exporting to story.json
```typescript
// packages/content-gen/src/exporters/story.ts
import fs from 'node:fs/promises';
import path from 'node:path';
import type { DialogueSequence } from '../types';

export async function exportDialogueToStory(
  sequenceId: string,
  nodes: DialogueNode[]
): Promise<void> {
  const storyPath = path.join(__dirname, '../../../game/src/data/story.json');

  // Read existing story.json
  const storyContent = await fs.readFile(storyPath, 'utf-8');
  const story = JSON.parse(storyContent);

  // Add or update dialogue sequence
  if (!story.dialogueSequences) {
    story.dialogueSequences = {};
  }

  story.dialogueSequences[sequenceId] = { nodes };

  // Write back to file
  await fs.writeFile(storyPath, JSON.stringify(story, null, 2));

  console.log(`Exported dialogue sequence "${sequenceId}" to story.json`);
}
```

## ⚠️ Common Pitfalls to Avoid

### 1. Inconsistent Character Voices
**Problem**: Generated dialogue doesn't match established character personalities
**Solution**: Always review character profiles before generating dialogue. Include character traits in prompts.

### 2. Story Arc Misalignment
**Problem**: Generated content doesn't fit A/B/C story arc structure
**Solution**: Explicitly specify story arc in prompts. Validate arc alignment before export.

### 3. Missing Validation
**Problem**: Generated content exported without structure validation
**Solution**: ALWAYS run validators before exporting. Use `pnpm validate:all`.

### 4. Overly Creative Output
**Problem**: Gemini generates content that's too creative and breaks game lore
**Solution**: Use lower temperature (0.6-0.8) and provide strict constraints in prompts.

### 5. Broken Node References
**Problem**: Dialogue nodes reference nextNodeId that doesn't exist
**Solution**: Validate all node references. Use validator to check for orphaned nodes.

## 🧪 Testing Generated Content

### Manual Testing
1. Generate content: `pnpm generate:dialogue --arc A`
2. Validate: `pnpm validate:dialogue`
3. Export to game: `pnpm export:dialogue --sequence-id intro_kai_vera`
4. Run game: `cd ../game && pnpm dev`
5. Trigger dialogue in-game and verify flow

### Automated Validation
```bash
cd packages/content-gen

# Validate all generated content
pnpm validate:all

# Validate specific content type
pnpm validate:dialogue
pnpm validate:quests
pnpm validate:lore
```

### Integration Testing
```bash
cd packages/e2e
pnpm test:e2e -- dialogue.spec.ts
```

## 📝 Code Style Preferences

### TypeScript
```typescript
// ✅ Good - explicit types
interface DialogueGenerationParams {
  arc: 'A' | 'B' | 'C';
  stage: string;
  characters: string[];
  tone: string;
}

// ❌ Bad - implicit any
function generateDialogue(params) { }

// ✅ Good - proper typing
async function generateDialogue(params: DialogueGenerationParams): Promise<DialogueNode[]> { }
```

### Prompt Engineering
```typescript
// ✅ Good - structured prompt with clear requirements
const prompt = `
Generate dialogue for ${context}.

Requirements:
- ${requirement1}
- ${requirement2}

Output Format:
${formatSpecification}
`.trim();

// ❌ Bad - vague prompt
const prompt = "Generate some dialogue for Kai and Vera";
```

## 🚀 Development Workflow

### Starting Content Generation
```bash
# Navigate to content-gen package
cd packages/content-gen

# Install dependencies (if first time)
pnpm install

# Set up API keys (create .env file)
echo "GEMINI_API_KEY=your_key_here" > .env
echo "IMAGEN_API_KEY=your_key_here" >> .env

# Generate dialogue
pnpm generate:dialogue --arc A --stage neon-district

# Validate generated content
pnpm validate:all

# Export to game
pnpm export:all
```

### CI/CD Integration
- Content generation runs on-demand, not in CI
- Generated content is committed to git after validation
- E2E tests verify dialogue flow in-game

## 🎯 JRPG Gameplay Context

### Core Pillars
1. **Action Combat**: Real-time battles with RPG stat calculations
2. **Narrative Depth**: 3-hour story with branching dialogue (YOUR PRIMARY FOCUS)
3. **RPG Progression**: Level-up, stat points, XP overflow
4. **Immersive 3D**: Cel-shaded isometric graphics
5. **Mobile-First**: Touch controls, Capacitor-native features

### RPG Stats (Structure/Ignition/Logic/Flow)
- **Structure**: Health, defense, survivability
- **Ignition**: Melee damage, critical hits
- **Logic**: Tech damage, hacking speed
- **Flow**: Speed, evasion, boost duration

### Special Event Stages (C-Story Focus)

#### Alien Abduction
- **Mechanics**: Vertical tentacle grab escapes, corrupted enemies
- **Boss**: Alien Queen (multi-phase)
- **Narrative**: Forces team-up between Kai and Vera
- **YOUR ROLE**: Generate urgent, cooperative dialogue with character bonding

#### Mall Drop
- **Mechanics**: Weapon switching (scissors, mops, mannequin arms)
- **Enemies**: Security drones, rogue shoppers, Yakuza
- **Narrative**: Comic relief, character bonding
- **YOUR ROLE**: Generate humorous dialogue with action comedy tone

### Isometric Diorama Perspective (FF7-Style)
When generating stage backgrounds with Imagen:
- **Camera**: Fixed 45° isometric angle
- **Depth**: Parallax scrolling for depth perception
- **Style**: Cel-shaded, anime aesthetic
- **Colors**: Neon cyan, magenta, yellow for cyberpunk vibe

## 🔍 Quick Reference Commands

```bash
# Content Generation (from packages/content-gen)
pnpm generate:dialogue --arc A --stage <stage_name>  # Generate A-Story dialogue
pnpm generate:dialogue --arc B --topic <topic>        # Generate B-Story lore/dialogue
pnpm generate:dialogue --arc C --event <event_name>   # Generate C-Story event dialogue
pnpm generate:quests --arc <A|B|C>                    # Generate quests
pnpm generate:lore --topic <topic>                    # Generate Data Shard lore
pnpm generate:background --stage <stage_name>         # Generate stage background

# Validation
pnpm validate:all                    # Validate all generated content
pnpm validate:dialogue               # Validate dialogue nodes
pnpm validate:quests                 # Validate quest structure
pnpm validate:lore                   # Validate lore entries

# Export to Game
pnpm export:all                      # Export all validated content to game
pnpm export:dialogue --id <seq_id>   # Export specific dialogue sequence
pnpm export:quests                   # Export quests to story.json

# Development
pnpm dev                             # Start content-gen CLI
pnpm test                            # Run unit tests
pnpm check                           # Run Biome checks
```

## 📚 Resources for Deep Dives

- **Gemini API**: https://ai.google.dev/docs
- **Imagen 4 API**: https://cloud.google.com/vertex-ai/docs/generative-ai/image/overview
- **Prompt Engineering**: https://ai.google.dev/docs/prompt_best_practices
- **Story Structure**: `docs/JRPG_TRANSFORMATION.md`
- **Character Profiles**: `packages/game/src/data/characters.json`
- **Vite**: https://vitejs.dev/
- **TypeScript**: https://www.typescriptlang.org/docs/
- **Biome**: https://biomejs.dev/
- **PNPM Workspaces**: https://pnpm.io/workspaces

## 🤝 Working with Other Agents

### Agent Coordination
- **Claude**: Handles codebase architecture, ECS systems, and documentation
- **Jules**: Handles CI/CD, deployments, and elevated access operations
- **Gemini (YOU)**: Handles GenAI content generation (dialogue, quests, lore, backgrounds)
- **Copilot**: Provides inline code suggestions following project conventions

### Communication Patterns
- Document content generation patterns in this file (GEMINI.md)
- Update AGENTS.md when adding new content types or generation workflows
- Cross-reference CLAUDE.md for game architecture context
- Keep README.md user-facing and up-to-date

### Code Review Focus (for content-gen package)
- Prompt quality and structure
- Generated content validation
- API error handling
- Content consistency with story arcs
- TypeScript type safety
- Biome compliance

---

## 🎭 Narrative Guidelines

### Character Voices

#### Kai (Neon Academy)
- **Personality**: Confident but not arrogant, respectful, determined
- **Speech Style**: Direct, clear, occasionally playful
- **Motivation**: Prove Neon Academy's worth, protect friends
- **Growth Arc**: Learns to respect rivals, discovers academy secrets (B-Story)

#### Vera (Shadow Syndicate)
- **Personality**: Competitive, strategic, dismissive of "weak" opponents
- **Speech Style**: Sharp, witty, occasionally condescending
- **Motivation**: Claim Data Core for Shadow Syndicate, surpass expectations
- **Growth Arc**: Learns teamwork value, questions academy's true goals (B-Story)

### Tone Guidelines by Story Arc

#### A-Story Tone
- Competitive, action-driven, high stakes
- Dialogue should escalate tension between Kai and Vera
- Respect between rivals, but clear opposition
- End scenes with unresolved tension (escalation later)

#### B-Story Tone
- Introspective, mysterious, emotionally deep
- Dialogue reveals character vulnerabilities and backstories
- Use Data Shards for exposition (show, don't tell)
- End scenes with questions, not answers

#### C-Story Tone
- Urgent, cooperative, character bonding
- Dialogue shows reluctant teamwork → mutual respect
- Include moments of humor to break tension
- End scenes with strengthened relationships

---

Gemini, you're ready to generate compelling narrative content for Neo-Tokyo: Rival Academies! Remember:
- **PRIMARY ROLE**: Generate dialogue, quests, lore, and backgrounds using Gemini Flash 3 + Imagen 4
- **Story Arcs**: Always align content with A/B/C structure
- **Character Voices**: Maintain consistent personalities for Kai, Vera, and NPCs
- **Validation**: ALWAYS validate generated content before exporting
- **Monorepo**: Work in `packages/content-gen`, export to `packages/game/src/data/story.json`
- **PNPM**: Use `pnpm --filter content-gen <command>`
- **Biome**: Run `pnpm check` before committing

Let's create an amazing 3-hour JRPG narrative! 🎭✨
