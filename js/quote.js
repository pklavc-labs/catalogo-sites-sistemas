(() => {
  const source = document.currentScript;
  const appBase = source?.src ? new URL('../', source.src) : new URL('./', location.href);
  const appUrl = path => new URL(String(path).replace(/^\/+/, ''), appBase).href;
  const money = value => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(value);
  const quoteCode = () => Array.from(crypto.getRandomValues(new Uint8Array(5)), value => 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[value % 32]).join('');
  let pricing;

  const currentTemplate = async () => {
    try {
      const templates = await fetch(appUrl('data/templates.json')).then(response => response.json());
      return templates.find(item => item.id === document.body.dataset.templateId);
    } catch { return null; }
  };

  function ensureModal() {
    let modal = document.querySelector('.quote-modal');
    if (modal) return modal;
    document.body.insertAdjacentHTML('beforeend', `<div class="quote-modal" role="dialog" aria-modal="true" aria-labelledby="quote-title"><form class="quote-dialog"><div class="quote-header"><div><p class="eyebrow">ORÇAMENTO ESTIMADO</p><h2 id="quote-title">Monte sua solução</h2></div><button class="quote-close" type="button" aria-label="Fechar">×</button></div><p>Selecione os adicionais. O resumo é gerado localmente e pode ser compartilhado pelo canal que preferir.</p><div class="quote-options"></div><div class="quote-total"><span>Estimativa inicial</span><strong data-total>—</strong></div><textarea class="quote-summary" aria-label="Resumo do orçamento" readonly></textarea><div class="quote-share"><a data-whatsapp target="_blank" rel="noreferrer">WhatsApp</a><a data-email>Enviar por e-mail</a><button type="button" data-copy-summary>Copiar resumo</button><button type="button" data-copy-code>Copiar código</button></div></form></div>`);
    modal = document.querySelector('.quote-modal');
    modal.addEventListener('click', event => { if (event.target === modal) modal.classList.remove('open'); });
    modal.querySelector('.quote-close').onclick = () => modal.classList.remove('open');
    return modal;
  }

  async function open() {
    const modal = ensureModal();
    const model = await currentTemplate() || { id: 'catalogo-geral', name: 'Projeto sob medida', category: 'default', language: 'pt', version: '1.0.0' };
    if (!pricing) {
      try { pricing = await fetch(appUrl('data/pricing.json')).then(response => response.json()); }
      catch { pricing = { base: { default: 0 }, extras: {} }; }
    }
    const base = pricing.base[model.category] ?? pricing.base.default ?? 0;
    const options = modal.querySelector('.quote-options');
    options.innerHTML = Object.entries(pricing.extras).map(([key, item]) => `<label><input type="checkbox" value="${key}"> ${item.label} <small>(${money(item.price)})</small></label>`).join('');
    const code = quoteCode();
    const update = () => {
      const extras = [...options.querySelectorAll(':checked')].map(input => input.value);
      const price = base + extras.reduce((sum, key) => sum + (pricing.extras[key]?.price || 0), 0);
      let configuration = {};
      try { configuration = JSON.parse(localStorage.getItem(`catalogo:${model.language}:${model.category}:${model.slug}`) || '{}'); } catch {}
      const summary = { quote: code, template: model.id, model: model.name, category: model.category, language: model.language || 'pt', configuration, extras, price, date: new Date().toISOString(), version: model.version };
      const text = JSON.stringify(summary, null, 2);
      modal.querySelector('[data-total]').textContent = money(price);
      modal.querySelector('.quote-summary').value = text;
      modal.querySelector('.quote-summary').classList.add('visible');
      modal.querySelector('[data-whatsapp]').href = `https://wa.me/?text=${encodeURIComponent(`Olá! Gostaria de solicitar este orçamento:\n${text}`)}`;
      modal.querySelector('[data-email]').href = `mailto:?subject=${encodeURIComponent(`Orçamento ${code}`)}&body=${encodeURIComponent(text)}`;
      modal.querySelector('[data-copy-summary]').onclick = () => navigator.clipboard?.writeText(text);
      modal.querySelector('[data-copy-code]').onclick = () => navigator.clipboard?.writeText(code);
    };
    options.onchange = update;
    update();
    modal.classList.add('open');
    modal.querySelector('.quote-close').focus();
  }

  document.addEventListener('click', event => {
    if (event.target.closest('[data-open-quote]')) { event.preventDefault(); open(); }
  });
})();
