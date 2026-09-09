import { cp, mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const incoming = '.incoming-startbootstrap';
const additions = [
  ['ecommerce-002','produto-detalhe','E-commerce','ecommerce','shop-item','Shop Item','Página de produto pronta para uma loja virtual.',['ecommerce','produto','loja'],'https://assets.startbootstrap.com/img/screenshots/templates/shop-item.png'],
  ['blog-001','blog-clean','Blog','blog','clean-blog','Clean Blog','Tema editorial limpo para artigos e notícias.',['blog','notícias','editorial'],'https://assets.startbootstrap.com/img/screenshots/themes/clean-blog.png'],
  ['blog-002','blog-inicial','Blog','blog','blog-home','Blog Home','Página inicial de blog para conteúdos recorrentes.',['blog','conteúdo','artigos'],'https://assets.startbootstrap.com/img/screenshots/templates/blog-home.png'],
  ['blog-003','artigo-editorial','Blog','blog','blog-post','Blog Post','Layout de artigo completo para publicação editorial.',['blog','artigo','conteúdo'],'https://assets.startbootstrap.com/img/screenshots/templates/blog-post.png'],
  ['portfolio-002','portfolio-estiloso','Portfólio','portfolio','stylish-portfolio','Stylish Portfolio','Portfólio visual para profissionais e estúdios.',['portfólio','criativo','projetos'],'https://assets.startbootstrap.com/img/screenshots/themes/stylish-portfolio.png'],
  ['servicos-004','empresa-criativa','Serviços','servicos','creative','Creative','Landing institucional para empresas e serviços.',['empresa','serviços','landing'],'https://assets.startbootstrap.com/img/screenshots/themes/creative.png'],
  ['servicos-005','empresa-casual','Serviços','servicos','business-casual','Business Casual','Site empresarial completo para negócios locais.',['empresa','institucional','negócio'],'https://assets.startbootstrap.com/img/screenshots/themes/business-casual.png'],
  ['landing-002','app-lancamento','Landing Pages','landing-pages','new-age','New Age','Landing page de aplicativo e produto digital.',['landing','aplicativo','conversão'],'https://assets.startbootstrap.com/img/screenshots/themes/new-age.png'],
  ['landing-003','pagina-impacto','Landing Pages','landing-pages','one-page-wonder','One Page Wonder','Landing visual de página única.',['landing','one page','campanha'],'https://assets.startbootstrap.com/img/screenshots/themes/one-page-wonder.png'],
  ['sistemas-002','painel-admin2','Sistemas','sistemas','sb-admin-2','SB Admin 2','Dashboard administrativo com páginas de operação.',['dashboard','admin','sistema'],'https://assets.startbootstrap.com/img/screenshots/themes/sb-admin-2.png'],
  ['sistemas-003','painel-sidebar','Sistemas','sistemas','simple-sidebar','Simple Sidebar','Interface de sistema com navegação lateral.',['dashboard','sidebar','sistema'],'https://assets.startbootstrap.com/img/screenshots/templates/simple-sidebar.png'],
];
const existingPreviews = {
  'ecommerce-001':'https://assets.startbootstrap.com/img/screenshots/templates/shop-homepage.png',
  'servicos-001':'https://assets.startbootstrap.com/img/screenshots/themes/agency.png',
  'portfolio-001':'https://assets.startbootstrap.com/img/screenshots/themes/freelancer.png',
  'landing-001':'https://assets.startbootstrap.com/img/screenshots/themes/landing-page.png',
  'servicos-002':'https://assets.startbootstrap.com/img/screenshots/templates/business-frontpage.png',
  'servicos-003':'https://assets.startbootstrap.com/img/screenshots/templates/modern-business.png',
  'sistemas-001':'https://assets.startbootstrap.com/img/screenshots/templates/sb-admin.png',
};
const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[char]));

async function copyDemo(source, destination, meta) {
  const dist = existsSync(path.join(source, 'dist')) ? path.join(source, 'dist') : source;
  await cp(dist, destination, { recursive: true, filter: item => !item.includes(`${path.sep}.git`) && !item.includes(`${path.sep}node_modules`) && !item.includes(`${path.sep}scss`) && !item.endsWith('package-lock.json') && !item.endsWith('package.json') });
  const index = path.join(destination, 'index.html');
  const html = await readFile(index, 'utf8');
  const hooks = `<script src="../../../../js/demo-customizer.js" data-catalog-template="${meta.id}" data-catalog-model="${meta.slug}" data-catalog-category="${meta.category}" data-catalog-name="${esc(meta.name)}"></script><script src="../../../../js/demo-quote-bridge.js" data-catalog-template="${meta.id}"></script>`;
  await writeFile(index, html.includes('demo-customizer.js') ? html : html.replace('</body>', `${hooks}</body>`), 'utf8');
}

function modelPage(meta) {
  return `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(meta.name)} | Catálogo Web</title><meta name="description" content="${esc(meta.description)}"><link rel="stylesheet" href="../../../css/catalog.css"></head><body data-page="model" data-template-id="${meta.id}"><main class="model-page"><section class="model-hero"><div class="model-preview"><img src="preview.png" alt="Preview do template ${esc(meta.name)}"></div><div><p class="eyebrow">${esc(meta.id)} · ${esc(meta.categoryLabel)}</p><h1>${esc(meta.name)}</h1><p>${esc(meta.description)}</p><div class="hero-actions"><a class="button" href="demo/">Visualizar demo</a><button class="button secondary" data-open-quote>Solicitar orçamento</button></div></div></section></main><script src="../../../js/quote.js" defer></script></body></html>`;
}

const templates = JSON.parse(await readFile('data/templates.json', 'utf8'));
for (const [id, screenshot] of Object.entries(existingPreviews)) {
  const item = templates.find(template => template.id === id);
  if (!item) continue;
  item.preview = 'preview.png';
  item.previewSource = screenshot;
  const manifestPath = path.join('pt', item.category, item.slug, 'manifest.json');
  const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  manifest.preview = 'preview.png'; manifest.previewSource = screenshot;
  await writeFile(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
}

for (const [id, slug, categoryLabel, category, folder, name, description, tags, previewSource] of additions) {
  const source = path.join(incoming, folder);
  const packageJson = JSON.parse(await readFile(path.join(source, 'package.json'), 'utf8'));
  const meta = { id, slug, name, category, categoryLabel, language: 'pt', description, preview: 'preview.png', previewSource, demo: 'demo/', source: { repository: `https://github.com/StartBootstrap/startbootstrap-${folder}.git`, project: `Start Bootstrap ${name}`, author: 'Start Bootstrap' }, license: 'MIT', version: packageJson.version || '1.0.0', technologies: ['HTML','CSS','JavaScript','Bootstrap'], tags, customizable: { logo:true,businessName:true,primaryColor:true,secondaryColor:true,accentColor:true,heroImage:true,texts:true,font:true,buttonStyle:true } };
  const target = path.join('pt', category, slug);
  await mkdir(target, { recursive: true });
  await writeFile(path.join(target, 'manifest.json'), JSON.stringify(meta, null, 2), 'utf8');
  await writeFile(path.join(target, 'index.html'), modelPage(meta), 'utf8');
  await copyDemo(source, path.join(target, 'demo'), meta);
  await cp(path.join(source, 'LICENSE'), path.join('licenses', `${id}-MIT.txt`));
  templates.push(meta);
}
await writeFile('data/templates.json', JSON.stringify(templates, null, 2), 'utf8');
await writeFile('data/preview-downloads.json', JSON.stringify(templates.filter(item => item.previewSource).map(item => ({ id:item.id, output:`pt/${item.category}/${item.slug}/preview.png`, url:item.previewSource })), null, 2), 'utf8');
console.log(`Imported ${additions.length} actual Start Bootstrap templates; ${templates.length} total.`);
