/* DOM implementation of the supplied SqueezeCarousel component for static hosting. */
(() => {
  const layoutFix = document.createElement('style');
  layoutFix.textContent = '.sq-panel,.sq-panel-item{width:100%;min-width:0}.sq-panel-copy{min-width:0}.sq-blog{font-family:Inter,ui-sans-serif,system-ui,sans-serif}.sq-blog-window{overflow:hidden;cursor:grab;touch-action:pan-y}.sq-blog-window.dragging{cursor:grabbing}.sq-blog-track{display:flex;gap:18px;transition:transform .7s cubic-bezier(.16,1,.3,1);will-change:transform}.sq-blog-card{flex:0 0 min(52vw,650px);position:relative;overflow:hidden;border-radius:8px;aspect-ratio:16/9;background:#202632;user-select:none}.sq-blog-card img{width:100%;height:100%;object-fit:cover;display:block;pointer-events:none}.sq-blog-card:after{content:"";position:absolute;inset:0;background:linear-gradient(to top,#07090ecc,transparent 62%)}.sq-blog-card div{position:absolute;z-index:1;inset:auto 20px 18px;color:#fff}.sq-blog-card strong{display:block;font-size:21px;letter-spacing:-.04em}.sq-blog-card span{display:block;margin-top:4px;color:#d0d7e5;font-size:14px}.sq-blog-all{display:block;width:max-content;margin:22px auto 0;color:#fff;text-decoration:none;font-size:15px;font-weight:600}.sq-blog-all:hover,.sq-blog-all:focus-visible{color:#a5b4fc;text-decoration:underline}@media(max-width:760px){.sq-blog-track{gap:12px}.sq-blog-card{flex-basis:82vw}.sq-blog-card div{inset:auto 15px 14px}.sq-blog-card strong{font-size:18px}}';
  document.head.append(layoutFix);
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
  const pathOf = item => `/pt/${item.category}/${item.slug}/`;
  const previewOf = item => `${pathOf(item)}${item.preview}`;

  function createBlogCarousel([category, label], posts) {
    const instance = document.createElement('section');
    instance.className = 'sq-blog';
    instance.setAttribute('aria-label', label);
    if (!posts.length) return instance;
    instance.innerHTML = `<div class="sq-blog-window" aria-label="Postagens do blog" tabindex="0"><div class="sq-blog-track"></div></div><a class="sq-blog-all" href="/pt/blog/">Ver tudo</a>`;
    const window = instance.querySelector('.sq-blog-window');
    const track = instance.querySelector('.sq-blog-track');
    posts.forEach(post => {
      const card = document.createElement('article');
      card.className = 'sq-blog-card';
      card.innerHTML = `<img src="${previewOf(post)}" alt="Preview de ${escapeHtml(post.name)}"><div><strong>${escapeHtml(post.name)}</strong><span>${escapeHtml(post.description)}</span></div>`;
      track.append(card);
    });
    let index = 0, dragging = false, startX = 0, delta = 0, timer;
    const cardStep = () => {
      const first = track.firstElementChild;
      return first ? first.getBoundingClientRect().width + 18 : 0;
    };
    const paint = animate => {
      track.style.transition = animate ? 'transform .7s cubic-bezier(.16,1,.3,1)' : 'none';
      track.style.transform = `translateX(${-index * cardStep()}px)`;
    };
    const schedule = () => {
      clearInterval(timer);
      timer = setInterval(() => { index = (index + 1) % posts.length; paint(true); }, 9000);
    };
    const move = clientX => {
      delta = clientX - startX;
      track.style.transition = 'none';
      track.style.transform = `translateX(${(-index * cardStep()) + delta}px)`;
    };
    const finish = () => {
      if (!dragging) return;
      dragging = false; window.classList.remove('dragging');
      const threshold = cardStep() * .16;
      if (delta < -threshold) index = Math.min(posts.length - 1, index + 1);
      if (delta > threshold) index = Math.max(0, index - 1);
      paint(true); schedule();
    };
    window.addEventListener('pointerdown', event => { dragging = true; startX = event.clientX; delta = 0; window.setPointerCapture(event.pointerId); window.classList.add('dragging'); clearInterval(timer); });
    window.addEventListener('pointermove', event => { if (dragging) move(event.clientX); });
    window.addEventListener('pointerup', finish);
    window.addEventListener('pointercancel', finish);
    window.addEventListener('keydown', event => { if (event.key === 'ArrowRight') { index = Math.min(posts.length - 1, index + 1); paint(true); schedule(); } if (event.key === 'ArrowLeft') { index = Math.max(0, index - 1); paint(true); schedule(); } });
    addEventListener('resize', () => paint(false));
    paint(false); schedule();
    return instance;
  }

  function createCarousel([category, label], templates) {
    const slides = templates.map(template => ({ ...template, overlay: label, action: 'Visualizar demo', href: `${pathOf(template)}demo/` }));
    slides.push({ id: `more-${category}`, name: 'Ver mais', description: 'Veja todos os modelos desta categoria.', overlay: label, action: 'Ver todos os modelos', href: `/pt/${category}/`, fallback: true });
    if (!templates.length) slides.splice(0, 1, { id: `coming-${category}`, name: 'Em breve', description: 'Novos modelos serão adicionados aqui.', overlay: label, action: 'Abrir categoria', href: `/pt/${category}/`, fallback: true });

    const slats = Math.max(1, Math.min(slides.length - 4, 3));
    const visible = 4 + slats;
    let open = 0;
    let hover = -1;
    const slots = [];
    const wrap = index => ((index % slides.length) + slides.length) % slides.length;
    const instance = document.createElement('section');
    instance.className = 'sq-instance';
    instance.setAttribute('aria-label', label);
    instance.innerHTML = `<div class="sq-controls"><button type="button" aria-label="Anterior">←</button><button type="button" aria-label="Próximo">→</button></div><div class="sq-window"><div class="sq-strip" role="tablist" aria-label="${escapeHtml(label)}"></div></div><div class="sq-panel" role="tabpanel" aria-live="polite"></div>`;
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
        ? `<span class="sq-fallback"></span><span class="sq-overlay"><span>${escapeHtml(slide.overlay)}</span></span>`
        : `<img src="${previewOf(slide)}" alt="Preview de ${escapeHtml(slide.name)}"><span class="sq-overlay"><span>${escapeHtml(slide.overlay)}</span></span>`;
    };
    const select = next => {
      open = wrap(next);
      hover = -1;
      slots.forEach(paintSlot);
      setWidths();
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
      element.addEventListener('mouseenter', () => { hover = column; setWidths(); });
      element.addEventListener('mouseleave', () => { hover = -1; setWidths(); });
      element.addEventListener('click', () => { if (column > 0) select(open + column); });
      strip.append(element);
    }
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
      const templates = await fetch('/data/templates.json').then(response => {
        if (!response.ok) throw Error('templates');
        return response.json();
      });
      categories.forEach(category => host.append(category[0] === 'blog' ? createBlogCarousel(category, templates.filter(template => template.category === category[0])) : createCarousel(category, templates.filter(template => template.category === category[0]))));
    } catch {
      host.textContent = 'Não foi possível carregar os modelos.';
    }
  }
  document.addEventListener('DOMContentLoaded', init);
})();
