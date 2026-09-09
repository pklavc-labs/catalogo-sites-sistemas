(() => {
  const categories = [["ecommerce","E-commerce"],["servicos","Serviços"],["portfolio","Portfólio"],["blog","Blog"],["sistemas","Sistemas / Dashboards"],["landing-pages","Landing Pages"]];
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
})();