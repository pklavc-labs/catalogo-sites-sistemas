import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname.slice(1).replaceAll('/', '\\');
async function walk(folder) {
  const entries = await readdir(folder, { withFileTypes: true });
  const files = await Promise.all(entries.map(entry => entry.isDirectory() ? walk(join(folder, entry.name)) : join(folder, entry.name)));
  return files.flat();
}
const files = (await walk(root)).filter(file => file.endsWith('.html'));
for (const file of files) {
  let html = await readFile(file, 'utf8');
  if (html.includes('assistant-widget.js')) continue;
  html = html.replace(/<\/body>/i, '<script src="/js/assistant-widget.js" defer></script></body>');
  await writeFile(file, html, 'utf8');
}
console.log(`Assistente inserido em ${files.length} páginas.`);
