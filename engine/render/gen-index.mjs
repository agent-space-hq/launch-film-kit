// Regenerates web/effects/index.js from the files in web/effects/<category>/*.js
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../web/effects');
const ORDER = ['hook', 'logo', 'type', 'ui', 'feature', 'data', 'social', 'transition', 'background', 'hero3d', 'cta', 'loop'];
const files = [];
for (const cat of fs.readdirSync(ROOT).filter((d) => fs.statSync(path.join(ROOT, d)).isDirectory()).sort((a, b) => (ORDER.indexOf(a) + 99) % 99 - (ORDER.indexOf(b) + 99) % 99)) {
  for (const f of fs.readdirSync(path.join(ROOT, cat)).filter((f) => f.endsWith('.js')).sort()) files.push(`${cat}/${f}`);
}
const lines = files.map((f, i) => `import * as e${i} from './${f}';`);
lines.push(`export const EFFECTS = [${files.map((_, i) => `e${i}`).join(', ')}];`);
fs.writeFileSync(path.join(ROOT, 'index.js'), lines.join('\n') + '\n');
console.log(`index: ${files.length} effects`);
