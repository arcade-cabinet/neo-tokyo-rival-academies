# GenAI Content Generation Setup

## Overview
This document explains how to set up and use Google's Generative AI (Gemini & Imagen) for automated content generation in Neo-Tokyo: Rival Academies.

---

## Prerequisites

1. **Google AI API Key**
   - Get key from: https://aistudio.google.com/app/apikey
   - Set as repository secret: `GEMINI_API_KEY`

2. **Dependencies**
   ```bash
   # For Node.js (dialogue/quest generation)
   pnpm add @google/generative-ai

   # For Python (image generation)
   pip install google-generativeai pillow
   ```

---

## Workflow File (Manual Setup Required)

**Note**: Due to GitHub App permissions, the workflow file must be created manually by a repository owner.

Create `.github/workflows/generate-content.yml`:

```yaml
name: Generate Game Content

on:
  workflow_dispatch:
    inputs:
      content_type:
        description: 'Type of content to generate'
        required: true
        type: choice
        options:
          - dialogue
          - quest
          - background
          - all
      prompt:
        description: 'Generation prompt (optional)'
        required: false
        type: string

env:
  GEMINI_API_KEY: ${{ secrets.GEMINI_API_KEY }}

jobs:
  generate-dialogue:
    if: inputs.content_type == 'dialogue' || inputs.content_type == 'all'
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - uses: pnpm/action-setup@v3
        with:
          version: 10
      - run: pnpm install --filter content-gen

      - name: Generate dialogue
        run: node packages/content-gen/src/generate-dialogue.js
        env:
          CUSTOM_PROMPT: ${{ inputs.prompt }}

      - name: Commit changes
        run: |
          git config user.name "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
          git add packages/game/src/data/story.json
          git commit -m "feat: add AI-generated dialogue" || true
          git push

  # Similar jobs for quest and background...
```

---

## Generation Scripts

### 1. Dialogue Generation (Gemini Flash 3)

Create `packages/content-gen/src/generate-dialogue.js`:

```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

const DEFAULT_PROMPT = `
Generate a new dialogue sequence for Neo-Tokyo: Rival Academies.

Characters:
- Kai Takeda: Hot-blooded racer, emotional, impulsive. Uses short punchy sentences.
- Vera Vector: Cold, calculating, precise. Uses longer technical sentences.

Setting: Cyberpunk Neo-Tokyo, rooftop racing culture

Requirements:
- 4-6 dialogue nodes showing character personality
- JSON format matching existing structure
- Advances plot or develops relationship
- Include speaker names and next-node links

Return ONLY valid JSON:
{
  "dialogue_id": "unique_name_here",
  "nodes": [
    {"id": "node_1", "speaker": "Kai", "text": "...", "next": "node_2"},
    {"id": "node_2", "speaker": "Vera", "text": "...", "next": null}
  ]
}
`;

async function generateDialogue() {
  console.log('🤖 Generating dialogue with Gemini Flash 3...');

  const prompt = process.env.CUSTOM_PROMPT || DEFAULT_PROMPT;
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  // Extract JSON from markdown code blocks
  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) ||
                   text.match(/```\n([\s\S]*?)\n```/);
  const jsonText = jsonMatch ? jsonMatch[1] : text;

  const generated = JSON.parse(jsonText);

  // Merge with existing story.json
  const storyPath = path.join(__dirname, '../../game/src/data/story.json');
  const story = JSON.parse(fs.readFileSync(storyPath, 'utf8'));

  story.dialogues[generated.dialogue_id] = generated.nodes;

  fs.writeFileSync(storyPath, JSON.stringify(story, null, 2));
  console.log(`✅ Added dialogue: ${generated.dialogue_id}`);
  console.log(`📝 Nodes: ${generated.nodes.length}`);
}

generateDialogue().catch(console.error);
```

### 2. Quest Generation (Gemini Flash 3)

Create `packages/content-gen/src/generate-quest.js`:

```javascript
const { GoogleGenerativeAI } = require('@google/generative-ai');
const fs = require('fs');
const path = require('path');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

const DEFAULT_PROMPT = `
Generate a new side quest for Neo-Tokyo: Rival Academies JRPG.

Game Context:
- 3D action platformer with RPG progression
- Cyberpunk Neo-Tokyo setting (rooftops, alien ships, malls)
- Player stats: Structure (HP), Ignition (ATK), Logic, Flow
- Themes: Rivalry, trust, conspiracy, partnership

Requirements:
- Quest ID, title, description (1-2 sentences)
- 3-5 clear objectives
- Meaningful reward (weapon/armor/accessory with stats)
- Ties into narrative themes
- Giver NPC with personality
- Starting location

Return ONLY valid JSON:
{
  "id": "unique_quest_id",
  "title": "Quest Title",
  "description": "Brief quest description",
  "objectives": ["Objective 1", "Objective 2", "Objective 3"],
  "reward": "Item Name (+X stat)",
  "giver": "NPC Name",
  "location": "stage_id"
}
`;

async function generateQuest() {
  console.log('🤖 Generating quest with Gemini Flash 3...');

  const prompt = process.env.CUSTOM_PROMPT || DEFAULT_PROMPT;
  const result = await model.generateContent(prompt);
  const text = result.response.text();

  const jsonMatch = text.match(/```json\n([\s\S]*?)\n```/) ||
                   text.match(/```\n([\s\S]*?)\n```/);
  const jsonText = jsonMatch ? jsonMatch[1] : text;

  const generated = JSON.parse(jsonText);

  const storyPath = path.join(__dirname, '../../game/src/data/story.json');
  const story = JSON.parse(fs.readFileSync(storyPath, 'utf8'));

  story.quests.side_quests.push(generated);

  fs.writeFileSync(storyPath, JSON.stringify(story, null, 2));
  console.log(`✅ Added quest: ${generated.title}`);
  console.log(`🎯 Objectives: ${generated.objectives.length}`);
  console.log(`🎁 Reward: ${generated.reward}`);
}

generateQuest().catch(console.error);
```

### 3. Background Generation (Imagen 4)

Create `packages/content-gen/src/generate-background.py`:

```python
import google.generativeai as genai
import os
from pathlib import Path

genai.configure(api_key=os.environ['GEMINI_API_KEY'])

DEFAULT_PROMPT = """
Cyberpunk Neo-Tokyo parallax background layer for 3D platformer game.

Style:
- Neon-lit skyscrapers with holographic billboards
- Flying vehicles and air traffic
- Rain-slicked surfaces with neon reflections
- Depth layers for parallax scrolling effect

Composition:
- Horizontal panorama (16:9 aspect ratio)
- No characters, focus on architecture
- Suitable for tiling/wrapping

Color Palette:
- Deep purples and blues (night sky)
- Electric blues and hot pinks (neon signs)
- Warm oranges (street lights)

Mood: Futuristic, energetic, slightly dystopian but vibrant
"""

def generate_backgrounds():
    print('🤖 Generating backgrounds with Imagen 4...')

    prompt = os.environ.get('CUSTOM_PROMPT', DEFAULT_PROMPT)

    try:
        # Note: Adjust based on actual Imagen 4 API
        model = genai.GenerativeModel('imagen-4')
        response = model.generate_images(
            prompt=prompt,
            number_of_images=3,  # Far/mid/close parallax layers
            aspect_ratio='16:9',
            safety_settings='default'
        )

        output_dir = Path('packages/game/public/assets/backgrounds/generated')
        output_dir.mkdir(parents=True, exist_ok=True)

        for i, image in enumerate(response.images):
            layer_name = ['far', 'mid', 'close'][i]
            output_path = output_dir / f'{layer_name}_layer.png'
            image.save(output_path)
            print(f'✅ Saved: {output_path}')

    except Exception as e:
        print(f'⚠️  Imagen 4 not available yet: {e}')
        print('Creating placeholder gradient...')

        # Fallback: Create placeholder
        from PIL import Image, ImageDraw
        img = Image.new('RGB', (1920, 1080), color=(10, 5, 20))
        draw = ImageDraw.Draw(img)

        # Simple gradient
        for y in range(1080):
            r = int(10 + (y / 1080) * 30)
            g = int(5 + (y / 1080) * 15)
            b = int(20 + (y / 1080) * 60)
            draw.line([(0, y), (1920, y)], fill=(r, g, b))

        output_dir = Path('packages/game/public/assets/backgrounds/generated')
        output_dir.mkdir(parents=True, exist_ok=True)
        img.save(output_dir / 'placeholder_gradient.png')
        print('✅ Created placeholder gradient')

if __name__ == '__main__':
    generate_backgrounds()
```

---

## Usage

### Manual Generation (Local)

```bash
# 1. Set API key
export GEMINI_API_KEY="your-key-here"

# 2. Generate dialogue
cd packages/content-gen
node src/generate-dialogue.js

# 3. Generate quest
node src/generate-quest.js

# 4. Generate backgrounds
python src/generate-background.py
```

### Automated Generation (GitHub Actions)

1. Set `GEMINI_API_KEY` as repository secret
2. Go to Actions → Generate Game Content
3. Select content type (dialogue/quest/background/all)
4. Optionally provide custom prompt
5. Run workflow
6. Changes auto-committed to branch

---

## Prompt Engineering Tips

### For Dialogue:
- Specify character personalities clearly
- Mention current story beat context
- Request specific emotional tone
- Example: "Generate tense confrontation dialogue where Kai accuses Vera of hiding something"

### For Quests:
- Specify reward tier (common/rare/legendary)
- Mention available locations
- Request specific themes (combat/exploration/collection)
- Example: "Generate stealth quest in alien ship with logic-based puzzles"

### For Backgrounds:
- Specify time of day (dawn/noon/night)
- Mention weather (rain/fog/clear)
- Request specific landmarks (tower/bridge/dome)
- Example: "Rain-soaked rooftop at midnight with purple neon signs"

---

## Best Practices

1. **Review Generated Content**
   - Always check dialogue for character voice
   - Verify quest objectives are achievable
   - Test backgrounds for visual consistency

2. **Iterative Refinement**
   - Generate multiple variations
   - Cherry-pick best elements
   - Manually edit for polish

3. **Maintain Consistency**
   - Keep character names consistent
   - Reference existing lore/locations
   - Match established tone

4. **Version Control**
   - Commit generated content separately
   - Tag commits with "AI-generated"
   - Document prompt used in commit message

---

## Integration with Game

### Dialogue System
Generated dialogues automatically integrate via `DialogueSystem.ts`:
```typescript
import storyData from '../data/story.json';

// Auto-loads all dialogues including AI-generated ones
export function startDialogue(entityId: string, dialogueId: string) {
  const sequence = storyData.dialogues[dialogueId];
  // ...
}
```

### Quest System
Generated quests appear in quest log:
```typescript
import storyData from '../data/story.json';

// Side quests include AI-generated entries
const allSideQuests = storyData.quests.side_quests;
```

### Background Renderer
Generated backgrounds loaded as layers:
```typescript
// Auto-discover generated backgrounds
const generatedBgs = import.meta.glob(
  '/public/assets/backgrounds/generated/*.png'
);
```

---

## Troubleshooting

### Error: "API key not found"
- Ensure `GEMINI_API_KEY` is set in environment or secrets
- Check key is valid at https://aistudio.google.com

### Error: "Model not found"
- Verify model name (gemini-2.0-flash-exp or imagen-4)
- Check if you have access to the model
- Try fallback model (gemini-1.5-flash)

### Generated JSON is malformed
- Improve prompt with more examples
- Add explicit format instructions
- Manually parse and clean output

### Images don't match style
- Refine prompt with more specific adjectives
- Provide reference image URLs
- Generate multiple variations and select best

---

## Future Enhancements

- [ ] Fine-tune Gemini on existing dialogue corpus
- [ ] Generate character portraits with Imagen
- [ ] Create sound effect variations
- [ ] Generate enemy attack patterns
- [ ] Procedural level layout generation
- [ ] Dynamic difficulty adjustment prompts

---

## Cost Estimates

**Gemini Flash 3** (as of Jan 2026):
- Dialogue generation: ~$0.01 per sequence (500 tokens)
- Quest generation: ~$0.02 per quest (1000 tokens)
- Cost per full playthrough content: ~$5-10

**Imagen 4**:
- Background layer: ~$0.50 per image
- Full parallax set (3 layers): ~$1.50
- Cost for all game backgrounds: ~$20-30

**Total**: ~$30-40 for complete AI-generated content pass

---

## Resources

- [Gemini API Docs](https://ai.google.dev/docs)
- [Imagen Documentation](https://cloud.google.com/vertex-ai/docs/generative-ai/image/overview)
- [Google AI Studio](https://aistudio.google.com)
- [Prompt Engineering Guide](https://www.promptingguide.ai)
