/* DOM implementation of the supplied SqueezeCarousel component for static hosting. */
(() => {
  const source = document.currentScript;
  const appBase = source?.src ? new URL('../', source.src) : new URL('./', location.href);
  const appUrl = path => new URL(String(path).replace(/^\/+/, ''), appBase).href;
  const buildVersion = source?.src ? new URL(source.src).searchParams.get('v') || '' : '';
  const versioned = url => buildVersion ? `${url}${url.includes('?') ? '&' : '?'}v=${buildVersion}` : url;
  const layoutFix = document.createElement('style');
  layoutFix.textContent = '.sq-panel,.sq-panel-item{width:100%;min-width:0}.sq-panel-copy{min-width:0}';
  document.head.append(layoutFix);
  const controlStyle = document.createElement('style');
  controlStyle.textContent = '.sq-controls button{width:auto!important;height:auto!important;min-width:48px!important;padding:12px 17px!important;border:1px solid rgb(255 255 255 / .25)!important;border-radius:999px!important;background:linear-gradient(135deg,rgb(110 231 208 / .95),rgb(77 183 225 / .9))!important;box-shadow:0 8px 22px rgb(36 211 238 / .2)!important;color:#07111c!important;font:800 22px/1 system-ui!important}.sq-controls button:hover{transform:translateY(-2px)!important;filter:brightness(1.08)!important}';
  document.head.append(controlStyle);
  const overflowFix = document.createElement('style');
  overflowFix.textContent = 'html,body{overflow-x:hidden}.squeeze-series{box-sizing:border-box}.sq-window,.sq-blog-window{max-width:100%}';
  document.head.append(overflowFix);
  const categories = [
    ['ecommerce', 'E-commerce'], ['servicos', 'Serviços'], ['portfolio', 'Portfólio'],
    ['blog', 'Blog'], ['sistemas', 'Sistemas / Dashboards'], ['landing-pages', 'Landing Pages'],
  ];
  const SHARES = [-0.06, 0.61, 0.3, 0.15];
  const STRETCHED = [0, 0.71, 0.4, 0.25];
  const SQUEEZED = [-0.12, 0.59, 0.28, 0.13];
  const escapeHtml = value => String(value || '').replace(/[&<>"']/g, char => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[char]));
  const pathOf = item => appUrl(`pt/${item.category}/${item.slug}/`);
  const previewOf = item => versioned(`${pathOf(item)}${item.preview}`);

  function createCarousel([category, label], templates) {
    const slides = templates.map(template => ({ ...template, overlay: label, action: 'Visualizar demo', href: `${pathOf(template)}demo/` }));
    slides.push({ id: `more-${category}`, name: 'Ver mais', description: 'Veja todos os modelos desta categoria.', overlay: label, action: 'Ver todos os modelos', href: appUrl(`pt/${category}/`), fallback: true });
    if (!templates.length) slides.splice(0, 1, { id: `coming-${category}`, name: 'Em breve', description: 'Novos modelos serão adicionados aqui.', overlay: label, action: 'Abrir categoria', href: appUrl(`pt/${category}/`), fallback: true });

    const slats = Math.max(1, Math.min(slides.length - 4, 3));
    const visible = 4 + slats;
    let open = 0;
    let hover = -1;
    const slots = [];
    const wrap = index => ((index % slides.length) + slides.length) % slides.length;
    const instance = document.createElement('section');
    instance.className = 'sq-instance';
    instance.setAttribute('aria-label', label);
    instance.innerHTML = `<header class="sq-heading"><h2>${escapeHtml(label)}</h2><div class="sq-controls"><button type="button" aria-label="Modelo anterior">↼</button><button type="button" aria-label="Próximo modelo">⇀</button></div></header><div class="sq-window"><div class="sq-strip" role="tablist" aria-label="${escapeHtml(label)}"></div></div><div class="sq-panel" role="tabpanel" aria-live="polite"></div>`;
    const strip = instance.querySelector('.sq-strip');
    const panel = instance.querySelector('.sq-panel');

    const widthOf = column => {
      if (column > 3) return 'var(--sq-slat)';
      const shares = hover >= 0 && hover <= 3 ? (hover === column ? STRETCHED : SQUEEZED) : SHARES;
      return column === 0 ? `calc(var(--sq-hero) + var(--sq-room) * ${shares[column]})` : `calc(var(--sq-room) * ${shares[column]})`;
    };
    const setWidths = () => slots.forEach(({ element, column }) => {
      const width = widthOf(column);
      element.style.width = width;
      element.style.borderRadius = `min(var(--sq-radius), calc(${width} / 2))`;
    });
    const fitLivePreview = () => requestAnimationFrame(() => slots.forEach(({ element }) => {
      const frame = element.querySelector('.sq-live-preview');
      if (!frame) return;
      frame.style.transform = `scale(${element.clientWidth / 1440})`;
    }));
    const paintPanel = () => {
      const slide = slides[open];
      panel.innerHTML = `<div class="sq-panel-item shown"><p class="sq-panel-copy"><strong>${escapeHtml(slide.name)}</strong> <span>${escapeHtml(slide.description)}</span></p><a class="sq-action" href="${slide.href}">${escapeHtml(slide.action)}<svg width="6" height="9" viewBox="0 0 6 9" fill="none" aria-hidden="true"><path d="M1.2 1 4.7 4.5 1.2 8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg></a></div>`;
    };
    const paintSlot = ({ element, column }) => {
      const slide = slides[wrap(open + column)];
      element.classList.toggle('front', column === 0);
      element.setAttribute('aria-selected', String(column === 0));
      element.tabIndex = column === 0 ? 0 : -1;
      element.setAttribute('aria-label', slide.name);
      element.innerHTML = slide.fallback
        ? `<span class="sq-fallback"></span>`
        : column === 0
          ? `<iframe class="sq-live-preview" src="${versioned(`${slide.href}?catalogPreview=1`)}" title="Visualização de ${escapeHtml(slide.name)}" loading="lazy" scrolling="no" tabindex="-1"></iframe>`
          : `<img src="${previewOf(slide)}" alt="Preview de ${escapeHtml(slide.name)}">`;
    };
    const select = next => {
      open = wrap(next);
      hover = -1;
      slots.forEach(paintSlot);
      setWidths();
      fitLivePreview();
      paintPanel();
    };

    for (let column = 0; column < visible; column++) {
      const element = document.createElement('button');
      element.type = 'button';
      element.className = 'sq-card';
      element.role = 'tab';
      element.style.marginLeft = column === 0 ? '0' : column < 4 ? 'var(--sq-gap)' : 'var(--sq-slat-gap)';
      const slot = { element, column };
      slots.push(slot);
      element.addEventListener('mouseenter', () => { hover = column; setWidths(); fitLivePreview(); });
      element.addEventListener('mouseleave', () => { hover = -1; setWidths(); fitLivePreview(); });
      element.addEventListener('click', () => { if (column > 0) select(open + column); });
      strip.append(element);
    }
    new ResizeObserver(fitLivePreview).observe(instance);
    instance.querySelector('.sq-controls button:first-child').onclick = () => select(open - 1);
    instance.querySelector('.sq-controls button:last-child').onclick = () => select(open + 1);
    instance.addEventListener('keydown', event => {
      if (event.key === 'ArrowRight') { event.preventDefault(); select(open + 1); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); select(open - 1); }
    });
    select(0);
    return instance;
  }

  async function init() {
    const host = document.querySelector('[data-squeeze-series]');
    if (!host) return;
    try {
      const templates = await fetch(versioned(appUrl('data/templates.json'))).then(response => {
        if (!response.ok) throw Error('templates');
        return response.json();
      });
      categories.forEach(category => host.append(createCarousel(category, templates.filter(template => template.category === category[0]))));
    } catch {
      host.textContent = 'Não foi possível carregar os modelos.';
    }
  }
  document.addEventListener('DOMContentLoaded', init);
})();
