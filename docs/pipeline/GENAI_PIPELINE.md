# GenAI Asset Pipeline

**Updated**: January 27, 2026

**Important**: GenAI tools are **build-time only**. The runtime is Babylon.js; assets are served from `/src/assets`.

---

## Purpose

Automate asset creation (characters, props, tiles, backgrounds) using Meshy and a manifest-driven pipeline.

---

## Pipeline Flow

```
Prompt → Meshy API → GLB/PNG → manifest.json → /src/assets → Babylon runtime
```

---

## Manifest-Driven Loading

Each asset directory includes a `manifest.json` with:
- identifiers
- file paths
- metadata (theme, scale, tags)

Runtime loads assets by manifest and category.

---

## Output Locations

| Asset Type | Output Path |
|------------|-------------|
| Characters | `src/assets/characters/...` |
| Props | `src/assets/props/...` |
| Tiles | `src/assets/tiles/...` |
| Backgrounds | `src/assets/backgrounds/...` |
| Story Art | `src/assets/story/...` |

---

## Tooling (TypeScript)

- **External CLI/API**: `@agentic-dev-library/meshy-content-generator` (Meshy-focused OSS generator).
- **Local Helpers**: manifest readers + asset loaders live in `src/lib/shared-assets/` and runtime code.

## Asset-Local Pipeline Definitions

Pipeline definitions live **next to the asset** so each asset can carry its own orchestration and prompt variants.
Example layout:

```text
src/assets/characters/heroic-knight-rivers/
├── manifest.json
├── heroic-knight-rivers.pipeline.json
└── styles/
    ├── toon.json
    ├── neon.json
    └── flooded.json
```

### Single Pipeline, Multiple Styles

We use **one pipeline** and drive style variants via retexturing prompts or `forEach` inputs.
This lets a single asset generate multiple looks (e.g., 16 styles) without duplicating pipelines.

Recommended pattern:
- `text-to-image` for base concept
- `text-to-3d-preview` for geometry
- `text-to-3d-refine` with `forEach` over style prompts
- `rigging` and `animation` once per finalized variant (or once per base mesh, if appropriate)

---

## Runtime Integration

- Babylon scene loads GLB/PNG from `/assets/*`.
- Story art is referenced from `src/assets/data/story.json`.

---

## Related Docs

- `/docs/design/DESIGN_PHILOSOPHY.md`
- `/docs/tech/ARCHITECTURE.md`
