import { createHash } from 'node:crypto';
import { readdir, readFile, stat, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ignored = new Set(['.git', 'node_modules']);
const cacheable = new Set(['.js', '.css', '.json', '.svg', '.png', '.jpg', '.jpeg', '.webp', '.avif', '.gif', '.woff', '.woff2', '.ttf', '.ico']);
const changed = [];
async function walk(folder) {
  const entries = await readdir(folder, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    if (ignored.has(entry.name)) continue;
    const file = join(folder, entry.name);
    if (entry.isDirectory()) result.push(...await walk(file)); else result.push(file);
  }
  return result;
}
const files = await walk(root);
const assets = files.filter(file => cacheable.has(extname(file).toLowerCase()) && !file.endsWith(`${sep}data${sep}cache-hashes.json`));
const hashes = {};
for (const file of assets) {
  const key = `/${relative(root, file).replaceAll(sep, '/')}`;
  hashes[key] = createHash('sha256').update(await readFile(file)).digest('hex').slice(0, 12);
}
const release = createHash('sha256').update(Object.entries(hashes).sort(([a], [b]) => a.localeCompare(b)).map(([path, hash]) => `${path}:${hash}`).join('|')).digest('hex').slice(0, 12);
for (const file of files.filter(file => file.endsWith('.html'))) {
  let html = await readFile(file, 'utf8');
  const next = html.replace(/\b(src|href)="([^"#]+)"/g, (match, attribute, value) => {
    if (/^(?:https?:|mailto:|tel:|data:|#)/i.test(value) || value.endsWith('.html')) return match;
    const bare = value.split('?')[0];
    if (!cacheable.has(extname(bare).toLowerCase())) return match;
    const local = bare.startsWith('/') ? resolve(root, `.${bare}`) : resolve(dirname(file), bare);
    if (!local.startsWith(`${root}${sep}`) || !existsSync(local)) return match;
    return `${attribute}="${bare}?v=${release}"`;
  });
  if (next !== html) { await writeFile(file, next, 'utf8'); changed.push(relative(root, file).replaceAll(sep, '/')); }
}
await writeFile(join(root, 'data', 'cache-hashes.json'), `${JSON.stringify({ release, generatedAt: new Date().toISOString(), assets: hashes }, null, 2)}\n`);
console.log(`Cache hash ${release}; ${changed.length} páginas atualizadas.`);
