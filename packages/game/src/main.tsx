import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import NeoTokyoGame from './components/react/scenes/NeoTokyoGame';
import './index.css';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error('Root element "#root" not found');
}

createRoot(rootElement).render(
  <StrictMode>
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <NeoTokyoGame />
    </div>
  </StrictMode>
);
