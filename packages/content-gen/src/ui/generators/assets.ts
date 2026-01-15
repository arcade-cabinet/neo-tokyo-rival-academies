import * as THREE from 'three';
import fs from 'fs-extra';
import path from 'path';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.resolve(__dirname, '../../../../game/public/ui');

// Ensure output directory exists
fs.ensureDirSync(OUTPUT_DIR);

type DrawFunction = (ctx: CanvasRenderingContext2D, w: number, h: number) => void;

/**
 * Helper to generate a PNG file from a canvas draw function using node-canvas (or mock in browser env)
 * For this environment, we'll simulate the buffer creation or use simple SVG string generation
 * since we are running in Node.js where Canvas API might need 'canvas' package.
 * 
 * Ideally, we should use 'canvas' package or just generate SVGs which are easier for UI.
 * Let's generate SVGs for UI icons.
 */
function createSVG(w: number, h: number, content: string): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${content}</svg>`;
}

async function saveSVG(name: string, svg: string) {
    const filePath = path.join(OUTPUT_DIR, `${name}.svg`);
    await fs.writeFile(filePath, svg);
    console.log(`Generated ${filePath}`);
    
    // Also convert to PNG for compatibility if needed (using sharp)
    const pngPath = path.join(OUTPUT_DIR, `${name}.png`);
    await sharp(Buffer.from(svg))
        .png()
        .toFile(pngPath);
    console.log(`Generated ${pngPath}`);
}

export async function generateAssets() {
    console.log('Generating UI Assets...');

    // 1. D-Pad Icons (Arrows)
    const arrowPath = "M 50 10 L 90 80 L 50 60 L 10 80 Z"; // Simple arrow pointing up
    // Rotate for directions
    await saveSVG('dpad-up', createSVG(100, 100, `<path d="${arrowPath}" fill="#0ff" stroke="#008888" stroke-width="5" />`));
    await saveSVG('dpad-down', createSVG(100, 100, `<path d="${arrowPath}" fill="#0ff" stroke="#008888" stroke-width="5" transform="rotate(180 50 50)" />`));
    await saveSVG('dpad-left', createSVG(100, 100, `<path d="${arrowPath}" fill="#0ff" stroke="#008888" stroke-width="5" transform="rotate(-90 50 50)" />`));
    await saveSVG('dpad-right', createSVG(100, 100, `<path d="${arrowPath}" fill="#0ff" stroke="#008888" stroke-width="5" transform="rotate(90 50 50)" />`));

    // 2. Action Icons (Metaphors)
    // Attack: Sword / Fist
    await saveSVG('icon-attack', createSVG(100, 100, `
        <circle cx="50" cy="50" r="45" fill="rgba(0, 255, 255, 0.2)" stroke="#0ff" stroke-width="2"/>
        <path d="M 20 80 L 80 20 M 30 80 L 80 30" stroke="#0ff" stroke-width="8" stroke-linecap="round" />
    `)); // Abstract slash

    // Jump: Wing / Up Arrow
    await saveSVG('icon-jump', createSVG(100, 100, `
        <circle cx="50" cy="50" r="45" fill="rgba(0, 255, 0, 0.2)" stroke="#0f0" stroke-width="2"/>
        <path d="M 20 60 Q 50 10 80 60 L 80 80 L 20 80 Z" fill="#0f0" />
    `)); // Abstract jump arc/wing

    // Run: Boot / Speed lines
    await saveSVG('icon-run', createSVG(100, 100, `
        <circle cx="50" cy="50" r="45" fill="rgba(255, 255, 0, 0.2)" stroke="#ff0" stroke-width="2"/>
        <path d="M 10 50 L 60 50 M 10 70 L 80 70 M 10 30 L 40 30" stroke="#ff0" stroke-width="6" stroke-linecap="round" />
    `)); // Speed lines

    // 3. HUD Elements
    // Health Bar Frame
    await saveSVG('hud-frame', createSVG(300, 100, `
        <defs>
            <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" style="stop-color:rgba(0,0,0,0.8);stop-opacity:1" />
            <stop offset="100%" style="stop-color:rgba(0,0,0,0);stop-opacity:1" />
            </linearGradient>
        </defs>
        <path d="M 0 0 L 280 0 L 300 100 L 0 100 Z" fill="url(#grad1)" stroke="#0ff" stroke-width="2" />
    `));

    console.log('Asset Generation Complete.');
}

// Keep existing procedural textures for Three.js usage
export function createTexture(w: number, h: number, drawFn: DrawFunction): THREE.CanvasTexture {
    // This function assumes browser environment for THREE.CanvasTexture
    // If run in Node, it might fail unless we mock document/canvas.
    // For asset generation script, we primarily output files.
    // For runtime usage, we keep this.
    if (typeof document === 'undefined') return new THREE.CanvasTexture(null as any); // Fallback for Node

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
    for (let i = 0; i < 8000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.1)';
      ctx.fillRect(Math.random() * w, Math.random() * h, 2, 2);
    }
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
    const grad = ctx.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, 'rgba(0, 255, 255, 0.1)');
    grad.addColorStop(0.5, 'rgba(255, 0, 255, 0.1)');
    grad.addColorStop(1, 'rgba(255, 255, 0, 0.1)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for (let y = 0; y < h; y += 4) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }
    for (let i = 0; i < 20; i++) {
      ctx.fillStyle = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.1)`;
      ctx.fillRect(Math.random() * w, Math.random() * h, Math.random() * 50, 2);
    }
  });
}