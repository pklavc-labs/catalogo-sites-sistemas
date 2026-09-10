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
    const walker = document.createTreeWalker(button, NodeFilter.SHOW_TEXT);
    const node = walker.nextNode();
    if (node) node.nodeValue = value;
    else button.append(document.createTextNode(value));
  }
  function editableTextNodes() {
    const skip = 'script,style,svg,pre,code,textarea,select,option,.catalog-ai,.catalog-controls,.catalog-edit-popover,.catalog-demo-quote';
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = []; let node;
    while ((node = walker.nextNode())) if (node.nodeValue.trim() && !node.parentElement?.closest(skip)) nodes.push(node);
    let number = 0;
    nodes.forEach(textNode => {
      const parent = textNode.parentElement;
      if (!parent || parent.closest('button,a.btn,input[type="button"],input[type="submit"],[role="button"]')) return;
      const textId = `text-${number++}`;
      const editor = document.createElement('span'); editor.className = 'catalog-direct-text'; editor.dataset.catalogTextId = textId; editor.contentEditable = 'plaintext-only'; editor.spellcheck = true;
      editor.textContent = Object.hasOwn(state.texts || {}, textId) ? state.texts[textId] : textNode.nodeValue;
      textNode.replaceWith(editor);
      editor.addEventListener('input', () => setText(textId, editor.innerText));
      editor.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); editor.focus(); });
    });
  }
  function buttonTextEditors() {
    const buttons = [...document.querySelectorAll('button,a.btn,input[type="button"],input[type="submit"],[role="button"]')].filter(button => button.textContent?.trim() && !button.closest('.catalog-ai,.catalog-controls,.catalog-edit-popover,.catalog-demo-quote'));
    buttons.forEach((button, index) => {
      const textId = `button-${index}`; const original = button.textContent.trim();
      if (Object.hasOwn(state.texts || {}, textId)) setButtonText(button, state.texts[textId]);
      const host = button.parentElement; if (!host || host.querySelector(`:scope > [data-edit-button-for="${textId}"]`)) return;
      if (getComputedStyle(host).position === 'static') host.style.position = 'relative';
      const edit = document.createElement('button'); edit.type = 'button'; edit.className = 'catalog-button-text-edit catalog-liquid-button'; edit.dataset.editButtonFor = textId; edit.title = 'Editar texto do botão'; edit.setAttribute('aria-label', `Editar texto: ${original}`); edit.textContent = '✎';
      edit.onclick = event => { event.preventDefault(); event.stopPropagation(); openTextEditor(textId, button); };
      host.append(edit);
    });
  }
  function ensureLiquidGlass() { if (!document.getElementById('catalog-liquid-glass')) document.body.insertAdjacentHTML('beforeend', '<svg id="catalog-liquid-glass" width="0" height="0" aria-hidden="true"><defs><filter id="catalog-glass-filter"><feTurbulence type="fractalNoise" baseFrequency=".05 .05" numOctaves="1" seed="1" result="noise"/><feGaussianBlur in="noise" stdDeviation="2" result="blur"/><feDisplacementMap in="SourceGraphic" in2="blur" scale="18" xChannelSelector="R" yChannelSelector="B"/></filter></defs></svg>'); }
  function applyLiquidButtons() { document.querySelectorAll('a.btn,button:not(.navbar-toggler):not(.catalog-button-text-edit)').forEach(button => button.classList.add('catalog-liquid-button')); }
  function style() {
    const tag = document.createElement('style');
    tag.textContent = `.catalog-direct-text{cursor:text!important;outline-offset:3px}.catalog-direct-text:hover{outline:1px dashed rgb(129 140 248 / .72)}.catalog-direct-text:focus{outline:2px solid #818cf8!important;background:rgb(255 255 255 / .1)!important}.catalog-liquid-button{position:relative!important;isolation:isolate!important;overflow:hidden!important;border:1px solid rgb(255 255 255 / .34)!important;border-radius:999px!important;background:linear-gradient(135deg,rgb(255 255 255 / .26),rgb(255 255 255 / .06))!important;color:inherit!important;box-shadow:0 0 6px rgb(0 0 0 / .03),0 2px 6px rgb(0 0 0 / .18),inset 3px 3px .5px -3px rgb(255 255 255 / .32),inset -3px -3px .5px -3px rgb(255 255 255 / .8),inset 0 0 8px rgb(255 255 255 / .08),0 0 12px rgb(255 255 255 / .12)!important;backdrop-filter:blur(12px) saturate(150%)!important;transition:transform .3s,filter .3s,box-shadow .3s!important}.catalog-liquid-button:hover{transform:scale(1.05)!important;filter:brightness(1.12)!important}.catalog-liquid-button:active{transform:scale(.98)!important;filter:brightness(.92)!important}.catalog-liquid-button:before{content:"";position:absolute;inset:1px;z-index:-1;border-radius:inherit;background:linear-gradient(125deg,rgb(255 255 255 / .28),transparent 42%,rgb(255 255 255 / .08));pointer-events:none}.catalog-controls{position:fixed;left:18px;bottom:18px;z-index:2147483645;display:flex;gap:9px;align-items:center}.catalog-visual-button,.catalog-reset-button,.catalog-quote-link{padding:13px 22px!important;color:#fff!important;font:600 14px system-ui!important;letter-spacing:.01em;white-space:nowrap}.catalog-quote-link{position:fixed!important;left:50%;bottom:20px;z-index:2147483645;transform:translateX(-50%)}.catalog-quote-link:hover,.catalog-quote-link:focus{color:#fff!important;transform:translateX(-50%) scale(1.05)!important}.catalog-button-text-edit{position:absolute!important;z-index:2147483645;right:-10px;top:-12px;width:30px!important;height:30px!important;min-height:30px!important;padding:0!important;color:#fff!important;font:16px/1 system-ui!important}.catalog-edit-popover{position:fixed;left:18px;bottom:78px;z-index:2147483646;width:min(360px,calc(100vw - 36px));max-height:calc(100dvh - 102px);overflow:auto;border:1px solid rgb(255 255 255 / .28);border-radius:20px;background:linear-gradient(135deg,rgb(18 28 49 / .95),rgb(7 12 25 / .93));box-shadow:0 20px 55px #000a;color:#f8fafc;padding:18px;font:14px system-ui;backdrop-filter:blur(16px)}.catalog-edit-popover h2{margin:0 0 13px;font-size:17px}.catalog-edit-popover label{display:grid;gap:6px;margin:11px 0;color:#dbeafe;font-weight:700;font-size:12px}.catalog-edit-popover input,.catalog-edit-popover select{width:100%;box-sizing:border-box;border:1px solid rgb(255 255 255 / .24);border-radius:12px;background:rgb(255 255 255 / .09);color:#fff;padding:10px;outline:none}.catalog-edit-popover input[type="color"]{height:42px;padding:4px}.catalog-edit-popover option{background:#16213a}.catalog-edit-popover .actions{display:flex;gap:8px;margin-top:15px}.catalog-edit-popover .actions button{padding:10px 14px;color:#fff;font-weight:700;cursor:pointer}.catalog-edit-popover textarea{width:100%;box-sizing:border-box;border:1px solid rgb(255 255 255 / .24);border-radius:12px;background:rgb(255 255 255 / .09);color:#fff;padding:10px;resize:vertical}@media(max-width:520px){.catalog-controls{left:10px;bottom:10px;gap:6px}.catalog-visual-button,.catalog-reset-button{padding:11px 13px!important;font-size:12px!important}.catalog-edit-popover{left:10px;bottom:68px;width:calc(100vw - 20px)}}`;
    document.head.append(tag);
  }
  function saveField(field, value) { state[field] = value; apply(); }
  function upload(field, input) { input.onchange = async () => { const image = input.files[0]; if (!image) return; const value = await new Promise(resolve => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.readAsDataURL(image); }); state[field] = value; await imagePut(field, value); apply(); }; }
  function openTextEditor(textId, button) {
    openEditor('button-text', 'Editar texto do botão', (popover) => { const input = document.createElement('textarea'); input.rows = 2; input.value = state.texts[textId] || button.textContent.trim(); input.setAttribute('aria-label', 'Texto do botão'); input.oninput = () => { setText(textId, input.value); setButtonText(button, input.value); }; popover.append(input); });
  }
  function openEditor(kind, label, extra) {
    document.querySelector('.catalog-edit-popover')?.remove();
    const popover = document.createElement('aside'); popover.className = 'catalog-edit-popover'; popover.innerHTML = `<h2>${label}</h2>`;
    const field = (title, name, type = 'text') => { const item = document.createElement('label'); item.textContent = title; const input = document.createElement('input'); input.type = type; input.value = state[name] || ''; input.oninput = () => saveField(name, input.value); item.append(input); popover.append(item); };
    const imageField = (title, name) => { const item = document.createElement('label'); item.textContent = title; const input = document.createElement('input'); input.type = 'file'; input.accept = 'image/*'; item.append(input); popover.append(item); upload(name, input); };
    if (kind === 'visual') { field('Cor principal', 'primaryColor', 'color'); field('Cor secundária', 'secondaryColor', 'color'); field('Cor de destaque', 'accentColor', 'color'); imageField('Enviar logo', 'logo'); imageField('Enviar imagem de capa', 'heroImage'); const font = document.createElement('label'); font.textContent = 'Fonte'; font.innerHTML += '<select><option value="system-ui">Sistema</option><option value="Arial,sans-serif">Arial</option><option value="Georgia,serif">Serifada</option></select>'; const select = font.querySelector('select'); select.value = state.font; select.onchange = () => saveField('font', select.value); popover.append(font); const shape = document.createElement('label'); shape.textContent = 'Formato dos botões'; shape.innerHTML += '<select><option value="rounded">Arredondado</option><option value="pill">Pílula</option><option value="square">Reto</option></select>'; const shapeSelect = shape.querySelector('select'); shapeSelect.value = state.buttonStyle; shapeSelect.onchange = () => saveField('buttonStyle', shapeSelect.value); popover.append(shape); }
    extra?.(popover);
    const actions = document.createElement('div'); actions.className = 'actions'; const close = document.createElement('button'); close.type = 'button'; close.className = 'catalog-liquid-button'; close.textContent = 'Fechar'; close.onclick = () => popover.remove(); actions.append(close); popover.append(actions); document.body.append(popover);
  }
  function mount() {
    ensureLiquidGlass(); style(); editableTextNodes(); buttonTextEditors(); applyLiquidButtons();
    const controls = document.createElement('div'); controls.className = 'catalog-controls';
    const visual = document.createElement('button'); visual.type = 'button'; visual.className = 'catalog-visual-button catalog-liquid-button'; visual.textContent = 'Personalizar visual'; visual.onclick = () => openEditor('visual', 'Personalizar visual');
    const reset = document.createElement('button'); reset.type = 'button'; reset.className = 'catalog-reset-button catalog-liquid-button'; reset.textContent = '↺ Resetar'; reset.onclick = async () => { if (!confirm('Resetar apenas este modelo?')) return; try { localStorage.removeItem(key); } catch {} await imageDelete('logo'); await imageDelete('heroImage'); state = { ...defaults }; apply(); location.reload(); };
    controls.append(visual, reset); document.body.append(controls);
    const quote = document.createElement('button'); quote.type = 'button'; quote.className = 'catalog-quote-link catalog-liquid-button'; quote.dataset.demoQuote = ''; quote.title = 'Solicitar orçamento'; quote.textContent = 'Orçamento deste template'; document.body.append(quote);
  }
  async function hydrate() { state.logo = await imageGet('logo'); state.heroImage = await imageGet('heroImage'); apply(); }
  document.addEventListener('DOMContentLoaded', () => { mount(); hydrate(); });
})();
