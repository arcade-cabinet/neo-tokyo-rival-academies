import * as THREE from 'three';

/**
 * Procedural Asset Generation
 * Creates textures using Canvas 2D API for zero external dependencies
 */

type DrawFunction = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

export function createTexture(w: number, h: number, drawFn: DrawFunction): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context');

  drawFn(ctx, w, h);

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
  return texture;
}

export function asphalt(): THREE.CanvasTexture {
  return createTexture(512, 512, (ctx, w, h) => {
    ctx.fillStyle = '#151515';
    ctx.fillRect(0, 0, w, h);

    // Wet noise
    for (let i = 0; i < 8000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.1)';
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }

    // Puddle
    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath();
    ctx.arc(100, 100, 80, 0, Math.PI * 2);
    ctx.fill();
  });
}

export function building(hue: number): THREE.CanvasTexture {
  return createTexture(256, 512, (ctx, w, h) => {
    ctx.fillStyle = '#050508';
    ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = `hsl(${hue}, 100%, 70%)`;
    ctx.shadowBlur = 10;
    ctx.shadowColor = ctx.fillStyle;

    for (let y = 10; y < h; y += 30) {
      for (let x = 10; x < w; x += 30) {
        if (Math.random() > 0.6) ctx.fillRect(x, y, 15, 20);
      }
    }
  });
}

export function neonGrid(color: string): THREE.CanvasTexture {
  return createTexture(256, 256, (ctx, w, h) => {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.shadowBlur = 15;
    ctx.shadowColor = color;

    const gridSize = 32;
    for (let x = 0; x < w; x += gridSize) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 0; y < h; y += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
  });
}

export function holographicPattern(): THREE.CanvasTexture {
  return createTexture(512, 512, (ctx, w, h) => {
    // Gradient background
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, 'rgba(0, 255, 255, 0.1)');
    grad.addColorStop(0.5, 'rgba(255, 0, 255, 0.1)');
    grad.addColorStop(1, 'rgba(255, 255, 0, 0.1)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // Scanlines
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let y = 0; y < h; y += 4) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Random glitches
    for (let i = 0; i < 20; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${
        Math.random() * 255
      }, 0.1)`;
      ctx.fillRect(Math.random() * w, Math.random() * h, Math.random() * 50, 2);
    }
  });
}
