

## Instalar o Google Tag Manager (GTM) no site

### O que é isso?

O PDF contém o código de instalação do **Google Tag Manager (GTM)** com o ID **GTM-TJ7CG5PJ**. O GTM é uma ferramenta do Google que permite gerenciar tags de marketing (Google Analytics, Meta Pixel, conversões do Google Ads, etc.) sem precisar mexer no código do site toda vez.

Com ele instalado, você poderá adicionar e gerenciar rastreamentos diretamente pelo painel do Google Tag Manager, sem precisar me pedir alterações no código.

### O que vou fazer

Editar apenas o arquivo `index.html` para adicionar os dois trechos de código:

1. **No `<head>`** — script principal do GTM (carrega o container de tags)
2. **No `<body>`** — fallback `<noscript>` com iframe (para navegadores sem JavaScript)

### Alteração no `index.html`

- Inserir o script GTM logo após a abertura do `<head>`, antes das outras metas
- Inserir o `<noscript>` logo após a abertura do `<body>`, antes do `<div id="root">`

Nenhum outro arquivo será alterado. O site continuará funcionando normalmente.

