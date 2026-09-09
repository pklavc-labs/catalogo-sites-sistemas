import { readFile, writeFile } from 'node:fs/promises';

const templates = JSON.parse(await readFile('data/templates.json', 'utf8'));
const categories = [
  ['ecommerce', 'E-commerce'],
  ['servicos', 'Serviços'],
  ['portfolio', 'Portfólio'],
  ['blog', 'Blog'],
  ['sistemas', 'Sistemas / Dashboards'],
  ['landing-pages', 'Landing Pages'],
];

const css = `:root{--sq-accent:#18181b;--sq-on-accent:#fff}.squeeze-series{width:100%;padding:40px 24px;display:grid;gap:54px;background:#fff}.sq-instance{container-type:inline-size;font-family:Inter,ui-sans-serif,system-ui,sans-serif;--sq-h:320px;--sq-gap:16px;--sq-slat-gap:8px;--sq-slat:8px;--sq-radius:6px;--sq-ms:1000ms;--sq-ease:cubic-bezier(.16,1,.3,1);--sq-hero:calc(var(--sq-h) * 16 / 9);--sq-room:calc(100cqi - var(--sq-hero) - 3 * var(--sq-slat-gap) - 3 * var(--sq-gap) - 3 * var(--sq-slat))}.sq-controls{display:flex;justify-content:flex-end;gap:8px;margin:0 0 16px}.sq-controls button{width:36px;height:36px;border:0;border-radius:6px;background:var(--sq-accent);color:var(--sq-on-accent);font-size:21px;line-height:1;cursor:pointer;transition:opacity .2s}.sq-controls button:hover{opacity:.85}.sq-controls button:focus-visible,.sq-card:focus-visible,.sq-action:focus-visible{outline:2px solid var(--sq-accent);outline-offset:3px}.sq-window{height:var(--sq-h);width:100%;overflow:hidden}.sq-strip{height:100%;display:flex;width:max-content}.sq-card{position:relative;isolation:isolate;height:100%;flex:0 0 auto;overflow:hidden;border:0;padding:0;background:#e5e7eb;cursor:pointer;outline:0;transition:width var(--sq-ms) var(--sq-ease),margin-left var(--sq-ms) var(--sq-ease),border-radius var(--sq-ms) var(--sq-ease)}.sq-card img,.sq-card .sq-fallback{position:absolute;inset:0 auto 0 50%;width:var(--sq-hero);min-width:100%;height:100%;max-width:none;transform:translateX(-50%);object-fit:cover;pointer-events:none}.sq-card .sq-fallback{background:linear-gradient(135deg,#1e1b4b,#4f46e5)}.sq-overlay{position:absolute;inset:auto 0 0;display:flex;align-items:end;padding:24px;padding-top:80px;background:linear-gradient(to top,rgb(0 0 0 / .55),transparent);color:#fff;text-align:left;pointer-events:none;opacity:0;transition:opacity var(--sq-ms) var(--sq-ease)}.sq-overlay span{font-size:14px;font-weight:600;letter-spacing:-.02em}.sq-card.front .sq-overlay{opacity:1}.sq-panel{display:grid;margin-top:24px}.sq-panel-item{grid-column:1;grid-row:1;display:flex;gap:26px;justify-content:space-between;align-items:flex-start;opacity:0;visibility:hidden;pointer-events:none;transition:opacity var(--sq-ms) var(--sq-ease),visibility var(--sq-ms)}.sq-panel-item.shown{opacity:1;visibility:visible;pointer-events:auto}.sq-panel-copy{max-width:740px;margin:0;font-size:17px;line-height:1.6}.sq-panel-copy strong{color:#16181d;font-weight:500}.sq-panel-copy span{color:#6b7280}.sq-action{display:inline-flex;flex:none;align-items:center;gap:9px;padding:10px 16px;border-radius:6px;background:var(--sq-accent);color:var(--sq-on-accent);font-size:14px;font-weight:600;text-decoration:none;white-space:nowrap;transition:opacity .2s}.sq-action:hover{opacity:.85}.sq-action svg{transition:transform .2s}.sq-action:hover svg{transform:translateX(2px)}@media(max-width:760px){.squeeze-series{padding:24px 16px;gap:42px}.sq-instance{--sq-h:220px;--sq-gap:10px;--sq-slat-gap:5px;--sq-slat:6px}.sq-overlay{padding:16px;padding-top:55px}.sq-panel{margin-top:18px}.sq-panel-item{display:block}.sq-panel-copy{font-size:15px}.sq-action{margin-top:14px}.sq-controls{margin-bottom:10px}}`;

const js = `(() => {
  const categories = ${JSON.stringify(categories)};
  const shares = [-0.06, 0.61, 0.3, 0.15];
  const stretched = [0, 0.71, 0.4, 0.25];
  const squeezed = [-0.12, 0.59, 0.28, 0.13];
  const escapeHtml = value => String(value || '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[char]));
  const pathOf = item => '/pt/' + item.category + '/' + item.slug + '/';
  const previewOf = item => pathOf(item) + item.preview;

  function carousel(category, items) {
    const slides = items.map(item => ({ ...item, action: 'Visualizar demo', href: pathOf(item) + 'demo/', overlay: category[1] }));
    slides.push({ id: 'more-' + category[0], name: 'Ver mais', description: 'Veja todos os modelos desta categoria.', action: 'Ver todos os modelos', href: '/pt/' + category[0] + '/', overlay: category[1], fallback: true });
    if (items.length === 0) slides.splice(0, 1, { id: 'coming-' + category[0], name: 'Em breve', description: 'Novos modelos serão adicionados aqui.', action: 'Abrir categoria', href: '/pt/' + category[0] + '/', overlay: category[1], fallback: true });
    const slats = Math.max(1, Math.min(slides.length - 4, 3));
    const visible = 4 + slats;
    let open = 0, hover = -1;
    const element = document.createElement('section');
    element.className = 'sq-instance';
    element.setAttribute('aria-label', category[1]);
    element.innerHTML = '<div class="sq-controls"><button type="button" aria-label="Anterior">←</button><button type="button" aria-label="Próximo">→</button></div><div class="sq-window"><div class="sq-strip" role="tablist" aria-label="' + escapeHtml(category[1]) + '"></div></div><div class="sq-panel" role="tabpanel" aria-live="polite"></div>';
    const strip = element.querySelector('.sq-strip');
    const panel = element.querySelector('.sq-panel');
    const wrap = index => ((index % slides.length) + slides.length) % slides.length;
    const width = (column, activeHover) => {
      if (column > 3) return 'var(--sq-slat)';
      const set = activeHover >= 0 && activeHover <= 3 ? (activeHover === column ? stretched : squeezed) : shares;
      return column === 0 ? 'calc(var(--sq-hero) + var(--sq-room) * ' + set[column] + ')' : 'calc(var(--sq-room) * ' + set[column] + ')';
    };
    const redraw = () => {
      strip.innerHTML = '';
      panel.innerHTML = '';
      for (let column = 0; column < visible; column++) {
        const item = slides[wrap(open + column)];
        const card = document.createElement('button');
        card.type = 'button'; card.className = 'sq-card' + (column === 0 ? ' front' : '');
        card.role = 'tab'; card.ariaSelected = String(column === 0); card.tabIndex = column === 0 ? 0 : -1;
        card.ariaLabel = item.name;
        card.style.width = width(column, hover);
        card.style.marginLeft = column === 0 ? '0' : column < 4 ? 'var(--sq-gap)' : 'var(--sq-slat-gap)';
        card.style.borderRadius = 'min(var(--sq-radius), calc(' + width(column, hover) + ' / 2))';
        card.innerHTML = item.fallback ? '<span class="sq-fallback"></span>' : '<img src="' + previewOf(item) + '" alt="Preview de ' + escapeHtml(item.name) + '">';
        card.insertAdjacentHTML('beforeend', '<span class="sq-overlay"><span>' + escapeHtml(item.overlay) + '</span></span>');
        card.onmouseenter = () => { hover = column; redraw(); };
        card.onmouseleave = () => { hover = -1; redraw(); };
        card.onclick = () => { if (column > 0) { open = wrap(open + column); hover = -1; redraw(); } };
        strip.append(card);
      }
      const item = slides[open];
      const line = document.createElement('div'); line.className = 'sq-panel-item shown';
      line.innerHTML = '<p class="sq-panel-copy"><strong>' + escapeHtml(item.name) + '</strong> <span>' + escapeHtml(item.description) + '</span></p><a class="sq-action" href="' + item.href + '">' + escapeHtml(item.action) + '<svg width="6" height="9" viewBox="0 0 6 9" fill="none" aria-hidden="true"><path d="M1.2 1 4.7 4.5 1.2 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></a>';
      panel.append(line);
    };
    element.querySelectorAll('.sq-controls button')[0].onclick = () => { open = wrap(open - 1); hover = -1; redraw(); };
    element.querySelectorAll('.sq-controls button')[1].onclick = () => { open = wrap(open + 1); hover = -1; redraw(); };
    element.addEventListener('keydown', event => { if (event.key === 'ArrowRight') { event.preventDefault(); open = wrap(open + 1); redraw(); } if (event.key === 'ArrowLeft') { event.preventDefault(); open = wrap(open - 1); redraw(); } });
    redraw();
    return element;
  }

  async function init() {
    const host = document.querySelector('[data-squeeze-series]');
    if (!host) return;
    try {
      const templates = await fetch('/data/templates.json').then(response => { if (!response.ok) throw Error('templates'); return response.json(); });
      categories.forEach(category => host.append(carousel(category, templates.filter(item => item.category === category[0]))));
    } catch { host.textContent = 'Não foi possível carregar os modelos.'; }
  }
  document.addEventListener('DOMContentLoaded', init);
})();`;

const page = depth => `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Catálogo Web</title><meta name="description" content="Modelos de sites, sistemas e experiências web."><link rel="icon" href="${depth}assets/favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="${depth}css/squeeze-series.css"></head><body><main class="squeeze-series" data-squeeze-series aria-label="Modelos disponíveis"></main><script src="${depth}js/squeeze-series.js" defer></script></body></html>`;

await writeFile('css/squeeze-series.css', css, 'utf8');
await writeFile('js/squeeze-series.js', js, 'utf8');
await writeFile('index.html', page(''), 'utf8');
await writeFile('pt/index.html', page('../'), 'utf8');
console.log(`Squeeze series generated for ${templates.length} templates.`);
