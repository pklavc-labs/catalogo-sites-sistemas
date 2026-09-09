/* Common PT-BR layer for the downloaded Start Bootstrap demonstrations. */
(() => {
  const phrases = new Map([
    ['Home', 'Início'], ['About', 'Sobre'], ['Contact', 'Contato'], ['Services', 'Serviços'], ['Portfolio', 'Portfólio'],
    ['Blog', 'Blog'], ['Read More', 'Leia mais'], ['Learn More', 'Saiba mais'], ['Get Started', 'Começar'],
    ['Sign In', 'Entrar'], ['Sign Out', 'Sair'], ['Login', 'Entrar'], ['Register', 'Cadastrar'], ['Search', 'Buscar'],
    ['Subscribe', 'Inscrever-se'], ['Send', 'Enviar'], ['Submit', 'Enviar'], ['Previous', 'Anterior'], ['Next', 'Próximo'],
    ['Back', 'Voltar'], ['Close', 'Fechar'], ['Save Changes', 'Salvar alterações'], ['Cancel', 'Cancelar'],
    ['Add to Cart', 'Adicionar ao carrinho'], ['View Options', 'Ver opções'], ['View Details', 'Ver detalhes'],
    ['Welcome To Our Studio!', 'Bem-vindo ao nosso estúdio!'], ["It's Nice To Meet You", 'É um prazer conhecer você'],
    ['Tell Me More', 'Saiba mais'], ['Your Favorite Place', 'Seu lugar favorito'], ['Start Bootstrap', 'Modelo Bootstrap'],
    ['A Bootstrap 5 template', 'Um modelo Bootstrap 5'], ['Copyright', 'Direitos autorais'], ['Address', 'Endereço'],
    ['Phone', 'Telefone'], ['Email', 'E-mail'], ['Name', 'Nome'], ['Message', 'Mensagem'], ['Subject', 'Assunto'],
    ['Pricing', 'Preços'], ['Features', 'Recursos'], ['Products', 'Produtos'], ['Categories', 'Categorias'],
    ['Shopping Cart', 'Carrinho'], ['Dashboard', 'Painel'], ['Settings', 'Configurações'], ['Profile', 'Perfil'],
    ['Notifications', 'Notificações'], ['Logout', 'Sair'], ['404 Error', 'Erro 404'], ['Page Not Found', 'Página não encontrada'],
    ['Coming Soon', 'Em breve'], ['Download Now', 'Baixar agora'], ['Free Download', 'Download gratuito'],
  ]);
  const replace = text => {
    let output = text;
    for (const [source, target] of phrases) {
      output = /[^A-Za-z ]/.test(source)
        ? output.split(source).join(target)
        : output.replace(new RegExp(`\\b${source.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}\\b`, 'g'), target);
    }
    return output;
  };
  const translate = root => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, { acceptNode: node => {
      if (!node.nodeValue.trim() || node.parentElement?.closest('script,style,code,pre')) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }});
    const nodes = []; while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(node => { const translated = replace(node.nodeValue); if (translated !== node.nodeValue) node.nodeValue = translated; });
    root.querySelectorAll?.('[placeholder],[aria-label],[title]').forEach(element => ['placeholder','aria-label','title'].forEach(attribute => {
      if (element.hasAttribute(attribute)) element.setAttribute(attribute, replace(element.getAttribute(attribute)));
    }));
  };
  document.documentElement.lang = 'pt-BR';
  document.addEventListener('DOMContentLoaded', () => {
    translate(document.body);
    new MutationObserver(records => records.forEach(record => record.addedNodes.forEach(node => {
      if (node.nodeType === Node.ELEMENT_NODE) translate(node);
    }))).observe(document.body, { childList: true, subtree: true });
  });
})();
