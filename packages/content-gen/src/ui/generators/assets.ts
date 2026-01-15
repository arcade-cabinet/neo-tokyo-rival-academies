import * as THREE from 'three';

/**
 * Procedural Asset Generation
 * Creates textures using Canvas 2D API for zero external dependencies
 */

type DrawFunction = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

/**
 * Create a THREE.CanvasTexture by rendering to an offscreen canvas with a provided draw callback.
 *
 * @param w - Canvas width in pixels
 * @param h - Canvas height in pixels
 * @param drawFn - Function invoked with the 2D rendering context and the canvas width/height to draw the texture contents
 * @returns A THREE.CanvasTexture whose wrapS and wrapT are set to `THREE.RepeatWrapping`
 * @throws Error if a 2D rendering context cannot be obtained from the created canvas
 */
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

/**
 * Create a 512×512 procedural asphalt texture with subtle speckling and a puddle accent.
 *
 * @returns A THREE.CanvasTexture containing an asphalt-like procedural image
 */
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

/**
 * Create a procedural building facade texture tinted by the given HSL hue.
 *
 * @param hue - The HSL hue angle (0–360) used to color the building blocks
 * @returns A THREE.CanvasTexture (256×512) showing a dark facade with randomly placed, hue-tinted rectangular blocks
 */
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

/**
 * Create a 256×256 neon-style grid texture rendered on a black background.
 *
 * @param color - CSS color used for the grid lines and glow
 * @returns A THREE.CanvasTexture containing a 256×256 black canvas with a glowing grid drawn in `color`
 */
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

/**
 * Create a holographic-style procedural texture with gradient, scanlines, and glitch streaks.
 *
 * The resulting image blends translucent cyan, magenta, and yellow tones, overlays faint horizontal
 * scanlines, and adds random semi-transparent colored streaks to simulate digital glitches.
 *
 * @returns A 512×512 THREE.CanvasTexture containing the holographic pattern
 */
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
