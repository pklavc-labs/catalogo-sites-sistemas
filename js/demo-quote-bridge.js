/* Quote modal for isolated template demos. Loaded after demo-customizer.js. */
(() => {
  const script = document.currentScript;
  const base = script?.src ? new URL('../../../../', script.src).href : '/';
  const dataUrl = new URL('data/templates.json', base);
  const pricingUrl = new URL('data/pricing.json', base);
  const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
  const makeCode = () => Array.from(crypto.getRandomValues(new Uint8Array(5)), value => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[value % 32]).join('');

  async function model() {
    const id = document.currentScript?.dataset.catalogTemplate || document.querySelector('[data-catalog-template]')?.dataset.catalogTemplate;
    const catalog = await fetch(dataUrl).then(response => response.json());
    return catalog.find(item => item.id === id) || { id: 'catalogo-geral', name: 'Projeto sob medida', category: 'default', language: 'pt', version: '1.0.0' };
  }

  function ensureModal() {
    let modal = document.querySelector('.catalog-demo-quote');
    if (modal) return modal;
    const style = document.createElement('style');
    style.textContent = `.catalog-demo-quote{position:fixed;inset:0;z-index:2147483647;background:#111827b3;display:none;place-items:center;padding:16px;font:14px system-ui;color:#182033}.catalog-demo-quote.open{display:grid}.cdq-box{width:min(650px,100%);max-height:calc(100vh - 32px);overflow:auto;background:#fff;border-radius:16px;padding:22px;box-shadow:0 18px 60px #0008}.cdq-head{display:flex;justify-content:space-between;gap:12px}.cdq-head h2{font-size:22px;margin:0}.cdq-close{border:0;background:#eef0f5;border-radius:50%;width:32px;height:32px;font-size:20px;cursor:pointer}.cdq-options{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin:16px 0}.cdq-options label{border:1px solid #dce1e8;border-radius:8px;padding:9px;display:flex;gap:7px;align-items:center}.cdq-total{padding:14px;background:#f4f6f8;border-radius:9px;display:flex;justify-content:space-between}.cdq-share{display:flex;gap:8px;flex-wrap:wrap;margin-top:15px}.cdq-share button,.cdq-share a{padding:10px;border:0;border-radius:7px;background:#e0e7ff;color:#312e81;font-weight:700;cursor:pointer;text-decoration:none}.cdq-summary{display:none;width:100%;min-height:100px;margin-top:14px;font:11px ui-monospace,monospace}.cdq-summary.show{display:block}@media(max-width:520px){.cdq-options{grid-template-columns:1fr}}`;
    document.head.append(style);
    document.body.insertAdjacentHTML('beforeend', `<section class="catalog-demo-quote" role="dialog" aria-modal="true" aria-label="Solicitar orçamento"><form class="cdq-box"><div class="cdq-head"><div><p style="margin:0 0 5px;color:#4f46e5;font-weight:800;font-size:12px;letter-spacing:.08em">ORÇAMENTO ESTIMADO</p><h2>Monte sua solução</h2></div><button class="cdq-close" type="button" aria-label="Fechar">×</button></div><p>Escolha os adicionais e compartilhe o resumo pelo canal desejado.</p><div class="cdq-options"></div><div class="cdq-total"><span>Estimativa inicial</span><strong data-total>—</strong></div><textarea class="cdq-summary" readonly aria-label="Resumo do orçamento"></textarea><div class="cdq-share"><a data-wa target="_blank" rel="noreferrer">WhatsApp</a><a data-mail>Enviar por e-mail</a><button type="button" data-copy>Copiar resumo</button><button type="button" data-code>Copiar código</button></div></form></section>`);
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
    const options = modal.querySelector('.cdq-options');
    options.innerHTML = Object.entries(pricing.extras).map(([key, item]) => `<label><input type="checkbox" value="${key}"> ${item.label} <small>(${money(item.price)})</small></label>`).join('');
    const quote = makeCode();
    const update = () => {
      const extras = [...options.querySelectorAll(':checked')].map(input => input.value);
      const price = basePrice + extras.reduce((sum, key) => sum + (pricing.extras[key]?.price || 0), 0);
      let configuration = {};
      try { configuration = JSON.parse(localStorage.getItem(`catalogo:pt:${template.category}:${template.slug}`) || '{}'); } catch {}
      const summary = { quote, template: template.id, model: template.name, category: template.category, language: template.language || 'pt', configuration, extras, price, date: new Date().toISOString(), version: template.version };
      const text = JSON.stringify(summary, null, 2);
      modal.querySelector('[data-total]').textContent = money(price);
      modal.querySelector('.cdq-summary').value = text;
      modal.querySelector('.cdq-summary').classList.add('show');
      modal.querySelector('[data-wa]').href = `https://wa.me/?text=${encodeURIComponent(`Olá! Gostaria de solicitar este orçamento:\n${text}`)}`;
      modal.querySelector('[data-mail]').href = `mailto:?subject=${encodeURIComponent(`Orçamento ${quote}`)}&body=${encodeURIComponent(text)}`;
      modal.querySelector('[data-copy]').onclick = () => navigator.clipboard?.writeText(text);
      modal.querySelector('[data-code]').onclick = () => navigator.clipboard?.writeText(quote);
    };
    options.onchange = update;
    update();
    modal.classList.add('open');
    modal.querySelector('.cdq-close').focus();
  }

  /* The panel belongs to the customizer script and is created before this file runs. */
  const quoteButton = document.querySelector('.cc-quote');
  if (quoteButton) quoteButton.onclick = open;
})();
