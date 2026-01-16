import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { ASSET_LIST, SVG_ICON_PROMPT } from '../prompts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const OUTPUT_DIR = path.resolve(__dirname, '../../../../../packages/game/src/components/react/generated');

interface AssetItem {
  name: string;
  type: string;
  filename: string;
}

/**
 * Sanitize SVG content to prevent XSS attacks
 * Removes script tags, event handlers, and other dangerous content
 */
function sanitizeSvg(svg: string): string {
  // Remove script tags
  let sanitized = svg.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');

  // Remove event handlers (onclick, onload, onerror, etc.)
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*["'][^"']*["']/gi, '');
  sanitized = sanitized.replace(/\s+on\w+\s*=\s*[^\s>]+/gi, '');

  // Remove javascript: URLs
  sanitized = sanitized.replace(/javascript:/gi, '');

  // Remove data: URLs (potential XSS vector)
  sanitized = sanitized.replace(/data:\s*[^,]+,/gi, '');

  // Remove xlink:href with javascript
  sanitized = sanitized.replace(/xlink:href\s*=\s*["']javascript:[^"']*["']/gi, '');

  return sanitized;
}

async function generateIcon(model: { generateContent: (prompt: string) => Promise<{ response: { text: () => string } }> }, item: AssetItem): Promise<string | null> {
  console.log(`Generating Icon: ${item.name}...`);
  try {
    const result = await model.generateContent(SVG_ICON_PROMPT(item.name, item.type));
    const response = await result.response;
    let svgCode = response.text();

    // Clean up markdown code blocks if present
    svgCode = svgCode.replace(/```xml/g, '').replace(/```svg/g, '').replace(/```/g, '').trim();

    // Validate SVG structure
    if (!svgCode.includes('<svg') || !svgCode.includes('</svg>')) {
      throw new Error('Invalid SVG returned: missing svg tags');
    }

    // Sanitize SVG to prevent XSS
    svgCode = sanitizeSvg(svgCode);

    return svgCode;
  } catch (e) {
    console.error(`Failed to generate ${item.name}:`, e);
    return null;
  }
}

function wrapInReactComponent(componentName: string, svgContent: string): string {
  // Ensure we pass props to the svg for sizing/styling
  const injectedSvg = svgContent.replace('<svg', '<svg {...props}');

  return `import React from 'react';

export const ${componentName}: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
${injectedSvg}
);
`;
}

export async function generateAssets() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.warn('Skipping Asset Generation: GEMINI_API_KEY not found.');
    return;
  }

  // Ensure output directory exists
  await fs.ensureDir(OUTPUT_DIR);

  // Use a model without JSON enforcement, as we want SVG XML
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

  let successCount = 0;

  for (const item of ASSET_LIST) {
    const svgContent = await generateIcon(model, item);

    if (svgContent) {
      const componentCode = wrapInReactComponent(item.filename, svgContent);
      const filePath = path.join(OUTPUT_DIR, `${item.filename}.tsx`);
      await fs.writeFile(filePath, componentCode);
      console.log(`Saved ${item.filename} to ${filePath}`);
      successCount++;
    }
  }

  // Generate an index barrel file
  if (successCount > 0) {
    const exportStatements = ASSET_LIST.map((item: AssetItem) => `export * from './${item.filename}';`).join('\n');
    await fs.writeFile(path.join(OUTPUT_DIR, 'index.ts'), exportStatements);
    console.log(`Generated index.ts for ${successCount} assets.`);
  }

  console.log('Asset Generation Complete.');
}
