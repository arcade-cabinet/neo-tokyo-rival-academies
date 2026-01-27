# Product Context

## Why This Project Exists

Neo-Tokyo: Rival Academies proves that **mobile-first web JRPGs** can deliver high-fidelity 3D gameplay with a single unified codebase. The game combines:

- Action JRPG mechanics (stats, combat, progression)
- Modern web tech (Ionic Angular, Babylon.js, ECS)
- GenAI-powered asset pipeline (Meshy)

## Target Audience

### Primary: JRPG Enthusiasts (25-40)
- Grew up with Final Fantasy, Persona, Dragon Quest
- Appreciate narrative depth and character progression
- Want high-quality mobile experiences without pay-to-win

### Secondary: Web + 3D Tech Builders
- Developers interested in Babylon.js and Capacitor
- AI/ML practitioners exploring GenAI for game assets

## User Experience Goals

### 1. Instant Playability
- Single web app, wrapped by Capacitor for native installs
- Fast boot and stable 60 FPS on mobile

### 2. Visual Fidelity
- Cel-shaded anime aesthetic
- Isometric diorama with layered scenery

### 3. Deep Engagement
- Stats-driven combat (Structure, Ignition, Logic, Flow)
- Rival academy alignment system
- Visual novel style narrative overlay

## Problems We Solve

| Problem | Solution |
|---------|----------|
| Multi-app maintenance | One unified Ionic Angular app | 
| Web 3D complexity | Babylon.js with ECS logic separation |
| Mobile 3D performance | Capacitor + careful asset and scene optimization |
| Asset cost | GenAI pipeline for rapid character creation |

## How It Should Work

### Player Flow
1. **Start**: Rooftop diorama in flooded Neo-Tokyo
2. **Explore**: Touch controls + isometric camera
3. **Combat**: Real-time JRPG encounters
4. **Story**: Visual novel dialogue overlay
5. **Progress**: Quest chains + alignment-driven choices

### Developer Flow
1. **Define**: Update manifest.json for new assets
2. **Generate**: Run `pnpm generate` pipeline
3. **Integrate**: Load GLB into Babylon scene
4. **Test**: Vitest + device checks via Capacitor

## Success Metrics

- **Performance**: Sustained 60 FPS on Pixel 8a
- **Boot Time**: <3.5s to interactive
- **Asset Quality**: No visible deformities in hero models
- **Test Coverage**: >70% for core systems

---

Last Updated: 2026-01-27
