/* Inline editing controls for a demo. They are never part of the delivered template. */
(() => {
  const source = document.currentScript;
  const id = source?.dataset.catalogTemplate || 'modelo';
  const slug = source?.dataset.catalogModel || id;
  const category = source?.dataset.catalogCategory || 'outros';
  const defaultName = source?.dataset.catalogName || 'Minha Empresa';
  const key = `catalogo:pt:${category}:${slug}`;
  const defaults = { businessName: defaultName, heroText: '', primaryColor: '#4f46e5', secondaryColor: '#ffffff', accentColor: '#f59e0b', font: 'system-ui', buttonStyle: 'rounded', logo: '', heroImage: '', texts: {} };
  let state = { ...defaults };
  try { state = { ...defaults, ...JSON.parse(localStorage.getItem(key) || '{}') }; } catch {}

  const db = () => new Promise((resolve, reject) => {
    const request = indexedDB.open('catalogo-imagens', 1);
    request.onupgradeneeded = () => request.result.createObjectStore('images');
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  const imageGet = async field => { try { const database = await db(); return await new Promise((resolve, reject) => { const request = database.transaction('images').objectStore('images').get(`${key}:${field}`); request.onsuccess = () => resolve(request.result || ''); request.onerror = () => reject(request.error); }); } catch { return ''; } };
  const imagePut = async (field, value) => { try { const database = await db(); await new Promise((resolve, reject) => { const request = database.transaction('images', 'readwrite').objectStore('images').put(value, `${key}:${field}`); request.onsuccess = resolve; request.onerror = reject; }); } catch { alert('A imagem não pôde ser salva neste navegador.'); } };
  const imageDelete = async field => { try { const database = await db(); database.transaction('images', 'readwrite').objectStore('images').delete(`${key}:${field}`); } catch {} };

  function apply() {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', state.primaryColor);
    root.style.setProperty('--secondary-color', state.secondaryColor);
    root.style.setProperty('--accent-color', state.accentColor);
    root.style.setProperty('--bs-primary', state.primaryColor);
    root.style.setProperty('--bs-secondary', state.secondaryColor);
    root.style.fontFamily = state.font;
    Object.entries(state.texts || {}).forEach(([textId, value]) => {
      const element = document.querySelector(`[data-catalog-text-id="${textId}"]`);
      if (element) element.textContent = value;
    });
    document.querySelectorAll('.btn-primary,.bg-primary,.text-primary').forEach(element => {
      if (element.classList.contains('text-primary')) element.style.setProperty('color', state.primaryColor, 'important');
      else element.style.setProperty('background-color', state.primaryColor, 'important');
    });
    document.querySelectorAll('.btn,.btn-primary').forEach(element => element.style.borderRadius = state.buttonStyle === 'pill' ? '999px' : state.buttonStyle === 'square' ? '0' : '8px');
    if (state.logo) { const mark = document.querySelector('[data-catalog-logo]') || (() => { const image = document.createElement('img'); image.dataset.catalogLogo = ''; image.alt = state.businessName; image.style.cssText = 'height:32px;max-width:150px;object-fit:contain;vertical-align:middle;margin-right:8px'; const target = document.querySelector('.navbar-brand'); if (target) target.prepend(image); return image; })(); if (mark) mark.src = state.logo; }
    if (state.heroImage) { const hero = document.querySelector('header.masthead,.masthead,.hero,.page-header'); if (hero) { hero.style.backgroundImage = `linear-gradient(#0007,#0007),url("${state.heroImage}")`; hero.style.backgroundSize = 'cover'; hero.style.backgroundPosition = 'center'; } }
    persist();
  }

  function persist() { try { localStorage.setItem(key, JSON.stringify({ ...state, logo: '', heroImage: '' })); } catch {} }

  function makeTextsEditable() {
    const selector = 'h1,h2,h3,h4,h5,h6,p,figcaption,.navbar-brand,a.btn';
    const items = [...document.querySelectorAll(selector)].filter(element => element.textContent.trim() && !element.closest('script,style,svg,pre,code') && !element.querySelector('h1,h2,h3,h4,h5,h6,p,figcaption'));
    items.forEach((element, index) => {
      const textId = `text-${index}`;
      element.dataset.catalogTextId = textId;
      if (Object.hasOwn(state.texts || {}, textId)) element.textContent = state.texts[textId];
      element.contentEditable = 'plaintext-only';
      element.spellcheck = true;
      element.classList.add('catalog-direct-text');
      element.addEventListener('input', () => { state.texts[textId] = element.innerText; persist(); });
      element.addEventListener('click', event => { if (element.isContentEditable) event.preventDefault(); });
    });
  }

  function ensureLiquidGlass() {
    if (document.getElementById('catalog-liquid-glass')) return;
    document.body.insertAdjacentHTML('beforeend', '<svg id="catalog-liquid-glass" width="0" height="0" aria-hidden="true"><defs><filter id="catalog-glass-filter"><feTurbulence type="fractalNoise" baseFrequency=".05 .05" numOctaves="1" seed="1" result="noise"/><feGaussianBlur in="noise" stdDeviation="2" result="blur"/><feDisplacementMap in="SourceGraphic" in2="blur" scale="18" xChannelSelector="R" yChannelSelector="B"/></filter></defs></svg>');
  }
  function applyLiquidButtons() {
    document.querySelectorAll('a.btn,button:not(.navbar-toggler):not(.catalog-edit-icon)').forEach(button => button.classList.add('catalog-liquid-button'));
  }

  function style() {
    const tag = document.createElement('style');
    tag.textContent = `.catalog-edit-icon{position:absolute!important;z-index:2147483645!important;right:9px!important;top:9px!important;width:28px!important;height:28px!important;padding:0!important;border:1px solid #fff!important;border-radius:50%!important;background:#111d!important;color:#fff!important;font:15px/1 system-ui!important;opacity:.82!important;box-shadow:0 2px 9px #0007!important;cursor:pointer!important}.catalog-edit-icon:hover,.catalog-edit-icon:focus{opacity:1!important;transform:scale(1.08)!important}.catalog-edit-popover{position:fixed;right:18px;bottom:18px;z-index:2147483646;width:min(330px,calc(100vw - 36px));background:#fff;color:#152033;border-radius:12px;box-shadow:0 16px 50px #0008;padding:16px;font:14px system-ui}.catalog-edit-popover h2{margin:0 0 12px;font-size:16px}.catalog-edit-popover label{display:grid;gap:5px;margin:10px 0;font-weight:700;font-size:12px}.catalog-edit-popover input,.catalog-edit-popover select{width:100%;padding:8px;border:1px solid #cbd2dc;border-radius:7px}.catalog-edit-popover .actions{display:flex;gap:8px;margin-top:14px}.catalog-edit-popover button{border:0;border-radius:7px;padding:9px 11px;background:#e0e7ff;color:#312e81;font-weight:700;cursor:pointer}.catalog-reset-icon{position:fixed;right:18px;bottom:18px;z-index:2147483645;border:0;border-radius:50%;width:34px;height:34px;background:#182033;color:#fff;box-shadow:0 3px 14px #0006;cursor:pointer}`;
    tag.textContent += `.catalog-direct-text{cursor:text!important}.catalog-direct-text:focus{outline:2px solid #818cf8!important;outline-offset:4px!important;background:rgb(255 255 255 / .08)!important}.catalog-liquid-button{position:relative!important;isolation:isolate!important;overflow:hidden!important;border:1px solid rgb(255 255 255 / .34)!important;border-radius:999px!important;background:linear-gradient(135deg,rgb(255 255 255 / .26),rgb(255 255 255 / .06))!important;color:inherit!important;box-shadow:0 0 6px rgb(0 0 0 / .03),0 2px 6px rgb(0 0 0 / .18),inset 3px 3px .5px -3px rgb(255 255 255 / .32),inset -3px -3px .5px -3px rgb(255 255 255 / .8),inset 0 0 8px rgb(255 255 255 / .08),0 0 12px rgb(255 255 255 / .12)!important;backdrop-filter:blur(12px) saturate(150%)!important;transition:transform .3s,filter .3s,box-shadow .3s!important}.catalog-liquid-button:hover{transform:scale(1.05)!important;filter:brightness(1.12)!important}.catalog-liquid-button:active{transform:scale(.98)!important;filter:brightness(.92)!important}.catalog-liquid-button:before{content:"";position:absolute;inset:1px;z-index:-1;border-radius:inherit;background:linear-gradient(125deg,rgb(255 255 255 / .28),transparent 42%,rgb(255 255 255 / .08));pointer-events:none}.catalog-quote-link{position:fixed!important;left:50%;bottom:20px;z-index:2147483645;transform:translateX(-50%);padding:13px 22px!important;color:#fff!important;font:600 14px system-ui;letter-spacing:.01em;text-decoration:none!important;white-space:nowrap}.catalog-quote-link:hover,.catalog-quote-link:focus{color:#fff!important;transform:translateX(-50%) scale(1.05)!important}.catalog-visual-button{position:fixed!important;left:18px;bottom:18px;z-index:2147483645;padding:11px 16px!important;color:#fff!important;font:600 13px system-ui;background:linear-gradient(135deg,rgb(30 41 59 / .9),rgb(15 23 42 / .72))!important}.catalog-reset-icon{bottom:72px!important}`;
    document.head.append(tag);
  }
  function saveField(field, value) { state[field] = value; apply(); }
  function upload(field, input) { input.onchange = async () => { const image = input.files[0]; if (!image) return; const value = await new Promise(resolve => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.readAsDataURL(image); }); state[field] = value; await imagePut(field, value); apply(); }; }
  function openEditor(kind, label) {
    document.querySelector('.catalog-edit-popover')?.remove();
    const popover = document.createElement('aside'); popover.className = 'catalog-edit-popover'; popover.innerHTML = `<h2>${label}</h2>`;
    const field = (title, name, type = 'text') => { const label = document.createElement('label'); label.textContent = title; const input = document.createElement('input'); input.type = type; input.value = state[name] || ''; input.oninput = () => saveField(name, input.value); label.append(input); popover.append(label); };
    if (kind === 'name') { field('Nome exibido', 'businessName'); field('Título principal', 'heroText'); }
    if (kind === 'colors' || kind === 'visual') { field('Cor principal', 'primaryColor', 'color'); field('Cor secundária', 'secondaryColor', 'color'); field('Cor de destaque', 'accentColor', 'color'); }
    const imageField = (title, name) => { const label = document.createElement('label'); label.textContent = title; const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*'; label.append(input); popover.append(label); upload(name, input); };
    if (kind === 'logo') imageField('Enviar logo', 'logo');
    if (kind === 'hero') imageField('Enviar imagem de capa', 'heroImage');
    if (kind === 'visual') { imageField('Enviar logo', 'logo'); imageField('Enviar imagem de capa', 'heroImage'); }
    if (kind === 'style' || kind === 'visual') { const font = document.createElement('label'); font.textContent = 'Fonte'; font.innerHTML += '<select><option value="system-ui">Sistema</option><option value="Arial,sans-serif">Arial</option><option value="Georgia,serif">Serifada</option></select>'; const select = font.querySelector('select'); select.value = state.font; select.onchange = () => saveField('font', select.value); popover.append(font); }
    const actions = document.createElement('div'); actions.className = 'actions'; actions.innerHTML = '<button type="button">Fechar</button>'; actions.firstChild.classList.add('catalog-liquid-button'); actions.firstChild.onclick = () => popover.remove(); popover.append(actions); document.body.append(popover);
  }
  function mount() {
    ensureLiquidGlass();
    style();
    makeTextsEditable();
    applyLiquidButtons();
    const visual = document.createElement('button'); visual.type = 'button'; visual.className = 'catalog-visual-button catalog-liquid-button'; visual.textContent = 'Personalizar visual'; visual.onclick = () => openEditor('visual', 'Personalizar visual'); document.body.append(visual);
    const reset = document.createElement('button'); reset.type = 'button'; reset.className = 'catalog-reset-icon catalog-liquid-button'; reset.title = 'Resetar personalização'; reset.textContent = '↺'; reset.onclick = async () => { if (!confirm('Resetar apenas este modelo?')) return; try { localStorage.removeItem(key); } catch {} await imageDelete('logo'); await imageDelete('heroImage'); state = { ...defaults }; apply(); location.reload(); }; document.body.append(reset);
    const quote = document.createElement('button'); quote.type = 'button'; quote.className = 'catalog-quote-link catalog-liquid-button'; quote.dataset.demoQuote = ''; quote.title = 'Solicitar orçamento'; quote.textContent = 'Orçamento deste template'; document.body.append(quote);
  }
  async function hydrate() { state.logo = await imageGet('logo'); state.heroImage = await imageGet('heroImage'); apply(); }
  document.addEventListener('DOMContentLoaded', () => { mount(); hydrate(); });
})();
