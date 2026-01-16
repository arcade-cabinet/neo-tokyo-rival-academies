import { StrictMode, lazy, Suspense } from 'react';
import { createRoot } from 'react-dom/client';
import IsometricScene from './components/react/scenes/IsometricScene';
import './index.css';

// Lazy load ReactylonScene to avoid loading Babylon.js unless needed
const ReactylonScene = lazy(() => import('./components/react/scenes/ReactylonScene'));

// Get scene type from URL parameter: ?scene=reactylon
const urlParams = new URLSearchParams(window.location.search);
const sceneType = urlParams.get('scene') || 'isometric';

const SceneSelector = () => {
  if (sceneType === 'reactylon') {
    return (
      <Suspense fallback={
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          color: '#0ff',
          fontFamily: 'monospace',
          fontSize: '14px',
        }}>
          Loading Reactylon Scene...
        </div>
      }>
        <ReactylonScene />
      </Suspense>
    );
  }
  return <IsometricScene />;
};

const App = () => {
  return (
    <div style={{
      width: '100vw',
      height: '100vh',
      background: 'linear-gradient(135deg, #0a0a1a 0%, #1a0a2a 50%, #0a1a1a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    }}>
      {/* Main Game Container - Responsive with max dimensions */}
      <div style={{
        width: 'min(95vw, 1400px)',
        height: 'min(90vh, 900px)',
        display: 'grid',
        gridTemplateRows: '48px 1fr 80px',
        gridTemplateColumns: '1fr',
        gap: '0',
        background: 'linear-gradient(180deg, #0d0d15 0%, #15151f 100%)',
        border: '2px solid #2a2a4a',
        borderRadius: '8px',
        boxShadow: '0 0 40px rgba(0, 255, 255, 0.1), 0 0 80px rgba(255, 0, 255, 0.05), inset 0 0 20px rgba(0, 0, 0, 0.5)',
        overflow: 'hidden',
      }}>
        {/* Top HUD Bar - Title/Status */}
        <div style={{
          background: 'linear-gradient(90deg, rgba(0,255,255,0.1) 0%, transparent 30%, transparent 70%, rgba(255,0,255,0.1) 100%)',
          borderBottom: '1px solid #2a2a4a',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
        }}>
          <div style={{
            color: '#0ff',
            fontFamily: 'monospace',
            fontSize: '14px',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            textShadow: '0 0 10px rgba(0,255,255,0.5)',
          }}>
            NEO-TOKYO // SECTOR 0
          </div>
          <div style={{
            color: '#f0f',
            fontFamily: 'monospace',
            fontSize: '12px',
            textShadow: '0 0 10px rgba(255,0,255,0.5)',
          }}>
            RIVAL ACADEMIES
          </div>
        </div>

        {/* Main Scene Viewport */}
        <div style={{
          position: 'relative',
          overflow: 'hidden',
          background: '#000',
        }}>
          {/* Corner Decorations */}
          <div style={{ position: 'absolute', top: 0, left: 0, width: '40px', height: '40px', borderTop: '2px solid #0ff', borderLeft: '2px solid #0ff', zIndex: 10 }} />
          <div style={{ position: 'absolute', top: 0, right: 0, width: '40px', height: '40px', borderTop: '2px solid #f0f', borderRight: '2px solid #f0f', zIndex: 10 }} />
          <div style={{ position: 'absolute', bottom: 0, left: 0, width: '40px', height: '40px', borderBottom: '2px solid #0ff', borderLeft: '2px solid #0ff', zIndex: 10 }} />
          <div style={{ position: 'absolute', bottom: 0, right: 0, width: '40px', height: '40px', borderBottom: '2px solid #f0f', borderRight: '2px solid #f0f', zIndex: 10 }} />

          <SceneSelector />
        </div>

        {/* Bottom HUD Bar - Controls/Info */}
        <div style={{
          background: 'linear-gradient(90deg, rgba(0,255,255,0.05) 0%, transparent 50%, rgba(255,0,255,0.05) 100%)',
          borderTop: '1px solid #2a2a4a',
          display: 'grid',
          gridTemplateColumns: '1fr 2fr 1fr',
          alignItems: 'center',
          padding: '10px 20px',
        }}>
          {/* Left - Character Info Placeholder */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}>
            <div style={{ color: '#0ff', fontFamily: 'monospace', fontSize: '12px' }}>KAI</div>
            <div style={{
              width: '100%',
              height: '6px',
              background: '#1a1a2a',
              borderRadius: '3px',
              overflow: 'hidden',
            }}>
              <div style={{ width: '75%', height: '100%', background: 'linear-gradient(90deg, #0f0, #0a0)' }} />
            </div>
          </div>

          {/* Center - Controls hint */}
          <div style={{
            textAlign: 'center',
            color: '#666',
            fontFamily: 'monospace',
            fontSize: '11px',
          }}>
            WASD / ARROWS - MOVE
          </div>

          {/* Right - Location/Status */}
          <div style={{
            textAlign: 'right',
            color: '#f0f',
            fontFamily: 'monospace',
            fontSize: '11px',
            textShadow: '0 0 5px rgba(255,0,255,0.3)',
          }}>
            ROOFTOP ARENA
          </div>
        </div>
      </div>
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
