

## Plano: Consolidar itens duplicados no painel admin

### Problema
A sidebar tem 21 itens, com sobreposições claras que confundem a navegação:
- "Conversas Vera" e "Conversas WA" parecem duplicados pelo nome
- "Config IA Vera" e "Conexão" são sub-funcionalidades de páginas maiores
- "Relatórios WA" e "Analytics" sobrepõem métricas

### Mudanças propostas

**1. Unificar "Conversas Vera" + "Conversas WA" em uma única entrada "Conversas"**
- Criar uma página única `/admin/conversas` com **duas abas**: "WhatsApp" e "Vera (Site)"
- Remover `/admin/conversas-vera` como rota separada
- Mover o conteúdo de `AdminConversasVera.tsx` para dentro de uma aba

**2. Absorver "Conexão" dentro de "WhatsApp"**
- Adicionar aba "Conexão / Uptime" na página `/admin/whatsapp`
- Remover `/admin/conexao` da sidebar

**3. Absorver "Config IA Vera" dentro de "Configurações"**
- Adicionar aba "IA Vera" na página `/admin/configuracoes`
- Remover `/admin/ia` da sidebar

**4. Manter "Relatórios WA" e "Analytics" separados**
- Analytics = métricas do site (sessões, leads do site, geo)
- Relatórios WA = métricas exclusivas do WhatsApp (funil, mensagens)
- Renomear "Analytics" para "Analytics Site" para clareza

### Resultado: sidebar reduzida de 21 para 17 itens

Itens removidos da sidebar:
- ~~Conversas Vera~~ (vira aba em Conversas)
- ~~Conexão~~ (vira aba em WhatsApp)
- ~~Config IA Vera~~ (vira aba em Configurações)

### Arquivos afetados
- `AdminLayout.tsx` — remover 3 itens do `navItems`
- `AdminConversas.tsx` — adicionar Tabs com conteúdo de Conversas Vera
- `AdminWhatsApp.tsx` — adicionar aba Conexão com conteúdo de AdminConexao
- `AdminSettings.tsx` — adicionar aba IA Vera com conteúdo de AdminVeraConfig
- `App.tsx` — manter rotas antigas como redirects ou removê-las
- Renomear "Analytics" para "Analytics Site" no `navItems`

