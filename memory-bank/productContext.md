# Product Context

## Why This Project Exists

Neo-Tokyo: Rival Academies proves that **browser-based JRPGs** can achieve AAA-quality visuals through AI-generated assets. The game combines:

- Classic JRPG mechanics (stats, combat, progression)
- Modern web technologies (React, Three.js, ECS)
- GenAI-powered content creation (Meshy AI pipeline)

## Target Audience

### Primary: JRPG Enthusiasts (25-40)
- Grew up with Final Fantasy, Persona, Dragon Quest
- Appreciate deep narratives and character progression
- Want JRPG experiences without console/PC commitment

### Secondary: Web Tech Innovators
- Developers interested in browser-based 3D games
- AI/ML practitioners exploring GenAI for game assets
- Three.js/R3F community members

## User Experience Goals

### 1. Instant Playability
- No downloads, no installs
- Works in any modern browser
- Mobile-ready via Capacitor

### 2. Visual Fidelity
- Cel-shaded anime aesthetic (meshToonMaterial)
- GenAI characters with 7-animation combat sets
- Isometric diorama "toy box" appeal

### 3. Deep Engagement
- Stats-driven combat (Structure, Ignition, Logic, Flow)
- Rival academy narrative with branching dialogue
- Progression systems (XP, levels, skills)

## Problems We Solve

| Problem | Solution |
|---------|----------|
| JRPG asset creation is expensive | GenAI pipeline generates production-ready characters |
| Browser games look cheap | Three.js + cel-shading achieves console quality |
| Mobile JRPGs are pay-to-win | No monetization, pure gameplay |
| Web 3D is complex to develop | ECS architecture separates rendering from logic |

## How It Should Work

### Player Flow
1. **Start**: Land on Neo-Tokyo rooftop diorama
2. **Explore**: WASD/click navigation on hex grid
3. **Combat**: Real-time JRPG battles with stats
4. **Story**: Visual novel dialogue with rivals
5. **Progress**: Level up, unlock skills, advance story

### Developer Flow
1. **Define**: Create manifest.json for new character
2. **Generate**: Run `pnpm generate` to create assets
3. **Integrate**: Load GLB in scene component
4. **Test**: Verify with Vitest/Playwright

## Success Metrics

- **Performance**: Consistent 60 FPS on mid-tier devices
- **Load Time**: < 3s first meaningful paint
- **Asset Quality**: No visible AI deformities (hands, faces)
- **Test Coverage**: > 70% for core systems

---

*Last Updated: 2026-01-15*
