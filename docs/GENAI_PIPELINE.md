# GenAI Content Pipeline

**Last Updated**: January 26, 2026
**Status**: Active (TypeScript build-time tools)

---

## Overview

This project uses TypeScript-based tools in `dev-tools/content-gen` to procedurally generate game assets and narrative content using LLMs (Google Gemini) and 3D generation APIs (Meshy).

**Important**: GenAI tools remain in TypeScript and run at **build-time only**. The game runtime is Unity 6. Generated content flows to Unity via JSON manifests and asset imports.

```
+---------------------------+        +---------------------------+
|  TypeScript (Build-Time)  |        |    Unity 6 (Runtime)      |
+---------------------------+        +---------------------------+
|                           |        |                           |
|  dev-tools/content-gen    |        |  Assets/_Generated/       |
|  - Meshy 3D generation    |------->|  - Manifests/*.json       |
|  - Gemini story/dialogue  |        |  - Models/*.glb           |
|  - Asset manifests        |        |  - Textures/*             |
|                           |        |                           |
+---------------------------+        +---------------------------+
```

## Setup

1. Ensure you have environment variables set:
   ```bash
   export GEMINI_API_KEY=your_gemini_key
   export MESHY_API_KEY=your_meshy_key
   ```

2. Install dependencies:
   ```bash
   cd dev-tools/content-gen
   pnpm install
   ```

## Usage

### CLI Commands

The unified CLI is located in `dev-tools/content-gen/src/cli.ts`.

```bash
# Generate everything (Story + Assets)
pnpm --filter @neo-tokyo/content-gen generate

# Generate Story Only
pnpm --filter @neo-tokyo/content-gen gen:story

# Generate Assets Only (3D models, icons)
pnpm --filter @neo-tokyo/content-gen gen:assets

# Generate World Manifest
pnpm --filter @neo-tokyo/content-gen gen:world
```

### Output Locations

| Generator | Output Path | Unity Import |
|-----------|-------------|--------------|
| Story | `dev-tools/shared-assets/manifests/story_gen.json` | `Assets/_Generated/Manifests/` |
| World | `dev-tools/shared-assets/manifests/world_gen.json` | `Assets/_Generated/Manifests/` |
| 3D Models | `dev-tools/shared-assets/models/*.glb` | `Assets/_Generated/Models/` |
| Textures | `dev-tools/shared-assets/textures/*` | `Assets/_Generated/Textures/` |

## Architecture

### 1. Narrative Generation (`src/game/`)

- **Prompts**: Located in `src/game/prompts/index.ts`. Defines strict JSON schemas for Dialogues and Lore.
- **Generator**: `src/game/generators/story.ts` queries the LLM for A-Story (Rivalry), B-Story (Mystery), and C-Story (Events) arcs.
- **Output**: `dev-tools/shared-assets/manifests/story_gen.json`

**Schema Example:**
```typescript
interface DialogueNode {
  id: string;
  speaker: string;
  text: string;
  alignmentImpact?: { kurenai?: number; azure?: number };
  responses?: DialogueResponse[];
}
```

### 2. World Generation (`src/world/`)

- **Prompts**: Territory templates with seeded generation
- **Generator**: Procedural territory layouts with hand-crafted story beats
- **Output**: `dev-tools/shared-assets/manifests/world_gen.json`

**Manifest Schema:**
```json
{
  "version": "2.0",
  "seed": "flooded-tokyo-2026",
  "territories": [
    {
      "id": "kurenai-academy",
      "type": "academy",
      "faction": "Kurenai",
      "bounds": { "min": [0, 0], "max": [100, 100] },
      "tiles": [
        { "hex": { "q": 0, "r": 0 }, "type": "platform", "elevation": 4 }
      ],
      "entities": [
        { "type": "npc", "id": "sensei-honda", "position": [10, 4, 20] }
      ]
    }
  ]
}
```

### 3. 3D Asset Generation (`src/assets/`)

- **API**: Meshy AI for procedural 3D model generation
- **Pipeline**: Text prompt -> Meshy API -> GLB download -> Unity import
- **Seeding**: Deterministic prompts for reproducible assets

**Generation Flow:**
```bash
1. content-gen CLI sends prompt to Meshy API
2. Meshy returns task ID, polls for completion
3. GLB downloaded to dev-tools/shared-assets/models/
4. Unity AssetPostprocessor imports on next Editor refresh
5. Prefab auto-generated with LOD groups
```

### 4. UI Asset Generation (`src/ui/`)

- **Prompts**: `src/ui/prompts/index.ts` for weathered, flooded-world styling
- **Generator**: SVG generation for icons and UI elements
- **Output**: `dev-tools/shared-assets/icons/`

## Unity Integration

### ManifestLoader

Unity loads manifests at runtime via `ManifestLoader`:

```csharp
// Assets/Scripts/Utilities/ManifestLoader.cs
public static class ManifestLoader
{
    public static T Load<T>(string fileName) where T : class
    {
        string path = Path.Combine(
            Application.streamingAssetsPath,
            "manifests",
            fileName
        );
        string json = File.ReadAllText(path);
        return JsonUtility.FromJson<T>(json);
    }
}
```

### ManifestSpawnerSystem

DOTS system that instantiates entities from manifest data:

```csharp
// Assets/Scripts/Systems/World/ManifestSpawnerSystem.cs
[UpdateInGroup(typeof(InitializationSystemGroup))]
public partial struct ManifestSpawnerSystem : ISystem
{
    public void OnCreate(ref SystemState state)
    {
        var manifest = ManifestLoader.Load<WorldManifest>("world_gen.json");
        // Spawn entities based on manifest...
    }
}
```

### Asset Copy Script

Manifests are copied to StreamingAssets during build:

```bash
# scripts/copy-manifests.sh
cp dev-tools/shared-assets/manifests/*.json Assets/StreamingAssets/manifests/
```

This is automated in CI via `.github/workflows/unity-build.yml`.

## Adding New Content

### New Story Arc

1. Add arc definition in `src/game/prompts/index.ts`
2. Update generator in `src/game/generators/story.ts`
3. Run `pnpm gen:story`
4. Copy manifest to Unity: `scripts/copy-manifests.sh`

### New Territory Type

1. Add template in `src/world/templates/`
2. Update world generator
3. Run `pnpm gen:world`
4. Create corresponding Unity prefabs

### New 3D Asset

1. Add to asset list in `src/assets/prompts/index.ts`
2. Define seed and prompt
3. Run `pnpm gen:assets`
4. Unity imports automatically on Editor refresh

## Type Synchronization

TypeScript types in `dev-tools/types/` must be kept in sync with Unity C# schemas:

| TypeScript | C# Equivalent |
|------------|---------------|
| `dev-tools/types/manifest.ts` | `Assets/Scripts/Data/ManifestSchemas.cs` |
| `dev-tools/types/dialogue.ts` | `Assets/Scripts/Data/DialogueSchemas.cs` |
| `dev-tools/types/territory.ts` | `Assets/Scripts/Data/TerritorySchemas.cs` |

When modifying schemas:
1. Update TypeScript types first
2. Update C# equivalents
3. Regenerate content
4. Run Unity tests to verify

## Seeding Strategy

All generation uses deterministic seeding for reproducibility:

```typescript
// Master seed controls everything
const masterSeed = "flooded-tokyo-2026";

// Sub-seeds derived from master
const territorySeed = hash(`${masterSeed}-territory-${territoryId}`);
const entitySeed = hash(`${masterSeed}-entity-${entityId}`);
```

This ensures:
- Same seed = same world across builds
- Individual elements can be regenerated independently
- Players can share seeds for identical experiences

## Future Integrations

- **Voice Synthesis**: Generate NPC dialogue audio
- **Music Generation**: Procedural ambient soundscapes
- **Animation**: AI-driven character animation blending

---

## References

- [Meshy AI Documentation](https://meshy.ai/docs)
- [Google Gemini API](https://ai.google.dev/docs)
- [UNITY_6_ARCHITECTURE.md](UNITY_6_ARCHITECTURE.md) - Unity integration details
- [PROCEDURAL_ARCHITECTURE.md](PROCEDURAL_ARCHITECTURE.md) - World generation patterns

---

*GenAI tools are TypeScript-only, running at build-time. The game runtime is Unity 6.*
