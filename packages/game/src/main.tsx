import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import NeoTokyoGame from './components/react/scenes/NeoTokyoGame';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div style={{ width: '100vw', height: '100vh', background: '#000' }}>
      <NeoTokyoGame />
    </div>
  </StrictMode>
);
