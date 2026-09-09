import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const templates = JSON.parse(await readFile('data/templates.json', 'utf8'));
async function htmlFiles(folder) {
  const entries = await readdir(folder, { withFileTypes: true });
  const result = [];
  for (const entry of entries) {
    const target = path.join(folder, entry.name);
    if (entry.isDirectory()) result.push(...await htmlFiles(target));
    else if (/\.html?$/i.test(entry.name)) result.push(target);
  }
  return result;
}

let updated = 0;
for (const template of templates) {
  const demo = path.join('pt', template.category, template.slug, 'demo');
  for (const file of await htmlFiles(demo)) {
    let html = await readFile(file, 'utf8');
    html = html.replace(/<script src="\.\.\/\.\.\/\.\.\/\.\.\/js\/(?:demo-customizer|demo-quote-bridge|demo-localize-pt)\.js"[^>]*><\/script>\s*/g, '');
    html = html.replace(/<html([^>]*?)\slang=(['"])[^'"]*\2/i, '<html$1 lang="pt-BR"');
    if (!/<html[^>]*\slang=/i.test(html)) html = html.replace(/<html/i, '<html lang="pt-BR"');
    const hooks = `<script src="../../../../js/demo-localize-pt.js"></script><script src="../../../../js/demo-customizer.js" data-catalog-template="${template.id}" data-catalog-model="${template.slug}" data-catalog-category="${template.category}" data-catalog-name="${template.name}"></script><script src="../../../../js/demo-quote-bridge.js" data-catalog-template="${template.id}"></script>`;
    html = html.replace('</body>', `${hooks}</body>`);
    await writeFile(file, html, 'utf8');
    updated++;
  }
}
console.log(`Localized and instrumented ${updated} demo pages.`);
