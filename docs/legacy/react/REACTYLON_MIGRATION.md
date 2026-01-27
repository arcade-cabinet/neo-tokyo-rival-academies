# Reactylon/Babylon.js Migration Strategy

## Executive Summary

This document evaluates migrating from the current **Three.js + React Three Fiber** stack to **Babylon.js + Reactylon** for the Neo-Tokyo: Rival Academies project.

**Recommendation**: Consider migration for Phase 2 after core gameplay is prototyped. The current Three.js stack is sufficient for MVP.

---

## Current Stack

| Layer | Technology | Status |
|-------|------------|--------|
| 3D Engine | Three.js | Working |
| React Binding | React Three Fiber | Working |
| Physics | Rapier (via react-three-rapier) | Working |
| AI/Pathfinding | YukaJS | Unmaintained |
| State | Zustand | Working |
| Build | Vite/Astro | Working |

### Pain Points
1. **YukaJS is unmaintained** - No navigation mesh support, limited AI capabilities
2. **Physics limitations** - Rapier is good but Havok is more feature-rich
3. **No built-in XR** - Would need to add manually for future VR/AR
4. **Manual optimization** - Three.js requires more manual LOD, instancing management

---

## Target Stack

| Layer | Technology | Benefit |
|-------|------------|---------|
| 3D Engine | Babylon.js | Built-in RecastJS, Havok, Inspector |
| React Binding | Reactylon | Clean declarative JSX, automatic disposal |
| Physics | Havok | Industry-standard physics engine |
| AI/Pathfinding | RecastJS | Built into Babylon, navmesh generation |
| State | Zustand | Keep existing |
| Build | Vite | Keep existing |

---

## Why Babylon.js?

### Built-in Navigation Mesh (RecastJS)
```typescript
// Babylon.js native navmesh
const navmeshPlugin = new RecastJSPlugin();
const navmesh = navmeshPlugin.createNavMesh(grounds, { cs: 0.2, ch: 0.2 });

// Pathfinding
const path = navmesh.computePath(start, end);
agent.moveAlongPath(path);
```

This replaces the dead YukaJS library entirely.

### Havok Physics
- Industry-standard physics (same engine as many AAA games)
- Better collision detection
- Built-in character controllers

### Inspector/Debugging
- Built-in scene inspector (press F12 in dev mode)
- Real-time tweaking of meshes, materials, lights
- Performance profiler

---

## Why Reactylon over react-babylonjs?

| Feature | react-babylonjs | Reactylon |
|---------|-----------------|-----------|
| Maturity | Mature (~3k weekly npm) | Newer (2024/2025) |
| API Coverage | Near-complete | Growing |
| Disposal | Manual | Automatic |
| XR Support | Good | Excellent |
| Documentation | Storybook examples | Emerging |
| Future Focus | Maintenance | Active development |

### Reactylon Code Example

```tsx
import { ReactylonProvider, Canvas, Scene, Box, HemisphericLight } from 'reactylon';

function DioramaScene() {
  return (
    <ReactylonProvider>
      <Canvas>
        <Scene>
          <HemisphericLight name="light" intensity={0.7} />
          <IsometricCamera />
          <HexTileGrid radius={10} tileSize={1.0} />
          <BackgroundPanels />
          <AnimeHero position={[0, 0.5, 0]} />
        </Scene>
      </Canvas>
    </ReactylonProvider>
  );
}
```

---

## Migration Components

### 1. Scene Setup
| Three.js/R3F | Babylon.js/Reactylon |
|--------------|----------------------|
| `<Canvas>` | `<ReactylonProvider><Canvas>` |
| `<OrbitControls>` | `<ArcRotateCamera>` |
| `<ambientLight>` | `<HemisphericLight>` |
| `@react-three/drei` | Built-in primitives |

### 2. Hex Grid
```tsx
// Reactylon version of HexTileGrid
function HexTileGrid({ radius, tileSize }) {
  const tiles = useMemo(() => generateHexGrid(radius), [radius]);

  return (
    <>
      {tiles.map(({ q, r, x, z }) => (
        <ImportMesh
          key={`hex_${q}_${r}`}
          rootUrl="/assets/tiles/"
          sceneFilename="hex.glb"
          position={[x, 0, z]}
          scaling={[tileSize, tileSize, tileSize]}
        />
      ))}
    </>
  );
}
```

### 3. Character Loading
```tsx
// Reactylon character with animations
function AnimeHero({ position, animationState }) {
  const { scene } = useScene();
  const [model, setModel] = useState(null);

  useEffect(() => {
    // Load with animations
    SceneLoader.ImportMeshAsync('', '/assets/characters/kai/', 'rigged.glb', scene)
      .then(result => {
        setModel(result.meshes[0]);
        // Start animation
        scene.animationGroups.find(g => g.name === animationState)?.start(true);
      });
  }, []);

  return model ? <Mesh mesh={model} position={position} /> : null;
}
```

### 4. Physics
```tsx
// Babylon Havok physics
function PhysicsWorld({ children }) {
  const [physicsReady, setPhysicsReady] = useState(false);

  useEffect(() => {
    HavokPhysics().then(havok => {
      scene.enablePhysics(new Vector3(0, -9.81, 0), new HavokPlugin(true, havok));
      setPhysicsReady(true);
    });
  }, []);

  return physicsReady ? children : <LoadingIndicator />;
}
```

### 5. Navigation
```tsx
// Navmesh-based pathfinding
function NavigationSystem({ grounds }) {
  const navmesh = useMemo(() => {
    const plugin = new RecastJSPlugin();
    return plugin.createNavMesh(grounds, {
      cs: 0.2,
      ch: 0.2,
      walkableSlopeAngle: 35,
      walkableClimb: 1,
    });
  }, [grounds]);

  const findPath = useCallback((from, to) => {
    return navmesh.computePath(from, to);
  }, [navmesh]);

  return <NavigationContext.Provider value={{ findPath, navmesh }} />;
}
```

---

## Migration Phases

### Phase 0: Current State (Complete)
- Three.js + R3F prototype working
- IsometricScene with hex grid
- Character loading and animation
- Basic physics

### Phase 1: Evaluation (Optional)
Create a parallel Babylon.js prototype:
1. Copy IsometricScene to BabylonScene
2. Implement same features in Reactylon
3. Compare performance and developer experience
4. Make go/no-go decision

### Phase 2: Core Migration
If migrating:
1. Replace Canvas/Scene setup
2. Migrate hex grid (mostly coordinate math, reusable)
3. Migrate character loading (GLB files unchanged)
4. Add Havok physics
5. Add RecastJS navigation

### Phase 3: Enhanced Features
1. Navmesh-based enemy AI
2. Advanced physics interactions
3. XR mode (explore diorama in VR)
4. Mobile deployment via Capacitor

---

## Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|------------|
| Learning curve | Medium | Similar React patterns, good docs |
| Feature parity | Low | Babylon has more features built-in |
| Asset compatibility | None | GLB files work in both |
| Community size | Low | Babylon has large community |
| Migration time | Medium | 2-4 weeks for core, can be incremental |

---

## Recommendation

**For MVP**: Stay with Three.js + R3F
- Current stack is working
- Focus on gameplay, not engine migration
- YukaJS limitation can be worked around for simple AI

**For v2.0**: Consider Babylon.js + Reactylon
- When navigation mesh becomes critical (complex AI pathing)
- When XR features are needed
- When Havok physics features are needed
- When the engine inspector would significantly help debugging

### Action Items
1. Continue prototyping with current stack
2. Create a small Babylon.js spike when ready
3. Make migration decision based on spike results
4. If migrating, do it incrementally (scene by scene)

---

## Resources

- [Babylon.js Documentation](https://doc.babylonjs.com/)
- [Reactylon GitHub](https://github.com/reactylon/reactylon)
- [react-babylonjs Storybook](https://brianzinn.github.io/react-babylonjs/)
- [Grok BabylonJS Research](Grok-BabylonJS_Isometric_Diorama_Creation.md)

---

*Last Updated: 2026-01-15*
