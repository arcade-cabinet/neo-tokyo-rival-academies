import fs from 'fs-extra';
import path from 'node:path';
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const OUTPUT_DIR = path.resolve(__dirname, '../../../../game/public/ui');

// Ensure output directory exists
fs.ensureDirSync(OUTPUT_DIR);

function createSVG(w: number, h: number, content: string): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">${content}</svg>`;
}

async function saveSVG(name: string, svg: string) {
    const filePath = path.join(OUTPUT_DIR, `${name}.svg`);
    await fs.writeFile(filePath, svg);
    console.log(`Generated ${filePath}`);
    
    // Also convert to PNG for compatibility
    const pngPath = path.join(OUTPUT_DIR, `${name}.png`);
    await sharp(Buffer.from(svg))
        .png()
        .toFile(pngPath);
    console.log(`Generated ${pngPath}`);
}

export async function generateAssets() {
    console.log('Generating UI Assets...');

    // 1. D-Pad Icons (Arrows)
    const arrowPath = "M 50 10 L 90 80 L 50 60 L 10 80 Z"; 
    await saveSVG('dpad-up', createSVG(100, 100, `<path d="${arrowPath}" fill="#0ff" stroke="#008888" stroke-width="5" />`));
    await saveSVG('dpad-down', createSVG(100, 100, `<path d="${arrowPath}" fill="#0ff" stroke="#008888" stroke-width="5" transform="rotate(180 50 50)" />`));
    await saveSVG('dpad-left', createSVG(100, 100, `<path d="${arrowPath}" fill="#0ff" stroke="#008888" stroke-width="5" transform="rotate(-90 50 50)" />`));
    await saveSVG('dpad-right', createSVG(100, 100, `<path d="${arrowPath}" fill="#0ff" stroke="#008888" stroke-width="5" transform="rotate(90 50 50)" />`));

    // 2. Action Icons (Metaphors)
    await saveSVG('icon-attack', createSVG(100, 100, `
        <circle cx="50" cy="50" r="45" fill="rgba(0, 255, 255, 0.2)" stroke="#0ff" stroke-width="2"/>
        <path d="M 20 80 L 80 20 M 30 80 L 80 30" stroke="#0ff" stroke-width="8" stroke-linecap="round" />
    `));

    await saveSVG('icon-jump', createSVG(100, 100, `
        <circle cx="50" cy="50" r="45" fill="rgba(0, 255, 0, 0.2)" stroke="#0f0" stroke-width="2"/>
        <path d="M 20 60 Q 50 10 80 60 L 80 80 L 20 80 Z" fill="#0f0" />
    `));

    await saveSVG('icon-run', createSVG(100, 100, `
        <circle cx="50" cy="50" r="45" fill="rgba(255, 255, 0, 0.2)" stroke="#ff0" stroke-width="2"/>
        <path d="M 10 50 L 60 50 M 10 70 L 80 70 M 10 30 L 40 30" stroke="#ff0" stroke-width="6" stroke-linecap="round" />
    `));

    // 3. HUD Elements
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
