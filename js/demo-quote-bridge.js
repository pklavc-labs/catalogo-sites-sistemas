/* Local order-style quote builder for isolated template demos. */
(() => {
  const script = document.currentScript;
  const base = script?.src ? new URL('../../../../', script.src).href : '/';
  const cacheVersion = script?.src ? new URL(script.src).searchParams.get('v') : '';
  const dataUrl = new URL(`data/templates.json${cacheVersion ? `?v=${cacheVersion}` : ''}`, base);
  const pricingUrl = new URL(`data/pricing.json${cacheVersion ? `?v=${cacheVersion}` : ''}`, base);
  const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
  const makeCode = () => Array.from(crypto.getRandomValues(new Uint8Array(5)), value => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[value % 32]).join('');
  const escapeHtml = value => String(value || '').replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[char]));

  async function model() {
    const id = script?.dataset.catalogTemplate || document.querySelector('[data-catalog-template]')?.dataset.catalogTemplate;
    const catalog = await fetch(dataUrl).then(response => response.json());
    return catalog.find(item => item.id === id) || { id: 'catalogo-geral', name: 'Projeto sob medida', category: 'default', language: 'pt', version: '1.0.0' };
  }

  function ensureModal() {
    let modal = document.querySelector('.catalog-demo-quote');
    if (modal) return modal;
    const style = document.createElement('style');
    style.textContent = `.catalog-demo-quote{position:fixed;inset:0;z-index:2147483647;display:none;place-items:center;padding:18px;background:rgb(3 7 18 / .78);backdrop-filter:blur(12px);font:14px/1.4 system-ui,sans-serif;color:#eef2ff}.catalog-demo-quote.open{display:grid}.cdq-box{width:min(940px,100%);max-height:calc(100dvh - 36px);overflow:auto;border:1px solid rgb(255 255 255 / .15);border-radius:24px;background:linear-gradient(135deg,#111827,#0b1020 65%,#121a31);box-shadow:0 25px 80px #000b;padding:clamp(18px,3vw,30px)}.cdq-head{display:flex;justify-content:space-between;gap:18px;align-items:start}.cdq-kicker{margin:0 0 5px;color:#8bffd9;font-weight:800;font-size:11px;letter-spacing:.13em}.cdq-head h2{margin:0;font-size:clamp(23px,4vw,34px);letter-spacing:-.05em}.cdq-close{width:38px;height:38px;border:0;color:#fff;font-size:23px}.cdq-model{display:flex;justify-content:space-between;gap:16px;align-items:center;margin:24px 0 18px;padding:15px 17px;border:1px solid rgb(255 255 255 / .14);border-radius:16px;background:rgb(255 255 255 / .05)}.cdq-model small{display:block;color:#a9b4cf}.cdq-model strong{font-size:18px}.cdq-layout{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(260px,.65fr);gap:18px}.cdq-services{display:grid;gap:9px}.cdq-section-title{display:flex;justify-content:space-between;align-items:baseline;margin:0 0 4px;font-size:13px;color:#cbd5e1}.cdq-service{width:100%;display:grid;grid-template-columns:1fr auto;gap:12px;align-items:center;border:1px solid rgb(255 255 255 / .12);border-radius:14px;padding:13px 14px;background:rgb(255 255 255 / .035);color:#f8fafc;text-align:left;cursor:pointer;transition:.2s transform,.2s border-color,.2s background}.cdq-service:hover{transform:translateY(-1px);border-color:#62e7c0;background:rgb(98 231 192 / .09)}.cdq-service.active{border-color:#38d9a9;background:linear-gradient(120deg,rgb(28 165 124 / .25),rgb(255 255 255 / .08))}.cdq-service h3{margin:0 0 2px;font-size:14px}.cdq-service p{margin:0;color:#aab4c8;font-size:12px}.cdq-add{min-width:96px;padding:8px 10px;border:1px solid rgb(255 255 255 / .24);border-radius:999px;color:#d9fff4;font-size:12px;font-weight:800;text-align:center}.cdq-service.active .cdq-add{background:#5df2c2;color:#05291d;border-color:#5df2c2}.cdq-order{height:max-content;position:sticky;top:0;border:1px solid rgb(255 255 255 / .14);border-radius:17px;background:rgb(0 0 0 / .18);padding:16px}.cdq-order h3{margin:0 0 12px;font-size:14px}.cdq-line{display:flex;justify-content:space-between;gap:12px;padding:9px 0;border-bottom:1px solid rgb(255 255 255 / .09);font-size:12px}.cdq-line span:last-child{white-space:nowrap}.cdq-line.base{color:#d5ffe9}.cdq-recurring{display:none;margin-top:13px;padding:11px;border:1px solid rgb(93 242 194 / .3);border-radius:11px;background:rgb(36 199 144 / .1)}.cdq-recurring.show{display:block}.cdq-recurring small{color:#a7f3d0}.cdq-total{display:flex;justify-content:space-between;gap:12px;margin-top:14px;padding-top:14px;border-top:1px solid rgb(255 255 255 / .16);font-size:13px}.cdq-total strong{font-size:20px}.cdq-share{display:flex;flex-wrap:wrap;gap:8px;margin-top:18px}.cdq-share button,.cdq-share a{padding:10px 12px;border:0;border-radius:999px;color:#fff;font:700 12px system-ui;text-decoration:none;cursor:pointer}.cdq-summary{display:none;width:100%;min-height:95px;box-sizing:border-box;margin-top:15px;padding:10px;border:1px solid #334155;border-radius:11px;background:#070b15;color:#d7e1f8;font:11px ui-monospace,monospace}.cdq-summary.show{display:block}@media(max-width:700px){.catalog-demo-quote{padding:8px}.cdq-box{max-height:calc(100dvh - 16px);border-radius:18px}.cdq-layout{grid-template-columns:1fr}.cdq-order{position:static}.cdq-model{align-items:start;flex-direction:column}}`;
    style.textContent += `.cdq-box{scrollbar-width:thin;scrollbar-color:rgb(125 211 252 / .65) transparent}.cdq-box::-webkit-scrollbar{width:6px}.cdq-box::-webkit-scrollbar-thumb{background:rgb(125 211 252 / .58);border-radius:999px}.cdq-head{position:sticky;top:calc(-1 * clamp(18px,3vw,30px));z-index:3;margin:calc(-1 * clamp(18px,3vw,30px)) calc(-1 * clamp(18px,3vw,30px)) 0;padding:clamp(18px,3vw,30px);padding-bottom:14px;background:linear-gradient(135deg,#111827,#0b1020 65%,#121a31);border-bottom:1px solid rgb(255 255 255 / .1)}.cdq-close{position:sticky;top:0;flex:none}.cdq-summary{scrollbar-width:thin;scrollbar-color:rgb(125 211 252 / .65) transparent}`;
    document.head.append(style);
    document.body.insertAdjacentHTML('beforeend', `<section class="catalog-demo-quote" role="dialog" aria-modal="true" aria-label="Solicitar orçamento"><form class="cdq-box"><div class="cdq-head"><div><p class="cdq-kicker">ORÇAMENTO ESTIMADO</p><h2>Monte sua solução</h2></div><button class="cdq-close catalog-liquid-button" type="button" aria-label="Fechar">×</button></div><div class="cdq-model"><div><small>Modelo selecionado</small><strong data-model>Carregando…</strong></div><strong data-base>—</strong></div><div class="cdq-layout"><div><div class="cdq-section-title"><span>Adicione os serviços necessários</span><span>clique para incluir</span></div><div class="cdq-services"></div></div><aside class="cdq-order"><h3>Seu pedido</h3><div class="cdq-lines"></div><div class="cdq-recurring"><small>Mensalidade estimada</small><strong data-monthly>—</strong></div><div class="cdq-total"><span>Investimento inicial</span><strong data-total>—</strong></div><textarea class="cdq-summary" readonly aria-label="Resumo do orçamento"></textarea><div class="cdq-share"><a class="catalog-liquid-button" data-wa target="_blank" rel="noreferrer">WhatsApp</a><a class="catalog-liquid-button" data-mail>Enviar por e-mail</a><button class="catalog-liquid-button" type="button" data-copy>Copiar resumo</button><button class="catalog-liquid-button" type="button" data-code>Copiar código</button></div></aside></div></form></section>`);
    modal = document.querySelector('.catalog-demo-quote');
    modal.addEventListener('click', event => { if (event.target === modal) modal.classList.remove('open'); });
    modal.querySelector('.cdq-close').onclick = () => modal.classList.remove('open');
    return modal;
  }

  async function open() {
    const modal = ensureModal();
    let template, pricing;
    try { [template, pricing] = await Promise.all([model(), fetch(pricingUrl).then(response => response.json())]); }
    catch { template = { id: 'catalogo-geral', name: 'Projeto sob medida', category: 'default', language: 'pt', version: '1.0.0' }; pricing = { base: { default: 0 }, extras: {} }; }
    const basePrice = pricing.base[template.category] ?? pricing.base.default ?? 0;
    const selected = new Set();
    const quote = makeCode();
    const services = modal.querySelector('.cdq-services');
    const lines = modal.querySelector('.cdq-lines');
    modal.querySelector('[data-model]').textContent = template.name;
    modal.querySelector('[data-base]').textContent = money(basePrice);

    const update = () => {
      const entries = [...selected].map(key => [key, pricing.extras[key]]).filter(([, item]) => item);
      const once = entries.filter(([, item]) => item.billing !== 'monthly');
      const recurring = entries.filter(([, item]) => item.billing === 'monthly');
      const total = basePrice + once.reduce((sum, [, item]) => sum + item.price, 0);
      const monthly = recurring.reduce((sum, [, item]) => sum + item.price, 0);
      services.querySelectorAll('[data-extra]').forEach(button => {
        const active = selected.has(button.dataset.extra);
        button.classList.toggle('active', active);
        button.querySelector('.cdq-add').textContent = active ? '✓ Incluído' : '+ Adicionar';
        button.setAttribute('aria-pressed', String(active));
      });
      lines.innerHTML = `<div class="cdq-line base"><span>${escapeHtml(template.name)}<small> · site base</small></span><span>${money(basePrice)}</span></div>${once.map(([, item]) => `<div class="cdq-line"><span>${escapeHtml(item.label)}</span><span>${money(item.price)}</span></div>`).join('') || '<div class="cdq-line"><span>Sem adicionais no investimento inicial</span><span>—</span></div>'}${recurring.map(([, item]) => `<div class="cdq-line"><span>${escapeHtml(item.label)} <small>(mensal)</small></span><span>${money(item.price)}/mês</span></div>`).join('')}`;
      modal.querySelector('[data-total]').textContent = money(total);
      const recurringBox = modal.querySelector('.cdq-recurring');
      recurringBox.classList.toggle('show', monthly > 0);
      modal.querySelector('[data-monthly]').textContent = `${money(monthly)}/mês`;
      let configuration = {};
      try { configuration = JSON.parse(localStorage.getItem(`catalogo:pt:${template.category}:${template.slug}`) || '{}'); } catch {}
      const summary = { quote, template: template.id, model: template.name, category: template.category, language: template.language || 'pt', configuration, extras: entries.map(([key]) => key), initialPrice: total, monthlyPrice: monthly || undefined, date: new Date().toISOString(), version: template.version };
      const text = JSON.stringify(summary, null, 2);
      const textArea = modal.querySelector('.cdq-summary'); textArea.value = text; textArea.classList.add('show');
      modal.querySelector('[data-wa]').href = `https://wa.me/?text=${encodeURIComponent(`Olá! Gostaria de solicitar este orçamento:\n${text}`)}`;
      modal.querySelector('[data-mail]').href = `mailto:?subject=${encodeURIComponent(`Orçamento ${quote}`)}&body=${encodeURIComponent(text)}`;
      modal.querySelector('[data-copy]').onclick = () => navigator.clipboard?.writeText(text);
      modal.querySelector('[data-code]').onclick = () => navigator.clipboard?.writeText(quote);
    };
    services.innerHTML = Object.entries(pricing.extras).map(([key, item]) => `<button class="cdq-service" type="button" data-extra="${escapeHtml(key)}" aria-pressed="false"><span><h3>${escapeHtml(item.label)}</h3><p>${escapeHtml(item.description || '')}</p></span><span><strong>${money(item.price)}${item.billing === 'monthly' ? '/mês' : ''}</strong><span class="cdq-add">+ Adicionar</span></span></button>`).join('');
    services.onclick = event => { const button = event.target.closest('[data-extra]'); if (!button) return; const key = button.dataset.extra; selected.has(key) ? selected.delete(key) : selected.add(key); update(); };
    update();
    modal.classList.add('open');
    modal.querySelector('.cdq-close').focus();
  }

  document.addEventListener('click', event => {
    if (event.target.closest('[data-demo-quote]')) { event.preventDefault(); open(); }
  });
})();
