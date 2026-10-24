// The site is hand-written static files in public/. "Build" = verify the CORE.md page rules.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
const walk = d => readdirSync(d).flatMap(f => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : [p]; });
const files = walk('public');
let bad = 0;
const fail = m => { console.error('FAIL', m); bad++; };
if (!/X-Robots-Tag:\s*noindex/.test(readFileSync('public/_headers', 'utf8'))) fail('_headers');
for (const f of files.filter(f => f.endsWith('.html'))) {
  const s = readFileSync(f, 'utf8');
  if (!s.includes('<meta name="robots" content="noindex">')) fail(f + ' noindex');
  if (!s.includes('https://unpromptedworks.com/#about')) fail(f + ' about link');
  for (const m of s.matchAll(/(?:href|src)="(\/[^"#]*)"/g)) {
    const t = m[1] === '/' ? 'public/index.html' : join('public', m[1]);
    if (!files.includes(t)) fail(f + ' broken link ' + m[1]);
  }
}
if (bad) process.exit(1);
console.log('ok:', files.length, 'files');
