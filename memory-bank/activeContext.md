# Active Context

## Current Focus

**Phase**: MVP Prototype - Isometric Diorama with GenAI Assets
**Target**: ~3 Hour JRPG with A/B/C Story Architecture

### Game Scope

The game is a **3-hour Action JRPG** if playing through ALL required and optional storyline content with:
- **A Story**: Main Kai vs Vera rivalry arc (8-10 major beats)
- **B Story**: Parallel character development, academy politics
- **C Story**: Disruptor events forcing team-ups (alien abduction, mall drop)

### Active Work

1. **Hex Grid System** - Implemented, working
   - `src/utils/hex-grid.ts` - Coordinate utilities
   - `src/utils/hex-normalizer.ts` - GLTF normalization
   - `IsometricScene.tsx` - Main scene with instanced tiles

2. **GenAI Pipeline** - 9/9 characters complete
   - All character manifests defined
   - Meshy AI integration working
   - Animation presets (hero/enemy/boss/prop) functioning

3. **Stage System** - Skeleton implemented
   - 9 stages defined in `content/stages.ts`
   - C-Story disruptors (alien_ship, mall_drop) triggered by position
   - Stage-to-stage connectors needed

4. **Documentation Overhaul** - Complete
   - PROJECT_EVOLUTION.md - Jules session history
   - NARRATIVE_DESIGN.md - A/B/C story architecture
   - ARCHITECTURE.md, DESIGN_PHILOSOPHY.md created

### Blocked Items

- **Navigation Mesh**: YukaJS is unmaintained
  - Mitigation: Babylon.js/Reactylon evaluation planned
  - See: docs/REACTYLON_MIGRATION.md

### Recent Decisions

| Decision | Rationale | Date |
|----------|-----------|------|
| Isometric over Side-Scroll | Better tactical combat feel, "toy box" appeal | Jan 14 |
| Miniplex ECS | Cleaner render/logic separation than hooks | Jan 14 |
| Meshy AI over alternatives | Best quality/cost for anime-style 3D | Jan 13 |
| Animation presets | Reduces manifest complexity | Jan 15 |
| Prop pipeline | Non-humanoids can't be rigged | Jan 15 |

## Next Steps

### Immediate (This Session)
- [x] Complete memory-bank documentation
- [x] Create ARCHITECTURE.md
- [x] Create DESIGN_PHILOSOPHY.md
- [x] Create NARRATIVE_DESIGN.md (A/B/C stories)
- [ ] Review CodeRabbit feedback

### Short-Term (This Week)
- [ ] Combat system prototype
- [ ] Dialogue system integration
- [ ] JRPG HUD improvements (quest log, minimap)
- [ ] C-Story disruptor stage polish

### Medium-Term (This Month)
- [ ] Babylon.js migration evaluation
- [ ] Full B-Story content implementation
- [ ] GenAI parallax backgrounds
- [ ] Save/load system

## Open Questions

1. **Camera System**: Fixed isometric or player-controllable rotation?
2. **Combat Flow**: Real-time with Yuka AI for tentacles/rivals
3. **B-Story Content**: Agent-generated alongside A-Story?

## Context for AI Agents

When working on this codebase:

1. **Check manifest.json** before modifying character assets
2. **Use ECS patterns** for game logic, not React state
3. **Follow Biome** - run `pnpm check` before committing
4. **Test with Vitest** - systems should have unit tests
5. **Document changes** - update relevant docs

---

Last Updated: 2026-01-16
