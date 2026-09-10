/* Inline editing controls for a demo. They are never part of the delivered template. */
(() => {
  const source = document.currentScript;
  const id = source?.dataset.catalogTemplate || 'modelo';
  const slug = source?.dataset.catalogModel || id;
  const category = source?.dataset.catalogCategory || 'outros';
  const defaultName = source?.dataset.catalogName || 'Minha Empresa';
  const previewMode = new URLSearchParams(location.search).has('catalogPreview');
  const key = `catalogo:pt:${category}:${slug}`;
  const defaults = { businessName: defaultName, heroText: '', primaryColor: '#4f46e5', secondaryColor: '#ffffff', accentColor: '#f59e0b', font: 'system-ui', buttonStyle: 'rounded', logo: '', heroImage: '', texts: {} };
  let state = { ...defaults };
  const editMode = { texts: true, buttons: false };
  try { state = { ...defaults, ...JSON.parse(localStorage.getItem(key) || '{}') }; } catch {}

  const db = () => new Promise((resolve, reject) => { const request = indexedDB.open('catalogo-imagens', 1); request.onupgradeneeded = () => request.result.createObjectStore('images'); request.onsuccess = () => resolve(request.result); request.onerror = () => reject(request.error); });
  const imageGet = async field => { try { const database = await db(); return await new Promise((resolve, reject) => { const request = database.transaction('images').objectStore('images').get(`${key}:${field}`); request.onsuccess = () => resolve(request.result || ''); request.onerror = () => reject(request.error); }); } catch { return ''; } };
  const imagePut = async (field, value) => { try { const database = await db(); await new Promise((resolve, reject) => { const request = database.transaction('images', 'readwrite').objectStore('images').put(value, `${key}:${field}`); request.onsuccess = resolve; request.onerror = () => reject(request.error); }); } catch { alert('A imagem não pôde ser salva neste navegador.'); } };
  const imageDelete = async field => { try { const database = await db(); database.transaction('images', 'readwrite').objectStore('images').delete(`${key}:${field}`); } catch {} };
  const persist = () => { try { localStorage.setItem(key, JSON.stringify({ ...state, logo: '', heroImage: '' })); } catch {} };

  function apply() {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', state.primaryColor); root.style.setProperty('--secondary-color', state.secondaryColor); root.style.setProperty('--accent-color', state.accentColor); root.style.setProperty('--bs-primary', state.primaryColor); root.style.setProperty('--bs-secondary', state.secondaryColor); root.style.fontFamily = state.font;
    Object.entries(state.texts || {}).forEach(([textId, value]) => document.querySelectorAll(`[data-catalog-text-id="${textId}"]`).forEach(element => { element.textContent = value; }));
    document.querySelectorAll('.btn-primary,.bg-primary,.text-primary').forEach(element => { if (element.classList.contains('text-primary')) element.style.setProperty('color', state.primaryColor, 'important'); else element.style.setProperty('background-color', state.primaryColor, 'important'); });
    document.querySelectorAll('.btn,.btn-primary').forEach(element => { element.style.borderRadius = state.buttonStyle === 'pill' ? '999px' : state.buttonStyle === 'square' ? '0' : '8px'; });
    if (state.logo) { const mark = document.querySelector('[data-catalog-logo]') || (() => { const image = document.createElement('img'); image.dataset.catalogLogo = ''; image.alt = state.businessName; image.style.cssText = 'height:32px;max-width:150px;object-fit:contain;vertical-align:middle;margin-right:8px'; document.querySelector('.navbar-brand')?.prepend(image); return image; })(); if (mark) mark.src = state.logo; }
    if (state.heroImage) { const hero = document.querySelector('header.masthead,.masthead,.hero,.page-header'); if (hero) { hero.style.backgroundImage = `linear-gradient(#0007,#0007),url("${state.heroImage}")`; hero.style.backgroundSize = 'cover'; hero.style.backgroundPosition = 'center'; } }
    persist();
  }

  function setText(textId, value) { state.texts[textId] = value; persist(); }
  function setButtonText(button, value) {
    const walker = document.createTreeWalker(button, NodeFilter.SHOW_TEXT); const first = walker.nextNode();
    if (first) first.nodeValue = value; else button.append(document.createTextNode(value));
  }
  function editableTextNodes() {
    const selector = 'h1,h2,h3,h4,h5,h6,p,figcaption,li,blockquote,td,th,label,small,span,a:not(.btn),.navbar-brand,[data-custom]';
    const skip = 'script,style,svg,pre,code,textarea,select,option,.catalog-ai,.catalog-controls,.catalog-edit-popover,.catalog-demo-quote';
    const items = [...document.querySelectorAll(selector)].filter(element => element.textContent.trim() && !element.closest(skip) && !element.closest('button,a.btn,input[type="button"],input[type="submit"],[role="button"]') && !element.querySelector('h1,h2,h3,h4,h5,h6,p,figcaption,li,blockquote,td,th,label,[data-custom]'));
    items.forEach((element, number) => {
      const textId = `text-${number}`; element.classList.add('catalog-direct-text'); element.dataset.catalogTextId = textId; element.spellcheck = true;
      if (Object.hasOwn(state.texts || {}, textId)) element.textContent = state.texts[textId];
      element.addEventListener('input', () => setText(textId, element.innerText));
      element.addEventListener('click', event => { if (editMode.texts && element.matches('a')) event.preventDefault(); });
    });
  }
  function buttonTextEditors() {
    const buttons = [...document.querySelectorAll('button,a.btn,input[type="button"],input[type="submit"],[role="button"]')].filter(button => button.textContent?.trim() && !button.closest('.catalog-ai,.catalog-controls,.catalog-edit-popover,.catalog-demo-quote'));
    buttons.forEach((button, index) => {
      const textId = `button-${index}`; const original = button.textContent.trim();
      button.dataset.catalogTextId = textId;
      if (Object.hasOwn(state.texts || {}, textId)) setButtonText(button, state.texts[textId]);
      button.addEventListener('input', () => setText(textId, button.innerText || button.textContent));
      button.addEventListener('click', event => { if (!editMode.buttons) return; event.preventDefault(); event.stopPropagation(); button.focus(); }, true);
      button.title = original;
    });
  }
  function updateEditMode() {
    document.querySelectorAll('.catalog-direct-text').forEach(element => { element.contentEditable = editMode.texts ? 'plaintext-only' : 'false'; element.classList.toggle('catalog-text-locked', !editMode.texts); });
    document.querySelectorAll('[data-catalog-text-id^="button-"]').forEach(element => { element.contentEditable = editMode.buttons ? 'plaintext-only' : 'false'; element.classList.toggle('catalog-button-unlocked', editMode.buttons); });
    document.querySelector('[data-edit-lock="texts"]')?.setAttribute('aria-pressed', String(editMode.texts));
    document.querySelector('[data-edit-lock="buttons"]')?.setAttribute('aria-pressed', String(editMode.buttons));
    const lockIcon = unlocked => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 10V7a5 5 0 0 1 9.5-2.1M5 10h14v10H5z" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>${unlocked ? '<path d="m13 14 2 2 4-4" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>' : '<path d="M12 14v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>'}</svg>`;
    const textControl = document.querySelector('[data-edit-lock="texts"]'); const buttonControl = document.querySelector('[data-edit-lock="buttons"]');
    if (textControl) textControl.innerHTML = `${lockIcon(editMode.texts)}<span>Textos</span>`;
    if (buttonControl) buttonControl.innerHTML = `${lockIcon(editMode.buttons)}<span>Botões</span>`;
  }
  function ensureLiquidGlass() { if (!document.getElementById('catalog-liquid-glass')) document.body.insertAdjacentHTML('beforeend', '<svg id="catalog-liquid-glass" width="0" height="0" aria-hidden="true"><defs><filter id="catalog-glass-filter"><feTurbulence type="fractalNoise" baseFrequency=".05 .05" numOctaves="1" seed="1" result="noise"/><feGaussianBlur in="noise" stdDeviation="2" result="blur"/><feDisplacementMap in="SourceGraphic" in2="blur" scale="18" xChannelSelector="R" yChannelSelector="B"/></filter></defs></svg>'); }
  function applyLiquidButtons() {
    const luminance = color => { const rgb = color.match(/\d+(?:\.\d+)?/g)?.slice(0, 3).map(Number); return rgb ? (rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722) / 255 : 0; };
    document.querySelectorAll('a.btn,button:not(.navbar-toggler)').forEach(button => {
      const style = getComputedStyle(button); const light = luminance(style.backgroundColor) > .58;
      button.style.setProperty('--catalog-liquid-text', light ? '#111827' : '#ffffff'); button.classList.add('catalog-liquid-button');
    });
  }
  function style() {
    const tag = document.createElement('style');
    tag.textContent = `.catalog-direct-text{cursor:text!important;outline-offset:3px}.catalog-direct-text:hover{outline:1px dashed rgb(129 140 248 / .72)}.catalog-direct-text:focus{outline:2px solid #818cf8!important;background:rgb(255 255 255 / .1)!important}.catalog-text-locked{cursor:default!important}.catalog-button-unlocked{outline:2px dashed #7dd3fc!important;outline-offset:4px}.catalog-liquid-button{position:relative!important;isolation:isolate!important;overflow:hidden!important;border:1px solid rgb(255 255 255 / .34)!important;border-radius:999px!important;background:linear-gradient(135deg,rgb(255 255 255 / .26),rgb(255 255 255 / .06))!important;color:var(--catalog-liquid-text,#fff)!important;text-shadow:0 1px 7px rgb(0 0 0 / .35)!important;box-shadow:0 0 6px rgb(0 0 0 / .03),0 2px 6px rgb(0 0 0 / .18),inset 3px 3px .5px -3px rgb(255 255 255 / .32),inset -3px -3px .5px -3px rgb(255 255 255 / .8),inset 0 0 8px rgb(255 255 255 / .08),0 0 12px rgb(255 255 255 / .12)!important;backdrop-filter:blur(12px) saturate(150%)!important;transition:transform .3s,filter .3s,box-shadow .3s!important}.catalog-liquid-button:hover{transform:scale(1.05)!important;filter:brightness(1.12)!important}.catalog-liquid-button:active{transform:scale(.98)!important;filter:brightness(.92)!important}.catalog-liquid-button:before{content:"";position:absolute;inset:1px;z-index:-1;border-radius:inherit;background:linear-gradient(125deg,rgb(255 255 255 / .28),transparent 42%,rgb(255 255 255 / .08));pointer-events:none}.catalog-controls{position:fixed;left:18px;bottom:18px;z-index:2147483645;display:flex;gap:9px;align-items:center;flex-wrap:wrap}.catalog-visual-button,.catalog-reset-button,.catalog-lock-button,.catalog-quote-link,.catalog-back-link{padding:13px 22px!important;color:#fff!important;font:600 14px system-ui!important;letter-spacing:.01em;white-space:nowrap}.catalog-lock-button{display:inline-flex!important;align-items:center!important;gap:7px;padding-inline:12px!important}.catalog-lock-button svg{width:17px;height:17px}.catalog-back-link{position:fixed!important;left:18px;top:18px;z-index:2147483645;text-decoration:none!important}.catalog-quote-link{position:fixed!important;left:50%;bottom:20px;z-index:2147483645;transform:translateX(-50%)}.catalog-quote-link:hover,.catalog-quote-link:focus{color:#fff!important;transform:translateX(-50%) scale(1.05)!important}.catalog-edit-popover{position:fixed;left:18px;bottom:78px;z-index:2147483646;width:min(360px,calc(100vw - 36px));max-height:calc(100dvh - 102px);overflow-x:hidden!important;overflow-y:auto!important;scrollbar-width:none;border:1px solid rgb(255 255 255 / .28);border-radius:20px;background:linear-gradient(135deg,rgb(18 28 49 / .95),rgb(7 12 25 / .93));box-shadow:0 20px 55px #000a;color:#f8fafc;padding:18px;font:14px system-ui;backdrop-filter:blur(16px)}.catalog-edit-popover::-webkit-scrollbar,.cdq-box::-webkit-scrollbar,.cai-messages::-webkit-scrollbar{display:none}.catalog-edit-popover h2{margin:0 42px 13px 0;font-size:17px}.catalog-edit-popover label{display:grid;gap:6px;margin:11px 0;color:#dbeafe;font-weight:700;font-size:12px}.catalog-edit-popover input,.catalog-edit-popover select{width:100%;box-sizing:border-box;border:1px solid rgb(255 255 255 / .24);border-radius:12px;background:rgb(255 255 255 / .09);color:#fff;padding:10px;outline:none}.catalog-edit-popover input[type="color"]{height:42px;padding:4px}.catalog-edit-popover option{background:#16213a}.catalog-edit-popover textarea{width:100%;box-sizing:border-box;border:1px solid rgb(255 255 255 / .24);border-radius:12px;background:rgb(255 255 255 / .09);color:#fff;padding:10px;resize:vertical}.catalog-popover-close-row{position:sticky;top:-18px;z-index:2;display:flex;justify-content:flex-end;padding:2px 0 6px;background:linear-gradient(135deg,rgb(18 28 49 / .98),rgb(7 12 25 / .98))}.catalog-popover-close{width:34px;height:34px;padding:0!important;font-size:20px!important}@media(max-width:520px){.catalog-controls{left:10px;bottom:10px;gap:6px}.catalog-visual-button,.catalog-reset-button,.catalog-lock-button{padding:11px 12px!important;font-size:12px!important}.catalog-back-link{left:10px;top:10px;padding:11px 13px!important;font-size:12px!important}.catalog-edit-popover{left:10px;bottom:68px;width:calc(100vw - 20px)}}`;
    document.head.append(tag);
  }
  function saveField(field, value) { state[field] = value; apply(); }
  function upload(field, input) { input.onchange = async () => { const image = input.files[0]; if (!image) return; const value = await new Promise(resolve => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.readAsDataURL(image); }); state[field] = value; await imagePut(field, value); apply(); }; }
  function openEditor(kind, label, extra) {
    document.querySelector('.catalog-edit-popover')?.remove();
    const popover = document.createElement('aside'); popover.className = 'catalog-edit-popover';
    const closeRow = document.createElement('div'); closeRow.className = 'catalog-popover-close-row'; const close = document.createElement('button'); close.type = 'button'; close.className = 'catalog-popover-close catalog-liquid-button'; close.textContent = '×'; close.setAttribute('aria-label', 'Fechar personalização'); close.onclick = () => popover.remove(); closeRow.append(close); popover.append(closeRow);
    const title = document.createElement('h2'); title.textContent = label; popover.append(title);
    const field = (title, name, type = 'text') => { const item = document.createElement('label'); item.textContent = title; const input = document.createElement('input'); input.type = type; input.value = state[name] || ''; input.oninput = () => saveField(name, input.value); item.append(input); popover.append(item); };
    const imageField = (title, name) => { const item = document.createElement('label'); item.textContent = title; const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*'; item.append(input); popover.append(item); upload(name, input); };
    if (kind === 'visual') { field('Cor principal', 'primaryColor', 'color'); field('Cor secundária', 'secondaryColor', 'color'); field('Cor de destaque', 'accentColor', 'color'); imageField('Enviar logo', 'logo'); imageField('Enviar imagem de capa', 'heroImage'); const font = document.createElement('label'); font.textContent = 'Fonte'; font.innerHTML += '<select><option value="system-ui">Sistema</option><option value="Arial,sans-serif">Arial</option><option value="Georgia,serif">Serifada</option></select>'; const select = font.querySelector('select'); select.value = state.font; select.onchange = () => saveField('font', select.value); popover.append(font); const shape = document.createElement('label'); shape.textContent = 'Formato dos botões'; shape.innerHTML += '<select><option value="rounded">Arredondado</option><option value="pill">Pílula</option><option value="square">Reto</option></select>'; const shapeSelect = shape.querySelector('select'); shapeSelect.value = state.buttonStyle; shapeSelect.onchange = () => saveField('buttonStyle', shapeSelect.value); popover.append(shape); }
    extra?.(popover); document.body.append(popover);
  }
  function mount() {
    ensureLiquidGlass(); style(); editableTextNodes(); buttonTextEditors(); applyLiquidButtons();
    const back = document.createElement('a'); back.className = 'catalog-back-link catalog-liquid-button'; back.href = '/'; back.textContent = '← Voltar aos templates'; document.body.append(back);
    const controls = document.createElement('div'); controls.className = 'catalog-controls';
    const visual = document.createElement('button'); visual.type = 'button'; visual.className = 'catalog-visual-button catalog-liquid-button'; visual.textContent = 'Personalizar visual'; visual.onclick = () => openEditor('visual', 'Personalizar visual');
    const textLock = document.createElement('button'); textLock.type = 'button'; textLock.className = 'catalog-lock-button catalog-liquid-button'; textLock.dataset.editLock = 'texts'; textLock.title = 'Bloquear ou desbloquear edição de textos'; textLock.onclick = () => { editMode.texts = !editMode.texts; updateEditMode(); };
    const buttonLock = document.createElement('button'); buttonLock.type = 'button'; buttonLock.className = 'catalog-lock-button catalog-liquid-button'; buttonLock.dataset.editLock = 'buttons'; buttonLock.title = 'Bloquear ou desbloquear edição dos botões'; buttonLock.onclick = () => { editMode.buttons = !editMode.buttons; updateEditMode(); };
    const reset = document.createElement('button'); reset.type = 'button'; reset.className = 'catalog-reset-button catalog-liquid-button'; reset.textContent = '↺ Resetar'; reset.onclick = async () => { if (!confirm('Resetar apenas este modelo?')) return; try { localStorage.removeItem(key); } catch {} await imageDelete('logo'); await imageDelete('heroImage'); state = { ...defaults }; apply(); location.reload(); };
    controls.append(visual, textLock, buttonLock, reset); document.body.append(controls); updateEditMode();
    const quote = document.createElement('button'); quote.type = 'button'; quote.className = 'catalog-quote-link catalog-liquid-button'; quote.dataset.demoQuote = ''; quote.title = 'Solicitar orçamento'; quote.textContent = 'Orçamento deste template'; document.body.append(quote);
  }
  async function hydrate() { state.logo = await imageGet('logo'); state.heroImage = await imageGet('heroImage'); apply(); }
  document.addEventListener('DOMContentLoaded', () => { if (!previewMode) mount(); hydrate(); });
})();
