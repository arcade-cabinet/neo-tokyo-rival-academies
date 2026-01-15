import { StrictMode, useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import IsometricScene from './components/react/scenes/IsometricScene';
import SideScrollScene from './components/react/scenes/SideScrollScene';
import './index.css';

const App = () => {
  const [mode, setMode] = useState<'iso' | 'side'>('iso');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const m = params.get('mode');
    if (m === 'side') setMode('side');
    else if (m === 'iso') setMode('iso');
  }, []);

  const switchMode = (newMode: 'iso' | 'side') => {
    setMode(newMode);
    const url = new URL(window.location.href);
    url.searchParams.set('mode', newMode);
    window.history.pushState({}, '', url);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000, display: 'flex', gap: '10px' }}>
        <button 
          onClick={() => switchMode('iso')}
          style={{ 
            padding: '10px', 
            background: mode === 'iso' ? '#0ff' : '#333',
            color: mode === 'iso' ? '#000' : '#fff',
            border: '1px solid #0ff'
          }}
        >
          ISOMETRIC (DIORAMA)
        </button>
        <button 
          onClick={() => switchMode('side')}
          style={{ 
            padding: '10px', 
            background: mode === 'side' ? '#f0f' : '#333', 
            color: mode === 'side' ? '#000' : '#fff',
            border: '1px solid #f0f'
          }}
        >
          SIDE SCROLL (PRINCE)
        </button>
      </div>
      
      {mode === 'iso' ? <IsometricScene /> : <SideScrollScene />}
    </div>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);