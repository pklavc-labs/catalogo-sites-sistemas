import { readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const models = JSON.parse(await readFile('data/templates.json', 'utf8'));
for (const model of models) {
  const file = path.join('pt', model.category, model.slug, 'demo', 'index.html');
  if (!existsSync(file)) continue;
  const html = await readFile(file, 'utf8');
  const bridge = `<script src="../../../../js/demo-quote-bridge.js" data-catalog-template="${model.id}"></script>`;
  if (!html.includes('demo-quote-bridge.js')) await writeFile(file, html.replace('</body>', `${bridge}\n</body>`), 'utf8');
}
console.log(`Added demo quote bridge to ${models.length} demo pages.`);
