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

Each asset family includes a `manifest.json` with:
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

- `packages/content-gen/`: asset generation scripts
- `packages/shared-assets/`: manifest helpers

---

## Runtime Integration

- Babylon scene loads GLB/PNG from `/assets/*`.
- Story art is referenced from `src/assets/data/story.json`.

---

## Related Docs

- `/docs/design/DESIGN_MASTER_PLAN.md`
- `/docs/tech/ARCHITECTURE.md`
